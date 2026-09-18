import React from 'react';
import { Sun, Moon, Monitor, LogIn, Target, Key, Menu } from 'lucide-react';
import { BranchId, Employee, SYSTEM_ROLES } from '../types';

interface HeaderProps {
  selectedDate: string;
  onDateChange: (newDate: string) => void;
  onDailyReset: () => void;
  onOpenTaskManager: () => void;
  onOpenSupabaseModal: () => void;
  onOpenPrintModal: () => void;
  onOpenLoginModal: () => void;
  onRajiSirSignIn?: () => void;
  onOpenCredentialsVault?: () => void;
  onOpenEmployeeManager: () => void;
  isSupabaseConnected: boolean;
  currentUser: Employee | null;
  viewMode: 'checklist' | 'supervisor' | 'common' | 'profile' | 'communication';
  onToggleViewMode: (mode: 'checklist' | 'supervisor' | 'common' | 'profile' | 'communication') => void;
  selectedBranch?: BranchId;
  onSelectBranch?: (branch: BranchId) => void;
  onOpenDeveloperConsole?: () => void;
  onOpenArchiveModal?: () => void;
  currentTheme?: 'light' | 'dark' | 'slate';
  onToggleTheme?: (theme: 'light' | 'dark' | 'slate') => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onDateChange,
  onDailyReset,
  onOpenTaskManager,
  onOpenSupabaseModal,
  onOpenPrintModal,
  onOpenLoginModal,
  onRajiSirSignIn,
  onOpenCredentialsVault,
  onOpenEmployeeManager,
  isSupabaseConnected,
  currentUser,
  viewMode,
  onToggleViewMode,
  selectedBranch = 'all',
  onSelectBranch,
  onOpenDeveloperConsole,
  onOpenArchiveModal,
  currentTheme = 'light',
  onToggleTheme,
  isFocusMode = false,
  onToggleFocusMode,
  onOpenMobileMenu,
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

  const isBoss = currentUser?.role === 'main_boss' || currentUser?.employee_id === 'RAJI_SIR';
  const isSupervisor = currentUser?.role === 'office_assistant' || isBoss;

