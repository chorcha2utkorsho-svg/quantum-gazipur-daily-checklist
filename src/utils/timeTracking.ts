// Time tracking utilities for workflow tasks

export interface TimeComparison {
  status: 'faster' | 'on_time' | 'over_time' | 'not_started';
  actualMinutes: number;
  estimatedMinutes: number;
  diffMinutes: number; // actual - estimated (negative is faster)
  percentage: number;
  label: string;
  badgeClass: string;
}

/**
 * Formats seconds into mm:ss or hh:mm:ss
 */
export function formatSecondsToTimer(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '00:00';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Formats minutes into human readable duration (e.g. "45m", "1h 30m")
 */
export function formatMinutes(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return '0m';
  const hrs = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);

  if (hrs > 0 && mins > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (hrs > 0) {
    return `${hrs}h`;
  }
  return `${mins}m`;
}

/**
 * Compare actual time spent vs estimated minutes
 */
export function compareActualVsEstimated(
  actualMinutes: number | undefined,
  estimatedMinutes: number = 30
): TimeComparison {
  if (actualMinutes === undefined || actualMinutes === null || actualMinutes <= 0) {
    return {
      status: 'not_started',
      actualMinutes: 0,
      estimatedMinutes,
      diffMinutes: -estimatedMinutes,
      percentage: 0,
      label: `Est: ${estimatedMinutes}m`,
      badgeClass: 'bg-white/5 text-slate-400 border-white/10',
    };
  }

  const roundedActual = Math.round(actualMinutes * 10) / 10;
  const diff = roundedActual - estimatedMinutes;
  const percentage = Math.round((roundedActual / estimatedMinutes) * 100);

  if (diff < 0) {
    const saved = Math.abs(Math.round(diff));
    return {
      status: 'faster',
      actualMinutes: roundedActual,
      estimatedMinutes,
      diffMinutes: diff,
      percentage,
      label: `-${saved}m faster (${percentage}%)`,
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    };
  }

  if (diff === 0) {
    return {
      status: 'on_time',
      actualMinutes: roundedActual,
      estimatedMinutes,
      diffMinutes: 0,
      percentage: 100,
      label: `Exact target (100%)`,
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    };
  }

  // Overtime
  const over = Math.round(diff);
  return {
    status: 'over_time',
    actualMinutes: roundedActual,
    estimatedMinutes,
    diffMinutes: diff,
    percentage,
    label: `+${over}m overtime (${percentage}%)`,
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  };
}
