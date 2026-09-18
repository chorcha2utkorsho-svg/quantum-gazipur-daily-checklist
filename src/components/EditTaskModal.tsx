/**
 * Quantum Gazipur Cell - Task Customization Modal
 * Allows staff and managers to customize Task Name, Priority, Estimated Duration (Time Limit), Category, and Details.
 */

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, Check, X, Tag, Sliders, RotateCcw } from 'lucide-react';
import { WorkflowTask, WorkflowCategory } from '../data/workflowData';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: WorkflowTask | null;
  categories: WorkflowCategory[];
  onSaveTask: (taskId: string, updates: {
    name: string;
    priority: 'high' | 'medium' | 'low';
    estimated_minutes: number;
    category: string;
    details?: string;
  }, oldName: string) => Promise<void> | void;
  onResetTaskToDefault?: (taskId: string) => Promise<void> | void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  categories,
  onSaveTask,
  onResetTaskToDefault,
}) => {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  const [category, setCategory] = useState('');
  const [details, setDetails] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setName(task.name || '');
      setPriority(task.priority || 'medium');
      setEstimatedMinutes(task.estimated_minutes || 30);
      setCategory(task.category || 'GENERAL');
      setDetails(task.details || '');
      setError(null);
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const quickMinutesPresets = [10, 15, 20, 25, 30, 45, 60, 90, 120];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('টাস্কের নাম খালি রাখা যাবে না (Task name cannot be empty)');
      return;
    }

    const minutesNum = Math.max(1, Number(estimatedMinutes) || 15);

    try {
      setIsSaving(true);
      await onSaveTask(
        task.id,
        {
          name: name.trim(),
          priority,
          estimated_minutes: minutesNum,
          category: category.trim() || 'GENERAL',
          details: details.trim(),
        },
        task.name
      );
      setIsSaving(false);
      onClose();
    } catch (err) {
      setIsSaving(false);
      setError('কাস্টমাইজেশন সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  const handleReset = async () => {
    if (!onResetTaskToDefault) return;
    if (window.confirm(`"${task.name}" টাস্কটি ফ্যাক্টরি ডিফল্ট মানে রিসেট করতে চান?`)) {
      try {
        setIsSaving(true);
        await onResetTaskToDefault(task.id);
        setIsSaving(false);
        onClose();
      } catch (err) {
        setIsSaving(false);
      }
    }
  };

  return (
    <div
      id="edit-task-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="edit-task-modal-card"
        className="relative w-full max-w-lg rounded-2xl bg-[#0f1115] border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                টাস্ক কাস্টমাইজ করুন
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white/10 text-slate-400 border border-white/10">
                  {task.code || 'TASK'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Customize task name, priority, time limit & category
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Task Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200">
              টাস্কের নাম (Task Name) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bill Check / ক্যাশ রিসিভ"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>

          {/* 2. Priority Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200">
              প্রায়োরিটি (Priority Level)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  priority === 'high'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500 ring-2 ring-rose-500/30'
                    : 'bg-black/30 text-slate-400 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                HIGH
              </button>

              <button
                type="button"
                onClick={() => setPriority('medium')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  priority === 'medium'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500 ring-2 ring-amber-500/30'
                    : 'bg-black/30 text-slate-400 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                MEDIUM
              </button>

              <button
                type="button"
                onClick={() => setPriority('low')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  priority === 'low'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500 ring-2 ring-sky-500/30'
                    : 'bg-black/30 text-slate-400 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                LOW
              </button>
            </div>
          </div>

          {/* 3. Estimated Time / সময়সীমা */}
          <div className="space-y-2 p-3 rounded-xl bg-black/30 border border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                সময়সীমা / আনুমানিক সময় (Time Limit / Duration)
              </label>
              <span className="text-xs font-mono font-bold text-sky-300 px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/30">
                {estimatedMinutes} মিনিট
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickMinutesPresets.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setEstimatedMinutes(mins)}
                  className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                    estimatedMinutes === mins
                      ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-xs'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            {/* Manual Minutes Input */}
            <div className="pt-2 flex items-center gap-2">
              <span className="text-[11px] text-slate-400">কাস্টম মিনিট:</span>
              <input
                type="number"
                min="1"
                max="600"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Math.max(1, Number(e.target.value) || 1))}
                className="w-24 text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-sky-300 focus:outline-none focus:border-sky-500 text-center"
              />
              <span className="text-[11px] text-slate-400">মিনিট (Minutes)</span>
            </div>
          </div>

          {/* 4. Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              ক্যাটাগরি (Workflow Category)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white focus:outline-none focus:border-indigo-500"
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c.id || c.name} value={c.name} className="bg-[#14161a] text-white">
                      {c.name} {c.nameBn ? `(${c.nameBn})` : ''}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="BILL WORK">BILL WORK</option>
                    <option value="CASH & ACCOUNTS">CASH & ACCOUNTS</option>
                    <option value="DONATION">DONATION</option>
                    <option value="PROGRAM-Inside">PROGRAM-Inside</option>
                    <option value="PROGRAM-Outside">PROGRAM-Outside</option>
                    <option value="ADMISSION">ADMISSION</option>
                    <option value="OFFICE MANAGEMENT">OFFICE MANAGEMENT</option>
                    <option value="GENERAL">GENERAL</option>
                  </>
                )}
              </select>

              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value.toUpperCase())}
                placeholder="Or custom category"
                className="w-full sm:w-44 text-xs px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 uppercase font-mono"
              />
            </div>
          </div>

          {/* 5. Detailed Instructions / Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200">
              টাস্কের বিবরণ ও নির্দেশাবলী (Task Details / Instructions)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Detailed steps, checklist instructions, or operational guidelines..."
              className="w-full text-xs px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            {onResetTaskToDefault && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 py-2 px-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-amber-500/30"
                title="Reset to factory default settings"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ডিফল্টে রিসেট</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন (Save)'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
