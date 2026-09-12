import React, { useState, useMemo, useEffect } from 'react';
import { Employee } from '../types';
import { WorkflowTask } from '../data/workflowData';
import {
  getCustomWorkflowState,
  addCustomTaskPoint,
  removeTaskPoint,
  updateTaskPoint,
  resetCustomWorkflowState,
  getEffectiveWorkflowForEmployee,
} from '../lib/customWorkflowStorage';

interface DeveloperConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Employee;
  employees: Employee[];
  onWorkflowMutated?: () => void;
}

export const DeveloperConsoleModal: React.FC<DeveloperConsoleModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  employees,
  onWorkflowMutated,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'add' | 'stats'>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTargetEmp, setSelectedTargetEmp] = useState<string>('all');
  const [editTask, setEditTask] = useState<WorkflowTask | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form for adding a new task point
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newCategory, setNewCategory] = useState('OFFICE MANAGEMENT');
  const [newCategoryBn, setNewCategoryBn] = useState('Office Management');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTargetEmp, setNewTargetEmp] = useState('all');

  // Developer PIN Gate
  const isDeveloperUser = currentUser?.role === 'developer' || currentUser?.employee_id === 'DEV_ADMIN';
  const [isPinUnlocked, setIsPinUnlocked] = useState(isDeveloperUser);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    if (isDeveloperUser) {
      setIsPinUnlocked(true);
    }
  }, [isDeveloperUser]);

  // Trigger re-read when state changes
  const [version, setVersion] = useState(0);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Get all tasks for inspection
  const effectiveData = useMemo(() => {
    const data = getEffectiveWorkflowForEmployee(
      selectedTargetEmp === 'all' ? undefined : selectedTargetEmp
    );
    return data;
  }, [selectedTargetEmp, version]);

  const customState = useMemo(() => {
    return getCustomWorkflowState();
  }, [version]);

  const filteredTasks = useMemo(() => {
    return effectiveData.tasks.filter((t) => {
      const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
      const matchQuery =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [effectiveData.tasks, selectedCategory, searchQuery]);

  const handleAddNewPoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDetails.trim()) {
      notify('Please enter task name and detailed instructions.');
      return;
    }

    const codeToUse = newCode.trim() || `DEV-${Math.floor(100 + Math.random() * 900)}`;
    addCustomTaskPoint(
      {
        code: codeToUse,
        name: newName.trim(),
        details: newDetails.trim(),
        category: newCategory.trim().toUpperCase(),
        categoryBn: newCategoryBn.trim() || newCategory.trim(),
        priority: newPriority,
      },
      newTargetEmp
    );

    setNewCode('');
    setNewName('');
    setNewDetails('');
    setVersion((v) => v + 1);
    onWorkflowMutated?.();
    notify(`New task point successfully added (${codeToUse})!`);
    setActiveTab('tasks');
  };

  const handleDeletePoint = (taskId: string, taskName: string) => {
    if (confirm(`Are you sure you want to remove the task point "${taskName}"?`)) {
      removeTaskPoint(taskId);
      setVersion((v) => v + 1);
      onWorkflowMutated?.();
      notify(`Task point removed successfully (${taskName})!`);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask) return;

    updateTaskPoint(editTask.id, {
      name: editTask.name,
      details: editTask.details,
      priority: editTask.priority,
      code: editTask.code,
    });

    setEditTask(null);
    setVersion((v) => v + 1);
    onWorkflowMutated?.();
    notify('Task point changes saved successfully!');
  };

  const handleResetToDefault = () => {
    if (
      confirm(
        'Are you sure you want to revert all custom modifications and restore factory defaults?'
      )
    ) {
      resetCustomWorkflowState();
      setVersion((v) => v + 1);
      onWorkflowMutated?.();
      notify('Workflow restored to factory defaults!');
    }
  };

  if (!isOpen) return null;

  // PIN Unlock Gate for non-developer sessions
  if (!isPinUnlocked) {
    const handleUnlock = (e: React.FormEvent) => {
      e.preventDefault();
      if (enteredPin.trim() === '7788') {
        setIsPinUnlocked(true);
        setPinError('');
      } else {
        setPinError('Invalid Developer PIN! (Correct PIN: 7788)');
      }
    };

    return (
      <div id="dev-pin-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
        <div id="dev-pin-card" className="bg-slate-900 border border-rose-500/50 rounded-2xl w-full max-w-md shadow-2xl text-slate-100 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Developer Security Access</h3>
              <span className="text-[10px] text-rose-300 font-mono">ID: DEV_ADMIN</span>
            </div>
            <button
              id="dev-pin-close"
              onClick={onClose}
              className="px-2 py-1 rounded text-xs text-slate-400 hover:text-white border border-slate-700"
            >
              Close
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Enter the <strong>Developer PIN (PIN: 7788)</strong> to modify points or configure real-time workflows.
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Developer PIN (4 digits)
              </label>
              <input
                id="dev-pin-input"
                type="password"
                maxLength={6}
                placeholder="PIN: 7788"
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setPinError('');
                }}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono tracking-widest focus:outline-none focus:border-rose-500"
                autoFocus
              />
              {pinError && <p className="text-xs text-rose-400 mt-1 font-medium">{pinError}</p>}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                id="dev-pin-submit"
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md"
              >
                Unlock Console
              </button>
              <button
                type="button"
                id="dev-pin-quick-unlock"
                onClick={() => {
                  setEnteredPin('7788');
                  setIsPinUnlocked(true);
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
              >
                Quick Unlock (7788)
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div id="dev-console-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div id="dev-console-container" className="bg-slate-900 border border-rose-500/40 rounded-2xl w-full max-w-5xl shadow-2xl text-slate-100 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-slate-900 p-5 border-b border-rose-500/30 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                System Developer Console &amp; Point Editor
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/50">
                DEV_ADMIN Mode
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live workflow point management, priority adjusting, and runtime configuration
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="dev-reset-default-btn"
              onClick={handleResetToDefault}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              [Reset Default]
            </button>
            <button
              id="dev-close-console-btn"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              [Close]
            </button>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-4 py-2 text-xs font-medium text-emerald-300">
            {notification}
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-900/90 border-b border-slate-800">
          <button
            id="tab-dev-tasks"
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'tasks'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Points List &amp; Edit ({effectiveData.tasks.length})
          </button>
          <button
            id="tab-dev-add"
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'add'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Add New Point
          </button>
          <button
            id="tab-dev-stats"
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'stats'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Configuration &amp; Architecture
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <input
                    id="dev-search-input"
                    type="text"
                    placeholder="Search points by code or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <select
                    id="dev-category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="all">All Categories ({effectiveData.categories.length})</option>
                    {effectiveData.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.taskCount} points)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    id="dev-target-emp-select"
                    value={selectedTargetEmp}
                    onChange={(e) => setSelectedTargetEmp(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="all">All Staff View</option>
                    {employees
                      .filter((e) => e.role !== 'developer')
                      .map((e) => (
                        <option key={e.id} value={e.employee_id}>
                          {e.name} ({e.employee_id})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Task Count Indicator */}
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
                <span>
                  Showing: <strong className="text-rose-400">{filteredTasks.length}</strong> points
                </span>
                <span className="text-[11px] text-slate-500">
                  Use action buttons on each point to edit or remove
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {filteredTasks.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-sm">
                    No matching points found.
                  </div>
                ) : (
                  filteredTasks.map((t) => {
                    const isCustom = customState.addedTasks.some((at) => at.id === t.id);
                    const isOverridden = Boolean(customState.overrides[t.id]);

                    return (
                      <div
                        key={t.id}
                        className={`p-3 rounded-xl border transition flex items-start justify-between gap-3 ${
                          isCustom
                            ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400'
                            : isOverridden
                            ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                            : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-700 text-slate-200">
                              {t.code}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                              {t.category}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                                t.priority === 'high'
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : t.priority === 'medium'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {t.priority === 'high'
                                ? 'Urgent'
                                : t.priority === 'medium'
                                ? 'Medium'
                                : 'Routine'}
                            </span>
                            {isCustom && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/50">
                                Developer Custom
                              </span>
                            )}
                            {isOverridden && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/30 text-amber-300 border border-amber-500/50">
                                Edited
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-white truncate">{t.name}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{t.details}</p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 pt-1">
                          <button
                            id={`btn-edit-point-${t.id}`}
                            onClick={() => setEditTask(t)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition"
                          >
                            [Edit]
                          </button>
                          <button
                            id={`btn-del-point-${t.id}`}
                            onClick={() => handleDeletePoint(t.id, t.name)}
                            className="px-2 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 border border-rose-800/60 text-xs font-semibold transition"
                          >
                            [Delete]
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'add' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-white">
                    Add New Task Point
                  </h3>
                </div>

                <form onSubmit={handleAddNewPoint} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Point Code (Optional)
                      </label>
                      <input
                        id="new-point-code"
                        type="text"
                        placeholder="e.g. DEV-01, SP-05"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Priority
                      </label>
                      <select
                        id="new-point-priority"
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value as 'high' | 'medium' | 'low')}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                      >
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Task Point Title *
                    </label>
                    <input
                      id="new-point-title"
                      type="text"
                      placeholder="e.g. Urgent Bank Reconciliation and Special Voucher Audit"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Detailed Instructions *
                    </label>
                    <textarea
                      id="new-point-details"
                      placeholder="Specific instructions on what steps must be completed..."
                      rows={3}
                      value={newDetails}
                      onChange={(e) => setNewDetails(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Category
                      </label>
                      <input
                        id="new-point-category"
                        type="text"
                        placeholder="e.g. BILL WORK, FUND, SPECIAL"
                        value={newCategory}
                        onChange={(e) => {
                          setNewCategory(e.target.value);
                          setNewCategoryBn(e.target.value);
                        }}
                        required
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Applicable Employee Target
                      </label>
                      <select
                        id="new-point-target-emp"
                        value={newTargetEmp}
                        onChange={(e) => setNewTargetEmp(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                      >
                        <option value="all">Add to All Staff Checklists</option>
                        {employees
                          .filter((e) => e.role !== 'developer')
                          .map((e) => (
                            <option key={e.id} value={e.employee_id}>
                              {e.name} ({e.employee_id})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <button
                    id="btn-save-new-point"
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
                  >
                    Save and Add Point to System
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                  <span className="text-2xl font-black text-rose-400 font-mono">
                    {customState.addedTasks.length}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">Additional Custom Points</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    {Object.keys(customState.overrides).length}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">Edited Points</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                  <span className="text-2xl font-black text-slate-400 font-mono">
                    {customState.deletedTaskIds.length}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">Removed Points</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-3">
                <h4 className="text-xs font-bold text-white">Developer Credentials</h4>
                <div className="text-xs text-slate-300 space-y-1.5">
                  <p>
                    • <strong>Developer ID:</strong>{' '}
                    <code className="bg-slate-900 px-1.5 py-0.5 rounded text-rose-400 font-mono font-bold">
                      DEV_ADMIN
                    </code>
                  </p>
                  <p>
                    • <strong>Default PIN:</strong>{' '}
                    <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400 font-mono font-bold">
                      7788
                    </code>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Signing in with this account allows instant configuration, point additions, and modifications.
                  </p>
                </div>
              </div>

              {/* Midnight Auto-Reset & Database Architecture Summary */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-3">
                <h4 className="text-xs font-bold text-white">Midnight 12:00 AM Auto-Rollover &amp; Database Architecture</h4>
                <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                  <p>
                    • <strong>Automatic Checklist Reset:</strong> At midnight 12:00 AM or upon opening the application the following morning, the system date rolls over and all employee checklists are freshly cleared and ready for new work.
                  </p>
                  <p>
                    • <strong>Database Preservation Guarantee:</strong> Every checkbox state, pending reason, and completion percentage from prior days is permanently saved in the <code>daily_logs</code> table keyed by <code>(date, employee_id, task_name)</code>.
                  </p>
                  <p>
                    • <strong>Historical Inspection:</strong> Click <strong>[Database Archive]</strong> in the top header and choose any past date to inspect stored records, completion rates, and status checkboxes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Task Sub-modal */}
        {editTask && (
          <div id="edit-task-backdrop" className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div id="edit-task-modal" className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-5 shadow-2xl text-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <h4 className="text-sm font-bold text-white">Edit Point ({editTask.code})</h4>
                <button
                  id="btn-close-edit-task"
                  onClick={() => setEditTask(null)}
                  className="px-2 py-1 rounded text-xs text-slate-400 hover:text-white border border-slate-600"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Point Code</label>
                  <input
                    id="edit-point-code"
                    type="text"
                    value={editTask.code}
                    onChange={(e) => setEditTask({ ...editTask, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Task Title
                  </label>
                  <input
                    id="edit-point-name"
                    type="text"
                    value={editTask.name}
                    onChange={(e) => setEditTask({ ...editTask, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Detailed Description
                  </label>
                  <textarea
                    id="edit-point-details"
                    rows={3}
                    value={editTask.details}
                    onChange={(e) => setEditTask({ ...editTask, details: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    id="edit-point-priority"
                    value={editTask.priority}
                    onChange={(e) => setEditTask({ ...editTask, priority: e.target.value as 'high' | 'medium' | 'low' })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    id="btn-submit-edit-task"
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
                  >
                    Save Changes
                  </button>
                  <button
                    id="btn-cancel-edit-task"
                    type="button"
                    onClick={() => setEditTask(null)}
                    className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
