import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckSquare,
  Square,
  Clock,
  Search,
  Plus,
  AlertCircle,
  CheckCircle2,
  Filter,
  FileText,
  Calendar,
  Sparkles,
  ChevronDown,
  X,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { WorkflowCategory, WorkflowTask } from '../data/workflowData';
import { DailyLogItem, Employee, TaskStatus } from '../types';

interface HeadTaskListViewProps {
  category: WorkflowCategory;
  tasks: WorkflowTask[];
  dailyLogs: Record<string, DailyLogItem>;
  onBackToHeads: () => void;
  onToggleTaskStatus: (taskName: string, newStatus: TaskStatus, category: string) => void;
  onUpdateReason: (taskName: string, reason: string) => void;
  currentUser: Employee | null;
  selectedDate: string;
  onAddNewTask?: (task: Partial<WorkflowTask>) => void;
  activeTimerTaskName?: string | null;
  activeTimerSeconds?: number;
  onStartTimer?: (taskName: string) => void;
  onPauseTimer?: () => void;
  onResetTimer?: () => void;
}

export const HeadTaskListView: React.FC<HeadTaskListViewProps> = ({
  category,
  tasks,
  dailyLogs,
  onBackToHeads,
  onToggleTaskStatus,
  onUpdateReason,
  currentUser,
  selectedDate,
  onAddNewTask,
  activeTimerTaskName,
  activeTimerSeconds = 0,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'done' | 'pending'>('all');
  const [editingNotesTask, setEditingNotesTask] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDetails, setNewTaskDetails] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Filter tasks for this category
  const categoryTasks = tasks.filter((t) => t.category === category.id);

  const filteredTasks = categoryTasks.filter((task) => {
    const log = dailyLogs[task.name];
    const isDone = log?.status === 'done';

    if (statusFilter === 'done' && !isDone) return false;
    if (statusFilter === 'pending' && isDone) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        task.name.toLowerCase().includes(q) ||
        (task.code && task.code.toLowerCase().includes(q)) ||
        (task.details && task.details.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const total = categoryTasks.length;
  const doneCount = categoryTasks.filter((t) => dailyLogs[t.name]?.status === 'done').length;
  const percentage = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const handleSaveNotes = (taskName: string) => {
    onUpdateReason(taskName, notesInput);
    setEditingNotesTask(null);
    setNotesInput('');
  };

  const handleCreateTask = () => {
    if (!newTaskName.trim() || !onAddNewTask) return;
    onAddNewTask({
      id: `task-${Date.now()}`,
      code: `${category.id.slice(0, 3).toUpperCase()}-${(categoryTasks.length + 1).toString().padStart(2, '0')}`,
      name: newTaskName.trim(),
      details: newTaskDetails.trim(),
      category: category.id,
      categoryBn: category.nameBn,
      priority: newTaskPriority,
      order: categoryTasks.length + 1,
    });
    setIsAddTaskModalOpen(false);
    setNewTaskName('');
    setNewTaskDetails('');
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Navigation & Head Overview Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Row 1: Back button & Head Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHeads}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              title="সব হেড ও বক্সে ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>সব বক্সে ফিরে যান</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {category.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold">
                  {doneCount}/{total} সম্পন্ন ({percentage}%)
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {category.nameBn || category.name} • তারিখ: {selectedDate}
              </p>
            </div>
          </div>

          {/* Quick Add Task */}
          <div className="flex items-center gap-2">
            {onAddNewTask && (
              <button
                type="button"
                onClick={() => setIsAddTaskModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন কাজ যোগ করুন</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentage === 100
                ? 'bg-emerald-500'
                : percentage > 50
                ? 'bg-sky-500'
                : 'bg-indigo-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Row 3: Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="এই হেডের কাজ খুঁজুন..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 w-44 sm:w-60 transition"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                সব ({total})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  statusFilter === 'pending'
                    ? 'bg-white text-amber-700 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                বাকি ({total - doneCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('done')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  statusFilter === 'done'
                    ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                সম্পন্ন ({doneCount})
              </button>
            </div>
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">অগ্রাধিকার:</span>
            <select
              value={priorityFilter}
              onChange={(e: any) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">সকল অগ্রাধিকার</option>
              <option value="high">High (উচ্চ)</option>
              <option value="medium">Medium (মাঝারি)</option>
              <option value="low">Low (সাধারণ)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List Items */}
      <div className="space-y-2.5">
        {filteredTasks.map((task) => {
          const log = dailyLogs[task.name];
          const isDone = log?.status === 'done';
          const isTiming = activeTimerTaskName === task.name;

          return (
            <div
              key={task.id || task.name}
              className={`p-4 rounded-2xl border transition-all ${
                isDone
                  ? 'bg-emerald-50/40 border-emerald-200/90 shadow-2xs'
                  : 'bg-white hover:bg-slate-50/60 border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Left: Checkbox & Task Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Large tactile checkbox */}
                  <button
                    type="button"
                    onClick={() =>
                      onToggleTaskStatus(
                        task.name,
                        isDone ? 'pending' : 'done',
                        category.id
                      )
                    }
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'border-2 border-slate-300 hover:border-sky-500 bg-white'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-sm bg-transparent group-hover:bg-slate-200" />
                    )}
                  </button>

                  {/* Task details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {task.code && (
                        <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {task.code}
                        </span>
                      )}
                      <h4
                        className={`text-sm font-bold tracking-tight ${
                          isDone ? 'text-emerald-950 line-through opacity-80' : 'text-slate-900'
                        }`}
                      >
                        {task.name}
                      </h4>

                      {/* Priority badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          task.priority === 'high'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : task.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {task.priority.toUpperCase()}
                      </span>

                      {/* Estimated time */}
                      {task.estimated_minutes && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{task.estimated_minutes} মি.</span>
                        </span>
                      )}
                    </div>

                    {task.details && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {task.details}
                      </p>
                    )}

                    {/* Saved Notes / Reason */}
                    {log?.reason_for_pending && (
                      <div className="mt-2 p-2 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <span>{log.reason_for_pending}</span>
                      </div>
                    )}

                    {/* Notes editor */}
                    {editingNotesTask === task.name && (
                      <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <textarea
                          value={notesInput}
                          onChange={(e) => setNotesInput(e.target.value)}
                          placeholder="কাজের অগ্রগতি বা পেন্ডিং থাকার কারণ লিখুন..."
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                          rows={2}
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingNotesTask(null)}
                            className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800"
                          >
                            বাতিল
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveNotes(task.name)}
                            className="px-3 py-1 text-xs font-bold bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                          >
                            সংরক্ষণ
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions (Timer / Notes toggle) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Timer Control */}
                  {onStartTimer && (
                    <button
                      type="button"
                      onClick={() =>
                        isTiming ? onPauseTimer?.() : onStartTimer(task.name)
                      }
                      className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                        isTiming
                          ? 'bg-amber-500 text-slate-950 border-amber-600 animate-pulse'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                      title={isTiming ? 'টাইমার থামান' : 'টাইমার চালু করুন'}
                    >
                      {isTiming ? (
                        <>
                          <Pause className="w-3 h-3" />
                          <span>{formatTimer(activeTimerSeconds)}</span>
                        </>
                      ) : (
                        <Play className="w-3 h-3 text-slate-500" />
                      )}
                    </button>
                  )}

                  {/* Add/Edit Note button */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNotesTask(task.name);
                      setNotesInput(log?.reason_for_pending || '');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    title="নোট যোগ / সম্পাদনা করুন"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-2">
            <CheckSquare className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">কোনো কাজ খুঁজে পাওয়া যায়নি।</p>
          </div>
        )}
      </div>

      {/* Modal: Add Task */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-2xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                '{category.name}' হেডে নতুন কাজ যোগ করুন
              </h3>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  কাজের নাম *
                </label>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="যেমন: বিল যাচাই ও ভাউচার স্বাক্ষর"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  কাজের বিস্তারিত বিবরণ
                </label>
                <textarea
                  value={newTaskDetails}
                  onChange={(e) => setNewTaskDetails(e.target.value)}
                  placeholder="কাজের বিস্তারিত বিবরণ বা করণীয় ধাপগুলো লিখুন..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  অগ্রাধিকার (Priority)
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e: any) => setNewTaskPriority(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                >
                  <option value="high">High (উচ্চ অগ্রাধিকার)</option>
                  <option value="medium">Medium (মাঝারি অগ্রাধিকার)</option>
                  <option value="low">Low (সাধারণ)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddTaskModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleCreateTask}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition"
              >
                কাজ যুক্ত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
