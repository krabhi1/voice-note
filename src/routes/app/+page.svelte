<script lang="ts">
	import { goto } from '$app/navigation';
	import { client } from '$lib/auth-client';

	const session = client.useSession();

	if (!session) {
		goto('/sign-in');
	}

	async function signOut() {
		await client.signOut({
			fetchOptions: {
				onSuccess: () => {
					goto('/sign-in');
				}
			}
		});
	}
</script>

<div class="mx-auto max-w-md p-6">
	{#if $session.isPending}
		<p class="text-gray-600">Loading session...</p>
	{:else}
		<p class="mb-4 text-lg font-medium">
			Signed in as: {$session.data?.user.email}
		</p>
		<button
			on:click={signOut}
			class="mb-4 rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
		>
			Sign Out
		</button>
		<pre class="overflow-auto rounded bg-gray-100 p-4 text-sm">{JSON.stringify(
				$session,
				null,
				2
			)}</pre>
	{/if}
</div>
