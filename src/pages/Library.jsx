import React, { useState, useEffect, useRef } from "react";
import { useMusic } from "../store/MusicContext";
import { useTheme } from "../store/ThemeContext";
import { LibraryToolbar } from "../components/LibraryToolbar";
import {
  FaPlay,
  FaMusic,
  FaHeart,
  FaRegHeart,
  FaEllipsisH,
  FaFilter,
  FaPlus,
  FaRandom,
  FaCheck,
  FaTrash,
  FaSearch,
  FaSpinner,
} from "react-icons/fa";
import {
  searchSongs,
  initializeMusicProvider,
} from "../utils/musicProviderService.js";
import { formatTime } from "../utils/audioUtils";
import { TrackContextMenu } from "../components/TrackContextMenu";

export const Library = () => {
  const {
    tracks,
    playTrack,
    currentTrack,
    isPlaying,
    playlists,
    toggleFavorite,
    setQueue,
    createPlaylist,
    addToPlaylist,
    deleteTrack,
  } = useMusic();
  const { theme } = useTheme();
  const [filter, setFilter] = useState("");
  const [streamingResults, setStreamingResults] = useState([]);
  const [isSearchingStreaming, setIsSearchingStreaming] = useState(false);
  const [streamingInitialized, setStreamingInitialized] = useState(false);
  // Load sort preferences from localStorage or use defaults
  const [sortBy, setSortBy] = useState(() => {
    const savedSort = localStorage.getItem("musicPlayerSortBy");
    return savedSort || "dateAdded"; // dateAdded, title, artist, album
  });

  const [sortDirection, setSortDirection] = useState(() => {
    const savedDirection = localStorage.getItem("musicPlayerSortDirection");
    return savedDirection || "desc"; // asc, desc
  });
  // Load view mode from localStorage or use default
  const [view, setView] = useState(() => {
    const savedView = localStorage.getItem("musicPlayerViewMode");
    return savedView || "grid"; // grid, list
  });
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [contextMenuTrack, setContextMenuTrack] = useState(null);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [multiSelectMode, setMultiSelectMode] = useState(false);

  // Extract unique genres
  const genres = [
    "all",
    ...new Set(tracks.map((track) => track.genre || "Unknown").filter(Boolean)),
  ];

  // Ref for tracking click outside context menu
  const contextMenuRef = useRef(null);

  // Initialize streaming provider
  useEffect(() => {
    async function initStreaming() {
      try {
        const success = await initializeMusicProvider();
        setStreamingInitialized(success);
      } catch (err) {
        console.error("Failed to initialize streaming provider:", err);
      }
    }

    initStreaming();
  }, []);

  // Search streaming services when filter changes
  useEffect(() => {
    const searchStreamingServices = async () => {
      if (!filter || filter.length < 3) {
        setStreamingResults([]);
        return;
      }

      setIsSearchingStreaming(true);
      try {
        const results = await searchSongs(filter);
        setStreamingResults(results);
      } catch (err) {
        console.error("Streaming search error:", err);
      } finally {
        setIsSearchingStreaming(false);
      }
    };

    // Use debounce to avoid too many requests
    const debounceTimer = setTimeout(searchStreamingServices, 500);
    return () => clearTimeout(debounceTimer);
  }, [filter]);

  // Filter and sort tracks
  const filteredTracks = tracks
    .filter((track) => {
      // Filter by search term
      const matchesSearch =
        !filter ||
        track.title?.toLowerCase().includes(filter.toLowerCase()) ||
        track.artist?.toLowerCase().includes(filter.toLowerCase()) ||
        track.album?.toLowerCase().includes(filter.toLowerCase());

      // Filter by genre
      const matchesGenre =
        selectedGenre === "all" || (track.genre || "Unknown") === selectedGenre;

      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
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
          comparison = new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

  // Play all tracks
  const playAllTracks = () => {
    if (filteredTracks.length > 0) {
      setQueue(filteredTracks, true);
    }
  };

  // Play selected tracks
  const playSelectedTracks = () => {
    if (selectedTracks.length > 0) {
      const tracksToPlay = tracks.filter((track) =>
        selectedTracks.includes(track.id)
      );
      setQueue(tracksToPlay, true);
    }
  };

  // Play random tracks
  const playRandomTracks = () => {
    if (filteredTracks.length > 0) {
      // Create a copy and shuffle it
      const shuffledTracks = [...filteredTracks].sort(
        () => Math.random() - 0.5
      );
      setQueue(shuffledTracks, true);
    }
  };

  // Toggle sort direction
  const toggleSortDirection = () => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
    localStorage.setItem("musicPlayerSortDirection", newDirection);
  };

  // Change sort field
  const handleSortChange = (field) => {
    if (sortBy === field) {
      toggleSortDirection();
    } else {
      setSortBy(field);
      const newDirection = "asc";
      setSortDirection(newDirection);
      localStorage.setItem("musicPlayerSortBy", field);
      localStorage.setItem("musicPlayerSortDirection", newDirection);
    }
  };

  // Toggle track selection
  const toggleTrackSelection = (trackId, event) => {
    // If shift key is pressed and there are already selected tracks
    if (event && event.shiftKey && selectedTracks.length > 0) {
      const lastSelectedId = selectedTracks[selectedTracks.length - 1];
      const allTrackIds = filteredTracks.map((t) => t.id);
      const lastSelectedIndex = allTrackIds.indexOf(lastSelectedId);
      const currentIndex = allTrackIds.indexOf(trackId);

      if (lastSelectedIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastSelectedIndex, currentIndex);
        const end = Math.max(lastSelectedIndex, currentIndex);
        const rangeIds = allTrackIds.slice(start, end + 1);

        // Add all tracks in range to selection
        setSelectedTracks((prev) => {
          const newSelection = [...prev];
          rangeIds.forEach((id) => {
            if (!newSelection.includes(id)) {
              newSelection.push(id);
            }
          });
          return newSelection;
        });
        return;
      }
    }

    // Normal toggle behavior
    setSelectedTracks((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
  };

  // Select all tracks
  const selectAllTracks = () => {
    if (selectedTracks.length === filteredTracks.length) {
      // If all are selected, deselect all
      setSelectedTracks([]);
    } else {
      // Otherwise select all
      setSelectedTracks(filteredTracks.map((track) => track.id));
    }
  };

  // Delete selected tracks
  const deleteSelectedTracks = () => {
    if (selectedTracks.length > 0) {
      if (
        confirm(
          `Are you sure you want to delete ${selectedTracks.length} tracks?`
        )
      ) {
        selectedTracks.forEach((trackId) => {
          deleteTrack(trackId);
        });
        setSelectedTracks([]);
      }
    }
  };

  // Handle context menu
  const handleContextMenu = (e, track) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuTrack(track);
    setShowContextMenu(true);
  };

  // Close context menu
  const closeContextMenu = () => {
    setShowContextMenu(false);
  };

  // Create playlist from selected tracks
  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim() && selectedTracks.length > 0) {
      const playlistId = createPlaylist(newPlaylistName);
      addToPlaylist(playlistId, selectedTracks);
      setNewPlaylistName("");
      setShowCreatePlaylistModal(false);
      setSelectedTracks([]);
    }
  };

  // Add selected tracks to favorites
  const addSelectedToFavorites = () => {
    selectedTracks.forEach((trackId) => {
      if (!playlists.favorites.includes(trackId)) {
        toggleFavorite(trackId);
      }
    });
    setSelectedTracks([]);
  };

  // Toggle view mode
  const toggleView = (viewMode) => {
    setView(viewMode);
    localStorage.setItem("musicPlayerViewMode", viewMode);
  };

  // Toggle multi-select mode
  const toggleMultiSelectMode = () => {
    setMultiSelectMode(!multiSelectMode);
    if (multiSelectMode) setSelectedTracks([]);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showContextMenu &&
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target)
      ) {
        setShowContextMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showContextMenu]);

  return (
    <div
      className="p-6 h-full overflow-y-auto"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Library</h1>
          <p style={{ color: "var(--text-muted)" }}>
            {filteredTracks.length} tracks
          </p>
        </div>

        {/* Library Toolbar */}
        <LibraryToolbar
          selectedTracks={selectedTracks}
          filteredTracks={filteredTracks}
          onPlayAll={playAllTracks}
          onPlaySelected={playSelectedTracks}
          onPlayRandom={playRandomTracks}
          onSelectAll={selectAllTracks}
          onDeleteSelected={deleteSelectedTracks}
          onAddToFavorites={addSelectedToFavorites}
          onCreatePlaylist={() => setShowCreatePlaylistModal(true)}
          multiSelectMode={multiSelectMode}
          onToggleMultiSelect={toggleMultiSelectMode}
          onToggleView={toggleView}
          currentView={view}
          onFilterChange={setFilter}
          filter={filter}
        />
      </div>

      {/* Create Playlist Modal */}
      {showCreatePlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div
            className="bg-gray-800 rounded-xl p-6 w-full max-w-md"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <h2 className="text-2xl font-bold mb-6 text-white">
              Create Playlist from Selected Tracks
            </h2>

            <div className="mb-6">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                Playlist Name
              </label>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full rounded-lg px-4 py-2 text-white focus:ring-2 focus:border-transparent"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-color)",
                }}
                placeholder="My New Playlist"
                autoFocus
              />
            </div>

            <div className="mb-6" style={{ color: "var(--text-muted)" }}>
              {selectedTracks.length} tracks will be added to this playlist.
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowCreatePlaylistModal(false)}
                className="px-4 py-2 hover:text-white"
                style={{ color: "var(--text-muted)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
                className="px-6 py-2 rounded-full text-white"
                style={{
                  backgroundColor: "var(--accent-color)",
                  opacity: !newPlaylistName.trim() ? 0.5 : 1,
                  cursor: !newPlaylistName.trim() ? "not-allowed" : "pointer",
                }}
              >
                Create Playlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {showContextMenu && contextMenuTrack && (
        <TrackContextMenu
          track={contextMenuTrack}
          position={contextMenuPosition}
          onClose={closeContextMenu}
        />
      )}

      {/* Streaming search results */}
      {streamingResults.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-white">
            Streaming Results
          </h2>
          <div
            className="grid grid-cols-1 gap-2 mb-6"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            {streamingResults.map((song) => (
              <div
                key={song.id}
                className="p-3 flex items-center hover:bg-opacity-10 hover:bg-white"
                style={{ borderBottom: "1px solid var(--border-color)" }}
              >
                <div className="flex-shrink-0 mr-3">
                  <img
                    src={song.imageUrl || song.coverArt}
                    alt={song.title}
                    className="w-12 h-12 object-cover rounded"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/album-placeholder.svg";
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <div className="font-medium text-white">{song.title}</div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {song.artist} • {song.album || "Unknown Album"}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Provider: {song.provider}
                  </div>
                </div>
                <div className="flex-shrink-0 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(song.id, song);
                    }}
                    className="p-2 rounded-full"
                    style={{
                      color: playlists.favorites.includes(song.id)
                        ? "#ff6b6b"
                        : "var(--text-muted)",
                    }}
                    title={
                      playlists.favorites.includes(song.id)
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    {playlists.favorites.includes(song.id) ? (
                      <FaHeart />
                    ) : (
                      <FaRegHeart />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToQueue(song);
                    }}
                    className="p-2 rounded-full"
                    style={{ color: "var(--text-muted)" }}
                    title="Add to queue"
                  >
                    <FaPlus />
                  </button>
                  <button
                    onClick={() => playTrack(song)}
                    className="p-2 rounded-full"
                    style={{ color: "var(--text-muted)" }}
                    title="Play now"
                  >
                    <FaPlay />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading indicator for streaming search */}
      {isSearchingStreaming && (
        <div
          className="flex items-center justify-center py-4 mb-6"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <FaSpinner className="animate-spin mr-2 text-white" />
          <span className="text-white">Searching streaming services...</span>
        </div>
      )}

      {/* Local library results */}
      <h2 className="text-xl font-bold mb-4 text-white">Your Library</h2>

      {filteredTracks.length === 0 && streamingResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FaMusic
            className="text-5xl mb-4"
            style={{ color: "var(--text-muted)" }}
          />
          <h3 className="text-xl font-medium mb-2 text-white">
            {filter ? "No matching tracks found" : "Your library is empty"}
          </h3>
          <p
            className="text-center max-w-md"
            style={{ color: "var(--text-muted)" }}
          >
            {filter
              ? `Try adjusting your search query.`
              : `Import music to start building your library.`}
          </p>
        </div>
      ) : filteredTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-center text-white">
            No local tracks match your search.
          </p>
        </div>
      ) : view === "grid" ? (
        // Grid view
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTracks.map((track) => (
            <div
              key={track.id}
              className="rounded-lg overflow-hidden transition-colors cursor-pointer group relative"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              {/* Selection checkbox - only visible in multi-select mode */}
              {multiSelectMode && (
                <div
                  className="absolute top-2 left-2 z-10 p-1 rounded-full"
                  style={{
                    backgroundColor: selectedTracks.includes(track.id)
                      ? "var(--accent-color)"
                      : "rgba(0, 0, 0, 0.5)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTrackSelection(track.id);
                  }}
                >
                  <FaCheck
                    className={`text-white ${
                      selectedTracks.includes(track.id)
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />
                </div>
              )}

              <div
                className="relative"
                onClick={(e) => {
                  if (multiSelectMode) {
                    toggleTrackSelection(track.id, e);
                  } else {
                    playTrack(track);
                  }
                }}
              >
                {track.imageUrl ? (
                  <img
                    src={track.imageUrl}
                    alt={track.title}
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div
                    className="w-full aspect-square flex items-center justify-center"
                    style={{ backgroundColor: "var(--bg-tertiary)" }}
                  >
                    <FaMusic
                      className="text-4xl"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all">
                    {!multiSelectMode && (
                      <button
                        className="rounded-full p-3 text-white"
                        style={{ backgroundColor: "var(--accent-color)" }}
                      >
                        <FaPlay className="h-6 w-6" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium truncate text-white">
                      {track.title}
                    </h3>
                    <p
                      className="text-sm truncate"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {track.artist || "Unknown Artist"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorite(track.id)}
                      className="text-pink-500 hover:text-pink-400 transition-colors"
                    >
                      {playlists.favorites.includes(track.id) ? (
                        <FaHeart />
                      ) : (
                        <FaRegHeart />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm("Are you sure you want to delete this track?")
                        ) {
                          deleteTrack(track.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-400 transition-colors"
                      title="Delete track"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div
                  className="mt-2 text-xs flex justify-between"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span>{track.album || "Unknown Album"}</span>
                  <span>{formatTime(track.duration)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List view
        <div
          className="rounded-lg overflow-hidden"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-12 gap-2 px-4 py-3 text-sm font-medium"
            style={{
              borderBottom: "1px solid var(--border-color)",
              color: "var(--text-muted)",
            }}
          >
            <div className="col-span-1">
              {multiSelectMode ? (
                <button
                  onClick={selectAllTracks}
                  className="p-1 rounded"
                  style={{
                    backgroundColor:
                      selectedTracks.length === filteredTracks.length
                        ? "var(--accent-color)"
                        : "transparent",
                  }}
                >
                  <FaCheck
                    className={`text-white ${
                      selectedTracks.length === filteredTracks.length
                        ? "opacity-100"
                        : "opacity-50"
                    }`}
                    size={12}
                  />
                </button>
              ) : (
                "#"
              )}
            </div>
            <div className="col-span-4">
              <button
                onClick={() => handleSortChange("title")}
                className="flex items-center hover:text-white"
              >
                Title{" "}
                {sortBy === "title" && (sortDirection === "asc" ? "↑" : "↓")}
              </button>
            </div>
            <div className="col-span-3">
              <button
                onClick={() => handleSortChange("artist")}
                className="flex items-center hover:text-white"
              >
                Artist{" "}
                {sortBy === "artist" && (sortDirection === "asc" ? "↑" : "↓")}
              </button>
            </div>
            <div className="col-span-3">
              <button
                onClick={() => handleSortChange("album")}
                className="flex items-center hover:text-white"
              >
                Album{" "}
                {sortBy === "album" && (sortDirection === "asc" ? "↑" : "↓")}
              </button>
            </div>
            <div className="col-span-1 text-right">
              <button
                onClick={() => handleSortChange("duration")}
                className="flex items-center justify-end hover:text-white"
              >
                Time{" "}
                {sortBy === "duration" && (sortDirection === "asc" ? "↑" : "↓")}
              </button>
            </div>
          </div>

          {/* Table body */}
          {filteredTracks.map((track, index) => (
            <div
              key={track.id}
              onClick={(e) => {
                if (multiSelectMode) {
                  toggleTrackSelection(track.id, e);
                } else {
                  playTrack(track);
                }
              }}
              className={`grid grid-cols-12 gap-2 px-4 py-2 cursor-pointer text-white ${
                selectedTracks.includes(track.id)
                  ? "bg-purple-900 bg-opacity-30"
                  : currentTrack?.id === track.id
                  ? "bg-gray-700/50"
                  : ""
              }`}
              style={{
                backgroundColor: selectedTracks.includes(track.id)
                  ? "var(--accent-color-dark)"
                  : currentTrack?.id === track.id
                  ? "var(--bg-hover)"
                  : "transparent",
                opacity: selectedTracks.includes(track.id) ? 0.9 : 1,
              }}
              onContextMenu={(e) => handleContextMenu(e, track)}
            >
              <div className="col-span-1 flex items-center">
                {multiSelectMode ? (
                  <div
                    className="p-1 rounded"
                    style={{
                      backgroundColor: selectedTracks.includes(track.id)
                        ? "var(--accent-color)"
                        : "transparent",
                    }}
                  >
                    <FaCheck
                      className={`text-white ${
                        selectedTracks.includes(track.id)
                          ? "opacity-100"
                          : "opacity-50"
                      }`}
                      size={12}
                    />
                  </div>
                ) : currentTrack?.id === track.id ? (
                  <FaPlay
                    className="text-sm"
                    style={{ color: "var(--accent-color)" }}
                  />
                ) : (
                  <span style={{ color: "var(--text-muted)" }}>
                    {index + 1}
                  </span>
                )}
              </div>
              <div className="col-span-4 truncate flex items-center">
                <span
                  className={
                    currentTrack?.id === track.id ? "text-purple-500" : ""
                  }
                  style={{
                    color:
                      currentTrack?.id === track.id
                        ? "var(--accent-color)"
                        : "inherit",
                  }}
                >
                  {track.title}
                </span>
              </div>
              <div
                className="col-span-3 truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {track.artist || "Unknown Artist"}
              </div>
              <div
                className="col-span-3 truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {track.album || "Unknown Album"}
              </div>
              <div className="col-span-1 flex items-center justify-end gap-3">
                <span style={{ color: "var(--text-muted)" }}>
                  {formatTime(track.duration)}
                </span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(track.id);
                    }}
                    className="text-pink-500 hover:text-pink-400 transition-colors"
                  >
                    {playlists.favorites.includes(track.id) ? (
                      <FaHeart />
                    ) : (
                      <FaRegHeart />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e, track);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FaEllipsisH />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
