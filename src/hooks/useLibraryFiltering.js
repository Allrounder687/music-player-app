import { useState, useEffect, useMemo } from 'react';
import { SORT_ORDERS } from '../constants/libraryConstants';

export const useLibraryFiltering = (tracks, playlists) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState(SORT_ORDERS.ASC);

  const filteredTracks = useMemo(() => {
    let filtered = [...tracks];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(track =>
        track.title?.toLowerCase().includes(query) ||
        track.artist?.toLowerCase().includes(query) ||
        track.album?.toLowerCase().includes(query) ||
        (track.genre && track.genre.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      switch (filterBy) {
        case 'favorites':
          filtered = filtered.filter(track => 
            playlists.favorites?.includes(track.id)
          );
          break;
        case 'recent':
          filtered = filtered.filter(track => 
            playlists.recentlyPlayed?.includes(track.id)
          );
          break;
        case 'imported':
          filtered = filtered.filter(track => 
            track.id?.startsWith('imported-')
          );
          break;
        default:
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortOrder === SORT_ORDERS.ASC ? comparison : -comparison;
    });

    return filtered;
  }, [tracks, searchQuery, filterBy, sortBy, sortOrder, playlists]);

  return {
    searchQuery,
    setSearchQuery,
    filterBy,
    setFilterBy,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredTracks
  };
};