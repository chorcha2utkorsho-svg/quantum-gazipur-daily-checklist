/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';

import {
  BranchId,
  DailyLogItem,
  DailySummaryStats,
  Employee,
  EmployeeDailyProgress,
  SYSTEM_ROLES,
  TaskTemplate,
  DEFAULT_SUPERVISOR,
  BOSS_RAJI_SIR,
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
  approveEmployee,
  rejectEmployee,
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
import { SignUpModal } from './components/SignUpModal';
import { CommonDashboard } from './components/CommonDashboard';
import { AiStrategicInsight } from './components/AiStrategicInsight';
import { EmployeeProfileWorkspace } from './components/EmployeeProfileWorkspace';
import { CommunicationCenter } from './components/CommunicationCenter';
import { DeveloperConsoleModal } from './components/DeveloperConsoleModal';
import { DatabaseArchiveModal } from './components/DatabaseArchiveModal';
import { getEffectiveWorkflowForEmployee } from './lib/customWorkflowStorage';

export default function App() {
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  // Current calendar day for midnight transition detection
  const [currentCalendarDay, setCurrentCalendarDay] = useState<string>(getTodayString());
  // Midnight rollover notice notification toast
  const [midnightRolloverNotice, setMidnightRolloverNotice] = useState<{
    show: boolean;
    previousDate: string;
    newDate: string;
  } | null>(null);

  const [currentUser, setCurrentUser] = useState<Employee>(() => getStoredSession() || DEFAULT_SUPERVISOR);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [logs, setLogs] = useState<DailyLogItem[]>([]);
  const [progressList, setProgressList] = useState<EmployeeDailyProgress[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchId>('all');

  const isBoss = currentUser?.role === 'main_boss' || currentUser?.employee_id === 'RAJI_SIR';
  const isSupervisor = currentUser?.role === 'office_assistant' || isBoss;
  const [viewMode, setViewMode] = useState<'supervisor' | 'checklist' | 'common' | 'profile' | 'communication'>(() =>
    isSupervisor ? 'supervisor' : 'profile'
  );

  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Workflow live revision counter for developer changes
  const [workflowVersion, setWorkflowVersion] = useState(0);

  useEffect(() => {
    const handleWorkflowUpdated = () => {
      setWorkflowVersion((v) => v + 1);
    };
    window.addEventListener('qgz_workflow_updated', handleWorkflowUpdated);
    return () => window.removeEventListener('qgz_workflow_updated', handleWorkflowUpdated);
  }, []);

  // Employee tailored workflow tasks and categories (incorporates developer live alterations)
  const employeeWorkflow = useMemo(() => {
    return getEffectiveWorkflowForEmployee(currentUser?.employee_id, currentUser?.name);
  }, [currentUser?.employee_id, currentUser?.name, workflowVersion]);

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
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isEmployeeManagerOpen, setIsEmployeeManagerOpen] = useState(false);
  const [isTaskManagerOpen, setIsTaskManagerOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isAiInsightModalOpen, setIsAiInsightModalOpen] = useState(false);
  const [isDevConsoleOpen, setIsDevConsoleOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Inspection modal state
  const [inspectedEmployee, setInspectedEmployee] = useState<Employee | null>(null);
  const [inspectedLogs, setInspectedLogs] = useState<DailyLogItem[]>([]);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);

  // Check Supabase connection state
  const checkSupabaseStatus = useCallback(() => {
    const cfg = getStoredSupabaseConfig();
    setIsSupabaseConnected(cfg.isConfigured);
  }, []);

  // ==========================================
  // Midnight Auto-Rollover Engine (00:00 AM)
  // ==========================================
  // Checks if the calendar day rolled over (passed 12:00 midnight)
  // Automatically switches to the new date and prepares fresh checklists for everyone,
  // while previous date's complete data stays permanently stored in Supabase.
  useEffect(() => {
    const checkMidnight = () => {
      const liveToday = getTodayString();
      if (liveToday !== currentCalendarDay) {
        console.log(`[Midnight Engine] Clock passed 12:00 AM! Date changed from ${currentCalendarDay} to ${liveToday}`);

        // If the user was viewing yesterday (the previous currentCalendarDay), auto switch to the new day
        if (selectedDate === currentCalendarDay) {
          setSelectedDate(liveToday);
        }

        setMidnightRolloverNotice({
          show: true,
          previousDate: currentCalendarDay,
          newDate: liveToday,
        });

        setCurrentCalendarDay(liveToday);
      }
    };

    // Check every 10 seconds
    const intervalId = setInterval(checkMidnight, 10000);

    // Also check immediately when user re-focuses or unlocks their device
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkMidnight();
      }
    };

    window.addEventListener('focus', checkMidnight);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', checkMidnight);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [currentCalendarDay, selectedDate]);

  // Test / Simulator tool for user and supervisor: Simulate midnight rollover
  const handleSimulateMidnightRollover = (targetDate?: string) => {
    const d = new Date(`${selectedDate}T00:00:00`);
    d.setDate(d.getDate() + 1);
    const nextDate = targetDate || d.toISOString().split('T')[0];
    const prevDate = selectedDate;

    setSelectedDate(nextDate);
    setMidnightRolloverNotice({
      show: true,
      previousDate: prevDate,
      newDate: nextDate,
    });
  };

  // Synchronize viewMode whenever user changes
  useEffect(() => {
    if (currentUser?.role === 'office_assistant' || currentUser?.role === 'main_boss' || currentUser?.employee_id === 'RAJI_SIR') {
      setViewMode('supervisor');
    } else {
      setViewMode('profile');
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
    setIsLoginModalOpen(false);
    const isAuthority = user.role === 'main_boss' || user.role === 'office_assistant' || user.employee_id === 'RAJI_SIR';
    if (isAuthority) {
      setViewMode('supervisor');
    } else {
      setViewMode('checklist');
    }
    loadData(selectedDate, user);
  };

  // Sign In directly as Raji Sir (Supreme Authority)
  const handleRajiSirSignIn = () => {
    const rajiSir = employees.find((e) => e.employee_id === 'RAJI_SIR') || BOSS_RAJI_SIR;
    setCurrentUser(rajiSir);
    saveStoredSession(rajiSir);
    setViewMode('supervisor');
    loadData(selectedDate, rajiSir);
  };

  const handleOpenEmployeeSignUp = () => {
    setIsSignUpModalOpen(true);
  };

  // Handle employee registration submission (remains pending until Raji Sir approves)
  const handleSignUpSuccess = async (newEmployee: Employee) => {
    const updated = await upsertEmployee(newEmployee);
    setEmployees(updated);
    // Reload comparative stats to include the updated employee list
    const comparative = await fetchAllEmployeesComparative(selectedDate, updated, templates);
    setProgressList(comparative);
  };

  // Approve pending employee by Raji Sir
  const handleApproveEmployee = async (employeeId: string) => {
    const updated = await approveEmployee(employeeId);
    setEmployees(updated);
    const comparative = await fetchAllEmployeesComparative(selectedDate, updated, templates);
    setProgressList(comparative);
  };

  // Reject pending employee by Raji Sir
  const handleRejectEmployee = async (employeeId: string) => {
    const updated = await rejectEmployee(employeeId);
    setEmployees(updated);
    const comparative = await fetchAllEmployeesComparative(selectedDate, updated, templates);
    setProgressList(comparative);
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
        onRajiSirSignIn={handleRajiSirSignIn}
        onOpenEmployeeSignUp={handleOpenEmployeeSignUp}
        onOpenEmployeeManager={() => setIsEmployeeManagerOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
        currentUser={currentUser}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        selectedBranch={selectedBranch}
        onSelectBranch={setSelectedBranch}
        onOpenDeveloperConsole={() => setIsDevConsoleOpen(true)}
        onOpenArchiveModal={() => setIsArchiveModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Historical Database Archive Banner when viewing past dates */}
        {selectedDate < getTodayString() && (
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 border border-amber-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Saved Database Record View: {selectedDate}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                    Intact in Primary Database
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  This is the saved history of a prior workday. All completed checks, percentage metrics, and notes for this date are securely retained in the database.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSelectedDate(getTodayString())}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
              >
                Return to Today's Tasks
              </button>
              <button
                onClick={() => setIsArchiveModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition"
              >
                View Other Dates
              </button>
            </div>
          </div>
        )}

        {/* 1. Common Dashboard Hub */}
        {viewMode === 'common' ? (
          <CommonDashboard
            selectedDate={selectedDate}
            employees={employees}
            progressList={progressList}
            currentUser={currentUser}
            onOpenSignIn={() => setIsLoginModalOpen(true)}
            onRajiSirSignIn={handleRajiSirSignIn}
            onOpenEmployeeSignUp={handleOpenEmployeeSignUp}
            onSelectEmployee={(emp) => {
              setCurrentUser(emp);
              saveStoredSession(emp);
              setViewMode('profile');
            }}
            onGoToChecklist={() => setViewMode('profile')}
            onGoToSupervisor={() => setViewMode('supervisor')}
            onGoToCommunication={() => setViewMode('communication')}
          />
        ) : isSupervisor && viewMode === 'supervisor' ? (
          /* 2. Executive Supervisor Dashboard (Sabar Activity for Raji Sir & Authority) */
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
            onApproveEmployee={handleApproveEmployee}
            onRejectEmployee={handleRejectEmployee}
            logs={logs}
          />
        ) : viewMode === 'profile' ? (
          /* 3. Personalized Employee Profile & Planner Workspace (Exact User Requirement) */
          <EmployeeProfileWorkspace
            employee={currentUser}
            selectedDate={selectedDate}
            workflow={employeeWorkflow}
            logs={logs}
            onToggleTask={handleToggleWorkflowStatus}
            onUpdatePendingReason={handleUpdateWorkflowReason}
            onGoToTableView={() => setViewMode('checklist')}
          />
        ) : viewMode === 'communication' ? (
          /* 4. Client Communication & Calling Head CRM (Exact User Requirement) */
          <CommunicationCenter
            currentUser={currentUser}
            employees={employees}
            selectedBranch={selectedBranch}
          />
        ) : (
          /* 5. Workflow Checklist View for Employee (Personal task management & status checkboxes) */
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
              onOpenAiInsightModal={() => setIsAiInsightModalOpen(true)}
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
                <div>
                  <h3 className="text-base font-bold text-emerald-950 tracking-tight">
                    Congratulations! All {workflowStats.total} tasks completed 100% today!
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Your operational progress has been recorded and synced to the central supervisor's audit log.
                  </p>
                </div>
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors shrink-0"
                >
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
        onRajiSirSignIn={handleRajiSirSignIn}
        onOpenEmployeeSignUp={handleOpenEmployeeSignUp}
      />

      {/* Employee Sign Up Modal */}
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        existingEmployees={employees}
        onSignUpSuccess={handleSignUpSuccess}
        onOpenRajiSirSignIn={handleRajiSirSignIn}
      />

      {/* Employee Manager Modal */}
      <EmployeeManagerModal
        isOpen={isEmployeeManagerOpen}
        onClose={() => setIsEmployeeManagerOpen(false)}
        employees={employees}
        onSaveEmployee={handleSaveEmployee}
        onToggleStatus={handleToggleEmployeeStatus}
        onApproveEmployee={handleApproveEmployee}
        onRejectEmployee={handleRejectEmployee}
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

      {/* AI Strategic Insight Modal for Office Assistant Workflow */}
      {isAiInsightModalOpen && (
        <AiStrategicInsight
          isModal
          onClose={() => setIsAiInsightModalOpen(false)}
          date={selectedDate}
          currentUser={currentUser}
          employees={employees}
          logs={logs}
          progressList={progressList}
        />
      )}

      {/* Daily Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Reset Today's Checklist?</h3>
              <p className="text-xs text-slate-500 font-mono">Date: {selectedDate}</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will clear all checkboxes (set to pending) for <strong>{currentUser.name}</strong> on <strong>{selectedDate}</strong>.
            </p>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs space-y-1.5">
              <div className="font-bold text-indigo-950">
                Automatic Midnight Rollover Rule:
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Checklists are automatically cleared for a fresh workday after 12:00 AM each night. All completed work records and historical logs remain securely saved in the database and can be reviewed anytime via <strong>"Database History"</strong>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsResetConfirmOpen(false);
                  handleSimulateMidnightRollover();
                }}
                className="mt-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
              >
                [Test Midnight Rollover (Simulate Tomorrow)]
              </button>
            </div>

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

      {/* Database Archive & History Vault Modal */}
      <DatabaseArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={(d) => setSelectedDate(d)}
        currentUser={currentUser}
        employees={employees}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        onSimulateMidnightRollover={handleSimulateMidnightRollover}
      />

      {/* Developer Console Modal (Live Task Point Modifier & System Developer Access) */}
      <DeveloperConsoleModal
        isOpen={isDevConsoleOpen}
        onClose={() => setIsDevConsoleOpen(false)}
        currentUser={currentUser}
        employees={employees}
      />

      {/* Midnight Rollover Notification Toast / Banner */}
      {midnightRolloverNotice && midnightRolloverNotice.show && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full p-4 rounded-2xl bg-slate-900 text-white border border-indigo-500/50 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Midnight Rollover Complete — New Workday Started!</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Checklists for all employees have been automatically cleared for the new date ({midnightRolloverNotice.newDate}).
                All completed work and notes from yesterday ({midnightRolloverNotice.previousDate}) are <strong>permanently stored in the primary database</strong>.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedDate(midnightRolloverNotice.previousDate);
                    setMidnightRolloverNotice(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs"
                >
                  View Yesterday's ({midnightRolloverNotice.previousDate}) Record
                </button>
                <button
                  onClick={() => setMidnightRolloverNotice(null)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Start New Day
                </button>
              </div>
            </div>
            <button
              onClick={() => setMidnightRolloverNotice(null)}
              className="px-2 py-1 rounded-lg text-slate-400 hover:text-white text-xs font-bold"
            >
              [Close]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
