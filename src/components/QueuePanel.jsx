import React from "react";
import { FaPlay, FaTimes, FaArrowUp, FaTrash } from "react-icons/fa";
import { useMusic } from "../store/MusicContext";
import { formatTime } from "../utils/audioUtils";

/**
 * QueuePanel component - Displays and manages the current playback queue
 */
export const QueuePanel = ({ onClose }) => {
  const {
    queue,
    currentTrack,
    currentTrackIndex,
    playTrack,
    removeFromQueue,
    clearQueue,
    addToQueue,
  } = useMusic();

  // Move a track to play next (right after current track)
  const moveToNext = (track) => {
    // First remove the track from its current position
    removeFromQueue(track.id);
    // Then add it to play next
    setTimeout(() => {
      addToQueue(track, true);
    }, 10);
  };

  // Handle removing a track from the queue
  const handleRemoveFromQueue = (trackId, e) => {
    e.stopPropagation();
    removeFromQueue(trackId);
  };

  // Handle clearing the entire queue
  const handleClearQueue = () => {
    if (confirm("Are you sure you want to clear the queue?")) {
      clearQueue();
    }
  };

  return (
    <div
      className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] flex flex-col"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-gray-700"
        style={{ borderColor: "var(--border-color)" }}
      >
        <h2 className="text-lg font-semibold text-white">Current Queue</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearQueue}
            className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"
            title="Clear queue"
          >
            <FaTrash size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Queue list */}
      <div className="flex-1 overflow-y-auto p-2">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-gray-400">
            <p>Queue is empty</p>
            <p className="text-sm mt-2">
              Add songs to your queue to get started
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {queue.map((track, index) => {
              const isCurrentTrack =
                currentTrack && track.id === currentTrack.id;
              const isUpcoming =
                currentTrackIndex !== -1 && index > currentTrackIndex;
              const isPrevious =
                currentTrackIndex !== -1 && index < currentTrackIndex;

              return (
                <div
                  key={`${track.id}-${index}`}
                  className={`flex items-center p-2 rounded-md ${
                    isCurrentTrack
                      ? "bg-purple-900 bg-opacity-40"
                      : "hover:bg-gray-700"
                  }`}
                  style={{
                    backgroundColor: isCurrentTrack
                      ? "var(--accent-color-dark)"
                      : "transparent",
                    opacity: isCurrentTrack ? 1 : isPrevious ? 0.6 : 1,
                  }}
                >
                  {/* Track number/status */}
                  <div className="w-8 flex-shrink-0 flex items-center justify-center">
                    {isCurrentTrack ? (
                      <div
                        className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"
                        style={{ backgroundColor: "var(--accent-color)" }}
                      ></div>
                    ) : (
                      <span className="text-sm text-gray-400">{index + 1}</span>
                    )}
                  </div>

                  {/* Track info */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => playTrack(track)}
                  >
                    <div className="truncate font-medium text-white">
                      {track.title}
                    </div>
                    <div className="truncate text-sm text-gray-400">
                      {track.artist || "Unknown Artist"} •{" "}
                      {formatTime(track.duration)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    {!isCurrentTrack && isUpcoming && (
                      <button
                        onClick={() => moveToNext(track)}
                        className="p-1.5 rounded-full hover:bg-gray-600 text-gray-400 hover:text-white"
                        title="Play next"
                      >
                        <FaArrowUp size={12} />
                      </button>
                    )}
                    {!isCurrentTrack && (
                      <button
                        onClick={(e) => handleRemoveFromQueue(track.id, e)}
                        className="p-1.5 rounded-full hover:bg-gray-600 text-gray-400 hover:text-white"
                        title="Remove from queue"
                      >
                        <FaTimes size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
