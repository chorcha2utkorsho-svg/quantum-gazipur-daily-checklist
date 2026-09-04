import React from 'react';
import {
  Layers,
  ListChecks,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface WorkflowStatCardsProps {
  totalCategories: number;
  totalTasks: number;
  doneTasks: number;
  pendingTasks: number;
  remainingTasks: number;
  percentage: number;
}

export const WorkflowStatCards: React.FC<WorkflowStatCardsProps> = ({
  totalCategories,
  totalTasks,
  doneTasks,
  pendingTasks,
  remainingTasks,
  percentage,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {/* 1. ক্যাটাগরি (Purple theme) */}
      <div className="bg-white rounded-xl p-4 border border-purple-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">ক্যাটাগরি</span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {totalCategories} টি খাত
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Total Categories</p>
        </div>
      </div>

      {/* 2. মোট কাজ (Blue theme) */}
      <div className="bg-white rounded-xl p-4 border border-blue-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">মোট কাজ</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <ListChecks className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {totalTasks} টি টাস্ক
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">সকল কার্যতালিকার সমষ্টি</p>
        </div>
      </div>

      {/* 3. সম্পন্ন (Emerald theme) */}
      <div className="bg-white rounded-xl p-4 border border-emerald-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">সম্পন্ন</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
            {doneTasks} সম্পন্ন
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">সম্পূর্ণ কাজের সংখ্যা</p>
        </div>
      </div>

      {/* 4. অপেক্ষমান (Amber theme) */}
      <div className="bg-white rounded-xl p-4 border border-amber-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">অপেক্ষমান</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl font-black text-amber-700 tracking-tight">
            {pendingTasks} অপেক্ষমান
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">কার্যবিবরণী চলমান</p>
        </div>
      </div>

      {/* 5. বাকি রয়েছে (Slate theme) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">বাকি রয়েছে</span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            {remainingTasks} বাকি
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">অসম্পূর্ণ টাস্কের সংখ্যা</p>
        </div>
      </div>

      {/* 6. অগ্রগতি (Midnight Navy solid card from screenshot) */}
      <div className="rounded-xl p-4 border border-indigo-950 bg-[#171838] text-white shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-200">অগ্রগতি</span>
          <div className="w-8 h-8 rounded-lg bg-white/10 text-cyan-300 border border-white/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {percentage}%
          </div>
          <div className="w-full bg-white/15 h-2 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
