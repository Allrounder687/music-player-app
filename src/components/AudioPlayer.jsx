import React, { useEffect, useRef, useState, useCallback } from "react";
import { useMusic } from "../store/MusicContext";
import { createAudioUrl } from "../utils/audioUtils";
import { AudioAnalysisService } from "../store/AudioAnalysisService";

/**
 * AudioPlayer component that handles the actual audio playback
 * This is a hidden component that manages the HTML5 audio element
 */
export const AudioPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    setCurrentTime,
    setDuration,
    nextTrack,
    repeat,
    setAudioData,
  } = useMusic();

  const audioRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [albumArt, setAlbumArt] = useState(null);
  const loadingRef = useRef(false); // Ref to track loading state to prevent race conditions
  const analyzerInitialized = useRef(false);
  const animationFrameRef = useRef(null);
  const timeUpdateRef = useRef(null); // Ref to throttle time updates

  // Load audio when track changes
  useEffect(() => {
    // Skip if already loading to prevent race conditions
    if (loadingRef.current) return;

    const loadAudio = async () => {
      if (!currentTrack) {
        console.log("No track to load");
        setAudioUrl(null);
        return;
      }

      try {
        loadingRef.current = true;
        setIsLoading(true);
        setError(null);

        console.log("Current track:", currentTrack);

        // Show loading notification
        if (window.showToast) {
          window.showToast(`Loading: ${currentTrack.title}`, "info", 2000);
        }

        // Determine the source for the audio
        let sourcePath;

        // For imported files, the previewUrl might already be a blob URL
        if (
          currentTrack.previewUrl &&
          currentTrack.previewUrl.startsWith("blob:")
        ) {
          sourcePath = currentTrack.previewUrl;
          console.log(`Using existing blob URL: ${sourcePath}`);
        }
        // For local files, use path or filePath
        else if (currentTrack.path || currentTrack.filePath) {
          sourcePath = currentTrack.path || currentTrack.filePath;
          console.log(`Using file path: ${sourcePath}`);
        }
        // For streaming URLs, use previewUrl
        else if (currentTrack.previewUrl) {
          sourcePath = currentTrack.previewUrl;
          console.log(`Using preview URL: ${sourcePath}`);
        } else {
          console.error("No valid source found for track:", currentTrack);
          setError("No valid audio source found");
          setIsLoading(false);
          loadingRef.current = false;
          return;
        }

        // Create a blob URL for the audio file
        const url = await createAudioUrl(sourcePath);
        console.log(`Created audio URL: ${url}`);

        // Set album art if available
        if (currentTrack.imageUrl) {
          setAlbumArt(currentTrack.imageUrl);
        } else {
          // Use a static placeholder instead of dynamic unsplash URLs
          setAlbumArt("/images/album-placeholder.svg");
        }

        // Set the audio URL last to ensure everything else is ready
        setAudioUrl(url);

        // Update media session metadata for system media controls
        if ("mediaSession" in navigator) {
          try {
            navigator.mediaSession.metadata = new MediaMetadata({
              title: currentTrack.title || "Unknown Title",
              artist: currentTrack.artist || "Unknown Artist",
              album: currentTrack.album || "Unknown Album",
              artwork: [
                {
                  src: currentTrack.imageUrl || "/images/album-placeholder.svg",
                  sizes: "512x512",
                  type: "image/png",
                },
              ],
            });
          } catch (mediaError) {
            console.warn("Media Session API error:", mediaError);
          }
        }
      } catch (err) {
        console.error("Error loading audio:", err);
        setError(`Failed to load audio: ${err.message}`);
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };

    loadAudio();

    // Clean up previous blob URL when track changes
    return () => {
      if (audioUrl && audioUrl.startsWith("blob:")) {
        // Don't revoke URLs that might be needed for imported files
        // Only revoke URLs that we created in this component
        if (!currentTrack || audioUrl !== currentTrack.previewUrl) {
          URL.revokeObjectURL(audioUrl);
        }
      }

      // Cancel any ongoing animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Clear time update timeout
      if (timeUpdateRef.current) {
        clearTimeout(timeUpdateRef.current);
      }
    };
  }, [currentTrack]);

  // Initialize audio analyzer when audio element is ready
  useEffect(() => {
    if (!audioRef.current || analyzerInitialized.current) return;

    try {
      AudioAnalysisService.initializeAnalyzer(audioRef.current);
      analyzerInitialized.current = true;
      console.log("Audio analyzer initialized");
    } catch (error) {
      console.error("Failed to initialize audio analyzer:", error);
    }
  }, []);

  // Update audio analysis data in real-time
  const updateAudioData = useCallback(() => {
    try {
      const analysisData = AudioAnalysisService.getRealtimeData();
      setAudioData(analysisData);
    } catch (error) {
      console.error("Error updating audio data:", error);
    }

    animationFrameRef.current = requestAnimationFrame(updateAudioData);
  }, [setAudioData]);

  // Start/stop audio analysis based on playback state
  useEffect(() => {
    if (!analyzerInitialized.current) return;

    if (isPlaying) {
      updateAudioData();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, updateAudioData]);

  // Handle play/pause - separate from the audio URL effect to avoid race conditions
  useEffect(() => {
    if (!audioRef.current || !audioUrl || isLoading) return;

    const playAudio = async () => {
      if (isPlaying) {
        try {
          await audioRef.current.play();
        } catch (err) {
          console.error("Error playing audio:", err);
          // Don't try to auto-recover here, just log the error
        }
      } else {
        audioRef.current.pause();
      }
    };

    playAudio();
  }, [isPlaying, audioUrl, isLoading]);

  // Handle volume changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  // Handle seeking - improved to prevent excessive updates
  useEffect(() => {
    if (!audioRef.current || !audioRef.current.duration) return;

    // Only update if the difference is significant to avoid loops
    if (Math.abs(audioRef.current.currentTime - currentTime) > 1) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // Event handlers - throttled time updates to prevent excessive state changes
  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    
    // Throttle time updates to prevent excessive state changes
    if (timeUpdateRef.current) {
      clearTimeout(timeUpdateRef.current);
    }
    
    timeUpdateRef.current = setTimeout(() => {
      setCurrentTime(audioRef.current.currentTime);
    }, 100); // Update every 100ms instead of every frame
  }, [setCurrentTime]);

  const handleDurationChange = useCallback(() => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 0);
  }, [setDuration]);

  // Improved track ending handling to prevent loops
  const handleEnded = useCallback(() => {
    console.log("Track ended");
    
    if (repeat) {
      // If repeat is enabled, restart the current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.error("Error replaying audio:", err);
        });
      }
    } else {
      // Otherwise, move to the next track
      // Add a small delay to prevent rapid-fire track changes
      setTimeout(() => {
        nextTrack();
      }, 100);
    }
  }, [repeat, nextTrack]);

  const handleError = useCallback(
    (e) => {
      console.error("Audio playback error:", e);
      const errorMessage = `Audio playback error: ${e.target.error?.message || "Unknown error"}`;
      setError(errorMessage);

      // Show toast notification
      if (window.showToast) {
        window.showToast("Failed to play audio. Skipping to next track...", "error", 3000);
      }

      // Try to recover by moving to the next track, but only if not already loading
      if (!loadingRef.current) {
        setTimeout(() => {
          nextTrack();
        }, 2000);
      }
    },
    [nextTrack]
  );

  return (
    <div style={{ display: "none" }}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="auto"
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onEnded={handleEnded}
        onError={handleError}
      />

      {/* We could render some UI for debugging */}
      {isLoading && <div>Loading audio...</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
};
