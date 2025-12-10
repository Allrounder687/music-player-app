import "../errorLogger"; // Add error logger first
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CustomTopBar } from "../components/CustomTopBar";
import { Sidebar } from "../components/Sidebar";
import { AudioPlayer } from "../components/AudioPlayer";
import { NowPlaying } from "../pages/NowPlaying";
import { Favourites } from "../pages/Favourites";
import { Playlists } from "../pages/Playlists";
import { Library } from "../pages/Library";
import { ModernDashboard } from "../components/ModernDashboard";
import { MusicProvider } from "../store/MusicContext";
import { ThemeProvider } from "../store/ThemeContext";
import { NotificationManager } from "../components/NotificationManager";
import "../styles/main.css";

const App = () => {
  const [useModernUI, setUseModernUI] = useState(true);

  return (
    <ThemeProvider>
      <MusicProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="relative h-screen w-screen">
            {/* Custom draggable top bar */}
            <CustomTopBar />

            {useModernUI ? (
              <div className="pt-8 h-full">
                <ModernDashboard />
                {/* Hidden audio player component to handle playback */}
                <AudioPlayer />

                {/* UI Toggle Button */}
                <button
                  onClick={() => setUseModernUI(false)}
                  className="fixed top-10 right-4 z-50 px-3 py-2 bg-gray-800/80 backdrop-blur-sm text-white text-sm rounded-lg hover:bg-gray-700/80 transition-all duration-200"
                  style={{ WebkitAppRegion: 'no-drag' }}
                  title="Switch to Classic UI"
                >
                  Classic UI
                </button>
              </div>
            ) : (
              <div className="h-full pt-8 gpu-accelerated">
                <Sidebar />
                <div className="ml-56 flex flex-col h-full overflow-hidden smooth-scroll">
                  <main className="flex-1 overflow-y-auto">
                    <Routes>
                      <Route path="/" element={<NowPlaying />} />
                      <Route path="/library" element={<Library />} />
                      <Route path="/favourites" element={<Favourites />} />
                      <Route path="/playlists" element={<Playlists />} />
                    </Routes>
                  </main>
                </div>
                {/* Hidden audio player component to handle playback */}
                <AudioPlayer />

                {/* UI Toggle Button */}
                <button
                  onClick={() => setUseModernUI(true)}
                  className="fixed top-4 right-4 z-50 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all duration-200 non-draggable"
                  title="Switch to Modern UI"
                >
                  Modern UI
                </button>
              </div>
            )}

            {/* Global Notification Manager */}
            <NotificationManager />
          </div>
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
