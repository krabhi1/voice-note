<script lang="ts">
	import type { PageProps } from './$types';
	import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Loader2 } from '@lucide/svelte';

	let { data }: PageProps = $props();

	const url = `/app/audio/${data.recording.file_url}`;

	let audio: HTMLAudioElement;
	let isPlaying = $state(false);
	let duration = $state(0);
	let currentTime = $state(0);
	let volume = $state(1);
	let isMuted = $state(false);

	let isDragging = $state(false);
	let isReady = $state(false);

	function togglePlay() {
		if (!audio || !isReady) return;

		if (audio.paused) {
			audio.play();
			isPlaying = true;
		} else {
			audio.pause();
			isPlaying = false;
		}
	}

	function formatTime(seconds: number) {
		if (!Number.isFinite(seconds) || Number.isNaN(seconds)) return '0:00';
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function handleTimeUpdate() {
		if (!isDragging) {
			currentTime = audio.currentTime;
		}
	}

	function handleLoadedMetadata() {
		duration = audio.duration;
		isReady = true;
	}

	function handleSeekInput(e: Event) {
		isDragging = true;
		const target = e.target as HTMLInputElement;
		currentTime = parseFloat(target.value);
		audio.currentTime = currentTime;
	}

	function handleSeekChange(e: Event) {
		isDragging = false;
		const target = e.target as HTMLInputElement;
		console.log('value', target.value);
		audio.currentTime = parseFloat(target.value);
	}

	function toggleMute() {
		isMuted = !isMuted;
		audio.muted = isMuted;
	}

	function handleVolumeChange(e: Event) {
		const target = e.target as HTMLInputElement;
		volume = parseFloat(target.value);
		audio.volume = volume;
		isMuted = volume === 0;
	}

	function skip(seconds: number) {
		if (!audio) return;
		audio.currentTime += seconds;
	}
</script>

<div class="flex h-full w-full flex-col justify-center bg-white p-8 dark:bg-zinc-950">
	<div class="mx-auto flex w-full max-w-4xl flex-col gap-8">
		<div class="space-y-2 text-center">
			<h2 class="line-clamp-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
				{data.recording.title || 'Untitled Recording'}
			</h2>
			<p class="text-sm font-medium text-zinc-500 dark:text-zinc-400">
				{new Date(data.recording.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
			</p>
		</div>

		<audio
			bind:this={audio}
			src={url}
			ontimeupdate={handleTimeUpdate}
			onloadedmetadata={handleLoadedMetadata}
			oncanplay={() => (isReady = true)}
			onended={() => (isPlaying = false)}
			class="hidden"
		></audio>

		<div class="group flex flex-col gap-3 pt-4">
			<div class="relative flex h-4 items-center">
				<input
					id="custom-slider"
					type="range"
					min="0"
					step="0.01"
					max={duration}
					value={currentTime}
					oninput={handleSeekInput}
					onchange={handleSeekChange}
					disabled={!isReady}
					class="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900 dark:bg-zinc-800 dark:accent-white"
				/>
			</div>

			<div
				class="flex justify-between px-1 text-xs font-medium text-zinc-500 tabular-nums dark:text-zinc-400"
			>
				<span>{formatTime(currentTime)}</span>
				<span>{formatTime(duration)}</span>
			</div>
		</div>

		<div class="flex items-center justify-center gap-10">
			<button
				onclick={() => skip(-10)}
				disabled={!isReady}
				class="text-zinc-400 transition-colors hover:text-zinc-900 disabled:opacity-50 dark:hover:text-white"
				aria-label="Skip back 10 seconds"
			>
				<SkipBack size={24} strokeWidth={1.5} />
			</button>

			<button
				onclick={togglePlay}
				disabled={!isReady}
				class="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-white shadow-xl shadow-zinc-900/10 transition-all hover:scale-105 hover:shadow-zinc-900/20 active:scale-95 disabled:scale-100 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:shadow-white/5"
				aria-label={isPlaying ? 'Pause' : 'Play'}
			>
				{#if !isReady}
					<Loader2 size={28} class="animate-spin opacity-50" />
				{:else if isPlaying}
					<Pause size={28} fill="currentColor" />
				{:else}
					<Play size={28} fill="currentColor" class="ml-1" />
				{/if}
			</button>

			<button
				onclick={() => skip(10)}
				disabled={!isReady}
				class="text-zinc-400 transition-colors hover:text-zinc-900 disabled:opacity-50 dark:hover:text-white"
				aria-label="Skip forward 10 seconds"
			>
				<SkipForward size={24} strokeWidth={1.5} />
			</button>
		</div>

		<div
			class="mx-auto flex w-full max-w-[200px] items-center justify-center gap-3 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100 hover:opacity-100"
		>
			<button onclick={toggleMute} class="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
				{#if isMuted || volume === 0}
					<VolumeX size={18} />
				{:else}
					<Volume2 size={18} />
				{/if}
			</button>
			<input
				type="range"
				min="0"
				max="1"
				step="0.01"
				value={isMuted ? 0 : volume}
				oninput={handleVolumeChange}
				class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900 dark:bg-zinc-800 dark:accent-white"
			/>
		</div>
	</div>
</div>

<style>
</style>
