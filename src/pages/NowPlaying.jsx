import React, { useState } from "react";
import { useMusic } from "../store/MusicContext";
import { Controls } from "../components/Controls";
import { BeatVisualizer } from "../components/BeatVisualizer";
import { QueuePanel } from "../components/QueuePanel";
import {
  FaHeart,
  FaRegHeart,
  FaEllipsisH,
  FaMusic,
  FaChartBar,
  FaList,
  FaPlus,
} from "react-icons/fa";

export const NowPlaying = () => {
  const {
    tracks,
    currentTrack,
    isPlaying,
    playlists,
    togglePlayback,
    nextTrack,
    prevTrack,
    setVolume,
    toggleFavorite,
    playTrack,
    addToQueue,
    queue,
  } = useMusic();

  const [showVisualizer, setShowVisualizer] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  // If no track is selected, show a list of tracks
  if (!currentTrack) {
    return (
      <div
        className="p-4 h-full overflow-y-auto"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">All Tracks</h1>
            <p style={{ color: "var(--text-muted)" }}>{tracks.length} tracks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tracks.map((track) => (
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
              </div>
              <div className="p-3">
                <h3 className="font-medium truncate text-white">
                  {track.title}
                </h3>
                <p
                  className="text-sm truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {track.artist || "Unknown Artist"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row p-4 overflow-hidden">
        {/* Album Art or Visualizer */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mb-4 md:mb-0 md:mr-6">
          <div
            className="aspect-square rounded-lg overflow-hidden shadow-lg relative"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          >
            {showVisualizer && isPlaying ? (
              <BeatVisualizer className="w-full h-full" />
            ) : (
              <>
                {currentTrack?.imageUrl ? (
                  <img
                    src={currentTrack.imageUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-gray-800">
                    <span className="text-3xl text-gray-400">
                      {currentTrack?.title?.[0] || "♫"}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Toggle visualizer button */}
            <button
              onClick={() => setShowVisualizer(!showVisualizer)}
              className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              title={showVisualizer ? "Show album art" : "Show visualizer"}
            >
              <FaChartBar
                className={showVisualizer ? "text-purple-400" : "text-white"}
                style={{
                  color: showVisualizer ? "var(--accent-color)" : "white",
                }}
              />
            </button>
          </div>
        </div>

        {/* Track Info and Queue */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1 text-white">
                {currentTrack?.title || "No track selected"}
              </h1>
              <h2
                className="text-lg mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                {currentTrack?.artist || "Unknown Artist"}
              </h2>

              <div className="flex items-center space-x-3 mb-4">
                <button
                  onClick={() =>
                    currentTrack?.id && toggleFavorite(currentTrack.id)
                  }
                  className="text-xl text-pink-500 hover:text-pink-400 transition-colors"
                >
                  {currentTrack?.id &&
                  playlists.favorites.includes(currentTrack.id) ? (
                    <FaHeart />
                  ) : (
                    <FaRegHeart />
                  )}
                </button>
                <button
                  className="text-xl hover:text-white transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  <FaEllipsisH />
                </button>
              </div>
            </div>

            {/* Queue toggle button */}
            <button
              onClick={() => setShowQueue(!showQueue)}
              className="p-2 rounded-md transition-colors flex items-center"
              style={{
                backgroundColor: showQueue
                  ? "var(--accent-color)"
                  : "transparent",
                color: showQueue ? "white" : "var(--text-muted)",
              }}
              title="Show queue"
            >
              <FaList className="mr-2" />
              <span>Queue ({queue.length})</span>
            </button>
          </div>

          {/* Queue panel */}
          {showQueue ? (
            <QueuePanel onClose={() => setShowQueue(false)} />
          ) : (
            <>
              {/* Album info */}
              <div className="mt-4">
                <h3 className="text-base font-semibold mb-2 text-white">
                  Album
                </h3>
                <p style={{ color: "var(--text-muted)" }}>
                  {currentTrack?.album || "Unknown Album"}
                </p>
              </div>

              {/* Lyrics placeholder */}
              <div className="mt-6">
                <h3 className="text-base font-semibold mb-2 text-white">
                  Lyrics
                </h3>
                <div
                  className="rounded-lg p-4 max-h-48 overflow-y-auto"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
                >
                  <p style={{ color: "var(--text-muted)" }} className="italic">
                    No lyrics available for this track.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Player Controls */}
      <Controls
        isPlaying={isPlaying}
        onPlayPause={togglePlayback}
        onNext={nextTrack}
        onPrevious={prevTrack}
        onVolumeChange={setVolume}
      />
    </div>
  );
};
