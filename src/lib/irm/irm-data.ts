/**
 * International Relations (IRM) Data Contracts & Roster
 * Complies with:
 * - AIESEC Exchange Hub IR PRM Framework
 * - Numeric Quota Targets vs. Real-time Aggregated Actuals
 * - Sending Entity (SE) Standards Fulfillment Tracking (#1, #2, #3, #18)
 */

export interface IrSyncCall {
  id: string;
  irId: string;
  date: string;
  attendees: string[];
  pipelineBlockers: string;
  agreedActions: string;
  nextCallDate: string;
  loggedBy: string;
}

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

  // Numeric Quota Targets (Plan 16-01)
  targetApp: number;
  targetAcc: number;
  targetApd: number;
  targetRe: number;
  targetCo: number;

  // Live Performance Rollups
  actualApp: number;
  actualAcc: number;
  actualApd: number;
  actualRe: number;
  actualCo: number;
  conversionRatePercent: number; // e2e App -> Re %
  seStandardsFulfillmentPercent: number; // SE Standards (#1, #2, #3, #18)

  // Backward compatibility fields
  agreed_annual_quota: number;
  current_supply_count: number;
  avg_response_time_hours: number;
  status: 'ACTIVE_AGREEMENT' | 'IN_DISCUSSION' | 'PAUSED';
  last_touchpoint_date: string;
  notes?: string;

  // Sync Calls
  syncCalls?: IrSyncCall[];
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
    targetApp: 25,
    targetAcc: 18,
    targetApd: 14,
    targetRe: 12,
    targetCo: 12,
    actualApp: 20,
    actualAcc: 14,
    actualApd: 10,
    actualRe: 8,
    actualCo: 6,
    conversionRatePercent: 40, // 8 / 20 = 40%
    seStandardsFulfillmentPercent: 95,
    agreed_annual_quota: 12,
    current_supply_count: 8,
    avg_response_time_hours: 4.5,
    status: 'ACTIVE_AGREEMENT',
    last_touchpoint_date: '2026-10-24T14:00:00Z',
    notes: 'Primary supplier for Casatech and software engineering profiles. High visa conversion rate.',
    syncCalls: [
      {
        id: 'sync_01',
        irId: 'ir_001',
        date: '2026-10-24',
        attendees: ['Maximilian Weber', 'Wadii Hani', 'Sara Kabbaj'],
        pipelineBlockers: 'Consular appointments in Munich taking ~2 weeks to book.',
        agreedActions: 'Rabat will provide stamped French/Arabic invitation letter directly to Munich consulate.',
        nextCallDate: '2026-11-07',
        loggedBy: 'Wadii Hani',
      },
    ],
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
    targetApp: 30,
    targetAcc: 22,
    targetApd: 18,
    targetRe: 15,
    targetCo: 15,
    actualApp: 24,
    actualAcc: 16,
    actualApd: 11,
    actualRe: 9,
    actualCo: 7,
    conversionRatePercent: 37.5,
    seStandardsFulfillmentPercent: 90,
    agreed_annual_quota: 15,
    current_supply_count: 9,
    avg_response_time_hours: 6.2,
    status: 'ACTIVE_AGREEMENT',
    last_touchpoint_date: '2026-10-26T11:00:00Z',
    notes: 'Supplying EPs for English teaching and educational NGOs in Rabat.',
    syncCalls: [
      {
        id: 'sync_02',
        irId: 'ir_002',
        date: '2026-10-26',
        attendees: ['Elif Yilmaz', 'Amina Benali'],
        pipelineBlockers: 'None. Turkish EPs are visa-exempt for 90 days.',
        agreedActions: 'Confirmed 3 incoming EPs for November BMCE project intake wave.',
        nextCallDate: '2026-11-10',
        loggedBy: 'Amina Benali',
      },
    ],
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
    targetApp: 35,
    targetAcc: 28,
    targetApd: 24,
    targetRe: 20,
    targetCo: 20,
    actualApp: 28,
    actualAcc: 20,
    actualApd: 16,
    actualRe: 14,
    actualCo: 12,
    conversionRatePercent: 50,
    seStandardsFulfillmentPercent: 98,
    agreed_annual_quota: 20,
    current_supply_count: 14,
    avg_response_time_hours: 8.0,
    status: 'ACTIVE_AGREEMENT',
    last_touchpoint_date: '2026-10-21T18:00:00Z',
    notes: 'Summer and Winter iGV literacy project cohorts for BMCE Foundation.',
    syncCalls: [
      {
        id: 'sync_03',
        irId: 'ir_003',
        date: '2026-10-21',
        attendees: ['Camila Rodriguez', 'Wadii Hani'],
        pipelineBlockers: 'High airfare prices from Bogota to Casablanca.',
        agreedActions: 'Rabat will issue group booking flight advisory via Iberia/Royal Air Maroc.',
        nextCallDate: '2026-11-04',
        loggedBy: 'Wadii Hani',
      },
    ],
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
    targetApp: 15,
    targetAcc: 12,
    targetApd: 10,
    targetRe: 8,
    targetCo: 8,
    actualApp: 8,
    actualAcc: 5,
    actualApd: 4,
    actualRe: 3,
    actualCo: 2,
    conversionRatePercent: 37.5,
    seStandardsFulfillmentPercent: 92,
    agreed_annual_quota: 8,
    current_supply_count: 3,
    avg_response_time_hours: 12.0,
    status: 'IN_DISCUSSION',
    last_touchpoint_date: '2026-10-15T10:00:00Z',
    notes: 'Negotiating bilateral agreement for French-speaking marketing and IT interns.',
    syncCalls: [],
  },
];

