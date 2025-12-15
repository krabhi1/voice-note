<script lang="ts">
	import { Square, Play, Pause } from '@lucide/svelte';
	import type { AudioRecorder } from '$lib/audio/recorder';
	import { RecordingWaveEngine } from '$lib/audio/RecordingWaveEngine';
	import RecordingWaveform from '$lib/components/RecordingWaveform.svelte';
	import { Button } from '$lib/components/ui/button';

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
<div class="flex min-h-screen flex-col items-center justify-center bg-background p-8">
	<div class="mb-8 w-full max-w-4xl">
		<!-- Waveform -->
		<div class=" mt-4 h-[210px] w-full overflow-hidden text-card-foreground">
			<RecordingWaveform {bars} barWidth={2} gap={1} />
		</div>
	</div>

	<!-- Timer + Controls -->
	<div class="flex items-center gap-4">
		<div
			class="flex items-center gap-3 rounded-full bg-secondary px-3 py-2 text-secondary-foreground shadow-sm"
		>
			<Button
				variant="destructive"
				size="icon-sm"
				class="rounded-full"
				onclick={() => {
					recorder.stop();
					waveEngine.stop();
				}}
			>
				<Square class="size-4" fill="currentColor" />
			</Button>

			<span class="text-sm font-medium">{elapsedString}</span>
		</div>

		<Button
			variant={isPaused ? 'outline' : 'default'}
			size="icon-lg"
			class="rounded-full shadow-md"
			onclick={() => {
				onPauseResume(isPaused);
				// The effect above will call waveEngine.pause() or resume()
			}}
		>
			{#if isPaused}
				<Play class="size-5 animate-pulse" fill="currentColor" />
			{:else}
				<Pause class="size-5" fill="currentColor" />
			{/if}
		</Button>
	</div>
</div>
