import React, { useState, useEffect, useCallback } from "react";
import {
  FaPlus,
  FaEllipsisH,
  FaPlay,
  FaMusic,
  FaTrash,
  FaEdit,
  FaFolderOpen,
  FaFileImport,
  FaListUl,
} from "react-icons/fa";
import { useMusic } from "../store/MusicContext";
import { useTheme } from "../store/ThemeContext";
import { ImportMusic } from "../components/ImportMusic";
import { PlaylistDetail } from "../components/PlaylistDetail";

export const Playlists = () => {
  const {
    getAllPlaylists,
    createPlaylist,
    deletePlaylist,
    getPlaylistTracks,
    setQueue,
  } = useMusic();
  const { theme } = useTheme();

  const [playlists, setPlaylists] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [newPlaylist, setNewPlaylist] = useState({
    name: "",
    description: "",
  });

  // Load playlists from MusicContext - memoize the function to avoid dependency issues
  const loadPlaylists = useCallback(() => {
    try {
      const loadedPlaylists = getAllPlaylists().map((playlist) => ({
        id: playlist.id,
        name: playlist.name,
        trackCount: playlist.tracks.length,
        // Generate a consistent image URL based on playlist name
        imageUrl: `https://source.unsplash.com/random/300x300/?${encodeURIComponent(
          playlist.name.split(" ")[0] || "music"
        )}`,
      }));

      setPlaylists(loadedPlaylists);
    } catch (error) {
      console.error("Error loading playlists:", error);
    }
  }, [getAllPlaylists]);

  // Load playlists on component mount and when dependencies change
  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  // Create playlist handler
  const handleCreatePlaylist = useCallback(
    (e) => {
      e.preventDefault();
      if (!newPlaylist.name.trim()) return;

      try {
        // Create playlist in MusicContext
        const playlistId = createPlaylist(newPlaylist.name);

        const playlist = {
          id: playlistId,
          name: newPlaylist.name,
          description: newPlaylist.description,
          trackCount: 0,
          imageUrl: `https://source.unsplash.com/random/300x300/?${encodeURIComponent(
            newPlaylist.name
          )}`,
        };

        setPlaylists((prev) => [...prev, playlist]);
        setNewPlaylist({ name: "", description: "" });
        setShowCreateForm(false);
      } catch (error) {
        console.error("Error creating playlist:", error);
      }
    },
    [newPlaylist, createPlaylist]
  );

  // Delete playlist handler
  const handleDeletePlaylist = useCallback((playlistId) => {
    setPlaylistToDelete(playlistId);
    setShowDeleteConfirm(true);
  }, []);

  // Confirm delete handler
  const confirmDeletePlaylist = useCallback(() => {
    if (!playlistToDelete) return;

    try {
      // Delete from MusicContext
      deletePlaylist(playlistToDelete);

      // Update local state
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistToDelete));
      setShowDeleteConfirm(false);
      setPlaylistToDelete(null);
    } catch (error) {
      console.error("Error deleting playlist:", error);
    }
  }, [playlistToDelete, deletePlaylist]);

  // Play playlist handler
  const handlePlayPlaylist = useCallback(
    (playlistId) => {
      try {
        const tracks = getPlaylistTracks(playlistId);
        if (tracks && tracks.length > 0) {
          setQueue(tracks, true);
        }
      } catch (error) {
        console.error("Error playing playlist:", error);
      }
    },
    [getPlaylistTracks, setQueue]
  );

  // View a specific playlist
  const handleViewPlaylist = (playlistId) => {
    setSelectedPlaylist(playlistId);
  };

  // Go back to playlists view
  const handleBackToPlaylists = () => {
    setSelectedPlaylist(null);
  };

  // If a playlist is selected, show the playlist detail view
  if (selectedPlaylist) {
    return (
      <PlaylistDetail
        playlistId={selectedPlaylist}
        onBack={handleBackToPlaylists}
      />
    );
  }

  return (
    <div
      className={`p-6 h-full overflow-y-auto bg-${
        theme?.colors?.background?.main || "gray-900"
      }`}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className={`text-3xl font-bold text-${
              theme?.colors?.text?.main || "white"
            }`}
          >
            Playlists
          </h1>
          <p className={`text-${theme?.colors?.text?.muted || "gray-400"}`}>
            {playlists.length} playlists
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className={`bg-${
              theme?.colors?.background?.secondary || "gray-700"
            } hover:bg-${theme?.colors?.background?.hover || "gray-600"} text-${
              theme?.colors?.text?.main || "white"
            } px-4 py-2 rounded-full text-sm font-medium flex items-center transition-colors`}
          >
            <FaFolderOpen className="mr-2" />
            Import Music
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className={`bg-${
              theme?.colors?.primary?.main || "purple-600"
            } hover:bg-${
              theme?.colors?.primary?.dark || "purple-700"
            } text-white px-4 py-2 rounded-full text-sm font-medium flex items-center transition-colors`}
          >
            <FaPlus className="mr-2" />
            New Playlist
          </button>
        </div>
      </div>

      {/* Create Playlist Modal */}
      {showCreateForm && (
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
              Create New Playlist
            </h2>

            <form onSubmit={handleCreatePlaylist}>
              <div className="mb-4">
                <label
                  className={`block text-sm font-medium text-${
                    theme?.colors?.text?.muted || "gray-300"
                  } mb-2`}
                >
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={newPlaylist.name}
                  onChange={(e) =>
                    setNewPlaylist({ ...newPlaylist, name: e.target.value })
                  }
                  className={`w-full bg-${
                    theme?.colors?.background?.tertiary || "gray-700"
                  } border border-${
                    theme?.colors?.border?.main || "gray-600"
                  } rounded-lg px-4 py-2 text-${
                    theme?.colors?.text?.main || "white"
                  } focus:ring-2 focus:ring-${
                    theme?.colors?.primary?.main || "purple-500"
                  } focus:border-transparent`}
                  placeholder="My Awesome Playlist"
                  autoFocus
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  className={`block text-sm font-medium text-${
                    theme?.colors?.text?.muted || "gray-300"
                  } mb-2`}
                >
                  Description (Optional)
                </label>
                <textarea
                  value={newPlaylist.description}
                  onChange={(e) =>
                    setNewPlaylist({
                      ...newPlaylist,
                      description: e.target.value,
                    })
                  }
                  className={`w-full bg-${
                    theme?.colors?.background?.tertiary || "gray-700"
                  } border border-${
                    theme?.colors?.border?.main || "gray-600"
                  } rounded-lg px-4 py-2 text-${
                    theme?.colors?.text?.main || "white"
                  } focus:ring-2 focus:ring-${
                    theme?.colors?.primary?.main || "purple-500"
                  } focus:border-transparent`}
                  rows="3"
                  placeholder="What's this playlist about?"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className={`px-4 py-2 text-sm font-medium text-${
                    theme?.colors?.text?.muted || "gray-300"
                  } hover:text-${theme?.colors?.text?.main || "white"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`bg-${
                    theme?.colors?.primary?.main || "purple-600"
                  } hover:bg-${
                    theme?.colors?.primary?.dark || "purple-700"
                  } text-white px-6 py-2 rounded-full text-sm font-medium transition-colors`}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
              Delete Playlist
            </h2>
            <p className={`mb-6 text-${theme?.colors?.text?.main || "white"}`}>
              Are you sure you want to delete this playlist? This action cannot
              be undone.
            </p>

            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`px-4 py-2 text-sm font-medium text-${
                  theme?.colors?.text?.muted || "gray-300"
                } hover:text-${theme?.colors?.text?.main || "white"}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePlaylist}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Music Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <ImportMusic onClose={() => setShowImportModal(false)} />
        </div>
      )}

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            onClick={() => handleViewPlaylist(playlist.id)}
            className={`group bg-${
              theme?.colors?.background?.secondary || "gray-800"
            } rounded-xl overflow-hidden hover:bg-${
              theme?.colors?.background?.hover || "gray-700/70"
            } transition-colors relative cursor-pointer`}
          >
            <div className="relative">
              <img
                src={playlist.imageUrl}
                alt={playlist.name}
                className="w-full aspect-square object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18f6a1a6e9f%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18f6a1a6e9f%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23333%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.921875%22%20y%3D%22217.7%22%3EMusic%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E";
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                <button
                  onClick={() => handlePlayPlaylist(playlist.id)}
                  className={`opacity-0 group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-${
                    theme?.colors?.primary?.main || "purple-600"
                  } hover:bg-${
                    theme?.colors?.primary?.dark || "purple-700"
                  } text-white p-3 rounded-full`}
                >
                  <FaPlay />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3
                    className={`font-bold text-lg truncate text-${
                      theme?.colors?.text?.main || "white"
                    }`}
                  >
                    {playlist.name}
                  </h3>
                  <p
                    className={`text-sm text-${
                      theme?.colors?.text?.muted || "gray-400"
                    }`}
                  >
                    {playlist.trackCount} tracks
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewPlaylist(playlist.id);
                    }}
                    className={`text-${
                      theme?.colors?.text?.muted || "gray-400"
                    } hover:text-${theme?.colors?.text?.main || "white"} p-1`}
                    title="View playlist"
                  >
                    <FaListUl />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(playlist.id);
                    }}
                    className={`text-${
                      theme?.colors?.text?.muted || "gray-400"
                    } hover:text-${theme?.colors?.text?.main || "white"} p-1`}
                    title="Delete playlist"
                  >
                    <FaTrash />
                  </button>
                  <button
                    className={`text-${
                      theme?.colors?.text?.muted || "gray-400"
                    } hover:text-${theme?.colors?.text?.main || "white"} p-1`}
                  >
                    <FaEllipsisH />
                  </button>
                </div>
              </div>
              {playlist.description && (
                <p
                  className={`mt-2 text-sm text-${
                    theme?.colors?.text?.muted || "gray-400"
                  } line-clamp-2`}
                >
                  {playlist.description}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {playlists.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div
              className={`bg-${
                theme?.colors?.background?.secondary || "gray-800"
              } p-6 rounded-full mb-4`}
            >
              <FaMusic
                className={`text-4xl text-${
                  theme?.colors?.text?.muted || "gray-600"
                }`}
              />
            </div>
            <h3
              className={`text-xl font-medium mb-2 text-${
                theme?.colors?.text?.main || "white"
              }`}
            >
              No playlists yet
            </h3>
            <p
              className={`text-${
                theme?.colors?.text?.muted || "gray-400"
              } mb-6 max-w-md`}
            >
              Create your first playlist to organize your favorite tracks and
              albums.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className={`bg-${
                theme?.colors?.primary?.main || "purple-600"
              } hover:bg-${
                theme?.colors?.primary?.dark || "purple-700"
              } text-white px-6 py-2 rounded-full text-sm font-medium flex items-center transition-colors`}
            >
              <FaPlus className="mr-2" />
              Create Playlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
