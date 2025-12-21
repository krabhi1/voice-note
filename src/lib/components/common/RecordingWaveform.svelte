<script lang="ts">
	import { onMount, onDestroy } from "svelte";

	interface Props {
		bars: number[];
		barWidth?: number;
		gap?: number;
		padding?: number;   // extra space reserved inside parent (px)
	}

	let { bars = [], barWidth = 1, gap = 0, padding = 10 }: Props = $props();

	let canvas: HTMLCanvasElement | null = null;
	let ctx: CanvasRenderingContext2D | null = null;
	let parentEl: HTMLElement | null = null;

	let maxHeight = 100;   // computed dynamically
	let dpr = 1;

	function computeMaxHeight() {
		if (!parentEl) return;

		const rect = parentEl.getBoundingClientRect();
		const H = rect.height;

		// max vertical amplitude allowed
		maxHeight = Math.max(0, (H - padding) / 2);
	}

	function resizeCanvas() {
		if (!canvas || !parentEl) return;

		computeMaxHeight(); // IMPORTANT

		const rect = canvas.getBoundingClientRect();
		dpr = window.devicePixelRatio || 1;

		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		canvas.style.width = rect.width + "px";
		canvas.style.height = rect.height + "px";

		ctx = canvas.getContext("2d");
		if (ctx) ctx.scale(dpr, dpr);

		draw();
	}

	function draw() {
		if (!canvas || !ctx) return;

		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const centerY = height / 2;

		ctx.clearRect(0, 0, width, height);

		// bar color
		ctx.fillStyle = '#000000';

		const step = barWidth + gap;
		let x = width / 2;

		// Draw waveform bars from center -> left
		for (let i = bars.length - 1; i >= 0; i--) {
			const v = Math.max(0, Math.min(1, bars[i] ?? 0));
			let barH = v * maxHeight * 2;
			if (barH > height) barH = height;

			const y = centerY - barH / 2;

			ctx.fillRect(x, y, barWidth, barH);

			x -= step;
			if (x < 0) break;
		}

		ctx.strokeStyle = "#e4e4e7";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(0, centerY);
		ctx.lineTo(width, centerY);
		ctx.stroke();
}

	onMount(() => {
		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);
	});

	onDestroy(() => {
		window.removeEventListener("resize", resizeCanvas);
	});

	$effect(() => {
		draw();
	});
</script>

<div bind:this={parentEl} class="w-full h-full" >
	<canvas bind:this={canvas} class="block w-full h-full"></canvas>
</div>
