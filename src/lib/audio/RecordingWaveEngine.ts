// RecordingWaveEngine.ts

export type RecordingWaveOptions = {
  barCount?: number;       // number of bars to display (default: 60)
  smoothing?: number;      // analyser smoothing (0–1)
  fftSize?: number;        // must be power of 2 (default: 2048)
  onUpdate?: (bars: number[]) => void;
};

export class RecordingWaveEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;
  private animationId: number | null = null;

  private bars: number[] = [];
  private barCount: number;
  private smoothing: number;
  private fftSize: number;
  private onUpdate?: (bars: number[]) => void;
  private isRunning = false;
  private isPaused = false;



  constructor(options: RecordingWaveOptions = {}) {
    this.barCount = options.barCount ?? 1000;
    this.smoothing = options.smoothing ?? 0.6;
    this.fftSize = options.fftSize ?? 2048;
    this.onUpdate = options.onUpdate;

    // this.bars = Array(this.barCount).fill(0);
  }

  start(stream: MediaStream) {
    this.stop(); // ensure clean start

    this.audioCtx = new AudioContext();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = this.fftSize;
    this.analyser.smoothingTimeConstant = this.smoothing;

    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);

    this.source = this.audioCtx.createMediaStreamSource(stream);
    this.source.connect(this.analyser);

    // set running state and ensure not paused
    this.isPaused = false;
    this.isRunning = true;

    this.loop();
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  private loop = () => {
    if (!this.isRunning) return;

    if (!this.analyser || !this.dataArray) return;

    if (this.isPaused) {
      // keep the animation frame ticking but do not update waveform (freeze)
      this.animationId = requestAnimationFrame(this.loop);
      return; // DO NOTHING (freeze waveform)
    }

    // Read time-domain waveform data (0–255)
    this.analyser.getByteTimeDomainData(this.dataArray);

    // Convert -> average amplitude -> normalize (0–1)
    // Time-domain centers around 128; amplitude = |value - 128|
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += Math.abs(this.dataArray[i] - 128);
    }

    const avgAmplitude = sum / this.dataArray.length;       // 0–128
    const normalized = Math.min(avgAmplitude / 128, 1);     // 0–1

    // Sliding window: push new bar, pop oldest bar
    this.bars.push(normalized);
    if (this.bars.length > this.barCount) this.bars.shift();

    // Emit live bars
    this.onUpdate?.([...this.bars]);

    // Next frame
    this.animationId = requestAnimationFrame(this.loop);
  };

  stop() {
    // stop animation loop
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // update running flag
    this.isRunning = false;

    if (this.source) this.source.disconnect();
    if (this.analyser) this.analyser.disconnect();

    if (this.audioCtx) this.audioCtx.close();

    this.audioCtx = null;
    this.analyser = null;
    this.source = null;
    this.dataArray = null;
    this.animationId = null;

    // Keep bars array for UI, but no more updates
  }

  /** Returns last known bar values (0–1) */
  getBars(): number[] {
    return [...this.bars];
  }
}
