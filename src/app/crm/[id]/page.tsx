'use client';

import React, { use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { RecordDetail, type RecordDetailData } from '@/components/ui/record-detail';
import { INITIAL_EPS } from '@/lib/ep/ep-data';

export default function EPDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const ep = INITIAL_EPS.find((e) => e.id === resolvedParams.id) || INITIAL_EPS[0];

  if (!ep) notFound();

  const detailData: RecordDetailData = {
    id: ep.id,
    stableId: `EP-${ep.product}-${ep.expa_ep_id.replace('EXPA-', '')}`,
    recordType: 'EP',
    title: `${ep.full_name} (${ep.nationality})`,
    currentLc: 'RABAT',
    product: ep.product,
    status: {
      label: ep.status,
      variant: ep.status === 'REALIZED' ? 'success' : ep.status === 'APPROVED' ? 'info' : 'warning',
      expaStatus: ep.status.toLowerCase(),
    },
    owner: {
      id: ep.host_manager_id,
      name: ep.host_manager_name,
      team: 'Customer Experience & Delivery (CXP)',
    },
    priorityRisk: {
      level: ep.visa_status === 'APPROVED' ? 'LOW' : 'MEDIUM',
      reason: ep.visa_status === 'APPROVED' ? 'All visa documents and insurance policies verified. Ready for airport pickup.' : 'Visa submission under review at consulate.',
    },
    lastUpdatedAt: ep.updated_at,
    backHref: '/crm',
    backLabel: 'Back to EP Master Tracker',
    keyDetails: [
      { label: 'EXPA Application ID', value: ep.expa_ep_id, isRequired: true },
      { label: 'Origin MC & LC', value: `${ep.home_mc} • ${ep.home_lc}`, isRequired: true },
      { label: 'Nationality & Passport', value: `${ep.nationality} (Verified biometric validity)`, isRequired: true },
      { label: 'Direct Email', value: ep.email, isRequired: true },
      { label: 'Direct WhatsApp', value: ep.phone, isRequired: true },
      { label: 'Host Opportunity', value: ep.opportunity_title, isRequired: true },
      { label: 'Partner Host Organization', value: ep.partner_organization_name, isRequired: true },
      { label: 'Realization Window', value: `${ep.start_date} to ${ep.end_date} (6 Weeks)` },
      { label: 'Emergency Contact Person', value: 'Carlos Martinez (Father) • +57 312 900 1144' },
    ],
    relationships: [
      {
        id: 'rel_opp',
        recordType: 'OPPORTUNITY',
        title: ep.opportunity_title,
        subtitle: `Slot #1 • ${ep.partner_organization_name}`,
        statusText: 'Slot Confirmed',
        href: '/opportunities',
      },
      {
        id: 'rel_org',
        recordType: 'ORGANIZATION',
        title: ep.partner_organization_name,
        subtitle: 'Host Partner Company / Foundation',
        statusText: 'MoU Signed',
        href: '/sales',
      },
      {
        id: 'rel_accom',
        recordType: 'SLOT',
        title: 'Casablanca Agdal Trainee Flat (Bed #3)',
        subtitle: 'Check-in: 01 Nov 2026 • Host Accompaniment Assigned',
        statusText: 'Bed Reserved',
        href: '/accommodation',
      },
      {
        id: 'rel_task',
        recordType: 'TASK',
        title: 'Airport Reception & SIM Card Provisioning',
        subtitle: 'Assigned to Host Manager',
        statusText: 'Due in 4 days',
        href: '/admin',
      },
    ],
    timeline: [
      {
        id: 'evt_1',
        timestamp: ep.updated_at,
        actor: { name: 'Amina Benali', role: 'VP CXP' },
        eventType: 'HANDOFF',
        title: 'Handoff Acknowledged & Accepted',
        description: 'Ownership transferred from Matching Team to Delivery. Arrival protocol initiated.',
        badge: { text: 'HANDOFF COMPLETE', color: 'bg-emerald-50 text-emerald-700' },
      },
      {
        id: 'evt_2',
        timestamp: ep.created_at,
        actor: { name: 'EXPA GIS Sync Engine', role: 'Automated Cursor' },
        eventType: 'STAGE_CHANGE',
        title: 'EXPA Application Approved',
        description: 'Candidate signed Acceptance Note and paid exchange fee to home entity.',
        badge: { text: 'EXPA: APPROVED', color: 'bg-blue-50 text-blue-700' },
      },
    ],
    nextActions: [
      {
        id: 'act_pickup',
        title: 'Airport Greeting & Transportation Coordination',
        ownerName: ep.host_manager_name,
        dueDate: '2026-10-31T18:00:00Z',
        priority: 'HIGH',
        slaCountdown: '3 days remaining',
      },
      {
        id: 'act_ips',
        title: 'Deliver Incoming Preparation Seminar (IPS) & Culture Pack',
        ownerName: ep.host_manager_name,
        dueDate: '2026-11-02T10:00:00Z',
        priority: 'MEDIUM',
        slaCountdown: '5 days remaining',
      },
      {
        id: 'act_day1',
        title: 'Day-1 Workplace Host Accompaniment at Partner Site',
        ownerName: ep.host_manager_name,
        dueDate: '2026-11-03T09:00:00Z',
        priority: 'CRITICAL',
        slaCountdown: '6 days remaining',
      },
    ],
    evidenceDocuments: [
      {
        id: 'doc_acceptance',
        title: 'Official EXPA Exchange Participant Acceptance Note',
        docType: 'ACCEPTANCE_NOTE',
        verificationStatus: 'VERIFIED',
        verifiedBy: 'VP Operations',
        verifiedAt: ep.created_at,
        sha256Digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        downloadUrl: '#',
      },
      {
        id: 'doc_insurance',
        title: 'International Travel Health Insurance Policy ($500k Coverage)',
        docType: 'HEALTH_INSURANCE',
        verificationStatus: 'VERIFIED',
        verifiedBy: 'Amina Benali',
        verifiedAt: ep.updated_at,
        sha256Digest: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
        downloadUrl: '#',
      },
      {
        id: 'doc_flight',
        title: 'Confirmed Inbound Airline Ticket (AT201 Bogota -> CMN)',
        docType: 'FLIGHT_TICKET',
        verificationStatus: 'VERIFIED',
        verifiedBy: 'Amina Benali',
        verifiedAt: ep.updated_at,
        sha256Digest: 'f4e3d2c1b0a987654321fedcba0987654321fedcba0987654321fedcba098765',
        downloadUrl: '#',
      },
    ],
    auditHistory: [
      {
        id: 'aud_1',
        occurred_at: ep.updated_at,
        actor_name: ep.host_manager_name,
        action: 'VERIFY_COMPLIANCE_EVIDENCE',
        reason: 'Verified valid health insurance policy and flight ticket confirmation',
        changed_fields: {
          insurance_verified: { from: false, to: true },
          pickup_confirmed: { from: false, to: true },
        },
        hash: '9f8e7d6c5b4a3210fedcba9876543210fedcba9876543210fedcba9876543210',
        prev_hash: '0000000000000000000000000000000000000000000000000000000000000000',
      },
    ],
    actions: [
      {
        id: 'act_realize',
        label: 'Mark In-Country Realized',
        variant: 'primary',
        isPermitted: ep.status === 'APPROVED',
        onClick: () => alert('Confirming Day-1 realization on EXPA...'),
      },
      {
        id: 'act_reassign',
        label: 'Initiate Stakeholder Handoff',
        variant: 'secondary',
        isPermitted: true,
        onClick: () => router.push('/admin'),
      },
    ],
  };

  return <RecordDetail data={detailData} />;
}
