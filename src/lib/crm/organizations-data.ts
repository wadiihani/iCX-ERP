export interface B2BOrganization {
  id: string;
  lc_id: string;
  name: string;
  website?: string;
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  sector: 'TECHNOLOGY' | 'EDUCATION' | 'FINANCE' | 'HEALTHCARE' | 'CONSULTING' | 'MANUFACTURING' | 'NGO';
  city: string;
  address?: string;
  tax_id?: string;
  status: 'PROSPECT' | 'QUALIFIED' | 'ACTIVE_PARTNER' | 'CHURNED' | 'BLOCKED';
  active_deals_count: number;
  total_deal_value_mad: number;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  account_owner_name: string;
  account_owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface B2BContact {
  id: string;
  organization_id: string;
  organization_name: string;
  name: string;
  email: string;
  phone: string;
  job_title: string;
  is_primary: boolean;
  notes?: string;
  created_at: string;
}

export interface B2BTouchpoint {
  id: string;
  organization_id: string;
  organization_name: string;
  deal_id?: string;
  deal_title?: string;
  contact_id?: string;
  contact_name?: string;
  touchpoint_type: 'MEETING' | 'PHONE_CALL' | 'EMAIL' | 'OFFICE_VISIT';
  meeting_date: string;
  minutes: string;
  next_action: string;
  next_action_due_date: string;
  next_action_owner: string;
  created_by: string;
  created_at: string;
}

export const INITIAL_B2B_ORGANIZATIONS: B2BOrganization[] = [
  {
    id: 'org_rabat_001',
    lc_id: 'lc_rabat',
    name: 'BMCE Bank Foundation',
    website: 'https://bmcebankfoundation.ma',
    tier: 'TIER_1',
    sector: 'FINANCE',
    city: 'Casablanca',
    address: 'Boulevard Moulay Youssef, Casablanca',
    tax_id: 'MA-09283711',
    status: 'ACTIVE_PARTNER',
    active_deals_count: 2,
    total_deal_value_mad: 45000,
    primary_contact_name: 'Dr. Leila Benhayoun',
    primary_contact_email: 'l.benhayoun@bmcefoundation.ma',
    primary_contact_phone: '+212 522 49 80 00',
    account_owner_name: 'Youssef Mansouri',
    account_owner_id: 'usr_bd_01',
    created_at: '2026-08-15T09:00:00Z',
    updated_at: '2026-10-25T11:30:00Z',
  },
  {
    id: 'org_rabat_002',
    lc_id: 'lc_rabat',
    name: 'Rabat American School',
    website: 'https://ras.ma',
    tier: 'TIER_1',
    sector: 'EDUCATION',
    city: 'Rabat',
    address: 'Avenue Mehdi Ben Barka, Souissi, Rabat',
    tax_id: 'MA-11234988',
    status: 'ACTIVE_PARTNER',
    active_deals_count: 3,
    total_deal_value_mad: 72000,
    primary_contact_name: 'Sarah Williams',
    primary_contact_email: 'swilliams@ras.ma',
    primary_contact_phone: '+212 537 75 14 00',
    account_owner_name: 'Mehdi Benjelloun',
    account_owner_id: 'usr_vp_bd',
    created_at: '2026-07-10T14:00:00Z',
    updated_at: '2026-10-26T16:00:00Z',
  },
  {
    id: 'org_rabat_003',
    lc_id: 'lc_rabat',
    name: 'Casatech Innovation Labs',
    website: 'https://casatech-labs.com',
    tier: 'TIER_2',
    sector: 'TECHNOLOGY',
    city: 'Casablanca',
    address: 'Casaneartoffshore Park, Shore 3',
    tax_id: 'MA-99214450',
    status: 'QUALIFIED',
    active_deals_count: 1,
    total_deal_value_mad: 28000,
    primary_contact_name: 'Omar Chraibi',
    primary_contact_email: 'omar@casatech-labs.com',
    primary_contact_phone: '+212 661 29 44 11',
    account_owner_name: 'Sara Kabbaj',
    account_owner_id: 'usr_bd_02',
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-10-24T08:45:00Z',
  },
  {
    id: 'org_rabat_004',
    lc_id: 'lc_rabat',
    name: 'Medina Green Initiative (NGO)',
    website: 'https://medinagreen.org',
    tier: 'TIER_3',
    sector: 'NGO',
    city: 'Rabat',
    address: 'Rue de Tanger, Hassan, Rabat',
    tax_id: 'MA-44210982',
    status: 'ACTIVE_PARTNER',
    active_deals_count: 1,
    total_deal_value_mad: 12000,
    primary_contact_name: 'Fatima-Zahra Tahiri',
    primary_contact_email: 'f.tahiri@medinagreen.org',
    primary_contact_phone: '+212 663 88 12 30',
    account_owner_name: 'Mehdi Benjelloun',
    account_owner_id: 'usr_vp_bd',
    created_at: '2026-06-20T11:00:00Z',
    updated_at: '2026-10-22T14:15:00Z',
  },
  {
    id: 'org_rabat_005',
    lc_id: 'lc_rabat',
    name: 'Atlas Hospitality Group',
    website: 'https://atlashospitality.ma',
    tier: 'TIER_2',
    sector: 'CONSULTING',
    city: 'Marrakech',
    tax_id: 'MA-77334901',
    status: 'PROSPECT',
    active_deals_count: 1,
    total_deal_value_mad: 35000,
    primary_contact_name: 'Karim Bennani',
    primary_contact_email: 'k.bennani@atlashospitality.ma',
    primary_contact_phone: '+212 524 43 20 00',
    account_owner_name: 'Youssef Mansouri',
    account_owner_id: 'usr_bd_01',
    created_at: '2026-10-01T15:00:00Z',
    updated_at: '2026-10-27T09:20:00Z',
  },
];

export const INITIAL_B2B_CONTACTS: B2BContact[] = [
  {
    id: 'cnt_001',
    organization_id: 'org_rabat_001',
    organization_name: 'BMCE Bank Foundation',
    name: 'Dr. Leila Benhayoun',
    email: 'l.benhayoun@bmcefoundation.ma',
    phone: '+212 522 49 80 00',
    job_title: 'Executive Director of CSR Programs',
    is_primary: true,
    notes: 'Key decision maker for iGV educational project funding.',
    created_at: '2026-08-15T09:00:00Z',
  },
  {
    id: 'cnt_002',
    organization_id: 'org_rabat_001',
    organization_name: 'BMCE Bank Foundation',
    name: 'Tariq Senhaji',
    email: 't.senhaji@bmcefoundation.ma',
    phone: '+212 522 49 80 12',
    job_title: 'Finance & Compliance Officer',
    is_primary: false,
    notes: 'Signs off on partnership grant tranches and invoice receipts.',
    created_at: '2026-08-20T10:30:00Z',
  },
  {
    id: 'cnt_003',
    organization_id: 'org_rabat_002',
    organization_name: 'Rabat American School',
    name: 'Sarah Williams',
    email: 'swilliams@ras.ma',
    phone: '+212 537 75 14 00',
    job_title: 'Dean of Global Exchange & Languages',
    is_primary: true,
    notes: 'Coordinates quarterly iGTa international teaching interns.',
    created_at: '2026-07-10T14:00:00Z',
  },
  {
    id: 'cnt_004',
    organization_id: 'org_rabat_003',
    organization_name: 'Casatech Innovation Labs',
    name: 'Omar Chraibi',
    email: 'omar@casatech-labs.com',
    phone: '+212 661 29 44 11',
    job_title: 'Chief Technology Officer',
    is_primary: true,
    notes: 'Evaluates developer portfolios and technical interviews for iGTa.',
    created_at: '2026-09-01T10:00:00Z',
  },
];

export const INITIAL_B2B_TOUCHPOINTS: B2BTouchpoint[] = [
  {
    id: 'tp_001',
    organization_id: 'org_rabat_001',
    organization_name: 'BMCE Bank Foundation',
    deal_title: 'Q4 2026 CSR Literacy Initiative (8 EPs)',
    contact_name: 'Dr. Leila Benhayoun',
    touchpoint_type: 'MEETING',
    meeting_date: '2026-10-25T10:00:00Z',
    minutes: 'Presented mid-term outcomes for rural schools iGV cycle. Partner committed to renewing MoU for Spring 2027.',
    next_action: 'Draft and submit revised MoU contract annex with updated trainee stipend numbers',
    next_action_due_date: '2026-11-05T00:00:00Z',
    next_action_owner: 'Youssef Mansouri',
    created_by: 'Youssef Mansouri',
    created_at: '2026-10-25T11:30:00Z',
  },
  {
    id: 'tp_002',
    organization_id: 'org_rabat_003',
    organization_name: 'Casatech Innovation Labs',
    deal_title: '2027 Fullstack Engineering Talent Slot',
    contact_name: 'Omar Chraibi',
    touchpoint_type: 'OFFICE_VISIT',
    meeting_date: '2026-10-24T08:00:00Z',
    minutes: 'Met CTO at Casaneartoffshore. Reviewed job description requirements: Node.js, React, and French fluency required.',
    next_action: 'Send matched candidate dossiers from Brazil and Turkey for technical screening',
    next_action_due_date: '2026-10-31T00:00:00Z',
    next_action_owner: 'Sara Kabbaj',
    created_by: 'Sara Kabbaj',
    created_at: '2026-10-24T08:45:00Z',
  },
];
