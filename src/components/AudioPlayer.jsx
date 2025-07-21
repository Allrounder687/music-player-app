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

  const loadingRef = useRef(false); // Ref to track loading state to prevent race conditions
  const analyzerInitialized = useRef(false);
  const animationFrameRef = useRef(null);

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

        // Determine the source for the audio
        let sourcePath;
        let useDirectFile = false;

        // First check if we have a direct File object (most reliable)
        if (currentTrack.file instanceof File) {
          console.log(`Using direct File object: ${currentTrack.file.name}`);
          sourcePath = currentTrack.file;
          useDirectFile = true;
        }
        // For imported files, the previewUrl might already be a blob URL
        else if (
          currentTrack.previewUrl &&
          currentTrack.previewUrl.startsWith("blob:")
        ) {
          sourcePath = currentTrack.previewUrl;
          console.log(`Using existing blob URL: ${sourcePath}`);

          // Check if the blob URL is still valid by trying to fetch it
          try {
            const response = await fetch(sourcePath, { method: "HEAD" });
            if (!response.ok) {
              console.warn(
                `Blob URL appears invalid, will try to recreate: ${sourcePath}`
              );
              // If we have the original file, use that instead
              if (currentTrack.file instanceof File) {
                sourcePath = currentTrack.file;
                useDirectFile = true;
              } else if (currentTrack.path || currentTrack.filePath) {
                sourcePath = currentTrack.path || currentTrack.filePath;
              }
            }
          } catch (e) {
            console.warn(
              `Error checking blob URL, will try to recreate: ${e.message}`
            );
            // Fall back to file path if available
            if (currentTrack.path || currentTrack.filePath) {
              sourcePath = currentTrack.path || currentTrack.filePath;
            }
          }
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

        // Album art is handled by the MediaMetadata below

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

  // Audio analysis with simplified approach to prevent infinite loops
  useEffect(() => {
    // Always provide default audio data to prevent undefined errors
    const defaultAudioData = {
      bass: 0,
      mid: 0,
      treble: 0,
      volume: 0,
      frequencyData: new Uint8Array(128).fill(0),
      timeData: new Uint8Array(128).fill(0),
    };

    setAudioData(defaultAudioData);

    // Only attempt audio analysis if playing and analyzer is initialized
    if (!analyzerInitialized.current || !isPlaying) {
      return;
    }

    // Use a simple interval instead of requestAnimationFrame to reduce CPU usage
    const intervalId = setInterval(() => {
      try {
        const analysisData = AudioAnalysisService.getRealtimeData();
        if (analysisData && typeof analysisData === "object") {
          setAudioData(analysisData);
        }
      } catch (error) {
        console.error("Error updating audio data:", error);
      }
    }, 100); // Update at 10fps instead of 60fps

    return () => {
      clearInterval(intervalId);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying]); // Only depend on isPlaying

  // Refs for tracking play operation state
  const isPlayOperationInProgressRef = useRef(false);
  const currentPlayStateRef = useRef(isPlaying);

  // Update the current play state ref when isPlaying changes
  useEffect(() => {
    currentPlayStateRef.current = isPlaying;
  }, [isPlaying]);

  // Handle play/pause - separate from the audio URL effect to avoid race conditions
  useEffect(() => {
    if (!audioRef.current || !audioUrl || isLoading) return;

    const playAudio = async () => {
      if (isPlaying) {
        try {
          // Set flag before starting play operation
          isPlayOperationInProgressRef.current = true;

          // Make sure the audio element is ready
          if (audioRef.current.readyState < 2) {
            console.log("Audio not ready yet, loading...");
            // Wait for the audio to be ready
            await new Promise((resolve) => {
              const canPlayHandler = () => {
                if (audioRef.current) {
                  audioRef.current.removeEventListener(
                    "canplay",
                    canPlayHandler
                  );
                }
                resolve();
              };

              if (audioRef.current) {
                audioRef.current.addEventListener("canplay", canPlayHandler);
              }

              // Also set a timeout in case the canplay event never fires
              setTimeout(resolve, 3000);
            });
          }

          // Check if the play state is still true before playing
          // This prevents playing after a quick toggle of play/pause
          if (currentPlayStateRef.current && audioRef.current) {
            console.log("Attempting to play audio:", audioRef.current.src);
            await audioRef.current.play();
            console.log("Audio playback started successfully");
          }
        } catch (err) {
          console.error("Error playing audio:", err);
          setError(`Failed to play: ${err.message || "Unknown error"}`);

          // If the error is related to user interaction, try again after a short delay
          if (err.name === "NotAllowedError") {
            console.log(
              "Playback was prevented by browser, might need user interaction"
            );

            // Add a click handler to the document to enable audio on user interaction
            const enableAudio = () => {
              if (currentPlayStateRef.current && audioRef.current) {
                audioRef.current
                  .play()
                  .catch((e) => console.error("Error in click handler:", e));
              }
              document.removeEventListener("click", enableAudio);
            };
            document.addEventListener("click", enableAudio, { once: true });
          }
        } finally {
          // Clear flag when operation completes
          isPlayOperationInProgressRef.current = false;
        }
      } else {
        // Only pause if we're not in the middle of a play operation
        if (!isPlayOperationInProgressRef.current && audioRef.current) {
          audioRef.current.pause();
        }
      }
    };

    // Add event listener for when audio playback is interrupted
    const handlePause = () => {
      // If we didn't explicitly pause and we should be playing, try to resume
      if (
        currentPlayStateRef.current &&
        audioRef.current &&
        !isPlayOperationInProgressRef.current
      ) {
        console.log("Audio was auto-paused, attempting to resume...");
        audioRef.current.play().catch((err) => {
          console.error("Failed to resume after auto-pause:", err);
        });
      }
    };

    if (audioRef.current) {
      audioRef.current.addEventListener("pause", handlePause);
    }

    playAudio();

    // Cleanup function
    return () => {
      // Remove the pause event listener
      if (audioRef.current) {
        audioRef.current.removeEventListener("pause", handlePause);

        // If component unmounts during playback, make sure to pause
        if (!isPlayOperationInProgressRef.current) {
          audioRef.current.pause();
        }
      }
    };
  }, [isPlaying, audioUrl, isLoading]);

  // Handle volume changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  // Handle seeking
  useEffect(() => {
    if (!audioRef.current || !audioRef.current.duration) return;

    // Only update if the difference is significant to avoid loops
    if (Math.abs(audioRef.current.currentTime - currentTime) > 1) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // Event handlers
  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  }, [setCurrentTime]);

  const handleDurationChange = useCallback(() => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 0);
  }, [setDuration]);

  const handleEnded = useCallback(() => {
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
      nextTrack();
    }
  }, [repeat, nextTrack]);

  const handleError = useCallback(
    (e) => {
      // Safely log error without circular references
      const errorMessage = e.target?.error?.message || "Unknown error";
      console.error("Error playing audio:", errorMessage);

      // Log more details about the audio source
      console.error("Audio source that failed:", audioRef.current?.src);

      // Check if the error is related to a missing file
      const isMissingFile =
        errorMessage.includes("Failed to load") ||
        errorMessage.includes("not found") ||
        errorMessage.includes("DEMUXER_ERROR_COULD_NOT_OPEN");

      // Set a more user-friendly error message
      if (isMissingFile) {
        setError(
          `Could not find or access the audio file. The file may have been moved or deleted.`
        );
      } else {
        setError(`Audio playback error: ${errorMessage}`);
      }

      // For imported files, try to recreate the blob URL if possible
      if (
        currentTrack &&
        currentTrack.file instanceof File &&
        audioUrl.startsWith("blob:")
      ) {
        console.log(
          "Attempting to recreate blob URL for file:",
          currentTrack.file.name
        );
        try {
          // Revoke the old URL
          URL.revokeObjectURL(audioUrl);

          // Create a new URL
          const newUrl = URL.createObjectURL(currentTrack.file);
          console.log(`Created new blob URL: ${newUrl}`);

          // Update the audio URL
          setAudioUrl(newUrl);

          // Don't move to next track in this case
          return;
        } catch (recreateError) {
          console.error("Failed to recreate blob URL:", recreateError);
        }
      }

      // Try to recover by moving to the next track, but only if not already loading
      if (!loadingRef.current) {
        console.log(
          "Attempting to recover by moving to next track in 2 seconds"
        );
        setTimeout(() => {
          nextTrack();
        }, 2000);
      }
    },
    [nextTrack, currentTrack, audioUrl]
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
        onLoadStart={() => console.log("Audio load started:", audioUrl)}
        onCanPlay={() => console.log("Audio can play now:", audioUrl)}
        onLoadedData={() => console.log("Audio data loaded:", audioUrl)}
      />

      {/* We could render some UI for debugging */}
      {isLoading && <div>Loading audio...</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
};
