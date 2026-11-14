<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchProposals, reviewProposal, type ApprovalProposal } from '$lib/api/ai';

	// Svelte 5 runes
	let proposals = $state<ApprovalProposal[]>([]);
	let statusFilter = $state<'PENDING_HUMAN_REVIEW' | 'APPROVED_EXECUTED' | 'REJECTED' | 'ALL'>('PENDING_HUMAN_REVIEW');
	let isLoading = $state(true);
	let isActionLoading = $state(false);
	let errorMsg = $state<string | null>(null);
	let successMsg = $state<string | null>(null);

	// Review modal
	let showReviewModal = $state(false);
	let selectedProposal = $state<ApprovalProposal | null>(null);
	let reviewDecision = $state<'APPROVED' | 'REJECTED'>('APPROVED');
	let reviewNotes = $state('');
	let rejectionReason = $state('');

	const filteredProposals = $derived(
		proposals.filter((p) => {
			if (statusFilter === 'ALL') return true;
			return p.status === statusFilter;
		})
	);

	async function loadProposals() {
		isLoading = true;
		errorMsg = null;
		try {
			const data = await fetchProposals();
			proposals = data;
		} catch (err: any) {
			errorMsg = err.message || 'Failed to load approval proposals';
		} finally {
			isLoading = false;
		}
	}

	function openReview(proposal: ApprovalProposal, decision: 'APPROVED' | 'REJECTED') {
		selectedProposal = proposal;
		reviewDecision = decision;
		reviewNotes = '';
		rejectionReason = '';
		showReviewModal = true;
	}

	async function handleReviewSubmit() {
		if (!selectedProposal) return;
		isActionLoading = true;
		errorMsg = null;
		try {
			await reviewProposal(selectedProposal.id, {
				decision: reviewDecision,
				review_notes: reviewNotes || undefined,
				rejection_reason: reviewDecision === 'REJECTED' ? rejectionReason : undefined
			});
			successMsg = `Proposal has been ${reviewDecision === 'APPROVED' ? 'approved and executed' : 'rejected'}.`;
			showReviewModal = false;
			await loadProposals();
		} catch (err: any) {
			errorMsg = err.message || 'Failed to submit proposal review';
		} finally {
			isActionLoading = false;
		}
	}

	onMount(() => {
		loadProposals();
	});
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
		<div>
			<h1 class="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
				<span class="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
					</svg>
				</span>
				Human-in-the-Loop Approval Center
			</h1>
			<p class="text-sm text-muted-foreground mt-1">
				Executive review gate for all consequential AI proposals (status mutations, financial waivers, contract signing, and match approvals).
			</p>
		</div>

		<!-- Status Filter Tabs -->
		<div class="inline-flex rounded-lg bg-muted/50 p-1 border border-border text-xs">
			<button
				type="button"
				class="px-3 py-1.5 rounded-md font-medium transition-colors {statusFilter === 'PENDING_HUMAN_REVIEW' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (statusFilter = 'PENDING_HUMAN_REVIEW')}
			>
				Pending Review ({proposals.filter((p) => p.status === 'PENDING_HUMAN_REVIEW').length})
			</button>
			<button
				type="button"
				class="px-3 py-1.5 rounded-md font-medium transition-colors {statusFilter === 'APPROVED_EXECUTED' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (statusFilter = 'APPROVED_EXECUTED')}
			>
				Executed ({proposals.filter((p) => p.status === 'APPROVED_EXECUTED').length})
			</button>
			<button
				type="button"
				class="px-3 py-1.5 rounded-md font-medium transition-colors {statusFilter === 'REJECTED' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (statusFilter = 'REJECTED')}
			>
				Rejected ({proposals.filter((p) => p.status === 'REJECTED').length})
			</button>
			<button
				type="button"
				class="px-3 py-1.5 rounded-md font-medium transition-colors {statusFilter === 'ALL' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (statusFilter = 'ALL')}
			>
				All ({proposals.length})
			</button>
		</div>
	</div>

	<!-- Alert Messages -->
	{#if errorMsg}
		<div class="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center justify-between">
			<span>{errorMsg}</span>
			<button class="text-xs underline" onclick={() => (errorMsg = null)}>Dismiss</button>
		</div>
	{/if}

	{#if successMsg}
		<div class="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex items-center justify-between">
			<span>{successMsg}</span>
			<button class="text-xs underline" onclick={() => (successMsg = null)}>Dismiss</button>
		</div>
	{/if}

	<!-- Governance Invariant Notice -->
	<div class="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
		<svg class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
		</svg>
		<div class="text-xs leading-relaxed text-muted-foreground">
			<strong class="text-foreground">AI Governance Boundary:</strong>
			No AI agent or background process has direct write authority to alter exchange stages, release financial waivers, or modify official EXPA records. Every consequential action must pass through this approval queue and be explicitly signed by an authorized officer.
		</div>
	</div>

	<!-- Proposals Grid / Table -->
	{#if isLoading}
		<div class="p-12 text-center text-sm text-muted-foreground">Loading approval proposals...</div>
	{:else if filteredProposals.length === 0}
		<div class="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
			<p class="text-base font-semibold">No proposals in this view</p>
			<p class="text-xs mt-1">Consequential actions proposed by specialized AI copilots will appear here for review.</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each filteredProposals as prop}
				<div class="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm transition-all">
					<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/40">
						<div class="flex items-center gap-2">
							<span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
								{prop.proposal_type}
							</span>
							<span class="text-xs text-muted-foreground">
								Target: <strong class="text-foreground">{prop.target_entity_type}</strong> (<span class="font-mono">{prop.target_entity_id.slice(0, 8)}...</span>)
							</span>
							<span class="text-xs text-muted-foreground">• Agent: <strong class="text-primary">{prop.agent_name}</strong></span>
						</div>

						<span class="px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase border {prop.status === 'APPROVED_EXECUTED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : prop.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}">
							{prop.status}
						</span>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
						<!-- Action & Rationale -->
						<div class="space-y-2">
							<div>
								<span class="font-semibold text-muted-foreground block">Proposed Action:</span>
								<span class="text-sm font-bold text-foreground font-mono">{prop.proposed_action}</span>
							</div>
							<div>
								<span class="font-semibold text-muted-foreground block">Agent Rationale:</span>
								<p class="text-foreground leading-relaxed italic bg-muted/30 p-2.5 rounded border border-border/40">
									"{prop.rationale}"
								</p>
							</div>
						</div>

						<!-- Payload Inspection -->
						<div class="space-y-1">
							<span class="font-semibold text-muted-foreground block">Proposed Mutation Payload:</span>
							<pre class="bg-muted/50 p-2.5 rounded border border-border/40 text-[11px] font-mono text-foreground overflow-x-auto max-h-28">
{JSON.stringify(prop.proposed_payload, null, 2)}
							</pre>
						</div>
					</div>

					<!-- Review History if not pending -->
					{#if prop.status !== 'PENDING_HUMAN_REVIEW'}
						<div class="pt-3 border-t border-border/40 text-xs text-muted-foreground flex items-center justify-between">
							<span>Reviewed at: {prop.reviewed_at ? prop.reviewed_at.slice(0, 16) : '—'}</span>
							{#if prop.rejection_reason}
								<span class="text-red-500">Reason: {prop.rejection_reason}</span>
							{/if}
						</div>
					{:else}
						<!-- Action Buttons -->
						<div class="pt-3 border-t border-border/40 flex justify-end gap-2">
							<button
								type="button"
								class="px-4 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-semibold transition-colors"
								onclick={() => openReview(prop, 'REJECTED')}
							>
								Reject Proposal
							</button>
							<button
								type="button"
								class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-colors"
								onclick={() => openReview(prop, 'APPROVED')}
							>
								Approve &amp; Execute Action
							</button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal: Confirm Review / Reject -->
{#if showReviewModal && selectedProposal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
		<div class="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
			<div class="flex items-center justify-between border-b border-border/40 pb-3">
				<div>
					<h3 class="text-base font-bold text-foreground">
						{reviewDecision === 'APPROVED' ? 'Approve & Execute Action' : 'Reject Action Proposal'}
					</h3>
					<span class="text-xs text-muted-foreground font-mono">{selectedProposal.proposed_action}</span>
				</div>
				<button class="text-muted-foreground hover:text-foreground" onclick={() => (showReviewModal = false)}>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
				</button>
			</div>

			<form onsubmit={(e) => { e.preventDefault(); handleReviewSubmit(); }} class="space-y-4 text-sm">
				{#if reviewDecision === 'APPROVED'}
					<div class="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500">
						Confirming this proposal will immediately execute the underlying state mutation in the database.
					</div>

					<div>
						<label for="rev-notes" class="block text-xs font-medium text-muted-foreground mb-1">Review Notes (Optional)</label>
						<textarea
							id="rev-notes"
							rows="3"
							placeholder="Officer verification notes or meeting references..."
							class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
							bind:value={reviewNotes}
						></textarea>
					</div>
				{:else}
					<div class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500">
						Rejecting this proposal will cancel the mutation and notify the copilot workflow.
					</div>

					<div>
						<label for="rej-reason" class="block text-xs font-medium text-muted-foreground mb-1">Rejection Reason *</label>
						<textarea
							id="rej-reason"
							rows="3"
							placeholder="Explain policy violations, missing documents, or factual inaccuracies..."
							class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
							bind:value={rejectionReason}
							required
						></textarea>
					</div>
				{/if}

				<div class="pt-2 flex justify-end gap-2 border-t border-border/40">
					<button
						type="button"
						class="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted"
						onclick={() => (showReviewModal = false)}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 rounded-lg text-xs font-semibold shadow {reviewDecision === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}"
						disabled={isActionLoading}
					>
						{isActionLoading ? 'Processing...' : (reviewDecision === 'APPROVED' ? 'Authorize & Execute' : 'Confirm Rejection')}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
