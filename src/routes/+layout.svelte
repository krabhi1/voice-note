<script lang="ts">
	import '../app.css';
	import { Toaster } from '@/components/ui/sonner';
	import * as Tooltip from '$lib/components/ui/tooltip';

	let { children } = $props();
</script>

<svelte:head>
	<title>VoiceNote</title>
	<meta name="description" content="VoiceNote - Your personal voice note-taking app" />
</svelte:head>
<Toaster />
<Tooltip.Provider>
	{@render children?.()}
</Tooltip.Provider>
