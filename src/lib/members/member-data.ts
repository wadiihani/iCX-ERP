import {
  MemberRecord,
  MemberScoreBreakdown,
  EngagementTier,
  RoutineAttendanceRecord,
  O2OSessionRecord,
  TeamStandardItem,
} from './member-engagement-types';

/**
 * Computes Composite Member Engagement Score (MES 0-100%)
 * Formula:
 * MES = (0.35 * Attendance) + (0.30 * QuotaAttainment) + (0.20 * SlaOnTime) + (0.15 * O2OParticipation)
 */
export function calculateCompositeMes(scores: MemberScoreBreakdown): number {
  const attendance = Math.min(100, Math.max(0, scores.attendance));
  const quota = Math.min(100, Math.max(0, scores.quotaAttainment));
  const sla = Math.min(100, Math.max(0, scores.slaOnTime));
  const o2o = Math.min(100, Math.max(0, scores.o2oParticipation));

  const raw = 0.35 * attendance + 0.3 * quota + 0.2 * sla + 0.15 * o2o;
  return Math.round(Math.min(100, Math.max(0, raw)));
}

/**
 * Derives the 4-tier classification based on MES score
 * 🟢 Tier 1: Core Engaged Group (90%–100%)
 * 🔵 Tier 2: Strong Engagement (70%–89%)
 * 🟡 Tier 3: Moderate / Partial Engagement (20%–69%)
 * 🔴 Tier 4: Critical Drop-Off Risk (<20%)
 */
export function deriveEngagementTier(mes: number): EngagementTier {
  if (mes >= 90) return 'TIER_1_CORE';
  if (mes >= 70) return 'TIER_2_STRONG';
  if (mes >= 20) return 'TIER_3_MODERATE';
  return 'TIER_4_RISK';
}

export function getTierMeta(tier: EngagementTier) {
  switch (tier) {
    case 'TIER_1_CORE':
      return {
        badge: '🟢 Tier 1 Core',
        label: 'Core Engaged Group',
        description: 'Consistent high performers; eligible for leadership promotion & team coaching roles.',
        colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        progressClass: 'bg-emerald-500',
      };
    case 'TIER_2_STRONG':
      return {
        badge: '🔵 Tier 2 Strong',
        label: 'Strong Engagement',
        description: 'Reliable execution; minor quota or attendance gaps to address in monthly O2O.',
        colorClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
        progressClass: 'bg-blue-500',
      };
    case 'TIER_3_MODERATE':
      return {
        badge: '🟡 Tier 3 Moderate',
        label: 'Moderate / Partial',
        description: 'Flagged for Team Leader O2O coaching; needs workload rebalancing or skill support.',
        colorClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        progressClass: 'bg-amber-500',
      };
    case 'TIER_4_RISK':
      return {
        badge: '🔴 Tier 4 Drop-Off Risk',
        label: 'Critical Risk',
        description: 'Urgent LCVP + TM intervention required; consecutive absences or disengagement alarm.',
        colorClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
        progressClass: 'bg-rose-500',
      };
  }
}

// Canonical Rabat 6 Governance Routines
export const RABAT_GOVERNANCE_ROUTINES = [
  { id: 'TEAM_MEETING', title: 'Weekly Team Meeting', cadence: 'Weekly', weight: 0.25 },
  { id: 'CORE_MEETING', title: 'Weekly Core Meeting', cadence: 'Weekly', weight: 0.20 },
  { id: 'DEPT_MEETING', title: 'Bi-Monthly Dept Meeting', cadence: 'Bi-Monthly', weight: 0.15 },
  { id: 'LCM', title: 'Monthly Local Committee Meeting (LCM)', cadence: 'Monthly', weight: 0.20 },
  { id: 'O2O', title: 'Monthly One-to-One (O2O) Coaching', cadence: 'Monthly', weight: 0.10 },
  { id: 'LCP_CALIBRATION', title: 'Monthly LCP Calibration', cadence: 'Monthly', weight: 0.10 },
] as const;

