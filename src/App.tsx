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
  WORKFLOW_CATEGORIES,
  ALL_WORKFLOW_TASKS,
  WorkflowTask,
  getWorkflowForEmployee,
} from './data/workflowData';
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
import { WorkflowHeroBanner } from './components/WorkflowHeroBanner';
import { WorkflowStatCards } from './components/WorkflowStatCards';
import { WorkflowFilterBar } from './components/WorkflowFilterBar';
import { WorkflowTaskTable } from './components/WorkflowTaskTable';

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

  // Employee tailored workflow tasks and categories
  const employeeWorkflow = useMemo(() => {
    return getWorkflowForEmployee(currentUser?.employee_id);
  }, [currentUser?.employee_id]);

  const [workflowTasks, setWorkflowTasks] = useState<WorkflowTask[]>(() => employeeWorkflow.tasks);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [viewDensity, setViewDensity] = useState<'detailed' | 'compact'>('detailed');

  // Synchronize tasks when employee changes
  useEffect(() => {
    setWorkflowTasks(employeeWorkflow.tasks);
    setSelectedCategory('ALL');
  }, [employeeWorkflow]);

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

  // Mapping logs to quick lookup for 73-task workflow
  const workflowLogsMap = useMemo(() => {
    const map: Record<string, DailyLogItem> = {};
    logs.forEach((log) => {
      map[log.task_name] = log;
    });
    return map;
  }, [logs]);

  // Statistics for the 73 tasks workflow
  const workflowStats = useMemo(() => {
    const total = workflowTasks.length;
    const done = workflowTasks.filter((t) => workflowLogsMap[t.name]?.status === 'done').length;
    const pending = total - done;
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, pending, percentage };
  }, [workflowTasks, workflowLogsMap]);

  // Task count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    employeeWorkflow.categories.forEach((cat) => {
      counts[cat.id] = workflowTasks.filter((t) => t.category === cat.id).length;
    });
    return counts;
  }, [workflowTasks, employeeWorkflow.categories]);

  // Filtered 73 workflow tasks based on category, priority, and search
  const filteredWorkflowTasks = useMemo(() => {
    return workflowTasks.filter((task) => {
      if (selectedCategory !== 'ALL' && task.category !== selectedCategory) {
        return false;
      }
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = task.name.toLowerCase().includes(q);
        const matchCode = task.code.toLowerCase().includes(q);
        const matchDetails = task.details.toLowerCase().includes(q);
        const matchCat =
          task.category.toLowerCase().includes(q) || task.categoryBn.toLowerCase().includes(q);
        const log = workflowLogsMap[task.name];
        const matchReason = log?.reason_for_pending?.toLowerCase().includes(q) || false;
        return matchName || matchCode || matchDetails || matchCat || matchReason;
      }
      return true;
    });
  }, [workflowTasks, selectedCategory, priorityFilter, searchQuery, workflowLogsMap]);

  // Toggle status for a workflow task
  const handleToggleWorkflowStatus = async (taskName: string) => {
    const existing = logs.find((l) => l.task_name === taskName);
    const now = new Date().toISOString();
    let updatedItem: DailyLogItem;

    if (existing) {
      const newStatus = existing.status === 'done' ? 'pending' : 'done';
      const wasPending = existing.status === 'pending';
      updatedItem = {
        ...existing,
        status: newStatus,
        completed_at: newStatus === 'done' ? now : null,
      };
      const newLogs = logs.map((l) => (l.task_name === taskName ? updatedItem : l));
      setLogs(newLogs);
      await upsertDailyLog(updatedItem);
      handleRefreshComparative();

      const willBeDone = workflowTasks.filter((t) => {
        if (t.name === taskName) return newStatus === 'done';
        return workflowLogsMap[t.name]?.status === 'done';
      }).length;

      if (wasPending && willBeDone === workflowTasks.length && workflowTasks.length > 0) {
        fireCelebration();
      }
    } else {
      updatedItem = {
        id: `log-${currentUser.employee_id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date: selectedDate,
        employee_id: currentUser.employee_id,
        task_name: taskName,
        status: 'done',
        reason_for_pending: '',
        order_index: 0,
        completed_at: now,
      };
      const newLogs = [...logs, updatedItem];
      setLogs(newLogs);
      await upsertDailyLog(updatedItem);
      handleRefreshComparative();

      const willBeDone = workflowTasks.filter((t) => {
        if (t.name === taskName) return true;
        return workflowLogsMap[t.name]?.status === 'done';
      }).length;

      if (willBeDone === workflowTasks.length && workflowTasks.length > 0) {
        fireCelebration();
      }
    }
  };

  // Update pending reason for a workflow task
  const handleUpdateWorkflowReason = async (taskName: string, reason: string) => {
    const existing = logs.find((l) => l.task_name === taskName);
    const now = new Date().toISOString();
    let updatedItem: DailyLogItem;

    if (existing) {
      updatedItem = {
        ...existing,
        reason_for_pending: reason,
      };
      const newLogs = logs.map((l) => (l.task_name === taskName ? updatedItem : l));
      setLogs(newLogs);
      await upsertDailyLog(updatedItem);
    } else {
      updatedItem = {
        id: `log-${currentUser.employee_id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date: selectedDate,
        employee_id: currentUser.employee_id,
        task_name: taskName,
        status: 'pending',
        reason_for_pending: reason,
        order_index: 0,
        completed_at: null,
      };
      const newLogs = [...logs, updatedItem];
      setLogs(newLogs);
      await upsertDailyLog(updatedItem);
    }
    handleRefreshComparative();
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
          /* Workflow Checklist View matching image.png */
          <div className="space-y-6">
            {/* 1. Hero Banner with Gradient & Quick Category Pills */}
            <WorkflowHeroBanner
              currentUser={currentUser}
              totalCategories={employeeWorkflow.categories.length}
              totalTasks={workflowTasks.length}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              categories={employeeWorkflow.categories}
            />

            {/* 2. Top Summary Stat Cards matching image.png exactly */}
            <WorkflowStatCards
              totalCategories={employeeWorkflow.categories.length}
              totalTasks={workflowStats.total}
              doneTasks={workflowStats.done}
              pendingTasks={workflowStats.pending}
              remainingTasks={workflowStats.pending}
              percentage={workflowStats.percentage}
            />

            {/* 3. Action / Search / Filter Bar */}
            <WorkflowFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categoryCounts={categoryCounts}
              totalTasks={workflowTasks.length}
              onOpenNewTaskModal={() => setIsTaskManagerOpen(true)}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
              onResetDaily={() => setIsResetConfirmOpen(true)}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
              viewDensity={viewDensity}
              onViewDensityChange={setViewDensity}
              categories={employeeWorkflow.categories}
            />

            {/* 4. Main Workflow Tasks Table with Grouped Accordions */}
            <WorkflowTaskTable
              tasks={filteredWorkflowTasks}
              dailyLogs={workflowLogsMap}
              onToggleStatus={handleToggleWorkflowStatus}
              onUpdateReason={handleUpdateWorkflowReason}
              selectedCategory={selectedCategory}
              viewDensity={viewDensity}
              categories={employeeWorkflow.categories}
            />

            {/* 100% Completion Milestone Banner */}
            {workflowStats.total > 0 && workflowStats.done === workflowStats.total && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-950 tracking-tight">
                      Congratulations! All {workflowStats.total} tasks completed 100% today!
                    </h3>
                    <p className="text-xs text-emerald-800">
                      Your operational progress has been recorded and synced to the central supervisor's audit log.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Printer className="w-4 h-4" />
                  Print Report
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 sm:px-10 py-4 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 shrink-0 gap-3">
        <div>Quantum Gazipur Cell • Central Supervision &amp; Integrated Workflow Management</div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <span>
            Database:{' '}
            <span className={isSupabaseConnected ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
              {isSupabaseConnected ? 'Supabase Connected' : 'Offline / Local'}
            </span>
          </span>
          <button onClick={() => setIsSupabaseModalOpen(true)} className="hover:text-indigo-600 transition-colors">
            Database Config
          </button>
          <button onClick={() => setIsLoginModalOpen(true)} className="hover:text-indigo-600 transition-colors">
            Switch User
          </button>
          {isSupervisor && (
            <button onClick={() => setIsEmployeeManagerOpen(true)} className="hover:text-indigo-600 transition-colors">
              Staff Management
            </button>
          )}
          <button onClick={() => setIsPrintModalOpen(true)} className="hover:text-indigo-600 transition-colors">
            Print Report
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
        stats={workflowStats}
      />

      {/* Daily Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Today's Checklist?</h3>
                <p className="text-xs text-slate-500">Date: {selectedDate}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This will reset all task statuses for <strong>{currentUser.name}</strong> on <strong>{selectedDate}</strong> back to pending. Logs from other dates will remain unchanged.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDailyReset}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
