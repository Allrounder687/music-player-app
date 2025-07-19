import React, { useState, useEffect, useMemo } from "react";
import { useMusic } from "../store/MusicContext";
import { useTheme } from "../store/ThemeContext";
import {
  FaPlay,
  FaMusic,
  FaHeart,
  FaRegHeart,
  FaEllipsisH,
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTh,
  FaList,
  FaFilter,
  FaDownload,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import { formatTime } from "../utils/audioUtils";

export const Library = () => {
  const {
    tracks,
    playTrack,
    currentTrack,
    playlists,
    toggleFavorite,
    setQueue,
  } = useMusic();
  const { theme } = useTheme();
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded"); // dateAdded, title, artist, album
  const [sortDirection, setSortDirection] = useState("desc"); // asc, desc
  const [view, setView] = useState("grid"); // grid, list
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced filtering and sorting with debounced search
  const filteredAndSortedTracks = useMemo(() => {
    setIsLoading(true);
    
    // Apply filters
    let filtered = tracks.filter((track) => {
      if (!filter) return true;
      const searchTerm = filter.toLowerCase();
      return (
        track.title?.toLowerCase().includes(searchTerm) ||
        track.artist?.toLowerCase().includes(searchTerm) ||
        track.album?.toLowerCase().includes(searchTerm)
      );
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "title":
          comparison = (a.title || "").localeCompare(b.title || "");
          break;
        case "artist":
          comparison = (a.artist || "").localeCompare(b.artist || "");
          break;
        case "album":
          comparison = (a.album || "").localeCompare(b.album || "");
          break;
        case "duration":
          comparison = (a.duration || 0) - (b.duration || 0);
          break;
        case "dateAdded":
        default:
          // Assuming newer tracks have higher IDs
          comparison = parseInt(a.id || "0") - parseInt(b.id || "0");
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });

    setTimeout(() => setIsLoading(false), 100); // Small delay for smooth UX
    return filtered;
  }, [tracks, filter, sortBy, sortDirection]);

  // Toggle track selection
  const toggleTrackSelection = (trackId) => {
    setSelectedTracks(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  // Play all filtered tracks
  const playAllTracks = () => {
    if (filteredAndSortedTracks.length > 0) {
      setQueue(filteredAndSortedTracks, true);
    }
  };

  // Add to favorites (bulk action)
  const addSelectedToFavorites = () => {
    selectedTracks.forEach(trackId => {
      if (!playlists.favorites.includes(trackId)) {
        toggleFavorite(trackId);
      }
    });
    setSelectedTracks([]);
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className={`text-3xl font-bold text-${theme.colors.text.primary} mb-2`}>
            Music Library
          </h1>
          <p className={`text-${theme.colors.text.muted} flex items-center gap-2`}>
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                Loading tracks...
              </>
            ) : (
              <>
                {filteredAndSortedTracks.length} of {tracks.length} tracks
                {selectedTracks.length > 0 && (
                  <span className={`ml-2 px-2 py-1 bg-${theme.colors.primary.main} text-${theme.colors.text.primary} rounded-full text-sm`}>
                    {selectedTracks.length} selected
                  </span>
                )}
              </>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          {selectedTracks.length > 0 && (
            <button
              onClick={addSelectedToFavorites}
              className={`px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2`}
            >
              <FaHeart />
              Add to Favorites
            </button>
          )}
          
          <button
            onClick={playAllTracks}
            disabled={filteredAndSortedTracks.length === 0}
            className={`px-4 py-2 bg-${theme.colors.primary.main} text-${theme.colors.text.primary} rounded-lg hover:bg-${theme.colors.primary.light} transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <FaPlay />
            Play All
          </button>
        </div>
      </div>

      {/* Search and Controls */}
      <div className={`bg-${theme.colors.background.secondary} rounded-lg p-4 mb-6 space-y-4`}>
        {/* Search Bar */}
        <div className="relative">
          <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-${theme.colors.text.muted}`} />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by title, artist, or album..."
            className={`w-full pl-10 pr-4 py-3 bg-${theme.colors.background.main} border border-${theme.colors.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.colors.primary.main} text-${theme.colors.text.primary} placeholder-${theme.colors.text.muted}`}
          />
          {filter && (
            <button
              onClick={() => setFilter("")}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-${theme.colors.text.muted} hover:text-${theme.colors.text.primary}`}
            >
              ×
            </button>
          )}
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className={`text-sm text-${theme.colors.text.muted}`}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`bg-${theme.colors.background.main} border border-${theme.colors.border} rounded px-3 py-1 text-${theme.colors.text.primary} focus:outline-none focus:ring-1 focus:ring-${theme.colors.primary.main}`}
            >
              <option value="dateAdded">Date Added</option>
              <option value="title">Title</option>
              <option value="artist">Artist</option>
              <option value="album">Album</option>
              <option value="duration">Duration</option>
            </select>
            
            <button
              onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}
              className={`p-2 rounded hover:bg-${theme.colors.background.tertiary} transition-colors`}
              title={`Sort ${sortDirection === "asc" ? "Descending" : "Ascending"}`}
            >
              {sortDirection === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded transition-colors ${view === "grid" ? `bg-${theme.colors.primary.main} text-${theme.colors.text.primary}` : `hover:bg-${theme.colors.background.tertiary}`}`}
            >
              <FaTh />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded transition-colors ${view === "list" ? `bg-${theme.colors.primary.main} text-${theme.colors.text.primary}` : `hover:bg-${theme.colors.background.tertiary}`}`}
            >
              <FaList />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {tracks.length === 0 ? (
        <div className={`text-center py-16 text-${theme.colors.text.muted}`}>
          <FaMusic className="text-6xl mb-4 mx-auto opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Music Found</h3>
          <p className="mb-4">Start by importing some music files to your library.</p>
          <button
            onClick={() => {/* Add import functionality */}}
            className={`px-6 py-3 bg-${theme.colors.primary.main} text-${theme.colors.text.primary} rounded-lg hover:bg-${theme.colors.primary.light} transition-colors inline-flex items-center gap-2`}
          >
            <FaDownload />
            Import Music
          </button>
        </div>
      ) : filteredAndSortedTracks.length === 0 ? (
        <div className={`text-center py-16 text-${theme.colors.text.muted}`}>
          <FaExclamationTriangle className="text-6xl mb-4 mx-auto opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
          <p className="mb-4">Try adjusting your search terms or filters.</p>
          <button
            onClick={() => setFilter("")}
            className={`px-4 py-2 bg-${theme.colors.background.secondary} text-${theme.colors.text.primary} rounded-lg hover:bg-${theme.colors.background.tertiary} transition-colors`}
          >
            Clear Search
          </button>
        </div>
      ) : view === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredAndSortedTracks.map((track) => (
            <div
              key={track.id}
              className={`bg-${theme.colors.background.secondary} rounded-lg overflow-hidden hover:bg-${theme.colors.background.tertiary} transition-all duration-200 cursor-pointer group relative shadow-sm hover:shadow-md ${
                selectedTracks.includes(track.id) ? `ring-2 ring-${theme.colors.primary.main}` : ""
              }`}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedTracks.includes(track.id)}
                  onChange={() => toggleTrackSelection(track.id)}
                  className={`rounded border-${theme.colors.border} text-${theme.colors.primary.main} focus:ring-${theme.colors.primary.main} opacity-0 group-hover:opacity-100 transition-opacity`}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Album Art */}
              <div className="relative" onClick={() => playTrack(track)}>
                {track.imageUrl ? (
                  <img
                    src={track.imageUrl}
                    alt={track.title}
                    className="w-full aspect-square object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className={`w-full aspect-square bg-${theme.colors.background.main} flex items-center justify-center`}>
                    <FaMusic className={`text-4xl text-${theme.colors.text.muted}`} />
                  </div>
                )}
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all">
                    <button className={`bg-${theme.colors.primary.main} text-${theme.colors.text.primary} rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow`}>
                      <FaPlay className="h-6 w-6 ml-1" />
                    </button>
                  </div>
                </div>

                {/* Current Playing Indicator */}
                {currentTrack?.id === track.id && (
                  <div className={`absolute top-2 right-2 bg-${theme.colors.primary.main} text-${theme.colors.text.primary} rounded-full p-2`}>
                    <FaPlay className="h-3 w-3" />
                  </div>
                )}
              </div>

              {/* Track Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 
                      className={`font-semibold truncate text-${theme.colors.text.primary} ${
                        currentTrack?.id === track.id ? `text-${theme.colors.primary.main}` : ""
                      }`}
                      title={track.title}
                    >
                      {track.title}
                    </h3>
                    <p 
                      className={`text-sm text-${theme.colors.text.muted} truncate`}
                      title={track.artist || "Unknown Artist"}
                    >
                      {track.artist || "Unknown Artist"}
                    </p>
                  </div>
                  
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(track.id);
                    }}
                    className={`ml-2 p-1 rounded-full hover:bg-${theme.colors.background.main} transition-colors ${
                      playlists.favorites.includes(track.id) ? "text-red-500" : `text-${theme.colors.text.muted}`
                    } hover:text-red-500`}
                  >
                    {playlists.favorites.includes(track.id) ? (
                      <FaHeart className="h-4 w-4" />
                    ) : (
                      <FaRegHeart className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                <div className={`text-xs text-${theme.colors.text.muted} flex justify-between items-center`}>
                  <span className="truncate flex-1" title={track.album || "Unknown Album"}>
                    {track.album || "Unknown Album"}
                  </span>
                  <span className="ml-2 flex-shrink-0">
                    {formatTime(track.duration)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className={`bg-${theme.colors.background.secondary} rounded-lg overflow-hidden shadow-sm`}>
          {/* Table Header */}
          <div className={`grid grid-cols-12 gap-4 px-4 py-3 border-b border-${theme.colors.border} text-${theme.colors.text.muted} text-sm font-medium bg-${theme.colors.background.main}`}>
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={selectedTracks.length === filteredAndSortedTracks.length && filteredAndSortedTracks.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTracks(filteredAndSortedTracks.map(t => t.id));
                  } else {
                    setSelectedTracks([]);
                  }
                }}
                className={`rounded border-${theme.colors.border} text-${theme.colors.primary.main} focus:ring-${theme.colors.primary.main}`}
              />
            </div>
            <div className="col-span-4 flex items-center">Title</div>
            <div className="col-span-3 flex items-center">Artist</div>
            <div className="col-span-3 flex items-center">Album</div>
            <div className="col-span-1 flex items-center justify-end">Duration</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-700">
            {filteredAndSortedTracks.map((track, index) => (
              <div
                key={track.id}
                className={`grid grid-cols-12 gap-4 px-4 py-3 hover:bg-${theme.colors.background.tertiary} transition-colors cursor-pointer group ${
                  currentTrack?.id === track.id ? `bg-${theme.colors.background.tertiary}` : ""
                } ${selectedTracks.includes(track.id) ? `bg-${theme.colors.primary.main} bg-opacity-10` : ""}`}
                onClick={() => playTrack(track)}
              >
                {/* Selection & Index */}
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTracks.includes(track.id)}
                    onChange={() => toggleTrackSelection(track.id)}
                    className={`rounded border-${theme.colors.border} text-${theme.colors.primary.main} focus:ring-${theme.colors.primary.main} opacity-0 group-hover:opacity-100 transition-opacity`}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {!selectedTracks.includes(track.id) && (
                    <span className={`text-${theme.colors.text.muted} text-sm group-hover:hidden ${selectedTracks.includes(track.id) ? "hidden" : ""}`}>
                      {currentTrack?.id === track.id ? (
                        <FaPlay className={`text-${theme.colors.primary.main}`} />
                      ) : (
                        index + 1
                      )}
                    </span>
                  )}
                </div>

                {/* Title with Album Art */}
                <div className="col-span-4 flex items-center min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 mr-3">
                    {track.imageUrl ? (
                      <img
                        src={track.imageUrl}
                        alt={track.title}
                        className="w-10 h-10 rounded object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className={`w-10 h-10 bg-${theme.colors.background.main} rounded flex items-center justify-center`}>
                        <FaMusic className={`text-${theme.colors.text.muted} text-sm`} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p 
                      className={`font-medium truncate ${
                        currentTrack?.id === track.id 
                          ? `text-${theme.colors.primary.main}` 
                          : `text-${theme.colors.text.primary}`
                      }`}
                      title={track.title}
                    >
                      {track.title}
                    </p>
                  </div>
                </div>

                {/* Artist */}
                <div className="col-span-3 flex items-center">
                  <span 
                    className={`text-${theme.colors.text.muted} truncate`}
                    title={track.artist || "Unknown Artist"}
                  >
                    {track.artist || "Unknown Artist"}
                  </span>
                </div>

                {/* Album */}
                <div className="col-span-3 flex items-center">
                  <span 
                    className={`text-${theme.colors.text.muted} truncate`}
                    title={track.album || "Unknown Album"}
                  >
                    {track.album || "Unknown Album"}
                  </span>
                </div>

                {/* Duration & Actions */}
                <div className="col-span-1 flex items-center justify-end space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(track.id);
                    }}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                      playlists.favorites.includes(track.id) ? "text-red-500" : `text-${theme.colors.text.muted}`
                    } hover:text-red-500`}
                  >
                    {playlists.favorites.includes(track.id) ? (
                      <FaHeart className="h-3 w-3" />
                    ) : (
                      <FaRegHeart className="h-3 w-3" />
                    )}
                  </button>
                  <span className={`text-${theme.colors.text.muted} text-sm`}>
                    {formatTime(track.duration)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
