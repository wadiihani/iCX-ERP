<script lang="ts">
	import { onMount } from 'svelte';
	import {
		fetchPricingRules,
		calculatePricing,
		fetchPaymentObligations,
		recordPayment,
		fetchFinancialCases,
		submitFinancialCase,
		reviewFinancialCase,
		type PricingRuleSet,
		type PricingCalculationResult,
		type PaymentObligation,
		type FinancialCase
	} from '$lib/api/finance';

	// Svelte 5 runes
	let activeTab = $state<'CALCULATOR' | 'OBLIGATIONS' | 'APPROVALS'>('CALCULATOR');
	let rulesets = $state<PricingRuleSet[]>([]);
	let obligations = $state<PaymentObligation[]>([]);
	let cases = $state<FinancialCase[]>([]);

	let isLoading = $state(true);
	let isActionLoading = $state(false);
	let errorMsg = $state<string | null>(null);
	let successMsg = $state<string | null>(null);

	// Calculator state
	let selectedRuleId = $state('');
	let calcDuration = $state(12);
	let calcTrainees = $state(1);
	let calcModality = $state<'PHYSICAL' | 'PARTLY_REMOTE' | 'FULLY_REMOTE'>('PHYSICAL');
	let calcNotes = $state('');
	let calcResult = $state<PricingCalculationResult | null>(null);

	// Record payment modal
	let showPaymentModal = $state(false);
	let selectedObligation = $state<PaymentObligation | null>(null);
	let paymentForm = $state({
		amount_paid: 0,
		payment_method: 'BANK_TRANSFER',
		transaction_reference: '',
		receipt_doc_url: '',
		notes: ''
	});

	// Request waiver modal
	let showCaseModal = $state(false);
	let caseForm = $state({
		case_type: 'FEE_WAIVER' as 'FEE_WAIVER' | 'DISCOUNT_REQUEST' | 'REFUND' | 'ANNEX_2_PENALTY',
		obligation_id: '',
		requested_amount: 0,
		reason: ''
	});

	const selectedRule = $derived(
		rulesets.find((r) => r.id === selectedRuleId) || null
	);

	async function loadAllData() {
		isLoading = true;
		errorMsg = null;
		try {
			const [rules, obs, cses] = await Promise.all([
				fetchPricingRules().catch(() => []),
				fetchPaymentObligations().catch(() => []),
				fetchFinancialCases().catch(() => [])
			]);
			rulesets = rules;
			obligations = obs;
			cases = cses;
			if (rules.length > 0 && !selectedRuleId) {
				selectedRuleId = rules[0].id;
			}
		} catch (err: any) {
			errorMsg = err.message || 'Failed to load financial records';
		} finally {
			isLoading = false;
		}
	}

	async function handleCalculate() {
		if (!selectedRuleId) return;
		isActionLoading = true;
		errorMsg = null;
		try {
			const res = await calculatePricing({
				rule_set_id: selectedRuleId,
				duration_weeks: calcDuration,
				modality: calcModality,
				num_trainees: calcTrainees,
				notes: calcNotes || undefined
			});
			calcResult = res;
		} catch (err: any) {
			errorMsg = err.message || 'Pricing calculation failed';
		} finally {
			isActionLoading = false;
		}
	}

	function openPaymentModal(ob: PaymentObligation) {
		selectedObligation = ob;
		paymentForm = {
			amount_paid: Number(ob.expected_amount) - Number(ob.paid_amount),
			payment_method: 'BANK_TRANSFER',
			transaction_reference: '',
			receipt_doc_url: '',
			notes: ''
		};
		showPaymentModal = true;
	}

	async function handleRecordPayment() {
		if (!selectedObligation) return;
		isActionLoading = true;
		errorMsg = null;
		try {
			await recordPayment({
				obligation_id: selectedObligation.id,
				amount_paid: Number(paymentForm.amount_paid),
				payment_method: paymentForm.payment_method,
				transaction_reference: paymentForm.transaction_reference,
				receipt_doc_url: paymentForm.receipt_doc_url || undefined,
				notes: paymentForm.notes || undefined
			});
			successMsg = 'Payment recorded and balance reconciled successfully.';
			showPaymentModal = false;
			await loadAllData();
		} catch (err: any) {
			errorMsg = err.message || 'Failed to record payment';
		} finally {
			isActionLoading = false;
		}
	}

	async function handleSubmitCase() {
		isActionLoading = true;
		errorMsg = null;
		try {
			await submitFinancialCase({
				case_type: caseForm.case_type,
				obligation_id: caseForm.obligation_id || undefined,
				requested_amount: Number(caseForm.requested_amount),
				reason: caseForm.reason
			});
			successMsg = 'Financial case submitted to executive approval queue.';
			showCaseModal = false;
			await loadAllData();
		} catch (err: any) {
			errorMsg = err.message || 'Failed to submit financial case';
		} finally {
			isActionLoading = false;
		}
	}

	async function handleReviewCase(caseId: string, statusVerdict: 'APPROVED' | 'REJECTED') {
		isActionLoading = true;
		errorMsg = null;
		try {
			await reviewFinancialCase(caseId, {
				status: statusVerdict,
				review_notes: `Processed by LCVP Finance via Command Center on ${new Date().toISOString().slice(0, 10)}`
			});
			successMsg = `Case marked as ${statusVerdict}.`;
			await loadAllData();
		} catch (err: any) {
			errorMsg = err.message || 'Failed to review financial case';
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
				<span class="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</span>
				Operational Finance & Pricing Engine
			</h1>
			<p class="text-sm text-muted-foreground mt-1">
				Deterministic pricing calculators, payment milestone tracking, receipts, and human-in-the-loop financial approval queues.
			</p>
		</div>

		<!-- Nav Tabs -->
		<div class="inline-flex rounded-lg bg-muted/50 p-1 border border-border text-xs">
			<button
				type="button"
				class="px-3 py-1.5 rounded-md font-medium transition-colors {activeTab === 'CALCULATOR' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (activeTab = 'CALCULATOR')}
			>
				Pricing Calculator
			</button>
			<button
				type="button"
				class="px-3 py-1.5 rounded-md font-medium transition-colors {activeTab === 'OBLIGATIONS' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (activeTab = 'OBLIGATIONS')}
			>
				Milestones & Receipts ({obligations.length})
			</button>
			<button
				type="button"
				class="px-3 py-1.5 rounded-md font-medium transition-colors {activeTab === 'APPROVALS' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (activeTab = 'APPROVALS')}
			>
				Approval Queue ({cases.filter((c) => c.status === 'PENDING_APPROVAL').length})
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
		<div class="p-12 text-center text-sm text-muted-foreground">Loading finance records...</div>
	{:else if activeTab === 'CALCULATOR'}
		<!-- Pricing Calculator Tab -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Calculator Input Form -->
			<div class="lg:col-span-2 rounded-xl border border-border bg-card p-6 space-y-5 shadow-sm">
				<div>
					<h2 class="text-base font-bold text-foreground">Opportunity Pricing Calculator</h2>
					<p class="text-xs text-muted-foreground mt-0.5">
						Deterministic value-based calculation configured according to official AIESEC in Rabat fee tiers.
					</p>
				</div>

				<div class="space-y-4 text-sm">
					<div>
						<label for="rule-select" class="block text-xs font-semibold uppercase text-muted-foreground mb-1">Pricing Rule Set</label>
						<select
							id="rule-select"
							class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
							bind:value={selectedRuleId}
						>
							{#each rulesets as r}
								<option value={r.id}>
									{r.rule_name} — {r.product_type} (Base: {r.base_fee} {r.currency})
								</option>
							{/each}
						</select>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label for="calc-dur" class="block text-xs font-semibold uppercase text-muted-foreground mb-1">Duration (Weeks)</label>
							<input
								id="calc-dur"
								type="number"
								min="6"
								max="78"
								class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
								bind:value={calcDuration}
							/>
							{#if selectedRule}
								<span class="text-[11px] text-muted-foreground">
									Allowed: {selectedRule.min_duration_weeks} – {selectedRule.max_duration_weeks} weeks
								</span>
							{/if}
						</div>

						<div>
							<label for="calc-trainees" class="block text-xs font-semibold uppercase text-muted-foreground mb-1">Number of Trainees / EPs</label>
							<input
								id="calc-trainees"
								type="number"
								min="1"
								max="20"
								class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
								bind:value={calcTrainees}
							/>
						</div>
					</div>

					<div>
						<label for="calc-mod" class="block text-xs font-semibold uppercase text-muted-foreground mb-1">Opportunity Modality</label>
						<select
							id="calc-mod"
							class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
							bind:value={calcModality}
						>
							<option value="PHYSICAL">Physical Delivery (Standard)</option>
							<option value="PARTLY_REMOTE">Partly Remote</option>
							<option value="FULLY_REMOTE">Fully Remote</option>
						</select>
					</div>

					<div class="pt-2">
						<button
							type="button"
							class="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow transition-all"
							onclick={handleCalculate}
							disabled={isActionLoading}
						>
							{isActionLoading ? 'Calculating...' : 'Calculate Fee Breakdown'}
						</button>
					</div>
				</div>
			</div>

			<!-- Live Calculation Result Card -->
			<div class="rounded-xl border border-border bg-card p-6 flex flex-col justify-between shadow-sm">
				<div>
					<h2 class="text-base font-bold text-foreground pb-2 border-b border-border/40">Fee Breakdown</h2>

					{#if calcResult}
						<div class="mt-4 space-y-3 text-sm">
							<div class="flex justify-between items-center text-muted-foreground">
								<span>Base Subtotal</span>
								<span class="font-mono font-medium text-foreground">{calcResult.base_subtotal} {calcResult.currency}</span>
							</div>
							<div class="flex justify-between items-center text-muted-foreground">
								<span>Additional Duration ({Math.max(0, calcDuration - (selectedRule?.min_duration_weeks || 6))} wks)</span>
								<span class="font-mono font-medium text-foreground">{calcResult.additional_duration_cost} {calcResult.currency}</span>
							</div>
							<div class="flex justify-between items-center text-muted-foreground">
								<span>Administrative Setup Fee</span>
								<span class="font-mono font-medium text-foreground">{calcResult.administrative_fee} {calcResult.currency}</span>
							</div>
							{#if Number(calcResult.discount_applied) > 0}
								<div class="flex justify-between items-center text-emerald-500 font-medium">
									<span>Long-term Tier Discount</span>
									<span class="font-mono">-{calcResult.discount_applied} {calcResult.currency}</span>
								</div>
							{/if}

							<div class="pt-4 border-t border-border/60 flex justify-between items-baseline">
								<div>
									<span class="text-xs uppercase font-bold text-muted-foreground block">Total Invoice Fee</span>
									<span class="text-[11px] text-muted-foreground">Net of VAT / Deductions</span>
								</div>
								<div class="text-2xl font-mono font-extrabold text-primary">
									{calcResult.total_calculated_fee} <span class="text-sm font-normal text-muted-foreground">{calcResult.currency}</span>
								</div>
							</div>
						</div>
					{:else}
						<div class="py-12 text-center text-muted-foreground text-xs">
							Click "Calculate Fee Breakdown" to evaluate pricing for the selected parameters.
						</div>
					{/if}
				</div>

				<div class="mt-6 p-3 rounded-lg bg-muted/40 border border-border/40 text-[11px] text-muted-foreground">
					<strong>Rule Invariant:</strong> All pricing calculations are evaluated deterministically in pure code. Zero LLM hallucinations or unauthorized fee overrides.
				</div>
			</div>
		</div>
	{:else if activeTab === 'OBLIGATIONS'}
		<!-- Payment Obligations & Milestones Tab -->
		<div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
			<div class="p-4 border-b border-border/40 flex items-center justify-between">
				<div>
					<h2 class="text-base font-bold text-foreground">Payment Obligations & Milestones</h2>
					<p class="text-xs text-muted-foreground">Track contract fee milestones, expected due dates, and verified receipts.</p>
				</div>
				<button
					type="button"
					class="px-3.5 py-1.5 rounded-lg border border-border bg-muted/30 hover:bg-muted text-xs font-medium text-foreground"
					onclick={() => (showCaseModal = true)}
				>
					+ Request Fee Waiver
				</button>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="bg-muted/40 text-muted-foreground uppercase font-semibold border-b border-border/40">
						<tr>
							<th class="p-3">Milestone Title</th>
							<th class="p-3">Trigger</th>
							<th class="p-3">Expected</th>
							<th class="p-3">Paid Amount</th>
							<th class="p-3">Due Date</th>
							<th class="p-3">Status</th>
							<th class="p-3 text-right">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border/40">
						{#if obligations.length === 0}
							<tr>
								<td colspan="7" class="p-8 text-center text-muted-foreground">No payment obligations recorded yet.</td>
							</tr>
						{:else}
							{#each obligations as ob}
								<tr class="hover:bg-muted/20 transition-colors">
									<td class="p-3 font-medium text-foreground">{ob.obligation_title}</td>
									<td class="p-3 font-mono text-muted-foreground">{ob.milestone_trigger}</td>
									<td class="p-3 font-mono font-bold text-foreground">{ob.expected_amount} {ob.currency}</td>
									<td class="p-3 font-mono {Number(ob.paid_amount) >= Number(ob.expected_amount) ? 'text-emerald-500 font-bold' : 'text-muted-foreground'}">
										{ob.paid_amount} {ob.currency}
									</td>
									<td class="p-3 text-muted-foreground">{ob.due_date}</td>
									<td class="p-3">
										<span class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase border {ob.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ob.status === 'WAIVED' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : ob.status === 'PARTIALLY_PAID' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}">
											{ob.status}
										</span>
									</td>
									<td class="p-3 text-right">
										{#if ob.status !== 'PAID' && ob.status !== 'WAIVED'}
											<button
												type="button"
												class="px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-[11px] font-medium"
												onclick={() => openPaymentModal(ob)}
											>
												Record Payment
											</button>
										{:else}
											<span class="text-muted-foreground text-[11px]">Reconciled</span>
										{/if}
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	{:else}
		<!-- Financial Approval Queue Tab -->
		<div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
			<div class="p-4 border-b border-border/40">
				<h2 class="text-base font-bold text-foreground">Executive Financial Approval Queue</h2>
				<p class="text-xs text-muted-foreground">Gated approval authority for fee waivers, refunds, and partner discount requests.</p>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="bg-muted/40 text-muted-foreground uppercase font-semibold border-b border-border/40">
						<tr>
							<th class="p-3">Case Type</th>
							<th class="p-3">Requested Amount</th>
							<th class="p-3">Reason / Justification</th>
							<th class="p-3">Status</th>
							<th class="p-3">Submitted</th>
							<th class="p-3 text-right">Review Action</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border/40">
						{#if cases.length === 0}
							<tr>
								<td colspan="6" class="p-8 text-center text-muted-foreground">No financial cases submitted.</td>
							</tr>
						{:else}
							{#each cases as c}
								<tr class="hover:bg-muted/20 transition-colors">
									<td class="p-3 font-semibold text-foreground">{c.case_type}</td>
									<td class="p-3 font-mono font-bold text-primary">{c.requested_amount} {c.currency}</td>
									<td class="p-3 text-muted-foreground max-w-xs truncate" title={c.reason}>{c.reason}</td>
									<td class="p-3">
										<span class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase border {c.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : c.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}">
											{c.status}
										</span>
									</td>
									<td class="p-3 text-muted-foreground">{c.created_at.slice(0, 10)}</td>
									<td class="p-3 text-right space-x-1">
										{#if c.status === 'PENDING_APPROVAL'}
											<button
												type="button"
												class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold"
												onclick={() => handleReviewCase(c.id, 'APPROVED')}
											>
												Approve
											</button>
											<button
												type="button"
												class="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[11px] font-semibold"
												onclick={() => handleReviewCase(c.id, 'REJECTED')}
											>
												Reject
											</button>
										{:else}
											<span class="text-muted-foreground text-[11px]">Reviewed</span>
										{/if}
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

<!-- Modal: Record Payment -->
{#if showPaymentModal && selectedObligation}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
		<div class="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
			<div class="flex items-center justify-between border-b border-border/40 pb-3">
				<div>
					<h3 class="text-base font-bold text-foreground">Record Incoming Payment</h3>
					<span class="text-xs text-muted-foreground">{selectedObligation.obligation_title}</span>
				</div>
				<button class="text-muted-foreground hover:text-foreground" onclick={() => (showPaymentModal = false)}>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
				</button>
			</div>

			<form onsubmit={(e) => { e.preventDefault(); handleRecordPayment(); }} class="space-y-4 text-sm">
				<div>
					<label for="pay-amount" class="block text-xs font-medium text-muted-foreground mb-1">Amount Paid ({selectedObligation.currency})</label>
					<input
						id="pay-amount"
						type="number"
						step="0.01"
						class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						bind:value={paymentForm.amount_paid}
						required
					/>
				</div>

				<div>
					<label for="pay-ref" class="block text-xs font-medium text-muted-foreground mb-1">Transaction Reference / Check #</label>
					<input
						id="pay-ref"
						type="text"
						placeholder="BMCE-TRX-123456"
						class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						bind:value={paymentForm.transaction_reference}
						required
					/>
				</div>

				<div>
					<label for="pay-doc" class="block text-xs font-medium text-muted-foreground mb-1">Receipt URL / Bank Slip Link</label>
					<input
						id="pay-doc"
						type="url"
						placeholder="https://drive.google.com/..."
						class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						bind:value={paymentForm.receipt_doc_url}
					/>
				</div>

				<div class="pt-2 flex justify-end gap-2 border-t border-border/40">
					<button
						type="button"
						class="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted"
						onclick={() => (showPaymentModal = false)}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow"
						disabled={isActionLoading}
					>
						{isActionLoading ? 'Saving...' : 'Confirm Payment'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Modal: Request Fee Waiver / Refund -->
{#if showCaseModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
		<div class="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
			<div class="flex items-center justify-between border-b border-border/40 pb-3">
				<h3 class="text-base font-bold text-foreground">Submit Financial Request</h3>
				<button class="text-muted-foreground hover:text-foreground" onclick={() => (showCaseModal = false)}>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
				</button>
			</div>

			<form onsubmit={(e) => { e.preventDefault(); handleSubmitCase(); }} class="space-y-4 text-sm">
				<div>
					<label for="case-type" class="block text-xs font-medium text-muted-foreground mb-1">Request Type</label>
					<select
						id="case-type"
						class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						bind:value={caseForm.case_type}
					>
						<option value="FEE_WAIVER">Fee Waiver (100% subsidy)</option>
						<option value="DISCOUNT_REQUEST">Special Partner Discount</option>
						<option value="REFUND">Refund Disbursement</option>
						<option value="ANNEX_2_PENALTY">Annex 2 Financial Penalty</option>
					</select>
				</div>

				<div>
					<label for="case-amount" class="block text-xs font-medium text-muted-foreground mb-1">Requested Amount (MAD)</label>
					<input
						id="case-amount"
						type="number"
						step="0.01"
						class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						bind:value={caseForm.requested_amount}
						required
					/>
				</div>

				<div>
					<label for="case-reason" class="block text-xs font-medium text-muted-foreground mb-1">Justification & Policy Rationale</label>
					<textarea
						id="case-reason"
						rows="3"
						placeholder="Explain contract terms, board approvals, or extenuating partner circumstances..."
						class="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						bind:value={caseForm.reason}
						required
					></textarea>
				</div>

				<div class="pt-2 flex justify-end gap-2 border-t border-border/40">
					<button
						type="button"
						class="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted"
						onclick={() => (showCaseModal = false)}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow"
						disabled={isActionLoading}
					>
						{isActionLoading ? 'Submitting...' : 'Submit to Queue'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
