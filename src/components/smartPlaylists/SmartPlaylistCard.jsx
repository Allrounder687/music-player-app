import React, { memo } from "react";
import { useTheme } from "../../store/ThemeContext";
import { GlassCard } from "../GlassCard";
import { createButtonStyles } from "../../utils/styleUtils";

/**
 * SmartPlaylistCard component displays a smart playlist suggestion with play and save actions
 * @param {Object} suggestion - The playlist suggestion object
 * @param {Function} onPlay - Callback function to play the playlist
 * @param {Function} onSave - Callback function to save the playlist
 * @param {boolean} isPlayLoading - Loading state for play action
 * @param {boolean} isSaveLoading - Loading state for save action
 */
export const SmartPlaylistCard = memo(({ 
  suggestion, 
  onPlay, 
  onSave, 
  isPlayLoading = false,
  isSaveLoading = false 
}) => {
  const { theme } = useTheme();

  return (
    <GlassCard 
      className="p-6 hover:scale-[1.02] transition-all duration-300"
      hover
      role="article"
      aria-labelledby={`playlist-${suggestion.id}-title`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <span className="text-2xl mr-3" role="img" aria-label={suggestion.name}>
            {suggestion.icon}
          </span>
          <div>
            <h3 
              id={`playlist-${suggestion.id}-title`}
              className={`font-semibold text-${theme.colors.text.primary}`}
            >
              {suggestion.name}
            </h3>
            <p className={`text-sm text-${theme.colors.text.secondary} mt-1`}>
              {suggestion.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onPlay(suggestion)}
          disabled={isPlayLoading || isSaveLoading}
          className={`
            ${createButtonStyles(theme, 'primary')}
            flex-1 flex items-center justify-center gap-2
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-label={`Play ${suggestion.name} playlist`}
        >
          {isPlayLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Play
            </>
          )}
        </button>

        <button
          onClick={() => onSave(suggestion)}
          disabled={isPlayLoading || isSaveLoading}
          className={`
            ${createButtonStyles(theme, 'secondary')}
            flex items-center justify-center
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title="Save as Playlist"
          aria-label={`Save ${suggestion.name} as playlist`}
        >
          {isSaveLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </GlassCard>
  );
});

SmartPlaylistCard.displayName = 'SmartPlaylistCard';