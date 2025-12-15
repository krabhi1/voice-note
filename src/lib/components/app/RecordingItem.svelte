<script lang="ts">
	import { type Recording } from '@/server/db/schema';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { formatDuration, sleep } from '@/utils';
	import { Play } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { EllipsisVerticalIcon, DownloadIcon, PenIcon, Trash2Icon } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { tick } from 'svelte';

	interface Props {
		recording: Recording;
	}

	let { recording }: Props = $props();

	let isEditing = $state(false);
	let tempTitle = $state(recording.title);

	let inputRef = $state<HTMLInputElement | null>(null);

	async function startEditing() {
		isEditing = true;
		tempTitle = recording.title;
		// wait for DOM update then focus the input without using autofocus attribute
		await tick();
		inputRef?.focus();
		// select the text so the user can quickly replace it
		inputRef?.select();
	}

	function cancelEditing() {
		isEditing = false;
		// reset tempTitle to the current recording title to avoid stray edits being kept
		tempTitle = recording.title;
	}

	const submitRename: SubmitFunction = () => {
		return async ({ result, update }) => {
			isEditing = false;
			if (result.type === 'success') {
				await update();
			} else if (result.type === 'failure') {
				toast.error(result?.data?.form.message || 'Failed to rename recording.');
				cancelEditing();
			}
		};
	};

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			cancelEditing();
		}
	}

	function playRecording(recordingId: string) {
		goto(`/app/${recordingId}`);
	}

	function downloadRecording(file_url?: string, title?: string) {
		if (!file_url) {
			toast.error('File URL is not available for download.');
			return;
		}
		try {
			const url = `/app/audio/${file_url}`;
			const a = document.createElement('a');
			a.href = url;

			// Prefer a download filename when available
			if (title) {
				// sanitize filename a bit
				const safeTitle = title.replace(/[^a-z0-9_\-.\s]/gi, '').trim() || 'recording';
				a.download = `${safeTitle}.mp3`;
			}

			// Use noreferrer for security best practices; don't open a new tab/window
			a.rel = 'noopener noreferrer';

			document.body.appendChild(a);
			a.click();
			a.remove();
			toast.success('Download started');
		} catch (err) {
			console.error('Download failed', err);
			toast.error('Failed to start download.');
		}
	}
</script>

<Table.Row class="group">
	<Table.Cell>
		<Button onclick={() => playRecording(recording.id)} variant="ghost" size="icon" class="h-8 w-8">
			<Play class="h-4 w-4" />
			<span class="sr-only">Play</span>
		</Button>
	</Table.Cell>

	<Table.Cell class="min-w-0 truncate font-medium" ondblclick={startEditing}>
		{#if isEditing}
			<form
				method="POST"
				action="?/renameVoice"
				use:enhance={submitRename}
				class="flex w-full items-center"
			>
				<input type="hidden" name="id" value={recording.id} />
				<input
					type="text"
					name="title"
					bind:value={tempTitle}
					bind:this={inputRef}
					class="h-8 w-full border-0 bg-transparent p-0 text-sm outline-none"
					onkeydown={handleKeydown}
					onblur={cancelEditing}
				/>
			</form>
		{:else}
			{recording.title}
		{/if}
	</Table.Cell>

	<!-- <Table.Cell class="hidden w-32 truncate text-sm text-muted-foreground md:table-cell"></Table.Cell> -->

	<Table.Cell class="hidden w-40 text-sm text-muted-foreground sm:table-cell">
		{recording.createdAt.toLocaleString()}
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
			{@render MoreOptionButton(recording)}
		</div>
	</Table.Cell>
</Table.Row>

{#snippet MoreOptionButton({ id, file_url, title }: Recording)}
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
				onclick={startEditing}
			>
				<PenIcon class="h-4 w-4 text-muted-foreground" />
				<span>Rename</span>
			</DropdownMenu.Item>

			<DropdownMenu.Item
				class="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm text-muted-foreground hover:bg-muted/10"
				onclick={() => downloadRecording(file_url, title)}
			>
				<DownloadIcon class="h-4 w-4 text-muted-foreground" />
				<span>Download</span>
			</DropdownMenu.Item>

			<DropdownMenu.Separator class="my-1 h-px bg-border" />
			<form
				method="POST"
				action="?/deleteVoice"
				use:enhance={(() => {
					return async ({ result, update }) => {
						await update();
						if (result.type === 'success') {
							toast.success('Recording deleted successfully');
						} else if (result.type === 'failure') {
							const errorMessage = result.data?.form.message || 'An unexpected error occurred.';
							toast.error(errorMessage);
						}
					};
				}) as SubmitFunction}
			>
				<input type="hidden" name="id2" value={id} />
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
