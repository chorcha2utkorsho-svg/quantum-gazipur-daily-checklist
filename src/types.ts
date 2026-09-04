export type TaskStatus = 'done' | 'pending';

export type BranchId = 'all' | 'chowrasta' | 'rajbari';

export interface BranchInfo {
  id: BranchId;
  nameBn: string;
  nameEn: string;
  locationBn: string;
  tag: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const BRANCHES: BranchInfo[] = [
  {
    id: 'chowrasta',
    nameBn: '১। চৌরাস্তা ব্রাঞ্চ',
    nameEn: 'Chowrasta Branch',
    locationBn: 'গাজীপুর চৌরাস্তা মোড়',
    tag: 'Chowrasta',
    color: '#10b981', // emerald
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
  },
  {
    id: 'rajbari',
    nameBn: '২। রাজবাড়ি ব্রাঞ্চ',
    nameEn: 'Rajbari Branch',
    locationBn: 'গাজীপুর রাজবাড়ি রোড',
    tag: 'Rajbari',
    color: '#0ea5e9', // sky
    badgeBg: 'bg-sky-500/10',
    badgeText: 'text-sky-400',
    badgeBorder: 'border-sky-500/30',
  },
];

export type UserRole =
  | 'main_boss'            // রাজি স্যার (সার্বিক তত্ত্বাবধায়ক - উভয় ব্রাঞ্চের সার্বিক পর্যবেক্ষণ ও নীতি নির্ধারক)
  | 'office_assistant'     // অফিস সহকারী / ইনচার্জ (ব্রাঞ্চ কার্যক্রম তত্ত্বাবধান, রিপোর্ট তৈরি, নিয়োগ ও পদায়ন)
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
    id: 'main_boss',
    titleBn: 'রাজি স্যার (সার্বিক তত্ত্বাবধায়ক)',
    titleEn: 'Central Director (Raji Sir)',
    description: 'চৌরাস্তা ও রাজবাড়ি উভয় ব্রাঞ্চের কেন্দ্রীয় নিয়ন্ত্রণ, এক নজরে সার্বিক তদারকি ও নির্বাহী সিদ্ধান্ত গ্রহণ।',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-500/40',
  },
  {
    id: 'office_assistant',
    titleBn: 'অফিস সহকারী / ব্রাঞ্চ ইনচার্জ',
    titleEn: 'Office Assistant / Branch In-charge',
    description: 'সম্পূর্ণ কার্যক্রম তত্ত্বাবধান, কর্মীদের পদায়ন/নিয়োগ, সিদ্ধান্ত গ্রহণ ও ব্রাঞ্চ রিপোর্ট।',
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
  employee_id: string; // Login ID, e.g. "RAJI_SIR", "SUP-CHOW", "EMP-01"
  name: string;
  pin: string;         // Password / PIN for login
  role: UserRole;
  branch: BranchId;    // 'chowrasta' | 'rajbari' | 'all'
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
  branch: BranchId;
  is_supervisor: boolean;
  is_boss: boolean;
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
  branch?: BranchId;
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

export interface BranchSummaryStats {
  branchId: BranchId;
  nameBn: string;
  activeStaffCount: number;
  totalTasks: number;
  doneTasks: number;
  pendingTasks: number;
  completionRate: number;
  pendingReasonsCount: number;
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

export const BOSS_RAJI_SIR: Employee = {
  id: 'emp-raji-sir-boss',
  employee_id: 'RAJI_SIR',
  name: 'রাজি স্যার',
  pin: '1234',
  role: 'main_boss',
  branch: 'all',
  is_active: true,
  phone: '01700000000',
  joined_date: '2023-01-01',
  notes: 'কোয়ান্টাম গাজীপুর সেল: চৌরাস্তা ও রাজবাড়ি উভয় ব্রাঞ্চের সার্বিক প্রধান ও নীতিনির্ধারক।',
  avatar_color: '#f59e0b',
};

export const DEFAULT_SUPERVISOR: Employee = BOSS_RAJI_SIR;

export const INITIAL_EMPLOYEES: Employee[] = [
  // সার্বিক তত্ত্বাবধায়ক (রাজি স্যার)
  BOSS_RAJI_SIR,

  // ১। চৌরাস্তা ব্রাঞ্চ টিম (Chowrasta Branch Staff)
  {
    id: 'emp-chow-sup',
    employee_id: 'SUP-CHOW',
    name: 'মিজানুর রহমান (ইনচার্জ - চৌরাস্তা)',
    pin: '1234',
    role: 'office_assistant',
    branch: 'chowrasta',
    is_active: true,
    phone: '01711000001',
    joined_date: '2023-05-01',
    notes: 'চৌরাস্তা ব্রাঞ্চের সার্বিক কার্যক্রম পরিচালনা ও তত্ত্বাবধান।',
    avatar_color: '#10b981',
  },
  {
    id: 'emp-chow-01',
    employee_id: 'CR-01',
    name: 'মিনা (Mina - ফ্রন্ট ডেস্ক)',
    pin: '1234',
    role: 'front_desk',
    branch: 'chowrasta',
    is_active: true,
    phone: '01711000002',
    joined_date: '2024-01-15',
    notes: 'চৌরাস্তা ব্রাঞ্চের ফ্রন্ট ডেস্ক ও রিসেপশন পরিচালনা।',
    avatar_color: '#38bdf8',
  },
  {
    id: 'emp-jahid-akand',
    employee_id: 'JAHID',
    name: 'জাহিদ হাসান আকন্দ',
    pin: '1234',
    role: 'accounts',
    branch: 'chowrasta',
    is_active: true,
    phone: '01711999888',
    joined_date: '2024-01-01',
    notes: 'একাউন্টস ও অপারেশনাল ওয়ার্কফ্লো — ৬টি ক্যাটাগরি ও ৭৩টি কার্যতালিকা বিশেষজ্ঞ।',
    avatar_color: '#4f46e5',
  },
  {
    id: 'emp-chow-02',
    employee_id: 'CR-02',
    name: 'তানভীর আহমেদ (হিসাব)',
    pin: '1234',
    role: 'accounts',
    branch: 'chowrasta',
    is_active: true,
    phone: '01711000003',
    joined_date: '2024-02-01',
    notes: 'চৌরাস্তা ব্রাঞ্চের ক্যাশ ক্লোজিং, বিকাশ এমআর ও হিসাব রেকর্ড।',
    avatar_color: '#fbbf24',
  },
  {
    id: 'emp-chow-03',
    employee_id: 'CR-03',
    name: 'সাদিয়া তাসনিম (কাস্টমার সার্ভিস)',
    pin: '1234',
    role: 'customer_service',
    branch: 'chowrasta',
    is_active: true,
    phone: '01711000004',
    joined_date: '2024-03-01',
    notes: 'চৌরাস্তা ব্রাঞ্চের সেলস আইটেম ও গ্রাহক যোগাযোগ তত্ত্বাবধায়ক।',
    avatar_color: '#a78bfa',
  },
  {
    id: 'emp-chow-04',
    employee_id: 'CR-04',
    name: 'মো. রফিকুল ইসলাম (লজিস্টিকস)',
    pin: '1234',
    role: 'logistics',
    branch: 'chowrasta',
    is_active: true,
    phone: '01711000005',
    joined_date: '2024-03-15',
    notes: 'চৌরাস্তা ব্রাঞ্চের অফিস চেক, গাছপালা ও নিরাপত্তা ব্যবস্থাপনা।',
    avatar_color: '#34d399',
  },

  // ২। রাজবাড়ি ব্রাঞ্চ টিম (Rajbari Branch Staff)
  {
    id: 'emp-rajb-sup',
    employee_id: 'SUP-RAJB',
    name: 'ফারহানা ইয়াসমিন (ইনচার্জ - রাজবাড়ি)',
    pin: '1234',
    role: 'office_assistant',
    branch: 'rajbari',
    is_active: true,
    phone: '01722000001',
    joined_date: '2023-06-01',
    notes: 'রাজবাড়ি ব্রাঞ্চের সার্বিক কার্যক্রম পরিচালনা ও তত্ত্বাবধান।',
    avatar_color: '#0ea5e9',
  },
  {
    id: 'emp-rajb-01',
    employee_id: 'RB-01',
    name: 'কবীর হোসেন (ফ্রন্ট ডেস্ক)',
    pin: '1234',
    role: 'front_desk',
    branch: 'rajbari',
    is_active: true,
    phone: '01722000002',
    joined_date: '2024-01-20',
    notes: 'রাজবাড়ি ব্রাঞ্চের ফ্রন্ট ডেস্ক ও ভিজিটর অভ্যর্থনা।',
    avatar_color: '#60a5fa',
  },
  {
    id: 'emp-rajb-02',
    employee_id: 'RB-02',
    name: 'নুসরাত জাহান (হিসাব)',
    pin: '1234',
    role: 'accounts',
    branch: 'rajbari',
    is_active: true,
    phone: '01722000003',
    joined_date: '2024-02-10',
    notes: 'রাজবাড়ি ব্রাঞ্চের ক্যাশ ক্লোজিং, অনুদান ও ব্যালেন্স ফলোআপ।',
    avatar_color: '#f59e0b',
  },
  {
    id: 'emp-rajb-03',
    employee_id: 'RB-03',
    name: 'আলমগীর কবীর (কাস্টমার সার্ভিস)',
    pin: '1234',
    role: 'customer_service',
    branch: 'rajbari',
    is_active: true,
    phone: '01722000004',
    joined_date: '2024-03-05',
    notes: 'রাজবাড়ি সেলস আইটেম, কো-অর্ডিনেশন ও যোগাযোগ লিস্ট।',
    avatar_color: '#c084fc',
  },
  {
    id: 'emp-rajb-04',
    employee_id: 'RB-04',
    name: 'শরিফুল ইসলাম (লজিস্টিকস)',
    pin: '1234',
    role: 'logistics',
    branch: 'rajbari',
    is_active: true,
    phone: '01722000005',
    joined_date: '2024-03-20',
    notes: 'রাজবাড়ি ব্রাঞ্চের ইকুইপমেন্ট সুরক্ষা ও অফিস ফ্যাসিলিটি কেয়ার।',
    avatar_color: '#2dd4bf',
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
