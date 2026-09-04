import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  SlidersHorizontal,
  FolderPlus,
} from 'lucide-react';
import { TaskTemplate, PRE_SEEDED_TASKS } from '../types';

interface TaskManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: TaskTemplate[];
  onSaveTemplate: (template: TaskTemplate) => Promise<void>;
  onDeleteTemplate: (id: string, name: string) => Promise<void>;
  onRestoreDefaults: () => Promise<void>;
}

export const TaskManagerModal: React.FC<TaskManagerModalProps> = ({
  isOpen,
  onClose,
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  onRestoreDefaults,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Operations');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleStartEdit = (t: TaskTemplate) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditCategory(t.category || 'Operations');
  };

  const handleSaveEdit = async (t: TaskTemplate) => {
    if (!editName.trim()) return;
    await onSaveTemplate({
      ...t,
      name: editName.trim(),
      category: editCategory.trim() || 'Operations',
    });
    setEditingId(null);
  };

  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const maxOrder = templates.reduce((max, t) => Math.max(max, t.order_index), 0);
    const newTemplate: TaskTemplate = {
      id: `template-${Date.now()}`,
      name: newName.trim(),
      order_index: maxOrder + 1,
      is_active: true,
      category: newCategory.trim() || 'Operations',
    };
    await onSaveTemplate(newTemplate);
    setNewName('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-white/5 text-[#e5e5e5] border border-white/10">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Manage Daily Task List</h2>
              <p className="text-xs text-[#8e9299]">
                Configure Quantum Gazipur cell's core checklist items ({templates.length} total tasks)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#8e9299] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Add New Task bar */}
          {!isAdding ? (
            <button
              id="open-add-task-btn"
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 px-4 rounded border border-dashed border-white/20 text-[#e5e5e5] hover:bg-white/5 hover:border-emerald-500/60 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4 text-emerald-400" /> Add New Dynamic Task
            </button>
          ) : (
            <form
              onSubmit={handleAddNew}
              className="p-4 rounded bg-black/40 border border-white/10 space-y-3 animate-in fade-in"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Add New Task to Checklist</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Task name (e.g., Inventory Reconciliation)"
                    className="w-full text-xs px-3 py-2 rounded bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Category"
                    className="w-full text-xs px-3 py-2 rounded bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded text-xs text-[#8e9299] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded text-xs uppercase tracking-wider font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}

          {/* List of Tasks */}
          <div className="space-y-1.5">
            {templates.map((template, idx) => {
              const isEditing = editingId === template.id;

              return (
                <div
                  key={template.id || template.name}
                  className="flex items-center justify-between gap-3 p-2.5 rounded bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-5 h-5 rounded bg-black/40 text-[10px] font-mono font-medium text-[#8e9299] flex items-center justify-center flex-shrink-0 border border-white/5">
                      {idx + 1}
                    </span>

                    {isEditing ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 text-xs px-2.5 py-1 rounded bg-black/60 border border-emerald-500 text-white focus:outline-none"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          placeholder="Category"
                          className="w-32 text-xs px-2.5 py-1 rounded bg-black/60 border border-white/10 text-white focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="text-sm text-[#e5e5e5] truncate">
                          {template.name}
                        </span>
                        {template.category && (
                          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-[#8e9299] border border-white/5 flex-shrink-0 font-medium">
                            {template.category}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isEditing ? (
                      <button
                        onClick={() => handleSaveEdit(template)}
                        className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/20"
                        title="Save Changes"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(template)}
                        className="p-1.5 rounded text-[#8e9299] hover:text-white hover:bg-white/10 transition-colors"
                        title="Edit Task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteTemplate(template.id, template.name)}
                      className="p-1.5 rounded text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/20 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onRestoreDefaults}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#8e9299] hover:text-[#e5e5e5] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            Restore 20 Default Tasks
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-xs uppercase tracking-widest font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