// Global AIESEC Team Standards (TeSt) Master Definitions
export const MASTER_TEAM_STANDARDS: TeamStandardItem[] = [
  // 1. Building Phase
  {
    id: 'TS-B1',
    stage: 'BUILDING',
    title: 'Team Creation & Operating Rules',
    description: 'Team identity, communication channels (WhatsApp/Slack), team values, and working rules agreed.',
    isCompleted: true,
    completedAt: '2026-02-10',
    evidenceUrl: 'https://drive.google.com/drive/folders/aiesec-rabat-test-b1',
  },
  {
    id: 'TS-B2',
    stage: 'BUILDING',
    title: 'Team Plan & Individual Quotas Allocation',
    description: 'Mandate targets broken down into weekly individual member goals (deals, EPs, visits).',
    isCompleted: true,
    completedAt: '2026-02-15',
    evidenceUrl: 'https://drive.google.com/drive/folders/aiesec-rabat-test-b2',
  },
  {
    id: 'TS-B3',
    stage: 'BUILDING',
    title: 'Job Description (JD) & Personal Development Plan (PDP)',
    description: 'Official JD signed and individual leadership competency goals set for each member.',
    isCompleted: true,
    completedAt: '2026-02-20',
    evidenceUrl: 'https://drive.google.com/drive/folders/aiesec-rabat-test-b3',
  },

  // 2. Performing Phase
  {
    id: 'TS-P1',
    stage: 'PERFORMING',
    title: 'Weekly Team Meetings (Punctual & Documented)',
    description: 'Weekly pipeline review, blockers solving, operational updates, and shared learning.',
    isCompleted: true,
    completedAt: '2026-03-01',
    evidenceUrl: 'https://drive.google.com/drive/folders/aiesec-rabat-test-p1',
  },
  {
    id: 'TS-P2',
    stage: 'PERFORMING',
    title: 'Individual KPI Accountability & Tracking',
    description: 'Weekly update of CRM deals, EP dossier statuses, and standards checklist compliance.',
    isCompleted: true,
    completedAt: '2026-03-15',
  },
  {
    id: 'TS-P3',
    stage: 'PERFORMING',
    title: 'Monthly One-to-One (O2O) Coaching Spaces',
    description: 'Formal 1:1 check-in per member covering wellbeing, skill development, and blockers.',
    isCompleted: true,
    completedAt: '2026-03-28',
  },
  {
    id: 'TS-P4',
    stage: 'PERFORMING',
    title: 'Recognition & Incentive Implementation',
    description: 'Monthly recognition of top deals, top EP realization velocity, and peer appreciation.',
    isCompleted: false,
  },
  {
    id: 'TS-P5',
    stage: 'PERFORMING',
    title: 'Constructive Feedback Spaces & Team Calibration',
    description: 'Bi-monthly structured feedback space on team dynamic, peer support, and leadership.',
    isCompleted: false,
  },

  // 3. Closing Phase
  {
    id: 'TS-C1',
    stage: 'CLOSING',
    title: 'Team Performance Debrief & Target Evaluation',
    description: 'Mandate review comparing final exchange numbers against initial commitments.',
    isCompleted: false,
  },
  {
    id: 'TS-C2',
    stage: 'CLOSING',
    title: 'PDP Debrief & Leadership Competency Assessment',
    description: 'Final 1:1 reviewing growth on the AIESEC Leadership Development Model (LDM).',
    isCompleted: false,
  },
  {
    id: 'TS-C3',
    stage: 'CLOSING',
    title: '100% ERP Stakeholder & Knowledge Handover Pack',
    description: 'Full compilation of active partners, contracts, EPs, housing beds, and finance claims transferred without orphaned data.',
    isCompleted: false,
  },
];

