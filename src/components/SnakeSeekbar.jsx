import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "../store/ThemeContext";

export const SnakeSeekbar = ({
  currentTime,
  duration,
  onChange,
  audioData = null,
  className = "",
  ...props
}) => {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [wavePoints, setWavePoints] = useState([]);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, time: 0 });
  const [headPosition, setHeadPosition] = useState({ x: 0, y: 0, angle: 0 });

  const seekbarRef = useRef(null);
  const animationRef = useRef(null);
  const wavePointCount = 80; // Increased number of points for smoother waves

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
  }, []);

  // Update wave points based on current time
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

  // Animation loop for wave animation
  useEffect(() => {
    const animate = () => {
      animateWave();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [wavePoints]);

  // Handle mouse events
  const handleMouseDown = (e) => {
    setIsDragging(true);
    updateSeekPosition(e);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

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

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // Update the seek position based on mouse position
  const updateSeekPosition = (e) => {
    if (!seekbarRef.current) return;

    const rect = seekbarRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = Math.min(Math.max(offsetX / rect.width, 0), 1);
    const newTime = percentage * duration;

    updateWavePoints(percentage);

    if (onChange) {
      onChange(newTime);
    }
  };

  // Update hover position for tooltip
  const updateHoverPosition = (e) => {
    if (!seekbarRef.current) return;

    const rect = seekbarRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = Math.min(Math.max(offsetX / rect.width, 0), 1);
    const hoverTime = percentage * duration;

    setTooltipPosition({
      x: offsetX,
      time: hoverTime,
    });
  };

  // Update wave points based on current playback percentage
  const updateWavePoints = (percentage) => {
    const progressX = percentage * 100;

    setWavePoints((prevPoints) => {
      return prevPoints.map((point) => ({
        ...point,
        active: point.x <= progressX,
      }));
    });
  };

  // Animate wave points
  const animateWave = () => {
    setWavePoints((prevPoints) => {
      return prevPoints.map((point, index) => ({
        ...point,
        y: getWaveYPosition(point.x, index),
      }));
    });
  };

  // Calculate Y position for wave points with more pronounced waves
  const getWaveYPosition = (x, index) => {
    // Create a more pronounced wave effect
    const amplitude = 4; // Increased height of the wave
    const frequency = 0.15; // Increased frequency for more waves
    const phase = Date.now() * 0.0008; // Slightly faster animation
    const offset = index * 0.02; // Offset based on index for varied wave

    // Combine multiple sine waves for more natural movement
    const wave1 = Math.sin(x * frequency + phase + offset) * amplitude;
    const wave2 =
      Math.sin(x * frequency * 0.5 + phase * 1.3) * (amplitude * 0.3);

    return wave1 + wave2;
  };

  // Get intensity based on audio data or use default
  const getIntensity = (position) => {
    if (audioData && audioData.intensityMap) {
      // Find closest intensity data point
      const intensityPoint = audioData.intensityMap.find(
        (point) => Math.abs(point.position - position) < 0.01
      );
      return intensityPoint ? intensityPoint.intensity : 0.8;
    }
    return 0.8; // Default intensity
  };

  // Format time for tooltip display
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Calculate progress percentage with safety checks
  const progress =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  // Get theme-specific colors
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

  // Create wave path data
  const createWavePath = (points, isActive) => {
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
  };

  // Split wave points into active and inactive
  const activePoints = wavePoints.filter((p) => p.active);
  const inactivePoints = wavePoints.filter((p) => !p.active);

  return (
    <div
      ref={seekbarRef}
      className={`relative h-6 w-full cursor-pointer ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* SVG for wave pattern */}
      <svg
        className="w-full h-full"
        viewBox="0 0 100 16"
        preserveAspectRatio="none"
      >
        {/* Background line */}
        <path
          d={createWavePath(wavePoints, false)}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
          fill="none"
          className="wave-path"
        />

        {/* Inactive wave path */}
        <path
          d={createWavePath(wavePoints, false)}
          stroke={getThemeColor(0.2, false)}
          strokeWidth="1.5"
          fill="none"
          className="wave-path"
        />

        {/* Active wave path */}
        <path
          d={createWavePath(activePoints, true)}
          stroke={getThemeColor(0.9, true)}
          strokeWidth="2"
          fill="none"
          className="wave-path active"
        />

        {/* Snake head (more realistic) */}
        <g
          transform={`translate(${headPosition.x}, ${
            8 + headPosition.y
          }) rotate(${headPosition.angle})`}
          className="snake-head"
        >
          {/* Main head shape */}
          <path
            d="M 0,0 L 4,-1.5 Q 5,0 4,1.5 Z"
            fill={getThemeColor(1)}
            className="drop-shadow-glow"
          />

          {/* Eye */}
          <circle cx="2" cy="-0.5" r="0.5" fill="#ffffff" />
        </g>
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
