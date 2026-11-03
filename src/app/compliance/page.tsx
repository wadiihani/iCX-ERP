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
  Database,
  LockKey,
  ShieldCheck,
  CheckCircle,
  WarningCircle,
  Clock,
  ArrowRight,
} from '@phosphor-icons/react';
import { ensureDemoDataSeeded } from '@/lib/data-integrity/seed-demo-data';
import { complianceService } from '@/lib/data-integrity/compliance-calendar';
import { getMasterTrackerDb } from '@/lib/data-integrity/master-tracker';
import type { ComplianceItem } from '@/lib/types/data-integrity';

interface ScorecardView {
  totalDocs: number;
  passedDocs: number;
  overallPassPct: number;
  isCompliant: boolean;
}

export default function ComplianceCalendarPage() {
  const [scorecard, setScorecard] = useState<ScorecardView | null>(null);
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [auditRef, setAuditRef] = useState<string>('https://icb.aiesec.org/audits/2026/rabat-q2');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    ensureDemoDataSeeded();
    loadData();
  }, []);

  const loadData = () => {
    const db = getMasterTrackerDb();
    const rabatEntity = Array.from(db.entities.values()).find((e) => e.name === 'AIESEC in Rabat');
    if (!rabatEntity) return;

    setIsFrozen(Boolean(rabatEntity.is_frozen));
    const sc = complianceService.getComplianceAuditScorecard(rabatEntity.id);
    setScorecard({
      totalDocs: sc.totalDocs,
      passedDocs: sc.passedDocs,
      overallPassPct: sc.overallPassPct,
      isCompliant: sc.isCompliant,
    });
    setItems(sc.items);
  };

  const handleToggleFreeze = () => {
    const db = getMasterTrackerDb();
    const rabatEntity = Array.from(db.entities.values()).find((e) => e.name === 'AIESEC in Rabat');
    if (!rabatEntity) return;

    const newFreezeState = !isFrozen;
    try {
      complianceService.setEntityFreezeStatus({
        entity_id: rabatEntity.id,
        is_frozen: newFreezeState,
        icb_audit_reference_link: auditRef,
        reason: 'ICB Mandate 26.2 Periodic Audit Review',
        actor_id: 'usr_wadii_hani',
        actor_role: 'lcvp_igv',
      });
      loadData();
      setActionNotice(
        newFreezeState
          ? 'Entity successfully placed under ICB Statutory Data Freeze (Read-Only Mode).'
          : 'ICB Statutory Freeze released. Normal operational writes resumed.'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Toggle failed';
      setActionNotice(`Freeze toggle rejected: ${msg}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ICB Freeze Banner if active */}
      {isFrozen && (
        <Alert variant="warning">
          <Group gap={8} align="center">
            <Icon size="md">
              <LockKey weight="thin" />
            </Icon>
            <Stack gap={2}>
              <Text styleKey="headline">ICB Statutory Data Freeze Active (INV-07)</Text>
              <Text styleKey="footnote" tone="muted">
                Read-only mode active: All new exchange approvals and realizations are strictly locked.
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
              Compliance Calendar & ICB Freeze Gate (§11)
            </Heading>
            <Text styleKey="callout" tone="muted">
              13 Statutory ICB Documents (APIP Annex 4 / T-10) · LCVP Freeze Authority (INV-07 / T-11)
            </Text>
          </Stack>
          <Group gap={8}>
            <Link href="/">
              <Button variant="subtle" size="sm">
                Integrity Console
              </Button>
            </Link>
            <Link href="/handoff">
              <Button variant="subtle" size="sm">
                Ownership Handoff
              </Button>
            </Link>
          </Group>
        </Group>
      </Surface>

      {/* Feedback Alert */}
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

      {/* Section 1: ICB Freeze Authority Switch Card */}
      <Surface variant="default" padding="lg">
        <Stack gap={16}>
          <Group justify="space-between" align="center" wrap>
            <Stack gap={2}>
              <Heading level={2} styleKey="title2">
                ICB Freeze Authority Switch (INV-07 / Acceptance Test T-11)
              </Heading>
              <Text styleKey="footnote" tone="muted">
                Statutory lock restricted to LCVP iGV (Wadii Hani) with mandatory audit reference URL
              </Text>
            </Stack>
            <Badge variant={isFrozen ? 'warning' : 'lime'} size="sm">
              {isFrozen ? 'LOCKED (READ-ONLY)' : 'OPERATIONAL (WRITES ENABLED)'}
            </Badge>
          </Group>

          <Divider />

          <Group justify="space-between" align="center" wrap>
            <div className="flex-1 max-w-md">
              <Text styleKey="caption1" tone="muted">
                AUDIT REFERENCE LINK (MANDATORY FOR FREEZE)
              </Text>
              <input
                type="text"
                value={auditRef}
                onChange={(e) => setAuditRef(e.target.value)}
                placeholder="https://icb.aiesec.org/audit/..."
                className="w-full mt-1.5 px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded font-mono text-slate-200 focus:outline-none focus:border-lime-500"
              />
            </div>

            <Button
              variant={isFrozen ? 'subtle' : 'accent'}
              size="md"
              onClick={handleToggleFreeze}
            >
              {isFrozen ? 'Release ICB Freeze Lock' : 'Engage ICB Statutory Freeze (INV-07)'}
            </Button>
          </Group>
        </Stack>
      </Surface>

      {/* Section 2: 13 Statutory ICB Documents Scorecard (T-10) */}
      <Surface variant="default" padding="lg">
        <Stack gap={16}>
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Heading level={2} styleKey="title2">
                13 Statutory ICB Documents Checklist (APIP Annex 4 / T-10)
              </Heading>
              <Text styleKey="footnote" tone="muted">
                Scorecard: {items.length > 0 ? `${scorecard?.passedDocs ?? 0} of ${scorecard?.totalDocs ?? items.length} verified · Overall compliance rate: ${scorecard?.overallPassPct ?? 0}%` : 'No compliance documents cataloged (0/13)'}
              </Text>
            </Stack>
            {scorecard?.isCompliant ? (
              <Badge variant="success" size="sm">Fully Audited (13/13)</Badge>
            ) : items.length === 0 ? (
              <Badge variant="neutral" size="sm">No Data</Badge>
            ) : (
              <Badge variant="neutral" size="sm">{scorecard?.passedDocs ?? 0}/13 Verified</Badge>
            )}
          </Group>

          <Divider />

          {items.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Text tone="muted">No ICB documents cataloged yet.</Text>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Document Title</TableHead>
                  <TableHead>Statutory Section</TableHead>
                  <TableHead>Audit Result</TableHead>
                  <TableHead>Pass Score</TableHead>
                  <TableHead>Accountable Owner</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-mono text-xs">{doc.doc_number ?? '—'}</TableCell>
                    <TableCell className="text-xs font-normal text-slate-200">{doc.title}</TableCell>
                    <TableCell className="text-xs text-slate-400">{doc.section}</TableCell>
                    <TableCell>
                      <Badge
                        variant={doc.result === 'passed' ? 'success' : doc.result === 'failed' ? 'danger' : 'neutral'}
                        size="sm"
                      >
                        {doc.result}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {doc.pass_pct !== null && doc.pass_pct !== undefined ? `${doc.pass_pct}%` : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">{doc.owner_id}</TableCell>
                    <TableCell className="text-xs text-slate-400 font-mono">
                      {doc.due_at ? doc.due_at.slice(0, 10) : '—'}
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
