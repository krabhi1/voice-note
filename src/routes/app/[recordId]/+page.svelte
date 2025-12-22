<script lang="ts">
	import type { PageProps } from './$types';
	import {
		Play,
		Pause,
		Volume2,
		VolumeX,
		SkipBack,
		SkipForward,
		Loader2,
		Mic,
		Clock,
		Calendar,
		FileAudio,
		ChevronLeft
	} from '@lucide/svelte';
	import { formatDuration } from '$lib/utils';
	import AudioWaveform from '$lib/components/common/AudioWaveform.svelte';
	import type WaveSurfer from 'wavesurfer.js';

	let { data }: PageProps = $props();

	const url = `/app/audio/${data.recording.file_url}`;

	let wavesurfer = $state<WaveSurfer | null>(null);

	let isPlaying = $state(false);
	let duration = $state(0);
	let currentTime = $state(0);
	let volume = $state(1);
	let isMuted = $state(false);
	let playbackRate = $state(1);
	let isReady = $state(false);

	function toggleMute() {
		isMuted = !isMuted;
		wavesurfer?.setMuted(isMuted);
	}

	function togglePlaybackRate() {
		const rates = [1, 1.25, 1.5, 2];
		playbackRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
		wavesurfer?.setPlaybackRate(playbackRate);
	}

	function handleVolumeChange(e: Event) {
		volume = parseFloat((e.target as HTMLInputElement).value);
		wavesurfer?.setVolume(volume);
		isMuted = volume === 0;
	}

	const skipAmount = $derived.by(() => {
		if (duration <= 30) return 2;
		if (duration <= 120) return 5;
		if (duration <= 600) return 10;
		return 30;
	});

	const metadata = $derived([
		{ icon: Clock, label: 'Duration', value: `${duration.toFixed(2)}s` },
		{ icon: Mic, label: 'Source', value: 'Web Browser Audio' },
		{ icon: FileAudio, label: 'File Type', value: 'MP3 / MPEG-4' }
	]);
</script>

