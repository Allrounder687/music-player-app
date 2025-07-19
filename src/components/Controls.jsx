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

      // If repeat is on, just reset the time
      if (repeat) {
        setCurrentTime(0);
        if (setGlobalCurrentTime) {
          setGlobalCurrentTime(0);
        }
        return;
      }

      // Otherwise, move to next track
      setCurrentTime(0);
      if (setGlobalCurrentTime) {
        setGlobalCurrentTime(0);
      }
      onNext();
    }
  }, [currentTime, duration, onNext, setGlobalCurrentTime, repeat]);

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
                hover:text-${theme.colors.text.primary}`}
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
                hover:text-${theme.colors.text.primary}`}
              title={repeat ? "Repeat is on" : "Repeat is off"}
            >
              <FaRedo />
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
              ) : volume < 30 ? (
                <FaVolumeDown />
              ) : (
                <FaVolumeUp />
              )}
            </button>
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              className="h-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
