'use client';

import React from 'react';
import type { RecordDetailData } from './record-detail-types';
import { RecordDetailProvider, useRecordDetail } from './record-detail-context';
import {
  RecordIdentityBanner,
  RecordStateAndRiskPanel,
  RecordKeyDetailsPanel,
  RecordRelationshipsPanel,
  RecordNextActionsPanel,
  RecordEvidencePanel,
} from './record-detail-panels';
import { RecordTimelinePanel } from './record-detail-timeline';
import { RecordAuditDrawer } from './record-detail-audit-drawer';

export interface RecordDetailProps {
  data: RecordDetailData;
  children?: React.ReactNode;
  customPanels?: React.ReactNode;
}

function RecordDetailInner({ children, customPanels }: { children?: React.ReactNode; customPanels?: React.ReactNode }) {
  const { activeTab, setActiveTab } = useRecordDetail();

  return (
    <div className="space-y-6">
      {/* Panel 1: Identity & Header */}
      <RecordIdentityBanner />

      {/* Panel 2: State & Risk */}
      <RecordStateAndRiskPanel />

      {/* Responsive tabs for small screens / high density navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Overview & Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Activity Stream
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'tasks'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Actions & Milestones
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('evidence')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'evidence'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Evidence & Compliance
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('relationships')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'relationships'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Linked Records
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <RecordKeyDetailsPanel />
            <RecordRelationshipsPanel />
            {customPanels}
          </div>
          <div className="lg:col-span-5 space-y-6">
            <RecordNextActionsPanel />
            <RecordEvidencePanel />
            <RecordTimelinePanel />
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="max-w-4xl mx-auto">
          <RecordTimelinePanel />
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="max-w-4xl mx-auto">
          <RecordNextActionsPanel />
        </div>
      )}

      {activeTab === 'evidence' && (
        <div className="max-w-4xl mx-auto">
          <RecordEvidencePanel />
        </div>
      )}

      {activeTab === 'relationships' && (
        <div className="max-w-4xl mx-auto">
          <RecordRelationshipsPanel />
        </div>
      )}

      {children}

      {/* Panel 8: Slide-out Cryptographic Audit Chain Drawer */}
      <RecordAuditDrawer />
    </div>
  );
}

export function RecordDetail({ data, children, customPanels }: RecordDetailProps) {
  return (
    <RecordDetailProvider record={data}>
      <RecordDetailInner customPanels={customPanels}>{children}</RecordDetailInner>
    </RecordDetailProvider>
  );
}
