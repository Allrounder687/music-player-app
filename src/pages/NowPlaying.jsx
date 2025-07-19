import React from "react";
import { useMusic } from "../store/MusicContext";
import { Controls } from "../components/Controls";
import { FaHeart, FaRegHeart, FaEllipsisH, FaMusic } from "react-icons/fa";

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
  } = useMusic();

  // No need for audio element references or effects as they're handled by AudioPlayer component

  // If no track is selected, show a list of tracks
  if (!currentTrack) {
    return (
      <div className="p-4 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">All Tracks</h1>
            <p className="text-gray-400">{tracks.length} tracks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tracks.map((track) => (
            <div
              key={track.id}
              onClick={() => playTrack(track)}
              className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors cursor-pointer group"
            >
              <div className="relative">
                {track.imageUrl ? (
                  <img
                    src={track.imageUrl}
                    alt={track.title}
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-700 flex items-center justify-center">
                    <FaMusic className="text-4xl text-gray-500" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all">
                    <button className="bg-white text-black rounded-full p-3">
                      <FaMusic className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium truncate">{track.title}</h3>
                <p className="text-sm text-gray-400 truncate">{track.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row p-4 overflow-hidden">
        {/* Album Art */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mb-4 md:mb-0 md:mr-6">
          <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden shadow-lg">
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
          </div>
        </div>

        {/* Track Info */}
        <div className="flex-1 overflow-y-auto">
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-1">
              {currentTrack?.title || "No track selected"}
            </h1>
            <h2 className="text-lg text-gray-400 mb-4">
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
              <button className="text-xl text-gray-400 hover:text-white transition-colors">
                <FaEllipsisH />
              </button>
            </div>

            {/* Album info */}
            <div className="mt-4">
              <h3 className="text-base font-semibold mb-2">Album</h3>
              <p className="text-gray-400">
                {currentTrack?.album || "Unknown Album"}
              </p>
            </div>

            {/* Lyrics placeholder */}
            <div className="mt-6">
              <h3 className="text-base font-semibold mb-2">Lyrics</h3>
              <div className="bg-gray-800 rounded-lg p-4 max-h-48 overflow-y-auto">
                <p className="text-gray-400 italic">
                  No lyrics available for this track.
                </p>
              </div>
            </div>
          </div>
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
