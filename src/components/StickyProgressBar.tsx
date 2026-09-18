import React from 'react';
import { DailySummaryStats } from '../types';
import { Target, Award } from 'lucide-react';

interface StickyProgressBarProps {
  stats: DailySummaryStats;
  currentFilter: 'all' | 'pending' | 'done';
  onFilterChange: (filter: 'all' | 'pending' | 'done') => void;
  goalThreshold?: number; // e.g. 80 for 80%
  isGoalReached?: boolean;
}

export const StickyProgressBar: React.FC<StickyProgressBarProps> = ({
  stats,
  currentFilter,
  onFilterChange,
  goalThreshold = 80,
  isGoalReached = false,
}) => {
  const isComplete = stats.percentage === 100 && stats.total > 0;
  const reachedGoal = isGoalReached || stats.percentage >= goalThreshold;

  return (
    <div id="sticky-progress-bar" className="sticky top-0 z-30 w-full bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/40 transition-all">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-4 bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-3">
          {/* Main Percentage Display & Goal Badge */}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
                {stats.percentage}%{' '}
                <span className="text-base sm:text-lg text-[#8e9299] font-normal">
                  Completion
                </span>
              </h2>

              {/* Goal threshold pill indicator */}
              <div
                className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold border transition-all ${
                  reachedGoal
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}
                title={`দৈনিক লক্ষ্যমাত্রা থ্রেশহোল্ড: ${goalThreshold}%`}
              >
                {reachedGoal ? (
                  <>
                    <Award className="w-3 h-3 text-emerald-400" />
                    <span>লক্ষ্য অর্জিত ({goalThreshold}%)</span>
                  </>
                ) : (
                  <>
                    <Target className="w-3 h-3 text-amber-400" />
                    <span>লক্ষ্য: {goalThreshold}%</span>
                  </>
                )}
              </div>

              {isComplete && (
                <span className="inline-flex items-center text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  All 100% Done
                </span>
              )}
            </div>
          </div>

          {/* Metrics & Filter Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 text-sm">
            {/* Counts */}
            <div className="flex items-center gap-6 sm:gap-8">
              <div className="text-center">
                <p className="text-[#8e9299] uppercase text-[10px] tracking-widest mb-0.5 font-medium">
                  Done
                </p>
                <p className="text-emerald-400 font-mono text-lg sm:text-xl font-medium">
                  {String(stats.done).padStart(2, '0')}
                </p>
              </div>

              <div className="text-center">
                <p className="text-[#8e9299] uppercase text-[10px] tracking-widest mb-0.5 font-medium">
                  Remaining
                </p>
                <p className="text-amber-400 font-mono text-lg sm:text-xl font-medium">
                  {String(stats.pending).padStart(2, '0')}
                </p>
              </div>

              <div className="text-center hidden sm:block">
                <p className="text-[#8e9299] uppercase text-[10px] tracking-widest mb-0.5 font-medium">
                  Total
                </p>
                <p className="text-[#e5e5e5] font-mono text-lg sm:text-xl font-medium">
                  {String(stats.total).padStart(2, '0')}
                </p>
              </div>
            </div>

            {/* Subtle Filter Tabs */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded border border-white/10">
              <button
                id="filter-all-btn"
                onClick={() => onFilterChange('all')}
                className={`px-2.5 py-1 rounded text-xs uppercase tracking-wider font-semibold transition-all ${
                  currentFilter === 'all'
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-[#8e9299] hover:text-[#e5e5e5]'
                }`}
              >
                All
              </button>
              <button
                id="filter-pending-btn"
                onClick={() => onFilterChange('pending')}
                className={`px-2.5 py-1 rounded text-xs uppercase tracking-wider font-semibold transition-all ${
                  currentFilter === 'pending'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-[#8e9299] hover:text-amber-400'
                }`}
              >
                Pending
              </button>
              <button
                id="filter-done-btn"
                onClick={() => onFilterChange('done')}
                className={`px-2.5 py-1 rounded text-xs uppercase tracking-wider font-semibold transition-all ${
                  currentFilter === 'done'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-[#8e9299] hover:text-emerald-400'
                }`}
              >
                Done
              </button>
            </div>
          </div>
        </div>

        {/* The Signature Glowing Progress Line with Goal Threshold Marker */}
        <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${
              reachedGoal
                ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)]'
                : 'bg-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
            }`}
            style={{ width: `${stats.percentage}%` }}
          />

          {/* Goal threshold indicator pin */}
          {goalThreshold > 0 && goalThreshold < 100 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 opacity-90 shadow-sm"
              style={{ left: `${goalThreshold}%` }}
              title={`Goal Threshold: ${goalThreshold}%`}
            />
          )}
        </div>
      </div>
    </div>
  );
};
