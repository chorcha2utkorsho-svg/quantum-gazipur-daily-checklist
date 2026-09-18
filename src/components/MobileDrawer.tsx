import React, { useEffect } from 'react';
import {
  X,
  Menu,
  LogIn,
  Users,
  Calendar,
  Layers,
  CheckSquare,
  BarChart3,
  MessageSquare,
  Shield,
  Key,
  Database,
  FileText,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  Target,
  ChevronRight,
  Sparkles,
  Building2,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { BranchId, Employee } from '../types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Employee | null;
  viewMode: 'checklist' | 'supervisor' | 'common' | 'profile' | 'communication';
  onToggleViewMode: (mode: 'checklist' | 'supervisor' | 'common' | 'profile' | 'communication') => void;
  selectedBranch: BranchId;
  onSelectBranch?: (branch: BranchId) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenLoginModal: () => void;
  onOpenEmployeeManager: () => void;
  onOpenTaskManager: () => void;
  onOpenPrintModal: () => void;
  onOpenArchiveModal?: () => void;
  onOpenCredentialsVault?: () => void;
  onOpenDeveloperConsole?: () => void;
  onOpenSupabaseModal: () => void;
  onDailyReset: () => void;
  isSupabaseConnected: boolean;
  currentTheme?: 'light' | 'dark' | 'slate';
  onToggleTheme?: (theme: 'light' | 'dark' | 'slate') => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  viewMode,
  onToggleViewMode,
  selectedBranch,
  onSelectBranch,
  selectedDate,
  onDateChange,
  onOpenLoginModal,
  onOpenEmployeeManager,
  onOpenTaskManager,
  onOpenPrintModal,
  onOpenArchiveModal,
  onOpenCredentialsVault,
  onOpenDeveloperConsole,
  onOpenSupabaseModal,
  onDailyReset,
  isSupabaseConnected,
  currentTheme = 'light',
  onToggleTheme,
  isFocusMode = false,
  onToggleFocusMode,
}) => {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isBoss = currentUser?.role === 'main_boss' || currentUser?.employee_id === 'RAJI_SIR';
  const isSupervisor = currentUser?.role === 'office_assistant' || isBoss;

  const handleNavigate = (mode: 'checklist' | 'supervisor' | 'common' | 'profile' | 'communication') => {
    onToggleViewMode(mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop overlay */}
      <div
        id="mobile-drawer-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        id="mobile-drawer-panel"
        className="relative z-10 w-[85%] max-w-sm h-full bg-slate-900 text-white shadow-2xl flex flex-col justify-between border-r border-slate-800 animate-in slide-in-from-left duration-300 overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md">
              Q
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white leading-tight">
                Quantum Gazipur
              </h2>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">
                Menu &amp; Quick Access
              </span>
            </div>
          </div>

          <button
            id="mobile-drawer-close-btn"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
          {/* Active User Card & Switch Profile */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Current User (বর্তমান কর্মী)
              </span>
              <button
                type="button"
                onClick={() => {
                  onOpenLoginModal();
                  onClose();
                }}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Switch / Sign In</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-md shrink-0 ${
                  isBoss ? 'ring-2 ring-amber-400' : ''
                }`}
                style={{ backgroundColor: currentUser?.avatar_color || (isBoss ? '#f59e0b' : '#4f46e5') }}
              >
                {isBoss ? 'RS' : currentUser?.name ? currentUser.name.slice(0, 2) : 'EM'}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-sm font-black text-white truncate">
                    {currentUser?.name || 'Sign In'}
                  </h3>
                  {isBoss && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                      Raji Sir
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="font-mono text-[10px] bg-white/10 px-1.5 py-0.2 rounded">
                    {currentUser?.employee_id || 'GUEST'}
                  </span>
                  <span className="truncate">
                    {currentUser?.branch === 'chowrasta' ? 'Gazipur Branch' : currentUser?.branch === 'rajbari' ? 'Sadar Office' : 'Cell'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Primary View Modes */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1 block">
              Core Views (মূল পাতা)
            </span>

            {/* Checklist View */}
            <button
              id="drawer-nav-checklist"
              onClick={() => handleNavigate('checklist')}
              className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'checklist'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                <div className="text-left">
                  <span className="block font-bold">Category Checklist Table</span>
                  <span className="text-[10px] text-slate-400 block font-normal">দৈনিক কাজের তালিকা ও চেকলিস্ট</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            {/* Common Dashboard */}
            <button
              id="drawer-nav-common"
              onClick={() => handleNavigate('common')}
              className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'common'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <span className="block font-bold">Common Dashboard</span>
                  <span className="text-[10px] text-slate-400 block font-normal">সার্বিক পারফরম্যান্স সামারি</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            {/* Personal Profile & Workspace */}
            <button
              id="drawer-nav-profile"
              onClick={() => handleNavigate('profile')}
              className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'profile'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-teal-400" />
                <div className="text-left">
                  <span className="block font-bold">Personal Profile &amp; Planner</span>
                  <span className="text-[10px] text-slate-400 block font-normal">ব্যক্তিগত প্রোফাইল ও লক্ষ্যমাত্রা</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            {/* Supervisor Dashboard */}
            {isSupervisor && (
              <button
                id="drawer-nav-supervisor"
                onClick={() => handleNavigate('supervisor')}
                className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'supervisor'
                    ? isBoss
                      ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                      : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <span className="block font-bold">Supervisor Dashboard</span>
                    <span className="text-[10px] text-slate-400 block font-normal">তত্ত্বাবধায়ক ড্যাশবোর্ড ও লাইভ ফিড</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>
            )}

            {/* Communication CRM */}
            <button
              id="drawer-nav-communication"
              onClick={() => handleNavigate('communication')}
              className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'communication'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <div className="text-left">
                  <span className="block font-bold">Communication Head [CRM]</span>
                  <span className="text-[10px] text-slate-400 block font-normal">যোগাযোগ ও কল রেকর্ডার</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
          </div>

          {/* Office / Branch Filter */}
          {onSelectBranch && (
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1 block">
                Office Filter (শাখা নির্বাচন)
              </span>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10">
                <button
                  type="button"
                  onClick={() => onSelectBranch('all')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedBranch === 'all'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Both
                </button>
                <button
                  type="button"
                  onClick={() => onSelectBranch('chowrasta')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedBranch === 'chowrasta'
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  Gazipur
                </button>
                <button
                  type="button"
                  onClick={() => onSelectBranch('rajbari')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedBranch === 'rajbari'
                      ? 'bg-sky-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-sky-400'
                  }`}
                >
                  Sadar
                </button>
              </div>
            </div>
          )}

          {/* Quick Action Tools */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1 block">
              Management &amp; Tools (টুলস)
            </span>

            {/* Focus Mode */}
            {onToggleFocusMode && (
              <button
                id="drawer-toggle-focus-mode"
                onClick={() => {
                  onToggleFocusMode();
                  onClose();
                }}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  isFocusMode
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span>Deep Focus Mode</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10">
                  {isFocusMode ? 'ACTIVE' : 'START'}
                </span>
              </button>
            )}

            {/* Staff Manager */}
            {isSupervisor && (
              <button
                id="drawer-staff-list-btn"
                onClick={() => {
                  onOpenEmployeeManager();
                  onClose();
                }}
                className="w-full p-2.5 rounded-xl flex items-center gap-2.5 text-xs font-bold text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Staff Directory &amp; Roles</span>
              </button>
            )}

            {/* Task Template Manager */}
            {isSupervisor && (
              <button
                id="drawer-templates-btn"
                onClick={() => {
                  onOpenTaskManager();
                  onClose();
                }}
                className="w-full p-2.5 rounded-xl flex items-center gap-2.5 text-xs font-bold text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Task Templates</span>
              </button>
            )}

            {/* Password List Vault */}
            {onOpenCredentialsVault && (isBoss || currentUser?.employee_id === 'DEV_ADMIN') && (
              <button
                id="drawer-password-vault-btn"
                onClick={() => {
                  onOpenCredentialsVault();
                  onClose();
                }}
                className="w-full p-2.5 rounded-xl flex items-center gap-2.5 text-xs font-black text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
              >
                <Key className="w-4 h-4 text-amber-400" />
                <span>পাসওয়ার্ড তালিকা (Vault)</span>
              </button>
            )}

            {/* Database Archive */}
            {onOpenArchiveModal && (
              <button
                id="drawer-archive-vault-btn"
                onClick={() => {
                  onOpenArchiveModal();
                  onClose();
                }}
                className="w-full p-2.5 rounded-xl flex items-center gap-2.5 text-xs font-bold text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Database Archive Vault</span>
              </button>
            )}

            {/* Developer Console */}
            {onOpenDeveloperConsole && (
              <button
                id="drawer-dev-console-btn"
                onClick={() => {
                  onOpenDeveloperConsole();
                  onClose();
                }}
                className="w-full p-2.5 rounded-xl flex items-center gap-2.5 text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4 text-rose-400" />
                <span>Developer Console</span>
              </button>
            )}

            {/* Report Export */}
            <button
              id="drawer-report-btn"
              onClick={() => {
                onOpenPrintModal();
                onClose();
              }}
              className="w-full p-2.5 rounded-xl flex items-center gap-2.5 text-xs font-bold text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Print / Export Daily Report</span>
            </button>

            {/* Daily Reset */}
            <button
              id="drawer-reset-btn"
              onClick={() => {
                onDailyReset();
                onClose();
              }}
              className="w-full p-2.5 rounded-xl flex items-center gap-2.5 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/20 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Daily Checklist</span>
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
          {/* Theme Selector */}
          {onToggleTheme && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Theme:</span>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.05] border border-white/10">
                <button
                  type="button"
                  onClick={() => onToggleTheme('light')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentTheme === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Light Theme"
                >
                  <Sun className="w-4 h-4 text-amber-400" />
                </button>
                <button
                  type="button"
                  onClick={() => onToggleTheme('slate')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentTheme === 'slate' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Slate Theme"
                >
                  <Monitor className="w-4 h-4 text-indigo-400" />
                </button>
                <button
                  type="button"
                  onClick={() => onToggleTheme('dark')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentTheme === 'dark' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Dark Theme"
                >
                  <Moon className="w-4 h-4 text-indigo-300" />
                </button>
              </div>
            </div>
          )}

          {/* Database connection badge */}
          <button
            type="button"
            onClick={() => {
              onOpenSupabaseModal();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs cursor-pointer hover:bg-white/[0.08] transition"
          >
            <span className="flex items-center gap-2 text-slate-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Database Sync</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isSupabaseConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {isSupabaseConnected ? 'Online [Supabase]' : 'Local Storage'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
