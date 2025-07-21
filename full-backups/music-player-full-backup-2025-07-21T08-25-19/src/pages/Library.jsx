import React, { useState, useEffect, useRef } from "react";
import { useMusic } from "../store/MusicContext";
import { useTheme } from "../store/ThemeContext";
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
} from "react-icons/fa";
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
      className={`p-6 h-full overflow-y-auto bg-${
        theme?.colors?.background?.main || "gray-900"
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1
            className={`text-3xl font-bold text-${
              theme?.colors?.text?.main || "white"
            }`}
          >
            Library
          </h1>
          <p className={`text-${theme?.colors?.text?.muted || "gray-400"}`}>
            {filteredTracks.length} tracks
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search library..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`w-full px-4 py-2 rounded-full bg-${
                theme?.colors?.background?.secondary || "gray-800"
              } text-${theme?.colors?.text?.main || "white"} border border-${
                theme?.colors?.border?.main || "gray-700"
              } focus:outline-none focus:ring-2 focus:ring-${
                theme?.colors?.primary?.main || "purple-500"
              }`}
            />
            {filter && (
              <button
                onClick={() => setFilter("")}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-${
                  theme?.colors?.text?.muted || "gray-400"
                } hover:text-${theme?.colors?.text?.main || "white"}`}
              >
                ×
              </button>
            )}
          </div>

          {/* Genre filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`px-4 py-2 rounded-full bg-${
                theme?.colors?.background?.secondary || "gray-800"
              } text-${theme?.colors?.text?.main || "white"} border border-${
                theme?.colors?.border?.main || "gray-700"
              } flex items-center`}
            >
              <FaFilter className="mr-2" />
              {selectedGenre === "all" ? "All Genres" : selectedGenre}
            </button>

            {showFilterMenu && (
              <div
                className={`absolute top-full left-0 mt-1 bg-${
                  theme?.colors?.background?.secondary || "gray-800"
                } border border-${
                  theme?.colors?.border?.main || "gray-700"
                } rounded-lg shadow-lg z-10 w-48 max-h-60 overflow-y-auto`}
              >
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => {
                      setSelectedGenre(genre);
                      setShowFilterMenu(false);
                    }}
                    className={`block w-full text-left px-4 py-2 hover:bg-${
                      theme?.colors?.background?.hover || "gray-700"
                    } ${
                      selectedGenre === genre
                        ? `bg-${
                            theme?.colors?.primary?.main || "purple-600"
                          } text-white`
                        : `text-${theme?.colors?.text?.main || "white"}`
                    }`}
                  >
                    {genre === "all" ? "All Genres" : genre}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View toggle */}
          <div
            className={`flex rounded-full bg-${
              theme?.colors?.background?.secondary || "gray-800"
            } p-1`}
          >
            <button
              onClick={() => {
                setView("grid");
                localStorage.setItem("musicPlayerViewMode", "grid");
              }}
              className={`px-3 py-1 rounded-full ${
                view === "grid"
                  ? `bg-${
                      theme?.colors?.primary?.main || "purple-600"
                    } text-white`
                  : `text-${theme?.colors?.text?.muted || "gray-400"}`
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => {
                setView("list");
                localStorage.setItem("musicPlayerViewMode", "list");
              }}
              className={`px-3 py-1 rounded-full ${
                view === "list"
                  ? `bg-${
                      theme?.colors?.primary?.main || "purple-600"
                    } text-white`
                  : `text-${theme?.colors?.text?.muted || "gray-400"}`
              }`}
            >
              List
            </button>
          </div>

          {/* Multi-select toggle */}
          <button
            onClick={() => {
              setMultiSelectMode(!multiSelectMode);
              if (multiSelectMode) setSelectedTracks([]);
            }}
            className={`px-4 py-2 rounded-full ${
              multiSelectMode
                ? `bg-${
                    theme?.colors?.primary?.main || "purple-600"
                  } text-white`
                : `bg-${
                    theme?.colors?.background?.secondary || "gray-800"
                  } text-${
                    theme?.colors?.text?.main || "white"
                  } border border-${theme?.colors?.border?.main || "gray-700"}`
            } flex items-center`}
          >
            {multiSelectMode ? (
              <FaCheck className="mr-2" />
            ) : (
              <FaPlus className="mr-2" />
            )}
            {multiSelectMode ? "Done" : "Select"}
          </button>

          {/* Play buttons */}
          <div className="flex space-x-2">
            <button
              onClick={playAllTracks}
              disabled={filteredTracks.length === 0}
              className={`px-4 py-2 rounded-full bg-${
                theme?.colors?.primary?.main || "purple-600"
              } hover:bg-${
                theme?.colors?.primary?.dark || "purple-700"
              } text-white flex items-center justify-center ${
                filteredTracks.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <FaPlay className="mr-2" /> Play All
            </button>

            <button
              onClick={playRandomTracks}
              disabled={filteredTracks.length === 0}
              className={`px-4 py-2 rounded-full bg-${
                theme?.colors?.background?.secondary || "gray-800"
              } hover:bg-${
                theme?.colors?.background?.hover || "gray-700"
              } text-${
                theme?.colors?.text?.main || "white"
              } flex items-center justify-center ${
                filteredTracks.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <FaRandom className="mr-2" /> Shuffle
            </button>
          </div>

          {/* Selection actions */}
          {multiSelectMode && selectedTracks.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={playSelectedTracks}
                className={`px-4 py-2 rounded-full bg-${
                  theme?.colors?.primary?.main || "purple-600"
                } hover:bg-${
                  theme?.colors?.primary?.dark || "purple-700"
                } text-white flex items-center justify-center`}
              >
                <FaPlay className="mr-2" /> Play Selected
              </button>

              <button
                onClick={addSelectedToFavorites}
                className={`px-4 py-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center`}
              >
                <FaHeart className="mr-2" /> Add to Favorites
              </button>

              <button
                onClick={() => setShowCreatePlaylistModal(true)}
                className={`px-4 py-2 rounded-full bg-${
                  theme?.colors?.background?.secondary || "gray-800"
                } hover:bg-${
                  theme?.colors?.background?.hover || "gray-700"
                } text-${
                  theme?.colors?.text?.main || "white"
                } flex items-center justify-center`}
              >
                <FaPlus className="mr-2" /> Create Playlist
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Playlist Modal */}
      {showCreatePlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div
            className={`bg-${
              theme?.colors?.background?.secondary || "gray-800"
            } rounded-xl p-6 w-full max-w-md`}
          >
            <h2
              className={`text-2xl font-bold mb-6 text-${
                theme?.colors?.text?.main || "white"
              }`}
            >
              Create Playlist from Selected Tracks
            </h2>

            <div className="mb-6">
              <label
                className={`block text-sm font-medium text-${
                  theme?.colors?.text?.muted || "gray-300"
                } mb-2`}
              >
                Playlist Name
              </label>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className={`w-full bg-${
                  theme?.colors?.background?.tertiary || "gray-700"
                } border border-${
                  theme?.colors?.border?.main || "gray-600"
                } rounded-lg px-4 py-2 text-${
                  theme?.colors?.text?.main || "white"
                } focus:ring-2 focus:ring-${
                  theme?.colors?.primary?.main || "purple-500"
                } focus:border-transparent`}
                placeholder="My New Playlist"
                autoFocus
              />
            </div>

            <div
              className={`mb-6 text-${
                theme?.colors?.text?.muted || "gray-400"
              }`}
            >
              {selectedTracks.length} tracks will be added to this playlist.
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowCreatePlaylistModal(false)}
                className={`px-4 py-2 text-${
                  theme?.colors?.text?.muted || "gray-400"
                } hover:text-${theme?.colors?.text?.main || "white"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
                className={`px-6 py-2 rounded-full bg-${
                  theme?.colors?.primary?.main || "purple-600"
                } hover:bg-${
                  theme?.colors?.primary?.dark || "purple-700"
                } text-white ${
                  !newPlaylistName.trim() ? "opacity-50 cursor-not-allowed" : ""
                }`}
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

      {filteredTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FaMusic
            className={`text-5xl text-${
              theme?.colors?.text?.muted || "gray-600"
            } mb-4`}
          />
          <h3
            className={`text-xl font-medium mb-2 text-${
              theme?.colors?.text?.main || "white"
            }`}
          >
            {filter ? "No matching tracks found" : "Your library is empty"}
          </h3>
          <p
            className={`text-${
              theme?.colors?.text?.muted || "gray-400"
            } text-center max-w-md`}
          >
            {filter
              ? `Try adjusting your search query.`
              : `Import music to start building your library.`}
          </p>
        </div>
      ) : view === "grid" ? (
        // Grid view
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTracks.map((track) => (
            <div
              key={track.id}
              className={`bg-${
                theme?.colors?.background?.secondary || "gray-800"
              } rounded-lg overflow-hidden hover:bg-${
                theme?.colors?.background?.hover || "gray-700"
              } transition-colors cursor-pointer group`}
            >
              <div className="relative" onClick={() => playTrack(track)}>
                {track.imageUrl ? (
                  <img
                    src={track.imageUrl}
                    alt={track.title}
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div
                    className={`w-full aspect-square bg-${
                      theme?.colors?.background?.tertiary || "gray-700"
                    } flex items-center justify-center`}
                  >
                    <FaMusic
                      className={`text-4xl text-${
                        theme?.colors?.text?.muted || "gray-500"
                      }`}
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all">
                    <button
                      className={`bg-${
                        theme?.colors?.primary?.main || "purple-600"
                      } text-white rounded-full p-3`}
                    >
                      <FaPlay className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3
                      className={`font-medium truncate text-${
                        theme?.colors?.text?.main || "white"
                      }`}
                    >
                      {track.title}
                    </h3>
                    <p
                      className={`text-sm text-${
                        theme?.colors?.text?.muted || "gray-400"
                      } truncate`}
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
                  className={`mt-2 text-xs text-${
                    theme?.colors?.text?.muted || "gray-500"
                  } flex justify-between`}
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
          className={`bg-${
            theme?.colors?.background?.secondary || "gray-800"
          } rounded-lg overflow-hidden`}
        >
          {/* Table header */}
          <div
            className={`grid grid-cols-12 gap-2 px-4 py-3 border-b border-${
              theme?.colors?.border?.main || "gray-700"
            } text-${
              theme?.colors?.text?.muted || "gray-400"
            } text-sm font-medium`}
          >
            <div className="col-span-1">#</div>
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
              onClick={() => playTrack(track)}
              className={`grid grid-cols-12 gap-2 px-4 py-2 hover:bg-${
                theme?.colors?.background?.hover || "gray-700"
              } ${
                currentTrack?.id === track.id
                  ? `bg-${theme?.colors?.background?.hover || "gray-700/50"}`
                  : ""
              } cursor-pointer text-${theme?.colors?.text?.main || "white"}`}
            >
              <div className="col-span-1 flex items-center">
                {currentTrack?.id === track.id ? (
                  <FaPlay
                    className={`text-${
                      theme?.colors?.primary?.main || "purple-500"
                    } text-sm`}
                  />
                ) : (
                  <span
                    className={`text-${
                      theme?.colors?.text?.muted || "gray-400"
                    }`}
                  >
                    {index + 1}
                  </span>
                )}
              </div>
              <div className="col-span-4 truncate flex items-center">
                <span
                  className={
                    currentTrack?.id === track.id
                      ? `text-${theme?.colors?.primary?.main || "purple-500"}`
                      : ""
                  }
                >
                  {track.title}
                </span>
              </div>
              <div
                className={`col-span-3 truncate text-${
                  theme?.colors?.text?.muted || "gray-400"
                }`}
              >
                {track.artist || "Unknown Artist"}
              </div>
              <div
                className={`col-span-3 truncate text-${
                  theme?.colors?.text?.muted || "gray-400"
                }`}
              >
                {track.album || "Unknown Album"}
              </div>
              <div className="col-span-1 flex items-center justify-end gap-3">
                <span
                  className={`text-${theme?.colors?.text?.muted || "gray-400"}`}
                >
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
