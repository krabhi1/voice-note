<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { type Recording } from '$lib/server/db/schema';
	import type { PaginationMeta } from '$lib/types/pagination';
	import { VALID_PAGE_SIZES, type ValidPageSize } from '$lib/types/pagination';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Play, MoreHorizontal, StarIcon } from '@lucide/svelte';
	import * as Table from '$lib/components/ui/table/index.js';

	interface Props {
		recordings: Recording[];
		pagination: PaginationMeta;
	}

	let { recordings, pagination }: Props = $props();

	function navigateToPage(pageNumber: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', pageNumber.toString());
		goto(url.toString(), { replaceState: false });
	}

	function changePageSize(newPageSize: ValidPageSize) {
		const url = new URL($page.url);
		url.searchParams.set('size', newPageSize.toString());
		url.searchParams.set('page', '1');
		goto(url.toString(), { replaceState: false });
	}

	function formatDuration(milliseconds: number): number {
		return Math.round(milliseconds / 1000);
	}

	function formatFileSize(bytes: number): number {
		return Math.round(bytes / 1024);
	}

	function formatDate(dateString: Date): string {
		return dateString.toLocaleString();
	}
</script>

{#if pagination.totalItems > 0}
	<div class="bg-background p-4">
		<div class="mx-auto max-w-4xl space-y-6">
			<h2 class="text-xl font-bold">Your Recordings</h2>

			{#if recordings?.length > 0}
				<div class="mb-6">
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
								<Table.Row class="group">
									<Table.Cell>
										<Button variant="ghost" size="icon" class="h-8 w-8">
											<Play class="h-4 w-4" />
											<span class="sr-only">Play</span>
										</Button>
									</Table.Cell>

									<Table.Cell class="min-w-0 truncate font-medium">
										{recording.title}
									</Table.Cell>

									<!-- <Table.Cell
										class="hidden w-32 truncate text-sm text-muted-foreground md:table-cell"
									></Table.Cell> -->

									<Table.Cell class="hidden w-40 text-sm text-muted-foreground sm:table-cell">
										{formatDate(recording.createdAt)}
									</Table.Cell>

									<!-- <Table.Cell class="text-center">
										<div class="flex items-center justify-center">
											<Checkbox aria-label="Favorite" />
										</div>
									</Table.Cell> -->

									<Table.Cell class="text-end font-mono text-sm text-muted-foreground">
										{formatDuration(recording.duration)}s
									</Table.Cell>

									<Table.Cell>
										<div class="flex justify-end">
											<Button
												variant="ghost"
												size="icon"
												class="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
											>
												<MoreHorizontal class="h-4 w-4" />
												<span class="sr-only">More options</span>
											</Button>
										</div>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			{/if}

			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-4">
					<div class="flex items-center gap-2 text-sm text-muted-foreground">
						<span>Count:</span>
						<Select.Root
							type="single"
							value={String(pagination.pageSize)}
							onValueChange={(v) => changePageSize(Number(v) as ValidPageSize)}
						>
							<Select.Trigger class="h-8 w-20">
								{pagination.pageSize}
							</Select.Trigger>
							<Select.Content>
								{#each VALID_PAGE_SIZES as size}
									<Select.Item value={String(size)} label={String(size)} />
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<div class="text-sm text-muted-foreground">
						Page {pagination.currentPage} of {Math.ceil(
							pagination.totalItems / pagination.pageSize
						)}
					</div>
				</div>

				<div class="mt-2 sm:mt-0">
					<Pagination.Root
						count={pagination.totalItems}
						perPage={pagination.pageSize}
						page={pagination.currentPage}
						onPageChange={navigateToPage}
						class="mx-0 w-auto"
					>
						{#snippet children({ pages, currentPage })}
							<Pagination.Content>
								<Pagination.Item>
									<Pagination.PrevButton />
								</Pagination.Item>
								{#each pages as page (page.key)}
									{#if page.type === 'ellipsis'}
										<Pagination.Item>
											<Pagination.Ellipsis />
										</Pagination.Item>
									{:else}
										<Pagination.Item>
											<Pagination.Link {page} isActive={currentPage === page.value}>
												{page.value}
											</Pagination.Link>
										</Pagination.Item>
									{/if}
								{/each}
								<Pagination.Item>
									<Pagination.NextButton />
								</Pagination.Item>
							</Pagination.Content>
						{/snippet}
					</Pagination.Root>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="bg-background p-4">
		<div class="mx-auto max-w-4xl">
			<Card.Root>
				<Card.Content
					class="flex flex-col items-center justify-center py-12 text-center text-muted-foreground"
				>
					<p>No recordings found. Start by creating your first voice note!</p>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
{/if}
