import React, { useState } from 'react';
import { WorkflowTask, WORKFLOW_CATEGORIES, WorkflowCategory } from '../data/workflowData';
import { DailyLogItem } from '../types';

interface WorkflowTaskTableProps {
  tasks: WorkflowTask[];
  dailyLogs: Record<string, DailyLogItem>;
  onToggleStatus: (taskName: string) => void;
  onUpdateReason: (taskName: string, reason: string) => void;
  selectedCategory: string;
  viewDensity?: 'detailed' | 'compact';
  categories?: WorkflowCategory[];
}

const COMMON_REASONS = [
  'Awaiting client response',
  'Will be completed this afternoon',
  'Technical or system issue',
  'Awaiting supervisor approval',
  'Not applicable today',
];

export const WorkflowTaskTable: React.FC<WorkflowTaskTableProps> = ({
  tasks,
  dailyLogs,
  onToggleStatus,
  onUpdateReason,
  selectedCategory,
  categories = WORKFLOW_CATEGORIES,
}) => {
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

  const categoriesToShow =
    selectedCategory === 'ALL'
      ? categories
      : categories.filter((c) => c.id === selectedCategory);

  const totalVisibleTasks = tasks.length;

  return (
    <div id="workflow-task-table" className="bg-[#14161a] rounded-xl border border-white/10 shadow-xs overflow-hidden text-white">
      {/* Top Table Title & Expand/Collapse Controls */}
      <div className="px-5 py-3.5 bg-black/40 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Workflow &amp; Accountability Table{' '}
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30 ml-1 font-mono">
              ({totalVisibleTasks} Tasks Displayed)
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-table-expand-all"
            onClick={expandAll}
            className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
          >
            [Expand All]
          </button>
          <button
            type="button"
            id="btn-table-collapse-all"
            onClick={collapseAll}
            className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
          >
            [Collapse All]
          </button>
        </div>
      </div>

      {/* Main Table Structure */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header Row */}
          <thead>
            <tr className="bg-black/60 text-slate-400 font-bold border-b border-white/10 text-[11px] uppercase tracking-wider select-none">
              <th className="py-2.5 px-3 w-10 text-center">[Done]</th>
              <th className="py-2.5 px-2 w-12 text-center">No.</th>
              <th className="py-2.5 px-2.5 w-20">Code</th>
              <th className="py-2.5 px-3">Task Details</th>
              <th className="py-2.5 px-3 w-44 hidden md:table-cell">Category / Sector</th>
              <th className="py-2.5 px-3 w-28 text-center">Priority</th>
              <th className="py-2.5 px-3 w-28 text-center">Status</th>
              <th className="py-2.5 px-3 w-48 hidden lg:table-cell">Notes / Reason</th>
            </tr>
          </thead>

          {/* Table Body by Category Accordion */}
          <tbody className="divide-y divide-white/5">
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
                    className="bg-white/5 hover:bg-white/10 cursor-pointer border-y border-white/10 transition-colors select-none"
                  >
                    <td colSpan={8} className="py-2.5 px-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {isExpanded ? '[-]' : '[+]'}
                          </span>
                          <span className="font-extrabold text-xs sm:text-sm text-white">
                            {cat.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white/10 text-slate-300 border-white/10 font-mono">
                            {totalCount} Tasks
                          </span>
                        </div>

                        {/* Progress Tracker on the right */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
                            <span>Progress:</span>
                            <span className="font-mono text-indigo-400">
                              {doneCount}/{totalCount}
                            </span>
                            <div className="w-20 bg-white/10 h-1.5 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${catPercent}%` }}
                              />
                            </div>
                            <span className="text-slate-400 font-mono text-[10px] hidden sm:inline">
                              {catPercent}%
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                            {isExpanded ? '[Open]' : '[Closed]'}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Task Items under this Category */}
                  {isExpanded &&
                    categoryTasks.map((task) => {
                      const log = dailyLogs[task.name];
                      const isDone = log?.status === 'done';
                      const reason = log?.reason_for_pending || '';
                      const isReasonOpen = activeReasonInput === task.name;

                      return (
                        <tr
                          key={task.id}
                          className={`transition-colors ${
                            isDone
                              ? 'bg-emerald-950/20 hover:bg-emerald-950/30'
                              : 'bg-transparent hover:bg-white/5'
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
                                  : 'border-white/30 hover:border-white/60 bg-white/5 text-transparent'
                              }`}
                            >
                              X
                            </button>
                          </td>

                          {/* Serial Number */}
                          <td className="py-2.5 px-2 text-center font-mono text-slate-400 font-medium text-[11px]">
                            {task.order}
                          </td>

                          {/* Code ID */}
                          <td className="py-2.5 px-2.5 font-mono text-xs font-bold text-slate-300">
                            <span className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10">
                              {task.code}
                            </span>
                          </td>

                          {/* Task Name & Details */}
                          <td className="py-2.5 px-3">
                            <div className="cursor-pointer" onClick={() => onToggleStatus(task.name)}>
                              <div
                                className={`font-bold text-xs sm:text-sm tracking-tight transition-colors ${
                                  isDone ? 'text-slate-500 line-through' : 'text-white'
                                }`}
                              >
                                {task.name}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                                {task.details}
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
                              {cat.name}
                            </span>
                          </td>

                          {/* Priority Column */}
                          <td className="py-2.5 px-3 text-center">
                            {task.priority === 'high' ? (
                              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
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
