import React, { useState, useEffect } from "react";
import { useMusic } from "../store/MusicContext";
import { useTheme } from "../store/ThemeContext";
import {
  ensureYtDlp,
  getVideoInfo,
  getFormats,
  downloadVideo,
  extractAudio,
  convertYouTubeToTrack,
} from "../utils/ytDlpService";
import {
  FaDownload,
  FaMusic,
  FaVideo,
  FaCheck,
  FaExclamationTriangle,
  FaSpinner,
  FaPlus,
} from "react-icons/fa";

/**
 * VideoDownloader component for downloading videos and extracting audio
 */
const VideoDownloader = () => {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);
  const [formats, setFormats] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState("");
  const [selectedAudioFormat, setSelectedAudioFormat] = useState("mp3");
  const [selectedAudioQuality, setSelectedAudioQuality] = useState("192");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadPath, setDownloadPath] = useState("");
  const [error, setError] = useState(null);
  const [ytDlpAvailable, setYtDlpAvailable] = useState(false);
  const [downloadType, setDownloadType] = useState("audio"); // 'audio' or 'video'

  const { addToQueue, playTrack } = useMusic();
  const { theme } = useTheme();

  // Check if yt-dlp is available
  useEffect(() => {
    const checkYtDlp = async () => {
      const result = await ensureYtDlp();
      setYtDlpAvailable(result.success);
      if (!result.success) {
        setError("yt-dlp is not available. Please check the installation.");
      }
    };

    checkYtDlp();
  }, []);

  // Handle URL input change
  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    // Reset state when URL changes
    setVideoInfo(null);
    setFormats([]);
    setSelectedFormat("");
    setError(null);
  };

  // Get video information
  const handleGetInfo = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get video info
      const infoResult = await getVideoInfo(url);
      if (!infoResult.success) {
        throw new Error(infoResult.error);
      }

      setVideoInfo(infoResult.info);

      // Get available formats
      const formatsResult = await getFormats(url);
      if (!formatsResult.success) {
        throw new Error(formatsResult.error);
      }

      setFormats(formatsResult.formats);

      // Set default format (best video+audio)
      setSelectedFormat("best");
    } catch (err) {
      setError(`Failed to get video info: ${err.message}`);
      console.error("Error getting video info:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle download button click
  const handleDownload = async () => {
    if (!videoInfo) return;

    setIsDownloading(true);
    setDownloadProgress(0);
    setError(null);

    try {
      // Get download directory
      const outputDir = await getDownloadDirectory();
      if (!outputDir) {
        setIsDownloading(false);
        return;
      }

      let result;

      if (downloadType === "video") {
        // Download video
        result = await downloadVideo(url, outputDir, selectedFormat);
      } else {
        // Extract audio
        result = await extractAudio(
          url,
          outputDir,
          selectedAudioFormat,
          selectedAudioQuality
        );
      }

      if (!result.success) {
        throw new Error(result.error);
      }

      setDownloadPath(result.filePath);

      // If audio was extracted, add it to the library
      if (downloadType === "audio" && result.filePath) {
        // Create a track object from the video info
        const track = await convertYouTubeToTrack(videoInfo.id, videoInfo);

        // Add local file information
        track.filePath = result.filePath;
        track.previewUrl = result.filePath;

        // Add to queue
        addToQueue(track);
      }
    } catch (err) {
      setError(`Download failed: ${err.message}`);
      console.error("Download error:", err);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(100);
    }
  };

  // Get download directory from user
  const getDownloadDirectory = async () => {
    if (!window.electron?.fs) {
      return "/downloads"; // Default for web
    }

    try {
      const result = await window.electron.fs.openDialog({
        properties: ["openDirectory"],
        title: "Select Download Location",
      });

      if (result.canceled || !result.files || result.files.length === 0) {
        return null;
      }

      return result.files[0].path;
    } catch (err) {
      console.error("Error selecting directory:", err);
      setError(`Failed to select directory: ${err.message}`);
      return null;
    }
  };

  // Handle play button click
  const handlePlay = async () => {
    if (!videoInfo) return;

    try {
      // Create a track object from the video info
      const track = await convertYouTubeToTrack(videoInfo.id, videoInfo);

      // Play the track
      playTrack(track);
    } catch (err) {
      setError(`Failed to play: ${err.message}`);
      console.error("Error playing track:", err);
    }
  };

  // Handle add to queue button click
  const handleAddToQueue = async () => {
    if (!videoInfo) return;

    try {
      // Create a track object from the video info
      const track = await convertYouTubeToTrack(videoInfo.id, videoInfo);

      // Add to queue
      addToQueue(track);
    } catch (err) {
      setError(`Failed to add to queue: ${err.message}`);
      console.error("Error adding to queue:", err);
    }
  };

  // Audio format options
  const audioFormats = [
    { value: "mp3", label: "MP3" },
    { value: "m4a", label: "M4A" },
    { value: "opus", label: "Opus" },
    { value: "wav", label: "WAV" },
    { value: "flac", label: "FLAC" },
  ];

  // Audio quality options
  const audioQualities = [
    { value: "128", label: "128 kbps" },
    { value: "192", label: "192 kbps" },
    { value: "256", label: "256 kbps" },
    { value: "320", label: "320 kbps" },
    { value: "0", label: "Best" },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-white">
        Download Video/Audio
      </h2>

      {!ytDlpAvailable && (
        <div
          className="mb-4 p-3 rounded"
          style={{ backgroundColor: "var(--bg-tertiary)" }}
        >
          <div className="flex items-center text-yellow-500 mb-2">
            <FaExclamationTriangle className="mr-2" />
            <span className="font-bold">yt-dlp not available</span>
          </div>
          <p className="text-white">
            The yt-dlp tool is being downloaded. Please wait a moment and try
            again.
          </p>
        </div>
      )}

      <div className="mb-4">
        <div className="flex mb-2">
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="Enter YouTube URL"
            className="flex-grow p-2 rounded-l text-white"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              borderColor: "var(--border-color)",
            }}
            disabled={isLoading || isDownloading}
          />
          <button
            onClick={handleGetInfo}
            style={{ backgroundColor: "var(--accent-color)" }}
            className="text-white px-4 py-2 rounded-r flex items-center"
            disabled={
              !url.trim() || isLoading || isDownloading || !ytDlpAvailable
            }
          >
            {isLoading ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaCheck className="mr-2" />
            )}
            Get Info
          </button>
        </div>

        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>

      {videoInfo && (
        <div
          className="mb-6 p-4 rounded"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <div className="flex mb-4">
            <div className="flex-shrink-0 mr-4">
              <img
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                className="w-32 h-auto rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/album-placeholder.svg";
                }}
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {videoInfo.title}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {videoInfo.uploader || videoInfo.channel}
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Duration: {formatDuration(videoInfo.duration)}
              </p>

              <div className="mt-3 flex space-x-2">
                <button
                  onClick={handlePlay}
                  className="px-3 py-1 rounded text-sm flex items-center"
                  style={{ backgroundColor: "var(--accent-color)" }}
                >
                  <FaPlay className="mr-1" /> Play
                </button>
                <button
                  onClick={handleAddToQueue}
                  className="px-3 py-1 rounded text-sm flex items-center"
                  style={{ backgroundColor: "var(--bg-tertiary)" }}
                >
                  <FaPlus className="mr-1" /> Add to Queue
                </button>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex mb-2">
              <button
                onClick={() => setDownloadType("audio")}
                className={`px-4 py-2 rounded-l flex items-center ${
                  downloadType === "audio" ? "text-white" : ""
                }`}
                style={{
                  backgroundColor:
                    downloadType === "audio"
                      ? "var(--accent-color)"
                      : "var(--bg-tertiary)",
                }}
              >
                <FaMusic className="mr-2" /> Audio
              </button>
              <button
                onClick={() => setDownloadType("video")}
                className={`px-4 py-2 rounded-r flex items-center ${
                  downloadType === "video" ? "text-white" : ""
                }`}
                style={{
                  backgroundColor:
                    downloadType === "video"
                      ? "var(--accent-color)"
                      : "var(--bg-tertiary)",
                }}
              >
                <FaVideo className="mr-2" /> Video
              </button>
            </div>
          </div>

          {downloadType === "audio" ? (
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">
                  Audio Format
                </label>
                <select
                  value={selectedAudioFormat}
                  onChange={(e) => setSelectedAudioFormat(e.target.value)}
                  className="w-full p-2 rounded text-white"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    borderColor: "var(--border-color)",
                  }}
                  disabled={isDownloading}
                >
                  {audioFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">
                  Audio Quality
                </label>
                <select
                  value={selectedAudioQuality}
                  onChange={(e) => setSelectedAudioQuality(e.target.value)}
                  className="w-full p-2 rounded text-white"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    borderColor: "var(--border-color)",
                  }}
                  disabled={isDownloading}
                >
                  {audioQualities.map((quality) => (
                    <option key={quality.value} value={quality.value}>
                      {quality.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-white">
                Video Format
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full p-2 rounded text-white"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-color)",
                }}
                disabled={isDownloading}
              >
                <option value="best">Best Quality</option>
                {formats.map((format) => (
                  <option key={format.formatCode} value={format.formatCode}>
                    {format.formatCode}: {format.description} (
                    {format.extension})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleDownload}
            className="w-full py-2 rounded flex items-center justify-center"
            style={{ backgroundColor: "var(--accent-color)" }}
            disabled={isDownloading || !ytDlpAvailable}
          >
            {isDownloading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Downloading...
              </>
            ) : (
              <>
                <FaDownload className="mr-2" />
                Download {downloadType === "audio" ? "Audio" : "Video"}
              </>
            )}
          </button>

          {isDownloading && (
            <div className="mt-2">
              <div className="h-2 bg-gray-700 rounded overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${downloadProgress}%`,
                    backgroundColor: "var(--accent-color)",
                  }}
                ></div>
              </div>
            </div>
          )}

          {downloadPath && (
            <div
              className="mt-4 p-3 rounded"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              <div className="flex items-center text-green-500 mb-1">
                <FaCheck className="mr-2" />
                <span className="font-bold">Download Complete</span>
              </div>
              <p className="text-sm text-white break-all">{downloadPath}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to format duration in seconds to MM:SS
const formatDuration = (seconds) => {
  if (!seconds) return "00:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export default VideoDownloader;
