import React, { useState, useEffect } from "react";
import { useTheme } from "../store/ThemeContext";
import { useMusic } from "../store/MusicContext";
import { GlassPanel } from "./GlassCard";
import { LyricsService } from "../services/lyricsService";

export const LyricsPanel = ({ isVisible, onClose }) => {
  const { theme } = useTheme();
  const { currentTrack } = useMusic();
  const [lyrics, setLyrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentTrack || !isVisible) {
      setLyrics(null);
      setError(null);
      return;
    }

    const fetchLyrics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const fetchedLyrics = await LyricsService.fetchLyrics(
          currentTrack.artist,
          currentTrack.title
        );
        
        if (fetchedLyrics) {
          setLyrics(LyricsService.formatLyrics(fetchedLyrics));
        } else {
          setError("Lyrics not found for this song");
        }
      } catch (err) {
        console.error("Error fetching lyrics:", err);
        setError("Failed to fetch lyrics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLyrics();
  }, [currentTrack, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassPanel className="w-full max-w-2xl max-h-[80vh] overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-xl font-bold text-${theme.colors.text.primary}`}>
              Lyrics
            </h2>
            {currentTrack && (
              <p className={`text-sm text-${theme.colors.text.secondary}`}>
                {currentTrack.title} - {currentTrack.artist}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg transition-all duration-200
              hover:bg-${theme.colors.background.hover}
              text-${theme.colors.text.secondary}
              hover:text-${theme.colors.text.primary}
            `}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className={`ml-3 text-${theme.colors.text.secondary}`}>
                Fetching lyrics...
              </span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className={`text-${theme.colors.text.muted} mb-4`}>
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className={`text-${theme.colors.text.secondary}`}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className={`
                  mt-4 px-4 py-2 rounded-lg transition-all duration-200
                  bg-${theme.colors.primary.main}
                  hover:bg-${theme.colors.primary.dark}
                  text-white font-medium
                `}
              >
                Try Again
              </button>
            </div>
          )}

          {lyrics && (
            <div className="space-y-4">
              <div 
                className={`
                  text-${theme.colors.text.primary} 
                  leading-relaxed 
                  whitespace-pre-line
                  font-medium
                  text-center
                `}
                style={{ lineHeight: '1.8' }}
              >
                {lyrics}
              </div>
            </div>
          )}

          {!isLoading && !error && !lyrics && currentTrack && (
            <div className="text-center py-12">
              <div className={`text-${theme.colors.text.muted} mb-4`}>
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 3a1 1 0 012 0v5.5a.5.5 0 001 0V4a1 1 0 112 0v4.5a.5.5 0 001 0V6a1 1 0 112 0v6a7 7 0 11-14 0V9a1 1 0 012 0v2.5a.5.5 0 001 0V4a1 1 0 012 0v4.5a.5.5 0 001 0V3z" clipRule="evenodd" />
                </svg>
              </div>
              <p className={`text-${theme.colors.text.secondary}`}>
                No lyrics available for this song
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <p className={`text-xs text-${theme.colors.text.muted}`}>
            Lyrics provided by various online sources
          </p>
        </div>
      </GlassPanel>
    </div>
  );
};

export default LyricsPanel;