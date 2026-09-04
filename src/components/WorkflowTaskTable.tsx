import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Check,
  Clock,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Maximize2,
  Minimize2,
  FolderOpen,
} from 'lucide-react';
import { WorkflowCategory, WorkflowTask, WORKFLOW_CATEGORIES } from '../data/workflowData';
import { DailyLogItem } from '../types';

interface WorkflowTaskTableProps {
  tasks: WorkflowTask[];
  dailyLogs: Record<string, DailyLogItem>;
  onToggleStatus: (taskName: string) => void;
  onUpdateReason: (taskName: string, reason: string) => void;
  selectedCategory: string;
  viewDensity?: 'detailed' | 'compact';
}

const COMMON_REASONS = [
  'ক্লায়েন্ট উত্তরের অপেক্ষায়',
  'বিকেলে সম্পন্ন করা হবে',
  'টেকনিক্যাল বা সার্ভার জটিলতা',
  'উর্ধ্বতন অনুমোদনের অপেক্ষায়',
  'আজ প্রযোজ্য নয়',
];

export const WorkflowTaskTable: React.FC<WorkflowTaskTableProps> = ({
  tasks,
  dailyLogs,
  onToggleStatus,
  onUpdateReason,
  selectedCategory,
  viewDensity = 'detailed',
}) => {
  // Category expanded state (default all open)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'BILL WORK': true,
    'FUND': true,
    'DONATION': true,
    'PROGRAM-Sadak': true,
    'EXPLORATION': true,
    'PROGRAM-Gazidin': true,
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
    WORKFLOW_CATEGORIES.forEach((c) => {
      updated[c.id] = true;
    });
    setExpandedCategories(updated);
  };

  const collapseAll = () => {
    const updated: Record<string, boolean> = {};
    WORKFLOW_CATEGORIES.forEach((c) => {
      updated[c.id] = false;
    });
    setExpandedCategories(updated);
  };

  // Group tasks by category
  const categoriesToShow =
    selectedCategory === 'ALL'
      ? WORKFLOW_CATEGORIES
      : WORKFLOW_CATEGORIES.filter((c) => c.id === selectedCategory);

  const totalVisibleTasks = tasks.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Table Title & Expand/Collapse Controls */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
          <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
            ক্যাটাগরি ওয়ার্কফ্লো ও একাউন্টিং টেবিল{' '}
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 ml-1">
              ({totalVisibleTasks} টি কাজ প্রদর্শিত)
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Maximize2 className="w-3 h-3 text-slate-500" />
            <span>সব উন্মোচন [Expand All]</span>
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Minimize2 className="w-3 h-3 text-slate-500" />
            <span>সব সংক্ষেপ [Collapse All]</span>
          </button>
        </div>
      </div>

      {/* Main Table Structure */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header Row */}
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider select-none">
              <th className="py-2.5 px-3 w-10 text-center">✓</th>
              <th className="py-2.5 px-2 w-12 text-center">ক্রম</th>
              <th className="py-2.5 px-2.5 w-20">কোড (ID)</th>
              <th className="py-2.5 px-3">কাজের বিবরণ [TASK DETAILS]</th>
              <th className="py-2.5 px-3 w-40 hidden md:table-cell">কাজের ক্যাটাগরি / বিভাগ</th>
              <th className="py-2.5 px-3 w-28 text-center">অগ্রাধিকার</th>
              <th className="py-2.5 px-3 w-28 text-center">স্ট্যাটাস</th>
              <th className="py-2.5 px-3 w-48 hidden lg:table-cell">নোট / কারণ</th>
            </tr>
          </thead>

          {/* Table Body by Category Accordion */}
          <tbody className="divide-y divide-slate-100">
            {categoriesToShow.map((cat) => {
              const categoryTasks = tasks.filter((t) => t.category === cat.id);
              if (categoryTasks.length === 0) return null;

              const isExpanded = expandedCategories[cat.id] ?? true;
              const doneCount = categoryTasks.filter(
                (t) => dailyLogs[t.name]?.status === 'done'
              ).length;
              const totalCount = categoryTasks.length;
              const catPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

              return (
                <React.Fragment key={cat.id}>
                  {/* Category Accordion Header Row */}
                  <tr
                    onClick={() => toggleCategory(cat.id)}
                    className="bg-slate-50/90 hover:bg-slate-100 cursor-pointer border-y border-slate-200 transition-colors select-none"
                  >
                    <td colSpan={8} className="py-2.5 px-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="p-1 rounded text-slate-500 hover:text-slate-800"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          <FolderOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                            {cat.name}
                          </span>
                          <span className="text-slate-500 font-medium text-xs">
                            ({cat.nameBn})
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeBg} ${cat.badgeText} ${cat.badgeBorder}`}
                          >
                            {totalCount}টি টাস্ক
                          </span>
                        </div>

                        {/* Progress Tracker on the right */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                            <span>অগ্রগতি:</span>
                            <span className="font-mono text-indigo-700">
                              {doneCount}/{totalCount}
                            </span>
                            <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                                style={{ width: `${catPercent}%` }}
                              />
                            </div>
                            <span className="text-slate-400 font-mono text-[10px] hidden sm:inline">
                              {catPercent}%
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 hidden sm:inline">
                            {isExpanded ? 'সংক্ষেপ করুন' : 'সম্প্রসারণ করুন'}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Task Items under this Category */}
                  {isExpanded &&
                    categoryTasks.map((task, idx) => {
                      const log = dailyLogs[task.name];
                      const isDone = log?.status === 'done';
                      const reason = log?.reason_for_pending || '';
                      const isReasonOpen = activeReasonInput === task.name;

                      return (
                        <tr
                          key={task.id}
                          className={`group transition-colors ${
                            isDone
                              ? 'bg-emerald-50/20 hover:bg-emerald-50/40'
                              : 'bg-white hover:bg-slate-50/90'
                          }`}
                        >
                          {/* Checkbox Column */}
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => onToggleStatus(task.name)}
                              className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                isDone
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                  : 'border-slate-300 hover:border-indigo-500 bg-white'
                              }`}
                            >
                              {isDone && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                            </button>
                          </td>

                          {/* Serial Number */}
                          <td className="py-2.5 px-2 text-center font-mono text-slate-400 font-medium text-[11px]">
                            {task.order}
                          </td>

                          {/* Code ID (e.g. BW-01) */}
                          <td className="py-2.5 px-2.5 font-mono text-xs font-bold text-slate-700">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                              {task.code}
                            </span>
                          </td>

                          {/* Task Name & Details */}
                          <td className="py-2.5 px-3">
                            <div className="cursor-pointer" onClick={() => onToggleStatus(task.name)}>
                              <div
                                className={`font-bold text-xs sm:text-sm tracking-tight transition-colors ${
                                  isDone ? 'text-slate-500 line-through' : 'text-slate-900'
                                }`}
                              >
                                {task.name}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                {task.details}
                              </div>
                            </div>

                            {/* Inline Reason expansion on mobile or click */}
                            {!isDone && (isReasonOpen || reason) && (
                              <div className="mt-2 pt-2 border-t border-amber-100 bg-amber-50/60 p-2 rounded-lg text-xs">
                                <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-[11px] mb-1">
                                  <AlertCircle className="w-3 h-3 text-amber-600" />
                                  <span>পেন্ডিং থাকার কারণ:</span>
                                </div>
                                <input
                                  type="text"
                                  value={reason}
                                  onChange={(e) => onUpdateReason(task.name, e.target.value)}
                                  placeholder="কারণ লিখুন (যেমন: অনুমোদন পেন্ডিং)..."
                                  className="w-full px-2.5 py-1 text-xs bg-white border border-amber-200 rounded text-slate-800 focus:outline-none focus:border-amber-400"
                                />
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {COMMON_REASONS.map((chip) => (
                                    <button
                                      key={chip}
                                      type="button"
                                      onClick={() => onUpdateReason(task.name, chip)}
                                      className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                                        reason === chip
                                          ? 'bg-amber-600 text-white border-amber-600'
                                          : 'bg-white hover:bg-amber-100 text-amber-900 border-amber-200'
                                      }`}
                                    >
                                      {chip}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Category Column (Hidden on mobile) */}
                          <td className="py-2.5 px-3 hidden md:table-cell">
                            <span
                              className={`inline-block text-[11px] px-2 py-0.5 rounded-full border font-semibold ${cat.badgeBg} ${cat.badgeText} ${cat.badgeBorder}`}
                            >
                              {cat.name}
                            </span>
                          </td>

                          {/* Priority Column */}
                          <td className="py-2.5 px-3 text-center">
                            {task.priority === 'high' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                <span>উচ্চ [High]</span>
                              </span>
                            ) : task.priority === 'medium' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>মাঝারি [Med]</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                <span>সাধারণ [Low]</span>
                              </span>
                            )}
                          </td>

                          {/* Status Column */}
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => onToggleStatus(task.name)}
                              className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                                isDone
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              {isDone ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>সম্পন্ন</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  <span>পেন্ডিং ▼</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Notes / Reason Column (Hidden on smaller screens) */}
                          <td className="py-2.5 px-3 hidden lg:table-cell">
                            {isDone ? (
                              <span className="text-[11px] text-slate-400 italic">
                                সম্পন্ন {log?.completed_at ? new Date(log.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                {reason ? (
                                  <span
                                    onClick={() =>
                                      setActiveReasonInput(isReasonOpen ? null : task.name)
                                    }
                                    title={reason}
                                    className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded truncate max-w-[150px] cursor-pointer"
                                  >
                                    {reason}
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveReasonInput(isReasonOpen ? null : task.name)
                                    }
                                    className="text-[11px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 underline"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>কারণ যোগ করুন</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
