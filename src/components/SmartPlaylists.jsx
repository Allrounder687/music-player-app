import React, { memo } from "react";
import { useTheme } from "../store/ThemeContext";
import { useMusic } from "../store/MusicContext";
import { GlassCard } from "./GlassCard";
import { SmartPlaylistCard } from "./smartPlaylists/SmartPlaylistCard";
import { SimplePlaylistCreator } from "./smartPlaylists/SimplePlaylistCreator";
import { ErrorBoundary } from "./ErrorBoundary";
import { useSmartPlaylists } from "../hooks/useSmartPlaylists";

/**
 * Empty state component shown when no smart playlists are available
 * @param {Object} theme - Theme configuration object
 */
const EmptyState = memo(({ theme }) => (
    <GlassCard className="p-6">
        <div className="text-center">
            <div className={`text-${theme.colors.text.muted} mb-4`}>
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className={`text-lg font-semibold text-${theme.colors.text.primary} mb-2`}>
                No Smart Playlists Available
            </h3>
            <p className={`text-${theme.colors.text.secondary}`}>
                Add more music to your library to see smart playlist suggestions
            </p>
        </div>
    </GlassCard>
));

EmptyState.displayName = 'EmptyState';

// SmartPlaylistCard is imported from separate component file

/**
 * Smart Playlists component that displays automatically generated playlist suggestions
 * and allows users to create custom playlists based on various criteria.
 * 
 * Features:
 * - Displays smart playlist suggestions (All Tracks, Random Mix, Favorites)
 * - Allows playing playlists directly or saving them as custom playlists
 * - Provides custom playlist creation interface
 * - Handles loading states and error management
 * 
 * @component
 * @example
 * return (
 *   <SmartPlaylists />
 * )
 */
export const SmartPlaylists = memo(() => {
    const { theme } = useTheme();
    const { tracks, setQueue, createPlaylist } = useMusic();

    const {
        suggestions,
        isLoading,
        error,
        operationStates,
        handlePlaySmartPlaylist,
        handleSaveSmartPlaylist,
        clearError
    } = useSmartPlaylists(tracks, setQueue, createPlaylist);

    if (suggestions.length === 0) {
        return <EmptyState theme={theme} />;
    }

    return (
        <ErrorBoundary>
            <div className="space-y-6">
                {/* Error Alert */}
                {error && (
                    <div
                        className="p-4 rounded-lg border border-red-500/20 bg-red-500/10 flex items-start gap-3"
                        role="alert"
                        aria-live="polite"
                        aria-describedby="error-message"
                    >
                        <svg
                            className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                        >
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <p 
                                id="error-message"
                                className={`text-sm font-medium text-${theme.colors.text.primary}`}
                            >
                                {error}
                            </p>
                        </div>
                        <button
                            onClick={clearError}
                            className={`
                                text-${theme.colors.text.muted} hover:text-${theme.colors.text.primary}
                                transition-colors duration-200 p-1 rounded-md
                                hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500
                            `}
                            aria-label="Dismiss error message"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Header */}
                <header className="flex items-center justify-between">
                    <h2 className={`text-2xl font-bold text-${theme.colors.text.primary}`}>
                        Smart Playlists
                    </h2>
                    <p className={`text-sm text-${theme.colors.text.secondary}`}>
                        Automatically generated based on your music
                    </p>
                </header>

                {/* Playlist Suggestions Grid */}
                <section
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    aria-label="Smart playlist suggestions"
                >
                    {suggestions.map((suggestion) => {
                        const operationState = operationStates.get(`play-${suggestion.id}`);
                        const saveOperationState = operationStates.get(`save-${suggestion.id}`);
                        
                        return (
                            <SmartPlaylistCard
                                key={suggestion.id}
                                suggestion={suggestion}
                                onPlay={handlePlaySmartPlaylist}
                                onSave={handleSaveSmartPlaylist}
                                isPlayLoading={operationState?.loading ?? false}
                                isSaveLoading={saveOperationState?.loading ?? false}
                            />
                        );
                    })}
                </section>

                {/* Custom Smart Playlist Creator */}
                <section aria-label="Create custom smart playlist">
                    <GlassCard className="p-6">
                        <h3 className={`text-lg font-semibold text-${theme.colors.text.primary} mb-4`}>
                            Create Custom Playlist
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SimplePlaylistCreator
                                tracks={tracks}
                                createPlaylist={createPlaylist}
                                onSuccess={(message) => {
                                    // TODO: Implement success toast notification
                                    console.log('Success:', message);
                                }}
                                onError={(errorMessage) => {
                                    // TODO: Integrate with global error state
                                    console.error('Playlist creation error:', errorMessage);
                                }}
                            />
                        </div>
                    </GlassCard>
                </section>
            </div>
        </ErrorBoundary>
    );
});

SmartPlaylists.displayName = 'SmartPlaylists';

export default SmartPlaylists;