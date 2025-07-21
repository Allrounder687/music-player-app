import React, { createContext, useContext, useReducer, useEffect } from "react";

const MusicContext = createContext();

// Sample tracks data with local resources
const sampleTracks = [
  {
    id: "1",
    title: "Piano Loop 1",
    artist: "Sample Artist",
    album: "Sample Album",
    duration: 30, // in seconds
    imageUrl: "/images/album-placeholder.svg",
    previewUrl: "/audio/sample1.mp3",
  },
  {
    id: "2",
    title: "Piano Loop 2",
    artist: "Sample Artist",
    album: "Sample Album",
    duration: 30, // in seconds
    imageUrl: "/images/album-placeholder.svg",
    previewUrl: "/audio/sample2.mp3",
  },
  {
    id: "3",
    title: "Drum Beat",
    artist: "Sample Artist",
    album: "Sample Album",
    duration: 45, // in seconds
    imageUrl: "/images/album-placeholder.svg",
    previewUrl: "/audio/sample3.mp3",
  },
  {
    id: "4",
    title: "Piano Loop (Alternative)",
    artist: "Sample Artist",
    album: "Sample Album 2",
    duration: 30, // in seconds
    imageUrl: "/images/album-placeholder.svg",
    previewUrl: "/audio/sample1.mp3",
  },
  {
    id: "5",
    title: "Piano Loop (Remix)",
    artist: "Sample Artist",
    album: "Sample Album 2",
    duration: 30, // in seconds
    imageUrl: "/images/album-placeholder.svg",
    previewUrl: "/audio/sample2.mp3",
  },
];

const initialState = {
  tracks: sampleTracks,
  currentTrack: null,
  isPlaying: false,
  volume: 0.8,
  currentTime: 0,
  duration: 0,
  queue: sampleTracks,
  currentTrackIndex: -1,
  repeat: false,
  shuffle: false,
  audioData: {
    bass: 0,
    mid: 0,
    treble: 0,
    volume: 0,
    frequencyData: [],
    timeData: [],
  },
  playlists: {
    favorites: ["1", "3"], // Sample favorite tracks
    recentlyPlayed: [],
    custom: {
      workout: {
        name: "Workout Mix",
        tracks: ["2", "4", "5"],
      },
      chill: {
        name: "Chill Vibes",
        tracks: ["1", "3"],
      },
    },
  },
};

