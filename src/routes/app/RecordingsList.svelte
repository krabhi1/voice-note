<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { type Recording } from '$lib/server/db/schema';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { SubmitFunction } from './$types';

	import {
		Trash2Icon,
		Play,
		EllipsisVerticalIcon,
		StarIcon,
		Download,
		Trash2,
		PenIcon,
		DownloadIcon
	} from '@lucide/svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { type PaginationMeta, type ValidPageSize, VALID_PAGE_SIZES } from '$lib/utils/pagination';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

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

	function playRecording(recordingId: string) {
		goto(`/app/${recordingId}`);
	}
</script>

<div class="bg-background p-4 h-screen flex flex-col">
	<div class="mx-auto w-full  lg:max-w-4xl flex flex-col flex-1 min-h-0">
		<!-- Header -->
		<h2 class="text-xl font-bold mb-6">Your Recordings</h2>

		{#if recordings?.length > 0}
			<!-- Table Container with flex-1 and scroll -->
			<div class="flex-1 overflow-auto mb-6">
				{@render RecordingsTable({ recordings })}
			</div>

			<!-- Pagination at bottom -->
			{@render PaginationControls({ pagination })}
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

{#snippet RecordingsTable({ recordings }: { recordings: Recording[] })}
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
						<Button
							onclick={() => playRecording(recording.id)}
							variant="ghost"
							size="icon"
							class="h-8 w-8"
						>
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
							{@render MoreOptionsButton({ recordingId: recording.id })}
						</div>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
{/snippet}

{#snippet MoreOptionsButton({ recordingId }: { recordingId: string })}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button
					variant="ghost"
					size="icon"
					class="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
					{...props}
				>
					<EllipsisVerticalIcon class="h-4 w-4 text-muted-foreground" />
					<span class="sr-only">More options</span>
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>

		<DropdownMenu.Content
			class="w-44 rounded-md border bg-popover p-1 shadow-md"
			side="bottom"
			align="end"
		>
			<DropdownMenu.Item
				class="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm text-muted-foreground hover:bg-muted/10"
			>
				<PenIcon class="h-4 w-4 text-muted-foreground" />
				<span>Rename</span>
			</DropdownMenu.Item>

			<DropdownMenu.Item
				class="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm text-muted-foreground hover:bg-muted/10"
			>
				<DownloadIcon class="h-4 w-4 text-muted-foreground" />
				<span>Download</span>
			</DropdownMenu.Item>

			<DropdownMenu.Separator class="my-1 h-px bg-border" />
			<form
				method="POST"
				action="?/deleteVoice"
				use:enhance={(({ formData, cancel }) => {
					formData.append('recordingId', recordingId);
					return async ({ result, update }) => {
						await update();
						if (result.type === 'success') {
							toast.success('Recording deleted successfully');
						} else if (result.type === 'failure') {
							const errorMessage = result.data?.message || 'An unexpected error occurred.';
							toast.error(errorMessage);
						}
					};
				}) as SubmitFunction}
			>
				<DropdownMenu.Item
					class="flex items-center gap-2 rounded px-2 py-2 text-sm hover:bg-destructive/10!"
				>
					<button type="submit" class="flex w-full items-center gap-2 text-destructive">
						<Trash2Icon class="h-4 w-4 text-destructive" />
						<span>Delete</span>
					</button>
				</DropdownMenu.Item>
			</form>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/snippet}

{#snippet PaginationControls({ pagination }: { pagination: PaginationMeta })}
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-4">
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<span>Per page:</span>
				<Select.Root
					type="single"
					value={String(pagination.pageSize)}
					onValueChange={(v) => changePageSize(Number(v) as ValidPageSize)}
				>
					<Select.Trigger>
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
				Page {pagination.currentPage} of {Math.ceil(pagination.totalItems / pagination.pageSize)}
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
{/snippet}
