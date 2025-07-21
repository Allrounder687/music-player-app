import React from "react";
import { useMusic } from "../store/MusicContext";
import { FaMusic, FaPlay, FaPlus, FaFireAlt } from "react-icons/fa";
import { formatTime } from "../utils/audioUtils";

export const MostPlayed = () => {
  const { tracks, playTrack, addToQueue } = useMusic();

  // Sort tracks by play count (most played first)
  // Note: We're assuming tracks have a playCount property
  const mostPlayedTracks = [...tracks]
    .filter((track) => track.playCount && track.playCount > 0)
    .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
    .slice(0, 20); // Show only the top 20 tracks

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
            Most Played
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Your favorite tracks based on play count
          </p>
        </div>
      </div>

      {mostPlayedTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FaFireAlt
            className="text-5xl mb-4"
            style={{ color: "var(--text-muted)" }}
          />
          <h3
            className="text-xl font-medium mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            No play history yet
          </h3>
          <p
            className="text-center max-w-md"
            style={{ color: "var(--text-muted)" }}
          >
            Start playing some music to build your most played list.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mostPlayedTracks.map((track, index) => (
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

                {/* Play count badge */}
                <div
                  className="absolute bottom-2 left-2 px-2 py-1 rounded text-xs flex items-center"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.7)",
                    color: "white",
                  }}
                >
                  <FaPlay className="mr-1" size={10} />
                  {track.playCount || 0} plays
                </div>

                {/* Ranking badge for top 3 */}
                {index < 3 && (
                  <div
                    className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor:
                        index === 0
                          ? "#FFD700"
                          : index === 1
                          ? "#C0C0C0"
                          : "#CD7F32",
                      color: "#000",
                    }}
                  >
                    {index + 1}
                  </div>
                )}
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
