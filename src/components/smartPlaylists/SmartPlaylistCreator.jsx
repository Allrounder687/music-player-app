import React, { useState, memo } from "react";
import { useTheme } from "../../store/ThemeContext";
import { createInputStyles, createButtonStyles } from "../../utils/styleUtils";

const CRITERIA_TYPES = [
  { value: 'genre', label: 'Genre' },
  { value: 'artist', label: 'Artist' },
  { value: 'decade', label: 'Decade' },
  { value: 'duration', label: 'Duration' },
  { value: 'random', label: 'Random' }
];

export const SmartPlaylistCreator = memo(({ 
  availableOptions, 
  onCreatePlaylist, 
  isLoading 
}) => {
  const { theme } = useTheme();
  const [criteria, setCriteria] = useState({
    type: 'genre',
    genre: '',
    artist: '',
    decade: 2020,
    minDuration: 0,
    maxDuration: 600,
    limit: 50
  });
  const [playlistName, setPlaylistName] = useState('');

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) return;

    const success = await onCreatePlaylist(playlistName, criteria);
    if (success) {
      setPlaylistName('');
      setCriteria(prev => ({ ...prev, genre: '', artist: '' }));
    }
  };

  const updateCriteria = (updates) => {
    setCriteria(prev => ({ ...prev, ...updates }));
  };

  return (
    <>
      <div>
        <label 
          htmlFor="criteria-type"
          className={`block text-sm font-medium text-${theme.colors.text.secondary} mb-2`}
        >
          Criteria Type
        </label>
        <select
          id="criteria-type"
          value={criteria.type}
          onChange={(e) => updateCriteria({ type: e.target.value })}
          className={`
            w-full px-3 py-2 rounded-lg transition-all duration-200
            bg-${theme.colors.background.secondary}
            border border-${theme.colors.border}
            text-${theme.colors.text.primary}
            focus:ring-2 focus:ring-${theme.colors.primary.main}
            focus:border-transparent
          `}
          aria-describedby="criteria-type-help"
        >
          {CRITERIA_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {criteria.type === 'genre' && (
        <div>
          <label 
            htmlFor="genre-select"
            className={`block text-sm font-medium text-${theme.colors.text.secondary} mb-2`}
          >
            Genre
          </label>
          <select
            id="genre-select"
            value={criteria.genre}
            onChange={(e) => updateCriteria({ genre: e.target.value })}
            className={createInputStyles(theme)}
          >
            <option value="">Select Genre</option>
            {availableOptions.genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
      )}

      {criteria.type === 'artist' && (
        <div>
          <label 
            htmlFor="artist-select"
            className={`block text-sm font-medium text-${theme.colors.text.secondary} mb-2`}
          >
            Artist
          </label>
          <select
            id="artist-select"
            value={criteria.artist}
            onChange={(e) => updateCriteria({ artist: e.target.value })}
            className={createInputStyles(theme)}
          >
            <option value="">Select Artist</option>
            {availableOptions.artists.map(artist => (
              <option key={artist} value={artist}>{artist}</option>
            ))}
          </select>
        </div>
      )}

      {criteria.type === 'decade' && (
        <div>
          <label 
            htmlFor="decade-select"
            className={`block text-sm font-medium text-${theme.colors.text.secondary} mb-2`}
          >
            Decade
          </label>
          <select
            id="decade-select"
            value={criteria.decade}
            onChange={(e) => updateCriteria({ decade: parseInt(e.target.value) })}
            className={createInputStyles(theme)}
          >
            {availableOptions.decades.map(decade => (
              <option key={decade} value={decade}>{decade}s</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label 
          htmlFor="playlist-name"
          className={`block text-sm font-medium text-${theme.colors.text.secondary} mb-2`}
        >
          Playlist Name
        </label>
        <input
          id="playlist-name"
          type="text"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          placeholder="Enter playlist name"
          className={createInputStyles(theme)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
        />
        <button
          onClick={handleCreatePlaylist}
          disabled={!playlistName.trim() || isLoading}
          className={`
            ${createButtonStyles(theme, 'primary')}
            w-full mt-2
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-label="Create custom smart playlist"
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

SmartPlaylistCreator.displayName = 'SmartPlaylistCreator';