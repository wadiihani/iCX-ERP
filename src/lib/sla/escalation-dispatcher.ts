/**
 * Multi-Tier SLA Escalation Dispatcher (REQ-052, TEST-048)
 * Baseline: Member -> Team Leader (80%) -> VP iGV (100%) -> LCP (150% / Crisis)
 */

export type EscalationTier = 'MEMBER' | 'TEAM_LEADER' | 'VP_IGV' | 'LCP';

export interface EscalationRecipient {
  role: EscalationTier;
  title: string;
  channel: 'IN_APP_BANNER' | 'EMAIL_ALERT' | 'WHATSAPP_CRISIS' | 'PUSH_NOTIFICATION';
  mandatoryActionRequired: boolean;
}

export interface EscalationDispatchPayload {
  applicationId: string;
  epName: string;
  slaName: string;
  urgency: 'NORMAL' | 'WARNING_80' | 'BREACHED_100' | 'CRITICAL_150';
  hoursElapsed: number;
  hoursAllowed: number;
  isCrisis?: boolean;
}

export interface EscalationDispatchPlan {
  dispatchedTiers: EscalationTier[];
  recipients: EscalationRecipient[];
  highestTier: EscalationTier;
  auditMessage: string;
}

/**
 * Determines exact routing tiers and communication channels based on SLA urgency.
 */
export function dispatchSlaEscalation(payload: EscalationDispatchPayload): EscalationDispatchPlan {
  const recipients: EscalationRecipient[] = [];
  const dispatchedTiers: EscalationTier[] = [];

  // Member is always kept in the loop
  recipients.push({
    role: 'MEMBER',
    title: 'Exchange Participant Manager',
    channel: 'IN_APP_BANNER',
    mandatoryActionRequired: payload.urgency !== 'NORMAL',
  });
  dispatchedTiers.push('MEMBER');

  if (payload.urgency === 'WARNING_80') {
    // 80% SLA Warning -> Escalated to Team Leader
    recipients.push({
      role: 'TEAM_LEADER',
      title: 'iGV Team Leader',
      channel: 'PUSH_NOTIFICATION',
      mandatoryActionRequired: true,
    });
    dispatchedTiers.push('TEAM_LEADER');
  } else if (payload.urgency === 'BREACHED_100') {
    // 100% SLA Breach -> Escalated to TL and VP iGV
    recipients.push({
      role: 'TEAM_LEADER',
      title: 'iGV Team Leader',
      channel: 'PUSH_NOTIFICATION',
      mandatoryActionRequired: true,
    });
    recipients.push({
      role: 'VP_IGV',
      title: 'Vice President iGV',
      channel: 'EMAIL_ALERT',
      mandatoryActionRequired: true,
    });
    dispatchedTiers.push('TEAM_LEADER', 'VP_IGV');
  } else if (payload.urgency === 'CRITICAL_150' || payload.isCrisis) {
    // 150% Critical Breach or Safety Crisis -> Full Executive Escalation (TL, VP, LCP)
    recipients.push({
      role: 'TEAM_LEADER',
      title: 'iGV Team Leader',
      channel: 'PUSH_NOTIFICATION',
      mandatoryActionRequired: true,
    });
    recipients.push({
      role: 'VP_IGV',
      title: 'Vice President iGV',
      channel: 'EMAIL_ALERT',
      mandatoryActionRequired: true,
    });
    recipients.push({
      role: 'LCP',
      title: 'Local Committee President',
      channel: payload.isCrisis ? 'WHATSAPP_CRISIS' : 'EMAIL_ALERT',
      mandatoryActionRequired: true,
    });
    dispatchedTiers.push('TEAM_LEADER', 'VP_IGV', 'LCP');
  }

  const highestTier: EscalationTier = dispatchedTiers[dispatchedTiers.length - 1];

  const auditMessage = `[SLA-ESCALATION] App ${payload.applicationId} (${payload.epName}) - SLA "${payload.slaName}": Urgency ${payload.urgency} (${payload.hoursElapsed}h/${payload.hoursAllowed}h). Dispatched to ${dispatchedTiers.join(', ')}.`;

  return {
    dispatchedTiers,
    recipients,
    highestTier,
    auditMessage,
  };
}
