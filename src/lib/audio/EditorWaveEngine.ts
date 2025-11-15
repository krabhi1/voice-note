export interface EditorWaveData {
  duration: number;
  sampleRate: number;
  peaks: number[];
  audioBuffer: AudioBuffer;
  numberOfChannels: number;
  length: number; // total sample frames per channel
}

export class EditorWaveEngine {
  audioBuffer: AudioBuffer | null = null;
  duration = 0;
  sampleRate = 0;
  peaks: number[] = [];

  constructor() {}

  async load(file: File, peakCount = 2000): Promise<EditorWaveData> {
    const arrayBuffer = await file.arrayBuffer();

    const audioCtx = new AudioContext();
    this.audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    this.duration = this.audioBuffer.duration;
    this.sampleRate = this.audioBuffer.sampleRate;

    this.peaks = this.generatePeaks(peakCount);

    return {
      duration: this.duration,
      sampleRate: this.sampleRate,
      peaks: this.peaks,
      audioBuffer: this.audioBuffer,
      numberOfChannels: this.audioBuffer.numberOfChannels,
      length: this.audioBuffer.length
    };
  }

  private generatePeaks(peakCount: number): number[] {
    if (!this.audioBuffer) return [];

    const channelData = this.audioBuffer.getChannelData(0);

    const blockSize = Math.floor(channelData.length / peakCount);
    const peaks = new Array<number>(peakCount);

    for (let i = 0; i < peakCount; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, channelData.length);

      let max = 0;
      for (let j = start; j < end; j++) {
        const v = Math.abs(channelData[j]);
        if (v > max) max = v;
      }

      peaks[i] = max;
    }

    return peaks;
  }
}
