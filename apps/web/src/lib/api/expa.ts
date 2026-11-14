import { apiRequest } from './client';

export interface EXPASyncRun {
  id: string;
  sync_mode: string;
  status: string;
  records_scanned: number;
  records_staged: number;
  conflicts_detected: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export interface EXPAReconciliationRecord {
  id: string;
  staged_record_id?: string;
  entity_type: string;
  local_entity_id?: string;
  field_name: string;
  local_value?: string;
  expa_value?: string;
  discrepancy_type: string;
  resolution_status: string;
  resolved_by_user_id?: string;
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export interface EXPAGatedMutation {
  id: string;
  entity_type: string;
  local_entity_id: string;
  expa_id: string;
  target_action: string;
  mutation_payload: Record<string, any>;
  status: string;
  requested_by_user_id: string;
  approved_by_user_id?: string;
  rejection_reason?: string;
  dispatched_at?: string;
  created_at: string;
}

export const expaApi = {
  triggerSync: async (mode = 'POLLING') => {
    return apiRequest<EXPASyncRun>(`/expa/sync/trigger?sync_mode=${mode}`, {
      method: 'POST'
    });
  },

  listSyncRuns: async (limit = 20) => {
    return apiRequest<EXPASyncRun[]>(`/expa/sync/runs?limit=${limit}`);
  },

  listReconciliations: async (status?: string) => {
    const q = status ? `?resolution_status=${status}` : '';
    return apiRequest<EXPAReconciliationRecord[]>(`/expa/reconciliations${q}`);
  },

  resolveReconciliation: async (
    id: string,
    strategy: string,
    notes?: string,
    customValue?: string
  ) => {
    return apiRequest<EXPAReconciliationRecord>(`/expa/reconciliations/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({
        resolution_strategy: strategy,
        resolution_notes: notes,
        custom_value: customValue
      })
    });
  },

  listMutations: async (status?: string) => {
    const q = status ? `?status=${status}` : '';
    return apiRequest<EXPAGatedMutation[]>(`/expa/mutations${q}`);
  },

  approveMutation: async (id: string) => {
    return apiRequest<EXPAGatedMutation>(`/expa/mutations/${id}/approve`, {
      method: 'POST'
    });
  },

  rejectMutation: async (id: string, reason: string) => {
    return apiRequest<EXPAGatedMutation>(`/expa/mutations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejection_reason: reason })
    });
  }
};
