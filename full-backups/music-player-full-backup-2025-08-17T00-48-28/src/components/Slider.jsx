import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useMusic } from "../store/MusicContext";

/**
 * Slider component for controlling audio playback position
 * Includes audio visualization when playing
 *
 * @param {number} value - Current value of the slider
 * @param {number} min - Minimum value of the slider
 * @param {number} max - Maximum value of the slider
 * @param {number} step - Step increment for the slider
 * @param {Function} onChange - Callback when slider value changes
 * @param {string} className - Additional CSS classes for the slider
 * @param {string} thumbClassName - CSS classes for the slider thumb
 * @param {string} trackClassName - CSS classes for the slider track
 */
export const Slider = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className = "",
  // We'll use these props but not pass them to the DOM
  thumbClassName,
  trackClassName,
  ...props
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);
  const [sliderValue, setSliderValue] = useState(value);
  const { audioData, isPlaying } = useMusic();
  const [wavePoints, setWavePoints] = useState([]);
  const [trackHeight, setTrackHeight] = useState(4); // Default height in pixels
  const animationRef = useRef(null);
  const lastBeatTime = useRef(0);
  const beatThreshold = 0.15; // Threshold for detecting beats

  // Update internal value when prop changes
  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  // Generate wave points based on audio data
  useEffect(() => {
    // Skip for volume slider (max === 100)
    if (max === 100) return;

    if (!isPlaying || !audioData) return;

    // Detect beats for track height animation
    const now = Date.now();
    const beatDetected =
      audioData.beatDetected ||
      (audioData.bass > beatThreshold && now - lastBeatTime.current > 100); // Prevent too frequent beats

    if (beatDetected) {
      lastBeatTime.current = now;
      // Animate track height on beat
      setTrackHeight(Math.min(12, 4 + audioData.bass * 16));

      // Schedule return to normal height
      setTimeout(() => {
        setTrackHeight(4);
      }, 200);

      // Add a subtle pulse animation to the entire slider
      if (sliderRef.current) {
        sliderRef.current.classList.add("pulse-animation");
        setTimeout(() => {
          if (sliderRef.current) {
            sliderRef.current.classList.remove("pulse-animation");
          }
        }, 300);
      }
    }

    // Generate wave points for the seekbar
    const numPoints = 20;
    const newPoints = [];

    for (let i = 0; i < numPoints; i++) {
      // Use frequency data to create wave pattern
      const frequencyIndex = Math.floor(
        i * (audioData.frequencyData.length / numPoints)
      );
      const amplitude = audioData.frequencyData[frequencyIndex] / 255;

      // Calculate wave height based on audio data
      // Mix bass, mid, and treble for different parts of the seekbar
      let waveHeight;
      if (i < numPoints * 0.3) {
        // Bass dominates the beginning
        waveHeight = audioData.bass * 15;
      } else if (i < numPoints * 0.7) {
        // Mid frequencies in the middle
        waveHeight = audioData.mid * 12;
      } else {
        // Treble at the end
        waveHeight = audioData.treble * 10;
      }

      // Add some randomness for more natural look
      waveHeight += amplitude * 5;

      // Ensure minimum height
      waveHeight = Math.max(1, waveHeight);

      newPoints.push(waveHeight);
    }

    setWavePoints(newPoints);
  }, [audioData, isPlaying]);

  // Update slider value based on mouse position with throttling
  const updateSliderValue = useCallback(
    (e) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percentage = Math.min(Math.max(offsetX / rect.width, 0), 1);
      const newValue =
        Math.round((percentage * (max - min)) / step) * step + min;

      setSliderValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
    },
    [min, max, step, onChange]
  );

  // Throttled version of updateSliderValue for better performance during dragging
  const throttledUpdateSliderValue = useCallback(
    (() => {
      let lastCall = 0;
      return (e) => {
        const now = Date.now();
        if (now - lastCall < 16) return; // ~60fps
        lastCall = now;
        updateSliderValue(e);
      };
    })(),
    [updateSliderValue]
  );

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e) => {
      setIsDragging(true);
      updateSliderValue(e);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [updateSliderValue]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      throttledUpdateSliderValue(e);
    },
    [isDragging, throttledUpdateSliderValue]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  // Set up event listeners
  useEffect(() => {
    // Clean up event listeners when component unmounts or dependencies change
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [handleMouseMove, handleMouseUp]);

  // Calculate progress percentage - memoize to prevent recalculation
  const progress = useMemo(() => {
    return ((sliderValue - min) / (max - min)) * 100;
  }, [sliderValue, min, max]);

  // Progress is now calculated using useMemo above

  // Create a custom component for the track and thumb to avoid passing props to DOM
  const Track = () => {
    // Check if this is a volume slider (no audioData or not playing)
    const isVolumeSlider = !isPlaying || !audioData || max === 100;

    // For volume slider, use a simple track without animations
    if (isVolumeSlider) {
      return (
        <div
          className={trackClassName || "bg-purple-500"}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: `${trackHeight}px`,
            width: `${progress}%`,
            transition: "width 0.1s ease-out",
          }}
        />
      );
    }

    // For seekbar with audio playing, show wave effect
    if (wavePoints.length > 0) {
      // Calculate SVG path for the wave effect
      const svgWidth = 100; // Use percentage for responsive width
      const svgHeight = 20; // Fixed height for the wave
      const pointSpacing = svgWidth / (wavePoints.length - 1);

      let pathD = `M 0,${svgHeight / 2}`;

      wavePoints.forEach((height, i) => {
        const x = i * pointSpacing;
        const y = svgHeight / 2 - height;
        pathD += ` L ${x},${y}`;
      });

      // Complete the path by going back to the bottom
      pathD += ` L ${svgWidth},${svgHeight / 2} L 0,${svgHeight / 2} Z`;

      return (
        <div
          className={trackClassName || ""}
          style={{
            position: "absolute",
            left: 0,
            top: -8, // Offset to center the wave
            height: "20px",
            width: `${progress}%`,
            overflow: "hidden",
          }}
        >
          <svg width="100%" height="20" preserveAspectRatio="none">
            <path
              d={pathD}
              fill="rgb(168, 85, 247)" // Purple-500 color
            />
          </svg>
        </div>
      );
    }

    // Fallback to simple track
    return (
      <div
        className={trackClassName || "bg-purple-500"}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: `${trackHeight}px`,
          width: `${progress}%`,
        }}
      />
    );
  };

  const Thumb = () => {
    // Check if this is a volume slider
    const isVolumeSlider = max === 100;

    return (
      <div
        className={`absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full opacity-0 hover:opacity-100 transition-opacity ${
          isDragging ? "opacity-100" : ""
        } ${thumbClassName || "bg-white"}`}
        style={{
          left: `calc(${progress}% - 6px)`,
          // Only apply glow effect for seekbar, not volume slider
          boxShadow:
            isPlaying && !isVolumeSlider
              ? "0 0 10px rgba(168, 85, 247, 0.8)"
              : "none",
        }}
      />
    );
  };

  return (
    <div
      ref={sliderRef}
      className={`relative h-1 bg-gray-600 rounded-full overflow-hidden ${className}`}
      style={{ height: `${Math.max(4, trackHeight)}px` }}
      onMouseDown={handleMouseDown}
      {...props}
    >
      <Track />
      <Thumb />
    </div>
  );
};
