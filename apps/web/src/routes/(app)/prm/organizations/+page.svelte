<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getOrganizations,
		createOrganization,
		type Organization,
	} from '$lib/api/prm';

	let organizations = $state<Organization[]>([]);
	let searchQuery = $state('');
	let sectorFilter = $state('');
	let isLoading = $state(true);
	let errorMsg = $state<string | null>(null);
	let showAddModal = $state(false);

	let newOrg = $state({
		name: '',
		legal_name: '',
		sector: 'Tech',
		org_type: 'Company',
		website: '',
		location: 'Rabat, Morocco',
		address: '',
		contact_first_name: '',
		contact_last_name: '',
		contact_email: '',
		contact_phone: '',
		contact_job_title: '',
	});

	const SECTORS = ['All', 'Tech', 'NGO', 'School/Education', 'Corporate', 'Healthcare', 'Public', 'Other'];

	async function loadOrganizations() {
		isLoading = true;
		errorMsg = null;
		try {
			const data = await getOrganizations(searchQuery, sectorFilter === 'All' ? undefined : sectorFilter);
			organizations = data;
		} catch (err: any) {
			errorMsg = err.message || 'Failed to load organizations';
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		loadOrganizations();
	});

	async function handleCreateOrg() {
		if (!newOrg.name) {
			alert('Please enter an organization name');
			return;
		}
		try {
			const contacts = newOrg.contact_first_name
				? [
						{
							first_name: newOrg.contact_first_name,
							last_name: newOrg.contact_last_name || 'Contact',
							email: newOrg.contact_email || undefined,
							phone: newOrg.contact_phone || undefined,
							job_title: newOrg.contact_job_title || undefined,
							is_primary: true,
						},
				  ]
				: [];

			await createOrganization({
				name: newOrg.name,
				legal_name: newOrg.legal_name || undefined,
				sector: newOrg.sector,
				org_type: newOrg.org_type,
				website: newOrg.website || undefined,
				location: newOrg.location,
				address: newOrg.address || undefined,
				contacts: contacts as any,
			});
			showAddModal = false;
			await loadOrganizations();
		} catch (err: any) {
			alert(err.message || 'Failed to create organization');
		}
	}
</script>