function musicReducer(state, action) {
  switch (action.type) {
    case "ADD_TO_QUEUE": {
      const { track, playNext = false } = action;

      // Check if track is already in queue (we'll use this in future enhancements)
      // const isInQueue = state.queue.some((t) => t.id === track.id);

      let newQueue = [...state.queue];
      let newCurrentTrackIndex = state.currentTrackIndex;

      if (playNext) {
        // Add track right after the current track
        if (state.currentTrackIndex >= 0) {
          // If there's a current track playing, insert after it
          newQueue.splice(state.currentTrackIndex + 1, 0, track);
          // Current track index stays the same
        } else {
          // If no track is playing, add to the beginning
          newQueue.unshift(track);
          newCurrentTrackIndex = 0;
        }
      } else {
        // Add track to the end of the queue
        newQueue.push(track);

        // If this is the first track, set current track index
        if (newQueue.length === 1) {
          newCurrentTrackIndex = 0;
        }
      }

      return {
        ...state,
        queue: newQueue,
        currentTrackIndex: newCurrentTrackIndex,
      };
    }
    case "DELETE_TRACK": {
      const trackId = action.trackId;

      // Remove the track from the tracks list
      const updatedTracks = state.tracks.filter(
        (track) => track.id !== trackId
      );

      // Remove the track from the queue if it's there
      const updatedQueue = state.queue.filter((track) => track.id !== trackId);

      // Adjust currentTrackIndex if needed
      let updatedCurrentTrackIndex = state.currentTrackIndex;
      let updatedCurrentTrack = state.currentTrack;

      // If the deleted track is the current track
      if (state.currentTrack && state.currentTrack.id === trackId) {
        // If there are tracks left in the queue
        if (updatedQueue.length > 0) {
          // Use the same index if possible, or the previous one
          updatedCurrentTrackIndex = Math.min(
            state.currentTrackIndex,
            updatedQueue.length - 1
          );
          updatedCurrentTrack = updatedQueue[updatedCurrentTrackIndex];
        } else {
          // No tracks left in queue
          updatedCurrentTrackIndex = -1;
          updatedCurrentTrack = null;
        }
      } else if (state.currentTrackIndex > -1) {
        // If a track before the current one was deleted, adjust the index
        const deletedIndex = state.queue.findIndex(
          (track) => track.id === trackId
        );
        if (deletedIndex !== -1 && deletedIndex < state.currentTrackIndex) {
          updatedCurrentTrackIndex = state.currentTrackIndex - 1;
        }
      }

      // Remove the track from all playlists
      const updatedPlaylists = {
        favorites: state.playlists.favorites.filter((id) => id !== trackId),
        recentlyPlayed: state.playlists.recentlyPlayed.filter(
          (id) => id !== trackId
        ),
        custom: { ...state.playlists.custom },
      };

      // Remove from custom playlists
      Object.keys(updatedPlaylists.custom).forEach((playlistId) => {
        updatedPlaylists.custom[playlistId] = {
          ...updatedPlaylists.custom[playlistId],
          tracks: updatedPlaylists.custom[playlistId].tracks.filter(
            (id) => id !== trackId
          ),
        };
      });

      // If the track had a blob URL, revoke it
      const trackToDelete = state.tracks.find((track) => track.id === trackId);
      if (
        trackToDelete &&
        trackToDelete.previewUrl &&
        trackToDelete.previewUrl.startsWith("blob:")
      ) {
        try {
          URL.revokeObjectURL(trackToDelete.previewUrl);
        } catch (e) {
          console.error("Error revoking blob URL:", e);
        }
      }

      return {
        ...state,
        tracks: updatedTracks,
        queue: updatedQueue,
        currentTrackIndex: updatedCurrentTrackIndex,
        currentTrack: updatedCurrentTrack,
        isPlaying: updatedCurrentTrack ? state.isPlaying : false,
        playlists: updatedPlaylists,
      };
    }
    case "PLAY_TRACK":
      // Find the track index in the queue if it exists
      const trackIndex = state.queue.findIndex((t) => t.id === action.track.id);

      // If track is in queue, use that index, otherwise add to queue
      if (trackIndex !== -1) {
        return {
          ...state,
          currentTrack: action.track,
          currentTrackIndex: trackIndex,
          isPlaying: true,
          currentTime: 0,
          duration: action.track?.duration || 0,
          // Add to recently played
          playlists: {
            ...state.playlists,
            recentlyPlayed: [
              action.track.id,
              ...state.playlists.recentlyPlayed.filter(
                (id) => id !== action.track.id
              ),
            ].slice(0, 20), // Keep only last 20 tracks
          },
        };
      } else {
        // Track not in queue, add it
        return {
          ...state,
          currentTrack: action.track,
          queue: [...state.queue, action.track],
          currentTrackIndex: state.queue.length,
          isPlaying: true,
          currentTime: 0,
          duration: action.track?.duration || 0,
          // Add to recently played
          playlists: {
            ...state.playlists,
            recentlyPlayed: [
              action.track.id,
              ...state.playlists.recentlyPlayed.filter(
                (id) => id !== action.track.id
              ),
            ].slice(0, 20), // Keep only last 20 tracks
          },
        };
      }

    case "TOGGLE_PLAYBACK":
      return { ...state, isPlaying: !state.isPlaying };

    case "SET_VOLUME":
      return { ...state, volume: action.volume };

    case "SET_CURRENT_TIME":
      return {
        ...state,
        currentTime: action.time,
        // If we're at the end of the track, handle based on repeat mode
        isPlaying:
          action.time >= state.duration
            ? state.repeat
              ? true
              : false
            : state.isPlaying,
      };

    case "SET_DURATION":
      return { ...state, duration: action.duration };

    case "NEXT_TRACK": {
      if (state.queue.length === 0) return state;

      // If shuffle is on, pick a random track
      if (state.shuffle) {
        // Don't pick the current track
        let availableIndices = Array.from(
          { length: state.queue.length },
          (_, i) => i
        ).filter((i) => i !== state.currentTrackIndex);

        // If we've played all tracks, start over
        if (availableIndices.length === 0) {
          availableIndices = Array.from(
            { length: state.queue.length },
            (_, i) => i
          );
        }

        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        const nextIndex = availableIndices[randomIndex];

        return {
          ...state,
          currentTrack: state.queue[nextIndex],
          currentTrackIndex: nextIndex,
          currentTime: 0,
          duration: state.queue[nextIndex]?.duration || 0,
          isPlaying: true,
          // Add to recently played
          playlists: {
            ...state.playlists,
            recentlyPlayed: [
              state.queue[nextIndex].id,
              ...state.playlists.recentlyPlayed.filter(
                (id) => id !== state.queue[nextIndex].id
              ),
            ].slice(0, 20),
          },
        };
      }

      // Normal sequential playback
      const nextIndex = (state.currentTrackIndex + 1) % state.queue.length;
      return {
        ...state,
        currentTrack: state.queue[nextIndex],
        currentTrackIndex: nextIndex,
        currentTime: 0,
        duration: state.queue[nextIndex]?.duration || 0,
        isPlaying: true,
        // Add to recently played
        playlists: {
          ...state.playlists,
          recentlyPlayed: [
            state.queue[nextIndex].id,
            ...state.playlists.recentlyPlayed.filter(
              (id) => id !== state.queue[nextIndex].id
            ),
          ].slice(0, 20),
        },
      };
    }

    case "PREV_TRACK": {
      if (state.queue.length === 0) return state;

      // If current time is more than 3 seconds, restart the current track
      if (state.currentTime > 3) {
        return {
          ...state,
          currentTime: 0,
          isPlaying: true,
        };
      }

      // If shuffle is on, pick a random track from recently played
      if (state.shuffle && state.playlists.recentlyPlayed.length > 1) {
        // Get the previous track from recently played
        const prevTrackId = state.playlists.recentlyPlayed[1]; // Skip current track
        const prevTrackIndex = state.queue.findIndex(
          (t) => t.id === prevTrackId
        );

        if (prevTrackIndex !== -1) {
          return {
            ...state,
            currentTrack: state.queue[prevTrackIndex],
            currentTrackIndex: prevTrackIndex,
            currentTime: 0,
            duration: state.queue[prevTrackIndex]?.duration || 0,
            isPlaying: true,
          };
        }
      }

      // Normal sequential playback
      const prevIndex =
        (state.currentTrackIndex - 1 + state.queue.length) % state.queue.length;
      return {
        ...state,
        currentTrack: state.queue[prevIndex],
        currentTrackIndex: prevIndex,
        currentTime: 0,
        duration: state.queue[prevIndex]?.duration || 0,
        isPlaying: true,
      };
    }

    case "SET_QUEUE":
      console.log("Setting queue with tracks:", action.tracks);

      // Make sure we have valid tracks
      if (!action.tracks || action.tracks.length === 0) {
        console.warn("Attempted to set empty queue");
        return state;
      }

      // Make sure tracks have all required properties, with more lenient validation for imported tracks
      const validTracks = action.tracks.filter(
        (track) =>
          track &&
          track.id &&
          track.title &&
          // Allow tracks with previewUrl or filePath (for imported local files)
          (track.previewUrl || track.filePath)
      );

      if (validTracks.length === 0) {
        console.warn("No valid tracks in queue");
        return state;
      }

      console.log("Valid tracks for queue:", validTracks);

      // For imported tracks, add them to a new "Imported" playlist if they don't exist yet
      const newTracks = validTracks.filter(
        (track) => !state.tracks.some((t) => t.id === track.id)
      );

      let updatedPlaylists = state.playlists;

      // If we have new tracks from an import, add them to an "Imported" playlist
      if (newTracks.length > 0 && !action.autoplay) {
        // Check if "Imported" playlist exists, create it if not
        const importedPlaylistId = "imported";
        const hasImportedPlaylist =
          state.playlists.custom && state.playlists.custom[importedPlaylistId];

        if (hasImportedPlaylist) {
          // Add to existing imported playlist
          updatedPlaylists = {
            ...state.playlists,
            custom: {
              ...state.playlists.custom,
              [importedPlaylistId]: {
                ...state.playlists.custom[importedPlaylistId],
                tracks: [
                  ...state.playlists.custom[importedPlaylistId].tracks,
                  ...newTracks.map((track) => track.id),
                ],
              },
            },
          };
        } else {
          // Create new imported playlist
          updatedPlaylists = {
            ...state.playlists,
            custom: {
              ...state.playlists.custom,
              [importedPlaylistId]: {
                name: "Imported Music",
                tracks: newTracks.map((track) => track.id),
              },
            },
          };
        }
      }

      // Add to recently played if autoplay
      if (action.autoplay) {
        updatedPlaylists = {
          ...updatedPlaylists,
          recentlyPlayed: [
            validTracks[0].id,
            ...state.playlists.recentlyPlayed.filter(
              (id) => id !== validTracks[0].id
            ),
          ].slice(0, 20),
        };
      }

      // Create a new state with the updated queue
      const newState = {
        ...state,
        queue: validTracks,
        currentTrackIndex: 0,
        currentTrack: validTracks[0],
        isPlaying: action.autoplay || false,
        currentTime: 0,
        duration: validTracks[0].duration || 0,
        // Also update the tracks list to include these new tracks
        tracks: [...state.tracks, ...newTracks],
        // Update playlists
        playlists: updatedPlaylists,
      };

      console.log("New state after SET_QUEUE:", {
        currentTrack: newState.currentTrack,
        isPlaying: newState.isPlaying,
        queueLength: newState.queue.length,
        tracksLength: newState.tracks.length,
        newTracksAdded: newTracks.length,
      });

      return newState;

    case "TOGGLE_FAVORITE":
      const trackId = action.trackId;
      const isFavorite = state.playlists.favorites.includes(trackId);
      return {
        ...state,
        playlists: {
          ...state.playlists,
          favorites: isFavorite
            ? state.playlists.favorites.filter((id) => id !== trackId)
            : [...state.playlists.favorites, trackId],
        },
      };

    case "TOGGLE_REPEAT":
      return {
        ...state,
        repeat: !state.repeat,
      };

    case "TOGGLE_SHUFFLE":
      return {
        ...state,
        shuffle: !state.shuffle,
      };

    case "CREATE_PLAYLIST":
      return {
        ...state,
        playlists: {
          ...state.playlists,
          custom: {
            ...state.playlists.custom,
            [action.playlistId]: {
              name: action.name,
              tracks: action.tracks || [],
            },
          },
        },
      };

    case "DELETE_PLAYLIST":
      const { [action.playlistId]: _, ...remainingPlaylists } =
        state.playlists.custom;
      return {
        ...state,
        playlists: {
          ...state.playlists,
          custom: remainingPlaylists,
        },
      };

    case "ADD_TO_PLAYLIST":
      return {
        ...state,
        playlists: {
          ...state.playlists,
          custom: {
            ...state.playlists.custom,
            [action.playlistId]: {
              ...state.playlists.custom[action.playlistId],
              tracks: [
                ...state.playlists.custom[action.playlistId].tracks,
                ...action.trackIds.filter(
                  (id) =>
                    !state.playlists.custom[action.playlistId].tracks.includes(
                      id
                    )
                ),
              ],
            },
          },
        },
      };

    case "REMOVE_FROM_PLAYLIST":
      return {
        ...state,
        playlists: {
          ...state.playlists,
          custom: {
            ...state.playlists.custom,
            [action.playlistId]: {
              ...state.playlists.custom[action.playlistId],
              tracks: state.playlists.custom[action.playlistId].tracks.filter(
                (id) => !action.trackIds.includes(id)
              ),
            },
          },
        },
      };

    case "SET_AUDIO_DATA":
      return {
        ...state,
        audioData: action.data,
      };

    default:
      return state;
  }
}

