<script lang="ts">
	import type { PageProps } from './$types';
	import RecordingList from '$lib/components/app/RecordingList.svelte';

	let { data }: PageProps = $props();
	
</script>

<div class="flex min-h-svh flex-col">
	<RecordingList recordings={data.recordings} pagination={data.pagination} />
</div>
