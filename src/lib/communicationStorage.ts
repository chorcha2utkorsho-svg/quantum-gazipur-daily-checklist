import { ClientContact, CallOutcome, CommunicationStats } from '../types';

const CONTACTS_STORAGE_KEY = 'qgz_client_contacts_v2';

// Seed sample contacts representing members, donors, and old students
export const SEED_CONTACTS: ClientContact[] = [
  // 1. Gazipur Branch Contacts assigned to GB-01 (Anjuman Khan)
  {
    id: 'cnt-001',
    name: 'Md. Rafiqul Islam',
    phone: '01712-345678',
    member_id: 'QM-10294',
    category: 'quantum_member',
    category_name_bn: 'Quantum Member',
    branch: 'chowrasta',
    assigned_to_id: 'GB-01',
    assigned_to_name: 'Anjuman Khan',
    call_status: 'positive',
    call_notes: 'Will attend program and confirmed monthly contribution.',
    conversion_amount: 1000,
    last_called_at: '2026-09-11 10:30 AM',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },
  {
    id: 'cnt-002',
    name: 'Farhana Ahmed',
    phone: '01911-889922',
    member_id: 'DS-2041',
    category: 'old_student',
    category_name_bn: 'Old Student',
    branch: 'chowrasta',
    assigned_to_id: 'GB-01',
    assigned_to_name: 'Anjuman Khan',
    call_status: 'positive',
    call_notes: 'Interested in registering for the upcoming yoga course.',
    conversion_amount: 500,
    last_called_at: '2026-09-11 11:15 AM',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },
  {
    id: 'cnt-003',
    name: 'Abdul Kader',
    phone: '01819-556677',
    member_id: 'QM-08761',
    category: 'donor',
    category_name_bn: 'Earthen Bank Donor',
    branch: 'chowrasta',
    assigned_to_id: 'GB-01',
    assigned_to_name: 'Anjuman Khan',
    call_status: 'no_answer',
    call_notes: 'Call not answered (N/A), rang 3 times. Need to call again.',
    last_called_at: '2026-09-11 11:45 AM',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },
  {
    id: 'cnt-004',
    name: 'Selina Parveen',
    phone: '01671-223344',
    member_id: 'QM-11002',
    category: 'quantum_member',
    category_name_bn: 'Quantum Member',
    branch: 'chowrasta',
    assigned_to_id: 'GB-01',
    assigned_to_name: 'Anjuman Khan',
    call_status: 'unreachable',
    call_notes: 'Phone busy, could not establish connection.',
    last_called_at: '2026-09-11 12:10 PM',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },
  {
    id: 'cnt-005',
    name: 'Tarek Mahmud',
    phone: '01552-998877',
    member_id: 'LD-9021',
    category: 'new_lead',
    category_name_bn: 'New Lead',
    branch: 'chowrasta',
    assigned_to_id: 'GB-01',
    assigned_to_name: 'Anjuman Khan',
    call_status: 'negative',
    call_notes: 'Not interested at this time due to schedule conflicts.',
    last_called_at: '2026-09-11 01:00 PM',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },
  {
    id: 'cnt-006',
    name: 'Nazmul Hasan',
    phone: '01733-112233',
    member_id: 'QM-09312',
    category: 'quantum_member',
    category_name_bn: 'Quantum Member',
    branch: 'chowrasta',
    assigned_to_id: 'GB-01',
    assigned_to_name: 'Anjuman Khan',
    call_status: 'inactive',
    call_notes: 'Number found switched off or inactive.',
    last_called_at: '2026-09-11 01:20 PM',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },

  // 2. Gazipur Branch Contacts assigned to GB-02 (Mustakim Hosen)
  {
    id: 'cnt-007',
    name: 'Kamrul Ahsan Chowdhury',
    phone: '01715-443322',
    member_id: 'QM-12401',
    category: 'donor',
    category_name_bn: 'Earthen Bank Donor',
    branch: 'chowrasta',
    assigned_to_id: 'GB-02',
    assigned_to_name: 'Mustakim Hosen',
    call_status: 'positive',
    call_notes: 'Will visit branch office to submit earthen bank.',
    conversion_amount: 2500,
    last_called_at: '2026-09-11 10:00 AM',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },
  {
    id: 'cnt-008',
    name: 'Sultana Razia',
    phone: '01817-665544',
    member_id: 'QM-07821',
    category: 'quantum_member',
    category_name_bn: 'Quantum Member',
    branch: 'chowrasta',
    assigned_to_id: 'GB-02',
    assigned_to_name: 'Mustakim Hosen',
    call_status: 'positive',
    call_notes: 'Agreed to receive audio publication materials.',
    conversion_amount: 800,
    last_called_at: '2026-09-11 11:30 AM',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },
  {
    id: 'cnt-009',
    name: 'Mahbubur Rahman',
    phone: '01912-778899',
    member_id: 'OS-3310',
    category: 'old_student',
    category_name_bn: 'Old Student',
    branch: 'chowrasta',
    assigned_to_id: 'GB-02',
    assigned_to_name: 'Mustakim Hosen',
    call_status: 'pending',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },
  {
    id: 'cnt-010',
    name: 'Ayesha Siddiqua',
    phone: '01680-112299',
    member_id: 'QM-14022',
    category: 'quantum_member',
    category_name_bn: 'Quantum Member',
    branch: 'chowrasta',
    assigned_to_id: 'GB-02',
    assigned_to_name: 'Mustakim Hosen',
    call_status: 'no_answer',
    call_notes: 'Phone rang but no response (N/A).',
    last_called_at: '2026-09-11 02:00 PM',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },

  // 3. Sadar Office Contacts assigned to JAHID (Jahid Akand)
  {
    id: 'cnt-011',
    name: 'Sirajul Haque',
    phone: '01711-234567',
    member_id: 'QM-05120',
    category: 'donor',
    category_name_bn: 'Earthen Bank Donor',
    branch: 'rajbari',
    assigned_to_id: 'JAHID',
    assigned_to_name: 'Jahid Akand',
    call_status: 'positive',
    call_notes: 'Donated 5000 BDT to orphan care fund.',
    conversion_amount: 5000,
    last_called_at: '2026-09-11 09:40 AM',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },
  {
    id: 'cnt-012',
    name: 'Dr. Sanjida Islam',
    phone: '01819-334455',
    member_id: 'QM-09881',
    category: 'quantum_member',
    category_name_bn: 'Quantum Member',
    branch: 'rajbari',
    assigned_to_id: 'JAHID',
    assigned_to_name: 'Jahid Akand',
    call_status: 'positive',
    call_notes: 'Agreed to participate in blood donation campaign.',
    conversion_amount: 0,
    last_called_at: '2026-09-11 11:00 AM',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },
  {
    id: 'cnt-013',
    name: 'Md. Habibullah',
    phone: '01913-667788',
    member_id: 'QM-13204',
    category: 'quantum_member',
    category_name_bn: 'Quantum Member',
    branch: 'rajbari',
    assigned_to_id: 'JAHID',
    assigned_to_name: 'Jahid Akand',
    call_status: 'no_answer',
    call_notes: 'Call not answered (N/A). Tried 2 times.',
    last_called_at: '2026-09-11 11:50 AM',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },
  {
    id: 'cnt-014',
    name: 'Jahangir Alam',
    phone: '01720-554433',
    member_id: 'OS-4011',
    category: 'old_student',
    category_name_bn: 'Old Student',
    branch: 'rajbari',
    assigned_to_id: 'JAHID',
    assigned_to_name: 'Jahid Akand',
    call_status: 'negative',
    call_notes: 'Currently out of town, cannot attend sessions.',
    last_called_at: '2026-09-11 12:30 PM',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },
  {
    id: 'cnt-015',
    name: 'Tanvir Hasan',
    phone: '01550-112233',
    member_id: 'QM-15201',
    category: 'new_lead',
    category_name_bn: 'New Lead',
    branch: 'rajbari',
    assigned_to_id: 'JAHID',
    assigned_to_name: 'Jahid Akand',
    call_status: 'inactive',
    call_notes: 'Inactive number, unavailable on network.',
    last_called_at: '2026-09-11 01:10 PM',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },

  // 4. Sadar Office Contacts assigned to SHAKIL (Shakil Hosen)
  {
    id: 'cnt-016',
    name: 'Engr. Enamul Haque',
    phone: '01712-998811',
    member_id: 'QM-06650',
    category: 'quantum_member',
    category_name_bn: 'Quantum Member',
    branch: 'rajbari',
    assigned_to_id: 'SHAKIL',
    assigned_to_name: 'Shakil Hosen',
    call_status: 'positive',
    call_notes: 'Completed membership renewal and book order.',
    conversion_amount: 1500,
    last_called_at: '2026-09-11 10:20 AM',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },
  {
    id: 'cnt-017',
    name: 'Rokeya Begum',
    phone: '01815-778899',
    member_id: 'DN-1092',
    category: 'donor',
    category_name_bn: 'Earthen Bank Donor',
    branch: 'rajbari',
    assigned_to_id: 'SHAKIL',
    assigned_to_name: 'Shakil Hosen',
    call_status: 'unreachable',
    call_notes: 'Call not received, subscriber currently out of network.',
    last_called_at: '2026-09-11 11:30 AM',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },
  {
    id: 'cnt-018',
    name: 'Shariful Islam',
    phone: '01918-223344',
    member_id: 'QM-11200',
    category: 'quantum_member',
    category_name_bn: 'Quantum Member',
    branch: 'rajbari',
    assigned_to_id: 'SHAKIL',
    assigned_to_name: 'Shakil Hosen',
    call_status: 'pending',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },

  // 5. Sadar Office Contacts assigned to NAYON (Nayon Chandra)
  {
    id: 'cnt-019',
    name: 'Adv. Subrata Roy',
    phone: '01713-556677',
    member_id: 'QM-07712',
    category: 'quantum_member',
    category_name_bn: 'Quantum Member',
    branch: 'rajbari',
    assigned_to_id: 'NAYON',
    assigned_to_name: 'Nayon Chandra',
    call_status: 'positive',
    call_notes: 'Confirmed attendance in next wisdom session.',
    last_called_at: '2026-09-11 10:50 AM',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },
  {
    id: 'cnt-020',
    name: 'Bipul Kumar Das',
    phone: '01812-445566',
    member_id: 'OS-5541',
    category: 'old_student',
    category_name_bn: 'Old Student',
    branch: 'rajbari',
    assigned_to_id: 'NAYON',
    assigned_to_name: 'Nayon Chandra',
    call_status: 'no_answer',
    call_notes: 'Call not answered (N/A). Scheduled afternoon retry.',
    last_called_at: '2026-09-11 11:40 AM',
    date_assigned: '2026-09-10',
    created_at: '2026-09-10',
  },
];

