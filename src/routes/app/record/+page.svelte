<script lang="ts">
	import { goto } from '$app/navigation';
	import { sleep } from '$lib/utils';
	import type { AudioData } from '$lib/types';
	import RecordingView from '$lib/components/app/record/RecordingView.svelte';
	import ProcessingView from '$lib/components/app/record/ProcessingView.svelte';
	import EditingView from '$lib/components/app/record/EditingView.svelte';

	import { Mic } from '@lucide/svelte';
	import type { PageProps } from './$types';
	import { Button } from '@/components/ui/button';
	import { toast } from 'svelte-sonner';

	let { data }: PageProps = $props();

	type Status = 'idle' | 'recording' | 'processing' | 'editing';

	let status = $state<Status>('idle');
	let audioData = $state<AudioData | null>(null);

	async function handleRecordEnd(data: AudioData) {
		audioData = data;
		status = 'processing';
		
		// Simulate a short processing delay for UX
		await sleep(2000);
		
		status = 'editing';
	}

	function handleCancelRecording() {
		status = 'idle';
		audioData = null;
	}

	function handleCloseEditing() {
		gotoDashboard();
	}

	function handleSaveSuccess() {
		toast.success('Recording saved successfully!');
		gotoDashboard();
	}

	function handleSaveError(error: string) {
		toast.error(`Error saving recording: ${error}`);
		console.error('Save error:', error);
	}

	function gotoDashboard() {
		goto('/app');
	}
</script>

<div class="flex min-h-svh flex-col">
	{#if status === 'idle'}
		<div class="flex flex-1 flex-col items-center justify-center p-8 py-20">
			<div class="mb-12 text-center">
				<h2 class="text-2xl font-bold tracking-tight text-foreground">Ready to capture?</h2>
				<p class="mt-2 text-base text-secondary">Click the button below to start recording</p>
			</div>

			<div class="relative flex items-center justify-center">
				<!-- Outer breathing ring -->
				<div class="absolute h-32 w-32 animate-pulse rounded-full bg-muted/40"></div>
				
				<Button
					onclick={() => status = 'recording'}
					size="icon"
					class="relative h-20 w-20 rounded-full bg-primary shadow-xl transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
				>
					<Mic class="size-8 text-primary-foreground" />
				</Button>
			</div>
		</div>
	{:else if status === 'recording'}
		<!-- Recording State -->
		<RecordingView 
			onRecordEnd={handleRecordEnd}
			onCancel={handleCancelRecording}
		/>
	{:else if status === 'processing'}
		<!-- Processing State -->
		<ProcessingView elapsedSeconds={audioData?.duration || 0} />
	{:else if status === 'editing' && audioData}
		<!-- Editing State -->
		<EditingView
			{audioData}
			onClose={handleCloseEditing}
			onSaveSuccess={handleSaveSuccess}
			onSaveError={handleSaveError}
			form={data.uploadVoiceForm}
		/>
	{/if}
</div>