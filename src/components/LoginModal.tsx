import React, { useState, useEffect } from 'react';
import { Employee, SYSTEM_ROLES } from '../types';
import { Lock, KeyRound, ArrowLeft, Eye, EyeOff, UserCheck, CheckCircle, ShieldAlert, Sparkles, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  currentUserId?: string;
  onLoginSuccess: (user: Employee) => void;
  onRajiSirSignIn?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  employees,
  currentUserId,
  onLoginSuccess,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Reset state when opening or closing
  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setErrorMsg('');
      setShowPin(false);
      setSearchQuery('');
      setSelectedEmployee(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectEmployee = (emp: Employee) => {
    if (!emp.is_active) {
      setErrorMsg('এই অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় রয়েছে। অনুগ্রহ করে রাজী স্যারের সাথে যোগাযোগ করুন।');
      return;
    }
    setSelectedEmployee(emp);
    setPinInput('');
    setErrorMsg('');
    setShowPin(false);
  };

  const handleBackToSelect = () => {
    setSelectedEmployee(null);
    setPinInput('');
    setErrorMsg('');
    setShowPin(false);
  };

  const handleVerifyPassword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!selectedEmployee) return;

    const trimmedPin = pinInput.trim();
    if (!trimmedPin) {
      setErrorMsg('অনুগ্রহ করে আপনার গোপন পাসওয়ার্ডটি লিখুন');
      return;
    }

    if (trimmedPin !== selectedEmployee.pin) {
      setErrorMsg('ভুল পাসওয়ার্ড! রাজী স্যারের দেওয়া আপনার নির্দিষ্ট পাসওয়ার্ডটি প্রবেশ করান।');
      return;
    }

    // Success: Login user
    onLoginSuccess(selectedEmployee);
    onClose();
  };

  const handleKeypadPress = (digit: string) => {
    setErrorMsg('');
    if (pinInput.length < 8) {
      setPinInput((prev) => prev + digit);
    }
  };

  const handleKeypadBackspace = () => {
    setErrorMsg('');
    setPinInput((prev) => prev.slice(0, -1));
  };

  const activeEmployees = employees.filter((e) => e.is_active);

  // Filtered by search query if user types
  const filteredList = activeEmployees.filter((emp) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.employee_id.toLowerCase().includes(q) ||
      (emp.phone && emp.phone.includes(q))
    );
  });

  const bossList = filteredList.filter((e) => e.role === 'main_boss' || e.employee_id === 'RAJI_SIR');
  const chowrastaList = filteredList.filter(
    (e) =>
      e.role !== 'main_boss' &&
      e.employee_id !== 'RAJI_SIR' &&
      e.employee_id !== 'DEV_ADMIN' &&
      (e.branch === 'chowrasta' || e.employee_id.startsWith('GB-'))
  );
  const rajbariList = filteredList.filter(
    (e) =>
      e.role !== 'main_boss' &&
      e.employee_id !== 'RAJI_SIR' &&
      e.employee_id !== 'DEV_ADMIN' &&
      (e.branch === 'rajbari' || e.employee_id === 'JAHID' || e.employee_id.startsWith('SO-'))
  );
  const devList = filteredList.filter((e) => e.role === 'developer' || e.employee_id === 'DEV_ADMIN');

  return (
    <div
      id="login-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div
        id="login-modal-container"
        className="relative w-full max-w-xl bg-[#0f172a] border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-500/20 bg-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-inner">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">
                {selectedEmployee ? 'ব্যক্তিগত পাসওয়ার্ড যাচাই' : 'সদস্য লগইন / আইডি নির্বাচন'}
              </h2>
              <p className="text-xs text-indigo-200/70">
                {selectedEmployee
                  ? `${selectedEmployee.name}-এর ড্যাশবোর্ডে প্রবেশের পাসওয়ার্ড দিন`
                  : 'তালিকা থেকে আপনার নাম সিলেক্ট করুন এবং পাসওয়ার্ড দিয়ে প্রবেশ করুন'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-login-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors flex items-center justify-center border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3.5 text-xs bg-rose-500/15 border border-rose-500/40 text-rose-300 rounded-2xl font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* VIEW 1: SELECT NAME FROM LIST */}
          {!selectedEmployee ? (
            <div className="space-y-4">
              {/* Search filter if many staff */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="নাম অথবা আইডি দিয়ে খুঁজুন (যেমন: Jahid, Anjuman, Mustakim, Tanzina, Pronoy)..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* Group A: Central Executive (Raji Sir) */}
              {bossList.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 px-1">
                    <span>👑 কেন্দ্রীয় কর্তৃত্ব (Supreme Executive)</span>
                  </div>
                  {bossList.map((emp) => {
                    const isCurrent = emp.employee_id === currentUserId;
                    return (
                      <button
                        key={emp.id}
                        id={`btn-select-${emp.employee_id}`}
                        onClick={() => handleSelectEmployee(emp)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all group ${
                          isCurrent
                            ? 'bg-amber-500/20 border-amber-500/50 shadow-md ring-1 ring-amber-400/30'
                            : 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-md ring-1 ring-amber-400/40 shrink-0"
                            style={{ backgroundColor: emp.avatar_color || '#f59e0b' }}
                          >
                            RS
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm text-white group-hover:text-amber-300 transition-colors">
                                {emp.name}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/30 text-amber-200 border border-amber-500/40 font-bold">
                                {emp.employee_id}
                              </span>
                            </div>
                            <p className="text-[11px] text-amber-200/80 mt-0.5">
                              মূল ইন্টারফেস ও দুই শাখার সামগ্রিক মনিটরিং
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                              বর্তমান
                            </span>
                          )}
                          <span className="text-xs font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                            পাসওয়ার্ড দিন →
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Group B: Gazipur Branch (Chowrasta) */}
              {chowrastaList.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 px-1">
                    <span>🌿 ১. গাজীপুর শাখা কর্মী (Chowrasta Branch)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {chowrastaList.map((emp) => {
                      const isCurrent = emp.employee_id === currentUserId;
                      const roleDef = SYSTEM_ROLES.find((r) => r.id === emp.role);
                      return (
                        <button
                          key={emp.id}
                          id={`btn-select-${emp.employee_id}`}
                          onClick={() => handleSelectEmployee(emp)}
                          className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all group ${
                            isCurrent
                              ? 'bg-emerald-500/20 border-emerald-500/50 shadow-md ring-1 ring-emerald-400/30'
                              : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-emerald-500/40'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0"
                              style={{ backgroundColor: emp.avatar_color || '#10b981' }}
                            >
                              {emp.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors truncate">
                                {emp.name}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <span className="font-mono">{emp.employee_id}</span>
                                <span>•</span>
                                <span className="text-emerald-300 font-medium">
                                  {roleDef?.titleEn || emp.role}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0 text-emerald-400 group-hover:translate-x-0.5 transition-transform text-xs font-bold pl-1">
                            →
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group C: Gazipur Sadar Office (Rajbari) */}
              {rajbariList.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 px-1">
                    <span>🏛️ ২. গাজীপুর সদর অফিস কর্মী (Sadar Office)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {rajbariList.map((emp) => {
                      const isCurrent = emp.employee_id === currentUserId;
                      const roleDef = SYSTEM_ROLES.find((r) => r.id === emp.role);
                      return (
                        <button
                          key={emp.id}
                          id={`btn-select-${emp.employee_id}`}
                          onClick={() => handleSelectEmployee(emp)}
                          className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all group ${
                            isCurrent
                              ? 'bg-sky-500/20 border-sky-500/50 shadow-md ring-1 ring-sky-400/30'
                              : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-sky-500/40'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0"
                              style={{ backgroundColor: emp.avatar_color || '#38bdf8' }}
                            >
                              {emp.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-white group-hover:text-sky-300 transition-colors truncate">
                                {emp.name}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <span className="font-mono">{emp.employee_id}</span>
                                <span>•</span>
                                <span className="text-sky-300 font-medium">
                                  {roleDef?.titleEn || emp.role}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0 text-sky-400 group-hover:translate-x-0.5 transition-transform text-xs font-bold pl-1">
                            →
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group D: System Developer */}
              {devList.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-white/5">
                  {devList.map((emp) => (
                    <button
                      key={emp.id}
                      id={`btn-select-${emp.employee_id}`}
                      onClick={() => handleSelectEmployee(emp)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-left transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold text-rose-300">
                          ⚙️ {emp.name} ({emp.employee_id})
                        </span>
                        <span className="text-[10px] text-rose-400/80">
                          সিস্টেম কনফিগারেশন ও টাস্ক পয়েন্ট এডিটর
                        </span>
                      </div>
                      <span className="text-xs font-bold text-rose-400">পাসওয়ার্ড দিন →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* VIEW 2: PASSWORD INPUT FOR SELECTED EMPLOYEE */
            <div className="space-y-6">
              {/* Profile Card Header of Selected Employee */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-md ring-2 ring-white/10"
                    style={{ backgroundColor: selectedEmployee.avatar_color || '#4f46e5' }}
                  >
                    {selectedEmployee.role === 'main_boss'
                      ? 'RS'
                      : selectedEmployee.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white">{selectedEmployee.name}</h3>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-white font-bold">
                        {selectedEmployee.employee_id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedEmployee.branch === 'chowrasta'
                        ? 'গাজীপুর শাখা'
                        : selectedEmployee.branch === 'rajbari'
                        ? 'গাজীপুর সদর অফিস'
                        : 'কেন্দ্রীয়'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBackToSelect}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/10"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>অন্য নাম</span>
                </button>
              </div>

              {/* Password Form */}
              <form onSubmit={handleVerifyPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    {selectedEmployee.name}-এর গোপন পাসওয়ার্ড দিন:
                  </label>
                  <div className="relative">
                    <input
                      id="input-login-pin"
                      type={showPin ? 'text' : 'password'}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="পাসওয়ার্ড লিখুন"
                      autoFocus
                      maxLength={12}
                      className="w-full pl-4 pr-12 py-3 bg-black/40 border border-indigo-500/40 rounded-2xl text-white font-mono tracking-widest text-lg font-bold placeholder-white/20 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Quick numeric touch pad */}
                <div className="grid grid-cols-3 gap-2 pt-1 max-w-xs mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleKeypadPress(digit)}
                      className="py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] text-white font-mono font-bold text-base transition-colors border border-white/10 active:scale-95"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleKeypadBackspace}
                    className="py-2.5 rounded-xl bg-white/[0.05] hover:bg-rose-500/20 text-rose-300 font-bold text-xs transition-colors border border-white/10 active:scale-95 flex items-center justify-center"
                  >
                    মুছুন
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('0')}
                    className="py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] text-white font-mono font-bold text-base transition-colors border border-white/10 active:scale-95"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => setPinInput('')}
                    className="py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 font-bold text-xs transition-colors border border-white/10 active:scale-95 flex items-center justify-center"
                  >
                    ক্লিয়ার
                  </button>
                </div>

                {/* Submit button */}
                <button
                  id="btn-submit-sign-in"
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-black/30 flex items-center justify-between text-xs text-slate-400">
          <span>কোয়ান্টাম গাজীপুর সেল সিকিউর লগইন সিস্টেম</span>
          <span className="font-mono text-[11px] text-amber-300">
            {selectedEmployee ? 'পিন এন্টার করুন' : 'নাম নির্বাচন করুন'}
          </span>
        </div>
      </div>
    </div>
  );
};
