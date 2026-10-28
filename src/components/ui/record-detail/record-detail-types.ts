import type React from 'react';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  actor: {
    name: string;
    role?: string;
    avatarUrl?: string;
  };
  eventType: 'STAGE_CHANGE' | 'NOTE' | 'CALL' | 'MEETING' | 'APPROVAL' | 'DOCUMENT' | 'HANDOFF' | 'SYSTEM';
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  badge?: {
    text: string;
    color: string;
  };
}

export interface AuditRecordItem {
  id: string;
  occurred_at: string;
  actor_name: string;
  action: string;
  changed_fields?: Record<string, { from: unknown; to: unknown }>;
  reason?: string;
  hash: string;
  prev_hash: string;
}

export interface LinkedRelationship {
  id: string;
  recordType: 'EP' | 'ORGANIZATION' | 'CONTACT' | 'OPPORTUNITY' | 'SLOT' | 'DEAL' | 'INVOICE' | 'CASE' | 'TASK';
  title: string;
  subtitle?: string;
  statusText?: string;
  statusColor?: string;
  href: string;
}

export interface NextActionItem {
  id: string;
  title: string;
  ownerName: string;
  dueDate: string;
  isOverdue?: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  blockerDescription?: string;
  slaCountdown?: string;
}

export interface EvidenceDocumentItem {
  id: string;
  title: string;
  docType: string;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  downloadUrl?: string;
  sha256Digest?: string;
}

export interface RecordActionItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'primary' | 'secondary' | 'danger';
  isPermitted: boolean;
  blockerReason?: string;
  onClick: () => void;
}

export interface RecordDetailData {
  id: string;
  stableId: string;
  recordType: string;
  title: string;
  currentLc: string;
  product?: 'iGV' | 'iGTa' | 'iGTe';
  status: {
    label: string;
    variant: 'success' | 'warning' | 'critical' | 'info' | 'neutral';
    expaStatus?: string;
  };
  owner: {
    id: string;
    name: string;
    team: string;
    avatarUrl?: string;
  };
  priorityRisk?: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reason?: string;
  };
  lastUpdatedAt: string;
  keyDetails: Array<{
    label: string;
    value: React.ReactNode;
    isRequired?: boolean;
    isSensitive?: boolean;
    helperText?: string;
  }>;
  relationships: LinkedRelationship[];
  timeline: TimelineEvent[];
  nextActions: NextActionItem[];
  evidenceDocuments: EvidenceDocumentItem[];
  auditHistory: AuditRecordItem[];
  actions: RecordActionItem[];
  backHref?: string;
  backLabel?: string;
}
