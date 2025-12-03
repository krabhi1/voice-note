<script lang="ts">
	import { goto } from '$app/navigation';
	import { AudioRecorder } from '$lib/audio/recorder';
	import { formatDuration, sleep } from '$lib/utils';
	import type { AudioData } from '../types';

	import RecordingView from './RecordingView.svelte';
	import ProcessingView from './ProcessingView.svelte';
	import EditingView from './EditingView.svelte';
	import { EditorWaveEngine, type EditorWaveData } from '$lib/audio/EditorWaveEngine';
	import { onMount } from 'svelte';
	import { Mic } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	
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
	{#if !isRecording && !isProcessing && !showEditingView}
		<div class="flex flex-1 flex-col items-center justify-center p-8 py-20">
			<div class="mb-8 text-center text-gray-700">
				<p class="text-lg">Click the button to start recording.</p>
			</div>

			<button
				onclick={() => recorder.start()}
				class="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gray-600 text-white shadow-lg transition-all hover:scale-105 hover:bg-gray-700"
			>
				<Mic class="h-8 w-8" />
			</button>
		</div>
	{:else if isRecording}
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
			{form}
		/>
	{/if}
</div>
