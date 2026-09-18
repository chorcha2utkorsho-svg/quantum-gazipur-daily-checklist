/**
 * Productivity Goal Tracker utilities and storage.
 * Tracks daily expected productivity threshold (% completion or completed task count),
 * notifies the employee with sound, celebratory feedback, and persists target preferences.
 */

export interface ProductivityGoalConfig {
  employeeId: string;
  targetType: 'percentage' | 'tasks_count';
  thresholdValue: number; // e.g., 80 for 80% or 10 for 10 tasks
  enableAudioNotification: boolean;
  enableCelebration: boolean;
  dailyGoalNote?: string;
}

export interface GoalAchievementRecord {
  employeeId: string;
  date: string; // YYYY-MM-DD
  achievedAt: string; // ISO timestamp
  thresholdValue: number;
  targetType: 'percentage' | 'tasks_count';
  achievedPercentage: number;
  achievedTasks: number;
  totalTasks: number;
  acknowledged: boolean;
}

const STORAGE_KEY_GOALS = 'qgz_productivity_goals_config_v1';
const STORAGE_KEY_ACHIEVEMENTS = 'qgz_productivity_goal_achievements_v1';

// Default daily expected productivity threshold is 80% completion (standard high-efficiency benchmark)
export const DEFAULT_PRODUCTIVITY_THRESHOLD = 80;

/**
 * Get productivity goal configuration for an employee
 */
export function getProductivityGoalConfig(employeeId: string): ProductivityGoalConfig {
  if (typeof window === 'undefined') {
    return {
      employeeId,
      targetType: 'percentage',
      thresholdValue: DEFAULT_PRODUCTIVITY_THRESHOLD,
      enableAudioNotification: true,
      enableCelebration: true,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_GOALS);
    if (raw) {
      const allConfigs = JSON.parse(raw);
      if (allConfigs && allConfigs[employeeId]) {
        return allConfigs[employeeId];
      }
    }
  } catch (e) {
    console.error('Failed to read productivity goal config:', e);
  }

  return {
    employeeId,
    targetType: 'percentage',
    thresholdValue: DEFAULT_PRODUCTIVITY_THRESHOLD,
    enableAudioNotification: true,
    enableCelebration: true,
    dailyGoalNote: 'Standard Daily Productivity Target',
  };
}

/**
 * Save productivity goal configuration for an employee
 */
export function saveProductivityGoalConfig(config: ProductivityGoalConfig): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GOALS);
    const allConfigs = raw ? JSON.parse(raw) : {};
    allConfigs[config.employeeId] = config;
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(allConfigs));

    // Dispatch event so all components react
    window.dispatchEvent(
      new CustomEvent('qgz_productivity_goal_changed', { detail: config })
    );
  } catch (e) {
    console.error('Failed to save productivity goal config:', e);
  }
}

/**
 * Get recorded achievements for employee and date
 */
export function getGoalAchievement(employeeId: string, date: string): GoalAchievementRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
    if (!raw) return null;
    const all: Record<string, GoalAchievementRecord> = JSON.parse(raw);
    const key = `${employeeId}_${date}`;
    return all[key] || null;
  } catch (e) {
    return null;
  }
}

/**
 * Check if goal threshold has been achieved based on current progress
 */
export function checkGoalAchievement(
  employeeId: string,
  date: string,
  doneCount: number,
  totalTasks: number,
  config?: ProductivityGoalConfig
): boolean {
  if (totalTasks === 0) return false;
  const cfg = config || getProductivityGoalConfig(employeeId);
  const currentPercentage = Math.round((doneCount / totalTasks) * 100);

  if (cfg.targetType === 'percentage') {
    return currentPercentage >= cfg.thresholdValue;
  }
  return doneCount >= cfg.thresholdValue;
}

/**
 * Record that goal was reached today. If already recorded today, returns null.
 */
export function recordGoalAchievement(
  recordOrEmployeeId: GoalAchievementRecord | string,
  date?: string,
  doneCount?: number,
  totalTasks?: number,
  config?: ProductivityGoalConfig
): GoalAchievementRecord | null {
  if (typeof window === 'undefined') return null;

  let record: GoalAchievementRecord;

  if (typeof recordOrEmployeeId === 'string') {
    const employeeId = recordOrEmployeeId;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const cfg = config || getProductivityGoalConfig(employeeId);
    const completed = doneCount || 0;
    const total = totalTasks || 1;
    const pct = Math.round((completed / total) * 100);

    // If already achieved and recorded today, don't duplicate
    const existing = getGoalAchievement(employeeId, targetDate);
    if (existing) {
      return null;
    }

    record = {
      employeeId,
      date: targetDate,
      achievedAt: new Date().toISOString(),
      thresholdValue: cfg.thresholdValue,
      targetType: cfg.targetType,
      achievedPercentage: pct,
      achievedTasks: completed,
      totalTasks: total,
      acknowledged: false,
    };
  } else {
    record = recordOrEmployeeId;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
    const all: Record<string, GoalAchievementRecord> = raw ? JSON.parse(raw) : {};
    const key = `${record.employeeId}_${record.date}`;
    all[key] = record;
    localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(all));

    window.dispatchEvent(
      new CustomEvent('qgz_goal_achieved', { detail: record })
    );

    return record;
  } catch (e) {
    console.error('Failed to record goal achievement:', e);
    return null;
  }
}

/**
 * Mark achievement acknowledged so user isn't re-notified repeatedly
 */
export function acknowledgeGoalNotification(employeeId: string, date: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
    if (!raw) return;
    const all: Record<string, GoalAchievementRecord> = JSON.parse(raw);
    const key = `${employeeId}_${date}`;
    if (all[key]) {
      all[key].acknowledged = true;
      localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(all));
    }
  } catch (e) {
    // ignore
  }
}

/**
 * Play an uplifting chime sound when goal threshold is reached
 */
export function playGoalReachedSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Pleasant three-tone ascending fanfare (C5 -> E5 -> G5)
    const tones = [
      { freq: 523.25, time: 0, duration: 0.18 }, // C5
      { freq: 659.25, time: 0.16, duration: 0.2 }, // E5
      { freq: 783.99, time: 0.34, duration: 0.35 }, // G5
      { freq: 1046.5, time: 0.52, duration: 0.5 }, // C6
    ];

    tones.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      gain.gain.setValueAtTime(0.01, ctx.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + duration);
    });
  } catch (e) {
    // Audio playback can fail if user hasn't interacted yet
  }
}
