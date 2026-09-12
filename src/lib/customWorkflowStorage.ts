import { WorkflowCategory, WorkflowTask, getWorkflowForEmployee } from '../data/workflowData';

export interface CustomTaskOverride {
  id: string;
  name?: string;
  details?: string;
  priority?: 'high' | 'medium' | 'low';
  category?: string;
  categoryBn?: string;
  targetEmployeeId?: string; // If restricted to specific employee, or 'all'
}

export interface CustomTaskAddition extends WorkflowTask {
  isCustomAdded: boolean;
  targetEmployeeId?: string; // 'all' or specific employee id
  addedAt: string;
}

export interface CustomWorkflowState {
  addedTasks: CustomTaskAddition[];
  deletedTaskIds: string[];
  overrides: Record<string, Partial<WorkflowTask>>;
}

const STORAGE_KEY = 'qgz_custom_workflow_points_v1';

export function getCustomWorkflowState(): CustomWorkflowState {
  if (typeof window === 'undefined') {
    return { addedTasks: [], deletedTaskIds: [], overrides: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { addedTasks: [], deletedTaskIds: [], overrides: {} };
    const parsed = JSON.parse(raw);
    return {
      addedTasks: Array.isArray(parsed.addedTasks) ? parsed.addedTasks : [],
      deletedTaskIds: Array.isArray(parsed.deletedTaskIds) ? parsed.deletedTaskIds : [],
      overrides: typeof parsed.overrides === 'object' && parsed.overrides ? parsed.overrides : {},
    };
  } catch (err) {
    console.error('Failed to read custom workflow points:', err);
    return { addedTasks: [], deletedTaskIds: [], overrides: {} };
  }
}

export function saveCustomWorkflowState(state: CustomWorkflowState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('qgz_workflow_updated'));
  } catch (err) {
    console.error('Failed to save custom workflow points:', err);
  }
}

// Add a new task point
export function addCustomTaskPoint(
  task: Omit<WorkflowTask, 'id' | 'order'>,
  targetEmployeeId: string = 'all'
): CustomTaskAddition {
  const state = getCustomWorkflowState();
  const id = `custom-task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newAddition: CustomTaskAddition = {
    ...task,
    id,
    order: 999 + state.addedTasks.length,
    isCustomAdded: true,
    targetEmployeeId,
    addedAt: new Date().toISOString(),
  };

  state.addedTasks.push(newAddition);
  saveCustomWorkflowState(state);
  return newAddition;
}

// Remove or deactivate a task point
export function removeTaskPoint(taskId: string): void {
  const state = getCustomWorkflowState();
  // If it's a custom added task, remove from addedTasks
  state.addedTasks = state.addedTasks.filter((t) => t.id !== taskId);
  // Also register in deletedTaskIds so base tasks are omitted
  if (!state.deletedTaskIds.includes(taskId)) {
    state.deletedTaskIds.push(taskId);
  }
  delete state.overrides[taskId];
  saveCustomWorkflowState(state);
}

// Edit or customize an existing task point
export function updateTaskPoint(taskId: string, updates: Partial<WorkflowTask>): void {
  const state = getCustomWorkflowState();

  // If it's a custom added task, update directly
  const customIdx = state.addedTasks.findIndex((t) => t.id === taskId);
  if (customIdx >= 0) {
    state.addedTasks[customIdx] = { ...state.addedTasks[customIdx], ...updates };
  } else {
    // Record override for base task
    state.overrides[taskId] = {
      ...(state.overrides[taskId] || {}),
      ...updates,
    };
  }

  // If it was in deletedTaskIds, un-delete it
  state.deletedTaskIds = state.deletedTaskIds.filter((id) => id !== taskId);
  saveCustomWorkflowState(state);
}

// Reset all customizations back to factory default
export function resetCustomWorkflowState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('qgz_workflow_updated'));
}

// Get effective workflow tasks and categories for employee including all live developer modifications
export function getEffectiveWorkflowForEmployee(
  employeeId?: string,
  employeeName?: string
): {
  tasks: WorkflowTask[];
  categories: WorkflowCategory[];
} {
  const base = getWorkflowForEmployee(employeeId, employeeName);
  const state = getCustomWorkflowState();

  // 1. Filter out deleted tasks
  let tasks = base.tasks.filter((t) => !state.deletedTaskIds.includes(t.id));

  // 2. Apply overrides
  tasks = tasks.map((t) => {
    if (state.overrides[t.id]) {
      return { ...t, ...state.overrides[t.id] };
    }
    return t;
  });

  // 3. Append custom added tasks for this employee or 'all'
  const normalizedId = (employeeId || '').toUpperCase();
  const matchingAdditions = state.addedTasks.filter(
    (t) =>
      !state.deletedTaskIds.includes(t.id) &&
      (!t.targetEmployeeId || t.targetEmployeeId === 'all' || t.targetEmployeeId.toUpperCase() === normalizedId)
  );

  tasks = [...tasks, ...matchingAdditions];

  // 4. Update category counts or add new categories if present
  const categoryMap = new Map<string, WorkflowCategory>();
  for (const cat of base.categories) {
    categoryMap.set(cat.id, { ...cat, taskCount: 0 });
  }

  for (const t of tasks) {
    if (categoryMap.has(t.category)) {
      const cat = categoryMap.get(t.category)!;
      cat.taskCount++;
    } else {
      // Dynamic new category created by developer
      categoryMap.set(t.category, {
        id: t.category,
        name: t.category,
        nameBn: t.categoryBn || t.category,
        taskCount: 1,
        badgeBg: 'bg-indigo-50',
        badgeText: 'text-indigo-700',
        badgeBorder: 'border-indigo-200',
        activeBg: 'bg-indigo-600 text-white',
        iconName: 'Sparkles',
      });
    }
  }

  const categories = Array.from(categoryMap.values()).filter((c) => c.taskCount > 0);

  return { tasks, categories };
}
