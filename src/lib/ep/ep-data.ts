export interface EPRecord {
  id: string;
  expa_ep_id: string;
  lc_id: string;
  full_name: string;
  email: string;
  phone: string;
  nationality: string;
  home_lc: string;
  home_mc: string;
  product: 'iGV' | 'iGTa' | 'iGTe';
  status: 'APPLIED' | 'ACCEPTED' | 'APPROVED' | 'REALIZED' | 'FINISHED' | 'COMPLETED';
  opportunity_id: string;
  opportunity_title: string;
  partner_organization_name: string;
  host_manager_id: string;
  host_manager_name: string;
  start_date: string;
  end_date: string;
  visa_status: 'NOT_REQUIRED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  insurance_verified: boolean;
  pickup_confirmed: boolean;
  created_at: string;
  updated_at: string;
}

export const INITIAL_EPS: EPRecord[] = [
  {
    id: 'ep_2026_081',
    expa_ep_id: 'EXPA-892144',
    lc_id: 'lc_rabat',
    full_name: 'Sofia Martinez',
    email: 'sofia.martinez@email.com',
    phone: '+57 310 882 1904',
    nationality: 'Colombia',
    home_lc: 'AIESEC in Bogota UniAndes',
    home_mc: 'Colombia',
    product: 'iGV',
    status: 'APPROVED',
    opportunity_id: 'opp-1',
    opportunity_title: 'Youth Digital Literacy & Coding Coach',
    partner_organization_name: 'BMCE Bank Foundation',
    host_manager_id: 'usr_cxp_01',
    host_manager_name: 'Amina Benali',
    start_date: '2026-11-01',
    end_date: '2026-12-15',
    visa_status: 'APPROVED',
    insurance_verified: true,
    pickup_confirmed: true,
    created_at: '2026-10-10T11:00:00Z',
    updated_at: '2026-10-27T16:00:00Z',
  },
  {
    id: 'ep_2026_077',
    expa_ep_id: 'EXPA-884210',
    lc_id: 'lc_rabat',
    full_name: 'Lukas Schneider',
    email: 'lukas.schneider@tum.de',
    phone: '+49 176 9928 3411',
    nationality: 'Germany',
    home_lc: 'AIESEC in Munich',
    home_mc: 'Germany',
    product: 'iGTa',
    status: 'APPROVED',
    opportunity_id: 'opp-3',
    opportunity_title: 'Fullstack React & Node.js Software Engineer',
    partner_organization_name: 'Casatech Innovation Labs',
    host_manager_id: 'usr_bd_02',
    host_manager_name: 'Sara Kabbaj',
    start_date: '2027-01-05',
    end_date: '2027-07-05',
    visa_status: 'SUBMITTED',
    insurance_verified: true,
    pickup_confirmed: false,
    created_at: '2026-10-05T09:00:00Z',
    updated_at: '2026-10-25T14:30:00Z',
  },
  {
    id: 'ep_2026_065',
    expa_ep_id: 'EXPA-871109',
    lc_id: 'lc_rabat',
    full_name: 'Elif Demir',
    email: 'elif.demir@ege.edu.tr',
    phone: '+90 532 441 89 20',
    nationality: 'Turkey',
    home_lc: 'AIESEC in Izmir',
    home_mc: 'Turkey',
    product: 'iGTe',
    status: 'REALIZED',
    opportunity_id: 'opp-2',
    opportunity_title: 'STEM & Robotics Teaching Assistant',
    partner_organization_name: 'Rabat American School',
    host_manager_id: 'usr_cxp_01',
    host_manager_name: 'Amina Benali',
    start_date: '2026-09-15',
    end_date: '2026-12-15',
    visa_status: 'APPROVED',
    insurance_verified: true,
    pickup_confirmed: true,
    created_at: '2026-08-20T10:00:00Z',
    updated_at: '2026-10-26T09:00:00Z',
  },
  {
    id: 'ep_2026_090',
    expa_ep_id: 'EXPA-899120',
    lc_id: 'lc_rabat',
    full_name: 'Lucas Silva',
    email: 'lucas.silva@usp.br',
    phone: '+55 11 98765 4321',
    nationality: 'Brazil',
    home_lc: 'AIESEC in São Paulo',
    home_mc: 'Brazil',
    product: 'iGTa',
    status: 'ACCEPTED',
    opportunity_id: 'opp-3',
    opportunity_title: 'Fullstack React & Node.js Software Engineer',
    partner_organization_name: 'Casatech Innovation Labs',
    host_manager_id: 'usr_bd_02',
    host_manager_name: 'Sara Kabbaj',
    start_date: '2027-01-05',
    end_date: '2027-07-05',
    visa_status: 'NOT_REQUIRED',
    insurance_verified: false,
    pickup_confirmed: false,
    created_at: '2026-10-22T15:00:00Z',
    updated_at: '2026-10-26T18:00:00Z',
  },
];
