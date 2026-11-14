import { apiRequest } from './client';

export interface AIAgentRun {
	id: string;
	conversation_id: string;
	agent_name: 'POLICY_ASSISTANT' | 'EP_SCREENING_COPILOT' | 'PARTNER_INTEL_COPILOT' | 'RISK_AUDITOR_COPILOT';
	prompt: string;
	response_text: string;
	status: string;
	tokens_used: number;
	latency_ms: number;
	created_at: string;
	citations: string[];
	proposals_created: Array<{
		proposal_id: string;
		status: string;
		message: string;
	}>;
}

export interface ApprovalProposal {
	id: string;
	run_id?: string;
	proposed_by: string;
	agent_name: string;
	proposal_type: string;
	target_entity_type: string;
	target_entity_id: string;
	proposed_action: string;
	proposed_payload: Record<string, any>;
	rationale: string;
	status: 'PENDING_HUMAN_REVIEW' | 'APPROVED_EXECUTED' | 'REJECTED';
	reviewed_by?: string;
	reviewed_at?: string;
	rejection_reason?: string;
	created_at: string;
	updated_at: string;
}

export async function sendAIChat(payload: {
	conversation_id?: string;
	agent_name: string;
	prompt: string;
	target_id?: string;
	propose_action?: boolean;
}): Promise<AIAgentRun> {
	return apiRequest<AIAgentRun>('/ai/chat', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export async function fetchAgentRuns(conversationId?: string): Promise<AIAgentRun[]> {
	const query = conversationId ? `?conversation_id=${conversationId}` : '';
	return apiRequest<AIAgentRun[]>(`/ai/runs${query}`);
}

export async function fetchProposals(status?: string): Promise<ApprovalProposal[]> {
	const query = status ? `?status=${status}` : '';
	return apiRequest<ApprovalProposal[]>(`/approvals${query}`);
}

export async function reviewProposal(
	proposalId: string,
	payload: {
		decision: 'APPROVED' | 'REJECTED';
		rejection_reason?: string;
		review_notes?: string;
	}
): Promise<ApprovalProposal> {
	return apiRequest<ApprovalProposal>(`/approvals/${proposalId}/review`, {
		method: 'PUT',
		body: JSON.stringify(payload)
	});
}