export const MusicProvider = ({ children }) => {
  // Initialize state with saved data if available
  const loadInitialState = () => {
    try {
      const savedState = localStorage.getItem("musicPlayerState");
      if (savedState) {
        const parsedState = JSON.parse(savedState);

        // Combine sample tracks with custom tracks
        const allTracks = [
          ...initialState.tracks,
          ...(parsedState.customTracks || []),
        ];

        // Find the previously playing track if it exists
        let currentTrack = null;
        let currentTrackIndex = -1;

        if (parsedState.currentTrackId) {
          currentTrack = allTracks.find(
            (track) => track.id === parsedState.currentTrackId
          );
          if (currentTrack) {
            currentTrackIndex = allTracks.findIndex(
              (track) => track.id === parsedState.currentTrackId
            );
          }
        }

        return {
          ...initialState,
          volume: parsedState.volume || initialState.volume,
          playlists: parsedState.playlists || initialState.playlists,
          repeat: parsedState.repeat || initialState.repeat,
          shuffle: parsedState.shuffle || initialState.shuffle,
          tracks: allTracks,
          // Restore playback state
          currentTrack: currentTrack,
          currentTrackIndex: currentTrackIndex,
          isPlaying: false, // Always start paused for better UX
          currentTime: parsedState.currentTime || 0,
          queue: allTracks, // Use all tracks as the default queue
        };
      }
    } catch (error) {
      console.error("Failed to load saved state:", error);
    }
    return initialState;
  };

  const [state, dispatch] = useReducer(musicReducer, loadInitialState());

  // Save state to localStorage when it changes
  useEffect(() => {
    // Extract custom tracks (non-sample tracks)
    const customTracks = state.tracks.filter(
      (track) => !track.previewUrl.startsWith("/audio/")
    );

    const stateToSave = {
      volume: state.volume,
      playlists: state.playlists,
      repeat: state.repeat,
      shuffle: state.shuffle,
      customTracks: customTracks,
      // Save current track and playback state
      currentTrackId: state.currentTrack?.id,
      isPlaying: state.isPlaying,
      currentTime: state.currentTime,
    };

    localStorage.setItem("musicPlayerState", JSON.stringify(stateToSave));
  }, [
    state.volume,
    state.playlists,
    state.repeat,
    state.shuffle,
    state.tracks,
    state.currentTrack,
    state.isPlaying,
    state.currentTime,
  ]);

  // Helper function to find a track by ID
  const getTrackById = (trackId) => {
    return state.tracks.find((track) => track.id === trackId);
  };

  // Get all favorite tracks as objects
  const getFavoriteTracks = () => {
    return state.playlists.favorites
      .map((id) => getTrackById(id))
      .filter(Boolean);
  };

  // Get recently played tracks as objects
  const getRecentlyPlayedTracks = () => {
    return state.playlists.recentlyPlayed
      .map((id) => getTrackById(id))
      .filter(Boolean);
  };

  // Get tracks for a specific playlist
  const getPlaylistTracks = (playlistId) => {
    const playlist = state.playlists.custom[playlistId];
    if (!playlist) return [];
    return playlist.tracks.map((id) => getTrackById(id)).filter(Boolean);
  };

  // Get all playlists
  const getAllPlaylists = () => {
    return Object.entries(state.playlists.custom).map(([id, playlist]) => ({
      id,
      name: playlist.name,
      trackCount: playlist.tracks.length,
      tracks: playlist.tracks
        .map((trackId) => getTrackById(trackId))
        .filter(Boolean),
    }));
  };

  const value = {
    ...state,
    playTrack: (track) => dispatch({ type: "PLAY_TRACK", track }),
    togglePlayback: () => dispatch({ type: "TOGGLE_PLAYBACK" }),
    setVolume: (volume) => dispatch({ type: "SET_VOLUME", volume }),
    setCurrentTime: (time) => dispatch({ type: "SET_CURRENT_TIME", time }),
    setDuration: (duration) => dispatch({ type: "SET_DURATION", duration }),
    nextTrack: () => dispatch({ type: "NEXT_TRACK" }),
    prevTrack: () => dispatch({ type: "PREV_TRACK" }),
    setQueue: (tracks, autoplay = true) =>
      dispatch({ type: "SET_QUEUE", tracks, autoplay }),
    toggleFavorite: (trackId) => dispatch({ type: "TOGGLE_FAVORITE", trackId }),
    toggleRepeat: () => dispatch({ type: "TOGGLE_REPEAT" }),
    toggleShuffle: () => dispatch({ type: "TOGGLE_SHUFFLE" }),
    setAudioData: (data) => dispatch({ type: "SET_AUDIO_DATA", data }),
    deleteTrack: (trackId) => dispatch({ type: "DELETE_TRACK", trackId }),
    addToQueue: (track, playNext = false) =>
      dispatch({ type: "ADD_TO_QUEUE", track, playNext }),
    createPlaylist: (name, tracks = []) => {
      const playlistId = `playlist-${Date.now()}`;
      dispatch({
        type: "CREATE_PLAYLIST",
        playlistId,
        name,
        tracks,
      });
      return playlistId;
    },
    deletePlaylist: (playlistId) =>
      dispatch({ type: "DELETE_PLAYLIST", playlistId }),
    addToPlaylist: (playlistId, trackIds) =>
      dispatch({
        type: "ADD_TO_PLAYLIST",
        playlistId,
        trackIds: Array.isArray(trackIds) ? trackIds : [trackIds],
      }),
    removeFromPlaylist: (playlistId, trackIds) =>
      dispatch({
        type: "REMOVE_FROM_PLAYLIST",
        playlistId,
        trackIds: Array.isArray(trackIds) ? trackIds : [trackIds],
      }),
    getTrackById,
    getFavoriteTracks,
    getRecentlyPlayedTracks,
    getPlaylistTracks,
    getAllPlaylists,
  };

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
};
