<script lang="ts">
	import { goto } from '$app/navigation';
	import { client } from '$lib/auth-client';
	import { enhance } from '$app/forms';
	import { AudioRecorder } from '$lib/audio/recorder';
	import Button from '$lib/components/ui/Button.svelte';
	import type { PageProps, SubmitFunction } from './$types';
	import { formatTime } from '$lib/utils';
	import { Mic, Square, Play, Pause, X } from '@lucide/svelte';

	let { data }: PageProps = $props();

	const recorder = new AudioRecorder();
	let isRecording = $state(false);
	let hasNewRecording = $state(false);
	let isUploading = $state(false);
	let elapsedSeconds = $state(0);
	let isPaused = $state(false);
	let showEditingView = $state(false);
	const elapsedString = $derived.by(() => formatTime(elapsedSeconds));

	// Audio recorder event listeners
	recorder.addEventListener('start', () => {
		isRecording = true;
		hasNewRecording = false;
		showEditingView = false;
		elapsedSeconds = 0;
	});
	recorder.addEventListener('stop', () => {
		isRecording = false;
		hasNewRecording = true;
		showEditingView = true;
		isPaused = false;
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
				showEditingView = false;
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

	function handlePauseResume(paused: boolean) {
		if (paused) {
			recorder.resume();
		} else {
			recorder.pause();
		}
	}
</script>

<div class="bg-linear-to-br from-blue-900 via-blue-800 to-purple-900">
	{#if !isRecording && !showEditingView}
		<!-- Initial State -->
		<div class="flex py-20 flex-col items-center justify-center p-8">
			<div class="mb-8 text-center text-white/70">
				<p class="text-lg">Click the button to start recording.</p>
			</div>

			<button
				onclick={() => recorder.start()}
				class="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:scale-105 hover:bg-red-600"
			>
				<Mic class="h-8 w-8" />
			</button>

			<div class="absolute top-4 right-4">
				<button
					onclick={handleSignOut}
					class="rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20"
				>
					Sign Out
				</button>
			</div>
		</div>
	{:else if isRecording && !showEditingView}
		<!-- Recording State -->
		<div class="flex min-h-screen flex-col items-center justify-center p-8">
			<div class="mb-8 w-full max-w-2xl">
				<!-- Simple waveform visualization -->
				<div class="mt-4 flex h-16 items-center justify-center gap-1">
					{#each Array(50) as _}
						<div
							class="w-1 rounded-full bg-green-400 transition-all duration-200"
							style="height: {Math.random() * 40 + 10}px; opacity: {Math.random() * 0.5 + 0.5}"
						></div>
					{/each}
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
					onclick={() => handlePauseResume(isPaused)}
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
	{:else if showEditingView}
		<!-- Editing State -->
		<div class="flex min-h-screen flex-col items-center justify-center p-8">
			<button
				onclick={() => (showEditingView = false)}
				class="absolute top-4 right-4 text-white hover:text-white/70"
			>
				<X class="h-6 w-6" />
			</button>

			<!-- Full waveform -->
			<div class="mb-8 w-full max-w-4xl">
				<div class="relative">
					<!-- Trim handles -->
					<div class="absolute top-0 left-0 h-full w-2 cursor-ew-resize bg-cyan-400"></div>
					<div class="absolute top-0 right-0 h-full w-2 cursor-ew-resize bg-cyan-400"></div>

					<!-- Waveform -->
					<div class="flex h-24 items-center justify-center gap-1 px-4">
						{#each Array(200) as _, i}
							<div
								class="w-1 rounded-full bg-green-400"
								style="height: {i > 40 && i < 160 ? Math.random() * 50 + 10 : 5}px"
							></div>
						{/each}
					</div>
				</div>

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
						disabled={!hasNewRecording || isUploading}
						class="rounded-full bg-white px-8 py-3 font-medium text-gray-900 hover:bg-gray-100 disabled:opacity-50"
					>
						{isUploading ? 'Saving...' : 'Save'}
					</button>
				</form>
			</div>
		</div>
	{/if}

	<!-- Recordings List (shown when not in recording states) -->
	{#if !isRecording && !showEditingView && data.recordings?.length > 0}
		<div class=" bg-black/20 p-4">
			<div class="mx-auto max-w-4xl">
				<h2 class="mb-4 text-xl font-bold text-white">Your Recordings</h2>
				<div class="grid gap-3">
					{#each data.recordings as recording}
						<div class="rounded-lg bg-white/10 p-4 backdrop-blur">
							<div class="flex items-center justify-between">
								<div class="flex flex-col">
									<h3 class="font-semibold text-white">{recording.title}</h3>
									<div class="flex items-center gap-4 text-sm text-white/70">
										<span>{formatDuration(recording.duration)}s</span>
										<span>{formatFileSize(recording.size)}KB</span>
										<span>{formatDate(recording.createdAt)}</span>
									</div>
								</div>
								<audio
									controls
									src={`/app/audio/${recording.file_url}`}
									class="h-8"
									preload="metadata"
								></audio>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