// Preloaded AIESEC in Rabat Mandate 26.2 Roster
export const INITIAL_MEMBERS: MemberRecord[] = [
  {
    id: 'mbr-01',
    fullName: 'Wadii Hani',
    email: 'wadii.hani.pro@gmail.com',
    whatsappPhone: '+212 600-112233',
    role: 'LCVP',
    roleTitle: 'LCVP B2B & External Relations',
    department: 'EXTERNAL_BD',
    mandate: '26.2',
    avatar: 'WH',
    attendanceScore: 98,
    quotaScore: 95,
    slaScore: 94,
    o2oScore: 100,
    compositeMes: 96,
    tier: 'TIER_1_CORE',
    assignedEpsCount: 0,
    assignedDealsCount: 12,
    lastActiveDate: '2026-10-29',
    notes: 'LCVP External Engine owner. Manages corporate and CSR partnerships across Rabat-Sale-Kenitra.',
  },
  {
    id: 'mbr-02',
    fullName: 'Omar Joukhane',
    email: 'omar.joukhane@aiesec.net',
    whatsappPhone: '+212 611-223344',
    role: 'MM_TL',
    roleTitle: 'Team Leader B2B Sales & Opportunities',
    department: 'EXTERNAL_BD',
    mandate: '26.2',
    avatar: 'OJ',
    attendanceScore: 92,
    quotaScore: 88,
    slaScore: 90,
    o2oScore: 95,
    compositeMes: 91,
    tier: 'TIER_1_CORE',
    assignedEpsCount: 0,
    assignedDealsCount: 8,
    lastActiveDate: '2026-10-28',
    notes: 'Oversees lead qualification and B2B contract negotiations.',
  },
  {
    id: 'mbr-03',
    fullName: 'Abdenasser Moussafi',
    email: 'abdenasser.moussafi@aiesec.net',
    whatsappPhone: '+212 622-334455',
    role: 'LCVP',
    roleTitle: 'LCVP Operations & Customer Experience',
    department: 'INTERNAL_OPS',
    mandate: '26.2',
    avatar: 'AM',
    attendanceScore: 95,
    quotaScore: 90,
    slaScore: 92,
    o2oScore: 95,
    compositeMes: 93,
    tier: 'TIER_1_CORE',
    assignedEpsCount: 14,
    assignedDealsCount: 0,
    lastActiveDate: '2026-10-29',
    notes: 'LCVP Internal Engine owner. Coordinates EP matching, pre-arrival, and 18 Standards audits.',
  },
  {
    id: 'mbr-04',
    fullName: 'Mouatassim Benkhallouq',
    email: 'mouatassim.benkhallouq@aiesec.net',
    whatsappPhone: '+212 633-445566',
    role: 'MM_TL',
    roleTitle: 'Team Leader EP Experience & Logistics',
    department: 'INTERNAL_OPS',
    mandate: '26.2',
    avatar: 'MB',
    attendanceScore: 88,
    quotaScore: 82,
    slaScore: 85,
    o2oScore: 90,
    compositeMes: 86,
    tier: 'TIER_2_STRONG',
    assignedEpsCount: 12,
    assignedDealsCount: 0,
    lastActiveDate: '2026-10-28',
    notes: 'Supervises airport pickups, vetted housing beds, and Day-1 host accompaniments.',
  },
  {
    id: 'mbr-05',
    fullName: 'Nourdine Ettaoumi',
    email: 'nourdine.ettaoumi@aiesec.net',
    whatsappPhone: '+212 644-556677',
    role: 'LCVP',
    roleTitle: 'LCVP Finance & Legal (FnL)',
    department: 'FINANCE',
    mandate: '26.2',
    avatar: 'NE',
    attendanceScore: 96,
    quotaScore: 92,
    slaScore: 96,
    o2oScore: 90,
    compositeMes: 94,
    tier: 'TIER_1_CORE',
    assignedEpsCount: 0,
    assignedDealsCount: 0,
    lastActiveDate: '2026-10-29',
    notes: 'FnL auditor, statutory invoices, dual approvals, and ECB Annex 2 compensation reserves.',
  },
  {
    id: 'mbr-06',
    fullName: 'Rayen Jbali',
    email: 'rayen.jbali@aiesec.net',
    whatsappPhone: '+212 655-667788',
    role: 'TM',
    roleTitle: 'B2B Sales Account Specialist',
    department: 'EXTERNAL_BD',
    mandate: '26.2',
    avatar: 'RJ',
    attendanceScore: 82,
    quotaScore: 78,
    slaScore: 75,
    o2oScore: 85,
    compositeMes: 79,
    tier: 'TIER_2_STRONG',
    assignedEpsCount: 0,
    assignedDealsCount: 5,
    lastActiveDate: '2026-10-27',
  },
  {
    id: 'mbr-07',
    fullName: 'Firdawsse Jray',
    email: 'firdawsse.jray@aiesec.net',
    whatsappPhone: '+212 666-778899',
    role: 'TM',
    roleTitle: 'EP Matching & Visa Specialist',
    department: 'INTERNAL_OPS',
    mandate: '26.2',
    avatar: 'FJ',
    attendanceScore: 85,
    quotaScore: 80,
    slaScore: 82,
    o2oScore: 90,
    compositeMes: 84,
    tier: 'TIER_2_STRONG',
    assignedEpsCount: 8,
    assignedDealsCount: 0,
    lastActiveDate: '2026-10-28',
  },
  {
    id: 'mbr-08',
    fullName: 'Salma Sahl',
    email: 'salma.sahl@aiesec.net',
    whatsappPhone: '+212 677-889900',
    role: 'TM',
    roleTitle: 'Exchange Standards & CXP Specialist',
    department: 'CXP_QUALITY',
    mandate: '26.2',
    avatar: 'SS',
    attendanceScore: 75,
    quotaScore: 68,
    slaScore: 70,
    o2oScore: 80,
    compositeMes: 73,
    tier: 'TIER_2_STRONG',
    assignedEpsCount: 6,
    assignedDealsCount: 0,
    lastActiveDate: '2026-10-26',
  },
  {
    id: 'mbr-09',
    fullName: 'Mohamed El Kahri',
    email: 'mohamed.elkahri@aiesec.net',
    whatsappPhone: '+212 688-990011',
    role: 'MM_TL',
    roleTitle: 'Team Leader Accounting & Sustainability',
    department: 'FINANCE',
    mandate: '26.2',
    avatar: 'MK',
    attendanceScore: 70,
    quotaScore: 65,
    slaScore: 68,
    o2oScore: 75,
    compositeMes: 69,
    tier: 'TIER_3_MODERATE',
    assignedEpsCount: 0,
    assignedDealsCount: 0,
    lastActiveDate: '2026-10-25',
    notes: 'Score dropped due to exam period; scheduled for O2O coaching with Nourdine.',
  },
  {
    id: 'mbr-10',
    fullName: 'Yasmine Bennani',
    email: 'yasmine.bennani@aiesec.net',
    whatsappPhone: '+212 699-001122',
    role: 'TM',
    roleTitle: 'Lead Generation & Market Research',
    department: 'EXTERNAL_BD',
    mandate: '26.2',
    avatar: 'YB',
    attendanceScore: 55,
    quotaScore: 45,
    slaScore: 50,
    o2oScore: 60,
    compositeMes: 52,
    tier: 'TIER_3_MODERATE',
    assignedEpsCount: 0,
    assignedDealsCount: 2,
    lastActiveDate: '2026-10-20',
    notes: 'Flagged for TL O2O coaching on B2B prospecting techniques.',
  },
  {
    id: 'mbr-11',
    fullName: 'Mehdi Alami',
    email: 'mehdi.alami@aiesec.net',
    whatsappPhone: '+212 601-234567',
    role: 'TM',
    roleTitle: 'Airport Pickup & Housing Buddy',
    department: 'INTERNAL_OPS',
    mandate: '26.2',
    avatar: 'MA',
    attendanceScore: 18,
    quotaScore: 15,
    slaScore: 20,
    o2oScore: 10,
    compositeMes: 16,
    tier: 'TIER_4_RISK',
    assignedEpsCount: 2,
    assignedDealsCount: 0,
    lastActiveDate: '2026-10-12',
    notes: 'Critical drop-off risk. 3 consecutive LCM and team meeting absences. Flagged for LCVP intervention.',
  },
  {
    id: 'mbr-12',
    fullName: 'Zineb Chraibi',
    email: 'zineb.chraibi@aiesec.net',
    whatsappPhone: '+212 612-345678',
    role: 'TM',
    roleTitle: 'EP Welcoming & Cultural Integration',
    department: 'CXP_QUALITY',
    mandate: '26.2',
    avatar: 'ZC',
    attendanceScore: 88,
    quotaScore: 85,
    slaScore: 88,
    o2oScore: 90,
    compositeMes: 87,
    tier: 'TIER_2_STRONG',
    assignedEpsCount: 5,
    assignedDealsCount: 0,
    lastActiveDate: '2026-10-28',
  },
];

