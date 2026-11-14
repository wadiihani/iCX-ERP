import { apiRequest } from './client';

export interface SendingEntity {
	id: string;
	country: string;
	mc_name: string;
	lc_name: string;
	region: 'MEA' | 'Europe' | 'Americas' | 'Asia-Pacific';
	expa_id?: string;
	snd_cluster: 'UPSCALE' | 'GROW' | 'INVEST' | 'UNDERSTAND';
	primary_contact_name?: string;
	primary_contact_email?: string;
	status: 'ACTIVE' | 'INACTIVE';
	created_at: string;
	updated_at: string;
}

export interface VisaFeasibility {
	id: string;
	country: string;
	assessment_status: 'FEASIBLE' | 'CONDITIONAL' | 'HIGH_RISK' | 'RESTRICTED';
	estimated_processing_days: number;
	visa_category: string;
	source_citation: string;
	effective_date: string;
	advisory_disclaimer: string;
	notes?: string;
	created_at: string;
	updated_at: string;
}

export interface IRMPartnership {
	id: string;
	sending_entity_id: string;
	sending_entity_country?: string;
	sending_entity_lc?: string;
	product_type: 'iGV' | 'iGTa' | 'iGTe' | 'ALL';
	target_pipeline_eps: number;
	delivered_eps: number;
	status: 'PROSPECT' | 'ACTIVE' | 'STALLED' | 'COMPLETED';
	weekly_sync_cadence: string;
	notes?: string;
	created_at: string;
	updated_at: string;
}

export async function fetchSendingEntities(region?: string, sndCluster?: string): Promise<SendingEntity[]> {
	const params = new URLSearchParams();
	if (region) params.set('region', region);
	if (sndCluster) params.set('snd_cluster', sndCluster);
	const query = params.toString() ? `?${params.toString()}` : '';
	return apiRequest<SendingEntity[]>(`/irm/sending-entities${query}`);
}

export async function createSendingEntity(payload: Partial<SendingEntity>): Promise<SendingEntity> {
	return apiRequest<SendingEntity>('/irm/sending-entities', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export async function fetchVisaFeasibilities(): Promise<VisaFeasibility[]> {
	return apiRequest<VisaFeasibility[]>('/irm/visa-feasibility');
}

export async function createVisaFeasibility(payload: Partial<VisaFeasibility>): Promise<VisaFeasibility> {
	return apiRequest<VisaFeasibility>('/irm/visa-feasibility', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export async function fetchIRMPartnerships(): Promise<IRMPartnership[]> {
	return apiRequest<IRMPartnership[]>('/irm/partnerships');
}

export async function createIRMPartnership(payload: Partial<IRMPartnership>): Promise<IRMPartnership> {
	return apiRequest<IRMPartnership>('/irm/partnerships', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}
