import { type WaveSurferOptions } from 'wavesurfer.js';

export const WAVEFORM_CONFIG: Omit<WaveSurferOptions, 'container'> = {
	waveColor: 'rgb(161, 161, 170)', // neutral-400
	progressColor: 'rgb(124, 58, 237)', // violet-600
	cursorColor: 'rgb(124, 58, 237)',
	barWidth: 2,
	barGap: 3,
	barRadius: 3,
	height: 192,
	normalize: true
};
