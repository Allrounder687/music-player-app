import { useState, useEffect, useRef, useCallback } from 'react';

const FREQUENCY_BANDS = [
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

export const useEqualizer = (audioContext, audioSource, onEqualizerChange) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [bands, setBands] = useState(FREQUENCY_BANDS);
  const filtersRef = useRef([]);
  const gainNodeRef = useRef(null);

  // Initialize equalizer with proper cleanup
  useEffect(() => {
    if (!audioContext || !audioSource) return;

    const initializeEqualizer = () => {
      try {
        // Cleanup existing nodes
        cleanupAudioNodes();

        // Create new nodes
        gainNodeRef.current = audioContext.createGain();
        filtersRef.current = createFilters(audioContext, bands);
        
        // Connect audio chain
        connectAudioChain(audioSource, filtersRef.current, gainNodeRef.current);
        
        onEqualizerChange?.(gainNodeRef.current);
      } catch (error) {
        console.error('Error initializing equalizer:', error);
      }
    };

    initializeEqualizer();
    return cleanupAudioNodes;
  }, [audioContext, audioSource, onEqualizerChange]);

  const cleanupAudioNodes = useCallback(() => {
    filtersRef.current.forEach(filter => {
      try { filter?.disconnect(); } catch (e) { /* ignore */ }
    });
    try { gainNodeRef.current?.disconnect(); } catch (e) { /* ignore */ }
  }, []);

  const updateBandGain = useCallback((index, gain) => {
    setBands(prev => prev.map((band, i) => 
      i === index ? { ...band, gain } : band
    ));
    
    if (filtersRef.current[index]) {
      filtersRef.current[index].gain.value = gain;
    }
  }, []);

  const toggleEqualizer = useCallback(() => {
    setIsEnabled(prev => {
      const newEnabled = !prev;
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = newEnabled ? 1 : 0;
      }
      return newEnabled;
    });
  }, []);

  return {
    isEnabled,
    bands,
    updateBandGain,
    toggleEqualizer,
    setBands
  };
};

// Helper functions
const createFilters = (audioContext, bands) => {
  return bands.map((band, index) => {
    const filter = audioContext.createBiquadFilter();
    filter.type = index === 0 ? 'lowshelf' : 
                  index === bands.length - 1 ? 'highshelf' : 'peaking';
    filter.frequency.value = band.frequency;
    filter.Q.value = 1;
    filter.gain.value = band.gain;
    return filter;
  });
};

const connectAudioChain = (source, filters, gainNode) => {
  let previousNode = source;
  filters.forEach(filter => {
    previousNode.connect(filter);
    previousNode = filter;
  });
  previousNode.connect(gainNode);
};