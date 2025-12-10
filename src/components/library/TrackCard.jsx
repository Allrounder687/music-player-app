import React, { memo, useCallback } from "react";
import { useTheme } from "../../store/ThemeContext";
import { GlassCard } from "../GlassCard";

export const TrackCard = memo(({ 
  track, 
  isSelected, 
  onSelect, 
  onPlay, 
  onAddToQueue, 
  onToggleFavorite, 
  isFavorite 
}) => {
  const { theme } = useTheme();

  const handlePlay = useCallback((e) => {
    e.stopPropagation();
    onPlay();
  }, [onPlay]);

  const handleAddToQueue = useCallback((e) => {
    e.stopPropagation();
    onAddToQueue();
  }, [onAddToQueue]);

  const handleToggleFavorite = useCallback((e) => {
    e.stopPropagation();
    onToggleFavorite();
  }, [onToggleFavorite]);

  const handleSelect = useCallback((e) => {
    e.stopPropagation();
    onSelect();
  }, [onSelect]);

  return (
    <GlassCard 
      className={`
        p-4 cursor-pointer transition-all duration-300 group
        ${isSelected ? `ring-2 ring-${theme.colors.primary.main}` : ''}
      `}
      hover
    >
      <div className="relative">
        {/* Selection Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelect}
          className="absolute top-2 left-2 z-10"
          aria-label={`Select ${track.title}`}
        />

        {/* Album Art */}
        <div className="relative mb-4">
          <img
            src={track.imageUrl || "/images/album-placeholder.svg"}
            alt={`${track.album} album cover`}
            className="w-full aspect-square object-cover rounded-lg"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
            <button
              onClick={handlePlay}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-200"
              aria-label={`Play ${track.title}`}
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Track Info */}
        <div className="space-y-1">
          <h3 className={`font-semibold text-${theme.colors.text.primary} truncate`}>
            {track.title}
          </h3>
          <p className={`text-sm text-${theme.colors.text.secondary} truncate`}>
            {track.artist}
          </p>
          <p className={`text-xs text-${theme.colors.text.muted} truncate`}>
            {track.album}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={handleToggleFavorite}
            className={`
              p-1 rounded transition-all duration-200
              ${isFavorite 
                ? `text-red-500 hover:text-red-600` 
                : `text-${theme.colors.text.muted} hover:text-red-500`
              }
            `}
            aria-label={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}
          >
            <svg className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <button
            onClick={handleAddToQueue}
            className={`
              p-1 rounded transition-all duration-200
              text-${theme.colors.text.muted}
              hover:text-${theme.colors.text.primary}
            `}
            title="Add to Queue"
            aria-label={`Add ${track.title} to queue`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
          </button>
        </div>
      </div>
    </GlassCard>
  );
});