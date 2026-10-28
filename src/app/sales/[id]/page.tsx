'use client';

import React, { use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { RecordDetail, type RecordDetailData } from '@/components/ui/record-detail';
import { INITIAL_B2B_ORGANIZATIONS } from '@/lib/crm/organizations-data';

export default function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const organization = INITIAL_B2B_ORGANIZATIONS.find((o) => o.id === resolvedParams.id);

  if (!organization) {
    // Fallback to first org if custom id
    const fallbackOrg = INITIAL_B2B_ORGANIZATIONS[0];
    if (!fallbackOrg) notFound();
  }

  const org = organization || INITIAL_B2B_ORGANIZATIONS[0];

  const detailData: RecordDetailData = {
    id: org.id,
    stableId: `ORG-${org.city.toUpperCase()}-${org.id.split('_').pop()}`,
    recordType: 'ORGANIZATION',
    title: org.name,
    currentLc: org.lc_id.replace('lc_', '').toUpperCase(),
    status: {
      label: org.status.replace('_', ' '),
      variant: org.status === 'ACTIVE_PARTNER' ? 'success' : org.status === 'QUALIFIED' ? 'info' : 'warning',
    },
    owner: {
      id: org.account_owner_id,
      name: org.account_owner_name,
      team: 'Business Development & Sales',
    },
    priorityRisk: {
      level: org.tier === 'TIER_1' ? 'LOW' : 'MEDIUM',
      reason: org.tier === 'TIER_1' ? 'Strategic tier account with multi-year engagement' : 'Account active under standard quarterly review',
    },
    lastUpdatedAt: org.updated_at,
    backHref: '/sales',
    backLabel: 'Back to B2B CRM Directory',
    keyDetails: [
      { label: 'Tier Classification', value: org.tier.replace('_', ' '), isRequired: true },
      { label: 'Industry Sector', value: org.sector, isRequired: true },
      { label: 'Operating City', value: org.city, isRequired: true },
      { label: 'Official Address', value: org.address || 'Casablanca / Rabat HQ' },
      { label: 'Tax Identification Number', value: org.tax_id || 'Pending Registration' },
      { label: 'Website / Portal', value: org.website ? <a href={org.website} target="_blank" rel="noreferrer" className="text-aiesec-blue hover:underline">{org.website}</a> : 'None' },
      { label: 'Primary Contact Person', value: `${org.primary_contact_name} (${org.primary_contact_phone})`, isRequired: true },
      { label: 'Direct Email', value: org.primary_contact_email, isRequired: true },
      { label: 'Total Historical Deal Value', value: `${org.total_deal_value_mad.toLocaleString()} MAD` },
    ],
    relationships: [
      {
        id: 'rel_deal_1',
        recordType: 'DEAL',
        title: `${org.name} - Q4 Trainee Quota`,
        subtitle: `${org.total_deal_value_mad.toLocaleString()} MAD • In Negotiation`,
        statusText: 'Pipeline Active',
        href: '/sales/pipeline',
      },
      {
        id: 'rel_opp_1',
        recordType: 'OPPORTUNITY',
        title: 'Fullstack Dev & CSR Teaching Slots',
        subtitle: '4 Exchange Opportunities open',
        statusText: 'Slots Available',
        href: '/opportunities',
      },
      {
        id: 'rel_task_1',
        recordType: 'TASK',
        title: 'MoU Renewal & Insurance Annex Signoff',
        subtitle: 'Assigned to Account Owner',
        statusText: 'Pending Approval',
        href: '/admin',
      },
    ],
    timeline: [
      {
        id: 'evt_1',
        timestamp: org.updated_at,
        actor: { name: org.account_owner_name, role: 'Account Executive' },
        eventType: 'MEETING',
        title: 'Quarterly Executive Review Conducted',
        description: 'Confirmed renewal for next seasonal realization cycle with expanded trainee cohort.',
        badge: { text: 'OUTCOME: RENEWED', color: 'bg-emerald-50 text-emerald-700' },
      },
      {
        id: 'evt_2',
        timestamp: org.created_at,
        actor: { name: 'Mehdi Benjelloun', role: 'VP BD' },
        eventType: 'STAGE_CHANGE',
        title: 'Account Promoted to Active Partner',
        description: 'MoU signed and verified by Local Committee President.',
      },
    ],
    nextActions: [
      {
        id: 'act_1',
        title: 'Submit finalized trainee work permits to prefecture',
        ownerName: org.account_owner_name,
        dueDate: '2026-11-05T00:00:00Z',
        priority: 'HIGH',
        slaCountdown: '8 days remaining',
      },
      {
        id: 'act_2',
        title: 'Issue Q4 Partnership Invoice (Tranche 1)',
        ownerName: 'Finance VP',
        dueDate: '2026-11-15T00:00:00Z',
        priority: 'MEDIUM',
        slaCountdown: '18 days remaining',
      },
    ],
    evidenceDocuments: [
      {
        id: 'doc_1',
        title: 'Signed Master Partnership Agreement & MoU',
        docType: 'LEGAL_MOU',
        verificationStatus: 'VERIFIED',
        verifiedBy: 'VP Finance & Legal',
        verifiedAt: org.created_at,
        sha256Digest: '7c9a4d8b9e1234567890abcdef1234567890abcdef1234567890abcdef123456',
        downloadUrl: '#',
      },
      {
        id: 'doc_2',
        title: 'Commercial Register & Tax Identification Notice',
        docType: 'TAX_CERTIFICATE',
        verificationStatus: 'VERIFIED',
        verifiedBy: 'Legal Advisor',
        verifiedAt: org.created_at,
        sha256Digest: 'b3f1c900e481726354718293a4b5c6d7e8f90123456789abcdef0123456789a',
        downloadUrl: '#',
      },
    ],
    auditHistory: [
      {
        id: 'aud_1',
        occurred_at: org.updated_at,
        actor_name: org.account_owner_name,
        action: 'UPDATE_ACCOUNT_PROFILE',
        reason: 'Updated primary contact details and deal projection',
        changed_fields: {
          total_deal_value_mad: { from: 30000, to: org.total_deal_value_mad },
        },
        hash: 'e4d3c2b1a09876543210fedcba9876543210fedcba9876543210fedcba987654',
        prev_hash: '0000000000000000000000000000000000000000000000000000000000000000',
      },
    ],
    actions: [
      {
        id: 'act_create_deal',
        label: '+ New Deal Pipeline',
        variant: 'primary',
        isPermitted: true,
        onClick: () => router.push('/sales/pipeline'),
      },
      {
        id: 'act_transfer_owner',
        label: 'Initiate Account Handoff',
        variant: 'secondary',
        isPermitted: true,
        onClick: () => router.push('/admin'),
      },
    ],
  };

  return <RecordDetail data={detailData} />;
}
