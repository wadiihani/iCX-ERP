<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';

	let { isOpen = true } = $props<{ isOpen?: boolean }>();

	const navSections = [
		{
			title: 'OPERATIONS',
			items: [
				{ name: 'Command Center', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
				{ name: 'PRM / Local Partners', href: '/prm', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
				{ name: 'IRM / Sending Entities', href: '/irm', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064' },
				{ name: 'Opportunities & Slots', href: '/opportunities', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
				{ name: 'CRM / EP Candidates', href: '/crm', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
				{ name: 'Applications & Match', href: '/applications', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
				{ name: 'Exchange Operations', href: '/exchanges', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
				{ name: 'CXP & Standards (18)', href: '/cxp', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
				{ name: 'Finance & Pricing', href: '/finance', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
				{ name: 'Legalities & IAC Risk', href: '/legalities', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
				{ name: 'EXPA Reconciliation', href: '/expa', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
			]
		},
		{
			title: 'GOVERNANCE & AI',
			items: [
				{ name: 'AI Copilot Workspace', href: '/ai', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
				{ name: 'Approval Center', href: '/approvals', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
				{ name: 'Policy & Knowledge Vault', href: '/knowledge', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
			]
		}
	];
</script>

<aside
	class="w-64 border-r border-surface-border bg-surface-1 flex flex-col shrink-0 transition-all duration-300 z-20 {isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}"
>
	<div class="p-4 flex-1 overflow-y-auto space-y-6">
		{#each navSections as section}
			<div>
				<h3 class="px-3 text-[10px] font-bold text-content-muted tracking-wider uppercase mb-2">
					{section.title}
				</h3>
				<nav class="space-y-1">
					{#each section.items as item}
						<a
							href={item.href}
							class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-content-secondary hover:text-content-primary hover:bg-surface-2 transition-colors group"
						>
							<svg class="w-4 h-4 shrink-0 text-content-muted group-hover:text-brand-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
							</svg>
							<span>{item.name}</span>
						</a>
					{/each}
				</nav>
			</div>
		{/each}
	</div>

	<!-- Status Indicator -->
	<div class="p-4 border-t border-surface-border bg-surface-0/50">
		<div class="flex items-center justify-between text-[11px] text-content-muted">
			<span class="flex items-center gap-2">
				<span class="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
				Local Node: Operational
			</span>
			<span class="font-mono text-[10px] font-semibold">v1.0.0</span>
		</div>
	</div>
</aside>
