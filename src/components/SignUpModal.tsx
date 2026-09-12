import React, { useState, useEffect } from 'react';
import { Employee, BranchId, UserRole } from '../types';

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
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!trimmedId) {
      setErrorMsg('Please enter a unique user ID.');
      return;
    }

    if (trimmedId === 'RAJI_SIR') {
      setErrorMsg('The ID RAJI_SIR is reserved. Please choose another ID.');
      return;
    }

    if (trimmedPin.length < 4) {
      setErrorMsg('PIN must be at least 4 digits.');
      return;
    }

    // Check duplicate ID
    const exists = existingEmployees.some(
      (emp) => emp.employee_id.toUpperCase() === trimmedId
    );
    if (exists) {
      setErrorMsg(`This ID (${trimmedId}) is already registered. Please choose another ID.`);
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
      notes: notes.trim() || `${branch === 'chowrasta' ? 'Gazipur Branch' : 'Gazipur Sadar Office'} Staff`,
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
      <div id="signup-success-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs">
        <div id="signup-success-card" className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 text-center space-y-4">
          <div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block mb-2">
              Pending Approval by Raji Sir
            </span>
            <h3 className="text-lg font-bold text-white">Registration Submitted Successfully</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Your profile information is recorded. To begin work on the platform, authorization from Central Director <strong>Raji Sir</strong> is required.
            </p>
          </div>

          {/* Credentials summary */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2">
              <span>Staff Name:</span>
              <span className="font-bold text-white">{submittedEmployee.name}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2">
              <span>Login ID:</span>
              <span className="font-mono font-bold text-emerald-400">{submittedEmployee.employee_id}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2">
              <span>Workplace Branch:</span>
              <span className="font-semibold text-sky-300">
                {submittedEmployee.branch === 'chowrasta' ? '1. Gazipur Branch' : '2. Gazipur Sadar Office'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Status:</span>
              <span className="text-amber-400 font-bold">
                Pending Authorization
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-xl text-left text-xs text-amber-200/90 leading-relaxed">
            <strong>Next Step:</strong> Once Raji Sir approves your registration from the Central Director Dashboard, you will be able to sign in immediately using this ID and PIN.
          </div>

          <button
            type="button"
            id="close-pending-success-btn"
            onClick={handleCloseSuccess}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            Understood (Close)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="signup-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div
        id="signup-modal-container"
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Staff Sign Up</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Registration
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Register employee account with personal ID and security PIN
            </p>
          </div>
          <button
            id="btn-close-signup-modal"
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700"
          >
            Close
          </button>
        </div>

        {/* Notice Bar */}
        <div className="px-6 py-3 bg-amber-950/30 border-b border-amber-900/40 text-xs text-amber-200 leading-relaxed">
          <strong>Approval Policy:</strong> Register with your name, branch, custom <strong>User ID</strong>, and a 4-digit secret <strong>PIN</strong>. Upon submission, the profile will be queued in <strong>Raji Sir</strong>'s Central Dashboard for approval.
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
              Full Name *
            </label>
            <input
              id="signup-input-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tanjila Akter / Rafiqul Islam"
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Branch / Office Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Select Workplace Branch *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                id="signup-branch-chowrasta"
                onClick={() => setBranch('chowrasta')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  branch === 'chowrasta'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-emerald-300">1. Gazipur Branch</div>
                <div className="text-[10px] text-slate-400">Chowrasta Branch • Operations</div>
              </button>

              <button
                type="button"
                id="signup-branch-rajbari"
                onClick={() => setBranch('rajbari')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  branch === 'rajbari'
                    ? 'bg-sky-500/15 border-sky-500/50 text-white'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-sky-300">2. Gazipur Sadar Office</div>
                <div className="text-[10px] text-slate-400">Rajbari Road • Sadar Cell</div>
              </button>
            </div>
          </div>

          {/* Row: ID & PIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Custom Login User ID *
              </label>
              <input
                id="signup-input-id"
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                placeholder="e.g. GB-03 / GS-04"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase"
              />
              <p className="text-[10px] text-slate-400 mt-1">Use this ID when signing in</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                PIN / Password *
              </label>
              <input
                id="signup-input-pin"
                type="text"
                required
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="e.g. 1234"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">At least 4 digits</p>
            </div>
          </div>

          {/* Role selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Designation / Department *
            </label>
            <select
              id="signup-select-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="office_assistant">Office Assistant</option>
              <option value="front_desk">Front Desk &amp; Reception</option>
              <option value="accounts">Accounts &amp; Finance</option>
              <option value="customer_service">Customer Service</option>
              <option value="logistics">Logistics Care</option>
              <option value="field_coordinator">Field Coordinator</option>
              <option value="general_staff">General Staff</option>
            </select>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Phone Number (Optional)
            </label>
            <input
              id="signup-input-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 017XXXXXXXX"
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Responsibility / Notes
            </label>
            <textarea
              id="signup-input-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Brief summary of duties..."
              className="w-full p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="signup-submit-btn"
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all text-center"
            >
              Submit Registration for Authorization
            </button>
          </div>

          {/* Notice about Raji Sir */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Central authority is managed by <strong>Raji Sir</strong>.</span>
            {onOpenRajiSirSignIn && (
              <button
                type="button"
                id="signup-open-raji-sir"
                onClick={() => {
                  onClose();
                  onOpenRajiSirSignIn();
                }}
                className="text-amber-400 hover:text-amber-300 font-bold underline shrink-0 ml-2"
              >
                Raji Sir Sign In
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
