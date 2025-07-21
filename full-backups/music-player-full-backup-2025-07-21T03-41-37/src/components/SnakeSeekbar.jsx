import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "../store/ThemeContext";
import { useMusic } from "../store/MusicContext";

export const SnakeSeekbar = ({
  currentTime,
  duration,
  onChange,
  className = "",
  audioData: propAudioData, // Renamed to avoid conflict
  ...props
}) => {
  const { theme } = useTheme();
  // Use audioData from props if provided, otherwise from context
  const { audioData: contextAudioData } = useMusic();
  const audioData = propAudioData || contextAudioData;
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [wavePoints, setWavePoints] = useState([]);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, time: 0 });
  const [headPosition, setHeadPosition] = useState({ x: 0, y: 0, angle: 0 });

  const seekbarRef = useRef(null);
  const animationRef = useRef(null);
  const wavePointCount = 40; // Reduced from 80 for better performance

  // Initialize wave points
  useEffect(() => {
    // Initialize wave points across the entire seekbar
    const initialWavePoints = Array(wavePointCount)
      .fill()
      .map((_, index) => ({
        x: (index / (wavePointCount - 1)) * 100, // Distribute points evenly
        y: 0,
        active: false, // Whether this point is before the current progress
      }));
    setWavePoints(initialWavePoints);
  }, [wavePointCount]);

  // Calculate Y position for wave points with audio reactivity - memoized to avoid dependency issues
  const getWaveYPosition = useCallback(
    (x, index, audioAmplitude = 1) => {
      // Base amplitude for the wave
      const baseAmplitude = 2;

      // Apply audio reactivity to the amplitude
      const amplitude = baseAmplitude * audioAmplitude;

      // Create a more pronounced wave effect
      const frequency = 0.15; // Frequency for waves
      const phase = Date.now() * 0.001; // Animation speed - kept faster from previous changes
      const offset = index * 0.02; // Offset based on index for varied wave

      // Use audio data to influence the wave if available
      let frequencyModulation = 1;
      let phaseModulation = 0;

      if (
        audioData &&
        audioData.frequencyData &&
        audioData.frequencyData.length > 0
      ) {
        // Use frequency data to modulate the wave
        const freqIndex = Math.floor(
          (x / 100) * (audioData.frequencyData.length / 2)
        );
        if (freqIndex < audioData.frequencyData.length) {
          // Normalize to 0-1 range and add small offset to avoid flat lines
          frequencyModulation =
            (audioData.frequencyData[freqIndex] / 255) * 0.5 + 0.5;

          // Use bass/mid/treble to influence phase
          phaseModulation =
            (audioData.bass * 0.5 +
              audioData.mid * 0.3 +
              audioData.treble * 0.2) *
            Math.PI;
        }
      }

      // Combine multiple sine waves for more natural movement
      const wave1 =
        Math.sin(x * frequency + phase + offset + phaseModulation) *
        amplitude *
        frequencyModulation;
      const wave2 =
        Math.sin(x * frequency * 0.5 + phase * 1.3) * (amplitude * 0.3);

      return wave1 + wave2;
    },
    [audioData]
  );

  // Update wave points based on current playback percentage
  const updateWavePoints = useCallback((percentage) => {
    const progressX = percentage * 100;

    setWavePoints((prevPoints) => {
      return prevPoints.map((point) => ({
        ...point,
        active: point.x <= progressX,
      }));
    });
  }, []);

  // Update wave points based on current time
  // FIX: Removed getWaveYPosition and updateWavePoints from dependencies to break the infinite loop
  useEffect(() => {
    if (!isDragging && duration > 0) {
      // Ensure we don't divide by zero and handle edge cases
      const percentage = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
      updateWavePoints(percentage);

      // Update head position
      const headX = percentage * 100;
      const headY = getWaveYPosition(headX, 0);

      // Calculate angle based on nearby points for head orientation
      let angle = 0;
      if (percentage > 0.01 && percentage < 0.99) {
        const prevX = (percentage - 0.01) * 100;
        const prevY = getWaveYPosition(prevX, 0);
        const nextX = (percentage + 0.01) * 100;
        const nextY = getWaveYPosition(nextX, 0);

        // Calculate angle in radians, then convert to degrees
        angle = Math.atan2(nextY - prevY, nextX - prevX) * (180 / Math.PI);
      }

      setHeadPosition({ x: headX, y: headY, angle });
    }
  }, [currentTime, duration, isDragging]);

  // Get audio-reactive amplitude based on frequency data
  const getAudioAmplitude = useCallback(() => {
    try {
      if (!audioData || typeof audioData !== "object") {
        return 1; // Default amplitude if no audio data
      }

      const { bass = 0, mid = 0, treble = 0 } = audioData;

      // Validate audio data values
      if (
        typeof bass !== "number" ||
        typeof mid !== "number" ||
        typeof treble !== "number"
      ) {
        return 1;
      }

      // Use bass for more pronounced effect, with mid and treble for detail
      const bassWeight = 0.6;
      const midWeight = 0.3;
      const trebleWeight = 0.1;

      // Calculate weighted average with safety checks
      const amplitude = Math.max(
        0,
        (bass * bassWeight + mid * midWeight + treble * trebleWeight) * 2
      );

      // Ensure amplitude is at least 1 and at most 5
      return Math.max(1, Math.min(5, amplitude || 1));
    } catch (error) {
      console.warn("Error calculating audio amplitude:", error);
      return 1;
    }
  }, [audioData]);

  // Animate wave points
  const animateWave = useCallback(() => {
    const audioAmplitude = getAudioAmplitude();

    setWavePoints((prevPoints) => {
      return prevPoints.map((point, index) => ({
        ...point,
        y: getWaveYPosition(point.x, index, audioAmplitude),
      }));
    });
  }, [getAudioAmplitude, getWaveYPosition]);

  // Animation loop for wave animation - only when audio is playing
  useEffect(() => {
    // Only animate when there's meaningful audio data
    const shouldAnimate =
      audioData && (audioData.volume > 0.01 || audioData.bass > 0.01);

    if (!shouldAnimate) {
      // Set static wave when not animating
      setWavePoints((prev) =>
        prev.map((point, index) => ({
          ...point,
          y: getWaveYPosition(point.x, index, 1),
        }))
      );
      return;
    }

    let lastFrameTime = 0;
    const targetFPS = 30; // Reduce from 60fps to 30fps
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime) => {
      if (currentTime - lastFrameTime >= frameInterval) {
        animateWave();
        lastFrameTime = currentTime;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [animateWave, audioData]);

  // Handle mouse events
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    updateSeekPosition(e);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        updateSeekPosition(e);
      } else {
        updateHoverPosition(e);
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  // Update the seek position based on mouse position
  const updateSeekPosition = useCallback(
    (e) => {
      if (!seekbarRef.current) return;

      const rect = seekbarRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percentage = Math.min(Math.max(offsetX / rect.width, 0), 1);
      const newTime = percentage * duration;

      updateWavePoints(percentage);

      if (onChange) {
        onChange(newTime);
      }
    },
    [duration, onChange, updateWavePoints]
  );

  // Update hover position for tooltip
  const updateHoverPosition = useCallback(
    (e) => {
      if (!seekbarRef.current) return;

      const rect = seekbarRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percentage = Math.min(Math.max(offsetX / rect.width, 0), 1);
      const hoverTime = percentage * duration;

      setTooltipPosition({
        x: offsetX,
        time: hoverTime,
      });
    },
    [duration]
  );

  // Format time for tooltip display
  const formatTime = useCallback((seconds) => {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }, []);

  // Calculate progress percentage with safety checks
  const progress =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  // Get theme-specific colors
  const getThemeColor = useCallback(
    (intensity, isActive = true) => {
      let baseColor;
      switch (theme.colors.primary.main) {
        case "blue-600":
          baseColor = isActive
            ? `rgba(37, 99, 235, ${intensity})`
            : "rgba(37, 99, 235, 0.2)";
          break;
        case "red-600":
          baseColor = isActive
            ? `rgba(220, 38, 38, ${intensity})`
            : "rgba(220, 38, 38, 0.2)";
          break;
        case "gray-400":
          baseColor = isActive
            ? `rgba(156, 163, 175, ${intensity})`
            : "rgba(156, 163, 175, 0.2)";
          break;
        default:
          baseColor = isActive
            ? `rgba(168, 85, 247, ${intensity})`
            : "rgba(168, 85, 247, 0.2)";
      }
      return baseColor;
    },
    [theme.colors.primary.main]
  );

  // Create wave path data
  const createWavePath = useCallback((points) => {
    if (points.length === 0) return "";

    // Start at the first point
    let path = `M ${points[0].x},${8 + points[0].y}`;

    // Add curve points
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const current = points[i];

      // Use quadratic curves for smoother waves
      const cpX = (prev.x + current.x) / 2;
      path += ` Q ${cpX},${8 + prev.y} ${current.x},${8 + current.y}`;
    }

    return path;
  }, []);

  // Get audio-reactive glow intensity
  const getGlowIntensity = useCallback(() => {
    if (!audioData || !audioData.volume) return 0.7;
    return 0.5 + audioData.volume * 0.5; // Scale between 0.5 and 1.0
  }, [audioData]);

  // Get stroke width based on audio intensity
  const getStrokeWidth = useCallback(
    (isActive) => {
      if (!audioData || !audioData.volume) return isActive ? 2 : 1.5;

      // Base width
      const baseWidth = isActive ? 2 : 1.5;

      // Add audio reactivity
      const audioFactor = 1 + audioData.volume * 1.5; // Scale between 1 and 2.5

      return baseWidth * audioFactor;
    },
    [audioData]
  );

  // Split wave points into active and inactive
  const activePoints = wavePoints.filter((p) => p.active);

  return (
    <div
      ref={seekbarRef}
      className={`relative h-6 w-full cursor-pointer overflow-hidden ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* SVG for wave pattern - contained within the seekbar */}
      <svg
        className="w-full h-full absolute top-0 left-0"
        viewBox="0 0 100 16"
        preserveAspectRatio="none"
      >
        {/* Background line */}
        <path
          d={createWavePath(wavePoints)}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
          fill="none"
        />

        {/* Inactive wave path */}
        <path
          d={createWavePath(wavePoints)}
          stroke={getThemeColor(0.2, false)}
          strokeWidth={getStrokeWidth(false)}
          fill="none"
        />

        {/* Active wave path */}
        <path
          d={createWavePath(activePoints)}
          stroke={getThemeColor(0.9, true)}
          strokeWidth={getStrokeWidth(true)}
          fill="none"
          style={{
            filter: `drop-shadow(0 0 ${
              getGlowIntensity() * 3
            }px ${getThemeColor(getGlowIntensity(), true)})`,
          }}
        />

        {/* Snake head removed */}
      </svg>

      {/* Hover tooltip */}
      {isHovering && (
        <div
          className={`absolute top-0 transform -translate-y-full -translate-x-1/2 bg-${theme.colors.background.secondary} text-${theme.colors.text.primary} px-2 py-1 rounded text-xs`}
          style={{ left: `${tooltipPosition.x}px`, marginTop: "-4px" }}
        >
          {formatTime(tooltipPosition.time)}
        </div>
      )}
    </div>
  );
};

// PropTypes removed to fix build error
