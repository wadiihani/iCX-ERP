<script lang="ts">
  import { onMount } from 'svelte';
  import { expaApi, type EXPASyncRun, type EXPAReconciliationRecord, type EXPAGatedMutation } from '$lib/api/expa';
  import { auth } from '$lib/stores/auth.svelte';

  let activeTab = $state<'RECONCILIATION' | 'MUTATIONS' | 'RUNS'>('RECONCILIATION');
  let syncRuns = $state<EXPASyncRun[]>([]);
  let reconciliations = $state<EXPAReconciliationRecord[]>([]);
  let mutations = $state<EXPAGatedMutation[]>([]);
  let loading = $state(true);
  let syncing = $state(false);
  let error = $state<string | null>(null);

  // Resolution modal state
  let showResolveModal = $state(false);
  let selectedRecon = $state<EXPAReconciliationRecord | null>(null);
  let resolveStrategy = $state<'LOCAL_KEPT' | 'EXPA_ACCEPTED' | 'MANUAL_OVERRIDE'>('EXPA_ACCEPTED');
  let resolveNotes = $state('');

  // Reject modal state
  let showRejectModal = $state(false);
  let selectedMutation = $state<EXPAGatedMutation | null>(null);
  let rejectReason = $state('');

  let pendingRecons = $derived(reconciliations.filter(r => r.resolution_status === 'PENDING'));
  let resolvedRecons = $derived(reconciliations.filter(r => r.resolution_status !== 'PENDING'));
  let pendingMutations = $derived(mutations.filter(m => m.status === 'PENDING_HUMAN_APPROVAL'));
  let latestRun = $derived(syncRuns.length > 0 ? syncRuns[0] : null);

  async function loadData() {
    loading = true;
    error = null;
    try {
      const [runsData, reconData, mutData] = await Promise.all([
        expaApi.listSyncRuns(15),
        expaApi.listReconciliations(),
        expaApi.listMutations()
      ]);
      syncRuns = runsData;
      reconciliations = reconData;
      mutations = mutData;
    } catch (err: any) {
      error = err.message || 'Failed to load EXPA reconciliation data';
    } finally {
      loading = false;
    }
  }

  async function handleTriggerSync() {
    syncing = true;
    error = null;
    try {
      await expaApi.triggerSync('POLLING');
      await loadData();
    } catch (err: any) {
      error = err.message || 'Failed to trigger EXPA sync';
    } finally {
      syncing = false;
    }
  }

  function openResolve(recon: EXPAReconciliationRecord, defaultStrategy: 'LOCAL_KEPT' | 'EXPA_ACCEPTED' = 'EXPA_ACCEPTED') {
    selectedRecon = recon;
    resolveStrategy = defaultStrategy;
    resolveNotes = '';
    showResolveModal = true;
  }

  async function executeResolve() {
    if (!selectedRecon) return;
    try {
      await expaApi.resolveReconciliation(selectedRecon.id, resolveStrategy, resolveNotes);
      showResolveModal = false;
      await loadData();
    } catch (err: any) {
      alert(`Resolution failed: ${err.message}`);
    }
  }

  async function handleApproveMutation(id: string) {
    if (!confirm('Approve and push this mutation directly to official EXPA/GIS?')) return;
    try {
      await expaApi.approveMutation(id);
      await loadData();
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    }
  }

  function openReject(mutation: EXPAGatedMutation) {
    selectedMutation = mutation;
    rejectReason = '';
    showRejectModal = true;
  }

  async function executeReject() {
    if (!selectedMutation || !rejectReason.trim()) return;
    try {
      await expaApi.rejectMutation(selectedMutation.id, rejectReason);
      showRejectModal = false;
      await loadData();
    } catch (err: any) {
      alert(`Rejection failed: ${err.message}`);
    }
  }

  onMount(loadData);
</script>

