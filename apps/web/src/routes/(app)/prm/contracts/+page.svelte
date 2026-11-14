<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getContracts,
		getExpiringAlerts,
		getRisks,
		createRisk,
		getOrganizations,
		type Contract,
		type OperationalRisk,
		type Organization,
	} from '$lib/api/prm';

	let contracts = $state<Contract[]>([]);
	let expiringAlerts = $state<Contract[]>([]);
	let risks = $state<OperationalRisk[]>([]);
	let organizations = $state<Organization[]>([]);
	let isLoading = $state(true);
	let errorMsg = $state<string | null>(null);
	let showRiskModal = $state(false);

	let newRisk = $state({
		title: '',
		organization_id: '',
		category: 'FINANCIAL' as const,
		probability: 3,
		impact: 4,
		mitigation_plan: '',
		status: 'OPEN' as const,
	});

	async function loadContractsAndRisks() {
		isLoading = true;
		errorMsg = null;
		try {
			const [cData, aData, rData, oData] = await Promise.all([
				getContracts(),
				getExpiringAlerts(),
				getRisks(),
				getOrganizations(),
			]);
			contracts = cData;
			expiringAlerts = aData;
			risks = rData;
			organizations = oData;
			if (oData.length > 0 && !newRisk.organization_id) {
				newRisk.organization_id = oData[0].id;
			}
		} catch (err: any) {
			errorMsg = err.message || 'Failed to load contracts data';
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		loadContractsAndRisks();
	});

	async function handleCreateRisk() {
		if (!newRisk.title || !newRisk.mitigation_plan) {
			alert('Please enter risk title and mitigation plan');
			return;
		}
		try {
			await createRisk({
				title: newRisk.title,
				organization_id: newRisk.organization_id || undefined,
				category: newRisk.category,
				probability: Number(newRisk.probability),
				impact: Number(newRisk.impact),
				mitigation_plan: newRisk.mitigation_plan,
				status: newRisk.status,
			});
			showRiskModal = false;
			await loadContractsAndRisks();
		} catch (err: any) {
			alert(err.message || 'Failed to record risk');
		}
	}

	function getRiskScoreColor(score: number) {
		if (score >= 15) return 'bg-red-500/20 text-red-400 border-red-500/30';
		if (score >= 9) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
		return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
	}
</script>

