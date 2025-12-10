import React, { useState, useCallback } from "react";
import { useMusic } from "../store/MusicContext";
import { useTheme } from "../store/ThemeContext";
import {
  FaPlay,
  FaPause,
  FaHeart,
  FaEllipsisH,
  FaMusic,
  FaFilter,
  FaSort,
  FaSearch,
  FaTrash,
  FaRegHeart,
} from "react-icons/fa";
import { formatTime } from "../utils/audioUtils";

export const Favourites = () => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    toggleFavorite,
    getFavoriteTracks,
    setQueue,
  } = useMusic();
  const { theme } = useTheme();

  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded");
  const [sortDirection, setSortDirection] = useState("desc");
  const [view, setView] = useState("grid");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("all");

  // Get all favorite tracks
  const allFavoriteTracks = getFavoriteTracks();

  // Extract unique genres
  const genres = [
    "all",
    ...new Set(
      allFavoriteTracks.map((track) => track.genre || "Unknown").filter(Boolean)
    ),
  ];

  // Filter and sort tracks
  const favoriteTracks = allFavoriteTracks
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
          // Assuming tracks have a dateAdded property, or fallback to 0
          comparison = new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

  const handlePlayTrack = (track) => {
    playTrack(track);
  };

  const handlePlayAll = () => {
    if (favoriteTracks.length > 0) {
      setQueue(favoriteTracks);
    }
  };

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

  // Remove all favorites
  const handleRemoveAllFavorites = () => {
    if (window.confirm("Are you sure you want to remove all favorites?")) {
      favoriteTracks.forEach((track) => toggleFavorite(track.id));
    }
  };

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
            Favourites
          </h1>
          <p className={`text-${theme?.colors?.text?.muted || "gray-400"}`}>
            {favoriteTracks.length} tracks
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search favorites..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`px-4 py-2 rounded-full bg-${
                theme?.colors?.background?.secondary || "gray-800"
              } text-${theme?.colors?.text?.main || "white"} border border-${
                theme?.colors?.border?.main || "gray-700"
              } focus:outline-none focus:ring-2 focus:ring-${
                theme?.colors?.primary?.main || "purple-500"
              } w-full md:w-auto min-w-[200px]`}
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
                } rounded-lg shadow-lg z-10 w-48`}
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

          <div
            className={`flex rounded-full bg-${
              theme?.colors?.background?.secondary || "gray-800"
            } p-1 border border-${theme?.colors?.border?.main || "gray-700"}`}
          >
            <button
              onClick={() => setView("grid")}
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
              onClick={() => setView("list")}
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

          <button
            onClick={handlePlayAll}
            className={`bg-${
              theme?.colors?.primary?.main || "purple-600"
            } hover:bg-${
              theme?.colors?.primary?.dark || "purple-700"
            } text-white px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center`}
            disabled={favoriteTracks.length === 0}
          >
            <FaPlay className="mr-2" /> Play All
          </button>

          {favoriteTracks.length > 0 && (
            <button
              onClick={handleRemoveAllFavorites}
              className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center`}
            >
              <FaTrash className="mr-2" /> Clear All
            </button>
          )}
        </div>
      </div>

      {favoriteTracks.length > 0 ? (
        view === "grid" ? (
          // Grid view
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favoriteTracks.map((track) => (
              <div
                key={track.id}
                className={`bg-${
                  theme?.colors?.background?.secondary || "gray-800"
                } rounded-lg overflow-hidden hover:bg-${
                  theme?.colors?.background?.hover || "gray-700"
                } transition-colors cursor-pointer group`}
              >
                <div
                  className="relative"
                  onClick={() => handlePlayTrack(track)}
                >
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
                        {currentTrack?.id === track.id && isPlaying ? (
                          <FaPause className="h-6 w-6" />
                        ) : (
                          <FaPlay className="h-6 w-6" />
                        )}
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
                    <button
                      onClick={() => toggleFavorite(track.id)}
                      className="text-pink-500 hover:text-pink-400 transition-colors"
                    >
                      <FaHeart />
                    </button>
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
                  {sortBy === "duration" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </button>
              </div>
            </div>

            {/* Table body */}
            {favoriteTracks.map((track, index) => (
              <div
                key={track.id}
                onClick={() => handlePlayTrack(track)}
                className={`grid grid-cols-12 gap-2 px-4 py-2 hover:bg-${
                  theme?.colors?.background?.hover || "gray-700"
                } ${
                  currentTrack?.id === track.id
                    ? `bg-${theme?.colors?.background?.hover || "gray-700/50"}`
                    : ""
                } cursor-pointer text-${
                  theme?.colors?.text?.main || "white"
                } group`}
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
                  <div className="w-8 h-8 bg-gray-700 rounded mr-3 overflow-hidden flex-shrink-0">
                    {track.imageUrl && (
                      <img
                        src={track.imageUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="truncate">
                    <div
                      className={`truncate ${
                        currentTrack?.id === track.id
                          ? `text-${
                              theme?.colors?.primary?.main || "purple-500"
                            }`
                          : ""
                      }`}
                    >
                      {track.title}
                    </div>
                    <div
                      className={`text-sm text-${
                        theme?.colors?.text?.muted || "gray-400"
                      } truncate`}
                    >
                      {track.artist || "Unknown Artist"}
                    </div>
                  </div>
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
                    className={`text-${
                      theme?.colors?.text?.muted || "gray-400"
                    }`}
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
                      <FaRegHeart />
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className={`text-${
                        theme?.colors?.text?.muted || "gray-400"
                      } hover:text-${
                        theme?.colors?.text?.main || "white"
                      } transition-colors`}
                    >
                      <FaEllipsisH />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <div
            className={`bg-${
              theme?.colors?.background?.secondary || "gray-800"
            } p-6 rounded-full mb-4`}
          >
            <FaHeart
              className={`text-4xl text-${
                theme?.colors?.text?.muted || "gray-500"
              }`}
            />
          </div>
          <p
            className={`text-lg text-${
              theme?.colors?.text?.main || "white"
            } mb-2`}
          >
            Your favorite tracks will appear here
          </p>
          <p
            className={`text-sm text-${
              theme?.colors?.text?.muted || "gray-400"
            }`}
          >
            Like tracks to add them to your favorites
          </p>
        </div>
      )}
    </div>
  );
};
