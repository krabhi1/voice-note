<script lang="ts">
	import { Square, Play, Pause } from '@lucide/svelte';
	import type { AudioRecorder } from '$lib/audio/recorder';
	import { RecordingWaveEngine } from '$lib/audio/RecordingWaveEngine';
	import RecordingWaveform from '$lib/components/RecordingWaveform.svelte';

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
<!-- UI -->
<div class="flex min-h-screen flex-col items-center justify-center p-8 bg-white text-black">
	<div class="mb-8 w-full max-w-4xl">
		<!-- Waveform -->
		<div class="mt-4 w-full h-[210px] rounded-lg overflow-hidden">
			<RecordingWaveform {bars} barWidth={2} gap={1} />
		</div>
	</div>

	<!-- Timer + Controls -->
	<div class="flex items-center gap-4">
		<div class="flex items-center gap-3 rounded-full bg-gray-800 px-3 py-2 text-white">
			<button
				onclick={() => {
					recorder.stop();
					waveEngine.stop();
				}}
				class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-500 text-white hover:bg-gray-500/80"
			>
				<Square class="h-4 w-4" fill="currentColor" />
			</button>

			<span class="text-sm">{elapsedString}</span>
		</div>

		<button
			onclick={() => {
				onPauseResume(isPaused);
				// The effect above will call waveEngine.pause() or resume()
			}}
			class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-800"
		>
			{#if isPaused}
				<Play class="h-5 w-5 animate-pulse" fill="currentColor" />
			{:else}
				<Pause class="h-5 w-5" fill="currentColor" />
			{/if}
		</button>
	</div>
</div>
