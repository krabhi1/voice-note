<script lang="ts">
	import type { PageProps } from './$types';
	import RecordingsList from '$lib/components/app/RecordingsList.svelte';

	let { data }: PageProps = $props();
	
</script>

<div class="flex min-h-svh flex-col">
	<RecordingsList recordings={data.recordings} pagination={data.pagination} />
</div>
