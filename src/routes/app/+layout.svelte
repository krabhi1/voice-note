<script lang="ts">
    import Sidebar from '$lib/components/app/Sidebar.svelte';

	let { children } = $props();
</script>

<div class="flex h-screen w-full overflow-hidden bg-background">
	<Sidebar />
	<main class="flex-1 overflow-y-auto">
		{@render children?.()}
	</main>
</div>
