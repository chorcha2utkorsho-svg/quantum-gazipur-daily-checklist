export type TaskStatus = 'done' | 'pending';

export interface TaskTemplate {
  id: string;
  name: string;
  order_index: number;
  is_active: boolean;
  category?: string;
}

export interface DailyLogItem {
  id: string;
  date: string; // YYYY-MM-DD
  task_name: string;
  status: TaskStatus;
  reason_for_pending: string;
  order_index: number;
  completed_at?: string | null;
  updated_at?: string;
}

export interface DailySummaryStats {
  total: number;
  done: number;
  pending: number;
  percentage: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export const PRE_SEEDED_TASKS: Array<{ name: string; category: string; order: number }> = [
  { name: 'Desk Set-up', category: 'Morning Routine', order: 1 },
  { name: 'Meditation', category: 'Wellness & Focus', order: 2 },
  { name: 'Equipments', category: 'Hardware & Tools', order: 3 },
  { name: 'Sales Item', category: 'Commercial', order: 4 },
  { name: 'Entertainment', category: 'Atmosphere', order: 5 },
  { name: 'Office Check', category: 'Facility Check', order: 6 },
  { name: 'Plant Check', category: 'Environment', order: 7 },
  { name: 'Communication List', category: 'Coordination', order: 8 },
  { name: 'Bkash MR', category: 'Financial Reconciliation', order: 9 },
  { name: 'Mobile Balance', category: 'Communication', order: 10 },
  { name: 'E-mail', category: 'Inbox Management', order: 11 },
  { name: 'QMIS', category: 'Quality & Management System', order: 12 },
  { name: 'Donation', category: 'Corporate Social', order: 13 },
  { name: 'Cash Closing', category: 'Financial Reconciliation', order: 14 },
  { name: 'Equipment Closing', category: 'Hardware & Security', order: 15 },
  { name: 'Mobile Placing', category: 'Asset Safety', order: 16 },
  { name: 'Information Update', category: 'Records & Data', order: 17 },
  { name: 'Log Update', category: 'Daily Logs', order: 18 },
  { name: 'Report', category: 'Reporting', order: 19 },
  { name: 'Planing', category: 'Next Day Strategy', order: 20 },
];
