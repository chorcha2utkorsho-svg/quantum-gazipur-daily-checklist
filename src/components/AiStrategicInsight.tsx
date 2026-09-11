import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  TrendingUp,
  ShieldCheck,
  Zap,
  User,
  Building2,
  Calendar,
  Target,
  X,
  Printer,
  ChevronRight,
  Briefcase,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { DailyLogItem, Employee, EmployeeDailyProgress, ActionableOptimizationStep, AiStrategicInsightData } from '../types';
import { getWorkflowForEmployee } from '../data/workflowData';
import { requestOfficeAssistantInsight } from '../lib/supabase';

export interface AiStrategicInsightProps {
  date: string;
  currentUser?: Employee;
  employees?: Employee[];
  logs?: DailyLogItem[];
  progressList?: EmployeeDailyProgress[];
  onClose?: () => void;
  isModal?: boolean;
  className?: string;
}

export const AiStrategicInsight: React.FC<AiStrategicInsightProps> = ({
  date,
  currentUser,
  employees = [],
  logs = [],
  progressList = [],
  onClose,
  isModal = false,
  className = '',
}) => {
  // Find all office assistants or relevant operational in-charges
  const officeAssistants = useMemo(() => {
    const list = employees.filter(
      (e) => e.is_active && (e.role === 'office_assistant' || e.employee_id.startsWith('GB-') || e.role === 'main_boss')
    );
    if (list.length > 0) return list;
    return employees.filter((e) => e.is_active);
  }, [employees]);

  // Selected assistant for insight analysis
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>(() => {
    if (currentUser && (currentUser.role === 'office_assistant' || currentUser.employee_id.startsWith('GB-'))) {
      return currentUser.employee_id;
    }
    const defaultOA = officeAssistants.find((e) => e.role === 'office_assistant');
    return defaultOA?.employee_id || officeAssistants[0]?.employee_id || 'GB-01';
  });

  const selectedAssistant = useMemo(() => {
    return employees.find((e) => e.employee_id === selectedAssistantId) || officeAssistants[0] || currentUser;
  }, [employees, officeAssistants, selectedAssistantId, currentUser]);

  // Daily completion logs for the selected assistant
  const assistantCompletionLogs = useMemo(() => {
    if (!selectedAssistant) return [];

    // 1. Logs directly matching employee_id
    const userLogs = logs.filter((l) => l.employee_id === selectedAssistant.employee_id && l.date === date);

    // 2. Fetch full workflow tasks for this employee to combine with actual logged status
    const wf = getWorkflowForEmployee(selectedAssistant.employee_id, selectedAssistant.name);
    const tasks = wf?.tasks || [];

    if (tasks.length === 0 && userLogs.length > 0) {
      return userLogs;
    }

    return tasks.map((t) => {
      const match = userLogs.find((l) => l.task_name === t.name);
      return {
        id: match?.id || `temp-${t.id}`,
        task_name: t.name,
        category: t.categoryBn || t.category || 'General',
        priority: t.priority || 'medium',
        status: (match?.status || 'pending') as 'done' | 'pending',
        reason_for_pending: match?.reason_for_pending || '',
        completed_at: match?.completed_at || null,
        order_index: t.order || 0,
      };
    });
  }, [selectedAssistant, logs, date]);

  // Summary statistics for completion logs
  const summaryStats = useMemo(() => {
    const total = assistantCompletionLogs.length;
    const done = assistantCompletionLogs.filter((l) => l.status === 'done').length;
    const pending = total - done;
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, pending, percentage };
  }, [assistantCompletionLogs]);

  // State for AI strategic insight results
  const [insightData, setInsightData] = useState<AiStrategicInsightData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedStepIndex, setCopiedStepIndex] = useState<number | null>(null);
  const [completedChecklist, setCompletedChecklist] = useState<Record<string, boolean>>({});

  // Trigger analysis function
  const handleAnalyzeWorkflow = async () => {
    if (!selectedAssistant) return;
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        assistant: {
          name: selectedAssistant.name,
          employee_id: selectedAssistant.employee_id,
          branch: selectedAssistant.branch || 'chowrasta',
          role: selectedAssistant.role,
        },
        date,
        completionLogs: assistantCompletionLogs,
        summaryStats,
      };

      const result = await requestOfficeAssistantInsight(payload);
      if (result) {
        setInsightData({
          ...result,
          generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      } else {
        throw new Error('No insight data returned');
      }
    } catch (err: any) {
      console.error('Error generating AI strategic insight:', err);
      setError('Failed to complete AI strategic analysis. Please check your connection and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically trigger on mount if not yet loaded
  useEffect(() => {
    if (!insightData && !isLoading && selectedAssistant) {
      handleAnalyzeWorkflow();
    }
  }, [selectedAssistantId, date]);

  // Copy full strategic report
  const handleCopyAll = () => {
    if (!insightData) return;
    const formatted = `=== AI STRATEGIC INSIGHT: OFFICE ASSISTANT WORKFLOW ===
Target Personnel: ${selectedAssistant?.name} (${selectedAssistant?.employee_id})
Date: ${date}
Operational Health: ${insightData.overallHealth} (Velocity Score: ${insightData.velocityScore || `${summaryStats.percentage}/100`})
Completion Rate: ${summaryStats.percentage}% (${summaryStats.done}/${summaryStats.total} Tasks Completed)

OVERVIEW:
${insightData.summary}

TOP 3 ACTIONABLE OPTIMIZATION STEPS:
${insightData.actionableSteps
  .map(
    (step, idx) => `
[STEP ${idx + 1}: ${step.title.toUpperCase()}]
Priority: ${step.priority.toUpperCase()} | Window: ${step.recommendedTimeSlot || 'General Shift'}
Category: ${step.category}
Identified Bottleneck: ${step.problemIdentified}
Action Plan:
${step.actionPlan.map((a) => `  - ${a}`).join('\n')}
Expected Impact: ${step.expectedImpact}
`
  )
  .join('\n')}

EXECUTIVE DIRECTIVE FOR RAJI SIR:
${insightData.executiveTakeaway || 'Monitor execution and conduct end-of-day lock audit at 5:15 PM.'}

QUANTUM AFFIRMATION:
${insightData.quantumAffirmation || 'Mindful execution and disciplined time-blocking turn daily duties into service.'}
`;

    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // Copy individual step
  const handleCopyStep = (step: ActionableOptimizationStep, idx: number) => {
    const text = `[STEP ${idx + 1}: ${step.title}]
Priority: ${step.priority} | Time Slot: ${step.recommendedTimeSlot || 'Flexible'}
Problem Identified: ${step.problemIdentified}
Action Plan:
${step.actionPlan.map((p) => `• ${p}`).join('\n')}
Expected Impact: ${step.expectedImpact}`;

    navigator.clipboard.writeText(text);
    setCopiedStepIndex(idx);
    setTimeout(() => setCopiedStepIndex(null), 2000);
  };

  // Toggle action plan item checkbox
  const toggleActionItem = (stepIdx: number, itemIdx: number) => {
    const key = `${stepIdx}-${itemIdx}`;
    setCompletedChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const content = (
    <div className={`space-y-6 text-[#14161a] ${className}`}>
      {/* 1. Header & Controls Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#161a23] to-[#12141a] border border-amber-500/30 p-5 sm:p-6 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  AI Strategic Insight
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Zap className="w-3 h-3" /> Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Analyzing daily completion logs to generate 3 actionable optimization steps for the office assistant's workflow.
              </p>
            </div>
          </div>

          {/* Action buttons & Assistant selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Assistant selector */}
            <div className="relative">
              <label htmlFor="assistant-select" className="sr-only">
                Select Office Assistant
              </label>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <select
                  id="assistant-select"
                  value={selectedAssistantId}
                  onChange={(e) => setSelectedAssistantId(e.target.value)}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-hidden cursor-pointer"
                >
                  {officeAssistants.map((oa) => (
                    <option key={oa.id} value={oa.employee_id} className="bg-[#1a1d24] text-white">
                      {oa.name} ({oa.employee_id}) — {oa.branch === 'rajbari' ? 'Sadar Office' : 'Gazipur Branch'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Pill */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>{date}</span>
            </div>

            {/* Re-analyze button */}
            <button
              id="reanalyze-btn"
              onClick={handleAnalyzeWorkflow}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              title="Re-run Gemini AI strategic workflow analysis"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Analyzing Logs...' : 'Re-analyze'}</span>
            </button>

            {/* Copy All button */}
            {insightData && (
              <button
                onClick={handleCopyAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors border border-white/10 cursor-pointer"
                title="Copy strategic plan"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? 'Copied' : 'Copy Plan'}</span>
              </button>
            )}

            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Completion Log Synthesis Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/10 text-xs">
          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
            <span className="text-[11px] text-zinc-400 block">Total Tasks Monitored</span>
            <span className="text-base font-bold text-white mt-0.5 block">{summaryStats.total} Tasks</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
            <span className="text-[11px] text-zinc-400 block">Completion Velocity</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {summaryStats.percentage}% ({summaryStats.done} Done)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
            <span className="text-[11px] text-zinc-400 block">Pending Bottlenecks</span>
            <span className="text-base font-bold text-amber-400 mt-0.5 block">
              {summaryStats.pending} Items Pending
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
            <span className="text-[11px] text-zinc-400 block">Operational Posture</span>
            <span
              className={`text-base font-bold mt-0.5 block ${
                summaryStats.percentage >= 80
                  ? 'text-emerald-400'
                  : summaryStats.percentage >= 50
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {summaryStats.percentage >= 80 ? 'Optimal Flow' : summaryStats.percentage >= 50 ? 'Requires Focus' : 'Critical Action'}
            </span>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={handleAnalyzeWorkflow}
            className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state skeleton */}
      {isLoading && (
        <div className="space-y-4 py-8">
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
            <div className="relative w-12 h-12 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
              <Sparkles className="w-6 h-6 text-amber-500 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">
                Gemini AI is analyzing daily completion logs...
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Evaluating task completion velocity, bottleneck reasons, and timing friction to synthesize 3 actionable optimization steps for {selectedAssistant?.name}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Insight Content */}
      {!isLoading && insightData && (
        <div className="space-y-6">
          {/* Executive Overview Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Executive Operational Summary
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  Health: <strong className="text-slate-800">{insightData.overallHealth}</strong>
                </span>
                {insightData.topBottleneckCategory && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Friction Point: {insightData.topBottleneckCategory}
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {insightData.summary}
            </p>
          </div>

          {/* SECTION: 3 ACTIONABLE OPTIMIZATION STEPS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-600" />
                  3 Actionable Optimization Steps for Office Assistant
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Concrete operational directives directly derived from today's completion logs.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                100% Actionable
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insightData.actionableSteps.map((step, idx) => {
                const isCritical = step.priority === 'critical';
                const isHigh = step.priority === 'high';
                const stepNum = String(idx + 1).padStart(2, '0');

                return (
                  <div
                    key={step.stepNumber || idx}
                    className={`relative rounded-2xl border bg-white p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                      isCritical
                        ? 'border-rose-300 ring-1 ring-rose-200 shadow-rose-50'
                        : isHigh
                        ? 'border-amber-300 ring-1 ring-amber-100 shadow-amber-50'
                        : 'border-slate-200 shadow-sm'
                    }`}
                  >
                    {/* Top: Step number, Priority badge, Category */}
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                              isCritical
                                ? 'bg-rose-600 text-white'
                                : isHigh
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-800 text-white'
                            }`}
                          >
                            {stepNum}
                          </span>
                          <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">
                            Step {idx + 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              isCritical
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : isHigh
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {step.priority}
                          </span>

                          <button
                            onClick={() => handleCopyStep(step, idx)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Copy this optimization step"
                          >
                            {copiedStepIndex === idx ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Step Title */}
                      <h4 className="text-sm font-bold text-slate-900 mt-3.5 leading-snug">
                        {step.title}
                      </h4>

                      {/* Time window badge & Category */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {step.recommendedTimeSlot && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {step.recommendedTimeSlot}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {step.category}
                        </span>
                      </div>

                      {/* Problem Identified in Logs */}
                      <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                        <span className="font-bold text-slate-700 block mb-1 text-[11px] uppercase tracking-wide">
                          Log Observation:
                        </span>
                        <p className="text-slate-600 leading-relaxed">
                          {step.problemIdentified}
                        </p>
                      </div>

                      {/* Action Plan Checklist */}
                      <div className="mt-4 space-y-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                          Execution Checklist:
                        </span>
                        <div className="space-y-1.5">
                          {step.actionPlan.map((action, actionIdx) => {
                            const isChecked = !!completedChecklist[`${idx}-${actionIdx}`];
                            return (
                              <div
                                key={actionIdx}
                                onClick={() => toggleActionItem(idx, actionIdx)}
                                className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer text-xs transition-colors border ${
                                  isChecked
                                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                    : 'bg-white border-slate-200/60 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                                    isChecked
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span className={`leading-relaxed ${isChecked ? 'line-through text-slate-400' : ''}`}>
                                  {action}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Expected Impact Badge */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                            Expected Impact
                          </span>
                          <p className="text-xs font-semibold text-emerald-900 leading-snug">
                            {step.expectedImpact}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Executive Guidance for Raji Sir & Quantum Affirmation Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Directive for Raji Sir */}
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                  Supervisor Action Directive (For Raji Sir)
                </h4>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed">
                {insightData.executiveTakeaway ||
                  'Enforce a strict 2:00 PM reconciliation quiet period and verify closing logs by 5:15 PM.'}
              </p>
            </div>

            {/* Quantum Affirmation */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                  Quantum Foundation Mindful Workflow
                </h4>
              </div>
              <p className="text-xs text-zinc-300 italic leading-relaxed">
                "{insightData.quantumAffirmation ||
                  'Every task performed with focus and dedication becomes an instrument of peace, order, and human welfare.'}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
        <div className="relative w-full max-w-5xl bg-[#f8fafc] border border-slate-200 rounded-3xl shadow-2xl p-5 sm:p-7 my-auto max-h-[92vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
