import React, { useState, useEffect, useMemo } from 'react';
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

    const userLogs = logs.filter((l) => l.employee_id === selectedAssistant.employee_id && l.date === date);
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
        category: t.category || 'General',
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
${step.actionPlan.map((p) => `* ${p}`).join('\n')}
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
    <div className={`space-y-6 text-white ${className}`}>
      {/* 1. Header & Controls Banner */}
      <div className="overflow-hidden rounded-2xl bg-[#14161a] border border-amber-500/30 p-5 sm:p-6 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                AI Strategic Insight
              </h2>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Analyzing daily completion logs to generate 3 actionable optimization steps for the office assistant's workflow.
            </p>
          </div>

          {/* Action buttons & Assistant selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Assistant selector */}
            <div className="relative">
              <label htmlFor="assistant-select" className="sr-only">
                Select Office Assistant
              </label>
              <select
                id="assistant-select"
                value={selectedAssistantId}
                onChange={(e) => setSelectedAssistantId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-semibold focus:outline-hidden cursor-pointer"
              >
                {officeAssistants.map((oa) => (
                  <option key={oa.id} value={oa.employee_id} className="bg-[#1a1d24] text-white">
                    {oa.name} ({oa.employee_id}) — {oa.branch === 'rajbari' ? 'Sadar Office' : 'Gazipur Branch'}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Pill */}
            <div className="hidden sm:flex items-center px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 font-mono">
              Date: {date}
            </div>

            {/* Re-analyze button */}
            <button
              id="reanalyze-btn"
              onClick={handleAnalyzeWorkflow}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Analyzing Logs...' : 'Re-analyze'}
            </button>

            {/* Copy All button */}
            {insightData && (
              <button
                onClick={handleCopyAll}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors border border-white/10 cursor-pointer"
              >
                {copiedAll ? '[Copied]' : '[Copy Plan]'}
              </button>
            )}

            {isModal && onClose && (
              <button
                onClick={onClose}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors border border-white/10 text-xs font-bold cursor-pointer"
              >
                [Close]
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
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">
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
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={handleAnalyzeWorkflow}
            className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-500"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state skeleton */}
      {isLoading && (
        <div className="p-8 rounded-2xl bg-[#14161a] border border-white/10 text-center space-y-2">
          <h4 className="text-base font-bold text-white">
            AI is analyzing daily completion logs...
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Evaluating task completion velocity, bottleneck reasons, and timing friction to synthesize 3 actionable optimization steps for {selectedAssistant?.name}.
          </p>
        </div>
      )}

      {/* Main Insight Content */}
      {!isLoading && insightData && (
        <div className="space-y-6">
          {/* Executive Overview Card */}
          <div className="p-5 rounded-2xl bg-[#14161a] border border-white/10 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Executive Operational Summary
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  Health: <strong className="text-white">{insightData.overallHealth}</strong>
                </span>
                {insightData.topBottleneckCategory && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Friction Point: {insightData.topBottleneckCategory}
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {insightData.summary}
            </p>
          </div>

          {/* SECTION: 3 ACTIONABLE OPTIMIZATION STEPS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  3 Actionable Optimization Steps for Office Assistant
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
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
                    className={`rounded-2xl border bg-[#14161a] p-5 flex flex-col justify-between transition-all ${
                      isCritical
                        ? 'border-rose-500/40'
                        : isHigh
                        ? 'border-amber-500/40'
                        : 'border-white/10'
                    }`}
                  >
                    {/* Top: Step number, Priority badge, Category */}
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                              isCritical
                                ? 'bg-rose-600 text-white'
                                : isHigh
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-white/10 text-white'
                            }`}
                          >
                            {stepNum}
                          </span>
                          <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">
                            Step {idx + 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              isCritical
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : isHigh
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-white/10 text-slate-300 border-white/10'
                            }`}
                          >
                            {step.priority}
                          </span>

                          <button
                            onClick={() => handleCopyStep(step, idx)}
                            className="px-2 py-0.5 rounded-md text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 text-xs transition-colors"
                            title="Copy this optimization step"
                          >
                            {copiedStepIndex === idx ? '[Copied]' : '[Copy]'}
                          </button>
                        </div>
                      </div>

                      {/* Step Title */}
                      <h4 className="text-sm font-bold text-white mt-3.5 leading-snug">
                        {step.title}
                      </h4>

                      {/* Time window badge & Category */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {step.recommendedTimeSlot && (
                          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                            Time: {step.recommendedTimeSlot}
                          </span>
                        )}
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {step.category}
                        </span>
                      </div>

                      {/* Problem Identified in Logs */}
                      <div className="mt-3.5 p-3 rounded-xl bg-black/40 border border-white/10 text-xs">
                        <span className="font-bold text-slate-300 block mb-1 text-[11px] uppercase tracking-wide">
                          Log Observation:
                        </span>
                        <p className="text-slate-400 leading-relaxed">
                          {step.problemIdentified}
                        </p>
                      </div>

                      {/* Action Plan Checklist */}
                      <div className="mt-4 space-y-2">
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide block">
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
                                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                                    : 'bg-black/30 border-white/10 text-slate-300 hover:bg-black/50'
                                }`}
                              >
                                <span className="font-mono text-xs font-bold text-emerald-400">
                                  {isChecked ? '[X]' : '[ ]'}
                                </span>
                                <span className={`leading-relaxed ${isChecked ? 'line-through text-slate-500' : ''}`}>
                                  {action}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Expected Impact Badge */}
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                          Expected Impact
                        </span>
                        <p className="text-xs font-semibold text-emerald-200 leading-snug mt-0.5">
                          {step.expectedImpact}
                        </p>
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
            <div className="p-5 rounded-2xl bg-[#14161a] border border-amber-500/30 shadow-xs space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                Supervisor Action Directive (For Raji Sir)
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                {insightData.executiveTakeaway ||
                  'Enforce a strict 2:00 PM reconciliation quiet period and verify closing logs by 5:15 PM.'}
              </p>
            </div>

            {/* Quantum Affirmation */}
            <div className="p-5 rounded-2xl bg-[#14161a] text-white border border-white/10 shadow-xs space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                Quantum Foundation Mindful Workflow
              </h4>
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
        <div className="relative w-full max-w-5xl bg-[#14161a] border border-white/10 rounded-3xl shadow-2xl p-5 sm:p-7 my-auto max-h-[92vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
