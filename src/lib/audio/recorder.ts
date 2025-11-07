import { EventEmitter } from '$lib/EventEmitter';

export type AudioRecorderEventMap = {
	start: () => void;
	stop: (file: File, url: string, info: { duration: number; size: number }) => void;
	data: (chunk: Blob) => void;
	error: (err: unknown) => void;
	timer: (elapsed: number) => void;
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
	private startTime: number = 0;
	private timerInterval: NodeJS.Timeout | null = null;

	constructor(mimeType: string = 'audio/webm') {
		super(['start', 'stop', 'data', 'error', 'timer']);
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
				this.startTime = Date.now();
				this.startTimer();
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

				this.stopTimer();
				this.stream?.getTracks().forEach((t) => t.stop());
				this.recorder = null;
				this.stream = null;
				this.chunks = [];
				this.lastFile = file;
				this.duration = 0;

				if (this.lastUrl) URL.revokeObjectURL(this.lastUrl);
				this.lastUrl = URL.createObjectURL(file);

				const info = await this.getAudioInfo(this.lastUrl, file);
				this.emit('stop', file, this.lastUrl, info);

				this.duration = info.duration;
				this.stopPromise = null;
				resolve(file);
			};

			this.recorder!.stop();
		});

		return this.stopPromise;
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
		// Use the Web Audio API for a reliable duration reading of WebM blobs
		return new Promise((resolve, reject) => {
			const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
			file
				.arrayBuffer()
				.then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
				.then((decodedData) => {
					const duration = decodedData.duration;
					audioContext.close(); // Important: close context after use
					resolve({ duration, size: file.size });
				})
				.catch((error) => {
					audioContext.close();
					console.error('Error decoding audio data:', error);
					// Fallback or reject the promise
					reject({ duration: 0, size: file.size });
				});
		});
	}

	private startTimer(): void {
		// Emit initial timer event immediately
		this.emit('timer', 0);
		
		this.timerInterval = setInterval(() => {
			const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
			this.emit('timer', elapsed);
		}, 1000);
	}

	private stopTimer(): void {
		if (this.timerInterval) {
			clearInterval(this.timerInterval);
			this.timerInterval = null;
		}
	}
}
