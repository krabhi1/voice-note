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
		await tick();
		inputRef?.focus();
		inputRef?.select();
	}

	function cancelEditing() {
		isEditing = false;
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
			if (title) {
				const safeTitle = title.replace(/[^a-z0-9_\-.\s]/gi, '').trim() || 'recording';
				a.download = `${safeTitle}.mp3`;
			}
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

<Table.Row class="group border-b border-muted/30 transition-colors hover:bg-muted/5">
	<Table.Cell class="py-4">
		<Button
			onclick={() => playRecording(recording.id)}
			variant="ghost"
			size="icon"
		>
			<Play class="h-3 w-3 fill-current" />
			<span class="sr-only">Play</span>
		</Button>
	</Table.Cell>

	<Table.Cell class="min-w-0 py-4 font-bold tracking-tight text-foreground" ondblclick={startEditing}>
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
					class="h-8 w-full border-b border-primary bg-transparent p-0 text-sm font-bold outline-none"
					onkeydown={handleKeydown}
					onblur={cancelEditing}
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
			{formatDuration(recording.duration)}
		</span>
	</Table.Cell>

	<Table.Cell class="py-4">
		<div class="flex justify-end">
			{@render MoreOptionButton(recording)}
		</div>
	</Table.Cell>
</Table.Row>

{#snippet MoreOptionButton({ id, file_url, title }: Recording)}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<button
					{...props}
					class="flex h-8 w-8 items-center justify-center text-secondary opacity-0 transition-all group-hover:opacity-100 hover:text-primary"
				>
					<EllipsisVertical class="h-4 w-4" />
					<span class="sr-only">More options</span>
				</button>
			{/snippet}
		</DropdownMenu.Trigger>

		<DropdownMenu.Content
			class="w-48 rounded-md border-muted/30 bg-card p-0 shadow-xl"
			side="bottom"
			align="end"
		>
			<DropdownMenu.Item
				class="flex cursor-pointer items-center gap-3 rounded-sm px-4 py-3 text-sm font-semibold text-secondary focus:bg-muted/10 focus:text-foreground"
				onclick={startEditing}
			>
				<Pen class="h-3.5 w-3.5" />
				<span>Rename</span>
			</DropdownMenu.Item>

			<DropdownMenu.Item
				class="flex cursor-pointer items-center gap-3 rounded-sm px-4 py-3 text-sm font-semibold text-secondary focus:bg-muted/10 focus:text-foreground"
				onclick={() => downloadRecording(file_url, title)}
			>
				<Download class="h-3.5 w-3.5" />
				<span>Download</span>
			</DropdownMenu.Item>

			<DropdownMenu.Separator class="m-0 h-px bg-muted/10" />

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
					class="flex cursor-pointer items-center gap-3 rounded-sm px-4 py-3 text-sm font-semibold text-red-600 focus:bg-red-50 focus:text-red-600"
				>
					<button type="submit" class="flex w-full items-center gap-3">
						<Trash2 class="h-3.5 w-3.5" />
						<span>Delete</span>
					</button>
				</DropdownMenu.Item>
			</form>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/snippet}
