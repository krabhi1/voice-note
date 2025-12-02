<script lang="ts">
	import { goto } from '$app/navigation';
	import { client } from '$lib/auth-client';
	import { AudioRecorder } from '$lib/audio/recorder';
	import type { PageProps } from './$types';
	import { formatDuration, sleep } from '$lib/utils';
	import type { AudioData } from './types';

	import RecordingButton from './RecordingButton.svelte';
	import RecordingView from './RecordingView.svelte';
	import ProcessingView from './ProcessingView.svelte';
	import EditingView from './EditingView.svelte';
	import RecordingsList from './RecordingsList.svelte';
	import { EditorWaveEngine, type EditorWaveData } from '$lib/audio/EditorWaveEngine';

	let { data }: PageProps = $props();

	const recorder = new AudioRecorder();
	let isRecording = $state(false);
	let isProcessing = $state(false);
	let showEditingView = $state(false);
	let elapsedSeconds = $state(0);
	let isPaused = $state(false);
	let audioData = $state<AudioData | null>(null);
	let waveData = $state<EditorWaveData | null>(null);
	let errorMessage = $state<string | null>(null);

	const elapsedString = $derived.by(() => formatDuration(elapsedSeconds));

	// Audio recorder event listeners
	recorder.addEventListener('start', () => {
		isRecording = true;
		isProcessing = false;
		showEditingView = false;
		elapsedSeconds = 0;
		audioData = null;
		errorMessage = null;
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
			errorMessage = error instanceof Error ? error.message : 'Failed to process recording';
			// Return to initial state on error
			resetToInitialState();
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
		errorMessage = typeof error === 'string' ? error : 'Recording error occurred';
		resetToInitialState();
	});

	async function handleSignOut() {
		await client.signOut({
			fetchOptions: {
				onSuccess: () => goto('/')
			}
		});
	}

	function handlePauseResume(paused: boolean) {
		if (paused) {
			recorder.resume();
		} else {
			recorder.pause();
		}
	}

	function handleCloseEditing() {
		resetToInitialState();
	}

	function handleSaveSuccess() {
		resetToInitialState();
		// Optionally refresh the recordings list
		// This would trigger a page reload to get updated data
		location.reload();
	}

	function handleSaveError(error: string) {
		errorMessage = error;
		// Could show error toast/notification here instead of just setting state
		console.error('Save error:', error);
	}

	function resetToInitialState() {
		isRecording = false;
		isProcessing = false;
		showEditingView = false;
		audioData = null;
		elapsedSeconds = 0;
		isPaused = false;
		// Don't reset errorMessage here - let it be cleared on next action
	}

	function clearError() {
		errorMessage = null;
	}
</script>

<div class="flex min-h-svh flex-col">
	<!-- Error notification -->
	{#if errorMessage}
		<div class="absolute top-4 right-4 left-4 z-50">
			<div class="mx-auto max-w-md rounded-lg bg-red-500/90 p-4 text-white backdrop-blur">
				<div class="flex items-center justify-between">
					<span>{errorMessage}</span>
					<button onclick={clearError} class="ml-2 text-white/70 hover:text-white"> ✕ </button>
				</div>
			</div>
		</div>
	{/if}

	{#if !isRecording && !isProcessing && !showEditingView}
		<!-- Initial State -->
		<RecordingButton {recorder} onSignOut={handleSignOut} />
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
		/>
	{/if}

	<!-- Recordings List (shown when not in active recording workflow) -->
	{#if !isRecording && !isProcessing && !showEditingView}
		<RecordingsList recordings={data.recordings} pagination={data.pagination} />
	{/if}
</div>
