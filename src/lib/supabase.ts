import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DailyLogItem, PRE_SEEDED_TASKS, TaskTemplate } from '../types';

// Default Supabase project configuration for Quantum Gazipur cell
const DEFAULT_SUPABASE_URL = 'https://wftxugyhmtfwljtddmt.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdHh1Z3lobXRmandsanRkZG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MzU0MjksImV4cCI6MjEwNDExMTQyOX0.ylkheh4n9Hg1vpI_OAnsq7mXnO4Zv2Dp0LcO2eoT52E';

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
    const { data, error } = await tempClient.from('daily_logs').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's connected but schema needs to be run
      if (error.message?.includes('relation "public.daily_logs" does not exist') || error.code === '42P01') {
        return { 
          success: true, 
          message: 'Connected to Supabase! Note: Please run the SQL schema migration to create the daily_logs table.' 
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed. Please verify the URL and Anon Key.' };
  }
}

// Local Storage Fallback helpers
const STORAGE_PREFIX = 'mina_checklist_';

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

  // Pre-seed the 20 tasks
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

export function getLocalDailyLogs(date: string): DailyLogItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`${STORAGE_PREFIX}logs_${date}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return [];
}

export function saveLocalDailyLogs(date: string, logs: DailyLogItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_PREFIX}logs_${date}`, JSON.stringify(logs));
}

// ==========================================
// Data Access API (Syncs with Supabase if connected, otherwise uses Local Storage)
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
        // Cache to local as well
        saveLocalTemplates(data);
        return data;
      }
    } catch (e) {
      console.warn('Error fetching task templates from Supabase, using local fallback:', e);
    }
  }
  return getLocalTemplates();
}

export async function fetchDailyLogs(date: string, templates: TaskTemplate[]): Promise<DailyLogItem[]> {
  const supabase = getSupabaseClient();
  let loadedLogs: DailyLogItem[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('date', date)
        .order('order_index', { ascending: true });

      if (!error && data && data.length > 0) {
        loadedLogs = data as DailyLogItem[];
      }
    } catch (e) {
      console.warn('Error fetching daily logs from Supabase:', e);
    }
  }

  // If no logs from Supabase, try local storage
  if (loadedLogs.length === 0) {
    loadedLogs = getLocalDailyLogs(date);
  }

  // If still no logs for this date (e.g. fresh day or daily reset), construct from active task templates!
  if (loadedLogs.length === 0) {
    const activeTemplates = templates.filter((t) => t.is_active);
    loadedLogs = activeTemplates.map((template) => ({
      id: `${date}-${template.id || template.name}`,
      date,
      task_name: template.name,
      status: 'pending',
      reason_for_pending: '',
      order_index: template.order_index,
      completed_at: null,
    }));
    // Save to local
    saveLocalDailyLogs(date, loadedLogs);
  } else {
    // Ensure all active templates are present in loaded logs (e.g., if a new task was added)
    const existingNames = new Set(loadedLogs.map((l) => l.task_name));
    const missingTemplates = templates.filter((t) => t.is_active && !existingNames.has(t.name));
    if (missingTemplates.length > 0) {
      const addedLogs: DailyLogItem[] = missingTemplates.map((template) => ({
        id: `${date}-${template.id || template.name}`,
        date,
        task_name: template.name,
        status: 'pending',
        reason_for_pending: '',
        order_index: template.order_index,
        completed_at: null,
      }));
      loadedLogs = [...loadedLogs, ...addedLogs].sort((a, b) => a.order_index - b.order_index);
      saveLocalDailyLogs(date, loadedLogs);
    }
  }

  return loadedLogs;
}

export async function upsertDailyLog(log: DailyLogItem): Promise<void> {
  // Always update local cache first for instant optimistic response
  const existingLocal = getLocalDailyLogs(log.date);
  const updatedLocal = existingLocal.map((item) => (item.task_name === log.task_name ? log : item));
  if (!updatedLocal.some((item) => item.task_name === log.task_name)) {
    updatedLocal.push(log);
  }
  saveLocalDailyLogs(log.date, updatedLocal);

  // Sync to Supabase if connected
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('daily_logs').upsert(
        {
          date: log.date,
          task_name: log.task_name,
          status: log.status,
          reason_for_pending: log.reason_for_pending || '',
          order_index: log.order_index,
          completed_at: log.completed_at || null,
        },
        { onConflict: 'date,task_name' }
      );
    } catch (e) {
      console.warn('Failed to upsert to Supabase:', e);
    }
  }
}

export async function saveTemplate(template: TaskTemplate): Promise<TaskTemplate[]> {
  const current = getLocalTemplates();
  let updated: TaskTemplate[];
  const index = current.findIndex((t) => t.id === template.id || t.name === template.name);

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
        category: template.category || 'Operations',
      });
    } catch (e) {
      console.warn('Error saving template to Supabase:', e);
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
      console.warn('Error deleting template from Supabase:', e);
    }
  }
  return updated;
}
