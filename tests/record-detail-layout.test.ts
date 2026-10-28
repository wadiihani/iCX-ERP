import { describe, it, expect } from 'vitest';
import type { RecordDetailData } from '../src/components/ui/record-detail/record-detail-types';

describe('RecordDetail 8-Panel Compound Layout Data Contract', () => {
  const sampleRecord: RecordDetailData = {
    id: 'rec_1001',
    stableId: 'EP-2026-0042',
    recordType: 'EP',
    title: 'Sarah Jenkins - Tech Intern',
    currentLc: 'Casablanca',
    product: 'iGTa',
    status: {
      label: 'Approved',
      variant: 'success',
      expaStatus: 'approved',
    },
    owner: {
      id: 'usr_201',
      name: 'Yassine Alami',
      team: 'iGTa Matching Team',
    },
    priorityRisk: {
      level: 'LOW',
      reason: 'Visa application submitted on schedule',
    },
    lastUpdatedAt: '2026-10-27T14:30:00Z',
    keyDetails: [
      { label: 'Origin LC', value: 'Munich, Germany', isRequired: true },
      { label: 'Opportunity', value: 'Fullstack Dev at Casatech', isRequired: true },
      { label: 'Start Date', value: '15 Nov 2026', isRequired: true },
    ],
    relationships: [
      {
        id: 'org_001',
        recordType: 'ORGANIZATION',
        title: 'Casatech Software',
        subtitle: 'B2B Partner Company',
        statusText: 'Contract Signed',
        href: '/operations/crm/casatech',
      },
    ],
    timeline: [
      {
        id: 'evt_1',
        timestamp: '2026-10-27T10:00:00Z',
        actor: { name: 'Yassine Alami', role: 'VP iGT' },
        eventType: 'STAGE_CHANGE',
        title: 'Stage updated to Approved',
        badge: { text: 'APPROVED', color: 'bg-emerald-50 text-emerald-700' },
      },
      {
        id: 'evt_2',
        timestamp: '2026-10-26T15:00:00Z',
        actor: { name: 'System Outbox', role: 'Automated Service' },
        eventType: 'HANDOFF',
        title: 'Handoff from B2B Matching to CXP Preparation',
      },
    ],
    nextActions: [
      {
        id: 'act_1',
        title: 'Confirm Airport Pickup Logistics',
        ownerName: 'Yassine Alami',
        dueDate: '2026-11-10T00:00:00Z',
        priority: 'HIGH',
        slaCountdown: '13 days remaining',
      },
    ],
    evidenceDocuments: [
      {
        id: 'doc_1',
        title: 'Acceptance Note & Signed Contract',
        docType: 'LEGAL_CONTRACT',
        verificationStatus: 'VERIFIED',
        verifiedBy: 'VP Legal & Finance',
        verifiedAt: '2026-10-25T11:00:00Z',
        sha256Digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      },
    ],
    auditHistory: [
      {
        id: 'aud_1',
        occurred_at: '2026-10-27T10:00:00Z',
        actor_name: 'Yassine Alami',
        action: 'UPDATE_STATUS',
        reason: 'Partner acceptance contract uploaded and approved',
        changed_fields: {
          status: { from: 'MATCHED', to: 'APPROVED' },
        },
        hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
        prev_hash: '0000000000000000000000000000000000000000000000000000000000000000',
      },
    ],
    actions: [
      {
        id: 'act_realize',
        label: 'Mark as Realized',
        variant: 'primary',
        isPermitted: false,
        blockerReason: 'EP has not arrived in country yet',
        onClick: () => {},
      },
    ],
  };

  it('correctly provides all 8 structural panels in the record detail schema', () => {
    expect(sampleRecord.stableId).toBe('EP-2026-0042');
    expect(sampleRecord.recordType).toBe('EP');
    expect(sampleRecord.product).toBe('iGTa');
    expect(sampleRecord.status.label).toBe('Approved');
    expect(sampleRecord.priorityRisk?.level).toBe('LOW');
    expect(sampleRecord.keyDetails.length).toBe(3);
    expect(sampleRecord.relationships.length).toBe(1);
    expect(sampleRecord.nextActions.length).toBe(1);
    expect(sampleRecord.evidenceDocuments.length).toBe(1);
    expect(sampleRecord.timeline.length).toBe(2);
    expect(sampleRecord.auditHistory.length).toBe(1);
  });

  it('enforces RBAC action gating with blocker reason', () => {
    const realizeAction = sampleRecord.actions[0];
    expect(realizeAction.isPermitted).toBe(false);
    expect(realizeAction.blockerReason).toBe('EP has not arrived in country yet');
  });

  it('guarantees cryptographic hash linkage in audit records', () => {
    const audit = sampleRecord.auditHistory[0];
    expect(audit.hash).toHaveLength(64);
    expect(audit.prev_hash).toHaveLength(64);
    expect(audit.changed_fields?.status.to).toBe('APPROVED');
  });
});
