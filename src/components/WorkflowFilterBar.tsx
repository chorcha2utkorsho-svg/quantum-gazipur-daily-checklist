import React from 'react';
import { WORKFLOW_CATEGORIES, WorkflowCategory } from '../data/workflowData';

interface WorkflowFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (catId: string) => void;
  categoryCounts: Record<string, number>;
  totalTasks: number;
  onOpenNewTaskModal?: () => void;
  onOpenPrintModal?: () => void;
  onOpenAiInsightModal?: () => void;
  onResetDaily?: () => void;
  priorityFilter: 'all' | 'high' | 'medium' | 'low';
  onPriorityFilterChange: (p: 'all' | 'high' | 'medium' | 'low') => void;
  viewDensity: 'detailed' | 'compact';
  onViewDensityChange: (d: 'detailed' | 'compact') => void;
  categories?: WorkflowCategory[];
}

export const WorkflowFilterBar: React.FC<WorkflowFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categoryCounts,
  totalTasks,
  onOpenNewTaskModal,
  onOpenPrintModal,
  onOpenAiInsightModal,
  priorityFilter,
  onPriorityFilterChange,
  viewDensity,
  onViewDensityChange,
  categories = WORKFLOW_CATEGORIES,
}) => {
  return (
    <div id="workflow-filter-bar" className="bg-[#14161a] rounded-xl p-4 border border-white/10 shadow-xs space-y-3.5 text-white">
      {/* Top row: Search input & Action buttons */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 max-w-xl">
          <input
            type="text"
            id="input-task-search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search workflow tasks (e.g., Bill, Cash, SMS)..."
            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              [Clear]
            </button>
          )}
        </div>

        {/* Quick Tools & Add Task Button */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onOpenAiInsightModal && (
            <button
              type="button"
              id="btn-filter-ai-insight"
              onClick={onOpenAiInsightModal}
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-lg transition-all cursor-pointer"
              title="AI Strategic Insight"
            >
              AI Insights
            </button>
          )}

          <button
            type="button"
            id="btn-filter-all-wings"
            onClick={() => onCategoryChange('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              selectedCategory === 'ALL' && priorityFilter === 'all'
                ? 'bg-white text-slate-950 border-white'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            All Wings
          </button>

          <select
            id="select-priority-filter"
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value as any)}
            className="bg-black/40 text-slate-200 border border-white/10 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Priority: All</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {onOpenPrintModal && (
            <button
              type="button"
              id="btn-filter-print-report"
              onClick={onOpenPrintModal}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-lg border border-white/10 transition-all"
            >
              Print / Report
            </button>
          )}

          {onOpenNewTaskModal && (
            <button
              type="button"
              id="btn-filter-new-task"
              onClick={onOpenNewTaskModal}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all"
            >
              + New Task
            </button>
          )}
        </div>
      </div>

      {/* Middle row: Category filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
        {/* All Categories Pill */}
        <button
          type="button"
          id="pill-cat-all"
          onClick={() => onCategoryChange('ALL')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-white text-slate-950 shadow-xs'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
          }`}
        >
          All Categories ({totalTasks})
        </button>

        {/* Category Pills */}
        {categories.map((cat) => {
          const count = categoryCounts[cat.id] || cat.taskCount;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              id={`pill-cat-${cat.id}`}
              onClick={() => onCategoryChange(isSelected ? 'ALL' : cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Sub-row: Dropdown & View Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Category Filter:</span>
          <select
            id="select-category-dropdown"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-black/40 text-white font-medium px-2.5 py-1 rounded-md border border-white/10 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories ({totalTasks})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="font-semibold text-slate-300">Task View:</span>
          <div className="inline-flex p-0.5 rounded-lg bg-black/40 border border-white/10">
            <button
              type="button"
              id="btn-view-detailed"
              onClick={() => onViewDensityChange('detailed')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                viewDensity === 'detailed'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Detailed [Grid]
            </button>
            <button
              type="button"
              id="btn-view-compact"
              onClick={() => onViewDensityChange('compact')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                viewDensity === 'compact'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Compact [List]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
