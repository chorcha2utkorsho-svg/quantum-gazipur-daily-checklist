import React, { useState, useMemo } from 'react';
import {
  Employee,
  DailyLogItem,
  BranchId,
  BRANCHES,
  SYSTEM_ROLES,
} from '../types';
import {
  getSavedActivities,
  buildUnifiedActivityFeed,
} from '../lib/activityLogger';
import {
  Flame,
  AlertTriangle,
  Clock,
  Zap,
  TrendingUp,
  BarChart2,
  Users,
  Building2,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Info,
  Calendar,
  Sparkles,
  ChevronRight,
  Timer,
  RefreshCw,
  Send,
} from 'lucide-react';

interface ActivityIntensityHeatmapProps {
  selectedDate: string;
  employees: Employee[];
  allDailyLogs?: DailyLogItem[];
  currentUser?: Employee | null;
  onInspectEmployee?: (emp: Employee) => void;
  onSendDirective?: (targetType: 'all' | 'branch' | 'employee', targetId: string, initialMessage?: string) => void;
}

interface CompletedItemRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_role: string;
  branch: BranchId;
  task_name: string;
  completed_at: string;
  hour: number;
  minute: number;
  actual_minutes?: number;
  time_spent_seconds?: number;
}

interface PendingItemRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_role: string;
  branch: BranchId;
  task_name: string;
  reason: string;
  hour: number;
  minute: number;
  timestamp: string;
}