// Initial O2O Coaching Records
export const INITIAL_O2O_SESSIONS: O2OSessionRecord[] = [
  {
    id: 'o2o-01',
    memberId: 'mbr-06',
    memberName: 'Rayen Jbali',
    coachId: 'mbr-02',
    coachName: 'Omar Joukhane',
    date: '2026-10-22',
    wellbeingScore: 4,
    kpiReviewNotes: 'Qualified 4 new corporate leads in Hassan/Agdal sector. Follow-up velocity is on target.',
    blockers: 'Delayed responses from school directors during mid-term exam break.',
    actionItems: 'Pivot outreach to university tech clubs and English institutes this week.',
    followUpDate: '2026-11-05',
  },
  {
    id: 'mbr-02_o2o',
    memberId: 'mbr-09',
    memberName: 'Mohamed El Kahri',
    coachId: 'mbr-05',
    coachName: 'Nourdine Ettaoumi',
    date: '2026-10-20',
    wellbeingScore: 3,
    kpiReviewNotes: 'Reconciliation of October receipts completed, but pending invoice follow-up was delayed.',
    blockers: 'University midterm exams conflicting with Tuesday finance space.',
    actionItems: 'Move review block to Saturday morning and automate invoice overdue alerts.',
    followUpDate: '2026-11-03',
  },
  {
    id: 'o2o-03',
    memberId: 'mbr-10',
    memberName: 'Yasmine Bennani',
    coachId: 'mbr-02',
    coachName: 'Omar Joukhane',
    date: '2026-10-18',
    wellbeingScore: 3,
    kpiReviewNotes: 'Completed LinkedIn prospecting list, but phone qualification call conversion is low.',
    blockers: 'Hesitation on cold phone pitches in French/Arabic.',
    actionItems: 'Shadow 3 live sales calls with Wadii Hani on Wednesday morning.',
    followUpDate: '2026-11-01',
  },
];

