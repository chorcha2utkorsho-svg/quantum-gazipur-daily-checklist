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
  UserCheck,
  Shield,
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
    <header className="w-full border-b border-white/10 bg-black/40 backdrop-blur-md shrink-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4">
        {/* Top row: Brand & Status & User Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brand & Persona */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Quantum Gazipur Cell
                </h1>
                {isBoss ? (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1 shadow-sm">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span>রাজি স্যার • বস কমান্ড</span>
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                    Raji Sir Team
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8e9299] mt-0.5 flex flex-wrap items-center gap-1.5">
                <span>১। চৌরাস্তা ব্রাঞ্চ</span>
                <span>•</span>
                <span>২। রাজবাড়ি ব্রাঞ্চ</span>
                <span>•</span>
                <span>দৈনন্দিন কর্মতালিকা, জবাবদিহিতা ও সুপারভাইজার সিদ্ধান্ত</span>
              </p>
            </div>
          </div>

          {/* User Account & Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Active User Card & Switch Button */}
            <div className={`flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border shadow-sm ${
              isBoss ? 'bg-amber-500/10 border-amber-500/40' : 'bg-white/[0.04] border-white/10'
            }`}>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs uppercase text-white shrink-0 shadow-sm ${
                  isBoss ? 'ring-1 ring-amber-400' : ''
                }`}
                style={{ backgroundColor: currentUser?.avatar_color || (isBoss ? '#f59e0b' : '#10b981') }}
              >
                {isBoss ? '👑' : currentUser?.name ? currentUser.name.slice(0, 2) : 'EM'}
              </div>
              <div className="text-left pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white max-w-[130px] truncate block">
                    {currentUser?.name || 'লগইন করুন'}
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/10 text-white/70">
                    {currentUser?.employee_id || 'ID'}
                  </span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full border font-medium inline-block mt-0.5 ${
                    roleDef?.badgeBg || 'bg-white/10'
                  } ${roleDef?.badgeText || 'text-white/80'} ${
                    roleDef?.badgeBorder || 'border-white/10'
                  }`}
                >
                  {roleDef?.titleBn || 'রোল'}
                </span>
              </div>

              <button
                id="switch-user-btn"
                onClick={onOpenLoginModal}
                title="ব্যবহারকারী পরিবর্তন বা সাইন ইন করুন"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-[#8e9299] hover:text-white transition-colors"
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
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs uppercase tracking-wider font-semibold border transition-all ${
                isSupabaseConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseConnected ? 'Supabase' : 'DB Offline'}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSupabaseConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                }`}
              />
            </button>

            {/* Employee Manager (Accessible to Supervisor) */}
            {isSupervisor && (
              <button
                id="manage-employees-btn"
                onClick={onOpenEmployeeManager}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded uppercase tracking-wider transition-colors border border-white/5"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>কর্মী ব্যবস্থাপনা</span>
              </button>
            )}

            {/* Task Template Manager */}
            {isSupervisor && (
              <button
                id="task-manager-btn"
                onClick={onOpenTaskManager}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-[#e5e5e5] hover:text-white text-xs font-semibold rounded uppercase tracking-wider transition-colors border border-white/5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#8e9299]" />
                <span>টাস্ক লিস্ট</span>
              </button>
            )}

            {/* Daily Reset button */}
            <button
              id="daily-reset-btn"
              onClick={onDailyReset}
              title="আজকের কাজের স্ট্যাটাস ফ্রেশ করুন"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-[#e5e5e5] hover:text-white text-xs font-semibold rounded uppercase tracking-wider transition-colors border border-white/5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>রিসেট</span>
            </button>

            {/* Print / Export Report */}
            <button
              id="print-export-btn"
              onClick={onOpenPrintModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>রিপোর্ট প্রিন্ট</span>
            </button>
          </div>
        </div>

        {/* Middle row: Mode Switcher (For Boss or Supervisor) */}
        {isSupervisor && (
          <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/10">
              <button
                onClick={() => onToggleViewMode('supervisor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'supervisor'
                    ? isBoss
                      ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : 'bg-emerald-500 text-black shadow-md'
                    : 'text-[#8e9299] hover:text-white'
                }`}
              >
                {isBoss ? <Crown className="w-3.5 h-3.5" /> : <LayoutDashboard className="w-3.5 h-3.5" />}
                <span>
                  {isBoss
                    ? '👑 বস সেন্ট্রাল ড্যাশবোর্ড (উভয় ব্রাঞ্চ এক নজরে)'
                    : 'অফিস সহকারী ড্যাশবোর্ড (তুলনামূলক চিত্র ও এআই)'}
                </span>
              </button>

              <button
                onClick={() => onToggleViewMode('checklist')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'checklist'
                    ? isBoss
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-emerald-500 text-black shadow-md'
                    : 'text-[#8e9299] hover:text-white'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>আমার ব্যক্তিগত চেকলিস্ট ও টাস্ক</span>
              </button>
            </div>

            {/* Quick Branch Switcher in Header for Boss */}
            {isBoss && onSelectBranch && (
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
                <span className="text-[10px] text-[#8e9299] px-1 font-semibold uppercase tracking-wider">ব্রাঞ্চ:</span>
                <button
                  type="button"
                  onClick={() => onSelectBranch('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedBranch === 'all'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-[#8e9299] hover:text-white'
                  }`}
                >
                  উভয় ব্রাঞ্চ
                </button>
                <button
                  type="button"
                  onClick={() => onSelectBranch('chowrasta')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    selectedBranch === 'chowrasta'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'text-[#8e9299] hover:text-emerald-300'
                  }`}
                >
                  <Building2 className="w-3 h-3" />
                  <span>১। চৌরাস্তা</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectBranch('rajbari')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    selectedBranch === 'rajbari'
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                      : 'text-[#8e9299] hover:text-sky-300'
                  }`}
                >
                  <Landmark className="w-3 h-3" />
                  <span>২। রাজবাড়ি</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Date Navigation Strip */}
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <button
              id="prev-day-btn"
              onClick={handlePrevDay}
              aria-label="Previous day"
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-[#8e9299] hover:text-white border border-white/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 rounded bg-black/40 border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-sm font-medium text-white tracking-tight">
                {formattedDisplay}
              </span>
            </div>

            <button
              id="next-day-btn"
              onClick={handleNextDay}
              aria-label="Next day"
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-[#8e9299] hover:text-white border border-white/10 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isToday ? (
              <button
                id="jump-today-btn"
                onClick={handleGoToday}
                className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider font-semibold transition-colors"
              >
                আজকে যান (Today)
              </button>
            ) : (
              <span className="text-[11px] uppercase tracking-widest text-emerald-500 font-bold ml-1">
                আজকের কার্যদিবস
              </span>
            )}
          </div>

          {/* Quick Date Picker input */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[#8e9299]">তারিখ নির্বাচন:</span>
            <input
              id="date-picker-input"
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && onDateChange(e.target.value)}
              className="text-xs bg-black/40 border border-white/10 rounded px-2.5 py-1 text-[#e5e5e5] focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
