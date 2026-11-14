<script lang="ts">
	import { onMount } from 'svelte';
	import {
		fetchApplications,
		transitionApplication,
		recordScreening,
		forwardToOP,
		recordOPInterview,
		recordAcceptanceNote,
		approveMatch,
		updateReadiness,
		type Application
	} from '$lib/api/applications';

	// Svelte 5 runes
	let applications = $state<Application[]>([]);
	let isLoading = $state(true);
	let errorMsg = $state<string | null>(null);
	let successMsg = $state<string | null>(null);

	// Filters
	let viewMode = $state<'KANBAN' | 'TABLE'>('KANBAN');
	let searchQuery = $state('');
	let stageFilter = $state('ALL');

	// Modals & Drawers
	let showDetailDrawer = $state(false);
	let showScreeningModal = $state(false);
	let showInterviewModal = $state(false);
	let showAcceptanceModal = $state(false);
	let showReadinessModal = $state(false);
	let activeApp = $state<Application | null>(null);
	let isActionLoading = $state(false);

	// Forms
	let screeningForm = $state({
		language_proficiency: 'ADVANCED' as 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'NATIVE',
		background_check_passed: true,
		cultural_fit_rating: 4,
		skills_match_rating: 4,
		motivation_notes: '',
		recommendation: 'RECOMMENDED' as 'RECOMMENDED' | 'NEUTRAL' | 'REJECTED'
	});

	let interviewForm = $state({
		interviewer_name: '',
		interview_type: 'ONLINE' as 'ONLINE' | 'IN_PERSON',
		scheduled_at: new Date().toISOString().slice(0, 16),
		op_decision: 'ACCEPTED' as 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SECOND_ROUND',
		feedback_notes: '',
		questions_asked: ''
	});

	let acceptanceForm = $state({
		document_url: '',
		ep_signature_date: new Date().toISOString().split('T')[0],
		partner_signature_date: new Date().toISOString().split('T')[0],
		is_verified: true,
		verification_notes: ''
	});

	let readinessForm = $state({
		operational_readiness: 'READY' as 'DRAFT' | 'READY' | 'AT_RISK' | 'BLOCKED' | 'DONE',
		notes: ''
	});

	const KANBAN_STAGES = [
		{ id: 'APPLIED', label: 'Applied' },
		{ id: 'CONTACTED', label: 'Contacted' },
		{ id: 'SCREENING', label: 'Screening' },
		{ id: 'SHORTLISTED', label: 'Shortlisted' },
		{ id: 'SENT_TO_OP', label: 'Sent to OP' },
		{ id: 'INTERVIEW', label: 'Interview' },
		{ id: 'OP_DECISION', label: 'OP Decision' },
		{ id: 'ACCEPTED', label: 'Accepted' },
		{ id: 'APPROVED', label: 'Approved (Match)' }
	];

	const filteredApps = $derived(
		applications.filter((app) => {
			const matchesStage = stageFilter === 'ALL' || app.current_stage === stageFilter;
			const q = searchQuery.toLowerCase();
			const matchesSearch =
				app.application_code.toLowerCase().includes(q) ||
				(app.ep_name && app.ep_name.toLowerCase().includes(q)) ||
				(app.opportunity_title && app.opportunity_title.toLowerCase().includes(q)) ||
				(app.opportunity_code && app.opportunity_code.toLowerCase().includes(q));
			return matchesStage && matchesSearch;
		})
	);

	async function loadData() {
		isLoading = true;
		errorMsg = null;
		try {
			applications = await fetchApplications();
		} catch (err: any) {
			errorMsg = err.message || 'Failed to load applications pipeline';
		} finally {
			isLoading = false;
		}
	}

	function openDetail(app: Application) {
		activeApp = app;
		showDetailDrawer = true;
	}

	async function executeTransition(appId: string, targetStage: string) {
		isActionLoading = true;
		errorMsg = null;
		try {
			await transitionApplication(appId, targetStage);
			successMsg = `Application moved to ${targetStage}`;
			await loadData();
			if (activeApp && activeApp.id === appId) {
				activeApp = applications.find((a) => a.id === appId) || null;
			}
		} catch (err: any) {
			errorMsg = err.message || 'Failed to transition stage';
		} finally {
			isActionLoading = false;
		}
	}

	async function submitScreening() {
		if (!activeApp) return;
		isActionLoading = true;
		try {
			await recordScreening(activeApp.id, screeningForm);
			successMsg = `Screening recorded successfully!`;
			showScreeningModal = false;
			await loadData();
			activeApp = applications.find((a) => a.id === activeApp?.id) || null;
		} catch (err: any) {
			errorMsg = err.message || 'Failed to save screening';
		} finally {
			isActionLoading = false;
		}
	}

	async function submitForwardToOP() {
		if (!activeApp) return;
		isActionLoading = true;
		try {
			await forwardToOP(activeApp.id);
			successMsg = `Candidate packet forwarded to Opportunity Provider! 72h SLA clock started.`;
			await loadData();
			activeApp = applications.find((a) => a.id === activeApp?.id) || null;
		} catch (err: any) {
			errorMsg = err.message || 'Failed to forward to OP';
		} finally {
			isActionLoading = false;
		}
	}

	async function submitInterview() {
		if (!activeApp) return;
		isActionLoading = true;
		try {
			await recordOPInterview(activeApp.id, interviewForm);
			successMsg = `OP Interview & hiring decision recorded!`;
			showInterviewModal = false;
			await loadData();
			activeApp = applications.find((a) => a.id === activeApp?.id) || null;
		} catch (err: any) {
			errorMsg = err.message || 'Failed to record interview';
		} finally {
			isActionLoading = false;
		}
	}

	async function submitAcceptance() {
		if (!activeApp) return;
		isActionLoading = true;
		try {
			await recordAcceptanceNote(activeApp.id, acceptanceForm);
			successMsg = `Acceptance Note verified! Application accepted.`;
			showAcceptanceModal = false;
			await loadData();
			activeApp = applications.find((a) => a.id === activeApp?.id) || null;
		} catch (err: any) {
			errorMsg = err.message || 'Failed to verify acceptance note';
		} finally {
			isActionLoading = false;
		}
	}

	async function submitMatchApprove() {
		if (!activeApp) return;
		isActionLoading = true;
		try {
			await approveMatch(activeApp.id);
			successMsg = `Match approved! Capacity slot locked, official EXPA status: APD, local readiness: READY.`;
			await loadData();
			activeApp = applications.find((a) => a.id === activeApp?.id) || null;
		} catch (err: any) {
			errorMsg = err.message || 'Failed to approve match';
		} finally {
			isActionLoading = false;
		}
	}

	async function submitReadiness() {
		if (!activeApp) return;
		isActionLoading = true;
		try {
			await updateReadiness(activeApp.id, readinessForm.operational_readiness, readinessForm.notes);
			successMsg = `Operational readiness updated to ${readinessForm.operational_readiness} (EXPA status unchanged)`;
			showReadinessModal = false;
			await loadData();
			activeApp = applications.find((a) => a.id === activeApp?.id) || null;
		} catch (err: any) {
			errorMsg = err.message || 'Failed to update readiness';
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
			<h1 class="text-2xl font-bold tracking-tight text-content-primary">Applications & Matching</h1>
			<p class="text-sm text-content-secondary mt-1">
				9-stage candidate screening pipeline, SLA monitoring, OP interview recording, and dual-status state decoupling.
			</p>
		</div>
		<div class="flex items-center gap-3">
			<div class="flex items-center bg-surface-2 p-1 rounded-lg border border-surface-border">
				<button
					onclick={() => (viewMode = 'KANBAN')}
					class="px-3 py-1 rounded-md text-xs font-semibold transition {viewMode === 'KANBAN'
						? 'bg-surface-3 text-content-primary shadow-xs'
						: 'text-content-muted'}"
				>
					Kanban
				</button>
				<button
					onclick={() => (viewMode = 'TABLE')}
					class="px-3 py-1 rounded-md text-xs font-semibold transition {viewMode === 'TABLE'
						? 'bg-surface-3 text-content-primary shadow-xs'
						: 'text-content-muted'}"
				>
					Table
				</button>
			</div>
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

	<!-- Search & Filters -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
		<div class="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
			<button
				onclick={() => (stageFilter = 'ALL')}
				class="px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition {stageFilter === 'ALL'
					? 'bg-surface-3 text-content-primary border border-surface-border'
					: 'text-content-muted hover:text-content-secondary'}"
			>
				All Stages ({applications.length})
			</button>
			{#each KANBAN_STAGES as stage}
				<button
					onclick={() => (stageFilter = stage.id)}
					class="px-2 py-1 rounded-lg text-xs font-semibold shrink-0 transition {stageFilter === stage.id
						? 'bg-surface-3 text-content-primary border border-surface-border'
						: 'text-content-muted hover:text-content-secondary'}"
				>
					{stage.label} ({applications.filter((a) => a.current_stage === stage.id).length})
				</button>
			{/each}
		</div>

		<div class="w-full sm:w-64 shrink-0">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search candidate, code, opportunity..."
				class="w-full px-3 py-1.5 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"
			/>
		</div>
	</div>

	<!-- Kanban Board View -->
	{#if viewMode === 'KANBAN'}
		{#if isLoading}
			<div class="p-12 text-center text-xs text-content-muted">Loading candidate pipeline...</div>
		{:else}
			<div class="flex gap-4 overflow-x-auto pb-6">
				{#each KANBAN_STAGES as col}
					{@const colApps = filteredApps.filter((a) => a.current_stage === col.id)}
					<div class="w-72 shrink-0 bg-surface-1 rounded-xl border border-surface-border flex flex-col max-h-[750px]">
						<!-- Column Header -->
						<div class="p-3 border-b border-surface-border flex items-center justify-between">
							<span class="text-xs font-bold text-content-primary">{col.label}</span>
							<span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-2 text-content-muted font-bold">
								{colApps.length}
							</span>
						</div>

						<!-- Cards Container -->
						<div class="p-2 space-y-2.5 overflow-y-auto flex-1">
							{#each colApps as app}
								<div
									role="button"
									tabindex="0"
									onclick={() => openDetail(app)}
									onkeydown={(e) => e.key === 'Enter' && openDetail(app)}
									class="p-3.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-surface-border transition cursor-pointer space-y-2.5 shadow-2xs text-left"
								>
									<div class="flex items-center justify-between">
										<span class="font-mono text-[10px] font-bold text-content-muted">{app.application_code}</span>
										{#if app.is_sla_breached}
											<span class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
												SLA Breached
											</span>
										{/if}
									</div>

									<div>
										<h4 class="text-xs font-bold text-content-primary">{app.ep_name || 'Candidate'}</h4>
										<p class="text-[11px] text-content-muted">{app.ep_country || 'Global'}</p>
									</div>

									<div class="text-[10px] text-content-secondary line-clamp-1 border-t border-surface-border/50 pt-1.5">
										{app.opportunity_title}
									</div>

									<!-- Dual Status Mini Badge -->
									<div class="flex items-center justify-between text-[10px] font-mono pt-1">
										<span class="px-1.5 py-0.5 rounded bg-surface-1 text-content-muted">
											EXPA: <b class="text-content-primary">{app.official_expa_status}</b>
										</span>
										<span
											class="px-1.5 py-0.5 rounded {app.operational_readiness === 'READY'
												? 'bg-emerald-500/20 text-emerald-400'
												: app.operational_readiness === 'AT_RISK'
												? 'bg-amber-500/20 text-amber-400'
												: 'bg-surface-1 text-content-muted'}"
										>
											{app.operational_readiness}
										</span>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{:else}
		<!-- Table View -->
		<div class="overflow-x-auto rounded-xl border border-surface-border bg-surface-1 shadow-sm">
			<table class="w-full text-left text-xs">
				<thead class="bg-surface-2/60 border-b border-surface-border text-content-muted text-[10px] uppercase font-bold tracking-wider">
					<tr>
						<th class="p-3">Application Code</th>
						<th class="p-3">Candidate</th>
						<th class="p-3">Opportunity</th>
						<th class="p-3">Screening Stage</th>
						<th class="p-3">Official EXPA</th>
						<th class="p-3">Local Readiness</th>
						<th class="p-3 text-right">Action</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-surface-border">
					{#each filteredApps as app}
						<tr class="hover:bg-surface-2/40 transition">
							<td class="p-3 font-mono font-bold text-content-primary">{app.application_code}</td>
							<td class="p-3">
								<div class="font-bold text-content-primary">{app.ep_name}</div>
								<div class="text-[11px] text-content-muted">{app.ep_country}</div>
							</td>
							<td class="p-3">
								<div class="font-medium text-content-primary">{app.opportunity_title}</div>
								<div class="text-[10px] font-mono text-content-muted">{app.opportunity_code}</div>
							</td>
							<td class="p-3">
								<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-2 text-content-primary border border-surface-border">
									{app.current_stage}
								</span>
							</td>
							<td class="p-3">
								<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
									{app.official_expa_status}
								</span>
							</td>
							<td class="p-3">
								<span class="px-2 py-0.5 rounded text-[10px] font-bold {app.operational_readiness === 'READY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-surface-2 text-content-muted'}">
									{app.operational_readiness}
								</span>
							</td>
							<td class="p-3 text-right">
								<button onclick={() => openDetail(app)} class="px-2.5 py-1 rounded bg-surface-2 hover:bg-surface-3 text-xs font-semibold">
									Open &rarr;
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Drawer: Application Detail & Stage Control -->
{#if showDetailDrawer && activeApp}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
		<div class="w-full max-w-xl bg-surface-1 border-l border-surface-border h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
			<div class="flex items-center justify-between pb-3 border-b border-surface-border">
				<div>
					<h3 class="text-base font-bold text-content-primary">{activeApp.application_code}</h3>
					<p class="text-xs text-content-muted mt-0.5">{activeApp.ep_name} &rarr; {activeApp.opportunity_title}</p>
				</div>
				<button onclick={() => (showDetailDrawer = false)} class="text-content-muted hover:text-content-primary">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Dual Status Highlight Box -->
			<div class="p-4 rounded-xl bg-surface-2 border border-surface-border space-y-3">
				<div class="text-[10px] font-bold uppercase tracking-wider text-content-muted">Decoupled Dual-Status Architecture</div>
				<div class="grid grid-cols-2 gap-3 text-xs">
					<div class="p-3 rounded-lg bg-surface-1 border border-surface-border">
						<span class="text-content-muted text-[10px] block font-bold uppercase">Official EXPA Status</span>
						<span class="text-sm font-mono font-bold text-indigo-400">{activeApp.official_expa_status}</span>
						<p class="text-[10px] text-content-muted mt-0.5">Authoritative international exchange status.</p>
					</div>

					<div class="p-3 rounded-lg bg-surface-1 border border-surface-border">
						<span class="text-content-muted text-[10px] block font-bold uppercase">Operational Readiness</span>
						<span class="text-sm font-bold {activeApp.operational_readiness === 'READY' ? 'text-emerald-400' : 'text-amber-400'}">
							{activeApp.operational_readiness}
						</span>
						<button
							onclick={() => (showReadinessModal = true)}
							class="text-[10px] text-brand-blue block font-semibold hover:underline mt-0.5"
						>
							Change Readiness &rarr;
						</button>
					</div>
				</div>
			</div>

			<!-- Pipeline Stage Actions -->
			<div class="space-y-2">
				<label class="text-xs font-bold text-content-primary uppercase tracking-wider block">Stage Workflow Actions</label>
				<div class="grid grid-cols-2 gap-2 text-xs">
					{#if activeApp.current_stage === 'APPLIED'}
						<button
							disabled={isActionLoading}
							onclick={() => executeTransition(activeApp.id, 'CONTACTED')}
							class="p-2.5 rounded-lg bg-brand-blue text-white font-semibold hover:bg-brand-blue/90"
						>
							1. Mark First Contact Made
						</button>
					{/if}

					{#if activeApp.current_stage === 'CONTACTED' || activeApp.current_stage === 'SCREENING'}
						<button
							onclick={() => (showScreeningModal = true)}
							class="p-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500"
						>
							2. Record Internal Screening
						</button>
					{/if}

					{#if activeApp.current_stage === 'SHORTLISTED'}
						<button
							disabled={isActionLoading}
							onclick={submitForwardToOP}
							class="p-2.5 rounded-lg bg-brand-blue text-white font-semibold hover:bg-brand-blue/90"
						>
							3. Forward Packet to OP (72h Clock)
						</button>
					{/if}

					{#if activeApp.current_stage === 'SENT_TO_OP' || activeApp.current_stage === 'INTERVIEW'}
						<button
							onclick={() => (showInterviewModal = true)}
							class="p-2.5 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-500"
						>
							4. Record OP Interview & Decision
						</button>
					{/if}

					{#if activeApp.current_stage === 'OP_DECISION' || activeApp.current_stage === 'ACCEPTED'}
						<button
							onclick={() => (showAcceptanceModal = true)}
							class="p-2.5 rounded-lg bg-surface-3 border border-surface-border text-content-primary font-semibold hover:bg-surface-2"
						>
							5. Upload / Verify Acceptance Note
						</button>

						<button
							disabled={isActionLoading}
							onclick={submitMatchApprove}
							class="p-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
						>
							6. Finalize Match Approval (APD)
						</button>
					{/if}
				</div>
			</div>

			<!-- Screenings & Interview History -->
			{#if activeApp.screenings && activeApp.screenings.length > 0}
				<div class="space-y-2 pt-2 border-t border-surface-border">
					<h4 class="text-xs font-bold text-content-primary uppercase tracking-wider">Internal Screening Result</h4>
					{#each activeApp.screenings as scr}
						<div class="p-3 rounded-lg bg-surface-2 border border-surface-border text-xs space-y-1">
							<div class="flex justify-between font-bold">
								<span class="text-content-primary">{scr.recommendation}</span>
								<span class="text-content-muted text-[10px]">{scr.created_at.slice(0, 10)}</span>
							</div>
							<p class="text-content-secondary">{scr.motivation_notes}</p>
						</div>
					{/each}
				</div>
			{/if}

			{#if activeApp.op_interviews && activeApp.op_interviews.length > 0}
				<div class="space-y-2 pt-2 border-t border-surface-border">
					<h4 class="text-xs font-bold text-content-primary uppercase tracking-wider">Opportunity Provider Feedback</h4>
					{#each activeApp.op_interviews as int}
						<div class="p-3 rounded-lg bg-surface-2 border border-surface-border text-xs space-y-1">
							<div class="flex justify-between font-bold">
								<span class="text-indigo-400">Interviewer: {int.interviewer_name} ({int.op_decision})</span>
								<span class="text-content-muted text-[10px]">{int.created_at.slice(0, 10)}</span>
							</div>
							<p class="text-content-secondary">{int.feedback_notes}</p>
						</div>
					{/each}
				</div>
			{/if}

			<div class="pt-4 border-t border-surface-border flex justify-end">
				<button onclick={() => (showDetailDrawer = false)} class="px-4 py-2 rounded-lg bg-surface-2 text-content-secondary text-xs font-semibold">
					Close
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal: Internal Screening -->
{#if showScreeningModal && activeApp}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="w-full max-w-md bg-surface-1 border border-surface-border rounded-2xl p-6 space-y-4 shadow-2xl">
			<div class="flex items-center justify-between pb-2 border-b border-surface-border">
				<h3 class="text-base font-bold text-content-primary">Internal Screening Review</h3>
				<button onclick={() => (showScreeningModal = false)} class="text-content-muted hover:text-content-primary">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="space-y-3 text-xs">
				<div class="space-y-1">
					<label class="font-semibold text-content-primary">Language Proficiency</label>
					<select bind:value={screeningForm.language_proficiency} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue">
						<option value="BASIC">Basic</option>
						<option value="INTERMEDIATE">Intermediate</option>
						<option value="ADVANCED">Advanced</option>
						<option value="NATIVE">Native</option>
					</select>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Cultural Fit (1-5)</label>
						<input type="number" min="1" max="5" bind:value={screeningForm.cultural_fit_rating} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
					</div>
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Skills Match (1-5)</label>
						<input type="number" min="1" max="5" bind:value={screeningForm.skills_match_rating} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
					</div>
				</div>

				<div class="space-y-1">
					<label class="font-semibold text-content-primary">Recommendation *</label>
					<select bind:value={screeningForm.recommendation} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue">
						<option value="RECOMMENDED">RECOMMENDED (Advances to Shortlisted)</option>
						<option value="NEUTRAL">NEUTRAL</option>
						<option value="REJECTED">REJECTED</option>
					</select>
				</div>

				<div class="space-y-1">
					<label class="font-semibold text-content-primary">Motivation & Review Notes</label>
					<textarea rows="3" bind:value={screeningForm.motivation_notes} placeholder="Candidate fit for opportunity role..." class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"></textarea>
				</div>
			</div>

			<div class="flex justify-end gap-3 pt-3 border-t border-surface-border">
				<button onclick={() => (showScreeningModal = false)} class="px-3 py-1.5 rounded-lg bg-surface-2 text-xs font-semibold text-content-secondary">Cancel</button>
				<button disabled={isActionLoading} onclick={submitScreening} class="px-4 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 disabled:opacity-50">Save Screening</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal: OP Interview Recorder -->
{#if showInterviewModal && activeApp}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="w-full max-w-md bg-surface-1 border border-surface-border rounded-2xl p-6 space-y-4 shadow-2xl">
			<div class="flex items-center justify-between pb-2 border-b border-surface-border">
				<h3 class="text-base font-bold text-content-primary">Record OP Interview & Decision</h3>
				<button onclick={() => (showInterviewModal = false)} class="text-content-muted hover:text-content-primary">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="space-y-3 text-xs">
				<div class="space-y-1">
					<label class="font-semibold text-content-primary">Interviewer Name *</label>
					<input type="text" bind:value={interviewForm.interviewer_name} placeholder="e.g. Partner HR / Line Manager" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
				</div>

				<div class="space-y-1">
					<label class="font-semibold text-content-primary">Opportunity Provider Decision *</label>
					<select bind:value={interviewForm.op_decision} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue">
						<option value="ACCEPTED">ACCEPTED (Ready for Acceptance Note & Approval)</option>
						<option value="SECOND_ROUND">SECOND_ROUND</option>
						<option value="REJECTED">REJECTED</option>
					</select>
				</div>

				<div class="space-y-1">
					<label class="font-semibold text-content-primary">Feedback & Questions Asked</label>
					<textarea rows="3" bind:value={interviewForm.feedback_notes} placeholder="Candidate demonstrated technical fluency and cultural adaptability..." class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"></textarea>
				</div>
			</div>

			<div class="flex justify-end gap-3 pt-3 border-t border-surface-border">
				<button onclick={() => (showInterviewModal = false)} class="px-3 py-1.5 rounded-lg bg-surface-2 text-xs font-semibold text-content-secondary">Cancel</button>
				<button disabled={isActionLoading || !interviewForm.interviewer_name} onclick={submitInterview} class="px-4 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 disabled:opacity-50">Save Decision</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal: Acceptance Note Upload -->
{#if showAcceptanceModal && activeApp}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="w-full max-w-md bg-surface-1 border border-surface-border rounded-2xl p-6 space-y-4 shadow-2xl">
			<div class="flex items-center justify-between pb-2 border-b border-surface-border">
				<h3 class="text-base font-bold text-content-primary">Verify Acceptance Note (AN)</h3>
				<button onclick={() => (showAcceptanceModal = false)} class="text-content-muted hover:text-content-primary">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="space-y-3 text-xs">
				<div class="space-y-1">
					<label class="font-semibold text-content-primary">Signed Document URL *</label>
					<input type="text" bind:value={acceptanceForm.document_url} placeholder="https://storage.aiesec.org/an/signed-an.pdf" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue font-mono" />
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">EP Signature Date</label>
						<input type="date" bind:value={acceptanceForm.ep_signature_date} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
					</div>
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Partner Signature Date</label>
						<input type="date" bind:value={acceptanceForm.partner_signature_date} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
					</div>
				</div>

				<div class="flex items-center gap-2 pt-1">
					<input type="checkbox" id="verifyCheck" bind:checked={acceptanceForm.is_verified} class="rounded bg-surface-2 text-brand-blue focus:ring-brand-blue" />
					<label for="verifyCheck" class="text-content-secondary font-medium">Confirm both signatures are authentic and verified</label>
				</div>
			</div>

			<div class="flex justify-end gap-3 pt-3 border-t border-surface-border">
				<button onclick={() => (showAcceptanceModal = false)} class="px-3 py-1.5 rounded-lg bg-surface-2 text-xs font-semibold text-content-secondary">Cancel</button>
				<button disabled={isActionLoading || !acceptanceForm.document_url} onclick={submitAcceptance} class="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 disabled:opacity-50">Verify & Accept</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal: Operational Readiness Updater -->
{#if showReadinessModal && activeApp}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="w-full max-w-sm bg-surface-1 border border-surface-border rounded-2xl p-6 space-y-4 shadow-2xl">
			<div class="flex items-center justify-between pb-2 border-b border-surface-border">
				<h3 class="text-base font-bold text-content-primary">Update Operational Readiness</h3>
				<button onclick={() => (showReadinessModal = false)} class="text-content-muted hover:text-content-primary">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="space-y-3 text-xs">
				<div class="space-y-1">
					<label class="font-semibold text-content-primary">Local Readiness State</label>
					<select bind:value={readinessForm.operational_readiness} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue">
						<option value="DRAFT">DRAFT (Initial)</option>
						<option value="READY">READY (Ready for Arrival / Worksite)</option>
						<option value="AT_RISK">AT_RISK (Delayed Visa or Logistics)</option>
						<option value="BLOCKED">BLOCKED (Immediate Action Required)</option>
						<option value="DONE">DONE (Completed)</option>
					</select>
				</div>

				<div class="space-y-1">
					<label class="font-semibold text-content-primary">Operational Notes</label>
					<textarea rows="2" bind:value={readinessForm.notes} placeholder="Log reason for risk or status change..." class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"></textarea>
				</div>
			</div>

			<div class="flex justify-end gap-3 pt-3 border-t border-surface-border">
				<button onclick={() => (showReadinessModal = false)} class="px-3 py-1.5 rounded-lg bg-surface-2 text-xs font-semibold text-content-secondary">Cancel</button>
				<button disabled={isActionLoading} onclick={submitReadiness} class="px-4 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 disabled:opacity-50">Update Readiness</button>
			</div>
		</div>
	</div>
{/if}
