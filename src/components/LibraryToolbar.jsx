import React from "react";
import {
  FaPlay,
  FaRandom,
  FaCheck,
  FaTrash,
  FaFilter,
  FaPlus,
  FaHeart,
  FaSort,
  FaList,
  FaTh,
} from "react-icons/fa";

/**
 * LibraryToolbar component - Provides controls for the library view
 *
 * @param {Object} props - Component props
 * @param {Array} props.selectedTracks - Array of selected track IDs
 * @param {Array} props.filteredTracks - Array of filtered tracks
 * @param {Function} props.onPlayAll - Handler for playing all tracks
 * @param {Function} props.onPlaySelected - Handler for playing selected tracks
 * @param {Function} props.onPlayRandom - Handler for playing random tracks
 * @param {Function} props.onSelectAll - Handler for selecting all tracks
 * @param {Function} props.onDeleteSelected - Handler for deleting selected tracks
 * @param {Function} props.onAddToFavorites - Handler for adding selected tracks to favorites
 * @param {Function} props.onCreatePlaylist - Handler for creating a playlist from selected tracks
 * @param {boolean} props.multiSelectMode - Whether multi-select mode is active
 * @param {Function} props.onToggleMultiSelect - Handler for toggling multi-select mode
 * @param {Function} props.onToggleView - Handler for toggling between grid and list views
 * @param {string} props.currentView - Current view mode ('grid' or 'list')
 * @param {Function} props.onFilterChange - Handler for filter changes
 * @param {string} props.filter - Current filter text
 */
export const LibraryToolbar = ({
  selectedTracks = [],
  filteredTracks = [],
  onPlayAll,
  onPlaySelected,
  onPlayRandom,
  onSelectAll,
  onDeleteSelected,
  onAddToFavorites,
  onCreatePlaylist,
  multiSelectMode,
  onToggleMultiSelect,
  onToggleView,
  currentView,
  onFilterChange,
  filter,
}) => {
  // Calculate if all tracks are selected
  const allSelected =
    selectedTracks.length > 0 &&
    selectedTracks.length === filteredTracks.length;

  return (
    <div className="flex flex-wrap gap-3 w-full md:w-auto mb-4">
      {/* Search */}
      <div className="relative flex-grow">
        <input
          type="text"
          placeholder="Search library..."
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="w-full px-4 py-2 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--bg-secondary)",
          }}
        />
        {filter && (
          <button
            onClick={() => onFilterChange("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            ×
          </button>
        )}
      </div>

      {/* View toggle */}
      <div
        className="flex rounded-full bg-gray-800"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <button
          onClick={() => onToggleView("grid")}
          className={`px-3 py-1 rounded-full ${
            currentView === "grid"
              ? "bg-purple-600 text-white"
              : "text-gray-400"
          }`}
          style={{
            backgroundColor:
              currentView === "grid" ? "var(--accent-color)" : "transparent",
            color: currentView === "grid" ? "white" : "var(--text-muted)",
          }}
        >
          <FaTh className="inline mr-1" /> Grid
        </button>
        <button
          onClick={() => onToggleView("list")}
          className={`px-3 py-1 rounded-full ${
            currentView === "list"
              ? "bg-purple-600 text-white"
              : "text-gray-400"
          }`}
          style={{
            backgroundColor:
              currentView === "list" ? "var(--accent-color)" : "transparent",
            color: currentView === "list" ? "white" : "var(--text-muted)",
          }}
        >
          <FaList className="inline mr-1" /> List
        </button>
      </div>

      {/* Multi-select toggle */}
      <button
        onClick={onToggleMultiSelect}
        className={`px-4 py-2 rounded-full ${
          multiSelectMode
            ? "bg-purple-600 text-white"
            : "bg-gray-800 text-white border border-gray-700"
        } flex items-center`}
        style={{
          backgroundColor: multiSelectMode
            ? "var(--accent-color)"
            : "var(--bg-secondary)",
          borderColor: "var(--border-color)",
        }}
      >
        {multiSelectMode ? (
          <FaCheck className="mr-2" />
        ) : (
          <FaPlus className="mr-2" />
        )}
        {multiSelectMode ? "Done" : "Select"}
      </button>

      {/* Select All button - only visible in multi-select mode */}
      {multiSelectMode && (
        <button
          onClick={onSelectAll}
          className={`px-4 py-2 rounded-full bg-gray-800 text-white border border-gray-700 flex items-center`}
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
            color: allSelected ? "var(--accent-color)" : "white",
          }}
        >
          <FaCheck className="mr-2" />
          {allSelected ? "Deselect All" : "Select All"}
        </button>
      )}

      {/* Delete Selected button - only visible in multi-select mode with selections */}
      {multiSelectMode && selectedTracks.length > 0 && (
        <button
          onClick={onDeleteSelected}
          className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center"
        >
          <FaTrash className="mr-2" />
          Delete ({selectedTracks.length})
        </button>
      )}

      {/* Play buttons */}
      <div className="flex space-x-2">
        <button
          onClick={onPlayAll}
          disabled={filteredTracks.length === 0}
          className={`px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center ${
            filteredTracks.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          style={{ backgroundColor: "var(--accent-color)" }}
        >
          <FaPlay className="mr-2" /> Play All
        </button>

        <button
          onClick={onPlayRandom}
          disabled={filteredTracks.length === 0}
          className={`px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center ${
            filteredTracks.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <FaRandom className="mr-2" /> Shuffle
        </button>
      </div>

      {/* Selection actions - only visible in multi-select mode with selections */}
      {multiSelectMode && selectedTracks.length > 0 && (
        <div className="flex space-x-2">
          <button
            onClick={onPlaySelected}
            className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center"
            style={{ backgroundColor: "var(--accent-color)" }}
          >
            <FaPlay className="mr-2" /> Play Selected
          </button>

          <button
            onClick={onAddToFavorites}
            className="px-4 py-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center"
          >
            <FaHeart className="mr-2" /> Add to Favorites
          </button>

          <button
            onClick={onCreatePlaylist}
            className="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <FaPlus className="mr-2" /> Create Playlist
          </button>
        </div>
      )}
    </div>
  );
};