// Helper to generate a realistic batch of 100 contacts (Raji Sir's 100-member assignment)
export function generate100MemberBatch(
  assignedToId: string,
  assignedToName: string,
  branch: 'chowrasta' | 'rajbari'
): ClientContact[] {
  const firstNames = [
    'Kamal', 'Rafiq', 'Nasima', 'Shafiq', 'Farhana', 'Zahid',
    'Mizan', 'Tariq', 'Sayma', 'Rehana', 'Ashraful', 'Asad',
    'Tania', 'Shamim', 'Karim', 'Shahnaz', 'Belal', 'Rubina', 'Arif', 'Munira'
  ];
  const lastNames = [
    'Uddin', 'Hasan', 'Chowdhury', 'Khan', 'Ahmed', 'Islam', 'Sikder', 'Sarkar',
    'Molla', 'Talukdar', 'Begum', 'Akter', 'Rahman', 'Hossain', 'Bhuiyan', 'Pramanik'
  ];

  const outcomes: CallOutcome[] = [
    'positive', 'positive', 'positive', 'positive', // 40% positive
    'negative', 'negative',                         // 20% negative
    'no_answer', 'no_answer',                       // 20% no_answer (N/A)
    'unreachable',                                  // 10% unreachable
    'inactive',                                     // 10% inactive
  ];

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  const batch: ClientContact[] = [];
  for (let i = 1; i <= 100; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randOutcome = i <= 65 ? outcomes[Math.floor(Math.random() * outcomes.length)] : 'pending';
    const numPrefix = ['017', '018', '019', '016', '015'][Math.floor(Math.random() * 5)];
    const numBody = String(Math.floor(10000000 + Math.random() * 90000000)).slice(0, 8);

    batch.push({
      id: `batch-${assignedToId}-${i}-${Date.now()}`,
      name: `${fName} ${lName}`,
      phone: `${numPrefix}-${numBody.slice(0, 4)}-${numBody.slice(4)}`,
      member_id: `QM-${10000 + i}`,
      category: i % 3 === 0 ? 'donor' : i % 2 === 0 ? 'quantum_member' : 'old_student',
      category_name_bn: i % 3 === 0 ? 'Earthen Bank Donor' : i % 2 === 0 ? 'Quantum Member' : 'Old Student',
      branch,
      assigned_to_id: assignedToId,
      assigned_to_name: assignedToName,
      call_status: randOutcome,
      call_notes:
        randOutcome === 'positive'
          ? 'Discussion was positive. Agreed to participate in upcoming program.'
          : randOutcome === 'negative'
          ? 'Not interested due to busy schedule.'
          : randOutcome === 'no_answer'
          ? 'Call not answered (N/A).'
          : randOutcome === 'unreachable'
          ? 'Call not received / unreachable.'
          : randOutcome === 'inactive'
          ? 'Number inactive or switched off.'
          : undefined,
      conversion_amount: randOutcome === 'positive' ? (i % 2 === 0 ? 1000 : 500) : 0,
      last_called_at: randOutcome !== 'pending' ? `${dateStr} ${10 + (i % 6)}:${(i * 7) % 60} AM` : undefined,
      date_assigned: dateStr,
      created_at: dateStr,
    });
  }

  return batch;
}

