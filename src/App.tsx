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
} from 'lucide-react';

import { DailyLogItem, DailySummaryStats, TaskTemplate, PRE_SEEDED_TASKS } from './types';
import {
  fetchDailyLogs,
  fetchTaskTemplates,
  upsertDailyLog,
  saveTemplate,
  deleteTemplate,
  getLocalTemplates,
  saveLocalTemplates,
  saveLocalDailyLogs,
  getStoredSupabaseConfig,
} from './lib/supabase';

import { Header } from './components/Header';
import { StickyProgressBar } from './components/StickyProgressBar';
import { TaskItem } from './components/TaskItem';
import { TaskManagerModal } from './components/TaskManagerModal';
import { SupabaseModal } from './components/SupabaseModal';
import { PrintReportModal } from './components/PrintReportModal';

export default function App() {
  // Today's date formatted YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [logs, setLogs] = useState<DailyLogItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Modals
  const [isTaskManagerOpen, setIsTaskManagerOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Check Supabase connection state
  const checkSupabaseStatus = useCallback(() => {
    const cfg = getStoredSupabaseConfig();
    setIsSupabaseConnected(cfg.isConfigured);
  }, []);

  // Initial load of templates & daily logs
  const loadDataForDate = useCallback(
    async (date: string, forceTemplates?: TaskTemplate[]) => {
      setIsLoading(true);
      try {
        const activeTemplates = forceTemplates || (await fetchTaskTemplates());
        setTemplates(activeTemplates);

        const loadedLogs = await fetchDailyLogs(date, activeTemplates);
        setLogs(loadedLogs);
      } catch (err) {
        console.error('Error loading checklist data:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    checkSupabaseStatus();
    loadDataForDate(selectedDate);
  }, [selectedDate, loadDataForDate, checkSupabaseStatus]);

  // Summary statistics
  const stats: DailySummaryStats = useMemo(() => {
    const total = logs.length;
    const done = logs.filter((l) => l.status === 'done').length;
    const pending = total - done;
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, pending, percentage };
  }, [logs]);

  // Trigger celebration confetti when 100% is reached
  const fireCelebration = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#6366f1', '#38bdf8', '#fbbf24'],
    });
  }, []);

  // Toggle status of a task (done <-> pending)
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

    // Check if newly reached 100%
    const willBeDone = newLogs.filter((l) => l.status === 'done').length;
    if (wasPending && willBeDone === newLogs.length && newLogs.length > 0) {
      fireCelebration();
    }
  };

  // Update reason for pending
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
  };

  // Mark all as done
  const handleMarkAllDone = async () => {
    const now = new Date().toISOString();
    const updated = logs.map((l) => ({
      ...l,
      status: 'done' as const,
      completed_at: l.completed_at || now,
    }));
    setLogs(updated);
    for (const item of updated) {
      await upsertDailyLog(item);
    }
    fireCelebration();
  };

  // Daily Reset: reset all tasks for current date to pending
  const handleConfirmDailyReset = async () => {
    const resetLogs: DailyLogItem[] = logs.map((l) => ({
      ...l,
      status: 'pending' as const,
      reason_for_pending: '',
      completed_at: null,
    }));
    setLogs(resetLogs);
    saveLocalDailyLogs(selectedDate, resetLogs);

    // Sync all reset items
    for (const item of resetLogs) {
      await upsertDailyLog(item);
    }
    setIsResetConfirmOpen(false);
  };

  // Save Task Template (Add / Edit)
  const handleSaveTemplate = async (template: TaskTemplate) => {
    const updated = await saveTemplate(template);
    setTemplates(updated);
    // Reload logs for current day so new task appears
    await loadDataForDate(selectedDate, updated);
  };

  // Delete Task Template
  const handleDeleteTemplate = async (id: string, name: string) => {
    const updated = await deleteTemplate(id, name);
    setTemplates(updated);
    // Remove from current date view
    const newLogs = logs.filter((l) => l.task_name !== name);
    setLogs(newLogs);
    saveLocalDailyLogs(selectedDate, newLogs);
  };

  // Restore 20 default tasks
  const handleRestoreDefaults = async () => {
    const defaults: TaskTemplate[] = PRE_SEEDED_TASKS.map((t) => ({
      id: `template-${t.order}`,
      name: t.name,
      order_index: t.order,
      is_active: true,
      category: t.category,
    }));
    saveLocalTemplates(defaults);
    setTemplates(defaults);
    await loadDataForDate(selectedDate, defaults);
    setIsTaskManagerOpen(false);
  };

  // Filter and search tasks
  const filteredLogs = useMemo(() => {
    return logs
      .filter((item) => {
        if (filter === 'done') return item.status === 'done';
        if (filter === 'pending') return item.status === 'pending';
        return true;
      })
      .filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.task_name.toLowerCase().includes(q) ||
          (item.reason_for_pending && item.reason_for_pending.toLowerCase().includes(q))
        );
      });
  }, [logs, filter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] flex flex-col selection:bg-emerald-500 selection:text-white font-sans">
      {/* 1. Main Navigation Header */}
      <Header
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onDailyReset={() => setIsResetConfirmOpen(true)}
        onOpenTaskManager={() => setIsTaskManagerOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
      />

      {/* 2. Sticky Glassmorphism Progress Bar */}
      <StickyProgressBar
        stats={stats}
        currentFilter={filter}
        onFilterChange={setFilter}
      />

      {/* 3. Main Dashboard Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-10 py-6 space-y-6">
        {/* Quick Actions & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8e9299] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks or pending reasons..."
              className="w-full text-xs pl-9 pr-8 py-2 rounded bg-black/40 border border-white/10 text-[#e5e5e5] placeholder:text-white/20 focus:outline-none focus:border-emerald-500/80 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8e9299] hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {stats.pending > 0 && (
              <button
                onClick={handleMarkAllDone}
                className="px-3 py-1.5 rounded text-xs uppercase tracking-wider font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark All Done
              </button>
            )}
          </div>
        </div>

        {/* Loading Skeleton or Task List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-14 rounded bg-white/[0.03] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center rounded border border-white/10 bg-black/40 space-y-3">
            <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center mx-auto text-[#8e9299]">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">No Tasks Match Current Filter</h3>
            <p className="text-xs text-[#8e9299] max-w-sm mx-auto">
              {searchQuery
                ? `No tasks or reasons matched "${searchQuery}".`
                : filter === 'pending'
                ? 'All clear! There are no pending tasks remaining for this date.'
                : 'No tasks found. Click "Manage Tasks" to view or restore task templates.'}
            </p>
            <button
              onClick={() => {
                setFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 uppercase tracking-wider font-semibold"
            >
              Reset view filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
            {filteredLogs.map((item, index) => (
              <TaskItem
                key={item.task_name}
                item={item}
                index={index}
                onToggleStatus={handleToggleStatus}
                onUpdateReason={handleUpdateReason}
              />
            ))}
          </div>
        )}

        {/* Bottom completion callout if all tasks completed */}
        {stats.percentage === 100 && stats.total > 0 && !isLoading && (
          <div className="p-5 rounded bg-gradient-to-r from-emerald-950/30 via-black/40 to-black/60 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Quantum Gazipur cell Checklist 100% Accomplished
                </h3>
                <p className="text-xs text-[#8e9299]">
                  All {stats.total} daily operational tasks for {selectedDate} are confirmed and completed.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2 rounded text-xs uppercase tracking-widest font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              Sign-off Report
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 sm:px-10 py-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-[#8e9299] shrink-0 gap-3">
        <div>Quantum Gazipur cell • Raji sir Team Operations Management System</div>
        <div className="flex flex-wrap items-center gap-6">
          <span>
            Database: Supabase (
            <span className={isSupabaseConnected ? 'text-emerald-400' : 'text-amber-400'}>
              {isSupabaseConnected ? 'Active' : 'Offline / Local'}
            </span>
            )
          </span>
          <span>Auto-save: Enabled</span>
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className="hover:text-white transition-colors"
          >
            Database Config
          </button>
          <button
            onClick={() => setIsTaskManagerOpen(true)}
            className="hover:text-white transition-colors"
          >
            Task Templates
          </button>
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="hover:text-white transition-colors"
          >
            Print Report
          </button>
        </div>
      </footer>

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
          loadDataForDate(selectedDate);
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
          <div className="w-full max-w-md rounded bg-[#0a0a0a] border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Reset Today's Checklist?</h3>
                <p className="text-xs text-[#8e9299]">Date: {selectedDate}</p>
              </div>
            </div>
            <p className="text-xs text-[#e5e5e5]/80 leading-relaxed">
              This will uncheck all tasks for <strong>{selectedDate}</strong> and clear their pending reasons so Mina can restart fresh. Previous days' records in Supabase remain untouched.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3.5 py-1.5 rounded text-xs text-[#8e9299] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDailyReset}
                className="px-4 py-1.5 rounded text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white uppercase tracking-wider transition-colors"
              >
                Reset Tasks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
