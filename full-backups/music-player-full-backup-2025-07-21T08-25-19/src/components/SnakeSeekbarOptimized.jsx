import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTheme } from "../store/ThemeContext";
import { useMusic } from "../store/MusicContext";

export const SnakeSeekbar = ({
  currentTime,
  duration,
  onChange,
  className = "",
  ...props
}) => {
  const { theme } = useTheme();
  const { audioData } = useMusic();
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, time: 0 });

  const seekbarRef = useRef(null);
  const animationRef = useRef(null);
  const lastAnimationTime = useRef(0);
  const wavePointCount = 80;

  // Memoize static wave configuration to prevent recalculation
  const waveConfig = useMemo(
    () => ({
      baseAmplitude: 2,
      frequency: 0.15,
      animationSpeed: 0.001,
      updateInterval: 16, // ~60fps
    }),
    []
  );

  // Calculate progress percentage with safety checks
  const progress = useMemo(() => {
    return duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  }, [currentTime, duration]);

  // Memoize theme colors to prevent recalculation
  const themeColors = useMemo(() => {
    const getThemeColor = (intensity, isActive = true) => {
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
    };

    return {
      inactive: getThemeColor(0.2, false),
      active: getThemeColor(0.9, true),
      background: "rgba(255, 255, 255, 0.1)",
    };
  }, [theme.colors.primary.main]);

  // Generate wave points with audio reactivity - memoized and stable
  const generateWavePoints = useMemo(() => {
    return (timestamp, audioAmplitude = 1) => {
      const points = [];
      const progressX = progress;

      for (let i = 0; i < wavePointCount; i++) {
        const x = (i / (wavePointCount - 1)) * 100;
        const isActive = x <= progressX;

        // Calculate wave Y position
        const amplitude = waveConfig.baseAmplitude * audioAmplitude;
        const phase = timestamp * waveConfig.animationSpeed;
        const offset = i * 0.02;

        // Use audio data for frequency modulation if available
        let frequencyModulation = 1;
        let phaseModulation = 0;

        if (audioData?.frequencyData?.length > 0) {
          const freqIndex = Math.floor(
            (x / 100) * (audioData.frequencyData.length / 2)
          );
          if (freqIndex < audioData.frequencyData.length) {
            frequencyModulation =
              (audioData.frequencyData[freqIndex] / 255) * 0.5 + 0.5;
            phaseModulation =
              (audioData.bass * 0.5 +
                audioData.mid * 0.3 +
                audioData.treble * 0.2) *
              Math.PI;
          }
        }

        const wave1 =
          Math.sin(
            x * waveConfig.frequency + phase + offset + phaseModulation
          ) *
          amplitude *
          frequencyModulation;
        const wave2 =
          Math.sin(x * waveConfig.frequency * 0.5 + phase * 1.3) *
          (amplitude * 0.3);
        const y = wave1 + wave2;

        points.push({ x, y: y + 8, active: isActive });
      }

      return points;
    };
  }, [progress, waveConfig, audioData, wavePointCount]);

  // Get audio-reactive properties - memoized
  const audioProperties = useMemo(() => {
    if (!audioData) {
      return {
        amplitude: 1,
        glowIntensity: 0.7,
        strokeWidth: { active: 2, inactive: 1.5 },
      };
    }

    const amplitude = Math.max(
      1,
      Math.min(
        5,
        (audioData.bass * 0.6 + audioData.mid * 0.3 + audioData.treble * 0.1) *
          2
      )
    );

    const glowIntensity = 0.5 + (audioData.volume || 0) * 0.5;

    const strokeWidth = {
      active: 2 * (1 + (audioData.volume || 0) * 1.5),
      inactive: 1.5 * (1 + (audioData.volume || 0) * 1.5),
    };

    return { amplitude, glowIntensity, strokeWidth };
  }, [audioData]);

  // Create wave path - memoized function
  const createWavePath = useMemo(() => {
    return (points) => {
      if (points.length === 0) return "";

      let path = `M ${points[0].x},${points[0].y}`;

      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const current = points[i];
        const cpX = (prev.x + current.x) / 2;
        path += ` Q ${cpX},${prev.y} ${current.x},${current.y}`;
      }

      return path;
    };
  }, []);

  // Animation loop with proper throttling
  useEffect(() => {
    let animationId;

    const animate = (timestamp) => {
      // Throttle animation updates
      if (timestamp - lastAnimationTime.current < waveConfig.updateInterval) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      lastAnimationTime.current = timestamp;

      // Force re-render by updating a dummy state or using a ref
      // This is a controlled way to trigger re-renders for animation
      if (seekbarRef.current) {
        const wavePoints = generateWavePoints(
          timestamp,
          audioProperties.amplitude
        );
        const activePoints = wavePoints.filter((p) => p.active);

        // Update SVG paths directly for better performance
        const svg = seekbarRef.current.querySelector("svg");
        if (svg) {
          const backgroundPath = svg.querySelector(".background-path");
          const inactivePath = svg.querySelector(".inactive-path");
          const activePath = svg.querySelector(".active-path");

          const fullPath = createWavePath(wavePoints);
          const activePath_d = createWavePath(activePoints);

          if (backgroundPath) backgroundPath.setAttribute("d", fullPath);
          if (inactivePath) inactivePath.setAttribute("d", fullPath);
          if (activePath) activePath.setAttribute("d", activePath_d);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [
    generateWavePoints,
    audioProperties,
    createWavePath,
    waveConfig.updateInterval,
  ]);

  // Mouse event handlers - simplified and stable
  const handleMouseDown = (e) => {
    setIsDragging(true);
    updateSeekPosition(e);

    const handleMouseMove = (e) => {
      if (isDragging) {
        updateSeekPosition(e);
      } else {
        updateHoverPosition(e);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const updateSeekPosition = (e) => {
    if (!seekbarRef.current) return;

    const rect = seekbarRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = Math.min(Math.max(offsetX / rect.width, 0), 1);
    const newTime = percentage * duration;

    if (onChange) {
      onChange(newTime);
    }
  };

  const updateHoverPosition = (e) => {
    if (!seekbarRef.current) return;

    const rect = seekbarRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = Math.min(Math.max(offsetX / rect.width, 0), 1);
    const hoverTime = percentage * duration;

    setTooltipPosition({ x: offsetX, time: hoverTime });
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div
      ref={seekbarRef}
      className={`relative h-6 w-full cursor-pointer overflow-hidden ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={updateHoverPosition}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      <svg
        className="w-full h-full absolute top-0 left-0"
        viewBox="0 0 100 16"
        preserveAspectRatio="none"
      >
        <path
          className="background-path"
          stroke={themeColors.background}
          strokeWidth="1"
          fill="none"
        />
        <path
          className="inactive-path"
          stroke={themeColors.inactive}
          strokeWidth={audioProperties.strokeWidth.inactive}
          fill="none"
        />
        <path
          className="active-path"
          stroke={themeColors.active}
          strokeWidth={audioProperties.strokeWidth.active}
          fill="none"
          style={{
            filter: `drop-shadow(0 0 ${audioProperties.glowIntensity * 3}px ${
              themeColors.active
            })`,
          }}
        />
      </svg>

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
