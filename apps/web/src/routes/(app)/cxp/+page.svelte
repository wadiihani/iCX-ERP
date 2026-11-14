<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchExchanges, type Exchange } from '$lib/api/exchanges';
	import {
		fetchStandards,
		updateStandard,
		evaluateCompletion,
		approveCompletion,
		type StandardFulfillment,
		type CompletionEvaluationReport
	} from '$lib/api/cxp';

	// Svelte 5 runes
	let exchanges = $state<Exchange[]>([]);
	let selectedExchangeId = $state<string>('');
	let standards = $state<StandardFulfillment[]>([]);
	let evaluationReport = $state<CompletionEvaluationReport | null>(null);

	let isLoading = $state(true);
	let isStandardsLoading = $state(false);
	let isEvaluating = $state(false);
	let isActionLoading = $state(false);
	let errorMsg = $state<string | null>(null);
	let successMsg = $state<string | null>(null);

	// Standards filter
	let standardCategory = $state<'ALL' | 'MANDATORY' | 'OPTIONAL'>('ALL');

	// Standard edit modal state
	let showEditModal = $state(false);
	let selectedStandard = $state<StandardFulfillment | null>(null);
	let editForm = $state({
		is_fulfilled: false,
		fulfillment_date: '',
		evidence_doc_url: '',
		verification_notes: ''
	});

	// Completion approval modal
	let showApprovalModal = $state(false);
	let approvalNotes = $state('');

	const selectedExchange = $derived(
		exchanges.find((e) => e.id === selectedExchangeId) || null
	);

	const filteredStandards = $derived(
		standards.filter((s) => {
			if (standardCategory === 'MANDATORY') return s.is_mandatory;
			if (standardCategory === 'OPTIONAL') return !s.is_mandatory;
			return true;
		})
	);

	const mandatoryFulfilledCount = $derived(
		standards.filter((s) => s.is_mandatory && s.is_fulfilled).length
	);

	const totalFulfilledCount = $derived(
		standards.filter((s) => s.is_fulfilled).length
	);

	async function loadExchanges() {
		isLoading = true;
		errorMsg = null;
		try {
			const exs = await fetchExchanges();
			exchanges = exs;
			if (exs.length > 0) {
				selectedExchangeId = exs[0].id;
				await loadExchangeData(exs[0].id);
			}
		} catch (err: any) {
			errorMsg = err.message || 'Failed to load exchange records';
		} finally {
			isLoading = false;
		}
	}

	async function loadExchangeData(exchangeId: string) {
		if (!exchangeId) return;
		isStandardsLoading = true;
		errorMsg = null;
		try {
			const [stds, report] = await Promise.all([
				fetchStandards(exchangeId),
				evaluateCompletion(exchangeId).catch(() => null)
			]);
			standards = stds;
			evaluationReport = report;
		} catch (err: any) {
			errorMsg = err.message || 'Failed to load standards for exchange';
		} finally {
			isStandardsLoading = false;
		}
	}

	function handleExchangeSelect(id: string) {
		selectedExchangeId = id;
		loadExchangeData(id);
	}

	function openEditModal(std: StandardFulfillment) {
		selectedStandard = std;
		editForm = {
			is_fulfilled: std.is_fulfilled,
			fulfillment_date: std.fulfillment_date ? std.fulfillment_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
			evidence_doc_url: std.evidence_doc_url || '',
			verification_notes: std.verification_notes || ''
		};
		showEditModal = true;
	}

	async function saveStandard() {
		if (!selectedStandard || !selectedExchangeId) return;
		isActionLoading = true;
		errorMsg = null;
		try {
			await updateStandard(selectedExchangeId, selectedStandard.standard_number, {
				is_fulfilled: editForm.is_fulfilled,
				fulfillment_date: editForm.is_fulfilled ? editForm.fulfillment_date : undefined,
				evidence_doc_url: editForm.evidence_doc_url || undefined,
				verification_notes: editForm.verification_notes || undefined
			});
			successMsg = `Standard #${selectedStandard.standard_number} updated successfully.`;
			showEditModal = false;
			await loadExchangeData(selectedExchangeId);
		} catch (err: any) {
			errorMsg = err.message || 'Failed to update standard';
		} finally {
			isActionLoading = false;
		}
	}

	async function handleApproveCompletion() {
		if (!selectedExchangeId) return;
		isActionLoading = true;
		errorMsg = null;
		try {
			await approveCompletion(selectedExchangeId, approvalNotes);
			successMsg = 'Exchange completion verified and approved! EXPA status updated to CO.';
			showApprovalModal = false;
			approvalNotes = '';
			// Reload all
			await loadExchanges();
		} catch (err: any) {
			errorMsg = err.message || 'Failed to approve exchange completion';
		} finally {
			isActionLoading = false;
		}
	}

	onMount(() => {
		loadExchanges();
	});
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
		<div>
			<h1 class="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
				<span class="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
					</svg>
				</span>
				Customer Experience (CXP) & 18 Standards
			</h1>
			<p class="text-sm text-muted-foreground mt-1">
				Track, verify and audit the 18 AIESEC Exchange Standards. Enforce deterministic completion thresholds before final approval.
			</p>
		</div>

		<!-- Exchange Dropdown Selector -->
		<div class="flex items-center gap-3">
			<label for="exchange-select" class="text-xs font-semibold uppercase text-muted-foreground whitespace-nowrap">Active Exchange:</label>
			<select
				id="exchange-select"
				class="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-w-[240px]"
				value={selectedExchangeId}
				onchange={(e) => handleExchangeSelect((e.target as HTMLSelectElement).value)}
				disabled={isLoading}
			>
				{#if exchanges.length === 0}
					<option value="">No exchanges found</option>
				{:else}
					{#each exchanges as ex}
						<option value={ex.id}>
							{ex.exchange_code} — {ex.ep_name || 'EP'} ({ex.delivery_status})
						</option>
					{/each}
				{/if}
			</select>
		</div>
	</div>

	<!-- Alert Messages -->
	{#if errorMsg}
		<div class="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center justify-between">
			<div class="flex items-center gap-2">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
				<span>{errorMsg}</span>
			</div>
			<button class="text-xs underline hover:opacity-80" onclick={() => (errorMsg = null)}>Dismiss</button>
		</div>
	{/if}

	{#if successMsg}
		<div class="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex items-center justify-between">
			<div class="flex items-center gap-2">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
				<span>{successMsg}</span>
			</div>
			<button class="text-xs underline hover:opacity-80" onclick={() => (successMsg = null)}>Dismiss</button>
		</div>
	{/if}

	{#if isLoading}
		<div class="flex items-center justify-center p-12 text-muted-foreground text-sm">
			<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
			Loading CXP records...
		</div>
	{:else if !selectedExchange}
		<div class="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
			<p class="text-base font-semibold">No active exchange selected</p>
			<p class="text-xs mt-1">Please approve an application or spawn an exchange from the Applications module to view CXP standards.</p>
		</div>
	{:else}
		<!-- Exchange Overview Banner & Completion Readiness Meter -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Exchange Info Summary Card -->
			<div class="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
				<div class="flex items-center justify-between">
					<span class="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
						{selectedExchange.exchange_code}
					</span>
					<span class="text-xs px-2 py-0.5 rounded font-medium border {selectedExchange.delivery_status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : selectedExchange.delivery_status === 'REALIZED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-muted text-muted-foreground border-border'}">
						{selectedExchange.delivery_status}
					</span>
				</div>

				<div class="space-y-1.5 text-sm">
					<div class="text-base font-semibold text-foreground">{selectedExchange.ep_name || 'EP Name'}</div>
					<div class="text-xs text-muted-foreground">{selectedExchange.opportunity_title || 'Opportunity'}</div>
					<div class="text-xs text-muted-foreground flex items-center gap-2 pt-1">
						<span>Product: <strong class="text-foreground">{selectedExchange.product_type || 'iGV'}</strong></span>
						<span>•</span>
						<span>Modality: <strong class="text-foreground">{selectedExchange.modality}</strong></span>
					</div>
					<div class="text-xs text-muted-foreground">
						Duration: {selectedExchange.start_date} → {selectedExchange.end_date}
					</div>
				</div>

				<div class="pt-3 border-t border-border/40 grid grid-cols-3 gap-2 text-center text-xs">
					<div class="p-2 rounded bg-muted/40 border border-border/40">
						<div class="text-muted-foreground text-[10px]">IPS Done</div>
						<div class="font-bold {selectedExchange.ips_completed ? 'text-emerald-500' : 'text-amber-500'}">
							{selectedExchange.ips_completed ? 'YES' : 'NO'}
						</div>
					</div>
					<div class="p-2 rounded bg-muted/40 border border-border/40">
						<div class="text-muted-foreground text-[10px]">Worksite</div>
						<div class="font-bold {selectedExchange.worksite_verified ? 'text-emerald-500' : 'text-amber-500'}">
							{selectedExchange.worksite_verified ? 'VERIFIED' : 'PENDING'}
						</div>
					</div>
					<div class="p-2 rounded bg-muted/40 border border-border/40">
						<div class="text-muted-foreground text-[10px]">First Day</div>
						<div class="font-bold {selectedExchange.first_day_attended ? 'text-emerald-500' : 'text-amber-500'}">
							{selectedExchange.first_day_attended ? 'ATTENDED' : 'PENDING'}
						</div>
					</div>
				</div>
			</div>

			<!-- Deterministic Completion Readiness Panel (Spans 2 columns) -->
			<div class="lg:col-span-2 rounded-xl border border-border bg-card p-5 flex flex-col justify-between shadow-sm">
				<div>
					<div class="flex items-center justify-between pb-3 border-b border-border/40">
						<div>
							<h2 class="text-base font-semibold text-foreground flex items-center gap-2">
								Completion Readiness Evaluation
								{#if evaluationReport}
									{#if evaluationReport.is_eligible_for_completion}
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
											ELIGIBLE FOR COMPLETION
										</span>
									{:else}
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
											BLOCKED / INCOMPLETE
										</span>
									{/if}
								{/if}
							</h2>
							<p class="text-xs text-muted-foreground mt-0.5">
								Rule: Strictly requires 13/13 Mandatory Standards AND at least 16/18 Total Standards fulfilled.
							</p>
						</div>

						{#if selectedExchange.delivery_status !== 'COMPLETED'}
							<button
								type="button"
								class="px-4 py-2 rounded-lg text-xs font-semibold transition-all {evaluationReport?.is_eligible_for_completion ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20' : 'bg-muted text-muted-foreground cursor-not-allowed border border-border'}"
								disabled={!evaluationReport?.is_eligible_for_completion}
								onclick={() => (showApprovalModal = true)}
							>
								Approve Exchange Completion
							</button>
						{:else}
							<div class="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
								COMPLETED & VERIFIED
							</div>
						{/if}
					</div>

					<!-- Meters & Stats -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
						<!-- Mandatory Bar -->
						<div class="p-3.5 rounded-lg bg-muted/30 border border-border/50">
							<div class="flex justify-between items-center text-xs mb-1.5">
								<span class="font-medium text-foreground">Mandatory Standards</span>
								<span class="font-mono font-bold {mandatoryFulfilledCount === 13 ? 'text-emerald-500' : 'text-amber-500'}">
									{mandatoryFulfilledCount} / 13 Required
								</span>
							</div>
							<div class="w-full bg-muted rounded-full h-2.5 overflow-hidden">
								<div
									class="h-2.5 rounded-full transition-all duration-500 {mandatoryFulfilledCount === 13 ? 'bg-emerald-500' : 'bg-amber-500'}"
									style="width: {Math.min(100, (mandatoryFulfilledCount / 13) * 100)}%"
								></div>
							</div>
							<div class="text-[11px] text-muted-foreground mt-1.5">
								{mandatoryFulfilledCount === 13 ? 'All 13 core legal, safety & host standards verified.' : `${13 - mandatoryFulfilledCount} mandatory standards pending fulfillment.`}
							</div>
						</div>

						<!-- Overall Bar -->
						<div class="p-3.5 rounded-lg bg-muted/30 border border-border/50">
							<div class="flex justify-between items-center text-xs mb-1.5">
								<span class="font-medium text-foreground">Total Standards (16+ Required)</span>
								<span class="font-mono font-bold {totalFulfilledCount >= 16 ? 'text-emerald-500' : 'text-blue-500'}">
									{totalFulfilledCount} / 18 ({Math.round((totalFulfilledCount / 18) * 100)}%)
								</span>
							</div>
							<div class="w-full bg-muted rounded-full h-2.5 overflow-hidden">
								<div
									class="h-2.5 rounded-full transition-all duration-500 {totalFulfilledCount >= 16 ? 'bg-emerald-500' : 'bg-blue-500'}"
									style="width: {(totalFulfilledCount / 18) * 100}%"
								></div>
							</div>
							<div class="text-[11px] text-muted-foreground mt-1.5">
								{totalFulfilledCount >= 16 ? 'Overall fulfillment threshold met.' : `${16 - totalFulfilledCount} more standards needed for minimum 16/18 threshold.`}
							</div>
						</div>
					</div>
				</div>

				<!-- Missing Standards Alert (if any) -->
				{#if evaluationReport && !evaluationReport.is_eligible_for_completion && evaluationReport.missing_mandatory_standards.length > 0}
					<div class="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500">
						<span class="font-bold">Missing Mandatory Standards: </span>
						{evaluationReport.missing_mandatory_standards.join(', ')}
					</div>
				{/if}
			</div>
		</div>

		<!-- Standards Matrix Section -->
		<div class="space-y-4">
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div class="flex items-center gap-2">
					<h2 class="text-lg font-bold text-foreground">The 18 Standards Matrix</h2>
					<span class="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
						{standards.length} Standards
					</span>
				</div>

				<!-- Category Tabs -->
				<div class="inline-flex rounded-lg bg-muted/50 p-1 border border-border text-xs">
					<button
						type="button"
						class="px-3 py-1.5 rounded-md font-medium transition-colors {standardCategory === 'ALL' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
						onclick={() => (standardCategory = 'ALL')}
					>
						All (18)
					</button>
					<button
						type="button"
						class="px-3 py-1.5 rounded-md font-medium transition-colors {standardCategory === 'MANDATORY' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
						onclick={() => (standardCategory = 'MANDATORY')}
					>
						Mandatory Only (13)
					</button>
					<button
						type="button"
						class="px-3 py-1.5 rounded-md font-medium transition-colors {standardCategory === 'OPTIONAL' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
						onclick={() => (standardCategory = 'OPTIONAL')}
					>
						Optional (5)
					</button>
				</div>
			</div>

			<!-- Standards Grid -->
			{#if isStandardsLoading}
				<div class="p-8 text-center text-sm text-muted-foreground">Loading standards list...</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each filteredStandards as std}
						<div
							class="rounded-xl border transition-all p-4 flex flex-col justify-between {std.is_fulfilled ? 'bg-card border-border hover:border-emerald-500/40' : 'bg-card/50 border-border/60 hover:border-border'}"
						>
							<div>
								<div class="flex items-start justify-between gap-2 mb-2">
									<div class="flex items-center gap-2">
										<span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold {std.is_fulfilled ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-muted text-muted-foreground'}">
											{std.standard_number}
										</span>
										{#if std.is_mandatory}
											<span class="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20">
												Mandatory
											</span>
										{:else}
											<span class="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
												Optional
											</span>
										{/if}
									</div>

									<span class="text-xs font-medium px-2 py-0.5 rounded {std.is_fulfilled ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}">
										{std.is_fulfilled ? 'FULFILLED' : 'PENDING'}
									</span>
								</div>

								<h3 class="text-sm font-semibold text-foreground leading-snug">
									{std.standard_name}
								</h3>

								{#if std.fulfillment_date}
									<p class="text-[11px] text-muted-foreground mt-1">
										Fulfilled on: {std.fulfillment_date.slice(0, 10)}
									</p>
								{/if}

								{#if std.evidence_doc_url}
									<div class="mt-2 text-xs">
										<a
											href={std.evidence_doc_url}
											target="_blank"
											rel="noopener noreferrer"
											class="text-primary hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
										>
											<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
											View Evidence Document
										</a>
									</div>
								{/if}

								{#if std.verification_notes}
									<div class="mt-2 text-xs text-muted-foreground bg-muted/40 p-2 rounded border border-border/40 italic">
										"{std.verification_notes}"
									</div>
								{/if}
							</div>

							<div class="mt-4 pt-3 border-t border-border/40 flex justify-end">
								<button
									type="button"
									class="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground transition-colors"
									onclick={() => openEditModal(std)}
								>
									{std.is_fulfilled ? 'Edit / Audit Standard' : 'Fulfill Standard'}
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Modal: Edit / Audit Standard -->
{#if showEditModal && selectedStandard}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
		<div class="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
			<div class="flex items-center justify-between border-b border-border/40 pb-3">
				<div>
					<h3 class="text-base font-bold text-foreground">
						Standard #{selectedStandard.standard_number}: {selectedStandard.standard_name}
					</h3>
					<span class="text-xs {selectedStandard.is_mandatory ? 'text-red-500 font-semibold' : 'text-muted-foreground'}">
						{selectedStandard.is_mandatory ? 'Mandatory Standard (Required for Completion)' : 'Optional Standard'}
					</span>
				</div>
				<button class="text-muted-foreground hover:text-foreground" onclick={() => (showEditModal = false)}>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
				</button>
			</div>

			<form onsubmit={(e) => { e.preventDefault(); saveStandard(); }} class="space-y-4 text-sm">
				<!-- Fulfillment Toggle -->
				<label class="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 cursor-pointer">
					<input
						type="checkbox"
						class="w-4 h-4 rounded text-primary focus:ring-primary"
						bind:checked={editForm.is_fulfilled}
					/>
					<div>
						<span class="font-medium text-foreground block">Mark Standard as Fulfilled</span>
						<span class="text-xs text-muted-foreground">Confirm that all conditions and minimum standards criteria are verified</span>
					</div>
				</label>

				<!-- Fulfillment Date -->
				<div>
					<label for="ful-date" class="block text-xs font-medium text-muted-foreground mb-1">Fulfillment Date</label>
					<input
						id="ful-date"
						type="date"
						class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						bind:value={editForm.fulfillment_date}
					/>
				</div>

				<!-- Evidence Document URL -->
				<div>
					<label for="doc-url" class="block text-xs font-medium text-muted-foreground mb-1">Evidence Document URL / Drive Link</label>
					<input
						id="doc-url"
						type="url"
						placeholder="https://drive.google.com/..."
						class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						bind:value={editForm.evidence_doc_url}
					/>
				</div>

				<!-- Verification Notes -->
				<div>
					<label for="verif-notes" class="block text-xs font-medium text-muted-foreground mb-1">Verification / Auditor Notes</label>
					<textarea
						id="verif-notes"
						rows="3"
						placeholder="Details on verification method, auditor observations, or conditions..."
						class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						bind:value={editForm.verification_notes}
					></textarea>
				</div>

				<div class="pt-2 flex justify-end gap-2 border-t border-border/40">
					<button
						type="button"
						class="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted"
						onclick={() => (showEditModal = false)}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow"
						disabled={isActionLoading}
					>
						{isActionLoading ? 'Saving...' : 'Save Standard'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Modal: Approve Completion -->
{#if showApprovalModal && selectedExchange}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
		<div class="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
			<div class="flex items-center justify-between border-b border-border/40 pb-3">
				<div>
					<h3 class="text-base font-bold text-foreground">Approve Exchange Completion</h3>
					<span class="text-xs text-muted-foreground font-mono">{selectedExchange.exchange_code}</span>
				</div>
				<button class="text-muted-foreground hover:text-foreground" onclick={() => (showApprovalModal = false)}>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
				</button>
			</div>

			<div class="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 space-y-1">
				<p class="font-bold">Verification Passed:</p>
				<p>• 13/13 Mandatory Standards Fulfilled</p>
				<p>• {totalFulfilledCount}/18 Total Standards Fulfilled (Threshold: 16+)</p>
			</div>

			<p class="text-xs text-muted-foreground">
				Approving this exchange marks the official delivery status as <strong>COMPLETED</strong>, updates the local operational readiness to <strong>DONE</strong>, and synchronizes the EXPA status to <strong>CO</strong>.
			</p>

			<form onsubmit={(e) => { e.preventDefault(); handleApproveCompletion(); }} class="space-y-4 text-sm">
				<div>
					<label for="appr-notes" class="block text-xs font-medium text-muted-foreground mb-1">Completion Approval Notes (Optional)</label>
					<textarea
						id="appr-notes"
						rows="3"
						placeholder="Final debrief comments, CX evaluation notes, or testimonial references..."
						class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						bind:value={approvalNotes}
					></textarea>
				</div>

				<div class="pt-2 flex justify-end gap-2 border-t border-border/40">
					<button
						type="button"
						class="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted"
						onclick={() => (showApprovalModal = false)}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow"
						disabled={isActionLoading}
					>
						{isActionLoading ? 'Approving...' : 'Confirm & Complete Exchange'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
