import React from 'react';
import {
  Layers,
  Sparkles,
  Receipt,
  Wallet,
  HeartHandshake,
  CalendarCheck,
  Compass,
  Home,
  Coins,
  FileCheck,
  Building2,
} from 'lucide-react';
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

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Receipt':
      return <Receipt className="w-4 h-4 text-blue-300" />;
    case 'Wallet':
      return <Wallet className="w-4 h-4 text-emerald-300" />;
    case 'HeartHandshake':
      return <HeartHandshake className="w-4 h-4 text-amber-300" />;
    case 'Home':
      return <Home className="w-4 h-4 text-cyan-300" />;
    case 'CalendarCheck':
      return <CalendarCheck className="w-4 h-4 text-violet-300" />;
    case 'Compass':
      return <Compass className="w-4 h-4 text-rose-300" />;
    case 'Sparkles':
      return <Sparkles className="w-4 h-4 text-yellow-300" />;
    case 'Coins':
      return <Coins className="w-4 h-4 text-amber-300" />;
    case 'FileCheck':
      return <FileCheck className="w-4 h-4 text-indigo-300" />;
    case 'Building2':
      return <Building2 className="w-4 h-4 text-teal-300" />;
    default:
      return <Layers className="w-4 h-4 text-indigo-300" />;
  }
};

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
    <div className="relative rounded-2xl overflow-hidden p-5 sm:p-7 text-white shadow-xl border border-indigo-900/40 bg-gradient-to-r from-[#171838] via-[#1a1b4b] to-[#10172a]">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        {/* Left: Titles and Description */}
        <div className="space-y-2.5 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Category-Wise Workflow</span>
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
          <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-md px-6 py-4 text-center min-w-[170px] shadow-lg">
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
      <div className="relative z-10 mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(isSelected ? 'ALL' : cat.id)}
              className={`p-3 rounded-xl border text-left transition-all relative group flex flex-col justify-between ${
                isSelected
                  ? 'bg-white/20 border-indigo-300 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] ring-1 ring-indigo-400'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="p-1.5 rounded-lg bg-white/10 shrink-0">
                  {getCategoryIcon(cat.iconName)}
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                  {cat.taskCount} tasks
                </span>
              </div>
              <div>
                <div className="font-bold text-xs truncate text-white">{cat.name}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{cat.nameBn}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
