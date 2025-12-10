import React, { useState, useEffect } from "react";
import { useTheme } from "../store/ThemeContext";
import { useMusic } from "../store/MusicContext";
import { GlassPanel } from "./GlassCard";
import { LyricsPanel } from "./LyricsPanel";
import { Equalizer } from "./Equalizer";
import { AudioAnalysisService } from "../store/AudioAnalysisService";

export const EnhancedNowPlaying = () => {
  const { theme } = useTheme();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    repeat,
    shuffle,
    togglePlayback,
    nextTrack,
    prevTrack,
    setCurrentTime,
    setVolume,
    toggleRepeat,
    toggleShuffle,
    toggleFavorite,
    playlists,
  } = useMusic();

  const [showLyrics, setShowLyrics] = useState(false);
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const isFavorite = currentTrack && playlists.favorites.includes(currentTrack.id);

  if (!currentTrack) {
    return (
      <GlassPanel className="p-8 text-center">
        <div className={`text-${theme.colors.text.muted} mb-4`}>
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 3a1 1 0 012 0v5.5a.5.5 0 001 0V4a1 1 0 112 0v4.5a.5.5 0 001 0V6a1 1 0 112 0v6a7 7 0 11-14 0V9a1 1 0 012 0v2.5a.5.5 0 001 0V4a1 1 0 012 0v4.5a.5.5 0 001 0V3z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className={`text-xl font-semibold text-${theme.colors.text.primary} mb-2`}>
          No track playing
        </h3>
        <p className={`text-${theme.colors.text.secondary}`}>
          Select a song to start listening
        </p>
      </GlassPanel>
    );
  }

  return (
    <>
      <GlassPanel className={`transition-all duration-500 ${isFullscreen ? 'fixed inset-4 z-40' : 'relative'}`}>
        <div className={`${isFullscreen ? 'h-full flex flex-col' : ''}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className={`text-xl font-bold text-${theme.colors.text.primary}`}>
              Now Playing
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLyrics(true)}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  bg-${theme.colors.background.secondary}
                  hover:bg-${theme.colors.background.hover}
                  text-${theme.colors.text.secondary}
                  hover:text-${theme.colors.text.primary}
                  border border-${theme.colors.border}
                `}
                title="Show Lyrics"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button
                onClick={() => setShowEqualizer(!showEqualizer)}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${showEqualizer 
                    ? `bg-${theme.colors.primary.main} text-white` 
                    : `bg-${theme.colors.background.secondary} text-${theme.colors.text.secondary} hover:bg-${theme.colors.background.hover} hover:text-${theme.colors.text.primary}`
                  }
                  border border-${theme.colors.border}
                `}
                title="Toggle Equalizer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 12a1 1 0 102 0V6a1 1 0 10-2 0v6zM10 4a1 1 0 10-2 0v12a1 1 0 102 0V4zM16 7a1 1 0 10-2 0v6a1 1 0 102 0V7z" />
                </svg>
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  bg-${theme.colors.background.secondary}
                  hover:bg-${theme.colors.background.hover}
                  text-${theme.colors.text.secondary}
                  hover:text-${theme.colors.text.primary}
                  border border-${theme.colors.border}
                `}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  {isFullscreen ? (
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12z" clipRule="evenodd" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className={`flex-1 ${isFullscreen ? 'flex items-center' : ''}`}>
            <div className={`${isFullscreen ? 'w-full max-w-4xl mx-auto' : ''} px-6`}>
              <div className={`grid ${isFullscreen ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'} gap-8 items-center`}>
                {/* Album Art */}
                <div className="flex justify-center">
                  <div className={`relative ${isFullscreen ? 'w-80 h-80' : 'w-64 h-64'} group`}>
                    <img
                      src={currentTrack.imageUrl || "/images/album-placeholder.svg"}
                      alt={currentTrack.album}
                      className={`
                        w-full h-full object-cover rounded-2xl shadow-2xl
                        transition-all duration-500
                        ${isPlaying ? 'animate-pulse-slow' : ''}
                      `}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
                    
                    {/* Floating Play Button */}
                    <button
                      onClick={togglePlayback}
                      className={`
                        absolute bottom-4 right-4 p-4 rounded-full
                        bg-${theme.colors.primary.main} hover:bg-${theme.colors.primary.dark}
                        text-white shadow-lg hover:shadow-xl
                        transform hover:scale-110 transition-all duration-200
                        opacity-0 group-hover:opacity-100
                      `}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        {isPlaying ? (
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Track Info and Controls */}
                <div className="space-y-6">
                  {/* Track Information */}
                  <div className="text-center md:text-left">
                    <h1 className={`text-2xl lg:text-3xl font-bold text-${theme.colors.text.primary} mb-2`}>
                      {currentTrack.title}
                    </h1>
                    <p className={`text-lg text-${theme.colors.text.secondary} mb-1`}>
                      {currentTrack.artist}
                    </p>
                    <p className={`text-${theme.colors.text.muted}`}>
                      {currentTrack.album}
                      {currentTrack.year && ` • ${currentTrack.year}`}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div
                      className={`
                        h-2 bg-${theme.colors.background.tertiary} rounded-full cursor-pointer
                        hover:h-3 transition-all duration-200
                      `}
                      onClick={handleSeek}
                    >
                      <div
                        className={`
                          h-full bg-${theme.colors.primary.main} rounded-full
                          transition-all duration-100 ease-out
                          relative
                        `}
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                      >
                        <div className={`
                          absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2
                          w-4 h-4 bg-${theme.colors.primary.main} rounded-full
                          opacity-0 hover:opacity-100 transition-opacity duration-200
                          shadow-lg
                        `} />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={`text-${theme.colors.text.secondary}`}>
                        {formatTime(currentTime)}
                      </span>
                      <span className={`text-${theme.colors.text.secondary}`}>
                        {formatTime(duration)}
                      </span>
                    </div>
                  </div>

                  {/* Main Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={toggleShuffle}
                      className={`
                        p-2 rounded-lg transition-all duration-200
                        ${shuffle 
                          ? `bg-${theme.colors.primary.main} text-white` 
                          : `text-${theme.colors.text.secondary} hover:text-${theme.colors.text.primary}`
                        }
                      `}
                      title="Shuffle"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                    </button>

                    <button
                      onClick={prevTrack}
                      className={`
                        p-3 rounded-full transition-all duration-200
                        text-${theme.colors.text.secondary}
                        hover:text-${theme.colors.text.primary}
                        hover:bg-${theme.colors.background.hover}
                      `}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                      </svg>
                    </button>

                    <button
                      onClick={togglePlayback}
                      className={`
                        p-4 rounded-full transition-all duration-200 transform hover:scale-110
                        bg-${theme.colors.primary.main}
                        hover:bg-${theme.colors.primary.dark}
                        text-white shadow-lg hover:shadow-xl
                      `}
                    >
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        {isPlaying ? (
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        )}
                      </svg>
                    </button>

                    <button
                      onClick={nextTrack}
                      className={`
                        p-3 rounded-full transition-all duration-200
                        text-${theme.colors.text.secondary}
                        hover:text-${theme.colors.text.primary}
                        hover:bg-${theme.colors.background.hover}
                      `}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                      </svg>
                    </button>

                    <button
                      onClick={toggleRepeat}
                      className={`
                        p-2 rounded-lg transition-all duration-200
                        ${repeat 
                          ? `bg-${theme.colors.primary.main} text-white` 
                          : `text-${theme.colors.text.secondary} hover:text-${theme.colors.text.primary}`
                        }
                      `}
                      title="Repeat"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Secondary Controls */}
                  <div className="flex items-center justify-between">
                    {/* Favorite */}
                    <button
                      onClick={() => toggleFavorite(currentTrack.id)}
                      className={`
                        p-2 rounded-lg transition-all duration-200
                        ${isFavorite 
                          ? `text-red-500 hover:text-red-600` 
                          : `text-${theme.colors.text.secondary} hover:text-red-500`
                        }
                      `}
                      title="Toggle Favorite"
                    >
                      <svg className="w-6 h-6" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    {/* Volume Control */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                        className={`
                          p-2 rounded-lg transition-all duration-200
                          text-${theme.colors.text.secondary}
                          hover:text-${theme.colors.text.primary}
                        `}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          {volume === 0 ? (
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.828 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.828l3.555-3.793A1 1 0 019.383 3.076zM12 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          ) : volume < 0.5 ? (
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.828 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.828l3.555-3.793A1 1 0 019.383 3.076zM12 8a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.828 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.828l3.555-3.793A1 1 0 019.383 3.076zM12 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          )}
                        </svg>
                      </button>
                      
                      {showVolumeSlider && (
                        <div className="animate-slide-down">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className={`
                              w-20 h-2 bg-${theme.colors.background.tertiary} rounded-lg
                              appearance-none cursor-pointer
                            `}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Equalizer */}
          {showEqualizer && (
            <div className="p-6 pt-0">
              <Equalizer 
                audioContext={AudioAnalysisService.getAudioContext()}
                audioSource={AudioAnalysisService.getAudioSource()}
                onEqualizerChange={(outputNode) => {
                  AudioAnalysisService.setEqualizerNode(outputNode);
                }}
              />
            </div>
          )}
        </div>
      </GlassPanel>

      {/* Lyrics Panel */}
      <LyricsPanel 
        isVisible={showLyrics} 
        onClose={() => setShowLyrics(false)} 
      />
    </>
  );
};

export default EnhancedNowPlaying;