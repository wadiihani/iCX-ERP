export interface IRPartner {
  id: string;
  lc_name: string;
  country: string;
  entity_code: string;
  tier: 'STRATEGIC_IR' | 'CORE_IR' | 'OPPORTUNISTIC';
  products_supplied: Array<'iGV' | 'iGTa' | 'iGTe'>;
  primary_contact_name: string;
  primary_contact_role: string;
  primary_contact_email: string;
  primary_contact_whatsapp: string;
  agreed_annual_quota: number;
  current_supply_count: number;
  avg_response_time_hours: number;
  status: 'ACTIVE_AGREEMENT' | 'IN_DISCUSSION' | 'PAUSED';
  last_touchpoint_date: string;
  notes?: string;
}

export const INITIAL_IR_PARTNERS: IRPartner[] = [
  {
    id: 'ir_001',
    lc_name: 'AIESEC in Munich',
    country: 'Germany',
    entity_code: 'DE-MUC',
    tier: 'STRATEGIC_IR',
    products_supplied: ['iGTa', 'iGTe'],
    primary_contact_name: 'Maximilian Weber',
    primary_contact_role: 'VP oGT & International Relations',
    primary_contact_email: 'maximilian.weber@aiesec.de',
    primary_contact_whatsapp: '+49 176 9928 3411',
    agreed_annual_quota: 12,
    current_supply_count: 8,
    avg_response_time_hours: 4.5,
    status: 'ACTIVE_AGREEMENT',
    last_touchpoint_date: '2026-10-24T14:00:00Z',
    notes: 'Primary supplier for Casatech and software engineering profiles. High visa conversion rate.',
  },
  {
    id: 'ir_002',
    lc_name: 'AIESEC in Izmir',
    country: 'Turkey',
    entity_code: 'TR-IZM',
    tier: 'CORE_IR',
    products_supplied: ['iGTa', 'iGV'],
    primary_contact_name: 'Elif Yilmaz',
    primary_contact_role: 'IR Manager',
    primary_contact_email: 'elif.yilmaz@aiesec.org.tr',
    primary_contact_whatsapp: '+90 532 441 89 20',
    agreed_annual_quota: 15,
    current_supply_count: 9,
    avg_response_time_hours: 6.2,
    status: 'ACTIVE_AGREEMENT',
    last_touchpoint_date: '2026-10-26T11:00:00Z',
    notes: 'Supplying EPs for English teaching and educational NGOs in Rabat.',
  },
  {
    id: 'ir_003',
    lc_name: 'AIESEC in Bogota UniAndes',
    country: 'Colombia',
    entity_code: 'CO-ANDES',
    tier: 'STRATEGIC_IR',
    products_supplied: ['iGV'],
    primary_contact_name: 'Camila Rodriguez',
    primary_contact_role: 'VP oGV',
    primary_contact_email: 'camila.rodriguez@aiesec.org.co',
    primary_contact_whatsapp: '+57 310 882 1904',
    agreed_annual_quota: 20,
    current_supply_count: 14,
    avg_response_time_hours: 8.0,
    status: 'ACTIVE_AGREEMENT',
    last_touchpoint_date: '2026-10-21T18:00:00Z',
    notes: 'Summer and Winter iGV literacy project cohorts for BMCE Foundation.',
  },
  {
    id: 'ir_004',
    lc_name: 'AIESEC in Tunis Bardo',
    country: 'Tunisia',
    entity_code: 'TN-BARDO',
    tier: 'CORE_IR',
    products_supplied: ['iGTa', 'iGTe'],
    primary_contact_name: 'Mehdi Chahed',
    primary_contact_role: 'Local Committee President',
    primary_contact_email: 'mehdi.chahed@aiesec.net',
    primary_contact_whatsapp: '+216 98 440 120',
    agreed_annual_quota: 8,
    current_supply_count: 3,
    avg_response_time_hours: 12.0,
    status: 'IN_DISCUSSION',
    last_touchpoint_date: '2026-10-15T10:00:00Z',
    notes: 'Negotiating bilateral agreement for French-speaking marketing and IT interns.',
  },
];
