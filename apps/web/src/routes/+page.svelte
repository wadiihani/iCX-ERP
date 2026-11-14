<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth.svelte';

	onMount(() => {
		if (auth.isAuthenticated) {
			goto('/dashboard');
		} else {
			goto('/login');
		}
	});
</script>

<div class="min-h-screen flex items-center justify-center bg-surface-0 text-content-muted">
	<div class="flex flex-col items-center gap-3">
		<div class="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
		<p class="text-sm font-medium">Entering iCX Command Center...</p>
	</div>
</div>
