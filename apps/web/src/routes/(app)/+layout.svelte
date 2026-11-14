<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';

	let { children } = $props<{ children: any }>();
	let isSidebarOpen = $state(true);

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}
</script>

<div class="min-h-screen flex flex-col bg-surface-0">
	<Header onToggleSidebar={toggleSidebar} />
	
	<div class="flex-1 flex overflow-hidden">
		<Sidebar isOpen={isSidebarOpen} />
		
		<main class="flex-1 overflow-y-auto p-6 transition-colors">
			{@render children()}
		</main>
	</div>
</div>
