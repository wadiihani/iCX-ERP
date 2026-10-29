/**
 * Refreshed Exchange Standards & Customer Feedback Action Loop Engine
 * Statutory Baseline: HUB-STD-02, HUB-STD-03, HUB-CXP-01, AEPP 2026 Refreshed Standards
 * 
 * Rules:
 * 1. 18 Refreshed Standards with Standard #10 split into:
 *    - #10a: Initial OP Alignment (Middle Survey - Week 1 Deliverables)
 *    - #10b: Closing OP Alignment (Final Survey - Project Output & Sign-off)
 * 2. Per-standard evidence: type, link, verification officer, timestamp.
 * 3. Dual-track reconciliation: Internal delivery vs. official EXPA survey answer.
 * 4. Discrepancy detector alerts when internal says delivered but EP answers NO.
 * 5. Customer Feedback Action Loop: converts negative touchpoint (mood <= 2 or housing/hours issue) into a corrective action task.
 */

export interface RefreshedStandardDefinition {
  id: string; // '1'..'18', plus '10a' and '10b'
  code: string;
  name: string;
  stage: 'PREPARATION' | 'EXPERIENCE' | 'POST_EXPERIENCE';
  surveyPhase: 'Pre-Arrival' | 'Middle Survey' | 'Final Survey' | 'Throughout';
  responsibleEntity: 'HOST_ENTITY' | 'SENDING_ENTITY' | 'BOTH';
  isMandatory: boolean;
  defaultEvidenceType: 'DOCUMENT' | 'SIGNED_FORM' | 'SYSTEM_TIMESTAMP' | 'IN_PERSON_VERIFICATION';
  guidanceText: string;
}

