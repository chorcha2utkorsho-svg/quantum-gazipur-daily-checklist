import React from 'react';
import {
  Crown,
  Users,
  Building2,
  Landmark,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Shield,
  UserPlus,
  LogIn,
  CheckSquare,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Employee, EmployeeDailyProgress, BranchId } from '../types';
import { getWorkflowForEmployee } from '../data/workflowData';

interface CommonDashboardProps {
  selectedDate: string;
  employees: Employee[];
  progressList: EmployeeDailyProgress[];
  currentUser: Employee | null;
  onOpenSignIn: () => void;
  onRajiSirSignIn: () => void;
  onOpenEmployeeSignUp: () => void;
  onSelectEmployee: (emp: Employee) => void;
  onGoToChecklist: () => void;
  onGoToSupervisor: () => void;
}

export const CommonDashboard: React.FC<CommonDashboardProps> = ({
  selectedDate,
  employees,
  progressList,
  currentUser,
  onOpenSignIn,
  onRajiSirSignIn,
  onOpenEmployeeSignUp,
  onSelectEmployee,
  onGoToChecklist,
  onGoToSupervisor,
}) => {
  const isBoss = currentUser?.role === 'main_boss' || currentUser?.employee_id === 'RAJI_SIR';
  const isSupervisor = currentUser?.role === 'office_assistant' || isBoss;

  const safeEmployees = employees || [];
  const safeProgressList = progressList || [];

  // Active staff (excluding main boss and pending/rejected applicants)
  const activeEmployees = safeEmployees.filter(
    (e) => e.is_active && e.approval_status !== 'pending' && e.approval_status !== 'rejected'
  );
  const staffEmployees = activeEmployees.filter((e) => e.role !== 'main_boss' && e.employee_id !== 'RAJI_SIR');
  const pendingEmployees = safeEmployees.filter((e) => e.approval_status === 'pending');

  // Branch 1: Gazipur Branch (Chowrasta)
  const branch1Employees = staffEmployees.filter(
    (e) => e.branch === 'chowrasta' || e.employee_id.startsWith('GB-') || e.name.toLowerCase().includes('anjuman') || e.name.toLowerCase().includes('mustakim')
  );

  // Branch 2: Gazipur Sadar Office (Rajbari Road)
  const branch2Employees = staffEmployees.filter(
    (e) => !branch1Employees.some((b1) => b1.id === e.id)
  );

  // Calculate overall metrics
  const totalTasksSum = safeProgressList.reduce((acc, p) => acc + p.totalTasks, 0);
  const doneTasksSum = safeProgressList.reduce((acc, p) => acc + p.doneTasks, 0);
  const pendingTasksSum = totalTasksSum - doneTasksSum;
  const overallPercentage = totalTasksSum > 0 ? Math.round((doneTasksSum / totalTasksSum) * 100) : 0;

  // Branch 1 metrics
  const b1Progress = safeProgressList.filter((p) => branch1Employees.some((e) => e.employee_id === p.employee.employee_id));
  const b1Total = b1Progress.reduce((acc, p) => acc + p.totalTasks, 0);
  const b1Done = b1Progress.reduce((acc, p) => acc + p.doneTasks, 0);
  const b1Percentage = b1Total > 0 ? Math.round((b1Done / b1Total) * 100) : 0;

  // Branch 2 metrics
  const b2Progress = safeProgressList.filter((p) => branch2Employees.some((e) => e.employee_id === p.employee.employee_id));
  const b2Total = b2Progress.reduce((acc, p) => acc + p.totalTasks, 0);
  const b2Done = b2Progress.reduce((acc, p) => acc + p.doneTasks, 0);
  const b2Percentage = b2Total > 0 ? Math.round((b2Done / b2Total) * 100) : 0;

  const dateDisplay = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 0. Notice Banner for Staff Registration */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-amber-500/10 border border-emerald-500/30 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 shrink-0">
            <UserPlus className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>📢 সকল কর্মীদের অবগতির জন্য নির্দেশনা:</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                নতুন কর্মী রেজিস্ট্রেশন ও অনুমোদন
              </span>
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              গাজীপুর ব্রাঞ্চ ও গাজীপুর সদর অফিসের সকল কর্মী নিজ নাম, ব্রাঞ্চ, পছন্দমতো <strong>ইউজার আইডি</strong> এবং ৪-সংখ্যার <strong>পাসওয়ার্ড</strong> দিয়ে <strong>'এমপ্লয়ী সাইন আপ'</strong> করুন। সাইন আপ সম্পন্ন হলে তা কেন্দ্রীয় কতৃপক্ষ <strong>শ্রদ্ধেয় রাজি স্যার</strong>-এর ড্যাশবোর্ডে অনুমোদনের জন্য পেন্ডিং থাকবে। তিনি <strong>অনুমোদন (Approve)</strong> করে দিলে আপনি স্বয়ংক্রিয়ভাবে সক্রিয় হয়ে লগইন করতে পারবেন।
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenEmployeeSignUp}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>এমপ্লয়ী সাইন আপ</span>
          </button>
        </div>
      </div>

      {/* 1. Eye-Catching Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                সমন্বিত কেন্দ্রীয় ড্যাশবোর্ড (Common Hub)
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-white/10">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {selectedDate}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              কোয়ান্টাম গাজীপুর সেল
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              উভয় শাখা (১. গাজীপুর ব্রাঞ্চ ও ২. গাজীপুর সদর অফিস) এর সমন্বিত ডিজিটাল কমান্ড সেন্টার।
              রাজি স্যার সাইন ইন করলে সবার সার্বিক অ্যাক্টিভিটি দেখতে পান এবং এমপ্লয়ী সাইন ইন করলে সে শুধু তার নির্দিষ্ট টাস্ক ও চেকলিস্ট পরিচালনা করতে পারে।
            </p>

            {/* Current Active User Feedback Pill */}
            {currentUser && (
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-300">
                <span>বর্তমান সক্রিয় অ্যাকাউন্ট:</span>
                <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg border border-white/15 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {currentUser.name} ({isBoss ? 'কতৃপক্ষ - রাজি স্যার' : 'এমপ্লয়ী'})
                </span>
                {isSupervisor ? (
                  <button
                    onClick={onGoToSupervisor}
                    className="text-amber-300 hover:text-amber-200 underline font-semibold ml-2 inline-flex items-center gap-1"
                  >
                    সবার অ্যাক্টিভিটি ড্যাশবোর্ড <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={onGoToChecklist}
                    className="text-emerald-300 hover:text-emerald-200 underline font-semibold ml-2 inline-flex items-center gap-1"
                  >
                    আমার টাস্ক ও চেকলিস্ট <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Access Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            {/* 1. Raji Sir Sign In Button */}
            <button
              type="button"
              id="hero-raji-sir-signin-btn"
              onClick={onRajiSirSignIn}
              className={`px-4 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2 ${
                isBoss
                  ? 'bg-amber-400 text-slate-950 border-2 border-amber-300 ring-2 ring-amber-400/50'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25 border border-amber-400'
              }`}
            >
              <Crown className="w-4 h-4 text-slate-950" />
              <span>{isBoss ? '👑 রাজি স্যার (সক্রিয়)' : '👑 রাজি স্যার সাইন ইন'}</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* 2. Employee Sign Up */}
              <button
                type="button"
                id="hero-employee-signup-btn"
                onClick={onOpenEmployeeSignUp}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                title="নতুন কর্মীরা নিজস্ব আইডি ও পাসওয়ার্ড তৈরি করে সাইন আপ করুন"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>এমপ্লয়ী সাইন আপ</span>
              </button>

              {/* 3. General Sign In */}
              <button
                type="button"
                id="hero-sign-in-btn"
                onClick={onOpenSignIn}
                className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 border border-indigo-400/30"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>সাইন ইন</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key High-Level Operational Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Personnel */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>সক্রিয় কর্মী সংখ্যা</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {staffEmployees.length} জন
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            গাজীপুর ব্রাঞ্চ (২) + সদর অফিস (৩)
          </p>
        </div>

        {/* Metric 2: Total Defined Tasks */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>আজকের মোট টাস্ক</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {totalTasksSum > 0 ? totalTasksSum : 312}টি
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            সুবিন্যস্ত অপারেশনাল দায়িত্ব
          </p>
        </div>

        {/* Metric 3: Done Tasks */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>সম্পন্ন কার্যক্রম</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
            {doneTasksSum}টি
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            চেকবক্স টিক দিয়ে স্ট্যাটাস নিশ্চিত
          </p>
        </div>

        {/* Metric 4: Progress Percentage */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>গড় প্রোগ্রেস রেট</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
            {overallPercentage}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Dual-Branch Hubs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch 1: Gazipur Branch (Chowrasta) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 to-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">১. গাজীপুর ব্রাঞ্চ</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    চৌরাস্তা শাখা
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  ২ জন নিবেদিত কর্মী • মোট ১২৪টি অপারেশনাল টাস্ক
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-black text-emerald-700">{b1Percentage}%</div>
              <div className="text-[10px] text-slate-500 font-medium">
                {b1Done} / {b1Total > 0 ? b1Total : 124} সম্পন্ন
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-emerald-100/50 h-1.5">
            <div
              className="bg-emerald-600 h-1.5 transition-all duration-500"
              style={{ width: `${b1Percentage}%` }}
            />
          </div>

          {/* Branch Personnel Cards */}
          <div className="p-5 space-y-3 flex-1">
            {branch1Employees.map((emp) => {
              const wf = getWorkflowForEmployee(emp.employee_id, emp.name);
              const p = progressList.find((item) => item.employee.employee_id === emp.employee_id);
              const empDone = p?.doneTasks || 0;
              const empTotal = wf.tasks.length;
              const empPct = empTotal > 0 ? Math.round((empDone / empTotal) * 100) : 0;

              return (
                <div
                  key={emp.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase text-white shrink-0 shadow-xs mt-0.5"
                      style={{ backgroundColor: emp.avatar_color || '#10b981' }}
                    >
                      {emp.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors">
                          {emp.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                          {emp.employee_id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {emp.notes || 'ব্রাঞ্চ অপারেশন ও কর্মপ্রবাহ'}
                      </p>
                      {/* Categories preview */}
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {empTotal} টাস্ক
                        </span>
                        {wf.categories.slice(0, 3).map((cat) => (
                          <span
                            key={cat.id}
                            className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
                          >
                            {cat.name}
                          </span>
                        ))}
                        {wf.categories.length > 3 && (
                          <span className="text-[9px] text-slate-400 font-bold">
                            +{wf.categories.length - 3}টি
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Progress */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-800">{empPct}%</div>
                      <div className="text-[10px] text-slate-500">{empDone}/{empTotal} Done</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectEmployee(emp)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                    >
                      <span>টাস্ক দেখুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Branch 2: Gazipur Sadar Office (Rajbari Road) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-sky-50/70 to-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">২. গাজীপুর সদর অফিস</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold border border-sky-200">
                    রাজবাড়ি রোড
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  ৩ জন নিবেদিত কর্মী • মোট ১৮৮টি অপারেশনাল টাস্ক
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-black text-sky-700">{b2Percentage}%</div>
              <div className="text-[10px] text-slate-500 font-medium">
                {b2Done} / {b2Total > 0 ? b2Total : 188} সম্পন্ন
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-sky-100/50 h-1.5">
            <div
              className="bg-sky-600 h-1.5 transition-all duration-500"
              style={{ width: `${b2Percentage}%` }}
            />
          </div>

          {/* Branch Personnel Cards */}
          <div className="p-5 space-y-3 flex-1">
            {branch2Employees.map((emp) => {
              const wf = getWorkflowForEmployee(emp.employee_id, emp.name);
              const p = progressList.find((item) => item.employee.employee_id === emp.employee_id);
              const empDone = p?.doneTasks || 0;
              const empTotal = wf.tasks.length;
              const empPct = empTotal > 0 ? Math.round((empDone / empTotal) * 100) : 0;

              return (
                <div
                  key={emp.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase text-white shrink-0 shadow-xs mt-0.5"
                      style={{ backgroundColor: emp.avatar_color || '#0284c7' }}
                    >
                      {emp.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-sky-800 transition-colors">
                          {emp.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                          {emp.employee_id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {emp.notes || 'সদর অফিস অপারেশন ও কর্মপ্রবাহ'}
                      </p>
                      {/* Categories preview */}
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                          {empTotal} টাস্ক
                        </span>
                        {wf.categories.slice(0, 3).map((cat) => (
                          <span
                            key={cat.id}
                            className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
                          >
                            {cat.name}
                          </span>
                        ))}
                        {wf.categories.length > 3 && (
                          <span className="text-[9px] text-slate-400 font-bold">
                            +{wf.categories.length - 3}টি
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Progress */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-800">{empPct}%</div>
                      <div className="text-[10px] text-slate-500">{empDone}/{empTotal} Done</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectEmployee(emp)}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                    >
                      <span>টাস্ক দেখুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Central Directorate Card: Raji Sir */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 border border-amber-300/60 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-md shrink-0 ring-4 ring-amber-400/30">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">রাজি স্যার (Raji Sir)</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black uppercase">
                Central Director
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              উভয় অফিসের সার্বিক নিরীক্ষা, এক্সিকিউটিভ ডিরেক্টিভ ও লাইভ অডিট সমন্বয়। রাজী স্যার সাইন ইন করলে সরাসরি সবার অ্যাক্টিভিটি, লাইভ রিপোর্ট ও তুলনামূলক অগ্রগতি দেখতে পান।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={onGoToSupervisor}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4" />
            <span>সবার অ্যাক্টিভিটি ড্যাশবোর্ড দেখুন</span>
          </button>
        </div>
      </div>

      {/* 5. Role Guidance & Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card A: Authority Privileges */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">কতৃপক্ষ ভূমিকা (Authority Experience)</h4>
              <p className="text-[11px] text-slate-500">রাজি স্যার ও ইনচার্জদের জন্য</p>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>সবার অ্যাক্টিভিটি পর্যবেক্ষণ:</strong> উভয় অফিসের ৫ জন কর্মীর রিয়েল-টাইম অগ্রগতি ও পার্সেন্টেজ দেখা যায়।</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>কর্মী পরিদর্শন (Inspect):</strong> যে-কোনো কর্মীর সম্পন্ন এবং পেন্ডিং টাস্ক ও কারণ সরাসরি অডিট করা যায়।</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>অফিস ফিল্টারিং:</strong> Both Offices, Gazipur Branch, Gazipur Sadar আলাদা আলাদা নির্বাচন।</span>
            </li>
          </ul>
        </div>

        {/* Card B: Employee Privileges */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">এমপ্লয়ী ভূমিকা (Employee Experience)</h4>
              <p className="text-[11px] text-slate-500">সকল দায়িত্বশীল কর্মীদের জন্য</p>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>নিজস্ব টাস্ক ম্যানেজমেন্ট:</strong> এমপ্লয়ী সাইন ইন করলে শুধুমাত্র তার নির্ধারিত ক্যাটাগরি ও টাস্ক দেখতে পায়।</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>চেকবক্স টিক দিয়ে স্ট্যাটাস:</strong> সম্পন্ন কাজগুলোতে চেকবক্স টিক দিলে মুহূর্তেই Done স্ট্যাটাস ও প্রগ্রেস সেভ হয়।</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>সমানুপাতিক প্রগ্রেস বার:</strong> প্রতিটি সম্পন্ন টাস্কের সাথে শতকরা অগ্রগতি স্বয়ংক্রিয়ভাবে হিসাব হয়।</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
