<script lang="ts">
	import { type Recording } from '$lib/server/db/schema';
	import type { PaginationMeta } from '$lib/types/pagination';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	interface Props {
		recordings: Recording[];
		pagination: PaginationMeta;
	}

	let { recordings, pagination }: Props = $props();

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

			<Pagination.Root count={pagination.totalItems} perPage={pagination.pageSize} page={pagination.currentPage}>
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

			{#if recordings?.length > 0}
				<div class="grid gap-4">
					{#each recordings as recording}
						<Card.Root>
							<Card.Header class="flex flex-row items-center justify-between space-y-0 p-6">
								<div class="flex flex-col gap-1.5">
									<Card.Title>{recording.title}</Card.Title>
									<Card.Description class="flex items-center gap-2">
										<span>{formatDuration(recording.duration)}s</span>
										<span>•</span>
										<span>{formatFileSize(recording.size)}KB</span>
										<span>•</span>
										<span>{formatDate(recording.createdAt)}</span>
									</Card.Description>
								</div>
								<audio
									controls
									src={`/app/audio/${recording.file_url}`}
									class="h-8"
									preload="metadata"
								></audio>
							</Card.Header>
						</Card.Root>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{:else}
	<div class="bg-background p-4">
		<div class="mx-auto max-w-4xl">
			<Card.Root>
				<Card.Content class="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
					<p>No recordings found. Start by creating your first voice note!</p>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
{/if}