// Generates 16 weeks of routine attendance samples for a member
export function generateMemberAttendance(memberId: string): RoutineAttendanceRecord[] {
  const weeks = Array.from({ length: 16 }, (_, i) => `W${i + 1}`);
  const member = INITIAL_MEMBERS.find((m) => m.id === memberId) || INITIAL_MEMBERS[0];

  return weeks.map((week, idx) => {
    let status: 'ON_TIME' | 'LATE' | 'ABSENT' | 'EXCUSED' = 'ON_TIME';

    if (member.tier === 'TIER_4_RISK') {
      status = idx > 4 ? 'ABSENT' : idx % 2 === 0 ? 'LATE' : 'ABSENT';
    } else if (member.tier === 'TIER_3_MODERATE') {
      status = idx % 3 === 0 ? 'LATE' : idx % 5 === 0 ? 'EXCUSED' : 'ON_TIME';
    } else if (member.tier === 'TIER_2_STRONG') {
      status = idx === 6 || idx === 11 ? 'LATE' : idx === 9 ? 'EXCUSED' : 'ON_TIME';
    } else {
      status = idx === 12 ? 'EXCUSED' : 'ON_TIME';
    }

    const hasO2o = idx % 4 === 3;

    return {
      week,
      routine: 'TEAM_MEETING',
      status,
      hasO2o,
      date: `2026-${String(Math.floor(idx / 4) + 7).padStart(2, '0')}-${String((idx % 4) * 7 + 5).padStart(2, '0')}`,
    };
  });
}
