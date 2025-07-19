import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Topbar } from "../components/Topbar";
import { Sidebar } from "../components/Sidebar";
import { AudioPlayer } from "../components/AudioPlayer";
import { Toast } from "../components/Toast";
import { NowPlaying } from "../pages/NowPlaying";
import { Favourites } from "../pages/Favourites";
import { Playlists } from "../pages/Playlists";
import { Library } from "../pages/Library";
import { Queue } from "../pages/Queue";
import { MusicProvider } from "../store/MusicContext";
import { ThemeProvider, useTheme } from "../store/ThemeContext";
import "../styles/main.css";

const ThemedApp = () => {
  const { theme } = useTheme();
  
  return (
    <Router>
      <div className={`flex h-screen w-screen overflow-hidden bg-${theme?.colors?.background?.main || "gray-900"} text-${theme?.colors?.text?.primary || "white"}`}>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<NowPlaying />} />
              <Route path="/library" element={<Library />} />
              <Route path="/favourites" element={<Favourites />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/queue" element={<Queue />} />
            </Routes>
          </main>
        </div>
      </div>
      {/* Hidden audio player component to handle playback */}
      <AudioPlayer />
      {/* Toast notifications */}
      <Toast />
    </Router>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <MusicProvider>
        <ThemedApp />
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
