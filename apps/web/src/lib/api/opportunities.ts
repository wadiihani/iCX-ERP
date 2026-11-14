import { apiRequest } from './client';

export interface IGVDetails {
	sdg_number: number;
	sdg_target?: string;
	global_project_name: string;
	housing_provided: boolean;
	food_provided: boolean;
	transport_provided: boolean;
	project_fee_amount: number;
}

export interface IGTDetails {
	work_field: 'BA' | 'BD' | 'MKT' | 'IT' | 'ENG' | 'FIN' | 'Other';
	sub_field?: string;
	duration_tier: 'SHORT' | 'MEDIUM' | 'LONG';
	monthly_salary: number;
	currency: string;
	salary_covers_living_costs: boolean;
	accommodation_covered: boolean;
	is_teaching_role: boolean;
	accredited_institution: boolean;
	accreditation_details?: string;
	icb_audit_status: string;
}

export interface OpportunitySlot {
	id: string;
	opportunity_id: string;
	slot_number: string;
	start_date: string;
	end_date: string;
	status: 'OPEN' | 'RESERVED' | 'ALLOCATED' | 'CANCELLED';
	current_application_id?: string;
	lock_version: number;
	created_at: string;
}

export interface Opportunity {
	id: string;
	opportunity_code: string;
	contract_id: string;
	organization_id: string;
	organization_name?: string;
	title: string;
	product_type: 'iGV' | 'iGTa' | 'iGTe';
	modality: 'PHYSICAL' | 'PARTLY_REMOTE' | 'FULLY_REMOTE';
	status: 'DRAFT' | 'INTERNAL_REVIEW' | 'VERIFIED' | 'PUBLISHED' | 'CLOSED';
	start_date: string;
	end_date: string;
	duration_weeks: number;
	working_hours_per_week: number;
	location: string;
	description: string;
	role_description: string;
	required_skills: string[];
	required_languages: string[];
	openings_capacity: number;
	filled_openings: number;
	line_manager_name?: string;
	line_manager_contact?: string;
	is_published: boolean;
	published_at?: string;
	igv_details?: IGVDetails;
	igt_details?: IGTDetails;
	slots?: OpportunitySlot[];
	created_at: string;
	updated_at: string;
}

export interface OpportunityCreatePayload {
	opportunity_code: string;
	contract_id: string;
	organization_id: string;
	title: string;
	product_type: 'iGV' | 'iGTa' | 'iGTe';
	modality: 'PHYSICAL' | 'PARTLY_REMOTE' | 'FULLY_REMOTE';
	start_date: string;
	end_date: string;
	duration_weeks: number;
	working_hours_per_week: number;
	location: string;
	description: string;
	role_description: string;
	required_skills?: string[];
	required_languages?: string[];
	openings_capacity: number;
	line_manager_name?: string;
	line_manager_contact?: string;
	igv_details?: Partial<IGVDetails>;
	igt_details?: Partial<IGTDetails>;
}

export interface PublicationChecklist {
	opportunity_id: string;
	opportunity_code: string;
	ready_to_publish: boolean;
	issues: string[];
	checks: {
		active_signed_contract: boolean;
		dates_valid: boolean;
		product_requirements_met: boolean;
		line_manager_assigned: boolean;
		openings_configured: boolean;
		location_specified: boolean;
	};
}

export async function fetchOpportunities(productType?: string): Promise<Opportunity[]> {
	const path = productType ? `/opportunities?product_type=${productType}` : '/opportunities';
	return apiRequest<Opportunity[]>(path);
}

export async function fetchOpportunity(id: string): Promise<Opportunity> {
	return apiRequest<Opportunity>(`/opportunities/${id}`);
}

export async function createOpportunity(payload: OpportunityCreatePayload): Promise<Opportunity> {
	return apiRequest<Opportunity>('/opportunities', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export async function fetchOpportunitySlots(opportunityId: string): Promise<OpportunitySlot[]> {
	return apiRequest<OpportunitySlot[]>(`/opportunities/${opportunityId}/slots`);
}

export async function checkPublicationChecklist(opportunityId: string): Promise<PublicationChecklist> {
	return apiRequest<PublicationChecklist>(`/opportunities/${opportunityId}/checklist`);
}

export async function publishOpportunity(opportunityId: string): Promise<Opportunity> {
	return apiRequest<Opportunity>(`/opportunities/${opportunityId}/publish`, {
		method: 'POST'
	});
}

export async function reserveSlot(slotId: string, applicationId: string): Promise<OpportunitySlot> {
	return apiRequest<OpportunitySlot>(`/opportunities/slots/${slotId}/reserve?application_id=${encodeURIComponent(applicationId)}`, {
		method: 'POST'
	});
}
