import React, { useState, useEffect } from "react";
import { useTheme } from "../store/ThemeContext";
import { useMusic } from "../store/MusicContext";
import { GlassCard, GlassPanel } from "./GlassCard";
import { MetadataService } from "../services/metadataService";

export const EnhancedLibrary = () => {
  const { theme } = useTheme();
  const { tracks, onlineTracks, playTrack, addToQueue, toggleFavorite, playlists, setQueue } = useMusic();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedTracks, setSelectedTracks] = useState(new Set());
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    // Combine local and online tracks
    const allTracks = [...tracks, ...onlineTracks];
    let filtered = [...allTracks];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(track =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.album.toLowerCase().includes(query) ||
        (track.genre && track.genre.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      switch (filterBy) {
        case 'favorites':
          filtered = filtered.filter(track => playlists.favorites.includes(track.id));
          break;
        case 'recent':
          filtered = filtered.filter(track => playlists.recentlyPlayed.includes(track.id));
          break;
        case 'imported':
          filtered = filtered.filter(track => track.id.startsWith('imported-'));
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredTracks(filtered);
  }, [tracks, onlineTracks, searchQuery, filterBy, sortBy, sortOrder, playlists]);

  const handleFileImport = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsImporting(true);
    try {
      const processedTracks = [];
      let processedCount = 0;

      console.log(`Processing ${files.length} files...`);

      for (const file of files) {
        try {
          // Check if it's an audio file by extension or MIME type
          const isAudioFile = file.type.startsWith('audio/') ||
            /\.(mp3|wav|ogg|m4a|flac|aac|wma)$/i.test(file.name);

          if (isAudioFile) {
            console.log(`Processing audio file: ${file.name}`);
            const track = await MetadataService.processAudioFile(file);
            processedTracks.push(track);
            processedCount++;
          } else {
            console.log(`Skipping non-audio file: ${file.name}`);
          }
        } catch (fileError) {
          console.error(`Error processing ${file.name}:`, fileError);
          // Continue with other files
        }
      }

      console.log(`Successfully processed ${processedCount} audio files`);

      if (processedTracks.length > 0) {
        // Add tracks to the music context
        setQueue(processedTracks, false); // Don't autoplay

        // Show success notification
        if (window.showNotification) {
          window.showNotification(
            `Successfully imported ${processedTracks.length} tracks`,
            'success',
            4000
          );
        }
      } else {
        // Show error notification
        if (window.showNotification) {
          window.showNotification(
            'No valid audio files found in the selected files',
            'warning',
            4000
          );
        }
      }
    } catch (error) {
      console.error('Error importing files:', error);
      if (window.showNotification) {
        window.showNotification(
          `Error importing files: ${error.message}`,
          'error',
          5000
        );
      }
    } finally {
      setIsImporting(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleSelectTrack = (trackId) => {
    const newSelected = new Set(selectedTracks);
    if (newSelected.has(trackId)) {
      newSelected.delete(trackId);
    } else {
      newSelected.add(trackId);
    }
    setSelectedTracks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTracks.size === filteredTracks.length) {
      setSelectedTracks(new Set());
    } else {
      setSelectedTracks(new Set(filteredTracks.map(track => track.id)));
    }
  };

  const handleBulkAction = (action) => {
    const selectedTrackObjects = filteredTracks.filter(track => selectedTracks.has(track.id));

    switch (action) {
      case 'addToQueue':
        selectedTrackObjects.forEach(track => addToQueue(track));
        break;
      case 'favorite':
        selectedTrackObjects.forEach(track => toggleFavorite(track.id));
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedTracks.size} track${selectedTracks.size !== 1 ? 's' : ''}?`)) {
          selectedTrackObjects.forEach(track => deleteTrack(track.id));
        }
        break;
      // Add more bulk actions as needed
    }

    setSelectedTracks(new Set());
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold text-${theme.colors.text.primary}`}>
            Music Library
          </h1>
          <p className={`text-${theme.colors.text.secondary} mt-1`}>
            {filteredTracks.length} of {tracks.length + onlineTracks.length} tracks
          </p>
        </div>

        {/* Import Buttons */}
        <div className="flex items-center gap-4">
          {/* Import Files */}
          <label className={`
            px-4 py-2 rounded-lg font-medium cursor-pointer transition-all duration-200
            bg-${theme.colors.primary.main}
            hover:bg-${theme.colors.primary.dark}
            text-white
            ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}
          `}>
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                Importing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 4.414V13a1 1 0 11-2 0V4.414L7.707 5.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Import Files
              </>
            )}
            <input
              type="file"
              multiple
              accept="audio/*"
              onChange={handleFileImport}
              className="hidden"
              disabled={isImporting}
            />
          </label>

          {/* Import Folder */}
          <label className={`
            px-4 py-2 rounded-lg font-medium cursor-pointer transition-all duration-200
            bg-${theme.colors.background.secondary}
            hover:bg-${theme.colors.background.hover}
            text-${theme.colors.text.primary}
            border border-${theme.colors.border}
            ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}
          `}>
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current inline-block mr-2"></div>
                Importing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
                Import Folder
              </>
            )}
            <input
              type="file"
              webkitdirectory=""
              directory=""
              multiple
              onChange={handleFileImport}
              className="hidden"
              disabled={isImporting}
            />
          </label>
        </div>
      </div>

      {/* Controls */}
      <GlassPanel className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-${theme.colors.text.muted}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                placeholder="Search music..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`
                  w-full pl-10 pr-4 py-2 rounded-lg
                  bg-${theme.colors.background.secondary}
                  border border-${theme.colors.border}
                  text-${theme.colors.text.primary}
                  placeholder-${theme.colors.text.muted}
                  focus:ring-2 focus:ring-${theme.colors.primary.main}
                  focus:border-transparent
                `}
              />
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-wrap gap-2">
            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 rounded-lg border focus:ring-2 focus:border-transparent"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
                '--tw-ring-color': 'var(--color-primary-main)'
              }}
            >
              <option value="all">All Tracks</option>
              <option value="favorites">Favorites</option>
              <option value="recent">Recently Played</option>
              <option value="imported">Imported</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border focus:ring-2 focus:border-transparent"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
                '--tw-ring-color': 'var(--color-primary-main)'
              }}
            >
              <option value="title">Title</option>
              <option value="artist">Artist</option>
              <option value="album">Album</option>
              <option value="duration">Duration</option>
              <option value="year">Year</option>
            </select>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={`
                px-3 py-2 rounded-lg transition-all duration-200
                bg-${theme.colors.background.secondary}
                hover:bg-${theme.colors.background.hover}
                border border-${theme.colors.border}
                text-${theme.colors.text.secondary}
                hover:text-${theme.colors.text.primary}
              `}
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <svg className={`w-4 h-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* View Mode */}
            <div className="flex rounded-lg overflow-hidden border border-gray-700">
              {['grid', 'list'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`
                    px-3 py-2 transition-all duration-200
                    ${viewMode === mode
                      ? `bg-${theme.colors.primary.main} text-white`
                      : `bg-${theme.colors.background.secondary} text-${theme.colors.text.secondary} hover:bg-${theme.colors.background.hover}`
                    }
                  `}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    {mode === 'grid' ? (
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    ) : (
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    )}
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTracks.size > 0 && (
          <div className="mt-4 flex items-center gap-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <span className={`text-sm text-${theme.colors.text.secondary}`}>
              {selectedTracks.size} track{selectedTracks.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('addToQueue')}
                className={`
                  px-3 py-1 rounded-md text-sm font-medium transition-all duration-200
                  bg-${theme.colors.primary.main}
                  hover:bg-${theme.colors.primary.dark}
                  text-white
                `}
              >
                Add to Queue
              </button>
              <button
                onClick={() => handleBulkAction('favorite')}
                className={`
                  px-3 py-1 rounded-md text-sm font-medium transition-all duration-200
                  bg-${theme.colors.background.secondary}
                  hover:bg-${theme.colors.background.hover}
                  text-${theme.colors.text.secondary}
                  hover:text-${theme.colors.text.primary}
                  border border-${theme.colors.border}
                `}
              >
                Toggle Favorite
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className={`
                  px-3 py-1 rounded-md text-sm font-medium transition-all duration-200
                  bg-red-500
                  hover:bg-red-600
                  text-white
                `}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </GlassPanel>

      {/* Track List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isSelected={selectedTracks.has(track.id)}
              onSelect={() => handleSelectTrack(track.id)}
              onPlay={() => playTrack(track)}
              onAddToQueue={() => addToQueue(track)}
              onToggleFavorite={() => toggleFavorite(track.id)}
              isFavorite={playlists.favorites.includes(track.id)}
            />
          ))}
        </div>
      ) : (
        <TrackList
          tracks={filteredTracks}
          selectedTracks={selectedTracks}
          onSelectTrack={handleSelectTrack}
          onSelectAll={handleSelectAll}
          onPlay={playTrack}
          onAddToQueue={addToQueue}
          onToggleFavorite={toggleFavorite}
          favorites={playlists.favorites}
          formatDuration={formatDuration}
          totalTracksCount={tracks.length + onlineTracks.length}
        />
      )}

      {filteredTracks.length === 0 && (
        <div className="text-center py-12">
          <div className={`text-${theme.colors.text.muted} mb-4`}>
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 3a1 1 0 012 0v5.5a.5.5 0 001 0V4a1 1 0 112 0v4.5a.5.5 0 001 0V6a1 1 0 112 0v6a7 7 0 11-14 0V9a1 1 0 012 0v2.5a.5.5 0 001 0V4a1 1 0 012 0v4.5a.5.5 0 001 0V3z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className={`text-lg font-semibold text-${theme.colors.text.primary} mb-2`}>
            No tracks found
          </h3>
          <p className={`text-${theme.colors.text.secondary}`}>
            {searchQuery ? 'Try adjusting your search terms' : 'Import some music to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

const TrackCard = ({ track, isSelected, onSelect, onPlay, onAddToQueue, onToggleFavorite, isFavorite }) => {
  const { theme } = useTheme();

  return (
    <GlassCard
      className={`
        p-4 cursor-pointer transition-all duration-300 group
        ${isSelected ? `ring-2 ring-${theme.colors.primary.main}` : ''}
      `}
      hover
    >
      <div className="relative">
        {/* Selection Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="absolute top-2 left-2 z-10"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Album Art */}
        <div className="relative mb-4">
          <img
            src={track.imageUrl || "/images/album-placeholder.svg"}
            alt={track.album}
            className="w-full aspect-square object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-200"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Track Info */}
        <div className="space-y-1">
          <h3 className={`font-semibold text-${theme.colors.text.primary} truncate`}>
            {track.title}
          </h3>
          <p className={`text-sm text-${theme.colors.text.secondary} truncate`}>
            {track.artist}
          </p>
          <p className={`text-xs text-${theme.colors.text.muted} truncate`}>
            {track.album}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`
              p-1 rounded transition-all duration-200
              ${isFavorite
                ? `text-red-500 hover:text-red-600`
                : `text-${theme.colors.text.muted} hover:text-red-500`
              }
            `}
          >
            <svg className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToQueue();
            }}
            className={`
              p-1 rounded transition-all duration-200
              text-${theme.colors.text.muted}
              hover:text-${theme.colors.text.primary}
            `}
            title="Add to Queue"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

