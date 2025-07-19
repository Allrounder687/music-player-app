import React from "react";
import { useMusic } from "../store/MusicContext";
import { FaPlay, FaPause, FaTrash, FaMusic } from "react-icons/fa";

export const Queue = () => {
  const {
    queue,
    currentTrack,
    isPlaying,
    playTrack,
    removeFromQueue,
    currentTrackIndex,
  } = useMusic();

  const handlePlayTrack = (track) => {
    playTrack(track);
  };

  const handleRemoveFromQueue = (index) => {
    removeFromQueue(index);
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
          <h1 className="text-2xl font-bold">Queue</h1>
          <p className="text-gray-400">{queue.length} tracks</p>
        </div>
      </div>

      {queue.length > 0 ? (
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
              {queue.map((track, index) => (
                <tr
                  key={`${track.id}-${index}`}
                  className={`border-b border-gray-700 hover:bg-gray-700/50 transition-colors group ${
                    currentTrackIndex === index ? "bg-gray-700/30" : ""
                  } ${index === currentTrackIndex ? "border-l-4 border-purple-500" : ""}`}
                  onClick={() => handlePlayTrack(track)}
                >
                  <td className="p-3 text-gray-400">
                    <div className="flex items-center justify-center">
                      {currentTrackIndex === index && isPlaying ? (
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
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/album-placeholder.svg";
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <div className={`font-medium ${currentTrackIndex === index ? "text-purple-400" : ""}`}>
                          {track.title}
                        </div>
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromQueue(index);
                      }}
                      className="text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <FaMusic className="text-4xl mb-4" />
          <p className="text-lg">No tracks in queue</p>
          <p className="text-sm">Add tracks to the queue to start listening</p>
        </div>
      )}
    </div>
  );
};