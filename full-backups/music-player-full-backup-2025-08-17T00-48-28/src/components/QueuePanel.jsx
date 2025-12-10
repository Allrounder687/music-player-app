import React from "react";
import { useMusic } from "../store/MusicContext";
import { FaTimes, FaPlay, FaTrash } from "react-icons/fa";
import { formatTime } from "../utils/audioUtils";

export const QueuePanel = ({ onClose }) => {
  const {
    queue,
    currentTrack,
    currentTrackIndex,
    playTrack,
    removeFromQueue,
    clearQueue,
    isOnlineTrack,
  } = useMusic();

  const handlePlayTrack = (track) => {
    playTrack(track);
  };

  const handleRemoveFromQueue = (trackId) => {
    removeFromQueue(trackId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div
        className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
          <h2 className="text-xl font-bold text-white">Queue ({queue.length} tracks)</h2>
          <div className="flex items-center gap-2">
            {queue.length > 1 && (
              <button
                onClick={clearQueue}
                className="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--text-muted)",
                }}
                title="Clear queue"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-gray-700"
              style={{ color: "var(--text-muted)" }}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Queue List */}
        <div className="overflow-y-auto max-h-96">
          {queue.length === 0 ? (
            <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>
              <p>No tracks in queue</p>
            </div>
          ) : (
            <div className="p-2">
              {queue.map((track, index) => (
                <div
                  key={track.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    currentTrack?.id === track.id ? "bg-purple-900 bg-opacity-30" : "hover:bg-gray-700 hover:bg-opacity-50"
                  }`}
                  style={{
                    backgroundColor: currentTrack?.id === track.id ? "var(--accent-color-dark)" : "transparent",
                  }}
                  onClick={() => handlePlayTrack(track)}
                >
                  {/* Track Number / Play Indicator */}
                  <div className="w-8 text-center">
                    {currentTrack?.id === track.id ? (
                      <FaPlay className="text-sm" style={{ color: "var(--accent-color)" }} />
                    ) : (
                      <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Album Art */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={track.imageUrl || "/images/album-placeholder.svg"}
                      alt={track.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/images/album-placeholder.svg";
                      }}
                    />
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{track.title}</h4>
                    <p className="text-sm truncate" style={{ color: "var(--text-muted)" }}>
                      {track.artist || "Unknown Artist"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: isOnlineTrack(track) ? "rgba(34, 197, 94, 0.2)" : "rgba(107, 114, 128, 0.2)",
                          color: isOnlineTrack(track) ? "#22c55e" : "var(--text-muted)"
                        }}
                      >
                        {isOnlineTrack(track) ? "Online" : "Local"}
                      </span>
                      {isOnlineTrack(track) && track.sourceName && (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          • {track.sourceName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {formatTime(track.duration)}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromQueue(track.id);
                    }}
                    className="p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:bg-opacity-20"
                    style={{ color: "var(--text-muted)" }}
                    title="Remove from queue"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {queue.length > 0 && (
          <div className="p-4 border-t" style={{ borderColor: "var(--border-color)" }}>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Total duration: {formatTime(queue.reduce((total, track) => total + (track.duration || 0), 0))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};