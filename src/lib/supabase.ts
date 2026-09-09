import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  DailyLogItem,
  Employee,
  EmployeeDailyProgress,
  INITIAL_EMPLOYEES,
  PRE_SEEDED_TASKS,
  TaskTemplate,
  UserRole,
} from '../types';
import { ALL_WORKFLOW_TASKS } from '../data/workflowData';

// Default Supabase project configuration for Quantum Gazipur cell
const DEFAULT_SUPABASE_URL = 'https://wftxugyhmtfwljtddmt.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdHh1Z3lobXRmandsanRkZG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MzU0MjksImV4cCI6MjEwNDExMTQyOX0.ylkheh4n9Hg1vpI_OAnsq7mXnO4Zv2Dp0LcO2eoT52E';

// Detect environment variables from both Vite (import.meta.env) and Next.js (process.env)
export function getStoredSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;

  const envUrl =
    metaEnv?.VITE_SUPABASE_URL ||
    metaEnv?.NEXT_PUBLIC_SUPABASE_URL ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    '';

  const envKey =
    metaEnv?.VITE_SUPABASE_ANON_KEY ||
    metaEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    '';

  let localUrl = '';
  let localKey = '';
  if (typeof window !== 'undefined') {
    localUrl = localStorage.getItem('MINA_SUPABASE_URL') || '';
    localKey = localStorage.getItem('MINA_SUPABASE_ANON_KEY') || '';
  }

  const url = (localUrl || envUrl || DEFAULT_SUPABASE_URL).trim();
  const anonKey = (localKey || envKey || DEFAULT_SUPABASE_ANON_KEY).trim();

  const isConfigured = Boolean(
    url &&
      anonKey &&
      url.startsWith('https://') &&
      url.includes('supabase.co') &&
      !url.includes('your-project')
  );

  return { url, anonKey, isConfigured };
}

let cachedClient: SupabaseClient | null = null;
let currentClientKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getStoredSupabaseConfig();
  if (!isConfigured) return null;

  const key = `${url}:${anonKey}`;
  if (cachedClient && currentClientKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: { persistSession: true },
    });
    currentClientKey = key;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

// Test live connection to Supabase instance
export async function testConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const tempClient = createClient(url, anonKey);
    const { error } = await tempClient.from('daily_logs').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      if (error.message?.includes('relation "public.daily_logs" does not exist') || error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! Note: Run the SQL schema to enable the multi-employee daily_logs table.',
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed. Please verify the URL and Anon Key.' };
  }
}

// ==========================================
// Local Storage Fallback Helpers
// ==========================================
const STORAGE_PREFIX = 'qgz_cell_';

export function getLocalEmployees(): Employee[] {
  if (typeof window === 'undefined') return INITIAL_EMPLOYEES;
  const stored = localStorage.getItem(`${STORAGE_PREFIX}employees_v3`);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure Raji Sir and Anjuman Khan are present in the current schema
        const hasRajiSir = parsed.some((e) => e.employee_id === 'RAJI_SIR');
        const hasAnjuman = parsed.some((e) => e.name && e.name.toLowerCase().includes('anjuman'));
        if (hasRajiSir && hasAnjuman) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
  }

  // Set to official 2-person Gazipur Branch + 3-person Sadar Office roster (+ Raji Sir)
  localStorage.setItem(`${STORAGE_PREFIX}employees_v3`, JSON.stringify(INITIAL_EMPLOYEES));
  return INITIAL_EMPLOYEES;
}

export function saveLocalEmployees(employees: Employee[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_PREFIX}employees_v3`, JSON.stringify(employees));
}

export function getLocalTemplates(): TaskTemplate[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`${STORAGE_PREFIX}templates`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }

  const defaults: TaskTemplate[] = PRE_SEEDED_TASKS.map((t) => ({
    id: `template-${t.order}`,
    name: t.name,
    order_index: t.order,
    is_active: true,
    category: t.category,
  }));
  localStorage.setItem(`${STORAGE_PREFIX}templates`, JSON.stringify(defaults));
  return defaults;
}

export function saveLocalTemplates(templates: TaskTemplate[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_PREFIX}templates`, JSON.stringify(templates));
}

