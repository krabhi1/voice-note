<script lang="ts">
	import { type Recording } from '@/server/db/schema';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { formatDuration } from '@/utils';
	import { Play, EllipsisVertical, Download, Pen, Trash2 } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { toast } from 'svelte-sonner';
	import { tick } from 'svelte';

	let { recording }: { recording: Recording } = $props();

	let isEditing = $state(false);
	let tempTitle = $state(recording.title);
	let inputRef = $state<HTMLInputElement | null>(null);

	async function startEditing() {
		isEditing = true;
		tempTitle = recording.title;
		await tick();
		inputRef?.focus();
		inputRef?.select();
	}

	const submitRename: SubmitFunction = () => {
		return async ({ result, update }) => {
			isEditing = false;
			if (result.type === 'failure') {
				toast.error(result?.data?.form.message || 'Failed to rename.');
				tempTitle = recording.title;
			}
			await update();
		};
	};

	function downloadRecording() {
		if (!recording.file_url) return toast.error('File unavailable');
		const a = document.createElement('a');
		a.href = `/app/audio/${recording.file_url}`;
		a.download = `${recording.title.replace(/[^a-z0-9]/gi, '_')}.mp3`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		toast.success('Download started');
	}
</script>

<Table.Row class="group border-b border-muted/30 transition-colors hover:bg-muted/5">
	<Table.Cell class="py-4">
		<Button onclick={() => goto(`/app/${recording.id}`)} variant="ghost" size="icon">
			<Play class="h-3 w-3 fill-current" />
		</Button>
	</Table.Cell>

	<Table.Cell class="min-w-0 py-4 font-bold tracking-tight text-foreground" ondblclick={startEditing}>
		{#if isEditing}
			<form method="POST" action="?/renameVoice" use:enhance={submitRename}>
				<input type="hidden" name="id" value={recording.id} />
				<input
					type="text"
					name="title"
					bind:value={tempTitle}
					bind:this={inputRef}
					class="h-8 w-full border-b border-primary bg-transparent p-0 text-sm font-bold outline-none"
					onkeydown={(e) => e.key === 'Escape' && (isEditing = false)}
					onblur={() => (isEditing = false)}
				/>
			</form>
		{:else}
			<span class="cursor-text">{recording.title}</span>
		{/if}
	</Table.Cell>

	<Table.Cell class="hidden py-4 sm:table-cell">
		<span class="text-xs font-semibold text-secondary">
			{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(recording.createdAt)}
		</span>
	</Table.Cell>

	<Table.Cell class="py-4 text-end">
		<span class="font-mono text-xs font-medium text-secondary">
			{formatDuration(recording.duration / 1000)}
		</span>
	</Table.Cell>

	<Table.Cell class="py-4">
		<div class="flex justify-end">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<button {...props} class="flex h-8 w-8 items-center justify-center text-secondary opacity-0 transition-all group-hover:opacity-100 hover:text-primary">
							<EllipsisVertical class="h-4 w-4" />
						</button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-48 rounded-md border-muted/30 bg-card p-0 shadow-xl" align="end">
					<DropdownMenu.Item class="flex gap-3 px-4 py-3 text-sm font-semibold" onclick={startEditing}>
						<Pen class="h-3.5 w-3.5" /> Rename
					</DropdownMenu.Item>
					<DropdownMenu.Item class="flex gap-3 px-4 py-3 text-sm font-semibold" onclick={downloadRecording}>
						<Download class="h-3.5 w-3.5" /> Download
					</DropdownMenu.Item>
					<DropdownMenu.Separator class="m-0 h-px bg-muted/10" />
					<form method="POST" action="?/deleteVoice" use:enhance={() => async ({ result, update }) => {
						await update();
						result.type === 'success' ? toast.success('Deleted') : toast.error('Failed to delete');
					}}>
						<input type="hidden" name="id" value={recording.id} />
						<DropdownMenu.Item class="flex gap-3 px-4 py-3 text-sm font-semibold text-red-600 focus:bg-red-50">
							<button type="submit" class="flex w-full items-center gap-3">
								<Trash2 class="h-3.5 w-3.5" /> Delete
							</button>
						</DropdownMenu.Item>
					</form>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</Table.Cell>
</Table.Row>