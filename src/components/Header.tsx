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
} from 'lucide-react';
import { Employee, SYSTEM_ROLES } from '../types';

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
  const isSupervisor = currentUser?.role === 'office_assistant';

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
                  Quantum Gazipur cell
                </h1>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                  Raji sir Team
                </span>
              </div>
              <p className="text-xs text-[#8e9299] mt-0.5">
                দৈনন্দিন কর্মতালিকা, জবাবদিহিতা ও সুপারভাইজার সিদ্ধান্ত ব্যবস্থাপনা
              </p>
            </div>
          </div>

          {/* User Account & Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Active User Card & Switch Button */}
            <div className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-white/[0.04] border border-white/10 shadow-sm">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs uppercase text-white shrink-0"
                style={{ backgroundColor: currentUser?.avatar_color || '#10b981' }}
              >
                {currentUser?.name ? currentUser.name.slice(0, 2) : 'EM'}
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

        {/* Middle row: Mode Switcher (For Supervisor) */}
        {isSupervisor && (
          <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/10">
              <button
                onClick={() => onToggleViewMode('supervisor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'supervisor'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-[#8e9299] hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>অফিস সহকারী ড্যাশবোর্ড (তুলনামূলক চিত্র ও এআই)</span>
              </button>

              <button
                onClick={() => onToggleViewMode('checklist')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'checklist'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-[#8e9299] hover:text-white'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>আমার দৈনিক চেকলিস্ট ও কারণ</span>
              </button>
            </div>

            <span className="text-[11px] text-[#8e9299] hidden sm:inline">
              ভিউ মোড পরিবর্তন করে চেকলিস্ট বা সামগ্রিক রিপোর্ট দেখুন
            </span>
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
