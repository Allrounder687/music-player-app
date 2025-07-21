import React, { useState, useEffect, useRef } from "react";
import { useMusic } from "../store/MusicContext";
import {
  FaPlay,
  FaPause,
  FaHeart,
  FaRegHeart,
  FaPlus,
  FaList,
  FaShare,
  FaInfoCircle,
  FaDownload,
} from "react-icons/fa";

export const TrackContextMenu = ({ track, position, onClose }) => {
  const {
    playTrack,
    currentTrack,
    isPlaying,
    toggleFavorite,
    playlists,
    getAllPlaylists,
    addToPlaylist,
    addToQueue,
  } = useMusic();

  const [showPlaylistSubmenu, setShowPlaylistSubmenu] = useState(false);
  const [availablePlaylists, setAvailablePlaylists] = useState([]);
  const menuRef = useRef(null);

  // Position the menu
  const menuStyle = {
    top: `${position.y}px`,
    left: `${position.x}px`,
    backgroundColor: "var(--bg-secondary)",
    borderColor: "var(--border-color)",
  };

  // Load playlists
  useEffect(() => {
    if (showPlaylistSubmenu) {
      const allPlaylists = getAllPlaylists();
      setAvailablePlaylists(allPlaylists);
    }
  }, [showPlaylistSubmenu, getAllPlaylists]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Handle play/pause
  const handlePlayPause = () => {
    playTrack(track);
    onClose();
  };

  // Handle toggle favorite
  const handleToggleFavorite = () => {
    toggleFavorite(track.id);
    onClose();
  };

  // Handle add to playlist
  const handleAddToPlaylist = (playlistId) => {
    addToPlaylist(playlistId, track.id);
    onClose();
  };

  // Handle show track info
  const handleShowInfo = () => {
    // TODO: Implement track info modal
    console.log("Show track info:", track);
    onClose();
  };

  const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;
  const isFavorite = playlists.favorites.includes(track.id);

  const menuItemStyle = {
    color: "var(--text-primary)",
    textAlign: "left",
  };

  const menuItemHoverClass = "hover:bg-gray-700";

  return (
    <div
      ref={menuRef}
      className="fixed z-50 border rounded-lg shadow-lg overflow-hidden w-56"
      style={menuStyle}
    >
      <div
        className="p-3 border-b"
        style={{ borderColor: "var(--border-color)" }}
      >
        <div
          className="font-medium truncate"
          style={{ color: "var(--text-primary)" }}
        >
          {track.title}
        </div>
        <div
          className="text-sm truncate"
          style={{ color: "var(--text-muted)" }}
        >
          {track.artist || "Unknown Artist"}
        </div>
      </div>

      <div className="py-1">
        <button
          onClick={handlePlayPause}
          className={`flex items-center w-full px-4 py-2 ${menuItemHoverClass}`}
          style={menuItemStyle}
        >
          {isCurrentlyPlaying ? (
            <>
              <FaPause className="mr-3" /> Pause
            </>
          ) : (
            <>
              <FaPlay className="mr-3" /> Play
            </>
          )}
        </button>

        <button
          onClick={handleToggleFavorite}
          className={`flex items-center w-full px-4 py-2 ${menuItemHoverClass}`}
          style={menuItemStyle}
        >
          {isFavorite ? (
            <>
              <FaHeart className="mr-3 text-pink-500" /> Remove from Favorites
            </>
          ) : (
            <>
              <FaRegHeart className="mr-3" /> Add to Favorites
            </>
          )}
        </button>

        <button
          onClick={() => {
            addToQueue(track);
            onClose();
          }}
          className={`flex items-center w-full px-4 py-2 ${menuItemHoverClass}`}
          style={menuItemStyle}
        >
          <FaList className="mr-3" /> Add to Queue
        </button>

        <button
          onClick={() => {
            addToQueue(track, true);
            onClose();
          }}
          className={`flex items-center w-full px-4 py-2 ${menuItemHoverClass}`}
          style={menuItemStyle}
        >
          <FaPlay className="mr-3" /> Play Next
        </button>

        <div className="relative">
          <button
            onClick={() => setShowPlaylistSubmenu(!showPlaylistSubmenu)}
            className={`flex items-center w-full px-4 py-2 ${menuItemHoverClass} justify-between`}
            style={menuItemStyle}
          >
            <div className="flex items-center">
              <FaPlus className="mr-3" /> Add to Playlist
            </div>
            <span>›</span>
          </button>

          {showPlaylistSubmenu && (
            <div
              className="absolute left-full top-0 border rounded-lg shadow-lg overflow-hidden w-56 ml-1"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              {availablePlaylists.length > 0 ? (
                availablePlaylists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                    className={`flex items-center w-full px-4 py-2 ${menuItemHoverClass}`}
                    style={menuItemStyle}
                  >
                    <FaList className="mr-3" /> {playlist.name}
                  </button>
                ))
              ) : (
                <div
                  className="px-4 py-2 text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  No playlists available
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleShowInfo}
          className={`flex items-center w-full px-4 py-2 ${menuItemHoverClass}`}
          style={menuItemStyle}
        >
          <FaInfoCircle className="mr-3" /> Track Info
        </button>

        <button
          className={`flex items-center w-full px-4 py-2 ${menuItemHoverClass}`}
          style={menuItemStyle}
        >
          <FaShare className="mr-3" /> Share
        </button>

        {track.filePath && (
          <button
            className={`flex items-center w-full px-4 py-2 ${menuItemHoverClass}`}
            style={menuItemStyle}
          >
            <FaDownload className="mr-3" /> Download
          </button>
        )}
      </div>
    </div>
  );
};
