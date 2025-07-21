import React, { useState, useEffect, useRef } from "react";
import { useMusic } from "../store/MusicContext";
import { useTheme } from "../store/ThemeContext";
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
  } = useMusic();
  const { theme } = useTheme();

  const [showPlaylistSubmenu, setShowPlaylistSubmenu] = useState(false);
  const [availablePlaylists, setAvailablePlaylists] = useState([]);
  const menuRef = useRef(null);

  // Position the menu
  const menuStyle = {
    top: `${position.y}px`,
    left: `${position.x}px`,
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

  return (
    <div
      ref={menuRef}
      className={`fixed z-50 bg-${
        theme?.colors?.background?.secondary || "gray-800"
      } border border-${
        theme?.colors?.border?.main || "gray-700"
      } rounded-lg shadow-lg overflow-hidden w-56`}
      style={menuStyle}
    >
      <div
        className={`p-3 border-b border-${
          theme?.colors?.border?.main || "gray-700"
        }`}
      >
        <div
          className={`font-medium text-${
            theme?.colors?.text?.main || "white"
          } truncate`}
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

      <div className="py-1">
        <button
          onClick={handlePlayPause}
          className={`flex items-center w-full px-4 py-2 text-${
            theme?.colors?.text?.main || "white"
          } hover:bg-${
            theme?.colors?.background?.hover || "gray-700"
          } text-left`}
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
          className={`flex items-center w-full px-4 py-2 text-${
            theme?.colors?.text?.main || "white"
          } hover:bg-${
            theme?.colors?.background?.hover || "gray-700"
          } text-left`}
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

        <div className="relative">
          <button
            onClick={() => setShowPlaylistSubmenu(!showPlaylistSubmenu)}
            className={`flex items-center w-full px-4 py-2 text-${
              theme?.colors?.text?.main || "white"
            } hover:bg-${
              theme?.colors?.background?.hover || "gray-700"
            } text-left justify-between`}
          >
            <div className="flex items-center">
              <FaPlus className="mr-3" /> Add to Playlist
            </div>
            <span>›</span>
          </button>

          {showPlaylistSubmenu && (
            <div
              className={`absolute left-full top-0 bg-${
                theme?.colors?.background?.secondary || "gray-800"
              } border border-${
                theme?.colors?.border?.main || "gray-700"
              } rounded-lg shadow-lg overflow-hidden w-56 ml-1`}
            >
              {availablePlaylists.length > 0 ? (
                availablePlaylists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                    className={`flex items-center w-full px-4 py-2 text-${
                      theme?.colors?.text?.main || "white"
                    } hover:bg-${
                      theme?.colors?.background?.hover || "gray-700"
                    } text-left`}
                  >
                    <FaList className="mr-3" /> {playlist.name}
                  </button>
                ))
              ) : (
                <div
                  className={`px-4 py-2 text-${
                    theme?.colors?.text?.muted || "gray-400"
                  } text-sm`}
                >
                  No playlists available
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleShowInfo}
          className={`flex items-center w-full px-4 py-2 text-${
            theme?.colors?.text?.main || "white"
          } hover:bg-${
            theme?.colors?.background?.hover || "gray-700"
          } text-left`}
        >
          <FaInfoCircle className="mr-3" /> Track Info
        </button>

        <button
          className={`flex items-center w-full px-4 py-2 text-${
            theme?.colors?.text?.main || "white"
          } hover:bg-${
            theme?.colors?.background?.hover || "gray-700"
          } text-left`}
        >
          <FaShare className="mr-3" /> Share
        </button>

        {track.filePath && (
          <button
            className={`flex items-center w-full px-4 py-2 text-${
              theme?.colors?.text?.main || "white"
            } hover:bg-${
              theme?.colors?.background?.hover || "gray-700"
            } text-left`}
          >
            <FaDownload className="mr-3" /> Download
          </button>
        )}
      </div>
    </div>
  );
};