<div class="space-y-6">
  <!-- Header with Sync Status -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-bold tracking-tight text-foreground">EXPA Reconciliation Console</h1>
        <span class="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
          GIS / EXPA v2
        </span>
      </div>
      <p class="text-sm text-muted-foreground mt-1">
        Decoupled external data synchronization, dual-status diff resolution, and gated outbound mutations.
      </p>
    </div>

    <div class="flex items-center gap-3">
      {#if latestRun}
        <div class="text-right hidden sm:block">
          <p class="text-xs text-muted-foreground">Last Synced</p>
          <p class="text-xs font-mono font-medium text-foreground">
            {new Date(latestRun.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      {/if}
      <button
        onclick={handleTriggerSync}
        disabled={syncing}
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition shadow disabled:opacity-50"
      >
        <svg class={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {syncing ? 'Syncing GIS...' : 'Trigger Sync'}
      </button>
    </div>
  </div>

  <!-- Key Metrics Row -->
  <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
    <div class="p-4 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
      <span class="text-xs font-medium text-muted-foreground">Pending Discrepancies</span>
      <p class="text-2xl font-bold text-amber-400 mt-1">{pendingRecons.length}</p>
      <span class="text-[11px] text-muted-foreground mt-0.5 block">Requires officer review</span>
    </div>

    <div class="p-4 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
      <span class="text-xs font-medium text-muted-foreground">Gated Mutations</span>
      <p class="text-2xl font-bold text-blue-400 mt-1">{pendingMutations.length}</p>
      <span class="text-[11px] text-muted-foreground mt-0.5 block">Awaiting sign-off to push</span>
    </div>

    <div class="p-4 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
      <span class="text-xs font-medium text-muted-foreground">Resolved Discrepancies</span>
      <p class="text-2xl font-bold text-emerald-400 mt-1">{resolvedRecons.length}</p>
      <span class="text-[11px] text-muted-foreground mt-0.5 block">Historical reconciliations</span>
    </div>

    <div class="p-4 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
      <span class="text-xs font-medium text-muted-foreground">Sync Health</span>
      <p class="text-2xl font-bold text-foreground mt-1">
        {latestRun?.status === 'SUCCESS' ? 'HEALTHY' : latestRun?.status || 'IDLE'}
      </p>
      <span class="text-[11px] text-muted-foreground mt-0.5 block">Isolated staging buffer</span>
    </div>
  </div>

  <!-- Navigation Tabs -->
  <div class="flex items-center gap-2 border-b border-border/40 pb-2">
    <button
      class={`px-4 py-2 text-xs font-medium rounded-lg transition ${activeTab === 'RECONCILIATION' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
      onclick={() => (activeTab = 'RECONCILIATION')}
    >
      Discrepancy Matrix ({pendingRecons.length})
    </button>
    <button
      class={`px-4 py-2 text-xs font-medium rounded-lg transition ${activeTab === 'MUTATIONS' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
      onclick={() => (activeTab = 'MUTATIONS')}
    >
      Gated Mutations ({pendingMutations.length})
    </button>
    <button
      class={`px-4 py-2 text-xs font-medium rounded-lg transition ${activeTab === 'RUNS' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
      onclick={() => (activeTab = 'RUNS')}
    >
      Sync Audit Logs ({syncRuns.length})
    </button>
  </div>

  <!-- Tab 1: Discrepancy Matrix -->
  {#if activeTab === 'RECONCILIATION'}
    <div class="rounded-xl border border-border/40 bg-card/50 overflow-hidden shadow-sm">
      <div class="p-4 border-b border-border/40 flex items-center justify-between">
        <div>
          <h2 class="text-sm font-semibold text-foreground">Status & Data Discrepancies</h2>
          <p class="text-xs text-muted-foreground mt-0.5">
            Decoupled dual-status comparison. Accepting EXPA status updates the official status without overwriting local readiness flags.
          </p>
        </div>
      </div>

      {#if loading}
        <div class="p-8 text-center text-xs text-muted-foreground">Scanning reconciliation matrix...</div>
      {:else if reconciliations.length === 0}
        <div class="p-8 text-center text-xs text-muted-foreground">
          No discrepancies detected. Local source of truth and EXPA staging buffer are synchronized.
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-muted/30 text-muted-foreground border-b border-border/40 font-medium">
              <tr>
                <th class="p-3">Entity / Type</th>
                <th class="p-3">Field Name</th>
                <th class="p-3">Local Truth</th>
                <th class="p-3">Official EXPA</th>
                <th class="p-3">Discrepancy Type</th>
                <th class="p-3">Resolution</th>
                <th class="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border/20">
              {#each reconciliations as recon}
                <tr class="hover:bg-muted/10 transition">
                  <td class="p-3">
                    <span class="font-mono font-medium text-foreground">{recon.entity_type}</span>
                    <span class="block text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                      {recon.local_entity_id || 'UNLINKED'}
                    </span>
                  </td>
                  <td class="p-3 font-mono text-muted-foreground">{recon.field_name}</td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono font-bold">
                      {recon.local_value || 'NONE'}
                    </span>
                  </td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-bold">
                      {recon.expa_value || 'NONE'}
                    </span>
                  </td>
                  <td class="p-3">
                    <span class="text-[11px] text-amber-400 font-medium">{recon.discrepancy_type}</span>
                  </td>
                  <td class="p-3">
                    <span class={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      recon.resolution_status === 'PENDING'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : recon.resolution_status === 'EXPA_ACCEPTED'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {recon.resolution_status}
                    </span>
                  </td>
                  <td class="p-3 text-right">
                    {#if recon.resolution_status === 'PENDING'}
                      <div class="inline-flex items-center gap-1.5">
                        <button
                          class="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium transition"
                          onclick={() => openResolve(recon, 'LOCAL_KEPT')}
                        >
                          Keep Local
                        </button>
                        <button
                          class="px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 text-[11px] font-medium transition"
                          onclick={() => openResolve(recon, 'EXPA_ACCEPTED')}
                        >
                          Accept EXPA
                        </button>
                      </div>
                    {:else}
                      <span class="text-[11px] text-muted-foreground">Resolved</span>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Tab 2: Outbound Gated Mutations Queue -->
  {#if activeTab === 'MUTATIONS'}
    <div class="rounded-xl border border-border/40 bg-card/50 overflow-hidden shadow-sm">
      <div class="p-4 border-b border-border/40">
        <h2 class="text-sm font-semibold text-foreground">Outbound Gated Mutations</h2>
        <p class="text-xs text-muted-foreground mt-0.5">
          Consequential write actions bound for official EXPA/GIS require explicit human officer authorization.
        </p>
      </div>

      {#if mutations.length === 0}
        <div class="p-8 text-center text-xs text-muted-foreground">
          No pending outbound mutations for EXPA.
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-muted/30 text-muted-foreground border-b border-border/40 font-medium">
              <tr>
                <th class="p-3">Action</th>
                <th class="p-3">Target Entity</th>
                <th class="p-3">EXPA ID</th>
                <th class="p-3">Status</th>
                <th class="p-3">Created</th>
                <th class="p-3 text-right">Officer Authorization</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border/20">
              {#each mutations as mut}
                <tr class="hover:bg-muted/10 transition">
                  <td class="p-3 font-semibold text-foreground">{mut.target_action}</td>
                  <td class="p-3 font-mono text-muted-foreground">{mut.entity_type}</td>
                  <td class="p-3 font-mono text-blue-400">{mut.expa_id}</td>
                  <td class="p-3">
                    <span class={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      mut.status === 'PENDING_HUMAN_APPROVAL'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : mut.status === 'DISPATCHED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {mut.status}
                    </span>
                  </td>
                  <td class="p-3 text-muted-foreground">{new Date(mut.created_at).toLocaleDateString()}</td>
                  <td class="p-3 text-right">
                    {#if mut.status === 'PENDING_HUMAN_APPROVAL'}
                      <div class="inline-flex items-center gap-1.5">
                        <button
                          class="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-medium transition"
                          onclick={() => openReject(mut)}
                        >
                          Reject
                        </button>
                        <button
                          class="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium transition"
                          onclick={() => handleApproveMutation(mut.id)}
                        >
                          Approve & Push
                        </button>
                      </div>
                    {:else if mut.status === 'DISPATCHED'}
                      <span class="text-[11px] text-emerald-400">Pushed to GIS</span>
                    {:else}
                      <span class="text-[11px] text-red-400">Rejected</span>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Tab 3: Sync Runs Audit History -->
  {#if activeTab === 'RUNS'}
    <div class="rounded-xl border border-border/40 bg-card/50 overflow-hidden shadow-sm">
      <div class="p-4 border-b border-border/40">
        <h2 class="text-sm font-semibold text-foreground">Sync Ingestion History</h2>
        <p class="text-xs text-muted-foreground mt-0.5">
          Audit trails of all webhook events and polling runs into local staging tables.
        </p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-muted/30 text-muted-foreground border-b border-border/40 font-medium">
            <tr>
              <th class="p-3">Run ID</th>
              <th class="p-3">Sync Mode</th>
              <th class="p-3">Status</th>
              <th class="p-3">Scanned</th>
              <th class="p-3">Staged</th>
              <th class="p-3">Conflicts</th>
              <th class="p-3">Started At</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/20">
            {#each syncRuns as run}
              <tr class="hover:bg-muted/10 transition">
                <td class="p-3 font-mono text-muted-foreground">{run.id.slice(0, 8)}...</td>
                <td class="p-3 font-semibold text-foreground">{run.sync_mode}</td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {run.status}
                  </span>
                </td>
                <td class="p-3 font-mono">{run.records_scanned}</td>
                <td class="p-3 font-mono">{run.records_staged}</td>
                <td class="p-3 font-mono text-amber-400 font-bold">{run.conflicts_detected}</td>
                <td class="p-3 text-muted-foreground">{new Date(run.started_at).toLocaleString()}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>

<!-- Resolution Modal -->
{#if showResolveModal && selectedRecon}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
    <div class="w-full max-w-md rounded-xl border border-border/60 bg-card p-5 shadow-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-border/40 pb-3">
        <h3 class="text-base font-bold text-foreground">Resolve Discrepancy</h3>
        <button class="text-muted-foreground hover:text-foreground" onclick={() => (showResolveModal = false)}>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div class="space-y-3 text-xs">
        <div class="p-3 rounded-lg bg-muted/40 border border-border/40 space-y-1.5">
          <div class="flex justify-between">
            <span class="text-muted-foreground">Field:</span>
            <span class="font-mono font-bold text-foreground">{selectedRecon.field_name}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Local Value:</span>
            <span class="font-mono text-zinc-300">{selectedRecon.local_value || 'None'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Official EXPA:</span>
            <span class="font-mono text-blue-400 font-bold">{selectedRecon.expa_value || 'None'}</span>
          </div>
        </div>

        <div class="space-y-1">
          <label class="block font-medium text-foreground">Resolution Strategy</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class={`p-2 rounded-lg text-left border text-xs transition ${
                resolveStrategy === 'EXPA_ACCEPTED'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/40 hover:bg-muted/20'
              }`}
              onclick={() => (resolveStrategy = 'EXPA_ACCEPTED')}
            >
              <div class="font-bold">Accept EXPA</div>
              <div class="text-[10px] text-muted-foreground mt-0.5">Aligns official status; keeps readiness intact</div>
            </button>
            <button
              type="button"
              class={`p-2 rounded-lg text-left border text-xs transition ${
                resolveStrategy === 'LOCAL_KEPT'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/40 hover:bg-muted/20'
              }`}
              onclick={() => (resolveStrategy = 'LOCAL_KEPT')}
            >
              <div class="font-bold">Keep Local Truth</div>
              <div class="text-[10px] text-muted-foreground mt-0.5">Retains local operational status</div>
            </button>
          </div>
        </div>

        <div class="space-y-1">
          <label class="block font-medium text-foreground">Officer Notes / Justification</label>
          <textarea
            bind:value={resolveNotes}
            rows="2"
            placeholder="Verified match with MC IR or portal screenshot..."
            class="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          ></textarea>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2 border-t border-border/40">
        <button
          type="button"
          class="px-3 py-1.5 rounded-lg border border-border/60 text-xs font-medium hover:bg-muted/30 transition"
          onclick={() => (showResolveModal = false)}
        >
          Cancel
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition"
          onclick={executeResolve}
        >
          Confirm Resolution
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Mutation Reject Modal -->
{#if showRejectModal && selectedMutation}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
    <div class="w-full max-w-sm rounded-xl border border-border/60 bg-card p-5 shadow-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-border/40 pb-3">
        <h3 class="text-base font-bold text-foreground">Reject Outbound Mutation</h3>
        <button class="text-muted-foreground hover:text-foreground" onclick={() => (showRejectModal = false)}>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div class="space-y-3 text-xs">
        <p class="text-muted-foreground">
          Please provide a reason for rejecting mutation <span class="font-mono text-foreground">{selectedMutation.target_action}</span> for EXPA ID <span class="font-mono text-blue-400">{selectedMutation.expa_id}</span>.
        </p>

        <div class="space-y-1">
          <label class="block font-medium text-foreground">Rejection Reason *</label>
          <textarea
            bind:value={rejectReason}
            rows="3"
            placeholder="Document prerequisites not fulfilled..."
            class="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          ></textarea>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2 border-t border-border/40">
        <button
          type="button"
          class="px-3 py-1.5 rounded-lg border border-border/60 text-xs font-medium hover:bg-muted/30 transition"
          onclick={() => (showRejectModal = false)}
        >
          Cancel
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-500 transition disabled:opacity-50"
          disabled={!rejectReason.trim()}
          onclick={executeReject}
        >
          Reject Mutation
        </button>
      </div>
    </div>
  </div>
{/if}
