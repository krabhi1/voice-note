<script lang="ts">
	interface Props {
		barCount?: number;
		height?: string;
		animated?: boolean;
		staticPattern?: boolean;
		trimHandles?: boolean;
	}

	let { 
		barCount = 50, 
		height = 'h-16', 
		animated = false, 
		staticPattern = false,
		trimHandles = false 
	}: Props = $props();

	function getBarHeight(index: number): number {
		if (staticPattern) {
			// For editing view - show data in middle section
			return index > barCount * 0.2 && index < barCount * 0.8 
				? Math.random() * 50 + 10 
				: 5;
		}
		// For recording view - random animated bars
		return Math.random() * 40 + 10;
	}

	function getBarOpacity(): number {
		return animated ? Math.random() * 0.5 + 0.5 : 1;
	}
</script>

<div class="relative">
	{#if trimHandles}
		<!-- Trim handles for editing view -->
		<div class="absolute top-0 left-0 h-full w-2 cursor-ew-resize bg-cyan-400 z-10"></div>
		<div class="absolute top-0 right-0 h-full w-2 cursor-ew-resize bg-cyan-400 z-10"></div>
	{/if}

	<!-- Waveform bars -->
	<div class="flex {height} items-center justify-center gap-1 {trimHandles ? 'px-4' : ''}">
		{#each Array(barCount) as _, index}
			<div
				class="w-1 rounded-full bg-green-400 {animated ? 'transition-all duration-200' : ''}"
				style="height: {getBarHeight(index)}px; opacity: {getBarOpacity()}"
			></div>
		{/each}
	</div>
</div>