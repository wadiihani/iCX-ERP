/**
 * EXPA GraphQL Client & Sync Engine Types
 * Baseline: REQ-042, REQ-043, DEC-003, and THR-039
 */

export type ExpaApplicationStatus =
  | 'open'
  | 'applied'
  | 'accepted'
  | 'approved'
  | 'realized'
  | 'completed'
  | 'dropped'
  | 'rejected'
  | 'withdrawn';

export interface ExpaPerson {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  home_lc?: { id: string; name: string } | null;
  home_mc?: { id: string; name: string } | null;
  cv_url?: string | null;
}

export interface ExpaOpportunitySummary {
  id: string;
  title: string;
  programme?: { id: string; short_name: string } | null;
}

export interface ExpaApplicationNode {
  id: string;
  status: ExpaApplicationStatus;
  created_at: string; // ISO
  updated_at: string; // ISO
  person: ExpaPerson;
  opportunity: ExpaOpportunitySummary;
  standards?: Array<{ standard_id: string; status: string }>;
}

export interface ExpaPageInfo {
  has_next_page: boolean;
  end_cursor?: string | null;
  total_count: number;
}

export interface ExpaApplicationsQueryResponse {
  data?: {
    allOpportunityApplication?: {
      nodes: ExpaApplicationNode[];
      page_info: ExpaPageInfo;
    };
  };
  errors?: Array<{ message: string; path?: string[] }>;
}

export type ExpaErrorCode =
  | 'AUTH_EXPIRED'
  | 'RATE_LIMITED'
  | 'SCHEMA_MISMATCH'
  | 'NETWORK_FAILURE'
  | 'UNKNOWN';

export interface ExpaSyncResult {
  batchId: string;
  lcId: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  totalFetched: number;
  newRecordsCount: number;
  conflictCount: number;
  cursorEnd?: string | null;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  error?: {
    code: ExpaErrorCode;
    message: string;
  };
}

export interface ConflictRecord {
  expaId: string;
  localApplicationId: string;
  field: string;
  localValue: unknown;
  remoteValue: unknown;
  detectedAt: string;
  resolutionStatus: 'PENDING_REVIEW' | 'ACCEPTED_REMOTE' | 'PRESERVED_LOCAL';
}
