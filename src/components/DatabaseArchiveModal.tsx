import React, { useState, useEffect } from 'react';
import { fetchAvailableLogDates } from '../lib/supabase';
import { Employee } from '../types';

interface DatabaseArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  currentUser: Employee | null;
  employees: Employee[];
  onOpenPrintModal?: () => void;
  onSimulateMidnightRollover?: (targetDate?: string) => void;
}

export const DatabaseArchiveModal: React.FC<DatabaseArchiveModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  currentUser: _currentUser,
  employees: _employees,
  onOpenPrintModal,
  onSimulateMidnightRollover,
}) => {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customInputDate, setCustomInputDate] = useState('');
  const [simulationNotice, setSimulationNotice] = useState('');

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayStr();

  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const yesterdayStr = getYesterdayStr();

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchAvailableLogDates()
        .then((dates) => {
          setAvailableDates(dates);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDateEn = (dateStr: string) => {
    try {
      const d = new Date(`${dateStr}T00:00:00`);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleSelectDateClick = (dateStr: string) => {
    onSelectDate(dateStr);
    onClose();
  };

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInputDate) {
      onSelectDate(customInputDate);
      onClose();
    }
  };

  return (
    <div id="database-archive-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div id="database-archive-modal-card" className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold">Database Archive & Historical Records</h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Persistent
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Task checklists reset after 12:00 AM midnight while all previous records remain intact in the database
            </p>
          </div>
          <button
            id="btn-close-archive-modal"
            onClick={onClose}
            className="px-3 py-1 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Informational Guidance Box */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-slate-900 text-xs space-y-1">
          <p className="font-bold text-slate-900">
            Midnight 12:00 AM Automatic Rollover Policy:
          </p>
          <p className="text-slate-600 leading-relaxed">
            Every day after 12:00 AM midnight, all employee checklists automatically reset to an empty state for the new workday. All previous completed checkmarks, notes, and progress metrics remain permanently stored in the database and can be reviewed anytime.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Quick Date Access */}
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
              Quick Date Selection:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Today Button */}
              <button
                id="btn-archive-select-today"
                type="button"
                onClick={() => handleSelectDateClick(todayStr)}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  selectedDate === todayStr
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>Today</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-600 text-white font-semibold">
                      Active
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">{todayStr}</div>
                </div>
                {selectedDate === todayStr && <span className="text-xs font-bold text-emerald-600">[Selected]</span>}
              </button>

              {/* Yesterday Button */}
              <button
                id="btn-archive-select-yesterday"
                type="button"
                onClick={() => handleSelectDateClick(yesterdayStr)}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  selectedDate === yesterdayStr
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>Yesterday</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200">
                      Archived
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">{yesterdayStr}</div>
                </div>
                {selectedDate === yesterdayStr && <span className="text-xs font-bold text-indigo-600">[Selected]</span>}
              </button>
            </div>
          </div>

          {/* Custom Date Picker */}
          <form onSubmit={handleCustomDateSubmit} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <label htmlFor="custom-archive-date" className="text-xs font-semibold text-slate-700">
              Pick Specific Date:
            </label>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                id="custom-archive-date"
                type="date"
                value={customInputDate || selectedDate}
                onChange={(e) => setCustomInputDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              />
              <button
                id="btn-submit-custom-date"
                type="submit"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shrink-0"
              >
                Load Record
              </button>
            </div>
          </form>

          {/* Available Logged Dates in Database */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Saved Database Records ({availableDates.length} dates found)
              </span>
              {isLoading && <span className="text-xs text-slate-400">Loading...</span>}
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {availableDates.map((dateStr) => {
                const isCurrent = dateStr === selectedDate;
                const isToday = dateStr === todayStr;
                const isYesterday = dateStr === yesterdayStr;

                return (
                  <button
                    key={dateStr}
                    id={`btn-select-date-${dateStr}`}
                    type="button"
                    onClick={() => handleSelectDateClick(dateStr)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between border ${
                      isCurrent
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-900 font-semibold">{dateStr}</span>
                      <span className="text-slate-500 text-[11px] hidden sm:inline">
                        ({formatDateEn(dateStr)})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isToday && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          Today
                        </span>
                      )}
                      {isYesterday && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                          Yesterday
                        </span>
                      )}
                      <span className="text-indigo-600 text-xs font-semibold hover:underline">
                        View
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Midnight Test & Simulation Section */}
          <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Midnight Test & Rollover Simulator</h4>
              <p className="text-[11px] text-slate-400">
                Simulate 12:00 AM midnight rollover to verify checklist clearing while past records remain preserved
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                id="btn-simulate-midnight"
                type="button"
                onClick={() => {
                  if (onSimulateMidnightRollover) {
                    const d = new Date(`${todayStr}T00:00:00`);
                    d.setDate(d.getDate() + 1);
                    const tomorrowStr = d.toISOString().split('T')[0];
                    onSimulateMidnightRollover(tomorrowStr);
                    setSimulationNotice(
                      `Midnight rollover simulation successful. Date transitioned to ${tomorrowStr}. All checklists reset fresh for the new day, and previous work records for ${todayStr} remain stored safely in the database.`
                    );
                    setTimeout(() => {
                      setSimulationNotice('');
                      onClose();
                    }, 2000);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs"
              >
                Simulate: Pass 12:00 AM Midnight (Next Day)
              </button>

              <button
                id="btn-return-today"
                type="button"
                onClick={() => {
                  handleSelectDateClick(todayStr);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
              >
                Return to Today ({todayStr})
              </button>
            </div>

            {simulationNotice && (
              <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs leading-relaxed font-medium">
                {simulationNotice}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-600">
            All historical records are permanently stored and protected.
          </div>

          <div className="flex items-center gap-2">
            {onOpenPrintModal && (
              <button
                id="btn-print-archive-report"
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPrintModal();
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 shadow-2xs"
              >
                Print Report for this Date
              </button>
            )}
            <button
              id="btn-close-archive-modal-bottom"
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
