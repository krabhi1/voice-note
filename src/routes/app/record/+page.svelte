<script lang="ts">
	import { goto } from '$app/navigation';
	import type { AudioData } from '$lib/types';
	import RecordingView from '$lib/components/app/record/RecordingView.svelte';
	import EditingView from '$lib/components/app/record/EditingView.svelte';
	import { Mic } from '@lucide/svelte';
	import { Button } from '@/components/ui/button';
	import { toast } from 'svelte-sonner';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let status = $state<'idle' | 'recording' | 'editing'>('idle');
	let audioData = $state<AudioData | null>(null);

	const exit = () => goto('/app');

	async function handleRecordEnd(data: AudioData) {
		audioData = data;
		status = 'editing';
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
				<div class="absolute h-32 w-32 animate-pulse rounded-full bg-muted/40"></div>
				<Button
					onclick={() => (status = 'recording')}
					size="icon"
					class="relative h-20 w-20 rounded-full bg-primary shadow-xl transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
				>
					<Mic class="size-8 text-primary-foreground" />
				</Button>
			</div>
		</div>
	{:else if status === 'recording'}
		<RecordingView onRecordEnd={handleRecordEnd} onCancel={() => (status = 'idle')} />
	{:else if status === 'editing' && audioData}
		<EditingView
			{audioData}
			onClose={exit}
			onSaveSuccess={() => {
				toast.success('Recording saved successfully!');
				exit();
			}}
			onSaveError={(err) => toast.error(`Error saving: ${err}`)}
			form={data.uploadVoiceForm}
		/>
	{/if}
</div>