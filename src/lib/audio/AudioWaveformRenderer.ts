import { EventEmitter } from '$lib/EventEmitter';
import { debounce } from '$lib/utils';

export type AudioWaveformRenderEvents = {
	onSeek: (time: number) => void;
};

export class AudioWaveformRenderer extends EventEmitter<AudioWaveformRenderEvents> {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	width: number;
	height: number;
	peaks: number[];
	duration: number;
	private debouncedSeek: (time: number) => void;

	isDragging: boolean;
	private onMouseMoveBound: (e: MouseEvent) => void;
	private onMouseUpBound: (e: MouseEvent) => void;
	private onTouchMoveBound: (e: TouchEvent) => void;
	private onTouchEndBound: (e: TouchEvent) => void;

	constructor(canvas: HTMLCanvasElement) {
		super(['onSeek']);
		this.canvas = canvas;
		const ctx = this.canvas.getContext('2d');
		if (!ctx) {
			throw new Error('2D rendering context not available');
		}
		this.ctx = ctx;

		this.width = 0;
		this.height = 0;
		this.peaks = [];
		this.duration = 0;

		this.isDragging = false;

		// bind handlers
		this.onMouseMoveBound = (e: MouseEvent) => this.handleMove(e.clientX);
		this.onMouseUpBound = () => this.stopDrag();
		this.onTouchMoveBound = (e: TouchEvent) => {
			if (e.touches && e.touches.length > 0) {
				e.preventDefault();
				this.handleMove(e.touches[0].clientX);
			}
		};
		this.onTouchEndBound = () => this.stopDrag();

		this.resize();
		window.addEventListener('resize', () => this.resize());

		// click to seek
		this.canvas.addEventListener('click', (e: MouseEvent) => {
			if (!this.duration) return;
			const rect = this.canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const percent = rect.width > 0 ? x / rect.width : 0;
			const time = Math.max(0, Math.min(1, percent)) * this.duration;
			this.emit('onSeek', time);
			this.draw(time);
		});

		// mouse drag to seek
		this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
			if (!this.duration) return;
			this.isDragging = true;
			this.handleMove(e.clientX); // immediate seek
			window.addEventListener('mousemove', this.onMouseMoveBound);
			window.addEventListener('mouseup', this.onMouseUpBound, { once: true });
		});

		// touch drag to seek
		this.canvas.addEventListener('touchstart', (e: TouchEvent) => {
			if (!this.duration) return;
			if (e.touches && e.touches.length > 0) {
				this.isDragging = true;
				e.preventDefault();
				this.handleMove(e.touches[0].clientX);
				window.addEventListener('touchmove', this.onTouchMoveBound, { passive: false });
				window.addEventListener('touchend', this.onTouchEndBound, { once: true });
				window.addEventListener('touchcancel', this.onTouchEndBound, { once: true });
			}
		});
		this.debouncedSeek = debounce((time: number) => {
			this.emit('onSeek', time);
		}, 75);
	}

	private handleMove(clientX: number) {
		if (!this.duration) return;

		const rect = this.canvas.getBoundingClientRect();
		const x = clientX - rect.left;
		const clampedX = Math.max(0, Math.min(rect.width, x));
		const percent = rect.width > 0 ? clampedX / rect.width : 0;
		const time = percent * this.duration;

		this.debouncedSeek(time);
		this.draw(time); // redraw with progress line
	}

	private stopDrag() {
		if (!this.isDragging) return;
		this.isDragging = false;
		this.draw(this.duration);
		window.removeEventListener('mousemove', this.onMouseMoveBound);
		window.removeEventListener('mouseup', this.onMouseUpBound);
		window.removeEventListener('touchmove', this.onTouchMoveBound);
		window.removeEventListener('touchend', this.onTouchEndBound);
		window.removeEventListener('touchcancel', this.onTouchEndBound);
	}

	setData(peaks: number[], duration: number) {
		this.peaks = peaks;
		this.duration = duration;
		this.draw(0);
	}

	draw(currentTime = 0) {
		if (!this.peaks.length) return;

		const { ctx, canvas } = this;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const center = canvas.height / 2;
		const barWidth = canvas.width / this.peaks.length;

		// baseline - soft blue-gray
		ctx.fillStyle = '#DDE6ED';
		ctx.fillRect(0, Math.round(center), canvas.width, 1);

		const progressPercent = this.duration > 0 ? currentTime / this.duration : 0;

		// waveform bars
		for (let i = 0; i < this.peaks.length; i++) {
			const amp = this.peaks[i];
			const barHeight = amp * center;
			const barX = i * barWidth;

			// Color based on progress: played (Deep Slate) vs unplayed (Muted Blue-Gray)
			ctx.fillStyle = i / this.peaks.length <= progressPercent ? '#27374D' : '#9DB2BF';

			ctx.fillRect(
				Math.floor(barX),
				Math.round(center - barHeight),
				Math.ceil(barWidth),
				Math.round(barHeight * 2)
			);
		}

		// progress line - Deep Slate
		if (this.duration > 0) {
			const progressX = progressPercent * canvas.width;
			const clampedX = Math.min(canvas.width - 1, Math.max(0, progressX));

			ctx.fillStyle = '#27374D';
			ctx.fillRect(Math.round(clampedX), 0, 1, canvas.height);
		}
	}

	private resize() {
		const dpr = window.devicePixelRatio || 1;
		const parent = this.canvas.parentElement;
		if (!parent) return;

		const rect = parent.getBoundingClientRect();
		const w = rect.width * dpr;
		const h = rect.height * dpr;

		this.canvas.width = w;
		this.canvas.height = h;
		this.width = w;
		this.height = h;

		if (typeof this.ctx.setTransform === 'function') {
			this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		} else {
			this.ctx.scale(dpr, dpr);
		}

		this.draw(0);
	}
	destroy() {
		window.removeEventListener('resize', this.resize);
	}
}
