<script lang="ts">
	import { type Recording } from '$lib/server/db/schema';
	import type { PaginationMeta } from '$lib/types/pagination';
	import Pagination from '$lib/components/ui/Pagination.svelte';

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
	<div class=" bg-black/20 p-4">
		<div class="mx-auto max-w-4xl">
			<h2 class="mb-4 text-xl font-bold text-white">Your Recordings</h2>

			{#if recordings?.length > 0}
				<div class="grid gap-3 mb-6">
					{#each recordings as recording}
						<div class="rounded-lg bg-white/10 p-4 backdrop-blur">
							<div class="flex items-center justify-between">
								<div class="flex flex-col">
									<h3 class="font-semibold text-white">{recording.title}</h3>
									<div class="flex items-center gap-4 text-sm text-white/70">
										<span>{formatDuration(recording.duration)}s</span>
										<span>{formatFileSize(recording.size)}KB</span>
										<span>{formatDate(recording.createdAt)}</span>
									</div>
								</div>
								<audio
									controls
									src={`/app/audio/${recording.file_url}`}
									class="h-8"
									preload="metadata"
								></audio>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Pagination Controls -->
			<Pagination {pagination} />
		</div>
	</div>
{:else}
	<div class="bg-black/20 p-4">
		<div class="mx-auto max-w-4xl">
			<div class="text-center text-white/70 py-8">
				<p>No recordings found. Start by creating your first voice note!</p>
			</div>
		</div>
	</div>
{/if}
