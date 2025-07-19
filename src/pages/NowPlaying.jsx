import React, { useState } from "react";
import { useMusic } from "../store/MusicContext";
import { Controls } from "../components/Controls";
import { FaHeart, FaRegHeart, FaEllipsisH, FaMusic } from "react-icons/fa";
import { formatTime } from "../utils/audioUtils";

export const NowPlaying = () => {
  const {
    tracks,
    currentTrack,
    isPlaying,
    volume,
    playlists,
    currentTime,
    togglePlayback,
    nextTrack,
    prevTrack,
    setVolume,
    setCurrentTime,
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
      {/* Custom audio player UI */}
      <div className="w-full mb-4 p-4 bg-gray-800 rounded-lg">
        <div className="flex flex-col">
          {/* Track info */}
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-gray-700 rounded-md flex items-center justify-center mr-3">
              <FaMusic className="text-gray-400" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-white">{currentTrack.title}</div>
              <div className="text-sm text-gray-400">{currentTrack.artist}</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4 mb-3">
            <button
              onClick={prevTrack}
              className="text-gray-300 hover:text-white p-2"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"></path>
              </svg>
            </button>

            <button
              onClick={togglePlayback}
              className="bg-white text-black rounded-full h-10 w-10 flex items-center justify-center hover:bg-gray-200"
            >
              {isPlaying ? (
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 ml-1"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z"></path>
                </svg>
              )}
            </button>

            <button
              onClick={nextTrack}
              className="text-gray-300 hover:text-white p-2"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"></path>
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-white"
                style={{
                  width: `${
                    (currentTime / (currentTrack?.duration || 1)) * 100
                  }%`,
                }}
              ></div>
            </div>
            <span className="text-xs text-gray-400 w-10">
              {formatTime(currentTrack?.duration || 0)}
            </span>
          </div>
        </div>
      </div>

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