export const REFRESHED_STANDARDS_CATALOG: RefreshedStandardDefinition[] = [
  {
    id: '1',
    code: 'STD-01',
    name: 'Personal Goal Setting',
    stage: 'PREPARATION',
    surveyPhase: 'Middle Survey',
    responsibleEntity: 'SENDING_ENTITY',
    isMandatory: true,
    defaultEvidenceType: 'DOCUMENT',
    guidanceText: 'EP completes LDA (Leadership Development Assessment) and sets 3 personal goals with Sending LC before departure.',
  },
  {
    id: '2',
    code: 'STD-02',
    name: 'Outgoing Preparation (OPS)',
    stage: 'PREPARATION',
    surveyPhase: 'Middle Survey',
    responsibleEntity: 'SENDING_ENTITY',
    isMandatory: true,
    defaultEvidenceType: 'SIGNED_FORM',
    guidanceText: 'Sending LC conducts official Outgoing Preparation Seminar covering cultural adjustment and AIESEC purpose.',
  },
  {
    id: '3',
    code: 'STD-03',
    name: 'Insurance',
    stage: 'PREPARATION',
    surveyPhase: 'Middle Survey',
    responsibleEntity: 'SENDING_ENTITY',
    isMandatory: true,
    defaultEvidenceType: 'DOCUMENT',
    guidanceText: 'Valid international travel & health insurance covering entire duration of stay in Morocco (including emergency repatriation).',
  },
  {
    id: '4',
    code: 'STD-04',
    name: 'Expectation Setting',
    stage: 'PREPARATION',
    surveyPhase: 'Middle Survey',
    responsibleEntity: 'HOST_ENTITY',
    isMandatory: true,
    defaultEvidenceType: 'SIGNED_FORM',
    guidanceText: 'Written job description, living conditions, cultural norms, and local costs agreed between EP and Host LC.',
  },
  {
    id: '5',
    code: 'STD-05',
    name: 'Visa and Work Validity',
    stage: 'PREPARATION',
    surveyPhase: 'Middle Survey',
    responsibleEntity: 'HOST_ENTITY',
    isMandatory: true,
    defaultEvidenceType: 'DOCUMENT',
    guidanceText: 'Official visa assistance pack, invitation letter, and Moroccan visa clearance verified prior to travel.',
  },
  {
    id: '6',
    code: 'STD-06',
    name: 'Arrival Pickup & 3-Day Guide',
    stage: 'PREPARATION',
    surveyPhase: 'Middle Survey',
    responsibleEntity: 'HOST_ENTITY',
    isMandatory: true,
    defaultEvidenceType: 'IN_PERSON_VERIFICATION',
    guidanceText: 'Written pickup guide sent 3 days prior; in-person greeting at airport/train station by assigned LC buddy.',
  },
  {
    id: '7',
    code: 'STD-07',
    name: 'Accommodation',
    stage: 'EXPERIENCE',
    surveyPhase: 'Middle Survey',
    responsibleEntity: 'HOST_ENTITY',
    isMandatory: true,
    defaultEvidenceType: 'IN_PERSON_VERIFICATION',
    guidanceText: 'Clean single bed, running water, electricity, working bathroom, and secure lock as described in opportunity contract.',
  },
  {
    id: '8',
    code: 'STD-08',
    name: 'Incoming Preparation Seminar (IPS)',
    stage: 'EXPERIENCE',
    surveyPhase: 'Middle Survey',
    responsibleEntity: 'HOST_ENTITY',
    isMandatory: true,
    defaultEvidenceType: 'SIGNED_FORM',
    guidanceText: 'In-country orientation delivered within first 72 hours covering Moroccan culture, LC contacts, safety rules, and project induction.',
  },
  {
    id: '9',
    code: 'STD-09',
    name: 'First Day of Work Accompaniment',
    stage: 'EXPERIENCE',
    surveyPhase: 'Middle Survey',
    responsibleEntity: 'HOST_ENTITY',
    isMandatory: true,
    defaultEvidenceType: 'IN_PERSON_VERIFICATION',
    guidanceText: 'AIESEC member personally escorts EP to the Opportunity Provider workplace on day 1 and introduces supervisor.',
  },
  {
    id: '10a',
    code: 'STD-10a',
    name: 'Initial Alignment with OP (Week 1)',
    stage: 'EXPERIENCE',
    surveyPhase: 'Middle Survey',
    responsibleEntity: 'HOST_ENTITY',
    isMandatory: true,
    defaultEvidenceType: 'DOCUMENT',
    guidanceText: 'Meeting within week 1 with OP supervisor to align on week-by-week activities, KPIs, deliverables, and working schedule.',
  },
  {
    id: '10b',
    code: 'STD-10b',
    name: 'Closing Alignment with OP (Final Week)',
    stage: 'EXPERIENCE',
    surveyPhase: 'Final Survey',
    responsibleEntity: 'HOST_ENTITY',
    isMandatory: true,
    defaultEvidenceType: 'DOCUMENT',
    guidanceText: 'Closing evaluation meeting between EP, OP supervisor, and AIESEC to verify final project outputs and handover certificate.',
  },
  {
    id: '11',
    code: 'STD-11',
    name: 'Job Description Compliance',
    stage: 'EXPERIENCE',
    surveyPhase: 'Final Survey',
    responsibleEntity: 'HOST_ENTITY',
    isMandatory: true,
    defaultEvidenceType: 'DOCUMENT',
    guidanceText: 'Tasks performed by EP match the agreed JD and SDG outputs in the signed agreement and EXPA opportunity.',
  },
  {
    id: '12',
    code: 'STD-12',
    name: 'Working Hours Compliance',
    stage: 'EXPERIENCE',
    surveyPhase: 'Final Survey',
    responsibleEntity: 'HOST_ENTITY',
    isMandatory: true,
    defaultEvidenceType: 'SYSTEM_TIMESTAMP',
    guidanceText: 'iGV: 25-35 hours/week. iGTa/e: 35-40 hours/week. Overtime strictly voluntary and compensated where applicable.',
  },
  {
    id: '13',
    code: 'STD-13',
    name: 'Duration Compliance',
    stage: 'EXPERIENCE',
    surveyPhase: 'Final Survey',
    responsibleEntity: 'HOST_ENTITY',
    isMandatory: true,
    defaultEvidenceType: 'SYSTEM_TIMESTAMP',
    guidanceText: 'Realization duration conforms to AEPP product minimums (iGV 6-8w, iGTe 6-12w, iGTa 6-78w) from realization to completion.',
  },
  {
    id: '14',
    code: 'STD-14',
    name: 'Opportunity Provider Minimum Benefits',
    stage: 'EXPERIENCE',
    surveyPhase: 'Final Survey',
    responsibleEntity: 'HOST_ENTITY',
    isMandatory: true,
    defaultEvidenceType: 'DOCUMENT',
    guidanceText: 'All benefits stated in EXPA opportunity (stipend, accommodation, transport) delivered in full without post-approval reduction.',
  },
  {
    id: '15',
    code: 'STD-15',
    name: 'Departure Support',
    stage: 'POST_EXPERIENCE',
    surveyPhase: 'Final Survey',
    responsibleEntity: 'HOST_ENTITY',
    isMandatory: true,
    defaultEvidenceType: 'IN_PERSON_VERIFICATION',
    guidanceText: 'Clear written instructions on checkout, transit to airport/station, and assistance with return travel logistics.',
  },
  {
    id: '16',
    code: 'STD-16',
    name: 'Debrief with Host LC',
    stage: 'POST_EXPERIENCE',
    surveyPhase: 'Final Survey',
    responsibleEntity: 'HOST_ENTITY',
    isMandatory: true,
    defaultEvidenceType: 'SIGNED_FORM',
    guidanceText: 'Debrief meeting between EP and VP CXP reflecting on leadership development, cultural takeaways, and Morocco experience.',
  },
  {
    id: '17',
    code: 'STD-17',
    name: 'Regular Touchpoints (Bi-weekly)',
    stage: 'EXPERIENCE',
    surveyPhase: 'Throughout',
    responsibleEntity: 'HOST_ENTITY',
    isMandatory: true,
    defaultEvidenceType: 'SYSTEM_TIMESTAMP',
    guidanceText: 'Formal bi-weekly check-ins logging EP wellbeing, workplace conditions, housing state, and safety check.',
  },
  {
    id: '18',
    code: 'STD-18',
    name: 'Re-integration Seminar (RIS)',
    stage: 'POST_EXPERIENCE',
    surveyPhase: 'Final Survey',
    responsibleEntity: 'SENDING_ENTITY',
    isMandatory: true,
    defaultEvidenceType: 'SIGNED_FORM',
    guidanceText: 'Sending LC welcomes EP back home, reviews final LDA assessment, and integrates learnings into future leadership paths.',
  },
];

