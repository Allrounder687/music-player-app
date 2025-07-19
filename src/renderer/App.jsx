import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Topbar } from "../components/Topbar";
import { Sidebar } from "../components/Sidebar";
import { AudioPlayer } from "../components/AudioPlayer";
import { ToastContainer } from "../components/Toast";
import { NowPlaying } from "../pages/NowPlaying";
import { Favourites } from "../pages/Favourites";
import { Playlists } from "../pages/Playlists";
import { Library } from "../pages/Library";
import { MusicProvider, useMusic } from "../store/MusicContext";
import { ThemeProvider } from "../store/ThemeContext";
import "../styles/main.css";

const AppContent = () => {
  const {
    togglePlayback,
    nextTrack,
    prevTrack,
    setVolume,
    volume,
    setCurrentTime,
    currentTime,
    duration,
  } = useMusic();

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ": // Spacebar for play/pause
          e.preventDefault();
          togglePlayback();
          break;
        case "arrowright": // Right arrow for next track
          e.preventDefault();
          nextTrack();
          break;
        case "arrowleft": // Left arrow for previous track
          e.preventDefault();
          prevTrack();
          break;
        case "arrowup": // Up arrow for volume up
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case "arrowdown": // Down arrow for volume down
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case "m": // M for mute/unmute
          e.preventDefault();
          setVolume(volume === 0 ? 0.8 : 0);
          break;
        case "j": // J to seek backward 10 seconds
          e.preventDefault();
          setCurrentTime(Math.max(0, currentTime - 10));
          break;
        case "l": // L to seek forward 10 seconds
          e.preventDefault();
          setCurrentTime(Math.min(duration, currentTime + 10));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    togglePlayback,
    nextTrack,
    prevTrack,
    setVolume,
    volume,
    setCurrentTime,
    currentTime,
    duration,
  ]);

  return (
    <Router>
      <div className="flex h-screen w-screen overflow-hidden bg-gray-900 text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<NowPlaying />} />
              <Route path="/library" element={<Library />} />
              <Route path="/favourites" element={<Favourites />} />
              <Route path="/playlists" element={<Playlists />} />
            </Routes>
          </main>
        </div>
      </div>
      {/* Hidden audio player component to handle playback */}
      <AudioPlayer />
      {/* Toast notifications */}
      <ToastContainer />
    </Router>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <MusicProvider>
        <AppContent />
      </MusicProvider>
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
