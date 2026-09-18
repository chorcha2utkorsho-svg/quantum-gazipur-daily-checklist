import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Target,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Minimize2,
  Sparkles,
  Check,
  Flame,
  FileText,
} from 'lucide-react';
import { WorkflowTask, WorkflowCategory } from '../data/workflowData';
import { DailyLogItem, Employee } from '../types';
import { TaskTimerControl } from './TaskTimerControl';

interface FocusModeViewProps {
  tasks: WorkflowTask[];
  dailyLogs: Record<string, DailyLogItem>;
  onToggleStatus: (taskName: string) => Promise<void> | void;
  onUpdateReason: (taskName: string, reason: string) => Promise<void> | void;
  onExitFocusMode: () => void;
  currentUser: Employee | null;
  selectedDate: string;
  categories?: WorkflowCategory[];
  activeTimerTaskName?: string | null;
  activeTimerSeconds?: number;
  onStartTimer?: (taskName: string) => void;
  onPauseTimer?: (taskName: string) => void;
  onResetTimer?: (taskName: string) => void;
  onSetManualMinutes?: (taskName: string, minutes: number) => void;
}

export const FocusModeView: React.FC<FocusModeViewProps> = ({
  tasks,
  dailyLogs,
  onToggleStatus,
  onUpdateReason,
  onExitFocusMode,
  currentUser,
  selectedDate,
  categories = [],
  activeTimerTaskName,
  activeTimerSeconds = 0,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onSetManualMinutes,
}) => {
  // Category map lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, WorkflowCategory>();
    categories.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categories]);

  // Total stats
  const totalCount = tasks.length;
  const completedCount = useMemo(() => {
    return tasks.filter((t) => dailyLogs[t.name]?.status === 'done').length;
  }, [tasks, dailyLogs]);
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter only incomplete tasks
  const incompleteTasks = useMemo(() => {
    return tasks.filter((t) => dailyLogs[t.name]?.status !== 'done');
  }, [tasks, dailyLogs]);

  // Priority Rank: High = 1, Medium = 2, Low = 3
  const priorityRank = (priority?: string) => {
    if (!priority) return 2;
    const p = priority.toLowerCase();
    if (p === 'high') return 1;
    if (p === 'medium') return 2;
    return 3;
  };

  // Sort incomplete tasks by Priority (High first), then Estimated Minutes (deepest focus first), then order
  const sortedIncompleteTasks = useMemo(() => {
    return [...incompleteTasks].sort((a, b) => {
      const rA = priorityRank(a.priority);
      const rB = priorityRank(b.priority);
      if (rA !== rB) return rA - rB;

      const durA = a.estimated_minutes ?? 30;
      const durB = b.estimated_minutes ?? 30;
      if (durA !== durB) return durB - durA; // longer tasks first

      return a.order - b.order;
    });
  }, [incompleteTasks]);

  // Active task index within sorted incomplete tasks
  const [taskIndex, setTaskIndex] = useState<number>(0);

  // Keep index within bounds if tasks are completed or list shrinks
  useEffect(() => {
    if (taskIndex >= sortedIncompleteTasks.length && sortedIncompleteTasks.length > 0) {
      setTaskIndex(sortedIncompleteTasks.length - 1);
    }
  }, [sortedIncompleteTasks.length, taskIndex]);

  const currentTask: WorkflowTask | undefined = sortedIncompleteTasks[taskIndex] || sortedIncompleteTasks[0];
  const currentLog = currentTask ? dailyLogs[currentTask.name] : undefined;
  const currentCat = currentTask ? categoryMap.get(currentTask.category) : undefined;

  // Inline reason editing state
  const [isEditingReason, setIsEditingReason] = useState(false);
  const [reasonDraft, setReasonDraft] = useState('');
  const [isSavingReason, setIsSavingReason] = useState(false);

  useEffect(() => {
    if (currentLog?.reason_for_pending) {
      setReasonDraft(currentLog.reason_for_pending);
    } else {
      setReasonDraft('');
    }
    setIsEditingReason(false);
  }, [currentTask?.name, currentLog?.reason_for_pending]);

  // Focus Timer: countdown from estimated_minutes (in seconds)
  const defaultSeconds = (currentTask?.estimated_minutes || 30) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(defaultSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset timer when active task changes
  useEffect(() => {
    const newSeconds = (currentTask?.estimated_minutes || 30) * 60;
    setSecondsRemaining(newSeconds);
    setIsTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [currentTask?.name, currentTask?.estimated_minutes]);

  // Timer interval handling
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const toggleTimer = () => setIsTimerRunning((prev) => !prev);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setSecondsRemaining((currentTask?.estimated_minutes || 30) * 60);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcut for Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExitFocusMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExitFocusMode]);

  // Handler for marking current task done
  const [isCompleting, setIsCompleting] = useState(false);
  const handleMarkDone = async () => {
    if (!currentTask || isCompleting) return;
    setIsCompleting(true);
    try {
      await onToggleStatus(currentTask.name);
      // If we are at the end of the list, move back to 0
      setTaskIndex(0);
    } finally {
      setIsCompleting(false);
    }
  };

  // Handler for saving pending reason
  const handleSaveReason = async () => {
    if (!currentTask) return;
    setIsSavingReason(true);
    try {
      await onUpdateReason(currentTask.name, reasonDraft);
      setIsEditingReason(false);
    } finally {
      setIsSavingReason(false);
    }
  };

  return (
    <div
      id="focus-mode-container"
      className="min-h-screen bg-[#090b0e] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white"
    >
      {/* 1. Distraction-free Minimal Top Bar */}
      <header className="px-4 sm:px-8 py-3.5 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between gap-4 sticky top-0 z-50">
        {/* Left: Mode Title & Active User */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Target className="w-3.5 h-3.5" />
            <span>FOCUS MODE ACTIVE</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>•</span>
            <span>{currentUser?.name || 'Employee Workspace'}</span>
            <span className="text-slate-500 font-mono text-[11px]">({selectedDate})</span>
          </div>
        </div>

        {/* Center: Overall Daily Progress Meter */}
        <div className="hidden sm:flex items-center gap-3 max-w-xs w-full">
          <div className="flex-1">
            <div className="flex justify-between items-center text-[11px] font-mono mb-1">
              <span className="text-slate-400">Daily Goal</span>
              <span className="text-indigo-300 font-bold">
                {completedCount}/{totalCount} ({progressPercent}%)
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Exit Focus Mode Button */}
        <div className="flex items-center gap-2">
          <span className="hidden lg:inline text-[11px] font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-1 rounded-md">
            Press [Esc] to exit
          </span>
          <button
            id="btn-exit-focus-mode"
            onClick={onExitFocusMode}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Exit Focus Mode (Esc)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Focus Mode</span>
          </button>
        </div>
      </header>

      {/* 2. Main Stage: Only The Most High-Priority Incomplete Task */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10 max-w-4xl w-full mx-auto">
        {!currentTask || sortedIncompleteTasks.length === 0 ? (
          /* Celebratory State: All Tasks Finished! */
          <div
            id="focus-mode-all-completed"
            className="w-full bg-[#11141a] border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mb-6 shadow-inner">
              <Sparkles className="w-10 h-10" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              All Tasks Completed!
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto mb-8">
              Outstanding discipline! You have completed all {totalCount} workflow tasks for today.
              Your operational report is synchronized with central supervision.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onExitFocusMode}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Return to Full Workspace</span>
              </button>
            </div>
          </div>
        ) : (
          /* The Single Highest-Priority Incomplete Task Card */
          <div
            id="focus-target-task-card"
            className="w-full bg-[#11141a] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between"
          >
            {/* Ambient subtle glow based on priority */}
            <div
              className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 -mr-20 -mt-20 ${
                currentTask.priority?.toLowerCase() === 'high'
                  ? 'bg-rose-500'
                  : currentTask.priority?.toLowerCase() === 'medium'
                  ? 'bg-amber-500'
                  : 'bg-indigo-500'
              }`}
            />

            {/* Top row of card: Priority, Wing category & Estimated Duration */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Priority Pill */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase border ${
                      currentTask.priority?.toLowerCase() === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-xs shadow-rose-500/20'
                        : currentTask.priority?.toLowerCase() === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                    }`}
                  >
                    {currentTask.priority?.toLowerCase() === 'high' && (
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    {currentTask.priority ? `${currentTask.priority} Priority` : 'Priority Task'}
                  </span>

                  {/* Category / Wing */}
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300">
                    <span className="font-mono text-indigo-400">Wing:</span>
                    <span>{currentCat?.name || currentTask.category}</span>
                  </span>

                  {/* Task Code */}
                  <span className="font-mono text-xs font-bold text-slate-400 px-2 py-1 bg-black/40 rounded-lg border border-white/5">
                    {currentTask.code || `#${currentTask.order}`}
                  </span>
                </div>

                {/* Live Time Tracking & Sprint Status */}
                <div className="flex items-center gap-2">
                  {currentTask && (
                    <div className="flex items-center gap-2 bg-black/50 border border-white/10 px-3 py-1.5 rounded-2xl">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs text-slate-400 font-medium">Est:</span>
                      <span className="font-mono font-bold text-xs text-sky-300">
                        {currentTask.estimated_minutes || 30}m
                      </span>
                      {activeTimerTaskName === currentTask.name ? (
                        <span className="flex items-center gap-1 font-mono font-black text-xs text-emerald-400 px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                          Running
                        </span>
                      ) : (currentLog?.time_spent_seconds || 0) > 0 ? (
                        <span className="font-mono font-semibold text-xs text-slate-200 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                          Logged: {Math.round((currentLog?.time_spent_seconds || 0) / 60)}m
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              {/* Task Title & Bengali Subtitle */}
              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Active Mission ({taskIndex + 1} of {sortedIncompleteTasks.length} Incomplete)
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-snug tracking-tight">
                  {currentTask.name}
                </h1>
                {currentTask.categoryBn && (
                  <p className="text-sm sm:text-base text-slate-400 font-bangla mt-1 font-medium">
                    {currentTask.categoryBn}
                  </p>
                )}
              </div>

              {/* Time Tracking & Actual vs Estimated Comparison Card */}
              {currentTask && (
                <div className="mb-6">
                  <TaskTimerControl
                    taskName={currentTask.name}
                    estimatedMinutes={currentTask.estimated_minutes || 30}
                    log={currentLog}
                    isRunning={activeTimerTaskName === currentTask.name}
                    liveSeconds={activeTimerSeconds}
                    onStart={() => onStartTimer && onStartTimer(currentTask.name)}
                    onPause={() => onPauseTimer && onPauseTimer(currentTask.name)}
                    onReset={() => onResetTimer && onResetTimer(currentTask.name)}
                    onSetManualMinutes={(mins) => onSetManualMinutes && onSetManualMinutes(currentTask.name, mins)}
                    variant="focus"
                  />
                </div>
              )}

              {/* Detailed Instructions Box */}
              {currentTask.details && (
                <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-black/30 border border-white/10 text-slate-300 text-xs sm:text-sm leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Operational Requirements</span>
                  </div>
                  <p>{currentTask.details}</p>
                </div>
              )}

              {/* Inline Pending Reason Input (if active or previously stored) */}
              {isEditingReason || currentLog?.reason_for_pending ? (
                <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      Pending / Deferral Reason:
                    </span>
                    {!isEditingReason && (
                      <button
                        onClick={() => setIsEditingReason(true)}
                        className="text-[11px] underline text-amber-300 hover:text-white"
                      >
                        Edit Reason
                      </button>
                    )}
                  </div>
                  {isEditingReason ? (
                    <div className="space-y-2">
                      <textarea
                        value={reasonDraft}
                        onChange={(e) => setReasonDraft(e.target.value)}
                        placeholder="Explain why this high-priority task is pending or delayed..."
                        rows={2}
                        className="w-full px-3 py-2 bg-black/50 border border-amber-500/40 rounded-xl text-white placeholder-amber-400/40 focus:outline-none focus:border-amber-400"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setIsEditingReason(false)}
                          className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveReason}
                          disabled={isSavingReason}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                        >
                          {isSavingReason ? 'Saving...' : 'Save Reason'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-200 italic font-mono">
                      "{currentLog?.reason_for_pending}"
                    </p>
                  )}
                </div>
              ) : null}
            </div>

            {/* Bottom Actions: Big Complete Button & Queue Navigation */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Skip / Queue Navigation */}
              <div className="flex items-center gap-2">
                {sortedIncompleteTasks.length > 1 && (
                  <>
                    <button
                      type="button"
                      disabled={taskIndex === 0}
                      onClick={() => setTaskIndex((prev) => Math.max(0, prev - 1))}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-300 border border-white/10 transition-colors"
                      title="Previous incomplete task"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono text-slate-400 px-1">
                      {taskIndex + 1} / {sortedIncompleteTasks.length}
                    </span>
                    <button
                      type="button"
                      disabled={taskIndex >= sortedIncompleteTasks.length - 1}
                      onClick={() =>
                        setTaskIndex((prev) => Math.min(sortedIncompleteTasks.length - 1, prev + 1))
                      }
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-300 border border-white/10 transition-colors"
                      title="Next incomplete task in priority order"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {!isEditingReason && !currentLog?.reason_for_pending && (
                  <button
                    type="button"
                    onClick={() => setIsEditingReason(true)}
                    className="text-xs font-medium text-slate-400 hover:text-amber-300 transition-colors px-2 py-1"
                  >
                    + Add Pending Note
                  </button>
                )}
              </div>

              {/* Primary Action Button: Mark as Done */}
              <div className="flex items-center gap-3">
                {sortedIncompleteTasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setTaskIndex((prev) =>
                        prev >= sortedIncompleteTasks.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                  >
                    Skip for Now
                  </button>
                )}

                <button
                  id="btn-complete-focus-task"
                  type="button"
                  onClick={handleMarkDone}
                  disabled={isCompleting}
                  className="flex-1 sm:flex-initial px-6 sm:px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>{isCompleting ? 'Completing...' : 'Mark as Done'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Subtle Footer Status */}
      <footer className="px-6 py-3 text-center text-xs text-slate-500 border-t border-white/5">
        <span>Deep Focus Environment • Quantum Gazipur Cell Central Supervision</span>
      </footer>
    </div>
  );
};
