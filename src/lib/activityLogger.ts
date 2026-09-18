import { ActivityLogEntry, ActivityType, DailyLogItem, Employee, BranchId } from '../types';
import { getSupabaseClient } from './supabase';

const ACTIVITY_STORAGE_PREFIX = 'qgz_cell_activity_feed_';

/**
 * Record a real-time activity event into local storage and broadcast to all listeners
 */
export function recordActivity(
  entry: Omit<ActivityLogEntry, 'id' | 'timestamp'> & { timestamp?: string }
): ActivityLogEntry {
  const date = entry.date;
  const timestamp = entry.timestamp || new Date().toISOString();
  const id = `act-${entry.employee_id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const fullEntry: ActivityLogEntry = {
    id,
    timestamp,
    ...entry,
  };

  if (typeof window !== 'undefined') {
    try {
      const key = `${ACTIVITY_STORAGE_PREFIX}${date}`;
      const existingStr = localStorage.getItem(key);
      let existing: ActivityLogEntry[] = [];
      if (existingStr) {
        try {
          existing = JSON.parse(existingStr);
        } catch {
          existing = [];
        }
      }

      // Prepend newest activity
      const updated = [fullEntry, ...existing].slice(0, 300);
      localStorage.setItem(key, JSON.stringify(updated));

      // Trigger heartbeat for multi-tab sync
      localStorage.setItem('qgz_activity_heartbeat', Date.now().toString());

      // Broadcast custom event in current window
      window.dispatchEvent(
        new CustomEvent('qgz_activity_update', {
          detail: fullEntry,
        })
      );
    } catch (e) {
      console.warn('Error saving activity event:', e);
    }
  }

  return fullEntry;
}

/**
 * Load saved activity entries from localStorage for a specific date
 */
export function getSavedActivities(date: string): ActivityLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = `${ACTIVITY_STORAGE_PREFIX}${date}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Error reading stored activities:', e);
  }
  return [];
}

/**
 * Merges explicitly recorded real-time events with all existing logs from employees
 * to ensure that all task completions and notes are present in the scrolling feed,
 * even if completed prior to this session or loaded from the database.
 */
export function buildUnifiedActivityFeed(
  date: string,
  employees: Employee[],
  allDailyLogs: DailyLogItem[]
): ActivityLogEntry[] {
  const recorded = getSavedActivities(date);
  const employeeMap = new Map<string, Employee>();
  employees.forEach((emp) => {
    employeeMap.set(emp.employee_id, emp);
  });

  const syntheticEntries: ActivityLogEntry[] = [];

  // Inspect all daily logs across employees
  for (const log of allDailyLogs) {
    if (!log || log.date !== date) continue;

    const emp = employeeMap.get(log.employee_id);
    const empName = emp ? emp.name : log.employee_id;
    const empRole = emp ? emp.role : 'staff';
    const empBranch: BranchId =
      log.branch || emp?.branch || (log.employee_id.startsWith('GB-') ? 'chowrasta' : 'rajbari');
    const avatarColor = emp?.avatar_color || '#4f46e5';

    // 1. Completed tasks
    if (log.status === 'done') {
      const ts = log.completed_at || `${date}T10:00:00.000Z`;
      syntheticEntries.push({
        id: `synth-done-${log.employee_id}-${encodeURIComponent(log.task_name)}`,
        timestamp: ts,
        type: 'task_completed',
        date,
        employee_id: log.employee_id,
        employee_name: empName,
        employee_role: empRole,
        branch: empBranch,
        avatar_color: avatarColor,
        task_name: log.task_name,
        actual_minutes: log.actual_minutes,
        time_spent_seconds: log.time_spent_seconds,
      });
    }

    // 2. Pending reasons / notes
    if (log.reason_for_pending && log.reason_for_pending.trim().length > 0) {
      const ts = log.updated_at || `${date}T11:30:00.000Z`;
      syntheticEntries.push({
        id: `synth-note-${log.employee_id}-${encodeURIComponent(log.task_name)}`,
        timestamp: ts,
        type: 'note_added',
        date,
        employee_id: log.employee_id,
        employee_name: empName,
        employee_role: empRole,
        branch: empBranch,
        avatar_color: avatarColor,
        task_name: log.task_name,
        note: log.reason_for_pending.trim(),
        actual_minutes: log.actual_minutes,
      });
    }

    // 3. Substantial time logged without done status
    if (log.status !== 'done' && log.actual_minutes && log.actual_minutes > 0) {
      syntheticEntries.push({
        id: `synth-time-${log.employee_id}-${encodeURIComponent(log.task_name)}`,
        timestamp: `${date}T12:00:00.000Z`,
        type: 'time_logged',
        date,
        employee_id: log.employee_id,
        employee_name: empName,
        employee_role: empRole,
        branch: empBranch,
        avatar_color: avatarColor,
        task_name: log.task_name,
        actual_minutes: log.actual_minutes,
        time_spent_seconds: log.time_spent_seconds,
      });
    }
  }

  // Deduplicate and combine (give precedence to recorded live entries)
  const seenKeys = new Set<string>();
  const combined: ActivityLogEntry[] = [];

  // Add recorded live events first
  for (const item of recorded) {
    const key = `${item.employee_id}|${item.task_name}|${item.type}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      combined.push(item);
    }
  }

  // Add synthetic entries if not already represented
  for (const item of syntheticEntries) {
    const key = `${item.employee_id}|${item.task_name}|${item.type}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      combined.push(item);
    }
  }

  // Sort descending by timestamp (newest first)
  combined.sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime() || 0;
    const timeB = new Date(b.timestamp).getTime() || 0;
    return timeB - timeA;
  });

  return combined;
}

/**
 * Subscribe to real-time activity changes from both window events, storage events,
 * and optional Supabase real-time channel
 */
export function subscribeToActivityFeed(
  onUpdate: (entry?: ActivityLogEntry) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<ActivityLogEntry>;
    onUpdate(customEvent.detail);
  };

  const handleStorage = (e: StorageEvent) => {
    if (
      e.key?.startsWith(ACTIVITY_STORAGE_PREFIX) ||
      e.key === 'qgz_activity_heartbeat' ||
      e.key?.includes('logs_')
    ) {
      onUpdate();
    }
  };

  window.addEventListener('qgz_activity_update', handleCustomEvent);
  window.addEventListener('storage', handleStorage);

  // Optional Supabase Realtime channel
  let supabaseChannel: any = null;
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      supabaseChannel = supabase
        .channel('daily_logs_feed_channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'daily_logs' },
          (payload: any) => {
            onUpdate();
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Supabase realtime feed subscription warning:', e);
    }
  }

  return () => {
    window.removeEventListener('qgz_activity_update', handleCustomEvent);
    window.removeEventListener('storage', handleStorage);
    if (supabaseChannel && supabase) {
      try {
        supabase.removeChannel(supabaseChannel);
      } catch {
        // ignore
      }
    }
  };
}
