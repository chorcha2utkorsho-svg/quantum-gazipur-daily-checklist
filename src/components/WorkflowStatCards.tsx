import React from 'react';

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
    <div id="workflow-stat-cards" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {/* 1. Categories */}
      <div className="bg-[#14161a] rounded-xl p-4 border border-white/10 shadow-xs flex flex-col justify-between text-white">
        <span className="text-xs font-semibold text-slate-400">Categories</span>
        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {totalCategories} Sectors
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Total Categories</p>
        </div>
      </div>

      {/* 2. Total Tasks */}
      <div className="bg-[#14161a] rounded-xl p-4 border border-white/10 shadow-xs flex flex-col justify-between text-white">
        <span className="text-xs font-semibold text-slate-400">Total Tasks</span>
        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {totalTasks} Items
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Total assigned tasks</p>
        </div>
      </div>

      {/* 3. Completed */}
      <div className="bg-[#14161a] rounded-xl p-4 border border-white/10 shadow-xs flex flex-col justify-between text-white">
        <span className="text-xs font-semibold text-slate-400">Completed</span>
        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
            {doneTasks} Done
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Successfully completed</p>
        </div>
      </div>

      {/* 4. Pending */}
      <div className="bg-[#14161a] rounded-xl p-4 border border-white/10 shadow-xs flex flex-col justify-between text-white">
        <span className="text-xs font-semibold text-slate-400">Pending</span>
        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
            {pendingTasks} Pending
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting completion</p>
        </div>
      </div>

      {/* 5. Remaining */}
      <div className="bg-[#14161a] rounded-xl p-4 border border-white/10 shadow-xs flex flex-col justify-between text-white">
        <span className="text-xs font-semibold text-slate-400">Remaining</span>
        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl font-black text-slate-200 tracking-tight">
            {remainingTasks} Left
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">To be addressed</p>
        </div>
      </div>

      {/* 6. Overall Rate */}
      <div className="bg-[#14161a] rounded-xl p-4 border border-white/10 shadow-xs flex flex-col justify-between text-white">
        <span className="text-xs font-semibold text-slate-400">Overall Rate</span>
        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl font-black text-indigo-400 tracking-tight">
            {percentage}%
          </div>
          <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-indigo-500 h-1 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
