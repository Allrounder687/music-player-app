import React from "react";
import MusicSearch from "../components/MusicSearch";
import { useTheme } from "../store/ThemeContext";

/**
 * StreamingPage component for searching and playing streaming music
 */
const StreamingPage = () => {
  const { theme } = useTheme();

  return (
    <div
      className="p-6 h-full overflow-y-auto"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <h1 className="text-3xl font-bold mb-6 text-white">Music Streaming</h1>
      <p className="mb-4" style={{ color: "var(--text-muted)" }}>
        Search for music across multiple streaming providers and play them
        directly in the app.
      </p>

      <div
        className="rounded-lg shadow-md"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <MusicSearch />
      </div>
    </div>
  );
};

export default StreamingPage;
