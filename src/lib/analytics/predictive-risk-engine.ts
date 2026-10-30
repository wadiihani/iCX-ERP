/**
 * AIESEC iCX ERP — Predictive Risk & Operational Intelligence Engine
 * Assesses drop-off risk probability, visa bottlenecks, and SLA compliance
 * for Exchange Participants in the Rabat 26.2 pipeline.
 */

import type { EPRecord } from '@/lib/ep/ep-data';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface EpRiskAssessment {
  score: number; // 0 to 100
  level: RiskLevel;
  primaryRiskFactor: string | null;
  riskFactors: string[];
  recommendedAction: string;
}

export function calculateEpDropOffRisk(ep: EPRecord): EpRiskAssessment {
  let score = 10; // Baseline friction
  const factors: string[] = [];

  // 1. Visa Timeline Risk
  if (ep.status === 'APPROVED' || ep.status === 'ACCEPTED') {
    if (ep.visa_status === 'REJECTED') {
      score += 70;
      factors.push('Visa rejected by consular authorities');
    } else if (ep.visa_status === 'SUBMITTED') {
      score += 20;
      factors.push('Visa application under consular processing');
    }
  }

  // 2. Arrival Proximity vs Readiness
  if (ep.arrivalDate && ep.status === 'APPROVED') {
    try {
      const now = new Date('2026-10-30T00:00:00Z');
      const arrival = new Date(ep.arrivalDate);
      const daysUntilArrival = Math.round((arrival.getTime() - now.getTime()) / (1000 * 3600 * 24));

      if (daysUntilArrival >= 0 && daysUntilArrival <= 7 && (!ep.flightNumber || !ep.pickupBuddyUserId)) {
        score += 30;
        factors.push(`Arrival in ${daysUntilArrival}d without confirmed flight or pickup buddy`);
      } else if (daysUntilArrival > 0 && daysUntilArrival <= 14 && ep.visa_status !== 'APPROVED') {
        score += 25;
        factors.push(`Arrival in ${daysUntilArrival}d while visa is still pending`);
      }
    } catch {
      // ignore date parse issues
    }
  }

  // 3. Standards Delivery Discrepancies
  if (ep.standardsDelivery) {
    const discrepancies = Object.values(ep.standardsDelivery).filter((s) => s.discrepancyFlag);
    if (discrepancies.length > 0) {
      score += discrepancies.length * 20;
      factors.push(`${discrepancies.length} active standard discrepancy flagged by EP`);
    }
  }

  // 4. Missing Mandatory Dossier Elements
  if (!ep.passportNumber || ep.passportNumber.includes('MISSING')) {
    score += 20;
    factors.push('Passport biodata page not uploaded');
  }

  // Cap score between 0 and 100
  const normalizedScore = Math.min(100, Math.max(0, score));

  let level: RiskLevel = 'LOW';
  if (normalizedScore >= 65) {
    level = 'HIGH';
  } else if (normalizedScore >= 35) {
    level = 'MEDIUM';
  }

  // Recommended Action
  let recommendedAction = 'Maintain standard touchpoint cadence.';
  if (level === 'HIGH') {
    if (factors.some((f) => f.includes('Visa'))) {
      recommendedAction = 'Immediate LCVP CXP consular escalation / AEVM fast-track.';
    } else if (factors.some((f) => f.includes('discrepancy'))) {
      recommendedAction = 'Schedule emergency 24h quality arbitration meeting.';
    } else {
      recommendedAction = 'Execute urgent phone call follow-up with sending LC coordinator.';
    }
  } else if (level === 'MEDIUM') {
    recommendedAction = 'Trigger automated WhatsApp reminder via Communication Copilot.';
  }

  return {
    score: normalizedScore,
    level,
    primaryRiskFactor: factors[0] || null,
    riskFactors: factors,
    recommendedAction,
  };
}
