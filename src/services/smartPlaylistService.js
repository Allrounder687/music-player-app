/**
 * Smart Playlist Service for creating dynamic playlists based on various criteria
 */
export class SmartPlaylistService {
  static createSmartPlaylist(tracks, criteria) {
    switch (criteria.type) {
      case 'mostPlayed':
        return this.getMostPlayedTracks(tracks, criteria.limit || 50);
      case 'recentlyAdded':
        return this.getRecentlyAddedTracks(tracks, criteria.days || 7, criteria.limit || 50);
      case 'genre':
        return this.getTracksByGenre(tracks, criteria.genre, criteria.limit || 50);
      case 'decade':
        return this.getTracksByDecade(tracks, criteria.decade, criteria.limit || 50);
      case 'duration':
        return this.getTracksByDuration(tracks, criteria.minDuration, criteria.maxDuration, criteria.limit || 50);
      case 'artist':
        return this.getTracksByArtist(tracks, criteria.artist, criteria.limit || 50);
      case 'album':
        return this.getTracksByAlbum(tracks, criteria.album, criteria.limit || 50);
      case 'favorites':
        return this.getFavoriteTracks(tracks, criteria.favorites || []);
      case 'random':
        return this.getRandomTracks(tracks, criteria.limit || 25);
      case 'highRated':
        return this.getHighRatedTracks(tracks, criteria.minRating || 4, criteria.limit || 50);
      default:
        return [];
    }
  }

  static getMostPlayedTracks(tracks, limit = 50) {
    return tracks
      .filter(track => track.playCount > 0)
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      .slice(0, limit);
  }

