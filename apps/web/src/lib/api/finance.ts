import { apiRequest } from './client';

export interface PricingRuleSet {
	id: string;
	rule_name: string;
	product_type: 'iGV' | 'iGTa' | 'iGTe';
	version: number;
	currency: string;
	base_fee: number;
	min_duration_weeks: number;
	max_duration_weeks: number;
	weekly_additional_rate: number;
	administrative_fee: number;
	discount_tier_percentage: number;
	is_active: boolean;
	created_at: string;
}

export interface PricingCalculationResult {
	id: string;
	rule_set_id: string;
	product_type: string;
	duration_weeks: number;
	modality: string;
	num_trainees: number;
	base_subtotal: number;
	additional_duration_cost: number;
	administrative_fee: number;
	discount_applied: number;
	total_calculated_fee: number;
	currency: string;
	notes?: string;
	created_at: string;
}

export interface PaymentObligation {
	id: string;
	contract_id?: string;
	opportunity_id?: string;
	exchange_id?: string;
	obligation_title: string;
	milestone_trigger: string;
	expected_amount: number;
	paid_amount: number;
	currency: string;
	due_date: string;
	status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'WAIVED';
	notes?: string;
	created_at: string;
}

export interface FinancialCase {
	id: string;
	case_type: 'FEE_WAIVER' | 'DISCOUNT_REQUEST' | 'REFUND' | 'ANNEX_2_PENALTY';
	obligation_id?: string;
	requested_amount: number;
	currency: string;
	reason: string;
	requested_by: string;
	status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
	reviewed_by?: string;
	review_notes?: string;
	created_at: string;
}

export interface RiskEntry {
	id: string;
	risk_category: 'FINANCIAL' | 'LEGAL' | 'HEALTH_SAFETY' | 'PARTNER_RELATIONS' | 'REPUTATION';
	title: string;
	description: string;
	probability: number;
	impact: number;
	severity_score: number;
	mitigation_plan: string;
	contingency_plan?: string;
	status: 'IDENTIFIED' | 'MITIGATING' | 'MONITORED' | 'CLOSED';
	created_at: string;
}

export interface IACAuditItem {
	id: string;
	audit_cycle: string;
	check_item: string;
	category: 'CONTRACTS' | 'FINANCE' | 'HEALTH_SAFETY' | 'STANDARDS' | 'LEGAL';
	description: string;
	is_mandatory: boolean;
	compliance_status: 'PENDING_AUDIT' | 'VERIFIED' | 'FLAGGED_NON_COMPLIANT';
	evidence_url?: string;
	findings?: string;
	created_at: string;
}

export interface LegalDocument {
	id: string;
	document_category: 'CONTRACT' | 'AGREEMENT_MOU' | 'INSURANCE' | 'VISA_LETTER' | 'EMERGENCY_CONTACT_FORM';
	title: string;
	entity_id?: string;
	file_url: string;
	valid_from: string;
	valid_until?: string;
	is_signed: boolean;
	created_at: string;
}

export interface DashboardOverview {
	funnel: {
		stages: Array<{
			stage_code: string;
			stage_name: string;
			count: number;
			conversion_rate_percentage: number;
			avg_hours_in_stage?: number;
		}>;
		total_applications: number;
		small_sample_warning: boolean;
		warning_message?: string;
	};
	sla: {
		items: Array<{
			metric_name: string;
			target_hours: number;
			total_evaluated: number;
			within_sla_count: number;
			compliance_rate_percentage: number;
		}>;
		overall_compliance_percentage: number;
	};
	finance: {
		total_expected: number;
		total_collected: number;
		total_overdue: number;
		total_waived: number;
		currency: string;
	};
	active_exchanges_count: number;
	pending_approvals_count: number;
	active_leads_count: number;
}

// API functions
export async function fetchPricingRules(): Promise<PricingRuleSet[]> {
	return apiRequest<PricingRuleSet[]>('/finance/rulesets');
}

export async function calculatePricing(payload: {
	rule_set_id: string;
	duration_weeks: number;
	modality: string;
	num_trainees: number;
	notes?: string;
}): Promise<PricingCalculationResult> {
	return apiRequest<PricingCalculationResult>('/finance/calculate', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export async function fetchPaymentObligations(): Promise<PaymentObligation[]> {
	return apiRequest<PaymentObligation[]>('/finance/obligations');
}

export async function recordPayment(payload: {
	obligation_id: string;
	amount_paid: number;
	currency?: string;
	payment_method?: string;
	transaction_reference: string;
	receipt_doc_url?: string;
	notes?: string;
}): Promise<any> {
	return apiRequest('/finance/payments', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export async function fetchFinancialCases(): Promise<FinancialCase[]> {
	return apiRequest<FinancialCase[]>('/finance/cases');
}

export async function submitFinancialCase(payload: {
	case_type: string;
	obligation_id?: string;
	requested_amount: number;
	currency?: string;
	reason: string;
}): Promise<FinancialCase> {
	return apiRequest<FinancialCase>('/finance/cases', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export async function reviewFinancialCase(
	caseId: string,
	payload: { status: 'APPROVED' | 'REJECTED'; review_notes?: string }
): Promise<FinancialCase> {
	return apiRequest<FinancialCase>(`/finance/cases/${caseId}/review`, {
		method: 'PUT',
		body: JSON.stringify(payload)
	});
}

export async function fetchRisks(): Promise<RiskEntry[]> {
	return apiRequest<RiskEntry[]>('/legalities/risks');
}

export async function createRisk(payload: Partial<RiskEntry>): Promise<RiskEntry> {
	return apiRequest<RiskEntry>('/legalities/risks', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export async function fetchIACItems(): Promise<IACAuditItem[]> {
	return apiRequest<IACAuditItem[]>('/legalities/iac');
}

export async function auditIACItem(
	itemId: string,
	payload: { compliance_status: string; findings?: string; evidence_url?: string }
): Promise<IACAuditItem> {
	return apiRequest<IACAuditItem>(`/legalities/iac/${itemId}`, {
		method: 'PUT',
		body: JSON.stringify(payload)
	});
}

export async function fetchLegalDocuments(): Promise<LegalDocument[]> {
	return apiRequest<LegalDocument[]>('/legalities/documents');
}

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
	return apiRequest<DashboardOverview>('/analytics/overview');
}
