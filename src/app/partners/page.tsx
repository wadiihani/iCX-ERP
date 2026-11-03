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
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@xenon-kit/web';
import {
  Buildings,
  Globe,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
} from '@phosphor-icons/react';
import { ensureDemoDataSeeded } from '@/lib/data-integrity/seed-demo-data';
import { partnerService, getMasterTrackerDb } from '@/lib/data-integrity/master-tracker';
import { irEcosystemService } from '@/lib/data-integrity/ir-ecosystem';
import type { OpPartner, IrPartner, IrCluster } from '@/lib/types/data-integrity';

const PARTNER_STANDARDS = [
  { id: 'S1', name: 'Needs Analysis' },
  { id: 'S2', name: 'Expectation Setting' },
  { id: 'S3', name: 'Job Description Finalization' },
  { id: 'S4', name: 'Arrival & Logistics Prep' },
  { id: 'S5', name: 'First Day Orientation' },
  { id: 'S6', name: 'Regular Weekly Sync' },
  { id: 'S7', name: 'Mid-Experience Review' },
  { id: 'S8', name: 'Closing & Renewal Handover' },
];

export default function PartnersAndIrPage() {
  const [partners, setPartners] = useState<OpPartner[]>(() => {
    ensureDemoDataSeeded();
    const db = getMasterTrackerDb();
    return Array.from(db.partners.values()).filter((p) => !p.deleted_at);
  });
  const [irPartners, setIrPartners] = useState<IrPartner[]>(() => {
    return irEcosystemService.listIrPartners();
  });
  const [selectedCluster, setSelectedCluster] = useState<string>('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const db = getMasterTrackerDb();
    setPartners(Array.from(db.partners.values()).filter((p) => !p.deleted_at));
    setIrPartners(irEcosystemService.listIrPartners());
  };

  const filteredIrPartners = selectedCluster === 'ALL'
    ? irPartners
    : irPartners.filter((p) => p.cluster === selectedCluster);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <Surface variant="default" padding="lg">
        <Group justify="space-between" align="center" wrap>
          <Stack gap={4}>
            <Heading level={1} styleKey="title1">
              Partner PRM & IR Ecosystem (§9 & §13)
            </Heading>
            <Text styleKey="callout" tone="muted">
              8 Partner Standards (S1..S8) · Touchpoint Tracking · 2×2 IR Strategic Clustering Board
            </Text>
          </Stack>
          <Group gap={8}>
            <Link href="/tracker">
              <Button variant="subtle" size="sm">
                Master Tracker
              </Button>
            </Link>
            <Link href="/compliance">
              <Button variant="subtle" size="sm">
                Compliance Calendar
              </Button>
            </Link>
          </Group>
        </Group>
      </Surface>

      {/* Section 1: B2B Operational Partners & 8 Standards */}
      <Surface variant="default" padding="lg">
        <Stack gap={16}>
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Heading level={2} styleKey="title2">
                B2B Operational Partners ({partners.length})
              </Heading>
              <Text styleKey="footnote" tone="muted">
                Host institutions, NGOs, and social enterprises in Rabat
              </Text>
            </Stack>
            <Badge variant={partners.length > 0 ? 'lime' : 'neutral'} size="sm">
              {partners.length > 0 ? `${partners.length} Active Accounts` : 'No Accounts'}
            </Badge>
          </Group>

          <Divider />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner Name</TableHead>
                <TableHead>Type & City</TableHead>
                <TableHead>Accountable Owner</TableHead>
                <TableHead>Contact Lead</TableHead>
                <TableHead>8 Standards Fulfillment</TableHead>
                <TableHead>Status Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    <Text tone="muted">No B2B operational partners registered.</Text>
                  </TableCell>
                </TableRow>
              ) : (
                partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <Stack gap={2}>
                        <span className="font-normal text-slate-200">{partner.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{partner.id.slice(0, 12)}</span>
                      </Stack>
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">
                      {partner.type} · {partner.city}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">{partner.owner_id}</TableCell>
                    <TableCell>
                      <Stack gap={1}>
                        <span className="text-xs text-slate-200">{partner.contact_person?.name || 'TBD'}</span>
                        <span className="text-[11px] text-slate-400">{partner.contact_person?.phone}</span>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Group gap={4}>
                        {PARTNER_STANDARDS.map((s) => (
                          <span
                            key={s.id}
                            title={`${s.id}: ${s.name}`}
                            className="px-1.5 py-0.5 text-[10px] rounded border border-lime-500/30 bg-lime-950/30 text-lime-400 font-mono"
                          >
                            {s.id}
                          </span>
                        ))}
                      </Group>
                    </TableCell>
                    <TableCell>
                      <Badge variant="lime" size="sm">
                        {partner.stage}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Stack>
      </Surface>

      {/* Section 2: International Relations (IR) 2×2 Board */}
      <Surface variant="default" padding="lg">
        <Stack gap={16}>
          <Group justify="space-between" align="center" wrap>
            <Stack gap={2}>
              <Heading level={2} styleKey="title2">
                International Relations (IR) 2×2 Ecosystem (§13)
              </Heading>
              <Text styleKey="footnote" tone="muted">
                Strategic clustering (supply vs market readiness): Upscale, Grow, Invest, Understand
              </Text>
            </Stack>

            <Group gap={6}>
              {['ALL', 'upscale', 'grow', 'invest', 'understand'].map((cluster) => (
                <Button
                  key={cluster}
                  variant={selectedCluster === cluster ? 'accent' : 'subtle'}
                  size="sm"
                  onClick={() => setSelectedCluster(cluster)}
                >
                  {cluster.toUpperCase()}
                </Button>
              ))}
            </Group>
          </Group>

          <Divider />

          {filteredIrPartners.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Text tone="muted">No IR partnerships in {selectedCluster.toUpperCase()} cluster.</Text>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredIrPartners.map((ir) => (
                <div
                  key={ir.id}
                  className="border border-slate-800 p-4 rounded bg-slate-900/40 space-y-3"
                >
                  <Group justify="space-between" align="center">
                    <Badge variant={ir.cluster === 'upscale' ? 'lime' : 'neutral'} size="sm">
                      {ir.cluster.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-mono text-lime-400">Target: {ir.re_growth_target}</span>
                  </Group>

                  <div>
                    <div className="text-sm font-normal text-slate-200">{ir.strategy || 'Strategic Entity Partner'}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Status: {ir.tracker_status} · Review: {ir.review_frequency}</div>
                  </div>

                  <div className="border-t border-slate-800 pt-2 flex justify-between text-xs text-slate-400">
                    <span>Owner: {ir.owner_id}</span>
                    <span className="font-mono text-[11px]">{ir.id.slice(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Stack>
      </Surface>
    </div>
  );
}
