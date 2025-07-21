import "../errorLogger"; // Add error logger first
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Topbar } from "../components/Topbar";
import { Sidebar } from "../components/Sidebar";
import { AudioPlayer } from "../components/AudioPlayer";
import { NowPlaying } from "../pages/NowPlaying";
import { Favourites } from "../pages/Favourites";
import { Playlists } from "../pages/Playlists";
import { Library } from "../pages/Library";
import { MusicProvider } from "../store/MusicContext";
import { ThemeProvider } from "../store/ThemeContext";
import "../styles/main.css";

const App = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <ThemeProvider>
      <MusicProvider>
        <Router>
          <div className="flex h-screen w-screen overflow-hidden">
            {/* Sidebar - collapsed to icon-only when not visible */}
            <Sidebar isVisible={sidebarVisible} toggleSidebar={toggleSidebar} />

            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Topbar
                toggleSidebar={toggleSidebar}
                sidebarVisible={sidebarVisible}
              />
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
        </Router>
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
