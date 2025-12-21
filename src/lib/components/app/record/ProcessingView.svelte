<script lang="ts">
	import { Loader2 } from '@lucide/svelte';

	interface Props {
		elapsedSeconds: number;
	}

	let { elapsedSeconds }: Props = $props();
	let currentDot = $state(0);

	$effect(() => {
		const interval = setInterval(() => (currentDot = (currentDot + 1) % 3), 500);
		return () => clearInterval(interval);
	});

	const specs = $derived([
		{ label: 'Duration', value: `${Math.round(elapsedSeconds)}.00s` },
		{ label: 'Task', value: 'Waveform Gen' }
	]);
</script>

<div class="flex flex-1 flex-col items-center justify-center bg-background p-6">
	<div class="w-full max-w-sm rounded-lg border border-muted bg-card p-10 shadow-xl shadow-muted/20">
		<div class="flex flex-col items-center text-center">
			<div class="mb-10 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
				<Loader2 class="h-5 w-5 animate-spin" />
			</div>

			<div class="space-y-2">
				<span class="text-xs font-bold text-secondary">System</span>
				<h2 class="text-base font-bold text-foreground">
					Analyzing Audio Stream{'.'.repeat(currentDot + 1)}
				</h2>
			</div>

			<div class="mt-10 w-full space-y-4 border-t border-muted/30 pt-8">
				{#each specs as spec}
					<div class="flex items-center justify-between">
						<span class="text-xs font-bold text-secondary">{spec.label}</span>
						<span class="font-mono text-sm font-bold text-foreground">{spec.value}</span>
					</div>
				{/each}
				
				<div class="relative h-1 w-full overflow-hidden bg-muted/20">
					<div class="absolute inset-y-0 left-0 bg-primary animate-progress"></div>
				</div>
			</div>

			<p class="mt-10 text-xs font-bold text-secondary">Please do not close this window</p>
		</div>
	</div>
</div>

<style>
	@keyframes progress {
		0% { left: -40%; width: 40%; }
		100% { left: 100%; width: 40%; }
	}
	.animate-progress {
		animation: progress 1.5s ease-in-out infinite;
	}
</style>