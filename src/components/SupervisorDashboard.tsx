import React, { useState, useEffect } from 'react';
import {
  BranchId,
  BRANCHES,
  DailyLogItem,
  Employee,
  EmployeeDailyProgress,
  RoleInfo,
  SYSTEM_ROLES,
  TaskTemplate,
  UserRole,
} from '../types';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Filter,
  Eye,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  UserPlus,
  FileText,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Crown,
  Building2,
  Landmark,
  MessageSquareQuote,
  Send,
} from 'lucide-react';
import { requestAiAnalysis } from '../lib/supabase';

interface SupervisorDashboardProps {
  selectedDate: string;
  employees: Employee[];
  progressList: EmployeeDailyProgress[];
  templates: TaskTemplate[];
  currentUser: Employee;
  selectedBranch: BranchId;
  onSelectBranch: (branch: BranchId) => void;
  onOpenEmployeeManager: () => void;
  onRefreshData: () => void;
  onInspectEmployee: (emp: Employee) => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({
  selectedDate,
  employees,
  progressList,
  templates,
  currentUser,
  selectedBranch,
  onSelectBranch,
  onOpenEmployeeManager,
  onRefreshData,
  onInspectEmployee,
}) => {
  const isBoss = currentUser?.role === 'main_boss' || currentUser?.employee_id === 'RAJI_SIR';

  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [aiReport, setAiReport] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [copiedAi, setCopiedAi] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'matrix' | 'ai' | 'issues'>('matrix');

  // Raji Sir's Executive Directives for the day
  const DIRECTIVE_STORAGE_KEY = `qgz_boss_directive_${selectedDate}`;
  const [bossDirective, setBossDirective] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(DIRECTIVE_STORAGE_KEY) || '';
    }
    return '';
  });
  const [savedDirectiveMsg, setSavedDirectiveMsg] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBossDirective(localStorage.getItem(DIRECTIVE_STORAGE_KEY) || '');
    }
  }, [selectedDate, DIRECTIVE_STORAGE_KEY]);

  const handleSaveDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem(DIRECTIVE_STORAGE_KEY, bossDirective);
      setSavedDirectiveMsg(true);
      setTimeout(() => setSavedDirectiveMsg(false), 2500);
    }
  };

  // Branch-specific calculations
  const activeStaff = progressList.filter((p) => p.employee.is_active);

  const chowrastaStaff = activeStaff.filter(
    (p) => p.employee.branch === 'chowrasta' || p.employee.employee_id.startsWith('CR-') || p.employee.employee_id === 'SUP-CHOW'
  );
  const rajbariStaff = activeStaff.filter(
    (p) => p.employee.branch === 'rajbari' || p.employee.employee_id.startsWith('RB-') || p.employee.employee_id === 'SUP-RAJB'
  );

  const getBranchStats = (staff: EmployeeDailyProgress[]) => {
    const totalDone = staff.reduce((acc, p) => acc + p.doneTasks, 0);
    const totalTasks = staff.reduce((acc, p) => acc + p.totalTasks, 0);
    const totalPending = staff.reduce((acc, p) => acc + p.pendingTasks, 0);
    const rate = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;
    const pendingIssuesCount = staff.reduce((acc, p) => acc + p.pendingReasons.length, 0);
    return { totalDone, totalTasks, totalPending, rate, pendingIssuesCount };
  };

  const chowrastaStats = getBranchStats(chowrastaStaff);
  const rajbariStats = getBranchStats(rajbariStaff);

  // Filter staff by selected branch
  const branchFilteredStaff = activeStaff.filter((p) => {
    if (selectedBranch === 'all') return true;
    if (selectedBranch === 'chowrasta') {
      return p.employee.branch === 'chowrasta' || p.employee.employee_id.startsWith('CR-') || p.employee.employee_id === 'SUP-CHOW';
    }
    if (selectedBranch === 'rajbari') {
      return p.employee.branch === 'rajbari' || p.employee.employee_id.startsWith('RB-') || p.employee.employee_id === 'SUP-RAJB';
    }
    return true;
  });

  // Overall summary metrics for current view
  const currentViewStaff = branchFilteredStaff;
  const totalDone = currentViewStaff.reduce((acc, p) => acc + p.doneTasks, 0);
  const totalTasks = currentViewStaff.reduce((acc, p) => acc + p.totalTasks, 0);
  const totalPending = currentViewStaff.reduce((acc, p) => acc + p.pendingTasks, 0);
  const avgCompletion = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;
  const staffWithPendingReasons = currentViewStaff.filter((p) => p.pendingReasons.length > 0);

  const filteredStaff = currentViewStaff.filter((p) => {
    if (selectedRoleFilter === 'all') return true;
    return p.employee.role === selectedRoleFilter;
  });

  const handleGenerateAiSuggestions = async () => {
    setIsGeneratingAi(true);
    try {
      const summaryPayload = {
        date: selectedDate,
        isBossView: isBoss,
        employeesSummary: activeStaff.map((p) => ({
          name: p.employee.name,
          role: SYSTEM_ROLES.find((r) => r.id === p.employee.role)?.titleBn || p.employee.role,
          branch: p.employee.branch || (p.employee.employee_id.startsWith('RB-') ? 'rajbari' : 'chowrasta'),
          completionRate: p.completionRate,
          totalTasks: p.totalTasks,
          doneTasks: p.doneTasks,
          pendingTasks: p.pendingTasks,
          pendingReasons: p.pendingReasons,
        })),
        teamStats: {
          totalStaff: employees.length,
          activeStaff: activeStaff.length,
          averageCompletion: avgCompletion,
          totalPendingItems: totalPending,
        },
        branchStats: {
          chowrasta: chowrastaStats,
          rajbari: rajbariStats,
        },
      };

      const result = await requestAiAnalysis(summaryPayload);
      setAiReport(result);
      setActiveTab('ai');
    } catch (err) {
      console.error('Error generating AI suggestion:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCopyAi = () => {
    if (!aiReport) return;
    navigator.clipboard.writeText(aiReport);
    setCopiedAi(true);
    setTimeout(() => setCopiedAi(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner - Customized for Raji Sir (Boss) or Branch Supervisor */}
      {isBoss ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#181611] to-amber-950/20 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/40 shrink-0 mt-0.5 shadow-sm">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  রাজি স্যারের সেন্ট্রাল কমান্ড সেন্টার (সার্বিক পর্যবেক্ষণ)
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded-full border border-amber-500/40">
                  Executive At-A-Glance
                </span>
              </div>
              <p className="text-xs text-[#d4d4d8] mt-1 leading-relaxed max-w-2xl">
                গাজীপুরের দুটো ব্রাঞ্চ—<strong>১। চৌরাস্তা ব্রাঞ্চ</strong> ও <strong>২। রাজবাড়ি ব্রাঞ্চ</strong>—এর সার্বিক অগ্রগতি এক নজরে পর্যবেক্ষণ করুন, সমস্যাগুলো চিহ্নিত করুন এবং প্রয়োজনীয় নির্বাহী সিদ্ধান্ত ও পরামর্শ প্রদান করুন।
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenEmployeeManager}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl border border-white/10 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>কর্মী ও পদায়ন</span>
            </button>

            <button
              onClick={handleGenerateAiSuggestions}
              disabled={isGeneratingAi}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingAi ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAi ? 'বিশ্লেষণ তৈরি হচ্ছে...' : 'রাজি স্যারের এআই সিদ্ধান্ত ও পরামর্শ'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#16191f] to-emerald-950/20 border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  অফিস সহকারী সামগ্রিক পর্যবেক্ষণ ড্যাশবোর্ড
                </h2>
                <span className="text-[11px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-semibold rounded-full border border-emerald-500/30">
                  Supervisor View
                </span>
              </div>
              <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed max-w-2xl">
                কর্মীদের দৈনন্দিন কাজের অগ্রগতি, পেন্ডিং কারণ পর্যালোচনা করুন এবং পরবর্তী সিদ্ধান্ত গ্রহণের জন্য এআই কৌশলগত পরামর্শ গ্রহণ করুন।
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onOpenEmployeeManager}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl border border-white/10 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>কর্মী ও পদায়ন</span>
            </button>

            <button
              onClick={handleGenerateAiSuggestions}
              disabled={isGeneratingAi}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingAi ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAi ? 'বিশ্লেষণ প্রস্তুত হচ্ছে...' : 'এআই পরামর্শ ও সিদ্ধান্ত'}</span>
            </button>
          </div>
        </div>
      )}

      {/* DUAL-BRANCH "AT-A-GLANCE" COMPARATIVE CARDS (Chowrasta vs Rajbari) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: ১। চৌরাস্তা ব্রাঞ্চ */}
        <div
          onClick={() => onSelectBranch('chowrasta')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
            selectedBranch === 'chowrasta'
              ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50'
              : 'bg-[#14161a] border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.02]'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">১। চৌরাস্তা ব্রাঞ্চ</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Chowrasta
                  </span>
                </div>
                <p className="text-[11px] text-[#8e9299]">গাজীপুর চৌরাস্তা মোড় • ইনচার্জ: মিজানুর রহমান</p>
              </div>
            </div>

            {/* Completion Percentage Ring */}
            <div className="text-right">
              <div className="text-xl font-extrabold text-emerald-400">{chowrastaStats.rate}%</div>
              <div className="text-[10px] text-[#8e9299]">অগ্রগতি</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden mt-3.5">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${chowrastaStats.rate}%` }}
            />
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-white/5 text-center">
            <div className="p-1.5 rounded-lg bg-white/[0.02]">
              <span className="text-[10px] text-[#8e9299] block">সক্রিয় কর্মী</span>
              <span className="text-xs font-bold text-white">{chowrastaStaff.length} জন</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/[0.02]">
              <span className="text-[10px] text-[#8e9299] block">সম্পন্ন টাস্ক</span>
              <span className="text-xs font-bold text-emerald-400">{chowrastaStats.totalDone} / {chowrastaStats.totalTasks}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/[0.02]">
              <span className="text-[10px] text-[#8e9299] block">পেন্ডিং কারণ</span>
              <span className="text-xs font-bold text-amber-400">{chowrastaStats.pendingIssuesCount} টি ইস্যু</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 text-[11px] text-[#8e9299]">
            <span className="text-emerald-400/90 font-medium">
              {selectedBranch === 'chowrasta' ? '✓ বর্তমান ভিউ ফিল্টার সক্রিয়' : 'ক্লিক করে শুধু চৌরাস্তা ফিল্টার করুন'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Card 2: ২। রাজবাড়ি ব্রাঞ্চ */}
        <div
          onClick={() => onSelectBranch('rajbari')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
            selectedBranch === 'rajbari'
              ? 'bg-sky-950/30 border-sky-500/50 shadow-[0_0_20px_rgba(14,165,233,0.15)] ring-1 ring-sky-500/50'
              : 'bg-[#14161a] border-white/10 hover:border-sky-500/30 hover:bg-white/[0.02]'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">২। রাজবাড়ি ব্রাঞ্চ</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                    Rajbari
                  </span>
                </div>
                <p className="text-[11px] text-[#8e9299]">গাজীপুর রাজবাড়ি রোড • ইনচার্জ: ফারহানা ইয়াসমিন</p>
              </div>
            </div>

            {/* Completion Percentage Ring */}
            <div className="text-right">
              <div className="text-xl font-extrabold text-sky-400">{rajbariStats.rate}%</div>
              <div className="text-[10px] text-[#8e9299]">অগ্রগতি</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden mt-3.5">
            <div
              className="h-full bg-sky-500 transition-all duration-300"
              style={{ width: `${rajbariStats.rate}%` }}
            />
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-white/5 text-center">
            <div className="p-1.5 rounded-lg bg-white/[0.02]">
              <span className="text-[10px] text-[#8e9299] block">সক্রিয় কর্মী</span>
              <span className="text-xs font-bold text-white">{rajbariStaff.length} জন</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/[0.02]">
              <span className="text-[10px] text-[#8e9299] block">সম্পন্ন টাস্ক</span>
              <span className="text-xs font-bold text-sky-400">{rajbariStats.totalDone} / {rajbariStats.totalTasks}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/[0.02]">
              <span className="text-[10px] text-[#8e9299] block">পেন্ডিং কারণ</span>
              <span className="text-xs font-bold text-amber-400">{rajbariStats.pendingIssuesCount} টি ইস্যু</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 text-[11px] text-[#8e9299]">
            <span className="text-sky-400/90 font-medium">
              {selectedBranch === 'rajbari' ? '✓ বর্তমান ভিউ ফিল্টার সক্রিয়' : 'ক্লিক করে শুধু রাজবাড়ি ফিল্টার করুন'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
          </div>
        </div>
      </div>

      {/* RAJI SIR'S EXECUTIVE DIRECTIVES INPUT (Stored & Persisted) */}
      {isBoss && (
        <form
          onSubmit={handleSaveDirective}
          className="p-4 rounded-xl bg-white/[0.02] border border-amber-500/20 space-y-2.5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <MessageSquareQuote className="w-4 h-4 text-amber-400" />
              <span>আজকের নির্বাহী আদেশ ও বিশেষ পর্যবেক্ষণ (রাজি স্যারের নির্দেশনাবলী)</span>
            </div>
            {savedDirectiveMsg && (
              <span className="text-[11px] text-emerald-400 font-semibold animate-pulse">
                ✓ নির্দেশ সংরক্ষিত হয়েছে!
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={bossDirective}
              onChange={(e) => setBossDirective(e.target.value)}
              placeholder="যেমন: চৌরাস্তা ইনচার্জ ৫টার মধ্যে ক্যাশ অডিট রিপোর্ট জমা দিন, রাজবাড়ি ফ্রন্ট ডেস্ক সেলস আপডেট শেষ করুন..."
              className="flex-1 px-3.5 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>নির্দেশ জারি করুন</span>
            </button>
          </div>
        </form>
      )}

      {/* 4 Summary Metrics for Active View */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#8e9299] uppercase tracking-wider block">
              {selectedBranch === 'all' ? 'উভয় ব্রাঞ্চের কর্মী' : selectedBranch === 'chowrasta' ? 'চৌরাস্তা কর্মী' : 'রাজবাড়ি কর্মী'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-white">{currentViewStaff.length}</span>
              <span className="text-xs text-[#8e9299]">জন দায়িত্বে</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#8e9299] uppercase tracking-wider block">
              গড় অগ্রগতি
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-emerald-400">{avgCompletion}%</span>
              <span className="text-xs text-[#8e9299]">সম্পন্ন হয়েছে</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#8e9299] uppercase tracking-wider block">
              মোট সম্পন্ন কাজ
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-white">{totalDone}</span>
              <span className="text-xs text-[#8e9299]">/ {totalTasks} টি টাস্ক</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#8e9299] uppercase tracking-wider block">
              পেন্ডিং / বাকি টাস্ক
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-amber-400">{totalPending}</span>
              <span className="text-xs text-[#8e9299]">টি টাস্ক</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Branch Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        {/* Sub-tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'matrix'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-[#8e9299] hover:text-white bg-white/5'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>টিম তুলনামূলক চিত্র</span>
          </button>

          <button
            onClick={() => setActiveTab('issues')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'issues'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-[#8e9299] hover:text-white bg-white/5'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>পেন্ডিং ও জবাবদিহিতা ({staffWithPendingReasons.length})</span>
          </button>

          <button
            onClick={() => {
              if (!aiReport) handleGenerateAiSuggestions();
              else setActiveTab('ai');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-[#8e9299] hover:text-white bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isBoss ? 'রাজি স্যারের এআই সিদ্ধান্ত' : 'এআই পরামর্শ'} {aiReport ? '✓' : ''}</span>
          </button>
        </div>

        {/* Branch Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => onSelectBranch('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedBranch === 'all'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-[#8e9299] hover:text-white'
            }`}
          >
            উভয় ব্রাঞ্চ (এক নজরে)
          </button>
          <button
            onClick={() => onSelectBranch('chowrasta')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              selectedBranch === 'chowrasta'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-[#8e9299] hover:text-emerald-300'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>১। চৌরাস্তা</span>
          </button>
          <button
            onClick={() => onSelectBranch('rajbari')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              selectedBranch === 'rajbari'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-[#8e9299] hover:text-sky-300'
            }`}
          >
            <Landmark className="w-3 h-3" />
            <span>২। রাজবাড়ি</span>
          </button>
        </div>
      </div>

      {/* Role Filter Bar */}
      {activeTab === 'matrix' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#8e9299]" />
            <span className="text-[#8e9299]">রোল অনুযায়ী ফিল্টার:</span>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-2.5 py-1 bg-[#1a1d22] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">সকল পদায়ন ({currentViewStaff.length})</option>
              {SYSTEM_ROLES.filter((r) => r.id !== 'main_boss').map((r) => (
                <option key={r.id} value={r.id}>
                  {r.titleBn}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[11px] text-[#8e9299]">
            প্রদর্শিত হচ্ছে: <strong className="text-white">{filteredStaff.length}</strong> জন কর্মী
          </span>
        </div>
      )}

      {/* TAB 1: Comparative Matrix */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStaff.map((p) => {
            const roleDef = SYSTEM_ROLES.find((r) => r.id === p.employee.role);
            const isChowrasta =
              p.employee.branch === 'chowrasta' ||
              p.employee.employee_id.startsWith('CR-') ||
              p.employee.employee_id === 'SUP-CHOW';
            const branchTag = isChowrasta ? '১। চৌরাস্তা ব্রাঞ্চ' : '২। রাজবাড়ি ব্রাঞ্চ';
            const branchBadgeColor = isChowrasta
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-sky-500/15 text-sky-400 border-sky-500/30';

            const hasPending = p.pendingReasons.length > 0;

            return (
              <div
                key={p.employee.id}
                className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-3"
              >
                {/* Employee Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: p.employee.avatar_color || '#3b82f6' }}
                    >
                      {p.employee.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-white truncate">
                          {p.employee.name}
                        </h3>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/70">
                          {p.employee.employee_id}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className={`text-[10px] px-2 py-0.2 rounded-md border font-semibold ${branchBadgeColor}`}>
                          {branchTag}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-md border font-medium ${
                            roleDef?.badgeBg || 'bg-white/10'
                          } ${roleDef?.badgeText || 'text-white/80'} ${
                            roleDef?.badgeBorder || 'border-white/10'
                          }`}
                        >
                          {roleDef?.titleBn || p.employee.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Completion Badge */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-base font-bold ${
                        p.completionRate >= 90
                          ? 'text-emerald-400'
                          : p.completionRate >= 50
                          ? 'text-amber-400'
                          : 'text-zinc-400'
                      }`}
                    >
                      {p.completionRate}%
                    </span>
                    <span className="block text-[10px] text-[#8e9299]">
                      {p.doneTasks}/{p.totalTasks} সম্পন্ন
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      p.completionRate >= 90
                        ? 'bg-emerald-500'
                        : p.completionRate >= 50
                        ? 'bg-amber-500'
                        : 'bg-zinc-500'
                    }`}
                    style={{ width: `${p.completionRate}%` }}
                  />
                </div>

                {/* Pending Reasons Preview */}
                {hasPending ? (
                  <div className="p-2.5 rounded-lg bg-amber-500/[0.04] border border-amber-500/20 text-xs space-y-1">
                    <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> পেন্ডিং কারণসমূহ ({p.pendingReasons.length}টি):
                    </span>
                    <ul className="space-y-0.5 text-zinc-300 text-[11px]">
                      {p.pendingReasons.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="truncate">
                          • <strong className="text-zinc-200">{item.task}:</strong> {item.reason}
                        </li>
                      ))}
                      {p.pendingReasons.length > 2 && (
                        <li className="text-[10px] text-amber-400/80">
                          + আরও {p.pendingReasons.length - 2}টি কারণ নথিভুক্ত রয়েছে...
                        </li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-emerald-500/[0.03] border border-emerald-500/10 text-xs text-emerald-400/90 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>সকল দায়িত্ব যথাসময়ে সম্পন্ন হচ্ছে</span>
                  </div>
                )}

                {/* Action: Inspect Employee Sheet */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-[#8e9299]">
                    যোগদান: {p.employee.joined_date || 'N/A'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onInspectEmployee(p.employee)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>সম্পূর্ণ রিপোর্ট দেখুন</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Accountability & Issues View */}
      {activeTab === 'issues' && (
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>কর্মীদের নথিভুক্ত পেন্ডিং কারণ ও জবাবদিহিতা ({selectedDate})</span>
            </h3>
            <span className="text-xs text-[#8e9299]">
              মোট {staffWithPendingReasons.length} জন কর্মীর কাজে অসম্পূর্ণতা রয়েছে
            </span>
          </div>

          {staffWithPendingReasons.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-medium text-white">আজকে কোনো কর্মীর কাজ পেন্ডিং নেই!</p>
              <p className="text-xs text-[#8e9299]">নির্বাচিত ব্রাঞ্চের সকল কর্মী দায়িত্ব সফলভাবে সম্পন্ন করেছেন।</p>
            </div>
          ) : (
            <div className="space-y-3">
              {staffWithPendingReasons.map((p) => {
                const roleDef = SYSTEM_ROLES.find((r) => r.id === p.employee.role);
                const isChowrasta =
                  p.employee.branch === 'chowrasta' ||
                  p.employee.employee_id.startsWith('CR-') ||
                  p.employee.employee_id === 'SUP-CHOW';
                const branchLabel = isChowrasta ? '১। চৌরাস্তা ব্রাঞ্চ' : '২। রাজবাড়ি ব্রাঞ্চ';

                return (
                  <div key={p.employee.id} className="p-4 rounded-xl bg-white/[0.02] border border-amber-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-white">{p.employee.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/70">
                          {p.employee.employee_id}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                          {branchLabel}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${roleDef?.badgeBg} ${roleDef?.badgeText} ${roleDef?.badgeBorder}`}>
                          {roleDef?.titleBn}
                        </span>
                      </div>
                      <button
                        onClick={() => onInspectEmployee(p.employee)}
                        className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        চেকলিস্ট দেখুন <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {p.pendingReasons.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-xs">
                          <span className="font-medium text-amber-300 shrink-0">
                            📌 {item.task}:
                          </span>
                          <span className="text-[#e4e4e7] italic text-right sm:text-left">
                            "{item.reason}"
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI Strategic Decision Engine */}
      {activeTab === 'ai' && (
        <div className="p-6 rounded-2xl bg-[#14171d] border border-amber-500/30 space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{isBoss ? 'রাজি স্যারের সেন্ট্রাল এআই সিদ্ধান্ত ও গাইডলাইন' : 'অফিস সহকারীর জন্য এআই কৌশলগত পরামর্শ'}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 font-semibold rounded-full border border-amber-500/30">
                    Gemini AI Strategy
                  </span>
                </h3>
                <p className="text-xs text-[#8e9299]">
                  {isBoss
                    ? '১। চৌরাস্তা ও ২। রাজবাড়ি উভয় ব্রাঞ্চের ডেটা পর্যালোচনা করে এক্সিকিউটিভ সমাহার'
                    : 'টিমের কার্যক্রম মূল্যায়ন করে পরবর্তী করণীয় পদক্ষেপ নির্ধারণ'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAi}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg transition-colors border border-white/10"
              >
                {copiedAi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAi ? 'কপি হয়েছে' : 'রিপোর্ট কপি'}</span>
              </button>

              <button
                onClick={handleGenerateAiSuggestions}
                disabled={isGeneratingAi}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                <span>পুনরায় বিশ্লেষণ</span>
              </button>
            </div>
          </div>

          {isGeneratingAi ? (
            <div className="py-16 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-white">
                চৌরাস্তা ও রাজবাড়ি উভয় ব্রাঞ্চের রিপোর্ট ও অগ্রগতি বিশ্লেষণ করা হচ্ছে...
              </p>
              <p className="text-xs text-[#8e9299]">
                {isBoss ? 'রাজি স্যারের এক্সিকিউটিভ সিদ্ধান্তের জন্য সুপারিশমালা তৈরি হচ্ছে' : 'অফিস সহকারীর সিদ্ধান্ত গ্রহণের জন্য সুনির্দিষ্ট নির্দেশনা তৈরি হচ্ছে'}
              </p>
            </div>
          ) : aiReport ? (
            <div className="p-5 rounded-xl bg-black/40 border border-white/10 font-sans text-sm text-[#e4e4e7] leading-relaxed whitespace-pre-wrap">
              {aiReport}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-amber-400/50 mx-auto" />
              <p className="text-sm text-white font-medium">
                এখনো কোনো এআই কৌশলগত পরামর্শ জেনারেট করা হয়নি।
              </p>
              <button
                onClick={handleGenerateAiSuggestions}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-all shadow-md"
              >
                {isBoss ? 'রাজি স্যারের এআই বিশ্লেষণ শুরু করুন' : 'এআই বিশ্লেষণ শুরু করুন'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
