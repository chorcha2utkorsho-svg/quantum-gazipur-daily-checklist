import React from 'react';
import { WORKFLOW_CATEGORIES, WorkflowCategory } from '../data/workflowData';
import { Employee } from '../types';

interface WorkflowHeroBannerProps {
  currentUser: Employee | null;
  totalCategories: number;
  totalTasks: number;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  categories?: WorkflowCategory[];
}

export const WorkflowHeroBanner: React.FC<WorkflowHeroBannerProps> = ({
  currentUser,
  totalCategories,
  totalTasks,
  selectedCategory,
  onSelectCategory,
  categories = WORKFLOW_CATEGORIES,
}) => {
  const userName = currentUser?.name || 'Staff Member';
  const roleName = currentUser?.role === 'accounts' ? 'Accounts & Operational Workflow' : 'Operational Workflow';

  return (
    <div id="workflow-hero-banner" className="rounded-2xl p-5 sm:p-7 text-white shadow-xl border border-white/10 bg-[#14161a]">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        {/* Left: Titles and Description */}
        <div className="space-y-2.5 max-w-3xl">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            Category-Wise Workflow
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            {userName} — <span className="text-indigo-200">{roleName}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Structured daily operational management divided across{' '}
            <strong className="text-amber-300 font-semibold">{totalCategories} categories</strong>.{' '}
            Each category is organized into <strong className="text-amber-300 font-semibold">systematic sequential tasks</strong>.
          </p>

          <div className="pt-1 flex items-center gap-2 text-xs text-slate-400">
            <span className="text-[11px] font-medium text-slate-300">
              {currentUser?.branch === 'chowrasta'
                ? '1. Gazipur Branch'
                : currentUser?.branch === 'rajbari'
                ? '2. Gazipur Sadar Office'
                : 'Gazipur Cell'}
            </span>
            <span>•</span>
            <span className="text-[11px] text-slate-400 font-mono">{currentUser?.employee_id}</span>
          </div>
        </div>

        {/* Right Glass Card */}
        <div className="shrink-0 flex items-center justify-center">
          <div className="rounded-xl border border-white/15 bg-white/10 px-6 py-4 text-center min-w-[170px] shadow-lg">
            <p className="text-xs font-medium text-indigo-200 mb-0.5">Workflow Overview</p>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight my-1">
              {totalCategories} Sectors
            </div>
            <p className="text-xs text-slate-300 font-medium">
              {totalTasks} Total Tasks
            </p>
          </div>
        </div>
      </div>

      {/* Category Shortcut Cards Grid */}
      <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              id={`btn-cat-${cat.id}`}
              onClick={() => onSelectCategory(isSelected ? 'ALL' : cat.id)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-white/20 border-indigo-300 text-white shadow-md ring-1 ring-indigo-400'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-semibold">
                  SEC
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                  {cat.taskCount} tasks
                </span>
              </div>
              <div>
                <div className="font-bold text-xs truncate text-white">{cat.name}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{cat.description || cat.name}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
