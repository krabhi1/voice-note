<script lang="ts">
	import { Loader2 } from '@lucide/svelte';

	interface Props {
		elapsedSeconds: number;
	}

	let { elapsedSeconds }: Props = $props();

	const dots = $state(['.', '..', '...']);
	let currentDot = $state(0);

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

<div class="flex flex-1 flex-col items-center justify-center bg-background p-6">
	<div class="w-full max-w-sm rounded-lg border border-muted bg-card p-10 shadow-xl shadow-muted/20">
		<div class="flex flex-col items-center text-center">
			<!-- Icon -->
			<div class="mb-10 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
				<Loader2 class="h-5 w-5 animate-spin" />
			</div>

			<!-- Header -->
			<div class="space-y-2">
				<span class="text-xs font-bold text-secondary">System</span>
				<h2 class="text-base font-bold text-foreground">
					Analyzing Audio Stream{dots[currentDot]}
				</h2>
			</div>

			<!-- Technical Specs -->
			<div class="mt-10 w-full space-y-4 border-t border-muted/30 pt-8">
				<div class="flex items-center justify-between">
					<span class="text-xs font-bold text-secondary">Duration</span>
					<span class="font-mono text-sm font-bold text-foreground">{Math.round(elapsedSeconds)}.00s</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-xs font-bold text-secondary">Task</span>
					<span class="text-sm font-bold text-foreground">Waveform Gen</span>
				</div>
				
				<!-- Progress Bar -->
				<div class="relative h-1 w-full bg-muted/20 overflow-hidden">
					<div class="absolute inset-y-0 left-0 bg-primary animate-progress-ind"></div>
				</div>
			</div>

			<div class="mt-10">
				<p class="text-xs font-bold text-secondary">
					Please do not close this window
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes progress-ind {
		0% { left: 0; width: 0; }
		50% { left: 0; width: 100%; }
		100% { left: 100%; width: 0; }
	}
	.animate-progress-ind {
		animation: progress-ind 2s cubic-bezier(0.65, 0, 0.35, 1) infinite;
	}
</style>