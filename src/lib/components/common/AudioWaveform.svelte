<script lang="ts">
	import { onMount } from 'svelte';
	import WaveSurfer from 'wavesurfer.js';
	import { WAVEFORM_CONFIG } from '$lib/audio/config';

	interface Props {
		wavesurfer?: WaveSurfer | null;
		url?: string;
		mode?: 'playback' | 'live';
		onReady?: () => void;
		onPlay?: () => void;
		onPause?: () => void;
		onFinish?: () => void;
		onTimeUpdate?: (time: number) => void;
		onInteraction?: (time: number) => void;
	}

	let {
		wavesurfer = $bindable(null),
		url,
		mode = 'playback',
		onReady,
		onPlay,
		onPause,
		onFinish,
		onTimeUpdate,
		onInteraction
	}: Props = $props();

	let container = $state<HTMLDivElement | null>(null);
	let resizeObserver: ResizeObserver | null = null;
	let initId: number;
	let loadedUrl = $state(url);

	onMount(() => {
		if (!container) return;

		initId = requestAnimationFrame(() => {
			if (!container) return;

			const wsOptions: any = {
				...WAVEFORM_CONFIG,
				container,
				height: container.clientHeight
			};

			if (mode === 'playback' && url) {
				wsOptions.url = url;
				loadedUrl = url;
			}

			// Special tweaks for live recording mode
			if (mode === 'live') {
				wsOptions.cursorWidth = 0;
				wsOptions.normalize = false;
			}

			wavesurfer = WaveSurfer.create(wsOptions);

			// Event Listeners
			wavesurfer.on('ready', () => onReady?.());
			wavesurfer.on('play', () => onPlay?.());
			wavesurfer.on('pause', () => onPause?.());
			wavesurfer.on('finish', () => onFinish?.());
			wavesurfer.on('audioprocess', (time) => onTimeUpdate?.(time));
			wavesurfer.on('interaction', () => onInteraction?.(wavesurfer?.getCurrentTime() || 0));

			// Handle Responsive Resizing
			resizeObserver = new ResizeObserver(() => {
				if (wavesurfer && container) {
					wavesurfer.setOptions({ height: container.clientHeight });
				}
			});
			resizeObserver.observe(container);
		});

		return () => {
			cancelAnimationFrame(initId);
			resizeObserver?.disconnect();
			wavesurfer?.destroy();
		};
	});

	// Handle URL changes reactively for playback mode
	$effect(() => {
		if (mode === 'playback' && url && wavesurfer && url !== loadedUrl) {
			loadedUrl = url;
			wavesurfer.load(url);
		}
	});
</script>

<div bind:this={container}></div>

<style>
	/* Ensure the container fills its parent */
	div {
		height: 100%;
		width: 100%;
		cursor: pointer;
	}
</style>