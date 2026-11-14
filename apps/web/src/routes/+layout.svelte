<script lang="ts">
	import '../app.css';
	import { theme } from '$lib/stores/theme.svelte';
	import { auth } from '$lib/stores/auth.svelte';

	let { children } = $props<{ children: any }>();
</script>

{@render children()}
