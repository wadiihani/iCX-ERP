/**
 * Cross-Module Unified Task Engine & Idempotent Automation
 * Statutory Baseline: HUB-TASK-01, HUB-TASK-02, Africa/Casablanca Timezone Awareness
 * Jurisdiction: AIESEC in Rabat (LC Rabat, MC Morocco)
 */

export type TaskSourceType =
  | 'BD_FOLLOWUP'
  | 'IR_MESSAGE'
  | 'OPP_CONTRACT'
  | 'EP_MATCHING'
  | 'VISA_CHECK'
  | 'ARRIVAL_PICKUP'
  | 'STANDARDS_CXP'
  | 'FINANCE_INVOICE'
  | 'MANDATE_HANDOVER';

export type TaskDepartment = 'BD' | 'CXP' | 'IR' | 'FNL' | 'TM' | 'OGX';
export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';

export interface UnifiedTask {
  id: string;
  idempotencyKey: string;
  sourceType: TaskSourceType;
  title: string;
  description?: string;
  relatedRecordType: 'EP' | 'ORGANIZATION' | 'DEAL' | 'OPPORTUNITY' | 'INVOICE' | 'PAYOUT' | 'HANDOVER' | 'IR_PARTNER';
  relatedRecordId: string;
  relatedRecordTitle: string;
  department: TaskDepartment;
  assignedRole: string;
  assignedMemberName: string;
  dueDate: string; // ISO 8601 string
  displayDeadlineCasablanca: string; // Formatted date string in Africa/Casablanca
  priority: TaskPriority;
  status: TaskStatus;
  isOverdue: boolean;
  completionEvidence?: string;
  escalationPath: string; // e.g. "Officer -> VP CXP -> LCP"
  createdAt: string;
  completedAt?: string;
}

/**
 * Formats date strictly in Africa/Casablanca timezone.
 */
export function formatCasablancaDate(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Casablanca',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Evaluates whether task is overdue relative to Africa/Casablanca now.
 */
export function isTaskOverdue(dueDate: string, currentDate: Date = new Date()): boolean {
  return new Date(dueDate).getTime() < currentDate.getTime();
}

/**
 * Generates an idempotent task. If a task with the same idempotencyKey exists in existingTasks,
 * it returns the existing task without creating a duplicate.
 */
export function createIdempotentTask(
  params: {
    sourceType: TaskSourceType;
    actionKey: string;
    title: string;
    description?: string;
    relatedRecordType: UnifiedTask['relatedRecordType'];
    relatedRecordId: string;
    relatedRecordTitle: string;
    department: TaskDepartment;
    assignedRole: string;
    assignedMemberName: string;
    dueHoursFromNow?: number;
    priority?: TaskPriority;
    escalationPath?: string;
  },
  existingTasks: UnifiedTask[] = [],
  currentDate: Date = new Date()
): { task: UnifiedTask; isNew: boolean } {
  const idempotencyKey = `${params.sourceType}_${params.relatedRecordId}_${params.actionKey}`;
  const existing = existingTasks.find((t) => t.idempotencyKey === idempotencyKey);
  if (existing) {
    return { task: existing, isNew: false };
  }

  const hours = params.dueHoursFromNow ?? 48;
  const dueMs = currentDate.getTime() + hours * 3600 * 1000;
  const dueDate = new Date(dueMs).toISOString();

  const task: UnifiedTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    idempotencyKey,
    sourceType: params.sourceType,
    title: params.title,
    description: params.description,
    relatedRecordType: params.relatedRecordType,
    relatedRecordId: params.relatedRecordId,
    relatedRecordTitle: params.relatedRecordTitle,
    department: params.department,
    assignedRole: params.assignedRole,
    assignedMemberName: params.assignedMemberName,
    dueDate,
    displayDeadlineCasablanca: formatCasablancaDate(dueDate),
    priority: params.priority || 'MEDIUM',
    status: 'PENDING',
    isOverdue: false,
    escalationPath: params.escalationPath || 'Team Member -> VP -> LCP',
    createdAt: currentDate.toISOString(),
  };

  return { task, isNew: true };
}

