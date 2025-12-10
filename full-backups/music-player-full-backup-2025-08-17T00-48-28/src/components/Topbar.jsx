import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaBell, FaUserCircle, FaMusic, FaPlay } from "react-icons/fa";
import { useTheme } from "../store/ThemeContext";
import { useMusic } from "../store/MusicContext";
import { WindowControls } from "./WindowControls";

export const Topbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchResultsRef = useRef(null);
  const { theme } = useTheme();
  const { tracks, onlineTracks, playTrack, isOnlineTrack } = useMusic();

  // Handle search functionality
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    // Search in local tracks
    const localResults = tracks ? tracks.filter(track => 
      (track.title && track.title.toLowerCase().includes(query)) ||
      (track.artist && track.artist.toLowerCase().includes(query)) ||
      (track.album && track.album.toLowerCase().includes(query))
    ).slice(0, 5) : []; // Limit to 5 results
    
    // Search in online tracks
    const onlineResults = onlineTracks ? onlineTracks.filter(track => 
      (track.title && track.title.toLowerCase().includes(query)) ||
      (track.artist && track.artist.toLowerCase().includes(query)) ||
      (track.album && track.album.toLowerCase().includes(query))
    ).slice(0, 5) : []; // Limit to 5 results
    
    // Combine results
    const combinedResults = [...localResults, ...onlineResults].slice(0, 10);
    setSearchResults(combinedResults);
    setShowResults(combinedResults.length > 0);
  }, [searchQuery, tracks, onlineTracks]);

  // Handle click outside search results
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search result click
  const handleResultClick = (track) => {
    if (playTrack) {
      playTrack(track);
      setShowResults(false);
      setSearchQuery("");
    }
  };

  return (
    <header
      className="bg-gray-800 border-b border-gray-700 select-none"
      style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
    >
      {/* Draggable title bar */}
      <div
        className="flex items-center justify-between h-8 px-3 draggable"
        style={{ WebkitAppRegion: "drag" }}
      >
        <div className="flex items-center">
          <FaMusic className="text-purple-500 mr-2" style={{ color: "var(--accent-color)" }} />
          <span className="text-white font-medium">
            Music Player
          </span>
        </div>

        {/* Window controls - not draggable */}
        <div style={{ WebkitAppRegion: "no-drag" }}>
          <WindowControls />
        </div>
      </div>

      {/* Search bar and user controls */}
      <div className="flex items-center justify-between p-3">
        <div className="relative w-1/3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400 text-sm" style={{ color: "var(--text-muted)" }} />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-1.5 border border-transparent rounded-md leading-5 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent text-sm"
            style={{ 
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              borderColor: "transparent"
            }}
            placeholder="Search songs, artists, and albums"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div 
              ref={searchResultsRef}
              className="absolute z-50 mt-1 w-full bg-gray-800 rounded-md shadow-lg max-h-96 overflow-y-auto"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <div className="py-1">
                {searchResults.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center px-4 py-2 hover:bg-gray-700 cursor-pointer"
                    style={{ backgroundColor: "transparent" }}
                    onClick={() => handleResultClick(track)}
                  >
                    <div className="w-8 h-8 mr-3 flex-shrink-0 bg-gray-700 rounded overflow-hidden">
                      {track.imageUrl ? (
                        <img src={track.imageUrl} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-700">
                          <FaMusic className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{track.title}</p>
                      <p className="text-xs text-gray-400 truncate">{track.artist || "Unknown Artist"}</p>
                    </div>
                    <div className="ml-2">
                      <FaPlay className="text-xs text-gray-400" />
                    </div>
                    {isOnlineTrack && isOnlineTrack(track) && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-indigo-900 text-indigo-200">
                        {track.sourceName || "Online"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            className="p-1.5 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white"
            style={{ color: "var(--text-secondary)" }}
          >
            <FaBell className="h-4 w-4" />
          </button>
          <div className="flex items-center space-x-2">
            <FaUserCircle
              className="h-6 w-6 text-gray-400"
              style={{ color: "var(--text-muted)" }}
            />
            <span
              className="text-sm font-medium text-gray-300"
              style={{ color: "var(--text-secondary)" }}
            >
              User
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
