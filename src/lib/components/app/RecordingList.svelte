<script lang="ts">
	import { goto } from '$app/navigation';
	import { type Recording } from '$lib/server/db/schema';
	import { Button } from '$lib/components/ui/button/index.js';

	import * as Table from '$lib/components/ui/table/index.js';
	import { type PaginationMeta } from '$lib/utils/pagination';
	import RecordingItem from './RecordingItem.svelte';
	import RecordingPagination from './RecordingPagination.svelte';

	interface Props {
		recordings: Recording[];
		pagination: PaginationMeta;
	}

	let { recordings, pagination }: Props = $props();
</script>

<div class="flex h-screen flex-col bg-background p-4">
	<div class="mx-auto flex min-h-0 w-full flex-1 flex-col lg:max-w-4xl">
		<!-- Header -->
		<h2 class="mb-6 text-xl font-bold">Your Recordings</h2>

		{#if recordings?.length > 0}
			<!-- Table Container with flex-1 and scroll -->
			<div class="mb-6 flex-1 overflow-auto">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-10">
								<span class="sr-only">Play</span>
							</Table.Head>
							<Table.Head>Name</Table.Head>
							<!-- <Table.Head class="hidden w-32 md:table-cell">Group</Table.Head> -->
							<Table.Head class="hidden w-40 sm:table-cell">CreatedAt</Table.Head>
							<!-- <Table.Head class="w-10 text-center">
											<StarIcon class="mx-auto h-4 w-4" />
										</Table.Head> -->
							<Table.Head class="w-16 text-end">Duration</Table.Head>
							<Table.Head class="w-8"></Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each recordings as recording}
							<RecordingItem {recording} />
						{/each}
					</Table.Body>
				</Table.Root>
			</div>

			<!-- Pagination-->
			<RecordingPagination {pagination} />
		{:else}
			<div
				class="rounded-lg border-2 border-dashed border-foreground/10 bg-muted/50 p-8 text-center"
			>
				<h3 class="text-lg font-semibold">No recordings yet</h3>
				<p class="mt-2 text-sm text-muted-foreground">
					Start recording your voice notes to keep track of ideas, reminders, and thoughts.
				</p>

				<div class="mt-4 flex justify-center">
					<Button onclick={() => goto('/app/record')} class="h-10 px-4">Start recording</Button>
				</div>
			</div>
		{/if}
	</div>
</div>
