<script lang="ts">
	import { X, Play, Pause, Save, Mic, Clock, FileText } from '@lucide/svelte';
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

	interface Props {
		audioData: AudioData;
		waveData?: any; // Kept for compatibility but unused
		onClose: () => void;
		onSaveSuccess: () => void;
		onSaveError: (error: string) => void;
		form: SuperValidated<Infer<typeof uploadSchema>>;
	}

	let { audioData, onClose, onSaveSuccess, onSaveError, form: _form }: Props = $props();

	const { errors, enhance, message, submitting } = superForm(_form, {
		onSubmit: ({ formData, cancel }) => {
			if (!audioData) {
				console.error('No recording available to upload!');
				cancel();
				return;
			}

			formData.set('voice-note', audioData.file, fileName);
			formData.set('duration', String(audioData.duration * 1000));
			formData.set('name', fileName);
		},
		onResult: ({ result }) => {
			if (result.type === 'failure') {
				onSaveError($message?.text || 'Save failed');
			}
		},
		onUpdated: ({ form }) => {
			if (form.valid) {
				onSaveSuccess();
			}
		}
	});

	let isPlaying = $state(false);
	let currentTime = $state(0);
	let fileName = $state('New Recording');
	let showUnsavedDialog = $state(false);

	let container = $state<HTMLDivElement | null>(null);
	let wavesurfer: WaveSurfer;

	onMount(() => {
		if (container && audioData?.file) {
			const url = URL.createObjectURL(audioData.file);
			wavesurfer = WaveSurfer.create({
				container,
				waveColor: 'rgb(161, 161, 170)', // neutral-400
				progressColor: 'rgb(124, 58, 237)', // violet-600
				cursorColor: 'rgb(124, 58, 237)',
				barWidth: 2,
				barGap: 3,
				barRadius: 3,
				height: 192, // h-48
				normalize: true,
				url: url
			});

			wavesurfer.on('audioprocess', (time) => {
				currentTime = time;
			});

			wavesurfer.on('interaction', () => {
				currentTime = wavesurfer.getCurrentTime();
			});

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
		}
	});

	function togglePlayback() {
		if (wavesurfer) {
			wavesurfer.playPause();
		}
	}
</script>

