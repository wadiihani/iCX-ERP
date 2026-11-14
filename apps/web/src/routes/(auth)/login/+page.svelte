<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';

	let email = $state('');
	let password = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state<string | null>(null);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!email || !password) {
			errorMessage = 'Please enter both email and password';
			return;
		}

		isSubmitting = true;
		errorMessage = null;

		const success = await auth.login(email, password);
		if (success) {
			window.location.href = '/dashboard';
		} else {
			errorMessage = auth.error || 'Authentication failed. Please verify credentials.';
		}
		isSubmitting = false;
	}
</script>

<div class="min-h-screen flex items-center justify-center p-4 bg-surface-0">
	<div class="w-full max-w-md bg-surface-1 border border-surface-border rounded-xl p-8 shadow-xl">
		<div class="text-center mb-8">
			<div class="w-12 h-12 rounded-xl bg-brand-blue flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-md">
				A
			</div>
			<h1 class="text-xl font-bold text-content-primary">iCX Command Center</h1>
			<p class="text-xs text-content-muted mt-1">AIESEC in Rabat &bull; Operations Portal</p>
		</div>

		{#if errorMessage}
			<div class="mb-6 p-3 rounded-lg bg-brand-crimson/10 border border-brand-crimson/30 text-brand-crimson text-xs flex items-center gap-2">
				<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span>{errorMessage}</span>
			</div>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-4">
			<div>
				<label for="email" class="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1.5">
					Email Address
				</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					placeholder="name@aiesec.net"
					class="w-full px-3.5 py-2.5 rounded-lg border border-surface-border bg-surface-0 text-content-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-colors placeholder:text-content-muted"
				/>
			</div>

			<div>
				<label for="password" class="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1.5">
					Password
				</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					placeholder="••••••••••••"
					class="w-full px-3.5 py-2.5 rounded-lg border border-surface-border bg-surface-0 text-content-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-colors placeholder:text-content-muted"
				/>
			</div>

			<div class="pt-2">
				<button
					type="submit"
					disabled={isSubmitting}
					class="w-full py-2.5 px-4 rounded-lg bg-brand-blue hover:bg-brand-navy text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
				>
					{#if isSubmitting}
						<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						<span>Authenticating...</span>
					{:else}
						<span>Sign In to Command Center</span>
					{/if}
				</button>
			</div>
		</form>

		<div class="mt-8 pt-6 border-t border-surface-border text-center">
			<p class="text-[11px] text-content-muted">
				Protected under AIESEC Rabat Data Governance &bull; Zero Leakage Policy
			</p>
		</div>
	</div>
</div>
