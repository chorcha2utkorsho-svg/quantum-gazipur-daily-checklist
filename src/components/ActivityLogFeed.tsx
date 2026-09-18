import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ActivityLogEntry,
  ActivityType,
  DailyLogItem,
  Employee,
  BranchId,
} from '../types';
import {
  buildUnifiedActivityFeed,
  subscribeToActivityFeed,
} from '../lib/activityLogger';
import {
  CheckCircle2,
  FileText,
  Clock,
  Timer,
  Search,
  Building2,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Eye,
  Activity,
  MessageSquareQuote,
  Filter,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowDownCircle,
  Calendar,
  Layers,
} from 'lucide-react';

interface ActivityLogFeedProps {
  selectedDate: string;
  employees: Employee[];
  allDailyLogs?: DailyLogItem[];
  currentUser?: Employee | null;
  onInspectEmployee?: (emp: Employee) => void;
  compactMode?: boolean;
  maxHeightClass?: string;
}

export const ActivityLogFeed: React.FC<ActivityLogFeedProps> = ({
  selectedDate,
  employees,
  allDailyLogs = [],
  currentUser,
  onInspectEmployee,
  compactMode = false,
  maxHeightClass = 'max-h-[640px]',
}) => {
  const [feedItems, setFeedItems] = useState<ActivityLogEntry[]>([]);
  const [branchFilter, setBranchFilter] = useState<'all' | 'chowrasta' | 'rajbari'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ActivityType>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const [autoScroll, setAutoScroll] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [newActivityAlert, setNewActivityAlert] = useState<string | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevFeedLengthRef = useRef<number>(0);

  // Audio beep for real-time notification
  const playNotificationSound = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // AudioContext might be blocked until user interaction
    }
  };

  // Synchronize and build feed
  const refreshFeed = React.useCallback(() => {
    const items = buildUnifiedActivityFeed(selectedDate, employees, allDailyLogs);
    setFeedItems(items);
    setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    // Detect new activities
    if (prevFeedLengthRef.current > 0 && items.length > prevFeedLengthRef.current) {
      const newest = items[0];
      if (newest) {
        setNewActivityAlert(`${newest.employee_name}: ${newest.task_name}`);
        playNotificationSound();
        setTimeout(() => setNewActivityAlert(null), 4000);
      }
    }
    prevFeedLengthRef.current = items.length;
  }, [selectedDate, employees, allDailyLogs, soundEnabled]);

  // Initial load and whenever daily logs / date change
  useEffect(() => {
    refreshFeed();
  }, [refreshFeed]);

  // Subscribe to real-time events across windows/storage
  useEffect(() => {
    const unsubscribe = subscribeToActivityFeed(() => {
      refreshFeed();
    });

    // Also poll gently every 4 seconds to catch any external updates
    const interval = setInterval(() => {
      refreshFeed();
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [refreshFeed]);

  // Auto-scroll handler
  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [feedItems, autoScroll]);

  // Filtered feed
  const filteredFeed = useMemo(() => {
    return feedItems.filter((item) => {
      // Branch filter
      if (branchFilter !== 'all') {
        const itemBranch = item.branch || (item.employee_id.startsWith('GB-') ? 'chowrasta' : 'rajbari');
        if (itemBranch !== branchFilter) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false;
      }

      // Employee filter
      if (employeeFilter !== 'all' && item.employee_id !== employeeFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTask = item.task_name.toLowerCase().includes(query);
        const matchesEmp = item.employee_name.toLowerCase().includes(query);
        const matchesNote = item.note?.toLowerCase().includes(query);
        const matchesRole = item.employee_role?.toLowerCase().includes(query);
        if (!matchesTask && !matchesEmp && !matchesNote && !matchesRole) return false;
      }

      return true;
    });
  }, [feedItems, branchFilter, typeFilter, employeeFilter, searchQuery]);

  // Key stats from the entire feed for the day
  const stats = useMemo(() => {
    const completions = feedItems.filter((i) => i.type === 'task_completed').length;
    const notes = feedItems.filter((i) => i.type === 'note_added').length;
    const activeStaffSet = new Set(feedItems.map((i) => i.employee_id));
    const totalMinutes = feedItems.reduce((acc, i) => acc + (i.actual_minutes || 0), 0);

    return {
      completions,
      notes,
      activeStaffCount: activeStaffSet.size,
      totalMinutes: Math.round(totalMinutes),
    };
  }, [feedItems]);

  // Format relative timestamp in Bengali/English
  const formatTime = (isoString?: string) => {
    if (!isoString) return 'আজ';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'আজ';

      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSec < 60) return 'এইমাত্র (Just now)';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} মিনিট আগে`;
      if (diffSec < 86400) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'আজ';
    }
  };

  const getBranchBadge = (branch?: BranchId, empId?: string) => {
    const effectiveBranch = branch || (empId?.startsWith('GB-') ? 'chowrasta' : 'rajbari');
    if (effectiveBranch === 'chowrasta') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <Building2 className="w-3 h-3" />
          <span>১. গাজীপুর শাখা</span>
        </span>
      );
    }
    if (effectiveBranch === 'rajbari') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
          <Building2 className="w-3 h-3" />
          <span>২. গাজীপুর সদর অফিস</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
        <span>কেন্দ্রীয় সেল</span>
      </span>
    );
  };

  return (
    <div
      id="activity-log-feed-container"
      className="bg-[#101216] border border-white/10 rounded-2xl overflow-hidden shadow-xl"
    >
      {/* 1. Header Banner & Live Status */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#14171d] via-[#101318] to-[#14171d] border-b border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>রিয়েল-টাইম অ্যাক্টিভিটি ফিড</span>
                <span className="text-xs font-normal text-slate-400 font-mono hidden sm:inline">
                  (Live Task &amp; Note Feed)
                </span>
              </h2>

              {/* Pulsing Live Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] uppercase tracking-wider font-extrabold">● LIVE FEED</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-2xl">
              সুপারভাইজার রাজী স্যারের জন্য স্বয়ংক্রিয় স্ক্রোলিং ফিড — গাজীপুর শাখা ও গাজীপুর সদর অফিসের সকল কর্মীর প্রতিটি টাস্ক সম্পন্ন ও নোট তাত্ক্ষণিকভাবে এখানে লাইভ দেখা যায়।
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap self-start lg:self-center">
            {/* Auto Scroll Toggle */}
            <button
              type="button"
              onClick={() => setAutoScroll(!autoScroll)}
              title={autoScroll ? 'অটো-স্ক্রোল বন্ধ করুন' : 'নতুন অ্যাক্টিভিটিতে অটো-স্ক্রোল চালু করুন'}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                autoScroll
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              {autoScroll ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{autoScroll ? 'অটো-স্ক্রোল চালু' : 'অটো-স্ক্রোল'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'সাউন্ড অ্যালার্ট বন্ধ' : 'নতুন টাস্কে অডিও সাউন্ড চালু'}
              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                soundEnabled
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={refreshFeed}
              title="তাত্ক্ষণিক রিফ্রেশ"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">রিফ্রেশ ({lastSyncedTime})</span>
            </button>
          </div>
        </div>

        {/* Real-time alert toast */}
        {newActivityAlert && (
          <div className="mt-3 py-2 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>নতুন আপডেট এসেছে: <strong>{newActivityAlert}</strong></span>
          </div>
        )}

        {/* 2. Top Metric KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">সম্পন্ন টাস্ক</span>
              <span className="text-lg font-black text-emerald-400">{stats.completions} টি</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">পেন্ডিং নোট ও কারণ</span>
              <span className="text-lg font-black text-amber-400">{stats.notes} টি</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">অ্যাক্টিভ কর্মী</span>
              <span className="text-lg font-black text-sky-400">{stats.activeStaffCount} জন</span>
            </div>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">ব্যয়িত সময় ট্র্যাক</span>
              <span className="text-lg font-black text-purple-400">{stats.totalMinutes} মিনিট</span>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Timer className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter and Search Controls */}
      <div className="p-3.5 sm:p-4 bg-[#121419] border-b border-white/10 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Branch Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setBranchFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              branchFilter === 'all'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            উভয় শাখা (All)
          </button>
          <button
            type="button"
            onClick={() => setBranchFilter('chowrasta')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              branchFilter === 'chowrasta'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                : 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20'
            }`}
          >
            <span>১. গাজীপুর শাখা</span>
          </button>
          <button
            type="button"
            onClick={() => setBranchFilter('rajbari')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              branchFilter === 'rajbari'
                ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                : 'text-sky-400 hover:text-sky-300 bg-sky-500/10 border border-sky-500/20'
            }`}
          >
            <span>২. সদর অফিস</span>
          </button>
        </div>

        {/* Type & Employee Dropdowns + Search */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Activity Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-[#1a1d24] text-xs text-slate-200 border border-white/15 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">সব কার্যক্রম (All Activities)</option>
            <option value="task_completed">✓ সম্পন্ন কাজ (Completed Tasks)</option>
            <option value="note_added">📝 নোট ও কারণ (Notes &amp; Reasons)</option>
            <option value="time_logged">⏱️ সময় ট্র্যাক (Time Logged)</option>
          </select>

          {/* Employee Filter */}
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="bg-[#1a1d24] text-xs text-slate-200 border border-white/15 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500/50 max-w-[150px]"
          >
            <option value="all">সকল কর্মী (All Staff)</option>
            {employees
              .filter((e) => e.role !== 'main_boss' && e.employee_id !== 'DEV_ADMIN')
              .map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.name} ({emp.employee_id})
                </option>
              ))}
          </select>

          {/* Search Input */}
          <div className="relative flex-1 sm:flex-initial min-w-[160px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="টাস্ক বা নোট খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1d24] text-xs text-slate-200 placeholder:text-slate-500 rounded-lg pl-8 pr-3 py-1.5 border border-white/15 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>
      </div>

      {/* 4. Live Scrolling Feed List */}
      <div
        ref={scrollContainerRef}
        className={`overflow-y-auto divide-y divide-white/5 p-3 sm:p-4 space-y-3 ${maxHeightClass} scroll-smooth`}
      >
        {filteredFeed.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 mb-3 border border-white/10">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">কোনো অ্যাক্টিভিটি পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              নির্বাচিত ফিল্টারে এই মুহূর্তে কোনো টাস্ক রেকর্ড পাওয়া যায়নি। কর্মীরা চেকলিস্টে কাজ সম্পন্ন করলে অথবা নোট লিখলে সরাসরি এখানে প্রদর্শিত হবে।
            </p>
          </div>
        ) : (
          filteredFeed.map((item) => {
            const isCompleted = item.type === 'task_completed';
            const isNote = item.type === 'note_added';
            const isTime = item.type === 'time_logged';
            const isReopened = item.type === 'task_reopened';

            // Find full employee object for inspection button
            const matchedEmp = employees.find((e) => e.employee_id === item.employee_id);

            return (
              <div
                key={item.id}
                id={`activity-item-${item.id}`}
                className="pt-3 first:pt-0 group"
              >
                <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.025] hover:bg-white/[0.045] border border-white/5 hover:border-white/10 transition-all duration-200">
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Avatar & Meta */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md ring-1 ring-white/20"
                        style={{
                          backgroundColor: item.avatar_color || '#4f46e5',
                        }}
                      >
                        {item.employee_name.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white hover:text-emerald-400 transition-colors">
                            {item.employee_name}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                            {item.employee_id}
                          </span>
                          {getBranchBadge(item.branch, item.employee_id)}
                        </div>

                        {/* Task Title */}
                        <div className="mt-1 flex items-start gap-2">
                          <span className="text-xs sm:text-sm font-medium text-slate-200 leading-snug">
                            {item.task_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Pill & Timestamp */}
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>সম্পন্ন (Done)</span>
                        </span>
                      )}
                      {isNote && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <MessageSquareQuote className="w-3.5 h-3.5" />
                          <span>নোট/কারণ (Note)</span>
                        </span>
                      )}
                      {isTime && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                          <Timer className="w-3.5 h-3.5" />
                          <span>সময় রেকর্ড</span>
                        </span>
                      )}
                      {isReopened && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-500/15 text-slate-300 border border-slate-500/30">
                          <RotateCcw className="w-3 h-3" />
                          <span>পেন্ডিং</span>
                        </span>
                      )}

                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(item.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Note / Pending Reason Box */}
                  {item.note && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start gap-2.5">
                      <MessageSquareQuote className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400/90 block mb-0.5">
                          কর্মীর নোট / পেন্ডিং কারণ (Official Reason):
                        </span>
                        <p className="italic text-slate-200 leading-relaxed font-sans">
                          "{item.note}"
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Footer details: Logged Time + Inspect Employee Button */}
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                      {item.actual_minutes !== undefined && item.actual_minutes > 0 && (
                        <span className="flex items-center gap-1 text-sky-400 font-medium">
                          <Timer className="w-3 h-3" />
                          <span>ব্যয়িত সময়: {item.actual_minutes} মিনিট</span>
                        </span>
                      )}
                      <span className="text-slate-500">• পদবী: {item.employee_role}</span>
                    </div>

                    {/* Quick Profile Inspection for Supervisor */}
                    {matchedEmp && onInspectEmployee && (
                      <button
                        type="button"
                        onClick={() => onInspectEmployee(matchedEmp)}
                        className="opacity-80 group-hover:opacity-100 text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>চেকলিস্ট দেখুন</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Bottom Live Footer */}
      <div className="p-3 bg-[#0c0e12] border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[11px]">
            মোট <strong>{filteredFeed.length}</strong> টি অ্যাক্টিভিটি প্রদর্শিত হচ্ছে
          </span>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          তারিখ: {selectedDate}
        </div>
      </div>
    </div>
  );
};
