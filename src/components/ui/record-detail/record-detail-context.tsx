'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import type { RecordDetailData, AuditRecordItem } from './record-detail-types';

interface RecordDetailContextType {
  record: RecordDetailData;
  isAuditDrawerOpen: boolean;
  openAuditDrawer: (selectedItem?: AuditRecordItem) => void;
  closeAuditDrawer: () => void;
  selectedAuditItem: AuditRecordItem | null;
  activeTab: 'overview' | 'timeline' | 'tasks' | 'evidence' | 'relationships';
  setActiveTab: (tab: 'overview' | 'timeline' | 'tasks' | 'evidence' | 'relationships') => void;
  timelineFilter: string;
  setTimelineFilter: (filter: string) => void;
}

const RecordDetailContext = createContext<RecordDetailContextType | undefined>(undefined);

export function RecordDetailProvider({
  record,
  children,
}: {
  record: RecordDetailData;
  children: React.ReactNode;
}) {
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [selectedAuditItem, setSelectedAuditItem] = useState<AuditRecordItem | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'tasks' | 'evidence' | 'relationships'>('overview');
  const [timelineFilter, setTimelineFilter] = useState('ALL');

  const openAuditDrawer = (selectedItem?: AuditRecordItem) => {
    setSelectedAuditItem(selectedItem || null);
    setIsAuditDrawerOpen(true);
  };

  const closeAuditDrawer = () => {
    setIsAuditDrawerOpen(false);
    setSelectedAuditItem(null);
  };

  const value = useMemo(
    () => ({
      record,
      isAuditDrawerOpen,
      openAuditDrawer,
      closeAuditDrawer,
      selectedAuditItem,
      activeTab,
      setActiveTab,
      timelineFilter,
      setTimelineFilter,
    }),
    [record, isAuditDrawerOpen, selectedAuditItem, activeTab, timelineFilter]
  );

  return (
    <RecordDetailContext.Provider value={value}>
      {children}
    </RecordDetailContext.Provider>
  );
}

export function useRecordDetail() {
  const context = useContext(RecordDetailContext);
  if (!context) {
    throw new Error('useRecordDetail must be used within a RecordDetailProvider');
  }
  return context;
}
