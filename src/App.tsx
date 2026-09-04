/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  RotateCcw,
  SlidersHorizontal,
  Printer,
  Database,
  Search,
  CheckCheck,
  AlertCircle,
  HelpCircle,
  Users,
  LayoutDashboard,
  ShieldCheck,
  UserCheck,
  ArrowRightLeft,
} from 'lucide-react';

import {
  BranchId,
  DailyLogItem,
  DailySummaryStats,
  Employee,
  EmployeeDailyProgress,
  SYSTEM_ROLES,
  TaskTemplate,
  DEFAULT_SUPERVISOR,
  INITIAL_EMPLOYEES,
} from './types';
import {
  fetchDailyLogsForEmployee,
  fetchTaskTemplates,
  upsertDailyLog,
  saveTemplate,
  deleteTemplate,
  getStoredSupabaseConfig,
  fetchEmployees,
  upsertEmployee,
  toggleEmployeeStatus,
  getStoredSession,
  saveStoredSession,
  fetchAllEmployeesComparative,
  saveLocalDailyLogs,
} from './lib/supabase';

import { Header } from './components/Header';
import { StickyProgressBar } from './components/StickyProgressBar';
import { TaskItem } from './components/TaskItem';
import { TaskManagerModal } from './components/TaskManagerModal';
import { SupabaseModal } from './components/SupabaseModal';
import { PrintReportModal } from './components/PrintReportModal';
import { SupervisorDashboard } from './components/SupervisorDashboard';
import { LoginModal } from './components/LoginModal';
import { EmployeeManagerModal } from './components/EmployeeManagerModal';
import { EmployeeInspectionModal } from './components/EmployeeInspectionModal';

