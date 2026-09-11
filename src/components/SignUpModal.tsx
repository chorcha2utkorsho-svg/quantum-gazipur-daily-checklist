import React, { useState, useEffect } from 'react';
import { Employee, BranchId, UserRole } from '../types';
import {
  UserPlus,
  Crown,
  Building2,
  Landmark,
  X,
  Lock,
  User,
  Phone,
  Sparkles,
  ArrowRight,
  Info,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingEmployees?: Employee[];
  onSignUpSuccess: (newEmployee: Employee) => void;
  onOpenRajiSirSignIn?: () => void;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({
  isOpen,
  onClose,
  existingEmployees = [],
  onSignUpSuccess,
  onOpenRajiSirSignIn,
}) => {
  // Form fields for employee registration
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [branch, setBranch] = useState<BranchId>('chowrasta');
  const [role, setRole] = useState<UserRole>('office_assistant');
  const [pin, setPin] = useState('1234');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedEmployee, setSubmittedEmployee] = useState<Employee | null>(null);

  // Auto suggest ID based on branch when opened or branch changed
  useEffect(() => {
    if (isOpen && !name) {
      const safeList = existingEmployees || [];
      const branchCount = safeList.filter((e) => e.branch === branch && e.role !== 'main_boss').length + 1;
      const prefix = branch === 'chowrasta' ? 'GB' : 'GS';
      setEmployeeId(`${prefix}-0${branchCount}`);
      setErrorMsg('');
      setSubmittedEmployee(null);
    }
  }, [branch, isOpen, existingEmployees]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = name.trim();
    const trimmedId = employeeId.trim().toUpperCase();
    const trimmedPin = pin.trim();

    if (!trimmedName) {
      setErrorMsg('অনুগ্রহ করে পূর্ণ নাম প্রদান করুন। (Please enter full name)');
      return;
    }

    if (!trimmedId) {
      setErrorMsg('অনুগ্রহ করে পছন্দের ইউজার আইডি প্রদান করুন। (Please enter unique user ID)');
      return;
    }

    if (trimmedId === 'RAJI_SIR') {
      setErrorMsg('RAJI_SIR আইডিটি সংরক্ষিত। অনুগ্রহ করে অন্য কোনো আইডি ব্যবহার করুন।');
      return;
    }

    if (trimmedPin.length < 4) {
      setErrorMsg('সিকিউরিটি পাসওয়ার্ড/পিন কমপক্ষে ৪ সংখ্যার হতে হবে। (PIN must be at least 4 digits)');
      return;
    }

    // Check duplicate ID
    const exists = existingEmployees.some(
      (emp) => emp.employee_id.toUpperCase() === trimmedId
    );
    if (exists) {
      setErrorMsg(`এই আইডি (${trimmedId}) ইতিমধ্যে নিবন্ধিত আছে। অনুগ্রহ করে অন্য আইডি পছন্দ করুন।`);
      return;
    }

    // Dynamic avatar color
    const colors = ['#4f46e5', '#10b981', '#0284c7', '#d97706', '#8b5cf6', '#ec4899', '#059669'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      employee_id: trimmedId,
      name: trimmedName,
      pin: trimmedPin,
      role: role,
      branch: branch,
      is_active: false, // Inactive until approved by Raji Sir
      approval_status: 'pending', // Pending approval
      phone: phone.trim() || undefined,
      joined_date: new Date().toISOString().split('T')[0],
      notes: notes.trim() || `${branch === 'chowrasta' ? 'গাজীপুর ব্রাঞ্চ' : 'গাজীপুর সদর অফিস'} কর্মী`,
      avatar_color: randomColor,
    };

    onSignUpSuccess(newEmployee);
    setSubmittedEmployee(newEmployee);
  };

  const handleCloseSuccess = () => {
    setSubmittedEmployee(null);
    setName('');
    setPhone('');
    setNotes('');
    onClose();
  };

  // Submitted Pending Approval Screen
  if (submittedEmployee) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 text-center space-y-4">
          {/* Animated Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>রাজি স্যারের অনুমোদনের অপেক্ষায় (Pending Approval)</span>
            </span>
            <h3 className="text-lg font-bold text-white">রেজিস্ট্রেশন সফলভাবে জমা হয়েছে!</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              আপনার তথ্য সংরক্ষিত হয়েছে। সিস্টেমে কাজ শুরু করতে কেন্দ্রীয় কতৃপক্ষ <strong className="text-amber-400">শ্রদ্ধেয় রাজি স্যার</strong>-এর চূড়ান্ত অনুমোদন প্রয়োজন।
            </p>
          </div>

          {/* Credentials summary */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2">
              <span>কর্মীর নাম:</span>
              <span className="font-bold text-white">{submittedEmployee.name}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2">
              <span>লগইন ইউজার আইডি:</span>
              <span className="font-mono font-bold text-emerald-400">{submittedEmployee.employee_id}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2">
              <span>কর্মস্থল / ব্রাঞ্চ:</span>
              <span className="font-semibold text-sky-300">
                {submittedEmployee.branch === 'chowrasta' ? '১. গাজীপুর ব্রাঞ্চ (চৌরাস্তা)' : '২. গাজীপুর সদর অফিস (রাজবাড়ি রোড)'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>বর্তমান স্ট্যাটাস:</span>
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                পেন্ডিং (অনুমোদন বাকি)
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-xl text-left text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>পরবর্তী ধাপ:</strong> রাজি স্যার তাঁর সেন্ট্রাল ড্যাশবোর্ড থেকে আপনার আবেদন <strong>অনুমোদন (Approve)</strong> করলেই আপনি এই আইডি ও পিন দিয়ে সাইন ইন করতে পারবেন।
            </div>
          </div>

          <button
            type="button"
            id="close-pending-success-btn"
            onClick={handleCloseSuccess}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ঠিক আছে, বুঝেছি (Close)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="signup-modal-container"
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>এমপ্লয়ী সাইন আপ</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  কর্মী রেজিস্ট্রেশন
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                গাজীপুর সেল-এর সকল কর্মী নিজ নিজ আইডি ও পাসওয়ার্ড দিয়ে একাউন্ট তৈরি করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Bar */}
        <div className="px-6 py-3 bg-amber-950/30 border-b border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>অনুমোদন পদ্ধতি:</strong> আপনার নাম, ব্রাঞ্চ, নিজস্ব <strong>ইউজার আইডি</strong> এবং ৪-সংখ্যার গোপন <strong>পিন</strong> দিয়ে সাইন আপ করুন। রেজিস্ট্রেশন করার পর আবেদনটি কেন্দ্রীয় কতৃপক্ষ <strong>রাজি স্যার</strong>-এর ড্যাশবোর্ডে অনুমোদনের জন্য পেন্ডিং থাকবে। তিনি অনুমোদন করলেই আপনি সিস্টেমে লগইন করতে পারবেন।
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              কর্মীর পূর্ণ নাম (Full Name) *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: তানজিলা আক্তার / রফিকুল ইসলাম"
                className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Branch / Office Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              কর্মস্থল / ব্রাঞ্চ নির্ধারণ (Select Branch) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setBranch('chowrasta')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  branch === 'chowrasta'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-xs'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-emerald-300">১. গাজীপুর ব্রাঞ্চ</div>
                  <div className="text-[10px] text-slate-400">চৌরাস্তা শাখা • অপারেশনস</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBranch('rajbari')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  branch === 'rajbari'
                    ? 'bg-sky-500/15 border-sky-500/50 text-white shadow-xs'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                <Landmark className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-sky-300">২. গাজীপুর সদর অফিস</div>
                  <div className="text-[10px] text-slate-400">রাজবাড়ি রোড • সদর সেল</div>
                </div>
              </button>
            </div>
          </div>

          {/* Row: ID & PIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                আপনার পছন্দের ইউজার আইডি (Custom Login ID) *
              </label>
              <input
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                placeholder="যেমন: GB-03 / GS-04"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase"
              />
              <p className="text-[10px] text-slate-400 mt-1">লগইন করার সময় এই আইডি ব্যবহার করবেন</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                গোপন পাসওয়ার্ড / পিন (PIN / Password) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="যেমন: 1234 বা 5678"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">কমপক্ষে ৪ সংখ্যার গোপন পিন দিন</p>
            </div>
          </div>

          {/* Role selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              পদবি ও কর্মক্ষেত্র (Designation / Department) *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="office_assistant">অফিস সহকারী (Office Assistant)</option>
              <option value="front_desk">ফ্রন্ট ডেস্ক ও রিসেপশন (Front Desk & Reception)</option>
              <option value="accounts">অ্যাকাউন্টস ও প্রোগ্রাম (Accounts & Finance)</option>
              <option value="customer_service">কাস্টমার সার্ভিস ও সেলস (Customer Service)</option>
              <option value="logistics">লজিস্টিকস ও ফ্যাসিলিটি (Logistics Care)</option>
              <option value="field_coordinator">মাঠ সমন্বয়কারী (Field Coordinator)</option>
              <option value="general_staff">সাধারণ কর্মী (General Staff)</option>
            </select>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              মোবাইল নম্বর (Phone Number) - ঐচ্ছিক
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="যেমন: 017XXXXXXXX"
                className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Notes / Responsibility */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              দায়িত্ব বিবরণী / কাজের নোট (Notes)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="প্রধান দায়িত্ব বা শাখা সম্পর্কিত সংক্ষিপ্ত তথ্য..."
              className="w-full p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>সাইন আপ আবেদন জমা দিন (রাজি স্যারের অনুমোদনের জন্য)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Notice about Raji Sir */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>কতৃপক্ষ হিসেবে একমাত্র <strong>রাজি স্যার</strong>-এর অ্যাকাউন্ট বিদ্যমান।</span>
            </span>
            {onOpenRajiSirSignIn && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRajiSirSignIn();
                }}
                className="text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1 shrink-0 ml-2"
              >
                <Crown className="w-3 h-3" />
                <span>রাজি স্যার সাইন ইন</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
