import React, { useState, useCallback } from "react";
import { useTheme } from "../store/ThemeContext";
import { GlassCard } from "./GlassCard";
import { useEqualizer } from "../hooks/useEqualizer";
import { EqualizerControls } from "./equalizer/EqualizerControls";
import { EqualizerPresets, PRESETS } from "./equalizer/EqualizerPresets";
import { EqualizerBand } from "./equalizer/EqualizerBand";

/**
 * Equalizer component with audio frequency band controls
 * @param {Object} props - Component props
 * @param {AudioContext} props.audioContext - Web Audio API context
 * @param {AudioNode} props.audioSource - Audio source node
 * @param {Function} props.onEqualizerChange - Callback when equalizer output changes
 */
export const Equalizer = ({ audioContext, audioSource, onEqualizerChange }) => {
  const { theme } = useTheme();
  const [currentPreset, setCurrentPreset] = useState("flat");
  const [isVisible, setIsVisible] = useState(false);
  
  const { 
    isEnabled, 
    bands, 
    updateBandGain, 
    toggleEqualizer,
    setBands 
  } = useEqualizer(audioContext, audioSource, onEqualizerChange);

  const handlePresetChange = useCallback((presetName, gains) => {
    const newBands = bands.map((band, index) => ({
      ...band,
      gain: gains[index] || 0,
    }));
    
    setBands(newBands);
    setCurrentPreset(presetName);
  }, [bands, setBands]);

  const handleReset = useCallback(() => {
    handlePresetChange("flat", PRESETS.flat.gains);
  }, [handlePresetChange]);

  const handleBandChange = useCallback((index, gain) => {
    updateBandGain(index, gain);
    setCurrentPreset("custom");
  }, [updateBandGain]);

  // Render collapsed state
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={`
          p-2 rounded-lg transition-all duration-200
          bg-${theme.colors.background.secondary}
          hover:bg-${theme.colors.background.hover}
          text-${theme.colors.text.secondary}
          hover:text-${theme.colors.text.primary}
          border border-${theme.colors.border}
        `}
        title="Open Equalizer"
        aria-label="Open Equalizer"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 12a1 1 0 102 0V6a1 1 0 10-2 0v6zM10 4a1 1 0 10-2 0v12a1 1 0 102 0V4zM16 7a1 1 0 10-2 0v6a1 1 0 102 0V7z" />
        </svg>
      </button>
    );
  }

  return (
    <GlassCard className="p-6 animate-slide-up" role="region" aria-label="Audio Equalizer">
      <EqualizerControls
        isEnabled={isEnabled}
        onToggle={toggleEqualizer}
        onReset={handleReset}
        onClose={() => setIsVisible(false)}
      />

      <EqualizerPresets
        currentPreset={currentPreset}
        onPresetChange={handlePresetChange}
        className="mb-6"
      />

      {/* Frequency Bands */}
      <div className="space-y-4">
        <div className="grid grid-cols-5 md:grid-cols-10 gap-4" role="group" aria-label="Frequency bands">
          {bands.map((band, index) => (
            <EqualizerBand
              key={band.frequency}
              band={band}
              index={index}
              onGainChange={handleBandChange}
              disabled={!isEnabled}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default Equalizer;