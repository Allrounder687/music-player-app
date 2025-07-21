import React from "react";
import { useMusic } from "../store/MusicContext";
import { FaMusic, FaPlay, FaPlus } from "react-icons/fa";
import { formatTime } from "../utils/audioUtils";

export const RecentlyAdded = () => {
  const { tracks, playTrack, addToQueue } = useMusic();

  // Sort tracks by date added (newest first)
  const recentTracks = [...tracks]
    .sort((a, b) => {
      const dateA = new Date(a.addedAt || 0);
      const dateB = new Date(b.addedAt || 0);
      return dateB - dateA;
    })
    .slice(0, 20); // Show only the 20 most recent tracks

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="p-6 h-full overflow-y-auto"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Recently Added
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Your newest music additions
          </p>
        </div>
      </div>

      {recentTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FaMusic
            className="text-5xl mb-4"
            style={{ color: "var(--text-muted)" }}
          />
          <h3
            className="text-xl font-medium mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            No recently added tracks
          </h3>
          <p
            className="text-center max-w-md"
            style={{ color: "var(--text-muted)" }}
          >
            Add some music to your library to see it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recentTracks.map((track) => (
            <div
              key={track.id}
              className="rounded-lg overflow-hidden transition-colors cursor-pointer group"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <div className="relative" onClick={() => playTrack(track)}>
                {track.imageUrl ? (
                  <img
                    src={track.imageUrl}
                    alt={track.title}
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div
                    className="w-full aspect-square flex items-center justify-center"
                    style={{ backgroundColor: "var(--bg-tertiary)" }}
                  >
                    <FaMusic
                      className="text-4xl"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all">
                    <button
                      className="rounded-full p-3 text-white"
                      style={{ backgroundColor: "var(--accent-color)" }}
                    >
                      <FaPlay className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Add to queue button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToQueue(track);
                  }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
                  title="Add to queue"
                >
                  <FaPlus size={14} />
                </button>

                {/* Date added badge */}
                <div
                  className="absolute bottom-2 left-2 px-2 py-1 rounded text-xs"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.7)",
                    color: "white",
                  }}
                >
                  {formatDate(track.addedAt)}
                </div>
              </div>
              <div className="p-3">
                <h3
                  className="font-medium truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {track.title}
                </h3>
                <p
                  className="text-sm truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {track.artist || "Unknown Artist"} •{" "}
                  {formatTime(track.duration)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
