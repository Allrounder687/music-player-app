import { useState, useCallback, useRef, useEffect } from "react";

export const useWaveAnimation = (audioData, pointCount = 40) => {
  const [wavePoints, setWavePoints] = useState([]);
  const animationRef = useRef(null);

  // Initialize wave points
  useEffect(() => {
    const initialWavePoints = Array(pointCount)
      .fill()
      .map((_, index) => ({
        x: (index / (pointCount - 1)) * 100,
        y: 0,
        active: false,
      }));
    setWavePoints(initialWavePoints);
  }, [pointCount]);

  // Calculate Y position for wave points with audio reactivity
  const getWaveYPosition = useCallback(
    (x, index, audioAmplitude = 1) => {
      const baseAmplitude = 2;
      const amplitude = baseAmplitude * audioAmplitude;
      const frequency = 0.15;
      const phase = Date.now() * 0.001;
      const offset = index * 0.02;

      let frequencyModulation = 1;
      let phaseModulation = 0;

      if (audioData?.frequencyData?.length > 0) {
        const freqIndex = Math.floor(
          (x / 100) * (audioData.frequencyData.length / 2)
        );
        if (freqIndex < audioData.frequencyData.length) {
          frequencyModulation =
            (audioData.frequencyData[freqIndex] / 255) * 0.5 + 0.5;
          phaseModulation =
            (audioData.bass * 0.5 +
              audioData.mid * 0.3 +
              audioData.treble * 0.2) *
            Math.PI;
        }
      }

      const wave1 =
        Math.sin(x * frequency + phase + offset + phaseModulation) *
        amplitude *
        frequencyModulation;
      const wave2 =
        Math.sin(x * frequency * 0.5 + phase * 1.3) * (amplitude * 0.3);

      return wave1 + wave2;
    },
    [audioData]
  );

  // Get audio-reactive amplitude
  const getAudioAmplitude = useCallback(() => {
    try {
      if (!audioData || typeof audioData !== "object") return 1;

      const { bass = 0, mid = 0, treble = 0 } = audioData;
      if (
        typeof bass !== "number" ||
        typeof mid !== "number" ||
        typeof treble !== "number"
      )
        return 1;

      const amplitude = Math.max(
        0,
        (bass * 0.6 + mid * 0.3 + treble * 0.1) * 2
      );
      return Math.max(1, Math.min(5, amplitude || 1));
    } catch (error) {
      console.warn("Error calculating audio amplitude:", error);
      return 1;
    }
  }, [audioData]);

  // Update wave points based on progress
  const updateWavePoints = useCallback((percentage) => {
    const progressX = percentage * 100;
    setWavePoints((prevPoints) =>
      prevPoints.map((point) => ({
        ...point,
        active: point.x <= progressX,
      }))
    );
  }, []);

  // Animate wave points
  const animateWave = useCallback(() => {
    const audioAmplitude = getAudioAmplitude();
    setWavePoints((prevPoints) =>
      prevPoints.map((point, index) => ({
        ...point,
        y: getWaveYPosition(point.x, index, audioAmplitude),
      }))
    );
  }, [getAudioAmplitude, getWaveYPosition]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    wavePoints,
    updateWavePoints,
    animateWave,
    animationRef,
    getAudioAmplitude,
  };
};
