<script lang="ts">
	import { Square, Play, Pause, Mic } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import WaveSurfer from 'wavesurfer.js';
	import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';
	import { formatDuration } from '$lib/utils';
	import type { AudioData } from '$lib/types';
	import { toast } from 'svelte-sonner';
	import { WAVEFORM_CONFIG } from '$lib/audio/config';

	interface Props {
		onRecordEnd: (data: AudioData) => void;
		onCancel?: () => void;
	}

	let { onRecordEnd, onCancel }: Props = $props();

	let container = $state<HTMLDivElement | null>(null);
	let wavesurfer: WaveSurfer;
	let recordPlugin: any;
	let micStream: MediaStream | null = null;

	let isPaused = $state(false);
	let elapsedSeconds = $state(0);
	const elapsedString = $derived(formatDuration(elapsedSeconds));

	onMount(() => {
		if (!container) return;

		wavesurfer = WaveSurfer.create({
			...WAVEFORM_CONFIG,
			container,
			cursorWidth: 0,
			normalize: false
		});

		recordPlugin = wavesurfer.registerPlugin(
			RecordPlugin.create({ scrollingWaveform: true, renderRecordedAudio: false })
		);

		recordPlugin.on('record-pause', () => (isPaused = true));
		recordPlugin.on('record-resume', () => (isPaused = false));
		recordPlugin.on('record-progress', (time: number) => (elapsedSeconds = time / 1000));

		recordPlugin.on('record-end', (blob: Blob) => {
			micStream?.getTracks().forEach((t) => t.stop());
			const file = new File([blob], 'recording.webm', { type: blob.type });
			onRecordEnd({
				file,
				duration: elapsedSeconds,
				url: URL.createObjectURL(file),
				size: file.size
			});
		});

		startRecording();

		return () => {
			wavesurfer?.destroy();
			micStream?.getTracks().forEach((t) => t.stop());
		};
	});

	async function startRecording() {
		try {
			micStream = await recordPlugin.startMic();
			await recordPlugin.startRecording();
		} catch (err) {
			toast.error('Could not access microphone');
			onCancel?.();
		}
	}
</script>

<div class="flex flex-1 flex-col items-center justify-center bg-background p-4 sm:p-12">
	<div class="w-full max-w-3xl">
		<div class="mb-8 flex items-center justify-between border-b border-muted/30 pb-6 sm:mb-12 sm:pb-8">
			<div class="flex items-center gap-3 sm:gap-4">
				<div class="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground sm:h-10 sm:w-10">
					<Mic class="h-4 w-4 sm:h-5 sm:w-5" />
				</div>
				<div>
					<span class="block text-[10px] font-bold text-secondary sm:text-xs">Session</span>
					<div class="flex items-center gap-2">
						{#if isPaused}
							<span class="text-xs font-semibold text-secondary sm:text-sm">Paused</span>
						{:else}
							<div class="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500 sm:h-2 sm:w-2"></div>
							<span class="text-xs font-semibold text-foreground sm:text-sm">Live Recording</span>
						{/if}
					</div>
				</div>
			</div>
			<div class="text-right">
				<span class="block text-[10px] font-bold text-secondary sm:text-xs">Elapsed</span>
				<span class="font-mono text-xl font-bold text-foreground sm:text-2xl">{elapsedString}</span>
			</div>
		</div>

		<div class="relative mb-8 rounded-lg border border-muted bg-card p-6 shadow-xl shadow-muted/20 sm:mb-12 sm:p-10">
			<div class="h-32 w-full overflow-hidden sm:h-48">
				<div bind:this={container} class="h-full w-full"></div>
			</div>
			<div class="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 opacity-[0.03] sm:p-6">
				{#each Array(6) as _}
					<div class="w-full border-t border-foreground"></div>
				{/each}
			</div>
		</div>

		<div class="flex items-center justify-center gap-6 sm:gap-8">
			<button
				onclick={() => (isPaused ? recordPlugin.resumeRecording() : recordPlugin.pauseRecording())}
				class="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-foreground transition-all hover:bg-secondary/20 active:scale-95 sm:h-16 sm:w-16"
				aria-label={isPaused ? 'Resume' : 'Pause'}
			>
				{#if isPaused}<Play class="h-6 w-6 fill-current sm:h-7 sm:w-7" />{:else}<Pause class="h-6 w-6 fill-current sm:h-7 sm:w-7" />{/if}
			</button>

			<button
				onclick={() => recordPlugin.stopRecording()}
				class="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 active:scale-95 sm:h-16 sm:w-16"
				aria-label="Stop and Save"
			>
				<Square class="h-6 w-6 fill-current sm:h-7 sm:w-7" />
			</button>
		</div>
	</div>
</div>