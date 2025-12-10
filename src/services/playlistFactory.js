/**
 * Factory for creating different types of smart playlists
 */
export class PlaylistFactory {
  static strategies = new Map();

  static registerStrategy(type, strategy) {
    this.strategies.set(type, strategy);
  }

  static createPlaylist(type, tracks, criteria) {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`Unknown playlist type: ${type}`);
    }
    return strategy.create(tracks, criteria);
  }
}

// Register default strategies
PlaylistFactory.registerStrategy('genre', {
  create: (tracks, criteria) => tracks.filter(track => 
    track.genre && track.genre.toLowerCase().includes(criteria.genre.toLowerCase())
  ).slice(0, criteria.limit || 50)
});

PlaylistFactory.registerStrategy('decade', {
  create: (tracks, criteria) => {
    const startYear = criteria.decade;
    const endYear = criteria.decade + 9;
    return tracks.filter(track => 
      track.year && track.year >= startYear && track.year <= endYear
    ).slice(0, criteria.limit || 50);
  }
});

PlaylistFactory.registerStrategy('random', {
  create: (tracks, criteria) => {
    const shuffled = [...tracks].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, criteria.limit || 25);
  }
});