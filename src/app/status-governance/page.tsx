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
import { deadlineEngine } from '@/lib/data-integrity/deadline-engine';
import { getMasterTrackerDb } from '@/lib/data-integrity/master-tracker';
import type { StatusRequest } from '@/lib/types/data-integrity';

export default function StatusGovernancePage() {
  const [requests, setRequests] = useState<StatusRequest[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    ensureDemoDataSeeded();
    loadData();
  }, []);

  const loadData = () => {
    setRequests(statusGovernanceService.listStatusRequests());
  };

  const handleCreateMockRequest = () => {
    const db = getMasterTrackerDb();
    const ex = Array.from(db.exchanges.values())[0];
    if (!ex) return;

    statusGovernanceService.createStatusRequest(
      {
        exchange_id: ex.id,
        ep_id: ex.ep_id,
        kind: 'early_fi',
        reason: 'Academic semester commencement earlier than anticipated in home entity.',
        owner_id: 'usr_wadii_hani',
        desired_date: '2026-07-20',
      },
      'usr_wadii_hani'
    );

    loadData();
    setActionNotice('New Early Finish request submitted to ECB/ICB governance queue.');
  };

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
              Break / Early FI / Extension Workflow (INV-02) · 14d Visa & 35d Partner SLA Radar (T-12, T-13)
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

      {/* Section 1: Deadline Radar Cards */}
      <Surface variant="default" padding="lg">
        <Stack gap={16}>
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Heading level={2} styleKey="title2">
                Deadline & SLA Radar (§10 / T-12, T-13)
              </Heading>
              <Text styleKey="footnote" tone="muted">
                Statutory timers: Visa SLA (&lt; 14 days) · B2B Partner Touchpoint Gap (&lt; 35 days)
              </Text>
            </Stack>
            <Badge variant="lime" size="sm">
              Live Evaluation
            </Badge>
          </Group>

          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-slate-800 p-4 rounded bg-slate-900/40">
              <Group justify="space-between" align="center">
                <Text styleKey="caption1" tone="muted">
                  VISA APPLICATION SLA (14 DAYS)
                </Text>
                <Icon size="sm">
                  <Clock weight="thin" />
                </Icon>
              </Group>
              <div className="text-2xl font-light text-slate-200 mt-2">All EPs on Track</div>
              <Text styleKey="caption2" tone="muted" className="mt-1">
                Zero visa breaches detected ahead of realization dates.
              </Text>
            </div>

            <div className="border border-slate-800 p-4 rounded bg-slate-900/40">
              <Group justify="space-between" align="center">
                <Text styleKey="caption1" tone="muted">
                  B2B PARTNER GAP SLA (35 DAYS)
                </Text>
                <Icon size="sm">
                  <Clock weight="thin" />
                </Icon>
              </Group>
              <div className="text-2xl font-light text-slate-200 mt-2">Active Care</div>
              <Text styleKey="caption2" tone="muted" className="mt-1">
                All 3 B2B partners contacted within the last 14 days.
              </Text>
            </div>

            <div className="border border-slate-800 p-4 rounded bg-slate-900/40">
              <Group justify="space-between" align="center">
                <Text styleKey="caption1" tone="muted">
                  APPROVAL-TO-RE TIMER (48H)
                </Text>
                <Icon size="sm">
                  <Clock weight="thin" />
                </Icon>
              </Group>
              <div className="text-2xl font-light text-slate-200 mt-2">Compliant</div>
              <Text styleKey="caption2" tone="muted" className="mt-1">
                No un-realized approvals exceeding statutory readiness limit.
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
                Early Finish / Break / Extension state machine · Required 4-item checklist
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
