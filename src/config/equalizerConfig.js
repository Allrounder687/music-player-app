/**
 * Equalizer configuration constants
 */

export const EQUALIZER_CONFIG = {
  GAIN_RANGE: {
    min: -12,
    max: 12,
    step: 0.5
  },
  FILTER_Q: 1,
  BAND_COUNT: 10,
  DEFAULT_PRESET: 'flat'
};

export const FREQUENCY_BANDS = [
  { label: "60Hz", frequency: 60, gain: 0 },
  { label: "170Hz", frequency: 170, gain: 0 },
  { label: "310Hz", frequency: 310, gain: 0 },
  { label: "600Hz", frequency: 600, gain: 0 },
  { label: "1kHz", frequency: 1000, gain: 0 },
  { label: "3kHz", frequency: 3000, gain: 0 },
  { label: "6kHz", frequency: 6000, gain: 0 },
  { label: "12kHz", frequency: 12000, gain: 0 },
  { label: "14kHz", frequency: 14000, gain: 0 },
  { label: "16kHz", frequency: 16000, gain: 0 },
];

export const EQUALIZER_PRESETS = {
  flat: { name: "Flat", gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  rock: { name: "Rock", gains: [5, 3, -1, -2, -1, 2, 4, 6, 6, 6] },
  pop: { name: "Pop", gains: [-1, 2, 4, 4, 1, -1, -2, -2, -1, -1] },
  jazz: { name: "Jazz", gains: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3] },
  classical: { name: "Classical", gains: [4, 3, 2, 1, -1, -1, 0, 2, 3, 4] },
  electronic: { name: "Electronic", gains: [4, 3, 1, 0, -2, 2, 1, 1, 3, 4] },
  hiphop: { name: "Hip Hop", gains: [5, 4, 1, 3, -1, -1, 1, -1, 2, 3] },
  vocal: { name: "Vocal", gains: [-2, -1, 2, 4, 4, 3, 2, 1, 0, -1] },
  bass: { name: "Bass Boost", gains: [6, 5, 4, 2, 1, -1, -2, -3, -3, -3] },
  treble: { name: "Treble Boost", gains: [-3, -3, -2, -1, 1, 2, 4, 5, 6, 6] },
};