  static getRecentlyAddedTracks(tracks, days = 7, limit = 50) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return tracks
      .filter(track => {
        const addedDate = track.dateAdded ? new Date(track.dateAdded) : new Date(0);
        return addedDate >= cutoffDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.dateAdded || 0);
        const dateB = new Date(b.dateAdded || 0);
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  static getTracksByGenre(tracks, genre, limit = 50) {
    return tracks
      .filter(track => 
        track.genre && 
        track.genre.toLowerCase().includes(genre.toLowerCase())
      )
      .slice(0, limit);
  }

  static getTracksByDecade(tracks, decade, limit = 50) {
    const startYear = decade;
    const endYear = decade + 9;
    
    return tracks
      .filter(track => 
        track.year && 
        track.year >= startYear && 
        track.year <= endYear
      )
      .sort((a, b) => (b.year || 0) - (a.year || 0))
      .slice(0, limit);
  }

  static getTracksByDuration(tracks, minDuration = 0, maxDuration = Infinity, limit = 50) {
    return tracks
      .filter(track => 
        track.duration >= minDuration && 
        track.duration <= maxDuration
      )
      .slice(0, limit);
  }

  static getTracksByArtist(tracks, artist, limit = 50) {
    return tracks
      .filter(track => 
        track.artist && 
        track.artist.toLowerCase().includes(artist.toLowerCase())
      )
      .slice(0, limit);
  }

  static getTracksByAlbum(tracks, album, limit = 50) {
    return tracks
      .filter(track => 
        track.album && 
        track.album.toLowerCase().includes(album.toLowerCase())
      )
      .slice(0, limit);
  }

  static getFavoriteTracks(tracks, favoriteIds) {
    return tracks.filter(track => favoriteIds.includes(track.id));
  }

  static getRandomTracks(tracks, limit = 25) {
    const shuffled = [...tracks].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  static getHighRatedTracks(tracks, minRating = 4, limit = 50) {
    return tracks
      .filter(track => (track.rating || 0) >= minRating)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }

  static getAvailableGenres(tracks) {
    const genres = new Set();
    tracks.forEach(track => {
      if (track.genre) {
        // Handle multiple genres separated by commas or semicolons
        const trackGenres = track.genre.split(/[,;]/).map(g => g.trim());
        trackGenres.forEach(genre => {
          if (genre) genres.add(genre);
        });
      }
    });
    return Array.from(genres).sort();
  }

  static getAvailableArtists(tracks) {
    const artists = new Set();
    tracks.forEach(track => {
      if (track.artist) {
        artists.add(track.artist);
      }
    });
    return Array.from(artists).sort();
  }

  static getAvailableAlbums(tracks) {
    const albums = new Set();
    tracks.forEach(track => {
      if (track.album) {
        albums.add(track.album);
      }
    });
    return Array.from(albums).sort();
  }

  static getAvailableDecades(tracks) {
    const decades = new Set();
    tracks.forEach(track => {
      if (track.year) {
        const decade = Math.floor(track.year / 10) * 10;
        decades.add(decade);
      }
    });
    return Array.from(decades).sort((a, b) => b - a);
  }

  static getSmartPlaylistSuggestions(tracks) {
    const suggestions = [];
    
    // Most played (if we have play counts)
    const playedTracks = tracks.filter(track => (track.playCount || 0) > 0);
    if (playedTracks.length > 0) {
      suggestions.push({
        id: 'most-played',
        name: 'Most Played',
        description: `Your ${Math.min(50, playedTracks.length)} most played songs`,
        criteria: { type: 'mostPlayed', limit: 50 },
        icon: '🔥'
      });
    }

    // Recently added
    const recentTracks = this.getRecentlyAddedTracks(tracks, 7);
    if (recentTracks.length > 0) {
      suggestions.push({
        id: 'recently-added',
        name: 'Recently Added',
        description: `Songs added in the last 7 days (${recentTracks.length} tracks)`,
        criteria: { type: 'recentlyAdded', days: 7, limit: 50 },
        icon: '🆕'
      });
    }

    // Genre-based playlists
    const genres = this.getAvailableGenres(tracks);
    genres.slice(0, 5).forEach(genre => {
      const genreTracks = this.getTracksByGenre(tracks, genre);
      if (genreTracks.length >= 5) {
        suggestions.push({
          id: `genre-${genre.toLowerCase().replace(/\s+/g, '-')}`,
          name: `${genre} Mix`,
          description: `${genreTracks.length} ${genre} tracks`,
          criteria: { type: 'genre', genre, limit: 50 },
          icon: '🎵'
        });
      }
    });

    // Decade-based playlists
    const decades = this.getAvailableDecades(tracks);
    decades.slice(0, 3).forEach(decade => {
      const decadeTracks = this.getTracksByDecade(tracks, decade);
      if (decadeTracks.length >= 5) {
        suggestions.push({
          id: `decade-${decade}s`,
          name: `${decade}s Hits`,
          description: `${decadeTracks.length} songs from the ${decade}s`,
          criteria: { type: 'decade', decade, limit: 50 },
          icon: '📻'
        });
      }
    });

    // Random discovery
    if (tracks.length >= 10) {
      suggestions.push({
        id: 'discovery-mix',
        name: 'Discovery Mix',
        description: '25 random songs from your library',
        criteria: { type: 'random', limit: 25 },
        icon: '🎲'
      });
    }

    // Short songs (under 3 minutes)
    const shortTracks = this.getTracksByDuration(tracks, 0, 180);
    if (shortTracks.length >= 10) {
      suggestions.push({
        id: 'quick-hits',
        name: 'Quick Hits',
        description: `${shortTracks.length} songs under 3 minutes`,
        criteria: { type: 'duration', minDuration: 0, maxDuration: 180, limit: 50 },
        icon: '⚡'
      });
    }

    // Long songs (over 5 minutes)
    const longTracks = this.getTracksByDuration(tracks, 300, Infinity);
    if (longTracks.length >= 10) {
      suggestions.push({
        id: 'epic-tracks',
        name: 'Epic Tracks',
        description: `${longTracks.length} songs over 5 minutes`,
        criteria: { type: 'duration', minDuration: 300, maxDuration: Infinity, limit: 50 },
        icon: '🎭'
      });
    }

    return suggestions;
  }
}

export default SmartPlaylistService;