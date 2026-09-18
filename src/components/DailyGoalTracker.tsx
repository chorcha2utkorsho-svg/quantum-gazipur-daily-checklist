import React, { useState } from 'react';
import { Target, CheckCircle2, Volume2, Sparkles, X, Settings2, Award, Flame } from 'lucide-react';
import {
  ProductivityGoalConfig,
  saveProductivityGoalConfig,
  DEFAULT_PRODUCTIVITY_THRESHOLD,
} from '../lib/productivityGoalTracker';
import { Employee } from '../types';

interface DailyGoalTrackerProps {
  currentUser: Employee | null;
  currentDone: number;
  totalTasks: number;
  currentPercentage: number;
  selectedDate: string;
  goalConfig: ProductivityGoalConfig;
  onUpdateGoalConfig: (newConfig: ProductivityGoalConfig) => void;
  className?: string;
  onOpenThresholdSettings?: () => void;
}

export const DailyGoalTracker: React.FC<DailyGoalTrackerProps> = ({
  currentUser,
  currentDone,
  totalTasks,
  currentPercentage,
  selectedDate,
  goalConfig,
  onUpdateGoalConfig,
  className = '',
  onOpenThresholdSettings,
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [thresholdInput, setThresholdInput] = useState<number>(goalConfig.thresholdValue);
  const [targetType, setTargetType] = useState<'percentage' | 'tasks_count'>(goalConfig.targetType);
  const [enableSound, setEnableSound] = useState<boolean>(goalConfig.enableAudioNotification);
  const [enableCelebration, setEnableCelebration] = useState<boolean>(goalConfig.enableCelebration);

  // Calculate target numbers
  const targetThreshold = goalConfig.thresholdValue;
  const isPercentage = goalConfig.targetType === 'percentage';

  const requiredTasks = isPercentage
    ? Math.ceil((targetThreshold / 100) * totalTasks)
    : Math.min(targetThreshold, totalTasks);

  const isGoalReached = isPercentage
    ? currentPercentage >= targetThreshold
    : currentDone >= targetThreshold;

  const tasksRemaining = Math.max(0, requiredTasks - currentDone);
  const progressRatio = requiredTasks > 0 ? Math.min(100, Math.round((currentDone / requiredTasks) * 100)) : 0;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    let sanitizedValue = thresholdInput;
    if (targetType === 'percentage') {
      sanitizedValue = Math.min(100, Math.max(10, thresholdInput || DEFAULT_PRODUCTIVITY_THRESHOLD));
    } else {
      sanitizedValue = Math.max(1, thresholdInput || 5);
    }

    const updated: ProductivityGoalConfig = {
      ...goalConfig,
      targetType,
      thresholdValue: sanitizedValue,
      enableAudioNotification: enableSound,
      enableCelebration,
    };

    onUpdateGoalConfig(updated);
    saveProductivityGoalConfig(updated);
    setIsConfigOpen(false);
  };

  return (
    <div
      id="daily-goal-tracker-card"
      className={`rounded-2xl border transition-all duration-300 p-4 sm:p-5 relative overflow-hidden ${
        isGoalReached
          ? 'bg-gradient-to-br from-emerald-950/70 via-slate-900 to-teal-950/70 border-emerald-500/50 shadow-lg shadow-emerald-950/40 text-white'
          : 'bg-[#14161a] border-white/10 text-white shadow-md'
      } ${className}`}
    >
      {/* Background ambient glow when achieved */}
      {isGoalReached && (
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="relative z-10 flex flex-col gap-4">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 ${
                isGoalReached
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 scale-105'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}
            >
              {isGoalReached ? <Award className="w-5 h-5" /> : <Target className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>দৈনিক লক্ষ্যমাত্রা (Daily Productivity Goal)</span>
                  {isGoalReached && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 shadow-xs">
                      <Sparkles className="w-3 h-3" /> অর্জিত (Reached)
                    </span>
                  )}
                </h4>
              </div>
              <p className="text-xs text-slate-300">
                {isGoalReached ? (
                  <span className="text-emerald-300 font-semibold">
                    অভিনন্দন! আপনি আজকের প্রত্যাশিত প্রোডাক্টিভিটি থ্রেশহোল্ড অতিক্রম করেছেন।
                  </span>
                ) : (
                  <span>
                    প্রত্যাশিত লক্ষ্য: <strong className="text-amber-300 font-bold">{isPercentage ? `${targetThreshold}%` : `${targetThreshold} Tasks`}</strong> সম্পন্নকরণ ({requiredTasks} টি কাজ)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onOpenThresholdSettings) {
                  onOpenThresholdSettings();
                } else {
                  setIsConfigOpen(!isConfigOpen);
                }
              }}
              title="লক্ষ্যমাত্রার থ্রেশহোল্ড পরিবর্তন করুন (Customize Goal Threshold)"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-semibold">লক্ষ্য পরিবর্তন</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Numerical Metrics */}
        <div className="space-y-2">
          <div className="flex items-end justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="text-slate-300">অগ্রগতি:</span>
              <span className="font-mono text-sm font-bold text-white">
                {currentDone} / {requiredTasks} কাজ সম্পন্ন
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                (মোট {totalTasks} কাজের মধ্যে)
              </span>
            </div>

            <div className="text-right font-mono">
              <span
                className={`text-sm font-black ${
                  isGoalReached ? 'text-emerald-400' : 'text-amber-300'
                }`}
              >
                {currentPercentage}%
              </span>
              <span className="text-[11px] text-slate-400 ml-1">
                / লক্ষ্য {isPercentage ? `${targetThreshold}%` : `${Math.round((requiredTasks / (totalTasks || 1)) * 100)}%`}
              </span>
            </div>
          </div>

          {/* Goal Progress Bar with Threshold Marker */}
          <div className="relative w-full h-3.5 rounded-full bg-black/40 border border-white/10 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-1 ${
                isGoalReached
                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                  : 'bg-gradient-to-r from-amber-600 to-amber-400'
              }`}
              style={{ width: `${Math.min(100, isPercentage ? currentPercentage : progressRatio)}%` }}
            >
              {progressRatio > 25 && (
                <span className="text-[9px] font-black text-slate-950 font-mono">
                  {currentPercentage}%
                </span>
              )}
            </div>

            {/* Threshold target marker line (if percentage) */}
            {isPercentage && targetThreshold < 100 && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-300 z-10 shadow-xs"
                style={{ left: `${targetThreshold}%` }}
                title={`Target Threshold: ${targetThreshold}%`}
              />
            )}
          </div>

          {/* Bottom helper text */}
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            {isGoalReached ? (
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>লক্ষ্যমাত্রা সফলভাবে অর্জিত হয়েছে! অতিরিক্ত কাজ সম্পন্ন করতে পারেন।</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-300">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  আজকের লক্ষ্যমাত্রা স্পর্শ করতে আর মাত্র <strong className="text-amber-300 font-bold">{tasksRemaining}</strong> টি কাজ সম্পন্ন করুন।
                </span>
              </div>
            )}

            <span className="text-[10px] text-slate-400 font-mono">
              {goalConfig.enableAudioNotification ? 'শব্দ সক্রিয় 🔔' : 'নীরব'}
            </span>
          </div>
        </div>

        {/* Inline Goal Configuration Form Popdown */}
        {isConfigOpen && (
          <form
            onSubmit={handleSaveSettings}
            className="mt-2 pt-3 border-t border-white/10 space-y-3 bg-black/40 p-3.5 rounded-xl animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-amber-400" />
                লক্ষ্যমাত্রা থ্রেশহোল্ড কনফিগার করুন (Threshold Settings)
              </span>
              <button
                type="button"
                onClick={() => setIsConfigOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  পরিমাপের ধরণ (Target Metric)
                </label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/15 text-white text-xs focus:border-amber-400 focus:outline-hidden"
                >
                  <option value="percentage">শতকরা হার (Percentage %)</option>
                  <option value="tasks_count">কাজের সংখ্যা (Task Count)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {targetType === 'percentage'
                    ? 'প্রত্যাশিত থ্রেশহোল্ড (%) (যেমন: 75% বা 80%)'
                    : 'প্রত্যাশিত কাজের সংখ্যা (যেমন: 8 বা 12)'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={targetType === 'percentage' ? 20 : 1}
                    max={targetType === 'percentage' ? 100 : totalTasks || 50}
                    value={thresholdInput}
                    onChange={(e) => setThresholdInput(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/15 text-white text-xs font-mono focus:border-amber-400 focus:outline-hidden"
                  />
                  {targetType === 'percentage' && (
                    <div className="flex gap-1">
                      {[70, 80, 90, 100].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setThresholdInput(preset)}
                          className={`px-1.5 py-1 rounded text-[10px] font-bold ${
                            thresholdInput === preset
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-white/10 text-slate-300 hover:bg-white/20'
                          }`}
                        >
                          {preset}%
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={enableSound}
                    onChange={(e) => setEnableSound(e.target.checked)}
                    className="rounded border-white/20 bg-slate-900 text-amber-500 focus:ring-0"
                  />
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>সাউন্ড নোটিফিকেশন</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={enableCelebration}
                    onChange={(e) => setEnableCelebration(e.target.checked)}
                    className="rounded border-white/20 bg-slate-900 text-amber-500 focus:ring-0"
                  />
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>কনফেটি অ্যানিমেশন</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-xs"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
