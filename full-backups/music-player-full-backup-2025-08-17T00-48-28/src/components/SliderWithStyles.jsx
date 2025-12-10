import React from "react";
import { Slider } from "./Slider";

/**
 * A wrapper around the Slider component that handles custom styling
 * This component extracts the custom styling props so they don't get passed to the DOM
 */
export const SliderWithStyles = ({
  value,
  min,
  max,
  step,
  onChange,
  className,
  thumbClassName,
  trackClassName,
  ...props
}) => {
  // Create custom styles for the track and thumb
  const customStyles = {
    track: trackClassName,
    thumb: thumbClassName,
  };

  return (
    <Slider
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={onChange}
      className={className}
      customStyles={customStyles}
      {...props}
    />
  );
};
