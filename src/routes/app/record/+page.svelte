<script lang="ts">
	import { goto } from '$app/navigation';
	import { client } from '$lib/auth-client';
	import { AudioRecorder } from '$lib/audio/recorder';
	import type { PageProps } from './$types';
	import { formatDuration, sleep } from '$lib/utils';
	import type { AudioData } from '../types';

	import RecordingView from './RecordingView.svelte';
	import ProcessingView from './ProcessingView.svelte';
	import EditingView from './EditingView.svelte';
	import { EditorWaveEngine, type EditorWaveData } from '$lib/audio/EditorWaveEngine';
	import { onMount } from 'svelte';
	let { data }: PageProps = $props();

	const recorder = new AudioRecorder();
	let isRecording = $state(false);
	let isProcessing = $state(false);
	let showEditingView = $state(false);
	let elapsedSeconds = $state(0);
	let isPaused = $state(false);
	let audioData = $state<AudioData | null>(null);
	let waveData = $state<EditorWaveData | null>(null);

	const elapsedString = $derived.by(() => formatDuration(elapsedSeconds));
	onMount(() => {
		recorder.start();
		return () => {
			recorder.stop();
		};
	});
	// Audio recorder event listeners
	recorder.addEventListener('start', () => {
		isRecording = true;
		isProcessing = false;
		showEditingView = false;
		elapsedSeconds = 0;
		audioData = null;
	});

	recorder.addEventListener('stop', async () => {
		isRecording = false;
		isPaused = false;
		isProcessing = true;
		await sleep(2000);

		try {
			// Process the audio data
			audioData = await recorder.getAudio();
			if (audioData) {
				const waveEngine = new EditorWaveEngine();
				waveData = await waveEngine.load(audioData.file);
				console.log('✅ Waveform data generated:', waveData);
				isProcessing = false;
				showEditingView = true;
			} else {
				throw new Error('No recording data available');
			}
		} catch (error) {
			console.error('❌ Processing error:', error);
			isProcessing = false;
		}
	});

	recorder.addEventListener('timer', (elapsed) => {
		elapsedSeconds = elapsed;
	});

	recorder.addEventListener('pause', () => {
		isPaused = true;
	});

	recorder.addEventListener('resume', () => {
		isPaused = false;
	});

	recorder.addEventListener('error', (error) => {
		console.error('❌ Recording error:', error);
	});

	function handlePauseResume(paused: boolean) {
		if (paused) {
			recorder.resume();
		} else {
			recorder.pause();
		}
	}

	function handleCloseEditing() {
		gotoDashboard();
	}

	function handleSaveSuccess() {
		gotoDashboard();
	}

	function handleSaveError(error: string) {
		//TODO show error toast/notification here instead of just setting state
		console.error('Save error:', error);
	}
	function gotoDashboard() {
		goto('/app');
	}
</script>

<div class="flex min-h-svh flex-col">
	{#if isRecording}
		<!-- Recording State -->
		<RecordingView {recorder} {elapsedString} {isPaused} onPauseResume={handlePauseResume} />
	{:else if isProcessing}
		<!-- Processing State -->
		<ProcessingView {elapsedSeconds} />
	{:else if showEditingView && audioData && waveData}
		<!-- Editing State -->
		<EditingView
			{audioData}
			{waveData}
			{elapsedSeconds}
			onClose={handleCloseEditing}
			onSaveSuccess={handleSaveSuccess}
			onSaveError={handleSaveError}
		/>
	{/if}
</div>
