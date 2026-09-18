import React from 'react';
import { Award, Sparkles, X, CheckCircle, ArrowRight, Volume2 } from 'lucide-react';
import { Employee } from '../types';
import { GoalAchievementRecord } from '../lib/productivityGoalTracker';

interface GoalReachedModalProps {
  achievement: GoalAchievementRecord | null;
  currentUser: Employee | null;
  onClose: () => void;
  onViewSummary?: () => void;
}

export const GoalReachedModal: React.FC<GoalReachedModalProps> = ({
  achievement,
  currentUser,
  onClose,
  onViewSummary,
}) => {
  if (!achievement) return null;

  const isPercentage = achievement.targetType === 'percentage';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="goal-reached-modal"
        className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-slate-900 via-[#13171f] to-slate-950 border-2 border-emerald-500/60 p-6 sm:p-7 shadow-2xl shadow-emerald-500/20 text-white overflow-hidden"
      >
        {/* Decorative Top Ambient Rays */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/20 blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          {/* Animated Glowing Icon Badge */}
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/30 flex items-center justify-center">
              <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center">
                <Award className="w-10 h-10 text-emerald-400 animate-bounce" />
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 font-mono">
              Productivity Goal Reached!
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white">
              অভিনন্দন, {currentUser?.name || 'কর্মী'}! 🎉
            </h2>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              আপনি আজকের জন্য নির্ধারিত প্রত্যাশিত প্রোডাক্টিভিটি থ্রেশহোল্ড সফলভাবে স্পর্শ করেছেন!
            </p>
          </div>

          {/* Key Metrics Pill Grid */}
          <div className="w-full grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-black/40 border border-white/10 text-left">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                অর্জিত হার (Rate)
              </span>
              <div className="text-xl font-black text-emerald-400 font-mono">
                {achievement.achievedPercentage}%
              </div>
              <span className="text-[10px] text-slate-400">
                লক্ষ্য ছিল {isPercentage ? `${achievement.thresholdValue}%` : `${achievement.thresholdValue} কাজ`}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                সম্পন্ন কাজ (Tasks)
              </span>
              <div className="text-xl font-black text-white font-mono">
                {achievement.achievedTasks} / {achievement.totalTasks}
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">
                থ্রেশহোল্ড অতিক্রম
              </span>
            </div>
          </div>

          {/* Uplifting message */}
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="text-left text-[11px] leading-snug">
              আপনার উচ্চ উৎপাদনশীলতা কোয়ান্টাম গাজীপুর সেল টিমের অগ্রগতিতে গুরুত্বপূর্ণ অবদান রাখছে।
            </span>
          </div>

          {/* Action buttons */}
          <div className="w-full pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs transition-all cursor-pointer"
            >
              কাজ চালিয়ে যান
            </button>

            {onViewSummary && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewSummary();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>প্রোফাইল সামারি</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
