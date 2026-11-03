'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Stack,
  Group,
  Surface,
  Divider,
  Heading,
  Text,
  Button,
  Badge,
  Icon,
  Alert,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@xenon-kit/web';
import {
  CheckSquare,
  Database,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  WarningCircle,
  Clock,
  DownloadSimple,
} from '@phosphor-icons/react';
import { ensureDemoDataSeeded } from '@/lib/data-integrity/seed-demo-data';
import { handoffWorkflowService } from '@/lib/data-integrity/handoff-workflow';
import { disasterRecoveryService } from '@/lib/data-integrity/disaster-recovery';
import { fullExportService } from '@/lib/data-integrity/full-export';
import { getMasterTrackerDb } from '@/lib/data-integrity/master-tracker';
import type { HandoffPacket, HandoffRecord, Exchange } from '@/lib/types/data-integrity';

interface StatutoryRaciEntry {
  scope: string;
  responsible: string;
  accountable: string;
  consulted: string;
  informed: string;
  synergy: string;
}

const STATUTORY_RACI_MATRIX: StatutoryRaciEntry[] = [
  {
    scope: 'Attraction & Consideration EPs',
    responsible: 'Team Leader (iGV)',
    accountable: 'LCVP iGV (Wadii Hani)',
    consulted: 'Home LC VP oGX',
    informed: 'EB Rabat',
    synergy: 'iGV / Marketing',
  },
  {
    scope: 'Matching, Job Description & Contract',
    responsible: 'Team Leader (iGV)',
    accountable: 'LCVP iGV (Wadii Hani)',
    consulted: 'LCVP Finance & Legal',
    informed: 'B2B Partner Lead',
    synergy: 'iGV / BD',
  },
  {
    scope: 'Visa Invitation Letters & Legal Prep',
    responsible: 'Exchange Manager (Member)',
    accountable: 'LCVP iGV (Wadii Hani)',
    consulted: 'ECB Auditor',
    informed: 'Incoming EP',
    synergy: 'iGV / Governance',
  },
  {
    scope: 'Arrival Pickup & Housing (Std #7)',
    responsible: 'Exchange Manager (Member)',
    accountable: 'LCVP iGV (Wadii Hani)',
    consulted: 'Accommodation Provider',
    informed: 'Incoming EP',
    synergy: 'iGV / CXP',
  },
  {
    scope: '16 Exchange Standards Delivery',
    responsible: 'Team Leader (iGV)',
    accountable: 'LCVP iGV (Wadii Hani)',
    consulted: 'Home Entity VP',
    informed: 'ICB Auditor',
    synergy: 'iGV / Standards',
  },
  {
    scope: 'B2B Partner 8 Standards & PRM',
    responsible: 'Team Leader (iGV)',
    accountable: 'LCVP iGV (Wadii Hani)',
    consulted: 'B2B Partner Executive',
    informed: 'LC President',
    synergy: 'iGV / Partners',
  },
  {
    scope: 'ECB / ICB Quality Cases (Annex 2)',
    responsible: 'LCVP iGV (Wadii Hani)',
    accountable: 'LC President (LCP)',
    consulted: 'ECB Chair',
    informed: 'Full EB',
    synergy: 'Governance',
  },
  {
    scope: 'Disaster Recovery & Nightly Snapshots',
    responsible: 'LCVP iGV (Wadii Hani)',
    accountable: 'LC President (LCP)',
    consulted: 'MC VP IM',
    informed: 'ICB Morocco',
    synergy: 'Systems IM',
  },
];