export const ActivityIntensityHeatmap: React.FC<ActivityIntensityHeatmapProps> = ({
  selectedDate,
  employees,
  allDailyLogs = [],
  currentUser,
  onInspectEmployee,
  onSendDirective,
}) => {
  // View mode states
  const [viewScope, setViewScope] = useState<'working_hours' | 'full_24'>('working_hours');
  const [matrixView, setMatrixView] = useState<'staff' | 'branch' | 'role' | 'density'>('staff');
  const [selectedBranch, setSelectedBranch] = useState<BranchId>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  // Define hours array
  const displayHours = useMemo(() => {
    if (viewScope === 'working_hours') {
      // 08:00 (8 AM) through 20:00 (8 PM) -> 13 hours
      return Array.from({ length: 13 }, (_, i) => i + 8);
    }
    // 00:00 through 23:00 -> 24 hours
    return Array.from({ length: 24 }, (_, i) => i);
  }, [viewScope]);

  // Unified activity entries (both live events & all daily logs)
  const unifiedActivities = useMemo(() => {
    return buildUnifiedActivityFeed(selectedDate, employees, allDailyLogs);
  }, [selectedDate, employees, allDailyLogs]);

  // Extract completed tasks with normalized hour timestamps
  const { completedRecords, pendingRecords } = useMemo(() => {
    const compRecords: CompletedItemRecord[] = [];
    const pendRecords: PendingItemRecord[] = [];
    const employeeMap = new Map<string, Employee>();
    employees.forEach((e) => employeeMap.set(e.employee_id, e));

    // Helper to extract hour safely
    const extractHourMinute = (timestampStr?: string | null, fallbackSeed?: number) => {
      if (timestampStr) {
        const d = new Date(timestampStr);
        if (!isNaN(d.getTime())) {
          return { hour: d.getHours(), minute: d.getMinutes(), valid: true };
        }
      }
      // Deterministic spread across typical office hours (09:00 - 18:00) based on order/index
      const seed = Math.abs(fallbackSeed || 0);
      const hour = 9 + (seed % 9); // between 9 AM and 17 PM (5 PM)
      const minute = (seed * 17) % 60;
      return { hour, minute, valid: false };
    };

    // 1. Process allDailyLogs
    allDailyLogs.forEach((log, idx) => {
      if (!log || log.date !== selectedDate) return;
      const emp = employeeMap.get(log.employee_id);
      const empBranch: BranchId =
        log.branch || emp?.branch || (log.employee_id.startsWith('GB-') ? 'chowrasta' : 'rajbari');
      const empRole = emp?.role || 'general_staff';
      const empName = emp?.name || log.employee_id;

      if (log.status === 'done') {
        const { hour, minute } = extractHourMinute(log.completed_at, log.order_index ?? idx);
        compRecords.push({
          id: `log-done-${log.employee_id}-${idx}-${log.task_name}`,
          employee_id: log.employee_id,
          employee_name: empName,
          employee_role: empRole,
          branch: empBranch,
          task_name: log.task_name,
          completed_at: log.completed_at || `${selectedDate}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`,
          hour,
          minute,
          actual_minutes: log.actual_minutes,
          time_spent_seconds: log.time_spent_seconds,
        });
      }

      if (log.reason_for_pending && log.reason_for_pending.trim()) {
        const { hour, minute } = extractHourMinute(log.updated_at, (log.order_index ?? idx) + 3);
        pendRecords.push({
          id: `log-pend-${log.employee_id}-${idx}-${log.task_name}`,
          employee_id: log.employee_id,
          employee_name: empName,
          employee_role: empRole,
          branch: empBranch,
          task_name: log.task_name,
          reason: log.reason_for_pending.trim(),
          hour,
          minute,
          timestamp: log.updated_at || `${selectedDate}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`,
        });
      }
    });

    // 2. Process any live real-time activities from current session that might be even newer
    const savedActivities = getSavedActivities(selectedDate);
    savedActivities.forEach((act) => {
      if (act.date !== selectedDate) return;
      if (act.type === 'task_completed') {
        const { hour, minute } = extractHourMinute(act.timestamp, 1);
        // Check if not already duplicated by task_name + employee_id
        const exists = compRecords.some(
          (c) => c.employee_id === act.employee_id && c.task_name === act.task_name
        );
        if (!exists) {
          compRecords.push({
            id: `act-${act.id}`,
            employee_id: act.employee_id,
            employee_name: act.employee_name,
            employee_role: act.employee_role,
            branch: act.branch || 'chowrasta',
            task_name: act.task_name,
            completed_at: act.timestamp,
            hour,
            minute,
            actual_minutes: act.actual_minutes,
            time_spent_seconds: act.time_spent_seconds,
          });
        }
      } else if (act.type === 'note_added' && act.note) {
        const { hour, minute } = extractHourMinute(act.timestamp, 2);
        const exists = pendRecords.some(
          (p) => p.employee_id === act.employee_id && p.task_name === act.task_name && p.reason === act.note
        );
        if (!exists) {
          pendRecords.push({
            id: `act-${act.id}`,
            employee_id: act.employee_id,
            employee_name: act.employee_name,
            employee_role: act.employee_role,
            branch: act.branch || 'chowrasta',
            task_name: act.task_name,
            reason: act.note,
            hour,
            minute,
            timestamp: act.timestamp,
          });
        }
      }
    });

    return { completedRecords: compRecords, pendingRecords: pendRecords };
  }, [allDailyLogs, selectedDate, employees]);

  // Filter completed and pending records according to branch & role filter
  const filteredCompleted = useMemo(() => {
    return completedRecords.filter((rec) => {
      if (selectedBranch !== 'all' && rec.branch !== selectedBranch) return false;
      if (selectedRole !== 'all' && rec.employee_role !== selectedRole) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rec.employee_name.toLowerCase().includes(q);
        const matchesId = rec.employee_id.toLowerCase().includes(q);
        const matchesTask = rec.task_name.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesTask) return false;
      }
      return true;
    });
  }, [completedRecords, selectedBranch, selectedRole, searchQuery]);

  const filteredPending = useMemo(() => {
    return pendingRecords.filter((rec) => {
      if (selectedBranch !== 'all' && rec.branch !== selectedBranch) return false;
      if (selectedRole !== 'all' && rec.employee_role !== selectedRole) return false;
      return true;
    });
  }, [pendingRecords, selectedBranch, selectedRole]);

  // Calculate hourly aggregate counts
  const hourlyStats = useMemo(() => {
    const counts: Record<number, number> = {};
    const issuesCounts: Record<number, number> = {};
    const branchCounts: Record<BranchId, Record<number, number>> = {
      all: {},
      chowrasta: {},
      rajbari: {},
    };

    displayHours.forEach((h) => {
      counts[h] = 0;
      issuesCounts[h] = 0;
      branchCounts.chowrasta[h] = 0;
      branchCounts.rajbari[h] = 0;
    });

    filteredCompleted.forEach((rec) => {
      if (counts[rec.hour] !== undefined) {
        counts[rec.hour] = (counts[rec.hour] || 0) + 1;
        if (branchCounts[rec.branch]) {
          branchCounts[rec.branch][rec.hour] = (branchCounts[rec.branch][rec.hour] || 0) + 1;
        }
      }
    });

    filteredPending.forEach((rec) => {
      if (issuesCounts[rec.hour] !== undefined) {
        issuesCounts[rec.hour] = (issuesCounts[rec.hour] || 0) + 1;
      }
    });

    // Find peak completion hour
    let peakHour = displayHours[0];
    let maxCompletions = 0;
    displayHours.forEach((h) => {
      if (counts[h] > maxCompletions) {
        maxCompletions = counts[h];
        peakHour = h;
      }
    });

    // Find lowest / bottleneck hour during active operational window (09:00 - 18:00)
    const operationalHours = displayHours.filter((h) => h >= 9 && h <= 17);
    let bottleneckHour: number | null = null;
    let minCompletions = Infinity;
    let highestIssuesInLull = 0;

    operationalHours.forEach((h) => {
      const c = counts[h] || 0;
      const issues = issuesCounts[h] || 0;
      // Weight low completions plus issues
      const frictionScore = issues * 2 - c;
      if (c < minCompletions || (c === minCompletions && issues > highestIssuesInLull)) {
        minCompletions = c;
        highestIssuesInLull = issues;
        bottleneckHour = h;
      }
    });

    // Total tasks in filtered scope
    const totalDone = filteredCompleted.length;
    const activeWorkingHoursCount = displayHours.filter((h) => (counts[h] || 0) > 0).length || 1;
    const velocity = (totalDone / activeWorkingHoursCount).toFixed(1);

    // Morning vs Afternoon split
    const morningCount = displayHours.filter((h) => h >= 8 && h < 13).reduce((acc, h) => acc + (counts[h] || 0), 0);
    const afternoonCount = displayHours.filter((h) => h >= 13 && h < 18).reduce((acc, h) => acc + (counts[h] || 0), 0);
    const eveningCount = displayHours.filter((h) => h >= 18).reduce((acc, h) => acc + (counts[h] || 0), 0);

    return {
      counts,
      issuesCounts,
      branchCounts,
      peakHour,
      maxCompletions,
      bottleneckHour,
      minCompletions: minCompletions === Infinity ? 0 : minCompletions,
      totalDone,
      velocity,
      morningCount,
      afternoonCount,
      eveningCount,
    };
  }, [displayHours, filteredCompleted, filteredPending]);

  // Bottleneck Diagnostic Analysis Text Generator
  const bottleneckDiagnostic = useMemo(() => {
    const { peakHour, maxCompletions, bottleneckHour, minCompletions, morningCount, afternoonCount, totalDone } = hourlyStats;
    if (totalDone === 0) {
      return {
        severity: 'neutral' as const,
        titleBn: 'কার্যক্রম এখনও শুরু হয়নি (No Hourly Data Yet)',
        descriptionBn: 'নির্বাচিত তারিখে এখনও কোনো টাস্ক সম্পন্ন হয়নি। স্টাফরা তাদের প্রোফাইল থেকে চেকলিস্ট আপডেট করলে প্রতি ঘণ্টার ইনটেনসিটি হিটম্যাপে তা ফুটে উঠবে।',
        actionAdviceBn: 'সকল স্টাফ ও অফিস সহকারীকে সকালের চেকলিস্ট দ্রুত শুরু করার নির্দেশ প্রদান করুন।',
      };
    }

    // Check afternoon lull
    if (bottleneckHour !== null && bottleneckHour >= 13 && bottleneckHour <= 15 && minCompletions <= 1) {
      return {
        severity: 'warning' as const,
        titleBn: `দুপুরের স্লট স্থবিরতা (Post-Lunch Lull Detected: ${formatHourLabel(bottleneckHour)})`,
        descriptionBn: `${formatHourLabel(bottleneckHour)} ঘটিকায় মাত্র ${minCompletions}টি টাস্ক সম্পন্ন হয়েছে, যা পিক আওয়ার (${formatHourLabel(peakHour)} এর ${maxCompletions}টি টাস্ক) এর তুলনায় উল্লেখযোগ্যভাবে কম। খাবার ও নামাজের বিরতির পর কাজে পুনঃসংযোগের ধীরগতি দেখা গেছে।`,
        actionAdviceBn: 'দুপুর ২:৩০ টায় ২০ মিনিটের ক্যাশ ও কিউ-এমআইএস রিকনসিলিয়েশন চেক-ইন চালু করে দুপুরের স্থবিরতা দূর করুন।',
      };
    }

    // Check morning lag
    if (hourlyStats.counts[9] <= 1 && hourlyStats.counts[10] <= 2 && totalDone >= 6) {
      return {
        severity: 'warning' as const,
        titleBn: 'সকালের শুরুতেই ধীরগতি (Morning Startup Lag: 09:00 - 10:30 AM)',
        descriptionBn: 'সকালের মূল ওপেনিং ঘণ্টার কাজে ধীরগতি পরিলক্ষিত হয়েছে। দিনের অধিকাংশ কাজ দুপুরের দিকে জমা হচ্ছে।',
        actionAdviceBn: 'সকাল ৯:১৫ এর মধ্যে অফিস সহকারীকে দিয়ে প্রথম পর্বের ফ্রন্ট ডেস্ক ও লজিস্টিকস চেকলিস্ট শেষ করার নির্দেশ দিন।',
      };
    }

    // Check end-of-day backlog crunch
    if (hourlyStats.counts[17] > morningCount && hourlyStats.counts[17] >= 6) {
      return {
        severity: 'alert' as const,
        titleBn: 'দিনের শেষে আকস্মিক কাজের চাপ (Closing Rush: 05:00 - 06:00 PM)',
        descriptionBn: 'কর্মচারীরা দিনের অধিকাংশ সময় টাস্ক আপডেট না করে অফিস ছুটির পূর্বে শেষ মুহূর্তে একযোগে কাজ সম্পন্ন দেখাচ্ছেন।',
        actionAdviceBn: 'লাইভ প্রগ্রেস ট্র্যাক নিশ্চিত করতে প্রতি ৩ ঘণ্টা অন্তর (দুপুর ১২টা ও বিকেল ৩টা) চেকলিস্ট আপডেটের কড়া নির্দেশনা দিন।',
      };
    }

    // Balanced productivity
    return {
      severity: 'success' as const,
      titleBn: 'সন্তোষজনক কার্যপ্রবাহ (Smooth Hourly Operations)',
      descriptionBn: `সকাল ও বিকেলের মধ্যে কাজ সুষমভাবে সম্পন্ন হয়েছে। পিক আওয়ার ছিল ${formatHourLabel(peakHour)} (${maxCompletions}টি টাস্ক সম্পন্ন)। কোনো মারাত্মক জট সৃষ্টি হয়নি।`,
      actionAdviceBn: 'বর্তমান গতি বজায় রাখতে অফিস সহকারী ও সেল লিডদের নিয়মিত সুপারভিশন বজায় রাখতে বলুন।',
    };
  }, [hourlyStats]);

  // Employee list filtered
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (selectedBranch !== 'all' && emp.branch !== selectedBranch) return false;
      if (selectedRole !== 'all' && emp.role !== selectedRole) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = emp.name.toLowerCase().includes(q);
        const matchesId = emp.employee_id.toLowerCase().includes(q);
        if (!matchesName && !matchesId) return false;
      }
      return true;
    });
  }, [employees, selectedBranch, selectedRole, searchQuery]);

  // Tasks in selected hour for drill-down
  const selectedHourDetails = useMemo(() => {
    if (selectedHour === null) return null;
    const completed = filteredCompleted.filter((rec) => rec.hour === selectedHour);
    const pending = filteredPending.filter((rec) => rec.hour === selectedHour);
    return {
      hour: selectedHour,
      completed,
      pending,
    };
  }, [selectedHour, filteredCompleted, filteredPending]);

  // Color generator for cell intensity
  const getCellColorClass = (count: number, maxCount: number) => {
    if (count === 0) {
      return 'bg-slate-900/60 border-white/5 text-slate-600 hover:border-white/20';
    }
    if (maxCount <= 2) {
      return 'bg-emerald-600/30 border-emerald-500/40 text-emerald-300 font-bold hover:bg-emerald-600/50';
    }
    const ratio = count / Math.max(maxCount, 1);
    if (ratio < 0.25) {
      return 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400 font-medium hover:bg-emerald-900/80';
    }
    if (ratio < 0.55) {
      return 'bg-emerald-700/50 border-emerald-500/50 text-emerald-200 font-bold hover:bg-emerald-600/60';
    }
    if (ratio < 0.85) {
      return 'bg-emerald-500/80 border-emerald-400 text-slate-950 font-black shadow-sm shadow-emerald-500/30 hover:bg-emerald-400';
    }
    // Peak intensity
    return 'bg-emerald-400 border-emerald-300 text-slate-950 font-black shadow-md shadow-emerald-400/40 ring-1 ring-emerald-300 animate-pulse hover:bg-emerald-300';
  };

  function formatHourLabel(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 === 0 ? 12 : hour % 12;
    return `${h}:00 ${period}`;
  }

  function formatHourRange(hour: number): string {
    const startPeriod = hour >= 12 ? 'PM' : 'AM';
    const startH = hour % 12 === 0 ? 12 : hour % 12;
    const nextH = (hour + 1) % 12 === 0 ? 12 : (hour + 1) % 12;
    const endPeriod = hour + 1 >= 12 && hour + 1 < 24 ? 'PM' : 'AM';
    return `${startH}:00 ${startPeriod} – ${nextH}:00 ${endPeriod}`;
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Analytical Overview */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/10">
                <Flame className="w-6 h-6 animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    অ্যাক্টিভিটি ইনটেনসিটি হিটম্যাপ (Activity Intensity Heatmap)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40 uppercase tracking-wider">
                    Hourly Bottleneck Radar
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">
                  দিনের কোন ঘণ্টায় সবচেয়ে বেশি কাজ সম্পন্ন হয়েছে এবং কোথায় কাজের জট (Bottleneck) তৈরি হচ্ছে তা রিয়েল-টাইমে শনাক্ত করুন
                </p>
              </div>
            </div>
          </div>

          {/* Quick Filter Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Scope (Office Hours vs 24H) */}
            <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewScope('working_hours')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewScope === 'working_hours'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                অফিস সময় (8 AM - 8 PM)
              </button>
              <button
                type="button"
                onClick={() => setViewScope('full_24')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewScope === 'full_24'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ২৪ ঘণ্টা (24 Hours)
              </button>
            </div>

            {/* Matrix View Selector */}
            <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMatrixView('staff')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  matrixView === 'staff'
                    ? 'bg-white/20 text-white font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>স্টাফ ম্যাট্রিক্স</span>
              </button>
              <button
                type="button"
                onClick={() => setMatrixView('branch')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  matrixView === 'branch'
                    ? 'bg-white/20 text-white font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>ব্রাঞ্চ তুলনা</span>
              </button>
              <button
                type="button"
                onClick={() => setMatrixView('role')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  matrixView === 'role'
                    ? 'bg-white/20 text-white font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ডিপার্টমেন্ট</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Bottleneck Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Card 1: Peak Productivity Hour */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                পিক আওয়ার (Peak Productivity)
              </span>
              <p className="text-xl font-black text-white">
                {hourlyStats.maxCompletions > 0 ? formatHourLabel(hourlyStats.peakHour) : 'N/A'}
              </p>
              <p className="text-xs text-slate-300">
                {hourlyStats.maxCompletions > 0 ? `${hourlyStats.maxCompletions}টি টাস্ক এক ঘণ্টায় সম্পন্ন` : 'কোনো ডেটা নেই'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-lg border border-emerald-500/40 shrink-0">
              ⚡
            </div>
          </div>

          {/* Card 2: Identified Bottleneck Window */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                কাজের জট / লুল উইন্ডো (Bottleneck)
              </span>
              <p className="text-xl font-black text-white">
                {hourlyStats.bottleneckHour !== null ? formatHourLabel(hourlyStats.bottleneckHour) : 'সুষম'}
              </p>
              <p className="text-xs text-slate-300">
                {hourlyStats.bottleneckHour !== null
                  ? `সর্বনিম্ন মাত্র ${hourlyStats.minCompletions}টি টাস্ক (${hourlyStats.issuesCounts[hourlyStats.bottleneckHour] || 0}টি ইস্যু রিপোর্ট)`
                  : 'কোনো গতিশীল জট নেই'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black text-lg border border-amber-500/40 shrink-0">
              ⚠️
            </div>
          </div>

          {/* Card 3: Hourly Completion Velocity */}
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                গড় আউটপুট গতি (Velocity)
              </span>
              <p className="text-xl font-black text-white">
                {hourlyStats.velocity} <span className="text-xs font-normal text-slate-400">টাস্ক / ঘণ্টা</span>
              </p>
              <p className="text-xs text-slate-300">
                মোট {hourlyStats.totalDone}টি কাজের সময়ানুপাতিক রূপ
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-black text-lg border border-sky-500/40 shrink-0">
              📊
            </div>
          </div>

          {/* Card 4: Work Shift Phase Balance */}
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                শিফট বিভাজন (Shift Balance)
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span className="text-emerald-400">সকাল: {hourlyStats.morningCount}</span>
                <span className="text-slate-500">|</span>
                <span className="text-sky-400">বিকাল: {hourlyStats.afternoonCount}</span>
                <span className="text-slate-500">|</span>
                <span className="text-purple-400">সন্ধ্যা: {hourlyStats.eveningCount}</span>
              </div>
              <p className="text-xs text-slate-300">
                {hourlyStats.morningCount >= hourlyStats.afternoonCount
                  ? 'সকালের দিকে কাজের আউটপুট বেশি'
                  : 'বিকেলের দিকে কাজের ঘনত্ব বেশি'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-black text-lg border border-purple-500/40 shrink-0">
              ⚖️
            </div>
          </div>
        </div>

        {/* Bottleneck Diagnostic Recommendation Banner */}
        <div
          className={`mt-5 p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            bottleneckDiagnostic.severity === 'alert'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              : bottleneckDiagnostic.severity === 'warning'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                bottleneckDiagnostic.severity === 'alert'
                  ? 'bg-rose-500/20 text-rose-400'
                  : bottleneckDiagnostic.severity === 'warning'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {bottleneckDiagnostic.severity === 'alert' || bottleneckDiagnostic.severity === 'warning' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white">{bottleneckDiagnostic.titleBn}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
                  সুপারভাইজার ডায়াগনস্টিক
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                {bottleneckDiagnostic.descriptionBn}
              </p>
              <p className="text-xs font-bold text-amber-300 pt-0.5 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>করণীয় নির্দেশনা: {bottleneckDiagnostic.actionAdviceBn}</span>
              </p>
            </div>
          </div>

          {onSendDirective && (
            <button
              type="button"
              onClick={() => {
                const hourTarget = hourlyStats.bottleneckHour !== null ? hourlyStats.bottleneckHour : hourlyStats.peakHour;
                onSendDirective(
                  'all',
                  'all',
                  `[ইনটেনসিটি হিটম্যাপ এলার্ট]: ${formatHourLabel(hourTarget)} এর কাজের ধীরগতি নিরসনে অফিস সহকারী ও সকল অফিসারদের অবিলম্বে নির্ধারিত চেকলিস্ট আপডেট করার নির্দেশ প্রদান করা হলো।`
                );
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md shadow-amber-400/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>এই স্লটের জন্য ডিরেক্টিভ পাঠান</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Global Hourly Velocity Density Bar Strip */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-black text-white">
              সার্বিক ঘণ্টাপ্রতি কাজের ঘনত্ব (Hourly Task Completion Density Bar)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-white/20"></span>
              ০ কাজ (Lull)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              স্বাভাবিক
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-300/40"></span>
              পিক ঘণ্টা (Peak)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              ইস্যু/জট (Issue)
            </span>
          </div>
        </div>

        {/* Hourly Volume Bars with Interactive Click */}
        <div className="grid grid-cols-6 sm:grid-cols-13 gap-1.5 pt-2">
          {displayHours.map((hour) => {
            const count = hourlyStats.counts[hour] || 0;
            const issues = hourlyStats.issuesCounts[hour] || 0;
            const isPeak = hour === hourlyStats.peakHour && count > 0;
            const isBottleneck = hour === hourlyStats.bottleneckHour && count === hourlyStats.minCompletions;
            const isSelected = selectedHour === hour;
            const heightPercent = Math.max(16, Math.min(100, (count / Math.max(hourlyStats.maxCompletions, 1)) * 100));

            return (
              <button
                key={`bar-${hour}`}
                type="button"
                onClick={() => setSelectedHour(isSelected ? null : hour)}
                className={`flex flex-col items-center justify-between p-2 rounded-xl border transition-all cursor-pointer group text-center relative ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-500/20 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/20'
                    : isPeak
                    ? 'border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20'
                    : isBottleneck
                    ? 'border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20'
                    : 'border-white/5 bg-slate-950/40 hover:border-white/20'
                }`}
                title={`ঘণ্টা: ${formatHourLabel(hour)} — ${count}টি কাজ সম্পন্ন, ${issues}টি ইস্যু`}
              >
                {/* Peak Badge */}
                {isPeak && (
                  <span className="absolute -top-2 px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 font-black text-[9px] shadow-sm">
                    PEAK
                  </span>
                )}
                {isBottleneck && count <= 1 && (
                  <span className="absolute -top-2 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] shadow-sm">
                    LULL
                  </span>
                )}

                {/* Hour Label */}
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                </span>

                {/* Vertical Bar Container */}
                <div className="w-full h-16 flex items-end justify-center my-1.5">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[20px] rounded-t-md transition-all duration-300 relative ${
                      isPeak
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-300 shadow-md shadow-emerald-400/30'
                        : isBottleneck
                        ? 'bg-gradient-to-t from-amber-700 to-amber-400'
                        : count > 0
                        ? 'bg-gradient-to-t from-emerald-900 to-emerald-500'
                        : 'bg-slate-800'
                    }`}
                  >
                    {issues > 0 && (
                      <span className="absolute -top-1.5 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-950" />
                    )}
                  </div>
                </div>

                {/* Completion Count */}
                <div className="flex items-center justify-center gap-1">
                  <span
                    className={`text-xs font-black ${
                      isPeak
                        ? 'text-emerald-300 font-black'
                        : count > 0
                        ? 'text-white'
                        : 'text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Heatmap Matrix Controls & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          {/* Branch Filter */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setSelectedBranch('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedBranch === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              উভয় অফিস (Both)
            </button>
            <button
              type="button"
              onClick={() => setSelectedBranch('chowrasta')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedBranch === 'chowrasta'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ১. গাজীপুর শাখা
            </button>
            <button
              type="button"
              onClick={() => setSelectedBranch('rajbari')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedBranch === 'rajbari'
                  ? 'bg-sky-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ২. সদর অফিস
            </button>
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs font-bold text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">সকল পদবী (All Roles)</option>
            {SYSTEM_ROLES.filter((r) => r.id !== 'developer').map((r) => (
              <option key={r.id} value={r.id}>
                {r.titleBn}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="স্টাফ বা কাজের নাম খুঁজুন..."
            className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-56"
          />
        </div>
      </div>

      {/* 4. THE MATRIX (Rendered based on Matrix View) */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 overflow-x-auto shadow-xl">
        {/* VIEW 1: STAFF MATRIX (Employees x Hours) */}
        {matrixView === 'staff' && (
          <div className="min-w-[850px] space-y-2">
            {/* Table Header */}
            <div className="grid grid-cols-[220px_repeat(13,_1fr)] gap-2 pb-2 border-b border-white/10 text-[11px] font-black text-slate-400 uppercase tracking-wider">
              <div className="pl-2">কর্মকর্তা / স্টাফ (Staff)</div>
              {displayHours.map((hour) => (
                <div
                  key={`th-${hour}`}
                  className={`text-center cursor-pointer hover:text-white transition ${
                    selectedHour === hour ? 'text-emerald-400 font-black' : ''
                  }`}
                  onClick={() => setSelectedHour(selectedHour === hour ? null : hour)}
                >
                  {hour > 12 ? `${hour - 12}P` : hour === 12 ? '12P' : `${hour}A`}
                </div>
              ))}
            </div>

            {/* Employee Rows */}
            {filteredEmployees.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                কোনো স্টাফ পাওয়া যায়নি। ফিল্টার পরিবর্তন করে চেষ্টা করুন।
              </div>
            ) : (
              filteredEmployees.map((emp) => {
                // Get completed items by this employee in each hour
                const empCompleted = filteredCompleted.filter((c) => c.employee_id === emp.employee_id);
                const empPending = filteredPending.filter((p) => p.employee_id === emp.employee_id);

                return (
                  <div
                    key={`row-${emp.employee_id}`}
                    className="grid grid-cols-[220px_repeat(13,_1fr)] gap-2 items-center py-1.5 px-2 rounded-2xl hover:bg-white/[0.03] transition group border border-transparent hover:border-white/5"
                  >
                    {/* Employee Profile Cell */}
                    <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: emp.avatar_color || '#4f46e5' }}
                      >
                        {emp.name.substring(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate block">
                            {emp.name}
                          </span>
                          {onInspectEmployee && (
                            <button
                              type="button"
                              onClick={() => onInspectEmployee(emp)}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 opacity-0 group-hover:opacity-100 transition shrink-0 cursor-pointer"
                              title="প্রোফাইল পরিদর্শন করুন"
                            >
                              পরিদর্শন
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                          <span>{emp.employee_id}</span>
                          <span>•</span>
                          <span
                            className={
                              emp.branch === 'chowrasta' ? 'text-emerald-400' : 'text-sky-400'
                            }
                          >
                            {emp.branch === 'chowrasta' ? 'চৌরাস্তা' : 'সদর'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Hourly Intensity Cells */}
                    {displayHours.map((hour) => {
                      const hourTasks = empCompleted.filter((c) => c.hour === hour);
                      const hourIssues = empPending.filter((p) => p.hour === hour);
                      const count = hourTasks.length;
                      const hasIssues = hourIssues.length > 0;
                      const isSelected = selectedHour === hour;

                      return (
                        <div
                          key={`cell-${emp.employee_id}-${hour}`}
                          onClick={() => setSelectedHour(isSelected ? null : hour)}
                          className={`h-9 rounded-xl border flex items-center justify-center relative cursor-pointer transition-all duration-200 ${
                            getCellColorClass(count, 5)
                          } ${isSelected ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-950 scale-105 z-10' : ''}`}
                          title={`${emp.name} — ${formatHourLabel(hour)}: ${count}টি কাজ সম্পন্ন${hasIssues ? ` (${hourIssues.length}টি ইস্যু)` : ''}`}
                        >
                          <span className="text-[11px]">
                            {count > 0 ? count : ''}
                          </span>
                          {hasIssues && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-1 ring-slate-950" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* VIEW 2: DUAL-BRANCH COMPARATIVE MATRIX */}
        {matrixView === 'branch' && (
          <div className="min-w-[800px] space-y-4">
            <div className="grid grid-cols-[220px_repeat(13,_1fr)] gap-2 pb-2 border-b border-white/10 text-[11px] font-black text-slate-400 uppercase tracking-wider">
              <div className="pl-2">অফিস শাখা (Branch)</div>
              {displayHours.map((hour) => (
                <div key={`branch-th-${hour}`} className="text-center">
                  {hour > 12 ? `${hour - 12}P` : hour === 12 ? '12P' : `${hour}A`}
                </div>
              ))}
            </div>

            {/* Branch 1: Chowrasta */}
            <div className="grid grid-cols-[220px_repeat(13,_1fr)] gap-2 items-center p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  ১. গাজীপুর শাখা (Chowrasta)
                </span>
                <span className="text-[10px] text-slate-400 block">
                  মোট সম্পন্ন: {filteredCompleted.filter((c) => c.branch === 'chowrasta').length}টি
                </span>
              </div>
              {displayHours.map((hour) => {
                const count = hourlyStats.branchCounts.chowrasta[hour] || 0;
                return (
                  <div
                    key={`b-chow-${hour}`}
                    onClick={() => setSelectedHour(hour)}
                    className={`h-11 rounded-xl border flex items-center justify-center font-bold text-xs cursor-pointer transition ${getCellColorClass(
                      count,
                      hourlyStats.maxCompletions
                    )}`}
                  >
                    {count > 0 ? count : '—'}
                  </div>
                );
              })}
            </div>

            {/* Branch 2: Sadar Office */}
            <div className="grid grid-cols-[220px_repeat(13,_1fr)] gap-2 items-center p-3 rounded-2xl bg-sky-500/5 border border-sky-500/20">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-sky-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  ২. গাজীপুর সদর অফিস (Sadar)
                </span>
                <span className="text-[10px] text-slate-400 block">
                  মোট সম্পন্ন: {filteredCompleted.filter((c) => c.branch === 'rajbari').length}টি
                </span>
              </div>
              {displayHours.map((hour) => {
                const count = hourlyStats.branchCounts.rajbari[hour] || 0;
                return (
                  <div
                    key={`b-raj-${hour}`}
                    onClick={() => setSelectedHour(hour)}
                    className={`h-11 rounded-xl border flex items-center justify-center font-bold text-xs cursor-pointer transition ${getCellColorClass(
                      count,
                      hourlyStats.maxCompletions
                    )}`}
                  >
                    {count > 0 ? count : '—'}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 3: DEPARTMENT / ROLE BREAKDOWN */}
        {matrixView === 'role' && (
          <div className="min-w-[800px] space-y-3">
            <div className="grid grid-cols-[220px_repeat(13,_1fr)] gap-2 pb-2 border-b border-white/10 text-[11px] font-black text-slate-400 uppercase tracking-wider">
              <div className="pl-2">ডিপার্টমেন্ট / পদবী (Role)</div>
              {displayHours.map((hour) => (
                <div key={`role-th-${hour}`} className="text-center">
                  {hour > 12 ? `${hour - 12}P` : hour === 12 ? '12P' : `${hour}A`}
                </div>
              ))}
            </div>

            {SYSTEM_ROLES.filter((r) => r.id !== 'developer').map((role) => {
              const roleCompleted = filteredCompleted.filter((c) => c.employee_role === role.id);
              return (
                <div
                  key={`role-row-${role.id}`}
                  className="grid grid-cols-[220px_repeat(13,_1fr)] gap-2 items-center p-2 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition"
                >
                  <div className="space-y-0.5 pr-2">
                    <span className="text-xs font-bold text-white block truncate">
                      {role.titleBn}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      মোট: {roleCompleted.length}টি টাস্ক
                    </span>
                  </div>

                  {displayHours.map((hour) => {
                    const count = roleCompleted.filter((c) => c.hour === hour).length;
                    return (
                      <div
                        key={`r-cell-${role.id}-${hour}`}
                        onClick={() => setSelectedHour(hour)}
                        className={`h-10 rounded-xl border flex items-center justify-center font-bold text-xs cursor-pointer transition ${getCellColorClass(
                          count,
                          5
                        )}`}
                      >
                        {count > 0 ? count : ''}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. INTERACTIVE HOUR DRILL-DOWN DRAWER (When an hour is clicked) */}
      {selectedHourDetails && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Clock className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {formatHourRange(selectedHourDetails.hour)} এর বিস্তারিত কর্মবিবরণী (Hour Drill-Down)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/30">
                    {selectedHourDetails.completed.length}টি সম্পন্ন
                  </span>
                  {selectedHourDetails.pending.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/30">
                      {selectedHourDetails.pending.length}টি বিলম্ব নোট
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  এই নির্দিষ্ট ঘণ্টায় কারা কোন কাজ শেষ করেছেন এবং কোনো কাজের বিলম্ব ছিল কি না তার অডিট
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedHour(null)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-300 transition cursor-pointer self-start sm:self-auto"
            >
              বন্ধ করুন (Close)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Completed Tasks in this Hour */}
            <div className="space-y-2">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                সম্পন্নকৃত টাস্কসমূহ ({selectedHourDetails.completed.length})
              </span>

              {selectedHourDetails.completed.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-950/40 border border-white/5 text-center text-slate-500 text-xs">
                  এই ঘণ্টায় কোনো কাজ সম্পন্ন হিসেবে লগ করা হয়নি (Bottleneck Period)।
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {selectedHourDetails.completed.map((task, idx) => (
                    <div
                      key={`done-${task.id}-${idx}`}
                      className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-start justify-between gap-3 hover:border-emerald-500/30 transition"
                    >
                      <div className="space-y-1 min-w-0">
                        <span className="text-xs font-bold text-white block leading-snug">
                          {task.task_name}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
                          <span className="font-bold text-slate-300">{task.employee_name}</span>
                          <span>•</span>
                          <span
                            className={
                              task.branch === 'chowrasta' ? 'text-emerald-400' : 'text-sky-400'
                            }
                          >
                            {task.branch === 'chowrasta' ? '১. গাজীপুর শাখা' : '২. সদর অফিস'}
                          </span>
                          {task.actual_minutes ? (
                            <>
                              <span>•</span>
                              <span className="text-amber-300 font-bold flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                {task.actual_minutes} মিনিট
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 shrink-0">
                        {String(task.hour).padStart(2, '0')}:{String(task.minute).padStart(2, '0')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Blocker Reasons in this Hour */}
            <div className="space-y-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                বিলম্ব ও সমস্যার কারণ (Reported Issues: {selectedHourDetails.pending.length})
              </span>

              {selectedHourDetails.pending.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-950/40 border border-white/5 text-center text-slate-500 text-xs">
                  এই ঘণ্টায় কোনো অমীমাংসিত জটিলতা বা বিলম্ব কারণ রিপোর্ট করা হয়নি।
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {selectedHourDetails.pending.map((p, idx) => (
                    <div
                      key={`pend-${p.id}-${idx}`}
                      className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white truncate">{p.task_name}</span>
                        <span className="text-[10px] text-amber-300 font-mono">
                          {String(p.hour).padStart(2, '0')}:{String(p.minute).padStart(2, '0')}
                        </span>
                      </div>
                      <p className="text-xs text-amber-200/90 italic bg-black/20 p-2 rounded-xl border border-amber-500/10">
                        "{p.reason}"
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="text-slate-300 font-bold">{p.employee_name}</span>
                        <span>•</span>
                        <span>{p.branch === 'chowrasta' ? 'গাজীপুর শাখা' : 'সদর অফিস'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
