import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Clock, Timer, Edit2, Check, X, Flame } from 'lucide-react';
import { DailyLogItem } from '../types';
import {
  formatSecondsToTimer,
  formatMinutes,
  compareActualVsEstimated,
} from '../utils/timeTracking';

interface TaskTimerControlProps {
  taskName: string;
  estimatedMinutes?: number;
  log?: DailyLogItem;
  isRunning: boolean;
  liveSeconds?: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSetManualMinutes?: (minutes: number) => void;
  variant?: 'table' | 'card' | 'compact' | 'focus';
}

export const TaskTimerControl: React.FC<TaskTimerControlProps> = ({
  taskName,
  estimatedMinutes = 30,
  log,
  isRunning,
  liveSeconds = 0,
  onStart,
  onPause,
  onReset,
  onSetManualMinutes,
  variant = 'table',
}) => {
  const [isEditingManual, setIsEditingManual] = useState(false);
  const [manualInput, setManualInput] = useState<string>('');

  // Total seconds accumulated so far
  const storedSeconds = log?.time_spent_seconds || 0;
  const currentTotalSeconds = isRunning ? liveSeconds : storedSeconds;

  // Actual minutes calculation
  const actualMinutes = isRunning
    ? Math.round((currentTotalSeconds / 60) * 10) / 10
    : log?.actual_minutes ?? (storedSeconds > 0 ? Math.round(storedSeconds / 60) : undefined);

  // Comparison object
  const comparison = compareActualVsEstimated(actualMinutes, estimatedMinutes);

  const handleOpenManualEdit = () => {
    setManualInput(actualMinutes ? String(actualMinutes) : String(estimatedMinutes));
    setIsEditingManual(true);
  };

  const handleSaveManualEdit = () => {
    const parsed = parseFloat(manualInput);
    if (!isNaN(parsed) && parsed >= 0 && onSetManualMinutes) {
      onSetManualMinutes(parsed);
    }
    setIsEditingManual(false);
  };

  // Compact row or card variant
  if (variant === 'card') {
    return (
      <div className="pt-2 border-t border-white/10 mt-2 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Timer button & status */}
          <div className="flex items-center gap-2">
            {isRunning ? (
              <button
                type="button"
                onClick={onPause}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs shadow-amber-500/20 active:scale-95 cursor-pointer"
                title="Pause active timer"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Timer</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onStart}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-xs ${
                  currentTotalSeconds > 0
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                }`}
                title="Start logging actual time for this task"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{currentTotalSeconds > 0 ? 'Resume Timer' : 'Start Timer'}</span>
              </button>
            )}

            {currentTotalSeconds > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                title="Reset logged time back to 0"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Right: Live counter or comparison */}
          <div className="flex items-center gap-2 font-mono text-xs">
            {isRunning ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                {formatSecondsToTimer(liveSeconds)}
              </span>
            ) : currentTotalSeconds > 0 ? (
              <span className="text-white font-semibold">
                Act: {formatMinutes(actualMinutes || 0)}
              </span>
            ) : (
              <span className="text-slate-400">Est: {estimatedMinutes}m</span>
            )}
          </div>
        </div>

        {/* Comparison Details Bar if time was spent */}
        {currentTotalSeconds > 0 && (
          <div className="flex items-center justify-between text-[11px] bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
            <span className="text-slate-400">
              Est: <strong className="text-slate-200">{estimatedMinutes}m</strong> vs Actual:{' '}
              <strong className="text-white">{formatMinutes(actualMinutes || 0)}</strong>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${comparison.badgeClass}`}>
              {comparison.label}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Focus View Variant
  if (variant === 'focus') {
    return (
      <div className="flex flex-col gap-3 p-4 bg-black/50 border border-white/10 rounded-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-300">Live Task Timer:</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            {isRunning ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-sm font-black animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                {formatSecondsToTimer(liveSeconds)}
              </span>
            ) : (
              <span className="text-sm font-bold text-slate-200">
                {currentTotalSeconds > 0
                  ? formatSecondsToTimer(currentTotalSeconds)
                  : `${estimatedMinutes}m target`}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              type="button"
              onClick={onPause}
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause Timer</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStart}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-xs ${
                currentTotalSeconds > 0
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{currentTotalSeconds > 0 ? 'Resume Timer' : 'Start Timer'}</span>
            </button>
          )}

          {currentTotalSeconds > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-rose-400 border border-white/10 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="Reset timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Est vs Actual comparison strip */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 font-mono">
          <span className="text-slate-400">
            Est Workload: <strong className="text-sky-300">{estimatedMinutes}m</strong>
          </span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${comparison.badgeClass}`}>
            {comparison.label}
          </span>
        </div>
      </div>
    );
  }

  // Standard Table Column Variant
  return (
    <div className="flex flex-col gap-1.5 py-0.5">
      {/* Top row: Button & Stopwatch Clock */}
      <div className="flex items-center justify-between gap-1.5">
        {/* Main Start / Pause Button */}
        {isRunning ? (
          <button
            type="button"
            id={`btn-pause-timer-${taskName.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={(e) => {
              e.stopPropagation();
              onPause();
            }}
            className="px-2 py-1 rounded-md text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-1 shadow-xs shadow-amber-500/20 active:scale-95 cursor-pointer shrink-0"
            title="Pause running timer & log time spent"
          >
            <Pause className="w-3 h-3 fill-current" />
            <span>Pause</span>
          </button>
        ) : (
          <button
            type="button"
            id={`btn-start-timer-${taskName.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer shrink-0 ${
              currentTotalSeconds > 0
                ? 'bg-indigo-600/90 hover:bg-indigo-500 text-white shadow-xs'
                : 'bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-xs hover:shadow-emerald-600/30'
            }`}
            title="Start timer for this task"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{currentTotalSeconds > 0 ? 'Resume' : 'Start Timer'}</span>
          </button>
        )}

        {/* Live Ticking Time or Logged Duration */}
        <div className="flex items-center gap-1 font-mono text-[11px] shrink-0">
          {isRunning ? (
            <span className="flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
              {formatSecondsToTimer(liveSeconds)}
            </span>
          ) : currentTotalSeconds > 0 ? (
            <span className="text-slate-200 font-semibold bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
              {formatMinutes(actualMinutes || 0)}
            </span>
          ) : (
            <span className="text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
              Est: {estimatedMinutes}m
            </span>
          )}

          {/* Quick Reset Button if time logged and not running */}
          {currentTotalSeconds > 0 && !isRunning && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
              title="Reset logged time"
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          )}

          {/* Manual Edit Button */}
          {onSetManualMinutes && !isRunning && !isEditingManual && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenManualEdit();
              }}
              className="p-1 text-slate-500 hover:text-indigo-300 transition-colors cursor-pointer"
              title="Enter time manually"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* Manual Input Inline Form */}
      {isEditingManual && (
        <div
          className="flex items-center gap-1 bg-black/60 p-1 rounded border border-indigo-500/40"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="number"
            min="0"
            step="1"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            className="w-14 px-1 py-0.5 bg-black text-white text-[11px] rounded border border-white/20 focus:outline-none focus:border-indigo-400 font-mono"
            placeholder="Mins"
            autoFocus
          />
          <span className="text-[10px] text-slate-400 font-mono">min</span>
          <button
            type="button"
            onClick={handleSaveManualEdit}
            className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded"
            title="Save"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setIsEditingManual(false)}
            className="p-1 text-slate-400 hover:bg-white/10 rounded"
            title="Cancel"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Est vs Actual comparison strip & Progress Bar */}
      {currentTotalSeconds > 0 ? (
        <div className="flex flex-col gap-1 mt-0.5">
          <div className="flex items-center justify-between text-[10px] font-mono leading-none">
            <span className="text-slate-400">
              Est: <strong className="text-slate-300">{estimatedMinutes}m</strong>
            </span>
            <span className={`px-1.5 py-0.2 rounded font-bold border ${comparison.badgeClass}`}>
              {comparison.label}
            </span>
          </div>

          {/* Mini Progress Track comparing actual vs estimated */}
          <div
            className="w-full bg-white/10 h-1 rounded-full overflow-hidden"
            title={`${comparison.percentage}% of estimated time`}
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                comparison.status === 'over_time'
                  ? 'bg-rose-500'
                  : comparison.status === 'faster'
                  ? 'bg-emerald-400'
                  : 'bg-sky-400'
              }`}
              style={{ width: `${Math.min(100, comparison.percentage)}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span>Target: {estimatedMinutes}m</span>
          <span className="text-slate-400 italic">Not started</span>
        </div>
      )}
    </div>
  );
};