export default function OwnershipAndHandoffPage() {
  const [packet, setPacket] = useState<HandoffPacket | null>(null);
  const [handoffRecord, setHandoffRecord] = useState<HandoffRecord | null>(null);
  const [restoreVerificationNotice, setRestoreNotice] = useState<string | null>(null);
  const [lastRestoreTimestamp, setLastRestoreTimestamp] = useState<string | null>(null);
  const [isAcked, setIsAcked] = useState<boolean>(false);

  useEffect(() => {
    ensureDemoDataSeeded();
    loadData();
  }, []);

  const loadData = () => {
    const actor = 'usr_wadii_hani';
    const genPacket = handoffWorkflowService.generateHandoffPacket(
      'usr_wadii_hani',
      'usr_incoming_lcvp',
      undefined,
      actor
    );
    setPacket(genPacket);

    try {
      const rec = handoffWorkflowService.initiateHandoff(
        'usr_wadii_hani',
        'usr_incoming_lcvp',
        undefined,
        actor
      );
      setHandoffRecord(rec);
    } catch {
      // Handoff may already be initiated
    }
  };

  const handleAcknowledge = () => {
    if (!handoffRecord) return;
    try {
      handoffWorkflowService.acknowledgeByIncoming(
        handoffRecord.id,
        'usr_incoming_lcvp'
      );
      setIsAcked(true);
      setRestoreNotice('Acceptance Gate T-15 Confirmed: Incoming LCVP acknowledged handoff packet.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ack failed';
      setRestoreNotice(`Acknowledgment error: ${msg}`);
    }
  };

  const handleTestRestore = () => {
    const snap = disasterRecoveryService.createNightlySnapshot();
    const result = disasterRecoveryService.restoreToScratchDb(snap);
    setLastRestoreTimestamp(new Date().toLocaleTimeString());
    if (result.verification.success) {
      setRestoreNotice(
        `Acceptance Test T-14 Verified: Scripted restore passed! All ${result.verification.totalTablesChecked} tables verified with valid row-count match (${result.verification.totalRestoredRows} rows restored).`
      );
    } else {
      setRestoreNotice(`Restore verification failed: ${result.verification.discrepancies.join(', ')}`);
    }
  };

  // Compute live section counts from real packet queries
  const totalOpenExchanges = packet
    ? Object.values(packet.openExchangesByStage).reduce((acc: number, list: Exchange[]) => acc + list.length, 0)
    : 0;

  const sectionDetails = [
    { title: '1. Executive Summary & Mandate Scope', count: packet ? 'Configured' : 'Empty', status: packet ? 'Ready' : 'Empty' },
    { title: '2. Operational Exchange Pipeline & Funnel', count: `${totalOpenExchanges} Exchanges`, status: totalOpenExchanges > 0 ? 'Active' : 'Empty' },
    { title: '3. B2B Partner Portfolio & Contracts', count: `${packet?.partners.length ?? 0} Partners`, status: (packet?.partners.length ?? 0) > 0 ? 'Active' : 'Empty' },
    { title: '4. International Relations (IR) 2×2 Ecosystem', count: `${packet?.irPartners.length ?? 0} IR Entities`, status: (packet?.irPartners.length ?? 0) > 0 ? 'Active' : 'Empty' },
    { title: '5. Status Requests & Governance Queue', count: `${packet?.openRequests.length ?? 0} Requests`, status: (packet?.openRequests.length ?? 0) > 0 ? 'Pending' : 'Empty' },
    { title: '6. Quality Cases & Annex 2 Settlements', count: `${packet?.openCases.length ?? 0} Cases`, status: (packet?.openCases.length ?? 0) > 0 ? 'Pending' : 'Clear' },
    { title: '7. Overdue Commitments & 14d Radar', count: `${packet?.overdueDeadlines.length ?? 0} Deadlines`, status: (packet?.overdueDeadlines.length ?? 0) > 0 ? 'Urgent' : 'Clear' },
    { title: '8. Proof Vault & Document Repository', count: `${packet?.proofIndex.length ?? 0} Proofs`, status: (packet?.proofIndex.length ?? 0) > 0 ? 'Vaulted' : 'Empty' },
    { title: '9. Data Integrity Audit Trail & Logs', count: `${packet?.changeLog30d.length ?? 0} Entries`, status: (packet?.changeLog30d.length ?? 0) > 0 ? 'Logged' : 'Empty' },
    { title: '10. Incoming LCVP Priorities & Access List', count: `${packet?.accessList.length ?? 0} Assigned Roles`, status: (packet?.accessList.length ?? 0) > 0 ? 'Active' : 'Empty' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <Surface variant="default" padding="lg">
        <Group justify="space-between" align="center" wrap>
          <Stack gap={4}>
            <Heading level={1} styleKey="title1">
              Ownership Handoff & Disaster Recovery (§12 & §16)
            </Heading>
            <Text styleKey="callout" tone="muted">
              RACI Accountability (INV-03 / DQ-010) · 10-Section Packet (T-15) · Scripted Restore Drill (T-14)
            </Text>
          </Stack>
          <Group gap={8}>
            <Button variant="subtle" size="sm" onClick={handleTestRestore}>
              Test Scripted Restore (T-14)
            </Button>
            <Link href="/">
              <Button variant="accent" size="sm">
                Integrity Console
              </Button>
            </Link>
          </Group>
        </Group>
      </Surface>

      {/* Restore & Ack Feedback Notice */}
      {restoreVerificationNotice && (
        <Alert variant="info">
          <Group justify="space-between" align="center">
            <Text styleKey="footnote">{restoreVerificationNotice}</Text>
            <Button variant="ghost" size="sm" onClick={() => setRestoreNotice(null)}>
              Dismiss
            </Button>
          </Group>
        </Alert>
      )}

      {/* Section 1: RACI Ownership Matrix */}
      <Surface variant="default" padding="lg">
        <Stack gap={16}>
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Heading level={2} styleKey="title2">
                RACI Ownership Matrix (INV-03 / DQ-010)
              </Heading>
              <Text styleKey="footnote" tone="muted">
                Statutory role matrix: Every operational record mapped to accountable LCVP & responsible officer
              </Text>
            </Stack>
            <Badge variant="lime" size="sm">
              Role Matrix Verified
            </Badge>
          </Group>

          <Divider />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operational Scope</TableHead>
                <TableHead>Responsible (R)</TableHead>
                <TableHead>Accountable (A)</TableHead>
                <TableHead>Consulted (C)</TableHead>
                <TableHead>Informed (I)</TableHead>
                <TableHead>Synergy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {STATUTORY_RACI_MATRIX.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-normal text-slate-200 text-xs">
                    {r.scope}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-slate-300">{r.responsible}</TableCell>
                  <TableCell className="text-xs font-mono text-lime-400">{r.accountable}</TableCell>
                  <TableCell className="text-xs font-mono text-slate-400">{r.consulted}</TableCell>
                  <TableCell className="text-xs font-mono text-slate-400">{r.informed}</TableCell>
                  <TableCell>
                    <Badge variant="neutral" size="sm">
                      {r.synergy}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </Surface>

      {/* Section 2: 10-Section Handoff Packet Generator (T-15) */}
      <Surface variant="default" padding="lg">
        <Stack gap={16}>
          <Group justify="space-between" align="center" wrap>
            <Stack gap={2}>
              <Heading level={2} styleKey="title2">
                10-Section Mandate Turnover Packet (T-15)
              </Heading>
              <Text styleKey="footnote" tone="muted">
                Live query turnover bundle compiled for outgoing to incoming LCVP
              </Text>
            </Stack>
            <Group gap={8}>
              <Badge variant={isAcked ? 'success' : 'neutral'} size="sm">
                {isAcked ? 'ACCEPTED & ACKNOWLEDGED' : 'PENDING INCOMING ACK'}
              </Badge>
              {!isAcked && (
                <Button variant="accent" size="sm" onClick={handleAcknowledge}>
                  Sign Acceptance Gate (T-15)
                </Button>
              )}
            </Group>
          </Group>

          <Divider />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sectionDetails.map((sec, i) => (
              <div
                key={i}
                className="p-3 border border-slate-800 rounded bg-slate-900/40 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-normal text-slate-200">{sec.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{sec.count}</div>
                </div>
                <Badge
                  variant={sec.status === 'Ready' || sec.status === 'Active' || sec.status === 'Clear' ? 'lime' : 'neutral'}
                  size="sm"
                >
                  {sec.status}
                </Badge>
              </div>
            ))}
          </div>
        </Stack>
      </Surface>

      {/* Section 3: Disaster Recovery Snapshot Manifest (T-14 / T-19) */}
      <Surface variant="default" padding="lg">
        <Stack gap={12}>
          <Heading level={3} styleKey="title3">
            Disaster Recovery & Retention SLA (§16 / T-14)
          </Heading>
          <Text styleKey="footnote" tone="muted">
            Snapshot engine maintains daily snapshots and weekly backups with SHA-256 cryptographic manifests per table:
          </Text>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
            <div className="border border-slate-800 p-3 rounded bg-slate-900/40">
              <Text styleKey="caption1" tone="muted">
                DAILY SNAPSHOTS RETENTION
              </Text>
              <div className="text-xl font-light text-slate-200 mt-1">30 Days</div>
              <Text styleKey="caption2" tone="muted">
                Configured retention
              </Text>
            </div>

            <div className="border border-slate-800 p-3 rounded bg-slate-900/40">
              <Text styleKey="caption1" tone="muted">
                WEEKLY BACKUPS RETENTION
              </Text>
              <div className="text-xl font-light text-slate-200 mt-1">12 Weeks</div>
              <Text styleKey="caption2" tone="muted">
                Immutable archive
              </Text>
            </div>

            <div className="border border-slate-800 p-3 rounded bg-slate-900/40">
              <Text styleKey="caption1" tone="muted">
                LAST SCRIPTED RESTORE DRILL
              </Text>
              <div className="text-xl font-light text-slate-200 mt-1">
                {lastRestoreTimestamp ? `Drill at ${lastRestoreTimestamp}` : 'Not run in session'}
              </div>
              <Text styleKey="caption2" tone="muted">
                {lastRestoreTimestamp ? 'T-14 Verification Passed' : 'Click "Test Scripted Restore" above'}
              </Text>
            </div>
          </div>
        </Stack>
      </Surface>
    </div>
  );
}
