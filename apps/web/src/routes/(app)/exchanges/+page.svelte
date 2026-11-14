<script lang="ts">
	import { onMount } from 'svelte';
	import {
		fetchExchanges,
		updateChecklistItem,
		reportIncident,
		resolveIncident,
		fetchArrivals,
		recordArrival,
		updatePickupStatus,
		fetchAccommodations,
		createAccommodation,
		type Exchange,
		type ArrivalLogistics,
		type AccommodationUnit
	} from '$lib/api/exchanges';

	// Svelte 5 runes
	let exchanges = $state<Exchange[]>([]);
	let arrivals = $state<ArrivalLogistics[]>([]);
	let accommodations = $state<AccommodationUnit[]>([]);
	let isLoading = $state(true);
	let errorMsg = $state<string | null>(null);
	let successMsg = $state<string | null>(null);

	// Tabs & Filters
	let activeTab = $state<'OPERATIONS' | 'LOGISTICS' | 'ACCOMMODATIONS'>('OPERATIONS');
	let statusFilter = $state('ALL');
	let searchQuery = $state('');

	// Modals & Drawers
	let showChecklistModal = $state(false);
	let showIncidentModal = $state(false);
	let showArrivalModal = $state(false);
	let showAccModal = $state(false);
	let activeExchange = $state<Exchange | null>(null);
	let isActionLoading = $state(false);

	// Forms
	let incidentForm = $state({
		incident_type: 'HEALTH' as 'HEALTH' | 'SAFETY' | 'HARASSMENT' | 'LEGAL' | 'CONTRACT_BREACH' | 'BREAK_REQUEST',
		severity: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
		description: ''
	});

	let arrivalForm = $state({
		exchange_id: '',
		flight_number: '',
		airline: 'Royal Air Maroc',
		arrival_airport: 'CMN_CASABLANCA' as 'RBA_RABAT' | 'CMN_CASABLANCA' | 'RAK_MARRAKECH',
		arrival_datetime: new Date().toISOString().slice(0, 16),
		transport_mode: 'CAR' as 'CAR' | 'TRAIN' | 'TAXI',
		driver_name: '',
		driver_contact: '',
		notes: ''
	});

	let accForm = $state({
		unit_name: '',
		address: '',
		neighborhood: 'Agdal',
		unit_type: 'AIESEC_APARTMENT' as 'HOST_FAMILY' | 'AIESEC_APARTMENT' | 'DORMITORY' | 'HOTEL',
		capacity_beds: 2,
		monthly_rent_mad: 3000,
		landlord_name: '',
		landlord_phone: '',
		safety_inspection_passed: true
	});

	const filteredExchanges = $derived(
		exchanges.filter((ex) => {
			const matchesStatus = statusFilter === 'ALL' || ex.delivery_status === statusFilter;
			const q = searchQuery.toLowerCase();
			const matchesSearch =
				ex.exchange_code.toLowerCase().includes(q) ||
				(ex.ep_name && ex.ep_name.toLowerCase().includes(q)) ||
				(ex.opportunity_title && ex.opportunity_title.toLowerCase().includes(q));
			return matchesStatus && matchesSearch;
		})
	);

	async function loadData() {
		isLoading = true;
		errorMsg = null;
		try {
			const [exs, arrs, accs] = await Promise.all([
				fetchExchanges(),
				fetchArrivals(),
				fetchAccommodations()
			]);
			exchanges = exs;
			arrivals = arrs;
			accommodations = accs;
			if (exs.length > 0 && !arrivalForm.exchange_id) {
				arrivalForm.exchange_id = exs[0].id;
			}
		} catch (err: any) {
			errorMsg = err.message || 'Failed to load exchange operations data';
		} finally {
			isLoading = false;
		}
	}

	function openChecklist(ex: Exchange) {
		activeExchange = ex;
		showChecklistModal = true;
	}

	function openIncident(ex: Exchange) {
		activeExchange = ex;
		incidentForm.description = '';
		showIncidentModal = true;
	}

	async function toggleChecklist(item: any) {
		if (!activeExchange) return;
		isActionLoading = true;
		try {
			await updateChecklistItem(activeExchange.id, item.id, {
				is_completed: !item.is_completed
			});
			item.is_completed = !item.is_completed;
			await loadData();
			activeExchange = exchanges.find((e) => e.id === activeExchange?.id) || null;
		} catch (err: any) {
			errorMsg = err.message || 'Failed to toggle checklist item';
		} finally {
			isActionLoading = false;
		}
	}

	async function submitIncident() {
		if (!activeExchange) return;
		isActionLoading = true;
		try {
			await reportIncident(activeExchange.id, incidentForm);
			successMsg = `Incident case reported successfully for ${activeExchange.exchange_code}`;
			showIncidentModal = false;
			await loadData();
			activeExchange = exchanges.find((e) => e.id === activeExchange?.id) || null;
		} catch (err: any) {
			errorMsg = err.message || 'Failed to log incident';
		} finally {
			isActionLoading = false;
		}
	}

	async function submitArrival() {
		isActionLoading = true;
		try {
			await recordArrival(arrivalForm);
			successMsg = `Arrival flight tracking recorded successfully!`;
			showArrivalModal = false;
			await loadData();
		} catch (err: any) {
			errorMsg = err.message || 'Failed to log arrival';
		} finally {
			isActionLoading = false;
		}
	}

	async function submitAccommodation() {
		isActionLoading = true;
		try {
			await createAccommodation(accForm);
			successMsg = `Accommodation unit ${accForm.unit_name} registered!`;
			showAccModal = false;
			await loadData();
		} catch (err: any) {
			errorMsg = err.message || 'Failed to create accommodation unit';
		} finally {
			isActionLoading = false;
		}
	}

	async function setPickupDone(logisticsId: string) {
		isActionLoading = true;
		try {
			await updatePickupStatus(logisticsId, {
				pickup_status: 'PICKED_UP',
				notes: 'Pickup verified and completed.'
			});
			successMsg = `Airport pickup marked as PICKED_UP (Exchange advanced to ARRIVED)`;
			await loadData();
		} catch (err: any) {
			errorMsg = err.message || 'Failed to update pickup status';
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
			<h1 class="text-2xl font-bold tracking-tight text-content-primary">Exchange Operations</h1>
			<p class="text-sm text-content-secondary mt-1">
				Real-time delivery management, modality checklists, airport pickups, and accommodation inventory.
			</p>
		</div>
		<div class="flex items-center gap-3">
			<button
				onclick={() => (showAccModal = true)}
				class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs font-semibold text-content-primary hover:bg-surface-3 transition"
			>
				Add Housing Unit
			</button>
			<button
				onclick={() => (showArrivalModal = true)}
				class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 transition shadow-sm"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Log Flight Arrival
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
			onclick={() => (activeTab = 'OPERATIONS')}
			class="pb-3 text-xs font-semibold transition border-b-2 {activeTab === 'OPERATIONS'
				? 'border-brand-blue text-brand-blue'
				: 'border-transparent text-content-muted hover:text-content-secondary'}"
		>
			Exchange Delivery Board ({exchanges.length})
		</button>
		<button
			onclick={() => (activeTab = 'LOGISTICS')}
			class="pb-3 text-xs font-semibold transition border-b-2 {activeTab === 'LOGISTICS'
				? 'border-brand-blue text-brand-blue'
				: 'border-transparent text-content-muted hover:text-content-secondary'}"
		>
			Arrival Pickups & Airport Transport ({arrivals.length})
		</button>
		<button
			onclick={() => (activeTab = 'ACCOMMODATIONS')}
			class="pb-3 text-xs font-semibold transition border-b-2 {activeTab === 'ACCOMMODATIONS'
				? 'border-brand-blue text-brand-blue'
				: 'border-transparent text-content-muted hover:text-content-secondary'}"
		>
			Accommodation Units & Beds ({accommodations.length})
		</button>
	</div>

	<!-- Tab 1: Operations -->
	{#if activeTab === 'OPERATIONS'}
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div class="flex items-center gap-2 overflow-x-auto pb-1">
				{#each ['ALL', 'PRE_ARRIVAL', 'ARRIVED', 'REALIZED', 'FINISHED', 'COMPLETED'] as st}
					<button
						onclick={() => (statusFilter = st)}
						class="px-3 py-1 rounded-lg text-xs font-semibold transition shrink-0 {statusFilter === st
							? 'bg-surface-3 text-content-primary border border-surface-border'
							: 'text-content-muted hover:text-content-secondary'}"
					>
						{st}
					</button>
				{/each}
			</div>

			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search exchange code, EP, project..."
				class="w-full sm:w-64 px-3 py-1.5 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"
			/>
		</div>

		{#if isLoading}
			<div class="p-12 text-center text-xs text-content-muted">Loading active exchanges...</div>
		{:else if filteredExchanges.length === 0}
			<div class="p-12 text-center border border-dashed border-surface-border rounded-xl">
				<p class="text-sm font-medium text-content-secondary">No active exchanges found</p>
				<p class="text-xs text-content-muted mt-1">Approve an application in the Applications module to spawn an exchange delivery.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each filteredExchanges as ex}
					{@const completedItems = ex.checklists.filter((c) => c.is_completed).length}
					<div class="p-5 rounded-xl bg-surface-1 border border-surface-border space-y-4 shadow-sm">
						<div class="flex items-center justify-between">
							<span class="font-mono text-xs font-bold text-content-primary">{ex.exchange_code}</span>
							<span
								class="px-2 py-0.5 rounded text-[10px] font-bold uppercase {ex.delivery_status === 'COMPLETED'
									? 'bg-emerald-500/20 text-emerald-400'
									: ex.delivery_status === 'REALIZED'
									? 'bg-blue-500/20 text-blue-400'
									: ex.delivery_status === 'ARRIVED'
									? 'bg-purple-500/20 text-purple-400'
									: 'bg-amber-500/20 text-amber-400'}"
							>
								{ex.delivery_status}
							</span>
						</div>

						<div>
							<h3 class="text-base font-bold text-content-primary">{ex.ep_name || 'Participant'}</h3>
							<p class="text-xs text-content-muted">{ex.opportunity_title} ({ex.modality})</p>
						</div>

						<!-- Checklist Progress Bar -->
						<div class="space-y-1.5 pt-2 border-t border-surface-border">
							<div class="flex justify-between text-xs">
								<span class="text-content-secondary">Pre-Arrival & Delivery Checklist</span>
								<span class="font-bold text-content-primary">{completedItems} / {ex.checklists.length}</span>
							</div>
							<div class="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden">
								<div
									class="h-full bg-brand-blue rounded-full transition-all"
									style="width: {ex.checklists.length > 0 ? (completedItems / ex.checklists.length) * 100 : 0}%"
								></div>
							</div>
						</div>

						<div class="flex items-center justify-between pt-2 border-t border-surface-border">
							<button
								onclick={() => openChecklist(ex)}
								class="text-xs font-semibold text-brand-blue hover:underline"
							>
								View Checklists &rarr;
							</button>
							<button
								onclick={() => openIncident(ex)}
								class="px-2.5 py-1 rounded bg-surface-2 hover:bg-surface-3 text-[11px] font-semibold text-red-400"
							>
								Report Incident
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}

	<!-- Tab 2: Logistics & Pickups -->
	{#if activeTab === 'LOGISTICS'}
		<div class="overflow-x-auto rounded-xl border border-surface-border bg-surface-1 shadow-sm">
			<table class="w-full text-left text-xs">
				<thead class="bg-surface-2/60 border-b border-surface-border text-content-muted text-[10px] uppercase font-bold tracking-wider">
					<tr>
						<th class="p-3">Flight / Carrier</th>
						<th class="p-3">Participant</th>
						<th class="p-3">Airport & Terminal</th>
						<th class="p-3">Arrival Datetime</th>
						<th class="p-3">Pickup Status</th>
						<th class="p-3 text-right">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-surface-border">
					{#each arrivals as arr}
						<tr class="hover:bg-surface-2/40 transition">
							<td class="p-3">
								<div class="font-bold text-content-primary">{arr.flight_number || 'N/A'}</div>
								<div class="text-[11px] text-content-muted">{arr.airline}</div>
							</td>
							<td class="p-3 font-semibold text-content-primary">{arr.ep_name || arr.exchange_code}</td>
							<td class="p-3">
								<div class="text-content-primary">{arr.arrival_airport.replace('_', ' ')}</div>
								<div class="text-[11px] text-content-muted">{arr.terminal || 'Main Terminal'}</div>
							</td>
							<td class="p-3 font-mono text-content-secondary">{arr.arrival_datetime.replace('T', ' ').slice(0, 16)}</td>
							<td class="p-3">
								<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase {arr.pickup_status === 'PICKED_UP' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}">
									{arr.pickup_status}
								</span>
							</td>
							<td class="p-3 text-right">
								{#if arr.pickup_status !== 'PICKED_UP'}
									<button
										disabled={isActionLoading}
										onclick={() => setPickupDone(arr.id)}
										class="px-2.5 py-1 rounded bg-brand-blue text-white text-[11px] font-semibold hover:bg-brand-blue/90"
									>
										Mark Picked Up
									</button>
								{:else}
									<span class="text-emerald-400 font-medium text-[11px]">Completed</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<!-- Tab 3: Accommodations -->
	{#if activeTab === 'ACCOMMODATIONS'}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each accommodations as acc}
				<div class="p-5 rounded-xl bg-surface-1 border border-surface-border space-y-3 shadow-sm">
					<div class="flex items-center justify-between">
						<h3 class="text-base font-bold text-content-primary">{acc.unit_name}</h3>
						<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface-2 text-content-muted">
							{acc.unit_type}
						</span>
					</div>

					<p class="text-xs text-content-secondary">{acc.address} ({acc.neighborhood})</p>

					<div class="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-surface-border">
						<div>
							<span class="text-content-muted text-[10px] uppercase font-bold block">Bed Occupancy</span>
							<span class="font-bold text-content-primary">
								{acc.occupied_beds} / {acc.capacity_beds} Beds
							</span>
						</div>
						<div>
							<span class="text-content-muted text-[10px] uppercase font-bold block">Monthly Rent</span>
							<span class="font-bold text-indigo-400">{acc.monthly_rent_mad} MAD</span>
						</div>
					</div>

					<div class="flex items-center justify-between text-xs pt-2 border-t border-surface-border">
						<span class="flex items-center gap-1.5">
							<span class="w-2 h-2 rounded-full {acc.safety_inspection_passed ? 'bg-emerald-400' : 'bg-red-400'}"></span>
							{acc.safety_inspection_passed ? 'Safety Inspection Passed' : 'Pending Inspection'}
						</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal: Checklist Drawer -->
{#if showChecklistModal && activeExchange}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
		<div class="w-full max-w-lg bg-surface-1 border-l border-surface-border h-full overflow-y-auto p-6 space-y-5 shadow-2xl">
			<div class="flex items-center justify-between pb-3 border-b border-surface-border">
				<div>
					<h3 class="text-base font-bold text-content-primary">{activeExchange.exchange_code} Checklists</h3>
					<p class="text-xs text-content-muted mt-0.5">{activeExchange.ep_name} ({activeExchange.modality})</p>
				</div>
				<button onclick={() => (showChecklistModal = false)} class="text-content-muted hover:text-content-primary">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="space-y-2">
				{#each activeExchange.checklists as item}
					<button
						type="button"
						onclick={() => toggleChecklist(item)}
						class="w-full p-3 rounded-lg border text-left flex items-start justify-between gap-3 transition {item.is_completed
							? 'bg-emerald-500/10 border-emerald-500/20'
							: 'bg-surface-2 border-surface-border hover:bg-surface-3'}"
					>
						<div class="space-y-1">
							<div class="flex items-center gap-2">
								<span class="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-surface-1 text-content-muted">
									{item.category}
								</span>
								{#if item.is_mandatory}
									<span class="text-[9px] font-bold uppercase text-amber-400">Mandatory</span>
								{/if}
							</div>
							<div class="text-xs font-semibold {item.is_completed ? 'text-emerald-300 line-through' : 'text-content-primary'}">
								{item.item_title}
							</div>
							{#if item.notes}
								<p class="text-[10px] text-content-muted italic">{item.notes}</p>
							{/if}
						</div>

						<input
							type="checkbox"
							checked={item.is_completed}
							class="rounded bg-surface-1 text-emerald-500 focus:ring-emerald-500 mt-1 pointer-events-none"
						/>
					</button>
				{/each}
			</div>

			<div class="pt-4 border-t border-surface-border flex justify-end">
				<button onclick={() => (showChecklistModal = false)} class="px-4 py-2 rounded-lg bg-surface-2 text-content-secondary text-xs font-semibold">
					Close
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal: Incident Reporter -->
{#if showIncidentModal && activeExchange}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="w-full max-w-md bg-surface-1 border border-surface-border rounded-2xl p-6 space-y-4 shadow-2xl">
			<div class="flex items-center justify-between pb-2 border-b border-surface-border">
				<h3 class="text-base font-bold text-content-primary">Report Incident / Break Request</h3>
				<button onclick={() => (showIncidentModal = false)} class="text-content-muted hover:text-content-primary">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="space-y-3 text-xs">
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Incident Type</label>
						<select bind:value={incidentForm.incident_type} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue">
							<option value="HEALTH">Health</option>
							<option value="SAFETY">Safety</option>
							<option value="HARASSMENT">Harassment</option>
							<option value="LEGAL">Legal</option>
							<option value="CONTRACT_BREACH">Contract Breach</option>
							<option value="BREAK_REQUEST">Break Request</option>
						</select>
					</div>
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Severity</label>
						<select bind:value={incidentForm.severity} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue">
							<option value="LOW">Low</option>
							<option value="MEDIUM">Medium</option>
							<option value="HIGH">High</option>
							<option value="CRITICAL">Critical</option>
						</select>
					</div>
				</div>

				<div class="space-y-1">
					<label class="font-semibold text-content-primary">Description & Evidence *</label>
					<textarea rows="4" bind:value={incidentForm.description} placeholder="Describe the incident occurrence, witnesses, immediate actions taken..." class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue"></textarea>
				</div>
			</div>

			<div class="flex justify-end gap-3 pt-3 border-t border-surface-border">
				<button onclick={() => (showIncidentModal = false)} class="px-3 py-1.5 rounded-lg bg-surface-2 text-xs font-semibold text-content-secondary">Cancel</button>
				<button disabled={isActionLoading || !incidentForm.description} onclick={submitIncident} class="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500 disabled:opacity-50">Submit Report</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal: Log Flight Arrival -->
{#if showArrivalModal}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="w-full max-w-md bg-surface-1 border border-surface-border rounded-2xl p-6 space-y-4 shadow-2xl">
			<div class="flex items-center justify-between pb-2 border-b border-surface-border">
				<h3 class="text-base font-bold text-content-primary">Log Flight Arrival</h3>
				<button onclick={() => (showArrivalModal = false)} class="text-content-muted hover:text-content-primary">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="space-y-3 text-xs">
				<div class="space-y-1">
					<label class="font-semibold text-content-primary">Target Exchange *</label>
					<select bind:value={arrivalForm.exchange_id} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue">
						{#each exchanges as ex}
							<option value={ex.id}>{ex.exchange_code} — {ex.ep_name} ({ex.opportunity_title})</option>
						{/each}
					</select>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Flight Number</label>
						<input type="text" bind:value={arrivalForm.flight_number} placeholder="AT 202" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue font-mono" />
					</div>
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Airline</label>
						<input type="text" bind:value={arrivalForm.airline} placeholder="Royal Air Maroc" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Airport</label>
						<select bind:value={arrivalForm.arrival_airport} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue">
							<option value="RBA_RABAT">Rabat Salé (RBA)</option>
							<option value="CMN_CASABLANCA">Casablanca (CMN)</option>
							<option value="RAK_MARRAKECH">Marrakech (RAK)</option>
						</select>
					</div>
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Arrival Datetime</label>
						<input type="datetime-local" bind:value={arrivalForm.arrival_datetime} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue font-mono" />
					</div>
				</div>
			</div>

			<div class="flex justify-end gap-3 pt-3 border-t border-surface-border">
				<button onclick={() => (showArrivalModal = false)} class="px-3 py-1.5 rounded-lg bg-surface-2 text-xs font-semibold text-content-secondary">Cancel</button>
				<button disabled={isActionLoading || !arrivalForm.exchange_id} onclick={submitArrival} class="px-4 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 disabled:opacity-50">Save Arrival</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal: Add Housing Unit -->
{#if showAccModal}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="w-full max-w-md bg-surface-1 border border-surface-border rounded-2xl p-6 space-y-4 shadow-2xl">
			<div class="flex items-center justify-between pb-2 border-b border-surface-border">
				<h3 class="text-base font-bold text-content-primary">Register Housing Unit</h3>
				<button onclick={() => (showAccModal = false)} class="text-content-muted hover:text-content-primary">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="space-y-3 text-xs">
				<div class="space-y-1">
					<label class="font-semibold text-content-primary">Unit Name *</label>
					<input type="text" bind:value={accForm.unit_name} placeholder="Agdal Residence A4" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
				</div>

				<div class="space-y-1">
					<label class="font-semibold text-content-primary">Address *</label>
					<input type="text" bind:value={accForm.address} placeholder="Avenue de France, Agdal, Rabat" class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Capacity (Beds)</label>
						<input type="number" min="1" max="10" bind:value={accForm.capacity_beds} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
					</div>
					<div class="space-y-1">
						<label class="font-semibold text-content-primary">Monthly Rent (MAD)</label>
						<input type="number" min="0" bind:value={accForm.monthly_rent_mad} class="w-full px-3 py-2 rounded-lg bg-surface-2 border border-surface-border text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand-blue" />
					</div>
				</div>
			</div>

			<div class="flex justify-end gap-3 pt-3 border-t border-surface-border">
				<button onclick={() => (showAccModal = false)} class="px-3 py-1.5 rounded-lg bg-surface-2 text-xs font-semibold text-content-secondary">Cancel</button>
				<button disabled={isActionLoading || !accForm.unit_name || !accForm.address} onclick={submitAccommodation} class="px-4 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 disabled:opacity-50">Create Unit</button>
			</div>
		</div>
	</div>
{/if}
