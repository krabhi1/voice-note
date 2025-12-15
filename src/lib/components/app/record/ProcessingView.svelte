<script lang="ts">
	import { Loader2 } from '@lucide/svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';

	interface Props {
		elapsedSeconds: number;
	}

	let { elapsedSeconds }: Props = $props();

	const dots = $state(['.', '..', '...']);
	let currentDot = $state(0);

	// Animate the dots every 500ms
	let interval: ReturnType<typeof setInterval>;

	$effect(() => {
		interval = setInterval(() => {
			currentDot = (currentDot + 1) % dots.length;
		}, 500);

		return () => {
			if (interval) clearInterval(interval);
		};
	});
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-background p-8">
	<div class="mx-auto flex w-full max-w-md flex-col items-center text-center">
		<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
			<Loader2 class="h-8 w-8 animate-spin text-primary" />
		</div>

		<h2 class="mb-2 text-2xl font-semibold tracking-tight text-foreground">
			Processing your recording{dots[currentDot]}
		</h2>

		<p class="mb-8 text-muted-foreground">
			Preparing your {Math.round(elapsedSeconds)}s recording for editing
		</p>

		<!-- Optional: Show a progress bar or waveform preview -->
		<!-- <div class="w-full">
			<Skeleton class="h-2 w-full rounded-full" />
		</div> -->
	</div>
</div>
