/**
 * AIESEC iCX ERP — Comprehensive Demo Data Seed for Mandate 26.2
 * Author: Wadii Hani <wadii.hani.pro@gmail.com>
 * LC: AIESEC in Rabat, Morocco
 */

import {
  getMasterTrackerDb,
  partnerService,
  opportunityService,
  epService,
  exchangeService,
  entityService,
} from './master-tracker';
import { proofVaultService } from './proof-vault';
import { complianceService } from './compliance-calendar';
import { qualityCaseService } from './quality-cases';
import { irEcosystemService, getIrEcosystemDb } from './ir-ecosystem';
import { dataQualityService } from './data-quality';

let isSeeded = false;

export function ensureDemoDataSeeded(): void {
  const db = getMasterTrackerDb();
  if (isSeeded || db.exchanges.size > 0) {
    isSeeded = true;
    return;
  }

  const actor = 'usr_wadii_hani';

  // Helper to retrieve or create entity orgs idempotently
  const getOrCreateEntity = (
    name: string,
    country: string,
    kind: 'LC' | 'MC' = 'MC'
  ) => {
    let ent = Array.from(db.entities.values()).find((e) => e.name === name);
    if (!ent) {
      ent = entityService.createEntity(
        {
          name,
          kind,
          country,
          is_frozen: false,
        },
        actor
      );
    }
    return ent;
  };

  // 1. Primary LC Host Entity & Sending Partner MCs
  const lcOrg = getOrCreateEntity('AIESEC in Rabat', 'Morocco', 'LC');
  const brazilOrg = getOrCreateEntity('AIESEC in Brazil', 'Brazil', 'MC');
  const germanyOrg = getOrCreateEntity('AIESEC in Germany', 'Germany', 'MC');
  const egyptOrg = getOrCreateEntity('AIESEC in Egypt', 'Egypt', 'MC');
  const taiwanOrg = getOrCreateEntity('AIESEC in Taiwan', 'Taiwan', 'MC');

  // 2. Seed 13 Statutory ICB Documents for Rabat
  complianceService.seedIcbAuditCatalogue(lcOrg.id, 'usr_wadii_hani', actor, '2026-06-30');

  // 3. Operational B2B Partners
  const p1 = partnerService.createPartner(
    {
      name: 'Association Espoir & Jeunesse Rabat',
      type: 'NGO',
      city: 'Rabat',
      owner_id: 'usr_wadii_hani',
      stage: 'agreement',
      contact_person: {
        name: 'Dr. Karim Benjelloun',
        phone: '+212 661 234 567',
        email: 'direction@espoir-jeunesse.ma',
        role: 'Executive Director',
      },
    },
    actor
  );

  const p2 = partnerService.createPartner(
    {
      name: 'Green Future Maroc Sustainable Hub',
      type: 'Social Enterprise',
      city: 'Rabat-Salé',
      owner_id: 'usr_sarah_idrissi',
      stage: 'agreement',
      contact_person: {
        name: 'Leila Amrani',
        phone: '+212 662 987 654',
        email: 'l.amrani@greenfuture.org',
        role: 'Projects Lead',
      },
    },
    actor
  );

  const p3 = partnerService.createPartner(
    {
      name: 'Fondation Orient-Occident Rabat',
      type: 'Cultural & Education Foundation',
      city: 'Rabat',
      owner_id: 'usr_yassine_tazi',
      stage: 'meeting',
      contact_person: {
        name: 'Omar Chraibi',
        phone: '+212 663 554 433',
        email: 'ochraibi@orient-occident.org',
        role: 'Partnership Officer',
      },
    },
    actor
  );

  // 4. Opportunities
  const op1 = opportunityService.createOpportunity(
    {
      op_id: p1.id,
      programme: 'GV',
      title: 'EcoRabat 2026: Climate Action & Youth SDG 13',
      slots: 6,
      duration_weeks: 6,
      hours_per_week: 25,
      benefits: ['Accommodation provided', 'Airport pickup', 'Leadership development space'],
      accommodation_provided: true,
    },
    actor
  );

  const op2 = opportunityService.createOpportunity(
    {
      op_id: p2.id,
      programme: 'GV',
      title: 'EduSpark Summer: Global Classroom & Literacy',
      slots: 4,
      duration_weeks: 6,
      hours_per_week: 25,
      benefits: ['Accommodation provided', 'Local transport subsidy'],
      accommodation_provided: true,
    },
    actor
  );

  // 5. Exchange Participants (EPs with distinct international home entities)
  const ep1 = epService.createEp(
    {
      expa_ep_id: 2849102,
      full_name: 'Maria Clara Silva',
      home_entity_id: brazilOrg.id,
      contact: {
        email: 'maria.silva@aiesec.net',
        phone: '+55 11 98765 4321',
        country: 'Brazil',
      },
      owner_id: 'usr_wadii_hani',
    },
    actor
  );

  const ep2 = epService.createEp(
    {
      expa_ep_id: 2850314,
      full_name: 'Lucas Heinrich Müller',
      home_entity_id: germanyOrg.id,
      contact: {
        email: 'lucas.mueller@aiesec.de',
        phone: '+49 170 1234567',
        country: 'Germany',
      },
      owner_id: 'usr_sarah_idrissi',
    },
    actor
  );

  const ep3 = epService.createEp(
    {
      expa_ep_id: 2861944,
      full_name: 'Fatima Al-Mansoor',
      home_entity_id: egyptOrg.id,
      contact: {
        email: 'fatima.mansoor@aiesec.eg',
        phone: '+20 100 555 4321',
        country: 'Egypt',
      },
      owner_id: 'usr_wadii_hani',
    },
    actor
  );

  const ep4 = epService.createEp(
    {
      expa_ep_id: 2874109,
      full_name: 'Alex Yi-Ting Chen',
      home_entity_id: taiwanOrg.id,
      contact: {
        email: 'alex.chen@aiesec.tw',
        phone: '+886 912 345 678',
        country: 'Taiwan',
      },
      owner_id: 'usr_yassine_tazi',
    },
    actor
  );

  // 6. Exchanges across Lifecycle Stages
  const res1 = exchangeService.createExchange(
    {
      ep_id: ep1.id,
      opportunity_id: op1.id,
      programme: 'GV',
      status: 'RE',
      owner_id: 'usr_wadii_hani',
      approved_at: '2026-05-10',
      re_date: '2026-06-15',
      fi_date: '2026-07-27',
    },
    actor
  );
  const ex1 = res1.exchange;

  const res2 = exchangeService.createExchange(
    {
      ep_id: ep2.id,
      opportunity_id: op1.id,
      programme: 'GV',
      status: 'APD',
      owner_id: 'usr_sarah_idrissi',
      approved_at: '2026-06-01',
      re_date: '2026-07-01',
      fi_date: '2026-08-12',
    },
    actor
  );
  const ex2 = res2.exchange;

  const res3 = exchangeService.createExchange(
    {
      ep_id: ep3.id,
      opportunity_id: op2.id,
      programme: 'GV',
      status: 'ACP',
      owner_id: 'usr_wadii_hani',
      approved_at: '2026-06-15',
      re_date: '2026-07-15',
      fi_date: '2026-08-26',
    },
    actor
  );
  const ex3 = res3.exchange;

  const res4 = exchangeService.createExchange(
    {
      ep_id: ep4.id,
      opportunity_id: op2.id,
      programme: 'GV',
      status: 'CO',
      owner_id: 'usr_yassine_tazi',
      approved_at: '2026-04-01',
      re_date: '2026-05-01',
      fi_date: '2026-06-12',
    },
    actor
  );
  const ex4 = res4.exchange;

  // 7. Seed Proof Vault Documents
  proofVaultService.registerProofDocument(
    {
      file_name: 'Acceptance_Note_Maria_Silva.pdf',
      mime_type: 'application/pdf',
      file_size_bytes: 142050,
      drive_url: 'https://drive.google.com/file/d/1AIESEC_RABAT_AN_001/view',
      sha256_hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
      uploaded_by: 'usr_wadii_hani',
      metadata: { exchange_id: ex1.id, document_type: 'ACCEPTANCE_NOTE' },
    },
    actor
  );

  proofVaultService.registerProofDocument(
    {
      file_name: 'Visa_Receipt_Maria_Silva.pdf',
      mime_type: 'application/pdf',
      file_size_bytes: 215400,
      drive_url: 'https://drive.google.com/file/d/1AIESEC_RABAT_VISA_001/view',
      sha256_hash: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
      uploaded_by: 'usr_wadii_hani',
      metadata: { exchange_id: ex1.id, document_type: 'VISA_PROOF' },
    },
    actor
  );

  proofVaultService.registerProofDocument(
    {
      file_name: 'Health_Insurance_Lucas_Muller.pdf',
      mime_type: 'application/pdf',
      file_size_bytes: 312000,
      drive_url: 'https://drive.google.com/file/d/1AIESEC_RABAT_INS_002/view',
      sha256_hash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
      uploaded_by: 'usr_sarah_idrissi',
      metadata: { exchange_id: ex2.id, document_type: 'INSURANCE_POLICY' },
    },
    actor
  );

  // 8. Quality Case Sample
  qualityCaseService.createCase(
    {
      exchange_id: ex2.id,
      owner_id: 'usr_sarah_idrissi',
      title: 'Standard #7 Accommodation HVAC Issue',
      description: 'Air conditioning malfunction during heatwave in Rabat Agdal apartment.',
      classification: 'policy_breach',
      compensation_amount: 450,
      currency: 'MAD',
    },
    actor
  );

  // 9. IR Partners (Distinct international Home Entities per §9.3 & §12.1)
  const irDb = getIrEcosystemDb();
  const activeIrHomeEntityIds = new Set(
    Array.from(irDb.irPartners.values())
      .filter((p) => !p.deleted_at)
      .map((p) => p.home_entity_id)
  );

  if (!activeIrHomeEntityIds.has(brazilOrg.id)) {
    irEcosystemService.createIrPartner(
      {
        home_entity_id: brazilOrg.id,
        owner_id: 'usr_wadii_hani',
        cluster: 'upscale',
        re_growth_target: 12,
        tracker_status: 'active',
        review_frequency: 'biweekly',
        strategy: 'AIESEC in Brazil — Scale high conversion supply',
      },
      actor
    );
  }

  if (!activeIrHomeEntityIds.has(germanyOrg.id)) {
    irEcosystemService.createIrPartner(
      {
        home_entity_id: germanyOrg.id,
        owner_id: 'usr_sarah_idrissi',
        cluster: 'grow',
        re_growth_target: 8,
        tracker_status: 'active',
        review_frequency: 'monthly',
        strategy: 'AIESEC in Germany — Structured expansion',
      },
      actor
    );
  }

  if (!activeIrHomeEntityIds.has(taiwanOrg.id)) {
    irEcosystemService.createIrPartner(
      {
        home_entity_id: taiwanOrg.id,
        owner_id: 'usr_yassine_tazi',
        cluster: 'invest',
        re_growth_target: 5,
        tracker_status: 'active',
        review_frequency: 'monthly',
        strategy: 'AIESEC in Taiwan — Seed pilot relations',
      },
      actor
    );
  }

  if (!activeIrHomeEntityIds.has(egyptOrg.id)) {
    irEcosystemService.createIrPartner(
      {
        home_entity_id: egyptOrg.id,
        owner_id: 'usr_wadii_hani',
        cluster: 'understand',
        re_growth_target: 6,
        tracker_status: 'active',
        review_frequency: 'quarterly',
        strategy: 'AIESEC in Egypt — Synergize Arab Region ties',
      },
      actor
    );
  }

  // 10. Run Data Quality Scan to populate DQ radar
  dataQualityService.runDataQualityScan();

  isSeeded = true;
}
