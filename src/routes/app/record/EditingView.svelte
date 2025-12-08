<script lang="ts">
	import { X, Play, Pause } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import type { AudioData } from '$lib/types';
	import { formatDuration } from '$lib/utils';
	import type { EditorWaveData } from '$lib/audio/EditorWaveEngine';
	import { PlaybackEngine } from '$lib/audio/PlaybackEngine';
	import { onMount } from 'svelte';
	import { EditorWaveformRenderer } from '$lib/audio/EditorWaveformRenderer';
	import type { ActionData, SubmitFunction } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Spinner } from '@/components/ui/spinner';

	interface Props {
		audioData: AudioData;
		waveData: EditorWaveData;
		onClose: () => void;
		onSaveSuccess: () => void;
		onSaveError: (error: string) => void;
		form?: ActionData;
	}

	let { audioData, onClose, onSaveSuccess, onSaveError, waveData, form }: Props = $props();

	let isUploading = $state(false);
	let isPlaying = $state(false);
	let currentTime = $state(0);
	let fileName = $state('New Recording');

	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let renderer: EditorWaveformRenderer | null = null;

	const playback = new PlaybackEngine();
	playback.load(audioData.file);

	function setupPlaybackAndRenderer() {
		if (!canvasEl || renderer) return;

		renderer = new EditorWaveformRenderer(canvasEl);
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

	onMount(() => {
		setupPlaybackAndRenderer();

		return () => {};
	});

	function togglePlayback() {
		isPlaying ? playback.pause() : playback.play();
		isPlaying = !isPlaying;
	}

	function handleSeek(time: number) {
		const safeTime = Math.max(0, Math.min(time, audioData.duration));
		playback.seek(safeTime);
		currentTime = safeTime;
		renderer?.draw(safeTime);
	}

	const handleFormEnhance: SubmitFunction = ({ formData, cancel }) => {
		if (!audioData) {
			console.error('No recording available to upload!');
			cancel();
			return;
		}

		formData.set('voice-note', audioData.file, fileName);
		formData.set('duration', String(audioData.duration * 1000));
		formData.set('name', fileName);

		isUploading = true;

		return async ({ result, update }) => {
			isUploading = false;
			await update();

			if (result.type === 'success') {
				onSaveSuccess();
			} else if (result.type === 'failure') {
				const errorMessage = result.data?.message || 'An unexpected error occurred.';
				onSaveError(errorMessage);
			}
		};
	};
</script>

<div class="relative flex min-h-screen flex-col items-center justify-center bg-background p-8">
	<Button variant="ghost" size="icon" onclick={onClose} class="absolute top-4 right-4">
		<X class="size-6" />
	</Button>

	<div class="absolute top-4 left-4 w-64">
		<Input
			type="text"
			bind:value={fileName}
			placeholder="Recording Name"
			class={form?.errors?.name ? 'border-destructive' : ''}
		/>

		{#if form?.errors?.name}
			<div class="mt-1 text-sm text-destructive">
				{form.errors.name[0]}
			</div>
		{/if}
	</div>

	<div class="mb-8 w-full max-w-4xl">
		<div class="relative h-45 w-full ">
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

		<form
			method="POST"
			action="?/uploadVoice"
			enctype="multipart/form-data"
			use:enhance={handleFormEnhance}
		>
			<Button
				type="submit"
				size="lg"
				class="rounded-full px-8"
				disabled={!audioData || isUploading}
			>
				<span class="flex items-center gap-2">
					{#if isUploading}
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
