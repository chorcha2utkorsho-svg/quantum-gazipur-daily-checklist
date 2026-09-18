import React, { useState, useMemo } from 'react';
import {
  Target,
  Award,
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  Volume2,
  Sparkles,
  Send,
  Building2,
  Sliders,
} from 'lucide-react';
import { Employee, EmployeeDailyProgress, BranchId } from '../types';
import {
  ProductivityGoalConfig,
  getProductivityGoalConfig,
  saveProductivityGoalConfig,
  DEFAULT_PRODUCTIVITY_THRESHOLD,
} from '../lib/productivityGoalTracker';

interface SupervisorGoalMonitorProps {
  employees: Employee[];
  progressList: EmployeeDailyProgress[];
  selectedDate: string;
  selectedBranch: BranchId;
  onInspectEmployee: (emp: Employee) => void;
  onSendDirectiveToEmployee?: (employeeId: string, employeeName: string) => void;
}

export const SupervisorGoalMonitor: React.FC<SupervisorGoalMonitorProps> = ({
  employees,
  progressList,
  selectedDate,
  selectedBranch,
  onInspectEmployee,
  onSendDirectiveToEmployee,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'achieved' | 'in_progress' | 'critical'>('all');
  const [bulkThresholdInput, setBulkThresholdInput] = useState<number>(80);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkNotice, setBulkNotice] = useState<string | null>(null);

  // Active approved employees
  const activeEmployees = useMemo(() => {
    return employees.filter(
      (e) => e.is_active && e.approval_status !== 'pending' && e.approval_status !== 'rejected'
    );
  }, [employees]);

  // Combine employee data with their goal configs and today's progress
  const staffGoalStatusList = useMemo(() => {
    return activeEmployees
      .filter((emp) => {
        if (selectedBranch === 'all') return true;
        if (selectedBranch === 'chowrasta') {
          return emp.branch === 'chowrasta' || emp.employee_id.startsWith('GB-') || emp.employee_id.startsWith('CR-');
        }
        if (selectedBranch === 'rajbari') {
          return emp.branch === 'rajbari' || emp.employee_id.startsWith('SO-') || emp.employee_id.startsWith('RB-') || emp.employee_id === 'JAHID';
        }
        return true;
      })
      .map((emp) => {
        const progress = progressList.find((p) => p.employee.employee_id === emp.employee_id);
        const goalConfig = getProductivityGoalConfig(emp.employee_id);

        const totalTasks = progress?.totalTasks || 0;
        const doneTasks = progress?.doneTasks || 0;
        const completionRate = progress?.completionRate || 0;

        const isPercentage = goalConfig.targetType === 'percentage';
        const targetThreshold = goalConfig.thresholdValue;
        const requiredTasks = isPercentage
          ? Math.ceil((targetThreshold / 100) * (totalTasks || 1))
          : Math.min(targetThreshold, totalTasks);

        const isGoalReached = isPercentage
          ? completionRate >= targetThreshold
          : doneTasks >= targetThreshold;

        const gapPercentage = Math.max(0, targetThreshold - completionRate);
        const gapTasks = Math.max(0, requiredTasks - doneTasks);

        return {
          employee: emp,
          progress,
          goalConfig,
          totalTasks,
          doneTasks,
          completionRate,
          isPercentage,
          targetThreshold,
          requiredTasks,
          isGoalReached,
          gapPercentage,
          gapTasks,
        };
      });
  }, [activeEmployees, progressList, selectedBranch]);

  // Filtered by search & status
  const filteredList = useMemo(() => {
    return staffGoalStatusList.filter((item) => {
      const matchesSearch =
        item.employee.name.toLowerCase().includes(search.toLowerCase()) ||
        item.employee.employee_id.toLowerCase().includes(search.toLowerCase()) ||
        (item.employee.phone && item.employee.phone.includes(search));

      if (!matchesSearch) return false;

      if (filterStatus === 'achieved') return item.isGoalReached;
      if (filterStatus === 'in_progress') return !item.isGoalReached && item.completionRate >= 50;
      if (filterStatus === 'critical') return !item.isGoalReached && item.completionRate < 50;

      return true;
    });
  }, [staffGoalStatusList, search, filterStatus]);

  // Aggregate stats
  const totalStaff = staffGoalStatusList.length;
  const achievedCount = staffGoalStatusList.filter((s) => s.isGoalReached).length;
  const inProgressCount = staffGoalStatusList.filter((s) => !s.isGoalReached && s.completionRate >= 50).length;
  const criticalCount = staffGoalStatusList.filter((s) => !s.isGoalReached && s.completionRate < 50).length;
  const overallAchievedRate = totalStaff > 0 ? Math.round((achievedCount / totalStaff) * 100) : 0;

  // Bulk set target threshold
  const handleApplyBulkThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Math.min(100, Math.max(20, bulkThresholdInput));
    staffGoalStatusList.forEach((item) => {
      const updated: ProductivityGoalConfig = {
        ...item.goalConfig,
        thresholdValue: val,
        targetType: 'percentage',
      };
      saveProductivityGoalConfig(updated);
    });

    setShowBulkModal(false);
    setBulkNotice(`সকল কর্মীর দৈনিক লক্ষ্যমাত্রা সফলভাবে ${val}% এ হালনাগাদ করা হয়েছে।`);
    setTimeout(() => setBulkNotice(null), 4000);
  };

  return (
    <div id="supervisor-goal-monitor" className="space-y-5">
      {/* Top Banner & KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#14161a] to-slate-900 border border-white/10 text-white shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              লক্ষ্যমাত্রা অর্জনের হার
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {overallAchievedRate}%
            </div>
            <span className="text-xs text-slate-300">
              {achievedCount} / {totalStaff} জন কর্মী অর্জিত
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#14161a] border border-white/10 text-white shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
              লক্ষ্য অর্জিত (Reached)
            </span>
            <div className="text-2xl font-black text-white font-mono">
              {achievedCount} <span className="text-xs text-slate-400 font-normal">কর্মী</span>
            </div>
            <span className="text-xs text-emerald-300 font-medium">
              থ্রেশহোল্ড অতিক্রম সম্পন্ন
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#14161a] border border-white/10 text-white shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              অগ্রগতিতে (50% - 79%)
            </span>
            <div className="text-2xl font-black text-amber-300 font-mono">
              {inProgressCount} <span className="text-xs text-slate-400 font-normal">কর্মী</span>
            </div>
            <span className="text-xs text-slate-400">
              লক্ষ্যের কাছাকাছি রয়েছেন
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#14161a] border border-white/10 text-white shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
              মনোযোগ প্রয়োজন (&lt; 50%)
            </span>
            <div className="text-2xl font-black text-rose-300 font-mono">
              {criticalCount} <span className="text-xs text-slate-400 font-normal">কর্মী</span>
            </div>
            <span className="text-xs text-rose-300 font-medium">
              সুপারভাইজার ফলোআপ দরকার
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {bulkNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{bulkNotice}</span>
        </div>
      )}

      {/* Control Toolbar */}
      <div className="p-4 rounded-2xl bg-[#14161a] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-white">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search box */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="কর্মী খুঁজুন (নাম বা আইডি)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              সকল ({totalStaff})
            </button>
            <button
              onClick={() => setFilterStatus('achieved')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'achieved'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-emerald-400 hover:text-white'
              }`}
            >
              অর্জিত ({achievedCount})
            </button>
            <button
              onClick={() => setFilterStatus('in_progress')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'in_progress'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-amber-400 hover:text-white'
              }`}
            >
              চলমান ({inProgressCount})
            </button>
            <button
              onClick={() => setFilterStatus('critical')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'critical'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-rose-400 hover:text-white'
              }`}
            >
              পিছিয়ে ({criticalCount})
            </button>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="সকল কর্মীর জন্য একযোগে স্ট্যান্ডার্ড লক্ষ্যমাত্রা নির্ধারণ করুন"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>বাল্ক লক্ষ্য নির্ধারণ (Set Threshold)</span>
          </button>
        </div>
      </div>

      {/* Staff Goal Progress Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredList.map((item) => {
          const emp = item.employee;
          const isReached = item.isGoalReached;

          return (
            <div
              key={emp.employee_id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 text-white ${
                isReached
                  ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-[#14161a] border-emerald-500/40 shadow-sm'
                  : item.completionRate < 50
                  ? 'bg-gradient-to-br from-rose-950/30 via-slate-900 to-[#14161a] border-rose-500/30'
                  : 'bg-[#14161a] border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                {/* Employee Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-md ${
                        emp.avatar_color || 'bg-slate-800'
                      }`}
                    >
                      {emp.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {emp.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-mono text-slate-300 font-semibold">{emp.employee_id}</span>
                        <span>•</span>
                        <span>
                          {emp.branch === 'chowrasta' ? 'Gazipur Branch' : 'Sadar Office'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      isReached
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : item.completionRate >= 50
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {isReached ? 'Goal Reached' : `${item.completionRate}% Done`}
                  </span>
                </div>

                {/* Progress Metric Bar */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">
                      সম্পন্ন: <strong className="text-white font-mono">{item.doneTasks}</strong> / {item.requiredTasks} কাজ
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      লক্ষ্য: {item.isPercentage ? `${item.targetThreshold}%` : `${item.targetThreshold} কাজ`}
                    </span>
                  </div>

                  <div className="relative w-full h-2.5 rounded-full bg-black/40 border border-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isReached
                          ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                          : item.completionRate >= 50
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                      style={{ width: `${Math.min(100, item.completionRate)}%` }}
                    />
                    {/* Goal target line */}
                    {item.isPercentage && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-amber-300 z-10"
                        style={{ left: `${item.targetThreshold}%` }}
                        title={`Target: ${item.targetThreshold}%`}
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    {isReached ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> লক্ষ্য অর্জিত
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium">
                        আর মাত্র {item.gapTasks} টি কাজ বাকি
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-slate-500">
                      মোট {item.totalTasks} টি কাজ
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onInspectEmployee(emp)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition cursor-pointer flex-1 text-center"
                >
                  বিস্তারিত পরিদর্শন
                </button>

                {onSendDirectiveToEmployee && !isReached && (
                  <button
                    type="button"
                    onClick={() =>
                      onSendDirectiveToEmployee(
                        emp.employee_id,
                        `প্রিয় ${emp.name}, আজকের লক্ষ্যমাত্রা (${item.targetThreshold}%) স্পর্শ করতে অবশিষ্ট কাজগুলো দ্রুত সম্পন্ন করুন।`
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition cursor-pointer flex items-center justify-center gap-1"
                    title="এই কর্মীকে তাৎক্ষণিক বার্তা পাঠান"
                  >
                    <Send className="w-3 h-3" />
                    <span>নির্দেশনা দিন</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Threshold Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/15 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                বাল্ক প্রোডাক্টিভিটি থ্রেশহোল্ড নির্ধারণ
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              এক ক্লিকে সকল সচল কর্মীর জন্য প্রত্যাশিত দৈনিক প্রোডাক্টিভিটি থ্রেশহোল্ড সেট করুন। কর্মীরা তাদের ওয়ার্কস্পেসে এই থ্রেশহোল্ড দেখতে পাবেন এবং লক্ষ্য অর্জিত হলে স্বয়ংক্রিয় নোটিফিকেশন পাবেন।
            </p>

            <form onSubmit={handleApplyBulkThreshold} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  প্রত্যাশিত সম্পন্নকরণ হার (% Threshold)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={20}
                    max={100}
                    value={bulkThresholdInput}
                    onChange={(e) => setBulkThresholdInput(Number(e.target.value))}
                    className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-sm font-mono text-white focus:border-amber-400 focus:outline-hidden"
                  />
                  <div className="flex gap-1.5">
                    {[70, 75, 80, 85, 90].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBulkThresholdInput(preset)}
                        className={`px-2 py-1.5 rounded-lg text-xs font-bold transition ${
                          bulkThresholdInput === preset
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-white/10 text-slate-300 hover:bg-white/15'
                        }`}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition shadow-md"
                >
                  সকল কর্মীর জন্য প্রয়োগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
