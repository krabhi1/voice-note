<script lang="ts">
	import { goto } from '$app/navigation';
	import { client } from '$lib/auth-client';
	import { enhance } from '$app/forms';
	import { AudioRecorder } from '$lib/audio/recorder';
	import Button from '$lib/components/ui/Button.svelte';
	import type { PageProps, SubmitFunction } from './$types';

	let { data }: PageProps = $props();

	const recorder = new AudioRecorder();

	// Audio recorder event listeners
	recorder.addEventListener('start', () => console.log('🎙️ Recording started'));
	recorder.addEventListener('data', (chunk) => console.log('Data chunk:', chunk.size));
	recorder.addEventListener('stop', (file) => console.log('✅ Recording stopped', file));
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

		return async ({ result, update }) => {
			if (result.type === 'success') {
				console.log('Upload successful!', result.data);
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
	<!-- Controls Section -->
	<div class="flex flex-col gap-2 p-2">
		<div class="flex flex-row gap-2">
			<Button onclick={() => recorder.start()}>Start Recording</Button>
			<Button variant="destructive" onclick={() => recorder.stop()}>Stop Recording</Button>
			<form
				method="POST"
				action="?/uploadVoice"
				enctype="multipart/form-data"
				use:enhance={handleFormEnhance}
			>
				<Button variant="outline" type="submit">Upload Recording</Button>
			</form>
		</div>
		<button
			onclick={handleSignOut}
			class="mb-4 rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
		>
			Sign Out
		</button>
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
