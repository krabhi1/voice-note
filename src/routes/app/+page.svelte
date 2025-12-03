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
	<div class="flex flex-1 flex-col items-center justify-center p-8 py-20">
		<div class="mb-8 text-center text-gray-700">
			<p class="text-lg">Click the button to start recording.</p>
		</div>

		<a
			href="/app/record"
			class="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gray-600 text-white shadow-lg transition-all hover:scale-105 hover:bg-gray-700"
		>
			<Mic class="h-8 w-8" />
		</a>

		<div class="absolute top-4 right-4">
			<button
				onclick={handleSignOut}
				class="rounded-lg bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200"
			>
				Sign Out
			</button>
		</div>
	</div>
	<!-- Recordings List (shown when not in active recording workflow) -->
	<RecordingsList recordings={data.recordings} pagination={data.pagination} />
</div>
