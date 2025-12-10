import { useState, useMemo, useCallback } from 'react';

export const useSmartPlaylists = (tracks, setQueue, createPlaylist) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [operationStates, setOperationStates] = useState(new Map());

  // Simple suggestions without external service dependency
  const suggestions = useMemo(() => {
    if (tracks.length === 0) return [];
    
    const simpleSuggestions = [
      {
        id: 'all-tracks',
        name: 'All Tracks',
        description: `Play all ${tracks.length} tracks in your library`,
        icon: '🎵',
        criteria: { type: 'all' }
      },
      {
        id: 'random-mix',
        name: 'Random Mix',
        description: '25 random songs from your library',
        icon: '🎲',
        criteria: { type: 'random', limit: 25 }
      }
    ];

    // Add favorites if any exist
    if (tracks.some(track => track.isFavorite)) {
      simpleSuggestions.push({
        id: 'favorites',
        name: 'Favorites',
        description: 'Your favorite tracks',
        icon: '❤️',
        criteria: { type: 'favorites' }
      });
    }

    return simpleSuggestions;
  }, [tracks]);

  const availableOptions = useMemo(() => {
    const genres = [...new Set(tracks.map(track => track.genre).filter(Boolean))];
    const artists = [...new Set(tracks.map(track => track.artist).filter(Boolean))];
    const decades = [...new Set(tracks.map(track => {
      if (track.year) {
        return Math.floor(track.year / 10) * 10;
      }
      return null;
    }).filter(Boolean))].sort((a, b) => b - a);

    return { genres, artists, decades };
  }, [tracks]);

  const setOperationLoading = useCallback((operationId, loading) => {
    setOperationStates(prev => new Map(prev.set(operationId, { loading })));
  }, []);

  // Simple playlist creation logic
  const createPlaylistTracks = useCallback((criteria) => {
    switch (criteria.type) {
      case 'all':
        return tracks;
      case 'random':
        return [...tracks].sort(() => 0.5 - Math.random()).slice(0, criteria.limit || 25);
      case 'favorites':
        return tracks.filter(track => track.isFavorite);
      case 'genre':
        return tracks.filter(track => track.genre === criteria.genre).slice(0, criteria.limit || 50);
      case 'artist':
        return tracks.filter(track => track.artist === criteria.artist).slice(0, criteria.limit || 50);
      case 'decade':
        return tracks.filter(track => {
          if (!track.year) return false;
          const decade = Math.floor(track.year / 10) * 10;
          return decade === criteria.decade;
        }).slice(0, criteria.limit || 50);
      default:
        return tracks;
    }
  }, [tracks]);

  const handlePlaySmartPlaylist = useCallback(async (suggestion) => {
    const operationId = `play-${suggestion.id}`;
    setOperationLoading(operationId, true);
    setError(null);

    try {
      const playlistTracks = createPlaylistTracks(suggestion.criteria);
      if (playlistTracks.length > 0) {
        setQueue(playlistTracks, true);
      } else {
        throw new Error('No tracks found matching criteria');
      }
    } catch (err) {
      setError(`Failed to play ${suggestion.name}: ${err.message}`);
    } finally {
      setOperationLoading(operationId, false);
    }
  }, [createPlaylistTracks, setQueue, setOperationLoading]);

  const handleSaveSmartPlaylist = useCallback(async (suggestion) => {
    const operationId = `save-${suggestion.id}`;
    setOperationLoading(operationId, true);
    setError(null);

    try {
      const playlistTracks = createPlaylistTracks(suggestion.criteria);
      if (playlistTracks.length > 0) {
        const trackIds = playlistTracks.map(track => track.id);
        await createPlaylist(suggestion.name, trackIds);
      } else {
        throw new Error('No tracks found matching criteria');
      }
    } catch (err) {
      setError(`Failed to save ${suggestion.name}: ${err.message}`);
    } finally {
      setOperationLoading(operationId, false);
    }
  }, [createPlaylistTracks, createPlaylist, setOperationLoading]);

  const handleCreateCustomPlaylist = useCallback(async (name, criteria) => {
    setIsLoading(true);
    setError(null);

    try {
      const playlistTracks = createPlaylistTracks(criteria);
      if (playlistTracks.length > 0) {
        const trackIds = playlistTracks.map(track => track.id);
        await createPlaylist(name, trackIds);
        return true;
      } else {
        throw new Error('No tracks found matching criteria');
      }
    } catch (err) {
      setError(`Failed to create playlist: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [createPlaylistTracks, createPlaylist]);

  const clearError = useCallback(() => setError(null), []);

  return {
    suggestions,
    availableOptions,
    isLoading,
    error,
    operationStates,
    handlePlaySmartPlaylist,
    handleSaveSmartPlaylist,
    handleCreateCustomPlaylist,
    clearError
  };
};