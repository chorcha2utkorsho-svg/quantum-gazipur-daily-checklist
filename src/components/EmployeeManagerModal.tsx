import React, { useState } from 'react';
import { Employee, SYSTEM_ROLES, UserRole, BranchId } from '../types';
import { getWorkflowForEmployee } from '../data/workflowData';

interface EmployeeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onSaveEmployee: (employee: Employee) => void;
  onToggleStatus: (employeeId: string, isActive: boolean) => void;
  onApproveEmployee?: (employeeId: string) => void;
  onRejectEmployee?: (employeeId: string) => void;
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
  onApproveEmployee,
  onRejectEmployee,
}) => {
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
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
      setErrorMsg('Employee name is required.');
      return;
    }
    if (!editingEmployee.employee_id?.trim()) {
      setErrorMsg('Employee ID (Login ID) is required.');
      return;
    }
    if (!editingEmployee.pin?.trim()) {
      setErrorMsg('Password or PIN is required.');
      return;
    }

    onSaveEmployee(editingEmployee as Employee);
    setEditingEmployee(null);
    setErrorMsg('');
  };

  const pendingCount = employees.filter((e) => e.approval_status === 'pending').length;

  const filteredEmployees = employees.filter((e) => {
    if (filter === 'active' && (!e.is_active || e.approval_status === 'pending' || e.approval_status === 'rejected')) return false;
    if (filter === 'inactive' && (e.is_active || e.approval_status === 'pending')) return false;
    if (filter === 'pending' && e.approval_status !== 'pending') return false;
    if (branchFilter !== 'all') {
      const b =
        e.branch ||
        (e.employee_id.startsWith('SO-') ||
        e.employee_id.startsWith('RB-') ||
        e.employee_id === 'SUP-RAJB' ||
        e.employee_id === 'JAHID'
          ? 'rajbari'
          : 'chowrasta');
      if (b !== branchFilter) return false;
    }
    return true;
  });

  return (
    <div id="employee-manager-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        id="employee-manager-modal"
        className="relative w-full max-w-2xl bg-[#14161a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div>
            <h2 className="text-base font-semibold text-white">Staff &amp; Role Management</h2>
            <p className="text-xs text-[#8e9299]">
              Register staff, assign workflow roles, approve pending sign-ups, and manage accounts
            </p>
          </div>
          <button
            id="btn-close-emp-modal"
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg text-xs text-[#8e9299] hover:text-white hover:bg-white/10 transition-colors border border-white/10"
          >
            Close
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Top action bar: Filter & Add New */}
          <div className="space-y-2 pb-2 border-b border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Active/Inactive/Pending Status Filter */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-white/[0.03] border border-white/10 text-xs">
                <button
                  type="button"
                  id="filter-status-all"
                  onClick={() => setFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    filter === 'all' ? 'bg-white/20 text-white' : 'text-[#8e9299] hover:text-white'
                  }`}
                >
                  All ({employees.length})
                </button>
                <button
                  type="button"
                  id="filter-status-active"
                  onClick={() => setFilter('active')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    filter === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'text-[#8e9299] hover:text-white'
                  }`}
                >
                  Active ({employees.filter((e) => e.is_active && e.approval_status !== 'pending' && e.approval_status !== 'rejected').length})
                </button>
                <button
                  type="button"
                  id="filter-status-pending"
                  onClick={() => setFilter('pending')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    filter === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                      : pendingCount > 0
                      ? 'text-amber-400 hover:text-white font-bold'
                      : 'text-[#8e9299] hover:text-white'
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  type="button"
                  id="filter-status-inactive"
                  onClick={() => setFilter('inactive')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    filter === 'inactive' ? 'bg-red-500/20 text-red-400' : 'text-[#8e9299] hover:text-white'
                  }`}
                >
                  Inactive ({employees.filter((e) => !e.is_active && e.approval_status !== 'pending').length})
                </button>
              </div>

              {/* Branch Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-white/[0.03] border border-white/10 text-xs">
                <span className="text-[10px] text-[#8e9299] px-1 font-semibold">Office:</span>
                <button
                  type="button"
                  id="filter-branch-all"
                  onClick={() => setBranchFilter('all')}
                  className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${
                    branchFilter === 'all' ? 'bg-amber-500/20 text-amber-300' : 'text-[#8e9299] hover:text-white'
                  }`}
                >
                  Both
                </button>
                <button
                  type="button"
                  id="filter-branch-chowrasta"
                  onClick={() => setBranchFilter('chowrasta')}
                  className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${
                    branchFilter === 'chowrasta'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-[#8e9299] hover:text-emerald-300'
                  }`}
                >
                  Gazipur Branch
                </button>
                <button
                  type="button"
                  id="filter-branch-rajbari"
                  onClick={() => setBranchFilter('rajbari')}
                  className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${
                    branchFilter === 'rajbari'
                      ? 'bg-sky-500/20 text-sky-400'
                      : 'text-[#8e9299] hover:text-sky-300'
                  }`}
                >
                  Sadar Office
                </button>
              </div>

              <button
                id="btn-add-new-staff"
                onClick={handleStartNew}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                Add New Staff
              </button>
            </div>
          </div>

          {/* Add / Edit Form */}
          {editingEmployee && (
            <form onSubmit={handleSave} className="p-4 rounded-xl bg-white/[0.04] border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {editingEmployee.id?.startsWith('emp-') && !employees.some((e) => e.id === editingEmployee.id)
                    ? 'Register & Assign New Staff'
                    : 'Edit Staff & Role Information'}
                </span>
                <button
                  type="button"
                  id="btn-cancel-edit-staff"
                  onClick={() => setEditingEmployee(null)}
                  className="text-xs text-[#8e9299] hover:text-white"
                >
                  Cancel
                </button>
              </div>

              {errorMsg && (
                <div className="p-2 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#8e9299] mb-1">Full Name *</label>
                  <input
                    id="edit-emp-name"
                    type="text"
                    value={editingEmployee.name || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                    placeholder="e.g. Mohammad Rahim"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8e9299] mb-1">Assign Office *</label>
                  <select
                    id="edit-emp-branch"
                    value={editingEmployee.branch || 'chowrasta'}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, branch: e.target.value as 'chowrasta' | 'rajbari' })}
                    className="w-full px-3 py-2 bg-[#1c1f24] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="chowrasta">1. Gazipur Branch</option>
                    <option value="rajbari">2. Gazipur Sadar Office</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8e9299] mb-1">Select Workflow Role *</label>
                  <select
                    id="edit-emp-role"
                    value={editingEmployee.role || 'general_staff'}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-[#1c1f24] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {SYSTEM_ROLES.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.titleEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8e9299] mb-1">Employee ID (Login ID) *</label>
                  <input
                    id="edit-emp-id"
                    type="text"
                    value={editingEmployee.employee_id || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, employee_id: e.target.value.toUpperCase() })}
                    placeholder="CR-05 or RB-05"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white uppercase focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8e9299] mb-1">Login PIN / Password *</label>
                  <input
                    id="edit-emp-pin"
                    type="text"
                    value={editingEmployee.pin || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, pin: e.target.value })}
                    placeholder="1234"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8e9299] mb-1">Phone Number</label>
                  <input
                    id="edit-emp-phone"
                    type="text"
                    value={editingEmployee.phone || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                    placeholder="017xxxxxxxx"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8e9299] mb-1">Joining Date</label>
                  <input
                    id="edit-emp-date"
                    type="date"
                    value={editingEmployee.joined_date || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, joined_date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1c1f24] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8e9299] mb-1">Notes &amp; Responsibilities</label>
                <input
                  id="edit-emp-notes"
                  type="text"
                  value={editingEmployee.notes || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, notes: e.target.value })}
                  placeholder="e.g. Front desk coordination and donor reception"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-3 py-1.5 text-xs text-[#8e9299] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-staff"
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Save &amp; Assign Staff
                </button>
              </div>
            </form>
          )}

          {/* Employee Roster List */}
          <div className="space-y-2.5">
            {filteredEmployees.map((emp) => {
              const roleDef = SYSTEM_ROLES.find((r) => r.id === emp.role);
              const isSupervisor = emp.role === 'office_assistant';
              const workflow = getWorkflowForEmployee(emp.employee_id, emp.name);

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
                        {emp.approval_status === 'pending' ? (
                          <span className="text-[10px] text-amber-300 font-bold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40">
                            Pending Authorization
                          </span>
                        ) : emp.approval_status === 'rejected' ? (
                          <span className="text-[10px] text-red-400 font-bold px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40">
                            Declined
                          </span>
                        ) : emp.is_active ? (
                          <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] text-red-400 font-semibold px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                            Inactive
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
                          {roleDef?.titleEn || emp.role}
                        </span>

                        {/* Branch badge */}
                        {emp.role === 'main_boss' || emp.employee_id === 'RAJI_SIR' ? (
                          <span className="text-xs px-2 py-0.5 rounded-md border font-bold bg-amber-500/15 text-amber-300 border-amber-500/30">
                            Both Offices (Central)
                          </span>
                        ) : (emp.branch === 'rajbari' || emp.employee_id.startsWith('SO-') || emp.employee_id.startsWith('RB-') || emp.employee_id === 'SUP-RAJB' || emp.employee_id === 'JAHID') ? (
                          <span className="text-xs px-2 py-0.5 rounded-md border font-bold bg-sky-500/15 text-sky-400 border-sky-500/30">
                            Gazipur Sadar Office
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-md border font-bold bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                            Gazipur Branch
                          </span>
                        )}

                        {emp.phone && (
                          <span className="text-xs text-[#8e9299]">
                            {emp.phone}
                          </span>
                        )}
                        {emp.joined_date && (
                          <span className="text-xs text-[#8e9299]">
                            Joined: {emp.joined_date}
                          </span>
                        )}
                      </div>

                      {emp.notes && (
                        <p className="text-xs text-[#8e9299] mt-1 truncate">{emp.notes}</p>
                      )}

                      {workflow && workflow.categories && workflow.categories.length > 0 && emp.role !== 'main_boss' && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                            {workflow.tasks.length} Tasks
                          </span>
                          {workflow.categories.map((cat) => (
                            <span
                              key={cat.id}
                              className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Approve / Reject or Edit & Toggle Status */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 w-full sm:w-auto justify-end">
                    {emp.approval_status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          id={`btn-approve-${emp.employee_id}`}
                          onClick={() => onApproveEmployee?.(emp.employee_id)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-md shadow-emerald-500/20"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          id={`btn-reject-${emp.employee_id}`}
                          onClick={() => onRejectEmployee?.(emp.employee_id)}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    ) : null}

                    <button
                      type="button"
                      id={`btn-edit-emp-${emp.employee_id}`}
                      onClick={() => setEditingEmployee(emp)}
                      title="Edit staff or role assignment"
                      className="px-2.5 py-1 text-xs text-[#8e9299] hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                    >
                      Edit
                    </button>

                    {!isSupervisor && emp.approval_status !== 'pending' && (
                      <button
                        type="button"
                        id={`btn-toggle-emp-${emp.employee_id}`}
                        onClick={() => onToggleStatus(emp.employee_id, !emp.is_active)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors border ${
                          emp.is_active
                            ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        }`}
                      >
                        {emp.is_active ? 'Deactivate' : 'Reactivate'}
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
