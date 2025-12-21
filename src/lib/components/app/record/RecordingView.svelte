<script lang="ts">
	import { Square, Play, Pause, Mic } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import WaveSurfer from 'wavesurfer.js';
	import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';
	import { formatDuration, sleep } from '$lib/utils';
	import type { AudioData } from '$lib/types';
	import { toast } from 'svelte-sonner';

	interface Props {
		onRecordEnd: (data: AudioData) => void;
		onCancel?: () => void;
	}

	let { onRecordEnd, onCancel }: Props = $props();

	let container = $state<HTMLDivElement | null>(null);
	let wavesurfer: WaveSurfer;
	let recordPlugin: RecordPlugin;
	let micStream = $state<MediaStream | null>(null);

	let isPaused = $state(false);
	let elapsedSeconds = $state(0);
	const elapsedString = $derived.by(() => formatDuration(elapsedSeconds));

	onMount(() => {
		if (container) {
			wavesurfer = WaveSurfer.create({
				container,
				waveColor: 'rgb(161, 161, 170)', // neutral-400
				progressColor: 'rgb(124, 58, 237)', // violet-600
				cursorWidth: 0,
				barWidth: 3,
				barGap: 3,
				barRadius: 3,
				height: 192, // h-48
				normalize: false
			});

			recordPlugin = wavesurfer.registerPlugin(
				RecordPlugin.create({
					scrollingWaveform: true,
					renderRecordedAudio: false
				})
			);

			// Event Listeners
			recordPlugin.on('record-pause', () => {
				isPaused = true;
			});

			recordPlugin.on('record-resume', () => {
				isPaused = false;
			});

			recordPlugin.on('record-progress', (time: number) => {
				elapsedSeconds = time / 1000;
			});

			recordPlugin.on('record-end', async (blob: Blob) => {
				// Stop the stream tracks to release mic
				if (micStream) {
					micStream.getTracks().forEach((t) => t.stop());
					micStream = null;
				}

				try {
					const file = new File([blob], 'recording.webm', { type: blob.type });
					const audioData: AudioData = {
						file,
						duration: elapsedSeconds,
						url: URL.createObjectURL(file),
						size: file.size
					};

					onRecordEnd(audioData);
				} catch (error) {
					console.error(' Processing error:', error);
					toast.error('Failed to process recording');
					onCancel?.();
				}
			});

			// Start Recording Automatically
			startRecording();
		}

		return () => {
			if (recordPlugin) {
				recordPlugin.destroy();
			}
			if (wavesurfer) {
				wavesurfer.destroy();
			}
			if (micStream) {
				micStream.getTracks().forEach((t) => t.stop());
			}
		};
	});

	async function startRecording() {
		try {
			micStream = await recordPlugin.startMic();
			await recordPlugin.startRecording();
		} catch (err) {
			console.error('Failed to start recording', err);
			toast.error('Could not access microphone');
			onCancel?.();
		}
	}

	function togglePause() {
		if (isPaused) {
			recordPlugin.resumeRecording();
		} else {
			recordPlugin.pauseRecording();
		}
	}

	function stopRecording() {
		recordPlugin.stopRecording();
	}
</script>

<div class="flex flex-1 flex-col items-center justify-center bg-background p-6 sm:p-12">
	<div class="w-full max-w-3xl">
		<!-- Status Header -->
		<div class="mb-12 flex items-center justify-between border-b border-muted/30 pb-8">
			<div class="flex items-center gap-4">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground"
				>
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
		<div
			class="relative mb-12 rounded-lg border border-muted bg-card p-10 shadow-xl shadow-muted/20"
		>
			<div class="h-48 w-full overflow-hidden">
				<div bind:this={container} class="h-full w-full"></div>
			</div>

			<!-- Decorative Grid Lines -->
			<div
				class="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 opacity-[0.03]"
			>
				{#each Array(6) as _}
					<div class="w-full border-t border-foreground"></div>
				{/each}
			</div>
		</div>

		<!-- Controls -->
		<div class="flex items-center justify-center gap-8">
			<button
				onclick={togglePause}
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
				onclick={stopRecording}
				class="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 active:scale-95"
				aria-label="Stop and Save"
			>
				<Square class="h-7 w-7 fill-current" />
			</button>
		</div>

		<div class="mt-16 text-center">
			<p class="text-xs font-bold text-secondary">Finalize recording to start editing</p>
		</div>
	</div>
</div>
