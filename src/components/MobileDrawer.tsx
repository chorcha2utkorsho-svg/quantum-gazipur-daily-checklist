import React, { useEffect, useState } from 'react';
import {
  X,
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
  ChevronDown,
  Building2,
  Lock,
  HeartHandshake,
  LayoutGrid,
} from 'lucide-react';
import { BranchId, Employee, ViewMode } from '../types';
import { WorkflowCategory } from '../data/workflowData';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Employee | null;
  viewMode: ViewMode;
  onToggleViewMode: (mode: ViewMode) => void;
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
  categories?: WorkflowCategory[];
  onSelectCategory?: (categoryId: string) => void;
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
  categories = [],
  onSelectCategory,
}) => {
  // Accordion open states
  const [openSection, setOpenSection] = useState<'member' | 'tools' | 'admin' | null>('member');

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

  const handleNavigate = (mode: ViewMode) => {
    onToggleViewMode(mode);
    onClose();
  };

  const toggleSection = (sec: 'member' | 'tools' | 'admin') => {
    setOpenSection((prev) => (prev === sec ? null : sec));
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop overlay */}
      <div
        id="mobile-drawer-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs transition-opacity duration-300 animate-in fade-in"
        aria-hidden="true"
      />

      {/* Drawer Panel: Clean Crisp White Minimal Theme (Quantum Style) */}
      <div
        id="mobile-drawer-panel"
        className="relative z-10 w-[85%] max-w-xs sm:max-w-sm h-full bg-white text-slate-800 shadow-2xl flex flex-col justify-between border-r border-slate-200 animate-in slide-in-from-left duration-250 overflow-hidden"
      >
        {/* Drawer Header (Quantum Member Style) */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            {/* Quantum Sunburst Circular Glyph */}
            <div className="relative w-8 h-8 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shadow-2xs overflow-hidden">
              <div className="w-5 h-5 rounded-full border-2 border-sky-600 border-dashed animate-spin-slow flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-sky-700">Member</span>
              <span className="text-[10px] text-slate-400 font-normal">| Gazipur</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleViewMode('common')}
              title="Dashboard"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="mobile-drawer-close-btn"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-white">
          {/* 1. Member Profile Identification Header Card (Exact visual from image 2) */}
          <div className="flex flex-col items-center text-center pt-2 pb-3 border-b border-slate-100">
            {/* Minimalist Profile Silhouette Avatar */}
            <div className="relative mb-2">
              <div
                className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 shadow-2xs overflow-hidden"
                style={{ backgroundColor: currentUser ? '#f1f5f9' : '#f8fafc' }}
              >
                {/* SVG Silhouette matching image.png */}
                <svg
                  className="w-14 h-14 text-slate-300 mt-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              {currentUser && (
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {currentUser?.name || 'Jahid Hasan Akand'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {currentUser?.role === 'main_boss' || currentUser?.employee_id === 'RAJI_SIR'
                ? 'Provier / In-Charge'
                : 'Asst. Provier'}
            </p>
            <p className="text-xs font-semibold text-sky-700 mt-0.5">
              {currentUser?.branch === 'chowrasta' || currentUser?.employee_id?.startsWith('GB-')
                ? 'Gazipur Branch'
                : 'Gazipur Sadar Branch'}
            </p>

            {/* Quick Switch / Sign In link */}
            <button
              type="button"
              onClick={() => {
                onOpenLoginModal();
                onClose();
              }}
              className="mt-2 text-[11px] font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100"
            >
              <LogIn className="w-3 h-3" />
              <span>{currentUser ? 'Switch User (কর্মী পরিবর্তন)' : 'লগইন করুন'}</span>
            </button>
          </div>

          {/* 2. Quantum Essential Quick Action Tiles (Grid matching image 2) */}
          <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-0.5">
              দ্রুত সেবা ও কাজ (Shortcuts)
            </div>
            <div className="grid grid-cols-3 gap-2">
              {/* Tile 1: Heads Box */}
              <button
                type="button"
                onClick={() => handleNavigate('boxes')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all bg-white hover:bg-sky-50/50 shadow-2xs ${
                  viewMode === 'boxes' ? 'border-sky-500 ring-1 ring-sky-500 bg-sky-50/60' : 'border-slate-200/90'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-1">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-sky-700 leading-tight">Heads Box</span>
              </button>

              {/* Tile 2: Checklist (Checklist Table) */}
              <button
                type="button"
                onClick={() => handleNavigate('checklist')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all bg-white hover:bg-sky-50/50 shadow-2xs ${
                  viewMode === 'checklist' ? 'border-sky-500 ring-1 ring-sky-500 bg-sky-50/60' : 'border-slate-200/90'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-center mb-1">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-sky-700 leading-tight">Checklist</span>
              </button>

              {/* Tile 3: CRM / Calling */}
              <button
                type="button"
                onClick={() => handleNavigate('communication')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all bg-white hover:bg-sky-50/50 shadow-2xs ${
                  viewMode === 'communication' ? 'border-sky-500 ring-1 ring-sky-500 bg-sky-50/60' : 'border-slate-200/90'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-sky-700 leading-tight">Call CRM</span>
              </button>

              {/* Tile 4: Summary Dashboard */}
              <button
                type="button"
                onClick={() => handleNavigate('common')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all bg-white hover:bg-sky-50/50 shadow-2xs ${
                  viewMode === 'common' ? 'border-sky-500 ring-1 ring-sky-500 bg-sky-50/60' : 'border-slate-200/90'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-sky-700 leading-tight">Summary</span>
              </button>

              {/* Tile 5: Supervisor / Provier */}
              {isSupervisor && (
                <button
                  type="button"
                  onClick={() => handleNavigate('supervisor')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all bg-white hover:bg-sky-50/50 shadow-2xs ${
                    viewMode === 'supervisor' ? 'border-sky-500 ring-1 ring-sky-500 bg-sky-50/60' : 'border-slate-200/90'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-sky-700 leading-tight">Supervisor</span>
                </button>
              )}

              {/* Tile 6: Report Export */}
              <button
                type="button"
                onClick={() => {
                  onOpenPrintModal();
                  onClose();
                }}
                className="p-2.5 rounded-xl border border-slate-200/90 flex flex-col items-center justify-center text-center transition-all bg-white hover:bg-sky-50/50 shadow-2xs"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-1">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-sky-700 leading-tight">Report</span>
              </button>
            </div>
          </div>

          {/* 3. Accordion Style Navigation Menu (Exact Layout from image 1) */}
          <div className="space-y-1">
            {/* Section 1: Member Accordion (Open by default, blue tint) */}
            <div className="rounded-xl border border-sky-100 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('member')}
                className="w-full px-3.5 py-2.5 bg-sky-50/80 hover:bg-sky-100/70 text-sky-800 flex items-center justify-between text-xs font-bold transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-sky-600" />
                  <span>Member (সদস্য ও কাজ)</span>
                </div>
                {openSection === 'member' ? (
                  <ChevronDown className="w-4 h-4 text-sky-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-sky-600" />
                )}
              </button>

              {openSection === 'member' && (
                <div className="p-1.5 space-y-0.5 bg-white">
                  {/* All Heads Box */}
                  <button
                    type="button"
                    onClick={() => handleNavigate('boxes')}
                    className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-medium transition ${
                      viewMode === 'boxes'
                        ? 'bg-sky-50 text-sky-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-sky-500" />
                    <span>Heads (সকল হেড ও বক্স)</span>
                  </button>

                  {/* List */}
                  <button
                    type="button"
                    onClick={() => handleNavigate('checklist')}
                    className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-medium transition ${
                      viewMode === 'checklist'
                        ? 'bg-sky-50 text-sky-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>List (কাজের চেকলিস্ট)</span>
                  </button>

                  {/* Individual Categories/Heads list */}
                  {categories && categories.length > 0 && (
                    <div className="pt-1.5 mt-1.5 border-t border-slate-100 space-y-0.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-0.5">
                        কার্যক্রমের হেডসমূহ
                      </div>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            onSelectCategory?.(cat.id);
                            onClose();
                          }}
                          className="w-full px-3 py-1.5 rounded-lg flex items-center justify-between text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                        >
                          <span className="truncate">{cat.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                            {cat.taskCount}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Report */}
                  <button
                    type="button"
                    onClick={() => {
                      onOpenPrintModal();
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Report (প্রতিবেদন ও প্রিন্ট)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Item 2: Associate */}
            <button
              type="button"
              onClick={() => {
                onOpenEmployeeManager();
                onClose();
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-between text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <LayoutGrid className="w-4 h-4 text-slate-500" />
                <span>Associate (সহকর্মী ও পদবি)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Item 3: Burial Bequest / Matir Bank */}
            <button
              type="button"
              onClick={() => handleNavigate('profile')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-between text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <HeartHandshake className="w-4 h-4 text-slate-500" />
                <span>Burial Bequest / সেবা</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Item 4: Family / Branch */}
            <div className="rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs bg-white">
              <button
                type="button"
                onClick={() => toggleSection('tools')}
                className="w-full px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-between text-xs font-bold transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span>Family (শাখা নির্বাচন)</span>
                </div>
                {openSection === 'tools' ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {openSection === 'tools' && onSelectBranch && (
                <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => onSelectBranch('all')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                        selectedBranch === 'all'
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      সব শাখা
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectBranch('chowrasta')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                        selectedBranch === 'chowrasta'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      গাজীপুর
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectBranch('rajbari')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                        selectedBranch === 'rajbari'
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      সদর
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Item 5: Focus Mode (Optional utility) */}
            {onToggleFocusMode && (
              <button
                type="button"
                onClick={() => {
                  onToggleFocusMode();
                  onClose();
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-between text-xs font-bold transition cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <Target className="w-4 h-4 text-amber-500" />
                  <span>Deep Focus Mode</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                  {isFocusMode ? 'ACTIVE' : 'START'}
                </span>
              </button>
            )}

            {/* Item 6: Vault / Developer for Raji Sir */}
            {onOpenCredentialsVault && (isBoss || currentUser?.employee_id === 'DEV_ADMIN') && (
              <button
                type="button"
                onClick={() => {
                  onOpenCredentialsVault();
                  onClose();
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-100/50 text-amber-900 flex items-center justify-between text-xs font-bold transition cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <Key className="w-4 h-4 text-amber-600" />
                  <span>পাসওয়ার্ড ভল্ট (Vault)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-500" />
              </button>
            )}
          </div>
        </div>

        {/* Drawer Footer: Clean Minimalist Bottom Bar */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
          {/* Database sync status */}
          <button
            type="button"
            onClick={() => {
              onOpenSupabaseModal();
              onClose();
            }}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
            <span>{isSupabaseConnected ? 'Database Online' : 'Local Storage'}</span>
          </button>

          {/* Reset Today's Checklist */}
          <button
            type="button"
            onClick={() => {
              onDailyReset();
              onClose();
            }}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
            title="রিসেট করুন"
          >
            <RotateCcw className="w-3 h-3" />
            <span>রিসেট</span>
          </button>
        </div>
      </div>
    </div>
  );
};

