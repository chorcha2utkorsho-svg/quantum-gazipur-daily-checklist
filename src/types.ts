export type TaskStatus = 'done' | 'pending';

export type UserRole =
  | 'office_assistant'     // অফিস সহকারী / সুপারভাইজার (সবকিছু পর্যবেক্ষণ, রিপোর্ট তৈরি, নিয়োগ ও পদায়ন)
  | 'front_desk'            // ফ্রন্ট ডেস্ক ও সাধারণ কার্যক্রম
  | 'accounts'              // হিসাব ও ক্যাশ ব্যবস্থাপনা
  | 'customer_service'      // গ্রাহক সেবা ও সেলস
  | 'logistics'             // লজিস্টিকস ও অফিস রক্ষণাবেক্ষণ
  | 'field_coordinator'     // মাঠ সমন্বয়কারী
  | 'general_staff';        // সাধারণ ডেস্ক কর্মকর্তা

export interface RoleInfo {
  id: UserRole;
  titleBn: string;
  titleEn: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const SYSTEM_ROLES: RoleInfo[] = [
  {
    id: 'office_assistant',
    titleBn: 'অফিস সহকারী / সুপারভাইজার',
    titleEn: 'Office Assistant / Supervisor',
    description: 'সম্পূর্ণ কার্যক্রম তত্ত্বাবধান, কর্মীদের পদায়ন/নিয়োগ, সিদ্ধান্ত গ্রহণ ও সামগ্রিক রিপোর্ট।',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
  },
  {
    id: 'front_desk',
    titleBn: 'ফ্রন্ট ডেস্ক ও অপারেশনস',
    titleEn: 'Front Desk & Operations',
    description: 'ডেস্ক সেটআপ, সকালের পরিকল্পনা, ভিজিটর ও প্রাথমিক অভ্যর্থনা কার্যক্রম।',
    badgeBg: 'bg-sky-500/10',
    badgeText: 'text-sky-400',
    badgeBorder: 'border-sky-500/30',
  },
  {
    id: 'accounts',
    titleBn: 'হিসাব ও ক্যাশ সহকারী',
    titleEn: 'Accounts & Cashier',
    description: 'বিকাশ এমআর, মোবাইল ব্যালেন্স, পেটিক্যাশ, অনুদান ও দিনের ক্যাশ ক্লোজিং।',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/30',
  },
  {
    id: 'customer_service',
    titleBn: 'গ্রাহক সেবা ও সেলস',
    titleEn: 'Customer Relations & Sales',
    description: 'সেলস আইটেম, যোগাযোগ তালিকা, ইমেইল ও গ্রাহক অনুসন্ধান ফলোআপ।',
    badgeBg: 'bg-violet-500/10',
    badgeText: 'text-violet-400',
    badgeBorder: 'border-violet-500/30',
  },
  {
    id: 'logistics',
    titleBn: 'লজিস্টিকস ও অফিস কেয়ার',
    titleEn: 'Logistics & Facility Care',
    description: 'অফিস চেক, গাছপালা যত্ন, ইকুইপমেন্ট নিরাপত্তা ও দিনশেষে লক-আপ রুটিন।',
    badgeBg: 'bg-teal-500/10',
    badgeText: 'text-teal-400',
    badgeBorder: 'border-teal-500/30',
  },
  {
    id: 'field_coordinator',
    titleBn: 'মাঠ সমন্বয়কারী',
    titleEn: 'Field Coordinator',
    description: 'মাঠ পর্যায়ের যোগাযোগ, কিউএমআইএস আপডেট ও আউটরিচ সাপোর্ট।',
    badgeBg: 'bg-orange-500/10',
    badgeText: 'text-orange-400',
    badgeBorder: 'border-orange-500/30',
  },
  {
    id: 'general_staff',
    titleBn: 'সাধারণ কর্মী / অ্যাসিস্ট্যান্ট',
    titleEn: 'General Staff',
    description: 'সাধারণ দৈনন্দিন কার্যক্রম ও অ্যাসাইনকৃত টাস্ক সম্পাদন।',
    badgeBg: 'bg-zinc-500/10',
    badgeText: 'text-zinc-300',
    badgeBorder: 'border-zinc-500/30',
  },
];

export interface Employee {
  id: string;
  employee_id: string; // Login ID, e.g. "EMP-01", "EMP-02", "SUPERVISOR"
  name: string;
  pin: string;         // Password / PIN for login
  role: UserRole;
  is_active: boolean;  // Active vs Terminated / Inactive
  phone?: string;
  joined_date: string; // YYYY-MM-DD
  notes?: string;
  avatar_color?: string;
}

export interface SessionUser {
  employee_id: string;
  name: string;
  role: UserRole;
  is_supervisor: boolean;
}

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
  employee_id: string; // ID of the employee this log belongs to
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

export interface EmployeeDailyProgress {
  employee: Employee;
  totalTasks: number;
  doneTasks: number;
  pendingTasks: number;
  completionRate: number;
  isSubmitted: boolean;
  lastUpdated?: string;
  pendingReasons: Array<{ task: string; reason: string }>;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export interface AIAnalysisResult {
  date: string;
  analysis: string;
  generated_at: string;
  source?: string;
}

export const DEFAULT_SUPERVISOR: Employee = {
  id: 'emp-supervisor',
  employee_id: 'SUPERVISOR',
  name: 'অফিস সহকারী / সুপারভাইজার (Raji Sir Team)',
  pin: '1234',
  role: 'office_assistant',
  is_active: true,
  joined_date: '2024-01-01',
  notes: 'সার্বিক সেল পরিচালনা ও সিদ্ধান্ত গ্রহণকারী কর্মকর্তা।',
  avatar_color: '#10b981',
};

export const INITIAL_EMPLOYEES: Employee[] = [
  DEFAULT_SUPERVISOR,
  {
    id: 'emp-01',
    employee_id: 'EMP-01',
    name: 'মিনা (Mina)',
    pin: '1234',
    role: 'front_desk',
    is_active: true,
    phone: '01700000001',
    joined_date: '2024-01-15',
    notes: 'ফ্রন্ট ডেস্ক ও দৈনন্দিন ২০টি প্রধান কাজের দায়িত্বপ্রাপ্ত কর্মী।',
    avatar_color: '#38bdf8',
  },
  {
    id: 'emp-02',
    employee_id: 'EMP-02',
    name: 'তানভীর আহমেদ',
    pin: '1234',
    role: 'accounts',
    is_active: true,
    phone: '01700000002',
    joined_date: '2024-02-01',
    notes: 'ক্যাশ ক্লোজিং, বিকাশ এমআর ও আর্থিক রেকর্ড ব্যবস্থাপক।',
    avatar_color: '#fbbf24',
  },
  {
    id: 'emp-03',
    employee_id: 'EMP-03',
    name: 'সাদিয়া তাসনিম',
    pin: '1234',
    role: 'customer_service',
    is_active: true,
    phone: '01700000003',
    joined_date: '2024-03-01',
    notes: 'সেলস আইটেম ও গ্রাহক যোগাযোগ তত্ত্বাবধায়ক।',
    avatar_color: '#a78bfa',
  },
  {
    id: 'emp-04',
    employee_id: 'EMP-04',
    name: 'মো. রফিকুল ইসলাম',
    pin: '1234',
    role: 'logistics',
    is_active: true,
    phone: '01700000004',
    joined_date: '2024-03-15',
    notes: 'অফিস চেক, গাছপালা যত্ন ও অফিস নিরাপত্তা রুটিন।',
    avatar_color: '#34d399',
  },
];

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
