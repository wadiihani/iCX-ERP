import { apiRequest } from './client';

export interface OrganizationContact {
	id: string;
	organization_id: string;
	first_name: string;
	last_name: string;
	email?: string;
	phone?: string;
	job_title?: string;
	department?: string;
	is_primary: boolean;
	notes?: string;
	created_at: string;
	updated_at: string;
}

export interface Organization {
	id: string;
	name: string;
	legal_name?: string;
	sector: string;
	org_type: string;
	website?: string;
	location: string;
	address?: string;
	tax_id?: string;
	verification_status: 'UNVERIFIED' | 'VERIFIED' | 'REJECTED' | 'PROHIBITED';
	is_prohibited: boolean;
	prohibition_reason?: string;
	status: 'LEAD' | 'ACTIVE_PARTNER' | 'CHURNED' | 'BLACKLISTED';
	relationship_health: 'EXCELLENT' | 'GOOD' | 'AT_RISK' | 'CRITICAL';
	account_manager_id?: string;
	created_at: string;
	updated_at: string;
	contacts: OrganizationContact[];
}

export interface PRMLead {
	id: string;
	organization_id: string;
	organization_name?: string;
	title: string;
	stage: string;
	source: string;
	territory: string;
	owner_id?: string;
	team_id?: string;
	estimated_value: number;
	target_products: string[];
	target_openings: number;
	bant_budget: string;
	bant_budget_notes?: string;
	bant_authority: string;
	bant_authority_notes?: string;
	bant_need: string;
	bant_need_notes?: string;
	bant_timeline: string;
	bant_timeline_notes?: string;
	bant_score: number;
	is_qualified: boolean;
	lost_reason?: string;
	created_at: string;
	updated_at: string;
	days_in_stage?: number;
}

export interface PipelineSummaryItem {
	stage: string;
	count: number;
	total_value: number;
	total_openings: number;
}

export interface PipelineSummary {
	stages: PipelineSummaryItem[];
	total_leads: number;
	total_pipeline_value: number;
}

export interface PRMActivity {
	id: string;
	organization_id: string;
	lead_id?: string;
	user_id: string;
	activity_type: string;
	summary: string;
	details?: string;
	occurred_at: string;
	next_step?: string;
	next_step_due?: string;
	is_completed: boolean;
	created_at: string;
}

export interface Contract {
	id: string;
	contract_number: string;
	organization_id: string;
	organization_name?: string;
	lead_id?: string;
	title: string;
	status: 'DRAFT' | 'UNDER_REVIEW' | 'SIGNED' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
	version: number;
	product_types: string[];
	start_date: string;
	end_date: string;
	total_slots: number;
	financial_terms: Record<string, any>;
	special_clauses?: string;
	document_url?: string;
	signed_at?: string;
	signed_by_partner?: string;
	signed_by_aiesec_user_id?: string;
	iac_audit_ready: boolean;
	iac_notes?: string;
	days_to_expiry?: number;
	is_expiring_soon: boolean;
	is_expired: boolean;
	created_at: string;
	updated_at: string;
}

export interface OperationalRisk {
	id: string;
	organization_id?: string;
	contract_id?: string;
	title: string;
	category: 'LEGAL' | 'FINANCIAL' | 'REPUTATIONAL' | 'OPERATIONAL' | 'SAFETY';
	probability: number;
	impact: number;
	score: number;
	mitigation_plan: string;
	owner_id?: string;
	status: 'OPEN' | 'MITIGATED' | 'ACCEPTED' | 'CLOSED';
	created_at: string;
	updated_at: string;
}

// API functions
export async function getPipelineSummary(): Promise<PipelineSummary> {
	return apiRequest<PipelineSummary>('/prm/pipeline/summary');
}

export async function getLeads(stage?: string): Promise<PRMLead[]> {
	const q = stage ? `?stage=${encodeURIComponent(stage)}` : '';
	return apiRequest<PRMLead[]>(`/prm/leads${q}`);
}

export async function createLead(data: Partial<PRMLead>): Promise<PRMLead> {
	return apiRequest<PRMLead>('/prm/leads', {
		method: 'POST',
		body: JSON.stringify(data),
	});
}

export async function updateLeadStage(id: string, stage: string, notes?: string, lost_reason?: string): Promise<PRMLead> {
	return apiRequest<PRMLead>(`/prm/leads/${id}/stage`, {
		method: 'POST',
		body: JSON.stringify({ stage, notes, lost_reason }),
	});
}

export async function getFollowUps(): Promise<PRMActivity[]> {
	return apiRequest<PRMActivity[]>('/prm/follow-ups');
}

export async function completeFollowUp(activityId: string): Promise<PRMActivity> {
	return apiRequest<PRMActivity>(`/prm/follow-ups/${activityId}/complete`, {
		method: 'POST',
	});
}

export async function getOrganizations(search?: string, status?: string): Promise<Organization[]> {
	const params = new URLSearchParams();
	if (search) params.append('search', search);
	if (status) params.append('status', status);
	const q = params.toString() ? `?${params.toString()}` : '';
	return apiRequest<Organization[]>(`/organizations${q}`);
}

export async function createOrganization(data: Partial<Organization>): Promise<Organization> {
	return apiRequest<Organization>('/organizations', {
		method: 'POST',
		body: JSON.stringify(data),
	});
}

export async function getContracts(status?: string): Promise<Contract[]> {
	const q = status ? `?status=${encodeURIComponent(status)}` : '';
	return apiRequest<Contract[]>(`/contracts${q}`);
}

export async function getExpiringAlerts(): Promise<Contract[]> {
	return apiRequest<Contract[]>('/contracts/expiring/alerts');
}

export async function getRisks(): Promise<OperationalRisk[]> {
	return apiRequest<OperationalRisk[]>('/risks');
}

export async function createRisk(data: Partial<OperationalRisk>): Promise<OperationalRisk> {
	return apiRequest<OperationalRisk>('/risks', {
		method: 'POST',
		body: JSON.stringify(data),
	});
}
