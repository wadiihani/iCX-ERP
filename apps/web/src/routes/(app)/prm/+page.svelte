<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getPipelineSummary,
		getLeads,
		updateLeadStage,
		getFollowUps,
		completeFollowUp,
		createLead,
		getOrganizations,
		type PipelineSummary,
		type PRMLead,
		type PRMActivity,
		type Organization,
	} from '$lib/api/prm';

	// Svelte 5 runes state
	let summary = $state<PipelineSummary | null>(null);
	let leads = $state<PRMLead[]>([]);
	let followUps = $state<PRMActivity[]>([]);
	let organizations = $state<Organization[]>([]);
	let isLoading = $state(true);
	let errorMsg = $state<string | null>(null);
	let showCreateModal = $state(false);

	// New lead form state
	let newLead = $state({
		organization_id: '',
		title: '',
		estimated_value: 0,
		target_openings: 1,
		target_products: ['iGTa'],
		source: 'Cold Outreach',
		territory: 'Rabat',
		bant_budget: 'UNKNOWN',
		bant_authority: 'UNKNOWN',
		bant_need: 'UNKNOWN',
		bant_timeline: 'UNKNOWN',
	});

	// Stages to show in Kanban board
	const KANBAN_STAGES = [
		{ id: 'SUSPECT', label: 'Suspect' },
		{ id: 'QUALIFIED', label: 'Qualified' },
		{ id: 'CONTACTED', label: 'Contacted' },
		{ id: 'MEETING_SCHEDULED', label: 'Meeting Sched.' },
		{ id: 'MEETING_HELD', label: 'Meeting Held' },
		{ id: 'PROPOSAL', label: 'Proposal' },
		{ id: 'NEGOTIATION', label: 'Negotiation' },
		{ id: 'CONTRACT_SIGNED', label: 'Contract Signed' },
		{ id: 'ACTIVE_ACCOUNT', label: 'Active Account' },
	];

	async function loadData() {
		isLoading = true;
		errorMsg = null;
		try {
			const [sumData, leadsData, taskData, orgsData] = await Promise.all([
				getPipelineSummary(),
				getLeads(),
				getFollowUps(),
				getOrganizations(),
			]);
			summary = sumData;
			leads = leadsData;
			followUps = taskData;
			organizations = orgsData;
			if (orgsData.length > 0 && !newLead.organization_id) {
				newLead.organization_id = orgsData[0].id;
			}
		} catch (err: any) {
			errorMsg = err.message || 'Failed to load PRM data';
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		loadData();
	});

	function getLeadsForStage(stageId: string) {
		return leads.filter((l) => l.stage === stageId);
	}

	async function handleAdvanceStage(lead: PRMLead, nextStage: string) {
		try {
			await updateLeadStage(lead.id, nextStage);
			await loadData();
		} catch (err: any) {
			alert(err.message || 'Stage update failed');
		}
	}

	async function handleCompleteTask(taskId: string) {
		try {
			await completeFollowUp(taskId);
			followUps = followUps.filter((t) => t.id !== taskId);
		} catch (err: any) {
			alert(err.message || 'Failed to complete task');
		}
	}

	async function handleCreateLead() {
		if (!newLead.title || !newLead.organization_id) {
			alert('Please enter a title and select an organization');
			return;
		}
		try {
			await createLead({
				organization_id: newLead.organization_id,
				title: newLead.title,
				estimated_value: Number(newLead.estimated_value),
				target_openings: Number(newLead.target_openings),
				target_products: newLead.target_products,
				source: newLead.source,
				territory: newLead.territory,
				bant: {
					bant_budget: newLead.bant_budget,
					bant_authority: newLead.bant_authority,
					bant_need: newLead.bant_need,
					bant_timeline: newLead.bant_timeline,
				},
			} as any);
			showCreateModal = false;
			await loadData();
		} catch (err: any) {
			alert(err.message || 'Failed to create lead');
		}
	}

	function getBantBadgeColor(score: number) {
		if (score >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
		if (score >= 60) return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
		if (score >= 30) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
		return 'bg-zinc-800 text-zinc-400 border-zinc-700';
	}
</script>

<svelte:head>
	<title>PRM Pipeline & Leads — iCX Command Center</title>
</svelte:head>

<div class="space-y-6">
	<!-- Top Bar -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold tracking-tight text-zinc-100">Partner Relationship Management</h1>
			<p class="text-sm text-zinc-400">Track local hosting company leads, BANT qualification, and stage progression.</p>
		</div>
		<div class="flex items-center gap-3">
			<button
				onclick={() => showCreateModal = true}
				class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-sm"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
				</svg>
				New Lead
			</button>
			<button
				onclick={loadData}
				class="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
				title="Refresh"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
				</svg>
			</button>
		</div>
	</div>

	<!-- Metric Highlights -->
	{#if summary}
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			<div class="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
				<div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Active Leads</div>
				<div class="mt-2 text-2xl font-bold text-zinc-100">{summary.total_leads}</div>
			</div>
			<div class="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
				<div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Estimated Pipeline Value</div>
				<div class="mt-2 text-2xl font-bold text-emerald-400">{Number(summary.total_pipeline_value).toLocaleString()} MAD</div>
			</div>
			<div class="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
				<div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Pending Follow-Ups</div>
				<div class="mt-2 text-2xl font-bold text-amber-400">{followUps.length}</div>
			</div>
			<div class="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
				<div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Registered Organizations</div>
				<div class="mt-2 text-2xl font-bold text-zinc-100">{organizations.length}</div>
			</div>
		</div>
	{/if}

	<!-- Follow-Ups Widget -->
	{#if followUps.length > 0}
		<div class="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20">
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-sm font-semibold text-amber-300 flex items-center gap-2">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
					Operational Follow-Ups Due ({followUps.length})
				</h3>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
				{#each followUps.slice(0, 3) as task}
					<div class="flex items-center justify-between p-3 rounded-lg bg-zinc-900/80 border border-zinc-800">
						<div class="truncate mr-3">
							<div class="text-xs font-medium text-zinc-200 truncate">{task.summary}</div>
							<div class="text-xs text-amber-400 truncate mt-0.5">{task.next_step}</div>
						</div>
						<button
							onclick={() => handleCompleteTask(task.id)}
							class="text-xs px-2.5 py-1 rounded bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-300 border border-zinc-700 transition-colors shrink-0"
						>
							Done
						</button>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Kanban Board -->
	<div class="overflow-x-auto pb-4">
		<div class="inline-flex gap-4 min-w-full">
			{#each KANBAN_STAGES as stage}
				{@const stageLeads = getLeadsForStage(stage.id)}
				<div class="w-72 shrink-0 flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm max-h-[750px]">
					<!-- Column Header -->
					<div class="p-3 border-b border-zinc-800 flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="text-xs font-semibold text-zinc-200">{stage.label}</span>
							<span class="text-xs px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
								{stageLeads.length}
							</span>
						</div>
					</div>

					<!-- Column Body -->
					<div class="p-2 space-y-2 overflow-y-auto flex-1">
						{#if stageLeads.length === 0}
							<div class="p-4 text-center text-xs text-zinc-500 border border-dashed border-zinc-800/80 rounded-lg">
								No leads in {stage.label}
							</div>
						{:else}
							{#each stageLeads as lead}
								<div class="p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm space-y-2">
									<div class="flex items-start justify-between gap-2">
										<div class="text-xs font-semibold text-zinc-200 line-clamp-1">{lead.title}</div>
										<span class={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getBantBadgeColor(lead.bant_score)} shrink-0`}>
											BANT {lead.bant_score}
										</span>
									</div>

									{#if lead.organization_name}
										<div class="text-xs text-zinc-400 truncate flex items-center gap-1">
											<svg class="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
											</svg>
											{lead.organization_name}
										</div>
									{/if}

									<div class="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
										<span class="font-mono text-zinc-300">{Number(lead.estimated_value).toLocaleString()} MAD</span>
										<span class="text-zinc-500">{lead.target_openings} slots</span>
									</div>

									<!-- Stage quick action -->
									<div class="pt-1 flex items-center justify-between gap-1 text-[10px]">
										<span class="text-zinc-500">{lead.source}</span>
										{#if stage.id !== 'ACTIVE_ACCOUNT'}
											{@const nextIdx = KANBAN_STAGES.findIndex(s => s.id === stage.id) + 1}
											{#if nextIdx < KANBAN_STAGES.length}
												<button
													onclick={() => handleAdvanceStage(lead, KANBAN_STAGES[nextIdx].id)}
													class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-blue-600 hover:text-white text-zinc-300 transition-colors"
												>
													→ {KANBAN_STAGES[nextIdx].label}
												</button>
											{/if}
										{/if}
									</div>
								</div>
							{/each}
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Create Lead Modal -->
	{#if showCreateModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div class="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-4">
				<div class="flex items-center justify-between border-b border-zinc-800 pb-3">
					<h3 class="text-lg font-bold text-zinc-100">Create Partner Lead</h3>
					<button onclick={() => showCreateModal = false} class="text-zinc-400 hover:text-zinc-200">✕</button>
				</div>

				<div class="space-y-3">
					<div>
						<label class="block text-xs font-medium text-zinc-300 mb-1">Organization *</label>
						<select
							bind:value={newLead.organization_id}
							class="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-200"
						>
							{#each organizations as org}
								<option value={org.id}>{org.name} ({org.sector})</option>
							{/each}
						</select>
					</div>

					<div>
						<label class="block text-xs font-medium text-zinc-300 mb-1">Lead Opportunity Title *</label>
						<input
							type="text"
							bind:value={newLead.title}
							placeholder="e.g. iGT Software Engineer 2027"
							class="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-200"
						/>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<div>
							<label class="block text-xs font-medium text-zinc-300 mb-1">Estimated Value (MAD)</label>
							<input
								type="number"
								bind:value={newLead.estimated_value}
								class="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-200"
							/>
						</div>
						<div>
							<label class="block text-xs font-medium text-zinc-300 mb-1">Target Openings</label>
							<input
								type="number"
								bind:value={newLead.target_openings}
								min="1"
								class="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-200"
							/>
						</div>
					</div>

					<div class="border-t border-zinc-800 pt-3">
						<div class="text-xs font-semibold text-zinc-300 mb-2">BANT Initial Assessment</div>
						<div class="grid grid-cols-2 gap-2 text-xs">
							<div>
								<span class="text-zinc-400">Budget:</span>
								<select bind:value={newLead.bant_budget} class="w-full mt-1 p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-200">
									<option value="UNKNOWN">Unknown (0)</option>
									<option value="NO_BUDGET">No Budget (0)</option>
									<option value="ADEQUATE">Adequate (25)</option>
									<option value="HIGH">High (25)</option>
								</select>
							</div>
							<div>
								<span class="text-zinc-400">Authority:</span>
								<select bind:value={newLead.bant_authority} class="w-full mt-1 p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-200">
									<option value="UNKNOWN">Unknown (0)</option>
									<option value="NO_DECISION_POWER">No Power (0)</option>
									<option value="INFLUENCER">Influencer (15)</option>
									<option value="DECISION_MAKER">Decision Maker (25)</option>
								</select>
							</div>
							<div>
								<span class="text-zinc-400">Need:</span>
								<select bind:value={newLead.bant_need} class="w-full mt-1 p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-200">
									<option value="UNKNOWN">Unknown (0)</option>
									<option value="LOW">Low (5)</option>
									<option value="CLEAR_NEED">Clear Need (20)</option>
									<option value="CRITICAL_PAIN">Critical Pain (25)</option>
								</select>
							</div>
							<div>
								<span class="text-zinc-400">Timeline:</span>
								<select bind:value={newLead.bant_timeline} class="w-full mt-1 p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-200">
									<option value="UNKNOWN">Unknown (0)</option>
									<option value="GREATER_6_MONTHS">&gt; 6 Mos (10)</option>
									<option value="WITHIN_3_6_MONTHS">3-6 Mos (20)</option>
									<option value="IMMEDIATE_1_3_MONTHS">1-3 Mos (25)</option>
								</select>
							</div>
						</div>
					</div>
				</div>

				<div class="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
					<button
						onclick={() => showCreateModal = false}
						class="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm"
					>
						Cancel
					</button>
					<button
						onclick={handleCreateLead}
						class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 text-sm font-medium"
					>
						Save Lead
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
