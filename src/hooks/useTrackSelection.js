import { useState, useCallback } from 'react';

export const useTrackSelection = () => {
  const [selectedTracks, setSelectedTracks] = useState(new Set());

  const handleSelectTrack = useCallback((trackId) => {
    setSelectedTracks(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(trackId)) {
        newSelected.delete(trackId);
      } else {
        newSelected.add(trackId);
      }
      return newSelected;
    });
  }, []);

  const handleSelectAll = useCallback((tracks) => {
    setSelectedTracks(prev => {
      if (prev.size === tracks.length) {
        return new Set();
      } else {
        return new Set(tracks.map(track => track.id));
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTracks(new Set());
  }, []);

  return {
    selectedTracks,
    handleSelectTrack,
    handleSelectAll,
    clearSelection
  };
};