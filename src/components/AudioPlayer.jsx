import React, { useEffect, useRef, useState } from "react";
import { useMusic } from "../store/MusicContext";
import { createAudioUrl } from "../utils/audioUtils";

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
  } = useMusic();

  const audioRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [albumArt, setAlbumArt] = useState(null);
  const loadingRef = useRef(false); // Ref to track loading state to prevent race conditions

  // Load audio when track changes
  useEffect(() => {
    // Skip if already loading to prevent race conditions
    if (loadingRef.current) return;

    const loadAudio = async () => {
      if (!currentTrack?.path && !currentTrack?.previewUrl) {
        console.log("No track to load");
        setAudioUrl(null);
        return;
      }

      try {
        loadingRef.current = true;
        setIsLoading(true);
        setError(null);

        // Use path or previewUrl, preferring path for local files
        const sourcePath = currentTrack.path || currentTrack.previewUrl;
        console.log(`Loading audio from: ${sourcePath}`);

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
                  src: albumArt || "/images/album-placeholder.svg",
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
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [currentTrack]);

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

  // Handle seeking
  useEffect(() => {
    if (!audioRef.current || !audioRef.current.duration) return;

    // Only update if the difference is significant to avoid loops
    if (Math.abs(audioRef.current.currentTime - currentTime) > 1) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // Event handlers
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleDurationChange = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 0);
  };

  const handleEnded = () => {
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
  };

  const handleError = (e) => {
    console.error("Audio playback error:", e);
    setError(
      `Audio playback error: ${e.target.error?.message || "Unknown error"}`
    );

    // Try to recover by moving to the next track, but only if not already loading
    if (!loadingRef.current) {
      setTimeout(() => {
        nextTrack();
      }, 2000);
    }
  };

  return (
    <div style={{ display: "none" }}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="auto"
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
