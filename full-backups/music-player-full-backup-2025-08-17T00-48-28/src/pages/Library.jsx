import React, { useState } from "react";
import { useMusic } from "../store/MusicContext";
import { useTheme } from "../store/ThemeContext";
import { FaMusic } from "react-icons/fa";

export const Library = () => {
  const { tracks, onlineTracks, getAllTracks } = useMusic();
  const { theme } = useTheme();
  const [showOnlineTracks, setShowOnlineTracks] = useState(true);
  
  const displayTracks = showOnlineTracks ? [...tracks, ...onlineTracks] : tracks;

  return (
    <div className="p-6 h-full overflow-y-auto" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Library</h1>
          <p style={{ color: "var(--text-muted)" }}>
            {displayTracks.length} tracks ({tracks.length} local, {onlineTracks.length} online)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOnlineTracks(!showOnlineTracks)}
            className="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: showOnlineTracks ? "var(--accent-color)" : "var(--bg-tertiary)",
              color: showOnlineTracks ? "white" : "var(--text-muted)",
            }}
          >
            {showOnlineTracks ? "Hide Online Tracks" : "Show Online Tracks"}
          </button>
        </div>
      </div>

      {displayTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FaMusic className="text-5xl mb-4" style={{ color: "var(--text-muted)" }} />
          <h3 className="text-xl font-medium mb-2 text-white">Your library is empty</h3>
          <p className="text-center max-w-md" style={{ color: "var(--text-muted)" }}>
            Import music to start building your library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayTracks.map((track) => (
            <div
              key={track.id}
              className="rounded-lg overflow-hidden transition-colors cursor-pointer"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <div className="p-3">
                <h3 className="font-medium truncate text-white">{track.title}</h3>
                <p className="text-sm truncate" style={{ color: "var(--text-muted)" }}>
                  {track.artist || "Unknown Artist"}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Source: {track.isOnline ? "Online" : "Local"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
