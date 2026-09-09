import React from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Printer,
  SlidersHorizontal,
  Database,
  Users,
  LayoutDashboard,
  CheckSquare,
  ArrowRightLeft,
  Crown,
  Building2,
  Landmark,
} from 'lucide-react';
import { BranchId, Employee, SYSTEM_ROLES } from '../types';

interface HeaderProps {
  selectedDate: string;
  onDateChange: (newDate: string) => void;
  onDailyReset: () => void;
  onOpenTaskManager: () => void;
  onOpenSupabaseModal: () => void;
  onOpenPrintModal: () => void;
  onOpenLoginModal: () => void;
  onOpenEmployeeManager: () => void;
  isSupabaseConnected: boolean;
  currentUser: Employee | null;
  viewMode: 'checklist' | 'supervisor';
  onToggleViewMode: (mode: 'checklist' | 'supervisor') => void;
  selectedBranch?: BranchId;
  onSelectBranch?: (branch: BranchId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onDateChange,
  onDailyReset,
  onOpenTaskManager,
  onOpenSupabaseModal,
  onOpenPrintModal,
  onOpenLoginModal,
  onOpenEmployeeManager,
  isSupabaseConnected,
  currentUser,
  viewMode,
  onToggleViewMode,
  selectedBranch = 'all',
  onSelectBranch,
}) => {
  const dateObj = new Date(`${selectedDate}T00:00:00`);
  const formattedDisplay = isNaN(dateObj.getTime())
    ? selectedDate
    : dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  const handlePrevDay = () => {
    const d = new Date(`${selectedDate}T00:00:00`);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(`${selectedDate}T00:00:00`);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleGoToday = () => {
    onDateChange(todayStr);
  };

  const roleDef = currentUser ? SYSTEM_ROLES.find((r) => r.id === currentUser.role) : null;
  const isBoss = currentUser?.role === 'main_boss' || currentUser?.employee_id === 'RAJI_SIR';
  const isSupervisor = currentUser?.role === 'office_assistant' || isBoss;

  return (
    <header className="w-full border-b border-slate-200 bg-white shadow-2xs shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5">
        {/* Top row: Brand & Status & User Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brand & Persona */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  Q
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Quantum Gazipur Cell
                </h1>
                {isBoss ? (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200 flex items-center gap-1 shadow-2xs">
                    <Crown className="w-3 h-3 text-amber-600" />
                    <span>Raji Sir • Central Director</span>
                  </span>
                ) : (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                    Gazipur Cell Team
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5 font-medium">
                <span className="text-slate-700 font-semibold">1. Gazipur Branch</span>
                <span>•</span>
                <span className="text-slate-700 font-semibold">2. Gazipur Sadar Office</span>
                <span>•</span>
                <span>Daily Workflow, Accountability & Executive Decisions</span>
              </p>
            </div>
          </div>

          {/* User Account & Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Active User Card & Switch Button */}
            <div className={`flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border shadow-2xs ${
              isBoss ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs uppercase text-white shrink-0 shadow-xs ${
                  isBoss ? 'ring-2 ring-amber-400' : ''
                }`}
                style={{ backgroundColor: currentUser?.avatar_color || (isBoss ? '#f59e0b' : '#4f46e5') }}
              >
                {isBoss ? '👑' : currentUser?.name ? currentUser.name.slice(0, 2) : 'EM'}
              </div>
              <div className="text-left pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 max-w-[130px] truncate block">
                    {currentUser?.name || 'Sign In'}
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-200/80 text-slate-700 font-semibold">
                    {currentUser?.employee_id || 'ID'}
                  </span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold inline-block mt-0.5">
                  {currentUser?.role === 'accounts' ? 'ACCOUNTS' : roleDef?.titleEn || 'Staff'}
                </span>
              </div>

              <button
                id="switch-user-btn"
                onClick={onOpenLoginModal}
                title="Switch user or sign in"
                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors shadow-2xs"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Supabase Status Pill */}
            <button
              id="supabase-status-btn"
              onClick={onOpenSupabaseModal}
              title={
                isSupabaseConnected
                  ? 'Supabase Database Connected'
                  : 'Supabase Offline (Using Local Cache). Click to configure.'
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isSupabaseConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseConnected ? 'Cloud DB' : 'Local Cache'}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSupabaseConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`}
              />
            </button>

            {/* Employee Manager (Accessible to Supervisor) */}
            {isSupervisor && (
              <button
                id="manage-employees-btn"
                onClick={onOpenEmployeeManager}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Staff Directory</span>
              </button>
            )}

            {/* Task Template Manager */}
            {isSupervisor && (
              <button
                id="task-manager-btn"
                onClick={onOpenTaskManager}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Task List</span>
              </button>
            )}

            {/* Daily Reset button */}
            <button
              id="daily-reset-btn"
              onClick={onDailyReset}
              title="Reset today's workflow checklist"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Reset</span>
            </button>

            {/* Print / Export Report */}
            <button
              id="print-export-btn"
              onClick={onOpenPrintModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs shadow-indigo-600/30 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Report</span>
            </button>
          </div>
        </div>

        {/* Middle row: Mode Switcher (For Boss or Supervisor) */}
        {isSupervisor && (
          <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => onToggleViewMode('supervisor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'supervisor'
                    ? isBoss
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isBoss ? <Crown className="w-3.5 h-3.5" /> : <LayoutDashboard className="w-3.5 h-3.5" />}
                <span>
                  {isBoss
                    ? '👑 Central Dashboard (Dual-Branch Overview)'
                    : 'Branch Dashboard (Comparative & AI)'}
                </span>
              </button>

              <button
                onClick={() => onToggleViewMode('checklist')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'checklist'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span>Workflow & Checklist</span>
              </button>
            </div>

            {/* Quick Branch Switcher in Header for Boss */}
            {isBoss && onSelectBranch && (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-500 px-1 font-bold uppercase tracking-wider">Office:</span>
                <button
                  type="button"
                  onClick={() => onSelectBranch('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedBranch === 'all'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Both Offices
                </button>
                <button
                  type="button"
                  onClick={() => onSelectBranch('chowrasta')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    selectedBranch === 'chowrasta'
                      ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  <Building2 className="w-3 h-3 text-emerald-600" />
                  <span>1. Gazipur Branch</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectBranch('rajbari')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    selectedBranch === 'rajbari'
                      ? 'bg-white text-sky-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-sky-700'
                  }`}
                >
                  <Landmark className="w-3 h-3 text-sky-600" />
                  <span>2. Gazipur Sadar</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Date Navigation Strip */}
        <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <button
              id="prev-day-btn"
              onClick={handlePrevDay}
              aria-label="Previous day"
              className="p-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
                {formattedDisplay}
              </span>
            </div>

            <button
              id="next-day-btn"
              onClick={handleNextDay}
              aria-label="Next day"
              className="p-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isToday ? (
              <button
                id="jump-today-btn"
                onClick={handleGoToday}
                className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold transition-colors"
              >
                Jump to Today
              </button>
            ) : (
              <span className="text-[11px] uppercase tracking-wider text-emerald-600 font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 ml-1">
                Today
              </span>
            )}
          </div>

          {/* Quick Date Picker input */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Select Date:</span>
            <input
              id="date-picker-input"
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && onDateChange(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
