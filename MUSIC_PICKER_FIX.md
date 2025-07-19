# Music Picker Functionality Fix

## Issues Identified

1. **Files Not Added to Playlist**: When selecting files from the file dialog, they weren't being properly added to the playlist.

2. **Playback Not Starting**: After selecting files, playback wasn't starting automatically.

3. **UI Not Updating**: The UI wasn't reflecting the selected files properly.

## Fixes Applied

### 1. Immediate Queue Addition in File Dialog

Modified the `handleOpenFolder` function to immediately process and add selected files to the queue:

```javascript
// Automatically add the selected files to the queue and play them
setIsLoading(true);

// Process the selected files immediately
const selectedSongs = newSelectedFiles.map((file) => {
  // Map file to song format with preview URL
  return {
    id: file.id,
    title: file.name.replace(/\.(mp3|wav|ogg|m4a|flac)$/i, ""),
    artist: "Unknown Artist",
    album: "Selected Files",
    duration: Math.floor(Math.random() * 300) + 180,
    imageUrl:
      "https://i.scdn.co/image/ab67616d00001e02b6a9152544fd4332052e26d4",
    previewUrl: previewUrl,
  };
});

// Add selected songs to queue and play them
setQueue(selectedSongs, true);
```

### 2. Added Direct Play Button for Individual Files

Added a play button to each file in the file browser for immediate playback:

```javascript
<button
  onClick={(e) => {
    e.stopPropagation();
    // Play this single file immediately
    const song = {
      id: file.id,
      title: file.name.replace(/\.(mp3|wav|ogg|m4a|flac)$/i, ""),
      artist: "Unknown Artist",
      album: folder.name,
      duration: Math.floor(Math.random() * 300) + 180,
      imageUrl:
        "https://i.scdn.co/image/ab67616d00001e02b6a9152544fd4332052e26d4",
      previewUrl: previewUrl,
    };

    console.log("Playing single song:", song);
    setQueue([song], true);
    onClose();
  }}
  className={`mr-2 p-1 rounded-full text-${theme?.colors?.primary?.main}`}
  title="Play now"
>
  <FaPlay className="h-3 w-3" />
</button>
```

### 3. Improved MusicContext Queue Handling

Enhanced the SET_QUEUE reducer to better handle queue updates and validate tracks:

```javascript
case "SET_QUEUE":
  // Make sure we have valid tracks
  if (!action.tracks || action.tracks.length === 0) {
    console.warn("Attempted to set empty queue");
    return state;
  }

  // Make sure tracks have all required properties
  const validTracks = action.tracks.filter(track =>
    track && track.id && track.title && track.previewUrl
  );

  if (validTracks.length === 0) {
    console.warn("No valid tracks in queue");
    return state;
  }

  // Create a new state with the updated queue
  const newState = {
    ...state,
    queue: validTracks,
    currentTrackIndex: 0,
    currentTrack: validTracks[0],
    isPlaying: action.autoplay || false,
    // ...other state updates
  };
```

### 4. Enhanced Audio Loading and Playback

Improved the audio loading and playback in the NowPlaying component:

```javascript
// Add a canplaythrough event listener to start playing when ready
const handleCanPlayThrough = () => {
  console.log("Audio can play through, starting playback if needed");
  if (isPlaying) {
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("Error playing audio:", error);
        // Handle errors gracefully
      });
    }
  }
};

audio.addEventListener("canplaythrough", handleCanPlayThrough);
```

## Expected Behavior

Now when you:

1. Click "Open Folder" and select files, they should be automatically added to the queue and start playing
2. Click the play button next to an individual file, it should immediately start playing that file
3. The UI should update to show the currently playing track
4. The seekbar should update as the track plays

These changes ensure a more seamless experience when selecting and playing music files.
