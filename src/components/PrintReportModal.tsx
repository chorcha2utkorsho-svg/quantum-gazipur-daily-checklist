import React from 'react';
import { DailyLogItem, DailySummaryStats } from '../types';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  items: DailyLogItem[];
  stats: DailySummaryStats;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  items,
  stats,
}) => {
  if (!isOpen) return null;

  const dateObj = new Date(`${selectedDate}T00:00:00`);
  const formattedDate = isNaN(dateObj.getTime())
    ? selectedDate
    : dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ['#', 'Date', 'Task Name', 'Status', 'Reason for Pending', 'Completed At'];
    const rows = items.map((item, idx) => [
      idx + 1,
      item.date,
      `"${item.task_name.replace(/"/g, '""')}"`,
      item.status.toUpperCase(),
      `"${(item.reason_for_pending || 'None / Completed').replace(/"/g, '""')}"`,
      item.completed_at ? new Date(item.completed_at).toLocaleString() : 'N/A',
    ]);

    const csvContent = [
      `"Quantum Gazipur cell, Raji sir Team Daily Checklist Report - ${selectedDate}"`,
      `"Completion Rate: ${stats.percentage}% (${stats.done} Done, ${stats.pending} Pending, ${stats.total} Total)"`,
      '',
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `quantum_gazipur_cell_daily_checklist_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const reportData = {
      report_title: "Quantum Gazipur cell, Raji sir Team Daily Checklist Report",
      date: selectedDate,
      generated_at: new Date().toISOString(),
      summary: stats,
      tasks: items,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `quantum_gazipur_cell_daily_checklist_${selectedDate}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="print-report-modal"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar - Hidden on actual print */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Daily Report & Print View</h2>
            <p className="text-xs text-slate-500">
              {formattedDate} — Operational Manifest & Accounting
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
            >
              [CSV]
            </button>
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
            >
              [JSON]
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              [Print Report]
            </button>
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              [Close]
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70">
          <div
            id="printable-report"
            className="print-container max-w-3xl mx-auto p-6 sm:p-8 bg-white text-slate-900 rounded-2xl shadow-xl space-y-6"
          >
            {/* Header section */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                  Daily Operational Accountability Log
                </div>
                <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-0.5">
                  Quantum Gazipur cell, Raji sir Team Daily Checklist Report
                </h1>
                <div className="text-sm text-slate-600 mt-1 font-medium">
                  Date: {formattedDate}
                </div>
              </div>

              <div className="text-right sm:text-right">
                <div className="text-2xl font-black text-slate-900">
                  {stats.percentage}% <span className="text-xs font-medium text-slate-500">Done</span>
                </div>
                <div className="text-xs text-slate-600 font-medium mt-0.5">
                  {stats.done} Completed • {stats.pending} Incomplete • {stats.total} Total
                </div>
              </div>
            </div>

            {/* Summary Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 py-2 px-3 bg-slate-100 rounded-xl text-center">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Total Tasks</div>
                <div className="text-lg font-bold text-slate-900">{stats.total}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold">Completed</div>
                <div className="text-lg font-bold text-emerald-600">{stats.done}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-amber-700 font-semibold">Incomplete</div>
                <div className="text-lg font-bold text-amber-600">{stats.pending}</div>
              </div>
            </div>

            {/* Incomplete Tasks Highlight Box (Accountability Focal Point) */}
            {stats.pending > 0 && (
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200">
                <div className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
                  [!] Incomplete Tasks &amp; Documented Reasons:
                </div>
                <div className="space-y-2 text-xs">
                  {items
                    .filter((item) => item.status === 'pending')
                    .map((item, idx) => (
                      <div key={item.id} className="flex items-start gap-2 text-slate-800">
                        <span className="font-bold text-amber-700 w-5 flex-shrink-0">
                          {idx + 1}.
                        </span>
                        <div className="flex-1">
                          <span className="font-semibold text-slate-900">{item.task_name}</span>
                          <span className="text-slate-500 mx-1.5">—</span>
                          <span className="italic text-slate-700">
                            {item.reason_for_pending || '(No specific reason recorded)'}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Full Checklist Table */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Detailed Task Manifest
              </h2>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-600">
                    <th className="py-2 px-1 w-8">#</th>
                    <th className="py-2 px-2">Task Description</th>
                    <th className="py-2 px-2 w-28">Status</th>
                    <th className="py-2 px-2">Accountability Notes / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, idx) => {
                    const isDone = item.status === 'done';
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2 px-1 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-2 font-medium text-slate-900">
                          {item.task_name}
                        </td>
                        <td className="py-2 px-2">
                          {isDone ? (
                            <span className="text-[11px] font-semibold text-emerald-700">
                              [Done]
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-amber-700">
                              [Pending]
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-slate-600">
                          {isDone ? (
                            <span className="text-slate-400 italic text-[11px]">Completed successfully</span>
                          ) : (
                            <span className="text-amber-900 font-medium">
                              {item.reason_for_pending || 'Pending'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Accountability Sign-Off Block */}
            <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-slate-600">
              <div>
                <div className="h-10 border-b border-slate-400 w-48 mb-1"></div>
                <div className="font-bold text-slate-900">Quantum Gazipur cell (Raji sir Team)</div>
                <div className="text-[11px] text-slate-500">Operator / Checklist Team</div>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="h-10 border-b border-slate-400 w-48 mb-1"></div>
                <div className="font-bold text-slate-900">Reviewed / Verified By</div>
                <div className="text-[11px] text-slate-500">Date: {formattedDate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
