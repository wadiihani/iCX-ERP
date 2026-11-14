<script lang="ts">
	import { onMount } from 'svelte';
	import {
		fetchOpportunities,
		createOpportunity,
		checkPublicationChecklist,
		publishOpportunity,
		fetchOpportunitySlots,
		type Opportunity,
		type OpportunitySlot,
		type PublicationChecklist
	} from '$lib/api/opportunities';
	import { getContracts, getOrganizations, type Contract, type Organization } from '$lib/api/prm';

	// Svelte 5 runes
	let opportunities = $state<Opportunity[]>([]);
	let contracts = $state<Contract[]>([]);
	let organizations = $state<Organization[]>([]);
	let isLoading = $state(true);
	let errorMsg = $state<string | null>(null);
	let successMsg = $state<string | null>(null);

	// Filters
	let selectedTab = $state<'ALL' | 'iGV' | 'iGTa' | 'iGTe'>('ALL');
	let searchQuery = $state('');

	// Modals & Drawers
	let showCreateDrawer = $state(false);
	let showChecklistModal = $state(false);
	let showSlotsModal = $state(false);
	let activeOpportunity = $state<Opportunity | null>(null);
	let checklistData = $state<PublicationChecklist | null>(null);
	let activeSlots = $state<OpportunitySlot[]>([]);
	let isActionLoading = $state(false);

	// New Opportunity Form State
	let formProductType = $state<'iGV' | 'iGTa' | 'iGTe'>('iGV');
	let formCode = $state('');
	let formTitle = $state('');
	let formContractId = $state('');
	let formOrgId = $state('');
	let formStartDate = $state(new Date().toISOString().split('T')[0]);
	let formEndDate = $state(new Date(Date.now() + 6 * 7 * 86400000).toISOString().split('T')[0]);
	let formDurationWeeks = $state(6);
	let formWorkingHours = $state(30);
	let formOpenings = $state(1);
	let formLocation = $state('Rabat, Morocco');
	let formDescription = $state('');
	let formRoleDescription = $state('');
	let formLineManagerName = $state('');
	let formLineManagerContact = $state('');

	// iGV specifics
	let formSdgNumber = $state(4);
	let formGlobalProject = $state('Global Classroom Rabat');
	let formHousingProvided = $state(true);

	// iGT specifics
	let formWorkField = $state<'BA' | 'BD' | 'MKT' | 'IT' | 'ENG' | 'FIN' | 'Other'>('IT');
	let formSubField = $state('');
	let formMonthlySalary = $state(4000);
	let formSalaryCoversLiving = $state(true);
	let formAccommodationCovered = $state(false);
	let formIsTeaching = $state(false);
	let formAccredited = $state(true);
	let formAccreditationDetails = $state('Ministry of National Education accredited');

	const filteredOpportunities = $derived(
		opportunities.filter((opp) => {
			const matchesTab = selectedTab === 'ALL' || opp.product_type === selectedTab;
			const matchesSearch =
				opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				opp.opportunity_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(opp.organization_name && opp.organization_name.toLowerCase().includes(searchQuery.toLowerCase()));
			return matchesTab && matchesSearch;
		})
	);

	const signedContracts = $derived(
		contracts.filter((c) => c.status === 'SIGNED' || c.status === 'ACTIVE_PARTNER')
	);

	async function loadData() {
		isLoading = true;
		errorMsg = null;
		try {
			const [opps, ctrs, orgs] = await Promise.all([
				fetchOpportunities(),
				getContracts(),
				getOrganizations()
			]);
			opportunities = opps;
			contracts = ctrs;
			organizations = orgs;
			if (signedContracts.length > 0 && !formContractId) {
				formContractId = signedContracts[0].id;
				formOrgId = signedContracts[0].organization_id;
			}
		} catch (err: any) {
			errorMsg = err.message || 'Failed to load opportunities catalog';
		} finally {
			isLoading = false;
		}
	}

	function handleContractChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		formContractId = select.value;
		const found = contracts.find((c) => c.id === select.value);
		if (found) {
			formOrgId = found.organization_id;
		}
	}

	function handleProductChange(type: 'iGV' | 'iGTa' | 'iGTe') {
		formProductType = type;
		if (type === 'iGV') {
			formDurationWeeks = 6;
			formWorkingHours = 30;
			formIsTeaching = false;
		} else if (type === 'iGTa') {
			formDurationWeeks = 12;
			formWorkingHours = 40;
			formIsTeaching = false;
		} else if (type === 'iGTe') {
			formDurationWeeks = 24;
			formWorkingHours = 35;
			formIsTeaching = true;
		}
	}

	async function submitCreateOpportunity() {
		isActionLoading = true;
		errorMsg = null;
		successMsg = null;

		try {
			const payload: any = {
				opportunity_code: formCode || `OPP-${formProductType}-${Date.now().toString().slice(-4)}`,
				contract_id: formContractId,
				organization_id: formOrgId,
				title: formTitle,
				product_type: formProductType,
				modality: 'PHYSICAL',
				start_date: formStartDate,
				end_date: formEndDate,
				duration_weeks: Number(formDurationWeeks),
				working_hours_per_week: Number(formWorkingHours),
				location: formLocation,
				description: formDescription,
				role_description: formRoleDescription,
				openings_capacity: Number(formOpenings),
				line_manager_name: formLineManagerName || undefined,
				line_manager_contact: formLineManagerContact || undefined
			};

			if (formProductType === 'iGV') {
				payload.igv_details = {
					sdg_number: Number(formSdgNumber),
					global_project_name: formGlobalProject,
					housing_provided: formHousingProvided,
					project_fee_amount: 0
				};
			} else {
				payload.igt_details = {
					work_field: formWorkField,
					sub_field: formSubField || undefined,
					duration_tier: formDurationWeeks <= 8 ? 'SHORT' : formDurationWeeks <= 12 ? 'MEDIUM' : 'LONG',
					monthly_salary: Number(formMonthlySalary),
					currency: 'MAD',
					salary_covers_living_costs: formSalaryCoversLiving,
					accommodation_covered: formAccommodationCovered,
					is_teaching_role: formProductType === 'iGTe',
					accredited_institution: formAccredited,
					accreditation_details: formAccreditationDetails
				};
			}

			await createOpportunity(payload);
			successMsg = `Opportunity ${payload.opportunity_code} created successfully with ${payload.openings_capacity} capacity slot(s)!`;
			showCreateDrawer = false;
			await loadData();
		} catch (err: any) {
			errorMsg = err.message || 'Failed to create opportunity';
		} finally {
			isActionLoading = false;
		}
	}

	async function openChecklist(opp: Opportunity) {
		activeOpportunity = opp;
		isActionLoading = true;
		showChecklistModal = true;
		try {
			checklistData = await checkPublicationChecklist(opp.id);
		} catch (err: any) {
			errorMsg = err.message || 'Failed to inspect publication readiness';
		} finally {
			isActionLoading = false;
		}
	}

	async function executePublish(oppId: string) {
		isActionLoading = true;
		try {
			await publishOpportunity(oppId);
			successMsg = `Opportunity published successfully to EXPA pipeline!`;
			showChecklistModal = false;
			await loadData();
		} catch (err: any) {
			errorMsg = err.message || 'Failed to publish opportunity';
		} finally {
			isActionLoading = false;
		}
	}

	async function openSlots(opp: Opportunity) {
		activeOpportunity = opp;
		showSlotsModal = true;
		isActionLoading = true;
		try {
			activeSlots = await fetchOpportunitySlots(opp.id);
		} catch (err: any) {
			errorMsg = err.message || 'Failed to fetch slots';
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
			<h1 class="text-2xl font-bold tracking-tight text-content-primary">Opportunities & Slots</h1>
			<p class="text-sm text-content-secondary mt-1">
				Manage iGV, iGTa, and iGTe opening catalogs, capacity slot reservations, and deterministic publication contracts.
			</p>
		</div>
		<div class="flex items-center gap-3">
			<button
				onclick={() => {
					showCreateDrawer = true;
					errorMsg = null;
				}}
				class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 transition shadow-sm"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				New Opportunity
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

	<!-- Product Filter Tabs & Search -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
		<div class="flex items-center gap-2">
			{#each ['ALL', 'iGV', 'iGTa', 'iGTe'] as tab}
				<button
					onclick={() => (selectedTab = tab as any)}
					class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors {selectedTab === tab
						? 'bg-surface-3 text-content-primary shadow-sm border border-surface-border'
						: 'text-content-muted hover:text-content-secondary'}"
				>
					{tab === 'ALL' ? 'All Products' : tab}
					{#if tab !== 'ALL'}
						<span class="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-surface-2">
							{opportunities.filter((o) => o.product_type === tab).length}
						</span>
					{/if}
				</button>
			{/each}
		</div>

		<div class="w-full sm:w-72">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search by code, title, partner..."
				class="w-full px-3 py-1.5 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary placeholder-content-muted focus:outline-none focus:ring-1 focus:ring-brand-blue"
			/>
		</div>
	</div>

	<!-- Opportunities Table / Cards -->
	{#if isLoading}
		<div class="p-12 text-center text-xs text-content-muted">Loading opportunities catalog...</div>
	{:else if filteredOpportunities.length === 0}
		<div class="p-12 text-center border border-dashed border-surface-border rounded-xl">
			<svg class="w-10 h-10 mx-auto text-content-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
			</svg>
			<p class="text-sm font-medium text-content-secondary">No opportunities found</p>
			<p class="text-xs text-content-muted mt-1">Create an opportunity against a signed contract to start opening slots.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4">
			{#each filteredOpportunities as opp}
				<div class="p-5 rounded-xl bg-surface-1 border border-surface-border hover:border-surface-border/80 transition shadow-sm space-y-4">
					<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<div class="space-y-1">
							<div class="flex items-center gap-2">
								<span
									class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider {opp.product_type === 'iGV'
										? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
										: opp.product_type === 'iGTa'
										? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
										: 'bg-purple-500/20 text-purple-400 border border-purple-500/30'}"
								>
									{opp.product_type}
								</span>
								<span class="font-mono text-xs font-semibold text-content-primary">{opp.opportunity_code}</span>
								<span
									class="px-2 py-0.5 rounded text-[10px] font-semibold {opp.status === 'PUBLISHED'
										? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
										: opp.status === 'DRAFT'
										? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
										: 'bg-zinc-500/10 text-zinc-400'}"
								>
									{opp.status}
								</span>
								{#if opp.modality === 'PHYSICAL'}
									<span class="text-[10px] text-content-muted flex items-center gap-1">
										<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> In-Person (Rabat)
									</span>
								{/if}
							</div>
							<h3 class="text-base font-semibold text-content-primary">{opp.title}</h3>
							<p class="text-xs text-content-secondary line-clamp-2">{opp.role_description}</p>
						</div>

						<!-- Capacity Slot Metric -->
						<div class="flex items-center gap-4 shrink-0 sm:text-right">
							<div class="space-y-0.5">
								<div class="text-[10px] uppercase font-bold text-content-muted">Capacity Slots</div>
								<div class="text-sm font-bold text-content-primary">
									<span class="text-brand-blue">{opp.filled_openings}</span> / {opp.openings_capacity}
								</div>
								<button
									onclick={() => openSlots(opp)}
									class="text-[11px] font-semibold text-brand-blue hover:underline"
								>
									Manage Slots &rarr;
								</button>
							</div>

							<!-- Action Buttons -->
							<div class="flex flex-col gap-2">
								{#if opp.status === 'DRAFT'}
									<button
										onclick={() => openChecklist(opp)}
										class="px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-surface-border text-xs font-semibold text-content-primary transition"
									>
										Publish Checklist
									</button>
								{:else}
									<span class="px-3 py-1 text-center text-[11px] font-medium text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
										Published on EXPA
									</span>
								{/if}
							</div>
						</div>
					</div>

					<!-- Details strip -->
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-surface-border/60 text-xs">
						<div>
							<span class="text-content-muted text-[10px] uppercase block font-semibold">Duration & Hours</span>
							<span class="text-content-secondary">{opp.duration_weeks} wks ({opp.working_hours_per_week}h/wk)</span>
						</div>
						<div>
							<span class="text-content-muted text-[10px] uppercase block font-semibold">Start & End Dates</span>
							<span class="text-content-secondary">{opp.start_date} &rarr; {opp.end_date}</span>
						</div>
						<div>
							<span class="text-content-muted text-[10px] uppercase block font-semibold">Host Organization</span>
							<span class="text-content-secondary">{opp.organization_name || 'Partner Org'}</span>
						</div>
						<div>
							<span class="text-content-muted text-[10px] uppercase block font-semibold">Product Specifics</span>
							{#if opp.product_type === 'iGV' && opp.igv_details}
								<span class="text-emerald-400 font-medium">SDG #{opp.igv_details.sdg_number} - {opp.igv_details.global_project_name}</span>
							{:else if opp.igt_details}
								<span class="text-indigo-400 font-medium">
									{opp.igt_details.work_field} | {opp.igt_details.monthly_salary} {opp.igt_details.currency}/mo
								</span>
							{:else}
								<span class="text-content-muted">N/A</span>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Opportunity Builder Drawer -->
{#if showCreateDrawer}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
		<div class="w-full max-w-2xl bg-surface-1 border-l border-surface-border h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
			<div class="flex items-center justify-between pb-4 border-b border-surface-border">
				<div>
					<h2 class="text-lg font-bold text-content-primary">Create New Opportunity</h2>
					<p class="text-xs text-content-muted mt-0.5">Deterministic AIESEC product schema with capacity slot generation.</p>
				</div>
				<button onclick={() => (showCreateDrawer = false)} class="text-content-muted hover:text-content-primary">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Product Type Selector -->
			<div class="space-y-2">
				<label class="text-xs font-semibold text-content-primary">Select AIESEC Product *</label>
				<div class="grid grid-cols-3 gap-3">
					<button
						type="button"
						onclick={() => handleProductChange('iGV')}
						class="p-3 rounded-lg border text-left transition {formProductType === 'iGV'
							? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
							: 'border-surface-border bg-surface-2 text-content-secondary'}"
					>
						<div class="text-xs font-bold">iGV</div>
						<div class="text-[10px] text-content-muted mt-0.5">Global Volunteer (4-8w, SDG physical)</div>
					</button>

					<button
						type="button"
						onclick={() => handleProductChange('iGTa')}
						class="p-3 rounded-lg border text-left transition {formProductType === 'iGTa'
							? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold'
							: 'border-surface-border bg-surface-2 text-content-secondary'}"
					>
						<div class="text-xs font-bold">iGTa</div>
						<div class="text-[10px] text-content-muted mt-0.5">Global Talent (6-78w, Corporate/Tech)</div>
					</button>

					<button
						type="button"
						onclick={() => handleProductChange('iGTe')}
						class="p-3 rounded-lg border text-left transition {formProductType === 'iGTe'
							? 'border-purple-500 bg-purple-500/10 text-purple-400 font-bold'
							: 'border-surface-border bg-surface-2 text-content-secondary'}"
					>
						<div class="text-xs font-bold">iGTe</div>
						<div class="text-[10px] text-content-muted mt-0.5">Global Teacher (Accredited School)</div>
					</button>
				</div>
			</div>

			<!-- Contract Linkage -->
			<div class="space-y-1">
				<label class="text-xs font-semibold text-content-primary">Linked Signed Contract *</label>
				<select
					value={formContractId}
					onchange={handleContractChange}
					class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"
				>
					{#if signedContracts.length === 0}
						<option value="">No signed active contracts available (Sign a contract in PRM first)</option>
					{:else}
						{#each signedContracts as ctr}
							<option value={ctr.id}>
								{ctr.contract_number} — {ctr.title} ({ctr.organization_name || 'Partner Org'})
							</option>
						{/each}
					{/if}
				</select>
			</div>

			<!-- Core Info -->
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-1">
					<label class="text-xs font-semibold text-content-primary">Opportunity Code *</label>
					<input
						type="text"
						bind:value={formCode}
						placeholder="OPP-IGV-2027-01"
						class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue font-mono"
					/>
				</div>
				<div class="space-y-1">
					<label class="text-xs font-semibold text-content-primary">Openings Capacity (Slots) *</label>
					<input
						type="number"
						bind:value={formOpenings}
						min="1"
						max="50"
						class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"
					/>
				</div>
			</div>

			<div class="space-y-1">
				<label class="text-xs font-semibold text-content-primary">Opportunity Title *</label>
				<input
					type="text"
					bind:value={formTitle}
					placeholder="e.g. Literacy & Community Mentor"
					class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"
				/>
			</div>

			<!-- Duration & Hours -->
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<div class="space-y-1">
					<label class="text-xs font-semibold text-content-primary">Start Date *</label>
					<input
						type="date"
						bind:value={formStartDate}
						class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"
					/>
				</div>
				<div class="space-y-1">
					<label class="text-xs font-semibold text-content-primary">End Date *</label>
					<input
						type="date"
						bind:value={formEndDate}
						class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"
					/>
				</div>
				<div class="space-y-1">
					<label class="text-xs font-semibold text-content-primary">Duration (Wks) *</label>
					<input
						type="number"
						bind:value={formDurationWeeks}
						min="1"
						max="78"
						class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"
					/>
				</div>
				<div class="space-y-1">
					<label class="text-xs font-semibold text-content-primary">Hours / Week *</label>
					<input
						type="number"
						bind:value={formWorkingHours}
						min="20"
						max="45"
						class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"
					/>
				</div>
			</div>

			<!-- Dynamic Product Form Fields -->
			{#if formProductType === 'iGV'}
				<div class="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
					<h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">iGV Product Specifications</h4>
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-1">
							<label class="text-xs font-medium text-content-primary">Sustainable Development Goal (SDG 1-17) *</label>
							<select
								bind:value={formSdgNumber}
								class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-emerald-500"
							>
								{#each Array.from({ length: 17 }, (_, i) => i + 1) as sdg}
									<option value={sdg}>SDG #{sdg}</option>
								{/each}
							</select>
						</div>
						<div class="space-y-1">
							<label class="text-xs font-medium text-content-primary">Global Project Name *</label>
							<input
								type="text"
								bind:value={formGlobalProject}
								placeholder="e.g. Climate Champions"
								class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-emerald-500"
							/>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<input
							type="checkbox"
							id="housingCheck"
							bind:checked={formHousingProvided}
							class="rounded bg-surface-2 border-surface-border text-emerald-500 focus:ring-emerald-500"
						/>
						<label for="housingCheck" class="text-xs text-content-secondary">
							Housing accommodation provided by local hosting organization / host family
						</label>
					</div>
				</div>
			{:else}
				<div class="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-4">
					<h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider">
						{formProductType === 'iGTa' ? 'iGTa Talent' : 'iGTe Teacher'} Specifications
					</h4>
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-1">
							<label class="text-xs font-medium text-content-primary">Work Field *</label>
							<select
								bind:value={formWorkField}
								class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-indigo-500"
							>
								{#each ['BA', 'BD', 'MKT', 'IT', 'ENG', 'FIN', 'Other'] as field}
									<option value={field}>{field}</option>
								{/each}
							</select>
						</div>
						<div class="space-y-1">
							<label class="text-xs font-medium text-content-primary">Monthly Stipend / Salary (MAD) *</label>
							<input
								type="number"
								bind:value={formMonthlySalary}
								min="0"
								class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-indigo-500"
							/>
						</div>
					</div>

					{#if formProductType === 'iGTe'}
						<div class="space-y-2 pt-2 border-t border-indigo-500/20">
							<div class="flex items-center gap-2">
								<input
									type="checkbox"
									id="accreditedCheck"
									bind:checked={formAccredited}
									class="rounded bg-surface-2 border-surface-border text-purple-500 focus:ring-purple-500"
								/>
								<label for="accreditedCheck" class="text-xs text-content-secondary font-medium">
									Verified Accredited Educational Institution
								</label>
							</div>
							<input
								type="text"
								bind:value={formAccreditationDetails}
								placeholder="Accreditation registry details"
								class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-purple-500"
							/>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Line Manager & Location -->
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-1">
					<label class="text-xs font-semibold text-content-primary">Line Manager Name</label>
					<input
						type="text"
						bind:value={formLineManagerName}
						placeholder="e.g. Fatima Zahra"
						class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"
					/>
				</div>
				<div class="space-y-1">
					<label class="text-xs font-semibold text-content-primary">Line Manager Contact</label>
					<input
						type="text"
						bind:value={formLineManagerContact}
						placeholder="+212 612 345678"
						class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"
					/>
				</div>
			</div>

			<!-- Descriptions -->
			<div class="space-y-1">
				<label class="text-xs font-semibold text-content-primary">Role Description *</label>
				<textarea
					rows="2"
					bind:value={formRoleDescription}
					placeholder="Key deliverables and everyday tasks for the exchange participant..."
					class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"
				></textarea>
			</div>

			<div class="space-y-1">
				<label class="text-xs font-semibold text-content-primary">Overview & Context Description *</label>
				<textarea
					rows="3"
					bind:value={formDescription}
					placeholder="Opportunity summary, team culture, project impact..."
					class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"
				></textarea>
			</div>

			<!-- Drawer Actions -->
			<div class="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
				<button
					type="button"
					onclick={() => (showCreateDrawer = false)}
					class="px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-content-secondary text-xs font-semibold transition"
				>
					Cancel
				</button>
				<button
					type="button"
					disabled={isActionLoading || !formTitle || !formContractId}
					onclick={submitCreateOpportunity}
					class="px-4 py-2 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 transition disabled:opacity-50"
				>
					{isActionLoading ? 'Creating Opportunity...' : 'Create & Generate Slots'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Publication Readiness Checklist Modal -->
{#if showChecklistModal && activeOpportunity}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="w-full max-w-lg bg-surface-1 border border-surface-border rounded-2xl p-6 space-y-6 shadow-2xl">
			<div class="flex items-center justify-between pb-3 border-b border-surface-border">
				<div>
					<h3 class="text-base font-bold text-content-primary">Publication Checklist</h3>
					<p class="font-mono text-xs text-content-muted mt-0.5">{activeOpportunity.opportunity_code}</p>
				</div>
				<button onclick={() => (showChecklistModal = false)} class="text-content-muted hover:text-content-primary">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			{#if isActionLoading || !checklistData}
				<div class="py-8 text-center text-xs text-content-muted">Evaluating publication prerequisites...</div>
			{:else}
				<div class="space-y-3">
					<div
						class="p-3 rounded-xl border flex items-center justify-between {checklistData.ready_to_publish
							? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
							: 'bg-amber-500/10 border-amber-500/20 text-amber-400'}"
					>
						<span class="text-xs font-bold">
							{checklistData.ready_to_publish ? 'All Criteria Passed — Ready for EXPA' : 'Prerequisites Incomplete'}
						</span>
						<span class="text-[11px] font-mono font-semibold">
							{checklistData.issues.length === 0 ? '0 issues' : `${checklistData.issues.length} blocker(s)`}
						</span>
					</div>

					<div class="space-y-2 text-xs">
						<div class="flex items-center justify-between p-2 rounded-lg bg-surface-2 border border-surface-border">
							<span class="text-content-secondary">Active Signed Partner Contract</span>
							<span class={checklistData.checks.active_signed_contract ? 'text-emerald-400' : 'text-red-400 font-bold'}>
								{checklistData.checks.active_signed_contract ? 'PASS' : 'FAIL'}
							</span>
						</div>
						<div class="flex items-center justify-between p-2 rounded-lg bg-surface-2 border border-surface-border">
							<span class="text-content-secondary">Dates & Duration Compliance</span>
							<span class={checklistData.checks.dates_valid ? 'text-emerald-400' : 'text-red-400 font-bold'}>
								{checklistData.checks.dates_valid ? 'PASS' : 'FAIL'}
							</span>
						</div>
						<div class="flex items-center justify-between p-2 rounded-lg bg-surface-2 border border-surface-border">
							<span class="text-content-secondary">Product-Specific Criteria (SDG / Salary / Modality)</span>
							<span class={checklistData.checks.product_requirements_met ? 'text-emerald-400' : 'text-red-400 font-bold'}>
								{checklistData.checks.product_requirements_met ? 'PASS' : 'FAIL'}
							</span>
						</div>
						<div class="flex items-center justify-between p-2 rounded-lg bg-surface-2 border border-surface-border">
							<span class="text-content-secondary">Assigned Line Manager</span>
							<span class={checklistData.checks.line_manager_assigned ? 'text-emerald-400' : 'text-red-400 font-bold'}>
								{checklistData.checks.line_manager_assigned ? 'PASS' : 'FAIL'}
							</span>
						</div>
						<div class="flex items-center justify-between p-2 rounded-lg bg-surface-2 border border-surface-border">
							<span class="text-content-secondary">Openings & Capacity Configured</span>
							<span class={checklistData.checks.openings_configured ? 'text-emerald-400' : 'text-red-400 font-bold'}>
								{checklistData.checks.openings_configured ? 'PASS' : 'FAIL'}
							</span>
						</div>
					</div>

					{#if checklistData.issues.length > 0}
						<div class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs space-y-1">
							<div class="font-bold">Blocking Issues:</div>
							<ul class="list-disc list-inside space-y-0.5 text-[11px]">
								{#each checklistData.issues as issue}
									<li>{issue}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>

				<div class="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
					<button
						onclick={() => (showChecklistModal = false)}
						class="px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-content-secondary text-xs font-semibold transition"
					>
						Close
					</button>
					<button
						disabled={!checklistData.ready_to_publish || isActionLoading}
						onclick={() => executePublish(activeOpportunity.id)}
						class="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition disabled:opacity-50"
					>
						{isActionLoading ? 'Publishing...' : 'Publish to EXPA'}
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Slots Inspector Modal -->
{#if showSlotsModal && activeOpportunity}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="w-full max-w-xl bg-surface-1 border border-surface-border rounded-2xl p-6 space-y-6 shadow-2xl">
			<div class="flex items-center justify-between pb-3 border-b border-surface-border">
				<div>
					<h3 class="text-base font-bold text-content-primary">Capacity Slot Inventory</h3>
					<p class="font-mono text-xs text-content-muted mt-0.5">{activeOpportunity.opportunity_code}</p>
				</div>
				<button onclick={() => (showSlotsModal = false)} class="text-content-muted hover:text-content-primary">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			{#if isActionLoading}
				<div class="py-8 text-center text-xs text-content-muted">Loading capacity slots...</div>
			{:else}
				<div class="space-y-2">
					{#each activeSlots as slot}
						<div class="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-surface-border text-xs">
							<div class="space-y-0.5">
								<div class="font-mono font-bold text-content-primary">{slot.slot_number}</div>
								<div class="text-[11px] text-content-muted">{slot.start_date} &rarr; {slot.end_date}</div>
								{#if slot.current_application_id}
									<div class="text-[10px] text-indigo-400 font-mono">Assigned to: {slot.current_application_id}</div>
								{/if}
							</div>
							<div class="flex items-center gap-3">
								<span
									class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider {slot.status === 'OPEN'
										? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
										: slot.status === 'RESERVED'
										? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
										: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'}"
								>
									{slot.status}
								</span>
								<span class="text-[10px] font-mono text-content-muted">v{slot.lock_version}</span>
							</div>
						</div>
					{/each}
				</div>
				<div class="flex justify-end pt-4 border-t border-surface-border">
					<button
						onclick={() => (showSlotsModal = false)}
						class="px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-content-secondary text-xs font-semibold transition"
					>
						Close
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
