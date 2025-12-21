<script lang="ts">
	import { Square, Play, Pause, Mic } from '@lucide/svelte';
	import type { AudioRecorder } from '$lib/audio/recorder';
	import { RecordingWaveEngine } from '$lib/audio/RecordingWaveEngine';
	import RecordingWaveform from '$lib/components/common/RecordingWaveform.svelte';

	interface Props {
		recorder: AudioRecorder;
		elapsedString: string;
		isPaused: boolean;
		onPauseResume: (paused: boolean) => void;
	}

	let { recorder, elapsedString, isPaused, onPauseResume }: Props = $props();

	// Full history bars (updated by wave engine)
	let bars = $state<number[]>([]);

	// Wave engine with pause & resume supported
	const waveEngine = new RecordingWaveEngine({
		smoothing: 0.6,
		onUpdate: (vals) => (bars = vals)
	});

	// START / STOP when recorder changes
	$effect(() => {
		if (recorder.isRecording() && recorder.stream) {
			// Start engine
			waveEngine.start(recorder.stream);
		} else {
			// Stop everything
			waveEngine.stop();
		}
	});

	// PAUSE / RESUME waveform when recorder pauses
	$effect(() => {
		if (isPaused) {
			waveEngine.pause();
		} else {
			waveEngine.resume();
		}
	});

	// Cleanup on unmount
	$effect(() => {
		return () => waveEngine.stop();
	});
</script>

<div class="flex flex-1 flex-col items-center justify-center bg-background p-6 sm:p-12">
	<div class="w-full max-w-3xl">
		<!-- Status Header -->
		<div class="mb-12 flex items-center justify-between border-b border-muted/30 pb-8">
			<div class="flex items-center gap-4">
				<div class="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
					<Mic class="h-5 w-5" />
				</div>
				<div>
					<span class="block text-xs font-bold text-secondary">Session</span>
					<div class="flex items-center gap-2">
						{#if isPaused}
							<span class="text-sm font-semibold text-secondary">Paused</span>
						{:else}
							<div class="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
							<span class="text-sm font-semibold text-foreground">Live Recording</span>
						{/if}
					</div>
				</div>
			</div>
			<div class="text-right">
				<span class="block text-xs font-bold text-secondary">Elapsed</span>
				<span class="font-mono text-2xl font-bold text-foreground">{elapsedString}</span>
			</div>
		</div>

		<!-- Waveform Container -->
		<div class="relative mb-12 rounded-lg border border-muted bg-card p-10 shadow-xl shadow-muted/20">
			<div class="h-48 w-full overflow-hidden">
				<RecordingWaveform {bars} barWidth={3} gap={2} />
			</div>
			
			<!-- Decorative Grid Lines -->
			<div class="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 opacity-[0.03]">
				{#each Array(6) as _}
					<div class="w-full border-t border-foreground"></div>
				{/each}
			</div>
		</div>

		<!-- Controls -->
		<div class="flex items-center justify-center gap-8">
			<button
				onclick={() => {
					onPauseResume(isPaused);
				}}
				class="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary bg-card text-primary transition-all hover:bg-muted/5 active:scale-95"
				aria-label={isPaused ? 'Resume' : 'Pause'}
			>
				{#if isPaused}
					<Play class="h-7 w-7 fill-current" />
				{:else}
					<Pause class="h-7 w-7 fill-current" />
				{/if}
			</button>

			<button
				onclick={() => {
					recorder.stop();
					waveEngine.stop();
				}}
				class="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 active:scale-95"
				aria-label="Stop and Save"
			>
				<Square class="h-7 w-7 fill-current" />
			</button>
		</div>
		
		<div class="mt-16 text-center">
			<p class="text-xs font-bold text-secondary">
				Finalize recording to start editing
			</p>
		</div>
	</div>
</div>