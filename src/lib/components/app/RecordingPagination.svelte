<script lang="ts">
	import { type PaginationMeta, type ValidPageSize, VALID_PAGE_SIZES } from '$lib/utils/pagination';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Select from '$lib/components/ui/select';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';

	interface Props {
		pagination: PaginationMeta;
	}

	let { pagination }: Props = $props();

	function changePageSize(newPageSize: ValidPageSize) {
		const url = new URL(page.url);
		url.searchParams.set('size', newPageSize.toString());
		url.searchParams.set('page', '1');
		goto(url.toString(), { replaceState: false });
	}

	function navigateToPage(pageNumber: number) {
		const url = new URL(page.url);
		url.searchParams.set('page', pageNumber.toString());
		goto(url.toString(), { replaceState: false });
	}
</script>

<div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
	<div class="flex items-center gap-8">
		<!-- Page Size Selector -->
		<div class="flex items-center gap-3">
			<span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Show</span>
			<Select.Root
				type="single"
				value={String(pagination.pageSize)}
				onValueChange={(v) => changePageSize(Number(v) as ValidPageSize)}
			>
				<Select.Trigger
					class="h-8 w-[70px] rounded-none border-zinc-200 bg-white text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-zinc-50"
				>
					{pagination.pageSize}
				</Select.Trigger>
				<Select.Content class="rounded-none border-zinc-200 shadow-xl">
					{#each VALID_PAGE_SIZES as size}
						<Select.Item
							value={String(size)}
							label={String(size)}
							class="rounded-none text-[10px] font-bold uppercase tracking-widest focus:bg-zinc-50"
						>
							{size}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<!-- Page Info -->
		<div class="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
			Page <span class="text-black">{pagination.currentPage}</span> of
			<span class="text-black">{Math.ceil(pagination.totalItems / pagination.pageSize)}</span>
		</div>
	</div>

	<!-- Pagination Controls -->
	<div class="mt-2 sm:mt-0">
		<Pagination.Root
			count={pagination.totalItems}
			perPage={pagination.pageSize}
			page={pagination.currentPage}
			onPageChange={navigateToPage}
			class="mx-0 w-auto"
		>
			{#snippet children({ pages, currentPage })}
				<Pagination.Content class="gap-1">
					<Pagination.Item>
						<Pagination.PrevButton
							class="h-8 w-8 rounded-none border border-zinc-200 bg-white p-0 transition-colors hover:bg-zinc-50 hover:text-black disabled:opacity-30"
						>
							<ChevronLeft class="h-4 w-4" />
						</Pagination.PrevButton>
					</Pagination.Item>

					{#each pages as page (page.key)}
						{#if page.type === 'ellipsis'}
							<Pagination.Item>
								<Pagination.Ellipsis class="text-zinc-400" />
							</Pagination.Item>
						{:else}
							<Pagination.Item>
								<Pagination.Link
									{page}
									isActive={currentPage === page.value}
									class="h-8 w-8 rounded-none border border-zinc-200 bg-white text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-zinc-50 hover:text-black data-[selected]:bg-black data-[selected]:text-white data-[selected]:border-black"
								>
									{page.value}
								</Pagination.Link>
							</Pagination.Item>
						{/if}
					{/each}

					<Pagination.Item>
						<Pagination.NextButton
							class="h-8 w-8 rounded-none border border-zinc-200 bg-white p-0 transition-colors hover:bg-zinc-50 hover:text-black disabled:opacity-30"
						>
							<ChevronRight class="h-4 w-4" />
						</Pagination.NextButton>
					</Pagination.Item>
				</Pagination.Content>
			{/snippet}
		</Pagination.Root>
	</div>
</div>