import React, { useEffect, useRef, useState } from "react";
import { useMusic } from "../store/MusicContext";
import {
  isYoutubeEmbedUrl,
  extractYoutubeVideoId,
} from "../utils/youtubeUtils";

/**
 * YouTubePlayer component for playing YouTube videos
 * This is used when a track's stream URL is a YouTube embed URL
 */
const YouTubePlayer = ({ url, onEnded }) => {
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const currentTimeRef = useRef(0);
  const [playerReady, setPlayerReady] = useState(false);

  const { volume, isPlaying, currentTime, setCurrentTime, setDuration } =
    useMusic();

  // Extract video ID from URL
  const videoId = extractYoutubeVideoId(url);

  // Keep track of current time in a ref to avoid re-renders
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // Track if we've already initialized the player for this video ID
  const initializedVideoIdRef = useRef(null);

  // Create YouTube player when component mounts
  useEffect(() => {
    if (!videoId) return;

    // Skip re-initialization if we're already playing this video
    if (playerRef.current && initializedVideoIdRef.current === videoId) {
      console.log("YouTubePlayer: Already initialized for video ID:", videoId);
      return;
    }

    // Remember this video ID
    initializedVideoIdRef.current = videoId;

    console.log("YouTubePlayer: Initializing with video ID:", videoId);

    // Load YouTube API if not already loaded
    if (!window.YT) {
      console.log("YouTubePlayer: Loading YouTube API");
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
    const initPlayer = () => {
      // If we already have a player, just load the new video
      if (playerRef.current) {
        console.log(
          "YouTubePlayer: Loading new video in existing player:",
          videoId
        );
        playerRef.current.loadVideoById(videoId);
        return;
      }

      console.log("YouTubePlayer: Initializing player");

      // Create a container for the player if it doesn't exist
      let container = document.getElementById("youtube-player-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "youtube-player-container";
        container.style.position = "fixed";
        container.style.top = "-1000px";
        container.style.left = "-1000px";
        container.style.width = "640px";
        container.style.height = "360px";
        document.body.appendChild(container);
      }

      // Store the container reference
      iframeRef.current = container;

      playerRef.current = new window.YT.Player(container.id, {
        height: "360",
        width: "640",
        videoId: videoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        },
      });
    };

    // Handle player ready event
    const onPlayerReady = (event) => {
      console.log("YouTubePlayer: Player ready");

      // Set volume
      event.target.setVolume(volume * 100);

      // Get and set video duration
      const duration = event.target.getDuration();
      console.log("YouTubePlayer: Video duration:", duration);
      setDuration(duration);

      // Start playing if needed
      if (isPlaying) {
        console.log("YouTubePlayer: Starting playback");
        event.target.playVideo();
      }

      // Seek to current time if needed
      if (currentTime > 0) {
        console.log("YouTubePlayer: Seeking to", currentTime);
        event.target.seekTo(currentTime, true);
      }

      setPlayerReady(true);
    };

    // Handle player state changes
    const onPlayerStateChange = (event) => {
      console.log("YouTubePlayer: State changed to", event.data);

      // When video ends
      if (event.data === window.YT.PlayerState.ENDED) {
        console.log("YouTubePlayer: Video ended");
        if (onEnded) onEnded();
      }

      // When video is playing
      if (event.data === window.YT.PlayerState.PLAYING) {
        console.log("YouTubePlayer: Video playing");

        // Update duration again (sometimes it's not available in onReady)
        const duration = playerRef.current.getDuration();
        if (duration && duration > 0) {
          console.log("YouTubePlayer: Updated duration:", duration);
          setDuration(duration);
        }

        // Start time update interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        // Store the last time we updated to avoid frequent updates
        let lastUpdateTime = currentTimeRef.current;

        intervalRef.current = setInterval(() => {
          if (playerRef.current && playerRef.current.getCurrentTime) {
            const time = playerRef.current.getCurrentTime();
            // Only update if the difference is significant to avoid loops
            if (Math.abs(time - lastUpdateTime) > 1) {
              setCurrentTime(time);
              lastUpdateTime = time;
            }
          }
        }, 2000); // Update less frequently (every 2 seconds)
      } else if (intervalRef.current) {
        // Clear interval when not playing
        clearInterval(intervalRef.current);
      }
    };

    // Handle player errors
    const onPlayerError = (event) => {
      console.error("YouTubePlayer: Error", event.data);
    };

    // Initialize player when API is ready
    if (window.YT && window.YT.Player) {
      console.log("YouTubePlayer: YouTube API already loaded");
      initPlayer();
    } else {
      console.log("YouTubePlayer: Waiting for YouTube API to load");
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    // Clean up only when component unmounts, not on every dependency change
    return () => {
      // We'll handle cleanup in a separate effect
    };
  }, [videoId]); // Only depend on videoId

  // Cleanup effect that runs when component unmounts
  useEffect(() => {
    return () => {
      console.log("YouTubePlayer: Cleaning up");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      // Remove the container
      const container = document.getElementById("youtube-player-container");
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }

      setPlayerReady(false);
      initializedVideoIdRef.current = null;
    };
  }, []);

  // Handle play/pause
  useEffect(() => {
    if (!playerReady || !playerRef.current) return;

    console.log("YouTubePlayer: Play state changed to", isPlaying);

    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (error) {
      console.error("YouTubePlayer: Error controlling playback:", error);
    }
  }, [isPlaying, playerReady]);

  // Handle volume changes
  useEffect(() => {
    if (!playerReady || !playerRef.current) return;

    try {
      const volumeValue = Math.round(volume * 100);
      console.log("YouTubePlayer: Volume changed to", volumeValue);
      playerRef.current.setVolume(volumeValue);
    } catch (error) {
      console.error("YouTubePlayer: Error setting volume:", error);
    }
  }, [volume, playerReady]);

  // Handle seeking
  useEffect(() => {
    if (!playerReady || !playerRef.current) return;

    try {
      // Only seek if the difference is significant to avoid loops
      const currentPlayerTime = playerRef.current.getCurrentTime();
      if (Math.abs(currentPlayerTime - currentTime) > 1) {
        console.log("YouTubePlayer: Seeking to", currentTime);
        playerRef.current.seekTo(currentTime, true);
      }
    } catch (error) {
      console.error("YouTubePlayer: Error seeking:", error);
    }
  }, [currentTime, playerReady]); // Remove setCurrentTime from dependencies

  // Return a hidden container for the YouTube player
  return (
    <div
      style={{
        position: "fixed",
        top: "-1000px",
        left: "-1000px",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      <div id="youtube-player-container" ref={iframeRef}></div>
    </div>
  );
};

export default YouTubePlayer;