/**
 * Computes live IR performance rollups from linked EPs
 */
export function calculateIrPartnerRollup(
  partner: IRPartner,
  linkedEpsCount: { app: number; acc: number; apd: number; re: number; co: number }
) {
  const actualApp = linkedEpsCount.app || partner.actualApp;
  const actualAcc = linkedEpsCount.acc || partner.actualAcc;
  const actualApd = linkedEpsCount.apd || partner.actualApd;
  const actualRe = linkedEpsCount.re || partner.actualRe;
  const actualCo = linkedEpsCount.co || partner.actualCo;

  const cr = actualApp > 0 ? Math.round((actualRe / actualApp) * 100) : 0;
  const quotaAttainment = partner.targetRe > 0 ? Math.round((actualRe / partner.targetRe) * 100) : 0;

  return {
    actualApp,
    actualAcc,
    actualApd,
    actualRe,
    actualCo,
    conversionRatePercent: cr,
    quotaAttainmentPercent: quotaAttainment,
  };
}

/**
 * Generates formatted WhatsApp & Email Rabat Opportunity Pack text
 */
export function generateRabatOpportunityPackText(irPartner: IRPartner): string {
  return `🌟 *AIESEC in Rabat — Bilateral Exchange Opportunity Pack* 🌟
Hello ${irPartner.primary_contact_name} (${irPartner.lc_name}),

Here is the updated intake & supply forecast for LC Rabat for your applicants:

📍 *Target Products:* ${irPartner.products_supplied.join(', ')}
🎯 *Annual Agreed Quota:* ${irPartner.targetRe} Realized EPs (Current Delivered: ${irPartner.actualRe}/${partnerQuotaShort(irPartner)})
⏱️ *Visa Lead Time:* ${irPartner.country === 'Germany' || irPartner.country === 'Colombia' || irPartner.country === 'Turkey' ? 'Visa-Free 90 Days (14d prep)' : 'Consular / eVisa (21-45d prep)'}

🔥 *Featured Active Openings in Rabat:*
1. *BMCE Foundation — Global Classroom (iGV / SDG 4)*: 6 weeks, Full Free Accommodation, public school coding & digital coach.
2. *Rabat American School — STEM & Robotics (iGTe)*: 16 weeks, 5,500 MAD/month salary, certified educational supervision.
3. *Casatech Innovation Labs — Fullstack Engineer (iGTa)*: 26 weeks, 6,000 MAD/month salary, partly-remote option.

Let's schedule our next bi-weekly IR sync call to lock candidates!
Best regards,
*AIESEC in Rabat CXP & IR Team*`;
}

function partnerQuotaShort(p: IRPartner): string {
  return `${p.targetRe} EPs`;
}
