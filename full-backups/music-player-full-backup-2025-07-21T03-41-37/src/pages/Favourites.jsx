import React from "react";
import { useMusic } from "../store/MusicContext";
import { FaPlay, FaPause, FaHeart, FaEllipsisH } from "react-icons/fa";

export const Favourites = () => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    toggleFavorite,
    getFavoriteTracks,
    setQueue,
  } = useMusic();

  const favoriteTracks = getFavoriteTracks();

  const handlePlayTrack = (track) => {
    playTrack(track);
  };

  const handlePlayAll = () => {
    if (favoriteTracks.length > 0) {
      setQueue(favoriteTracks);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Favourites</h1>
          <p className="text-gray-400">{favoriteTracks.length} tracks</p>
        </div>
        <button
          onClick={handlePlayAll}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
          disabled={favoriteTracks.length === 0}
        >
          Play All
        </button>
      </div>

      {favoriteTracks.length > 0 ? (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                <th className="w-12 p-3">#</th>
                <th className="p-3">Title</th>
                <th className="p-3">Album</th>
                <th className="p-3 text-right">Duration</th>
                <th className="w-12 p-3"></th>
              </tr>
            </thead>
            <tbody>
              {favoriteTracks.map((track, index) => (
                <tr
                  key={track.id}
                  className={`border-b border-gray-700 hover:bg-gray-700/50 transition-colors group ${
                    currentTrack?.id === track.id ? "bg-gray-700/30" : ""
                  }`}
                  onClick={() => handlePlayTrack(track)}
                >
                  <td className="p-3 text-gray-400">
                    <div className="flex items-center justify-center">
                      {currentTrack?.id === track.id && isPlaying ? (
                        <FaPause className="text-purple-500" />
                      ) : (
                        <>
                          <span className="group-hover:hidden">
                            {index + 1}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayTrack(track);
                            }}
                            className="hidden group-hover:block text-white"
                          >
                            <FaPlay />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-700 rounded mr-3 overflow-hidden">
                        {track.imageUrl && (
                          <img
                            src={track.imageUrl}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{track.title}</div>
                        <div className="text-sm text-gray-400">
                          {track.artist}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-gray-400">{track.album}</td>
                  <td className="p-3 text-right text-gray-400">
                    {formatTime(track.duration)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(track.id);
                        }}
                        className="text-pink-500 hover:text-pink-400 transition-colors"
                      >
                        <FaHeart />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <FaEllipsisH />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <FaHeart className="text-4xl mb-4" />
          <p className="text-lg">Your favorite tracks will appear here</p>
          <p className="text-sm">Like tracks to add them to your favorites</p>
        </div>
      )}
    </div>
  );
};
