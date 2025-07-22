import React, { useState, useEffect } from "react";
import { useMusic } from "../store/MusicContext";
import { useTheme } from "../store/ThemeContext";
import {
  searchSongs,
  initializeMusicProvider,
} from "../utils/musicProviderService.js";
import { FaSearch, FaPlay, FaPlus, FaHeart, FaRegHeart } from "react-icons/fa";

/**
 * MusicSearch component for searching and playing streaming music
 */
const MusicSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  const { playTrack, addToQueue, toggleFavorite, playlists } = useMusic();
  const { theme } = useTheme();

  // Initialize the music provider
  useEffect(() => {
    async function init() {
      try {
        const success = await initializeMusicProvider();
        setInitialized(success);
        if (!success) {
          setError("Failed to initialize music provider");
        }
      } catch (err) {
        setError("Error initializing music provider");
        console.error(err);
      }
    }

    init();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      console.log(`Searching for "${query}"...`);
      const searchResults = await searchSongs(query);
      console.log(
        `Search complete. Found ${searchResults.length} results:`,
        searchResults
      );

      setResults(searchResults);

      if (searchResults.length === 0) {
        setError("No results found");
      } else {
        // Group results by provider
        const youtubeResults = searchResults.filter(
          (r) => r.provider === "YouTube"
        );
        const spotifyResults = searchResults.filter(
          (r) => r.provider === "Spotify"
        );

        console.log(
          `Results by provider: YouTube (${youtubeResults.length}), Spotify (${spotifyResults.length})`
        );
      }
    } catch (err) {
      setError(`Search failed: ${err.message}`);
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle key press for search
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Check if a track is in favorites
  const isFavorite = (trackId) => {
    return playlists.favorites.includes(trackId);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-white">Search Music</h2>

      {!initialized && !error && (
        <div className="mb-4" style={{ color: "var(--accent-color)" }}>
          Initializing music provider...
        </div>
      )}

      {error && <div className="mb-4 text-red-500">{error}</div>}

      <div className="flex mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for songs..."
          className="flex-grow p-2 rounded-l text-white"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            borderColor: "var(--border-color)",
          }}
          disabled={!initialized || loading}
        />
        <button
          onClick={handleSearch}
          style={{ backgroundColor: "var(--accent-color)" }}
          className="text-white px-4 py-2 rounded-r flex items-center"
          disabled={!initialized || loading || !query.trim()}
        >
          {loading ? (
            "Searching..."
          ) : (
            <>
              <FaSearch className="mr-2" /> Search
            </>
          )}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold mb-2 text-white">Results:</h3>
          <div
            className="rounded divide-y"
            style={{ borderColor: "var(--border-color)" }}
          >
            {results.map((song) => (
              <div
                key={song.id}
                className="p-3 flex items-center"
                style={{
                  borderColor: "var(--border-color)",
                  ":hover": { backgroundColor: "var(--bg-hover)" },
                }}
              >
                <div className="flex-shrink-0 mr-3">
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="w-12 h-12 object-cover rounded"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/album-placeholder.svg";
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <div className="font-medium text-white">{song.title}</div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {song.artist} • {song.album}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Provider: {song.provider}
                  </div>
                </div>
                <div className="flex-shrink-0 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Pass the entire song object when toggling favorites
                      toggleFavorite(song.id, song);
                    }}
                    className="p-2 rounded-full"
                    style={{
                      color: isFavorite(song.id)
                        ? "#ff6b6b"
                        : "var(--text-muted)",
                    }}
                    title={
                      isFavorite(song.id)
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    {isFavorite(song.id) ? <FaHeart /> : <FaRegHeart />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToQueue(song);
                    }}
                    className="p-2 rounded-full"
                    style={{ color: "var(--text-muted)" }}
                    title="Add to queue"
                  >
                    <FaPlus />
                  </button>
                  <button
                    onClick={() => playTrack(song)}
                    className="p-2 rounded-full"
                    style={{ color: "var(--text-muted)" }}
                    title="Play now"
                  >
                    <FaPlay />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicSearch;