export const INITIAL_UNIFIED_TASKS: UnifiedTask[] = [
  {
    id: 'task_001',
    idempotencyKey: 'FINANCE_INVOICE_inv_002_OVERDUE_FREEZE',
    sourceType: 'FINANCE_INVOICE',
    title: '[AFPM Alert] Issue Overdue Notice & Realization Freeze Warning for Rabat American School',
    description: 'Invoice INV-2026-071 is 28 days overdue (>14 days). 5% statutory penalty (+1,800 MAD) and realization freeze apply.',
    relatedRecordType: 'INVOICE',
    relatedRecordId: 'inv_002',
    relatedRecordTitle: 'Invoice INV-2026-071 (Rabat American School)',
    department: 'FNL',
    assignedRole: 'VP Finance',
    assignedMemberName: 'Salma Tazi (VP Finance)',
    dueDate: '2026-10-30T10:00:00Z',
    displayDeadlineCasablanca: '30 Oct 2026, 11:00',
    priority: 'CRITICAL',
    status: 'PENDING',
    isOverdue: false,
    escalationPath: 'VP Finance -> LCP -> MC FNL',
    createdAt: '2026-10-27T09:00:00Z',
  },
  {
    id: 'task_002',
    idempotencyKey: 'STANDARDS_CXP_ep_2026_077_HOUSING_INTERVENTION',
    sourceType: 'STANDARDS_CXP',
    title: '[CXP Corrective Action] Immediate Housing Maintenance for Amara Diop (Water Heater Failure)',
    description: 'EP reported hot water plumbing malfunction during Standard #17 check-in (Mood 2/5). Coordinate with host landlord Mme. Aicha.',
    relatedRecordType: 'EP',
    relatedRecordId: 'ep_2026_077',
    relatedRecordTitle: 'Amara Diop (Dar Zellige Host Family)',
    department: 'CXP',
    assignedRole: 'VP CXP',
    assignedMemberName: 'Amina Benali (VP CXP)',
    dueDate: '2026-10-28T18:00:00Z',
    displayDeadlineCasablanca: '28 Oct 2026, 19:00',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    isOverdue: true,
    escalationPath: 'EP Buddy -> VP CXP -> LCP',
    createdAt: '2026-10-26T15:00:00Z',
  },
  {
    id: 'task_003',
    idempotencyKey: 'ARRIVAL_PICKUP_pick_001_DISPATCH_GUIDE',
    sourceType: 'ARRIVAL_PICKUP',
    title: '[Standard #6] Dispatch 3-Day Written Arrival Guide for Sofia Martinez',
    description: 'Arrival flight AT-801 arrives at CMN airport on 15 Nov. Dispatch written arrival pack with buddy details and SIM guidance.',
    relatedRecordType: 'EP',
    relatedRecordId: 'ep_2026_081',
    relatedRecordTitle: 'Sofia Martinez (Arrival 15 Nov)',
    department: 'CXP',
    assignedRole: 'Pickup Officer',
    assignedMemberName: 'Mehdi Benkaddour (Greeter Buddy)',
    dueDate: '2026-11-12T12:00:00Z',
    displayDeadlineCasablanca: '12 Nov 2026, 13:00',
    priority: 'HIGH',
    status: 'PENDING',
    isOverdue: false,
    escalationPath: 'Greeter Buddy -> VP CXP',
    createdAt: '2026-10-26T10:00:00Z',
  },
  {
    id: 'task_004',
    idempotencyKey: 'BD_FOLLOWUP_deal_003_PROPOSAL_MEETING',
    sourceType: 'BD_FOLLOWUP',
    title: '[B2B CRM] Conduct Proposal Follow-up with Casatech Innovation Labs',
    description: 'BANT criteria complete. Present finalized agreement for 4 Software Developer trainees.',
    relatedRecordType: 'DEAL',
    relatedRecordId: 'deal_003',
    relatedRecordTitle: 'Casatech Innovation Labs (iGTa Partnership)',
    department: 'BD',
    assignedRole: 'BD Executive',
    assignedMemberName: 'Youssef Mansouri (BD)',
    dueDate: '2026-10-31T15:00:00Z',
    displayDeadlineCasablanca: '31 Oct 2026, 16:00',
    priority: 'MEDIUM',
    status: 'PENDING',
    isOverdue: false,
    escalationPath: 'BD Executive -> VP BD',
    createdAt: '2026-10-25T11:00:00Z',
  },
  {
    id: 'task_005',
    idempotencyKey: 'VISA_CHECK_visa_099_HUMAN_AUDIT',
    sourceType: 'VISA_CHECK',
    title: '[Visa Gate] Human Audit & Consular Visa Invitation Letter for Jean-Paul Kamga',
    description: 'Cameroon consular visa requires 45-day lead time. Verify passport validity and dispatch stamped institutional invitation pack.',
    relatedRecordType: 'EP',
    relatedRecordId: 'ep_2026_099',
    relatedRecordTitle: 'Jean-Paul Kamga (Cameroon)',
    department: 'IR',
    assignedRole: 'VP IR & Governance',
    assignedMemberName: 'Yassine Alami (VP iGV)',
    dueDate: '2026-10-29T17:00:00Z',
    displayDeadlineCasablanca: '29 Oct 2026, 18:00',
    priority: 'CRITICAL',
    status: 'PENDING',
    isOverdue: false,
    escalationPath: 'IR Manager -> VP CXP -> LCP',
    createdAt: '2026-10-26T14:00:00Z',
  },
];
