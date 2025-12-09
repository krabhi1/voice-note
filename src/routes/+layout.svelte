<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from '@/components/ui/sonner';
	import * as Tooltip from '$lib/components/ui/tooltip';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<Toaster />
<Tooltip.Provider>
	{@render children?.()}
</Tooltip.Provider>
