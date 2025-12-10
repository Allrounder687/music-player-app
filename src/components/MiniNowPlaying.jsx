import React, { useState } from "react";
import { useTheme } from "../store/ThemeContext";
import { useMusic } from "../store/MusicContext";
import { GlassPanel } from "./GlassCard";
import { SnakeSeekbar } from "./SnakeSeekbar";
import { Equalizer } from "./Equalizer";
import { AudioAnalysisService } from "../store/AudioAnalysisService";

export const MiniNowPlaying = () => {
    const { theme } = useTheme();
    const {
        currentTrack,
        isPlaying,
        togglePlayback,
        nextTrack,
        prevTrack,
        currentTime,
        duration,
        setCurrentTime,
        volume,
        setVolume,
        repeat,
        shuffle,
        toggleRepeat,
        toggleShuffle
    } = useMusic();

    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [showEqualizer, setShowEqualizer] = useState(false);

    if (!currentTrack) return null;

    return (
        <GlassPanel className="p-2 lg:p-4 non-draggable">
            <div className="space-y-2 lg:space-y-3">
                {/* Animated Seekbar */}
                <SnakeSeekbar
                    currentTime={currentTime}
                    duration={duration}
                    onChange={setCurrentTime}
                    className="w-full"
                />

                {/* Player Controls */}
                <div className="flex items-center gap-3 lg:gap-4">
                    <img
                        src={currentTrack.imageUrl || currentTrack.albumArt || "/images/album-placeholder.svg"}
                        alt={currentTrack.album || "Album cover"}
                        className="w-12 h-12 lg:w-14 lg:h-14 rounded-lg object-cover flex-shrink-0 shadow-md"
                        onError={(e) => {
                            e.target.src = "/images/album-placeholder.svg";
                        }}
                    />
                    <div className="flex-1 min-w-0 mr-4">
                        <h3
                            className="font-semibold truncate text-sm lg:text-base"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            {currentTrack.title || "Unknown Title"}
                        </h3>
                        <p
                            className="text-xs lg:text-sm truncate"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            {currentTrack.artist || "Unknown Artist"} • {currentTrack.album || "Unknown Album"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3">
                        {/* Shuffle */}
                        <button
                            onClick={toggleShuffle}
                            className={`
                p-2 lg:p-2.5 rounded-full transition-all duration-200 relative
                hover:shadow-md
                ${shuffle ? 'ring-2 ring-opacity-50' : ''}
              `}
                            style={{
                                color: shuffle ? 'white' : 'var(--color-text-secondary)',
                                backgroundColor: shuffle ? 'var(--color-primary-main)' : 'transparent',
                                '--hover-bg': 'var(--color-bg-hover)',
                            }}
                            onMouseEnter={(e) => {
                                if (!shuffle) {
                                    e.target.style.color = 'var(--color-text-primary)';
                                    e.target.style.backgroundColor = 'var(--color-bg-hover)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!shuffle) {
                                    e.target.style.color = 'var(--color-text-secondary)';
                                    e.target.style.backgroundColor = 'transparent';
                                }
                            }}
                            title={shuffle ? "Shuffle On" : "Shuffle Off"}
                        >
                            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 7a1 1 0 011-1h1.586l8.707-8.707a1 1 0 011.414 1.414L8 7.414V9a1 1 0 11-2 0V7z" />
                                <path d="M12 13a1 1 0 100 2h1.586l-2.293 2.293a1 1 0 001.414 1.414L16.414 15H18a1 1 0 100-2h-6z" />
                                <path d="M12 7a1 1 0 100-2H6a1 1 0 100 2h6z" />
                            </svg>
                            {shuffle && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
                            )}
                        </button>

                        {/* Previous */}
                        <button
                            onClick={prevTrack}
                            className="p-2 lg:p-2.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onMouseEnter={(e) => {
                                e.target.style.color = 'var(--color-text-primary)';
                                e.target.style.backgroundColor = 'var(--color-bg-hover)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.color = 'var(--color-text-secondary)';
                                e.target.style.backgroundColor = 'transparent';
                            }}
                            title="Previous Track"
                        >
                            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                            </svg>
                        </button>

                        {/* Play/Pause */}
                        <button
                            onClick={togglePlayback}
                            className="p-3 lg:p-4 rounded-full transition-all duration-200 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ring-2 ring-white ring-opacity-20"
                            style={{ backgroundColor: 'var(--color-primary-main)' }}
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="currentColor" viewBox="0 0 20 20">
                                {isPlaying ? (
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                ) : (
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                )}
                            </svg>
                        </button>

                        {/* Next */}
                        <button
                            onClick={nextTrack}
                            className="p-2 lg:p-2.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onMouseEnter={(e) => {
                                e.target.style.color = 'var(--color-text-primary)';
                                e.target.style.backgroundColor = 'var(--color-bg-hover)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.color = 'var(--color-text-secondary)';
                                e.target.style.backgroundColor = 'transparent';
                            }}
                            title="Next Track"
                        >
                            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                            </svg>
                        </button>

                        {/* Repeat */}
                        <button
                            onClick={toggleRepeat}
                            className={`
                p-2 lg:p-2.5 rounded-full transition-all duration-200 relative
                ${repeat ? 'ring-2 ring-opacity-50' : ''}
              `}
                            style={{
                                color: repeat ? 'white' : 'var(--color-text-secondary)',
                                backgroundColor: repeat ? 'var(--color-primary-main)' : 'transparent',
                            }}
                            onMouseEnter={(e) => {
                                if (!repeat) {
                                    e.target.style.color = 'var(--color-text-primary)';
                                    e.target.style.backgroundColor = 'var(--color-bg-hover)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!repeat) {
                                    e.target.style.color = 'var(--color-text-secondary)';
                                    e.target.style.backgroundColor = 'transparent';
                                }
                            }}
                            title={repeat ? "Repeat On" : "Repeat Off"}
                        >
                            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
                            </svg>
                            {repeat && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
                            )}
                        </button>

                        {/* Volume */}
                        <div className="relative">
                            <button
                                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                                className="p-2 lg:p-2.5 rounded-full transition-all duration-200"
                                style={{
                                    color: showVolumeSlider ? 'var(--color-primary-main)' : 'var(--color-text-secondary)'
                                }}
                                onMouseEnter={(e) => {
                                    if (!showVolumeSlider) e.target.style.color = 'var(--color-text-primary)';
                                    e.target.style.backgroundColor = 'var(--color-bg-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    if (!showVolumeSlider) e.target.style.color = 'var(--color-text-secondary)';
                                    e.target.style.backgroundColor = 'transparent';
                                }}
                                title={`Volume: ${Math.round(volume * 100)}%`}
                            >
                                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                                    {volume === 0 ? (
                                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.828 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.828l3.555-3.793A1 1 0 019.383 3.076zM8 5.04L5.707 7.293A1 1 0 005 8H3v4h2a1 1 0 01.707.293L8 14.96V5.04z" clipRule="evenodd" />
                                    ) : volume < 0.5 ? (
                                        <>
                                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.828 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.828l3.555-3.793A1 1 0 019.383 3.076zM8 5.04L5.707 7.293A1 1 0 005 8H3v4h2a1 1 0 01.707.293L8 14.96V5.04z" clipRule="evenodd" />
                                            <path d="M11.025 7.05a2.5 2.5 0 010 5.9" />
                                        </>
                                    ) : (
                                        <>
                                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.828 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.828l3.555-3.793A1 1 0 019.383 3.076zM8 5.04L5.707 7.293A1 1 0 005 8H3v4h2a1 1 0 01.707.293L8 14.96V5.04z" clipRule="evenodd" />
                                            <path d="M11.025 7.05a2.5 2.5 0 010 5.9m2.121-7.779a6 6 0 010 9.658" />
                                        </>
                                    )}
                                </svg>
                            </button>

                            {showVolumeSlider && (
                                <div
                                    className="absolute bottom-full right-0 mb-3 p-3 rounded-lg shadow-xl border z-50"
                                    style={{
                                        backgroundColor: 'var(--color-bg-secondary)',
                                        borderColor: 'var(--color-border)'
                                    }}
                                >
                                    <div className="flex flex-col items-center space-y-2">
                                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                            {Math.round(volume * 100)}%
                                        </span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={volume}
                                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                                            className="w-24 h-2 rounded-lg appearance-none cursor-pointer slider"
                                            style={{
                                                background: `linear-gradient(to right, var(--color-primary-main) 0%, var(--color-primary-main) ${volume * 100}%, var(--color-bg-tertiary) ${volume * 100}%, var(--color-bg-tertiary) 100%)`
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Equalizer */}
                        <button
                            onClick={() => setShowEqualizer(!showEqualizer)}
                            className="p-2 lg:p-2.5 rounded-full transition-all duration-200"
                            style={{
                                color: showEqualizer ? 'var(--color-primary-main)' : 'var(--color-text-secondary)',
                                backgroundColor: showEqualizer ? 'rgba(var(--color-primary-main), 0.1)' : 'transparent',
                            }}
                            onMouseEnter={(e) => {
                                if (!showEqualizer) {
                                    e.target.style.color = 'var(--color-text-primary)';
                                    e.target.style.backgroundColor = 'var(--color-bg-hover)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!showEqualizer) {
                                    e.target.style.color = 'var(--color-text-secondary)';
                                    e.target.style.backgroundColor = 'transparent';
                                }
                            }}
                            title={showEqualizer ? "Hide Equalizer" : "Show Equalizer"}
                        >
                            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 4a1 1 0 00-2 0v12a1 1 0 102 0V4zM9 4a1 1 0 10-2 0v12a1 1 0 102 0V4zM13 4a1 1 0 10-2 0v12a1 1 0 102 0V4zM17 4a1 1 0 10-2 0v12a1 1 0 102 0V4z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Equalizer Panel */}
                {showEqualizer && (
                    <div className="pt-2">
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
    );
};
