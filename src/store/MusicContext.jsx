import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
} from "react";

const MusicContext = createContext();

// Sample tracks data with local resources
const sampleTracks = [
  {
    id: "1",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    duration: 355, // in seconds
    imageUrl: "/images/album-placeholder.svg",
    previewUrl: "/audio/sample1.mp3",
  },
  {
    id: "2",
    title: "Stairway to Heaven",
    artist: "Led Zeppelin",
    album: "Led Zeppelin IV",
    duration: 482, // in seconds
    imageUrl: "/images/album-placeholder.svg",
    previewUrl: "/audio/sample2.mp3",
  },
  {
    id: "3",
    title: "Hotel California",
    artist: "Eagles",
    album: "Hotel California",
    duration: 390, // in seconds
    imageUrl: "/images/album-placeholder.svg",
    previewUrl: "/audio/sample3.mp3",
  },
  {
    id: "4",
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    album: "Appetite for Destruction",
    duration: 356, // in seconds
    imageUrl: "/images/album-placeholder.svg",
    previewUrl: "/audio/sample1.mp3",
  },
  {
    id: "5",
    title: "Smells Like Teen Spirit",
    artist: "Nirvana",
    album: "Nevermind",
    duration: 301, // in seconds
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

  // Memoize the state values that are used for localStorage to prevent unnecessary saves
  const persistentState = useMemo(() => {
    // Extract custom tracks (non-sample tracks)
    const customTracks = state.tracks.filter(
      (track) => !track.previewUrl?.startsWith("/audio/")
    );

    return {
      volume: state.volume,
      playlists: state.playlists,
      repeat: state.repeat,
      shuffle: state.shuffle,
      customTracks: customTracks,
    };
  }, [
    state.volume,
    state.playlists,
    state.repeat,
    state.shuffle,
    state.tracks,
  ]);

  // Save state to localStorage when persistent values change
  useEffect(() => {
    try {
      localStorage.setItem("musicPlayerState", JSON.stringify(persistentState));
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  }, [persistentState]);

  // Helper function to find a track by ID - memoized to prevent unnecessary re-renders
  const getTrackById = useCallback(
    (trackId) => {
      return state.tracks.find((track) => track.id === trackId);
    },
    [state.tracks]
  );

  // Get all favorite tracks as objects - memoized
  const getFavoriteTracks = useCallback(() => {
    return state.playlists.favorites
      .map((id) => getTrackById(id))
      .filter(Boolean);
  }, [state.playlists.favorites, getTrackById]);

  // Get recently played tracks as objects - memoized
  const getRecentlyPlayedTracks = useCallback(() => {
    return state.playlists.recentlyPlayed
      .map((id) => getTrackById(id))
      .filter(Boolean);
  }, [state.playlists.recentlyPlayed, getTrackById]);

  // Get tracks for a specific playlist - memoized
  const getPlaylistTracks = useCallback(
    (playlistId) => {
      const playlist = state.playlists.custom[playlistId];
      if (!playlist) return [];
      return playlist.tracks.map((id) => getTrackById(id)).filter(Boolean);
    },
    [state.playlists.custom, getTrackById]
  );

  // Get all playlists - memoized
  const getAllPlaylists = useCallback(() => {
    return Object.entries(state.playlists.custom).map(([id, playlist]) => ({
      id,
      name: playlist.name,
      trackCount: playlist.tracks.length,
      tracks: playlist.tracks
        .map((trackId) => getTrackById(trackId))
        .filter(Boolean),
    }));
  }, [state.playlists.custom, getTrackById]);

  // Memoized action creators to prevent unnecessary re-renders
  const actions = useMemo(
    () => ({
      playTrack: (track) => {
        dispatch({ type: "PLAY_TRACK", track });
        // Show toast notification
        if (window.showToast) {
          window.showToast(`Now playing: ${track.title}`, "success", 2000);
        }
      },
      togglePlayback: () => dispatch({ type: "TOGGLE_PLAYBACK" }),
      setVolume: (volume) => dispatch({ type: "SET_VOLUME", volume }),
      setCurrentTime: (time) => dispatch({ type: "SET_CURRENT_TIME", time }),
      setDuration: (duration) => dispatch({ type: "SET_DURATION", duration }),
      nextTrack: () => dispatch({ type: "NEXT_TRACK" }),
      prevTrack: () => dispatch({ type: "PREV_TRACK" }),
      setQueue: (tracks, autoplay = true) => {
        dispatch({ type: "SET_QUEUE", tracks, autoplay });
        if (window.showToast && tracks.length > 0) {
          window.showToast(
            `Queue updated with ${tracks.length} tracks`,
            "info",
            2000
          );
        }
      },
      toggleFavorite: (trackId) => {
        const track = state.tracks.find((t) => t.id === trackId);
        const isFavorite = state.playlists.favorites.includes(trackId);
        dispatch({ type: "TOGGLE_FAVORITE", trackId });

        if (window.showToast && track) {
          window.showToast(
            `${track.title} ${
              isFavorite ? "removed from" : "added to"
            } favorites`,
            isFavorite ? "info" : "success",
            2000
          );
        }
      },
      toggleRepeat: () => {
        dispatch({ type: "TOGGLE_REPEAT" });
        if (window.showToast) {
          window.showToast(
            `Repeat ${state.repeat ? "off" : "on"}`,
            "info",
            1500
          );
        }
      },
      toggleShuffle: () => {
        dispatch({ type: "TOGGLE_SHUFFLE" });
        if (window.showToast) {
          window.showToast(
            `Shuffle ${state.shuffle ? "off" : "on"}`,
            "info",
            1500
          );
        }
      },
      setAudioData: (data) => dispatch({ type: "SET_AUDIO_DATA", data }),
      createPlaylist: (name, tracks = []) => {
        const playlistId = `playlist-${Date.now()}`;
        dispatch({
          type: "CREATE_PLAYLIST",
          playlistId,
          name,
          tracks,
        });
        if (window.showToast) {
          window.showToast(`Playlist "${name}" created`, "success", 2000);
        }
        return playlistId;
      },
      deletePlaylist: (playlistId) => {
        const playlist = state.playlists.custom[playlistId];
        dispatch({ type: "DELETE_PLAYLIST", playlistId });
        if (window.showToast && playlist) {
          window.showToast(`Playlist "${playlist.name}" deleted`, "info", 2000);
        }
      },
      addToPlaylist: (playlistId, trackIds) => {
        const playlist = state.playlists.custom[playlistId];
        dispatch({
          type: "ADD_TO_PLAYLIST",
          playlistId,
          trackIds: Array.isArray(trackIds) ? trackIds : [trackIds],
        });
        if (window.showToast && playlist) {
          const count = Array.isArray(trackIds) ? trackIds.length : 1;
          window.showToast(
            `${count} track${count > 1 ? "s" : ""} added to "${playlist.name}"`,
            "success",
            2000
          );
        }
      },
      removeFromPlaylist: (playlistId, trackIds) => {
        const playlist = state.playlists.custom[playlistId];
        dispatch({
          type: "REMOVE_FROM_PLAYLIST",
          playlistId,
          trackIds: Array.isArray(trackIds) ? trackIds : [trackIds],
        });
        if (window.showToast && playlist) {
          const count = Array.isArray(trackIds) ? trackIds.length : 1;
          window.showToast(
            `${count} track${count > 1 ? "s" : ""} removed from "${
              playlist.name
            }"`,
            "info",
            2000
          );
        }
      },
    }),
    [
      state.tracks,
      state.playlists.favorites,
      state.playlists.custom,
      state.repeat,
      state.shuffle,
    ]
  );

  // Memoize the complete context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      ...state,
      ...actions,
      getTrackById,
      getFavoriteTracks,
      getRecentlyPlayedTracks,
      getPlaylistTracks,
      getAllPlaylists,
    }),
    [
      state,
      actions,
      getTrackById,
      getFavoriteTracks,
      getRecentlyPlayedTracks,
      getPlaylistTracks,
      getAllPlaylists,
    ]
  );

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