export default function App() {
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [currentUser, setCurrentUser] = useState<Employee>(() => getStoredSession() || DEFAULT_SUPERVISOR);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [logs, setLogs] = useState<DailyLogItem[]>([]);
  const [progressList, setProgressList] = useState<EmployeeDailyProgress[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchId>('all');

  const isBoss = currentUser?.role === 'main_boss' || currentUser?.employee_id === 'RAJI_SIR';
  const isSupervisor = currentUser?.role === 'office_assistant' || isBoss;
  const [viewMode, setViewMode] = useState<'supervisor' | 'checklist'>(() =>
    isSupervisor ? 'supervisor' : 'checklist'
  );

  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEmployeeManagerOpen, setIsEmployeeManagerOpen] = useState(false);
  const [isTaskManagerOpen, setIsTaskManagerOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Inspection modal state
  const [inspectedEmployee, setInspectedEmployee] = useState<Employee | null>(null);
  const [inspectedLogs, setInspectedLogs] = useState<DailyLogItem[]>([]);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);

  // Check Supabase connection state
  const checkSupabaseStatus = useCallback(() => {
    const cfg = getStoredSupabaseConfig();
    setIsSupabaseConnected(cfg.isConfigured);
  }, []);

  // Synchronize viewMode whenever user changes
  useEffect(() => {
    if (currentUser?.role === 'office_assistant' || currentUser?.role === 'main_boss' || currentUser?.employee_id === 'RAJI_SIR') {
      setViewMode('supervisor');
    } else {
      setViewMode('checklist');
    }
  }, [currentUser]);

  // Load all app data for selected date and user
  const loadData = useCallback(
    async (date: string, user: Employee) => {
      setIsLoading(true);
      try {
        const [loadedEmployees, loadedTemplates] = await Promise.all([
          fetchEmployees(),
          fetchTaskTemplates(),
        ]);
        setEmployees(loadedEmployees);
        setTemplates(loadedTemplates);

        // Load logs for the currently active user
        const loadedLogs = await fetchDailyLogsForEmployee(date, user.employee_id, loadedTemplates);
        setLogs(loadedLogs);

        // Load comparative overview for supervisor
        const comparative = await fetchAllEmployeesComparative(date, loadedEmployees, loadedTemplates);
        setProgressList(comparative);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    checkSupabaseStatus();
    loadData(selectedDate, currentUser);
  }, [selectedDate, currentUser, loadData, checkSupabaseStatus]);

  // Refresh comparative stats on demand
  const handleRefreshComparative = async () => {
    try {
      const comparative = await fetchAllEmployeesComparative(selectedDate, employees, templates);
      setProgressList(comparative);
    } catch (err) {
      console.error('Error refreshing comparative list:', err);
    }
  };

  // User Login / Switch
  const handleUserLogin = (user: Employee) => {
    setCurrentUser(user);
    saveStoredSession(user);
    loadData(selectedDate, user);
  };

  // Save Employee (Hire or update role)
  const handleSaveEmployee = async (emp: Employee) => {
    const updated = await upsertEmployee(emp);
    setEmployees(updated);
    // Reload comparative stats
    const comparative = await fetchAllEmployeesComparative(selectedDate, updated, templates);
    setProgressList(comparative);
  };

  // Toggle Employee Active/Inactive
  const handleToggleEmployeeStatus = async (employeeId: string, isActive: boolean) => {
    const updated = await toggleEmployeeStatus(employeeId, isActive);
    setEmployees(updated);
    const comparative = await fetchAllEmployeesComparative(selectedDate, updated, templates);
    setProgressList(comparative);
  };

  // Open Inspection modal for specific employee
  const handleInspectEmployee = async (emp: Employee) => {
    setInspectedEmployee(emp);
    const employeeLogs = await fetchDailyLogsForEmployee(selectedDate, emp.employee_id, templates);
    setInspectedLogs(employeeLogs);
    setIsInspectionOpen(true);
  };

  // Summary statistics for active user's checklist
  const stats: DailySummaryStats = useMemo(() => {
    const total = logs.length;
    const done = logs.filter((l) => l.status === 'done').length;
    const pending = total - done;
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, pending, percentage };
  }, [logs]);

  // Celebration confetti when 100% is reached
  const fireCelebration = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#6366f1', '#38bdf8', '#fbbf24'],
    });
  }, []);

  // Toggle status of a task for active user
  const handleToggleStatus = async (taskName: string) => {
    const target = logs.find((l) => l.task_name === taskName);
    if (!target) return;

    const newStatus = target.status === 'done' ? 'pending' : 'done';
    const wasPending = target.status === 'pending';

    const updatedItem: DailyLogItem = {
      ...target,
      status: newStatus,
      completed_at: newStatus === 'done' ? new Date().toISOString() : null,
    };

    const newLogs = logs.map((l) => (l.task_name === taskName ? updatedItem : l));
    setLogs(newLogs);

    // Save to local & Supabase
    await upsertDailyLog(updatedItem);

    // Update comparative state in background
    handleRefreshComparative();

    // Check 100% completion
    const willBeDone = newLogs.filter((l) => l.status === 'done').length;
    if (wasPending && willBeDone === newLogs.length && newLogs.length > 0) {
      fireCelebration();
    }
  };

  // Update pending reason
  const handleUpdateReason = async (taskName: string, reason: string) => {
    const target = logs.find((l) => l.task_name === taskName);
    if (!target) return;

    const updatedItem: DailyLogItem = {
      ...target,
      reason_for_pending: reason,
    };

    const newLogs = logs.map((l) => (l.task_name === taskName ? updatedItem : l));
    setLogs(newLogs);

    await upsertDailyLog(updatedItem);
    handleRefreshComparative();
  };

  // Daily Reset confirmation
  const handleConfirmDailyReset = async () => {
    const resetLogs: DailyLogItem[] = logs.map((l) => ({
      ...l,
      status: 'pending',
      reason_for_pending: '',
      completed_at: null,
    }));
    setLogs(resetLogs);
    saveLocalDailyLogs(selectedDate, resetLogs, currentUser.employee_id);

    for (const item of resetLogs) {
      await upsertDailyLog(item);
    }

    setIsResetConfirmOpen(false);
    handleRefreshComparative();
  };

  // Task Template Management
  const handleSaveTemplate = async (template: TaskTemplate) => {
    const updated = await saveTemplate(template);
    setTemplates(updated);
    loadData(selectedDate, currentUser);
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    const updated = await deleteTemplate(id, name);
    setTemplates(updated);
    loadData(selectedDate, currentUser);
  };

  const handleRestoreDefaults = async () => {
    localStorage.removeItem('qgz_cell_templates');
    const freshTemplates = await fetchTaskTemplates();
    setTemplates(freshTemplates);
    loadData(selectedDate, currentUser);
  };

  // Filter & Search tasks
  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      if (filter === 'done' && item.status !== 'done') return false;
      if (filter === 'pending' && item.status !== 'pending') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.task_name.toLowerCase().includes(q);
        const matchReason = item.reason_for_pending.toLowerCase().includes(q);
        return matchName || matchReason;
      }
      return true;
    });
  }, [logs, filter, searchQuery]);

  const activeRoleDef = SYSTEM_ROLES.find((r) => r.id === currentUser?.role);

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#f4f4f5] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Header */}
      <Header
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onDailyReset={() => setIsResetConfirmOpen(true)}
        onOpenTaskManager={() => setIsTaskManagerOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenEmployeeManager={() => setIsEmployeeManagerOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
        currentUser={currentUser}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        selectedBranch={selectedBranch}
        onSelectBranch={setSelectedBranch}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* If Supervisor View is Active, show the Executive Comparative Dashboard */}
        {isSupervisor && viewMode === 'supervisor' ? (
          <SupervisorDashboard
            selectedDate={selectedDate}
            employees={employees}
            progressList={progressList}
            templates={templates}
            currentUser={currentUser}
            selectedBranch={selectedBranch}
            onSelectBranch={setSelectedBranch}
            onOpenEmployeeManager={() => setIsEmployeeManagerOpen(true)}
            onRefreshData={handleRefreshComparative}
            onInspectEmployee={handleInspectEmployee}
          />
        ) : (
          /* Employee Checklist View */
          <div className="space-y-6">
            {/* Employee Active Session Notice */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: currentUser?.avatar_color || '#10b981' }}
                >
                  {currentUser?.name.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{currentUser?.name}</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/70">
                      {currentUser?.employee_id}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                        activeRoleDef?.badgeBg || 'bg-white/10'
                      } ${activeRoleDef?.badgeText || 'text-white/80'} ${
                        activeRoleDef?.badgeBorder || 'border-white/10'
                      }`}
                    >
                      {activeRoleDef?.titleBn || currentUser?.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#8e9299] mt-0.5">
                    আজকের কাজের তালিকা সম্পন্ন করুন। পেন্ডিং কাজের কারণ উল্লেখ করলে তা সরাসরি অফিস সহকারীর ড্যাশবোর্ডে প্রদর্শিত হবে।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[#8e9299] hover:text-white text-xs font-semibold rounded-lg border border-white/10 transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>আইডি পরিবর্তন</span>
                </button>
              </div>
            </div>

            {/* Sticky Progress Bar */}
            <StickyProgressBar stats={stats} />

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-white/5 border border-white/10 self-start">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    filter === 'all'
                      ? 'bg-emerald-500 text-black shadow-sm'
                      : 'text-[#8e9299] hover:text-white'
                  }`}
                >
                  সকল ({stats.total})
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    filter === 'pending'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-[#8e9299] hover:text-white'
                  }`}
                >
                  পেন্ডিং ({stats.pending})
                </button>
                <button
                  onClick={() => setFilter('done')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    filter === 'done'
                      ? 'bg-emerald-500 text-black shadow-sm'
                      : 'text-[#8e9299] hover:text-white'
                  }`}
                >
                  সম্পন্ন ({stats.done})
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#8e9299] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="কাজ বা কারণ খুঁজুন..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Task Checklist Items */}
            {isLoading ? (
              <div className="py-20 text-center text-xs text-[#8e9299] space-y-2">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>চেকলিস্ট লোড হচ্ছে...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#8e9299] border border-dashed border-white/10 rounded-xl p-8 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto" />
                <p className="font-medium text-white">কোনো কাজ খুঁজে পাওয়া যায়নি</p>
                <p>অনুসন্ধান ফিল্টার পরিবর্তন করে দেখুন অথবা নতুন কাজ যোগ করুন।</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map((item) => (
                  <TaskItem
                    key={item.id || item.task_name}
                    item={item}
                    onToggleStatus={() => handleToggleStatus(item.task_name)}
                    onUpdateReason={(reason) => handleUpdateReason(item.task_name, reason)}
                  />
                ))}
              </div>
            )}

            {/* 100% Completion Milestone Ribbon */}
            {stats.total > 0 && stats.done === stats.total && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-emerald-900/30 to-black border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      আজকের সকল {stats.total}টি কাজ শতভাগ সম্পন্ন হয়েছে!
                    </h3>
                    <p className="text-xs text-[#8e9299]">
                      আপনার রিপোর্ট স্বয়ংক্রিয়ভাবে অফিস সহকারীর পর্যবেক্ষণে প্রস্তুত রয়েছে।
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-4 py-2 rounded text-xs uppercase tracking-widest font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-colors flex items-center gap-1.5 flex-shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  রিপোর্ট প্রিন্ট করুন
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 sm:px-10 py-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-[#8e9299] shrink-0 gap-3">
        <div>Quantum Gazipur cell • Raji sir Team Operations & Decision Management</div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <span>
            ডাটাবেজ:{' '}
            <span className={isSupabaseConnected ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
              {isSupabaseConnected ? 'Supabase Active' : 'Offline / Local'}
            </span>
          </span>
          <button onClick={() => setIsSupabaseModalOpen(true)} className="hover:text-white transition-colors">
            ডাটাবেজ কনফিগ
          </button>
          <button onClick={() => setIsLoginModalOpen(true)} className="hover:text-white transition-colors">
            ইউজার সুইচ
          </button>
          {isSupervisor && (
            <button onClick={() => setIsEmployeeManagerOpen(true)} className="hover:text-white transition-colors">
              কর্মী পদায়ন
            </button>
          )}
          <button onClick={() => setIsPrintModalOpen(true)} className="hover:text-white transition-colors">
            প্রিন্ট রিপোর্ট
          </button>
        </div>
      </footer>

      {/* User Login & Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        employees={employees}
        currentUserId={currentUser?.employee_id}
        onLoginSuccess={handleUserLogin}
      />

      {/* Employee Manager Modal */}
      <EmployeeManagerModal
        isOpen={isEmployeeManagerOpen}
        onClose={() => setIsEmployeeManagerOpen(false)}
        employees={employees}
        onSaveEmployee={handleSaveEmployee}
        onToggleStatus={handleToggleEmployeeStatus}
      />

      {/* Employee Inspection Modal */}
      <EmployeeInspectionModal
        isOpen={isInspectionOpen}
        onClose={() => setIsInspectionOpen(false)}
        employee={inspectedEmployee}
        date={selectedDate}
        logs={inspectedLogs}
      />

      {/* Task Manager Modal */}
      <TaskManagerModal
        isOpen={isTaskManagerOpen}
        onClose={() => setIsTaskManagerOpen(false)}
        templates={templates}
        onSaveTemplate={handleSaveTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onRestoreDefaults={handleRestoreDefaults}
      />

      {/* Supabase Connection & SQL Schema Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigSaved={() => {
          checkSupabaseStatus();
          loadData(selectedDate, currentUser);
        }}
      />

      {/* Printable Report Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        selectedDate={selectedDate}
        items={logs}
        stats={stats}
      />

      {/* Daily Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#14161a] border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">আজকের চেকলিস্ট রিসেট করবেন?</h3>
                <p className="text-xs text-[#8e9299]">তারিখ: {selectedDate}</p>
              </div>
            </div>
            <p className="text-xs text-[#e5e5e5]/80 leading-relaxed">
              এটি <strong>{selectedDate}</strong> তারিখের <strong>{currentUser.name}</strong>-এর সকল টাস্কের স্ট্যাটাস পেন্ডিং অবস্থায় ফিরিয়ে আনবে। পূর্ববর্তী তারিখের ডেটা অপরিবর্তিত থাকবে।
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-[#8e9299] hover:text-white"
              >
                বাতিল
              </button>
              <button
                onClick={handleConfirmDailyReset}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white uppercase tracking-wider transition-colors"
              >
                রিসেট নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