export function getLocalDailyLogs(date: string, employeeId?: string): DailyLogItem[] {
  if (typeof window === 'undefined') return [];
  const key = employeeId
    ? `${STORAGE_PREFIX}logs_${date}_${employeeId}`
    : `${STORAGE_PREFIX}logs_${date}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return [];
}

export function saveLocalDailyLogs(date: string, logs: DailyLogItem[], employeeId?: string) {
  if (typeof window === 'undefined') return;
  const key = employeeId
    ? `${STORAGE_PREFIX}logs_${date}_${employeeId}`
    : `${STORAGE_PREFIX}logs_${date}`;
  localStorage.setItem(key, JSON.stringify(logs));
}

// Active session user in local storage
export function getStoredSession(): Employee | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(`${STORAGE_PREFIX}active_user_v3`);
  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user && user.employee_id) {
        const valid = INITIAL_EMPLOYEES.find((e) => e.employee_id === user.employee_id);
        if (valid) return valid;
      }
    } catch {
      // fallback
    }
  }
  // Default to Raji Sir (Boss) for immediate executive oversight
  return INITIAL_EMPLOYEES[0];
}

export function saveStoredSession(user: Employee | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(`${STORAGE_PREFIX}active_user_v3`, JSON.stringify(user));
  } else {
    localStorage.removeItem(`${STORAGE_PREFIX}active_user_v3`);
  }
}

// ==========================================
// Employee Management API
// ==========================================

export async function fetchEmployees(): Promise<Employee[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        saveLocalEmployees(data as Employee[]);
        return data as Employee[];
      }
    } catch (e) {
      console.warn('Error fetching employees from Supabase, using local:', e);
    }
  }
  return getLocalEmployees();
}

export async function upsertEmployee(emp: Employee): Promise<Employee[]> {
  const current = getLocalEmployees();
  const index = current.findIndex((e) => e.employee_id === emp.employee_id || e.id === emp.id);
  let updated: Employee[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...emp };
  } else {
    updated = [...current, emp];
  }
  saveLocalEmployees(updated);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('employees').upsert(
        {
          id: emp.id.startsWith('emp-') ? undefined : emp.id,
          employee_id: emp.employee_id,
          name: emp.name,
          pin: emp.pin,
          role: emp.role,
          branch: emp.branch || 'chowrasta',
          is_active: emp.is_active,
          phone: emp.phone || '',
          joined_date: emp.joined_date,
          notes: emp.notes || '',
        },
        { onConflict: 'employee_id' }
      );
    } catch (e) {
      console.warn('Error syncing employee to Supabase:', e);
    }
  }
  return updated;
}

export async function toggleEmployeeStatus(employeeId: string, isActive: boolean): Promise<Employee[]> {
  const current = getLocalEmployees();
  const updated = current.map((e) =>
    e.employee_id === employeeId ? { ...e, is_active: isActive } : e
  );
  saveLocalEmployees(updated);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('employees').update({ is_active: isActive }).eq('employee_id', employeeId);
    } catch (e) {
      console.warn('Error updating employee status in Supabase:', e);
    }
  }
  return updated;
}

// ==========================================
// Daily Logs API
// ==========================================

export async function fetchTaskTemplates(): Promise<TaskTemplate[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .order('order_index', { ascending: true });

      if (!error && data && data.length > 0) {
        saveLocalTemplates(data);
        return data;
      }
    } catch (e) {
      console.warn('Error fetching task templates from Supabase, using local fallback:', e);
    }
  }
  return getLocalTemplates();
}

export async function saveTemplate(template: TaskTemplate): Promise<TaskTemplate[]> {
  const current = getLocalTemplates();
  const index = current.findIndex((t) => t.id === template.id);
  let updated: TaskTemplate[];

  if (index >= 0) {
    updated = [...current];
    updated[index] = template;
  } else {
    updated = [...current, template];
  }
  saveLocalTemplates(updated);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('task_templates').upsert({
        id: template.id.startsWith('template-') ? undefined : template.id,
        name: template.name,
        order_index: template.order_index,
        is_active: template.is_active,
        category: template.category,
      });
    } catch (e) {
      console.warn('Failed to save template to Supabase:', e);
    }
  }
  return updated;
}

export async function deleteTemplate(id: string, name: string): Promise<TaskTemplate[]> {
  const current = getLocalTemplates();
  const updated = current.filter((t) => t.id !== id && t.name !== name);
  saveLocalTemplates(updated);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('task_templates').delete().eq('name', name);
    } catch (e) {
      console.warn('Failed to delete template from Supabase:', e);
    }
  }
  return updated;
}

// Convenient alias for fetching logs of the active user or single user
export async function fetchDailyLogs(
  date: string,
  templates: TaskTemplate[],
  employeeId: string = 'SUPERVISOR'
): Promise<DailyLogItem[]> {
  return fetchDailyLogsForEmployee(date, employeeId, templates);
}

export async function fetchDailyLogsForEmployee(
  date: string,
  employeeId: string,
  templates: TaskTemplate[]
): Promise<DailyLogItem[]> {
  const supabase = getSupabaseClient();
  let loadedLogs: DailyLogItem[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('date', date)
        .eq('employee_id', employeeId)
        .order('order_index', { ascending: true });

      if (!error && data && data.length > 0) {
        loadedLogs = data as DailyLogItem[];
      }
    } catch (e) {
      console.warn('Error fetching daily logs from Supabase for employee:', e);
    }
  }

  // Fallback to local storage
  if (loadedLogs.length === 0) {
    loadedLogs = getLocalDailyLogs(date, employeeId);
  }

  // If Jahid Hasan Akand (73 operational workflow tasks)
  if (employeeId === 'JAHID') {
    if (loadedLogs.length === 0) {
      loadedLogs = ALL_WORKFLOW_TASKS.map((task) => ({
        id: `${date}-${employeeId}-${task.id || task.code}`,
        date,
        employee_id: employeeId,
        task_name: task.name,
        status: 'pending',
        reason_for_pending: '',
        order_index: task.order,
        completed_at: null,
      }));
      saveLocalDailyLogs(date, loadedLogs, employeeId);
    } else {
      const existingNames = new Set(loadedLogs.map((l) => l.task_name));
      const missingTasks = ALL_WORKFLOW_TASKS.filter((t) => !existingNames.has(t.name));
      if (missingTasks.length > 0) {
        const addedLogs: DailyLogItem[] = missingTasks.map((task) => ({
          id: `${date}-${employeeId}-${task.id || task.code}`,
          date,
          employee_id: employeeId,
          task_name: task.name,
          status: 'pending',
          reason_for_pending: '',
          order_index: task.order,
          completed_at: null,
        }));
        loadedLogs = [...loadedLogs, ...addedLogs].sort((a, b) => a.order_index - b.order_index);
        saveLocalDailyLogs(date, loadedLogs, employeeId);
      }
    }
    return loadedLogs;
  }

  // If still empty, initialize from active templates
  if (loadedLogs.length === 0) {
    const activeTemplates = templates.filter((t) => t.is_active);
    loadedLogs = activeTemplates.map((template) => ({
      id: `${date}-${employeeId}-${template.id || template.name}`,
      date,
      employee_id: employeeId,
      task_name: template.name,
      status: 'pending',
      reason_for_pending: '',
      order_index: template.order_index,
      completed_at: null,
    }));
    saveLocalDailyLogs(date, loadedLogs, employeeId);
  } else {
    // Merge missing templates if any
    const existingNames = new Set(loadedLogs.map((l) => l.task_name));
    const missingTemplates = templates.filter((t) => t.is_active && !existingNames.has(t.name));
    if (missingTemplates.length > 0) {
      const addedLogs: DailyLogItem[] = missingTemplates.map((template) => ({
        id: `${date}-${employeeId}-${template.id || template.name}`,
        date,
        employee_id: employeeId,
        task_name: template.name,
        status: 'pending',
        reason_for_pending: '',
        order_index: template.order_index,
        completed_at: null,
      }));
      loadedLogs = [...loadedLogs, ...addedLogs].sort((a, b) => a.order_index - b.order_index);
      saveLocalDailyLogs(date, loadedLogs, employeeId);
    }
  }

  return loadedLogs;
}

export async function upsertDailyLog(log: DailyLogItem): Promise<void> {
  // Always update local cache immediately
  const existingLocal = getLocalDailyLogs(log.date, log.employee_id);
  const updatedLocal = existingLocal.map((item) =>
    item.task_name === log.task_name ? log : item
  );
  if (!updatedLocal.some((item) => item.task_name === log.task_name)) {
    updatedLocal.push(log);
  }
  saveLocalDailyLogs(log.date, updatedLocal, log.employee_id);

  // Sync to Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('daily_logs').upsert(
        {
          date: log.date,
          employee_id: log.employee_id,
          task_name: log.task_name,
          status: log.status,
          reason_for_pending: log.reason_for_pending || '',
          order_index: log.order_index,
          completed_at: log.completed_at || null,
        },
        { onConflict: 'date,employee_id,task_name' }
      );
    } catch (e) {
      console.warn('Failed to upsert to Supabase:', e);
    }
  }
}

// Fetch comparative progress for all employees for the supervisor
export async function fetchAllEmployeesComparative(
  date: string,
  employees: Employee[],
  templates: TaskTemplate[]
): Promise<EmployeeDailyProgress[]> {
  const results: EmployeeDailyProgress[] = [];

  for (const emp of employees) {
    const logs = await fetchDailyLogsForEmployee(date, emp.employee_id, templates);
    const total = logs.length;
    const done = logs.filter((l) => l.status === 'done').length;
    const pending = total - done;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;
    const reasons = logs
      .filter((l) => l.status === 'pending' && l.reason_for_pending?.trim())
      .map((l) => ({ task: l.task_name, reason: l.reason_for_pending }));

    results.push({
      employee: emp,
      totalTasks: total,
      doneTasks: done,
      pendingTasks: pending,
      completionRate: rate,
      isSubmitted: done > 0 || reasons.length > 0,
      pendingReasons: reasons,
    });
  }

  return results;
}

// Call AI Strategic Analysis endpoint
export async function requestAiAnalysis(payload: {
  date: string;
  employeesSummary: any[];
  teamStats: any;
}): Promise<string> {
  try {
    const response = await fetch('/api/ai-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.analysis) {
        return data.analysis;
      }
    }
  } catch (err) {
    console.warn('Direct AI endpoint unavailable, using built-in strategic engine:', err);
  }

  // Client-side fallback analytical engine
  const avg = payload.teamStats?.averageCompletion || 0;
  const pendingCount = payload.teamStats?.totalPendingItems || 0;
  const issues = payload.employeesSummary
    .flatMap((e: any) => (e.pendingReasons || []).map((r: any) => `**${e.name} (${e.role})**: ${r.task} — _${r.reason}_`))
    .slice(0, 6);

  return `### 📊 Overall Operational Performance & Overview
- **Date**: ${payload.date}
- **Team Overall Progress**: On average **${avg}%** completed across the active scope.
- **Active Personnel**: Total ${payload.teamStats?.activeStaff || payload.employeesSummary.length} active staff on duty.

---

### ⚠️ Critical Bottlenecks & Pending Accountability
- Total **${pendingCount} task(s)** currently pending across assigned roles.
${
  issues.length > 0
    ? issues.map((i: string) => `- 🔍 ${i}`).join('\n')
    : '- No specific delay reasons documented, though some tasks remain in progress.'
}

---

### 🎯 Actionable Supervisory Directives
1. **Immediate Follow-up**: Conduct rapid check-ins with team members whose completion is under 70% to unblock bottlenecks.
2. **Reconciliation & Lock**: Ensure cash closing, bKash MR, and daily receipts are reconciled by 5:00 PM to avoid carrying work into the next shift.
3. **Barrier Resolution**: Differentiate between system-dependent blockers and workload volume issues to allocate immediate support.

---

### 🔄 Role Allocation & Workload Balancing
- **Workload Balancing**: If accounting or front desk traffic is unusually heavy, cross-assign general assistants for prompt clearance.
- **Role Optimization**: Team members consistently logging 90%+ completion should be positioned for critical tasks and operational coordination.`;
}
