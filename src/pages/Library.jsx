import React, { useState, useEffect } from "react";
import { useMusic } from "../store/MusicContext";
import { useTheme } from "../store/ThemeContext";
import {
  FaPlay,
  FaMusic,
  FaHeart,
  FaRegHeart,
  FaEllipsisH,
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

  // Play all tracks
  const playAllTracks = () => {
    if (filteredTracks.length > 0) {
      setQueue(filteredTracks, true);
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

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
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

          {/* View toggle */}
          <div
            className={`flex rounded-full bg-${
              theme?.colors?.background?.secondary || "gray-800"
            } p-1`}
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

          {/* Play all button */}
          <button
            onClick={playAllTracks}
            disabled={filteredTracks.length === 0}
            className={`px-4 py-2 rounded-full bg-${
              theme?.colors?.primary?.main || "purple-600"
            } hover:bg-${
              theme?.colors?.primary?.dark || "purple-700"
            } text-white flex items-center justify-center ${
              filteredTracks.length === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <FaPlay className="mr-2" /> Play All
          </button>
        </div>
      </div>

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
                {track.imageUrl &&
                !track.imageUrl.includes("album-placeholder") ? (
                  <img
                    src={track.imageUrl}
                    alt={track.title}
                    className="w-full aspect-square object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/album-placeholder.svg";
                    }}
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(track.id);
                  }}
                  className="text-pink-500 hover:text-pink-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  {playlists.favorites.includes(track.id) ? (
                    <FaHeart />
                  ) : (
                    <FaRegHeart />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
