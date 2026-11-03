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
  ShieldCheck,
  CheckCircle,
  WarningCircle,
  Clock,
  ArrowRight,
  Database,
  DownloadSimple,
  ArrowClockwise,
  User,
  Users,
  FileText,
  LockKey,
  Buildings,
  Scales,
} from '@phosphor-icons/react';
import { ensureDemoDataSeeded } from '@/lib/data-integrity/seed-demo-data';
import { integrityConsoleService } from '@/lib/data-integrity/integrity-console';
import { dataQualityService } from '@/lib/data-integrity/data-quality';
import { disasterRecoveryService } from '@/lib/data-integrity/disaster-recovery';
import { fullExportService } from '@/lib/data-integrity/full-export';
import { getMasterTrackerDb } from '@/lib/data-integrity/master-tracker';
import { complianceService } from '@/lib/data-integrity/compliance-calendar';
import type { DqIssue, IntegrityConsoleSummary } from '@/lib/types/data-integrity';

export default function IntegrityConsolePage() {
  const [summary, setSummary] = useState<IntegrityConsoleSummary>(() => {
    ensureDemoDataSeeded();
    return integrityConsoleService.getConsoleSummary();
  });
  const [issues, setIssues] = useState<DqIssue[]>(() => dataQualityService.listIssues());
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [snapshotResult, setSnapshotResult] = useState<string | null>(null);
  const [isFrozen, setIsFrozen] = useState<boolean>(() => {
    const db = getMasterTrackerDb();
    const rabatEntity = Array.from(db.entities.values()).find((e) => e.name === 'AIESEC in Rabat');
    return Boolean(rabatEntity?.is_frozen);
  });
  const [hasRecords, setHasRecords] = useState<boolean>(() => {
    const db = getMasterTrackerDb();
    return Array.from(db.exchanges.values()).filter((e) => !e.deleted_at).length > 0;
  });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const data = integrityConsoleService.getConsoleSummary();
    setSummary(data);
    setIssues(dataQualityService.listIssues());

    const db = getMasterTrackerDb();
    const rabatEntity = Array.from(db.entities.values()).find((e) => e.name === 'AIESEC in Rabat');
    setIsFrozen(Boolean(rabatEntity?.is_frozen));
    setHasRecords(Array.from(db.exchanges.values()).filter((e) => !e.deleted_at).length > 0);
  };

  const handleRunScan = () => {
    dataQualityService.runDataQualityScan();
    refreshData();
    setActionNotice('Statutory scan executed across all 26 Data Quality Rules (DQ-001..DQ-026).');
  };

  const handleGenerateSnapshot = () => {
    const snap = disasterRecoveryService.createNightlySnapshot();
    setSnapshotResult(`DR Snapshot created at ${snap.manifest.timestamp} (SHA-256: ${snap.manifest.manifestChecksum.slice(0, 16)}...)`);
    refreshData();
  };

  const handleFullExport = () => {
    const bundle = fullExportService.generateFullExportBundle('ALL', 'usr_wadii_hani');
    setActionNotice(`Statutory export bundle generated at ${bundle.exported_at} (Manifest SHA-256: ${bundle.manifest.manifestChecksum.slice(0, 16)}...)`);
  };

  const { healthScore } = summary;
  const filteredIssues = selectedSeverity === 'ALL'
    ? issues
    : issues.filter((i: DqIssue) => i.severity === selectedSeverity);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ICB Freeze Banner (INV-07 / Acceptance Test T-11) */}
      {isFrozen && (
        <Alert variant="warning">
          <Group gap={8} align="center">
            <Icon size="md">
              <LockKey weight="thin" />
            </Icon>
            <Stack gap={2}>
              <Text styleKey="headline">ICB Statutory Data Freeze Active</Text>
              <Text styleKey="footnote" tone="muted">
                System is in read-only audit lock ordered by LCVP iGV Wadii Hani for National/International Control Board review.
              </Text>
            </Stack>
          </Group>
        </Alert>
      )}

      {/* Header Bar */}
      <Surface variant="default" padding="lg">
        <Group justify="space-between" align="center" wrap>
          <Stack gap={4}>
            <Heading level={1} styleKey="title1">
              iCX Data Integrity & Tracking System
            </Heading>
            <Text styleKey="callout" tone="muted">
              AIESEC in Rabat · Mandate 26.2 · Lead: Wadii Hani (LCVP iGV)
            </Text>
          </Stack>
          <Group gap={8}>
            <Button variant="subtle" size="sm" onClick={handleRunScan}>
              <Icon size="sm">
                <ArrowClockwise weight="thin" />
              </Icon>
              Run DQ Scan
            </Button>
            <Button variant="subtle" size="sm" onClick={handleGenerateSnapshot}>
              <Icon size="sm">
                <Database weight="thin" />
              </Icon>
              DR Snapshot (T-14)
            </Button>
            <Button variant="accent" size="sm" onClick={handleFullExport}>
              <Icon size="sm">
                <DownloadSimple weight="thin" />
              </Icon>
              Full Export (T-19)
            </Button>
          </Group>
        </Group>
      </Surface>

      {/* Feedback Messages */}
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

      {snapshotResult && (
        <Alert variant="success">
          <Group justify="space-between" align="center">
            <Text styleKey="footnote">{snapshotResult}</Text>
            <Button variant="ghost" size="sm" onClick={() => setSnapshotResult(null)}>
              Dismiss
            </Button>
          </Group>
        </Alert>
      )}

      {/* Health Score & 4-Factor Breakdown Card */}
      <Surface variant="default" padding="lg">
        <Stack gap={16}>
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Heading level={2} styleKey="title2">
                Data Health Scorecard (§14.2)
              </Heading>
              <Text styleKey="footnote" tone="muted">
                Weighted algorithmic integrity audit across 4 statutory pillars
              </Text>
            </Stack>
            <Group gap={12} align="center">
              {hasRecords && healthScore.overallScore > 0 ? (
                <>
                  <Badge variant="lime" size="md">
                    Grade {healthScore.grade}
                  </Badge>
                  <div className="text-3xl font-light tracking-tight text-lime-400">
                    {healthScore.overallScore}
                    <span className="text-xs text-slate-500 font-normal"> / 100</span>
                  </div>
                </>
              ) : (
                <>
                  <Badge variant="neutral" size="md">
                    No data
                  </Badge>
                  <div className="text-3xl font-light tracking-tight text-slate-500">
                    --
                    <span className="text-xs text-slate-600 font-normal"> / 100</span>
                  </div>
                </>
              )}
            </Group>
          </Group>

          <Divider />

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-slate-800 p-3 rounded bg-slate-900/40">
              <Text styleKey="caption1" tone="muted">
                COMPLETENESS (35% Weight)
              </Text>
              <div className="text-xl font-light text-slate-200 mt-1">
                {hasRecords && healthScore.dimensions.completeness.score > 0
                  ? `${healthScore.dimensions.completeness.score.toFixed(1)}%`
                  : 'No data'}
              </div>
              <Text styleKey="caption2" tone="muted" className="mt-1">
                Required statutory fields filled
              </Text>
            </div>

            <div className="border border-slate-800 p-3 rounded bg-slate-900/40">
              <Text styleKey="caption1" tone="muted">
                FRESHNESS (25% Weight)
              </Text>
              <div className="text-xl font-light text-slate-200 mt-1">
                {hasRecords && healthScore.dimensions.freshness.score > 0
                  ? `${healthScore.dimensions.freshness.score.toFixed(1)}%`
                  : 'No data'}
              </div>
              <Text styleKey="caption2" tone="muted" className="mt-1">
                No stale exchanges &gt; 14 days
              </Text>
            </div>

            <div className="border border-slate-800 p-3 rounded bg-slate-900/40">
              <Text styleKey="caption1" tone="muted">
                EXPA PARITY (25% Weight)
              </Text>
              <div className="text-xl font-light text-slate-200 mt-1">
                {hasRecords && healthScore.dimensions.expaConsistency.score > 0
                  ? `${healthScore.dimensions.expaConsistency.score.toFixed(1)}%`
                  : 'No data'}
              </div>
              <Text styleKey="caption2" tone="muted" className="mt-1">
                Synced timestamps & status parity
              </Text>
            </div>

            <div className="border border-slate-800 p-3 rounded bg-slate-900/40">
              <Text styleKey="caption1" tone="muted">
                OWNERSHIP (15% Weight)
              </Text>
              <div className="text-xl font-light text-slate-200 mt-1">
                {hasRecords && healthScore.dimensions.ownership.score > 0
                  ? `${healthScore.dimensions.ownership.score.toFixed(1)}%`
                  : 'No data'}
              </div>
              <Text styleKey="caption2" tone="muted" className="mt-1">
                RACI assigned to active members
              </Text>
            </div>
          </div>
        </Stack>
      </Surface>

      {/* Navigation Quick Access Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/tracker" className="block">
          <Surface variant="default" padding="md" className="h-full border border-slate-800 hover:border-slate-700 transition-colors">
            <Stack gap={8}>
              <Group justify="space-between" align="center">
                <Text styleKey="headline">Master Tracker</Text>
                <Icon size="sm">
                  <ArrowRight weight="thin" />
                </Icon>
              </Group>
              <Text styleKey="caption1" tone="muted">
                5 Lifecycle flow stages (Attraction to Post-exp), Stage-field validations
              </Text>
            </Stack>
          </Surface>
        </Link>

        <Link href="/standards" className="block">
          <Surface variant="default" padding="md" className="h-full border border-slate-800 hover:border-slate-700 transition-colors">
            <Stack gap={8}>
              <Group justify="space-between" align="center">
                <Text styleKey="headline">Standards & Proofs</Text>
                <Icon size="sm">
                  <ArrowRight weight="thin" />
                </Icon>
              </Group>
              <Text styleKey="caption1" tone="muted">
                16 Standards parallel-truth view & SHA-256 tamper-proof proof vault
              </Text>
            </Stack>
          </Surface>
        </Link>

        <Link href="/status-governance" className="block">
          <Surface variant="default" padding="md" className="h-full border border-slate-800 hover:border-slate-700 transition-colors">
            <Stack gap={8}>
              <Group justify="space-between" align="center">
                <Text styleKey="headline">Status Governance</Text>
                <Icon size="sm">
                  <ArrowRight weight="thin" />
                </Icon>
              </Group>
              <Text styleKey="caption1" tone="muted">
                Early FI/Breaks/Extensions requests & 14d Visa / 35d Partner radar
              </Text>
            </Stack>
          </Surface>
        </Link>

        <Link href="/partners" className="block">
          <Surface variant="default" padding="md" className="h-full border border-slate-800 hover:border-slate-700 transition-colors">
            <Stack gap={8}>
              <Group justify="space-between" align="center">
                <Text styleKey="headline">Partners & IR</Text>
                <Icon size="sm">
                  <ArrowRight weight="thin" />
                </Icon>
              </Group>
              <Text styleKey="caption1" tone="muted">
                8 Partner Standards, touchpoints log & 2×2 IR ecosystem clustering
              </Text>
            </Stack>
          </Surface>
        </Link>
      </div>

      {/* 26 Data Quality Rules Radar */}
      <Surface variant="default" padding="lg">
        <Stack gap={16}>
          <Group justify="space-between" align="center" wrap>
            <Stack gap={2}>
              <Heading level={2} styleKey="title2">
                Data Quality Radar (DQ-001..026)
              </Heading>
              <Text styleKey="footnote" tone="muted">
                {issues.length} active issue(s) detected across statutory rules
              </Text>
            </Stack>

            <Group gap={6}>
              {['ALL', 'Urgent', 'Blocker', 'Warn', 'Review'].map((sev) => (
                <Button
                  key={sev}
                  variant={selectedSeverity === sev ? 'accent' : 'subtle'}
                  size="sm"
                  onClick={() => setSelectedSeverity(sev)}
                >
                  {sev}
                </Button>
              ))}
            </Group>
          </Group>

          <Divider />

          {filteredIssues.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Text tone="muted">
                {issues.length === 0
                  ? 'No active data quality issues detected. Run statutory scan to re-evaluate.'
                  : `No issues detected for severity filter: ${selectedSeverity}.`}
              </Text>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule ID</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Accountable Owner</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.map((issue: DqIssue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-mono text-xs">{issue.rule_id}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          issue.severity === 'Urgent' || issue.severity === 'Blocker'
                            ? 'danger'
                            : issue.severity === 'Warn'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {issue.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{issue.subject}</TableCell>
                    <TableCell className="text-xs text-slate-300">
                      {issue.details?.description ? String(issue.details.description) : 'Statutory verification check'}
                    </TableCell>
                    <TableCell className="text-xs">{issue.owner_id || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm">
                        {issue.status}
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
