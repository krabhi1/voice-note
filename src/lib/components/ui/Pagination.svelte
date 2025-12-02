<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PaginationMeta } from '$lib/types/pagination';
	import { VALID_PAGE_SIZES, type ValidPageSize } from '$lib/types/pagination';

	interface Props {
		pagination: PaginationMeta;
		baseUrl?: string;
	}

	let { pagination, baseUrl = '/app' }: Props = $props();

	function navigateToPage(pageNumber: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', pageNumber.toString());
		goto(url.toString(), { replaceState: false });
	}

	function changePageSize(newPageSize: ValidPageSize) {
		const url = new URL($page.url);
		url.searchParams.set('size', newPageSize.toString());
		url.searchParams.set('page', '1'); // Reset to first page when changing size
		goto(url.toString(), { replaceState: false });
	}

	function getVisiblePageNumbers(): number[] {
		const { currentPage, totalPages } = pagination;
		const maxVisiblePages = 7;

		if (totalPages <= maxVisiblePages) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const halfVisible = Math.floor(maxVisiblePages / 2);
		let start = Math.max(1, currentPage - halfVisible);
		let end = Math.min(totalPages, start + maxVisiblePages - 1);

		// Adjust start if we're near the end
		if (end - start + 1 < maxVisiblePages) {
			start = Math.max(1, end - maxVisiblePages + 1);
		}

		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	const visiblePages = $derived(getVisiblePageNumbers());
	const showFirstEllipsis = $derived(visiblePages[0] > 1);
	const showLastEllipsis = $derived(visiblePages[visiblePages.length - 1] < pagination.totalPages);
</script>
<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
	<!-- Results summary -->
	<div class="text-sm text-gray-700">
		Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to
		{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of
		{pagination.totalItems} recordings
	</div>

	<!-- Pagination controls -->
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
		<!-- Page size selector -->
		<div class="flex items-center gap-2 text-sm text-gray-700">
			<span>Show:</span>
			<select
				value={pagination.pageSize}
				onchange={(e) => changePageSize(Number(e.currentTarget.value) as ValidPageSize)}
				class="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-gray-900 backdrop-blur"
			>
				{#each VALID_PAGE_SIZES as size}
					<option value={size} class="bg-white text-gray-900">{size}</option>
				{/each}
			</select>
			<span>per page</span>
		</div>

		<!-- Page navigation (only show if more than one page) -->
		{#if pagination.totalPages > 1}
			<div class="flex items-center gap-1">
				<!-- Previous button -->
				<button
					type="button"
					disabled={!pagination.hasPreviousPage}
					onclick={() => navigateToPage(pagination.currentPage - 1)}
					class="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-gray-900 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
				>
					<span class="text-lg font-bold">←</span>
				</button>

				<!-- First page -->
				{#if showFirstEllipsis}
					<button
						type="button"
						onclick={() => navigateToPage(1)}
						class="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-gray-900 hover:bg-gray-100"
					>
						1
					</button>
					<span class="px-2 text-gray-400">...</span>
				{/if}

				<!-- Page numbers -->
				{#each visiblePages as pageNumber}
					<button
						type="button"
						onclick={() => navigateToPage(pageNumber)}
						class={pageNumber === pagination.currentPage
							? 'inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium bg-gray-200 text-gray-900'
							: 'inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-gray-900 hover:bg-gray-100'
						}
					>
						{pageNumber}
					</button>
				{/each}

				<!-- Last page -->
				{#if showLastEllipsis}
					<span class="px-2 text-gray-400">...</span>
					<button
						type="button"
						onclick={() => navigateToPage(pagination.totalPages)}
						class="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-gray-900 hover:bg-gray-100"
					>
						{pagination.totalPages}
					</button>
				{/if}

				<!-- Next button -->
				<button
					type="button"
					disabled={!pagination.hasNextPage}
					onclick={() => navigateToPage(pagination.currentPage + 1)}
					class="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-gray-900 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
				>
					<span class="text-lg font-bold">→</span>
				</button>
			</div>
		{/if}
	</div>
</div>
