<script lang="ts">
	import { X, Play, Pause, Save, Mic, Clock, FileText } from '@lucide/svelte';
	import type { AudioData } from '$lib/types';
	import { formatDuration, formatSize, sleep } from '$lib/utils';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Spinner } from '@/components/ui/spinner';
	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { uploadSchema } from '@/schemas';
	import AudioWaveform from '$lib/components/common/AudioWaveform.svelte';
	import ProcessingView from './ProcessingView.svelte';
	import type WaveSurfer from 'wavesurfer.js';

	interface Props {
		audioData: AudioData;
		onClose: () => void;
		onSaveSuccess: () => void;
		onSaveError: (error: string) => void;
		form: SuperValidated<Infer<typeof uploadSchema>>;
	}

	let { audioData, onClose, onSaveSuccess, onSaveError, form: _form }: Props = $props();

	const { form, errors, enhance, message, submitting } = superForm(_form, {
		onSubmit: async ({ formData, cancel }) => {
			try {
				// 1. Get presigned URL
				const urlResponse = await fetch('/app/upload/url', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify({
						fileName: $form.name,
						contentType: audioData.file.type
					})
				});

				if (!urlResponse.ok) throw new Error('Failed to get upload URL');
				const { uploadUrl, fileKey } = (await urlResponse.json()) as {
					uploadUrl: string;
					fileKey: string;
				};

				// 2. Upload directly to R2
				const uploadResponse = await fetch(uploadUrl, {
					method: 'PUT',
					headers: { 'Content-Type': audioData.file.type },
					body: audioData.file
				});

				if (!uploadResponse.ok) throw new Error('Failed to upload to storage');

				// 3. Prepare form data for DB record creation
				formData.set('fileKey', fileKey);
				formData.set('contentType', audioData.file.type);
				formData.set('size', String(audioData.file.size));
				formData.set('duration', String(Math.round(audioData.duration * 1000)));
				formData.set('name', $form.name);
			} catch (err) {
				cancel();
				onSaveError(err instanceof Error ? err.message : 'Upload failed');
			}
		},
		onResult: ({ result }) => {
			if (result.type === 'failure') onSaveError($message?.text || 'Save failed');
		},
		onUpdated: ({ form }) => {
			if (form.valid) onSaveSuccess();
		}
	});

	let isPlaying = $state(false);
	let currentTime = $state(0);
	let isReady = $state(false);
	let showUnsavedDialog = $state(false);
	let wavesurfer = $state<WaveSurfer | null>(null);
	let audioUrl = $state('');

	onMount(() => {
		$form.name = $form.name || 'New Recording';
		audioUrl = URL.createObjectURL(audioData.file);
		return () => URL.revokeObjectURL(audioUrl);
	});

	const metadata = $derived([
		{ icon: Clock, label: 'Duration', value: formatDuration(audioData.duration) },
		{ icon: FileText, label: 'Format', value: audioData.file.type || 'audio/mpeg' },
		{ icon: Save, label: 'Size', value: formatSize(audioData.file.size) }
	]);
</script>

