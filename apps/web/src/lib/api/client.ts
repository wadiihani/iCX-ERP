// Typed API Client for FastAPI backend
const BACKEND_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
const API_BASE = `${BACKEND_URL}/api/v1`;

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: {
		code: string;
		message: string;
		details?: any[];
	};
}

export async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<T> {
	const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options.headers as Record<string, string>),
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

	const response = await fetch(url, {
		...options,
		headers,
	});

	if (response.status === 401 && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
		localStorage.removeItem('access_token');
		window.location.href = '/login';
	}

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.detail || data.message || 'API request failed');
	}

	return data as T;
}
