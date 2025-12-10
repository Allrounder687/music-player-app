import React, { useState, useEffect, useCallback } from "react";
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

  const [volume, setVolume] = useState(
    globalVolume !== undefined ? globalVolume * 100 : 80
  );
  const [currentTime, setCurrentTime] = useState(globalCurrentTime || 0);
  const [duration, setDuration] = useState(trackDuration || 180); // Set a default duration
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const { theme } = useTheme();

  // Sync with global current time
  useEffect(() => {
    if (globalCurrentTime !== undefined) {
      setCurrentTime(globalCurrentTime);
    }
  }, [globalCurrentTime]);

  // Update duration when track changes
  useEffect(() => {
    if (trackDuration) {
      setDuration(trackDuration);
    }
  }, [trackDuration]);

  // Sync with global volume
  useEffect(() => {
    if (globalVolume !== undefined) {
      setVolume(globalVolume * 100);
      setIsMuted(globalVolume === 0);
    }
  }, [globalVolume]);

  // Handle end of track with proper dependencies
  const handleTrackEnd = useCallback(() => {
    // Check if we're at the end of the track (with a small buffer)
    if (currentTime >= duration - 0.5 && duration > 0) {
      console.log("Track ended, moving to next track");

      // If repeat is on, just reset the time and restart playback
      if (repeat) {
        console.log("Repeat is on, restarting track");
        setCurrentTime(0);
        if (setGlobalCurrentTime) {
          setGlobalCurrentTime(0);
        }
        // Make sure playback continues
        if (!isPlaying && onPlayPause) {
          onPlayPause();
        }
        return;
      }

      // Otherwise, move to next track
      console.log("Moving to next track");
      setCurrentTime(0);
      if (setGlobalCurrentTime) {
        setGlobalCurrentTime(0);
      }
      onNext();
    }
  }, [
    currentTime,
    duration,
    onNext,
    setGlobalCurrentTime,
    repeat,
    isPlaying,
    onPlayPause,
  ]);

  // Use the callback in an effect
  useEffect(() => {
    handleTrackEnd();
  }, [handleTrackEnd]);

  // Volume change handler
  const handleVolumeChange = useCallback(
    (value) => {
      setVolume(value);
      setIsMuted(value === 0);
      setGlobalVolume(value / 100);
      if (onVolumeChange) {
        onVolumeChange(value / 100);
      }
    },
    [setGlobalVolume, onVolumeChange]
  );

  // Mute toggle handler
  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      // Unmute - restore previous volume
      setIsMuted(false);
      const newVolume = previousVolume > 0 ? previousVolume : 50;
      setVolume(newVolume);
      setGlobalVolume(newVolume / 100);
      if (onVolumeChange) {
        onVolumeChange(newVolume / 100);
      }
    } else {
      // Mute - save current volume
      setPreviousVolume(volume);
      setIsMuted(true);
      setVolume(0);
      setGlobalVolume(0);
      if (onVolumeChange) {
        onVolumeChange(0);
      }
    }
  }, [isMuted, previousVolume, volume, setGlobalVolume, onVolumeChange]);

  // Seek change handler
  const handleSeekChange = useCallback(
    (value) => {
      setCurrentTime(value);
      // Update the global current time in the music context
      if (setGlobalCurrentTime) {
        setGlobalCurrentTime(value);
      }
    },
    [setGlobalCurrentTime]
  );

  // Format time helper
  const formatTime = useCallback((seconds) => {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }, []);

  return (
    <div className="bg-gray-800 p-3 border-t border-gray-700">
      <div className="max-w-screen-lg mx-auto">
        {/* Progress Bar */}
        <div className="flex items-center mb-2">
          <span className="text-xs text-gray-400 w-12 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 mx-2 overflow-hidden">
            <SnakeSeekbar
              currentTime={currentTime}
              duration={duration}
              onChange={handleSeekChange}
              className="h-6"
            />
          </div>
          <span className="text-xs text-gray-400 w-12">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Shuffle button with CSS variables for theme compatibility */}
            <button
              onClick={toggleShuffle}
              className="hover:text-white transition-colors"
              title={shuffle ? "Shuffle is on" : "Shuffle is off"}
              style={{
                color: shuffle ? "var(--accent-color)" : "var(--text-muted)",
              }}
            >
              <FaRandom />
            </button>

            {/* Repeat button with CSS variables for theme compatibility */}
            <button
              onClick={toggleRepeat}
              className="hover:text-white transition-colors"
              title={repeat ? "Repeat is on" : "Repeat is off"}
              style={{
                color: repeat ? "var(--accent-color)" : "var(--text-muted)",
              }}
            >
              <FaRedo />
            </button>

            {/* Restart button with CSS variables for theme compatibility */}
            <button
              onClick={() => {
                setCurrentTime(0);
                if (setGlobalCurrentTime) {
                  setGlobalCurrentTime(0);
                }
              }}
              className="hover:text-white transition-colors"
              title="Restart track"
              style={{ color: "var(--text-muted)" }}
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
            {/* Previous button */}
            <button
              onClick={onPrevious}
              className="p-2 hover:text-white transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              <FaStepBackward className="h-5 w-5" />
            </button>

            {/* Play/Pause button */}
            <button
              onClick={onPlayPause}
              className="rounded-full h-10 w-10 flex items-center justify-center transition-transform"
              style={{
                backgroundColor: "var(--accent-color)",
                color: "white",
                boxShadow:
                  isPlaying && audioData?.bass > 0.1
                    ? `0 0 ${Math.floor(audioData.bass * 20)}px ${Math.floor(
                        audioData.bass * 10
                      )}px var(--accent-color-light)`
                    : "none",
                transform:
                  isPlaying && audioData?.beatDetected
                    ? `scale(${1 + audioData.bass * 0.2})`
                    : "scale(1)",
                transition: "transform 0.1s ease-out, box-shadow 0.1s ease-out",
              }}
            >
              {isPlaying ? (
                <FaPause className="h-4 w-4" />
              ) : (
                <FaPlay className="h-4 w-4 ml-1" />
              )}
            </button>

            {/* Next button */}
            <button
              onClick={onNext}
              className="p-2 hover:text-white transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              <FaStepForward className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2 w-36 group relative">
            {/* Volume button */}
            <button
              onClick={handleMuteToggle}
              className="hover:text-white transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
              style={{ color: "var(--text-muted)" }}
            >
              {isMuted ? (
                <FaVolumeMute />
              ) : volume < 30 ? (
                <FaVolumeDown />
              ) : (
                <FaVolumeUp />
              )}
            </button>

            <div className="flex-1 relative">
              {/* Volume slider */}
              <div className="relative h-2 bg-gray-700 rounded-full w-full">
                <div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    width: `${volume}%`,
                    backgroundColor: "var(--accent-color)",
                  }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Volume tooltip */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                {Math.round(volume)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
