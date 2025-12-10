import React from "react";
import { formatFileSize, formatDuration } from "../../utils/duplicateUtils";

export const TrackItem = React.memo(({ 
  track, 
  isKeep, 
  isRemove, 
  onCustomizeAction, 
  theme, 
  actionApplied 
}) => {
  return (
    <div
      className={`
        p-4 rounded-lg border transition-all duration-200
        ${isKeep 
          ? `border-green-500 bg-green-500/10` 
          : isRemove 
            ? `border-red-500 bg-red-500/10` 
            : `border-${theme.colors.border} bg-${theme.colors.background.secondary}`
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={track.imageUrl || "/images/album-placeholder.svg"}
            alt={`${track.album} album cover`}
            className="w-12 h-12 rounded object-cover"
            loading="lazy"
          />
          <div>
            <h5 className={`font-medium text-${theme.colors.text.primary}`}>
              {track.title}
            </h5>
            <p className={`text-sm text-${theme.colors.text.secondary}`}>
              {track.artist} • {track.album}
            </p>
            <div className={`text-xs text-${theme.colors.text.muted} mt-1`}>
              {formatDuration(track.duration)} • {formatFileSize(track.file?.size)}
              {track.bitrate && ` • ${track.bitrate}kbps`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isKeep && (
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
              Keep
            </span>
          )}
          {isRemove && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
              Remove
            </span>
          )}
          
          {!actionApplied && (
            <button
              onClick={() => onCustomizeAction(track.id)}
              className={`
                px-3 py-1 rounded-md text-xs font-medium transition-all duration-200
                ${isKeep
                  ? `bg-green-500 text-white`
                  : `bg-${theme.colors.background.tertiary} text-${theme.colors.text.secondary} hover:bg-${theme.colors.background.hover}`
                }
              `}
              aria-label={`${isKeep ? 'Currently keeping' : 'Keep'} ${track.title}`}
            >
              {isKeep ? 'Keeping' : 'Keep This'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

TrackItem.displayName = 'TrackItem';