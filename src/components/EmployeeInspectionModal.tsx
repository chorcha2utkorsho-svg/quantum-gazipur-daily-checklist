import React from 'react';
import { DailyLogItem, Employee, SYSTEM_ROLES } from '../types';

interface EmployeeInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  date: string;
  logs: DailyLogItem[];
}

export const EmployeeInspectionModal: React.FC<EmployeeInspectionModalProps> = ({
  isOpen,
  onClose,
  employee,
  date,
  logs,
}) => {
  if (!isOpen || !employee) return null;

  const roleDef = SYSTEM_ROLES.find((r) => r.id === employee.role);
  const doneCount = logs.filter((l) => l.status === 'done').length;
  const totalCount = logs.length;
  const percentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="employee-inspection-modal"
        className="relative w-full max-w-2xl bg-[#14161a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase text-white shrink-0 shadow-sm"
              style={{ backgroundColor: employee.avatar_color || '#3b82f6' }}
            >
              {employee.name.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">{employee.name}</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white/80">
                  {employee.employee_id}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                    roleDef?.badgeBg || 'bg-white/10'
                  } ${roleDef?.badgeText || 'text-white/80'} ${
                    roleDef?.badgeBorder || 'border-white/10'
                  }`}
                >
                  {roleDef?.titleEn || employee.role}
                </span>
                <span className="text-xs text-[#8e9299]">
                  Date: {date}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-xs font-bold transition-colors"
          >
            [Close]
          </button>
        </div>

        {/* Progress summary ribbon */}
        <div className="px-6 py-3 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#8e9299]">Progress:</span>
            <span
              className={`text-sm font-bold ${
                percentage >= 90 ? 'text-emerald-400' : percentage >= 50 ? 'text-amber-400' : 'text-zinc-400'
              }`}
            >
              {percentage}% Completed
            </span>
          </div>
          <span className="text-xs text-[#8e9299]">
            {doneCount} Done • {totalCount - doneCount} Pending
          </span>
        </div>

        {/* Logs Checklist */}
        <div className="p-6 overflow-y-auto space-y-2.5">
          {logs.map((item, idx) => {
            const isDone = item.status === 'done';

            return (
              <div
                key={item.id || idx}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors ${
                  isDone
                    ? 'bg-emerald-500/[0.03] border-emerald-500/20'
                    : 'bg-white/[0.02] border-white/10'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <span className={`text-sm font-medium ${isDone ? 'text-white' : 'text-zinc-300'}`}>
                      {item.order_index}. {item.task_name}
                    </span>
                    {!isDone && item.reason_for_pending && (
                      <div className="mt-1 text-xs text-amber-300/90 italic bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                        Reason: "{item.reason_for_pending}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      isDone
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {isDone ? '[Done]' : '[Pending]'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
