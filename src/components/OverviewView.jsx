import React from "react";
import { useTheme } from "../store/ThemeContext";
import { useMusic } from "../store/MusicContext";
import { GlassPanel, GlassCard } from "./GlassCard";
import { EnhancedNowPlaying } from "./EnhancedNowPlaying";

export const OverviewView = () => {
    const { theme } = useTheme();
    const { tracks, onlineTracks, playlists, currentTrack } = useMusic();
    const allTracks = [...tracks, ...onlineTracks];

    const recentTracks = allTracks
        .filter(track => playlists.recentlyPlayed.includes(track.id))
        .slice(0, 6);

    const favoriteTracks = tracks
        .filter(track => playlists.favorites.includes(track.id))
        .slice(0, 6);

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <GlassPanel className="p-8 text-center">
                <h1
                    className="text-4xl font-bold mb-4"
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    Welcome to Your Music
                </h1>
                <p
                    className="text-lg mb-6"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    Discover, organize, and enjoy your music collection with enhanced features
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto">
                    <div
                        className="text-center p-4 rounded-lg"
                        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                    >
                        <div
                            className="text-xl lg:text-2xl font-bold"
                            style={{ color: 'var(--color-primary-main)' }}
                        >
                            {allTracks.length}
                        </div>
                        <div
                            className="text-xs lg:text-sm"
                            style={{ color: 'var(--color-text-muted)' }}
                        >
                            Total Tracks
                        </div>
                    </div>
                    <div
                        className="text-center p-4 rounded-lg"
                        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                    >
                        <div
                            className="text-xl lg:text-2xl font-bold"
                            style={{ color: 'var(--color-primary-main)' }}
                        >
                            {Object.keys(playlists.custom).length}
                        </div>
                        <div
                            className="text-xs lg:text-sm"
                            style={{ color: 'var(--color-text-muted)' }}
                        >
                            Playlists
                        </div>
                    </div>
                    <div
                        className="text-center p-4 rounded-lg"
                        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                    >
                        <div
                            className="text-xl lg:text-2xl font-bold"
                            style={{ color: 'var(--color-primary-main)' }}
                        >
                            {playlists.favorites.length}
                        </div>
                        <div
                            className="text-xs lg:text-sm"
                            style={{ color: 'var(--color-text-muted)' }}
                        >
                            Favorites
                        </div>
                    </div>
                </div>
            </GlassPanel>

            {/* Now Playing */}
            {currentTrack && (
                <div>
                    <h2
                        className="text-xl font-bold mb-4"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        Now Playing
                    </h2>
                    <EnhancedNowPlaying />
                </div>
            )}

            {/* Recent Tracks */}
            {recentTracks.length > 0 && (
                <div>
                    <h2
                        className="text-xl font-bold mb-4"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        Recently Played
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {recentTracks.map((track) => (
                            <TrackCard key={track.id} track={track} />
                        ))}
                    </div>
                </div>
            )}

            {/* Favorite Tracks */}
            {favoriteTracks.length > 0 && (
                <div>
                    <h2
                        className="text-xl font-bold mb-4"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        Your Favorites
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {favoriteTracks.map((track) => (
                            <TrackCard key={track.id} track={track} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const TrackCard = ({ track }) => {
    const { theme } = useTheme();
    const { playTrack } = useMusic();

    return (
        <GlassCard className="p-4 cursor-pointer group" hover onClick={() => playTrack(track)}>
            <div className="flex items-center gap-3">
                <img
                    src={track.imageUrl || "/images/album-placeholder.svg"}
                    alt={track.album}
                    className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                    <h3
                        className="font-medium truncate"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        {track.title}
                    </h3>
                    <p
                        className="text-sm truncate"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        {track.artist}
                    </p>
                </div>
                <button
                    className="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white"
                    style={{ backgroundColor: 'var(--color-primary-main)' }}
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </GlassCard>
    );
};