<div class="flex flex-1 flex-col bg-background">
	<!-- Header -->
	<div class="border-b border-muted/30 px-6 py-8 sm:px-10">
		<div class="mx-auto max-w-5xl">
			<div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
				<div class="flex-1">
					<div class="mb-2 flex items-center gap-2">
						<span class="text-xs font-bold text-secondary">Review & Save</span>
						<div class="h-px w-8 bg-muted/30"></div>
						<span class="text-xs font-mono text-secondary">ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
					</div>
					<div class="relative max-w-md">
						<input
							type="text"
							bind:value={fileName}
							placeholder="Recording Name"
							class="w-full border-b-2 border-muted/30 bg-transparent py-1 text-3xl font-bold tracking-tight text-foreground outline-none transition-colors focus:border-primary {$errors?.name ? 'border-red-500' : ''}"
						/>
						{#if $errors?.name}
							<p class="absolute -bottom-5 left-0 text-xs font-bold text-red-500">
								{$errors?.name}
							</p>
						{/if}
					</div>
				</div>
				
				<div class="flex items-center gap-3">
					<button
						onclick={() => (showUnsavedDialog = true)}
						class="flex h-10 items-center gap-2 rounded-md border border-muted/30 bg-card px-4 text-xs font-bold text-secondary transition-colors hover:border-primary hover:text-primary"
					>
						<X class="h-3.5 w-3.5" />
						Discard
					</button>
					<form method="POST" action="?/uploadVoice" enctype="multipart/form-data" use:enhance>
						<Button
							type="submit"
							disabled={!audioData || $submitting}
							class="h-10 bg-primary px-6 text-xs font-bold hover:bg-primary/90"
						>
							{#if $submitting}
								<Spinner class="mr-2 h-3.5 w-3.5" />
								Saving...
							{:else}
								<Save class="mr-2 h-3.5 w-3.5" />
								Save Recording
							{/if}
						</Button>
					</form>
				</div>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="flex-1 overflow-auto px-6 py-12 sm:px-10">
		<div class="mx-auto max-w-5xl">
			<!-- Waveform Editor -->
			<div class="relative rounded-lg border border-muted bg-card p-10 shadow-xl shadow-muted/20">
				<div class="mb-6 flex items-center justify-between">
					<div class="flex items-center gap-4">
						<div class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<Mic class="h-4 w-4" />
						</div>
						<span class="text-xs font-bold text-foreground">Audio Timeline</span>
					</div>
					<div class="flex items-center gap-6">
						<div class="text-right">
							<span class="block text-xs font-bold text-secondary">Current</span>
							<span class="font-mono text-xs font-bold text-foreground">{formatDuration(currentTime)}</span>
						</div>
						<div class="text-right">
							<span class="block text-xs font-bold text-secondary">Total</span>
							<span class="font-mono text-xs font-bold text-foreground">{formatDuration(audioData.duration)}</span>
						</div>
					</div>
				</div>

				<div class="relative h-48 w-full bg-background border border-muted/30 rounded-md overflow-hidden">
					<div bind:this={container} class="h-full w-full cursor-pointer"></div>
					
					<!-- Decorative Grid -->
					<div class="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 opacity-[0.02]">
						{#each Array(4) as _}
							<div class="w-full border-t border-foreground"></div>
						{/each}
					</div>
				</div>

				<div class="mt-8 flex items-center justify-center">
					<button
						onclick={togglePlayback}
						disabled={!audioData?.file}
						class="flex h-16 w-16 items-center justify-center rounded-md border border-muted bg-card text-foreground transition-all hover:border-primary active:scale-95 disabled:opacity-30"
					>
						{#if isPlaying}
							<Pause class="h-6 w-6 fill-current" />
						{:else}
							<Play class="h-6 w-6 fill-current" />
						{/if}
					</button>
				</div>
			</div>

			<!-- Metadata / Info -->
			<div class="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
				<div class="rounded-lg border border-muted p-6 bg-card">
					<div class="mb-4 flex h-8 w-8 items-center justify-center rounded-md bg-muted/20 text-secondary">
						<Clock class="h-4 w-4" />
					</div>
					<h3 class="text-xs font-bold text-foreground">Duration</h3>
					<p class="mt-2 font-mono text-xs text-secondary">{audioData.duration.toFixed(2)} seconds total</p>
				</div>
				<div class="rounded-lg border border-muted p-6 bg-card">
					<div class="mb-4 flex h-8 w-8 items-center justify-center rounded-md bg-muted/20 text-secondary">
						<FileText class="h-4 w-4" />
					</div>
					<h3 class="text-xs font-bold text-foreground">Format</h3>
					<p class="mt-2 font-mono text-xs text-secondary">{audioData.file.type || 'audio/mpeg'}</p>
				</div>
				<div class="rounded-lg border border-muted p-6 bg-card">
					<div class="mb-4 flex h-8 w-8 items-center justify-center rounded-md bg-muted/20 text-secondary">
						<Save class="h-4 w-4" />
					</div>
					<h3 class="text-xs font-bold text-foreground">Size</h3>
					<p class="mt-2 font-mono text-xs text-secondary">{(audioData.file.size / 1024).toFixed(1)} KB</p>
				</div>
			</div>
		</div>
	</div>
</div>

<Dialog.Root bind:open={showUnsavedDialog}>
	<Dialog.Content class="rounded-lg border-muted/30 shadow-2xl">
		<Dialog.Header>
			<Dialog.Title class="text-lg font-bold tracking-tight text-foreground">Discard Recording?</Dialog.Title>
			<Dialog.Description class="text-sm font-medium text-secondary">
				You have an unsaved recording. Discarding will permanently delete this session. This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="mt-6 gap-3">
			<Button 
				variant="outline" 
				onclick={() => (showUnsavedDialog = false)}
				class="border-muted/30 text-xs font-bold hover:bg-muted/10"
			>
				Cancel
			</Button>
			<Button 
				variant="destructive" 
				onclick={onClose}
				class="bg-red-600 text-xs font-bold hover:bg-red-700"
			>
				Discard Session
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>