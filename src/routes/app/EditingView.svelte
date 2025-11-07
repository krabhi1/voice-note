<script lang="ts">
	import { X, Play, Pause } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import WaveformVisualization from './WaveformVisualization.svelte';
	import type { AudioData } from './types';
	import type { SubmitFunction } from './$types';
	import { formatDuration } from '$lib/utils';

	interface Props {
		audioData: AudioData;
		elapsedSeconds: number;
		onClose: () => void;
		onSaveSuccess: () => void;
		onSaveError: (error: string) => void;
	}

	let {
		audioData,
		elapsedSeconds,
		onClose,
		onSaveSuccess,
		onSaveError
	}: Props = $props();

	let isUploading = $state(false);
	let isPlaying = $state(false);
	let currentTime = $state(0);
	let audioElement = $state<HTMLAudioElement>();

	function togglePlayback() {
		if (!audioElement || !audioData?.url) return;

		if (isPlaying) {
			audioElement.pause();
		} else {
			audioElement.play();
		}
	}

	function handleAudioPlay() {
		isPlaying = true;
	}

	function handleAudioPause() {
		isPlaying = false;
	}

	function handleAudioEnded() {
		isPlaying = false;
		currentTime = 0;
	}

	function handleTimeUpdate() {
		if (audioElement) {
			// Update more frequently for smoother progress
			currentTime = Math.floor(audioElement.currentTime * 10) / 10;
		}
	}

	function handleSeek(time: number) {
		if (audioElement) {
			const seekTime = Math.max(0, Math.min(time, audioData.duration));
			audioElement.currentTime = seekTime;
			currentTime = seekTime;
		}
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
	<button
		onclick={onClose}
		class="absolute top-4 right-4 text-white hover:text-white/70"
	>
		<X class="h-6 w-6" />
	</button>

	<!-- Full waveform -->
	<div class="mb-8 w-full max-w-4xl">
		<WaveformVisualization
			barCount={200}
			height="h-24"
			staticPattern={true}
			trimHandles={true}
			animated={false}
			showProgress={true}
			{currentTime}
			duration={audioData.duration}
			onSeek={handleSeek}
		/>

		<!-- Timeline -->
		<div class="mt-2 flex justify-between text-sm text-white/70">
			<span>{formatDuration(currentTime)}</span>
			<span>{formatDuration(audioData.duration)}</span>
		</div>

		<!-- Current time indicator -->
		{#if isPlaying}
			<div class="mt-3 text-center">
				<div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
					<div class="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
					<span class="text-sm font-medium text-white">
						{formatDuration(currentTime)} / {formatDuration(audioData.duration)}
					</span>
				</div>
			</div>
		{/if}
	</div>

	<!-- Hidden audio element -->
	{#if audioData?.url}
		<audio
			bind:this={audioElement}
			src={audioData.url}
			onplay={handleAudioPlay}
			onpause={handleAudioPause}
			onended={handleAudioEnded}
			ontimeupdate={handleTimeUpdate}
			preload="auto"
		></audio>
	{/if}

	<!-- Controls -->
	<div class="flex items-center gap-4">
		<button
			onclick={togglePlayback}
			disabled={!audioData?.url}
			class="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