  return (
    <header id="app-main-header" className="w-full border-b border-slate-200 bg-white shadow-2xs shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5">
        {/* Top row: Brand & Status & Sign In Controls */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          {/* Brand & Persona + Mobile Hamburger Toggle */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Mobile 3-line hamburger menu button */}
              <button
                id="mobile-hamburger-menu-btn"
                type="button"
                onClick={onOpenMobileMenu}
                aria-label="Open navigation menu"
                className="xl:hidden p-2 -ml-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-2xs flex items-center justify-center transition-colors cursor-pointer"
                title="মেনু ও সাইডবার খুলুন"
              >
                <Menu className="w-5 h-5 text-slate-800" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    Q
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                    Quantum Gazipur Cell
                  </h1>
                  {isBoss ? (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-200 shadow-2xs">
                      Raji Sir
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
                  <span>Daily Workflow &amp; Operational Management</span>
                </p>
              </div>
            </div>

            {/* Quick Mobile Action Icons */}
            <div className="flex items-center gap-1.5 xl:hidden">
              <button
                type="button"
                onClick={onOpenMobileMenu}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center gap-1.5 transition"
              >
                <Menu className="w-3.5 h-3.5" />
                <span>মেনু</span>
              </button>
            </div>
          </div>

          {/* User Account & Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Common Dashboard Button */}
            <button
              id="header-common-dashboard-btn"
              onClick={() => onToggleViewMode('common')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                viewMode === 'common'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
            >
              Common Dashboard
            </button>

            {/* 2. Unified Sign In Button */}
            <button
              id="header-sign-in-btn"
              onClick={onOpenLoginModal}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            {/* 3. Theme Toggle Controls */}
            <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200 text-xs">
              <button
                type="button"
                id="theme-btn-light"
                onClick={() => onToggleTheme?.('light')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  currentTheme === 'light'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Light Theme"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Light</span>
              </button>
              <button
                type="button"
                id="theme-btn-slate"
                onClick={() => onToggleTheme?.('slate')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  currentTheme === 'slate'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Slate Theme"
              >
                <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Slate</span>
              </button>
              <button
                type="button"
                id="theme-btn-dark"
                onClick={() => onToggleTheme?.('dark')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  currentTheme === 'dark'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Dark Theme"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Dark</span>
              </button>
            </div>

            {/* 4. Credentials Vault for Raji Sir / Authority */}
            {onOpenCredentialsVault && (isBoss || currentUser?.employee_id === 'DEV_ADMIN') && (
              <button
                id="header-credentials-vault-btn"
                onClick={onOpenCredentialsVault}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-2xs shadow-amber-500/20 flex items-center gap-1.5"
                title="সকল স্টাফের পাসওয়ার্ড দেখুন ও কপি করুন"
              >
                <Key className="w-3.5 h-3.5" />
                <span>পাসওয়ার্ড তালিকা</span>
              </button>
            )}

            {/* Active User Card & Switch Button */}
            <div className={`flex items-center gap-2 p-1 pl-2 rounded-xl border shadow-2xs ${
              isBoss ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] uppercase text-white shrink-0 shadow-xs ${
                  isBoss ? 'ring-2 ring-amber-400' : ''
                }`}
                style={{ backgroundColor: currentUser?.avatar_color || (isBoss ? '#f59e0b' : '#4f46e5') }}
              >
                {isBoss ? 'RS' : currentUser?.name ? currentUser.name.slice(0, 2) : 'EM'}
              </div>
              <div className="text-left pr-1">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-slate-800 max-w-[110px] truncate block">
                    {currentUser?.name || 'Sign In'}
                  </span>
                  <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-slate-200/80 text-slate-700 font-semibold">
                    {currentUser?.employee_id || 'ID'}
                  </span>
                </div>
              </div>

              <button
                id="switch-user-btn"
                onClick={onOpenLoginModal}
                title="Switch user or sign in"
                className="px-2 py-0.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200 transition-colors shadow-2xs"
              >
                Switch
              </button>
            </div>

            {/* Supabase Status Pill */}
            <button
              id="supabase-status-btn"
              onClick={onOpenSupabaseModal}
              title={
                isSupabaseConnected
                  ? 'Cloud Database Connected'
                  : 'Local Storage Mode. Click to configure credentials.'
              }
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isSupabaseConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              {isSupabaseConnected ? 'Cloud DB [Online]' : 'Local Cache [Active]'}
            </button>

            {/* Employee Manager (Accessible to Supervisor) */}
            {isSupervisor && (
              <button
                id="manage-employees-btn"
                onClick={onOpenEmployeeManager}
                className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
              >
                Staff List
              </button>
            )}

            {/* Task Template Manager */}
            {isSupervisor && (
              <button
                id="task-manager-btn"
                onClick={onOpenTaskManager}
                className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
              >
                Templates
              </button>
            )}

            {/* Developer Console launcher */}
            <button
              id="developer-console-btn"
              onClick={onOpenDeveloperConsole}
              title="Developer Console: Points & Data Management"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                currentUser?.role === 'developer'
                  ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
              }`}
            >
              Developer Console
            </button>

            {/* Database Archive & Previous Days Record Button */}
            <button
              id="header-database-archive-btn"
              onClick={onOpenArchiveModal}
              title="View saved database records from previous workdays"
              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors border border-indigo-200 shadow-2xs"
            >
              Database Archive
            </button>

            {/* Daily Reset button */}
            <button
              id="daily-reset-btn"
              onClick={onDailyReset}
              title="Reset today checklist"
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
            >
              Reset Checklist
            </button>

            {/* Focus Mode Quick Launcher */}
            {onToggleFocusMode && (
              <button
                id="header-toggle-focus-mode-btn"
                onClick={onToggleFocusMode}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 shadow-2xs ${
                  isFocusMode
                    ? 'bg-amber-500 text-slate-950 border-amber-600 ring-2 ring-amber-400'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                }`}
                title="Focus Mode: Hide all distractions and display only the highest-priority incomplete task"
              >
                <Target className="w-3.5 h-3.5 text-amber-600" />
                <span>Focus Mode</span>
              </button>
            )}

            {/* Print / Export Report */}
            <button
              id="print-export-btn"
              onClick={onOpenPrintModal}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all"
            >
              Report
            </button>
          </div>
        </div>

        {/* Middle row: Mode Switcher */}
        <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
            {/* Focus Mode Tab in Mode Switcher */}
            {onToggleFocusMode && (
              <button
                id="tab-focus-mode-view"
                onClick={onToggleFocusMode}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                  isFocusMode
                    ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400'
                    : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-300'
                }`}
                title="Focus Mode: Single-task deep focus on the highest-priority incomplete task"
              >
                <Target className="w-3.5 h-3.5 text-amber-600" />
                <span>Focus Mode</span>
                <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-950 font-black">
                  1-Task
                </span>
              </button>
            )}

            {/* For Supervisor / Raji Sir */}
            {isSupervisor && (
              <button
                id="tab-supervisor-view"
                onClick={() => onToggleViewMode('supervisor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'supervisor'
                    ? isBoss
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Supervisor Dashboard
              </button>
            )}

            {/* Common Dashboard mode tab */}
            <button
              id="tab-common-view"
              onClick={() => onToggleViewMode('common')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'common'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Common Summary Dashboard
            </button>

            {/* Employee Profile & Planner Workspace */}
            <button
              id="tab-profile-view"
              onClick={() => onToggleViewMode('profile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'profile'
                  ? 'bg-indigo-600 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Personal Profile &amp; Planner
            </button>

            {/* Checklist Mode */}
            <button
              id="tab-checklist-view"
              onClick={() => onToggleViewMode('checklist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'checklist'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isSupervisor ? 'Category Checklist' : 'Category Checklist Table'}
            </button>

            {/* Communication CRM Mode */}
            <button
              id="tab-communication-view"
              onClick={() => onToggleViewMode('communication')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'communication'
                  ? 'bg-sky-600 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Communication Head [CRM]
            </button>
          </div>

          {/* Office Filter for Boss */}
          {isBoss && onSelectBranch && viewMode === 'supervisor' && (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] text-slate-500 px-1 font-bold uppercase tracking-wider">Office Filter:</span>
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
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedBranch === 'chowrasta'
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                1. Gazipur Branch
              </button>
              <button
                type="button"
                onClick={() => onSelectBranch('rajbari')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedBranch === 'rajbari'
                    ? 'bg-white text-sky-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-sky-700'
                }`}
              >
                2. Gazipur Sadar Office
              </button>
            </div>
          )}
        </div>

        {/* Date Navigation Strip */}
        <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <button
              id="prev-day-btn"
              onClick={handlePrevDay}
              aria-label="Previous day"
              className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
            >
              [Prev Day]
            </button>

            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
                {formattedDisplay}
              </span>
            </div>

            <button
              id="next-day-btn"
              onClick={handleNextDay}
              aria-label="Next day"
              className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
            >
              [Next Day]
            </button>

            {!isToday ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                  Archived Record
                </span>
                <button
                  id="jump-today-btn"
                  onClick={handleGoToday}
                  className="text-xs px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-2xs"
                >
                  Return to Today
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] uppercase tracking-wider text-emerald-700 font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 ml-1">
                  Today [Active Workday]
                </span>
                <button
                  type="button"
                  onClick={handlePrevDay}
                  title="View yesterday's record"
                  className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold transition"
                >
                  Yesterday Record
                </button>
              </div>
            )}
          </div>

          {/* Quick Date Picker & Full Archive Vault Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenArchiveModal}
              title="Open full saved database archive"
              className="text-xs px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition shadow-2xs"
            >
              Database Archive Vault
            </button>

            <span className="text-xs font-semibold text-slate-500">Date:</span>
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
