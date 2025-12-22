<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Loader2, Mic, Clock, Calendar, FileAudio, ChevronLeft } from '@lucide/svelte';
	import WaveSurfer from 'wavesurfer.js';
	import { formatDuration } from '$lib/utils';
	import { WAVEFORM_CONFIG } from '$lib/audio/config';

	let { data }: PageProps = $props();

	const url = `/app/audio/${data.recording.file_url}`;

	let wavesurfer: WaveSurfer;
	let container: HTMLDivElement;
	
	let isPlaying = $state(false);
	let duration = $state(0);
	let currentTime = $state(0);
	let volume = $state(1);
	let isMuted = $state(false);
	let playbackRate = $state(1);
	let isReady = $state(false);

	onMount(() => {
		wavesurfer = WaveSurfer.create({
			...WAVEFORM_CONFIG,
			container,
			url,
			height: 128,
		});

		wavesurfer.on('ready', () => {
			isReady = true;
			duration = wavesurfer.getDuration();
		});

		wavesurfer.on('audioprocess', (time) => (currentTime = time));
		wavesurfer.on('interaction', () => (currentTime = wavesurfer.getCurrentTime()));
		wavesurfer.on('play', () => (isPlaying = true));
		wavesurfer.on('pause', () => (isPlaying = false));
		wavesurfer.on('finish', () => (isPlaying = false));

		return () => wavesurfer.destroy();
	});

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
	<div class="border-b border-muted/30 px-6 py-8 sm:px-10">
		<div class="mx-auto max-w-5xl">
			<div class="mb-6">
				<a href="/app" class="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:text-primary transition-colors">
					<ChevronLeft class="h-4 w-4" /> Back to Library
				</a>
			</div>
			<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<div class="mb-2 flex items-center gap-2">
						<span class="text-xs font-bold text-secondary">Playback</span>
						<div class="h-px w-8 bg-muted/30"></div>
						<span class="text-xs font-mono text-secondary">ID: {data.recording.id.slice(0, 8)}</span>
					</div>
					<h1 class="text-3xl font-bold tracking-tight text-foreground">{data.recording.title || 'Untitled Recording'}</h1>
				</div>
				<div class="flex items-center gap-2 rounded-md border border-muted/30 bg-card px-3 py-1.5">
					<Calendar class="h-3.5 w-3.5 text-secondary" />
					<span class="text-xs font-bold text-secondary">
						{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(data.recording.createdAt)}
					</span>
				</div>
			</div>
		</div>
	</div>

	<div class="flex-1 overflow-auto px-6 py-12 sm:px-10">
		<div class="mx-auto max-w-5xl">
			<div class="relative rounded-lg border border-muted bg-card p-10 shadow-xl shadow-muted/20">
				<div class="mb-8 flex items-center justify-between">
					<div class="flex items-center gap-4">
						<div class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<FileAudio class="h-4 w-4" />
						</div>
						<span class="text-xs font-bold text-foreground">Audio Stream</span>
					</div>
					<div class="flex items-center gap-6 text-right">
						<div>
							<span class="block text-xs font-bold text-secondary">Current</span>
							<span class="font-mono text-xs font-bold text-foreground">{formatDuration(currentTime)}</span>
						</div>
						<div>
							<span class="block text-xs font-bold text-secondary">Total</span>
							<span class="font-mono text-xs font-bold text-foreground">{formatDuration(duration)}</span>
						</div>
					</div>
				</div>

				<div class="relative mb-12 h-32 w-full overflow-hidden rounded-md border border-muted/30 bg-background">
					<div bind:this={container} class="h-full w-full cursor-pointer"></div>
					{#if !isReady}
						<div class="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
							<Loader2 class="h-6 w-6 animate-spin text-secondary" />
						</div>
					{/if}
					<div class="absolute inset-0 -z-10 pointer-events-none flex flex-col justify-between opacity-[0.03]">
						{#each Array(4) as _}<div class="w-full border-t border-foreground"></div>{/each}
					</div>
				</div>

				<div class="flex items-center justify-center gap-6">
					<button
						onclick={() => wavesurfer?.skip(-skipAmount)}
						disabled={!isReady}
						class="group relative flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary transition-colors hover:bg-secondary/20 disabled:opacity-30"
						aria-label="Skip back {skipAmount} seconds"
					>
						<SkipBack class="h-5 w-5" />
						<span
							class="absolute -bottom-6 text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100"
							>{skipAmount}s</span
						>
					</button>

					<button
						onclick={() => wavesurfer?.playPause()}
						disabled={!isReady}
						class="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
					>
						{#if !isReady}<Loader2 class="h-8 w-8 animate-spin" />{:else if isPlaying}<Pause
								class="h-8 w-8 fill-current"
							/>{:else}<Play class="h-8 w-8 fill-current ml-1" />{/if}
					</button>

					<button
						onclick={() => wavesurfer?.skip(skipAmount)}
						disabled={!isReady}
						class="group relative flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary transition-colors hover:bg-secondary/20 disabled:opacity-30"
						aria-label="Skip forward {skipAmount} seconds"
					>
						<SkipForward class="h-5 w-5" />
						<span
							class="absolute -bottom-6 text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100"
							>{skipAmount}s</span
						>
					</button>
				</div>

				<div class="mt-12 flex items-center justify-center gap-8">
					<div class="flex items-center gap-4">
						<button onclick={toggleMute} class="text-secondary hover:text-primary transition-colors">
							{#if isMuted || volume === 0}<VolumeX class="h-4 w-4" />{:else}<Volume2 class="h-4 w-4" />{/if}
						</button>
						<input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} oninput={handleVolumeChange} class="h-0.5 w-24 cursor-pointer appearance-none bg-muted/30 accent-primary" />
					</div>
					<button onclick={togglePlaybackRate} class="flex h-7 w-12 items-center justify-center rounded-full bg-muted/5 text-[10px] font-bold text-secondary hover:bg-muted/10 hover:text-primary transition-all">
						{playbackRate}x
					</button>
				</div>
			</div>

			<div class="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
				{#each metadata as item}
					<div class="rounded-lg border border-muted/30 bg-card/50 p-6 backdrop-blur-sm">
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