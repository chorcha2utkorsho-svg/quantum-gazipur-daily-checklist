import React, { useState, useMemo } from 'react';
import {
  Clock,
  Sparkles,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  ListOrdered,
  CheckCircle2,
  Timer,
  Play,
  Pause,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { WorkflowTask, WORKFLOW_CATEGORIES, WorkflowCategory } from '../data/workflowData';
import { DailyLogItem } from '../types';
import { TaskTimerControl } from './TaskTimerControl';
import { formatSecondsToTimer, formatMinutes } from '../utils/timeTracking';

interface WorkflowTaskTableProps {
  tasks: WorkflowTask[];
  dailyLogs: Record<string, DailyLogItem>;
  onToggleStatus: (taskName: string) => void;
  onUpdateReason: (taskName: string, reason: string) => void;
  selectedCategory: string;
  viewDensity?: 'detailed' | 'compact';
  categories?: WorkflowCategory[];
  activeTimerTaskName?: string | null;
  activeTimerSeconds?: number;
  onStartTimer?: (taskName: string) => void;
  onPauseTimer?: (taskName: string) => void;
  onResetTimer?: (taskName: string) => void;
  onSetManualMinutes?: (taskName: string, minutes: number) => void;
}

const COMMON_REASONS = [
  'Awaiting client response',
  'Will be completed this afternoon',
  'Technical or system issue',
  'Awaiting supervisor approval',
  'Not applicable today',
];

const PRIORITY_ORDER: Record<string, number> = {
  high: 1,
  medium: 2,
  low: 3,
};

const getPriorityRank = (p?: string): number => {
  if (!p) return 2;
  const key = p.toLowerCase();
  return PRIORITY_ORDER[key] ?? 2;
};

// Reusable Task Row Component for both Grouped & Flat Workday Layouts
interface TaskRowProps {
  task: WorkflowTask;
  categoryLabel?: string;
  dailyLogs: Record<string, DailyLogItem>;
  onToggleStatus: (taskName: string) => void;
  onUpdateReason: (taskName: string, reason: string) => void;
  activeReasonInput: string | null;
  setActiveReasonInput: React.Dispatch<React.SetStateAction<string | null>>;
  showCategoryBadge?: boolean;
  activeTimerTaskName?: string | null;
  activeTimerSeconds?: number;
  onStartTimer?: (taskName: string) => void;
  onPauseTimer?: (taskName: string) => void;
  onResetTimer?: (taskName: string) => void;
  onSetManualMinutes?: (taskName: string, minutes: number) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  categoryLabel,
  dailyLogs,
  onToggleStatus,
  onUpdateReason,
  activeReasonInput,
  setActiveReasonInput,
  showCategoryBadge = false,
  activeTimerTaskName,
  activeTimerSeconds = 0,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onSetManualMinutes,
}) => {
  const log = dailyLogs[task.name];
  const isDone = log?.status === 'done';
  const isHighPriority = task.priority === 'high';
  const reason = log?.reason_for_pending || '';
  const isReasonOpen = activeReasonInput === task.name;

  return (
    <tr
      key={task.id}
      id={`task-row-${task.id}`}
      className={`transition-all duration-200 ${
        isDone
          ? 'bg-emerald-950/20 hover:bg-emerald-950/30 border-y border-transparent'
          : isHighPriority
          ? 'bg-gradient-to-r from-rose-950/30 via-rose-950/15 to-transparent hover:bg-rose-900/25 border-y border-rose-500/30 shadow-[inset_4px_0_0_0_#f43f5e,0_0_14px_rgba(244,63,94,0.12)]'
          : 'bg-transparent hover:bg-white/5 border-y border-transparent'
      }`}
    >
      {/* Checkbox Column */}
      <td className="py-2.5 px-3 text-center">
        <button
          type="button"
          id={`task-toggle-${task.id}`}
          onClick={() => onToggleStatus(task.name)}
          className={`w-5 h-5 rounded border flex items-center justify-center text-xs font-black transition-all ${
            isDone
              ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-xs'
              : isHighPriority
              ? 'border-rose-500/70 hover:border-rose-400 bg-rose-500/15 hover:bg-rose-500/25 text-transparent ring-2 ring-rose-500/40 shadow-xs shadow-rose-500/30'
              : 'border-white/30 hover:border-white/60 bg-white/5 text-transparent'
          }`}
          title={isDone ? 'Mark as Pending' : isHighPriority ? 'Urgent Task (জরুরি কাজ) - Mark as Done' : 'Mark as Done'}
        >
          X
        </button>
      </td>

      {/* Serial Number */}
      <td className="py-2.5 px-2 text-center font-mono font-medium text-[11px]">
        <span className={isHighPriority && !isDone ? 'text-rose-300 font-bold' : 'text-slate-400'}>
          {task.order}
        </span>
      </td>

      {/* Code ID */}
      <td className="py-2.5 px-2.5 font-mono text-xs font-bold">
        <span
          className={`px-1.5 py-0.5 rounded border transition-colors ${
            isDone
              ? 'bg-white/5 border-white/5 text-slate-400'
              : isHighPriority
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-200 shadow-2xs'
              : 'bg-white/10 border-white/10 text-slate-300'
          }`}
        >
          {task.code}
        </span>
      </td>

      {/* Task Name & Details */}
      <td className="py-2.5 px-3">
        <div className="cursor-pointer" onClick={() => onToggleStatus(task.name)}>
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className={`font-bold text-xs sm:text-sm tracking-tight transition-colors ${
                isDone
                  ? 'text-slate-500 line-through'
                  : isHighPriority
                  ? 'text-rose-100 font-extrabold drop-shadow-xs'
                  : 'text-white'
              }`}
            >
              {task.name}
            </div>

            {/* Color-coded Urgent Badge for High Priority Tasks */}
            {isHighPriority && !isDone && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/25 text-rose-200 border border-rose-500/50 shadow-sm shadow-rose-500/30 ring-1 ring-rose-500/30">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-400"></span>
                </span>
                <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                Urgent
              </span>
            )}
            {isHighPriority && isDone && (
              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-semibold uppercase px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                High Priority Completed
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            {task.details}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1 sm:hidden">
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono uppercase ${
                task.priority === 'high'
                  ? 'bg-rose-500/25 text-rose-200 border border-rose-500/50 shadow-xs shadow-rose-500/25 ring-1 ring-rose-500/30'
                  : task.priority === 'medium'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-white/5 text-slate-400 border border-white/10'
              }`}
            >
              {task.priority || 'medium'}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-sky-400 font-semibold">
              <Clock className="w-3 h-3" />
              {task.estimated_minutes || 30} mins
            </span>
          </div>
        </div>

        {/* Inline Reason expansion */}
        {!isDone && (isReasonOpen || reason) && (
          <div className="mt-2 pt-2 border-t border-amber-500/30 bg-black/40 p-2 rounded-lg text-xs">
            <div className="text-amber-300 font-semibold text-[11px] mb-1">
              Reason for pending:
            </div>
            <input
              type="text"
              value={reason}
              onChange={(e) => onUpdateReason(task.name, e.target.value)}
              placeholder="Enter reason (e.g., awaiting supervisor confirmation)..."
              className="w-full px-2.5 py-1 text-xs bg-black/50 border border-white/10 rounded text-white focus:outline-none focus:border-amber-500"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {COMMON_REASONS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => onUpdateReason(task.name, chip)}
                  className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                    reason === chip
                      ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}
      </td>

      {/* Category Column */}
      <td className="py-2.5 px-3 hidden md:table-cell">
        <span className="inline-block text-[11px] px-2 py-0.5 rounded-full border font-semibold bg-white/10 text-slate-300 border-white/10">
          {categoryLabel || task.category}
        </span>
      </td>

      {/* Priority Column */}
      <td className="py-2.5 px-3 text-center">
        {task.priority === 'high' ? (
          <span
            className={`inline-flex items-center justify-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono transition-all ${
              isDone
                ? 'bg-rose-500/10 text-rose-400/70 border border-rose-500/20'
                : 'bg-rose-500/25 text-rose-200 border border-rose-500/50 shadow-sm shadow-rose-500/30 ring-1 ring-rose-500/30'
            }`}
          >
            {!isDone && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400"></span>
              </span>
            )}
            High
          </span>
        ) : task.priority === 'medium' ? (
          <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
            Medium
          </span>
        ) : (
          <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 font-mono">
            Low
          </span>
        )}
      </td>

      {/* Time & Timer Tracking Column (Est vs Actual) */}
      <td className="py-2.5 px-3 min-w-[210px] w-56">
        <TaskTimerControl
          taskName={task.name}
          estimatedMinutes={task.estimated_minutes || 30}
          log={log}
          isRunning={activeTimerTaskName === task.name}
          liveSeconds={activeTimerSeconds}
          onStart={() => onStartTimer && onStartTimer(task.name)}
          onPause={() => onPauseTimer && onPauseTimer(task.name)}
          onReset={() => onResetTimer && onResetTimer(task.name)}
          onSetManualMinutes={(mins) => onSetManualMinutes && onSetManualMinutes(task.name, mins)}
          variant="table"
        />
      </td>

      {/* Status Column */}
      <td className="py-2.5 px-3 text-center">
        <button
          type="button"
          onClick={() => onToggleStatus(task.name)}
          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
            isDone
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
          }`}
        >
          {isDone ? '[Done]' : '[Pending]'}
        </button>
      </td>

      {/* Notes / Reason Column */}
      <td className="py-2.5 px-3 hidden lg:table-cell">
        {isDone ? (
          <span className="text-[11px] text-slate-400 italic">
            Completed {log?.completed_at ? new Date(log.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        ) : (
          <div className="flex items-center gap-1.5">
            {reason ? (
              <span
                onClick={() =>
                  setActiveReasonInput(isReasonOpen ? null : task.name)
                }
                title={reason}
                className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded truncate max-w-[150px] cursor-pointer"
              >
                {reason}
              </span>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setActiveReasonInput(isReasonOpen ? null : task.name)
                }
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                [Add reason]
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export const WorkflowTaskTable: React.FC<WorkflowTaskTableProps> = ({
  tasks,
  dailyLogs,
  onToggleStatus,
  onUpdateReason,
  selectedCategory,
  categories = WORKFLOW_CATEGORIES,
  activeTimerTaskName,
  activeTimerSeconds,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onSetManualMinutes,
}) => {
  // Sorting states: 'workday' (Priority High > Med > Low, then Est. Time) is active by default!
  const [sortMode, setSortMode] = useState<'workday' | 'serial' | 'priority' | 'time'>('workday');
  const [timeDirection, setTimeDirection] = useState<'desc' | 'asc'>('desc');
  const [viewLayout, setViewLayout] = useState<'grouped' | 'flat'>('grouped');

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach((c) => {
      initial[c.id] = true;
    });
    return initial;
  });

  const [activeReasonInput, setActiveReasonInput] = useState<string | null>(null);

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const expandAll = () => {
    const updated: Record<string, boolean> = {};
    categories.forEach((c) => {
      updated[c.id] = true;
    });
    setExpandedCategories(updated);
  };

  const collapseAll = () => {
    const updated: Record<string, boolean> = {};
    categories.forEach((c) => {
      updated[c.id] = false;
    });
    setExpandedCategories(updated);
  };

  // Sort helper function
  const sortTasks = (taskList: WorkflowTask[]) => {
    return [...taskList].sort((a, b) => {
      if (sortMode === 'workday') {
        // 1. Primary: Priority (High = 1 > Medium = 2 > Low = 3)
        const pA = getPriorityRank(a.priority);
        const pB = getPriorityRank(b.priority);
        if (pA !== pB) {
          return pA - pB;
        }

        // 2. Secondary: Estimated minutes (descending by default e.g. 60m > 45m > 30m > 15m)
        const tA = typeof a.estimated_minutes === 'number' ? a.estimated_minutes : 30;
        const tB = typeof b.estimated_minutes === 'number' ? b.estimated_minutes : 30;
        if (tA !== tB) {
          return timeDirection === 'desc' ? tB - tA : tA - tB;
        }

        // 3. Fallback to order
        return (a.order || 0) - (b.order || 0);
      }

      if (sortMode === 'priority') {
        const pA = getPriorityRank(a.priority);
        const pB = getPriorityRank(b.priority);
        if (pA !== pB) return pA - pB;

        const tA = typeof a.estimated_minutes === 'number' ? a.estimated_minutes : 30;
        const tB = typeof b.estimated_minutes === 'number' ? b.estimated_minutes : 30;
        if (tA !== tB) {
          return timeDirection === 'desc' ? tB - tA : tA - tB;
        }
        return (a.order || 0) - (b.order || 0);
      }

      if (sortMode === 'time') {
        const tA = typeof a.estimated_minutes === 'number' ? a.estimated_minutes : 30;
        const tB = typeof b.estimated_minutes === 'number' ? b.estimated_minutes : 30;
        if (tA !== tB) {
          return timeDirection === 'desc' ? tB - tA : tA - tB;
        }
        const pA = getPriorityRank(a.priority);
        const pB = getPriorityRank(b.priority);
        return pA - pB;
      }

      // 'serial' order
      return (a.order || 0) - (b.order || 0);
    });
  };

  const categoriesToShow =
    selectedCategory === 'ALL'
      ? categories
      : categories.filter((c) => c.id === selectedCategory);

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const totalVisibleTasks = tasks.length;
  const totalMinutes = tasks.reduce((acc, t) => acc + (t.estimated_minutes || 30), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  const formattedTotalTime = totalHours > 0 ? `${totalHours}h ${remainingMins}m` : `${remainingMins}m`;

  const completedMinutes = tasks
    .filter((t) => dailyLogs[t.name]?.status === 'done')
    .reduce((acc, t) => acc + (t.estimated_minutes || 30), 0);
  const completedHours = Math.floor(completedMinutes / 60);
  const completedMins = completedMinutes % 60;
  const formattedCompletedTime = completedHours > 0 ? `${completedHours}h ${completedMins}m` : `${completedMins}m`;

  const highPriorityTasks = useMemo(() => tasks.filter((t) => t.priority === 'high'), [tasks]);
  const pendingHighPriorityCount = useMemo(
    () => highPriorityTasks.filter((t) => dailyLogs[t.name]?.status !== 'done').length,
    [highPriorityTasks, dailyLogs]
  );

  // Sorted list for flat view
  const globallySortedTasks = useMemo(() => {
    return sortTasks(tasks);
  }, [tasks, sortMode, timeDirection]);

  return (
    <div id="workflow-task-table" className="bg-[#14161a] rounded-xl border border-white/10 shadow-xs overflow-hidden text-white">
      {/* Top Table Title & Controls */}
      <div className="px-5 py-3.5 bg-black/40 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Workflow &amp; Accountability Table
          </h2>
          <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30 font-mono">
            {totalVisibleTasks} Tasks
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 bg-sky-500/20 px-2.5 py-0.5 rounded-full border border-sky-500/30 font-mono">
            <Clock className="w-3.5 h-3.5" />
            Est. Workload: {formattedTotalTime} ({formattedCompletedTime} completed)
          </span>

          {/* Urgent High Priority Tasks Counter Indicator */}
          {highPriorityTasks.length > 0 && (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border font-mono transition-all ${
                pendingHighPriorityCount > 0
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-xs shadow-rose-500/25 ring-1 ring-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
              title={
                pendingHighPriorityCount > 0
                  ? `${pendingHighPriorityCount} urgent high priority tasks pending today`
                  : 'All urgent high priority tasks completed!'
              }
            >
              {pendingHighPriorityCount > 0 ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400"></span>
                  </span>
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span>{pendingHighPriorityCount} Urgent High</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>All Urgent Done</span>
                </>
              )}
            </span>
          )}
        </div>

        {/* Workday Structuring & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Workday Auto-Sort Toggle */}
          <button
            type="button"
            id="btn-sort-workday-priority-time"
            onClick={() => {
              if (sortMode === 'workday') {
                setSortMode('serial');
              } else {
                setSortMode('workday');
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              sortMode === 'workday'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 shadow-xs'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
            title="Automatically sort tasks by Priority (High > Medium > Low) and then by estimated minutes"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Auto-Sort: Priority &amp; Time</span>
            {sortMode === 'workday' && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 uppercase font-bold">
                Active
              </span>
            )}
          </button>

          {/* Time Direction Toggle (when in workday or time mode) */}
          {(sortMode === 'workday' || sortMode === 'time') && (
            <button
              type="button"
              id="btn-toggle-time-direction"
              onClick={() => setTimeDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500/25 transition-all cursor-pointer"
              title={
                timeDirection === 'desc'
                  ? 'Switch to Quick Wins first (15m → 60m)'
                  : 'Switch to Deep Work first (60m → 15m)'
              }
            >
              <Clock className="w-3 h-3 text-sky-400" />
              <span>{timeDirection === 'desc' ? 'Time: 60m ↓ 15m' : 'Time: 15m ↑ 60m'}</span>
            </button>
          )}

          {/* Reset to Serial Button */}
          {sortMode !== 'serial' && (
            <button
              type="button"
              id="btn-sort-serial"
              onClick={() => setSortMode('serial')}
              className="px-2 py-1 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
              title="Reset to default serial ordering (1-73)"
            >
              <ListOrdered className="w-3.5 h-3.5 inline mr-1" />
              Serial
            </button>
          )}

          {/* View Layout Switcher: Grouped Accordion vs Continuous Workday */}
          <div className="flex items-center bg-black/50 p-0.5 rounded-lg border border-white/10">
            <button
              type="button"
              id="btn-layout-grouped"
              onClick={() => setViewLayout('grouped')}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                viewLayout === 'grouped'
                  ? 'bg-white/15 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Group tasks by Wing / Category accordions"
            >
              <Layers className="w-3 h-3 inline mr-1" />
              Wings
            </button>
            <button
              type="button"
              id="btn-layout-flat"
              onClick={() => setViewLayout('flat')}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                viewLayout === 'flat'
                  ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="View continuous, structured workday timeline across all wings"
            >
              Workday Flow
            </button>
          </div>

          {/* Expand / Collapse (only in grouped view) */}
          {viewLayout === 'grouped' && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="btn-table-expand-all"
                onClick={expandAll}
                className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
              >
                Expand
              </button>
              <button
                type="button"
                id="btn-table-collapse-all"
                onClick={collapseAll}
                className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
              >
                Collapse
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auto-Sort Active Banner Notification */}
      {sortMode === 'workday' && (
        <div className="px-5 py-2 bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-indigo-500/10 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-semibold">Smart Workday Structuring Active:</span>
            <span className="text-slate-300">
              Tasks automatically prioritized by{' '}
              <strong className="text-rose-300 font-mono">High &gt; Medium &gt; Low</strong> priority,
              then by estimated workload duration (
              <strong className="text-sky-300 font-mono">
                {timeDirection === 'desc' ? '60m → 15m deep focus' : '15m → 60m quick wins'}
              </strong>
              ).
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
            Click table headers below to re-sort anytime
          </span>
        </div>
      )}

      {/* Live Active Timer Alert Banner */}
      {activeTimerTaskName && (
        <div className="px-5 py-2.5 bg-gradient-to-r from-emerald-950/80 via-[#0f172a] to-emerald-950/80 border-b border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-emerald-300">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-bold flex items-center gap-1 text-white">
              <Timer className="w-4 h-4 text-emerald-400" />
              Live Task Stopwatch:
            </span>
            <span className="font-semibold text-emerald-200 bg-white/5 border border-white/10 px-2 py-0.5 rounded max-w-xs sm:max-w-md truncate">
              {activeTimerTaskName}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-black border border-emerald-500/40 text-sm">
              {formatSecondsToTimer(activeTimerSeconds || 0)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPauseTimer && onPauseTimer(activeTimerTaskName)}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
              title="Pause current timer & log time spent"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause Timer</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleStatus(activeTimerTaskName)}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
              title="Complete task and log total duration"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Finish &amp; Mark Done</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table Structure */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          {/* Interactive Table Header Row */}
          <thead>
            <tr className="bg-black/60 text-slate-400 font-bold border-b border-white/10 text-[11px] uppercase tracking-wider select-none">
              <th className="py-2.5 px-3 w-10 text-center">[Done]</th>
              <th
                onClick={() => setSortMode('serial')}
                className="py-2.5 px-2 w-12 text-center cursor-pointer hover:text-white transition-colors"
                title="Click to sort by Original Serial No."
              >
                <div className="flex items-center justify-center gap-1">
                  <span>No.</span>
                  {sortMode === 'serial' && <ArrowUp className="w-3 h-3 text-indigo-400" />}
                </div>
              </th>
              <th className="py-2.5 px-2.5 w-20">Code</th>
              <th className="py-2.5 px-3">Task Details</th>
              <th className="py-2.5 px-3 w-44 hidden md:table-cell">Category / Sector</th>
              <th
                onClick={() => {
                  setSortMode('workday');
                }}
                className={`py-2.5 px-3 w-28 text-center cursor-pointer transition-colors ${
                  sortMode === 'workday' || sortMode === 'priority'
                    ? 'text-amber-300 bg-amber-500/10'
                    : 'hover:text-white'
                }`}
                title="Sort by Priority (High > Medium > Low)"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Priority</span>
                  {sortMode === 'workday' ? (
                    <span className="text-[9px] font-mono font-bold text-amber-400">High&gt;Low</span>
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  )}
                </div>
              </th>
              <th
                onClick={() => {
                  if (sortMode === 'workday') {
                    setTimeDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
                  } else {
                    setSortMode('workday');
                  }
                }}
                className={`py-2.5 px-3 min-w-[210px] w-56 text-left cursor-pointer transition-colors ${
                  sortMode === 'workday' ? 'text-sky-300 bg-sky-500/10' : 'hover:text-white'
                }`}
                title="Time tracking & comparison against estimated duration. Click to toggle sort order."
              >
                <div className="flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Time Log (Est vs Actual)</span>
                  {sortMode === 'workday' ? (
                    timeDirection === 'desc' ? (
                      <ArrowDown className="w-3 h-3 text-sky-400" />
                    ) : (
                      <ArrowUp className="w-3 h-3 text-sky-400" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  )}
                </div>
              </th>
              <th className="py-2.5 px-3 w-28 text-center">Status</th>
              <th className="py-2.5 px-3 w-48 hidden lg:table-cell">Notes / Reason</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-white/5">
            {viewLayout === 'flat' ? (
              /* Continuous Flattened Workday Schedule */
              globallySortedTasks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No tasks match the active filters.
                  </td>
                </tr>
              ) : (
                globallySortedTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    categoryLabel={categoryNameMap.get(task.category) || task.category}
                    dailyLogs={dailyLogs}
                    onToggleStatus={onToggleStatus}
                    onUpdateReason={onUpdateReason}
                    activeReasonInput={activeReasonInput}
                    setActiveReasonInput={setActiveReasonInput}
                    showCategoryBadge={true}
                    activeTimerTaskName={activeTimerTaskName}
                    activeTimerSeconds={activeTimerSeconds}
                    onStartTimer={onStartTimer}
                    onPauseTimer={onPauseTimer}
                    onResetTimer={onResetTimer}
                    onSetManualMinutes={onSetManualMinutes}
                  />
                ))
              )
            ) : (
              /* Grouped by Wing / Category Accordions */
              categoriesToShow.map((cat) => {
                const categoryRawTasks = tasks.filter((t) => t.category === cat.id);
                if (categoryRawTasks.length === 0) return null;

                // Sort tasks within this category according to current sortMode (Priority & Time by default)
                const categoryTasks = sortTasks(categoryRawTasks);

                const isExpanded = expandedCategories[cat.id] ?? true;
                const doneCount = categoryTasks.filter(
                  (t) => dailyLogs[t.name]?.status === 'done'
                ).length;
                const totalCount = categoryTasks.length;
                const catHighPending = categoryTasks.filter(
                  (t) => t.priority === 'high' && dailyLogs[t.name]?.status !== 'done'
                ).length;
                const catPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
                const categoryMinutes = categoryTasks.reduce(
                  (sum, t) => sum + (t.estimated_minutes || 30),
                  0
                );
                const categoryActualMinutes = categoryTasks.reduce((sum, t) => {
                  const l = dailyLogs[t.name];
                  const mins = l?.actual_minutes ?? (l?.time_spent_seconds ? Math.round(l.time_spent_seconds / 60) : 0);
                  return sum + mins;
                }, 0);
                const catHrs = Math.floor(categoryMinutes / 60);
                const catMins = categoryMinutes % 60;
                const formattedCatTime = catHrs > 0 ? `${catHrs}h ${catMins}m` : `${catMins}m`;

                return (
                  <React.Fragment key={cat.id}>
                    {/* Category Accordion Header Row */}
                    <tr
                      onClick={() => toggleCategory(cat.id)}
                      className="bg-white/5 hover:bg-white/10 cursor-pointer border-y border-white/10 transition-colors select-none group"
                    >
                      <td colSpan={9} className="py-3 px-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Category title, count, time & sort tags */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-white transition-colors">
                              {isExpanded ? '[-]' : '[+]'}
                            </span>
                            <span className="font-extrabold text-xs sm:text-sm text-white">
                              {cat.name}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white/10 text-slate-300 border-white/10 font-mono">
                              {totalCount} Tasks
                            </span>
                            {catHighPending > 0 && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/25 text-rose-200 border border-rose-500/40 font-mono shadow-xs shadow-rose-500/25 ring-1 ring-rose-500/30"
                                title={`${catHighPending} urgent high-priority task(s) pending in this category`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                                <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                                {catHighPending} Urgent
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-sky-500/10 text-sky-300 border-sky-500/20 font-mono" title="Estimated total time for this category">
                              <Clock className="w-3 h-3 text-sky-400" />
                              Est: {formattedCatTime}
                            </span>
                            {categoryActualMinutes > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-indigo-500/15 text-indigo-300 border-indigo-500/30 font-mono" title="Actual time spent logged on this category">
                                <Timer className="w-3 h-3 text-indigo-400" />
                                Act: {formatMinutes(categoryActualMinutes)}
                              </span>
                            )}
                            {sortMode === 'workday' && (
                              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                                <Sparkles className="w-2.5 h-2.5" />
                                Priority Sorted
                              </span>
                            )}
                          </div>

                          {/* Visual Progress Bar & Completion Statistics */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <span className="text-[11px] font-semibold text-slate-400 hidden xs:inline">
                                Progress:
                              </span>
                              <span
                                className={`font-mono text-xs font-bold ${
                                  catPercent === 100
                                    ? 'text-emerald-400'
                                    : catPercent > 0
                                    ? 'text-indigo-300'
                                    : 'text-slate-400'
                                }`}
                              >
                                {doneCount}/{totalCount}
                              </span>

                              {/* Visual Progress Bar Track */}
                              <div
                                className="w-28 sm:w-36 md:w-48 h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/10 p-[1px] relative shadow-inner"
                                title={`${cat.name}: ${catPercent}% completed (${doneCount} of ${totalCount} tasks)`}
                              >
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                                    catPercent === 100
                                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                                      : catPercent >= 60
                                      ? 'bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400'
                                      : catPercent > 0
                                      ? 'bg-gradient-to-r from-indigo-500 to-sky-400'
                                      : 'bg-transparent'
                                  }`}
                                  style={{ width: `${catPercent}%` }}
                                />
                              </div>

                              {/* Percentage Pill */}
                              <span
                                className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-full border transition-colors ${
                                  catPercent === 100
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                                    : catPercent > 0
                                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                    : 'bg-white/5 text-slate-400 border-white/10'
                                }`}
                              >
                                {catPercent === 100 && (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                )}
                                {catPercent}%
                              </span>
                            </div>

                            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline group-hover:text-slate-200 transition-colors">
                              {isExpanded ? '[Open]' : '[Closed]'}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Task Items under this Category */}
                    {isExpanded &&
                      categoryTasks.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          categoryLabel={cat.name}
                          dailyLogs={dailyLogs}
                          onToggleStatus={onToggleStatus}
                          onUpdateReason={onUpdateReason}
                          activeReasonInput={activeReasonInput}
                          setActiveReasonInput={setActiveReasonInput}
                          showCategoryBadge={false}
                          activeTimerTaskName={activeTimerTaskName}
                          activeTimerSeconds={activeTimerSeconds}
                          onStartTimer={onStartTimer}
                          onPauseTimer={onPauseTimer}
                          onResetTimer={onResetTimer}
                          onSetManualMinutes={onSetManualMinutes}
                        />
                      ))}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
