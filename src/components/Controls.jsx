import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaVolumeUp,
  FaVolumeMute,
  FaVolumeDown,
  FaRandom,
  FaRedo,
} from "react-icons/fa";
import { Slider } from "./Slider";
import { SnakeSeekbar } from "./SnakeSeekbar";
import { useMusic } from "../store/MusicContext";
import { useTheme } from "../store/ThemeContext";
import "../styles/snake.css";

export const Controls = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onVolumeChange,
}) => {
  const {
    currentTrack,
    duration: trackDuration,
    currentTime: globalCurrentTime,
    setCurrentTime: setGlobalCurrentTime,
    repeat,
    shuffle,
    toggleRepeat,
    toggleShuffle,
    volume: globalVolume,
    setVolume: setGlobalVolume,
    audioData,
  } = useMusic();

  // Use only global state - remove redundant local state
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(80);
  const { theme } = useTheme();

  // Convert volume to percentage for UI
  const volumePercentage = useMemo(() => {
    return globalVolume !== undefined ? globalVolume * 100 : 80;
  }, [globalVolume]);

  // Use global duration and current time directly
  const duration = trackDuration || 180;
  const currentTime = globalCurrentTime || 0;

  // Update mute state when volume changes
  useEffect(() => {
    if (globalVolume !== undefined) {
      setIsMuted(globalVolume === 0);
    }
  }, [globalVolume]);

  // Volume change handler - simplified
  const handleVolumeChange = useCallback(
    (value) => {
      const volumeValue = value / 100;
      setIsMuted(value === 0);
      setGlobalVolume(volumeValue);
      if (onVolumeChange) {
        onVolumeChange(volumeValue);
      }
    },
    [setGlobalVolume, onVolumeChange]
  );

  // Mute toggle handler - simplified
  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      // Unmute - restore previous volume or default to 50%
      const newVolume = previousVolume > 0 ? previousVolume : 50;
      setIsMuted(false);
      setGlobalVolume(newVolume / 100);
      if (onVolumeChange) {
        onVolumeChange(newVolume / 100);
      }
    } else {
      // Mute - save current volume
      setPreviousVolume(volumePercentage);
      setIsMuted(true);
      setGlobalVolume(0);
      if (onVolumeChange) {
        onVolumeChange(0);
      }
    }
  }, [isMuted, previousVolume, volumePercentage, setGlobalVolume, onVolumeChange]);

  // Seek change handler - simplified to use only global state
  const handleSeekChange = useCallback(
    (value) => {
      const newTime = (value / 100) * duration;
      setGlobalCurrentTime(newTime);
    },
    [duration, setGlobalCurrentTime]
  );

  // Format time helper
  const formatTime = useCallback((seconds) => {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }, []);

  return (
    <div
      className={`bg-${theme.colors.background.secondary} p-3 border-t border-${theme.colors.border}`}
    >
      <div className="max-w-screen-lg mx-auto">
        {/* Progress Bar */}
        <div className="flex items-center mb-2">
          <span
            className={`text-xs text-${theme.colors.text.muted} w-12 text-right`}
          >
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 mx-2 overflow-hidden">
            <SnakeSeekbar
              currentTime={currentTime}
              duration={duration}
              onChange={handleSeekChange}
              audioData={audioData}
              className="h-6"
            />
          </div>
          <span className={`text-xs text-${theme.colors.text.muted} w-12`}>
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleShuffle}
              className={`${
                shuffle
                  ? `text-${theme.colors.primary.main}`
                  : `text-${theme.colors.text.muted}`
              } 
                hover:text-${theme.colors.text.primary} transition-colors`}
              title={shuffle ? "Shuffle is on" : "Shuffle is off"}
            >
              <FaRandom />
            </button>
            <button
              onClick={toggleRepeat}
              className={`${
                repeat
                  ? `text-${theme.colors.primary.main}`
                  : `text-${theme.colors.text.muted}`
              } 
                hover:text-${theme.colors.text.primary} transition-colors`}
              title={repeat ? "Repeat is on" : "Repeat is off"}
            >
              <FaRedo />
            </button>
            <button
              onClick={() => {
                setGlobalCurrentTime(0);
              }}
              className={`text-${theme.colors.text.muted} hover:text-${theme.colors.text.primary} transition-colors`}
              title="Restart track"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={onPrevious}
              className={`text-${theme.colors.text.secondary} hover:text-${theme.colors.text.primary} p-2`}
            >
              <FaStepBackward className="h-5 w-5" />
            </button>
            <button
              onClick={onPlayPause}
              className={`bg-${theme.colors.primary.main} text-${theme.colors.text.primary} rounded-full h-10 w-10 flex items-center justify-center hover:bg-${theme.colors.primary.light}`}
            >
              {isPlaying ? (
                <FaPause className="h-4 w-4" />
              ) : (
                <FaPlay className="h-4 w-4 ml-1" />
              )}
            </button>
            <button
              onClick={onNext}
              className={`text-${theme.colors.text.secondary} hover:text-${theme.colors.text.primary} p-2`}
            >
              <FaStepForward className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2 w-36">
            <button
              onClick={handleMuteToggle}
              className={`text-${theme.colors.text.muted} hover:text-${theme.colors.text.primary}`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <FaVolumeMute />
              ) : volumePercentage < 30 ? (
                <FaVolumeDown />
              ) : (
                <FaVolumeUp />
              )}
            </button>
            <Slider
              value={volumePercentage}
              onChange={handleVolumeChange}
              className="h-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
