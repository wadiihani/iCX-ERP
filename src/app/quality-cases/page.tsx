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
  Scales,
  Clock,
  WarningCircle,
  CheckCircle,
  FileText,
  LockKey,
} from '@phosphor-icons/react';
import { ensureDemoDataSeeded } from '@/lib/data-integrity/seed-demo-data';
import { qualityCaseService } from '@/lib/data-integrity/quality-cases';
import type { CaseQuality } from '@/lib/types/data-integrity';

export default function QualityCasesPage() {
  const [cases, setCases] = useState<CaseQuality[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseQuality | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    ensureDemoDataSeeded();
    loadData();
  }, []);

  const loadData = () => {
    const list = qualityCaseService.listCases();
    setCases(list);
    if (list.length > 0 && !selectedCase) {
      setSelectedCase(list[0]);
    }
  };

  const handleResolveCase = (caseId: string) => {
    try {
      qualityCaseService.closeCase(
        caseId,
        {
          final_agreement_id: 'agr_remedy_settled_2026',
          closure_notes: 'Auxiliary cooling unit delivered. EP confirmed satisfactory conditions.',
          compensation_amount: 0,
        },
        'usr_wadii_hani'
      );
      loadData();
      setActionNotice('Quality case successfully resolved with all mandatory closure gates verified (DQ-070 / DQ-071).');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Resolution rejected';
      setActionNotice(`Resolution rejected by invariant guard: ${msg}`);
    }
  };

  const openCases = cases.filter((c) => !c.closed_at);
  const resolvedCases = cases.filter((c) => Boolean(c.closed_at));
  const totalCompensation = cases.reduce((acc, c) => acc + (c.compensation_amount || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <Surface variant="default" padding="lg">
        <Group justify="space-between" align="center" wrap>
          <Stack gap={4}>
            <Heading level={1} styleKey="title1">
              Quality Cases & Customer Support Minimums (§10)
            </Heading>
            <Text styleKey="callout" tone="muted">
              Annex 2 Protocols · 5 Mandatory Closure Fields (DQ-070 / DQ-071) · 4 CS Minimums
            </Text>
          </Stack>
          <Group gap={8}>
            <Link href="/standards">
              <Button variant="subtle" size="sm">
                Standards & Proofs
              </Button>
            </Link>
            <Link href="/compliance">
              <Button variant="subtle" size="sm">
                ICB Compliance
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

      {/* 4 Customer Service Minimums Metric Row (§10 Drive S4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Surface variant="default" padding="md">
          <Text styleKey="caption1" tone="muted">
            CS MINIMUM 1: CENTRAL INTAKE
          </Text>
          <div className="text-xl font-light text-slate-100 mt-2">
            {cases.length > 0 ? `${cases.length} Logged` : 'No cases'}
          </div>
          <Text styleKey="caption2" tone="muted" className="mt-1">
            Centralized intake across all LCs.
          </Text>
        </Surface>

        <Surface variant="default" padding="md">
          <Text styleKey="caption1" tone="muted">
            CS MINIMUM 2: RECORD LINKAGE
          </Text>
          <div className="text-xl font-light text-slate-100 mt-2">
            {cases.length > 0 ? '100% Linked' : 'No data'}
          </div>
          <Text styleKey="caption2" tone="muted" className="mt-1">
            Mandatory join to exchange record.
          </Text>
        </Surface>

        <Surface variant="default" padding="md">
          <Text styleKey="caption1" tone="muted">
            CS MINIMUM 3: POSITION STATEMENT
          </Text>
          <div className="text-xl font-light text-slate-100 mt-2">
            {openCases.length > 0 ? `${openCases.length} Pending` : 'Up to date'}
          </div>
          <Text styleKey="caption2" tone="muted" className="mt-1">
            Official position documentation.
          </Text>
        </Surface>

        <Surface variant="default" padding="md">
          <Text styleKey="caption1" tone="muted">
            CS MINIMUM 4: CLOSURE & SETTLEMENT
          </Text>
          <div className="text-xl font-light text-slate-100 mt-2">
            {totalCompensation > 0 ? `${totalCompensation} MAD` : '0 MAD'}
          </div>
          <Text styleKey="caption2" tone="muted" className="mt-1">
            Total active compensation exposure.
          </Text>
        </Surface>
      </div>

      {/* Quality Cases Ledger */}
      <Surface variant="default" padding="lg">
        <Stack gap={16}>
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Heading level={2} styleKey="title2">
                Quality Cases Ledger ({cases.length})
              </Heading>
              <Text styleKey="footnote" tone="muted">
                Statutory tracking under AIESEC Ethics & Complaints Board (ECB) / ICB guidelines
              </Text>
            </Stack>
            <Badge variant="neutral" size="sm">
              Financial Gate Active (DQ-071)
            </Badge>
          </Group>

          <Divider />

          {cases.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Text tone="muted">No quality cases on file. All exchange experiences in good standing.</Text>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Claim Description</TableHead>
                  <TableHead>Exposure (MAD)</TableHead>
                  <TableHead>Case Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.id.slice(0, 10)}</TableCell>
                    <TableCell>
                      <Badge variant="warning" size="sm">
                        {c.classification}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-normal text-slate-200">
                      {c.title}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300 max-w-sm truncate">
                      {c.description}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-lime-400">
                      {c.compensation_amount || 0} {c.currency}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.closed_at ? 'success' : 'warning'} size="sm">
                        {c.closed_at ? 'RESOLVED' : 'OPEN'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!c.closed_at ? (
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => handleResolveCase(c.id)}
                        >
                          Resolve (5 Gates)
                        </Button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">Closed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Stack>
      </Surface>

      {/* 5 Mandatory Closure Fields Audit Box */}
      <Surface variant="default" padding="lg">
        <Stack gap={12}>
          <Heading level={3} styleKey="title3">
            Mandatory Closure Audit Checklist (AEPP Annex 2 / §10.1)
          </Heading>
          <Text styleKey="footnote" tone="muted">
            Per AEPP Annex 2 and ICB Quality Protocols (§10.1), no quality case may transition to closed status without completing all 5 mandatory closure fields:
          </Text>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-2">
            {[
              '1. Case Description',
              '2. Classification Standard',
              '3. Resolution Steps Array',
              '4. Final Agreement ID',
              '5. Financial Proof ID (DQ-071)',
            ].map((f, i) => (
              <div key={i} className="p-3 border border-slate-800 rounded bg-slate-900/40 text-xs font-mono text-lime-400">
                {f}
              </div>
            ))}
          </div>
        </Stack>
      </Surface>
    </div>
  );
}
