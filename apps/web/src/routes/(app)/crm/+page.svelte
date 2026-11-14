<script lang="ts">
	import { onMount } from 'svelte';
	import {
		fetchEPs,
		createEP,
		dryRunBulkImport,
		executeBulkImport,
		type ExchangeParticipant,
		type BulkImportReport
	} from '$lib/api/crm';

	// Svelte 5 runes
	let eps = $state<ExchangeParticipant[]>([]);
	let isLoading = $state(true);
	let errorMsg = $state<string | null>(null);
	let successMsg = $state<string | null>(null);

	// Filters
	let searchQuery = $state('');
	let countryFilter = $state('ALL');

	// Modals & Drawers
	let showCreateDrawer = $state(false);
	let showImportModal = $state(false);
	let showDetailDrawer = $state(false);
	let activeEP = $state<ExchangeParticipant | null>(null);
	let isActionLoading = $state(false);

	// New Candidate Form
	let newCandidate = $state({
		first_name: '',
		last_name: '',
		email: '',
		phone: '',
		country_of_residence: '',
		nationality: '',
		home_mc: '',
		home_lc: '',
		passport_number: '',
		cv_url: '',
		product_interests: 'iGV,iGTa,iGTe',
		notes: ''
	});

	// Bulk Import State
	let importCsvText = $state(`First Name,Last Name,Email,Phone,Country,Nationality,EXPA ID,Passport
Lucas,Silva,lucas.silva@aiesec.net,+551199998888,Brazil,Brazilian,EXPA-BR-01,BR55443322
Amina,Khoury,amina.khoury@aiesec.net,+9613123456,Lebanon,Lebanese,EXPA-LB-02,LB99887766`);
	let importReport = $state<BulkImportReport | null>(null);

	const countries = $derived(
		Array.from(new Set(eps.map((e) => e.country_of_residence).filter(Boolean))).sort()
	);

	const filteredEPs = $derived(
		eps.filter((ep) => {
			const matchesCountry = countryFilter === 'ALL' || ep.country_of_residence === countryFilter;
			const q = searchQuery.toLowerCase();
			const matchesSearch =
				ep.first_name.toLowerCase().includes(q) ||
				ep.last_name.toLowerCase().includes(q) ||
				ep.email.toLowerCase().includes(q) ||
				(ep.expa_person_id && ep.expa_person_id.toLowerCase().includes(q));
			return matchesCountry && matchesSearch;
		})
	);

	async function loadData() {
		isLoading = true;
		errorMsg = null;
		try {
			eps = await fetchEPs();
		} catch (err: any) {
			errorMsg = err.message || 'Failed to load EP candidate directory';
		} finally {
			isLoading = false;
		}
	}

	async function submitCreateCandidate() {
		isActionLoading = true;
		errorMsg = null;
		try {
			await createEP(newCandidate);
			successMsg = `Candidate ${newCandidate.first_name} ${newCandidate.last_name} registered successfully!`;
			showCreateDrawer = false;
			await loadData();
		} catch (err: any) {
			errorMsg = err.message || 'Failed to register candidate';
		} finally {
			isActionLoading = false;
		}
	}

	async function runDryRun() {
		isActionLoading = true;
		errorMsg = null;
		try {
			importReport = await dryRunBulkImport(importCsvText);
		} catch (err: any) {
			errorMsg = err.message || 'Dry run validation failed';
		} finally {
			isActionLoading = false;
		}
	}

	async function runExecuteImport() {
		isActionLoading = true;
		errorMsg = null;
		try {
			const res = await executeBulkImport(importCsvText);
			successMsg = `Successfully imported and created ${res.valid_count} candidate(s)!`;
			showImportModal = false;
			importReport = null;
			await loadData();
		} catch (err: any) {
			errorMsg = err.message || 'Failed to commit bulk import';
		} finally {
			isActionLoading = false;
		}
	}

	function openEPDetail(ep: ExchangeParticipant) {
		activeEP = ep;
		showDetailDrawer = true;
	}

	onMount(() => {
		loadData();
	});
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold tracking-tight text-content-primary">CRM & Exchange Participants</h1>
			<p class="text-sm text-content-secondary mt-1">
				Candidate directory with role-based PII masking, duplicate detection, and bulk CSV/XLSX intake.
			</p>
		</div>
		<div class="flex items-center gap-3">
			<button
				onclick={() => {
					showImportModal = true;
					importReport = null;
				}}
				class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs font-semibold text-content-primary hover:bg-surface-3 transition"
			>
				<svg class="w-4 h-4 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
				</svg>
				Bulk Import (CSV/XLSX)
			</button>
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
				New Candidate
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

	<!-- Privacy Protection Banner -->
	<div class="p-3.5 rounded-xl bg-surface-1 border border-surface-border flex items-center justify-between text-xs">
		<div class="flex items-center gap-2.5">
			<span class="w-2 h-2 rounded-full bg-brand-blue"></span>
			<span class="font-medium text-content-primary">Privacy & PII Masking: Active</span>
			<span class="text-content-muted hidden md:inline">
				(Passport and phone numbers are deterministically masked for unprivileged roles per AIESEC Data Governance)
			</span>
		</div>
		<span class="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-2 text-content-secondary">
			Total Candidates: {eps.length}
		</span>
	</div>

	<!-- Search & Filters -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
		<div class="flex items-center gap-2">
			<button
				onclick={() => (countryFilter = 'ALL')}
				class="px-3 py-1 rounded-lg text-xs font-semibold transition {countryFilter === 'ALL'
					? 'bg-surface-3 text-content-primary border border-surface-border'
					: 'text-content-muted hover:text-content-secondary'}"
			>
				All Countries
			</button>
			{#each countries.slice(0, 5) as c}
				<button
					onclick={() => (countryFilter = c)}
					class="px-3 py-1 rounded-lg text-xs font-semibold transition {countryFilter === c
						? 'bg-surface-3 text-content-primary border border-surface-border'
						: 'text-content-muted hover:text-content-secondary'}"
				>
					{c}
				</button>
			{/each}
		</div>

		<div class="w-full sm:w-72">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search name, email, EXPA ID..."
				class="w-full px-3 py-1.5 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"
			/>
		</div>
	</div>

	<!-- EP Directory Table -->
	{#if isLoading}
		<div class="p-12 text-center text-xs text-content-muted">Loading candidate directory...</div>
	{:else if filteredEPs.length === 0}
		<div class="p-12 text-center border border-dashed border-surface-border rounded-xl">
			<p class="text-sm font-medium text-content-secondary">No candidates found</p>
			<p class="text-xs text-content-muted mt-1">Register a new candidate or import candidates via CSV.</p>
		</div>
	{:else}
		<div class="overflow-x-auto rounded-xl border border-surface-border bg-surface-1 shadow-sm">
			<table class="w-full text-left text-xs">
				<thead class="bg-surface-2/60 border-b border-surface-border text-content-muted text-[10px] uppercase font-bold tracking-wider">
					<tr>
						<th class="p-3">Candidate</th>
						<th class="p-3">Country & Home Entity</th>
						<th class="p-3">Contact Details (Masked)</th>
						<th class="p-3">Passport (Protected)</th>
						<th class="p-3">Interests</th>
						<th class="p-3 text-right">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-surface-border">
					{#each filteredEPs as ep}
						<tr class="hover:bg-surface-2/40 transition">
							<td class="p-3">
								<div class="font-bold text-content-primary">{ep.first_name} {ep.last_name}</div>
								{#if ep.expa_person_id}
									<div class="text-[11px] font-mono text-content-muted">{ep.expa_person_id}</div>
								{/if}
							</td>
							<td class="p-3">
								<div class="font-medium text-content-primary">{ep.country_of_residence} ({ep.nationality})</div>
								<div class="text-[11px] text-content-muted">{ep.home_lc || 'LC N/A'} • {ep.home_mc || 'MC N/A'}</div>
							</td>
							<td class="p-3">
								<div class="font-mono text-content-secondary">{ep.email}</div>
								<div class="text-[11px] font-mono text-content-muted">{ep.phone || 'No phone'}</div>
							</td>
							<td class="p-3">
								<span class="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
									{ep.passport_number || 'Not Recorded'}
								</span>
							</td>
							<td class="p-3">
								<div class="flex items-center gap-1">
									{#each (ep.product_interests || '').split(',') as pr}
										<span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-2 text-content-secondary">
											{pr.trim()}
										</span>
									{/each}
								</div>
							</td>
							<td class="p-3 text-right">
								<button
									onclick={() => openEPDetail(ep)}
									class="px-2.5 py-1 rounded bg-surface-2 hover:bg-surface-3 text-content-primary text-[11px] font-semibold transition"
								>
									Profile &rarr;
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Drawer: New Candidate -->
{#if showCreateDrawer}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
		<div class="w-full max-w-lg bg-surface-1 border-l border-surface-border h-full overflow-y-auto p-6 space-y-5 shadow-2xl">
			<div class="flex items-center justify-between pb-3 border-b border-surface-border">
				<div>
					<h2 class="text-lg font-bold text-content-primary">Register EP Candidate</h2>
					<p class="text-xs text-content-muted mt-0.5">Direct entry with privacy validation.</p>
				</div>
				<button onclick={() => (showCreateDrawer = false)} class="text-content-muted hover:text-content-primary">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="space-y-3 text-xs">
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">First Name *</label>
						<input type="text" bind:value={newCandidate.first_name} placeholder="Elena" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
					</div>
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Last Name *</label>
						<input type="text" bind:value={newCandidate.last_name} placeholder="Rostova" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Email *</label>
						<input type="email" bind:value={newCandidate.email} placeholder="elena@aiesec.net" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue font-mono" />
					</div>
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Phone</label>
						<input type="text" bind:value={newCandidate.phone} placeholder="+39 345 123456" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue font-mono" />
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Country of Residence *</label>
						<input type="text" bind:value={newCandidate.country_of_residence} placeholder="Italy" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
					</div>
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Nationality *</label>
						<input type="text" bind:value={newCandidate.nationality} placeholder="Italian" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Passport Number</label>
						<input type="text" bind:value={newCandidate.passport_number} placeholder="YA1234567" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue font-mono" />
					</div>
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">EXPA Person ID</label>
						<input type="text" bind:value={newCandidate.expa_person_id} placeholder="EXPA-1002" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue font-mono" />
					</div>
				</div>

				<div class="space-y-1">
					<label class="font-semibold text-content-primary">Product Interests (comma-separated)</label>
					<input type="text" bind:value={newCandidate.product_interests} placeholder="iGV, iGTa" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
				</div>

				<div class="space-y-1">
					<label class="font-semibold text-content-primary">CV Document URL</label>
					<input type="text" bind:value={newCandidate.cv_url} placeholder="https://storage.aiesec.org/cv/elena.pdf" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue font-mono" />
				</div>

				<div class="space-y-1">
					<label class="font-semibold text-content-primary">Notes</label>
					<textarea rows="2" bind:value={newCandidate.notes} placeholder="Candidate background, motivation, skills..." class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"></textarea>
				</div>
			</div>

			<div class="flex justify-end gap-3 pt-4 border-t border-surface-border">
				<button onclick={() => (showCreateDrawer = false)} class="px-4 py-2 rounded-lg bg-surface-2 text-content-secondary text-xs font-semibold">Cancel</button>
				<button disabled={isActionLoading || !newCandidate.first_name || !newCandidate.email || !newCandidate.country_of_residence} onclick={submitCreateCandidate} class="px-4 py-2 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 disabled:opacity-50">
					{isActionLoading ? 'Saving...' : 'Register Candidate'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal: Bulk CSV/XLSX Import -->
{#if showImportModal}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="w-full max-w-2xl bg-surface-1 border border-surface-border rounded-2xl p-6 space-y-5 shadow-2xl">
			<div class="flex items-center justify-between pb-3 border-b border-surface-border">
				<div>
					<h3 class="text-base font-bold text-content-primary">Bulk EP Candidate Ingestion</h3>
					<p class="text-xs text-content-muted mt-0.5">Parse EXPA or spreadsheet exports with dry-run validation.</p>
				</div>
				<button onclick={() => (showImportModal = false)} class="text-content-muted hover:text-content-primary">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="space-y-2">
				<label class="text-xs font-semibold text-content-primary">Paste CSV Data</label>
				<textarea
					rows="6"
					bind:value={importCsvText}
					class="w-full font-mono text-[11px] p-3 rounded-lg bg-surface-2 border border-surface-border text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"
				></textarea>
			</div>

			<!-- Dry-Run Report -->
			{#if importReport}
				<div class="p-4 rounded-xl border space-y-3 {importReport.invalid_count === 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}">
					<div class="flex items-center justify-between text-xs font-bold">
						<span>Dry-Run Analysis Complete</span>
						<span class="font-mono">
							{importReport.valid_count} Valid / {importReport.invalid_count} Errors / {importReport.duplicate_count} Duplicates
						</span>
					</div>

					{#if importReport.errors.length > 0}
						<div class="p-3 rounded-lg bg-surface-1 border border-surface-border text-xs text-red-400 space-y-1">
							<div class="font-bold">Errors Found:</div>
							<ul class="list-disc list-inside text-[11px] space-y-0.5">
								{#each importReport.errors as err}
									<li>Row {err.row} ({err.email}): {err.errors.join(', ')}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			{/if}

			<div class="flex items-center justify-between pt-3 border-t border-surface-border">
				<button
					type="button"
					disabled={isActionLoading || !importCsvText}
					onclick={runDryRun}
					class="px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-content-primary text-xs font-semibold transition disabled:opacity-50"
				>
					{isActionLoading ? 'Validating...' : '1. Run Dry-Run Validation'}
				</button>

				<div class="flex items-center gap-3">
					<button onclick={() => (showImportModal = false)} class="px-3 py-2 rounded-lg bg-surface-2 text-content-secondary text-xs font-semibold">
						Cancel
					</button>
					<button
						type="button"
						disabled={isActionLoading || !importReport || importReport.valid_count === 0}
						onclick={runExecuteImport}
						class="px-4 py-2 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 transition disabled:opacity-50"
					>
						2. Execute Batch Import
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Drawer: EP Profile Details -->
{#if showDetailDrawer && activeEP}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
		<div class="w-full max-w-md bg-surface-1 border-l border-surface-border h-full overflow-y-auto p-6 space-y-5 shadow-2xl">
			<div class="flex items-center justify-between pb-3 border-b border-surface-border">
				<div>
					<h3 class="text-base font-bold text-content-primary">{activeEP.first_name} {activeEP.last_name}</h3>
					<p class="font-mono text-xs text-content-muted mt-0.5">{activeEP.expa_person_id || activeEP.id}</p>
				</div>
				<button onclick={() => (showDetailDrawer = false)} class="text-content-muted hover:text-content-primary">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="space-y-3 text-xs">
				<div class="p-3 rounded-xl bg-surface-2 border border-surface-border space-y-2">
					<div class="flex justify-between">
						<span class="text-content-muted">Email</span>
						<span class="font-mono text-content-primary">{activeEP.email}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-content-muted">Phone</span>
						<span class="font-mono text-content-primary">{activeEP.phone || 'N/A'}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-content-muted">Passport</span>
						<span class="font-mono text-indigo-400">{activeEP.passport_number || 'N/A'}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-content-muted">Residence</span>
						<span class="text-content-primary">{activeEP.country_of_residence}</span>
					</div>
				</div>

				<div class="p-3 rounded-xl bg-surface-2 border border-surface-border space-y-1">
					<span class="font-bold text-content-primary block mb-1">Uploaded Documents</span>
					{#if activeEP.documents && activeEP.documents.length > 0}
						{#each activeEP.documents as doc}
							<div class="flex items-center justify-between py-1 border-b border-surface-border/60 text-[11px]">
								<span>{doc.file_name}</span>
								<span class="text-brand-blue font-semibold">{doc.doc_type}</span>
							</div>
						{/each}
					{:else}
						<p class="text-content-muted text-[11px]">No documents attached to this candidate.</p>
					{/if}
				</div>
			</div>

			<div class="pt-4 border-t border-surface-border flex justify-end">
				<button onclick={() => (showDetailDrawer = false)} class="px-4 py-2 rounded-lg bg-surface-2 text-content-secondary text-xs font-semibold">
					Close
				</button>
			</div>
		</div>
	</div>
{/if}
