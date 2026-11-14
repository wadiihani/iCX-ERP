import { apiRequest } from './client';

export interface StandardFulfillment {
	id: string;
	exchange_id: string;
	standard_number: number;
	standard_name: string;
	is_mandatory: boolean;
	is_fulfilled: boolean;
	fulfillment_date?: string;
	evidence_doc_url?: string;
	verification_notes?: string;
	verified_by?: string;
	created_at: string;
}

export interface CompletionEvaluationReport {
	exchange_id: string;
	total_standards_fulfilled: number;
	mandatory_standards_fulfilled: number;
	total_mandatory_required: number;
	overall_threshold_required: number;
	is_eligible_for_completion: boolean;
	missing_mandatory_standards: string[];
	missing_optional_standards: string[];
	completion_status: string;
}

export async function fetchStandards(exchangeId: string): Promise<StandardFulfillment[]> {
	return apiRequest<StandardFulfillment[]>(`/cxp/exchanges/${exchangeId}/standards`);
}

export async function updateStandard(
	exchangeId: string,
	standardNumber: number,
	payload: {
		is_fulfilled: boolean;
		fulfillment_date?: string;
		evidence_doc_url?: string;
		verification_notes?: string;
	}
): Promise<StandardFulfillment> {
	return apiRequest<StandardFulfillment>(`/cxp/exchanges/${exchangeId}/standards/${standardNumber}`, {
		method: 'PUT',
		body: JSON.stringify(payload)
	});
}

export async function evaluateCompletion(exchangeId: string): Promise<CompletionEvaluationReport> {
	return apiRequest<CompletionEvaluationReport>(`/cxp/exchanges/${exchangeId}/completion/evaluation`);
}

export async function approveCompletion(exchangeId: string, notes?: string): Promise<any> {
	return apiRequest(`/cxp/exchanges/${exchangeId}/completion/approve`, {
		method: 'POST',
		body: JSON.stringify({ notes })
	});
}
