import React from 'react';
import {
  Search,
  Plus,
  Printer,
  RotateCcw,
  Grid,
  List,
  SlidersHorizontal,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { WORKFLOW_CATEGORIES } from '../data/workflowData';

interface WorkflowFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (catId: string) => void;
  categoryCounts: Record<string, number>;
  totalTasks: number;
  onOpenNewTaskModal?: () => void;
  onOpenPrintModal?: () => void;
  onResetDaily?: () => void;
  priorityFilter: 'all' | 'high' | 'medium' | 'low';
  onPriorityFilterChange: (p: 'all' | 'high' | 'medium' | 'low') => void;
  viewDensity: 'detailed' | 'compact';
  onViewDensityChange: (d: 'detailed' | 'compact') => void;
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
  onResetDaily,
  priorityFilter,
  onPriorityFilterChange,
  viewDensity,
  onViewDensityChange,
}) => {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3.5">
      {/* Top row: Search input & Action buttons */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="কার্যতালিকা বা টাস্ক খুঁজুন (যেমন: BILL, Cash, SMS)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Tools & Add Task Button */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onCategoryChange('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              selectedCategory === 'ALL' && priorityFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            সকল উইং
          </button>

          <div className="relative inline-block">
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value as any)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1.5 pr-7 rounded-lg cursor-pointer focus:outline-none focus:border-indigo-500"
            >
              <option value="all">অগ্রাধিকার: সকল</option>
              <option value="high">উচ্চ অগ্রাধিকার [High]</option>
              <option value="medium">মাঝারি [Medium]</option>
              <option value="low">সাধারণ [Low]</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {onOpenPrintModal && (
            <button
              type="button"
              onClick={onOpenPrintModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>প্রিন্ট / রিপোর্ট</span>
            </button>
          )}

          {onOpenNewTaskModal && (
            <button
              type="button"
              onClick={onOpenNewTaskModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন টাস্ক</span>
            </button>
          )}
        </div>
      </div>

      {/* Middle row: Category filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
        {/* All Categories Pill */}
        <button
          type="button"
          onClick={() => onCategoryChange('ALL')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          সব ক্যাটাগরি ({totalTasks})
        </button>

        {/* 6 Category Pills matching the exact colors from image.png */}
        {WORKFLOW_CATEGORIES.map((cat) => {
          const count = categoryCounts[cat.id] || cat.taskCount;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(isSelected ? 'ALL' : cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                isSelected
                  ? cat.activeBg + ' shadow-xs border-transparent'
                  : `${cat.badgeBg} ${cat.badgeText} ${cat.badgeBorder} hover:opacity-90`
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-black/20 text-white' : 'bg-white/80 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Sub-row: Dropdown & View Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">দৈনিক ফিল্টার:</span>
          <div className="relative inline-block">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium px-2.5 py-1 pr-6 rounded-md border border-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">সকল ক্যাটাগরি ({totalTasks})</option>
              {WORKFLOW_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.nameBn})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="font-semibold text-slate-600">টাস্ক ভিউ:</span>
          <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => onViewDensityChange('detailed')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                viewDensity === 'detailed'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Grid className="w-3 h-3" />
              <span>বিস্তারিত [Grid]</span>
            </button>
            <button
              type="button"
              onClick={() => onViewDensityChange('compact')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                viewDensity === 'compact'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3 h-3" />
              <span>কমপ্যাক্ট</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
