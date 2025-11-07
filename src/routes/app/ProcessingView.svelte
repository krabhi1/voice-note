<script lang="ts">
	interface Props {
		elapsedSeconds: number;
	}

	let { elapsedSeconds }: Props = $props();

	const dots = $state(['.', '..', '...']);
	let currentDot = $state(0);

	// Animate the dots every 500ms
	let interval: NodeJS.Timeout;
	
	$effect(() => {
		interval = setInterval(() => {
			currentDot = (currentDot + 1) % dots.length;
		}, 500);
		
		return () => {
			if (interval) clearInterval(interval);
		};
	});
</script>

<div class="flex min-h-screen flex-col items-center justify-center p-8">
	<div class="mb-8 text-center">
		<div class="mb-4">
			<!-- Processing animation -->
			<div class="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 mx-auto mb-4">
				<div class="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
			</div>
		</div>

		<h2 class="text-2xl font-semibold text-white mb-2">
			Processing your recording{dots[currentDot]}
		</h2>
		
		<p class="text-white/70">
			Preparing your {Math.round(elapsedSeconds)}s recording for editing
		</p>
	</div>

	<!-- Optional: Show a progress bar or waveform preview -->
	<div class="w-full max-w-md">
		<div class="h-2 bg-white/20 rounded-full overflow-hidden">
			<div class="h-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
		</div>
	</div>
</div>