<svelte:head>
	<title>Organizations Directory — iCX Command Center</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold tracking-tight text-zinc-100">Organization Directory</h1>
			<p class="text-sm text-zinc-400">Manage local hosting companies, schools, NGOs, and their contact representatives.</p>
		</div>
		<button
			onclick={() => showAddModal = true}
			class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-sm self-start sm:self-auto"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
			</svg>
			Add Organization
		</button>
	</div>

	<!-- Prohibited Host Policy Alert -->
	<div class="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-xs text-red-300 flex items-start gap-3">
		<svg class="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
		</svg>
		<div>
			<span class="font-semibold text-red-200">AIESEC Host Prohibition Governance:</span>
			AIESEC entities (Local Committees, National Committees, AI) are strictly prohibited from serving as local hosting organizations for exchange opportunities. Any attempt to register an AIESEC entity will automatically flag it as <code class="bg-red-900/50 px-1 py-0.5 rounded text-red-200">PROHIBITED</code> and block contract creation.
		</div>
	</div>

	<!-- Filter Controls -->
	<div class="flex flex-col sm:flex-row items-center gap-3">
		<div class="relative flex-1 w-full">
			<input
				type="text"
				bind:value={searchQuery}
				oninput={loadOrganizations}
				placeholder="Search organizations by name..."
				class="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
			/>
			<svg class="w-4 h-4 text-zinc-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
			</svg>
		</div>

		<select
			bind:value={sectorFilter}
			onchange={loadOrganizations}
			class="w-full sm:w-48 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-200"
		>
			{#each SECTORS as s}
				<option value={s}>{s === 'All' ? 'All Sectors' : s}</option>
			{/each}
		</select>
	</div>

	<!-- Table -->
	<div class="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm text-zinc-300">
				<thead class="bg-zinc-900/80 text-xs uppercase font-medium text-zinc-400 border-b border-zinc-800">
					<tr>
						<th class="py-3 px-4">Organization</th>
						<th class="py-3 px-4">Sector & Type</th>
						<th class="py-3 px-4">Location</th>
						<th class="py-3 px-4">Primary Contact</th>
						<th class="py-3 px-4">Verification</th>
						<th class="py-3 px-4">Status</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-zinc-800/60">
					{#if isLoading}
						<tr>
							<td colspan="6" class="py-8 text-center text-zinc-500">Loading organizations...</td>
						</tr>
					{:else if organizations.length === 0}
						<tr>
							<td colspan="6" class="py-8 text-center text-zinc-500">No organizations found.</td>
						</tr>
					{:else}
						{#each organizations as org}
							<tr class="hover:bg-zinc-800/30 transition-colors">
								<td class="py-3.5 px-4">
									<div class="font-medium text-zinc-100">{org.name}</div>
									{#if org.legal_name && org.legal_name !== org.name}
										<div class="text-xs text-zinc-500">{org.legal_name}</div>
									{/if}
								</td>
								<td class="py-3.5 px-4">
									<div class="flex items-center gap-1.5">
										<span class="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
											{org.sector}
										</span>
										<span class="text-xs text-zinc-500">({org.org_type})</span>
									</div>
								</td>
								<td class="py-3.5 px-4 text-xs text-zinc-400">
									{org.location}
								</td>
								<td class="py-3.5 px-4 text-xs">
									{#if org.contacts && org.contacts.length > 0}
										{@const primary = org.contacts.find(c => c.is_primary) || org.contacts[0]}
										<div class="text-zinc-200 font-medium">{primary.first_name} {primary.last_name}</div>
										<div class="text-zinc-500">{primary.job_title || primary.email || 'No title'}</div>
									{:else}
										<span class="text-zinc-600">No contacts</span>
									{/if}
								</td>
								<td class="py-3.5 px-4">
									{#if org.is_prohibited}
										<span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
											PROHIBITED
										</span>
									{:else if org.verification_status === 'VERIFIED'}
										<span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
											VERIFIED
										</span>
									{:else}
										<span class="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
											UNVERIFIED
										</span>
									{/if}
								</td>
								<td class="py-3.5 px-4 text-xs">
									<span class="px-2 py-0.5 rounded-full text-[10px] font-mono {org.status === 'ACTIVE_PARTNER' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'}">
										{org.status}
									</span>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Add Organization Modal -->
	{#if showAddModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div class="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
				<div class="flex items-center justify-between border-b border-zinc-800 pb-3">
					<h3 class="text-lg font-bold text-zinc-100">Add New Organization</h3>
					<button onclick={() => showAddModal = false} class="text-zinc-400 hover:text-zinc-200">✕</button>
				</div>

				<div class="space-y-3 text-xs">
					<div>
						<label class="block font-medium text-zinc-300 mb-1">Organization Name *</label>
						<input
							type="text"
							bind:value={newOrg.name}
							placeholder="e.g. Al Akhawayn School Rabat"
							class="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-200"
						/>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<div>
							<label class="block font-medium text-zinc-300 mb-1">Sector</label>
							<select bind:value={newOrg.sector} class="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-200">
								{#each SECTORS.slice(1) as s}
									<option value={s}>{s}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="block font-medium text-zinc-300 mb-1">Entity Type</label>
							<select bind:value={newOrg.org_type} class="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-200">
								<option value="Company">Company</option>
								<option value="NGO">NGO</option>
								<option value="School">School</option>
								<option value="University">University</option>
								<option value="Foundation">Foundation</option>
								<option value="Other">Other</option>
							</select>
						</div>
					</div>

					<div>
						<label class="block font-medium text-zinc-300 mb-1">Location</label>
						<input
							type="text"
							bind:value={newOrg.location}
							class="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-200"
						/>
					</div>

					<div class="border-t border-zinc-800 pt-3">
						<div class="font-semibold text-zinc-200 mb-2">Primary Contact Representative</div>
						<div class="grid grid-cols-2 gap-2">
							<input
								type="text"
								bind:value={newOrg.contact_first_name}
								placeholder="First name"
								class="px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-200"
							/>
							<input
								type="text"
								bind:value={newOrg.contact_last_name}
								placeholder="Last name"
								class="px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-200"
							/>
						</div>
						<div class="grid grid-cols-2 gap-2 mt-2">
							<input
								type="email"
								bind:value={newOrg.contact_email}
								placeholder="Email address"
								class="px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-200"
							/>
							<input
								type="text"
								bind:value={newOrg.contact_job_title}
								placeholder="Job title / Role"
								class="px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-200"
							/>
						</div>
					</div>
				</div>

				<div class="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
					<button
						onclick={() => showAddModal = false}
						class="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm"
					>
						Cancel
					</button>
					<button
						onclick={handleCreateOrg}
						class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 text-sm font-medium"
					>
						Save Organization
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
