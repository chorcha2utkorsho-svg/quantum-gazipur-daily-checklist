import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  MoreVertical,
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
  ChevronLeft,
  ChevronDown,
  X,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { BranchId, Employee, ViewMode } from '../types';

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
  viewMode: ViewMode;
  onToggleViewMode: (mode: ViewMode) => void;
  selectedBranch?: BranchId;
  onSelectBranch?: (branch: BranchId) => void;
  onOpenDeveloperConsole?: () => void;
  onOpenArchiveModal?: () => void;
  currentTheme?: 'light' | 'dark' | 'slate';
  onToggleTheme?: (theme: 'light' | 'dark' | 'slate') => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  onOpenMobileMenu?: () => void;
  onOpenExcelImport?: () => void;
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
  onOpenExcelImport,
}) => {
  const [isKebabOpen, setIsKebabOpen] = useState(false);
  const kebabRef = useRef<HTMLDivElement>(null);

  // Close kebab dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (kebabRef.current && !kebabRef.current.contains(event.target as Node)) {
        setIsKebabOpen(false);
      }
    };
    if (isKebabOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isKebabOpen]);

  const dateObj = new Date(`${selectedDate}T00:00:00`);
  const formattedDate = isNaN(dateObj.getTime())
    ? selectedDate
    : dateObj.toLocaleDateString('bn-BD', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
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

  const isBoss = currentUser?.role === 'main_boss' || currentUser?.employee_id === 'RAJI_SIR';
  const isSupervisor = currentUser?.role === 'office_assistant' || isBoss;

  return (
    <header id="app-main-header" className="w-full border-b border-slate-200 bg-white shadow-2xs shrink-0 relative z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        {/* Exact Layout matching Hand-Drawn Sketch (Image 3):
            Left: 3 lines (☰)
            Center: Heading (User name, role & branch)
            Right: 3 dots (⋮)
        */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: 3-lines Hamburger Menu Button (Opens Drawer Sidebar) */}
          <div className="flex items-center gap-2">
            <button
              id="header-hamburger-menu-btn"
              type="button"
              onClick={onOpenMobileMenu}
              aria-label="Open navigation sidebar"
              className="p-2 sm:p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs transition-colors cursor-pointer flex items-center justify-center"
              title="সাইডবার মেনু খুলুন (৩টি লাইন)"
            >
              <Menu className="w-5 h-5 text-slate-800" />
            </button>

            {/* Quick All Heads return icon button (if in a specific head or view) */}
            {viewMode !== 'boxes' && (
              <button
                type="button"
                onClick={() => onToggleViewMode('boxes')}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition"
                title="সব হেড ও বক্সে ফিরে যান"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>সব বক্স</span>
              </button>
            )}
          </div>

          {/* Center: Heading as sketched in Image 3 */}
          <div className="flex-1 text-center px-1 min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-slate-900 truncate">
              {currentUser?.name || 'Jahid Hasan Akand'}
            </h1>
            <div className="flex items-center justify-center flex-wrap gap-1.5 text-[11px] sm:text-xs text-slate-500 font-medium">
              <span className="text-sky-700 font-semibold truncate">
                {currentUser?.branch === 'chowrasta' || currentUser?.employee_id?.startsWith('GB-')
                  ? 'গাজীপুর শাখা (চৌরাস্তা)'
                  : 'গাজীপুর সদর অফিস (রাজবাড়ী রোড)'}
              </span>
              <span>•</span>
              <span className="text-slate-600">
                {isBoss
                  ? 'Provier / In-Charge'
                  : currentUser?.role === 'office_assistant'
                  ? 'অফিস সহকারী'
                  : 'Asst. Provier'}
              </span>
              <span>•</span>
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                isToday
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {formattedDate} {isToday ? '(আজ)' : ''}
              </span>
            </div>
          </div>

          {/* Right: 3-dots Kebab Menu Button (Opens Options Popover) */}
          <div className="relative" ref={kebabRef}>
            <button
              id="header-kebab-options-btn"
              type="button"
              onClick={() => setIsKebabOpen((prev) => !prev)}
              aria-label="More options"
              className={`p-2 sm:p-2.5 rounded-xl border shadow-2xs transition-all cursor-pointer flex items-center justify-center ${
                isKebabOpen
                  ? 'bg-sky-600 text-white border-sky-700'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
              }`}
              title="আরও অপশন (৩টি ডট)"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* 3-dots Kebab Options Dropdown Menu */}
            {isKebabOpen && (
              <div
                id="header-kebab-menu-dropdown"
                className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 divide-y divide-slate-100 text-xs"
              >
                {/* Section 1: User Profile & Switch */}
                <div className="p-3 bg-slate-50/70">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs uppercase text-white shadow-2xs"
                        style={{ backgroundColor: currentUser?.avatar_color || '#0284c7' }}
                      >
                        {currentUser?.name ? currentUser.name.slice(0, 2) : 'JH'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 line-clamp-1">
                          {currentUser?.name || 'Jahid Hasan Akand'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ID: {currentUser?.employee_id || 'GB-01'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsKebabOpen(false);
                        onOpenLoginModal();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200 transition shadow-2xs"
                    >
                      পরিবর্তন
                    </button>
                  </div>

                  {/* Password Vault for Boss */}
                  {onOpenCredentialsVault && (isBoss || currentUser?.employee_id === 'DEV_ADMIN') && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsKebabOpen(false);
                        onOpenCredentialsVault();
                      }}
                      className="w-full mt-2.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center justify-between transition"
                    >
                      <div className="flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-amber-600" />
                        <span>স্টাফ পাসওয়ার্ড তালিকা</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                    </button>
                  )}
                </div>

                {/* Section 2: Date Navigation & Archive */}
                <div className="p-3 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    তারিখ ও রেকর্ড
                  </div>

                  <div className="flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevDay}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                      title="পূর্বের দিন"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDateChange(todayStr)}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center border transition ${
                        isToday
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      {isToday ? '✓ আজকের দিন' : 'আজকের দিনে যান'}
                    </button>

                    <button
                      type="button"
                      onClick={handleNextDay}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                      title="পরের দিন"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => onDateChange(e.target.value)}
                      className="flex-1 px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setIsKebabOpen(false);
                        onOpenArchiveModal?.();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold border border-sky-200 text-[11px] transition"
                    >
                      আর্কাইভ
                    </button>
                  </div>
                </div>

                {/* Section 3: Views & Navigation */}
                <div className="p-2 space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    ভিউ নির্বাচন (Views)
                  </div>

                  {/* All Heads Grid (Default View as sketched) */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsKebabOpen(false);
                      onToggleViewMode('boxes');
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between font-semibold transition ${
                      viewMode === 'boxes'
                        ? 'bg-sky-50 text-sky-800 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-sky-600" />
                      <span>সব হেড ও বক্স (Heads Grid)</span>
                    </div>
                    {viewMode === 'boxes' && <Check className="w-4 h-4 text-sky-600" />}
                  </button>

                  {/* Full Checklist Table View */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsKebabOpen(false);
                      onToggleViewMode('checklist');
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between font-semibold transition ${
                      viewMode === 'checklist'
                        ? 'bg-sky-50 text-sky-800 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-slate-500" />
                      <span>পুরো চেকলিস্ট টেবিল (Table View)</span>
                    </div>
                    {viewMode === 'checklist' && <Check className="w-4 h-4 text-sky-600" />}
                  </button>

                  {/* Common Dashboard */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsKebabOpen(false);
                      onToggleViewMode('common');
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between font-semibold transition ${
                      viewMode === 'common'
                        ? 'bg-sky-50 text-sky-800 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-amber-500" />
                      <span>কমন ড্যাশবোর্ড (Summary)</span>
                    </div>
                    {viewMode === 'common' && <Check className="w-4 h-4 text-sky-600" />}
                  </button>

                  {/* Profile & Planner */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsKebabOpen(false);
                      onToggleViewMode('profile');
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between font-semibold transition ${
                      viewMode === 'profile'
                        ? 'bg-sky-50 text-sky-800 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span>ব্যক্তিগত প্ল্যানার ও ইভেন্ট</span>
                    </div>
                    {viewMode === 'profile' && <Check className="w-4 h-4 text-sky-600" />}
                  </button>

                  {/* Calling CRM */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsKebabOpen(false);
                      onToggleViewMode('communication');
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between font-semibold transition ${
                      viewMode === 'communication'
                        ? 'bg-sky-50 text-sky-800 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-500" />
                      <span>কলিং সিআরএম (Call CRM)</span>
                    </div>
                    {viewMode === 'communication' && <Check className="w-4 h-4 text-sky-600" />}
                  </button>

                  {/* Supervisor Dashboard */}
                  {isSupervisor && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsKebabOpen(false);
                        onToggleViewMode('supervisor');
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between font-semibold transition ${
                        viewMode === 'supervisor'
                          ? 'bg-sky-50 text-sky-800 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-rose-500" />
                        <span>সুপারভাইজার ড্যাশবোর্ড</span>
                      </div>
                      {viewMode === 'supervisor' && <Check className="w-4 h-4 text-sky-600" />}
                    </button>
                  )}
                </div>

                {/* Section 4: System Tools */}
                <div className="p-2 space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    টুলস ও ব্যবস্থাপনা
                  </div>

                  {/* Focus Mode */}
                  {onToggleFocusMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsKebabOpen(false);
                        onToggleFocusMode();
                      }}
                      className="w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-slate-700 hover:bg-slate-50 font-semibold transition"
                    >
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-amber-500" />
                        <span>১-টাস্ক ফোকাস মোড</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                        {isFocusMode ? 'ACTIVE' : 'START'}
                      </span>
                    </button>
                  )}

                  {/* Print Report */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsKebabOpen(false);
                      onOpenPrintModal();
                    }}
                    className="w-full px-2.5 py-2 rounded-xl flex items-center gap-2 text-slate-700 hover:bg-slate-50 font-semibold transition"
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>প্রিন্ট ও রিপোর্ট এক্সপোর্ট</span>
                  </button>

                  {/* Staff List for Supervisor */}
                  {isSupervisor && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsKebabOpen(false);
                        onOpenEmployeeManager();
                      }}
                      className="w-full px-2.5 py-2 rounded-xl flex items-center gap-2 text-slate-700 hover:bg-slate-50 font-semibold transition"
                    >
                      <Users className="w-4 h-4 text-purple-500" />
                      <span>কর্মী তালিকা ও ভূমিকা</span>
                    </button>
                  )}

                  {/* Daily Reset */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsKebabOpen(false);
                      onDailyReset();
                    }}
                    className="w-full px-2.5 py-2 rounded-xl flex items-center gap-2 text-rose-600 hover:bg-rose-50 font-semibold transition"
                  >
                    <RotateCcw className="w-4 h-4 text-rose-500" />
                    <span>আজকের চেকলিস্ট রিসেট</span>
                  </button>

                  {/* Developer Console */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsKebabOpen(false);
                      onOpenDeveloperConsole?.();
                    }}
                    className="w-full px-2.5 py-2 rounded-xl flex items-center gap-2 text-slate-700 hover:bg-slate-50 font-semibold transition"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>ডেভেলপার কনসোল</span>
                  </button>

                  {/* Cloud Database Status */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsKebabOpen(false);
                      onOpenSupabaseModal();
                    }}
                    className="w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-slate-700 hover:bg-slate-50 font-semibold transition"
                  >
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-slate-500" />
                      <span>ডাটাবেস কানেকশন</span>
                    </div>
                    <span className={`text-[10px] font-bold ${
                      isSupabaseConnected ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {isSupabaseConnected ? 'Cloud Online' : 'Local Cache'}
                    </span>
                  </button>
                </div>

                {/* Section 5: Theme Switcher */}
                <div className="p-3 bg-slate-50/70 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">থিম পরিবর্তন</span>
                  <div className="flex items-center rounded-xl bg-white p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => onToggleTheme?.('light')}
                      className={`p-1.5 rounded-lg transition ${
                        currentTheme === 'light' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-400 hover:text-slate-700'
                      }`}
                      title="Light Theme"
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleTheme?.('slate')}
                      className={`p-1.5 rounded-lg transition ${
                        currentTheme === 'slate' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-400 hover:text-slate-700'
                      }`}
                      title="Slate Theme"
                    >
                      <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleTheme?.('dark')}
                      className={`p-1.5 rounded-lg transition ${
                        currentTheme === 'dark' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-400 hover:text-slate-700'
                      }`}
                      title="Dark Theme"
                    >
                      <Moon className="w-3.5 h-3.5 text-sky-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