<div class="flex flex-1 flex-col bg-background">
	<div class="border-b border-muted/30 px-4 py-6 sm:px-10 sm:py-8">
		<div class="mx-auto max-w-5xl">
			<div class="mb-4 sm:mb-6">
				<a
					href="/app"
					class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-secondary transition-colors hover:text-primary sm:text-xs"
				>
					<ChevronLeft class="h-3.5 w-3.5" /> Back to Library
				</a>
			</div>
			<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<div class="mb-2 flex items-center gap-2">
						<span class="text-[10px] font-bold uppercase tracking-wider text-secondary sm:text-xs"
							>Playback</span
						>
						<div class="h-px w-8 bg-muted/30"></div>
						<span class="font-mono text-[10px] font-bold text-secondary sm:text-xs"
							>ID: {data.recording.id.slice(0, 8)}</span
						>
					</div>
					<h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
						{data.recording.title || 'Untitled Recording'}
					</h1>
				</div>
				<div
					class="flex w-fit items-center gap-2 rounded-md border border-muted/30 bg-card px-3 py-1.5"
				>
					<Calendar class="h-3.5 w-3.5 text-secondary" />
					<span class="text-[10px] font-bold text-secondary sm:text-xs">
						{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
							data.recording.createdAt
						)}
					</span>
				</div>
			</div>
		</div>
	</div>

	<div class="flex-1 overflow-auto px-4 py-8 sm:px-10 sm:py-12">
		<div class="mx-auto max-w-5xl">
			<div class="relative rounded-lg border border-muted bg-card p-6 shadow-xl shadow-muted/20 sm:p-10">
				<div class="mb-8 flex items-center justify-between">
					<div class="flex items-center gap-3 sm:gap-4">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
						>
							<FileAudio class="h-4 w-4" />
						</div>
						<span class="text-[10px] font-bold uppercase tracking-wider text-foreground sm:text-xs"
							>Audio Stream</span
						>
					</div>
				</div>

				<div
					class="relative h-24 w-full overflow-hidden rounded-md border border-muted/30 bg-background sm:h-32"
				>
					<AudioWaveform
						bind:wavesurfer
						{url}
						onReady={() => {
							isReady = true;
							duration = wavesurfer?.getDuration() || 0;
						}}
						onPlay={() => (isPlaying = true)}
						onPause={() => (isPlaying = false)}
						onFinish={() => (isPlaying = false)}
						onTimeUpdate={(t) => (currentTime = t)}
						onInteraction={(t) => (currentTime = t)}
					/>
					{#if !isReady}
						<div
							class="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm"
						>
							<Loader2 class="h-6 w-6 animate-spin text-secondary" />
						</div>
					{/if}
					<div
						class="absolute inset-0 -z-10 pointer-events-none flex flex-col justify-between p-4 opacity-[0.03]"
					>
						{#each Array(4) as _}<div class="w-full border-t border-foreground"></div>{/each}
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
							>{formatDuration(duration)}</span
						>
					</div>
				</div>

				<div class="mt-10 flex items-center justify-center gap-4 sm:gap-6">
					<button
						onclick={() => wavesurfer?.skip(-skipAmount)}
						disabled={!isReady}
						class="group relative flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary transition-colors hover:bg-secondary/20 disabled:opacity-30 sm:h-12 sm:w-12"
						aria-label="Skip back {skipAmount} seconds"
					>
						<SkipBack class="h-4 w-4 sm:h-5 sm:w-5" />
						<span
							class="absolute -bottom-6 text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100"
							>{skipAmount}s</span
						>
					</button>

					<button
						onclick={() => wavesurfer?.playPause()}
						disabled={!isReady}
						class="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 sm:h-20 sm:w-20"
					>
						{#if !isReady}<Loader2 class="h-6 w-6 animate-spin sm:h-8 sm:w-8" />{:else if isPlaying}<Pause
								class="h-6 w-6 fill-current sm:h-8 sm:w-8"
							/>{:else}<Play class="h-6 w-6 fill-current ml-1 sm:h-8 sm:w-8" />{/if}
					</button>

					<button
						onclick={() => wavesurfer?.skip(skipAmount)}
						disabled={!isReady}
						class="group relative flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary transition-colors hover:bg-secondary/20 disabled:opacity-30 sm:h-12 sm:w-12"
						aria-label="Skip forward {skipAmount} seconds"
					>
						<SkipForward class="h-4 w-4 sm:h-5 sm:w-5" />
						<span
							class="absolute -bottom-6 text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100"
							>{skipAmount}s</span
						>
					</button>
				</div>

				<div
					class="mt-10 flex flex-col items-center justify-center gap-6 sm:mt-12 sm:flex-row sm:gap-8"
				>
					<div class="flex w-full items-center justify-center gap-4 sm:w-auto">
						<button onclick={toggleMute} class="text-secondary hover:text-primary transition-colors">
							{#if isMuted || volume === 0}<VolumeX class="h-4 w-4" />{:else}<Volume2
									class="h-4 w-4"
								/>{/if}
						</button>
						<input
							type="range"
							min="0"
							max="1"
							step="0.01"
							value={isMuted ? 0 : volume}
							oninput={handleVolumeChange}
							class="h-0.5 w-full cursor-pointer appearance-none bg-muted/30 accent-primary sm:w-24"
						/>
					</div>
					<button
						onclick={togglePlaybackRate}
						class="flex h-8 w-14 items-center justify-center rounded-full bg-muted/5 text-[10px] font-bold text-secondary transition-all hover:bg-muted/10 hover:text-primary"
					>
						{playbackRate}x
					</button>
				</div>
			</div>

			<div class="mt-8 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-6">
				{#each metadata as item}
					<div class="rounded-lg border border-muted/30 bg-card/50 p-5 backdrop-blur-sm sm:p-6">
						<div
							class="mb-4 flex h-8 w-8 items-center justify-center rounded-md bg-muted/20 text-secondary"
						>
							<item.icon class="h-4 w-4" />
						</div>
						<h3 class="text-[10px] font-bold uppercase tracking-wider text-foreground sm:text-xs">
							{item.label}
						</h3>
						<p class="mt-2 font-mono text-xs text-secondary">{item.value}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 10px;
		height: 10px;
		background: var(--primary);
		cursor: pointer;
		border-radius: 50%;
		border: none;
	}
	input[type='range']::-moz-range-thumb {
		width: 10px;
		height: 10px;
		background: var(--primary);
		cursor: pointer;
		border-radius: 50%;
		border: none;
	}
</style>