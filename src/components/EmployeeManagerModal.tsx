import React, { useState } from 'react';
import { Employee, SYSTEM_ROLES, UserRole, BRANCHES, BranchId } from '../types';
import {
  UserPlus,
  UserCheck,
  UserX,
  X,
  Edit2,
  Shield,
  Briefcase,
  Phone,
  Calendar,
  Save,
  Trash2,
  Building2,
  Landmark,
} from 'lucide-react';

interface EmployeeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onSaveEmployee: (employee: Employee) => void;
  onToggleStatus: (employeeId: string, isActive: boolean) => void;
}

const AVATAR_COLORS = [
  '#10b981', // emerald
  '#0ea5e9', // sky
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#14b8a6', // teal
  '#6366f1', // indigo
];

export const EmployeeManagerModal: React.FC<EmployeeManagerModalProps> = ({
  isOpen,
  onClose,
  employees,
  onSaveEmployee,
  onToggleStatus,
}) => {
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [branchFilter, setBranchFilter] = useState<BranchId>('all');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleStartNew = () => {
    const nextNum = employees.length + 1;
    const padded = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    setEditingEmployee({
      id: `emp-${Date.now()}`,
      employee_id: `EMP-${padded}`,
      name: '',
      pin: '1234',
      role: 'general_staff',
      branch: 'chowrasta',
      is_active: true,
      phone: '',
      joined_date: new Date().toISOString().split('T')[0],
      notes: '',
      avatar_color: AVATAR_COLORS[nextNum % AVATAR_COLORS.length],
    });
    setErrorMsg('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    if (!editingEmployee.name?.trim()) {
      setErrorMsg('কর্মীর নাম প্রদান করা আবশ্যক।');
      return;
    }
    if (!editingEmployee.employee_id?.trim()) {
      setErrorMsg('কর্মীর আইডি (Login ID) আবশ্যক।');
      return;
    }
    if (!editingEmployee.pin?.trim()) {
      setErrorMsg('পাসওয়ার্ড বা পিন (PIN) আবশ্যক।');
      return;
    }

    onSaveEmployee(editingEmployee as Employee);
    setEditingEmployee(null);
    setErrorMsg('');
  };

  const filteredEmployees = employees.filter((e) => {
    if (filter === 'active' && !e.is_active) return false;
    if (filter === 'inactive' && e.is_active) return false;
    if (branchFilter !== 'all') {
      const b = e.branch || (e.employee_id.startsWith('RB-') || e.employee_id === 'SUP-RAJB' ? 'rajbari' : 'chowrasta');
      if (b !== branchFilter) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="employee-manager-modal"
        className="relative w-full max-w-2xl bg-[#14161a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">কর্মী ও পদায়ন ব্যবস্থাপনা</h2>
              <p className="text-xs text-[#8e9299]">
                নতুন কর্মী নিয়োগ, রোলে পদায়ন এবং কর্মী সক্রিয়/নিষ্ক্রিয় করুন
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

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Top action bar: Filter & Add New */}
          <div className="space-y-2 pb-2 border-b border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Active/Inactive Status Filter */}
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-white/[0.03] border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    filter === 'all' ? 'bg-white/20 text-white' : 'text-[#8e9299] hover:text-white'
                  }`}
                >
                  সকল ({employees.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('active')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    filter === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'text-[#8e9299] hover:text-white'
                  }`}
                >
                  সক্রিয় ({employees.filter((e) => e.is_active).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('inactive')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    filter === 'inactive' ? 'bg-red-500/20 text-red-400' : 'text-[#8e9299] hover:text-white'
                  }`}
                >
                  বাতিল ({employees.filter((e) => !e.is_active).length})
                </button>
              </div>

              {/* Branch Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-white/[0.03] border border-white/10 text-xs">
                <span className="text-[10px] text-[#8e9299] px-1 font-semibold">ব্রাঞ্চ:</span>
                <button
                  type="button"
                  onClick={() => setBranchFilter('all')}
                  className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${
                    branchFilter === 'all' ? 'bg-amber-500/20 text-amber-300' : 'text-[#8e9299] hover:text-white'
                  }`}
                >
                  উভয়
                </button>
                <button
                  type="button"
                  onClick={() => setBranchFilter('chowrasta')}
                  className={`px-2 py-1 rounded-md text-xs font-bold transition-colors flex items-center gap-1 ${
                    branchFilter === 'chowrasta'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-[#8e9299] hover:text-emerald-300'
                  }`}
                >
                  <Building2 className="w-3 h-3" />
                  <span>চৌরাস্তা</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBranchFilter('rajbari')}
                  className={`px-2 py-1 rounded-md text-xs font-bold transition-colors flex items-center gap-1 ${
                    branchFilter === 'rajbari'
                      ? 'bg-sky-500/20 text-sky-400'
                      : 'text-[#8e9299] hover:text-sky-300'
                  }`}
                >
                  <Landmark className="w-3 h-3" />
                  <span>রাজবাড়ি</span>
                </button>
              </div>

              <button
                onClick={handleStartNew}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>নতুন কর্মী নিয়োগ</span>
              </button>
            </div>
          </div>

          {/* Add / Edit Form */}
          {editingEmployee && (
            <form onSubmit={handleSave} className="p-4 rounded-xl bg-white/[0.04] border border-emerald-500/30 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  {editingEmployee.id?.startsWith('emp-') && !employees.some((e) => e.id === editingEmployee.id)
                    ? 'নতুন কর্মী নিবন্ধন ও পদায়ন'
                    : 'কর্মী ও রোল তথ্য সম্পাদনা'}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="text-xs text-[#8e9299] hover:text-white"
                >
                  বাতিল
                </button>
              </div>

              {errorMsg && (
                <div className="p-2 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#8e9299] mb-1">কর্মীর পূর্ণ নাম *</label>
                  <input
                    type="text"
                    value={editingEmployee.name || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                    placeholder="যেমন: মো. রহিম উদ্দিন"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8e9299] mb-1">ব্রাঞ্চ নির্ধারণ *</label>
                  <select
                    value={editingEmployee.branch || 'chowrasta'}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, branch: e.target.value as 'chowrasta' | 'rajbari' })}
                    className="w-full px-3 py-2 bg-[#1c1f24] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="chowrasta">🏢 ১। চৌরাস্তা ব্রাঞ্চ (Chowrasta Branch)</option>
                    <option value="rajbari">🏛️ ২। রাজবাড়ি ব্রাঞ্চ (Rajbari Branch)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8e9299] mb-1">পদায়ন / রোল নির্বাচন করুন *</label>
                  <select
                    value={editingEmployee.role || 'general_staff'}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-[#1c1f24] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {SYSTEM_ROLES.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.titleBn} ({role.titleEn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8e9299] mb-1">এমপ্লয়ী আইডি (Login ID) *</label>
                  <input
                    type="text"
                    value={editingEmployee.employee_id || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, employee_id: e.target.value.toUpperCase() })}
                    placeholder="CR-05 বা RB-05"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white uppercase focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8e9299] mb-1">লগইন পিন / পাসওয়ার্ড (PIN) *</label>
                  <input
                    type="text"
                    value={editingEmployee.pin || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, pin: e.target.value })}
                    placeholder="1234"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8e9299] mb-1">ফোন নম্বর</label>
                  <input
                    type="text"
                    value={editingEmployee.phone || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                    placeholder="017xxxxxxxx"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8e9299] mb-1">যোগদানের তারিখ</label>
                  <input
                    type="date"
                    value={editingEmployee.joined_date || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, joined_date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1c1f24] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8e9299] mb-1">মন্তব্য বা কাজের পরিধি (Notes)</label>
                <input
                  type="text"
                  value={editingEmployee.notes || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, notes: e.target.value })}
                  placeholder="যেমন: ফ্রন্ট ডেস্ক তত্ত্বাবধান ও কাস্টমার কোঅর্ডিনেশন"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-3 py-1.5 text-xs text-[#8e9299] hover:text-white"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>সংরক্ষণ ও পদায়ন করুন</span>
                </button>
              </div>
            </form>
          )}

          {/* Employee Roster List */}
          <div className="space-y-2.5">
            {filteredEmployees.map((emp) => {
              const roleDef = SYSTEM_ROLES.find((r) => r.id === emp.role);
              const isSupervisor = emp.role === 'office_assistant';

              return (
                <div
                  key={emp.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    emp.is_active
                      ? 'bg-white/[0.02] border-white/10 hover:border-white/20'
                      : 'bg-red-500/[0.02] border-red-500/20 opacity-70'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: emp.avatar_color || '#3b82f6' }}
                    >
                      {emp.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-white">{emp.name}</span>
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                          {emp.employee_id}
                        </span>
                        {emp.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <UserCheck className="w-3 h-3" /> সক্রিয়
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-red-400 font-semibold px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                            <UserX className="w-3 h-3" /> বাতিল / নিষ্ক্রিয়
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md border font-medium ${
                            roleDef?.badgeBg || 'bg-white/10'
                          } ${roleDef?.badgeText || 'text-white/80'} ${
                            roleDef?.badgeBorder || 'border-white/10'
                          }`}
                        >
                          {roleDef?.titleBn || emp.role}
                        </span>

                        {/* Branch badge */}
                        {emp.role === 'main_boss' || emp.employee_id === 'RAJI_SIR' ? (
                          <span className="text-xs px-2 py-0.5 rounded-md border font-bold bg-amber-500/15 text-amber-300 border-amber-500/30 flex items-center gap-1">
                            👑 উভয় ব্রাঞ্চ (সেন্ট্রাল)
                          </span>
                        ) : (emp.branch === 'rajbari' || emp.employee_id.startsWith('RB-') || emp.employee_id === 'SUP-RAJB') ? (
                          <span className="text-xs px-2 py-0.5 rounded-md border font-bold bg-sky-500/15 text-sky-400 border-sky-500/30 flex items-center gap-1">
                            <Landmark className="w-3 h-3" /> রাজবাড়ি ব্রাঞ্চ
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-md border font-bold bg-emerald-500/15 text-emerald-400 border-emerald-500/30 flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> চৌরাস্তা ব্রাঞ্চ
                          </span>
                        )}

                        {emp.phone && (
                          <span className="text-xs text-[#8e9299] flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {emp.phone}
                          </span>
                        )}
                        {emp.joined_date && (
                          <span className="text-xs text-[#8e9299] flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {emp.joined_date}
                          </span>
                        )}
                      </div>

                      {emp.notes && (
                        <p className="text-xs text-[#8e9299] mt-1 truncate">{emp.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Edit & Toggle Status */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingEmployee(emp)}
                      title="কর্মী বা পদায়ন সম্পাদনা করুন"
                      className="p-1.5 text-xs text-[#8e9299] hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="sm:hidden">এডিট</span>
                    </button>

                    {!isSupervisor && (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(emp.employee_id, !emp.is_active)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors border flex items-center gap-1 ${
                          emp.is_active
                            ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        }`}
                      >
                        {emp.is_active ? (
                          <>
                            <UserX className="w-3 h-3" />
                            <span>বাতিল / নিষ্ক্রিয়</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>পুনরায় সক্রিয়</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
