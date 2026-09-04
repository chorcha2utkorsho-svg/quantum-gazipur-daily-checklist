import React from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Printer,
  SlidersHorizontal,
  Database,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';

interface HeaderProps {
  selectedDate: string;
  onDateChange: (newDate: string) => void;
  onDailyReset: () => void;
  onOpenTaskManager: () => void;
  onOpenSupabaseModal: () => void;
  onOpenPrintModal: () => void;
  isSupabaseConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onDateChange,
  onDailyReset,
  onOpenTaskManager,
  onOpenSupabaseModal,
  onOpenPrintModal,
  isSupabaseConnected,
}) => {
  // Format selected date
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

  return (
    <header className="w-full border-b border-white/10 bg-black/40 backdrop-blur-md shrink-0">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-5">
        {/* Top row: Brand & Status Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand & Persona */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Quantum Gazipur cell
            </h1>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-medium">
              Raji sir Team • Daily Operations
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
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
              <span>{isSupabaseConnected ? 'Supabase Connected' : 'Supabase Config'}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSupabaseConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                }`}
              />
            </button>

            {/* Task Manager (Add/Edit/Delete) */}
            <button
              id="task-manager-btn"
              onClick={onOpenTaskManager}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-[#e5e5e5] hover:text-white text-xs font-semibold rounded uppercase tracking-widest transition-colors border border-white/5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8e9299]" />
              <span>Manage Tasks</span>
            </button>

            {/* Daily Reset button */}
            <button
              id="daily-reset-btn"
              onClick={onDailyReset}
              title="Reset tasks for this day back to fresh pending state"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-[#e5e5e5] hover:text-white text-xs font-semibold rounded uppercase tracking-widest transition-colors border border-white/5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Daily Reset</span>
            </button>

            {/* Print / Export Report */}
            <button
              id="print-export-btn"
              onClick={onOpenPrintModal}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Date Navigation Strip */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-sm">
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
                Jump to Today
              </button>
            ) : (
              <span className="text-[11px] uppercase tracking-widest text-emerald-500 font-bold ml-1">
                Active Session
              </span>
            )}
          </div>

          {/* Quick Date Picker input */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[#8e9299]">Date:</span>
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
