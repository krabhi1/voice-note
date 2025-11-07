<script lang="ts">
	import { Square, Play, Pause } from '@lucide/svelte';
	import WaveformVisualization from './WaveformVisualization.svelte';
	import type { AudioRecorder } from '$lib/audio/recorder';

	interface Props {
		recorder: AudioRecorder;
		elapsedString: string;
		isPaused: boolean;
		onPauseResume: (paused: boolean) => void;
	}

	let { recorder, elapsedString, isPaused, onPauseResume }: Props = $props();
</script>

<div class="flex min-h-screen flex-col items-center justify-center p-8">
	<div class="mb-8 w-full max-w-2xl">
		<!-- Simple waveform visualization -->
		<div class="mt-4 flex h-16 items-center justify-center gap-1">
			<WaveformVisualization barCount={50} animated={true} />
		</div>
	</div>

	<!-- Timer and controls -->
	<div class="flex items-center gap-4">
		<div class="flex items-center gap-3 rounded-full bg-black/50 px-3 py-2 text-white">
			<button
				onclick={() => recorder.stop()}
				class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
			>
				<Square class="h-4 w-4" fill="currentColor" />
			</button>

			<span class=" text-sm">{elapsedString}</span>
		</div>

		<button
			onclick={() => onPauseResume(isPaused)}
			class="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/40"
		>
			{#if isPaused}
				<Play class="h-5 w-5 animate-pulse" fill="currentColor" />
			{:else}
				<Pause class="h-5 w-5" fill="currentColor" />
			{/if}
		</button>
	</div>
</div>