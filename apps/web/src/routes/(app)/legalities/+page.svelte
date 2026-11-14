<script lang="ts">
	import { onMount } from 'svelte';
	import {
		fetchRisks,
		createRisk,
		fetchIACItems,
		auditIACItem,
		fetchLegalDocuments,
		type RiskEntry,
		type IACAuditItem,
		type LegalDocument
	} from '$lib/api/finance';

	// Svelte 5 runes
	let activeTab = $state<'RISKS' | 'IAC' | 'VAULT'>('RISKS');
	let risks = $state<RiskEntry[]>([]);
	let iacItems = $state<IACAuditItem[]>([]);
	let documents = $state<LegalDocument[]>([]);

	let isLoading = $state(true);
	let isActionLoading = $state(false);
	let errorMsg = $state<string | null>(null);
	let successMsg = $state<string | null>(null);

	// Risk modal
	let showRiskModal = $state(false);
	let riskForm = $state({
		risk_category: 'LEGAL' as 'FINANCIAL' | 'LEGAL' | 'HEALTH_SAFETY' | 'PARTNER_RELATIONS' | 'REPUTATION',
		title: '',
		description: '',
		probability: 3,
		impact: 3,
		mitigation_plan: '',
		contingency_plan: ''
	});

	// IAC audit modal
	let showAuditModal = $state(false);
	let selectedIACItem = $state<IACAuditItem | null>(null);
	let auditForm = $state({
		compliance_status: 'VERIFIED',
		findings: '',
		evidence_url: ''
	});

	async function loadAllData() {
		isLoading = true;
		errorMsg = null;
		try {
			const [r, i, d] = await Promise.all([
				fetchRisks().catch(() => []),
				fetchIACItems().catch(() => []),
				fetchLegalDocuments().catch(() => [])
			]);
			risks = r;
			iacItems = i;
			documents = d;
		} catch (err: any) {
			errorMsg = err.message || 'Failed to load compliance records';
		} finally {
			isLoading = false;
		}
	}

	async function handleCreateRisk() {
		isActionLoading = true;
		errorMsg = null;
		try {
			await createRisk({
				risk_category: riskForm.risk_category,
				title: riskForm.title,
				description: riskForm.description,
				probability: Number(riskForm.probability),
				impact: Number(riskForm.impact),
				mitigation_plan: riskForm.mitigation_plan,
				contingency_plan: riskForm.contingency_plan || undefined
			});
			successMsg = 'Risk entry recorded in operational register.';
			showRiskModal = false;
			await loadAllData();
		} catch (err: any) {
			errorMsg = err.message || 'Failed to record risk entry';
		} finally {
			isActionLoading = false;
		}
	}

	function openAuditModal(item: IACAuditItem) {
		selectedIACItem = item;
		auditForm = {
			compliance_status: item.compliance_status === 'PENDING_AUDIT' ? 'VERIFIED' : item.compliance_status,
			findings: item.findings || '',
			evidence_url: item.evidence_url || ''
		};
		showAuditModal = true;
	}

	async function handleSaveAudit() {
		if (!selectedIACItem) return;
		isActionLoading = true;
		errorMsg = null;
		try {
			await auditIACItem(selectedIACItem.id, {
				compliance_status: auditForm.compliance_status,
				findings: auditForm.findings || undefined,
				evidence_url: auditForm.evidence_url || undefined
			});
			successMsg = 'IAC compliance audit item verified and updated.';
			showAuditModal = false;
			await loadAllData();
		} catch (err: any) {
			errorMsg = err.message || 'Failed to save audit checklist item';
		} finally {
			isActionLoading = false;
		}
	}

	onMount(() => {
		loadAllData();
	});
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
		<div>
			<h1 class="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
				<span class="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</span>
				Legalities, Risk Register & IAC Compliance
			</h1>
			<p class="text-sm text-muted-foreground mt-1">
				Operational risk matrix (1–25), Internal Audit Committee checklists, and verified legal document repository.
			</p>
		</div>

		<!-- Nav Tabs -->
		<div class="inline-flex rounded-lg bg-muted/50 p-1 border border-border text-xs">
			<button
				type="button"
				class="px-3 py-1.5 rounded-md font-medium transition-colors {activeTab === 'RISKS' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (activeTab = 'RISKS')}
			>
				Risk Register ({risks.length})
			</button>
			<button
				type="button"
				class="px-3 py-1.5 rounded-md font-medium transition-colors {activeTab === 'IAC' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (activeTab = 'IAC')}
			>
				IAC Audit Checklist ({iacItems.length})
			</button>
			<button
				type="button"
				class="px-3 py-1.5 rounded-md font-medium transition-colors {activeTab === 'VAULT' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (activeTab = 'VAULT')}
			>
				Document Vault ({documents.length})
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

	{#if isLoading}
		<div class="p-12 text-center text-sm text-muted-foreground">Loading legal & compliance records...</div>
	{:else if activeTab === 'RISKS'}
		<!-- Risk Register Tab -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-base font-bold text-foreground">Operational Risk Register (5×5 Matrix)</h2>
					<p class="text-xs text-muted-foreground">Severity Score = Probability (1–5) × Impact (1–5). Monitored across all exchange modalities.</p>
				</div>
				<button
					type="button"
					class="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow"
					onclick={() => (showRiskModal = true)}
				>
					+ Record Operational Risk
				</button>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#if risks.length === 0}
					<div class="col-span-3 p-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
						No operational risks recorded. Use "+ Record Operational Risk" to log potential failure points.
					</div>
				{:else}
					{#each risks as r}
						<div class="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm flex flex-col justify-between">
							<div>
								<div class="flex items-start justify-between gap-2 mb-2">
									<span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
										{r.risk_category}
									</span>
									<span class="text-xs font-mono font-extrabold px-2 py-0.5 rounded border {r.severity_score >= 15 ? 'bg-red-500/10 text-red-500 border-red-500/20' : r.severity_score >= 10 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}">
										Score: {r.severity_score} / 25
									</span>
								</div>

								<h3 class="text-sm font-bold text-foreground leading-snug">{r.title}</h3>
								<p class="text-xs text-muted-foreground mt-1">{r.description}</p>

								<div class="mt-3 p-2.5 rounded-lg bg-muted/30 border border-border/40 text-xs space-y-1">
									<div class="font-semibold text-foreground">Mitigation Plan:</div>
									<div class="text-muted-foreground text-[11px]">{r.mitigation_plan}</div>
								</div>
							</div>

							<div class="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
								<span class="text-muted-foreground">P: {r.probability} | I: {r.impact}</span>
								<span class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase border {r.status === 'CLOSED' ? 'bg-muted text-muted-foreground border-border' : r.status === 'MITIGATING' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}">
									{r.status}
								</span>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{:else if activeTab === 'IAC'}
		<!-- IAC Audit Checklist Tab -->
		<div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
			<div class="p-4 border-b border-border/40">
				<h2 class="text-base font-bold text-foreground">Internal Audit Committee (IAC) Compliance Items</h2>
				<p class="text-xs text-muted-foreground">Mandatory audit checkpoints required for national entity compliance certification.</p>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="bg-muted/40 text-muted-foreground uppercase font-semibold border-b border-border/40">
						<tr>
							<th class="p-3">Check Item</th>
							<th class="p-3">Category</th>
							<th class="p-3">Cycle</th>
							<th class="p-3">Mandatory</th>
							<th class="p-3">Compliance Status</th>
							<th class="p-3">Findings</th>
							<th class="p-3 text-right">Audit Action</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border/40">
						{#if iacItems.length === 0}
							<tr>
								<td colspan="7" class="p-8 text-center text-muted-foreground">No IAC audit items registered.</td>
							</tr>
						{:else}
							{#each iacItems as item}
								<tr class="hover:bg-muted/20 transition-colors">
									<td class="p-3 font-semibold text-foreground">{item.check_item}</td>
									<td class="p-3 text-muted-foreground">{item.category}</td>
									<td class="p-3 font-mono text-muted-foreground">{item.audit_cycle}</td>
									<td class="p-3">
										{#if item.is_mandatory}
											<span class="text-red-500 font-bold uppercase text-[10px]">YES</span>
										{:else}
											<span class="text-muted-foreground text-[10px]">NO</span>
										{/if}
									</td>
									<td class="p-3">
										<span class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase border {item.compliance_status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : item.compliance_status === 'FLAGGED_NON_COMPLIANT' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}">
											{item.compliance_status}
										</span>
									</td>
									<td class="p-3 text-muted-foreground max-w-xs truncate">{item.findings || '—'}</td>
									<td class="p-3 text-right">
										<button
											type="button"
											class="px-2.5 py-1 rounded border border-border bg-muted/40 hover:bg-muted text-[11px] font-medium text-foreground"
											onclick={() => openAuditModal(item)}
										>
											Audit / Verify
										</button>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	{:else}
		<!-- Document Vault Tab -->
		<div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
			<div class="p-4 border-b border-border/40">
				<h2 class="text-base font-bold text-foreground">Verified Legal Document Vault</h2>
				<p class="text-xs text-muted-foreground">Signed partner contracts, bilateral MOUs, EP insurance policies, and visa documents.</p>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="bg-muted/40 text-muted-foreground uppercase font-semibold border-b border-border/40">
						<tr>
							<th class="p-3">Document Title</th>
							<th class="p-3">Category</th>
							<th class="p-3">Valid From</th>
							<th class="p-3">Valid Until</th>
							<th class="p-3">Signed</th>
							<th class="p-3 text-right">File Link</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border/40">
						{#if documents.length === 0}
							<tr>
								<td colspan="6" class="p-8 text-center text-muted-foreground">No documents uploaded to vault.</td>
							</tr>
						{:else}
							{#each documents as doc}
								<tr class="hover:bg-muted/20 transition-colors">
									<td class="p-3 font-semibold text-foreground">{doc.title}</td>
									<td class="p-3 text-muted-foreground">{doc.document_category}</td>
									<td class="p-3 text-muted-foreground">{doc.valid_from}</td>
									<td class="p-3 text-muted-foreground">{doc.valid_until || 'Indefinite'}</td>
									<td class="p-3">
										<span class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase border {doc.is_signed ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}">
											{doc.is_signed ? 'SIGNED' : 'DRAFT'}
										</span>
									</td>
									<td class="p-3 text-right">
										<a
											href={doc.file_url}
											target="_blank"
											rel="noopener noreferrer"
											class="text-primary hover:underline font-mono text-[11px]"
										>
											View Document &rarr;
										</a>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<!-- Modal: Record Risk -->
{#if showRiskModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
		<div class="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
			<div class="flex items-center justify-between border-b border-border/40 pb-3">
				<h3 class="text-base font-bold text-foreground">Record Operational Risk</h3>
				<button class="text-muted-foreground hover:text-foreground" onclick={() => (showRiskModal = false)}>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
				</button>
			</div>

			<form onsubmit={(e) => { e.preventDefault(); handleCreateRisk(); }} class="space-y-4 text-sm">
				<div>
					<label for="risk-cat" class="block text-xs font-medium text-muted-foreground mb-1">Risk Category</label>
					<select
						id="risk-cat"
						class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						bind:value={riskForm.risk_category}
					>
						<option value="LEGAL">Legal & Regulatory</option>
						<option value="HEALTH_SAFETY">Health & Safety</option>
						<option value="FINANCIAL">Financial & Receivables</option>
						<option value="PARTNER_RELATIONS">Partner Relations</option>
						<option value="REPUTATION">Reputation</option>
					</select>
				</div>

				<div>
					<label for="risk-title" class="block text-xs font-medium text-muted-foreground mb-1">Risk Title</label>
					<input
						id="risk-title"
						type="text"
						placeholder="e.g. Visa Extension Delay at Bureau"
						class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						bind:value={riskForm.title}
						required
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="risk-prob" class="block text-xs font-medium text-muted-foreground mb-1">Probability (1–5)</label>
						<input
							id="risk-prob"
							type="number"
							min="1"
							max="5"
							class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
							bind:value={riskForm.probability}
							required
						/>
					</div>
					<div>
						<label for="risk-impact" class="block text-xs font-medium text-muted-foreground mb-1">Impact (1–5)</label>
						<input
							id="risk-impact"
							type="number"
							min="1"
							max="5"
							class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
							bind:value={riskForm.impact}
							required
						/>
					</div>
				</div>

				<div>
					<label for="risk-mit" class="block text-xs font-medium text-muted-foreground mb-1">Mitigation Plan</label>
					<textarea
						id="risk-mit"
						rows="2"
						placeholder="Actions taken to prevent or minimize occurrence..."
						class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						bind:value={riskForm.mitigation_plan}
						required
					></textarea>
				</div>

				<div class="pt-2 flex justify-end gap-2 border-t border-border/40">
					<button
						type="button"
						class="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted"
						onclick={() => (showRiskModal = false)}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow"
						disabled={isActionLoading}
					>
						{isActionLoading ? 'Saving...' : 'Save Risk'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Modal: Audit IAC Item -->
{#if showAuditModal && selectedIACItem}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
		<div class="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
			<div class="flex items-center justify-between border-b border-border/40 pb-3">
				<div>
					<h3 class="text-base font-bold text-foreground">Audit Checklist Item</h3>
					<span class="text-xs text-muted-foreground">{selectedIACItem.check_item}</span>
				</div>
				<button class="text-muted-foreground hover:text-foreground" onclick={() => (showAuditModal = false)}>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
				</button>
			</div>

			<form onsubmit={(e) => { e.preventDefault(); handleSaveAudit(); }} class="space-y-4 text-sm">
				<div>
					<label for="audit-status" class="block text-xs font-medium text-muted-foreground mb-1">Compliance Status</label>
					<select
						id="audit-status"
						class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						bind:value={auditForm.compliance_status}
					>
						<option value="VERIFIED">Verified & Compliant</option>
						<option value="FLAGGED_NON_COMPLIANT">Flagged Non-Compliant</option>
						<option value="PENDING_AUDIT">Pending Additional Proof</option>
					</select>
				</div>

				<div>
					<label for="audit-findings" class="block text-xs font-medium text-muted-foreground mb-1">Auditor Findings / Observations</label>
					<textarea
						id="audit-findings"
						rows="3"
						placeholder="Detailed auditor verification notes or corrective actions required..."
						class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						bind:value={auditForm.findings}
					></textarea>
				</div>

				<div class="pt-2 flex justify-end gap-2 border-t border-border/40">
					<button
						type="button"
						class="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted"
						onclick={() => (showAuditModal = false)}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow"
						disabled={isActionLoading}
					>
						{isActionLoading ? 'Saving...' : 'Update Audit Status'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
