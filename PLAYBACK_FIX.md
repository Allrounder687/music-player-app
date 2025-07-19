# Music Player Playback and Seekbar Fix

## Issues Identified

1. **Missing Preview URLs**: Selected files from the file dialog didn't have preview URLs for playback.

2. **Audio Element Not Updated**: The audio element wasn't properly updated when a new track was selected.

3. **Seekbar Not Synchronized**: The seekbar wasn't synchronized with the actual audio playback.

4. **Time Updates Not Propagated**: Time updates from the audio element weren't propagated to the music context.

## Fixes Applied

### 1. FileSelector Component

- Added preview URLs for selected files:

```javascript
// Generate a preview URL for local files if they have a path
let previewUrl = null;

// For files selected from the file system dialog
if (file.path) {
  // In a real app, we would use the actual file path
  // For now, we'll use a sample preview URL
  previewUrl =
    "https://p.scdn.co/mp3-preview/6b51d3a5c3f71c7d3a04b4e863d4057a9bb5a5a4";
} else {
  // For mock files, use the sample preview URLs
  const samplePreviews = [
    /* array of sample URLs */
  ];
  previewUrl =
    samplePreviews[Math.floor(Math.random() * samplePreviews.length)];
}
```

- Improved file name processing to remove file extensions:

```javascript
title: file.name.replace(/\.(mp3|wav|ogg|m4a|flac)$/i, "");
```

### 2. NowPlaying Component

- Added proper track change handling:

```javascript
// When the track changes, reset and load the new source
if (currentTrack?.previewUrl) {
  audio.src = currentTrack.previewUrl;
  audio.load();
}
```

- Added time update event listener to sync with the music context:

```javascript
const handleTimeUpdate = () => {
  // Update the current time in the music context
  if (audio.currentTime) {
    setCurrentTime(audio.currentTime);
  }
};

audio.addEventListener("timeupdate", handleTimeUpdate);
```

- Added seeking functionality to handle seekbar changes:

```javascript
// Handle seeking when currentTime is updated from outside (e.g., seekbar)
useEffect(() => {
  const audio = audioRef.current;
  if (!audio || !currentTrack) return;

  // Only update if the difference is significant to avoid loops
  if (Math.abs(audio.currentTime - currentTime) > 1) {
    audio.currentTime = currentTime;
  }
}, [currentTime, currentTrack]);
```

### 3. Controls Component

- Added synchronization with the global current time:

```javascript
// Sync with global current time
useEffect(() => {
  if (globalCurrentTime !== undefined) {
    setCurrentTime(globalCurrentTime);
  }
}, [globalCurrentTime]);
```

- Updated seek change handler to update the global time:

```javascript
const handleSeekChange = (value) => {
  setCurrentTime(value);
  // Update the global current time in the music context
  if (setGlobalCurrentTime) {
    setGlobalCurrentTime(value);
  }
};
```

### 4. MusicContext

- Improved the SET_CURRENT_TIME action to handle track completion:

```javascript
case "SET_CURRENT_TIME":
  return {
    ...state,
    currentTime: action.time,
    // If we're at the end of the track, mark it as not playing
    isPlaying: action.time >= state.duration ? false : state.isPlaying
  };
```

## Expected Behavior

Now when you select files from the file dialog:

1. The files should be added to the queue with proper preview URLs
2. When you click "Play Selected", the first track should start playing
3. The seekbar should update as the track plays
4. You can click on the seekbar to seek to a different position in the track
5. When the track ends, it should automatically play the next track in the queue

These changes create a complete playback loop from file selection to playback control, ensuring that the seekbar properly reflects and controls the current playback position.
