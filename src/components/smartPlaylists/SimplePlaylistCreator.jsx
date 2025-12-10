import React, { useState, memo, useCallback } from "react";
import { useTheme } from "../../store/ThemeContext";
import { createInputStyles, createButtonStyles } from "../../utils/styleUtils";

export const SimplePlaylistCreator = memo(({ tracks, createPlaylist, onSuccess, onError }) => {
  const { theme } = useTheme();
  const [playlistName, setPlaylistName] = useState('');
  const [playlistType, setPlaylistType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreatePlaylist = useCallback(async () => {
    if (!playlistName.trim()) return;

    setIsLoading(true);
    try {
      let playlistTracks = [];

      switch (playlistType) {
        case 'all':
          playlistTracks = tracks;
          break;
        case 'random':
          playlistTracks = [...tracks].sort(() => 0.5 - Math.random()).slice(0, 25);
          break;
        case 'favorites':
          playlistTracks = tracks.filter(track => track.isFavorite);
          break;
        default:
          playlistTracks = tracks;
      }

      if (playlistTracks.length > 0) {
        const trackIds = playlistTracks.map(track => track.id);
        await createPlaylist(playlistName, trackIds);
        setPlaylistName('');
        onSuccess?.(`Created playlist "${playlistName}" with ${playlistTracks.length} tracks`);
      } else {
        throw new Error('No tracks found for the selected criteria');
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      onError?.(error.message || 'Failed to create playlist');
    } finally {
      setIsLoading(false);
    }
  }, [playlistName, playlistType, tracks, createPlaylist, onSuccess, onError]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleCreatePlaylist();
    }
  }, [handleCreatePlaylist, isLoading]);

  return (
    <>
      <div>
        <label 
          htmlFor="playlist-type"
          className={`block text-sm font-medium text-${theme.colors.text.secondary} mb-2`}
        >
          Playlist Type
        </label>
        <select
          id="playlist-type"
          value={playlistType}
          onChange={(e) => setPlaylistType(e.target.value)}
          className={createInputStyles(theme)}
          disabled={isLoading}
        >
          <option value="all">All Tracks ({tracks.length})</option>
          <option value="random">Random Mix (25 tracks)</option>
          <option value="favorites">
            Favorites Only ({tracks.filter(track => track.isFavorite).length})
          </option>
        </select>
      </div>

      <div>
        <label 
          htmlFor="playlist-name-input"
          className={`block text-sm font-medium text-${theme.colors.text.secondary} mb-2`}
        >
          Playlist Name
        </label>
        <input
          id="playlist-name-input"
          type="text"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter playlist name"
          className={createInputStyles(theme)}
          disabled={isLoading}
          maxLength={100}
        />
        <button
          onClick={handleCreatePlaylist}
          disabled={!playlistName.trim() || isLoading}
          className={`w-full mt-2 ${createButtonStyles(theme, 'primary')}`}
          aria-label="Create custom playlist"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2" />
              Creating...
            </>
          ) : (
            'Create Playlist'
          )}
        </button>
      </div>
    </>
  );
});

SimplePlaylistCreator.displayName = 'SimplePlaylistCreator';

export default SimplePlaylistCreator;