const TrackList = ({ tracks, selectedTracks, onSelectTrack, onSelectAll, onPlay, onAddToQueue, onToggleFavorite, favorites, formatDuration, totalTracksCount }) => {
  const { theme } = useTheme();

  return (
    <GlassPanel className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b border-${theme.colors.border}`}>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedTracks.size === totalTracksCount && totalTracksCount > 0}
                  onChange={onSelectAll}
                />
              </th>
              <th className={`p-3 text-left text-sm font-medium text-${theme.colors.text.secondary}`}>Title</th>
              <th className={`p-3 text-left text-sm font-medium text-${theme.colors.text.secondary}`}>Artist</th>
              <th className={`p-3 text-left text-sm font-medium text-${theme.colors.text.secondary}`}>Album</th>
              <th className={`p-3 text-left text-sm font-medium text-${theme.colors.text.secondary}`}>Duration</th>
              <th className={`p-3 text-left text-sm font-medium text-${theme.colors.text.secondary}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track) => (
              <tr
                key={track.id}
                className={`
                  border-b border-${theme.colors.border} 
                  hover:bg-${theme.colors.background.hover} 
                  transition-colors duration-200
                  ${selectedTracks.has(track.id) ? `bg-${theme.colors.primary.main}/10` : ''}
                `}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedTracks.has(track.id)}
                    onChange={() => onSelectTrack(track.id)}
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={track.imageUrl || "/images/album-placeholder.svg"}
                      alt={track.album}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div>
                      <p className={`font-medium text-${theme.colors.text.primary}`}>{track.title}</p>
                    </div>
                  </div>
                </td>
                <td className={`p-3 text-${theme.colors.text.secondary}`}>{track.artist}</td>
                <td className={`p-3 text-${theme.colors.text.secondary}`}>{track.album}</td>
                <td className={`p-3 text-${theme.colors.text.secondary}`}>{formatDuration(track.duration)}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPlay(track)}
                      className={`
                        p-1 rounded transition-all duration-200
                        text-${theme.colors.text.muted}
                        hover:text-${theme.colors.primary.main}
                      `}
                      title="Play"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onAddToQueue(track)}
                      className={`
                        p-1 rounded transition-all duration-200
                        text-${theme.colors.text.muted}
                        hover:text-${theme.colors.text.primary}
                      `}
                      title="Add to Queue"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onToggleFavorite(track.id)}
                      className={`
                        p-1 rounded transition-all duration-200
                        ${favorites.includes(track.id)
                          ? `text-red-500 hover:text-red-600`
                          : `text-${theme.colors.text.muted} hover:text-red-500`
                        }
                      `}
                      title="Toggle Favorite"
                    >
                      <svg className="w-4 h-4" fill={favorites.includes(track.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassPanel>
  );
};

export default EnhancedLibrary;