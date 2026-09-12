import React, { useState, useEffect, useMemo } from 'react';
import {
  Employee,
  DailyLogItem,
  BRANCHES,
  SYSTEM_ROLES,
  ExecutiveDirective,
  EmployeeDailyPlan,
} from '../types';
import { getWorkflowForEmployee, ALL_WORKFLOW_TASKS } from '../data/workflowData';
import {
  fetchDirectives,
  acknowledgeDirective,
  fetchDailyPlan,
  saveDailyPlan,
} from '../lib/supabase';

interface EmployeeProfileWorkspaceProps {
  currentUser: Employee;
  selectedDate: string;
  logs: DailyLogItem[];
  onToggleTaskStatus: (taskName: string, currentStatus: 'done' | 'pending', reason?: string) => void;
  onUpdatePendingReason: (taskName: string, reason: string) => void;
  onOpenEmployeeSwitcher?: () => void;
  onOpenAiInsightModal?: () => void;
}

export const EmployeeProfileWorkspace: React.FC<EmployeeProfileWorkspaceProps> = ({
  currentUser,
  selectedDate,
  logs,
  onToggleTaskStatus,
  onUpdatePendingReason,
  onOpenEmployeeSwitcher,
  onOpenAiInsightModal,
}) => {
  // Current active sub-tab inside profile
  const [profileTab, setProfileTab] = useState<'checklist' | 'pending_only' | 'planner'>('checklist');

  // Daily planner state
  const [dailyPlan, setDailyPlan] = useState<EmployeeDailyPlan>(() =>
    fetchDailyPlan(currentUser.employee_id, selectedDate)
  );
  const [newPlanTime, setNewPlanTime] = useState('');
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [planSavedNotice, setPlanSavedNotice] = useState(false);

  // Executive directives from Raji Sir
  const [directives, setDirectives] = useState<ExecutiveDirective[]>(() => fetchDirectives(selectedDate));
  const [ackNotice, setAckNotice] = useState<string | null>(null);

  // Refresh directives & plan when date or user changes
  useEffect(() => {
    setDirectives(fetchDirectives(selectedDate));
    setDailyPlan(fetchDailyPlan(currentUser.employee_id, selectedDate));
  }, [currentUser.employee_id, selectedDate]);

  // Specific workflow tasks for this individual employee
  const employeeWorkflow = useMemo(() => {
    return getWorkflowForEmployee(currentUser.employee_id, currentUser.name);
  }, [currentUser]);

  const tasksList = useMemo(() => {
    return employeeWorkflow?.tasks && employeeWorkflow.tasks.length > 0
      ? employeeWorkflow.tasks
      : ALL_WORKFLOW_TASKS;
  }, [employeeWorkflow]);

  // Current user's logs mapping
  const userLogsMap = useMemo(() => {
    const map = new Map<string, DailyLogItem>();
    logs
      .filter((l) => l.employee_id === currentUser.employee_id && l.date === selectedDate)
      .forEach((l) => map.set(l.task_name, l));
    return map;
  }, [logs, currentUser.employee_id, selectedDate]);

  // Real-time calculation of Done vs Pending tasks
  const stats = useMemo(() => {
    const total = tasksList.length;
    let done = 0;
    tasksList.forEach((t) => {
      const log = userLogsMap.get(t.name);
      if (log?.status === 'done') done += 1;
    });
    const pending = total - done;
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
    const remainingPercentage = 100 - percentage;
    return { total, done, pending, percentage, remainingPercentage };
  }, [tasksList, userLogsMap]);

  // Filter tasks based on selected tab
  const displayedTasks = useMemo(() => {
    if (profileTab === 'pending_only') {
      return tasksList.filter((t) => {
        const log = userLogsMap.get(t.name);
        return log?.status !== 'done';
      });
    }
    return tasksList;
  }, [tasksList, userLogsMap, profileTab]);

  // Directives targeting this employee (either 'all', their branch, or their specific employee_id)
  const activeDirectives = useMemo(() => {
    return directives.filter((d) => {
      if (d.target_type === 'all') return true;
      if (d.target_type === 'branch' && d.target_id === currentUser.branch) return true;
      if (d.target_type === 'employee' && d.target_id === currentUser.employee_id) return true;
      return false;
    });
  }, [directives, currentUser]);

  const handleAcknowledgeDirective = (directiveId: string) => {
    acknowledgeDirective(directiveId, currentUser.employee_id);
    setDirectives(fetchDirectives(selectedDate));
    setAckNotice('Directive acknowledged. Management has been notified.');
    setTimeout(() => setAckNotice(null), 4000);
  };

  // Daily Planner handlers
  const handleTogglePlanItem = (itemId: string) => {
    const updatedItems = dailyPlan.items.map((item) =>
      item.id === itemId ? { ...item, isDone: !item.isDone } : item
    );
    const updatedPlan = { ...dailyPlan, items: updatedItems };
    setDailyPlan(updatedPlan);
    saveDailyPlan(updatedPlan);
  };

  const handleAddPlanItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTitle.trim()) return;

    const newItem = {
      id: `plan-${Date.now()}`,
      employee_id: currentUser.employee_id,
      date: selectedDate,
      timeSlot: newPlanTime.trim() || 'General Slot',
      focusTitle: newPlanTitle.trim(),
      isDone: false,
    };

    const updatedPlan = {
      ...dailyPlan,
      items: [...dailyPlan.items, newItem],
    };
    setDailyPlan(updatedPlan);
    saveDailyPlan(updatedPlan);
    setNewPlanTime('');
    setNewPlanTitle('');
  };

  const handleDeletePlanItem = (itemId: string) => {
    const updatedPlan = {
      ...dailyPlan,
      items: dailyPlan.items.filter((i) => i.id !== itemId),
    };
    setDailyPlan(updatedPlan);
    saveDailyPlan(updatedPlan);
  };

  const handleSaveNotes = () => {
    saveDailyPlan(dailyPlan);
    setPlanSavedNotice(true);
    setTimeout(() => setPlanSavedNotice(false), 3000);
  };

  const branchDef = BRANCHES.find((b) => b.id === currentUser.branch);
  const roleDef = SYSTEM_ROLES.find((r) => r.id === currentUser.role);

  return (
    <div id="employee-profile-workspace" className="space-y-6">
      {/* 1. Executive Directive Alert Banner */}
      {activeDirectives.length > 0 && (
        <div className="space-y-3">
          {activeDirectives.map((directive) => {
            const hasAcked = directive.acknowledged_by?.includes(currentUser.employee_id);
            const isUrgent = directive.priority === 'urgent';

            return (
              <div
                key={directive.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isUrgent
                    ? 'bg-rose-950/90 border-rose-500/50 text-white'
                    : 'bg-[#14161a] border-amber-500/40 text-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Directive from {directive.sender_name}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        isUrgent ? 'bg-rose-600 text-white' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {directive.priority === 'urgent' ? 'Urgent Order' : 'Central Directive'}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {directive.created_at}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-zinc-100 leading-snug">
                    "{directive.message}"
                  </p>
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  {hasAcked ? (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                      [Acknowledged]
                    </span>
                  ) : (
                    <button
                      id={`btn-ack-directive-${directive.id}`}
                      onClick={() => handleAcknowledgeDirective(directive.id)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all shadow-md cursor-pointer"
                    >
                      Acknowledge Directive
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {ackNotice && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
          {ackNotice}
        </div>
      )}

      {/* 2. Employee Profile Card & Identity */}
      <div className="rounded-2xl bg-[#14161a] border border-white/10 p-5 sm:p-6 shadow-xs text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* User Avatar with Initials */}
            <div className="relative">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md ${
                  currentUser.avatar_color || 'bg-slate-900'
                }`}
              >
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#14161a] ${
                  currentUser.is_active ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
                title={currentUser.is_active ? 'Active Profile' : 'Inactive'}
              />
            </div>

            {/* Name, Role, & Branch Badges */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10">
                  {currentUser.employee_id}
                </span>
                {currentUser.approval_status === 'approved' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Authorized Personnel
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-200">
                  {roleDef?.titleEn || currentUser.role}
                </span>
                <span className="text-slate-600">•</span>
                <span>
                  Branch: {branchDef?.nameEn || currentUser.branch}
                </span>
                {currentUser.phone && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="font-mono">
                      Phone: {currentUser.phone}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Controls & Switcher */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {onOpenAiInsightModal && (
              <button
                type="button"
                id="btn-open-ai-insight"
                onClick={onOpenAiInsightModal}
                className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                title="AI Strategic Insight Analysis"
              >
                AI Insights
              </button>
            )}

            {onOpenEmployeeSwitcher && (
              <button
                type="button"
                id="btn-switch-employee-profile"
                onClick={onOpenEmployeeSwitcher}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
              >
                Switch User
              </button>
            )}
          </div>
        </div>

        {/* 3. PROMINENT USER SUMMARY: X% Completed, Y% Remaining */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 text-white shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  Daily Progress Summary ({selectedDate})
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
                  I have completed <span className="text-emerald-400 underline decoration-emerald-500/50 underline-offset-4">{stats.percentage}%</span> of my tasks, and <span className="text-amber-400 underline decoration-amber-500/50 underline-offset-4">{stats.remainingPercentage}%</span> work remains.
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Completed vs Remaining</span>
                  <span className="text-sm font-bold text-white">
                    {stats.done} / {stats.total} Tasks
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-black text-base text-emerald-400 border border-white/10">
                  {stats.percentage}%
                </div>
              </div>
            </div>

            {/* Split Progress Visualizer Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden flex p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${stats.percentage}%` }}
                  title={`Completed: ${stats.percentage}%`}
                />
                <div
                  className="h-full rounded-full bg-amber-500/40 transition-all duration-500 ml-1"
                  style={{ width: `${stats.remainingPercentage}%` }}
                  title={`Remaining: ${stats.remainingPercentage}%`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold px-0.5">
                <span className="text-emerald-400">
                  Completed: {stats.percentage}% ({stats.done} Tasks)
                </span>
                <span className="text-amber-400">
                  Remaining: {stats.remainingPercentage}% ({stats.pending} Tasks)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sub-Navigation Tabs inside Profile */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          id="tab-profile-checklist"
          onClick={() => setProfileTab('checklist')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            profileTab === 'checklist'
              ? 'bg-white text-slate-950 shadow-xs'
              : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
          }`}
        >
          All Tasks Checklist ({stats.total})
        </button>

        <button
          type="button"
          id="tab-profile-pending-only"
          onClick={() => setProfileTab('pending_only')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            profileTab === 'pending_only'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white/5 text-amber-400 hover:bg-white/10 border border-amber-500/30'
          }`}
        >
          Pending Tasks Only ({stats.pending})
        </button>

        <button
          type="button"
          id="tab-profile-planner"
          onClick={() => setProfileTab('planner')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            profileTab === 'planner'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white/5 text-indigo-400 hover:bg-white/10 border border-indigo-500/30'
          }`}
        >
          Daily Planner
        </button>
      </div>

      {/* 5. TAB A: Checklist & Pending Only View */}
      {(profileTab === 'checklist' || profileTab === 'pending_only') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              {profileTab === 'pending_only' ? (
                `Pending Tasks (${displayedTasks.length} Remaining)`
              ) : (
                `Daily Checklist for ${currentUser.name}`
              )}
            </h2>
            <span className="text-xs text-slate-400">
              Click checkbox to mark completed
            </span>
          </div>

          {displayedTasks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-2 text-white">
              <h4 className="text-base font-bold text-emerald-300">
                All tasks are complete!
              </h4>
              <p className="text-xs text-slate-300">
                You have finished all scheduled items for today. Excellent work!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayedTasks.map((task, idx) => {
                const log = userLogsMap.get(task.name);
                const isDone = log?.status === 'done';
                const reason = log?.reason_for_pending || '';

                return (
                  <div
                    key={task.id || idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-[#14161a] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Checkbox & Task Title */}
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          type="button"
                          id={`task-check-${task.id || idx}`}
                          onClick={() =>
                            onToggleTaskStatus(
                              task.name,
                              isDone ? 'done' : 'pending',
                              reason
                            )
                          }
                          className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-all cursor-pointer shrink-0 ${
                            isDone
                              ? 'bg-emerald-500 text-slate-950'
                              : 'border border-white/30 bg-white/5 hover:border-white/60 text-transparent'
                          }`}
                          title={isDone ? 'Click to mark as pending' : 'Click to mark as done'}
                        >
                          X
                        </button>

                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-sm font-bold leading-snug ${
                                isDone
                                  ? 'text-slate-500 line-through'
                                  : 'text-white'
                              }`}
                            >
                              {task.name}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10">
                              {task.category || 'General'}
                            </span>
                          </div>

                          {/* Completion Timestamp */}
                          {isDone && log?.completed_at && (
                            <div className="text-[11px] text-emerald-400 font-mono">
                              Completed at: {log.completed_at}
                            </div>
                          )}

                          {/* Reason for pending input if pending */}
                          {!isDone && (
                            <div className="pt-2">
                              <input
                                type="text"
                                value={reason}
                                onChange={(e) =>
                                  onUpdatePendingReason(task.name, e.target.value)
                                }
                                placeholder="State reason if task is delayed or pending..."
                                className="w-full text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-black/40 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Tag */}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {isDone ? 'Done' : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. TAB B: Daily Planner */}
      {profileTab === 'planner' && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#14161a] border border-white/10 shadow-xs space-y-5 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Daily Time-Blocked Planner
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Schedule time-blocked focus blocks and check off targets throughout the day.
                </p>
              </div>

              {planSavedNotice && (
                <span className="text-xs font-bold text-emerald-400">
                  Plan saved successfully!
                </span>
              )}
            </div>

            {/* Time-Blocked Items List */}
            <div className="space-y-3">
              {dailyPlan.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    item.isDone
                      ? 'bg-black/30 border-white/5 text-slate-500'
                      : 'bg-white/[0.02] border-indigo-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      type="button"
                      id={`plan-toggle-${item.id}`}
                      onClick={() => handleTogglePlanItem(item.id)}
                      className={`w-5 h-5 rounded flex items-center justify-center text-xs font-black transition-colors cursor-pointer shrink-0 ${
                        item.isDone
                          ? 'bg-indigo-600 text-white'
                          : 'border border-white/30 bg-white/5 hover:border-white/60 text-transparent'
                      }`}
                    >
                      X
                    </button>

                    <div className="space-y-0.5 flex-1">
                      <span className="inline-block text-[11px] font-mono font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                        {item.timeSlot}
                      </span>
                      <p
                        className={`text-sm font-semibold ${
                          item.isDone ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {item.focusTitle}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-slate-400">{item.notes}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    id={`btn-delete-plan-${item.id}`}
                    onClick={() => handleDeletePlanItem(item.id)}
                    className="px-2.5 py-1 text-slate-400 hover:text-rose-400 rounded-lg text-xs font-semibold hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Plan Item Form */}
            <form onSubmit={handleAddPlanItem} className="pt-2 border-t border-white/10 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block">
                Add Schedule or Focus Target:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  value={newPlanTime}
                  onChange={(e) => setNewPlanTime(e.target.value)}
                  placeholder="Time slot (e.g. 02:00 PM - 03:30 PM)"
                  className="text-xs px-3 py-2 rounded-xl border border-white/10 bg-black/40 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  placeholder="Focus target or task description..."
                  className="sm:col-span-2 text-xs px-3 py-2 rounded-xl border border-white/10 bg-black/40 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                id="btn-add-plan-item"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Add to Planner
              </button>
            </form>

            {/* Personal Notes / Today's Reflection */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  Daily Notes &amp; Observations:
                </label>
                <button
                  type="button"
                  id="btn-save-plan-notes"
                  onClick={handleSaveNotes}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  Save Notes
                </button>
              </div>
              <textarea
                rows={3}
                value={dailyPlan.dayNotes}
                onChange={(e) =>
                  setDailyPlan((prev) => ({ ...prev, dayNotes: e.target.value }))
                }
                placeholder="Log any notable progress, visitor notes, or workflow reflections..."
                className="w-full text-xs p-3 rounded-xl border border-white/10 bg-black/40 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
