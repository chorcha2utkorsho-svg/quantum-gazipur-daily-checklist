import React, { useState } from 'react';
import { Employee, SYSTEM_ROLES, UserRole } from '../types';
import { KeyRound, LogIn, Shield, User, X, Check, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  currentUserId?: string;
  onLoginSuccess: (user: Employee) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  employees,
  currentUserId,
  onLoginSuccess,
}) => {
  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedId = employeeIdInput.trim().toUpperCase();
    const trimmedPin = pinInput.trim();

    if (!trimmedId || !trimmedPin) {
      setErrorMsg('দয়া করে আইডি এবং পাসওয়ার্ড (PIN) প্রদান করুন।');
      return;
    }

    const matched = employees.find(
      (emp) => emp.employee_id.toUpperCase() === trimmedId && emp.pin === trimmedPin
    );

    if (!matched) {
      setErrorMsg('আইডি অথবা পাসওয়ার্ড ভুল হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।');
      return;
    }

    if (!matched.is_active) {
      setErrorMsg('এই কর্মীর আইডি বর্তমানে নিষ্ক্রিয় বা বাতিল রয়েছে। অফিস সহকারীর সাথে যোগাযোগ করুন।');
      return;
    }

    onLoginSuccess(matched);
    onClose();
  };

  const handleQuickLogin = (emp: Employee) => {
    if (!emp.is_active) {
      setErrorMsg('এই আইডিটি নিষ্ক্রিয় রয়েছে।');
      return;
    }
    onLoginSuccess(emp);
    onClose();
  };

  const activeEmployees = employees.filter((e) => e.is_active);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="login-modal-container"
        className="relative w-full max-w-lg bg-[#14161a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">ইউজার সাইন ইন / সুইচ করুন</h2>
              <p className="text-xs text-[#8e9299]">
                অফিস সহকারী বা নিজ নিজ কর্মী আইডিতে প্রবেশ করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8e9299] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Quick 1-Click Login List */}
          <div>
            <label className="block text-xs font-semibold text-[#8e9299] uppercase tracking-wider mb-2.5">
              ১-ক্লিক কুইক সাইন ইন (Demo / Fast Switch)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {activeEmployees.map((emp) => {
                const isSelected = emp.employee_id === currentUserId;
                const roleDef = SYSTEM_ROLES.find((r) => r.id === emp.role);
                const isSupervisor = emp.role === 'office_assistant';

                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => handleQuickLogin(emp)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all group ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-[#d4d4d8]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs uppercase text-white shrink-0"
                        style={{ backgroundColor: emp.avatar_color || '#3b82f6' }}
                      >
                        {emp.name.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white truncate">
                            {emp.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                            {emp.employee_id}
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
                            {roleDef?.titleBn || emp.role}
                          </span>
                          {isSupervisor && (
                            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                              • ফুল অ্যাক্সেস
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 text-xs text-[#8e9299] group-hover:text-emerald-400 transition-colors">
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                          <Check className="w-4 h-4" /> অ্যাক্টিভ
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          লগইন <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#14161a] px-3 text-[11px] uppercase tracking-wider text-[#8e9299] shrink-0">
              অথবা আইডি ও পিন দিয়ে প্রবেশ করুন
            </span>
          </div>

          {/* Form Login */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8e9299] mb-1.5">
                এমপ্লয়ী আইডি (যেমন: SUPERVISOR, EMP-01)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8e9299] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={employeeIdInput}
                  onChange={(e) => setEmployeeIdInput(e.target.value)}
                  placeholder="EMP-01 অথবা SUPERVISOR"
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8e9299] mb-1.5">
                পাসওয়ার্ড / PIN (ডিফল্ট: 1234)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#8e9299] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="****"
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
            >
              <LogIn className="w-4 h-4" />
              <span>আইডিতে প্রবেশ করুন</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
