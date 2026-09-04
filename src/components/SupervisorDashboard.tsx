import React, { useState } from 'react';
import {
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
} from 'lucide-react';
import { requestAiAnalysis } from '../lib/supabase';

interface SupervisorDashboardProps {
  selectedDate: string;
  employees: Employee[];
  progressList: EmployeeDailyProgress[];
  templates: TaskTemplate[];
  onOpenEmployeeManager: () => void;
  onRefreshData: () => void;
  onInspectEmployee: (emp: Employee) => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({
  selectedDate,
  employees,
  progressList,
  templates,
  onOpenEmployeeManager,
  onRefreshData,
  onInspectEmployee,
}) => {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [aiReport, setAiReport] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [copiedAi, setCopiedAi] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'matrix' | 'ai' | 'issues'>('matrix');

  // Calculations for summary metrics
  const activeStaff = progressList.filter((p) => p.employee.is_active);
  const totalDone = activeStaff.reduce((acc, p) => acc + p.doneTasks, 0);
  const totalTasks = activeStaff.reduce((acc, p) => acc + p.totalTasks, 0);
  const totalPending = activeStaff.reduce((acc, p) => acc + p.pendingTasks, 0);
  const avgCompletion = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;
  const staffWithPendingReasons = activeStaff.filter((p) => p.pendingReasons.length > 0);

  const filteredStaff = activeStaff.filter((p) => {
    if (selectedRoleFilter === 'all') return true;
    return p.employee.role === selectedRoleFilter;
  });

  const handleGenerateAiSuggestions = async () => {
    setIsGeneratingAi(true);
    try {
      const summaryPayload = {
        date: selectedDate,
        employeesSummary: activeStaff.map((p) => ({
          name: p.employee.name,
          role: SYSTEM_ROLES.find((r) => r.id === p.employee.role)?.titleBn || p.employee.role,
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
      {/* Top Banner for Office Assistant / Supervisor */}
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
              সকল কর্মীর দৈনন্দিন কাজের অগ্রগতি, পেন্ডিং কারণ পর্যালোচনা করুন এবং পরবর্তী সিদ্ধান্ত গ্রহণের জন্য কৃত্রিম বুদ্ধিমত্তা (AI) কৌশলগত পরামর্শ গ্রহণ করুন।
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
            <span>{isGeneratingAi ? 'এআই বিশ্লেষণ প্রস্তুত হচ্ছে...' : 'এআই পরামর্শ ও সিদ্ধান্ত'}</span>
          </button>
        </div>
      </div>

      {/* 4 Key Executive Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#8e9299] uppercase tracking-wider block">
              সক্রিয় কর্মী
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-white">{activeStaff.length}</span>
              <span className="text-xs text-[#8e9299]">জন দায়িত্বপ্রাপ্ত</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#8e9299] uppercase tracking-wider block">
              গড় অগ্রগতি
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-emerald-400">{avgCompletion}%</span>
              <span className="text-xs text-[#8e9299]">সম্পন্ন হয়েছে</span>
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
              পেন্ডিং / ঝুলে থাকা
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-amber-400">{totalPending}</span>
              <span className="text-xs text-[#8e9299]">টি কাজে নজর প্রয়োজন</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
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
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'text-[#8e9299] hover:text-white bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>এআই পরামর্শ {aiReport ? '✓' : ''}</span>
          </button>
        </div>

        {/* Role Filter */}
        {activeTab === 'matrix' && (
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#8e9299]" />
            <span className="text-[#8e9299]">রোল ফিল্টার:</span>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-2.5 py-1 bg-[#1a1d22] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">সকল পদায়ন ({activeStaff.length})</option>
              {SYSTEM_ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.titleBn}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: Comparative Matrix */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStaff.map((p) => {
            const roleDef = SYSTEM_ROLES.find((r) => r.id === p.employee.role);
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
                      <span
                        className={`inline-block text-[11px] px-2 py-0.5 rounded-md border font-medium mt-1 ${
                          roleDef?.badgeBg || 'bg-white/10'
                        } ${roleDef?.badgeText || 'text-white/80'} ${
                          roleDef?.badgeBorder || 'border-white/10'
                        }`}
                      >
                        {roleDef?.titleBn || p.employee.role}
                      </span>
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

                {/* Pending Reasons Preview (if any) */}
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

                {/* Bottom Action: Inspect Employee Sheet */}
                <button
                  onClick={() => onInspectEmployee(p.employee)}
                  className="w-full py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/90 hover:text-white transition-colors flex items-center justify-center gap-1.5 border border-white/5"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>দৈনিক চেকলিস্ট ও রিপোর্ট দেখুন</span>
                  <ChevronRight className="w-3 h-3 text-[#8e9299]" />
                </button>
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
              <p className="text-xs text-[#8e9299]">টিমের সকল সদস্য দায়িত্ব সফলভাবে সম্পন্ন করেছেন।</p>
            </div>
          ) : (
            <div className="space-y-3">
              {staffWithPendingReasons.map((p) => {
                const roleDef = SYSTEM_ROLES.find((r) => r.id === p.employee.role);
                return (
                  <div key={p.employee.id} className="p-4 rounded-xl bg-white/[0.02] border border-amber-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-sm text-white">{p.employee.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/70">
                          {p.employee.employee_id}
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
        <div className="p-6 rounded-2xl bg-[#14171d] border border-teal-500/30 space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>এআই কৌশলগত সিদ্ধান্ত ও সুপারভাইজার পরামর্শ</span>
                  <span className="text-[10px] px-2 py-0.5 bg-teal-500/20 text-teal-300 font-semibold rounded-full border border-teal-500/30">
                    Gemini Powered
                  </span>
                </h3>
                <p className="text-xs text-[#8e9299]">
                  টিমের কার্যক্রম মূল্যায়ন করে পরবর্তী করণীয় পদক্ষেপ নির্ধারণ
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                <span>পুনরায় বিশ্লেষণ</span>
              </button>
            </div>
          </div>

          {isGeneratingAi ? (
            <div className="py-16 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-teal-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-white">
                টিমের সকল রিপোর্ট, পেন্ডিং কারণ ও পারফরম্যান্স বিশ্লেষণ করা হচ্ছে...
              </p>
              <p className="text-xs text-[#8e9299]">
                অফিস সহকারীর সিদ্ধান্ত গ্রহণের জন্য সুনির্দিষ্ট নির্দেশনা তৈরি হচ্ছে
              </p>
            </div>
          ) : aiReport ? (
            <div className="p-5 rounded-xl bg-black/40 border border-white/10 font-sans text-sm text-[#e4e4e7] leading-relaxed whitespace-pre-wrap">
              {aiReport}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-teal-400/50 mx-auto" />
              <p className="text-sm text-white font-medium">
                এখনো কোনো এআই কৌশলগত পরামর্শ জেনারেট করা হয়নি।
              </p>
              <button
                onClick={handleGenerateAiSuggestions}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-all shadow-md"
              >
                এআই বিশ্লেষণ শুরু করুন
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
