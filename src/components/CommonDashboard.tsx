import React from 'react';
import { Employee, EmployeeDailyProgress } from '../types';
import { getWorkflowForEmployee } from '../data/workflowData';

interface CommonDashboardProps {
  selectedDate: string;
  employees: Employee[];
  progressList: EmployeeDailyProgress[];
  currentUser: Employee | null;
  onOpenSignIn: () => void;
  onRajiSirSignIn: () => void;
  onOpenEmployeeSignUp: () => void;
  onSelectEmployee: (emp: Employee) => void;
  onGoToChecklist: () => void;
  onGoToSupervisor: () => void;
  onGoToCommunication?: () => void;
}

export const CommonDashboard: React.FC<CommonDashboardProps> = ({
  selectedDate,
  employees,
  progressList,
  currentUser,
  onOpenSignIn,
  onRajiSirSignIn,
  onOpenEmployeeSignUp,
  onSelectEmployee,
  onGoToChecklist,
  onGoToSupervisor,
  onGoToCommunication,
}) => {
  const isBoss = currentUser?.role === 'main_boss' || currentUser?.employee_id === 'RAJI_SIR';
  const isSupervisor = currentUser?.role === 'office_assistant' || isBoss;

  const safeEmployees = employees || [];
  const safeProgressList = progressList || [];

  // Active staff (excluding main boss and pending/rejected applicants)
  const activeEmployees = safeEmployees.filter(
    (e) => e.is_active && e.approval_status !== 'pending' && e.approval_status !== 'rejected'
  );
  const staffEmployees = activeEmployees.filter((e) => e.role !== 'main_boss' && e.employee_id !== 'RAJI_SIR');

  // Branch 1: Gazipur Branch (Chowrasta)
  const branch1Employees = staffEmployees.filter(
    (e) => e.branch === 'chowrasta' || e.employee_id.startsWith('GB-') || e.name.toLowerCase().includes('anjuman') || e.name.toLowerCase().includes('mustakim')
  );

  // Branch 2: Gazipur Sadar Office (Rajbari Road)
  const branch2Employees = staffEmployees.filter(
    (e) => !branch1Employees.some((b1) => b1.id === e.id)
  );

  // Calculate overall metrics
  const totalTasksSum = safeProgressList.reduce((acc, p) => acc + p.totalTasks, 0);
  const doneTasksSum = safeProgressList.reduce((acc, p) => acc + p.doneTasks, 0);
  const overallPercentage = totalTasksSum > 0 ? Math.round((doneTasksSum / totalTasksSum) * 100) : 0;

  // Branch 1 metrics
  const b1Progress = safeProgressList.filter((p) => branch1Employees.some((e) => e.employee_id === p.employee.employee_id));
  const b1Total = b1Progress.reduce((acc, p) => acc + p.totalTasks, 0);
  const b1Done = b1Progress.reduce((acc, p) => acc + p.doneTasks, 0);
  const b1Percentage = b1Total > 0 ? Math.round((b1Done / b1Total) * 100) : 0;

  // Branch 2 metrics
  const b2Progress = safeProgressList.filter((p) => branch2Employees.some((e) => e.employee_id === p.employee.employee_id));
  const b2Total = b2Progress.reduce((acc, p) => acc + p.totalTasks, 0);
  const b2Done = b2Progress.reduce((acc, p) => acc + p.doneTasks, 0);
  const b2Percentage = b2Total > 0 ? Math.round((b2Done / b2Total) * 100) : 0;

  return (
    <div id="common-dashboard-view" className="space-y-6">
      {/* 0. Notice Banner for Staff Registration */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-white">Notice for All Personnel:</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              Staff Registration &amp; Authorization
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            All personnel across Gazipur Branch and Gazipur Sadar Office can register via <strong>'Employee Sign Up'</strong> with full name, branch, custom Login ID, and 4-digit PIN. New accounts are submitted to Central Management (Raji Sir) for authorization before first login.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-notice-employee-signup"
            onClick={onOpenEmployeeSignUp}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
          >
            Employee Sign Up
          </button>
        </div>
      </div>

      {/* 1. Hero Banner */}
      <div className="rounded-3xl bg-[#14161a] border border-white/10 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                Central Operations Hub
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-semibold border border-white/10">
                Date: {selectedDate}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Quantum Gazipur Cell
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Integrated operations command center for Branch 1 (Gazipur Branch) and Branch 2 (Gazipur Sadar Office).
              Executive management oversees cross-branch activity, while staff members manage assigned daily workflows.
            </p>

            {/* Current Active User Feedback Pill */}
            {currentUser && (
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-300">
                <span>Active Account:</span>
                <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg border border-white/15">
                  {currentUser.name} ({isBoss ? 'Executive - Raji Sir' : 'Staff Member'})
                </span>
                {isSupervisor ? (
                  <button
                    id="btn-hero-go-supervisor"
                    onClick={onGoToSupervisor}
                    className="text-amber-300 hover:text-amber-200 underline font-semibold ml-2"
                  >
                    Supervisor Overview
                  </button>
                ) : (
                  <button
                    id="btn-hero-go-checklist"
                    onClick={onGoToChecklist}
                    className="text-emerald-300 hover:text-emerald-200 underline font-semibold ml-2"
                  >
                    My Checklist
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Access Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            {/* 1. Raji Sir Sign In Button */}
            <button
              type="button"
              id="hero-raji-sir-signin-btn"
              onClick={onRajiSirSignIn}
              className={`px-4 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all ${
                isBoss
                  ? 'bg-amber-400 text-slate-950 border-2 border-amber-300'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400'
              }`}
            >
              {isBoss ? 'Raji Sir (Active)' : 'Raji Sir Sign In'}
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* 2. Employee Sign Up */}
              <button
                type="button"
                id="hero-employee-signup-btn"
                onClick={onOpenEmployeeSignUp}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg transition-all"
                title="Register a new employee account"
              >
                Employee Sign Up
              </button>

              {/* 3. General Sign In */}
              <button
                type="button"
                id="hero-sign-in-btn"
                onClick={onOpenSignIn}
                className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-all border border-indigo-400/30"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Branch-Wise Daily Completion Summary Banner */}
      <div className="bg-[#14161a] border-2 border-emerald-500/40 rounded-2xl p-5 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/30 text-emerald-300 border border-emerald-500/50">
              Branch Daily Progress Summary
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-white mt-1 leading-snug">
            Gazipur Branch Progress: <span className="text-emerald-400 underline decoration-emerald-500/50">{b1Percentage}%</span> | Sadar Office Progress: <span className="text-sky-400 underline decoration-sky-500/50">{b2Percentage}%</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Gazipur Branch (Chowrasta): {b1Done}/{b1Total} completed ({b1Percentage}%) | Sadar Office (Rajbari): {b2Done}/{b2Total} completed ({b2Percentage}%)
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
          <div className="text-center px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-500/40 min-w-[110px]">
            <span className="text-[10px] text-emerald-300 block font-bold">Gazipur Branch</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{b1Percentage}%</span>
          </div>
          <div className="text-center px-4 py-2.5 rounded-xl bg-sky-900/40 border border-sky-500/40 min-w-[110px]">
            <span className="text-[10px] text-sky-300 block font-bold">Sadar Office</span>
            <span className="text-2xl font-black text-sky-400 font-mono">{b2Percentage}%</span>
          </div>
          {onGoToCommunication && (
            <button
              id="btn-summary-goto-crm"
              onClick={onGoToCommunication}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md"
              title="Open Calling CRM"
            >
              Calling CRM
            </button>
          )}
        </div>
      </div>

      {/* 3. Key Operational Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Personnel */}
        <div className="bg-[#14161a] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-2xs text-white">
          <div className="text-slate-400 text-xs font-semibold mb-2">
            Active Staff Count
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {staffEmployees.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Gazipur Branch ({branch1Employees.length}) + Sadar Office ({branch2Employees.length})
          </p>
        </div>

        {/* Metric 2: Total Defined Tasks */}
        <div className="bg-[#14161a] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-2xs text-white">
          <div className="text-slate-400 text-xs font-semibold mb-2">
            Today's Total Tasks
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-400 tracking-tight">
            {totalTasksSum > 0 ? totalTasksSum : 312}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Assigned workflow duties
          </p>
        </div>

        {/* Metric 3: Done Tasks */}
        <div className="bg-[#14161a] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-2xs text-white">
          <div className="text-slate-400 text-xs font-semibold mb-2">
            Tasks Completed
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
            {doneTasksSum}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Confirmed via checklist
          </p>
        </div>

        {/* Metric 4: Progress Percentage */}
        <div className="bg-[#14161a] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-2xs text-white">
          <div className="text-slate-400 text-xs font-semibold mb-2">
            Average Progress
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
            {overallPercentage}%
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Dual-Branch Hubs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch 1: Gazipur Branch (Chowrasta) */}
        <div className="bg-[#14161a] rounded-2xl border border-white/10 shadow-2xs overflow-hidden flex flex-col text-white">
          <div className="p-5 border-b border-white/10 bg-emerald-500/5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">1. Gazipur Branch</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Chowrasta Branch
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {branch1Employees.length} Dedicated Personnel | {b1Total > 0 ? b1Total : 124} Operational Tasks
              </p>
            </div>

            <div className="text-right">
              <div className="text-lg font-black text-emerald-400">{b1Percentage}%</div>
              <div className="text-[10px] text-slate-400 font-medium">
                {b1Done} / {b1Total > 0 ? b1Total : 124} Done
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/5 h-1.5">
            <div
              className="bg-emerald-500 h-1.5 transition-all duration-500"
              style={{ width: `${b1Percentage}%` }}
            />
          </div>

          {/* Branch Personnel Cards */}
          <div className="p-5 space-y-3 flex-1">
            {branch1Employees.map((emp) => {
              const wf = getWorkflowForEmployee(emp.employee_id, emp.name);
              const p = progressList.find((item) => item.employee.employee_id === emp.employee_id);
              const empDone = p?.doneTasks || 0;
              const empTotal = wf.tasks.length;
              const empPct = empTotal > 0 ? Math.round((empDone / empTotal) * 100) : 0;

              return (
                <div
                  key={emp.id}
                  className="p-4 rounded-xl border border-white/10 hover:border-emerald-500/40 bg-white/[0.02] hover:bg-emerald-500/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase text-white shrink-0 shadow-xs mt-0.5"
                      style={{ backgroundColor: emp.avatar_color || '#10b981' }}
                    >
                      {emp.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          {emp.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-semibold">
                          {emp.employee_id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {emp.notes || 'Branch operations and workflow'}
                      </p>
                      {/* Categories preview */}
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {empTotal} Tasks
                        </span>
                        {wf.categories.slice(0, 3).map((cat) => (
                          <span
                            key={cat.id}
                            className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10"
                          >
                            {cat.name}
                          </span>
                        ))}
                        {wf.categories.length > 3 && (
                          <span className="text-[9px] text-slate-400 font-bold">
                            +{wf.categories.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Progress */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <div className="text-right">
                      <div className="text-xs font-black text-white">{empPct}%</div>
                      <div className="text-[10px] text-slate-400">{empDone}/{empTotal} Done</div>
                    </div>
                    <button
                      type="button"
                      id={`btn-view-emp-${emp.employee_id}`}
                      onClick={() => onSelectEmployee(emp)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      View Tasks
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Branch 2: Gazipur Sadar Office (Rajbari Road) */}
        <div className="bg-[#14161a] rounded-2xl border border-white/10 shadow-2xs overflow-hidden flex flex-col text-white">
          <div className="p-5 border-b border-white/10 bg-sky-500/5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">2. Gazipur Sadar Office</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                  Rajbari Road
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {branch2Employees.length} Dedicated Personnel | {b2Total > 0 ? b2Total : 188} Operational Tasks
              </p>
            </div>

            <div className="text-right">
              <div className="text-lg font-black text-sky-400">{b2Percentage}%</div>
              <div className="text-[10px] text-slate-400 font-medium">
                {b2Done} / {b2Total > 0 ? b2Total : 188} Done
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/5 h-1.5">
            <div
              className="bg-sky-500 h-1.5 transition-all duration-500"
              style={{ width: `${b2Percentage}%` }}
            />
          </div>

          {/* Branch Personnel Cards */}
          <div className="p-5 space-y-3 flex-1">
            {branch2Employees.map((emp) => {
              const wf = getWorkflowForEmployee(emp.employee_id, emp.name);
              const p = progressList.find((item) => item.employee.employee_id === emp.employee_id);
              const empDone = p?.doneTasks || 0;
              const empTotal = wf.tasks.length;
              const empPct = empTotal > 0 ? Math.round((empDone / empTotal) * 100) : 0;

              return (
                <div
                  key={emp.id}
                  className="p-4 rounded-xl border border-white/10 hover:border-sky-500/40 bg-white/[0.02] hover:bg-sky-500/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase text-white shrink-0 shadow-xs mt-0.5"
                      style={{ backgroundColor: emp.avatar_color || '#0284c7' }}
                    >
                      {emp.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          {emp.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-semibold">
                          {emp.employee_id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {emp.notes || 'Sadar office operations and workflow'}
                      </p>
                      {/* Categories preview */}
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          {empTotal} Tasks
                        </span>
                        {wf.categories.slice(0, 3).map((cat) => (
                          <span
                            key={cat.id}
                            className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10"
                          >
                            {cat.name}
                          </span>
                        ))}
                        {wf.categories.length > 3 && (
                          <span className="text-[9px] text-slate-400 font-bold">
                            +{wf.categories.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Progress */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <div className="text-right">
                      <div className="text-xs font-black text-white">{empPct}%</div>
                      <div className="text-[10px] text-slate-400">{empDone}/{empTotal} Done</div>
                    </div>
                    <button
                      type="button"
                      id={`btn-view-emp-${emp.employee_id}`}
                      onClick={() => onSelectEmployee(emp)}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      View Tasks
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Central Directorate Card: Raji Sir */}
      <div className="p-6 rounded-3xl bg-[#14161a] border border-amber-500/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-sm shrink-0">
            EXEC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">Raji Sir</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black uppercase">
                Central Director
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Overall audit, executive directives, and cross-office coordination. Signing in as Raji Sir unlocks the supervisor audit console with live team status and progress reports.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            id="btn-goto-supervisor-dashboard"
            onClick={onGoToSupervisor}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all"
          >
            Open Supervisor Dashboard
          </button>
        </div>
      </div>

      {/* 5. Role Guidance & Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card A: Authority Privileges */}
        <div className="p-5 rounded-2xl bg-[#14161a] border border-white/10 shadow-2xs space-y-3 text-white">
          <div>
            <h4 className="text-sm font-bold text-white">Authority Role (Executive Overview)</h4>
            <p className="text-[11px] text-slate-400">For Raji Sir and In-Charges</p>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span><strong>Cross-Staff Activity Monitoring:</strong> View real-time progress percentages across all 5 staff members in both offices.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span><strong>Staff Task Inspection:</strong> Audit completed and pending tasks directly with detailed timestamps.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span><strong>Branch Filtering:</strong> Switch views seamlessly between Both Offices, Gazipur Branch, and Sadar Office.</span>
            </li>
          </ul>
        </div>

        {/* Card B: Employee Privileges */}
        <div className="p-5 rounded-2xl bg-[#14161a] border border-white/10 shadow-2xs space-y-3 text-white">
          <div>
            <h4 className="text-sm font-bold text-white">Employee Role (Workspace)</h4>
            <p className="text-[11px] text-slate-400">For all operational personnel</p>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Personalized Checklist:</strong> When signed in, employees only view their designated categories and daily task list.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Checkbox Completion:</strong> Checking off tasks immediately updates progress and archives completion state.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Dynamic Progress Tracking:</strong> Percentage bar updates dynamically with every checked item throughout the day.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