<div class="relative flex flex-1 flex-col bg-background">
	{#if !isReady}
		<div class="absolute inset-0 z-50 flex items-center justify-center bg-background">
			<ProcessingView elapsedSeconds={audioData.duration} />
		</div>
	{/if}

	<div
		class="flex flex-1 flex-col transition-opacity duration-300"
		class:opacity-100={isReady}
		class:opacity-0={!isReady}
	>
		<div class="border-b border-muted/30 px-4 py-6 sm:px-10 sm:py-8">
			<div
				class="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
			>
				<div class="flex-1">
					<div class="mb-2 flex items-center gap-2">
						<span class="text-[10px] font-bold tracking-wider text-secondary uppercase sm:text-xs"
							>Review & Save</span
						>
						<div class="h-px w-8 bg-muted/30"></div>
					</div>
					<div class="relative max-w-md">
						<input
							type="text"
							bind:value={$form.name}
							placeholder="Recording Name"
							class="w-full border-b-2 border-muted/30 bg-transparent py-1 text-2xl font-bold tracking-tight text-foreground transition-colors outline-none focus:border-primary sm:text-3xl {$errors?.name
								? 'border-red-500'
								: ''}"
						/>
						{#if $errors?.name}
							<p class="absolute -bottom-5 left-0 text-xs font-bold text-red-500">{$errors.name}</p>
						{/if}
					</div>
					<div class="mt-3 flex flex-wrap gap-x-4 gap-y-2">
						{#each metadata as item}
							<div class="flex items-center gap-1.5 text-secondary">
								<item.icon class="h-3 w-3" />
								<span class="text-[10px] font-bold tracking-wider uppercase">{item.value}</span>
							</div>
						{/each}
					</div>
				</div>

				<div class="flex items-center gap-3">
					<button
						onclick={() => (showUnsavedDialog = true)}
						class="flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-muted/30 bg-card px-4 text-xs font-bold text-secondary transition-colors hover:border-primary hover:text-primary sm:flex-none"
					>
						<X class="h-3.5 w-3.5" /> Discard
					</button>
					<form
						method="POST"
						action="?/uploadVoice"
						enctype="multipart/form-data"
						use:enhance
						class="flex-1 sm:flex-none"
					>
						<Button
							type="submit"
							disabled={$submitting}
							class="h-10 w-full px-6 text-xs font-bold sm:w-auto"
						>
							{#if $submitting}
								<Spinner class="mr-2 h-3.5 w-3.5" />Saving...
							{:else}
								<Save class="mr-2 h-3.5 w-3.5" />Save Recording
							{/if}
						</Button>
					</form>
				</div>
			</div>
		</div>

		<div class="flex-1 overflow-auto px-4 py-8 sm:px-10 sm:py-12">
			<div class="mx-auto max-w-5xl">
				<div
					class="relative rounded-lg border border-muted bg-card p-6 shadow-xl shadow-muted/20 sm:p-10"
				>
					<div class="mb-6 flex items-center justify-between">
						<div class="flex items-center gap-3 sm:gap-4">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
							>
								<Mic class="h-4 w-4" />
							</div>
							<span
								class="text-[10px] font-bold tracking-wider text-foreground uppercase sm:text-xs"
								>Audio Timeline</span
							>
						</div>
					</div>

					<div
						class="relative h-32 w-full overflow-hidden rounded-md border border-muted/30 bg-background sm:h-48"
					>
						{#if audioUrl}
							<AudioWaveform
								bind:wavesurfer
								url={audioUrl}
								duration={audioData.duration}
								onReady={async () => {
									await sleep(1000); // ensure smooth transition
									isReady = true;
								}}
								onTimeUpdate={(t) => (currentTime = t)}
								onInteraction={(t) => (currentTime = t)}
								onPlay={() => (isPlaying = true)}
								onPause={() => (isPlaying = false)}
								onFinish={() => {
									isPlaying = false;
									wavesurfer?.seekTo(0);
									currentTime = 0;
								}}
							/>
						{/if}
						<div
							class="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 opacity-[0.02]"
						>
							{#each Array(4) as _}
								<div class="w-full border-t border-foreground"></div>
							{/each}
						</div>
					</div>

					<!-- Current/Total Labels at bottom of waveform container -->
					<div class="mt-3 flex items-center justify-between px-1">
						<div class="text-left">
							<span class="block text-[10px] font-bold text-secondary sm:text-xs">Current</span>
							<span class="font-mono text-xs font-bold text-foreground"
								>{formatDuration(currentTime)}</span
							>
						</div>
						<div class="text-right">
							<span class="block text-[10px] font-bold text-secondary sm:text-xs">Total</span>
							<span class="font-mono text-xs font-bold text-foreground"
								>{formatDuration(audioData.duration)}</span
							>
						</div>
					</div>

					<div class="mt-8 flex justify-center">
						<button
							onclick={() => wavesurfer?.playPause()}
							disabled={!isReady}
							class="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-all hover:bg-primary/20 active:scale-95 disabled:opacity-30 sm:h-16 sm:w-16"
							aria-label={isPlaying ? 'Pause' : 'Play'}
						>
							{#if isPlaying}
								<Pause class="h-6 w-6 fill-current sm:h-7 sm:w-7" />
							{:else}
								<Play class="h-6 w-6 fill-current sm:h-7 sm:w-7" />
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<Dialog.Root bind:open={showUnsavedDialog}>
	<Dialog.Content class="w-[90vw] max-w-md rounded-lg border-muted/30 shadow-2xl">
		<Dialog.Header>
			<Dialog.Title class="text-lg font-bold tracking-tight text-foreground"
				>Discard Recording?</Dialog.Title
			>
			<Dialog.Description class="text-sm font-medium text-secondary">
				You have an unsaved recording. Discarding will permanently delete this session.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="mt-6 flex flex-col gap-3 sm:flex-row">
			<Button
				variant="outline"
				onclick={() => (showUnsavedDialog = false)}
				class="w-full text-xs font-bold sm:w-auto">Cancel</Button
			>
			<Button variant="destructive" onclick={onClose} class="w-full text-xs font-bold sm:w-auto"
				>Discard Session</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
