import React, { useState } from "react";
import { useMusic } from "../store/MusicContext";
import { useTheme } from "../store/ThemeContext";
import { Controls } from "../components/Controls";
import { FaHeart, FaRegHeart, FaEllipsisH, FaMusic, FaPlay, FaList, FaTimes } from "react-icons/fa";
import { formatTime } from "../utils/audioUtils";

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
    queue,
    currentTrackIndex,
    audioData,
  } = useMusic();

  const { theme } = useTheme();
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  // If no track is selected, show a welcome screen with track suggestions
  if (!currentTrack) {
    return (
      <div className={`p-6 h-full overflow-y-auto bg-${theme.colors.background.main}`}>
        <div className="max-w-6xl mx-auto">
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <div className={`w-24 h-24 mx-auto mb-6 bg-${theme.colors.primary.main} rounded-full flex items-center justify-center`}>
              <FaMusic className="text-4xl text-white" />
            </div>
            <h1 className={`text-4xl font-bold text-${theme.colors.text.primary} mb-4`}>
              Welcome to Your Music
            </h1>
            <p className={`text-lg text-${theme.colors.text.muted} max-w-2xl mx-auto`}>
              Discover, organize, and enjoy your music collection with our modern player.
              Start by selecting a track from your library.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className={`bg-${theme.colors.background.secondary} rounded-lg p-6 text-center`}>
              <h3 className={`text-2xl font-bold text-${theme.colors.primary.main} mb-2`}>
                {tracks.length}
              </h3>
              <p className={`text-${theme.colors.text.muted}`}>Total Tracks</p>
            </div>
            <div className={`bg-${theme.colors.background.secondary} rounded-lg p-6 text-center`}>
              <h3 className={`text-2xl font-bold text-${theme.colors.primary.main} mb-2`}>
                {playlists.favorites?.length || 0}
              </h3>
              <p className={`text-${theme.colors.text.muted}`}>Favorite Songs</p>
            </div>
            <div className={`bg-${theme.colors.background.secondary} rounded-lg p-6 text-center`}>
              <h3 className={`text-2xl font-bold text-${theme.colors.primary.main} mb-2`}>
                {Object.keys(playlists.custom || {}).length}
              </h3>
              <p className={`text-${theme.colors.text.muted}`}>Playlists</p>
            </div>
          </div>

          {/* Recent Tracks */}
          <div className="mb-8">
            <h2 className={`text-2xl font-bold text-${theme.colors.text.primary} mb-6`}>
              Your Music Collection
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tracks.slice(0, 8).map((track) => (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={`bg-${theme.colors.background.secondary} rounded-lg overflow-hidden hover:bg-${theme.colors.background.tertiary} transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md`}
                >
                  <div className="relative">
                    {track.imageUrl ? (
                      <img
                        src={track.imageUrl}
                        alt={track.title}
                        className="w-full aspect-square object-cover"
                      />
                    ) : (
                      <div className={`w-full aspect-square bg-${theme.colors.background.main} flex items-center justify-center`}>
                        <FaMusic className={`text-4xl text-${theme.colors.text.muted}`} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all">
                        <button className={`bg-${theme.colors.primary.main} text-white rounded-full p-3 shadow-lg`}>
                          <FaPlay className="h-6 w-6 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className={`font-semibold truncate text-${theme.colors.text.primary}`}>
                      {track.title}
                    </h3>
                    <p className={`text-sm text-${theme.colors.text.muted} truncate`}>
                      {track.artist || "Unknown Artist"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col bg-${theme.colors.background.main}`}>
      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Album Art and Info */}
        <div className="w-full lg:w-1/2 flex flex-col p-6">
          {/* Album Art */}
          <div className="flex-1 flex items-center justify-center mb-6">
            <div className="relative max-w-md w-full aspect-square">
              <div className={`w-full h-full rounded-lg overflow-hidden shadow-2xl bg-${theme.colors.background.secondary}`}>
                {currentTrack?.imageUrl ? (
                  <img
                    src={currentTrack.imageUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-${theme.colors.primary.main} to-${theme.colors.primary.dark}`}>
                    <FaMusic className="text-6xl text-white opacity-50" />
                  </div>
                )}
                
                {/* Audio Visualizer Overlay */}
                {isPlaying && audioData && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-black bg-opacity-30 flex items-end justify-center space-x-1 p-2">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className={`bg-${theme.colors.primary.main} opacity-70`}
                        style={{
                          width: '3px',
                          height: `${Math.random() * 40 + 5}px`,
                          transition: 'height 0.1s',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(currentTrack.id)}
                className={`absolute top-4 right-4 w-12 h-12 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all flex items-center justify-center ${
                  playlists.favorites.includes(currentTrack.id) ? "text-red-500" : ""
                }`}
              >
                {playlists.favorites.includes(currentTrack.id) ? (
                  <FaHeart className="text-xl" />
                ) : (
                  <FaRegHeart className="text-xl" />
                )}
              </button>
            </div>
          </div>

          {/* Track Info */}
          <div className="text-center lg:text-left">
            <h1 className={`text-3xl font-bold text-${theme.colors.text.primary} mb-2 truncate`}>
              {currentTrack.title}
            </h1>
            <h2 className={`text-xl text-${theme.colors.text.muted} mb-4 truncate`}>
              {currentTrack.artist || "Unknown Artist"}
            </h2>
            <div className={`text-sm text-${theme.colors.text.muted} space-y-1`}>
              <p><span className="font-medium">Album:</span> {currentTrack.album || "Unknown Album"}</p>
              <p><span className="font-medium">Duration:</span> {formatTime(currentTrack.duration)}</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Queue and Controls */}
        <div className="w-full lg:w-1/2 flex flex-col border-l border-gray-700">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setShowQueue(true)}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                showQueue 
                  ? `bg-${theme.colors.background.secondary} text-${theme.colors.text.primary}` 
                  : `text-${theme.colors.text.muted} hover:text-${theme.colors.text.primary}`
              }`}
            >
              <FaList className="inline mr-2" />
              Queue ({queue.length})
            </button>
            <button
              onClick={() => setShowQueue(false)}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                !showQueue 
                  ? `bg-${theme.colors.background.secondary} text-${theme.colors.text.primary}` 
                  : `text-${theme.colors.text.muted} hover:text-${theme.colors.text.primary}`
              }`}
            >
              Lyrics
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {showQueue ? (
              /* Queue View */
              <div className="space-y-2">
                {queue.map((track, index) => (
                  <div
                    key={`${track.id}-${index}`}
                    onClick={() => playTrack(track)}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      index === currentTrackIndex
                        ? `bg-${theme.colors.primary.main} bg-opacity-20 border border-${theme.colors.primary.main}`
                        : `hover:bg-${theme.colors.background.secondary}`
                    }`}
                  >
                    <div className="w-8 text-center text-sm text-gray-400 mr-3">
                      {index === currentTrackIndex && isPlaying ? (
                        <FaPlay className={`text-${theme.colors.primary.main}`} />
                      ) : (
                        index + 1
                      )}
                    </div>
                    
                    <div className="w-10 h-10 rounded mr-3 flex-shrink-0">
                      {track.imageUrl ? (
                        <img
                          src={track.imageUrl}
                          alt={track.title}
                          className="w-full h-full rounded object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-${theme.colors.background.main} rounded flex items-center justify-center`}>
                          <FaMusic className={`text-${theme.colors.text.muted} text-sm`} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${
                        index === currentTrackIndex 
                          ? `text-${theme.colors.primary.main}` 
                          : `text-${theme.colors.text.primary}`
                      }`}>
                        {track.title}
                      </p>
                      <p className={`text-sm text-${theme.colors.text.muted} truncate`}>
                        {track.artist || "Unknown Artist"}
                      </p>
                    </div>
                    
                    <div className={`text-sm text-${theme.colors.text.muted} ml-2`}>
                      {formatTime(track.duration)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Lyrics View */
              <div className={`bg-${theme.colors.background.secondary} rounded-lg p-6 h-full flex items-center justify-center`}>
                <div className="text-center">
                  <FaMusic className={`text-4xl text-${theme.colors.text.muted} mb-4 mx-auto`} />
                  <p className={`text-${theme.colors.text.muted} italic`}>
                    Lyrics not available for this track
                  </p>
                  <p className={`text-sm text-${theme.colors.text.muted} mt-2`}>
                    Enjoy the music! 🎵
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Player Controls */}
      <div className={`border-t border-${theme.colors.border} bg-${theme.colors.background.secondary}`}>
        <Controls
          isPlaying={isPlaying}
          onPlayPause={togglePlayback}
          onNext={nextTrack}
          onPrevious={prevTrack}
          onVolumeChange={setVolume}
        />
      </div>
    </div>
  );
};
