import React, { useState } from "react";
import MusicSearch from "../components/MusicSearch";
import VideoDownloader from "../components/VideoDownloader";
import { useTheme } from "../store/ThemeContext";
import { FaSearch, FaDownload } from "react-icons/fa";

/**
 * StreamingPage component for searching and playing streaming music
 */
const StreamingPage = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("search"); // 'search' or 'download'

  return (
    <div
      className="p-6 h-full overflow-y-auto"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <h1 className="text-3xl font-bold mb-6 text-white">Music Streaming</h1>
      <p className="mb-4" style={{ color: "var(--text-muted)" }}>
        Search for music across multiple streaming providers, play them directly
        in the app, or download videos and audio.
      </p>

      {/* Tab navigation */}
      <div className="flex mb-4">
        <button
          onClick={() => setActiveTab("search")}
          className={`px-4 py-2 rounded-l flex items-center ${
            activeTab === "search" ? "text-white" : ""
          }`}
          style={{
            backgroundColor:
              activeTab === "search"
                ? "var(--accent-color)"
                : "var(--bg-secondary)",
          }}
        >
          <FaSearch className="mr-2" /> Search
        </button>
        <button
          onClick={() => setActiveTab("download")}
          className={`px-4 py-2 rounded-r flex items-center ${
            activeTab === "download" ? "text-white" : ""
          }`}
          style={{
            backgroundColor:
              activeTab === "download"
                ? "var(--accent-color)"
                : "var(--bg-secondary)",
          }}
        >
          <FaDownload className="mr-2" /> Download
        </button>
      </div>

      <div
        className="rounded-lg shadow-md"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        {activeTab === "search" ? <MusicSearch /> : <VideoDownloader />}
      </div>
    </div>
  );
};

export default StreamingPage;