export interface EpStandardDeliveryItem {
  standardId: string; // '1'..'18', '10a', '10b'
  internalDelivered: boolean;
  deliveryDate?: string;
  evidenceUrl?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  expaSurveyAnswer: 'YES' | 'NO' | 'PENDING';
  isDiscrepancy: boolean;
  notes?: string;
}

export interface CustomerTouchpointRecord {
  id: string;
  epId: string;
  epName: string;
  touchpointDate: string; // YYYY-MM-DD
  officerName: string;
  overallMood: number; // 1 to 5
  workingHoursSatisfied: boolean;
  housingSatisfied: boolean;
  deliverablesOnTrack: boolean;
  notes: string;
  requiresAction: boolean;
  actionTaskId?: string;
}

export interface CorrectiveActionTask {
  id: string;
  epId: string;
  epName: string;
  sourceTouchpointId: string;
  title: string;
  severity: 'HIGH' | 'EMERGENCY' | 'MEDIUM';
  assignedRole: string;
  assignedMemberName: string;
  deadlineHours: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  resolutionNotes?: string;
  createdAt: string;
}

/**
 * Calculates fulfillment rate across refreshed standards catalog.
 */
export function calculateRefreshedFulfillment(standards: Record<string, EpStandardDeliveryItem>) {
  const total = REFRESHED_STANDARDS_CATALOG.length; // 19 items (with 10a & 10b)
  let deliveredCount = 0;
  let discrepancyCount = 0;

  for (const std of REFRESHED_STANDARDS_CATALOG) {
    const item = standards[std.id];
    if (item?.internalDelivered) {
      deliveredCount++;
    }
    if (item?.isDiscrepancy) {
      discrepancyCount++;
    }
  }

  const fulfillmentPercentage = Math.round((deliveredCount / total) * 100);

  return {
    total,
    deliveredCount,
    discrepancyCount,
    fulfillmentPercentage,
  };
}

/**
 * Customer Feedback Action Loop: converts negative touchpoint into an actionable corrective task.
 */
export function generateCorrectiveTaskFromTouchpoint(
  touchpoint: CustomerTouchpointRecord,
  assigneeName: string = 'Amina Benali (VP CXP)'
): CorrectiveActionTask {
  const issues: string[] = [];
  if (touchpoint.overallMood <= 2) issues.push(`Low mood score (${touchpoint.overallMood}/5)`);
  if (!touchpoint.workingHoursSatisfied) issues.push('Working hours dispute reported');
  if (!touchpoint.housingSatisfied) issues.push('Accommodation dissatisfaction');
  if (!touchpoint.deliverablesOnTrack) issues.push('Project deliverables off track');

  const issueSummary = issues.length > 0 ? issues.join(', ') : 'Urgent participant check-in';
  const isEmergency = touchpoint.overallMood === 1 || !touchpoint.housingSatisfied;

  return {
    id: `task_action_${Date.now()}`,
    epId: touchpoint.epId,
    epName: touchpoint.epName,
    sourceTouchpointId: touchpoint.id,
    title: `[CXP Corrective Action] ${issueSummary} - ${touchpoint.epName}`,
    severity: isEmergency ? 'EMERGENCY' : 'HIGH',
    assignedRole: 'VP CXP',
    assignedMemberName: assigneeName,
    deadlineHours: isEmergency ? 24 : 48,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
}
