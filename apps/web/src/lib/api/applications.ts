import { apiRequest } from './client';

export interface ApplicationScreening {
	id: string;
	application_id: string;
	reviewer_id?: string;
	language_proficiency: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'NATIVE';
	background_check_passed: boolean;
	cultural_fit_rating: number;
	skills_match_rating: number;
	motivation_notes?: string;
	recommendation: 'RECOMMENDED' | 'NEUTRAL' | 'REJECTED';
	created_at: string;
}

export interface OPInterview {
	id: string;
	application_id: string;
	interviewer_name: string;
	interview_type: 'ONLINE' | 'IN_PERSON';
	scheduled_at: string;
	conducted_at?: string;
	op_decision: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SECOND_ROUND';
	feedback_notes?: string;
	questions_asked?: string;
	created_at: string;
}

export interface AcceptanceNote {
	id: string;
	application_id: string;
	document_url: string;
	ep_signature_date: string;
	partner_signature_date: string;
	is_verified: boolean;
	verified_by?: string;
	verification_notes?: string;
	created_at: string;
}

export interface SEPaymentProof {
	id: string;
	application_id: string;
	sending_entity_id?: string;
	payment_reference: string;
	amount_eur: number;
	proof_document_url: string;
	is_verified: boolean;
	verified_by?: string;
	created_at: string;
}

export interface Application {
	id: string;
	application_code: string;
	expa_application_id?: string;
	ep_id: string;
	opportunity_id: string;
	slot_id?: string;
	current_stage:
		| 'APPLIED'
		| 'CONTACTED'
		| 'SCREENING'
		| 'SHORTLISTED'
		| 'SENT_TO_OP'
		| 'INTERVIEW'
		| 'OP_DECISION'
		| 'ACCEPTED'
		| 'APPROVED'
		| 'REJECTED'
		| 'WITHDRAWN';
	official_expa_status: 'APP' | 'ACC' | 'APD' | 'RE' | 'FI' | 'CO';
	operational_readiness: 'DRAFT' | 'READY' | 'AT_RISK' | 'BLOCKED' | 'DONE';
	assigned_manager_id?: string;
	first_contact_deadline?: string;
	first_contacted_at?: string;
	op_feedback_deadline?: string;
	applied_at: string;
	accepted_at?: string;
	approved_at?: string;
	rejection_reason?: string;
	withdrawal_reason?: string;
	notes?: string;
	is_sla_breached: boolean;
	created_at: string;
	updated_at: string;
	ep_name?: string;
	ep_email?: string;
	ep_country?: string;
	opportunity_title?: string;
	opportunity_code?: string;
	product_type?: 'iGV' | 'iGTa' | 'iGTe';
	screenings: ApplicationScreening[];
	op_interviews: OPInterview[];
	acceptance_notes: AcceptanceNote[];
	se_payment_proofs: SEPaymentProof[];
}

export async function fetchApplications(
	stage?: string,
	opportunityId?: string,
	isBreached?: boolean,
	search?: string
): Promise<Application[]> {
	const params = new URLSearchParams();
	if (stage) params.set('stage', stage);
	if (opportunityId) params.set('opportunity_id', opportunityId);
	if (isBreached !== undefined) params.set('is_breached', String(isBreached));
	if (search) params.set('search', search);
	const query = params.toString() ? `?${params.toString()}` : '';
	return apiRequest<Application[]>(`/applications${query}`);
}

export async function fetchApplication(id: string): Promise<Application> {
	return apiRequest<Application>(`/applications/${id}`);
}

export async function createApplication(payload: {
	ep_id: string;
	opportunity_id: string;
	slot_id?: string;
	notes?: string;
}): Promise<Application> {
	return apiRequest<Application>('/applications', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export async function transitionApplication(
	appId: string,
	targetStage: string,
	reason?: string
): Promise<Application> {
	return apiRequest<Application>(`/applications/${appId}/transition`, {
		method: 'POST',
		body: JSON.stringify({ target_stage: targetStage, reason })
	});
}

export async function recordScreening(
	appId: string,
	payload: Partial<ApplicationScreening>
): Promise<ApplicationScreening> {
	return apiRequest<ApplicationScreening>(`/applications/${appId}/screening`, {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export async function forwardToOP(appId: string): Promise<Application> {
	return apiRequest<Application>(`/applications/${appId}/op-forward`, {
		method: 'POST'
	});
}

export async function recordOPInterview(
	appId: string,
	payload: Partial<OPInterview>
): Promise<OPInterview> {
	return apiRequest<OPInterview>(`/applications/${appId}/op-interview`, {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export async function recordAcceptanceNote(
	appId: string,
	payload: Partial<AcceptanceNote>
): Promise<AcceptanceNote> {
	return apiRequest<AcceptanceNote>(`/applications/${appId}/acceptance-note`, {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export async function recordSEPayment(
	appId: string,
	payload: Partial<SEPaymentProof>
): Promise<SEPaymentProof> {
	return apiRequest<SEPaymentProof>(`/applications/${appId}/se-payment`, {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export async function approveMatch(appId: string, slotId?: string, notes?: string): Promise<Application> {
	return apiRequest<Application>(`/applications/${appId}/match-approve`, {
		method: 'POST',
		body: JSON.stringify({ slot_id: slotId, notes })
	});
}

export async function updateReadiness(
	appId: string,
	readiness: 'DRAFT' | 'READY' | 'AT_RISK' | 'BLOCKED' | 'DONE',
	notes?: string
): Promise<Application> {
	return apiRequest<Application>(`/applications/${appId}/readiness`, {
		method: 'PUT',
		body: JSON.stringify({ operational_readiness: readiness, notes })
	});
}
