<script lang="ts">
	import { onMount } from 'svelte';
	import { sendAIChat, fetchAgentRuns, type AIAgentRun } from '$lib/api/ai';

	// Svelte 5 runes
	let selectedAgent = $state<'POLICY_ASSISTANT' | 'EP_SCREENING_COPILOT' | 'PARTNER_INTEL_COPILOT' | 'RISK_AUDITOR_COPILOT'>('POLICY_ASSISTANT');
	let promptText = $state('');
	let targetId = $state('');
	let proposeAction = $state(false);

	let messages = $state<Array<{ role: 'user' | 'assistant'; text: string; citations?: string[]; proposals?: any[]; created_at: string }>>([]);
	let isLoading = $state(false);
	let errorMsg = $state<string | null>(null);

	const agentDescriptions = {
		POLICY_ASSISTANT: 'Grounded policy question-answering with strict citations from the 2026 Global Compendium & iCX SOP.',
		EP_SCREENING_COPILOT: 'Evaluate candidate applications, language fit, and propose advancement to executive review.',
		PARTNER_INTEL_COPILOT: 'Analyze partner lead engagement, IR SnD conversion patterns, and prepare communications.',
		RISK_AUDITOR_COPILOT: 'Audit 18 Standards fulfillment, flag missing mandatory gates, and evaluate completion eligibility.'
	};

	const quickPrompts: Record<string, string[]> = {
		POLICY_ASSISTANT: [
			'What are the duration and modality requirements for iGV projects?',
			'Can AIESEC entities act as local hosting organizations?',
			'What are the mandatory thresholds for exchange completion?'
		],
		EP_SCREENING_COPILOT: [
			'Evaluate candidate profile and check language proficiency requirements.',
			'Check interview records and propose candidate advancement to SHORTLISTED.'
		],
		PARTNER_INTEL_COPILOT: [
			'Summarize B2B lead pipeline for IT corporate partners in Rabat.',
			'Analyze sending entity match conversion patterns for iGTa.'
		],
		RISK_AUDITOR_COPILOT: [
			'Audit standards fulfillment and list any missing mandatory gates.',
			'Check whether the active exchange is eligible for completion.'
		]
	};

	async function handleSubmit() {
		if (!promptText.trim() || isLoading) return;
		const userMsg = promptText.trim();
		promptText = '';
		errorMsg = null;

		messages = [...messages, { role: 'user', text: userMsg, created_at: new Date().toISOString() }];
		isLoading = true;

		try {
			const res = await sendAIChat({
				agent_name: selectedAgent,
				prompt: userMsg,
				target_id: targetId || undefined,
				propose_action: proposeAction
			});

			messages = [
				...messages,
				{
					role: 'assistant',
					text: res.response_text,
					citations: res.citations,
					proposals: res.proposals_created,
					created_at: res.created_at
				}
			];
		} catch (err: any) {
			errorMsg = err.message || 'AI agent execution failed';
		} finally {
			isLoading = false;
		}
	}

	function useQuickPrompt(q: string) {
		promptText = q;
	}

	onMount(() => {
		// Seed welcome message
		messages = [
			{
				role: 'assistant',
				text: 'Welcome to the AIESEC iCX Multi-Agent Copilot Workspace. I operate under strict containment invariants: all factual claims are grounded in official documentation with citations, and all consequential actions are routed to the Executive Approval Center.',
				created_at: new Date().toISOString()
			}
		];
	});
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
		<div>
			<h1 class="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
				<span class="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
					</svg>
				</span>
				AI Copilot Workspace
			</h1>
			<p class="text-sm text-muted-foreground mt-1">
				Specialized LangGraph agents for policy verification, candidate screening, partner intelligence, and compliance audits.
			</p>
		</div>

		<a
			href="/approvals"
			class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
		>
			<span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
			View Approval Center &rarr;
		</a>
	</div>

	<!-- Alert Messages -->
	{#if errorMsg}
		<div class="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center justify-between">
			<span>{errorMsg}</span>
			<button class="text-xs underline" onclick={() => (errorMsg = null)}>Dismiss</button>
		</div>
	{/if}

	<!-- Agent Selector Tabs -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
		<button
			type="button"
			class="p-4 rounded-xl border text-left transition-all {selectedAgent === 'POLICY_ASSISTANT' ? 'bg-card border-primary ring-1 ring-primary shadow-sm' : 'bg-card/50 border-border hover:border-muted-foreground/40'}"
			onclick={() => (selectedAgent = 'POLICY_ASSISTANT')}
		>
			<div class="text-xs font-bold text-foreground">Policy Assistant (RAG)</div>
			<div class="text-[11px] text-muted-foreground mt-1 leading-snug">Global Compendium &amp; SOP citations</div>
		</button>

		<button
			type="button"
			class="p-4 rounded-xl border text-left transition-all {selectedAgent === 'EP_SCREENING_COPILOT' ? 'bg-card border-primary ring-1 ring-primary shadow-sm' : 'bg-card/50 border-border hover:border-muted-foreground/40'}"
			onclick={() => (selectedAgent = 'EP_SCREENING_COPILOT')}
		>
			<div class="text-xs font-bold text-foreground">EP Screening Copilot</div>
			<div class="text-[11px] text-muted-foreground mt-1 leading-snug">Background checks &amp; advancement proposals</div>
		</button>

		<button
			type="button"
			class="p-4 rounded-xl border text-left transition-all {selectedAgent === 'PARTNER_INTEL_COPILOT' ? 'bg-card border-primary ring-1 ring-primary shadow-sm' : 'bg-card/50 border-border hover:border-muted-foreground/40'}"
			onclick={() => (selectedAgent = 'PARTNER_INTEL_COPILOT')}
		>
			<div class="text-xs font-bold text-foreground">Partner &amp; IR Intel</div>
			<div class="text-[11px] text-muted-foreground mt-1 leading-snug">B2B leads &amp; sending entity conversion</div>
		</button>

		<button
			type="button"
			class="p-4 rounded-xl border text-left transition-all {selectedAgent === 'RISK_AUDITOR_COPILOT' ? 'bg-card border-primary ring-1 ring-primary shadow-sm' : 'bg-card/50 border-border hover:border-muted-foreground/40'}"
			onclick={() => (selectedAgent = 'RISK_AUDITOR_COPILOT')}
		>
			<div class="text-xs font-bold text-foreground">Risk &amp; Standards Auditor</div>
			<div class="text-[11px] text-muted-foreground mt-1 leading-snug">18 standards &amp; completion gates</div>
		</button>
	</div>

	<!-- Active Agent Information Banner -->
	<div class="p-3.5 rounded-xl border border-border/60 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
		<span>{agentDescriptions[selectedAgent]}</span>
		<span class="font-mono text-[10px] uppercase font-bold text-primary">LangGraph v1.0 • Bounded Tools</span>
	</div>

	<!-- Chat Conversation Area -->
	<div class="rounded-xl border border-border bg-card shadow-sm flex flex-col h-[520px]">
		<!-- Timeline Messages -->
		<div class="flex-1 overflow-y-auto p-5 space-y-4">
			{#each messages as msg}
				<div class="flex flex-col {msg.role === 'user' ? 'items-end' : 'items-start'}">
					<div
						class="max-w-2xl rounded-xl p-4 text-xs leading-relaxed space-y-2 {msg.role === 'user' ? 'bg-primary text-primary-foreground font-medium' : 'bg-muted/50 border border-border/70 text-foreground'}"
					>
						<p class="whitespace-pre-line">{msg.text}</p>

						<!-- Citations Box if present -->
						{#if msg.citations && msg.citations.length > 0}
							<div class="mt-2 pt-2 border-t border-border/40 space-y-1">
								<span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Verified Citations:</span>
								{#each msg.citations as cit}
									<div class="text-[11px] font-mono text-primary flex items-center gap-1.5">
										<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
										<span>{cit}</span>
									</div>
								{/each}
							</div>
						{/if}

						<!-- Action Proposal Card if created -->
						{#if msg.proposals && msg.proposals.length > 0}
							<div class="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 space-y-2">
								<div class="flex items-center justify-between">
									<span class="font-bold flex items-center gap-1.5">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
										Action Proposal Generated
									</span>
									<span class="font-mono text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded">PENDING REVIEW</span>
								</div>
								<p class="text-[11px] text-muted-foreground">{msg.proposals[0].message}</p>
								<a
									href="/approvals"
									class="inline-block text-xs font-semibold underline hover:opacity-80"
								>
									Review Proposal in Approval Center &rarr;
								</a>
							</div>
						{/if}
					</div>
					<span class="text-[10px] text-muted-foreground mt-1 px-1">
						{msg.role === 'user' ? 'Officer' : selectedAgent} • {msg.created_at.slice(11, 16)}
					</span>
				</div>
			{/each}

			{#if isLoading}
				<div class="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg w-fit">
					<svg class="animate-spin h-3.5 w-3.5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					<span>Analyzing documentation &amp; computing grounded response...</span>
				</div>
			{/if}
		</div>

		<!-- Quick Prompts Row -->
		<div class="p-3 border-t border-border/40 bg-muted/20 flex flex-wrap gap-2 text-[11px]">
			<span class="text-muted-foreground font-semibold py-1">Quick Prompts:</span>
			{#each quickPrompts[selectedAgent] || [] as q}
				<button
					type="button"
					class="px-2.5 py-1 rounded bg-muted/60 hover:bg-muted border border-border/50 text-foreground transition-colors truncate max-w-xs"
					onclick={() => useQuickPrompt(q)}
				>
					{q}
				</button>
			{/each}
		</div>

		<!-- Input Box -->
		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="p-4 border-t border-border/40 bg-card flex flex-col gap-3">
			{#if selectedAgent === 'EP_SCREENING_COPILOT' || selectedAgent === 'RISK_AUDITOR_COPILOT'}
				<div class="flex items-center gap-3 text-xs">
					<label for="target-id" class="text-muted-foreground whitespace-nowrap">
						{selectedAgent === 'EP_SCREENING_COPILOT' ? 'Application ID (Optional):' : 'Exchange ID (Optional):'}
					</label>
					<input
						id="target-id"
						type="text"
						placeholder="UUID or leave blank..."
						class="bg-muted/40 border border-border rounded-lg px-2.5 py-1 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary flex-1 max-w-sm"
						bind:value={targetId}
					/>

					{#if selectedAgent === 'EP_SCREENING_COPILOT'}
						<label class="flex items-center gap-1.5 cursor-pointer text-muted-foreground select-none">
							<input type="checkbox" class="w-3.5 h-3.5 text-primary rounded" bind:checked={proposeAction} />
							<span>Draft Advancement Proposal</span>
						</label>
					{/if}
				</div>
			{/if}

			<div class="flex items-center gap-2">
				<input
					type="text"
					placeholder="Ask {selectedAgent} a question or command..."
					class="flex-1 bg-muted/40 border border-border rounded-lg px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
					bind:value={promptText}
					disabled={isLoading}
				/>
				<button
					type="submit"
					class="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow disabled:opacity-50 transition-all"
					disabled={isLoading || !promptText.trim()}
				>
					Send
				</button>
			</div>
		</form>
	</div>
</div>
