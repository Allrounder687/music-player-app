import React, { useState, useEffect, useCallback } from "react";
import { useMusic } from "../store/MusicContext";
import { useTheme } from "../store/ThemeContext";
import {
  FaPlay,
  FaPause,
  FaTrash,
  FaPlus,
  FaArrowLeft,
  FaEllipsisH,
  FaMusic,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import { formatTime } from "../utils/audioUtils";

export const PlaylistDetail = ({ playlistId, onBack }) => {
  const {
    getPlaylistTracks,
    getAllPlaylists,
    playTrack,
    currentTrack,
    isPlaying,
    toggleFavorite,
    playlists,
    removeFromPlaylist,
    setQueue,
    addToPlaylist,
    getTrackById,
    tracks: allTracks,
  } = useMusic();
  const { theme } = useTheme();

  const [tracks, setTracks] = useState([]);
  const [playlist, setPlaylist] = useState(null);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [availableTracks, setAvailableTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [draggedTrack, setDraggedTrack] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  // Load playlist data
  useEffect(() => {
    const loadPlaylist = () => {
      try {
        const allPlaylists = getAllPlaylists();
        const currentPlaylist = allPlaylists.find((p) => p.id === playlistId);

        if (currentPlaylist) {
          setPlaylist(currentPlaylist);
          const playlistTracks = getPlaylistTracks(playlistId);
          setTracks(playlistTracks);
        }
      } catch (error) {
        console.error("Error loading playlist:", error);
      }
    };

    loadPlaylist();
  }, [playlistId, getPlaylistTracks, getAllPlaylists, playlists]);

  // Filter and sort tracks
  const filteredTracks = tracks
    .filter((track) => {
      if (!filter) return true;
      const searchTerm = filter.toLowerCase();
      return (
        track.title?.toLowerCase().includes(searchTerm) ||
        track.artist?.toLowerCase().includes(searchTerm) ||
        track.album?.toLowerCase().includes(searchTerm)
      );
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

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  // Change sort field
  const handleSortChange = (field) => {
    if (sortBy === field) {
      toggleSortDirection();
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  // Play all tracks
  const playAllTracks = () => {
    if (filteredTracks.length > 0) {
      setQueue(filteredTracks, true);
    }
  };

  // Remove track from playlist
  const handleRemoveTrack = (trackId) => {
    removeFromPlaylist(playlistId, trackId);
    // Update local state to avoid re-fetching
    setTracks(tracks.filter((track) => track.id !== trackId));
  };

  // Show add track modal
  const handleShowAddTrackModal = () => {
    // Get tracks that aren't already in the playlist
    const playlistTrackIds = tracks.map((track) => track.id);
    const tracksToAdd = allTracks.filter(
      (track) => !playlistTrackIds.includes(track.id)
    );
    setAvailableTracks(tracksToAdd);
    setSelectedTracks([]);
    setShowAddTrackModal(true);
  };

  // Add selected tracks to playlist
  const handleAddTracks = () => {
    if (selectedTracks.length > 0) {
      addToPlaylist(playlistId, selectedTracks);

      // Update local state
      const newTracks = selectedTracks
        .map((id) => getTrackById(id))
        .filter(Boolean);
      setTracks([...tracks, ...newTracks]);

      setShowAddTrackModal(false);
      setSelectedTracks([]);
    }
  };

  // Toggle track selection
  const toggleTrackSelection = (trackId) => {
    setSelectedTracks((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
  };

  // Drag and drop handlers
  const handleDragStart = (track) => {
    setDraggedTrack(track);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDropTarget(index);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (!draggedTrack) return;

    // Get current index of dragged track
    const currentIndex = tracks.findIndex((t) => t.id === draggedTrack.id);
    if (currentIndex === -1 || currentIndex === targetIndex) return;

    // Create new array with reordered tracks
    const newTracks = [...tracks];
    const [removed] = newTracks.splice(currentIndex, 1);
    newTracks.splice(targetIndex, 0, removed);

    // Update state
    setTracks(newTracks);
    setDraggedTrack(null);
    setDropTarget(null);

    // TODO: In a real app, you would persist this order to the backend
  };

  const handleDragEnd = () => {
    setDraggedTrack(null);
    setDropTarget(null);
  };

  if (!playlist) {
    return (
      <div
        className={`p-6 h-full flex items-center justify-center text-${
          theme?.colors?.text?.muted || "gray-400"
        }`}
      >
        <FaMusic className="text-4xl mr-3" />
        <span>Playlist not found</span>
      </div>
    );
  }

  return (
    <div
      className={`p-6 h-full overflow-y-auto bg-${
        theme?.colors?.background?.main || "gray-900"
      }`}
    >
      {/* Header */}
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className={`mr-4 text-${
            theme?.colors?.text?.muted || "gray-400"
          } hover:text-${
            theme?.colors?.text?.main || "white"
          } transition-colors`}
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <h1
          className={`text-3xl font-bold text-${
            theme?.colors?.text?.main || "white"
          }`}
        >
          {playlist.name}
        </h1>
      </div>

      {/* Playlist info and actions */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-48 lg:w-64 flex-shrink-0">
          <div
            className={`aspect-square bg-${
              theme?.colors?.background?.secondary || "gray-800"
            } rounded-lg overflow-hidden shadow-lg`}
          >
            {playlist.imageUrl ? (
              <img
                src={playlist.imageUrl}
                alt={playlist.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/album-placeholder.svg";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-gray-800">
                <FaMusic
                  className={`text-5xl text-${
                    theme?.colors?.text?.muted || "gray-400"
                  }`}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-4">
            <p
              className={`text-${
                theme?.colors?.text?.muted || "gray-400"
              } mb-2`}
            >
              {filteredTracks.length}{" "}
              {filteredTracks.length === 1 ? "track" : "tracks"} ·{" "}
              {formatTime(
                filteredTracks.reduce(
                  (total, track) => total + (track.duration || 0),
                  0
                )
              )}{" "}
              total time
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={playAllTracks}
                disabled={filteredTracks.length === 0}
                className={`px-6 py-2 rounded-full bg-${
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
                onClick={handleShowAddTrackModal}
                className={`px-6 py-2 rounded-full bg-${
                  theme?.colors?.background?.secondary || "gray-800"
                } hover:bg-${
                  theme?.colors?.background?.hover || "gray-700"
                } text-${
                  theme?.colors?.text?.main || "white"
                } flex items-center justify-center`}
              >
                <FaPlus className="mr-2" /> Add Tracks
              </button>
            </div>
          </div>

          {/* Search and filter */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Filter tracks..."
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
        </div>
      </div>

      {/* Track list */}
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
            {filter ? "No matching tracks found" : "This playlist is empty"}
          </h3>
          <p
            className={`text-${
              theme?.colors?.text?.muted || "gray-400"
            } text-center max-w-md`}
          >
            {filter
              ? `Try adjusting your search query.`
              : `Add some tracks to get started.`}
          </p>
          {!filter && (
            <button
              onClick={handleShowAddTrackModal}
              className={`mt-4 px-6 py-2 rounded-full bg-${
                theme?.colors?.primary?.main || "purple-600"
              } hover:bg-${
                theme?.colors?.primary?.dark || "purple-700"
              } text-white flex items-center justify-center`}
            >
              <FaPlus className="mr-2" /> Add Tracks
            </button>
          )}
        </div>
      ) : (
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
              draggable
              onDragStart={() => handleDragStart(track)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`grid grid-cols-12 gap-2 px-4 py-2 hover:bg-${
                theme?.colors?.background?.hover || "gray-700"
              } ${
                currentTrack?.id === track.id
                  ? `bg-${theme?.colors?.background?.hover || "gray-700/50"}`
                  : ""
              } ${draggedTrack?.id === track.id ? "opacity-50" : ""} ${
                dropTarget === index
                  ? `border-t-2 border-${
                      theme?.colors?.primary?.main || "purple-500"
                    }`
                  : ""
              } cursor-pointer text-${
                theme?.colors?.text?.main || "white"
              } group`}
              onClick={() => playTrack(track)}
            >
              <div className="col-span-1 flex items-center">
                {currentTrack?.id === track.id && isPlaying ? (
                  <FaPlay
                    className={`text-${
                      theme?.colors?.primary?.main || "purple-500"
                    } text-sm`}
                  />
                ) : (
                  <span
                    className={`text-${
                      theme?.colors?.text?.muted || "gray-400"
                    } group-hover:hidden`}
                  >
                    {index + 1}
                  </span>
                )}
                <FaPlay className="hidden group-hover:block text-sm" />
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
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      handleRemoveTrack(track.id);
                    }}
                    className={`text-${
                      theme?.colors?.text?.muted || "gray-400"
                    } hover:text-${
                      theme?.colors?.text?.main || "white"
                    } transition-colors`}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Track Modal */}
      {showAddTrackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div
            className={`bg-${
              theme?.colors?.background?.secondary || "gray-800"
            } rounded-xl p-6 w-full max-w-3xl max-h-[80vh] flex flex-col`}
          >
            <h2
              className={`text-2xl font-bold mb-4 text-${
                theme?.colors?.text?.main || "white"
              }`}
            >
              Add Tracks to {playlist.name}
            </h2>

            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search tracks..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`w-full px-4 py-2 rounded-full bg-${
                  theme?.colors?.background?.tertiary || "gray-700"
                } text-${theme?.colors?.text?.main || "white"} border border-${
                  theme?.colors?.border?.main || "gray-600"
                } focus:outline-none focus:ring-2 focus:ring-${
                  theme?.colors?.primary?.main || "purple-500"
                }`}
              />
            </div>

            <div className="flex-1 overflow-y-auto mb-4">
              {availableTracks.length === 0 ? (
                <div
                  className={`p-4 text-center text-${
                    theme?.colors?.text?.muted || "gray-400"
                  }`}
                >
                  No tracks available to add
                </div>
              ) : (
                <div
                  className={`bg-${
                    theme?.colors?.background?.tertiary || "gray-700"
                  } rounded-lg overflow-hidden`}
                >
                  {availableTracks
                    .filter((track) => {
                      if (!filter) return true;
                      const searchTerm = filter.toLowerCase();
                      return (
                        track.title?.toLowerCase().includes(searchTerm) ||
                        track.artist?.toLowerCase().includes(searchTerm) ||
                        track.album?.toLowerCase().includes(searchTerm)
                      );
                    })
                    .map((track) => (
                      <div
                        key={track.id}
                        className={`flex items-center px-4 py-2 hover:bg-${
                          theme?.colors?.background?.hover || "gray-600"
                        } cursor-pointer`}
                        onClick={() => toggleTrackSelection(track.id)}
                      >
                        <div
                          className={`w-5 h-5 mr-3 flex items-center justify-center rounded border border-${
                            theme?.colors?.border?.main || "gray-500"
                          } ${
                            selectedTracks.includes(track.id)
                              ? `bg-${
                                  theme?.colors?.primary?.main || "purple-600"
                                } border-${
                                  theme?.colors?.primary?.main || "purple-600"
                                }`
                              : ""
                          }`}
                        >
                          {selectedTracks.includes(track.id) && (
                            <FaCheck className="text-white text-xs" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div
                            className={`font-medium text-${
                              theme?.colors?.text?.main || "white"
                            }`}
                          >
                            {track.title}
                          </div>
                          <div
                            className={`text-sm text-${
                              theme?.colors?.text?.muted || "gray-400"
                            }`}
                          >
                            {track.artist || "Unknown Artist"} •{" "}
                            {track.album || "Unknown Album"}
                          </div>
                        </div>
                        <div
                          className={`text-${
                            theme?.colors?.text?.muted || "gray-400"
                          }`}
                        >
                          {formatTime(track.duration)}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div
                className={`text-${theme?.colors?.text?.muted || "gray-400"}`}
              >
                {selectedTracks.length} tracks selected
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddTrackModal(false)}
                  className={`px-4 py-2 text-${
                    theme?.colors?.text?.muted || "gray-400"
                  } hover:text-${theme?.colors?.text?.main || "white"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTracks}
                  disabled={selectedTracks.length === 0}
                  className={`px-6 py-2 rounded-full bg-${
                    theme?.colors?.primary?.main || "purple-600"
                  } hover:bg-${
                    theme?.colors?.primary?.dark || "purple-700"
                  } text-white ${
                    selectedTracks.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Add {selectedTracks.length} Tracks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
