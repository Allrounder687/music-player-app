import { ErrorHandler } from '../utils/errorHandler.js';

/**
 * Lyrics service for fetching song lyrics from various sources
 * Implements caching and fallback strategies for reliable lyrics retrieval
 * 
 * @class LyricsService
 * @example
 * const lyrics = await LyricsService.fetchLyrics('Artist Name', 'Song Title');
 */
export class LyricsService {
  /** @type {Map<string, {lyrics: string|null, timestamp: number}>} Cache for lyrics with timestamps */
  static cache = new Map();

  /** @type {number} Maximum cache size to prevent memory issues */
  static MAX_CACHE_SIZE = 500;

  /** @type {number} Cache expiry time in milliseconds (24 hours) */
  static CACHE_EXPIRY = 24 * 60 * 60 * 1000;

  /** @type {Set<string>} Track ongoing requests to prevent duplicates */
  static pendingRequests = new Set();

  /**
   * Fetches lyrics for a given artist and song title
   * @param {string} artist - The artist name
   * @param {string} title - The song title
   * @returns {Promise<string|null>} The lyrics text or null if not found
   */
  static async fetchLyrics(artist, title) {
    if (!artist || !title) {
      ErrorHandler.logError(new Error('Artist and title are required'), 'LyricsService.fetchLyrics');
      return null;
    }

    const cacheKey = `${artist.trim()}-${title.trim()}`.toLowerCase();

    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      // Wait for the pending request to complete
      return new Promise((resolve) => {
        const checkCache = () => {
          if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            resolve(this.isCacheValid(cached) ? cached.lyrics : null);
          } else if (!this.pendingRequests.has(cacheKey)) {
            resolve(null);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (this.isCacheValid(cached)) {
        this.cacheHits++;
        return cached.lyrics;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    // Track cache miss
    this.cacheMisses++;

    // Mark request as pending
    this.pendingRequests.add(cacheKey);

    try {
      // Implement cache size limit with LRU eviction
      this.evictOldEntries();

      // Try multiple sources in order of preference with timeout
      const sources = [
        () => this.fetchFromLyricsOvh(artist, title),
        () => this.fetchFromMusixmatch(artist, title),
        () => this.fetchFromGenius(artist, title),
      ];

      let lyrics = null;
      for (const source of sources) {
        try {
          lyrics = await this.withTimeout(source(), 10000); // 10 second timeout
          if (lyrics) break;
        } catch (error) {
          ErrorHandler.logError(error, `LyricsService source failure`);
          continue;
        }
      }

      // Cache the result with timestamp
      const cacheEntry = {
        lyrics,
        timestamp: Date.now(),
      };
      this.cache.set(cacheKey, cacheEntry);

      return lyrics;
    } catch (error) {
      ErrorHandler.logError(error, 'LyricsService.fetchLyrics');
      return null;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Check if cache entry is still valid
   * @private
   */
  static isCacheValid(cacheEntry) {
    return cacheEntry && (Date.now() - cacheEntry.timestamp) < this.CACHE_EXPIRY;
  }

  /**
   * Evict old cache entries using LRU strategy
   * @private
   */
  static evictOldEntries() {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      // Sort by timestamp and remove oldest entries
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.2));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Add timeout to promises
   * @private
   */
  static withTimeout(promise, timeoutMs) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      ),
    ]);
  }

  static async fetchFromLyricsOvh(artist, title) {
    try {
      const response = await fetch(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.lyrics || null;
    } catch (error) {
      console.error('Error fetching from lyrics.ovh:', error);
      return null;
    }
  }

  /**
   * Placeholder for Musixmatch integration
   * @private
   * @param {string} _artist - Artist name (unused)
   * @param {string} _title - Song title (unused)
   * @returns {Promise<string|null>} Lyrics or null
   */
  static async fetchFromMusixmatch(_artist, _title) {
    // TODO: Implement Musixmatch API integration
    // Requires API key and backend proxy for CORS
    console.debug('Musixmatch integration not implemented');
    return null;
  }

  /**
   * Placeholder for Genius integration
   * @private
   * @param {string} _artist - Artist name (unused)
   * @param {string} _title - Song title (unused)
   * @returns {Promise<string|null>} Lyrics or null
   */
  static async fetchFromGenius(_artist, _title) {
    // TODO: Implement Genius API integration
    // Requires API key and backend proxy for CORS
    console.debug('Genius integration not implemented');
    return null;
  }

  static formatLyrics(lyrics) {
    if (!lyrics) return null;

    // Clean up and format lyrics
    return lyrics
      .trim()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }

  /**
   * Clear all cached lyrics
   */
  static clearCache() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  static getCacheStats() {
    const entries = Array.from(this.cache.values());
    const validEntries = entries.filter(entry => this.isCacheValid(entry));

    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries: entries.length - validEntries.length,
      pendingRequests: this.pendingRequests.size,
      cacheHitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0,
    };
  }

  // Add cache hit/miss tracking
  static cacheHits = 0;
  static cacheMisses = 0;
}

export default LyricsService;