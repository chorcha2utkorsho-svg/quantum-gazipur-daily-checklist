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
    nameBn: '1. Gazipur Branch',
    nameEn: 'Gazipur Branch',
    locationBn: 'Gazipur',
    tag: 'Gazipur Branch',
    color: '#10b981', // emerald
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
  },
  {
    id: 'rajbari',
    nameBn: '2. Gazipur Sadar Office',
    nameEn: 'Gazipur Sadar Office',
    locationBn: 'Gazipur Sadar',
    tag: 'Sadar Office',
    color: '#0ea5e9', // sky
    badgeBg: 'bg-sky-500/10',
    badgeText: 'text-sky-400',
    badgeBorder: 'border-sky-500/30',
  },
];

export type UserRole =
  | 'main_boss'            // Raji Sir (Central Director - Overall monitoring & policy maker for both branches)
  | 'office_assistant'     // Office Assistant / Branch In-charge (Operation oversight, reports, recruitment & deployment)
  | 'front_desk'           // Front desk & general operations
  | 'accounts'             // Accounts & cash management
  | 'customer_service'     // Customer relations & sales
  | 'logistics'            // Logistics & facility care
  | 'field_coordinator'    // Field coordinator
  | 'general_staff';       // General desk officer

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
    titleBn: 'Raji Sir (Central Director)',
    titleEn: 'Central Director (Raji Sir)',
    description: 'Central administration of 1. Gazipur Branch and 2. Gazipur Sadar Office, unified executive monitoring and strategic decisions.',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-500/40',
  },
  {
    id: 'office_assistant',
    titleBn: 'Office Assistant / Branch In-charge',
    titleEn: 'Office Assistant / Branch In-charge',
    description: 'Comprehensive operational oversight, staff assignment/recruitment, decision making, and branch reporting.',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
  },
  {
    id: 'front_desk',
    titleBn: 'Front Desk & Operations',
    titleEn: 'Front Desk & Operations',
    description: 'Desk setup, morning schedule, visitors and front office reception management.',
    badgeBg: 'bg-sky-500/10',
    badgeText: 'text-sky-400',
    badgeBorder: 'border-sky-500/30',
  },
  {
    id: 'accounts',
    titleBn: 'Accounts & Cashier',
    titleEn: 'Accounts & Cashier',
    description: 'bKash MR, mobile balance, petty cash, donations, and daily cash closing.',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/30',
  },
  {
    id: 'customer_service',
    titleBn: 'Customer Relations & Sales',
    titleEn: 'Customer Relations & Sales',
    description: 'Sales items, communication lists, emails, and customer inquiry follow-ups.',
    badgeBg: 'bg-violet-500/10',
    badgeText: 'text-violet-400',
    badgeBorder: 'border-violet-500/30',
  },
  {
    id: 'logistics',
    titleBn: 'Logistics & Facility Care',
    titleEn: 'Logistics & Facility Care',
    description: 'Office check, plant care, equipment safety, and end-of-day lock-up routine.',
    badgeBg: 'bg-teal-500/10',
    badgeText: 'text-teal-400',
    badgeBorder: 'border-teal-500/30',
  },
  {
    id: 'field_coordinator',
    titleBn: 'Field Coordinator',
    titleEn: 'Field Coordinator',
    description: 'Field coordination, QMIS updates, and outreach support.',
    badgeBg: 'bg-orange-500/10',
    badgeText: 'text-orange-400',
    badgeBorder: 'border-orange-500/30',
  },
  {
    id: 'general_staff',
    titleBn: 'General Staff',
    titleEn: 'General Staff',
    description: 'General daily tasks and assigned operational workflows.',
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
  approval_status?: 'pending' | 'approved' | 'rejected'; // Approval status by Raji Sir
  approved_at?: string;
  approved_by?: string;
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
  name: 'Raji Sir',
  pin: '1234',
  role: 'main_boss',
  branch: 'all',
  is_active: true,
  approval_status: 'approved',
  phone: '01700000000',
  joined_date: '2023-01-01',
  notes: 'Quantum Gazipur Cell: Central Director & Policy Maker for both Gazipur Branch and Gazipur Sadar Office.',
  avatar_color: '#f59e0b',
};

export const DEFAULT_SUPERVISOR: Employee = BOSS_RAJI_SIR;

