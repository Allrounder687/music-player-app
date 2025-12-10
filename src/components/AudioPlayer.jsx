import React, { useEffect, useRef, useState, useCallback } from "react";
import { useMusic } from "../store/MusicContext";
import { createAudioUrl, revokeBlobUrl, createBlobUrl } from "../utils/audioUtils";
import { AudioAnalysisService } from "../store/AudioAnalysisService";

/**
 * AudioPlayer component that handles the actual audio playback
 * Rewritten for robustness and reliability
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

  // Track the blob URL to revoke it when needed
  const currentBlobUrlRef = useRef(null);

  // 1. Handle Track Loading
  useEffect(() => {
    let active = true;

    const loadAudio = async () => {
      if (!currentTrack) {
        setAudioUrl(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("Loading track:", currentTrack.title);

        // Determine source
        let source;
        if (currentTrack.file instanceof File) {
          source = currentTrack.file;
        } else if (currentTrack.previewUrl) {
          source = currentTrack.previewUrl;
        } else if (currentTrack.path || currentTrack.filePath) {
          source = currentTrack.path || currentTrack.filePath;
        } else {
          throw new Error("No valid audio source found");
        }

        // Clean up previous blob
        if (currentBlobUrlRef.current && currentBlobUrlRef.current.startsWith('blob:')) {
          revokeBlobUrl(currentBlobUrlRef.current);
          currentBlobUrlRef.current = null;
        }

        const url = await createAudioUrl(source);

        if (!active) {
          // Component unmounted or track changed while loading
          if (url && url.startsWith('blob:')) revokeBlobUrl(url);
          return;
        }

        if (url.startsWith('blob:')) {
          currentBlobUrlRef.current = url;
        }

        setAudioUrl(url);
      } catch (err) {
        console.error("Error loading track:", err);
        if (active) setError(err.message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadAudio();

    return () => {
      active = false;
    };
  }, [currentTrack]);

  // 2. Cleanup on Unmount
  useEffect(() => {
    return () => {
      if (currentBlobUrlRef.current && currentBlobUrlRef.current.startsWith('blob:')) {
        revokeBlobUrl(currentBlobUrlRef.current);
      }
    };
  }, []);

  // 3. Handle Playback State Sync
  // This is the single source of truth for playing/pausing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl || isLoading) return;

    const syncPlayback = async () => {
      try {
        if (isPlaying) {
          // Only try to play if we're paused to avoid promises stacking
          if (audio.paused) {
            console.log("Starting playback...");
            await audio.play();
            console.log("Playback started");
          }
        } else {
          if (!audio.paused) {
            console.log("Pausing playback...");
            audio.pause();
          }
        }
      } catch (err) {
        // AbortError is common when tracks change quickly, we can ignore it
        if (err.name !== 'AbortError') {
          console.error("Playback error:", err);
        }
      }
    };

    syncPlayback();
  }, [isPlaying, audioUrl, isLoading]);

  // 4. Update Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 5. Handle Seek
  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 0.5) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // 6. Initialize Analyzer
  useEffect(() => {
    if (audioRef.current) {
      AudioAnalysisService.initializeAnalyzer(audioRef.current);
    }
  }, []);

  // 7. Analysis Loop
  // 7. Analysis Loop - REMOVED for performance
  // We no longer push audio data to context to avoid 60fps re-renders.
  // Consumers like SnakeSeekbar should query AudioAnalysisService directly.
  /*
  useEffect(() => {
    let animationFrame;
    const updateAnalysis = () => {
      if (isPlaying && !isLoading) {
        const data = AudioAnalysisService.getRealtimeData();
        if (data) setAudioData(data);
        animationFrame = requestAnimationFrame(updateAnalysis);
      }
    };

    if (isPlaying) {
      updateAnalysis();
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, isLoading, setAudioData]);
  */


  // Event Handlers
  const onTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const onDurationChange = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const onEnded = () => {
    if (repeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    } else {
      nextTrack();
    }
  };

  const onError = (e) => {
    const err = e.target.error;
    console.error("Audio element error:", err);
    setError(err ? err.message : "Playback error");

    // Auto-skip if error logic needed, but let's keep it simple for now
    // Maybe try to recover if it's a blob url issue?
  };

  // The critical fix: When data is loaded, check if we should be playing and force it.
  const onCanPlay = () => {
    if (isPlaying && audioRef.current && audioRef.current.paused) {
      console.log("onCanPlay: forcing play()");
      audioRef.current.play().catch(e => {
        console.warn("onCanPlay auto-start failed:", e);
      });
    }
  };

  return (
    <div style={{ display: "none" }}>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="auto"
        crossOrigin="anonymous"
        onTimeUpdate={onTimeUpdate}
        onDurationChange={onDurationChange}
        onEnded={onEnded}
        onError={onError}
        onCanPlay={onCanPlay}
      />
    </div>
  );
};
