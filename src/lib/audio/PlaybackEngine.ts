import { EventEmitter } from '$lib/EventEmitter';

export type PlaybackEvents = {
	progress: (time: number) => void;
	end: () => void;
	play: () => void;
	pause: () => void;
	error: (err: Error) => void;
};

export class PlaybackEngine extends EventEmitter<PlaybackEvents> {
	private audio: HTMLAudioElement;
	private isPlaying: boolean;
	private rafId: number | null = null;

	constructor() {
		super(['progress', 'end', 'play', 'pause', 'error']);
		this.audio = new Audio();
		this.isPlaying = false;

		this.attachEvents();
	}

	load(fileOrUrl: Blob | string): void {
		// Clean up previous blob URL if any
		if (this.audio.src.startsWith('blob:')) {
			URL.revokeObjectURL(this.audio.src);
		}

		if (fileOrUrl instanceof Blob) {
			this.audio.src = URL.createObjectURL(fileOrUrl);
		} else {
			this.audio.src = fileOrUrl;
		}

		this.audio.load();
	}

	async play(): Promise<void> {
		try {
			await this.audio.play();
			this.isPlaying = true;
			this.emit('play');
			this.startRenderLoop();
		} catch (err) {
			this.emit('error', err instanceof Error ? err : new Error(String(err)));
		}
	}

	pause(): void {
		this.audio.pause();
		this.isPlaying = false;
		this.emit('pause');
		this.stopRenderLoop();
	}

	seek(seconds: number): void {
		this.audio.currentTime = seconds;
	}

	setVolume(value: number): void {
		this.audio.volume = Math.max(0, Math.min(1, value)); // clamp 0–1
	}

	mute(): void {
		this.audio.muted = true;
	}

	unmute(): void {
		this.audio.muted = false;
	}

	private attachEvents(): void {
		// Coarse-grained events
		this.audio.addEventListener('ended', () => {
			this.isPlaying = false;
			this.emit('end');
			this.stopRenderLoop();
		});

		this.audio.addEventListener('error', () => {
			const err = new Error('Audio playback error');
			this.emit('error', err);
		});
	}

	private startRenderLoop(): void {
		const render = () => {
			if (this.isPlaying) {
				this.emit('progress', this.audio.currentTime);
				this.rafId = requestAnimationFrame(render);
			}
		};
		this.rafId = requestAnimationFrame(render);
	}

	private stopRenderLoop(): void {
		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
	}
}
