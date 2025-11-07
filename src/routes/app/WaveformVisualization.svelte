<script lang="ts">
	interface Props {
		barCount?: number;
		height?: string;
		animated?: boolean;
		staticPattern?: boolean;
		trimHandles?: boolean;
		currentTime?: number;
		duration?: number;
		showProgress?: boolean;
		onSeek?: (time: number) => void;
	}

	let {
		barCount = 50,
		height = 'h-16',
		animated = true,
		staticPattern = false,
		trimHandles = false,
		currentTime = 0,
		duration = 1,
		showProgress = false,
		onSeek
	}: Props = $props();

	function getBarHeight(index: number): number {
		if (staticPattern) {
			// For editing view - show data in middle section
			return index > barCount * 0.2 && index < barCount * 0.8 ? Math.random() * 50 + 10 : 5;
		}
		// For recording view - random animated bars
		return Math.random() * 40 + 10;
	}

	function getBarOpacity(): number {
		return animated ? Math.random() * 0.5 + 0.5 : 1;
	}

	// Calculate progress position as percentage with smoothing
	const progressPercent = $derived.by(() => {
		if (!showProgress || duration <= 0) return 0;
		const percent = (currentTime / duration) * 100;
		return Math.min(Math.max(percent, 0), 100);
	});

	function handleWaveformClick(event: MouseEvent) {
		if (!onSeek || !showProgress || duration <= 0) return;

		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const padding = trimHandles ? 16 : 0; // Account for px-4 padding
		const adjustedClickX = clickX - padding;
		const availableWidth = rect.width - padding * 2;
		const percentage = Math.max(0, Math.min(adjustedClickX / availableWidth, 1));
		const seekTime = percentage * duration;

		onSeek(seekTime);
	}
</script>

<div class="relative">
	{#if trimHandles}
		<!-- Trim handles for editing view -->
		<div class="absolute top-0 left-0 z-10 h-full w-2 cursor-ew-resize bg-cyan-400"></div>
		<div class="absolute top-0 right-0 z-10 h-full w-2 cursor-ew-resize bg-cyan-400"></div>
	{/if}

	<!-- Waveform bars -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="flex {height} items-center justify-center gap-1 {trimHandles ? 'px-4' : ''} {showProgress
			? 'cursor-pointer'
			: ''} relative"
		onclick={handleWaveformClick}
	>
		<!-- Progress line inside waveform container -->
		{#if showProgress}
			<div
				class="absolute top-0 z-20 h-full w-0.5 bg-white shadow-lg transition-all duration-75 ease-linear"
				style="left: {progressPercent}%;"
			></div>
		{/if}
		{#each Array(barCount) as _, index}
			{@const barPosition = (index / barCount) * 100}
			{@const isPlayed = showProgress && barPosition <= progressPercent}
			<div
				class="w-1 rounded-full {isPlayed ? 'bg-white' : 'bg-green-400'} {animated
					? 'transition-all duration-200'
					: ''}"
				style="height: {getBarHeight(index)}px; opacity: {getBarOpacity()}"
			></div>
		{/each}
	</div>
</div>
