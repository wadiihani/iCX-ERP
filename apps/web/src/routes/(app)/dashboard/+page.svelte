<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { fetchDashboardOverview, type DashboardOverview } from '$lib/api/finance';

	// Svelte 5 runes
	let overview = $state<DashboardOverview | null>(null);
	let isLoading = $state(true);
	let errorMsg = $state<string | null>(null);

	const activeProducts = [
		{ code: 'iGV', name: 'Global Volunteer', desc: 'Social impact NGO & School projects (4-8w, Unpaid, SDG aligned)', color: 'bg-red-500' },
		{ code: 'iGTa', name: 'Global Talent', desc: 'Professional internships (IT, BD, MKT, 6-78w, Living Salary)', color: 'bg-blue-500' },
		{ code: 'iGTe', name: 'Global Teacher', desc: 'Educational institutions & language centers (Mandatory salary)', color: 'bg-amber-500' },
	];

	async function loadOverview() {
		isLoading = true;
		errorMsg = null;
		try {
			const data = await fetchDashboardOverview();
			overview = data;
		} catch (err: any) {
			errorMsg = err.message || 'Failed to load live command center metrics';
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		loadOverview();
	});
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
		<div>
			<h1 class="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
				<span class="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
					</svg>
				</span>
				Operations Command Center
			</h1>
			<p class="text-xs text-muted-foreground mt-1">
				Real-time operational pulse of AIESEC in Rabat. Officer: <strong class="text-foreground">{auth.user?.full_name || 'Executive Officer'}</strong> ({auth.user?.email || 'admin'})
			</p>
		</div>

		<div class="flex items-center gap-2">
			<a
				href="/finance"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground transition-colors"
			>
				<span class="w-2 h-2 rounded-full {overview && overview.pending_approvals_count > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}"></span>
				Approval Queue ({overview?.pending_approvals_count || 0})
			</a>
			<a
				href="/opportunities"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
			>
				<span>+ New Opportunity</span>
			</a>
		</div>
	</div>

	<!-- Alert / Notification -->
	{#if errorMsg}
		<div class="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center justify-between">
			<span>{errorMsg}</span>
			<button class="text-xs underline" onclick={() => (errorMsg = null)}>Dismiss</button>
		</div>
	{/if}

	<!-- Small Sample Warning Alert -->
	{#if overview?.funnel.small_sample_warning}
		<div class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-center gap-2">
			<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
			<span><strong>Notice:</strong> {overview.funnel.warning_message}</span>
		</div>
	{/if}

	<!-- KPI Metric Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<!-- Active Leads -->
		<div class="p-4 rounded-xl border border-border bg-card shadow-sm">
			<span class="text-xs text-muted-foreground font-medium">Active Partner Leads</span>
			<div class="flex items-baseline justify-between mt-2">
				<span class="text-2xl font-extrabold font-mono text-foreground">
					{isLoading ? '—' : (overview?.active_leads_count || 0)}
				</span>
				<span class="text-[11px] font-semibold text-emerald-500">Pipeline Active</span>
			</div>
			<div class="text-[11px] text-muted-foreground mt-1">B2B Local Hosting Organizations</div>
		</div>

		<!-- In-Flight Exchanges -->
		<div class="p-4 rounded-xl border border-border bg-card shadow-sm">
			<span class="text-xs text-muted-foreground font-medium">In-Flight Exchanges</span>
			<div class="flex items-baseline justify-between mt-2">
				<span class="text-2xl font-extrabold font-mono text-primary">
					{isLoading ? '—' : (overview?.active_exchanges_count || 0)}
				</span>
				<span class="text-[11px] font-semibold text-blue-500">Realizing / Arrived</span>
			</div>
			<div class="text-[11px] text-muted-foreground mt-1">100% 18 Standards Audited</div>
		</div>

		<!-- Financial Receivables -->
		<div class="p-4 rounded-xl border border-border bg-card shadow-sm">
			<span class="text-xs text-muted-foreground font-medium">Collected Revenue</span>
			<div class="flex items-baseline justify-between mt-2">
				<span class="text-2xl font-extrabold font-mono text-emerald-500">
					{isLoading ? '—' : (overview?.finance.total_collected || 0)} <span class="text-xs font-normal">MAD</span>
				</span>
				<span class="text-[11px] font-mono text-muted-foreground">
					of {overview?.finance.total_expected || 0}
				</span>
			</div>
			<div class="text-[11px] text-muted-foreground mt-1">Overdue: {overview?.finance.total_overdue || 0} MAD</div>
		</div>

		<!-- SLA Compliance -->
		<div class="p-4 rounded-xl border border-border bg-card shadow-sm">
			<span class="text-xs text-muted-foreground font-medium">Overall SLA Compliance</span>
			<div class="flex items-baseline justify-between mt-2">
				<span class="text-2xl font-extrabold font-mono text-foreground">
					{isLoading ? '—' : `${overview?.sla.overall_compliance_percentage || 100}%`}
				</span>
				<span class="text-[11px] font-semibold text-emerald-500">Target &gt;90%</span>
			</div>
			<div class="text-[11px] text-muted-foreground mt-1">First contact 48h &amp; OP review 72h</div>
		</div>
	</div>

	<!-- EP Conversion Funnel (APP -> ACC -> APD -> RE -> FI -> CO) -->
	<div class="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
		<div class="flex items-center justify-between pb-3 border-b border-border/40">
			<div>
				<h2 class="text-base font-bold text-foreground">EP Exchange Conversion Funnel</h2>
				<p class="text-xs text-muted-foreground">Official EXPA stages decoupled from local operational delivery milestones.</p>
			</div>
			<span class="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-muted text-foreground">
				Total Candidates: {overview?.funnel.total_applications || 0}
			</span>
		</div>

		{#if isLoading}
			<div class="p-8 text-center text-xs text-muted-foreground">Loading funnel conversion data...</div>
		{:else if overview}
			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
				{#each overview.funnel.stages as stage}
					<div class="p-3.5 rounded-lg bg-muted/30 border border-border/50 flex flex-col justify-between">
						<div>
							<div class="flex items-center justify-between mb-1.5">
								<span class="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
									{stage.stage_code}
								</span>
								<span class="text-[11px] font-mono text-primary font-semibold">
									{stage.conversion_rate_percentage}%
								</span>
							</div>
							<div class="text-xs font-semibold text-foreground">{stage.stage_name}</div>
							<div class="text-2xl font-extrabold font-mono text-foreground mt-1">
								{stage.count}
							</div>
						</div>

						<div class="mt-3">
							<div class="w-full bg-muted rounded-full h-1.5 overflow-hidden">
								<div
									class="h-1.5 bg-primary rounded-full"
									style="width: {stage.conversion_rate_percentage}%"
								></div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- SLA Compliance Clocks & Incoming Exchange Products -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- SLA Clocks -->
		<div class="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
			<h2 class="text-base font-bold text-foreground pb-2 border-b border-border/40">SLA Clocks &amp; Timers</h2>
			{#if overview}
				<div class="space-y-4">
					{#each overview.sla.items as item}
						<div class="space-y-1.5">
							<div class="flex justify-between items-center text-xs">
								<span class="font-medium text-foreground">{item.metric_name}</span>
								<span class="font-mono font-bold {item.compliance_rate_percentage >= 90 ? 'text-emerald-500' : 'text-amber-500'}">
									{item.compliance_rate_percentage}%
								</span>
							</div>
							<div class="w-full bg-muted rounded-full h-2 overflow-hidden">
								<div
									class="h-2 rounded-full transition-all {item.compliance_rate_percentage >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}"
									style="width: {item.compliance_rate_percentage}%"
								></div>
							</div>
							<div class="text-[10px] text-muted-foreground flex justify-between">
								<span>Within SLA: {item.within_sla_count} / {item.total_evaluated}</span>
								<span>Target: &le; {item.target_hours}h</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Two-Sided Marketplace Products (Spans 2 columns) -->
		<div class="lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
			<div class="flex items-center justify-between pb-2 border-b border-border/40">
				<h2 class="text-base font-bold text-foreground">Incoming Exchange Modalities</h2>
				<span class="text-xs text-muted-foreground">Rabat Local Committee</span>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				{#each activeProducts as prod}
					<div class="p-4 rounded-xl border border-border/70 bg-muted/20 flex flex-col justify-between">
						<div>
							<div class="flex items-center justify-between mb-2">
								<span class="text-xs font-bold px-2 py-0.5 rounded text-white {prod.color}">{prod.code}</span>
								<span class="text-xs text-muted-foreground">Active</span>
							</div>
							<h3 class="text-sm font-semibold text-foreground mt-1">{prod.name}</h3>
							<p class="text-xs text-muted-foreground mt-1 leading-relaxed">{prod.desc}</p>
						</div>

						<div class="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
							<span class="text-muted-foreground">Rules: Enforced</span>
							<a href="/opportunities" class="text-primary font-semibold hover:underline">Manage &rarr;</a>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Operational Invariants Notice -->
	<div class="p-4 rounded-xl border border-border bg-card/60 flex items-start gap-3">
		<svg class="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
		<div class="text-xs leading-relaxed text-muted-foreground">
			<strong class="text-foreground">Governance Architecture Active:</strong>
			Official EXPA statuses (`APP`, `ACC`, `APD`, `RE`, `FI`, `CO`) are strictly separated from local operational readiness (`DRAFT`, `READY`, `AT_RISK`, `BLOCKED`, `DONE`). All consequential AI actions (status mutations, financial fee waivers, formal refunds) require explicit human sign-off in the executive approval center.
		</div>
	</div>
</div>
