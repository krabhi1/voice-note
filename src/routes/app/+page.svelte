<script lang="ts">
	import { goto } from '$app/navigation';
	import { client } from '$lib/auth-client';
	import { enhance } from '$app/forms';
	import { AudioRecorder } from '$lib/audio/recorder';
	import Button from '$lib/components/ui/Button.svelte';
	import type { PageProps, SubmitFunction } from './$types';
	import { formatTime } from '$lib/utils';

	let { data }: PageProps = $props();

	const recorder = new AudioRecorder();
	let isRecording = $state(false);
	let hasNewRecording = $state(false);
	let isUploading = $state(false);
	let elapsedSeconds = $state(0);
	const elapsedString = $derived.by(() => formatTime(elapsedSeconds));

	// Audio recorder event listeners
	recorder.addEventListener('start', () => {
		isRecording = true;
		hasNewRecording = false;
		elapsedSeconds = 0;
	});
	recorder.addEventListener('stop', (file) => {
		isRecording = false;
		hasNewRecording = true;
	});
	recorder.addEventListener('timer', (elapsed) => {
		elapsedSeconds = elapsed;
	});
	recorder.addEventListener('error', (error) => console.error('❌ Recording error:', error));

	async function handleSignOut() {
		await client.signOut({
			fetchOptions: {
				onSuccess: () => goto('/sign-in')
			}
		});
	}

	const handleFormEnhance: SubmitFunction = async ({ formData, cancel }) => {
		const recording = await recorder.getAudio();
		if (!recording) {
			alert('No recording available to upload!');
			cancel();
			return;
		}

		formData.set('voice-note', recording.file, 'recording.webm');
		formData.set('duration', String(recording.duration * 1000));

		isUploading = true;

		return async ({ result, update }) => {
			isUploading = false;

			if (result.type === 'success') {
				console.log('Upload successful!', result.data);
				hasNewRecording = false;
				await update();
			} else if (result.type === 'failure') {
				console.error('Upload failed:', result.data);
				alert('Upload failed: ' + result.data?.errors);
			}
		};
	};

	function formatDuration(milliseconds: number): number {
		return Math.round(milliseconds / 1000);
	}

	function formatFileSize(bytes: number): number {
		return Math.round(bytes / 1024);
	}

	function formatDate(dateString: Date): string {
		return dateString.toLocaleString();
	}
</script>

<div class="mx-auto max-w-3xl p-4">
	<!-- Recording Status Display -->
	{#if isRecording}
		<div class="mb-4 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
			<div class="flex flex-col items-center gap-3">
				<div class="flex items-center gap-3">
					<div class="h-4 w-4 animate-pulse rounded-full bg-red-500"></div>
					<span class="text-sm font-medium tracking-wide text-red-600 uppercase">
						Recording in Progress
					</span>
				</div>
				<div class="font-mono text-3xl font-bold text-red-700">
					{elapsedString}
				</div>

			</div>
		</div>
	{:else if hasNewRecording}
		<div class="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
			<div class="flex items-center justify-center gap-2">
				<div class="h-3 w-3 rounded-full bg-green-500"></div>
				<span class="text-sm font-medium text-green-700"> Recording ready for upload </span>
			</div>
		</div>
	{/if}

	<!-- Controls Section -->
	<div class="flex flex-row justify-between gap-2 p-2">
		<div class="flex flex-row gap-2">
			<Button
				onclick={() => recorder.start()}
				disabled={isRecording}
				class={isRecording ? 'bg-red-500 hover:bg-red-600' : ''}
			>
				{#if isRecording}
					<div class="flex items-center gap-2">
						<div class="h-2 w-2 animate-pulse rounded-full bg-white"></div>
						Recording {elapsedString}
					</div>
				{:else}
					Start Recording
				{/if}
			</Button>
			<Button variant="destructive" onclick={() => recorder.stop()} disabled={!isRecording}>
				Stop Recording
			</Button>
			<form
				method="POST"
				action="?/uploadVoice"
				enctype="multipart/form-data"
				use:enhance={handleFormEnhance}
			>
				<Button variant="outline" type="submit" disabled={!hasNewRecording || isUploading}>
					{isUploading ? 'Uploading...' : 'Upload'}
				</Button>
			</form>
		</div>
		<Button onclick={handleSignOut} variant="destructive" size="sm">Sign Out</Button>
	</div>

	<!-- Recordings Section -->
	<div>
		<h2 class="mb-4 text-xl font-bold text-gray-800">Your Recordings</h2>
		{#if data.recordings?.length > 0}
			<div class="grid gap-3">
				{#each data.recordings as recording}
					<div class="rounded-lg border border-gray-200 bg-white p-4">
						<div class="flex flex-row justify-between gap-2">
							<div class="flex flex-col items-start justify-between">
								<h3 class="font-semibold text-gray-900">{recording.title}</h3>
								<div class="mt-1 flex w-full items-center gap-4">
									<span class="font-medium">{formatDuration(recording.duration)}s</span>
									<div class="flex flex-col text-right text-xs text-gray-500">
										<span>{formatFileSize(recording.size)}KB</span>
									</div>
								</div>
							</div>
							<audio
								controls
								src={`/app/audio/${recording.file_url}`}
								class="h-10 flex-1"
								preload="metadata"
							></audio>
							<div class="flex flex-col items-center gap-2">
								<span class="rounded-full bg-gray-50 px-2 py-1 text-sm text-gray-400">
									{formatDate(recording.createdAt)}
								</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="py-12 text-center">
				<div class="mb-2 text-gray-400">
					<svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
						></path>
					</svg>
				</div>
				<p class="text-lg text-gray-500">No recordings yet</p>
				<p class="mt-1 text-sm text-gray-400">Start recording to see your audio files here</p>
			</div>
		{/if}
	</div>
</div>
