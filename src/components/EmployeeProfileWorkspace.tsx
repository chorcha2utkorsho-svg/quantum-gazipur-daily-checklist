import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Check,
  Calendar,
  Filter,
  Plus,
  Trash2,
  Save,
  Phone,
  Building2,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  MessageSquareQuote,
  Flame,
  ListTodo,
} from 'lucide-react';
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
    setAckNotice('✅ আপনি নির্দেশনাটি গ্রহণ করেছেন। রাজি স্যার তা দেখতে পাচ্ছেন।');
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
      timeSlot: newPlanTime.trim() || 'সাধারণ সময়সীমা',
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
    <div className="space-y-6">
      {/* 1. Raji Sir's Live Directive Alert Banner (if any) */}
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
                    : 'bg-slate-900 border-amber-500/40 text-white'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      isUrgent ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950 font-black'
                    }`}
                  >
                    <MessageSquareQuote className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        {directive.sender_name} থেকে নির্দেশনা
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          isUrgent ? 'bg-rose-600 text-white' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {directive.priority === 'urgent' ? 'জরুরি আদেশ' : 'সেন্ট্রাল নির্দেশনা'}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {directive.created_at}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-100 leading-snug">
                      "{directive.message}"
                    </p>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  {hasAcked ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                      <Check className="w-4 h-4 text-emerald-400" />
                      আদেশ প্রাপ্তিস্বীকার সম্পন্ন
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcknowledgeDirective(directive.id)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      আদেশ পেয়েছি (স্বীকার করুন)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {ackNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{ackNotice}</span>
        </div>
      )}

      {/* 2. Employee Profile Card & Identity */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs">
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
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  currentUser.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
                title={currentUser.is_active ? 'Active Profile' : 'Inactive'}
              />
            </div>

            {/* Name, Role, & Branch Badges */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {currentUser.employee_id}
                </span>
                {currentUser.approval_status === 'approved' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> অনুমোদিত কর্মী
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">
                  {roleDef?.titleBn || currentUser.role}
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {branchDef?.nameBn || 'গাজীপুর'}
                </span>
                {currentUser.phone && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {currentUser.phone}
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
                onClick={onOpenAiInsightModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/30 text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="AI Strategic Insight Analysis"
              >
                <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>AI পরামর্শ</span>
              </button>
            )}

            {onOpenEmployeeSwitcher && (
              <button
                type="button"
                onClick={onOpenEmployeeSwitcher}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>প্রোফাইল পরিবর্তন</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. PROMINENT USER SUMMARY (Exact requirement: "আমার এত পার্সেন্ট কাজ হয়েছে আরো এত পার্সেন্ট কাজ বাকি") */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  আজকের ব্যক্তিগত কাজের সারসংক্ষেপ ({selectedDate})
                </span>
                {/* Bengali prompt exact wording matching */}
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
                  আমার <span className="text-emerald-400 underline decoration-emerald-500/50 underline-offset-4">{stats.percentage}%</span> কাজ সম্পন্ন হয়েছে, আরো <span className="text-amber-400 underline decoration-amber-500/50 underline-offset-4">{stats.remainingPercentage}%</span> কাজ বাকি।
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">সম্পন্ন বনাম বাকি</span>
                  <span className="text-sm font-bold text-white">
                    {stats.done} / {stats.total} টি কাজ
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-black text-base text-emerald-400 border border-white/10">
                  {stats.percentage}%
                </div>
              </div>
            </div>

            {/* Split Progress Visualizer Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full bg-slate-700/60 overflow-hidden flex p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 shadow-sm"
                  style={{ width: `${stats.percentage}%` }}
                  title={`সম্পন্ন: ${stats.percentage}%`}
                />
                <div
                  className="h-full rounded-full bg-amber-500/40 transition-all duration-500 ml-1"
                  style={{ width: `${stats.remainingPercentage}%` }}
                  title={`বাকি: ${stats.remainingPercentage}%`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold px-0.5">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  সম্পন্ন: {stats.percentage}% ({stats.done} টি)
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  বাকি আছে: {stats.remainingPercentage}% ({stats.pending} টি)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sub-Navigation Tabs inside Profile */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setProfileTab('checklist')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            profileTab === 'checklist'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>আমার সম্পূর্ণ কাজের তালিকা ({stats.total})</span>
        </button>

        {/* Quick Pending Items View (Exact user request: "এমপ্লয়ী চাইলে এখানে সাইন ইন করে ঢুকে দেখতে পারবে যে আর কি কি কাজ পেন্ডিং আছে?") */}
        <button
          type="button"
          onClick={() => setProfileTab('pending_only')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            profileTab === 'pending_only'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white text-amber-900 hover:bg-amber-50 border border-amber-300'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>বাকি কাজগুলো দেখুন ({stats.pending} টি পেন্ডিং)</span>
        </button>

        {/* Daily Planner Tab (Exact user request: "চাইলে সে প্ল্যানার ব্যবহার করতে পারবে") */}
        <button
          type="button"
          onClick={() => setProfileTab('planner')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            profileTab === 'planner'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>দৈনিক প্ল্যানার (Daily Planner)</span>
        </button>
      </div>

      {/* 5. TAB A: Checklist & Pending Only View */}
      {(profileTab === 'checklist' || profileTab === 'pending_only') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              {profileTab === 'pending_only' ? (
                <>
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span>শুধুমাত্র বাকি থাকা কাজসমূহ ({displayedTasks.length} টি)</span>
                </>
              ) : (
                <>
                  <ListTodo className="w-5 h-5 text-slate-700" />
                  <span>{currentUser.name}-এর নির্ধারিত কাজের তালিকা</span>
                </>
              )}
            </h2>
            <span className="text-xs text-slate-500">
              টিক দিয়ে সম্পন্ন হিসেবে মার্ক করুন
            </span>
          </div>

          {displayedTasks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-950">
                আলহামদুলিল্লাহ! আপনার কোন কাজ পেন্ডিং নেই।
              </h4>
              <p className="text-xs text-emerald-800">
                আজকের সকল নির্ধারিত কাজ সফলভাবে সম্পন্ন করা হয়েছে।
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
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Checkbox & Task Title */}
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          type="button"
                          onClick={() =>
                            onToggleTaskStatus(
                              task.name,
                              isDone ? 'done' : 'pending',
                              reason
                            )
                          }
                          className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            isDone
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'border-2 border-slate-300 bg-white hover:border-slate-500 text-transparent'
                          }`}
                          title={isDone ? 'ক্লিক করে পেন্ডিং করুন' : 'ক্লিক করে টিক দিন (Done)'}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>

                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-sm font-bold leading-snug ${
                                isDone
                                  ? 'text-slate-500 line-through'
                                  : 'text-slate-900'
                              }`}
                            >
                              {task.name}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                              {task.categoryBn || task.category || 'সাধারণ'}
                            </span>
                          </div>

                          {/* Completion Timestamp */}
                          {isDone && log?.completed_at && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-mono">
                              <CheckCircle2 className="w-3 h-3" />
                              সম্পন্ন সময়: {log.completed_at}
                            </span>
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
                                placeholder="দেরি বা পেন্ডিং থাকার কারণ লিখুন (যদি থাকে)..."
                                className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-amber-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Tag */}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {isDone ? 'সম্পন্ন' : 'পেন্ডিং'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. TAB B: Daily Planner (Exact user request: "চাইলে সে প্ল্যানার ব্যবহার করতে পারবে") */}
      {profileTab === 'planner' && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span>দৈনিক কর্মপরিকল্পনা (Daily Time-Blocked Planner)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  দিনের বিভিন্ন সময়ে গুরুত্বপূর্ণ কাজগুলো শিডিউল করুন ও সম্পন্ন করে টিক দিন।
                </p>
              </div>

              {planSavedNotice && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> সংরক্ষিত হয়েছে!
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
                      ? 'bg-slate-50 border-slate-200 text-slate-500'
                      : 'bg-white border-indigo-100 shadow-2xs hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => handleTogglePlanItem(item.id)}
                      className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        item.isDone
                          ? 'bg-indigo-600 text-white'
                          : 'border-2 border-slate-300 bg-white hover:border-slate-500'
                      }`}
                    >
                      {item.isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="space-y-0.5 flex-1">
                      <span className="inline-block text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {item.timeSlot}
                      </span>
                      <p
                        className={`text-sm font-semibold ${
                          item.isDone ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {item.focusTitle}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-slate-500">{item.notes}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeletePlanItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="প্ল্যান আইটেম মুছুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Plan Item Form */}
            <form onSubmit={handleAddPlanItem} className="pt-2 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                নতুন শিডিউল বা লক্ষ্য যুক্ত করুন:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  value={newPlanTime}
                  onChange={(e) => setNewPlanTime(e.target.value)}
                  placeholder="সময়সীমা (যেমন: ০২:০০ PM - ০৩:৩০ PM)"
                  className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  placeholder="কাজের লক্ষ্য বা বিবরণী..."
                  className="sm:col-span-2 text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>প্ল্যানারে যোগ করুন</span>
              </button>
            </form>

            {/* Personal Notes / Today's Reflection */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  আজকের ব্যক্তিগত নোট ও কাজের অগ্রগতি মন্তব্য:
                </label>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>নোট সংরক্ষণ করুন</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={dailyPlan.dayNotes}
                onChange={(e) =>
                  setDailyPlan((prev) => ({ ...prev, dayNotes: e.target.value }))
                }
                placeholder="আজকের বিশেষ কোনো অগ্রগতি, ভিজিটর সংক্রান্ত তথ্য বা পরামর্শ লিখে রাখুন..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-hidden focus:border-indigo-500 leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