<svelte:head>
	<title>Contracts & Risk Register — iCX Command Center</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold tracking-tight text-zinc-100">Contracts & Legalities</h1>
			<p class="text-sm text-zinc-400">Track active partner agreements, expiration alerts, IAC audit readiness, and operational risks.</p>
		</div>
		<button
			onclick={() => showRiskModal = true}
			class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors shadow-sm self-start sm:self-auto"
		>
			<svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
			</svg>
			Log Operational Risk
		</button>
	</div>

	<!-- Expiry Alerts Banner -->
	{#if expiringAlerts.length > 0}
		<div class="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20">
			<div class="flex items-center gap-2 text-sm font-semibold text-amber-400 mb-2">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>
				Contract Expiry Warning ({expiringAlerts.length} Active Contracts Requiring Attention)
			</div>
			<div class="space-y-2">
				{#each expiringAlerts as alert}
					<div class="flex items-center justify-between text-xs p-2.5 rounded-lg bg-zinc-900 border border-amber-500/20">
						<div>
							<span class="font-mono font-bold text-zinc-200">{alert.contract_number}</span> — {alert.title}
							<span class="text-zinc-500 ml-2">({alert.organization_name || 'Organization'})</span>
						</div>
						<div>
							{#if alert.is_expired}
								<span class="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">EXPIRED</span>
							{:else}
								<span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
									Expires in {alert.days_to_expiry} days ({alert.end_date})
								</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Section 1: Contracts Repository -->
	<div class="space-y-3">
		<h2 class="text-lg font-semibold text-zinc-200 flex items-center gap-2">
			<svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
			</svg>
			Contracts & Agreements Repository
		</h2>

		<div class="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm text-zinc-300">
					<thead class="bg-zinc-900/80 text-xs uppercase font-medium text-zinc-400 border-b border-zinc-800">
						<tr>
							<th class="py-3 px-4">Contract #</th>
							<th class="py-3 px-4">Title & Partner</th>
							<th class="py-3 px-4">Products</th>
							<th class="py-3 px-4">Validity</th>
							<th class="py-3 px-4">Slots</th>
							<th class="py-3 px-4">IAC Audit</th>
							<th class="py-3 px-4">Status</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-zinc-800/60">
						{#if isLoading}
							<tr>
								<td colspan="7" class="py-8 text-center text-zinc-500">Loading contracts...</td>
							</tr>
						{:else if contracts.length === 0}
							<tr>
								<td colspan="7" class="py-8 text-center text-zinc-500">No contracts registered yet.</td>
							</tr>
						{:else}
							{#each contracts as ctr}
								<tr class="hover:bg-zinc-800/30 transition-colors">
									<td class="py-3 px-4 font-mono font-medium text-blue-400 text-xs">
										{ctr.contract_number}
										<div class="text-[10px] text-zinc-500 font-sans">v{ctr.version}</div>
									</td>
									<td class="py-3 px-4">
										<div class="font-medium text-zinc-200 text-xs">{ctr.title}</div>
										<div class="text-[11px] text-zinc-500">{ctr.organization_name || 'Organization'}</div>
									</td>
									<td class="py-3 px-4">
										<div class="flex gap-1 flex-wrap">
											{#each ctr.product_types as p}
												<span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
													{p}
												</span>
											{/each}
										</div>
									</td>
									<td class="py-3 px-4 text-xs font-mono text-zinc-400">
										{ctr.start_date} → {ctr.end_date}
									</td>
									<td class="py-3 px-4 text-xs font-medium text-zinc-200">
										{ctr.total_slots}
									</td>
									<td class="py-3 px-4 text-xs">
										{#if ctr.iac_audit_ready}
											<span class="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
												✓ Ready
											</span>
										{:else}
											<span class="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500">
												○ Pending
											</span>
										{/if}
									</td>
									<td class="py-3 px-4">
										<span class="text-[10px] font-mono px-2 py-0.5 rounded-full {ctr.status === 'SIGNED' || ctr.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'}">
											{ctr.status}
										</span>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>

	<!-- Section 2: Operational Risk Register (FNL-05) -->
	<div class="space-y-3 pt-4 border-t border-zinc-800">
		<h2 class="text-lg font-semibold text-zinc-200 flex items-center gap-2">
			<svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
			</svg>
			Operational Risk Register (FNL-05)
		</h2>

		<div class="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm text-zinc-300">
					<thead class="bg-zinc-900/80 text-xs uppercase font-medium text-zinc-400 border-b border-zinc-800">
						<tr>
							<th class="py-3 px-4">Risk Item</th>
							<th class="py-3 px-4">Category</th>
							<th class="py-3 px-4">Prob. (1-5)</th>
							<th class="py-3 px-4">Impact (1-5)</th>
							<th class="py-3 px-4">Score</th>
							<th class="py-3 px-4">Mitigation Strategy</th>
							<th class="py-3 px-4">Status</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-zinc-800/60">
						{#if risks.length === 0}
							<tr>
								<td colspan="7" class="py-6 text-center text-zinc-500">No operational risks logged.</td>
							</tr>
						{:else}
							{#each risks as risk}
								<tr class="hover:bg-zinc-800/30 transition-colors">
									<td class="py-3 px-4 text-xs font-medium text-zinc-200">{risk.title}</td>
									<td class="py-3 px-4 text-xs text-zinc-400">{risk.category}</td>
									<td class="py-3 px-4 text-xs font-mono text-zinc-400">{risk.probability}</td>
									<td class="py-3 px-4 text-xs font-mono text-zinc-400">{risk.impact}</td>
									<td class="py-3 px-4">
										<span class={`text-[11px] font-mono px-2 py-0.5 rounded border ${getRiskScoreColor(risk.score)}`}>
											{risk.score} / 25
										</span>
									</td>
									<td class="py-3 px-4 text-xs text-zinc-400 max-w-xs truncate" title={risk.mitigation_plan}>
										{risk.mitigation_plan}
									</td>
									<td class="py-3 px-4 text-xs">
										<span class="text-[10px] font-mono px-2 py-0.5 rounded-full {risk.status === 'MITIGATED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-300'}">
											{risk.status}
										</span>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>

	<!-- Log Risk Modal -->
	{#if showRiskModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div class="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-4">
				<div class="flex items-center justify-between border-b border-zinc-800 pb-3">
					<h3 class="text-lg font-bold text-zinc-100">Log Operational Risk</h3>
					<button onclick={() => showRiskModal = false} class="text-zinc-400 hover:text-zinc-200">✕</button>
				</div>

				<div class="space-y-3 text-xs">
					<div>
						<label class="block font-medium text-zinc-300 mb-1">Risk Title *</label>
						<input
							type="text"
							bind:value={newRisk.title}
							placeholder="e.g. Partner Late Payment or Visa Delay"
							class="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-200"
						/>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<div>
							<label class="block font-medium text-zinc-300 mb-1">Category</label>
							<select bind:value={newRisk.category} class="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-200">
								<option value="LEGAL">LEGAL</option>
								<option value="FINANCIAL">FINANCIAL</option>
								<option value="REPUTATIONAL">REPUTATIONAL</option>
								<option value="OPERATIONAL">OPERATIONAL</option>
								<option value="SAFETY">SAFETY</option>
							</select>
						</div>
						<div>
							<label class="block font-medium text-zinc-300 mb-1">Organization (Optional)</label>
							<select bind:value={newRisk.organization_id} class="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-200">
								<option value="">None / General</option>
								{#each organizations as o}
									<option value={o.id}>{o.name}</option>
								{/each}
							</select>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<div>
							<label class="block font-medium text-zinc-300 mb-1">Probability (1-5): {newRisk.probability}</label>
							<input
								type="range"
								min="1"
								max="5"
								bind:value={newRisk.probability}
								class="w-full accent-blue-500"
							/>
						</div>
						<div>
							<label class="block font-medium text-zinc-300 mb-1">Impact (1-5): {newRisk.impact}</label>
							<input
								type="range"
								min="1"
								max="5"
								bind:value={newRisk.impact}
								class="w-full accent-blue-500"
							/>
						</div>
					</div>

					<div>
						<label class="block font-medium text-zinc-300 mb-1">Calculated Severity Score</label>
						<div class="text-sm font-mono font-bold text-amber-400">
							{newRisk.probability * newRisk.impact} / 25
						</div>
					</div>

					<div>
						<label class="block font-medium text-zinc-300 mb-1">Mitigation Strategy Plan *</label>
						<textarea
							rows="3"
							bind:value={newRisk.mitigation_plan}
							placeholder="Specify operational preventative action and contingency protocol..."
							class="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-200"
						></textarea>
					</div>
				</div>

				<div class="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
					<button
						onclick={() => showRiskModal = false}
						class="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm"
					>
						Cancel
					</button>
					<button
						onclick={handleCreateRisk}
						class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 text-sm font-medium"
					>
						Record Risk
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
