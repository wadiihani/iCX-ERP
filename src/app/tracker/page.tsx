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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@xenon-kit/web';
import {
  Users,
  ShieldCheck,
  CheckCircle,
  WarningCircle,
  Clock,
  ArrowRight,
  FolderOpen,
} from '@phosphor-icons/react';
import { ensureDemoDataSeeded } from '@/lib/data-integrity/seed-demo-data';
import { getMasterTrackerDb, exchangeService, epService, opportunityService } from '@/lib/data-integrity/master-tracker';
import { statusToFlowStage } from '@/lib/data-integrity/stage-gates';
import type { Exchange, Ep, Opportunity, FlowStage } from '@/lib/types/data-integrity';

export default function MasterTrackerPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [epMap, setEpMap] = useState<Map<string, Ep>>(new Map());
  const [opMap, setOpMap] = useState<Map<string, Opportunity>>(new Map());
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    ensureDemoDataSeeded();
    loadData();
  }, []);

  const loadData = () => {
    const db = getMasterTrackerDb();
    setExchanges(Array.from(db.exchanges.values()).filter((e) => !e.deleted_at));
    setEpMap(new Map(db.eps));
    setOpMap(new Map(db.opportunities));
  };

  const filteredExchanges = exchanges.filter((ex) => {
    if (activeTab === 'all') return true;
    return statusToFlowStage(ex.status) === activeTab;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'CO':
      case 'FI':
        return 'success';
      case 'RE':
        return 'lime';
      case 'APD':
        return 'info';
      case 'ACP':
        return 'warning';
      case 'APL':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <Surface variant="default" padding="lg">
        <Group justify="space-between" align="center" wrap>
          <Stack gap={4}>
            <Heading level={1} styleKey="title1">
              Master Tracker & Exchange Flow Stages (§5 Module A)
            </Heading>
            <Text styleKey="callout" tone="muted">
              5 Statutory Lifecycle Stages · Gate Validations (G0..G4) · Zero Hard Deletes (INV-01)
            </Text>
          </Stack>
          <Group gap={8}>
            <Link href="/standards">
              <Button variant="subtle" size="sm">
                View Standards
              </Button>
            </Link>
            <Link href="/status-governance">
              <Button variant="subtle" size="sm">
                Status Requests
              </Button>
            </Link>
          </Group>
        </Group>
      </Surface>

      {/* Stage Breakdown Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { key: 'attraction', label: '1. Attraction', sub: 'APL' },
          { key: 'consideration', label: '2. Consideration', sub: 'ACP' },
          { key: 'preparation', label: '3. Preparation', sub: 'APD' },
          { key: 'experience', label: '4. Experience', sub: 'RE' },
          { key: 'post_experience', label: '5. Post-Exp', sub: 'FI / CO' },
        ].map((stg) => {
          const count = exchanges.filter((e) => statusToFlowStage(e.status) === stg.key).length;
          return (
            <div
              key={stg.key}
              onClick={() => setActiveTab(stg.key)}
              className={`p-3 rounded border cursor-pointer transition-colors ${
                activeTab === stg.key
                  ? 'border-lime-500/40 bg-lime-950/20 text-lime-400'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 text-slate-300'
              }`}
            >
              <Text styleKey="caption1" tone="muted">
                {stg.label}
              </Text>
              <div className="text-2xl font-light mt-1">{count}</div>
              <Text styleKey="caption2" tone="muted">
                {stg.sub}
              </Text>
            </div>
          );
        })}
      </div>

      {/* Exchanges Table Surface */}
      <Surface variant="default" padding="lg">
        <Stack gap={16}>
          <Group justify="space-between" align="center" wrap>
            <Stack gap={2}>
              <Heading level={2} styleKey="title2">
                Active Exchanges ({filteredExchanges.length})
              </Heading>
              <Text styleKey="footnote" tone="muted">
                Filter by stage: showing {activeTab.toUpperCase()}
              </Text>
            </Stack>

            <Group gap={6}>
              {['all', 'attraction', 'consideration', 'preparation', 'experience', 'post_experience'].map(
                (tab) => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? 'accent' : 'subtle'}
                    size="sm"
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.replace('_', ' ')}
                  </Button>
                )
              )}
            </Group>
          </Group>

          <Divider />

          {filteredExchanges.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Text tone="muted">No exchanges in {activeTab.replace('_', ' ')} stage.</Text>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>EP Participant</TableHead>
                  <TableHead>Opportunity Project</TableHead>
                  <TableHead>Flow Stage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Realization Window</TableHead>
                  <TableHead>Proof Documents</TableHead>
                  <TableHead>Accountable Owner (RACI)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExchanges.map((ex) => {
                  const ep = epMap.get(ex.ep_id);
                  const op = opMap.get(ex.opportunity_id);
                  const stage = statusToFlowStage(ex.status);

                  return (
                    <TableRow key={ex.id}>
                      <TableCell>
                        <Stack gap={2}>
                          <span className="font-normal text-slate-200">
                            {ep?.full_name || 'EP Unknown'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {String(ep?.contact?.country || 'Intl')} · ID #{ep?.expa_ep_id || ex.ep_id.slice(0, 8)}
                          </span>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack gap={2}>
                          <span className="font-normal text-slate-200">{op?.title || 'EcoRabat 2026'}</span>
                          <span className="text-[11px] text-slate-400">
                            {op?.programme || 'GV'} · {op?.duration_weeks || 6} wks
                          </span>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Badge variant="neutral" size="sm">
                          {stage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(ex.status) as any} size="sm">
                          {ex.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-300 font-mono">
                        {ex.re_date || 'TBD'} → {ex.fi_date || 'TBD'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="neutral" size="sm">
                          {ex.programme}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-300">{ex.owner_id}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Stack>
      </Surface>
    </div>
  );
}
