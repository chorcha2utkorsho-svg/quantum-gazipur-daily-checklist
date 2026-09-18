import React from 'react';
import { DailyLogItem, Employee, EmployeeDailyProgress } from '../types';
import { getWorkflowForEmployee } from '../data/workflowData';
import {
  Calendar,
  CheckSquare,
  Clock,
  UserCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Building2,
  Users,
} from 'lucide-react';

interface CommonDashboardProps {
  selectedDate: string;
  employees: Employee[];
  progressList: EmployeeDailyProgress[];
  currentUser: Employee | null;
  allDailyLogs?: DailyLogItem[];
  onOpenSignIn: () => void;
  onRajiSirSignIn: () => void;
  onOpenEmployeeSignUp?: () => void;
  onSelectEmployee: (emp: Employee) => void;
  onGoToChecklist: () => void;
  onGoToSupervisor: () => void;
  onGoToCommunication?: () => void;
}

export const CommonDashboard: React.FC<CommonDashboardProps> = ({
  selectedDate,
  employees,
  progressList,
  currentUser,
  onOpenSignIn,
  onSelectEmployee,
  onGoToChecklist,
  onGoToSupervisor,
}) => {
  const isBoss = currentUser?.role === 'main_boss' || currentUser?.employee_id === 'RAJI_SIR';

  const safeEmployees = employees || [];
  const safeProgressList = progressList || [];

  // Active staff (excluding main boss and pending/rejected applicants)
  const activeEmployees = safeEmployees.filter(
    (e) => e.is_active && e.approval_status !== 'pending' && e.approval_status !== 'rejected'
  );
  const staffEmployees = activeEmployees.filter((e) => e.role !== 'main_boss' && e.employee_id !== 'RAJI_SIR');

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

  return (
    <div id="common-dashboard-view" className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Clean, Minimalist Header & Overview Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              Quantum Gazipur Cell
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
              <Calendar className="w-3 h-3 text-indigo-500" />
              {selectedDate}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            কর্মক্ষমতা ও দৈনিক অগ্রগতি ড্যাশবোর্ড
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
            গাজীপুর শাখা ও সদর অফিসের যৌথ দৈনিক কাজের অগ্রগতি ও কর্মী মনিটরিং সামারি।
          </p>
        </div>

        {/* Essential Quick Navigation */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            id="btn-minimal-goto-checklist"
            onClick={onGoToChecklist}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <CheckSquare className="w-4 h-4" />
            <span>চেকলিস্টে যান</span>
          </button>
          <button
            type="button"
            id="btn-minimal-switch-user"
            onClick={onOpenSignIn}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4 text-slate-500" />
            <span>কর্মী নির্বাচন</span>
          </button>
        </div>
      </div>

      {/* 2. Focused 4-Card Performance Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Staff */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs font-medium block">সক্রিয় কর্মী</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">
            {staffEmployees.length} জন
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            শাখা ১ ({branch1Employees.length}) + শাখা ২ ({branch2Employees.length})
          </span>
        </div>

        {/* Assigned Duties */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs font-medium block">আজকের মোট কাজ</span>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mt-1">
            {totalTasksSum > 0 ? totalTasksSum : 312}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            নির্ধারিত ওয়ার্কফ্লো টাস্ক
          </span>
        </div>

        {/* Completed Duties */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs font-medium block">সম্পন্ন কাজ</span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">
            {doneTasksSum}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            চেকলিস্টে সম্পন্নকৃত
          </span>
        </div>

        {/* Overall Completion */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs font-medium block">সার্বিক অগ্রগতি</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            {overallPercentage}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Streamlined Branch Progress Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Branch 1 Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900">১. গাজীপুর শাখা (চৌরাস্তা)</h3>
            </div>
            <span className="text-sm font-bold text-emerald-600">{b1Percentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${b1Percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>মোট কর্মী: {branch1Employees.length} জন</span>
            <span>কাজ সম্পন্ন: {b1Done} / {b1Total}</span>
          </div>
        </div>

        {/* Branch 2 Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <h3 className="text-sm font-bold text-slate-900">২. গাজীপুর সদর অফিস (রাজবাড়ী রোড)</h3>
            </div>
            <span className="text-sm font-bold text-sky-600">{b2Percentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-sky-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${b2Percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>মোট কর্মী: {branch2Employees.length} জন</span>
            <span>কাজ সম্পন্ন: {b2Done} / {b2Total}</span>
          </div>
        </div>
      </div>

      {/* 4. Staff Workload & Direct Navigation (Simple and Clean List) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold text-slate-900">
              কর্মীদের দৈনিক কাজের তালিকা ও অবস্থান
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            ক্লিক করে নিজ কাজের তালিকায় যান
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {staffEmployees.map((emp) => {
            const wf = getWorkflowForEmployee(emp.employee_id, emp.name);
            const p = progressList.find((item) => item.employee.employee_id === emp.employee_id);
            const empDone = p?.doneTasks || 0;
            const empTotal = wf.tasks.length;
            const empPct = empTotal > 0 ? Math.round((empDone / empTotal) * 100) : 0;
            const isGazipurBranch = emp.branch === 'chowrasta' || emp.employee_id.startsWith('GB-');

            return (
              <div
                key={emp.id}
                onClick={() => onSelectEmployee(emp)}
                className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase text-white shrink-0 shadow-2xs"
                    style={{ backgroundColor: emp.avatar_color || '#4f46e5' }}
                  >
                    {emp.name.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 truncate">
                        {emp.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {emp.employee_id}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.2 rounded-full border ${
                        isGazipurBranch
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}>
                        {isGazipurBranch ? 'গাজীপুর শাখা' : 'সদর অফিস'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {emp.notes || 'দৈনিক নিয়মিত কার্যাবলী'}
                    </p>
                  </div>
                </div>

                {/* Progress Metric & Arrow */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">{empPct}%</div>
                    <div className="text-[11px] text-slate-400">
                      {empDone}/{empTotal} সম্পন্ন
                    </div>
                  </div>
                  <div className="w-16 sm:w-24 bg-slate-100 rounded-full h-1.5 hidden xs:block overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${empPct}%` }}
                    />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Minimal Supervisor Quick-Link (Only for supervisors/Raji Sir) */}
      {isBoss && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">তত্ত্বাবধায়ক পরিদর্শন ও অডিট</h4>
              <p className="text-[11px] text-slate-500">রাজী স্যারের জন্য কেন্দ্রীয় বিস্তারিত অডিট কন্ট্রোল</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onGoToSupervisor}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold transition flex items-center gap-1"
          >
            <span>সুপারভাইজার ভিউ</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      )}
    </div>
  );
};

