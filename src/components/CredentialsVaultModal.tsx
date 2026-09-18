import React, { useState } from 'react';
import { Employee, SYSTEM_ROLES } from '../types';
import { Shield, Key, Eye, EyeOff, Copy, Check, Edit2, Lock, Sparkles, X, UserCheck } from 'lucide-react';

interface CredentialsVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onUpdatePin: (employeeId: string, newPin: string) => Promise<void> | void;
}

export const CredentialsVaultModal: React.FC<CredentialsVaultModalProps> = ({
  isOpen,
  onClose,
  employees,
  onUpdatePin,
}) => {
  const [showAllPins, setShowAllPins] = useState(false);
  const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({});
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [newPinValue, setNewPinValue] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [filterBranch, setFilterBranch] = useState<'all' | 'chowrasta' | 'rajbari'>('all');

  if (!isOpen) return null;

  const togglePinVisibility = (empId: string) => {
    setVisiblePins((prev) => ({ ...prev, [empId]: !prev[empId] }));
  };

  const handleCopyPin = (emp: Employee) => {
    navigator.clipboard.writeText(emp.pin);
    setCopiedId(emp.employee_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyCredentialsMessage = (emp: Employee) => {
    const branchLabel =
      emp.branch === 'chowrasta'
        ? 'গাজীপুর শাখা (Chowrasta)'
        : emp.branch === 'rajbari'
        ? 'গাজীপুর সদর অফিস (Rajbari Sadar)'
        : 'কেন্দ্রীয় (Executive)';

    const roleDef = SYSTEM_ROLES.find((r) => r.id === emp.role);
    const roleTitle = roleDef?.titleEn || emp.role;

    const message = `✨ কোয়ান্টাম গাজীপুর সেল — ব্যক্তিগত লগইন তথ্য ✨\n\nনাম: ${emp.name}\nলগইন আইডি: ${emp.employee_id}\nশাখা: ${branchLabel}\nপদবী: ${roleTitle}\n\n🔑 আপনার গোপন পাসওয়ার্ড: ${emp.pin}\n\n👉 নির্দেশিকা:\nঅ্যাপে প্রবেশ করে আপনার নাম সিলেক্ট করুন এবং উপরের পাসওয়ার্ডটি দিন। আপনি সরাসরি আপনার ব্যক্তিগত ড্যাশবোর্ডে চলে আসবেন।`;

    navigator.clipboard.writeText(message);
    setCopiedMsgId(emp.employee_id);
    setTimeout(() => setCopiedMsgId(null), 2500);
  };

  const handleStartEdit = (emp: Employee) => {
    setEditingEmpId(emp.employee_id);
    setNewPinValue(emp.pin);
  };

  const handleSaveEdit = async (empId: string) => {
    const trimmed = newPinValue.trim();
    if (!trimmed || trimmed.length < 3) {
      alert('পাসওয়ার্ড ন্যূনতম ৩ সংখ্যার হতে হবে');
      return;
    }
    await onUpdatePin(empId, trimmed);
    setEditingEmpId(null);
    setNewPinValue('');
  };

  const filteredEmployees = employees.filter((emp) => {
    if (filterBranch === 'all') return true;
    return emp.branch === filterBranch || emp.branch === 'all';
  });

  return (
    <div
      id="credentials-vault-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div
        id="credentials-vault-modal"
        className="relative w-full max-w-3xl bg-[#0f172a] border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-indigo-500/20 bg-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  স্টাফ পাসওয়ার্ড তালিকা ও সিকিউরিটি ভল্ট
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  অফিসিয়াল
                </span>
              </div>
              <p className="text-xs text-indigo-200/70">
                প্রতিটি ক্যারেক্টারের ব্যক্তিগত পাসওয়ার্ড এখান থেকে কপি করে তাদের সরাসরি দিন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllPins(!showAllPins)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors flex items-center gap-1.5"
            >
              {showAllPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showAllPins ? 'সব লুকান' : 'সব পাসওয়ার্ড দেখান'}</span>
            </button>
            <button
              id="btn-close-credentials-vault"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors flex items-center justify-center border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notice banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-start gap-3">
          <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <strong>সাইন আপ পুরোপুরি নিষ্ক্রিয়:</strong> কোনো সদস্যকে সাইন আপ করতে হবে না। প্রত্যেকে লগইন স্ক্রিনে শুধু তাদের নাম নির্বাচন করবে এবং আপনার দেওয়া গোপন পাসওয়ার্ডটি বসিয়ে সরাসরি নিজ ড্যাশবোর্ডে ঢুকবে।
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 pt-4 pb-2 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <span>শাখা অনুযায়ী ফিল্টার:</span>
            <button
              onClick={() => setFilterBranch('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                filterBranch === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              সকল সদস্য ({employees.length})
            </button>
            <button
              onClick={() => setFilterBranch('chowrasta')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                filterBranch === 'chowrasta'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              গাজীপুর শাখা
            </button>
            <button
              onClick={() => setFilterBranch('rajbari')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                filterBranch === 'rajbari'
                  ? 'bg-sky-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              গাজীপুর সদর অফিস
            </button>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {filteredEmployees.length} Personnel
          </span>
        </div>

        {/* Personnel Credentials List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {filteredEmployees.map((emp) => {
            const isBoss = emp.role === 'main_boss' || emp.employee_id === 'RAJI_SIR';
            const isDev = emp.role === 'developer' || emp.employee_id === 'DEV_ADMIN';
            const isVisible = showAllPins || visiblePins[emp.employee_id];
            const isEditing = editingEmpId === emp.employee_id;
            const isCopied = copiedId === emp.employee_id;
            const isMsgCopied = copiedMsgId === emp.employee_id;

            const roleDef = SYSTEM_ROLES.find((r) => r.id === emp.role);

            return (
              <div
                key={emp.id || emp.employee_id}
                className={`p-4 rounded-2xl border transition-all ${
                  isBoss
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : isDev
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : emp.branch === 'chowrasta'
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-sky-500/5 border-sky-500/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Employee details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md ring-2 ring-white/10"
                      style={{ backgroundColor: emp.avatar_color || '#4f46e5' }}
                    >
                      {isBoss ? 'RS' : emp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white truncate">{emp.name}</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-white font-bold border border-white/15">
                          ID: {emp.employee_id}
                        </span>
                        {isBoss && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                            Supreme Authority
                          </span>
                        )}
                        {isDev && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                            Developer Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-300 flex-wrap">
                        <span className="text-slate-400">
                          {emp.branch === 'chowrasta'
                            ? 'গাজীপুর শাখা'
                            : emp.branch === 'rajbari'
                            ? 'গাজীপুর সদর অফিস'
                            : 'সকল শাখা'}
                        </span>
                        <span>•</span>
                        <span className="text-indigo-300 font-medium">
                          {roleDef?.titleEn || emp.role}
                        </span>
                        {emp.phone && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400 font-mono text-[11px]">{emp.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Secret Password box & controls */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-indigo-500/50">
                        <input
                          type="text"
                          value={newPinValue}
                          onChange={(e) => setNewPinValue(e.target.value)}
                          placeholder="নতুন PIN"
                          maxLength={8}
                          className="w-24 px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-center text-sm font-bold focus:outline-none focus:border-emerald-400"
                        />
                        <button
                          onClick={() => handleSaveEdit(emp.employee_id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                        >
                          সংরক্ষণ
                        </button>
                        <button
                          onClick={() => setEditingEmpId(null)}
                          className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-xs transition-colors"
                        >
                          বাতিল
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs text-slate-400">পাসওয়ার্ড:</span>
                          <span className="font-mono font-black text-sm tracking-wider text-amber-300 min-w-[50px] text-center">
                            {isVisible ? emp.pin : '••••'}
                          </span>
                          <button
                            onClick={() => togglePinVisibility(emp.employee_id)}
                            className="text-slate-400 hover:text-white transition-colors ml-1"
                            title={isVisible ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Copy PIN button */}
                        <button
                          onClick={() => handleCopyPin(emp)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                            isCopied
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
                          }`}
                          title="শুধু পাসওয়ার্ড কপি করুন"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'কপি হয়েছে' : 'PIN কপি'}</span>
                        </button>

                        {/* Copy SMS / WhatsApp Full Message */}
                        <button
                          onClick={() => handleCopyCredentialsMessage(emp)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                            isMsgCopied
                              ? 'bg-indigo-600 text-white border-indigo-500'
                              : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          }`}
                          title="মেসেজ আকারে সম্পূর্ণ লগইন তথ্য কপি করুন"
                        >
                          {isMsgCopied ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                          <span>{isMsgCopied ? 'মেসেজ কপি!' : 'মেসেজ কপি'}</span>
                        </button>

                        {/* Edit PIN button */}
                        <button
                          onClick={() => handleStartEdit(emp)}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
                          title="পাসওয়ার্ড পরিবর্তন করুন"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/30 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>সদস্যরা তাদের নামের ওপর ক্লিক করে এই পাসওয়ার্ড দিলে নিজ নিজ ওয়ার্কস্পেসে প্রবেশ করবে।</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors"
          >
            সম্পন্ন
          </button>
        </div>
      </div>
    </div>
  );
};
