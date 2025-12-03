<script lang="ts">
	import { goto } from '$app/navigation';
	import { client } from '$lib/auth-client';
	import type { PageProps } from './$types';

	import { Mic } from '@lucide/svelte';
	import RecordingsList from './RecordingsList.svelte';

	let { data }: PageProps = $props();
	async function handleSignOut() {
		await client.signOut({
			fetchOptions: {
				onSuccess: () => goto('/')
			}
		});
	}
</script>

<div class="flex min-h-svh flex-col">
	<RecordingsList recordings={data.recordings} pagination={data.pagination} />
</div>
