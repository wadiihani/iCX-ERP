<script lang="ts">
	import { onMount } from 'svelte';
	import {
		fetchSendingEntities,
		createSendingEntity,
		fetchVisaFeasibilities,
		createVisaFeasibility,
		fetchIRMPartnerships,
		createIRMPartnership,
		type SendingEntity,
		type VisaFeasibility,
		type IRMPartnership
	} from '$lib/api/irm';

	// Svelte 5 runes
	let sendingEntities = $state<SendingEntity[]>([]);
	let visaAssessments = $state<VisaFeasibility[]>([]);
	let partnerships = $state<IRMPartnership[]>([]);
	let isLoading = $state(true);
	let errorMsg = $state<string | null>(null);
	let successMsg = $state<string | null>(null);

	// Tabs & Filters
	let activeTab = $state<'PARTNERSHIPS' | 'ENTITIES' | 'VISA'>('PARTNERSHIPS');
	let clusterFilter = $state<'ALL' | 'UPSCALE' | 'GROW' | 'INVEST' | 'UNDERSTAND'>('ALL');
	let regionFilter = $state<string>('ALL');
	let searchQuery = $state('');

	// Modals
	let showEntityModal = $state(false);
	let showVisaModal = $state(false);
	let showPartnershipModal = $state(false);
	let isActionLoading = $state(false);

	// New Entity Form
	let newEntity = $state({
		country: '',
		mc_name: '',
		lc_name: '',
		region: 'Europe' as 'MEA' | 'Europe' | 'Americas' | 'Asia-Pacific',
		snd_cluster: 'GROW' as 'UPSCALE' | 'GROW' | 'INVEST' | 'UNDERSTAND',
		primary_contact_name: '',
		primary_contact_email: ''
	});

	// New Visa Assessment Form
	let newVisa = $state({
		country: '',
		assessment_status: 'FEASIBLE' as 'FEASIBLE' | 'CONDITIONAL' | 'HIGH_RISK' | 'RESTRICTED',
		estimated_processing_days: 30,
		visa_category: 'Volunteer / Internship Entry Visa',
		source_citation: 'Morocco Directorate General of National Security (DGSN) / Consular Portal',
		effective_date: new Date().toISOString().split('T')[0],
		notes: ''
	});

	// New Partnership Form
	let newPartnership = $state({
		sending_entity_id: '',
		product_type: 'ALL' as 'iGV' | 'iGTa' | 'iGTe' | 'ALL',
		target_pipeline_eps: 5,
		delivered_eps: 0,
		status: 'ACTIVE' as 'PROSPECT' | 'ACTIVE' | 'STALLED' | 'COMPLETED',
		weekly_sync_cadence: 'Weekly on Thursdays 18:00 CET',
		notes: ''
	});

	const filteredEntities = $derived(
		sendingEntities.filter((e) => {
			const matchesCluster = clusterFilter === 'ALL' || e.snd_cluster === clusterFilter;
			const matchesRegion = regionFilter === 'ALL' || e.region === regionFilter;
			const matchesSearch =
				e.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
				e.mc_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				e.lc_name.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesCluster && matchesRegion && matchesSearch;
		})
	);

	async function loadData() {
		isLoading = true;
		errorMsg = null;
		try {
			const [entities, visas, parts] = await Promise.all([
				fetchSendingEntities(),
				fetchVisaFeasibilities(),
				fetchIRMPartnerships()
			]);
			sendingEntities = entities;
			visaAssessments = visas;
			partnerships = parts;
			if (entities.length > 0 && !newPartnership.sending_entity_id) {
				newPartnership.sending_entity_id = entities[0].id;
			}
		} catch (err: any) {
			errorMsg = err.message || 'Failed to load IRM data';
		} finally {
			isLoading = false;
		}
	}

	async function submitEntity() {
		isActionLoading = true;
		try {
			await createSendingEntity(newEntity);
			successMsg = `Sending Entity ${newEntity.lc_name} (${newEntity.country}) registered successfully!`;
			showEntityModal = false;
			await loadData();
		} catch (err: any) {
			errorMsg = err.message || 'Failed to register sending entity';
		} finally {
			isActionLoading = false;
		}
	}

	async function submitVisa() {
		isActionLoading = true;
		try {
			await createVisaFeasibility(newVisa);
			successMsg = `Visa feasibility assessment for ${newVisa.country} recorded!`;
			showVisaModal = false;
			await loadData();
		} catch (err: any) {
			errorMsg = err.message || 'Failed to save visa feasibility assessment';
		} finally {
			isActionLoading = false;
		}
	}

	async function submitPartnership() {
		isActionLoading = true;
		try {
			await createIRMPartnership(newPartnership);
			successMsg = `IRM Partnership created successfully!`;
			showPartnershipModal = false;
			await loadData();
		} catch (err: any) {
			errorMsg = err.message || 'Failed to create partnership';
		} finally {
			isActionLoading = false;
		}
	}

	onMount(() => {
		loadData();
	});
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold tracking-tight text-content-primary">International Relations (IRM)</h1>
			<p class="text-sm text-content-secondary mt-1">
				Supply & Demand clustering (SnD), Global Sending Entities directory, and sourced Moroccan visa feasibility matrices.
			</p>
		</div>
		<div class="flex items-center gap-3">
			<button
				onclick={() => (showPartnershipModal = true)}
				class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs font-semibold text-content-primary hover:bg-surface-3 transition"
			>
				New Partnership
			</button>
			<button
				onclick={() => (showEntityModal = true)}
				class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 transition shadow-sm"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Register Sending Entity
			</button>
		</div>
	</div>

	<!-- Alerts -->
	{#if errorMsg}
		<div class="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
			<span>{errorMsg}</span>
			<button onclick={() => (errorMsg = null)} class="underline text-[11px] ml-4">Dismiss</button>
		</div>
	{/if}
	{#if successMsg}
		<div class="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
			<span>{successMsg}</span>
			<button onclick={() => (successMsg = null)} class="underline text-[11px] ml-4">Dismiss</button>
		</div>
	{/if}

	<!-- Sub-Navigation Tabs -->
	<div class="flex border-b border-surface-border gap-6">
		<button
			onclick={() => (activeTab = 'PARTNERSHIPS')}
			class="pb-3 text-xs font-semibold transition border-b-2 {activeTab === 'PARTNERSHIPS'
				? 'border-brand-blue text-brand-blue'
				: 'border-transparent text-content-muted hover:text-content-secondary'}"
		>
			IR Partnerships & Commitments ({partnerships.length})
		</button>
		<button
			onclick={() => (activeTab = 'ENTITIES')}
			class="pb-3 text-xs font-semibold transition border-b-2 {activeTab === 'ENTITIES'
				? 'border-brand-blue text-brand-blue'
				: 'border-transparent text-content-muted hover:text-content-secondary'}"
		>
			Sending Entities Directory ({sendingEntities.length})
		</button>
		<button
			onclick={() => (activeTab = 'VISA')}
			class="pb-3 text-xs font-semibold transition border-b-2 {activeTab === 'VISA'
				? 'border-brand-blue text-brand-blue'
				: 'border-transparent text-content-muted hover:text-content-secondary'}"
		>
			Morocco Visa Feasibility Matrix ({visaAssessments.length})
		</button>
	</div>

	<!-- Tab 1: Partnerships -->
	{#if activeTab === 'PARTNERSHIPS'}
		{#if isLoading}
			<div class="p-12 text-center text-xs text-content-muted">Loading IR Partnerships...</div>
		{:else if partnerships.length === 0}
			<div class="p-12 text-center border border-dashed border-surface-border rounded-xl">
				<p class="text-sm font-medium text-content-secondary">No active IR partnerships</p>
				<p class="text-xs text-content-muted mt-1">Form bilateral agreements with partner LCs to secure EP applicant pipelines.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each partnerships as part}
					<div class="p-5 rounded-xl bg-surface-1 border border-surface-border space-y-4 shadow-sm">
						<div class="flex items-center justify-between">
							<span class="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
								{part.product_type}
							</span>
							<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
								{part.status}
							</span>
						</div>

						<div>
							<h3 class="text-base font-bold text-content-primary">
								{part.sending_entity_lc || 'Partner LC'} ({part.sending_entity_country || 'Global'})
							</h3>
							<p class="text-xs text-content-muted mt-1">Cadence: {part.weekly_sync_cadence}</p>
						</div>

						<!-- Progress Bar: Target vs Delivered -->
						<div class="space-y-1.5 pt-2 border-t border-surface-border">
							<div class="flex items-center justify-between text-xs">
								<span class="text-content-secondary">Delivered EPs</span>
								<span class="font-bold text-content-primary">{part.delivered_eps} / {part.target_pipeline_eps}</span>
							</div>
							<div class="w-full h-2 rounded-full bg-surface-2 overflow-hidden">
								<div
									class="h-full bg-brand-blue rounded-full transition-all"
									style="width: {Math.min(100, (part.delivered_eps / Math.max(1, part.target_pipeline_eps)) * 100)}%"
								></div>
							</div>
						</div>

						{#if part.notes}
							<p class="text-[11px] text-content-muted italic bg-surface-2/60 p-2 rounded-lg">"{part.notes}"</p>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{/if}

	<!-- Tab 2: Sending Entities Directory -->
	{#if activeTab === 'ENTITIES'}
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div class="flex items-center gap-2">
				{#each ['ALL', 'UPSCALE', 'GROW', 'INVEST', 'UNDERSTAND'] as cl}
					<button
						onclick={() => (clusterFilter = cl as any)}
						class="px-3 py-1 rounded-lg text-xs font-semibold transition {clusterFilter === cl
							? 'bg-surface-3 text-content-primary border border-surface-border'
							: 'text-content-muted hover:text-content-secondary'}"
					>
						{cl}
					</button>
				{/each}
			</div>

			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search LC, MC, country..."
				class="w-full sm:w-64 px-3 py-1.5 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"
			/>
		</div>

		<div class="overflow-x-auto rounded-xl border border-surface-border bg-surface-1">
			<table class="w-full text-left text-xs">
				<thead class="bg-surface-2/50 border-b border-surface-border text-content-muted text-[10px] uppercase font-bold">
					<tr>
						<th class="p-3">LC / MC Name</th>
						<th class="p-3">Country & Region</th>
						<th class="p-3">SnD Cluster</th>
						<th class="p-3">Primary Contact</th>
						<th class="p-3">Status</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-surface-border">
					{#each filteredEntities as entity}
						<tr class="hover:bg-surface-2/40 transition">
							<td class="p-3">
								<div class="font-bold text-content-primary">{entity.lc_name}</div>
								<div class="text-[11px] text-content-muted font-mono">{entity.mc_name}</div>
							</td>
							<td class="p-3">
								<div class="text-content-primary font-medium">{entity.country}</div>
								<div class="text-[11px] text-content-muted">{entity.region}</div>
							</td>
							<td class="p-3">
								<span
									class="px-2 py-0.5 rounded text-[10px] font-bold uppercase {entity.snd_cluster === 'UPSCALE'
										? 'bg-emerald-500/20 text-emerald-400'
										: entity.snd_cluster === 'GROW'
										? 'bg-blue-500/20 text-blue-400'
										: entity.snd_cluster === 'INVEST'
										? 'bg-amber-500/20 text-amber-400'
										: 'bg-zinc-500/20 text-zinc-400'}"
								>
									{entity.snd_cluster}
								</span>
							</td>
							<td class="p-3">
								<div class="text-content-primary">{entity.primary_contact_name || 'N/A'}</div>
								<div class="text-[11px] text-content-muted font-mono">{entity.primary_contact_email || ''}</div>
							</td>
							<td class="p-3">
								<span class="text-emerald-400 font-semibold">{entity.status}</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<!-- Tab 3: Moroccan Visa Feasibility Matrix -->
	{#if activeTab === 'VISA'}
		<!-- Mandatory Policy Advisory Banner -->
		<div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
			<svg class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
			</svg>
			<div class="space-y-1 text-xs">
				<div class="font-bold text-amber-300">Operational Planning Notice — Sourced Feasibility Assessments</div>
				<p class="text-amber-200/80 leading-relaxed">
					Visa feasibility records represent operational benchmarks and must cite verifiable sources. Assessments do not constitute formal legal counsel. Consular requirements for Morocco are subject to sovereign updates by the Ministry of Foreign Affairs (MAEC).
				</p>
			</div>
			<button
				onclick={() => (showVisaModal = true)}
				class="ml-auto shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 text-black font-semibold text-xs hover:bg-amber-400 transition"
			>
				Add Assessment
			</button>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			{#each visaAssessments as visa}
				<div class="p-5 rounded-xl bg-surface-1 border border-surface-border space-y-3 shadow-sm">
					<div class="flex items-center justify-between">
						<h3 class="text-base font-bold text-content-primary">{visa.country}</h3>
						<span
							class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider {visa.assessment_status === 'FEASIBLE'
								? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
								: visa.assessment_status === 'CONDITIONAL'
								? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
								: 'bg-red-500/20 text-red-400 border border-red-500/30'}"
						>
							{visa.assessment_status}
						</span>
					</div>

					<div class="grid grid-cols-2 gap-3 text-xs">
						<div>
							<span class="text-content-muted text-[10px] uppercase font-bold block">Estimated Lead Time</span>
							<span class="text-content-primary font-semibold">~{visa.estimated_processing_days} days</span>
						</div>
						<div>
							<span class="text-content-muted text-[10px] uppercase font-bold block">Visa Category</span>
							<span class="text-content-secondary">{visa.visa_category}</span>
						</div>
					</div>

					<div class="p-2.5 rounded-lg bg-surface-2 border border-surface-border/60 text-xs space-y-1">
						<span class="text-content-muted text-[10px] uppercase font-bold block">Verified Source Citation</span>
						<p class="text-content-primary font-medium">{visa.source_citation}</p>
						<span class="text-[10px] text-content-muted font-mono block">Effective: {visa.effective_date}</span>
					</div>

					{#if visa.notes}
						<p class="text-xs text-content-secondary">{visa.notes}</p>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal: Register Sending Entity -->
{#if showEntityModal}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="w-full max-w-md bg-surface-1 border border-surface-border rounded-2xl p-6 space-y-4 shadow-2xl">
			<div class="flex items-center justify-between pb-3 border-b border-surface-border">
				<h3 class="text-base font-bold text-content-primary">Register Sending Entity</h3>
				<button onclick={() => (showEntityModal = false)} class="text-content-muted hover:text-content-primary">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="space-y-3 text-xs">
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Country *</label>
						<input type="text" bind:value={newEntity.country} placeholder="France" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
					</div>
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Region *</label>
						<select bind:value={newEntity.region} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue">
							<option value="Europe">Europe</option>
							<option value="MEA">MEA</option>
							<option value="Americas">Americas</option>
							<option value="Asia-Pacific">Asia-Pacific</option>
						</select>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">MC Entity Name *</label>
						<input type="text" bind:value={newEntity.mc_name} placeholder="AIESEC in France" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
					</div>
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Local Committee (LC) *</label>
						<input type="text" bind:value={newEntity.lc_name} placeholder="AIESEC Paris" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
					</div>
				</div>

				<div class="space-y-1">
					<label class="font-semibold text-content-primary">SnD Cluster *</label>
					<select bind:value={newEntity.snd_cluster} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue">
						<option value="UPSCALE">UPSCALE (High Demand & Conversion)</option>
						<option value="GROW">GROW (Moderate Steady Conversion)</option>
						<option value="INVEST">INVEST (Emerging High Potential)</option>
						<option value="UNDERSTAND">UNDERSTAND (Low Historical Alignment)</option>
					</select>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Contact Name</label>
						<input type="text" bind:value={newEntity.primary_contact_name} placeholder="Jean Dupont" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
					</div>
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Contact Email</label>
						<input type="email" bind:value={newEntity.primary_contact_email} placeholder="vp.ogx@aiesec.fr" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue font-mono" />
					</div>
				</div>
			</div>

			<div class="flex justify-end gap-3 pt-3 border-t border-surface-border">
				<button onclick={() => (showEntityModal = false)} class="px-3 py-1.5 rounded-lg bg-surface-2 text-xs font-semibold text-content-secondary">Cancel</button>
				<button disabled={isActionLoading || !newEntity.country || !newEntity.lc_name} onclick={submitEntity} class="px-4 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 disabled:opacity-50">Save Entity</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal: Visa Feasibility -->
{#if showVisaModal}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="w-full max-w-md bg-surface-1 border border-surface-border rounded-2xl p-6 space-y-4 shadow-2xl">
			<div class="flex items-center justify-between pb-3 border-b border-surface-border">
				<h3 class="text-base font-bold text-content-primary">Record Visa Feasibility</h3>
				<button onclick={() => (showVisaModal = false)} class="text-content-muted hover:text-content-primary">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="space-y-3 text-xs">
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Country *</label>
						<input type="text" bind:value={newVisa.country} placeholder="Germany" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
					</div>
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Status *</label>
						<select bind:value={newVisa.assessment_status} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue">
							<option value="FEASIBLE">FEASIBLE (Visa-Free / Rapid)</option>
							<option value="CONDITIONAL">CONDITIONAL (Embassy Appointment)</option>
							<option value="HIGH_RISK">HIGH_RISK (Extended Delay > 60d)</option>
							<option value="RESTRICTED">RESTRICTED</option>
						</select>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Lead Time (Days)</label>
						<input type="number" bind:value={newVisa.estimated_processing_days} min="1" max="180" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
					</div>
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Effective Date</label>
						<input type="date" bind:value={newVisa.effective_date} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
					</div>
				</div>

				<div class="space-y-1">
					<label class="font-semibold text-content-primary">Source Citation (Must be cited) *</label>
					<input type="text" bind:value={newVisa.source_citation} placeholder="Moroccan Consulate Frankfurt Bulletin / DGSN portal" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
				</div>
			</div>

			<div class="flex justify-end gap-3 pt-3 border-t border-surface-border">
				<button onclick={() => (showVisaModal = false)} class="px-3 py-1.5 rounded-lg bg-surface-2 text-xs font-semibold text-content-secondary">Cancel</button>
				<button disabled={isActionLoading || !newVisa.country || !newVisa.source_citation} onclick={submitVisa} class="px-4 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 disabled:opacity-50">Save Assessment</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal: New Partnership -->
{#if showPartnershipModal}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="w-full max-w-md bg-surface-1 border border-surface-border rounded-2xl p-6 space-y-4 shadow-2xl">
			<div class="flex items-center justify-between pb-3 border-b border-surface-border">
				<h3 class="text-base font-bold text-content-primary">New IR Partnership</h3>
				<button onclick={() => (showPartnershipModal = false)} class="text-content-muted hover:text-content-primary">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="space-y-3 text-xs">
				<div class="space-y-1">
					<label class="font-semibold text-content-primary">Partner Sending Entity *</label>
					<select bind:value={newPartnership.sending_entity_id} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue">
						{#each sendingEntities as ent}
							<option value={ent.id}>{ent.lc_name} ({ent.country}) - {ent.snd_cluster}</option>
						{/each}
					</select>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Product Scope</label>
						<select bind:value={newPartnership.product_type} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue">
							<option value="ALL">All Products</option>
							<option value="iGV">iGV Only</option>
							<option value="iGTa">iGTa Only</option>
							<option value="iGTe">iGTe Only</option>
						</select>
					</div>
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Target EPs</label>
						<input type="number" bind:value={newPartnership.target_pipeline_eps} min="1" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
					</div>
				</div>

				<div class="space-y-1">
					<label class="font-semibold text-content-primary">Sync Cadence</label>
					<input type="text" bind:value={newPartnership.weekly_sync_cadence} placeholder="Bi-weekly on Tuesdays" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
				</div>
			</div>

			<div class="flex justify-end gap-3 pt-3 border-t border-surface-border">
				<button onclick={() => (showPartnershipModal = false)} class="px-3 py-1.5 rounded-lg bg-surface-2 text-xs font-semibold text-content-secondary">Cancel</button>
				<button disabled={isActionLoading || !newPartnership.sending_entity_id} onclick={submitPartnership} class="px-4 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 disabled:opacity-50">Create Partnership</button>
			</div>
		</div>
	</div>
{/if}
