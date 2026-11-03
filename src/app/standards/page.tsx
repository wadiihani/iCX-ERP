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
  FolderOpen,
  ArrowRight,
  LockKey,
  X,
  FileText,
} from '@phosphor-icons/react';
import { ensureDemoDataSeeded } from '@/lib/data-integrity/seed-demo-data';
import { proofVaultService } from '@/lib/data-integrity/proof-vault';
import { getMasterTrackerDb } from '@/lib/data-integrity/master-tracker';
import {
  STATUTORY_STANDARD_DEFS,
  getExchangeStandardsWithDefs,
  standardsService,
  type StandardCheckWithDef,
} from '@/lib/data-integrity/standards-service';
import type { ProofDocument, Exchange, Ep } from '@/lib/types/data-integrity';

export default function StandardsAndVaultPage() {
  const [proofs, setProofs] = useState<ProofDocument[]>([]);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [selectedExId, setSelectedExId] = useState<string>('');
  const [epMap, setEpMap] = useState<Map<string, Ep>>(new Map());
  const [isEpModalOpen, setIsEpModalOpen] = useState<boolean>(false);
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);

  useEffect(() => {
    ensureDemoDataSeeded();
    loadData();
  }, []);

  const loadData = () => {
    const db = getMasterTrackerDb();
    const exList = Array.from(db.exchanges.values()).filter((e) => !e.deleted_at);
    setExchanges(exList);
    setEpMap(new Map(db.eps));
    if (exList.length > 0 && !selectedExId) {
      setSelectedExId(exList[0].id);
    }
    setProofs(proofVaultService.listProofs());
  };

  const currentExchange = exchanges.find((e) => e.id === selectedExId) || (exchanges.length > 0 ? exchanges[0] : null);
  const currentEp = currentExchange ? epMap.get(currentExchange.ep_id) : null;
  const currentStandards: StandardCheckWithDef[] = currentExchange
    ? getExchangeStandardsWithDefs(currentExchange.id)
    : [];

  const handleToggleTracked = (stdNo: number, currentStatus: string) => {
    if (!currentExchange) return;
    const actor = 'usr_wadii_hani';
    const nextStatus = currentStatus === 'delivered' ? 'not_delivered' : 'delivered';

    try {
      standardsService.updateTrackedStatus(
        currentExchange.id,
        stdNo,
        nextStatus,
        actor
      );
      loadData();
      setModalFeedback(`Standard #${stdNo} status updated to ${nextStatus}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      setModalFeedback(`Could not update standard: ${msg}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <Surface variant="default" padding="lg">
        <Group justify="space-between" align="center" wrap>
          <Stack gap={4}>
            <Heading level={1} styleKey="title1">
              Exchange Standards & Proof Vault (§6 & §12)
            </Heading>
            <Text styleKey="callout" tone="muted">
              16 Standards · Parallel-Truth Verification (INV-05) · Drive Proof Vault (DQ-083)
            </Text>
          </Stack>
          <Group gap={8}>
            <Link href="/tracker">
              <Button variant="subtle" size="sm">
                Master Tracker
              </Button>
            </Link>
            <Link href="/quality-cases">
              <Button variant="subtle" size="sm">
                Quality Cases
              </Button>
            </Link>
          </Group>
        </Group>
      </Surface>

      {/* Exchange Selector & Quick Audit Drawer Trigger */}
      <Surface variant="default" padding="md">
        <Group justify="space-between" align="center" wrap>
          <Stack gap={2}>
            <Text styleKey="caption1" tone="muted">
              ACTIVE EXCHANGE INSPECTION
            </Text>
            <Text styleKey="headline">
              {currentExchange && currentEp
                ? `${currentEp.full_name} (${currentEp.contact?.country || 'Intl'}) — Status: ${currentExchange.status}`
                : 'No exchange selected'}
            </Text>
          </Stack>

          <Group gap={8}>
            {exchanges.map((ex) => {
              const ep = epMap.get(ex.ep_id);
              return (
                <Button
                  key={ex.id}
                  variant={selectedExId === ex.id ? 'accent' : 'subtle'}
                  size="sm"
                  onClick={() => setSelectedExId(ex.id)}
                >
                  {ep?.full_name?.split(' ')[0] || ex.id.slice(0, 6)} ({ex.status})
                </Button>
              );
            })}

            {currentExchange && (
              <Button
                variant="filled"
                size="sm"
                onClick={() => setIsEpModalOpen(true)}
              >
                Inspect EP Breakdown (H9)
              </Button>
            )}
          </Group>
        </Group>
      </Surface>

      {/* Section 1: 16 Standards Parallel Truth Comparison */}
      <Surface variant="default" padding="lg">
        <Stack gap={16}>
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Heading level={2} styleKey="title2">
                16 Standards Parallel-Truth View (§6.3 / T-03)
              </Heading>
              <Text styleKey="footnote" tone="muted">
                Statutory comparison: LC Rabat Delivery Tracking vs Write-Once EP YOP Survey
              </Text>
            </Stack>
            <Badge variant="lime" size="sm">
              INV-05 Parallel Truth
            </Badge>
          </Group>

          <Divider />

          {!currentExchange || currentStandards.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Text tone="muted">No exchange selected. Select or import an exchange record above to audit standards.</Text>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Standard Name</TableHead>
                  <TableHead>Delivered By</TableHead>
                  <TableHead>Phase</TableHead>
                  <TableHead>LC Rabat Delivery Status</TableHead>
                  <TableHead>EP YOP Survey Answer</TableHead>
                  <TableHead>Audit Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentStandards.map((std) => {
                  let auditBadge;
                  if (std.is_mismatch) {
                    auditBadge = <Badge variant="danger" size="sm">MISMATCH (DQ-055)</Badge>;
                  } else if (std.is_unproven) {
                    auditBadge = <Badge variant="warning" size="sm">UNPROVEN</Badge>;
                  } else if (std.tracked_status === 'delivered') {
                    auditBadge = <Badge variant="success" size="sm">Delivered</Badge>;
                  } else if (std.tracked_status === 'not_started') {
                    auditBadge = <Text tone="muted" styleKey="caption1">Not Evaluated</Text>;
                  } else {
                    auditBadge = <Badge variant="neutral" size="sm">{std.tracked_status}</Badge>;
                  }

                  let statusVariant: 'success' | 'warning' | 'danger' | 'neutral' = 'neutral';
                  if (std.tracked_status === 'delivered') statusVariant = 'success';
                  if (std.tracked_status === 'in_progress') statusVariant = 'warning';
                  if (std.tracked_status === 'not_delivered') statusVariant = 'danger';

                  return (
                    <TableRow key={std.std_no}>
                      <TableCell className="font-mono text-xs">{std.std_no}</TableCell>
                      <TableCell className="text-xs font-normal text-slate-200">
                        {std.name}
                        {std.mandatory && (
                          <span className="ml-1.5 text-[10px] text-amber-400 font-mono">(Mandatory)</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={std.is_host_standard ? 'lime' : 'neutral'} size="sm">
                          {std.delivered_by}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-400 capitalize">{std.phase}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant} size="sm">
                          {std.tracked_status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {std.ep_reported_answer ? (
                          <Badge variant="neutral" size="sm">{std.ep_reported_answer}</Badge>
                        ) : (
                          <Text tone="muted" styleKey="caption1">Pending YOP survey</Text>
                        )}
                      </TableCell>
                      <TableCell>
                        {auditBadge}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Stack>
      </Surface>

      {/* Section 2: Statutory Proof Vault (T-08) */}
      <Surface variant="default" padding="lg">
        <Stack gap={16}>
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Heading level={2} styleKey="title2">
                Statutory Proof Vault (Annex 4 / T-08)
              </Heading>
              <Text styleKey="footnote" tone="muted">
                SHA-256 tamper-proof digest · Dedicated Drive storage · Dead-link radar (DQ-083)
              </Text>
            </Stack>
            <Badge variant="neutral" size="sm">
              {proofs.length} Documents Vaulted
            </Badge>
          </Group>

          <Divider />

          {proofs.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Text tone="muted">No proof documents vaulted yet.</Text>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Type</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Drive Storage URL</TableHead>
                  <TableHead>SHA-256 Tamper Digest</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Integrity Verification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proofs.map((proof) => (
                  <TableRow key={proof.id}>
                    <TableCell>
                      <Badge variant="neutral" size="sm">
                        {String(proof.metadata?.document_type || 'STATUTORY_PROOF')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-normal text-slate-200">
                      {proof.file_name}
                    </TableCell>
                    <TableCell>
                      <a
                        href={proof.drive_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-lime-400 hover:underline font-mono"
                      >
                        {proof.drive_url.length > 40 ? proof.drive_url.slice(0, 40) + '...' : proof.drive_url}
                      </a>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-slate-400">
                      {proof.sha256_hash ? proof.sha256_hash.slice(0, 16) + '...' : 'hash_valid'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">
                      {proof.uploaded_by}
                    </TableCell>
                    <TableCell>
                      <Badge variant={proof.verification_status === 'dead_link' ? 'danger' : 'success'} size="sm">
                        {proof.verification_status === 'dead_link' ? 'Dead Link (DQ-083)' : 'Verified Valid'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Stack>
      </Surface>

      {/* Per-EP Standards Breakdown Pop-up (Task H9) */}
      {isEpModalOpen && currentExchange && currentEp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <Group justify="space-between" align="center">
              <Stack gap={2}>
                <Heading level={2} styleKey="title2">
                  EP Standards Breakdown (Task H9)
                </Heading>
                <Text styleKey="caption1" tone="muted">
                  {currentEp.full_name} · Exchange #{currentExchange.id} · Programme: {currentExchange.programme}
                </Text>
              </Stack>
              <Button variant="ghost" size="sm" onClick={() => setIsEpModalOpen(false)}>
                <Icon size="sm">
                  <X weight="thin" />
                </Icon>
              </Button>
            </Group>

            {modalFeedback && (
              <Alert variant="info">
                <Text styleKey="caption1">{modalFeedback}</Text>
              </Alert>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Standard</TableHead>
                  <TableHead>Delivered By</TableHead>
                  <TableHead>Tracked Status</TableHead>
                  <TableHead>EP Answer (Read-Only)</TableHead>
                  <TableHead>Proof Attached</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentStandards.map((std) => (
                  <TableRow key={std.std_no}>
                    <TableCell className="font-mono text-xs">{std.std_no}</TableCell>
                    <TableCell className="text-xs">
                      {std.name} {std.mandatory && <span className="text-amber-400 text-[10px]">(Mandatory)</span>}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">{std.delivered_by}</TableCell>
                    <TableCell>
                      <Badge variant={std.tracked_status === 'delivered' ? 'success' : 'neutral'} size="sm">
                        {std.tracked_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {std.ep_reported_answer || <span className="text-slate-500">—</span>}
                    </TableCell>
                    <TableCell className="text-xs">
                      {std.proof_id ? (
                        <Badge variant="lime" size="sm">Attached</Badge>
                      ) : (
                        <span className="text-slate-500">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={std.tracked_status === 'delivered' ? 'subtle' : 'accent'}
                        size="sm"
                        onClick={() => handleToggleTracked(std.std_no, std.tracked_status)}
                      >
                        {std.tracked_status === 'delivered' ? 'Mark Undelivered' : 'Mark Delivered'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
