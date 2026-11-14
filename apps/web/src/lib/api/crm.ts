import { apiRequest } from './client';

export interface EPDocument {
	id: string;
	ep_id: string;
	doc_type: 'CV' | 'PASSPORT_COPY' | 'LANGUAGE_CERT' | 'STUDENT_PROOF' | 'ACCEPTANCE_NOTE';
	file_name: string;
	file_size_bytes: number;
	mime_type: string;
	storage_path: string;
	is_verified: boolean;
	uploaded_by?: string;
	created_at: string;
}

export interface ExchangeParticipant {
	id: string;
	expa_person_id?: string;
	first_name: string;
	last_name: string;
	email: string;
	phone?: string;
	country_of_residence: string;
	nationality: string;
	home_mc?: string;
	home_lc?: string;
	date_of_birth?: string;
	gender?: string;
	passport_number?: string;
	cv_url?: string;
	status: string;
	product_interests: string;
	notes?: string;
	created_at: string;
	updated_at: string;
	documents: EPDocument[];
}

export interface EPCreatePayload {
	expa_person_id?: string;
	first_name: string;
	last_name: string;
	email: string;
	phone?: string;
	country_of_residence: string;
	nationality: string;
	home_mc?: string;
	home_lc?: string;
	passport_number?: string;
	cv_url?: string;
	product_interests?: string;
	notes?: string;
}

export interface BulkImportReport {
	total_rows: int;
	valid_count: number;
	invalid_count: number;
	duplicate_count: number;
	errors: Array<{ row: number; email: string; errors: string[] }>;
	warnings: string[];
	sample_preview: any[];
	is_dry_run: boolean;
}

export async function fetchEPs(country?: string, search?: string): Promise<ExchangeParticipant[]> {
	const params = new URLSearchParams();
	if (country) params.set('country', country);
	if (search) params.set('search', search);
	const query = params.toString() ? `?${params.toString()}` : '';
	return apiRequest<ExchangeParticipant[]>(`/crm/eps${query}`);
}

export async function fetchEP(id: string): Promise<ExchangeParticipant> {
	return apiRequest<ExchangeParticipant>(`/crm/eps/${id}`);
}

export async function createEP(payload: EPCreatePayload): Promise<ExchangeParticipant> {
	return apiRequest<ExchangeParticipant>('/crm/eps', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export async function dryRunBulkImport(csvContent: string): Promise<BulkImportReport> {
	return apiRequest<BulkImportReport>('/crm/eps/import/dry-run', {
		method: 'POST',
		headers: { 'Content-Type': 'text/plain' },
		body: csvContent
	});
}

export async function executeBulkImport(csvContent: string): Promise<BulkImportReport> {
	return apiRequest<BulkImportReport>('/crm/eps/import/execute', {
		method: 'POST',
		headers: { 'Content-Type': 'text/plain' },
		body: csvContent
	});
}
