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
	<div class="border-b border-muted/30 px-6 py-8 sm:px-10 sm:py-10">
		<div class="mx-auto max-w-5xl flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<span class="text-xs font-bold text-secondary">Library</span>
				<h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Your Recordings</h1>
			</div>
			<Button onclick={() => goto('/app/record')} class="w-full font-bold sm:w-auto">
				<Plus class="mr-2 h-4 w-4" /> New Recording
			</Button>
		</div>
	</div>

	<div class="flex-1 overflow-hidden px-4 py-6 sm:px-10 sm:py-10">
		<div class="mx-auto h-full max-w-5xl">
			{#if recordings?.length > 0}
				<div class="flex h-full flex-col">
					<!-- Desktop Table View -->
					<div class="mb-8 hidden flex-1 overflow-auto rounded-lg border border-muted bg-card shadow-xl shadow-muted/20 sm:block">
						<Table.Root>
							<Table.Header class="bg-muted/10">
								<Table.Row class="hover:bg-transparent border-b border-muted/30">
									<Table.Head class="w-12 py-4"></Table.Head>
									<Table.Head class="py-4 text-xs font-bold text-secondary">Title</Table.Head>
									<Table.Head class="hidden py-4 text-xs font-bold text-secondary md:table-cell">Created</Table.Head>
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

					<!-- Mobile Card View -->
					<div class="mb-8 flex-1 overflow-auto sm:hidden">
						<div class="flex flex-col gap-3">
							{#each recordings as recording (recording.id)}
								<RecordingItem {recording} isMobile={true} />
							{/each}
						</div>
					</div>

					<RecordingPagination {pagination} />
				</div>
			{:else}
				<div class="flex h-[400px] flex-col items-center justify-center rounded-lg border border-muted bg-card p-8 text-center sm:p-12">
					<div class="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-muted/20 text-secondary">
						<Mic class="h-6 w-6" />
					</div>
					<h3 class="text-base font-bold text-foreground">No recordings found</h3>
					<p class="mt-2 max-w-xs text-sm text-secondary">Your workspace is empty. Start capturing your thoughts.</p>
					<Button onclick={() => goto('/app/record')} class="mt-8 w-full px-8 font-bold sm:w-auto">Start Recording</Button>
				</div>
			{/if}
		</div>
	</div>
</div>