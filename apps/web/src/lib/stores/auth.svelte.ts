import { apiRequest } from '$lib/api/client';

export interface User {
	id: string;
	email: string;
	full_name: string;
	phone?: string;
	is_active: boolean;
	roles: string[];
	permissions: string[];
	created_at: string;
}

export class AuthStore {
	user = $state<User | null>(null);
	token = $state<string | null>(null);
	loading = $state<boolean>(true);
	error = $state<string | null>(null);

	constructor() {
		if (typeof window !== 'undefined') {
			this.token = localStorage.getItem('access_token');
			if (this.token) {
				this.fetchCurrentUser();
			} else {
				this.loading = false;
			}
		}
	}

	async fetchCurrentUser() {
		this.loading = true;
		this.error = null;
		try {
			const userData = await apiRequest<User>('/auth/me');
			this.user = userData;
		} catch (err: any) {
			this.token = null;
			this.user = null;
			if (typeof window !== 'undefined') {
				localStorage.removeItem('access_token');
			}
		} finally {
			this.loading = false;
		}
	}

	async login(email: string, password: string): Promise<boolean> {
		this.loading = true;
		this.error = null;
		try {
			const res = await apiRequest<{ access_token: string }>('/auth/login', {
				method: 'POST',
				body: JSON.stringify({ email, password }),
			});
			this.token = res.access_token;
			if (typeof window !== 'undefined') {
				localStorage.setItem('access_token', res.access_token);
			}
			await this.fetchCurrentUser();
			return true;
		} catch (err: any) {
			this.error = err.message || 'Login failed';
			return false;
		} finally {
			this.loading = false;
		}
	}

	logout() {
		this.user = null;
		this.token = null;
		if (typeof window !== 'undefined') {
			localStorage.removeItem('access_token');
			window.location.href = '/login';
		}
	}

	hasRole(role: string): boolean {
		return this.user?.roles.includes(role) ?? false;
	}

	hasPermission(perm: string): boolean {
		return this.user?.permissions.includes(perm) ?? false;
	}
}

export const auth = new AuthStore();
