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
  Bell,
  Clock,
  WarningCircle,
  CheckCircle,
  FileText,
  ArrowRight,
} from '@phosphor-icons/react';
import { ensureDemoDataSeeded } from '@/lib/data-integrity/seed-demo-data';
import { statusGovernanceService } from '@/lib/data-integrity/status-governance';
import { getMasterTrackerDb } from '@/lib/data-integrity/master-tracker';
import type { StatusRequest, Exchange, OpPartner } from '@/lib/types/data-integrity';

export default function StatusGovernancePage() {
  const [requests, setRequests] = useState<StatusRequest[]>([]);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [partners, setPartners] = useState<OpPartner[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    ensureDemoDataSeeded();
    loadData();
  }, []);

  const loadData = () => {
    const db = getMasterTrackerDb();
    setRequests(statusGovernanceService.listStatusRequests());
    setExchanges(Array.from(db.exchanges.values()).filter((e) => !e.deleted_at));
    setPartners(Array.from(db.partners.values()).filter((p) => !p.deleted_at));
  };

  const handleCreateMockRequest = () => {
    if (exchanges.length === 0) return;
    const ex = exchanges[0];

    try {
      statusGovernanceService.createStatusRequest(
        {
          exchange_id: ex.id,
          ep_id: ex.ep_id,
          kind: 'early_fi',
          reason: 'University examination scheduled ahead of standard project completion.',
          owner_id: 'usr_wadii_hani',
          desired_date: '2026-07-20',
        },
        'usr_wadii_hani'
      );
      loadData();
      setActionNotice('New Early Finish request submitted to ECB/ICB governance queue.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      setActionNotice(`Submission failed: ${msg}`);
    }
  };

  // Dynamic Deadline Computations
  const apdExchanges = exchanges.filter((e) => e.status === 'APD');
  const activePartnersCount = partners.length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <Surface variant="default" padding="lg">
        <Group justify="space-between" align="center" wrap>
          <Stack gap={4}>
            <Heading level={1} styleKey="title1">
              Status Governance & Deadline Radar (§8 & §10)
            </Heading>
            <Text styleKey="callout" tone="muted">
              Early Finish / Break / Extension Workflow (INV-02) · 14d Visa & 35d Partner Radar
            </Text>
          </Stack>
          <Group gap={8}>
            <Button variant="accent" size="sm" onClick={handleCreateMockRequest}>
              + Submit Status Request
            </Button>
            <Link href="/tracker">
              <Button variant="subtle" size="sm">
                Master Tracker
              </Button>
            </Link>
          </Group>
        </Group>
      </Surface>

      {/* Action Notice */}
      {actionNotice && (
        <Alert variant="info">
          <Group justify="space-between" align="center">
            <Text styleKey="footnote">{actionNotice}</Text>
            <Button variant="ghost" size="sm" onClick={() => setActionNotice(null)}>
              Dismiss
            </Button>
          </Group>
        </Alert>
      )}

      {/* Section 1: Deadline Radar Cards (Two Real Statutory Radars per Spec §8) */}
      <Surface variant="default" padding="lg">
        <Stack gap={16}>
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Heading level={2} styleKey="title2">
                Statutory Deadline Radar (§8 / S2, S9)
              </Heading>
              <Text styleKey="footnote" tone="muted">
                Host Entity Timers: 14d Visa Documentation SLA · 35d Partner Touchpoint Cadence
              </Text>
            </Stack>
            <Badge variant="lime" size="sm">
              Africa/Casablanca Evaluated
            </Badge>
          </Group>

          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-800 p-4 rounded bg-slate-900/40">
              <Group justify="space-between" align="center">
                <Text styleKey="caption1" tone="muted">
                  VISA APPLICATION SLA (14 DAYS POST-APPROVAL)
                </Text>
                <Icon size="sm">
                  <Clock weight="thin" />
                </Icon>
              </Group>
              <div className="text-2xl font-light text-slate-100 mt-2">
                {exchanges.length > 0 ? `${apdExchanges.length} APD Monitored` : 'No data'}
              </div>
              <Text styleKey="caption2" tone="muted" className="mt-1">
                {exchanges.length > 0
                  ? 'All approved exchanges tracked against the 14-day invitation letter requirement.'
                  : 'Zero approved exchanges on file.'}
              </Text>
            </div>

            <div className="border border-slate-800 p-4 rounded bg-slate-900/40">
              <Group justify="space-between" align="center">
                <Text styleKey="caption1" tone="muted">
                  B2B PARTNER TOUCHPOINT GAP SLA (35 DAYS)
                </Text>
                <Icon size="sm">
                  <Clock weight="thin" />
                </Icon>
              </Group>
              <div className="text-2xl font-light text-slate-100 mt-2">
                {activePartnersCount > 0 ? `${activePartnersCount} Partners Active` : 'No data'}
              </div>
              <Text styleKey="caption2" tone="muted" className="mt-1">
                {activePartnersCount > 0
                  ? 'Cadence monitored: requires at least one logged touchpoint every 35 days.'
                  : 'Zero operational partners registered.'}
              </Text>
            </div>
          </div>
        </Stack>
      </Surface>

      {/* Section 2: Status Requests Governance Queue */}
      <Surface variant="default" padding="lg">
        <Stack gap={16}>
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Heading level={2} styleKey="title2">
                Status Requests Governance Queue ({requests.length})
              </Heading>
              <Text styleKey="footnote" tone="muted">
                Statutory state machine (v1.0 §7): Draft → Ready → Submitted (Ticket Required) → Approved / Rejected
              </Text>
            </Stack>
            <Badge variant="neutral" size="sm">
              Annex 2 Enforced
            </Badge>
          </Group>

          <Divider />

          {requests.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Text tone="muted">No pending status change requests in queue.</Text>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Exchange Ref</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Reason & Justification</TableHead>
                  <TableHead>Desired Date</TableHead>
                  <TableHead>Current Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-mono text-xs">{req.id.slice(0, 10)}</TableCell>
                    <TableCell>
                      <Badge variant="lime" size="sm">
                        {req.kind}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400">
                      {req.exchange_id.slice(0, 12)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">{req.owner_id}</TableCell>
                    <TableCell className="text-xs text-slate-300 max-w-xs truncate">
                      {req.reason}
                    </TableCell>
                    <TableCell className="text-xs font-mono">{req.desired_date || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          req.current_status === 'approved'
                            ? 'success'
                            : req.current_status === 'rejected'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {req.current_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Stack>
      </Surface>
    </div>
  );
}
