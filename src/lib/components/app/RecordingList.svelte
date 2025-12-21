<script lang="ts">
	import { goto } from '$app/navigation';
	import { type Recording } from '$lib/server/db/schema';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import { type PaginationMeta } from '$lib/utils/pagination';
	import RecordingItem from './RecordingItem.svelte';
	import RecordingPagination from './RecordingPagination.svelte';
	import { Mic, Plus } from '@lucide/svelte';

	let { recordings, pagination }: { recordings: Recording[]; pagination: PaginationMeta } = $props();
</script>

<div class="flex h-full flex-col bg-background">
	<div class="border-b border-muted/30 px-6 py-10 sm:px-10">
		<div class="mx-auto max-w-5xl flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<span class="text-xs font-bold text-secondary">Library</span>
				<h1 class="text-3xl font-bold tracking-tight text-foreground">Your Recordings</h1>
			</div>
			<Button onclick={() => goto('/app/record')} class="font-bold">
				<Plus class="mr-2 h-4 w-4" /> New Recording
			</Button>
		</div>
	</div>

	<div class="flex-1 overflow-hidden px-6 py-10 sm:px-10">
		<div class="mx-auto h-full max-w-5xl">
			{#if recordings?.length > 0}
				<div class="flex h-full flex-col">
					<div class="mb-8 flex-1 overflow-auto rounded-lg border border-muted bg-card shadow-xl shadow-muted/20">
						<Table.Root>
							<Table.Header class="bg-muted/10">
								<Table.Row class="hover:bg-transparent border-b border-muted/30">
									<Table.Head class="w-12 py-4"></Table.Head>
									<Table.Head class="py-4 text-xs font-bold text-secondary">Title</Table.Head>
									<Table.Head class="hidden py-4 text-xs font-bold text-secondary sm:table-cell">Created</Table.Head>
									<Table.Head class="w-24 py-4 text-end text-xs font-bold text-secondary">Duration</Table.Head>
									<Table.Head class="w-12 py-4"></Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each recordings as recording (recording.id)}
									<RecordingItem {recording} />
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
					<RecordingPagination {pagination} />
				</div>
			{:else}
				<div class="flex h-[400px] flex-col items-center justify-center rounded-lg border border-muted bg-card p-12 text-center">
					<div class="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-muted/20 text-secondary">
						<Mic class="h-6 w-6" />
					</div>
					<h3 class="text-base font-bold text-foreground">No recordings found</h3>
					<p class="mt-2 max-w-xs text-sm text-secondary">Your workspace is empty. Start capturing your thoughts.</p>
					<Button onclick={() => goto('/app/record')} class="mt-8 px-8 font-bold">Start Recording</Button>
				</div>
			{/if}
		</div>
	</div>
</div>