<script lang="ts">
	interface Props {
		bars: number[];           // full history of normalized amplitudes (0–1)
		barWidth?: number;        // pixel width of each bar
		gap?: number;             // gap between bars
		maxHeight?: number;       // height from center to top
	}

	let {
		bars = [],
		barWidth = 2,
		gap = 1,
		maxHeight = 200
	}: Props = $props();
</script>

<!-- Outer container (no scrolling) -->
<div class="w-full h-[400px] bg-zinc-50/50 border border-zinc-100 overflow-hidden relative">
	<!-- Inner waveform track (flex row) -->
	<div
		class="flex items-center relative z-10"
		style="
			height: {maxHeight * 2}px;
			padding-top: {maxHeight}px;   /* center baseline */
			box-sizing: content-box;
		"
	>
		{#each bars as value, i}
			<!-- Each bar is centered vertically -->
			<div
				class="bg-black transition-all duration-50 ease-linear"
				style="
					width: {barWidth}px;
					height: {value * maxHeight * 2}px;
					margin-right: {gap}px;
					margin-top: {-value * maxHeight}px; /* shift up to center */
				"
			></div>
		{/each}
	</div>

	<!-- Decorative Grid Lines -->
	<div class="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 opacity-[0.03]">
		{#each Array(8) as _}
			<div class="w-full border-t border-black"></div>
		{/each}
	</div>
</div>