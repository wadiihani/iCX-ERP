import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  NumberTile,
  Sparkline,
  BulletBarChart,
  SteppedFunnelChart,
  StackedHorizontalBar,
  HeatmapMatrix,
  QuadrantScatterPlot,
  PaceLineChart,
  ParetoBarChart,
  FinancialWaterfallChart,
  PreArrivalCountdownTimeline,
  BedOccupancyGantt,
  AlertList,
  TeamStandardsDotMatrix,
  DivergingNpsBar,
} from '../src/components/dashboard/graphs';

describe('ICX ERP Visual Instruments Spec Verification', () => {
  it('renders Instrument NT (Number Tile) with target and status', () => {
    const html = renderToStaticMarkup(
      <NumberTile
        title="Active Contracts"
        value={42}
        target={50}
        ragStatus="green"
        wowDelta="+12%"
      />
    );
    expect(html).toContain('Active Contracts');
    expect(html).toContain('42');
    expect(html).toContain('/ 50 target');
    expect(html).toContain('+12%');
  });

  it('renders Instrument SP (Sparkline) with SVG path and endpoint dot', () => {
    const html = renderToStaticMarkup(
      <Sparkline data={[10, 15, 12, 18, 22, 25]} color="#10B981" />
    );
    expect(html).toContain('<svg');
    expect(html).toContain('<circle');
  });

  it('renders Instrument BU (Bullet Bar Chart) with target and qualitative bands', () => {
    const html = renderToStaticMarkup(
      <BulletBarChart
        metrics={[
          {
            id: 'm1',
            label: 'NPS Conversion',
            actual: 65,
            target: 75,
            unit: '%',
          },
        ]}
      />
    );
    expect(html).toContain('NPS Conversion');
    expect(html).toContain('65%');
    expect(html).toContain('Target: 75%');
  });

  it('renders Instrument FU (Stepped Funnel Chart) with stages and conversion bridges', () => {
    const html = renderToStaticMarkup(
      <SteppedFunnelChart
        stages={[
          { id: 's1', label: 'Open', count: 100, target: 120 },
          { id: 's2', label: 'Applied', count: 60, target: 70 },
          { id: 's3', label: 'Accepted', count: 30, target: 35 },
        ]}
      />
    );
    expect(html).toContain('Open');
    expect(html).toContain('100');
    expect(html).toContain('Applied');
    expect(html).toContain('60');
  });

  it('renders Instrument SB (100% Stacked Horizontal Bar)', () => {
    const html = renderToStaticMarkup(
      <StackedHorizontalBar
        rows={[
          {
            id: 'r1',
            title: 'Opportunity A',
            segments: [
              { id: 'seg1', label: 'Filled', value: 8, color: 'bg-emerald-500' },
              { id: 'seg2', label: 'Vacant', value: 2, color: 'bg-rose-500' },
            ],
          },
        ]}
      />
    );
    expect(html).toContain('Opportunity A');
    expect(html).toContain('Filled');
  });

  it('renders Instrument HM (Heatmap Matrix) with cells and thresholds', () => {
    const html = renderToStaticMarkup(
      <HeatmapMatrix
        columns={[
          { id: 'c1', label: 'Week 1' },
          { id: 'c2', label: 'Week 2' },
        ]}
        rows={[
          {
            id: 'r1',
            label: 'Rayen Jbali',
            cells: [
              { colId: 'c1', value: 100 },
              { colId: 'c2', value: 80 },
            ],
          },
        ]}
      />
    );
    expect(html).toContain('Rayen Jbali');
    expect(html).toContain('Week 1');
  });

  it('renders Instrument QD (2x2 Quadrant Scatter Plot)', () => {
    const html = renderToStaticMarkup(
      <QuadrantScatterPlot
        points={[
          { id: '1', name: 'Partner Alpha', x: 75, y: 80, category: 'Scale' },
          { id: '2', name: 'Partner Beta', x: 20, y: 30, category: 'Filter' },
        ]}
        xAxisLabel="Volume"
        yAxisLabel="Conversion"
      />
    );
    expect(html).toContain('Role Models (Scale &amp; Promote)');
    expect(html).toContain('PA');
    expect(html).toContain('PB');
  });

  it('renders Instrument SC (Pace Line S-Curve)', () => {
    const html = renderToStaticMarkup(
      <PaceLineChart
        data={[
          { week: 'W1', actual: 5, target: 6 },
          { week: 'W2', actual: 12, target: 14 },
          { week: 'W3', actual: 20, target: 22 },
        ]}
        metricName="Realizations"
      />
    );
    expect(html).toContain('<svg');
    expect(html).toContain('Realizations');
    expect(html).toContain('W1');
    expect(html).toContain('W3');
  });

  it('renders Instrument PA (Pareto Bar Chart) sorted descending with 80% line', () => {
    const html = renderToStaticMarkup(
      <ParetoBarChart
        data={[
          { reason: 'Visa Delay', count: 40 },
          { reason: 'Price Issue', count: 30 },
          { reason: 'Housing Mismatch', count: 10 },
        ]}
      />
    );
    expect(html).toContain('Visa Delay');
    expect(html).toContain('Price Issue');
    expect(html).toContain('80% Pareto reference line');
  });

  it('renders Instrument WF (Financial Waterfall Chart) with steps and sustainability ratio', () => {
    const html = renderToStaticMarkup(
      <FinancialWaterfallChart
        steps={[
          { id: '1', label: 'Starting Cash', amount: 50000, type: 'inflow' },
          { id: '2', label: 'EP Fees', amount: 25000, type: 'inflow' },
          { id: '3', label: 'Villa Rent', amount: -30000, type: 'outflow' },
          { id: '4', label: 'Ending Balance', amount: 45000, type: 'total' },
        ]}
        sustainabilityRatio={1.45}
      />
    );
    expect(html).toContain('Starting Cash');
    expect(html).toContain('EP Fees');
    expect(html).toContain('Villa Rent');
    expect(html).toContain('1.45');
  });

  it('renders Instrument GT (Pre-Arrival Countdown Timeline & Bed Occupancy Gantt)', () => {
    const html = renderToStaticMarkup(
      <div>
        <PreArrivalCountdownTimeline
          rows={[
            {
              epId: 'EP-101',
              epName: 'John Doe',
              country: 'IT',
              daysToArrival: 12,
              lockChecklist: {
                visaIssued: true,
                bedAssigned: false,
                ticketUploaded: true,
                pickupAssigned: true,
                opConfirmed: true,
              },
            },
          ]}
        />
        <BedOccupancyGantt
          beds={[
            {
              bedId: 'B-1',
              flat: 'Villa Agdal',
              room: 'Room 1',
              neighborhood: 'Agdal',
              weeks: [
                { weekNumber: 24, isOccupied: true, epInitials: 'JD' },
                { weekNumber: 25, isOccupied: false },
              ],
            },
          ]}
        />
      </div>
    );
    expect(html).toContain('14d Lock');
    expect(html).toContain('3d Pickup');
    expect(html).toContain('Villa Agdal');
    expect(html).toContain('John Doe');
  });

  it('renders Instrument AL (Alert List) sorted by severity with action button', () => {
    const html = renderToStaticMarkup(
      <AlertList
        alerts={[
          {
            id: 'a1',
            severity: 'critical',
            item: 'EP arrival in 4 days missing housing lock',
            owner: 'VP CxP',
            ageDays: 3,
            actionText: 'Resolve',
          },
        ]}
      />
    );
    expect(html).toContain('EP arrival in 4 days missing housing lock');
    expect(html).toContain('VP CxP');
    expect(html).toContain('3d idle');
    expect(html).toContain('Resolve');
  });

  it('renders Team Standards Dot Matrix (replaces banned radar chart)', () => {
    const html = renderToStaticMarkup(
      <TeamStandardsDotMatrix
        elements={[
          {
            id: 'std-1',
            name: 'Induction & Onboarding',
            stage: 'Building',
            scores: {
              mmExternal: 95,
              mmInternal: 85,
              tlIr: 75,
              tlBd: 60,
            },
          },
        ]}
      />
    );
    expect(html).toContain('Induction &amp; Onboarding');
    expect(html).toContain('MM External');
    expect(html).toContain('95%');
  });

  it('renders Diverging NPS Bar with detractors, passives, promoters', () => {
    const html = renderToStaticMarkup(
      <DivergingNpsBar
        npsScore={55}
        target={50}
        detractorsPct={10}
        passivesPct={25}
        promotersPct={65}
        totalResponses={100}
      />
    );
    expect(html).toContain('Detractors (0–6):');
    expect(html).toContain('10%');
    expect(html).toContain('Promoters (9–10):');
    expect(html).toContain('65%');
    expect(html).toContain('+55');
  });
});
