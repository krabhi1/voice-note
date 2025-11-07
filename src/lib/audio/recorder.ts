import { EventEmitter } from '$lib/EventEmitter';

export type AudioRecorderEventMap = {
	start: () => void;
	stop: (file: File, url: string, info: { duration: number; size: number }) => void;
	data: (chunk: Blob) => void;
	error: (err: unknown) => void;
	timer: (elapsed: number) => void;
	pause: () => void;
	resume: () => void;
};

export class AudioRecorder extends EventEmitter<AudioRecorderEventMap> {
	private mimeType: string;
	private recorder: MediaRecorder | null = null;
	private stream: MediaStream | null = null;
	private chunks: BlobPart[] = [];
	private lastFile: File | null = null;
	private lastUrl: string | null = null;
	private stopPromise: Promise<File> | null = null;
	private duration: number = 0;
	private _elapsedTime: number = 0; // Total time recorded, excluding pauses (in milliseconds)
	private _lastStartTime: number = 0; // The timestamp when recording/resuming started (in milliseconds)
	private _intervalRef: number | null = null; // The reference to the timer interval

	constructor(mimeType: string = 'audio/webm') {
		super(['start', 'stop', 'data', 'error', 'timer', 'pause', 'resume']);
		this.mimeType = mimeType;
	}

	async start(): Promise<void> {
		if (this.recorder) return;
		try {
			this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			this.recorder = new MediaRecorder(this.stream, { mimeType: this.mimeType });
			this.chunks = [];

			this.recorder.ondataavailable = (e) => {
				if (e.data && e.data.size > 0) {
					this.chunks.push(e.data);
					this.emit('data', e.data);
				}
			};

			this.recorder.onstart = () => {
				this._elapsedTime = 0; // Reset total elapsed time
				this._startTimer(); // Initializes _lastStartTime and starts the interval
				this.emit('start');
			};
			this.recorder.onerror = (e) => this.emit('error', e.error);

			this.recorder.start();
		} catch (err) {
			this.emit('error', err);
		}
	}

	async stop(): Promise<File | null> {
		if (!this.recorder) return this.lastFile;

		if (this.stopPromise) {
			return this.stopPromise;
		}

		this.stopPromise = new Promise<File>((resolve) => {
			this.recorder!.onstop = async () => {
				const blob = new Blob(this.chunks, { type: this.mimeType });
				const file = new File([blob], `recording-${Date.now()}.webm`, { type: this.mimeType });

				// Finalize time calculation before stopping the interval
				this._stopTimer();
				this.stream?.getTracks().forEach((t) => t.stop());
				this.recorder = null;
				this.stream = null;
				this.chunks = [];
				this.lastFile = file;

				if (this.lastUrl) URL.revokeObjectURL(this.lastUrl);
				this.lastUrl = URL.createObjectURL(file);

				const info = await this.getAudioInfo(this.lastUrl, file);
				this.emit('stop', file, this.lastUrl, info);

				// duration is now the final calculated total elapsed time
				this.duration = this._elapsedTime / 1000;
				this._elapsedTime = 0; // Reset after successful stop
				this.stopPromise = null;
				resolve(file);
			};

			this.recorder!.stop();
		});

		return this.stopPromise;
	}

	pause(): void {
		if (!this.recorder || this.recorder.state !== 'recording') return;

		// 1. Finalize the time for the current segment
		this._stopTimer();

		// 2. Pause the underlying recorder
		this.recorder.pause();
		this.emit('pause');
	}

	resume(): void {
		if (!this.recorder || this.recorder.state !== 'paused') return;

		// 1. Resume the underlying recorder
		this.recorder.resume();

		// 2. Start the timer for the next segment (resets _lastStartTime and continues from _elapsedTime)
		this._startTimer();
		this.emit('resume');
	}

	isRecording(): boolean {
		return this.recorder?.state === 'recording';
	}

	isPausedState(): boolean {
		return this.recorder?.state === 'paused';
	}

	async getAudio() {
		if (this.stopPromise) {
			await this.stopPromise;
		}
		if (this.lastFile && this.lastUrl) {
			return {
				file: this.lastFile,
				duration: this.duration,
				size: this.lastFile.size,
				url: this.lastUrl
			};
		}

		return null;
	}

	getUrl(): string | null {
		return this.lastUrl;
	}

	/** Get duration (seconds) and size (bytes) */
	private async getAudioInfo(url: string, file: File): Promise<{ duration: number; size: number }> {
		return new Promise((resolve, reject) => {
			const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

			// Use Promise.all for cleaner async handling of arrayBuffer and decodeAudioData
			Promise.all([file.arrayBuffer(), Promise.resolve(audioContext)])
				.then(([arrayBuffer, context]) => context.decodeAudioData(arrayBuffer))
				.then((decodedData) => {
					const duration = decodedData.duration;
					audioContext.close();
					resolve({ duration, size: file.size });
				})
				.catch((error) => {
					audioContext.close();
					console.error('Error decoding audio data:', error);
					// The size is always known, even if decoding fails.
					resolve({ duration: 0, size: file.size });
				});
		});
	}

	private _updateTimer(): void {
		if (this._intervalRef) {
			// Calculate the current duration since the last start/resume
			const currentActiveDuration = Date.now() - this._lastStartTime;
			// Total elapsed time is the base time + the current active duration
			const totalElapsedMs = this._elapsedTime + currentActiveDuration;
			const elapsedSeconds = Math.floor(totalElapsedMs / 1000);

			this.emit('timer', elapsedSeconds);
		}
	}

	private _startTimer(): void {
		if (this._intervalRef) return; // Prevent double-starting

		// Set the current timestamp for precise tracking
		this._lastStartTime = Date.now();

		// Immediately update and emit the current time
		this._updateTimer();

		this._intervalRef = setInterval(() => {
			this._updateTimer();
		}, 1000);
	}

	private _stopTimer(): void {
		if (this._intervalRef) {
			// Calculate the final active duration since the last start
			const currentActiveDuration = Date.now() - this._lastStartTime;
			// Add it to the total elapsed time
			this._elapsedTime += currentActiveDuration;

			clearInterval(this._intervalRef);
			this._intervalRef = null;
		}
	}
}
