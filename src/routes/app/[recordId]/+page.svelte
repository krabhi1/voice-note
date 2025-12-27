<script lang="ts">
	import type { PageData } from './$types';
	import {
		Play,
		Pause,
		Volume2,
		VolumeX,
		SkipBack,
		SkipForward,
		Loader2,
		Calendar,
		FileAudio,
		ChevronLeft
	} from '@lucide/svelte';
	import { formatDuration } from '$lib/utils';

	let { data }: { data: PageData } = $props();

	// --- Media State (Declarative Bindings) ---
	let paused = $state(true);
	let currentTime = $state(0);
	let duration = $state(data.recording.duration / 1000 || 0);
	let volume = $state(1);
	let muted = $state(false);
	let playbackRate = $state(1);
	let readyState = $state(0);
	let loadError = $state<string | null>(null);

	// --- Derived State ---
	const isPlaying = $derived(!paused);
	const isReady = $derived(readyState >= 2);
	const skipAmount = $derived(duration <= 60 ? 5 : 15);
	const progressPercent = $derived((currentTime / duration) * 100 || 0);

	// --- Actions ---
	function togglePlaybackRate() {
		const rates = [1, 1.25, 1.5, 2];
		playbackRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
	}

	function handleError(e: Event) {
		const error = (e.target as HTMLAudioElement).error;
		loadError = error?.code === 4 ? 'Link expired. Please refresh.' : 'Playback error.';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.target instanceof HTMLInputElement) return;
		if (e.key === ' ') {
			e.preventDefault();
			paused = !paused;
		}
		if (e.key === 'ArrowLeft') currentTime -= skipAmount;
		if (e.key === 'ArrowRight') currentTime += skipAmount;
		if (e.key === 'm') muted = !muted;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<audio
	src={data.audioUrl}
	bind:paused
	bind:currentTime
	bind:duration
	bind:volume
	bind:muted
	bind:playbackRate
	bind:readyState
	onerror={handleError}
	class="hidden"
	preload="auto"
	crossorigin="anonymous"
></audio>

<div class="flex h-full flex-col overflow-hidden bg-background text-foreground">
	<!-- Navigation (Fixed Height) -->
	<header class="flex flex-none items-center justify-between px-6 py-4 sm:px-10">
		<a
			href="/app"
			class="flex items-center gap-2 text-xs font-bold tracking-widest text-secondary uppercase transition-colors hover:text-primary"
		>
			<ChevronLeft class="h-4 w-4" /> Library
		</a>
		<div class="flex items-center gap-2 text-secondary">
			<Calendar class="h-3.5 w-3.5" />
			<span class="text-[10px] font-bold tracking-tighter uppercase">
				{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(data.recording.createdAt)}
			</span>
		</div>
	</header>

	<!-- Main Player Area (Responsive Scaling) -->
	<main class="flex flex-1 items-center justify-center p-4 sm:p-8">
		<div class="flex w-full max-w-md flex-col items-center text-center">
			<!-- Icon Container (Scales on small screens) -->
			<div
				class="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary/5 text-primary shadow-2xl ring-1 shadow-primary/10 ring-primary/10 sm:mb-10 sm:h-32 sm:w-32 sm:rounded-[2.5rem]"
			>
				<FileAudio class="h-10 w-10 sm:h-12 sm:w-12" />
			</div>

			<!-- Title Section -->
			<div class="mb-8 sm:mb-12">
				<h1 class="mb-2 line-clamp-2 text-xl font-bold tracking-tight sm:text-3xl">
					{data.recording.title || 'Untitled Note'}
				</h1>
				<p class="text-[10px] font-bold tracking-[0.2em] text-secondary uppercase">
					{isReady ? 'Ready to stream' : 'Buffering...'}
				</p>
				{#if loadError}
					<div
						class="mt-4 inline-block rounded-full bg-destructive/10 px-4 py-1 text-[10px] font-bold text-destructive uppercase"
					>
						{loadError}
					</div>
				{/if}
			</div>

			<!-- Progress Section -->
			<div class="mb-8 w-full sm:mb-12">
				<div class="group relative flex items-center">
					<input
						type="range"
						min="0"
						max={duration}
						step="0.1"
						bind:value={currentTime}
						class="h-1.5 w-full cursor-pointer appearance-none rounded-full accent-primary transition-all"
						style="background: linear-gradient(to right, var(--muted-foreground) {progressPercent}%, var(--muted) {progressPercent}%);"
						aria-label="Seek"
					/>
				</div>
				<div class="mt-3 flex justify-between font-mono text-[10px] font-bold text-secondary">
					<span>{formatDuration(currentTime)}</span>
					<span>{formatDuration(duration)}</span>
				</div>
			</div>

			<!-- Main Controls -->
			<div class="mb-10 flex items-center justify-center gap-6 sm:mb-16 sm:gap-10">
				<button
					onclick={() => (currentTime -= skipAmount)}
					class="text-secondary transition-all hover:scale-110 hover:text-primary active:scale-95"
					title="Back {skipAmount}s"
				>
					<SkipBack class="h-7 w-7 fill-current sm:h-8 sm:w-8" />
				</button>

				<button
					onclick={() => (paused = !paused)}
					disabled={!isReady}
					class="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 sm:h-20 sm:w-20"
				>
					{#if !isReady && !loadError}
						<Loader2 class="h-8 w-8 animate-spin" />
					{:else if isPlaying}
						<Pause class="h-8 w-8 fill-current sm:h-10 sm:w-10" />
					{:else}
						<Play class="ml-1 h-8 w-8 fill-current sm:h-10 sm:w-10" />
					{/if}
				</button>

				<button
					onclick={() => (currentTime += skipAmount)}
					class="text-secondary transition-all hover:scale-110 hover:text-primary active:scale-95"
					title="Forward {skipAmount}s"
				>
					<SkipForward class="h-7 w-7 fill-current sm:h-8 sm:w-8" />
				</button>
			</div>

			<!-- Secondary Controls (Glassmorphism Bar) -->
			<div
				class="flex w-full items-center justify-between rounded-2xl border border-muted/20 bg-card/50 p-3 backdrop-blur-sm sm:p-4"
			>
				<div class="flex items-center gap-3">
					<button
						onclick={() => (muted = !muted)}
						class="text-secondary transition-colors hover:text-primary"
					>
						{#if muted || volume === 0}<VolumeX class="h-4 w-4" />{:else}<Volume2
								class="h-4 w-4"
							/>{/if}
					</button>
					<input
						type="range"
						min="0"
						max="1"
						step="0.01"
						bind:value={volume}
						class="h-1 w-16 cursor-pointer appearance-none bg-muted/30 accent-primary sm:w-24"
						aria-label="Volume"
					/>
				</div>

				<button
					onclick={togglePlaybackRate}
					class="rounded-lg bg-muted/10 px-3 py-1.5 text-[10px] font-bold text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
				>
					{playbackRate}x
				</button>
			</div>
		</div>
	</main>
</div>

<style>
	/* Custom Range Slider Styling */
	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 14px;
		height: 14px;
		background: var(--primary);
		cursor: pointer;
		border-radius: 50%;
		border: none;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}
	input[type='range']::-moz-range-thumb {
		width: 14px;
		height: 14px;
		background: var(--primary);
		cursor: pointer;
		border-radius: 50%;
		border: none;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}
</style>
