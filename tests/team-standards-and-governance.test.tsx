import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  generateMemberAttendance,
  MASTER_TEAM_STANDARDS,
  INITIAL_MEMBERS,
  RABAT_GOVERNANCE_ROUTINES,
} from '../src/lib/members/member-data';
import { GovernanceAttendanceGrid } from '../src/components/members/governance-attendance-grid';
import { TeamStandardsScorecard } from '../src/components/members/team-standards-scorecard';
import { MandateHandoverModal } from '../src/components/members/mandate-handover-modal';

describe('Team Standards & Governance Routines (Phase 12 / HUB-TM-02..04)', () => {
  it('generates 16 weeks of attendance records reflecting engagement levels', () => {
    const wadiiAttendance = generateMemberAttendance('mbr-01');
    expect(wadiiAttendance).toHaveLength(16);
    expect(wadiiAttendance[0].week).toBe('W1');
    expect(wadiiAttendance[15].week).toBe('W16');

    // High performer should have predominantly on-time attendance
    const onTimeCount = wadiiAttendance.filter((r) => r.status === 'ON_TIME').length;
    expect(onTimeCount).toBeGreaterThanOrEqual(14);

    // Drop-off risk member should have high absences
    const riskAttendance = generateMemberAttendance('mbr-11');
    expect(riskAttendance).toHaveLength(16);
    const absentCount = riskAttendance.filter((r) => r.status === 'ABSENT').length;
    expect(absentCount).toBeGreaterThan(5);
  });

  it('validates canonical structure of AIESEC Global Team Standards', () => {
    expect(MASTER_TEAM_STANDARDS.length).toBe(11);

    const building = MASTER_TEAM_STANDARDS.filter((s) => s.stage === 'BUILDING');
    const performing = MASTER_TEAM_STANDARDS.filter((s) => s.stage === 'PERFORMING');
    const closing = MASTER_TEAM_STANDARDS.filter((s) => s.stage === 'CLOSING');

    expect(building).toHaveLength(3);
    expect(performing).toHaveLength(5);
    expect(closing).toHaveLength(3);

    expect(building.map((s) => s.id)).toEqual(['TS-B1', 'TS-B2', 'TS-B3']);
    expect(performing.map((s) => s.id)).toEqual(['TS-P1', 'TS-P2', 'TS-P3', 'TS-P4', 'TS-P5']);
    expect(closing.map((s) => s.id)).toEqual(['TS-C1', 'TS-C2', 'TS-C3']);
  });

  it('renders GovernanceAttendanceGrid with heatmap and routine controls', () => {
    const html = renderToStaticMarkup(
      <GovernanceAttendanceGrid members={INITIAL_MEMBERS} selectedMemberId="mbr-01" />
    );

    expect(html).toContain('Rabat 6 Mandatory Governance Routines');
    expect(html).toContain('Weekly Cadence Matrix (W1 – W16)');
    expect(html).toContain('W1');
    expect(html).toContain('W16');
    expect(html).toContain('Punctuality');
  });

  it('renders TeamStandardsScorecard with completion indicators', () => {
    const html = renderToStaticMarkup(<TeamStandardsScorecard />);

    expect(html).toContain('AIESEC Global Team Standards (TeSt) Scorecard');
    expect(html).toContain('1. Building Phase');
    expect(html).toContain('2. Performing Phase');
    expect(html).toContain('3. Closing Phase');
    expect(html).toContain('TS-B1');
    expect(html).toContain('TS-C3');
  });

  it('renders MandateHandoverModal with complete operational transfer metrics', () => {
    const html = renderToStaticMarkup(
      <MandateHandoverModal isOpen={true} onClose={() => {}} members={INITIAL_MEMBERS} />
    );

    expect(html).toContain('Mandate Handover Pack Generator (Mandate 26.2)');
    expect(html).toContain('B2B Deals');
    expect(html).toContain('EP Dossiers');
    expect(html).toContain('Vetted Beds');
    expect(html).toContain('Receivables');
    expect(html).toContain('External Engine (B2B Sales &amp; CSR)');
    expect(html).toContain('Finance &amp; Legal (FnL)');
  });
});
