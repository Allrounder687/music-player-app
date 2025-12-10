import React from "react";
import { useTheme } from "../store/ThemeContext";

export const GlassCard = ({
  children,
  className = "",
  hover = false,
  onClick,
  ...props
}) => {
  const { theme, currentTheme } = useTheme();

  const isGlassmorphism = currentTheme === 'glassmorphism';

  const baseClasses = `
    ${isGlassmorphism ? 'backdrop-blur-xl bg-white/10' : `bg-${theme.colors.background.glass}`}
    border border-${theme.colors.border} 
    rounded-xl 
    shadow-lg shadow-${theme.colors.shadow}
    transition-all duration-300 ease-in-out
    ${isGlassmorphism ? 'backdrop-saturate-150' : ''}
  `;

  const hoverClasses = hover ? `
    hover:shadow-xl hover:shadow-${theme.colors.shadow}
    hover:scale-[1.02] 
    hover:border-${theme.colors.primary.main}
    ${isGlassmorphism ? 'hover:bg-white/15' : ''}
    cursor-pointer
  ` : "";

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export const GlassPanel = ({
  children,
  className = "",
  padding = "p-6",
  ...props
}) => {
  const { theme, currentTheme } = useTheme();

  const isGlassmorphism = currentTheme === 'glassmorphism';

  return (
    <div
      className={`
        backdrop-blur-xl 
        ${isGlassmorphism ? 'bg-white/5 backdrop-saturate-200' : `bg-${theme.colors.background.glass}`}
        border border-${theme.colors.border}
        rounded-2xl 
        shadow-2xl shadow-${theme.colors.shadow}
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};