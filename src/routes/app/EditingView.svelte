<script lang="ts">
	import { X, Play } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import WaveformVisualization from './WaveformVisualization.svelte';
	import type { AudioData } from './types';
	import type { SubmitFunction } from './$types';

	interface Props {
		audioData: AudioData;
		elapsedSeconds: number;
		onClose: () => void;
		onSaveSuccess: () => void;
		onSaveError: (error: string) => void;
	}

	let { 
		audioData, 
		elapsedSeconds, 
		onClose, 
		onSaveSuccess,
		onSaveError
	}: Props = $props();

	let isUploading = $state(false);

	const handleFormEnhance: SubmitFunction = async ({ formData, cancel }) => {
		if (!audioData) {
			alert('No recording available to upload!');
			cancel();
			return;
		}

		formData.set('voice-note', audioData.file, 'recording.webm');
		formData.set('duration', String(audioData.duration * 1000));

		isUploading = true;

		return async ({ result, update }) => {
			isUploading = false;

			if (result.type === 'success') {
				console.log('Upload successful!', result.data);
				onSaveSuccess();
				await update();
			} else if (result.type === 'failure') {
				console.error('Upload failed:', result.data);
				const errorMessage = result.data?.errors || 'Unknown error occurred';
				onSaveError(errorMessage);
			}
		};
	};
</script>

<div class="flex min-h-screen flex-col items-center justify-center p-8">
	<button
		onclick={onClose}
		class="absolute top-4 right-4 text-white hover:text-white/70"
	>
		<X class="h-6 w-6" />
	</button>

	<!-- Full waveform -->
	<div class="mb-8 w-full max-w-4xl">
		<WaveformVisualization 
			barCount={200} 
			height="h-24" 
			staticPattern={true} 
			trimHandles={true} 
		/>

		<!-- Timeline -->
		<div class="mt-2 flex justify-between text-sm text-white/70">
			<span>00:00.0</span>
			<span>00:{elapsedSeconds.toString().padStart(2, '0')}.3</span>
		</div>
	</div>

	<!-- Controls -->
	<div class="flex items-center gap-4">
		<button
			class="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
		>
			<Play class="h-6 w-6" fill="currentColor" />
		</button>

		<form
			method="POST"
			action="?/uploadVoice"
			enctype="multipart/form-data"
			use:enhance={handleFormEnhance}
		>
			<button
				type="submit"
				disabled={!audioData || isUploading}
				class="rounded-full bg-white px-8 py-3 font-medium text-gray-900 hover:bg-gray-100 disabled:opacity-50"
			>
				{isUploading ? 'Saving...' : 'Save'}
			</button>
		</form>
	</div>
</div>