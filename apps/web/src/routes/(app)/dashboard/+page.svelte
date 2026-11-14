<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';

	// Synthetic initial operational metrics
	const kpis = [
		{ title: 'Active Local Partners', value: '24', change: '+3 this month', tone: 'emerald' },
		{ title: 'Open Opportunity Slots', value: '48', change: '12 pending match', tone: 'blue' },
		{ title: 'In-Flight Exchanges', value: '17', change: '100% standards audit', tone: 'teal' },
		{ title: 'Pending Human Approvals', value: '3', change: 'Requires LCP/LCVP', tone: 'amber' },
	];

	const activeProducts = [
		{ code: 'iGV', name: 'Global Volunteer', desc: 'Social impact NGO & School projects (4-8w, Unpaid)', active: 14, color: 'bg-brand-crimson' },
		{ code: 'iGTa', name: 'Global Talent', desc: 'Professional internships (IT, BD, MKT, 6-78w, Living Salary)', active: 8, color: 'bg-brand-blue' },
		{ code: 'iGTe', name: 'Global Teacher', desc: 'Educational institutions & language centers (Salary mandatory)', active: 4, color: 'bg-brand-amber' },
	];
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h2 class="text-xl font-bold text-content-primary">Operations Overview</h2>
			<p class="text-xs text-content-muted mt-0.5">Welcome back, {auth.user?.full_name || 'Officer'}. Real-time operational pulse of AIESEC in Rabat.</p>
		</div>

		<div class="flex items-center gap-2">
			<a
				href="/approvals"
				class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-brand-amber/10 border border-brand-amber/30 text-brand-amber text-xs font-semibold hover:bg-brand-amber/20 transition-colors"
			>
				<span class="w-2 h-2 rounded-full bg-brand-amber"></span>
				Approval Queue (3)
			</a>
			<a
				href="/opportunities"
				class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-brand-navy transition-colors shadow-sm"
			>
				<span>+ New Opportunity</span>
			</a>
		</div>
	</div>

	<!-- KPI Metric Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		{#each kpis as kpi}
			<div class="p-4 rounded-xl border border-surface-border bg-surface-1 shadow-sm transition-colors">
				<span class="text-xs text-content-muted font-medium">{kpi.title}</span>
				<div class="flex items-baseline justify-between mt-2">
					<span class="text-2xl font-bold text-content-primary">{kpi.value}</span>
					<span class="text-[11px] font-semibold text-brand-{kpi.tone}">{kpi.change}</span>
				</div>
			</div>
		{/each}
	</div>

	<!-- Two-Sided Marketplace Products -->
	<div>
		<h3 class="text-xs font-bold text-content-muted uppercase tracking-wider mb-3">Incoming Exchange Products</h3>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			{#each activeProducts as prod}
				<div class="p-5 rounded-xl border border-surface-border bg-surface-1 flex flex-col justify-between">
					<div>
						<div class="flex items-center justify-between mb-2">
							<span class="text-xs font-bold px-2 py-0.5 rounded text-white {prod.color}">{prod.code}</span>
							<span class="text-xs font-medium text-content-muted">{prod.active} Active Slots</span>
						</div>
						<h4 class="text-sm font-semibold text-content-primary mt-1">{prod.name}</h4>
						<p class="text-xs text-content-muted mt-1 leading-relaxed">{prod.desc}</p>
					</div>

					<div class="mt-4 pt-3 border-t border-surface-border flex items-center justify-between text-xs">
						<span class="text-content-secondary">Pipeline: Healthy</span>
						<a href="/opportunities" class="text-brand-blue font-semibold hover:underline">Manage &rarr;</a>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Operational Invariants & Governance Notice -->
	<div class="p-4 rounded-xl border border-surface-border bg-surface-1/50 flex items-start gap-3">
		<svg class="w-5 h-5 text-brand-blue shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
		<div class="text-xs leading-relaxed text-content-secondary">
			<span class="font-semibold text-content-primary">Governance Active:</span>
			Local operational readiness is maintained independently of official EXPA statuses.
			All consequential AI proposals (status updates, external communications, financial waivers) require human approval in the Approval Center.
		</div>
	</div>
</div>
