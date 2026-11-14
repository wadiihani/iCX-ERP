<script lang="ts">
	import { theme } from '$lib/stores/theme.svelte';
	import { auth } from '$lib/stores/auth.svelte';

	let { onToggleSidebar = () => {} } = $props<{ onToggleSidebar?: () => void }>();
</script>

<header class="h-16 border-b border-surface-border bg-surface-1 px-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
	<div class="flex items-center gap-4">
		<button
			onclick={onToggleSidebar}
			class="p-2 rounded-lg text-content-secondary hover:bg-surface-2 hover:text-content-primary md:hidden"
			aria-label="Toggle Navigation"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
		</button>

		<div class="flex items-center gap-3">
			<div class="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center font-bold text-white shadow-sm">
				A
			</div>
			<div>
				<h1 class="text-sm font-semibold text-content-primary leading-tight">iCX Command Center</h1>
				<span class="text-xs text-content-muted">AIESEC in Rabat</span>
			</div>
		</div>
	</div>

	<div class="flex items-center gap-3">
		<!-- Search / Command Palette shortcut -->
		<div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-border bg-surface-0 text-xs text-content-muted">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			<span>Quick search...</span>
			<kbd class="px-1.5 py-0.5 rounded bg-surface-2 text-content-secondary text-[10px] font-mono">⌘K</kbd>
		</div>

		<!-- Theme Toggle -->
		<button
			onclick={() => theme.toggle()}
			class="p-2 rounded-lg text-content-secondary hover:bg-surface-2 hover:text-content-primary transition-colors"
			aria-label="Toggle Theme"
			title="Toggle Dark/Light Mode"
		>
			{#if theme.current === 'dark'}
				<svg class="w-4 h-4 text-brand-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
				</svg>
			{:else}
				<svg class="w-4 h-4 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
				</svg>
			{/if}
		</button>

		<!-- User Profile & Logout -->
		{#if auth.user}
			<div class="flex items-center gap-3 pl-2 border-l border-surface-border">
				<div class="hidden md:flex flex-col text-right">
					<span class="text-xs font-medium text-content-primary">{auth.user.full_name}</span>
					<span class="text-[10px] text-brand-blue font-semibold uppercase">{auth.user.roles[0] || 'MEMBER'}</span>
				</div>
				<button
					onclick={() => auth.logout()}
					class="p-1.5 rounded-lg text-content-muted hover:text-brand-crimson hover:bg-surface-2 transition-colors text-xs flex items-center gap-1"
					title="Sign Out"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
				</button>
			</div>
		{/if}
	</div>
</header>
