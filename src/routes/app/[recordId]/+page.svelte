<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { PageProps } from './$types';
	import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Loader2, Mic, Clock, Calendar, FileAudio, ChevronLeft } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { EditorWaveEngine, type EditorWaveData } from '$lib/audio/EditorWaveEngine';
	import { AudioWaveformRenderer } from '$lib/audio/AudioWaveformRenderer';

	let { data }: PageProps = $props();

	const url = `/app/audio/${data.recording.file_url}`;

	let audio: HTMLAudioElement;
	let isPlaying = $state(false);
	let duration = $state(0);
	let currentTime = $state(0);
	let volume = $state(1);
	let isMuted = $state(false);
	let playbackRate = $state(1);

	let isDragging = $state(false);
	let isReady = $state(false);

	let waveData = $state<EditorWaveData | null>(null);
	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let renderer: AudioWaveformRenderer | null = null;

	let _onAudioError: (e: Event) => void;

	async function loadWaveform() {
		try {
			const response = await fetch(url);
			const blob = await response.blob();
			const file = new File([blob], 'audio.mp3', { type: 'audio/mpeg' });
			const engine = new EditorWaveEngine();
			waveData = await engine.load(file);
			
			if (canvasEl && waveData) {
				renderer = new AudioWaveformRenderer(canvasEl);
				renderer.setData(waveData.peaks, waveData.duration);
				renderer.addEventListener('onSeek', (time) => {
					if (audio) {
						audio.currentTime = time;
						currentTime = time;
					}
				});
			}
		} catch (err) {
			console.error('Failed to load waveform:', err);
		}
	}

	onMount(async () => {
		if (audio) {
			audio.volume = volume;

			_onAudioError = (e: Event) => {
				console.error('Audio element error event:', e, 'mediaError:', audio.error);
				toast.error('Failed to load audio');
			};
			audio.addEventListener('error', _onAudioError);
		}
		await loadWaveform();
	});

	onDestroy(() => {
		if (audio && _onAudioError) {
			audio.removeEventListener('error', _onAudioError);
		}
		renderer?.destroy();
	});

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
		if (!Number.isFinite(seconds) || Number.isNaN(seconds)) return '00:00';
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	function handleTimeUpdate() {
		if (!isDragging) {
			currentTime = audio.currentTime;
			renderer?.draw(currentTime);
		}
	}

	function handleLoadedMetadata() {
		duration = audio.duration;
		isReady = true;
	}



	function toggleMute() {
		isMuted = !isMuted;
		audio.muted = isMuted;
	}

	function togglePlaybackRate() {
		if (!audio) return;
		const rates = [1, 1.25, 1.5, 2];
		const currentIndex = rates.indexOf(playbackRate);
		playbackRate = rates[(currentIndex + 1) % rates.length];
		audio.playbackRate = playbackRate;
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

<div class="flex flex-1 flex-col bg-background">
	<!-- Header -->
	<div class="border-b border-muted/30 px-6 py-8 sm:px-10">
		<div class="mx-auto max-w-5xl">
			<div class="mb-6">
				<a href="/app" class="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:text-primary transition-colors">
					<ChevronLeft class="h-4 w-4" />
					Back to Library
				</a>
			</div>
			<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<div class="mb-2 flex items-center gap-2">
						<span class="text-xs font-bold text-secondary">Playback</span>
						<div class="h-px w-8 bg-muted/30"></div>
						<span class="text-xs font-mono text-secondary">ID: {data.recording.id.slice(0, 8)}</span>
					</div>
					<h1 class="text-3xl font-bold tracking-tight text-foreground">
						{data.recording.title || 'Untitled Recording'}
					</h1>
				</div>
				
				<div class="flex items-center gap-3">
					<div class="flex items-center gap-2 rounded-md border border-muted/30 bg-card px-3 py-1.5">
						<Calendar class="h-3.5 w-3.5 text-secondary" />
						<span class="text-xs font-bold text-secondary">
							{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(data.recording.createdAt)}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="flex-1 overflow-auto px-6 py-12 sm:px-10">
		<div class="mx-auto max-w-5xl">
			<audio
				bind:this={audio}
				src={url}
				ontimeupdate={handleTimeUpdate}
				onloadedmetadata={handleLoadedMetadata}
				oncanplay={() => (isReady = true)}
				onended={() => (isPlaying = false)}
				class="hidden"
			></audio>

			<!-- Player Interface -->
			<div class="relative rounded-lg border border-muted bg-card p-10 shadow-xl shadow-muted/20">
				<div class="mb-8 flex items-center justify-between">
					<div class="flex items-center gap-4">
						<div class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<FileAudio class="h-4 w-4" />
						</div>
						<span class="text-xs font-bold text-foreground">Audio Stream</span>
					</div>
					<div class="flex items-center gap-6">
						<div class="text-right">
							<span class="block text-xs font-bold text-secondary">Current</span>
							<span class="font-mono text-xs font-bold text-foreground">{formatTime(currentTime)}</span>
						</div>
						<div class="text-right">
							<span class="block text-xs font-bold text-secondary">Total</span>
							<span class="font-mono text-xs font-bold text-foreground">{formatTime(duration)}</span>
						</div>
					</div>
				</div>

				<!-- Waveform Progress -->
				<div class="relative mb-12 h-32 w-full bg-background border border-muted/30 rounded-md overflow-hidden">
					<canvas bind:this={canvasEl} class="block h-full w-full cursor-pointer"></canvas>
					
					{#if !waveData}
						<div class="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
							<Loader2 class="h-6 w-6 animate-spin text-secondary" />
						</div>
					{/if}
					
					<!-- Decorative Grid Lines -->
					<div class="absolute inset-0 -z-10 pointer-events-none flex flex-col justify-between opacity-[0.03]">
						{#each Array(4) as _}
							<div class="w-full border-t border-foreground"></div>
						{/each}
					</div>
				</div>

				<!-- Controls -->
				<div class="flex items-center justify-center gap-6">
					<button
						onclick={() => skip(-10)}
						disabled={!isReady}
						class="flex h-12 w-12 items-center justify-center rounded-2xl border border-muted bg-card text-secondary transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
						aria-label="Skip back 10 seconds"
					>
						<SkipBack class="h-5 w-5" />
					</button>

					<button
						onclick={togglePlay}
						disabled={!isReady}
						class="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
						aria-label={isPlaying ? 'Pause' : 'Play'}
					>
						{#if !isReady}
							<Loader2 class="h-8 w-8 animate-spin" />
						{:else if isPlaying}
							<Pause class="h-8 w-8 fill-current" />
						{:else}
							<Play class="h-8 w-8 fill-current ml-1" />
						{/if}
					</button>

					<button
						onclick={() => skip(10)}
						disabled={!isReady}
						class="flex h-12 w-12 items-center justify-center rounded-2xl border border-muted bg-card text-secondary transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
						aria-label="Skip forward 10 seconds"
					>
						<SkipForward class="h-5 w-5" />
					</button>
				</div>

				<!-- Volume & Speed Control -->
				<div class="mt-12 flex items-center justify-center gap-8">
					<div class="flex items-center gap-4">
						<button onclick={toggleMute} class="text-secondary hover:text-primary transition-colors">
							{#if isMuted || volume === 0}
								<VolumeX class="h-4 w-4" />
							{:else}
								<Volume2 class="h-4 w-4" />
							{/if}
						</button>
						<input
							type="range"
							min="0"
							max="1"
							step="0.01"
							value={isMuted ? 0 : volume}
							oninput={handleVolumeChange}
							class="h-0.5 w-24 cursor-pointer appearance-none bg-muted/30 accent-primary"
						/>
					</div>

					<button 
						onclick={togglePlaybackRate}
						class="flex h-7 w-12 items-center justify-center rounded-md border border-muted/30 bg-muted/5 text-[10px] font-bold text-secondary hover:border-primary hover:text-primary transition-all"
					>
						{playbackRate}x
					</button>
				</div>
			</div>

			<!-- Metadata Grid -->
			<div class="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
				<div class="rounded-lg border border-muted/30 p-6 bg-card/50 backdrop-blur-sm">
					<div class="mb-4 flex h-8 w-8 items-center justify-center rounded-md bg-muted/20 text-secondary">
						<Clock class="h-4 w-4" />
					</div>
					<h3 class="text-xs font-bold text-foreground">Duration</h3>
					<p class="mt-2 font-mono text-xs text-secondary">{duration.toFixed(2)} seconds</p>
				</div>
				<div class="rounded-lg border border-muted/30 p-6 bg-card/50 backdrop-blur-sm">
					<div class="mb-4 flex h-8 w-8 items-center justify-center rounded-md bg-muted/20 text-secondary">
						<Mic class="h-4 w-4" />
					</div>
					<h3 class="text-xs font-bold text-foreground">Source</h3>
					<p class="mt-2 font-mono text-xs text-secondary">Web Browser Audio</p>
				</div>
				<div class="rounded-lg border border-muted/30 p-6 bg-card/50 backdrop-blur-sm">
					<div class="mb-4 flex h-8 w-8 items-center justify-center rounded-md bg-muted/20 text-secondary">
						<FileAudio class="h-4 w-4" />
					</div>
					<h3 class="text-xs font-bold text-foreground">File Type</h3>
					<p class="mt-2 font-mono text-xs text-secondary">MP3 / MPEG-4</p>
				</div>
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
