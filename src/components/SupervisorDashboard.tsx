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
  ExecutiveDirective,
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
  X,
  Phone,
  ArrowRight,
  CheckSquare,
  BarChart3,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertOctagon,
} from 'lucide-react';
import { requestAiAnalysis, fetchDirectives, sendDirective } from '../lib/supabase';
import { getWorkflowForEmployee } from '../data/workflowData';
import { AiStrategicInsight } from './AiStrategicInsight';

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
  onApproveEmployee?: (employeeId: string) => void;
  onRejectEmployee?: (employeeId: string) => void;
  logs?: DailyLogItem[];
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
  onApproveEmployee,
  onRejectEmployee,
  logs = [],
}) => {
  const isBoss = currentUser?.role === 'main_boss' || currentUser?.employee_id === 'RAJI_SIR';

  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [aiReport, setAiReport] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [copiedAi, setCopiedAi] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'matrix' | 'field_progress' | 'instant_directive' | 'approvals' | 'ai' | 'issues'>('field_progress');
  const [aiSubTab, setAiSubTab] = useState<'oa_insights' | 'boss_directives'>('oa_insights');
  const [approvalFeedback, setApprovalFeedback] = useState<string>('');

  // Instant Directives Dispatch State (Raji Sir's Live Directives)
  const [instantDirectives, setInstantDirectives] = useState<ExecutiveDirective[]>(() => fetchDirectives(selectedDate));
  const [targetType, setTargetType] = useState<'all' | 'branch' | 'employee'>('all');
  const [targetId, setTargetId] = useState<string>('all');
  const [directivePriority, setDirectivePriority] = useState<'urgent' | 'important' | 'normal'>('important');
  const [directiveMessage, setDirectiveMessage] = useState<string>('');
  const [directiveSuccessMsg, setDirectiveSuccessMsg] = useState<string>('');
  const [fieldSort, setFieldSort] = useState<'highest' | 'lowest' | 'branch'>('highest');
  const [fieldTierFilter, setFieldTierFilter] = useState<'all' | 'high' | 'slow' | 'zero'>('all');

  // Refresh instant directives on date change
  useEffect(() => {
    setInstantDirectives(fetchDirectives(selectedDate));
  }, [selectedDate]);

  const handleSendInstantDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directiveMessage.trim()) return;

    let targetName = 'সকল কর্মী ও কর্মকর্তা';
    if (targetType === 'branch') {
      targetName = targetId === 'rajbari' ? '২. গাজীপুর সদর অফিস' : '১. গাজীপুর ব্রাঞ্চ';
    } else if (targetType === 'employee') {
      const emp = employees.find((e) => e.employee_id === targetId);
      targetName = emp ? `${emp.name} (${emp.employee_id})` : targetId;
    }

    const newDirective: ExecutiveDirective = {
      id: `dir-${Date.now()}`,
      sender_id: currentUser?.employee_id || 'RAJI_SIR',
      sender_name: 'রাজি স্যার (সেন্ট্রাল ডিরেক্টর)',
      target_type: targetType,
      target_id: targetType === 'all' ? undefined : targetId,
      target_name: targetName,
      message: directiveMessage.trim(),
      priority: directivePriority,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: selectedDate,
      acknowledged_by: [],
    };

    const updated = sendDirective(newDirective);
    setInstantDirectives(updated);
    setDirectiveMessage('');
    setDirectiveSuccessMsg(`✅ "${targetName}"-এর নিকট দ্রুত নির্দেশনা প্রেরিত হয়েছে! কর্মীর প্রোফাইলে অ্যালার্ট চলে গেছে।`);
    setTimeout(() => setDirectiveSuccessMsg(''), 4000);
  };

  const handleQuickDirectiveToStaff = (empId: string) => {
    setTargetType('employee');
    setTargetId(empId);
    setActiveTab('instant_directive');
  };

  // Pending approval staff
  const pendingStaff = employees.filter((e) => e.approval_status === 'pending');

  const handleApprove = (emp: Employee) => {
    if (onApproveEmployee) {
      onApproveEmployee(emp.employee_id);
      setApprovalFeedback(`✅ কর্মী ${emp.name} (${emp.employee_id})-এর রেজিস্ট্রেশন সফলভাবে অনুমোদন করা হয়েছে! কর্মী এখন সক্রিয়।`);
      setTimeout(() => setApprovalFeedback(''), 5000);
    }
  };

  const handleReject = (emp: Employee) => {
    if (onRejectEmployee) {
      onRejectEmployee(emp.employee_id);
      setApprovalFeedback(`⚠️ কর্মী ${emp.name} (${emp.employee_id})-এর রেজিস্ট্রেশন আবেদন বাতিল করা হয়েছে।`);
      setTimeout(() => setApprovalFeedback(''), 5000);
    }
  };

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

  // Branch-specific calculations (only active, approved staff)
  const activeStaff = progressList.filter(
    (p) => p.employee.is_active && p.employee.approval_status !== 'pending' && p.employee.approval_status !== 'rejected'
  );

  const chowrastaStaff = activeStaff.filter(
    (p) =>
      p.employee.branch === 'chowrasta' ||
      p.employee.employee_id.startsWith('GB-') ||
      p.employee.employee_id.startsWith('CR-') ||
      p.employee.employee_id === 'SUP-CHOW'
  );
  const rajbariStaff = activeStaff.filter(
    (p) =>
      p.employee.branch === 'rajbari' ||
      p.employee.employee_id.startsWith('SO-') ||
      p.employee.employee_id.startsWith('RB-') ||
      p.employee.employee_id === 'SUP-RAJB' ||
      p.employee.employee_id === 'JAHID'
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
      return (
        p.employee.branch === 'chowrasta' ||
        p.employee.employee_id.startsWith('GB-') ||
        p.employee.employee_id.startsWith('CR-') ||
        p.employee.employee_id === 'SUP-CHOW'
      );
    }
    if (selectedBranch === 'rajbari') {
      return (
        p.employee.branch === 'rajbari' ||
        p.employee.employee_id.startsWith('SO-') ||
        p.employee.employee_id.startsWith('RB-') ||
        p.employee.employee_id === 'SUP-RAJB' ||
        p.employee.employee_id === 'JAHID'
      );
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
          role: SYSTEM_ROLES.find((r) => r.id === p.employee.role)?.titleEn || p.employee.role,
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
                  Raji Sir's Central Command Center (Executive Supervision)
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded-full border border-amber-500/40">
                  Executive At-A-Glance
                </span>
              </div>
              <p className="text-xs text-[#d4d4d8] mt-1 leading-relaxed max-w-2xl">
                Supervise cross-branch operations across <strong>1. Gazipur Branch</strong> and <strong>2. Gazipur Sadar Office</strong> at a glance, identify operational bottlenecks, and issue directives.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenEmployeeManager}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl border border-white/10 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Staff &amp; Roles</span>
            </button>

            <button
              onClick={handleGenerateAiSuggestions}
              disabled={isGeneratingAi}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingAi ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAi ? 'Generating Analysis...' : 'Executive AI Directives & Strategy'}</span>
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
                  Central Operations Supervision Dashboard
                </h2>
                <span className="text-[11px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-semibold rounded-full border border-emerald-500/30">
                  Supervisor View
                </span>
              </div>
              <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed max-w-2xl">
                Review team progress, audit pending accountability records, and leverage AI strategic guidance for operational excellence.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onOpenEmployeeManager}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl border border-white/10 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Staff &amp; Roles</span>
            </button>

            <button
              onClick={handleGenerateAiSuggestions}
              disabled={isGeneratingAi}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingAi ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAi ? 'Generating Analysis...' : 'AI Strategic Recommendations'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Approval Feedback Toast */}
      {approvalFeedback && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
          <span>{approvalFeedback}</span>
          <button
            onClick={() => setApprovalFeedback('')}
            className="text-emerald-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PENDING EMPLOYEE REGISTRATION APPROVALS (Raji Sir / Central Command) */}
      {pendingStaff.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#191611] to-amber-950/30 border-2 border-amber-500/50 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                <Clock className="w-6 h-6 animate-pulse text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-amber-200 tracking-tight">
                    নতুন কর্মী সাইন আপ অনুমোদন অনুরোধ (Pending Approvals)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs">
                    {pendingStaff.length} জন অপেক্ষমাণ
                  </span>
                </div>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  শ্রদ্ধেয় রাজি স্যার, নিম্নোক্ত কর্মীরা সাইন আপ করে আপনার অনুমোদনের অপেক্ষায় রয়েছেন। আপনি <strong>অনুমোদন (Approve)</strong> করলেই কর্মী নিজ একাউন্টে প্রবেশ করতে পারবেন।
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto ${
                activeTab === 'approvals'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30'
              }`}
            >
              <span>অনুমোদন ড্যাশবোর্ড</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pending Staff Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingStaff.map((emp) => {
              const roleDef = SYSTEM_ROLES.find((r) => r.id === emp.role);
              const branchLabel =
                emp.branch === 'rajbari' ? '🏛️ ২. গাজীপুর সদর অফিস' : '🏢 ১. গাজীপুর ব্রাঞ্চ';
              return (
                <div
                  key={emp.id}
                  className="p-4 rounded-xl bg-[#14161a] border border-amber-500/30 hover:border-amber-500/60 transition-all flex flex-col justify-between gap-3 shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: emp.avatar_color || '#f59e0b' }}
                        >
                          {emp.name.slice(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">{emp.name}</h4>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                            আইডি: {emp.employee_id}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        অনুমোদন অপেক্ষমাণ
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">শাখা:</span>
                        <span className="font-semibold text-white">{branchLabel}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">পদবি:</span>
                        <span className="font-semibold text-white">{roleDef?.titleEn || emp.role}</span>
                      </div>
                      {emp.phone && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span>ফোন:</span>
                          <span className="font-mono text-slate-300">{emp.phone}</span>
                        </div>
                      )}
                      {emp.notes && (
                        <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
                          "{emp.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Approve / Reject Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handleApprove(emp)}
                      className="flex-1 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>অনুমোদন (Approve)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(emp)}
                      className="py-2 px-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center justify-center transition-all"
                      title="আবেদন বাতিল করুন"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>বাতিল</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DUAL-BRANCH "AT-A-GLANCE" COMPARATIVE CARDS (Gazipur Branch vs Sadar Office) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: 1. Gazipur Branch */}
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
                  <h3 className="text-base font-bold text-white">1. Gazipur Branch</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Gazipur Branch
                  </span>
                </div>
                <p className="text-[11px] text-[#8e9299]">Gazipur Branch • 2 Personnel (Anjuman Khan, Mustakim Hosen)</p>
              </div>
            </div>

            {/* Completion Percentage Ring */}
            <div className="text-right">
              <div className="text-xl font-extrabold text-emerald-400">{chowrastaStats.rate}%</div>
              <div className="text-[10px] text-[#8e9299]">Progress</div>
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
              <span className="text-[10px] text-[#8e9299] block">Active Staff</span>
              <span className="text-xs font-bold text-white">{chowrastaStaff.length} staff</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/[0.02]">
              <span className="text-[10px] text-[#8e9299] block">Done Tasks</span>
              <span className="text-xs font-bold text-emerald-400">{chowrastaStats.totalDone} / {chowrastaStats.totalTasks}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/[0.02]">
              <span className="text-[10px] text-[#8e9299] block">Pending Issues</span>
              <span className="text-xs font-bold text-amber-400">{chowrastaStats.pendingIssuesCount} issues</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 text-[11px] text-[#8e9299]">
            <span className="text-emerald-400/90 font-medium">
              {selectedBranch === 'chowrasta' ? '✓ Filter Active' : 'Click to filter Gazipur Branch'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Card 2: 2. Gazipur Sadar Office */}
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
                  <h3 className="text-base font-bold text-white">2. Gazipur Sadar Office</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                    Sadar Office
                  </span>
                </div>
                <p className="text-[11px] text-[#8e9299]">Gazipur Sadar • 3 Personnel (Jahid Hasan, Tanzina Akter, Pronoy Das)</p>
              </div>
            </div>

            {/* Completion Percentage Ring */}
            <div className="text-right">
              <div className="text-xl font-extrabold text-sky-400">{rajbariStats.rate}%</div>
              <div className="text-[10px] text-[#8e9299]">Progress</div>
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
              <span className="text-[10px] text-[#8e9299] block">Active Staff</span>
              <span className="text-xs font-bold text-white">{rajbariStaff.length} staff</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/[0.02]">
              <span className="text-[10px] text-[#8e9299] block">Done Tasks</span>
              <span className="text-xs font-bold text-sky-400">{rajbariStats.totalDone} / {rajbariStats.totalTasks}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/[0.02]">
              <span className="text-[10px] text-[#8e9299] block">Pending Issues</span>
              <span className="text-xs font-bold text-amber-400">{rajbariStats.pendingIssuesCount} issues</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 text-[11px] text-[#8e9299]">
            <span className="text-sky-400/90 font-medium">
              {selectedBranch === 'rajbari' ? '✓ Filter Active' : 'Click to filter Sadar Office'}
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
              <span>Today's Executive Directives &amp; Notes (Raji Sir's Orders)</span>
            </div>
            {savedDirectiveMsg && (
              <span className="text-[11px] text-emerald-400 font-semibold animate-pulse">
                ✓ Directives Saved!
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={bossDirective}
              onChange={(e) => setBossDirective(e.target.value)}
              placeholder="e.g., Gazipur Branch incharge submit cash reconciliation by 5 PM, Sadar front desk finalize donor updates..."
              className="flex-1 px-3.5 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>Post Directive</span>
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
              {selectedBranch === 'all' ? 'All Assigned Staff' : selectedBranch === 'chowrasta' ? 'Gazipur Branch Staff' : 'Sadar Office Staff'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-white">{currentViewStaff.length}</span>
              <span className="text-xs text-[#8e9299]">On Duty</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#8e9299] uppercase tracking-wider block">
              Average Progress
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-emerald-400">{avgCompletion}%</span>
              <span className="text-xs text-[#8e9299]">Completed</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#8e9299] uppercase tracking-wider block">
              Total Completed
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-white">{totalDone}</span>
              <span className="text-xs text-[#8e9299]">/ {totalTasks} Tasks</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#8e9299] uppercase tracking-wider block">
              Pending Tasks
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-amber-400">{totalPending}</span>
              <span className="text-xs text-[#8e9299]">Tasks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Branch Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        {/* Sub-tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Proportional Multi-Dimensional Field Matrix (Exact User Requirement) */}
          <button
            onClick={() => setActiveTab('field_progress')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'field_progress'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                : 'text-emerald-300 hover:text-white bg-emerald-500/10 border border-emerald-500/30'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>ফিল্ড অগ্রগতি মাত্রা (Field Matrix)</span>
          </button>

          {/* 2. Instant Directive Dispatch (Exact User Requirement: "চাইলে তিনি দ্রুত নির্দেশনা পাঠাতে পারবেন") */}
          <button
            onClick={() => setActiveTab('instant_directive')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'instant_directive'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-black'
                : 'text-amber-300 hover:text-white bg-amber-500/10 border border-amber-500/30'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>দ্রুত নির্দেশনা পাঠান</span>
            {instantDirectives.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                {instantDirectives.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'matrix'
                ? 'bg-white/20 text-white border border-white/30'
                : 'text-[#8e9299] hover:text-white bg-white/5'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>টিম ম্যাট্রিক্স</span>
          </button>

          {/* Pending Staff Approvals Tab */}
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'approvals'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : pendingStaff.length > 0
                ? 'text-amber-300 hover:text-white bg-amber-500/10 border border-amber-500/30 animate-pulse'
                : 'text-[#8e9299] hover:text-white bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>কর্মী অনুমোদন</span>
            {pendingStaff.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                {pendingStaff.length}
              </span>
            )}
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
            <span>Pending &amp; Accountability ({staffWithPendingReasons.length})</span>
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
            <span>{isBoss ? 'Executive AI Directives' : 'AI Strategic Insights'} {aiReport ? '✓' : ''}</span>
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
            Both Offices
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
            <span>1. Gazipur Branch</span>
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
            <span>2. Sadar Office</span>
          </button>
        </div>
      </div>

      {/* TAB 0: MULTI-DIMENSIONAL PROPORTIONAL FIELD PROGRESS MATRIX (Raji Sir's Central Overview) */}
      {activeTab === 'field_progress' && (() => {
        const fieldStaffWithTiers = activeStaff.map((p) => {
          let tier: 'high' | 'slow' | 'zero' = 'zero';
          if (p.completionRate >= 75) tier = 'high';
          else if (p.completionRate >= 40) tier = 'slow';
          else tier = 'zero';
          return { ...p, tier };
        });

        const highCount = fieldStaffWithTiers.filter((p) => p.tier === 'high').length;
        const slowCount = fieldStaffWithTiers.filter((p) => p.tier === 'slow').length;
        const zeroCount = fieldStaffWithTiers.filter((p) => p.tier === 'zero').length;

        const displayedFieldStaff = fieldStaffWithTiers
          .filter((p) => {
            if (selectedBranch !== 'all') {
              if (selectedBranch === 'chowrasta') {
                const isChow =
                  p.employee.branch === 'chowrasta' ||
                  p.employee.employee_id.startsWith('GB-') ||
                  p.employee.employee_id.startsWith('CR-');
                if (!isChow) return false;
              } else {
                const isSadar =
                  p.employee.branch === 'rajbari' ||
                  p.employee.employee_id.startsWith('SO-') ||
                  p.employee.employee_id.startsWith('RB-');
                if (!isSadar) return false;
              }
            }
            if (fieldTierFilter === 'high') return p.tier === 'high';
            if (fieldTierFilter === 'slow') return p.tier === 'slow';
            if (fieldTierFilter === 'zero') return p.tier === 'zero';
            return true;
          })
          .sort((a, b) => {
            if (fieldSort === 'highest') return b.completionRate - a.completionRate;
            if (fieldSort === 'lowest') return a.completionRate - b.completionRate;
            return a.employee.branch.localeCompare(b.employee.branch);
          });

        return (
          <div className="space-y-6">
            {/* Header & Concept Explanation */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/30 border border-emerald-500/30 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <BarChart3 className="w-5 h-5" />
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                      একনজরে পুরো ফিল্ডের কাজের অগ্রগতি (Proportional Field Matrix)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                    শ্রদ্ধেয় রাজি স্যার, এই ড্যাশবোর্ডে পুরো ফিল্ড জুড়ে সমানুপাতে কার কাজের অগ্রগতি সন্তোষজনকভাবে বাড়ছে, কার কমে গেছে বা কার অগ্রগতি এখনও শূন্য—তা একনজরে বিভিন্ন মাত্রায় পর্যবেক্ষণ করুন এবং যেকোনো কর্মীকে তাৎক্ষণিক নির্দেশনা দিন।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('instant_directive')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-400/20 cursor-pointer self-start md:self-auto shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>সবার নিকট দ্রুত নির্দেশনা পাঠান</span>
                </button>
              </div>

              {/* 3 Executive Proportional Tiers Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* 1. High Progress */}
                <button
                  type="button"
                  onClick={() => setFieldTierFilter(fieldTierFilter === 'high' ? 'all' : 'high')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    fieldTierFilter === 'high'
                      ? 'bg-emerald-500/20 border-emerald-500 text-white ring-1 ring-emerald-500'
                      : 'bg-white/[0.02] border-emerald-500/20 hover:bg-emerald-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <ArrowUpRight className="w-4 h-4" />
                      উচ্চ অগ্রগতি (৭৫% - ১০০%)
                    </span>
                    <span className="text-base font-black text-emerald-400">{highCount} জন</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    কাজের অগ্রগতি দ্রুত গতিতে এগোচ্ছে ও লক্ষ্যমাত্রায় রয়েছে।
                  </p>
                </button>

                {/* 2. Slow / Lagging */}
                <button
                  type="button"
                  onClick={() => setFieldTierFilter(fieldTierFilter === 'slow' ? 'all' : 'slow')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    fieldTierFilter === 'slow'
                      ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500'
                      : 'bg-white/[0.02] border-amber-500/20 hover:bg-amber-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Minus className="w-4 h-4" />
                      অগ্রগতি ধীর / কমে গেছে (৪০% - ৭৪%)
                    </span>
                    <span className="text-base font-black text-amber-400">{slowCount} জন</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    কাজের গতি মন্থর; তদারকি ও সহায়তা প্রয়োজন।
                  </p>
                </button>

                {/* 3. Zero / Low */}
                <button
                  type="button"
                  onClick={() => setFieldTierFilter(fieldTierFilter === 'zero' ? 'all' : 'zero')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    fieldTierFilter === 'zero'
                      ? 'bg-rose-500/20 border-rose-500 text-white ring-1 ring-rose-500'
                      : 'bg-white/[0.02] border-rose-500/20 hover:bg-rose-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <ArrowDownRight className="w-4 h-4" />
                      অগ্রগতি নাই / শুরু হয়নি (০% - ৩৯%)
                    </span>
                    <span className="text-base font-black text-rose-400">{zeroCount} জন</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    আজকের কাজ এখনও শুরু হয়নি বা বড় বাধা রয়েছে।
                  </p>
                </button>
              </div>
            </div>

            {/* Filtering & Sorting Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-semibold">ফিল্টার:</span>
                <button
                  type="button"
                  onClick={() => setFieldTierFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    fieldTierFilter === 'all'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  সকল কর্মী ({fieldStaffWithTiers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFieldTierFilter('high')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    fieldTierFilter === 'high'
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  উচ্চ অগ্রগতি ({highCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFieldTierFilter('slow')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    fieldTierFilter === 'slow'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                  }`}
                >
                  ধীরগতি ({slowCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFieldTierFilter('zero')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    fieldTierFilter === 'zero'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                  }`}
                >
                  অগ্রগতি নাই ({zeroCount})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold">সাজান:</span>
                <select
                  value={fieldSort}
                  onChange={(e) => setFieldSort(e.target.value as any)}
                  className="px-3 py-1.5 bg-[#14161a] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="highest">সর্বোচ্চ অগ্রগতি প্রথমে</option>
                  <option value="lowest">সর্বনিম্ন / কমে গেছে প্রথমে</option>
                  <option value="branch">শাখা অনুযায়ী</option>
                </select>
              </div>
            </div>

            {/* Proportional Comparative Visualizer List */}
            <div className="space-y-3">
              {displayedFieldStaff.map((p) => {
                const roleDef = SYSTEM_ROLES.find((r) => r.id === p.employee.role);
                const isChowrasta =
                  p.employee.branch === 'chowrasta' ||
                  p.employee.employee_id.startsWith('GB-') ||
                  p.employee.employee_id.startsWith('CR-');
                const branchLabel = isChowrasta ? '১. গাজীপুর ব্রাঞ্চ' : '২. গাজীপুর সদর অফিস';

                const tierColor =
                  p.tier === 'high'
                    ? 'emerald'
                    : p.tier === 'slow'
                    ? 'amber'
                    : 'rose';

                return (
                  <div
                    key={p.employee.id}
                    className={`p-4 sm:p-5 rounded-2xl bg-[#14161a] border transition-all hover:bg-white/[0.02] shadow-sm space-y-3 ${
                      p.tier === 'high'
                        ? 'border-emerald-500/30'
                        : p.tier === 'slow'
                        ? 'border-amber-500/30'
                        : 'border-rose-500/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Employee Identity */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm uppercase text-white shadow-md shrink-0"
                          style={{ backgroundColor: p.employee.avatar_color || '#10b981' }}
                        >
                          {p.employee.name.slice(0, 2)}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-white">
                              {p.employee.name}
                            </h4>
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 font-bold">
                              {p.employee.employee_id}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                p.tier === 'high'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : p.tier === 'slow'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              }`}
                            >
                              {p.tier === 'high'
                                ? '🚀 উচ্চ অগ্রগতি'
                                : p.tier === 'slow'
                                ? '⚠️ গতি কমে গেছে'
                                : '🛑 অগ্রগতি নাই'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span className="text-white font-medium">
                              {roleDef?.titleBn || p.employee.role}
                            </span>
                            <span>•</span>
                            <span>{branchLabel}</span>
                          </div>
                        </div>
                      </div>

                      {/* Numerical Stats & Quick Directive Button */}
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="text-right">
                          <div
                            className={`text-2xl font-black font-mono leading-none ${
                              p.tier === 'high'
                                ? 'text-emerald-400'
                                : p.tier === 'slow'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {p.completionRate}%
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-1">
                            {p.doneTasks} / {p.totalTasks} টি কাজ সম্পন্ন
                          </span>
                        </div>

                        {/* Instant Directive Trigger for this employee */}
                        <button
                          type="button"
                          onClick={() => handleQuickDirectiveToStaff(p.employee.employee_id)}
                          className="px-3 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400 text-amber-300 hover:text-slate-950 border border-amber-400/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          title="এই কর্মীকে দ্রুত নির্দেশনা পাঠান"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">নির্দেশনা দিন</span>
                        </button>
                      </div>
                    </div>

                    {/* Proportional Full-Width Visual Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden flex p-0.5 border border-white/10">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            p.tier === 'high'
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                              : p.tier === 'slow'
                              ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${p.completionRate}%` }}
                          title={`অগ্রগতি: ${p.completionRate}%`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>সম্পন্ন: {p.completionRate}%</span>
                        {p.pendingTasks > 0 ? (
                          <span className="text-amber-400 font-medium">
                            বাকি আছে: {p.pendingTasks} টি কাজ
                            {p.pendingReasons.length > 0 && ` (${p.pendingReasons.length} টির কারণ লিপিবদ্ধ)`}
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold">সকল কাজ সম্পন্ন ✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* TAB 0.5: RAJI SIR'S INSTANT DIRECTIVE DISPATCH (Exact User Requirement: "চাইলে তিনি দ্রুত নির্দেশনা পাঠাতে পারবেন") */}
      {activeTab === 'instant_directive' && (
        <div className="space-y-6">
          {directiveSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
              <span>{directiveSuccessMsg}</span>
              <button
                onClick={() => setDirectiveSuccessMsg('')}
                className="text-emerald-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Dispatch Directive Panel */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#14161a] border border-amber-500/30 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <Send className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                    রাজি স্যারের দ্রুত নির্দেশনা প্রেরণ (Instant Executive Directive Dispatch)
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  ফিল্ডের যেকোনো কর্মী, নির্দিষ্ট শাখা অথবা সমগ্র টিমের নিকট জরুরি নির্দেশনা পাঠান। কর্মী সাইন ইন করলেই স্ক্রিনের শীর্ষে এই নির্দেশনার অ্যালার্ট দেখতে পাবেন এবং প্রাপ্তিস্বীকার করতে পারবেন।
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold self-start sm:self-auto">
                সরাসরি সম্প্রচার
              </span>
            </div>

            <form onSubmit={handleSendInstantDirective} className="space-y-4">
              {/* 1. Recipient Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    কার নিকট পাঠাবেন (Recipient):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetType('all');
                        setTargetId('all');
                      }}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        targetType === 'all'
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      সকল কর্মী (All)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetType('branch');
                        setTargetId('chowrasta');
                      }}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        targetType === 'branch' && targetId === 'chowrasta'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-black'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      ১. গাজীপুর ব্রাঞ্চ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetType('branch');
                        setTargetId('rajbari');
                      }}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        targetType === 'branch' && targetId === 'rajbari'
                          ? 'bg-sky-500 text-slate-950 border-sky-500 font-black'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      ২. সদর অফিস
                    </button>
                  </div>
                </div>

                {/* Specific Employee Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    অথবা নির্দিষ্ট কোনো কর্মী নির্বাচন করুন:
                  </label>
                  <select
                    value={targetType === 'employee' ? targetId : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setTargetType('employee');
                        setTargetId(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#1a1d22] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- ফিল্ডের নির্দিষ্ট কর্মী বাছাই করুন --</option>
                    {employees
                      .filter((e) => e.is_active && e.approval_status !== 'pending')
                      .map((emp) => (
                        <option key={emp.employee_id} value={emp.employee_id}>
                          {emp.name} ({emp.employee_id}) - {emp.branch === 'rajbari' ? 'সদর অফিস' : 'গাজীপুর ব্রাঞ্চ'}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* 2. Priority Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  নির্দেশনার গুরুত্ব ও ধরন (Priority):
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDirectivePriority('urgent')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      directivePriority === 'urgent'
                        ? 'bg-rose-500 text-white border-rose-500 font-black'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    🚨 জরুরি আদেশ (Urgent)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirectivePriority('important')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      directivePriority === 'important'
                        ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    ⚡ গুরুত্বপূর্ণ নির্দেশনা (Important)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirectivePriority('normal')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      directivePriority === 'normal'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-black'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    🌟 উৎসাহ ও সাধারণ পরামর্শ (Encouragement)
                  </button>
                </div>
              </div>

              {/* Quick Template Chips */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  এক ক্লিকে প্রস্তুত নির্দেশনা বসান (Quick Templates):
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'বিকেল ৪:৪৫ টার মধ্যে ক্যাশ ক্লোজিং এবং দৈনিক রিপোর্ট সাবমিট করুন।',
                    'পেন্ডিং থাকা কাজগুলোর কারণ অবিলম্বে দূর করে অগ্রগতি আপডেট দিন।',
                    'সকাল ১০:০০ টার পূর্বে সকল ডেস্ক, ভাউচার ও সামগ্রী প্রস্তুত রাখুন।',
                    'আজকের কাজের চমৎকার অগ্রগতির জন্য ধন্যবাদ! ধারাবাহিকতা বজায় রাখুন।',
                    'বিকাশ এমআর এবং ডোনেশন রিসিটগুলো এখনই নিখুঁতভাবে রিকনসাইল করুন।',
                  ].map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setDirectiveMessage(tpl)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-400/20 text-slate-300 hover:text-amber-200 border border-white/10 transition-colors cursor-pointer text-left"
                    >
                      + {tpl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  নির্দেশনার বিবরণী (Directive Message):
                </label>
                <textarea
                  rows={3}
                  value={directiveMessage}
                  onChange={(e) => setDirectiveMessage(e.target.value)}
                  placeholder="যেমন: আজকের ক্যাশ ক্লোজিংয়ের সময় সব ভাউচার ডাবল চেক করুন এবং বিকেল ৫:০০ টার মধ্যে চূড়ান্ত রিপোর্ট পাঠান..."
                  className="w-full text-xs p-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  নির্দেশনাটি তৎক্ষণাৎ কর্মীদের স্ক্রিনে পৌঁছাবে।
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>নির্দেশনা সম্প্রচার করুন</span>
                </button>
              </div>
            </form>
          </div>

          {/* Sent Directives History & Acknowledgment Tracking */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#14161a] border border-white/10 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">
                  আজকের প্রেরিত নির্দেশনাসমূহ ও প্রাপ্তিস্বীকার ট্র্যাকিং ({selectedDate})
                </h4>
              </div>
              <span className="text-xs text-slate-400">
                মোট {instantDirectives.length} টি নির্দেশনা
              </span>
            </div>

            {instantDirectives.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                আজকের জন্য কোনো নির্দেশনা পাঠানো হয়নি।
              </div>
            ) : (
              <div className="space-y-3">
                {instantDirectives.map((dir) => {
                  const ackCount = dir.acknowledged_by?.length || 0;

                  return (
                    <div
                      key={dir.id}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-amber-300">
                            প্রাপক: {dir.target_name || 'সকল কর্মী'}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                              dir.priority === 'urgent'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {dir.priority === 'urgent' ? 'জরুরি' : 'গুরুত্বপূর্ণ'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {dir.created_at}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                          "{dir.message}"
                        </p>
                      </div>

                      {/* Live Acknowledgment Tracker */}
                      <div className="shrink-0 flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            ackCount > 0 ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        />
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">প্রাপ্তিস্বীকার</span>
                          <span className="text-xs font-bold text-white">
                            {ackCount > 0 ? `${ackCount} জন স্বীকার করেছেন` : 'অপেক্ষমাণ'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Role Filter Bar */}
      {activeTab === 'matrix' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#8e9299]" />
            <span className="text-[#8e9299]">Filter by Role:</span>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-2.5 py-1 bg-[#1a1d22] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Roles ({currentViewStaff.length})</option>
              {SYSTEM_ROLES.filter((r) => r.id !== 'main_boss').map((r) => (
                <option key={r.id} value={r.id}>
                  {r.titleEn}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[11px] text-[#8e9299]">
            Showing: <strong className="text-white">{filteredStaff.length}</strong> staff members
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
              p.employee.employee_id.startsWith('GB-') ||
              p.employee.employee_id.startsWith('CR-') ||
              p.employee.employee_id === 'SUP-CHOW';
            const branchTag = isChowrasta ? '1. Gazipur Branch' : '2. Gazipur Sadar Office';
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
                          {roleDef?.titleEn || p.employee.role}
                        </span>
                      </div>

                      {(() => {
                        const wf = getWorkflowForEmployee(p.employee.employee_id, p.employee.name);
                        if (!wf || !wf.categories || wf.categories.length === 0 || p.employee.role === 'main_boss') return null;
                        return (
                          <div className="flex flex-wrap items-center gap-1 mt-1.5">
                            {wf.categories.map((c) => (
                              <span
                                key={c.id}
                                className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/10 text-zinc-300"
                              >
                                {c.name}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
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
                      {p.doneTasks}/{p.totalTasks} Done
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
                      <AlertCircle className="w-3 h-3" /> Pending Issues ({p.pendingReasons.length}):
                    </span>
                    <ul className="space-y-0.5 text-zinc-300 text-[11px]">
                      {p.pendingReasons.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="truncate">
                          • <strong className="text-zinc-200">{item.task}:</strong> {item.reason}
                        </li>
                      ))}
                      {p.pendingReasons.length > 2 && (
                        <li className="text-[10px] text-amber-400/80">
                          + {p.pendingReasons.length - 2} more documented reasons...
                        </li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-emerald-500/[0.03] border border-emerald-500/10 text-xs text-emerald-400/90 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>All responsibilities completed on schedule</span>
                  </div>
                )}

                {/* Action: Inspect Employee Sheet */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-[#8e9299]">
                    Joined: {p.employee.joined_date || 'N/A'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onInspectEmployee(p.employee)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>View Full Report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB: Staff Sign-Up Approvals (Raji Sir Central Command) */}
      {activeTab === 'approvals' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#14161a] border border-amber-500/30 space-y-6 shadow-2xl animate-in fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0 mt-0.5">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>কর্মী সাইন আপ ও অনুমোদন ব্যবস্থাপনা</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs border border-amber-500/40">
                    {pendingStaff.length} জন পেন্ডিং
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  কোয়ান্টাম গাজীপুর সেল-এ নতুন যুক্ত হওয়া কর্মীরা এখানে অনুমোদনের অপেক্ষায় জমা থাকে। 
                  শ্রদ্ধেয় <strong>রাজি স্যার</strong> অনুমোদন করলেই কর্মীরা স্বয়ংক্রিয়ভাবে সক্রিয় হয়ে তাঁদের নিজ নিজ টাস্ক চেকলিস্টে লগইন করতে পারবেন।
                </p>
              </div>
            </div>

            {/* Quick Stats & Batch Approve */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {pendingStaff.length > 1 && (
                <button
                  onClick={() => {
                    pendingStaff.forEach((emp) => {
                      if (onApproveEmployee) onApproveEmployee(emp.employee_id);
                    });
                    setApprovalFeedback(`✅ সকল ${pendingStaff.length} জন অপেক্ষমাণ কর্মীর আবেদন এক ক্লিকে অনুমোদন করা হয়েছে!`);
                    setTimeout(() => setApprovalFeedback(''), 5000);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>সবগুলো এক সাথে অনুমোদন করুন ({pendingStaff.length})</span>
                </button>
              )}

              <button
                onClick={onOpenEmployeeManager}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>সকল কর্মী তালিকা</span>
              </button>
            </div>
          </div>

          {/* Pending Staff Section */}
          {pendingStaff.length === 0 ? (
            <div className="py-14 text-center space-y-3 bg-white/[0.01] rounded-2xl border border-white/5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">কোনো পেন্ডিং অনুমোদন নেই!</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                বর্তমানে সকল কর্মীর আবেদন প্রক্রিয়াকৃত ও অনুমোদিত রয়েছে। নতুন কেউ 'এমপ্লয়ী সাইন আপ' করলে তাঁর বিবরণী স্বয়ংক্রিয়ভাবে এখানে চলে আসবে।
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>অনুমোদনের অপেক্ষায় থাকা নতুন কর্মীদের আবেদন ({pendingStaff.length} জন)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingStaff.map((emp) => {
                  const roleDef = SYSTEM_ROLES.find((r) => r.id === emp.role);
                  const isChowrasta =
                    emp.branch === 'chowrasta' || emp.employee_id.startsWith('GB-');
                  const branchLabel = isChowrasta
                    ? '🏢 ১. গাজীপুর ব্রাঞ্চ (চৌরাস্তা)'
                    : '🏛️ ২. গাজীপুর সদর অফিস (রাজবাড়ী রোড)';

                  return (
                    <div
                      key={emp.id}
                      className="p-5 rounded-2xl bg-white/[0.02] border-2 border-amber-500/30 hover:border-amber-500/50 transition-all flex flex-col justify-between gap-4 shadow-xl relative overflow-hidden"
                    >
                      <div className="space-y-3">
                        {/* Top: Avatar, Name, ID, Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm uppercase text-white shrink-0 shadow-md ring-2 ring-white/10"
                              style={{ backgroundColor: emp.avatar_color || '#f59e0b' }}
                            >
                              {emp.name.slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-base text-white truncate">{emp.name}</h4>
                              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                                  লগইন আইডি: {emp.employee_id}
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                                  পিন সেট করা আছে
                                </span>
                              </div>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950 shrink-0">
                            অপেক্ষমাণ
                          </span>
                        </div>

                        {/* Details grid */}
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">নির্ধারিত শাখা:</span>
                            <span className="font-semibold text-white">{branchLabel}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">কার্যক্রমের পদবি:</span>
                            <span className="font-semibold text-white">{roleDef?.titleEn || emp.role}</span>
                          </div>
                          {emp.phone && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">মোবাইল ফোন:</span>
                              <span className="font-mono text-slate-200">{emp.phone}</span>
                            </div>
                          )}
                          {emp.joined_date && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">আবেদনের তারিখ:</span>
                              <span className="text-slate-300">{emp.joined_date}</span>
                            </div>
                          )}
                          {emp.notes && (
                            <div className="pt-1 border-t border-white/5 text-slate-300 italic">
                              "{emp.notes}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Action CTA Buttons */}
                      <div className="flex items-center gap-2.5 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => handleApprove(emp)}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>অনুমোদন করুন (Approve &amp; Activate)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(emp)}
                          className="py-2.5 px-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                          title="আবেদন বাতিল করুন"
                        >
                          <X className="w-4 h-4" />
                          <span>বাতিল</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Approved Staff Summary Bar */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                বর্তমানে সিস্টেমে অনুমোদিত ও সক্রিয় মোট কর্মী: <strong>{activeStaff.length}</strong> জন
              </span>
            </span>
            <button
              onClick={() => setActiveTab('matrix')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 self-start sm:self-auto"
            >
              <span>দৈনিক টিম ওভারভিউ দেখুন</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Accountability & Issues View */}
      {activeTab === 'issues' && (
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Staff Pending Explanations &amp; Accountability ({selectedDate})</span>
            </h3>
            <span className="text-xs text-[#8e9299]">
              {staffWithPendingReasons.length} staff member(s) have pending checklist items
            </span>
          </div>

          {staffWithPendingReasons.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-medium text-white">No pending tasks recorded for today!</p>
              <p className="text-xs text-[#8e9299]">All team members in the selected scope have completed their responsibilities.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {staffWithPendingReasons.map((p) => {
                const roleDef = SYSTEM_ROLES.find((r) => r.id === p.employee.role);
                const isChowrasta =
                  p.employee.branch === 'chowrasta' ||
                  p.employee.employee_id.startsWith('GB-') ||
                  p.employee.employee_id.startsWith('CR-') ||
                  p.employee.employee_id === 'SUP-CHOW';
                const branchLabel = isChowrasta ? '1. Gazipur Branch' : '2. Gazipur Sadar Office';

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
                          {roleDef?.titleEn || p.employee.role}
                        </span>
                      </div>
                      <button
                        onClick={() => onInspectEmployee(p.employee)}
                        className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        View Checklist <ExternalLink className="w-3 h-3" />
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
        <div className="space-y-4">
          {/* Sub-tab Navigation */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 w-fit">
            <button
              type="button"
              onClick={() => setAiSubTab('oa_insights')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                aiSubTab === 'oa_insights'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Office Assistant Workflow Optimization (3 Steps)</span>
            </button>
            <button
              type="button"
              onClick={() => setAiSubTab('boss_directives')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                aiSubTab === 'boss_directives'
                  ? 'bg-white/20 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Dual-Office Executive Directives</span>
            </button>
          </div>

          {/* Sub-tab 1: Dedicated Office Assistant 3-Step Optimization */}
          {aiSubTab === 'oa_insights' && (
            <AiStrategicInsight
              date={selectedDate}
              currentUser={currentUser}
              employees={employees}
              logs={logs}
              progressList={progressList}
            />
          )}

          {/* Sub-tab 2: Dual-Office Directive Analysis */}
          {aiSubTab === 'boss_directives' && (
            <div className="p-6 rounded-2xl bg-[#14171d] border border-amber-500/30 space-y-5 shadow-2xl text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{isBoss ? "Raji Sir's Central AI Directives & Guidelines" : 'Dual-Office Strategic Guidance'}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 font-semibold rounded-full border border-amber-500/30">
                        Gemini AI Strategy
                      </span>
                    </h3>
                    <p className="text-xs text-[#8e9299]">
                      Cross-branch data synthesis across Gazipur Branch and Gazipur Sadar Office
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyAi}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg transition-colors border border-white/10 cursor-pointer"
                  >
                    {copiedAi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAi ? 'Copied' : 'Copy Report'}</span>
                  </button>

                  <button
                    onClick={handleGenerateAiSuggestions}
                    disabled={isGeneratingAi}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                    <span>Re-analyze</span>
                  </button>
                </div>
              </div>

              {isGeneratingAi ? (
                <div className="py-16 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-white">
                    Analyzing progress and reports across Gazipur Branch and Gazipur Sadar Office...
                  </p>
                  <p className="text-xs text-[#8e9299]">
                    {isBoss ? 'Drafting executive directives and strategic guidance for Raji Sir' : 'Synthesizing operational guidance for supervisors and branch teams'}
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
                    No AI strategic analysis generated yet.
                  </p>
                  <button
                    onClick={handleGenerateAiSuggestions}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer"
                  >
                    {isBoss ? 'Generate Executive AI Directives' : 'Generate AI Recommendations'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
