import React, { useState, useRef, useEffect, useCallback } from "react";

export const Slider = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className = "",
  thumbClassName,
  trackClassName,
  ...props
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);
  const [sliderValue, setSliderValue] = useState(value);

  // Update internal value when prop changes
  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  // Update slider value based on mouse position
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
      updateSliderValue(e);
    },
    [isDragging, updateSliderValue]
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
    };
  }, [handleMouseMove, handleMouseUp]);

  const progress = ((sliderValue - min) / (max - min)) * 100;

  return (
    <div
      ref={sliderRef}
      className={`relative h-1 bg-gray-600 rounded-full overflow-hidden ${className}`}
      onMouseDown={handleMouseDown}
      {...props}
    >
      <div
        className={`absolute left-0 top-0 h-full bg-purple-500 ${
          trackClassName || ""
        }`}
        style={{ width: `${progress}%` }}
      />
      <div
        className={`absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white opacity-0 hover:opacity-100 transition-opacity ${
          isDragging ? "opacity-100" : ""
        } ${thumbClassName || ""}`}
        style={{ left: `calc(${progress}% - 6px)` }}
      />
    </div>
  );
};
