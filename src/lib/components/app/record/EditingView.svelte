<script lang="ts">
	import { X, Play, Pause } from '@lucide/svelte';
	import type { AudioData } from '$lib/types';
	import { formatDuration } from '$lib/utils';
	import type { EditorWaveData } from '$lib/audio/EditorWaveEngine';
	import { PlaybackEngine } from '$lib/audio/PlaybackEngine';
	import { onMount } from 'svelte';
	import { AudioWaveformRenderer } from '$lib/audio/AudioWaveformRenderer';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Spinner } from '@/components/ui/spinner';
	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { uploadSchema } from '@/schemas';
	import { goto } from '$app/navigation';

	interface Props {
		audioData: AudioData;
		waveData: EditorWaveData;
		onClose: () => void;
		onSaveSuccess: () => void;
		onSaveError: (error: string) => void;
		form: SuperValidated<Infer<typeof uploadSchema>>;
	}

	let { audioData, onClose, onSaveSuccess, onSaveError, waveData, form: _form }: Props = $props();

	const { errors, enhance, message, submitting } = superForm(_form, {
		onSubmit: ({ formData, cancel }) => {
			if (!audioData) {
				console.error('No recording available to upload!');
				cancel();
				return;
			}

			// Client sets the file, duration (ms) and name before submit
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

	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let renderer: AudioWaveformRenderer | null = null;

	const playback = new PlaybackEngine();
	playback.load(audioData.file);

	function setupPlaybackAndRenderer() {
		if (!canvasEl || renderer) return;

		renderer = new AudioWaveformRenderer(canvasEl);
		renderer.setData(waveData.peaks, waveData.duration);

		currentTime = 0;

		playback.addEventListener('progress', (time) => {
			currentTime = time;
			if (renderer && !renderer.isDragging) {
				renderer.draw(time);
			}
		});

		playback.addEventListener('end', () => {
			currentTime = 0;
			isPlaying = false;
			renderer?.draw(0);
		});

		renderer.addEventListener('onSeek', (time) => {
			handleSeek(time);
		});
	}

	function cleanup() {
		renderer?.destroy();
		playback.destroy();
		renderer = null;
	}

	onMount(() => {
		setupPlaybackAndRenderer();

		return () => {
			cleanup();
		};
	});

	function togglePlayback() {
		if (isPlaying) {
			playback.pause();
			isPlaying = false;
		} else {
			playback.play();
			isPlaying = true;
		}
	}

	function handleSeek(time: number) {
		const safeTime = Math.max(0, Math.min(time, audioData.duration));
		playback.seek(safeTime);
		currentTime = safeTime;
		renderer?.draw(safeTime);
	}
</script>

<div class="relative flex min-h-screen flex-col items-center justify-center bg-background p-8">
	<Button
		variant="ghost"
		size="icon"
		onclick={() => (showUnsavedDialog = true)}
		class="absolute top-4 right-4"
	>
		<X class="size-6" />
	</Button>

	<div class="absolute top-4 left-4 w-64">
		<Input
			type="text"
			bind:value={fileName}
			placeholder="Recording Name"
			class={$errors?.name ? 'border-destructive' : ''}
		/>

		{#if $errors?.name}
			<div class="mt-1 text-sm text-destructive">
				{$errors?.name}
			</div>
		{/if}
	</div>

	<div class="mb-8 w-full max-w-4xl">
		<div class="relative h-45 w-full">
			<canvas bind:this={canvasEl} class="block h-full w-full"></canvas>
		</div>

		<div class="mt-2 flex justify-between text-sm text-muted-foreground">
			<span>{formatDuration(currentTime)}</span>
			<span>{formatDuration(audioData.duration)}</span>
		</div>

		<div class="mt-3 text-center">
			<div
				class="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground"
			>
				{#if isPlaying}
					<div class="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
				{/if}
				<span>
					{formatDuration(currentTime)} / {formatDuration(audioData.duration)}
				</span>
			</div>
		</div>
	</div>

	<div class="flex items-center gap-4">
		<Button
			variant="secondary"
			size="icon"
			class="size-12 rounded-full"
			onclick={togglePlayback}
			disabled={!audioData?.file}
		>
			{#if isPlaying}
				<Pause class="size-6 fill-current" />
			{:else}
				<Play class="size-6 fill-current" />
			{/if}
		</Button>

		<form method="POST" action="?/uploadVoice" enctype="multipart/form-data" use:enhance>
			<Button
				type="submit"
				size="lg"
				class="rounded-full px-8"
				disabled={!audioData || $submitting}
			>
				<span class="flex items-center gap-2">
					{#if $submitting}
						<Spinner class="size-4" />
						Saving...
					{:else}
						Save
					{/if}
				</span>
			</Button>
		</form>
	</div>
</div>

<Dialog.Root bind:open={showUnsavedDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Unsaved Recording</Dialog.Title>
			<Dialog.Description>
				You have an unsaved recording. Are you sure you want to discard it? This action cannot be
				undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showUnsavedDialog = false)}>Cancel</Button>
			<Button variant="destructive" onclick={onClose}>Discard</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
