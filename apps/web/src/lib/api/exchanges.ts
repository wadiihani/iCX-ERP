import { apiRequest } from './client';

export interface ExchangeChecklist {
	id: string;
	exchange_id: string;
	category: string;
	item_key: string;
	item_title: string;
	is_mandatory: boolean;
	is_completed: boolean;
	completed_at?: string;
	completed_by?: string;
	notes?: string;
}

export interface ExchangeIncident {
	id: string;
	exchange_id: string;
	incident_type: 'HEALTH' | 'SAFETY' | 'HARASSMENT' | 'LEGAL' | 'CONTRACT_BREACH' | 'BREAK_REQUEST';
	severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	description: string;
	reported_by?: string;
	status: 'OPEN' | 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED';
	resolution_notes?: string;
	resolved_at?: string;
	created_at: string;
}

export interface Exchange {
	id: string;
	application_id: string;
	exchange_code: string;
	modality: 'PHYSICAL' | 'PARTLY_REMOTE' | 'FULLY_REMOTE';
	delivery_status:
		| 'PRE_ARRIVAL'
		| 'ARRIVED'
		| 'REALIZED'
		| 'FINISHED'
		| 'COMPLETED'
		| 'EARLY_FINISH'
		| 'BROKEN';
	start_date: string;
	end_date: string;
	actual_arrival_date?: string;
	actual_departure_date?: string;
	ips_completed: boolean;
	worksite_verified: boolean;
	first_day_attended: boolean;
	lead_manager_id?: string;
	notes?: string;
	created_at: string;
	updated_at: string;
	ep_name?: string;
	ep_country?: string;
	opportunity_title?: string;
	product_type?: 'iGV' | 'iGTa' | 'iGTe';
	checklists: ExchangeChecklist[];
	incidents: ExchangeIncident[];
}

export interface ArrivalLogistics {
	id: string;
	exchange_id: string;
	flight_number?: string;
	airline?: string;
	arrival_airport: 'RBA_RABAT' | 'CMN_CASABLANCA' | 'RAK_MARRAKECH';
	arrival_datetime: string;
	terminal?: string;
	pickup_status: 'PENDING' | 'ASSIGNED' | 'EN_ROUTE' | 'PICKED_UP' | 'NO_SHOW';
	assigned_driver_id?: string;
	driver_name?: string;
	driver_contact?: string;
	transport_mode: 'CAR' | 'TRAIN' | 'TAXI';
	notes?: string;
	created_at: string;
	exchange_code?: string;
	ep_name?: string;
}

export interface AccommodationUnit {
	id: string;
	unit_name: string;
	address: string;
	neighborhood: string;
	unit_type: 'HOST_FAMILY' | 'AIESEC_APARTMENT' | 'DORMITORY' | 'HOTEL';
	capacity_beds: number;
	occupied_beds: number;
	monthly_rent_mad: number;
	landlord_name?: string;
	landlord_phone?: string;
	safety_inspection_passed: boolean;
	last_inspected_at?: string;
	created_at: string;
}

export async function fetchExchanges(
	deliveryStatus?: string,
	modality?: string,
	search?: string
): Promise<Exchange[]> {
	const params = new URLSearchParams();
	if (deliveryStatus) params.set('delivery_status', deliveryStatus);
	if (modality) params.set('modality', modality);
	if (search) params.set('search', search);
	const query = params.toString() ? `?${params.toString()}` : '';
	return apiRequest<Exchange[]>(`/exchanges${query}`);
}

export async function fetchExchange(id: string): Promise<Exchange> {
	return apiRequest<Exchange>(`/exchanges/${id}`);
}

export async function spawnExchangeFromApp(appId: string): Promise<Exchange> {
	return apiRequest<Exchange>(`/exchanges/spawn-from-app/${appId}`, {
		method: 'POST'
	});
}

export async function updateChecklistItem(
	exchangeId: string,
	checklistId: string,
	payload: { is_completed: boolean; notes?: string }
): Promise<ExchangeChecklist> {
	return apiRequest<ExchangeChecklist>(`/exchanges/${exchangeId}/checklists/${checklistId}`, {
		method: 'PUT',
		body: JSON.stringify(payload)
	});
}

export async function reportIncident(
	exchangeId: string,
	payload: { incident_type: string; severity: string; description: string }
): Promise<ExchangeIncident> {
	return apiRequest<ExchangeIncident>(`/exchanges/${exchangeId}/incidents`, {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export async function resolveIncident(
	incidentId: string,
	resolutionNotes: string
): Promise<ExchangeIncident> {
	return apiRequest<ExchangeIncident>(`/exchanges/incidents/${incidentId}/resolve`, {
		method: 'PUT',
		body: JSON.stringify({ resolution_notes: resolutionNotes })
	});
}

export async function fetchArrivals(pickupStatus?: string): Promise<ArrivalLogistics[]> {
	const path = pickupStatus ? `/logistics/arrivals?pickup_status=${pickupStatus}` : '/logistics/arrivals';
	return apiRequest<ArrivalLogistics[]>(path);
}

export async function recordArrival(payload: Partial<ArrivalLogistics>): Promise<ArrivalLogistics> {
	return apiRequest<ArrivalLogistics>('/logistics/arrivals', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export async function updatePickupStatus(
	logisticsId: string,
	payload: { pickup_status: string; driver_name?: string; driver_contact?: string; notes?: string }
): Promise<ArrivalLogistics> {
	return apiRequest<ArrivalLogistics>(`/logistics/arrivals/${logisticsId}/status`, {
		method: 'PUT',
		body: JSON.stringify(payload)
	});
}

export async function fetchAccommodations(): Promise<AccommodationUnit[]> {
	return apiRequest<AccommodationUnit[]>('/logistics/accommodations');
}

export async function createAccommodation(payload: Partial<AccommodationUnit>): Promise<AccommodationUnit> {
	return apiRequest<AccommodationUnit>('/logistics/accommodations', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export async function assignAccommodation(payload: {
	exchange_id: string;
	accommodation_unit_id: string;
	check_in_date: string;
	check_out_date: string;
	bed_number?: string;
	key_deposit_mad?: number;
	notes?: string;
}): Promise<any> {
	return apiRequest('/logistics/accommodations/assign', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}
