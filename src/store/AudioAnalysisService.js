/**
 * A service to analyze audio for the snake seekbar visualization
 */
export class AudioAnalysisService {
  static audioContext = null;
  static analyzer = null;
  static dataArray = null;
  static source = null;
  static isInitialized = false;
  static frequencyData = new Uint8Array(128);
  static timeData = new Uint8Array(128);
  static bassValue = 0;
  static midValue = 0;
  static trebleValue = 0;
  static overallVolume = 0;
  static smoothingFactor = 0.8; // For smoother transitions

  /**
   * Initialize the audio analyzer
   * @param {HTMLAudioElement} audioElement - The audio element to analyze
   */
  static initializeAnalyzer(audioElement) {
    try {
      // Create audio context if it doesn't exist
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      // Create analyzer if it doesn't exist
      if (!this.analyzer) {
        this.analyzer = this.audioContext.createAnalyser();
        this.analyzer.fftSize = 256; // Must be a power of 2
        this.analyzer.smoothingTimeConstant = 0.8; // Smooth out the data

        const bufferLength = this.analyzer.frequencyBinCount;
        this.frequencyData = new Uint8Array(bufferLength);
        this.timeData = new Uint8Array(bufferLength);
      }

      // Connect the audio element to the analyzer
      if (this.source) {
        this.source.disconnect();
      }

      this.source = this.audioContext.createMediaElementSource(audioElement);
      this.source.connect(this.analyzer);
      this.analyzer.connect(this.audioContext.destination);

      this.isInitialized = true;
      console.log("Audio analyzer initialized successfully");
    } catch (error) {
      console.error("Failed to initialize audio analyzer:", error);
      this.isInitialized = false;
    }
  }

  /**
   * Get real-time analysis data for the current playback
   * @returns {AudioAnalysisData} - Analysis data for the current position
   */
  static getRealtimeData() {
    if (!this.isInitialized || !this.analyzer) {
      return {
        bass: 0,
        mid: 0,
        treble: 0,
        volume: 0,
        frequencyData: new Uint8Array(128).fill(0),
        timeData: new Uint8Array(128).fill(0),
      };
    }

    try {
      // Get frequency data
      this.analyzer.getByteFrequencyData(this.frequencyData);
      this.analyzer.getByteTimeDomainData(this.timeData);

      // Calculate bass (0-60Hz), mid (60-2kHz), and treble (2kHz-20kHz) values
      // For a 44.1kHz sample rate with fftSize of 256, each bin represents ~172Hz
      const bassEnd = 2; // ~344Hz
      const midEnd = 12; // ~2064Hz

      let bassSum = 0;
      let midSum = 0;
      let trebleSum = 0;
      let volumeSum = 0;

      // Calculate bass (low frequencies)
      for (let i = 0; i < bassEnd; i++) {
        bassSum += this.frequencyData[i];
      }

      // Calculate mid (mid frequencies)
      for (let i = bassEnd; i < midEnd; i++) {
        midSum += this.frequencyData[i];
      }

      // Calculate treble (high frequencies)
      for (let i = midEnd; i < this.frequencyData.length; i++) {
        trebleSum += this.frequencyData[i];
      }

      // Calculate overall volume from time domain data
      for (let i = 0; i < this.timeData.length; i++) {
        const amplitude = Math.abs((this.timeData[i] - 128) / 128);
        volumeSum += amplitude;
      }

      // Normalize values between 0 and 1
      const newBassValue = bassSum / (bassEnd * 255);
      const newMidValue = midSum / ((midEnd - bassEnd) * 255);
      const newTrebleValue =
        trebleSum / ((this.frequencyData.length - midEnd) * 255);
      const newVolumeValue = volumeSum / this.timeData.length;

      // Apply smoothing
      this.bassValue =
        this.smoothingFactor * this.bassValue +
        (1 - this.smoothingFactor) * newBassValue;
      this.midValue =
        this.smoothingFactor * this.midValue +
        (1 - this.smoothingFactor) * newMidValue;
      this.trebleValue =
        this.smoothingFactor * this.trebleValue +
        (1 - this.smoothingFactor) * newTrebleValue;
      this.overallVolume =
        this.smoothingFactor * this.overallVolume +
        (1 - this.smoothingFactor) * newVolumeValue;

      return {
        bass: this.bassValue,
        mid: this.midValue,
        treble: this.trebleValue,
        volume: this.overallVolume,
        frequencyData: [...this.frequencyData],
        timeData: [...this.timeData],
      };
    } catch (error) {
      console.error("Error getting audio analysis data:", error);
      return {
        bass: 0,
        mid: 0,
        treble: 0,
        volume: 0,
        frequencyData: new Uint8Array(128).fill(0),
        timeData: new Uint8Array(128).fill(0),
      };
    }
  }

  /**
   * Analyze an audio file and return analysis data
   * @param {AudioBuffer} audioBuffer - The audio buffer to analyze
   * @returns {Promise<AudioAnalysisData>} - The analysis data
   */
  static async analyzeAudio(audioBuffer) {
    // In a real implementation, this would analyze the actual audio data
    // For now, we'll generate some random data for visualization

    // Generate intensity map (volume/loudness at different points in the track)
    const intensityMap = [];
    const steps = 100; // Generate 100 data points

    for (let i = 0; i < steps; i++) {
      const position = i / steps;

      // Generate a somewhat realistic intensity curve with some peaks and valleys
      let intensity =
        0.5 +
        0.3 * Math.sin(position * Math.PI * 4) +
        0.2 * Math.sin(position * Math.PI * 13);

      // Add some random variation
      intensity += Math.random() * 0.2 - 0.1;

      // Clamp between 0.2 and 1.0
      intensity = Math.max(0.2, Math.min(1.0, intensity));

      intensityMap.push({
        position,
        intensity,
      });
    }

    return {
      intensityMap,
      frequencyData: new Uint8Array(128).fill(0),
      timeData: new Uint8Array(128).fill(0),
      bass: 0,
      mid: 0,
      treble: 0,
      volume: 0,
    };
  }
}

/**
 * @typedef {Object} AudioAnalysisData
 * @property {Array<{position: number, intensity: number}>} [intensityMap] - Intensity at various points
 * @property {Uint8Array} [frequencyData] - Frequency distribution data
 * @property {Uint8Array} [timeData] - Time domain data
 * @property {number} [bass] - Bass level (0-1)
 * @property {number} [mid] - Mid frequencies level (0-1)
 * @property {number} [treble] - Treble level (0-1)
 * @property {number} [volume] - Overall volume level (0-1)
 */
