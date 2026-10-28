export interface StakeholderHandoff {
  id: string;
  from_owner_id: string;
  from_owner_name: string;
  to_owner_id: string;
  to_owner_name: string;
  entity_type: 'EP' | 'ORGANIZATION' | 'OPPORTUNITY' | 'DEAL';
  entity_id: string;
  entity_title: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  open_tasks_count: number;
  transferred_at: string;
  acknowledged_at?: string;
  handoff_notes: string;
  rejection_reason?: string;
}

export interface WorkloadTask {
  id: string;
  title: string;
  description?: string;
  department: 'BD' | 'CXP' | 'OGX' | 'FNL' | 'TM';
  assignee_id: string;
  assignee_name: string;
  due_date: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  is_overdue: boolean;
  linked_record_type: 'EP' | 'ORGANIZATION' | 'OPPORTUNITY' | 'DEAL';
  linked_record_id: string;
  linked_record_title: string;
  handoff_id?: string;
}

export const INITIAL_HANDOFFS: StakeholderHandoff[] = [
  {
    id: 'hnd_001',
    from_owner_id: 'usr_bd_01',
    from_owner_name: 'Youssef Mansouri (BD)',
    to_owner_id: 'usr_cxp_01',
    to_owner_name: 'Amina Benali (CXP)',
    entity_type: 'EP',
    entity_id: 'ep_2026_081',
    entity_title: 'Sofia Martinez (iGV Trainee at BMCE Foundation)',
    status: 'PENDING',
    open_tasks_count: 3,
    transferred_at: '2026-10-27T16:00:00Z',
    handoff_notes: 'MoU signed by BMCE Foundation. EP approval finalized on EXPA. Transferring ownership to CXP for arrival logistics and accommodation check-in.',
  },
  {
    id: 'hnd_002',
    from_owner_id: 'usr_vp_bd',
    from_owner_name: 'Mehdi Benjelloun (VP BD)',
    to_owner_id: 'usr_bd_02',
    to_owner_name: 'Sara Kabbaj (BD Executive)',
    entity_type: 'ORGANIZATION',
    entity_id: 'org_rabat_003',
    entity_title: 'Casatech Innovation Labs',
    status: 'ACCEPTED',
    open_tasks_count: 2,
    transferred_at: '2026-10-24T09:00:00Z',
    acknowledged_at: '2026-10-24T10:15:00Z',
    handoff_notes: 'Initial executive meeting completed with CTO. Reassigning account management and technical candidate screening to Sara.',
  },
];

export const INITIAL_TASKS: WorkloadTask[] = [
  {
    id: 'tsk_001',
    title: 'Confirm airport pickup volunteer & driver',
    description: 'EP arriving CMN Terminal 2 at 18:45 on Royal Air Maroc flight AT201.',
    department: 'CXP',
    assignee_id: 'usr_cxp_01',
    assignee_name: 'Amina Benali',
    due_date: '2026-10-29T12:00:00Z',
    status: 'PENDING',
    is_overdue: false,
    linked_record_type: 'EP',
    linked_record_id: 'ep_2026_081',
    linked_record_title: 'Sofia Martinez',
    handoff_id: 'hnd_001',
  },
  {
    id: 'tsk_002',
    title: 'Verify host family bedding & room inspection',
    description: 'Ensure clean linen, desk, and key handover at Agdal accommodation.',
    department: 'CXP',
    assignee_id: 'usr_cxp_01',
    assignee_name: 'Amina Benali',
    due_date: '2026-10-28T18:00:00Z',
    status: 'IN_PROGRESS',
    is_overdue: false,
    linked_record_type: 'EP',
    linked_record_id: 'ep_2026_081',
    linked_record_title: 'Sofia Martinez',
    handoff_id: 'hnd_001',
  },
  {
    id: 'tsk_003',
    title: 'Submit internship prefecture registration dossier',
    description: 'Deliver conventions de stage copy to Rabat Wilaya bureau.',
    department: 'BD',
    assignee_id: 'usr_bd_01',
    assignee_name: 'Youssef Mansouri',
    due_date: '2026-10-26T00:00:00Z',
    status: 'BLOCKED',
    is_overdue: true,
    linked_record_type: 'ORGANIZATION',
    linked_record_id: 'org_rabat_001',
    linked_record_title: 'BMCE Bank Foundation',
  },
  {
    id: 'tsk_004',
    title: 'Send iGTa candidate shortlist to Casatech CTO',
    description: 'Email top 3 screened profiles from Brazil and Turkey with GitHub links.',
    department: 'BD',
    assignee_id: 'usr_bd_02',
    assignee_name: 'Sara Kabbaj',
    due_date: '2026-10-31T00:00:00Z',
    status: 'PENDING',
    is_overdue: false,
    linked_record_type: 'ORGANIZATION',
    linked_record_id: 'org_rabat_003',
    linked_record_title: 'Casatech Innovation Labs',
    handoff_id: 'hnd_002',
  },
  {
    id: 'tsk_005',
    title: 'Audit Q3 exchange fee receipts & bank reconciliation',
    description: 'Reconcile BMCE partner payment receipt against LC bank statement.',
    department: 'FNL',
    assignee_id: 'usr_fnl_01',
    assignee_name: 'Salma Tazi (VP Finance)',
    due_date: '2026-10-30T00:00:00Z',
    status: 'PENDING',
    is_overdue: false,
    linked_record_type: 'DEAL',
    linked_record_id: 'deal-1',
    linked_record_title: 'BMCE Bank Foundation Trainee Quota',
  },
];