// Storage helpers
export function getStoredContacts(): ClientContact[] {
  if (typeof window === 'undefined') return SEED_CONTACTS;
  try {
    const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(SEED_CONTACTS));
      return SEED_CONTACTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_CONTACTS;
  } catch (err) {
    console.error('Error reading contacts from storage:', err);
    return SEED_CONTACTS;
  }
}

export function saveStoredContacts(contacts: ClientContact[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  } catch (err) {
    console.error('Error saving contacts to storage:', err);
  }
}

export function addContact(contact: Omit<ClientContact, 'id' | 'created_at'>): ClientContact {
  const current = getStoredContacts();
  const newContact: ClientContact = {
    ...contact,
    id: `cnt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString().split('T')[0],
  };
  const updated = [newContact, ...current];
  saveStoredContacts(updated);
  return newContact;
}

export function deleteContact(id: string): boolean {
  const current = getStoredContacts();
  const updated = current.filter((c) => c.id !== id);
  saveStoredContacts(updated);
  return updated.length < current.length;
}

export function updateContactCallStatus(
  id: string,
  status: CallOutcome,
  notes?: string,
  conversionAmount?: number
): ClientContact | null {
  const current = getStoredContacts();
  let target: ClientContact | null = null;
  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
  const dateStr = now.toISOString().split('T')[0];

  const updated = current.map((c) => {
    if (c.id === id) {
      target = {
        ...c,
        call_status: status,
        call_notes: notes !== undefined ? notes : c.call_notes,
        conversion_amount: conversionAmount !== undefined ? conversionAmount : c.conversion_amount,
        last_called_at: `${dateStr} ${timeStr}`,
      };
      return target;
    }
    return c;
  });

  saveStoredContacts(updated);
  return target;
}

export function assignBatchToEmployee(
  employeeId: string,
  employeeName: string,
  branch: 'chowrasta' | 'rajbari'
): ClientContact[] {
  const current = getStoredContacts();
  const newBatch = generate100MemberBatch(employeeId, employeeName, branch);
  const updated = [...newBatch, ...current];
  saveStoredContacts(updated);
  return updated;
}

// Calculate comprehensive communication metrics
export function calculateCommunicationStats(contacts: ClientContact[]): CommunicationStats {
  const total = contacts.length;
  if (total === 0) {
    return {
      total: 0,
      called: 0,
      pending: 0,
      positiveCount: 0,
      positiveRate: 0,
      negativeCount: 0,
      negativeRate: 0,
      noAnswerCount: 0,
      noAnswerRate: 0,
      unreachableCount: 0,
      unreachableRate: 0,
      inactiveCount: 0,
      inactiveRate: 0,
    };
  }

  let positiveCount = 0;
  let negativeCount = 0;
  let noAnswerCount = 0;
  let unreachableCount = 0;
  let inactiveCount = 0;
  let pending = 0;

  for (const c of contacts) {
    switch (c.call_status) {
      case 'positive':
        positiveCount++;
        break;
      case 'negative':
        negativeCount++;
        break;
      case 'no_answer':
        noAnswerCount++;
        break;
      case 'unreachable':
        unreachableCount++;
        break;
      case 'inactive':
        inactiveCount++;
        break;
      case 'pending':
      default:
        pending++;
        break;
    }
  }

  const called = total - pending;
  const safeDiv = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return {
    total,
    called,
    pending,
    positiveCount,
    positiveRate: safeDiv(positiveCount),
    negativeCount,
    negativeRate: safeDiv(negativeCount),
    noAnswerCount,
    noAnswerRate: safeDiv(noAnswerCount),
    unreachableCount,
    unreachableRate: safeDiv(unreachableCount),
    inactiveCount,
    inactiveRate: safeDiv(inactiveCount),
  };
}
