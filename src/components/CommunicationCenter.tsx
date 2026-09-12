import React, { useState, useMemo } from 'react';
import { ClientContact, CallOutcome, Employee } from '../types';
import {
  getStoredContacts,
  addContact,
  deleteContact,
  updateContactCallStatus,
  assignBatchToEmployee,
  calculateCommunicationStats,
} from '../lib/communicationStorage';

interface CommunicationCenterProps {
  currentUser: Employee;
  employees: Employee[];
  selectedBranch?: string;
  onGoToEmployeeProfile?: (employeeId: string) => void;
}

export const CommunicationCenter: React.FC<CommunicationCenterProps> = ({
  currentUser,
  employees,
  selectedBranch = 'all',
}) => {
  const [contacts, setContacts] = useState<ClientContact[]>(() => getStoredContacts());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEmployee, setFilterEmployee] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>(selectedBranch);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Contact Form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newMemberId, setNewMemberId] = useState('');
  const [newCategory, setNewCategory] = useState<'quantum_member' | 'donor' | 'old_student' | 'well_wisher' | 'new_lead'>('quantum_member');
  const [newBranch, setNewBranch] = useState<'chowrasta' | 'rajbari'>('chowrasta');
  const [newAssignedId, setNewAssignedId] = useState(currentUser?.employee_id || 'GB-01');

  // Batch Assign Form (Supervisor assigning 100 members)
  const [batchEmployeeId, setBatchEmployeeId] = useState(employees[1]?.employee_id || 'GB-01');
  const [batchBranch, setBatchBranch] = useState<'chowrasta' | 'rajbari'>('chowrasta');

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const refreshContacts = () => {
    setContacts(getStoredContacts());
  };

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchSearch =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        (c.member_id && c.member_id.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = filterStatus === 'all' || c.call_status === filterStatus;
      const matchEmp = filterEmployee === 'all' || c.assigned_to_id === filterEmployee;
      const matchBr = filterBranch === 'all' || c.branch === filterBranch;

      return matchSearch && matchStatus && matchEmp && matchBr;
    });
  }, [contacts, searchQuery, filterStatus, filterEmployee, filterBranch]);

  // Overall & Filtered Stats
  const stats = useMemo(() => {
    return calculateCommunicationStats(filteredContacts);
  }, [filteredContacts]);

  // Employee-wise performance breakdown
  const employeeStats = useMemo(() => {
    const map = new Map<string, { emp: Employee; contacts: ClientContact[] }>();
    for (const emp of employees) {
      if (emp.role !== 'developer') {
        map.set(emp.employee_id, { emp, contacts: [] });
      }
    }
    for (const c of contacts) {
      if (map.has(c.assigned_to_id)) {
        map.get(c.assigned_to_id)!.contacts.push(c);
      }
    }

    return Array.from(map.values())
      .filter((v) => v.contacts.length > 0)
      .map(({ emp, contacts: empContacts }) => {
        const s = calculateCommunicationStats(empContacts);
        return {
          emp,
          stats: s,
        };
      })
      .sort((a, b) => b.stats.positiveRate - a.stats.positiveRate);
  }, [contacts, employees]);

  const handleStatusChange = (id: string, newStatus: CallOutcome) => {
    updateContactCallStatus(id, newStatus);
    refreshContacts();
    notify(`Status updated: ${getOutcomeLabel(newStatus)}`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from contacts?`)) {
      deleteContact(id);
      refreshContacts();
      notify(`Contact removed: ${name}`);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      notify('Please enter both client name and phone number.');
      return;
    }

    const assignedEmp = employees.find((e) => e.employee_id === newAssignedId);
    const categoryEnMap: Record<string, string> = {
      quantum_member: 'Quantum Member',
      donor: 'Earthen Bank Donor',
      old_student: 'Alumni Student',
      well_wisher: 'Well Wisher',
      new_lead: 'New Prospect',
    };

    addContact({
      name: newName.trim(),
      phone: newPhone.trim(),
      member_id: newMemberId.trim() || undefined,
      category: newCategory,
      category_name_bn: categoryEnMap[newCategory] || 'Member',
      branch: newBranch,
      assigned_to_id: newAssignedId,
      assigned_to_name: assignedEmp ? assignedEmp.name : 'Unknown Staff',
      call_status: 'pending',
      date_assigned: new Date().toISOString().split('T')[0],
    });

    setNewName('');
    setNewPhone('');
    setNewMemberId('');
    setIsAddModalOpen(false);
    refreshContacts();
    notify('New contact added successfully.');
  };

  const handleBatchAssign = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedEmp = employees.find((e) => e.employee_id === batchEmployeeId);
    if (!assignedEmp) return;

    assignBatchToEmployee(assignedEmp.employee_id, assignedEmp.name, batchBranch);
    setIsBatchModalOpen(false);
    refreshContacts();
    notify(`100 Member batch assigned to ${assignedEmp.name}'s file.`);
  };

  const getOutcomeLabel = (status: CallOutcome) => {
    switch (status) {
      case 'positive':
        return 'Positive Conversion';
      case 'negative':
        return 'Negative / Not Interested';
      case 'no_answer':
        return 'No Answer (N/A)';
      case 'unreachable':
        return 'Unreachable';
      case 'inactive':
        return 'Inactive Number';
      case 'pending':
      default:
        return 'Pending Call';
    }
  };

  return (
    <div id="communication-center-container" className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="bg-[#14161a] border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Communication &amp; Calling CRM
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Client &amp; Member Communication and Conversion Monitoring
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              Member calling tracking, positive conversions, negative, no-answer (N/A), and unreachable records per staff file.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-open-add-contact"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition"
            >
              Add Contact
            </button>
            <button
              id="btn-open-batch-assign"
              onClick={() => setIsBatchModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg transition"
            >
              Assign 100 Members
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div id="comm-notification-toast" className="mt-4 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-xs font-medium text-emerald-300">
            {notification}
          </div>
        )}
      </div>

      {/* 1. Value Added Conversion Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {/* Total Members */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-slate-400 text-[11px] font-medium mb-1">Total Contacts</div>
          <div className="text-2xl font-black text-white font-mono">{stats.total}</div>
          <p className="text-[10px] text-slate-400 mt-1">Calls Completed: {stats.called}</p>
        </div>

        {/* Positive Conversion % */}
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 shadow-sm">
          <div className="text-emerald-400 text-[11px] font-bold mb-1">Positive Conversion</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {stats.positiveRate}%
          </div>
          <p className="text-[10px] text-emerald-300 mt-1 font-medium">
            {stats.positiveCount} Positive
          </p>
        </div>

        {/* Negative % */}
        <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-4 shadow-sm">
          <div className="text-rose-400 text-[11px] font-bold mb-1">Negative / Declined</div>
          <div className="text-2xl font-black text-rose-400 font-mono">{stats.negativeRate}%</div>
          <p className="text-[10px] text-rose-300 mt-1 font-medium">
            {stats.negativeCount} Declined
          </p>
        </div>

        {/* No Answer / N/A % */}
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 shadow-sm">
          <div className="text-amber-400 text-[11px] font-bold mb-1">No Answer (N/A)</div>
          <div className="text-2xl font-black text-amber-400 font-mono">{stats.noAnswerRate}%</div>
          <p className="text-[10px] text-amber-300 mt-1 font-medium">{stats.noAnswerCount} No Answer</p>
        </div>

        {/* Unreachable % */}
        <div className="bg-orange-950/30 border border-orange-500/30 rounded-2xl p-4 shadow-sm">
          <div className="text-orange-400 text-[11px] font-bold mb-1">Unreachable / Busy</div>
          <div className="text-2xl font-black text-orange-400 font-mono">
            {stats.unreachableRate}%
          </div>
          <p className="text-[10px] text-orange-300 mt-1 font-medium">
            {stats.unreachableCount} Unreachable
          </p>
        </div>

        {/* Inactive % */}
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 shadow-sm">
          <div className="text-slate-400 text-[11px] font-bold mb-1">Inactive Number</div>
          <div className="text-2xl font-black text-slate-300 font-mono">
            {stats.inactiveRate}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            {stats.inactiveCount} Inactive
          </p>
        </div>
      </div>

      {/* 2. Employee Performance Breakdown */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-sm font-bold text-white">
            Staff-Wise Calling &amp; Conversion Performance Summary
          </h3>
          <span className="text-xs text-slate-400">
            Real-time batch progress per assigned staff
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {employeeStats.map(({ emp, stats: empS }) => (
            <div
              key={emp.id}
              onClick={() => setFilterEmployee(filterEmployee === emp.employee_id ? 'all' : emp.employee_id)}
              className={`p-4 rounded-xl border transition cursor-pointer ${
                filterEmployee === emp.employee_id
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-md'
                  : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">{emp.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-700 text-slate-300">
                  {emp.employee_id}
                </span>
              </div>

              <div className="text-xs text-slate-400 mb-2 flex items-center justify-between">
                <span>Office: {emp.branch === 'chowrasta' ? 'Gazipur Branch' : 'Sadar Office'}</span>
                <span className="font-bold text-slate-200">Total {empS.total} Members</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden flex mb-2">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${empS.positiveRate}%` }}
                  title={`Positive: ${empS.positiveRate}%`}
                />
                <div
                  className="bg-rose-500 h-full"
                  style={{ width: `${empS.negativeRate}%` }}
                  title={`Negative: ${empS.negativeRate}%`}
                />
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${empS.noAnswerRate}%` }}
                  title={`N/A: ${empS.noAnswerRate}%`}
                />
              </div>

              <div className="grid grid-cols-3 text-center text-[10px] pt-1 border-t border-slate-700/60">
                <div>
                  <span className="text-emerald-400 font-bold">{empS.positiveRate}%</span>
                  <div className="text-slate-400">Positive</div>
                </div>
                <div>
                  <span className="text-rose-400 font-bold">{empS.negativeRate}%</span>
                  <div className="text-slate-400">Negative</div>
                </div>
                <div>
                  <span className="text-amber-400 font-bold">{empS.noAnswerRate}%</span>
                  <div className="text-slate-400">N/A</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Search, Filter & Contact List Directory */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <input
              id="comm-search-input"
              type="text"
              placeholder="Search by name, phone or member ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <select
              id="comm-filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2 px-3 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Call Statuses</option>
              <option value="positive">Positive Conversion</option>
              <option value="negative">Negative (Declined)</option>
              <option value="no_answer">No Answer (N/A)</option>
              <option value="unreachable">Unreachable</option>
              <option value="inactive">Inactive Number</option>
              <option value="pending">Call Pending</option>
            </select>
          </div>

          <div>
            <select
              id="comm-filter-employee"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="w-full py-2 px-3 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Staff Files</option>
              {employees
                .filter((e) => e.role !== 'developer')
                .map((e) => (
                  <option key={e.id} value={e.employee_id}>
                    {e.name} ({e.employee_id})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <select
              id="comm-filter-branch"
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="w-full py-2 px-3 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Offices</option>
              <option value="chowrasta">1. Gazipur Branch</option>
              <option value="rajbari">2. Gazipur Sadar Office</option>
            </select>
          </div>
        </div>

        {/* Contacts Count */}
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
          <span>
            Displayed Contacts: <strong className="text-white">{filteredContacts.length}</strong>
          </span>
          <span className="text-[11px] text-slate-500">
            Click on telephone number to initiate call and select outcome
          </span>
        </div>

        {/* Contacts Directory Table / Cards */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {filteredContacts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No contacts found matching the filters.
            </div>
          ) : (
            filteredContacts.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                {/* Left: Contact Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">{c.name}</span>
                    {c.member_id && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-700 text-slate-300">
                        {c.member_id}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {c.category_name_bn}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        c.branch === 'chowrasta'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      }`}
                    >
                      {c.branch === 'chowrasta' ? 'Gazipur Branch' : 'Sadar Office'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Assigned to: <strong className="text-slate-300">{c.assigned_to_name}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <a
                      href={`tel:${c.phone}`}
                      className="text-emerald-400 hover:text-emerald-300 font-mono font-bold transition"
                      title="Click to dial"
                    >
                      {c.phone}
                    </a>
                    {c.last_called_at && (
                      <span className="text-[11px] text-slate-500">
                        Last Called: {c.last_called_at}
                      </span>
                    )}
                    {c.conversion_amount ? (
                      <span className="text-[11px] text-emerald-400 font-semibold">
                        BDT {c.conversion_amount} Conversion
                      </span>
                    ) : null}
                  </div>

                  {c.call_notes && (
                    <p className="text-xs text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
                      Note: {c.call_notes}
                    </p>
                  )}
                </div>

                {/* Right: Outcome Buttons & Delete */}
                <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                  <button
                    onClick={() => handleStatusChange(c.id, 'positive')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      c.call_status === 'positive'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    Positive
                  </button>

                  <button
                    onClick={() => handleStatusChange(c.id, 'negative')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      c.call_status === 'negative'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    Negative
                  </button>

                  <button
                    onClick={() => handleStatusChange(c.id, 'no_answer')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      c.call_status === 'no_answer'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    No Answer (N/A)
                  </button>

                  <button
                    onClick={() => handleStatusChange(c.id, 'unreachable')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      c.call_status === 'unreachable'
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-orange-400 border border-orange-500/30'
                    }`}
                  >
                    Unreachable
                  </button>

                  <button
                    onClick={() => handleStatusChange(c.id, 'inactive')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      c.call_status === 'inactive'
                        ? 'bg-slate-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-600'
                    }`}
                  >
                    Inactive
                  </button>

                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 transition text-xs"
                    title="Remove Contact"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Single Contact Modal */}
      {isAddModalOpen && (
        <div id="modal-add-contact" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white">Add New Client / Member Contact</h4>
              <button
                id="btn-close-add-contact"
                onClick={() => setIsAddModalOpen(false)}
                className="px-2 py-0.5 rounded-lg text-xs text-slate-400 hover:text-white border border-slate-700"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Client / Member Name *
                </label>
                <input
                  id="input-contact-name"
                  type="text"
                  required
                  placeholder="e.g. Md. Fakhrul Alam"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    id="input-contact-phone"
                    type="text"
                    required
                    placeholder="01712-XXXXXX"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Member ID (Optional)
                  </label>
                  <input
                    id="input-contact-member-id"
                    type="text"
                    placeholder="QM-10294"
                    value={newMemberId}
                    onChange={(e) => setNewMemberId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    id="select-contact-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="quantum_member">Quantum Member</option>
                    <option value="donor">Earthen Bank Donor</option>
                    <option value="old_student">Alumni Student</option>
                    <option value="well_wisher">Well Wisher</option>
                    <option value="new_lead">New Prospect</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Office</label>
                  <select
                    id="select-contact-branch"
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="chowrasta">1. Gazipur Branch</option>
                    <option value="rajbari">2. Gazipur Sadar Office</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assign to Staff File
                </label>
                <select
                  id="select-contact-assigned-emp"
                  value={newAssignedId}
                  onChange={(e) => setNewAssignedId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {employees
                    .filter((e) => e.role !== 'developer')
                    .map((e) => (
                      <option key={e.id} value={e.employee_id}>
                        {e.name} ({e.employee_id})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  id="btn-submit-save-contact"
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                >
                  Save Contact
                </button>
                <button
                  id="btn-cancel-add-contact"
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Assign 100 Members Modal */}
      {isBatchModalOpen && (
        <div id="modal-batch-assign" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-lg p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white">
                Assign 100 Member Batch File
              </h4>
              <button
                id="btn-close-batch-assign"
                onClick={() => setIsBatchModalOpen(false)}
                className="px-2 py-0.5 rounded-lg text-xs text-slate-400 hover:text-white border border-slate-700"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Instantly assign a 100-member batch list of Quantum members, donors, and alumni students to the selected staff file.
            </p>

            <form onSubmit={handleBatchAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Staff Member
                </label>
                <select
                  id="select-batch-staff"
                  value={batchEmployeeId}
                  onChange={(e) => setBatchEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {employees
                    .filter((e) => e.role !== 'developer')
                    .map((e) => (
                      <option key={e.id} value={e.employee_id}>
                        {e.name} ({e.employee_id}) - {e.branch === 'chowrasta' ? 'Gazipur Branch' : 'Sadar Office'}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Office Branch
                </label>
                <select
                  id="select-batch-branch"
                  value={batchBranch}
                  onChange={(e) => setBatchBranch(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="chowrasta">1. Gazipur Branch</option>
                  <option value="rajbari">2. Gazipur Sadar Office</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  id="btn-submit-batch-assign"
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition"
                >
                  Assign 100 Members to File
                </button>
                <button
                  id="btn-cancel-batch-assign"
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
