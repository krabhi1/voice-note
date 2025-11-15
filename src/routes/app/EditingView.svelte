<script lang="ts">
	import { X, Play, Pause } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import type { AudioData } from './types';
	import type { SubmitFunction } from './$types';
	import { formatDuration } from '$lib/utils';
	import { EditorWaveEngine, type EditorWaveData } from '$lib/audio/EditorWaveEngine';
	import { PlaybackEngine } from '$lib/audio/PlaybackEngine';
	import { onMount } from 'svelte';
	import { EditorWaveformRenderer } from '$lib/audio/EditorWaveformRenderer';

	interface Props {
		audioData: AudioData;
		waveData: EditorWaveData;
		elapsedSeconds: number;
		onClose: () => void;
		onSaveSuccess: () => void;
		onSaveError: (error: string) => void;
	}

	let { audioData, elapsedSeconds, onClose, onSaveSuccess, onSaveError, waveData }: Props =
		$props();

	let isUploading = $state(false);
	let isPlaying = $state(false);
	let currentTime = $state(0);

	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let renderer: EditorWaveformRenderer;

	let playback = new PlaybackEngine();

	playback.load(audioData.file);

	onMount(() => {
		if (!canvasEl) return;

		// 1. init renderer
		renderer = new EditorWaveformRenderer(canvasEl);

		// 2. load waveform data
		renderer.setData(waveData.peaks, waveData.duration);

		// 3. playback engine updates UI
		playback.addEventListener('progress', (time) => {
			currentTime = time;
			if (!renderer.isDragging) {
				renderer.draw(time);
			}
		});

		playback.addEventListener('end', () => {
			currentTime = 0;
			isPlaying = false;
			renderer.draw(0);
		});

		renderer.addEventListener('onSeek', (time) => {
			handleSeek(time);
		});
	});

	function togglePlayback() {
		if (isPlaying) playback.pause();
		else playback.play();

		isPlaying = !isPlaying;
	}

	function handleSeek(time: number) {
		const safe = Math.max(0, Math.min(time, audioData.duration));
		playback.seek(safe);
		currentTime = safe;
		renderer.draw(safe);
	}

	const handleFormEnhance: SubmitFunction = async ({ formData, cancel }) => {
		if (!audioData) {
			alert('No recording available to upload!');
			cancel();
			return;
		}

		formData.set('voice-note', audioData.file, 'recording.webm');
		formData.set('duration', String(audioData.duration * 1000));

		isUploading = true;

		return async ({ result, update }) => {
			isUploading = false;

			if (result.type === 'success') {
				console.log('Upload successful!', result.data);
				onSaveSuccess();
				await update();
			} else if (result.type === 'failure') {
				console.error('Upload failed:', result.data);
				const errorMessage = result.data?.errors || 'Unknown error occurred';
				onSaveError(errorMessage);
			}
		};
	};
</script>

<div class="flex min-h-screen flex-col items-center justify-center p-8">
	<button onclick={onClose} class="absolute top-4 right-4 text-white hover:text-white/70">
		<X class="h-6 w-6" />
	</button>

	<!-- Full waveform -->
	<div class="mb-8 w-full max-w-4xl">
		<div class="relative h-64 w-full bg-gray-900">
			<canvas bind:this={canvasEl} class="block h-full w-full"></canvas>
		</div>

		<!-- Timeline -->
		<div class="mt-2 flex justify-between text-sm text-white/70">
			<span>{formatDuration(currentTime)}</span>
			<span>{formatDuration(audioData.duration)}</span>
		</div>

		<div class="mt-3 text-center">
			<div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
				<div class="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
				<span class="text-sm font-medium text-white">
					{formatDuration(currentTime)} / {formatDuration(audioData.duration)}
				</span>
			</div>
		</div>
	</div>

	<!-- Controls -->
	<div class="flex items-center gap-4">
		<button
			onclick={togglePlayback}
			disabled={!audioData?.url}
			class="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{#if isPlaying}
				<Pause class="h-6 w-6" fill="currentColor" />
			{:else}
				<Play class="h-6 w-6" fill="currentColor" />
			{/if}
		</button>

		<form
			method="POST"
			action="?/uploadVoice"
			enctype="multipart/form-data"
			use:enhance={handleFormEnhance}
		>
			<button
				type="submit"
				disabled={!audioData || isUploading}
				class="rounded-full bg-white px-8 py-3 font-medium text-gray-900 hover:bg-gray-100 disabled:opacity-50"
			>
				{isUploading ? 'Saving...' : 'Save'}
			</button>
		</form>
	</div>
</div>
