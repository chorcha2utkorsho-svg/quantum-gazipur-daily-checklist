import React, { useState } from 'react';
import { Employee, SYSTEM_ROLES } from '../types';
import { KeyRound, LogIn, Shield, User, X, Check, ArrowRight, Crown, UserPlus } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  currentUserId?: string;
  onLoginSuccess: (user: Employee) => void;
  onRajiSirSignIn?: () => void;
  onOpenEmployeeSignUp?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  employees,
  currentUserId,
  onLoginSuccess,
  onRajiSirSignIn,
  onOpenEmployeeSignUp,
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
      setErrorMsg('Please enter both Employee ID and PIN.');
      return;
    }

    const matched = employees.find(
      (emp) => emp.employee_id.toUpperCase() === trimmedId && emp.pin === trimmedPin
    );

    if (!matched) {
      setErrorMsg('ভুল আইডি অথবা পাসওয়ার্ড/পিন। অনুগ্রহ করে আবার চেষ্টা করুন। (Invalid ID or PIN)');
      return;
    }

    if (matched.approval_status === 'pending') {
      setErrorMsg('⏳ আপনার অ্যাকাউন্টটি বর্তমানে পেন্ডিং অবস্থায় রয়েছে। শ্রদ্ধেয় রাজি স্যার সেন্ট্রাল ড্যাশবোর্ড থেকে অনুমোদন (Approve) করলেই আপনি সিস্টেমে লগইন করতে পারবেন।');
      return;
    }

    if (matched.approval_status === 'rejected') {
      setErrorMsg('❌ দুঃখিত, আপনার রেজিস্ট্রেশন আবেদনটি কতৃপক্ষ কর্তৃক বাতিল করা হয়েছে।');
      return;
    }

    if (!matched.is_active) {
      setErrorMsg('This account is currently inactive. Please contact the administrator.');
      return;
    }

    onLoginSuccess(matched);
    onClose();
  };

  const handleQuickLogin = (emp: Employee) => {
    if (emp.approval_status === 'pending') {
      setErrorMsg('⏳ এই অ্যাকাউন্টটি রাজি স্যারের অনুমোদনের অপেক্ষায় রয়েছে।');
      return;
    }
    if (!emp.is_active) {
      setErrorMsg('This account is inactive.');
      return;
    }
    onLoginSuccess(emp);
    onClose();
  };

  const activeEmployees = employees.filter(
    (e) => e.is_active && e.approval_status !== 'pending' && e.approval_status !== 'rejected'
  );

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
              <h2 className="text-base font-semibold text-white">User Sign In / Switch Account</h2>
              <p className="text-xs text-[#8e9299]">
                Sign in as supervisor, branch incharge, or team member
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

          {/* Quick 1-Click Login List organized by Branch */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#8e9299] uppercase tracking-wider">
                1-Click Quick Sign In
              </label>
              <span className="text-[11px] text-amber-400 font-mono">PIN: 1234</span>
            </div>

            {/* Boss Account (Raji Sir) */}
            {activeEmployees.filter((e) => e.role === 'main_boss' || e.employee_id === 'RAJI_SIR').map((emp) => {
              const isSelected = emp.employee_id === currentUserId;
              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => handleQuickLogin(emp)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all group ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500/50 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/30 text-[#fef3c7]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black text-base shrink-0 shadow-md">
                      👑
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-amber-300 truncate">
                          {emp.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30">
                          {emp.employee_id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/20 text-amber-200 font-semibold">
                          Central Director • Dual-Branch Supervision
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 text-xs font-bold text-amber-400">
                    {isSelected ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-4 h-4" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        Sign In <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Branch 1: Gazipur Branch */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 px-1 pt-1">
                <span>🏢 1. Gazipur Branch Team</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {activeEmployees
                  .filter(
                    (e) =>
                      (e.branch === 'chowrasta' ||
                        e.employee_id.startsWith('GB-') ||
                        e.employee_id.startsWith('CR-') ||
                        e.employee_id === 'SUP-CHOW') &&
                      e.role !== 'main_boss' &&
                      e.employee_id !== 'RAJI_SIR'
                  )
                  .map((emp) => {
                    const isSelected = emp.employee_id === currentUserId;
                    const roleDef = SYSTEM_ROLES.find((r) => r.id === emp.role);
                    const isIncharge = emp.role === 'office_assistant';

                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleQuickLogin(emp)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all group ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                            : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/10 text-[#d4d4d8]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase text-white shrink-0"
                            style={{ backgroundColor: emp.avatar_color || '#10b981' }}
                          >
                            {emp.name.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-white truncate">
                                {emp.name}
                              </span>
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/10 text-white/70">
                                {emp.employee_id}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${
                                  roleDef?.badgeBg || 'bg-white/10'
                                } ${roleDef?.badgeText || 'text-white/80'} ${
                                  roleDef?.badgeBorder || 'border-white/10'
                                }`}
                              >
                                {roleDef?.titleEn || emp.role}
                              </span>
                              {isIncharge && (
                                <span className="text-[10px] text-emerald-400 font-bold">
                                  • Incharge
                                </span>
                              )}
                            </div>
                            {emp.notes && (
                              <p className="text-[10px] text-[#8e9299] mt-0.5 line-clamp-1">
                                {emp.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-xs text-[#8e9299] group-hover:text-emerald-400">
                          {isSelected ? (
                            <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                              <Check className="w-3.5 h-3.5" /> Active
                            </span>
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Branch 2: Gazipur Sadar Office */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 px-1 pt-1">
                <span>🏛️ 2. Gazipur Sadar Office Team</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {activeEmployees
                  .filter(
                    (e) =>
                      (e.branch === 'rajbari' ||
                        e.employee_id.startsWith('SO-') ||
                        e.employee_id.startsWith('RB-') ||
                        e.employee_id === 'SUP-RAJB' ||
                        e.employee_id === 'JAHID') &&
                      e.role !== 'main_boss' &&
                      e.employee_id !== 'RAJI_SIR'
                  )
                  .map((emp) => {
                    const isSelected = emp.employee_id === currentUserId;
                    const roleDef = SYSTEM_ROLES.find((r) => r.id === emp.role);
                    const isIncharge = emp.role === 'office_assistant';

                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleQuickLogin(emp)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all group ${
                          isSelected
                            ? 'bg-sky-500/15 border-sky-500/40 text-white'
                            : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/10 text-[#d4d4d8]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase text-white shrink-0"
                            style={{ backgroundColor: emp.avatar_color || '#0ea5e9' }}
                          >
                            {emp.name.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-white truncate">
                                {emp.name}
                              </span>
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/10 text-white/70">
                                {emp.employee_id}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${
                                  roleDef?.badgeBg || 'bg-white/10'
                                } ${roleDef?.badgeText || 'text-white/80'} ${
                                  roleDef?.badgeBorder || 'border-white/10'
                                }`}
                              >
                                {roleDef?.titleEn || emp.role}
                              </span>
                              {isIncharge && (
                                <span className="text-[10px] text-sky-400 font-bold">
                                  • Incharge
                                </span>
                              )}
                            </div>
                            {emp.notes && (
                              <p className="text-[10px] text-[#8e9299] mt-0.5 line-clamp-1">
                                {emp.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-xs text-[#8e9299] group-hover:text-sky-400">
                          {isSelected ? (
                            <span className="flex items-center gap-1 text-sky-400 text-xs font-semibold">
                              <Check className="w-3.5 h-3.5" /> Active
                            </span>
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#14161a] px-3 text-[11px] uppercase tracking-wider text-[#8e9299] shrink-0">
              Or sign in with ID and PIN
            </span>
          </div>

          {/* Form Login */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8e9299] mb-1.5">
                Employee ID (e.g., SUPERVISOR, CR-01)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8e9299] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={employeeIdInput}
                  onChange={(e) => setEmployeeIdInput(e.target.value)}
                  placeholder="CR-01 or SUPERVISOR"
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8e9299] mb-1.5">
                Password / PIN (Default: 1234)
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
              <span>Sign In to Account</span>
            </button>
          </form>

          {/* New Account Sign Up Section */}
          {onOpenEmployeeSignUp && (
            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <div className="text-center">
                <span className="text-xs text-slate-400 font-medium">নতুন কর্মীদের জন্য রেজিস্ট্রেশন:</span>
              </div>
              <button
                type="button"
                id="login-modal-employee-signup-btn"
                onClick={() => {
                  onClose();
                  onOpenEmployeeSignUp();
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all shadow-xs"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>এমপ্লয়ী সাইন আপ (নিজস্ব আইডি ও পাসওয়ার্ড তৈরি করুন)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
