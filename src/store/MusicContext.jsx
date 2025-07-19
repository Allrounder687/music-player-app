import React, { createContext, useContext, useReducer, useEffect } from "react";

const MusicContext = createContext();

// Empty initial tracks - no more placeholder tracks
const sampleTracks = [];

const initialState = {
  tracks: sampleTracks,
  currentTrack: null,
  isPlaying: false,
  volume: 0.8,
  currentTime: 0,
  duration: 0,
  queue: [],
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
    favorites: [], // No sample favorites
    recentlyPlayed: [],
    custom: {},
  },
  // Add toast notification state
  toasts: [],
};

function musicReducer(state, action) {
  switch (action.type) {
    case "PLAY_TRACK":
      // Add a safety check to prevent endless loops
      const lastTrackId = state.currentTrack?.id;
      const lastTrackTime = Date.now();

      // If we've tried to play the same track multiple times in quick succession, stop
      if (
        state._lastTrackChange &&
        state._lastTrackId === action.track.id &&
        lastTrackTime - state._lastTrackChange < 2000
      ) {
        console.warn("Preventing rapid track changes - possible loop detected");
        return {
          ...state,
          isPlaying: false, // Stop playback to break the loop
        };
      }

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
          // Track last change to prevent loops
          _lastTrackId: action.track.id,
          _lastTrackChange: Date.now(),
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
          // Track last change to prevent loops
          _lastTrackId: action.track.id,
          _lastTrackChange: Date.now(),
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

      // Add a safety check to prevent endless loops
      const lastTrackId = state.currentTrack?.id;
      const lastTrackTime = Date.now();

      // If we've tried to play the same track multiple times in quick succession, stop
      if (
        state._lastTrackChange &&
        state._lastTrackId === lastTrackId &&
        lastTrackTime - state._lastTrackChange < 2000
      ) {
        console.warn("Preventing rapid track changes - possible loop detected");
        return {
          ...state,
          isPlaying: false, // Stop playback to break the loop
        };
      }

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
          // Track last change to prevent loops
          _lastTrackId: state.queue[nextIndex].id,
          _lastTrackChange: Date.now(),
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
        // Track last change to prevent loops
        _lastTrackId: state.queue[nextIndex].id,
        _lastTrackChange: Date.now(),
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

      if (!action.tracks || action.tracks.length === 0) {
        console.warn("Attempted to set empty queue");
        return state;
      }

      // Filter out any invalid tracks
      const validTracks = action.tracks.filter((track) => {
        if (!track) {
          console.warn("Null track found in queue");
          return false;
        }
        if (!track.id) {
          console.warn("Track without ID found:", track);
          return false;
        }
        return true;
      });

      if (validTracks.length === 0) {
        console.warn("No valid tracks in queue");
        return state;
      }

      console.log("Valid tracks for queue:", validTracks);

      // Get tracks that are not already in the global tracks list
      const existingTrackIds = new Set(state.tracks.map((t) => t.id));
      const newTracks = validTracks.filter(
        (track) => !existingTrackIds.has(track.id)
      );

      // Update playlists to include new track IDs in recently played if autoplay is true
      const updatedPlaylists = action.autoplay
        ? {
            ...state.playlists,
            recentlyPlayed: [
              validTracks[0].id,
              ...state.playlists.recentlyPlayed.filter(
                (id) => id !== validTracks[0].id
              ),
            ].slice(0, 20),
          }
        : state.playlists;

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

    case "ADD_TO_QUEUE":
      const trackToAdd = action.track;
      if (!trackToAdd || !trackToAdd.id) {
        return {
          ...state,
          toasts: [...state.toasts, { id: Date.now(), message: "Invalid track", type: "error" }]
        };
      }

      // Check if track is already in queue
      const isInQueue = state.queue.some(t => t.id === trackToAdd.id);
      if (isInQueue) {
        return {
          ...state,
          toasts: [...state.toasts, { id: Date.now(), message: "Track already in queue", type: "info" }]
        };
      }

      // Add track to end of queue
      return {
        ...state,
        queue: [...state.queue, trackToAdd],
        toasts: [...state.toasts, { id: Date.now(), message: `Added "${trackToAdd.title}" to queue`, type: "success" }]
      };

    case "REMOVE_FROM_QUEUE":
      const indexToRemove = action.index;
      if (indexToRemove < 0 || indexToRemove >= state.queue.length) {
        return state;
      }

      const newQueue = state.queue.filter((_, index) => index !== indexToRemove);
      let newCurrentTrackIndex = state.currentTrackIndex;
      let newCurrentTrack = state.currentTrack;

      // Adjust current track index if necessary
      if (indexToRemove === state.currentTrackIndex) {
        // If we removed the current track, stop playback
        newCurrentTrack = null;
        newCurrentTrackIndex = -1;
      } else if (indexToRemove < state.currentTrackIndex) {
        // If we removed a track before the current one, decrement index
        newCurrentTrackIndex = state.currentTrackIndex - 1;
      }

      return {
        ...state,
        queue: newQueue,
        currentTrackIndex: newCurrentTrackIndex,
        currentTrack: newCurrentTrack,
        isPlaying: newCurrentTrack ? state.isPlaying : false,
        toasts: [...state.toasts, { id: Date.now(), message: "Removed from queue", type: "success" }]
      };

    case "DELETE_TRACK":
      const trackIdToDelete = action.trackId;
      
      // Remove from tracks list
      const newTracksList = state.tracks.filter(track => track.id !== trackIdToDelete);
      
      // Remove from queue
      const newQueueAfterDelete = state.queue.filter(track => track.id !== trackIdToDelete);
      
      // Remove from all playlists
      const newFavorites = state.playlists.favorites.filter(id => id !== trackIdToDelete);
      const newRecentlyPlayed = state.playlists.recentlyPlayed.filter(id => id !== trackIdToDelete);
      
      const newCustomPlaylists = Object.fromEntries(
        Object.entries(state.playlists.custom).map(([playlistId, playlist]) => [
          playlistId,
          {
            ...playlist,
            tracks: playlist.tracks.filter(id => id !== trackIdToDelete)
          }
        ])
      );

      // Handle current track if it's being deleted
      let newCurrentTrackAfterDelete = state.currentTrack;
      let newCurrentTrackIndexAfterDelete = state.currentTrackIndex;
      let newIsPlayingAfterDelete = state.isPlaying;

      if (state.currentTrack?.id === trackIdToDelete) {
        newCurrentTrackAfterDelete = null;
        newCurrentTrackIndexAfterDelete = -1;
        newIsPlayingAfterDelete = false;
      } else {
        // Find new index of current track in updated queue
        const currentTrackIndex = newQueueAfterDelete.findIndex(
          track => track.id === state.currentTrack?.id
        );
        newCurrentTrackIndexAfterDelete = currentTrackIndex;
      }

      return {
        ...state,
        tracks: newTracksList,
        queue: newQueueAfterDelete,
        currentTrack: newCurrentTrackAfterDelete,
        currentTrackIndex: newCurrentTrackIndexAfterDelete,
        isPlaying: newIsPlayingAfterDelete,
        playlists: {
          favorites: newFavorites,
          recentlyPlayed: newRecentlyPlayed,
          custom: newCustomPlaylists
        },
        toasts: [...state.toasts, { id: Date.now(), message: "Track deleted", type: "success" }]
      };

    case "TOGGLE_FAVORITE":
      const trackId = action.trackId;
      const isFavorite = state.playlists.favorites.includes(trackId);
      const message = isFavorite ? "Removed from favorites" : "Added to favorites";
      
      return {
        ...state,
        playlists: {
          ...state.playlists,
          favorites: isFavorite
            ? state.playlists.favorites.filter((id) => id !== trackId)
            : [...state.playlists.favorites, trackId],
        },
        toasts: [...state.toasts, { id: Date.now(), message, type: "success" }]
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

    case "ADD_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, action.toast]
      };

    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.toastId)
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
        return {
          ...initialState,
          volume: parsedState.volume || initialState.volume,
          playlists: parsedState.playlists || initialState.playlists,
          repeat: parsedState.repeat || initialState.repeat,
          shuffle: parsedState.shuffle || initialState.shuffle,
          tracks: [...initialState.tracks, ...(parsedState.customTracks || [])],
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
      (track) => !track.previewUrl || !track.previewUrl.startsWith("/audio/")
    );

    const stateToSave = {
      volume: state.volume,
      playlists: state.playlists,
      repeat: state.repeat,
      shuffle: state.shuffle,
      customTracks: customTracks,
    };

    localStorage.setItem("musicPlayerState", JSON.stringify(stateToSave));
  }, [
    state.volume,
    state.playlists,
    state.repeat,
    state.shuffle,
    state.tracks,
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
    addToQueue: (track) => dispatch({ type: "ADD_TO_QUEUE", track }),
    removeFromQueue: (index) => dispatch({ type: "REMOVE_FROM_QUEUE", index }),
    deleteTrack: (trackId) => dispatch({ type: "DELETE_TRACK", trackId }),
    toggleFavorite: (trackId) => dispatch({ type: "TOGGLE_FAVORITE", trackId }),
    toggleRepeat: () => dispatch({ type: "TOGGLE_REPEAT" }),
    toggleShuffle: () => dispatch({ type: "TOGGLE_SHUFFLE" }),
    setAudioData: (data) => dispatch({ type: "SET_AUDIO_DATA", data }),
    addToast: (toast) => dispatch({ type: "ADD_TOAST", toast }),
    removeToast: (toastId) => dispatch({ type: "REMOVE_TOAST", toastId }),
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
