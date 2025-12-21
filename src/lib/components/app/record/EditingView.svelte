<script lang="ts">
	import { X, Play, Pause, Save, Mic, Clock, FileText, Loader2 } from '@lucide/svelte';
	import type { AudioData } from '$lib/types';
	import { formatDuration } from '$lib/utils';
	import { onMount } from 'svelte';
	import WaveSurfer from 'wavesurfer.js';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Spinner } from '@/components/ui/spinner';
	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { uploadSchema } from '@/schemas';
	import { WAVEFORM_CONFIG } from '$lib/audio/config';

	interface Props {
		audioData: AudioData;
		onClose: () => void;
		onSaveSuccess: () => void;
		onSaveError: (error: string) => void;
		form: SuperValidated<Infer<typeof uploadSchema>>;
	}

	let { audioData, onClose, onSaveSuccess, onSaveError, form: _form }: Props = $props();

	const { form, errors, enhance, message, submitting } = superForm(_form, {
		onSubmit: ({ formData }) => {
			formData.set('voice-note', audioData.file, $form.name);
			formData.set('duration', String(audioData.duration * 1000));
			formData.set('name', $form.name);
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

	let container = $state<HTMLDivElement | null>(null);
	let wavesurfer: WaveSurfer;

	onMount(() => {
		$form.name = $form.name || 'New Recording';
		if (!container) return;

		const url = URL.createObjectURL(audioData.file);
		wavesurfer = WaveSurfer.create({
			...WAVEFORM_CONFIG,
			container,
			url
		});

		wavesurfer.on('ready', () => (isReady = true));
		wavesurfer.on('audioprocess', (time) => (currentTime = time));
		wavesurfer.on('interaction', () => (currentTime = wavesurfer.getCurrentTime()));
		wavesurfer.on('play', () => (isPlaying = true));
		wavesurfer.on('pause', () => (isPlaying = false));
		wavesurfer.on('finish', () => {
			isPlaying = false;
			wavesurfer.seekTo(0);
			currentTime = 0;
		});

		return () => {
			wavesurfer.destroy();
			URL.revokeObjectURL(url);
		};
	});

	const metadata = $derived([
		{ icon: Clock, label: 'Duration', value: `${audioData.duration.toFixed(2)}s` },
		{ icon: FileText, label: 'Format', value: audioData.file.type || 'audio/mpeg' },
		{ icon: Save, label: 'Size', value: `${(audioData.file.size / 1024).toFixed(1)} KB` }
	]);
</script>

<div class="flex flex-1 flex-col bg-background">
	<div class="border-b border-muted/30 px-6 py-8 sm:px-10">
		<div class="mx-auto max-w-5xl flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
			<div class="flex-1">
				<div class="mb-2 flex items-center gap-2">
					<span class="text-xs font-bold text-secondary">Review & Save</span>
					<div class="h-px w-8 bg-muted/30"></div>
				</div>
				<div class="relative max-w-md">
					<input
						type="text"
						bind:value={$form.name}
						placeholder="Recording Name"
						class="w-full border-b-2 border-muted/30 bg-transparent py-1 text-3xl font-bold tracking-tight text-foreground transition-colors outline-none focus:border-primary {$errors?.name ? 'border-red-500' : ''}"
					/>
					{#if $errors?.name}
						<p class="absolute -bottom-5 left-0 text-xs font-bold text-red-500">{$errors.name}</p>
					{/if}
				</div>
			</div>

			<div class="flex items-center gap-3">
				<button
					onclick={() => (showUnsavedDialog = true)}
					class="flex h-10 items-center gap-2 rounded-md border border-muted/30 bg-card px-4 text-xs font-bold text-secondary transition-colors hover:border-primary hover:text-primary"
				>
					<X class="h-3.5 w-3.5" /> Discard
				</button>
				<form method="POST" action="?/uploadVoice" enctype="multipart/form-data" use:enhance>
					<Button type="submit" disabled={$submitting} class="h-10 px-6 text-xs font-bold">
						{#if $submitting}<Spinner class="mr-2 h-3.5 w-3.5" />Saving...{:else}<Save class="mr-2 h-3.5 w-3.5" />Save Recording{/if}
					</Button>
				</form>
			</div>
		</div>
	</div>

	<div class="flex-1 overflow-auto px-6 py-12 sm:px-10">
		<div class="mx-auto max-w-5xl">
			<div class="relative rounded-lg border border-muted bg-card p-10 shadow-xl shadow-muted/20">
				<div class="mb-6 flex items-center justify-between">
					<div class="flex items-center gap-4">
						<div class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<Mic class="h-4 w-4" />
						</div>
						<span class="text-xs font-bold text-foreground">Audio Timeline</span>
					</div>
					<div class="flex items-center gap-6 text-right">
						<div>
							<span class="block text-xs font-bold text-secondary">Current</span>
							<span class="font-mono text-xs font-bold text-foreground">{formatDuration(currentTime)}</span>
						</div>
						<div>
							<span class="block text-xs font-bold text-secondary">Total</span>
							<span class="font-mono text-xs font-bold text-foreground">{formatDuration(audioData.duration)}</span>
						</div>
					</div>
				</div>

				<div class="relative h-48 w-full overflow-hidden rounded-md border border-muted/30 bg-background">
					<div bind:this={container} class="h-full w-full cursor-pointer"></div>
					{#if !isReady}
						<div class="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
							<Loader2 class="h-6 w-6 animate-spin text-secondary" />
						</div>
					{/if}
					<div class="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 opacity-[0.02]">
						{#each Array(4) as _}<div class="w-full border-t border-foreground"></div>{/each}
					</div>
				</div>

				<div class="mt-8 flex justify-center">
					<button
						onclick={() => wavesurfer?.playPause()}
						disabled={!isReady}
						class="flex h-16 w-16 items-center justify-center rounded-md border bg-card text-foreground transition-all hover:border-primary active:scale-95 disabled:opacity-30"
						aria-label={isPlaying ? 'Pause' : 'Play'}
					>
						{#if isPlaying}<Pause class="h-6 w-6 fill-current" />{:else}<Play class="h-6 w-6 fill-current" />{/if}
					</button>
				</div>
			</div>

			<div class="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
				{#each metadata as item}
					<div class="rounded-lg border border-muted bg-card p-6">
						<div class="mb-4 flex h-8 w-8 items-center justify-center rounded-md bg-muted/20 text-secondary">
							<item.icon class="h-4 w-4" />
						</div>
						<h3 class="text-xs font-bold text-foreground">{item.label}</h3>
						<p class="mt-2 font-mono text-xs text-secondary">{item.value}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<Dialog.Root bind:open={showUnsavedDialog}>
	<Dialog.Content class="rounded-lg border-muted/30 shadow-2xl">
		<Dialog.Header>
			<Dialog.Title class="text-lg font-bold tracking-tight text-foreground">Discard Recording?</Dialog.Title>
			<Dialog.Description class="text-sm font-medium text-secondary">
				You have an unsaved recording. Discarding will permanently delete this session.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="mt-6 gap-3">
			<Button variant="outline" onclick={() => (showUnsavedDialog = false)} class="text-xs font-bold">Cancel</Button>
			<Button variant="destructive" onclick={onClose} class="text-xs font-bold">Discard Session</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>