<script lang="ts">
	import { type PaginationMeta, type ValidPageSize, VALID_PAGE_SIZES } from '$lib/utils/pagination';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Select from '$lib/components/ui/select';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

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