export const INITIAL_EMPLOYEES: Employee[] = [
  // Central Director (Raji Sir)
  BOSS_RAJI_SIR,

  // 1. Gazipur Branch Staff (2 people)
  {
    id: 'emp-chow-anjuman',
    employee_id: 'GB-01',
    name: 'Anjuman Khan',
    pin: '1234',
    role: 'office_assistant',
    branch: 'chowrasta',
    is_active: true,
    approval_status: 'approved',
    phone: '01711000001',
    joined_date: '2023-05-01',
    notes: 'Gazipur Branch: 3 categories & 34 tasks (MATRIMONGL, HOME VISIT, HR - Attendance & QMIS).',
    avatar_color: '#10b981',
  },
  {
    id: 'emp-chow-mustakim',
    employee_id: 'GB-02',
    name: 'Mustakim Hosen',
    pin: '1234',
    role: 'office_assistant',
    branch: 'chowrasta',
    is_active: true,
    approval_status: 'approved',
    phone: '01711000002',
    joined_date: '2024-01-15',
    notes: 'Gazipur Branch: 7 categories & 90 tasks (MATIR BANK, ETIMAN, SADAKAION & PROGGA, OFFICE MANAGEMENT, BANKING, OUTSIDE CAMPAIGN, SHONGHODHAN).',
    avatar_color: '#38bdf8',
  },

  // 2. Gazipur Sadar Office Staff (3 people)
  {
    id: 'emp-jahid-akand',
    employee_id: 'JAHID',
    name: 'Jahid Hasan',
    pin: '1234',
    role: 'accounts',
    branch: 'rajbari',
    is_active: true,
    approval_status: 'approved',
    phone: '01711999888',
    joined_date: '2024-01-01',
    notes: 'Gazipur Sadar Office: 6 categories & 73 operational workflow tasks (BILL WORK, FUND, DONATION, PROGRAM-Inside, PROGRAM-Outside, EXPLORATION).',
    avatar_color: '#4f46e5',
  },
  {
    id: 'emp-rajb-tanjina',
    employee_id: 'SO-01',
    name: 'Tanzina Akter',
    pin: '1234',
    role: 'front_desk',
    branch: 'rajbari',
    is_active: true,
    approval_status: 'approved',
    phone: '01722000001',
    joined_date: '2024-02-01',
    notes: 'Gazipur Sadar Office: Wel-O (20 tasks) & COMMUNICATION (12 tasks) operational workflows.',
    avatar_color: '#ec4899',
  },
  {
    id: 'emp-rajb-pronoy',
    employee_id: 'SO-02',
    name: 'Pronoy Das',
    pin: '1234',
    role: 'logistics',
    branch: 'rajbari',
    is_active: true,
    approval_status: 'approved',
    phone: '01722000002',
    joined_date: '2024-03-01',
    notes: 'Gazipur Sadar Office: Logistics, facility management, and asset coordination.',
    avatar_color: '#0ea5e9',
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

export interface ActionableOptimizationStep {
  stepNumber: number;
  title: string;
  category: string;
  priority: 'critical' | 'high' | 'medium';
  problemIdentified: string;
  actionPlan: string[];
  expectedImpact: string;
  recommendedTimeSlot?: string;
}

export interface AiStrategicInsightData {
  summary: string;
  overallHealth: 'Optimal' | 'Requires Attention' | 'At Risk';
  velocityScore?: string;
  topBottleneckCategory?: string;
  actionableSteps: ActionableOptimizationStep[];
  executiveTakeaway?: string;
  quantumAffirmation?: string;
  source?: string;
  generatedAt?: string;
}

export interface ExecutiveDirective {
  id: string;
  sender_id: string;
  sender_name: string;
  target_type: 'all' | 'branch' | 'employee';
  target_id?: string; // branchId ('chowrasta' | 'rajbari') or employee_id
  target_name?: string;
  message: string;
  priority: 'urgent' | 'important' | 'normal';
  created_at: string;
  date: string;
  acknowledged_by?: string[]; // Array of employee_ids
}

export interface DailyPlannerItem {
  id: string;
  employee_id: string;
  date: string;
  timeSlot: string; // e.g. "09:00 AM - 11:00 AM"
  focusTitle: string;
  isDone: boolean;
  notes?: string;
}

export interface EmployeeDailyPlan {
  employee_id: string;
  date: string;
  priorities: string[];
  dayNotes: string;
  items: DailyPlannerItem[];
  updatedAt?: string;
}

// Client Communication & Calling Head (CRM) Types
export type CallOutcome =
  | 'positive'      // কনভার্শন পজেটিভ (আগ্রহী / অনুদান / মেডিটেশনে সম্মতি)
  | 'negative'      // নেগেটিভ (অনাগ্রহী)
  | 'no_answer'     // কল ধরে নাই / এন এ (N/A)
  | 'unreachable'   // কল রিসিভ করেনি / ব্যস্ত (Not Received)
  | 'inactive'      // ইন-অ্যাক্টিভ / বন্ধ নম্বর (Inactive)
  | 'pending';      // কল করা বাকি (Pending Call)

export interface ClientContact {
  id: string;
  name: string;
  phone: string;
  member_id?: string;
  category: 'quantum_member' | 'donor' | 'old_student' | 'well_wisher' | 'new_lead';
  category_name_bn: string;
  branch: 'chowrasta' | 'rajbari';
  assigned_to_id: string;   // Employee ID (যেমন রাজি স্যার ১০০ মেম্বার যে কর্মীকে দিয়েছেন)
  assigned_to_name: string;
  call_status: CallOutcome;
  call_notes?: string;
  conversion_amount?: number; // যদি কোনো অনুদান বা কোর্স ফি কনভার্ট হয়
  last_called_at?: string;
  date_assigned: string;
  created_at: string;
}

export interface CommunicationStats {
  total: number;
  called: number;
  pending: number;
  positiveCount: number;
  positiveRate: number;      // %
  negativeCount: number;
  negativeRate: number;      // %
  noAnswerCount: number;     // এন এ / কল ধরে নাই
  noAnswerRate: number;      // %
  unreachableCount: number;  // রিসিভ করেনি
  unreachableRate: number;   // %
  inactiveCount: number;     // ইন-অ্যাক্টিভ
  inactiveRate: number;      // %
}


