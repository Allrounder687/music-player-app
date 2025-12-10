/**
 * Duplicate Detection Service for finding and managing duplicate tracks
 */
export class DuplicateDetectionService {
  static findDuplicates(tracks) {
    const duplicateGroups = [];
    const processed = new Set();
    
    for (let i = 0; i < tracks.length; i++) {
      if (processed.has(i)) continue;
      
      const track = tracks[i];
      const duplicates = [track];
      processed.add(i);
      
      // Find potential duplicates
      for (let j = i + 1; j < tracks.length; j++) {
        if (processed.has(j)) continue;
        
        const otherTrack = tracks[j];
        
        if (this.areDuplicates(track, otherTrack)) {
          duplicates.push(otherTrack);
          processed.add(j);
        }
      }
      
      // Only add groups with actual duplicates
      if (duplicates.length > 1) {
        duplicateGroups.push({
          id: `duplicate_group_${Date.now()}_${i}`,
          tracks: duplicates,
          confidence: this.calculateConfidence(duplicates),
          reason: this.getDuplicateReason(duplicates[0], duplicates[1])
        });
      }
    }
    
    return duplicateGroups;
  }
  
  static areDuplicates(track1, track2) {
    // Exact match criteria
    if (this.isExactMatch(track1, track2)) {
      return true;
    }
    
    // Similar match criteria
    if (this.isSimilarMatch(track1, track2)) {
      return true;
    }
    
    return false;
  }
  
  static isExactMatch(track1, track2) {
    // Same file size and duration (for different file formats of same song)
    if (track1.file && track2.file && 
        track1.file.size === track2.file.size &&
        Math.abs((track1.duration || 0) - (track2.duration || 0)) < 2) {
      return true;
    }
    
    // Same title, artist, and similar duration
    if (this.normalizeString(track1.title) === this.normalizeString(track2.title) &&
        this.normalizeString(track1.artist) === this.normalizeString(track2.artist) &&
        Math.abs((track1.duration || 0) - (track2.duration || 0)) < 5) {
      return true;
    }
    
    return false;
  }
  
  static isSimilarMatch(track1, track2) {
    const titleSimilarity = this.calculateStringSimilarity(
      this.normalizeString(track1.title),
      this.normalizeString(track2.title)
    );
    
    const artistSimilarity = this.calculateStringSimilarity(
      this.normalizeString(track1.artist),
      this.normalizeString(track2.artist)
    );
    
    const durationDiff = Math.abs((track1.duration || 0) - (track2.duration || 0));
    
    // High similarity threshold
    if (titleSimilarity > 0.9 && artistSimilarity > 0.8 && durationDiff < 10) {
      return true;
    }
    
    // Very high title similarity with same artist
    if (titleSimilarity > 0.95 && artistSimilarity === 1.0) {
      return true;
    }
    
    return false;
  }
  
  static normalizeString(str) {
    if (!str) return '';
    
    return str
      .toLowerCase()
      .trim()
      // Remove common prefixes/suffixes
      .replace(/^(the|a|an)\s+/i, '')
      .replace(/\s+(feat\.|featuring|ft\.|with).*$/i, '')
      .replace(/\s+\(.*\)$/, '') // Remove parenthetical content
      .replace(/\s+\[.*\]$/, '') // Remove bracketed content
      // Remove special characters and extra spaces
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  static similarityCache = new Map();
  static MAX_CACHE_SIZE = 1000;

  static calculateStringSimilarity(str1, str2) {
    if (str1 === str2) return 1.0;
    if (!str1 || !str2) return 0.0;
    
    // Create normalized cache key (order-independent)
    const cacheKey = str1 < str2 ? `${str1}|${str2}` : `${str2}|${str1}`;
    if (this.similarityCache.has(cacheKey)) {
      return this.similarityCache.get(cacheKey);
    }
    
    // Early exit optimizations
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);
    const minLen = Math.min(len1, len2);
    
    if (maxLen === 0) return 1.0;
    
    // More aggressive early exit for very different lengths
    const lengthRatio = minLen / maxLen;
    if (lengthRatio < 0.3) {
      this.similarityCache.set(cacheKey, 0.0);
      return 0.0;
    }
    
    // Use Levenshtein distance for similarity calculation
    const matrix = [];
    
    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    const similarity = (maxLen - matrix[len1][len2]) / maxLen;
    this.similarityCache.set(cacheKey, similarity);
    
    // Implement LRU cache behavior
    if (this.similarityCache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entries (first 10% of cache)
      const keysToDelete = Array.from(this.similarityCache.keys()).slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.1));
      keysToDelete.forEach(key => this.similarityCache.delete(key));
    }
    
    return similarity;
  }
  
  static calculateConfidence(duplicates) {
    if (duplicates.length < 2) return 0;
    
    let totalConfidence = 0;
    let comparisons = 0;
    
    for (let i = 0; i < duplicates.length - 1; i++) {
      for (let j = i + 1; j < duplicates.length; j++) {
        const track1 = duplicates[i];
        const track2 = duplicates[j];
        
        let confidence = 0;
        
        // Title similarity
        const titleSim = this.calculateStringSimilarity(
          this.normalizeString(track1.title),
          this.normalizeString(track2.title)
        );
        confidence += titleSim * 0.4;
        
        // Artist similarity
        const artistSim = this.calculateStringSimilarity(
          this.normalizeString(track1.artist),
          this.normalizeString(track2.artist)
        );
        confidence += artistSim * 0.3;
        
        // Duration similarity
        const durationDiff = Math.abs((track1.duration || 0) - (track2.duration || 0));
        const durationSim = Math.max(0, 1 - (durationDiff / 300)); // 5 minutes max difference
        confidence += durationSim * 0.2;
        
        // File size similarity (if available)
        if (track1.file && track2.file) {
          const sizeDiff = Math.abs(track1.file.size - track2.file.size);
          const sizeSim = Math.max(0, 1 - (sizeDiff / Math.max(track1.file.size, track2.file.size)));
          confidence += sizeSim * 0.1;
        }
        
        totalConfidence += confidence;
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalConfidence / comparisons : 0;
  }
  
  static getDuplicateReason(track1, track2) {
    if (track1.file && track2.file && track1.file.size === track2.file.size) {
      return 'Identical file size and duration';
    }
    
    if (this.normalizeString(track1.title) === this.normalizeString(track2.title) &&
        this.normalizeString(track1.artist) === this.normalizeString(track2.artist)) {
      return 'Same title and artist';
    }
    
    const titleSim = this.calculateStringSimilarity(
      this.normalizeString(track1.title),
      this.normalizeString(track2.title)
    );
    
    if (titleSim > 0.9) {
      return 'Very similar titles and artists';
    }
    
    return 'Similar metadata';
  }
  
  static getBestQualityTrack(duplicates) {
    if (duplicates.length === 0) return null;
    if (duplicates.length === 1) return duplicates[0];
    
    // Score tracks based on quality indicators
    const scoredTracks = duplicates.map(track => ({
      track,
      score: this.calculateQualityScore(track)
    }));
    
    // Sort by score (highest first)
    scoredTracks.sort((a, b) => b.score - a.score);
    
    return scoredTracks[0].track;
  }
  
  static calculateQualityScore(track) {
    let score = 0;
    
    // File size (larger usually means better quality)
    if (track.file) {
      score += Math.min(track.file.size / (10 * 1024 * 1024), 10); // Max 10 points for 10MB+
    }
    
    // Bitrate (if available)
    if (track.bitrate) {
      score += Math.min(track.bitrate / 32, 10); // Max 10 points for 320kbps+
    }
    
    // Sample rate (if available)
    if (track.sampleRate) {
      score += Math.min(track.sampleRate / 4410, 10); // Max 10 points for 44.1kHz+
    }
    
    // Prefer tracks with complete metadata
    if (track.title && track.title !== 'Unknown Title') score += 2;
    if (track.artist && track.artist !== 'Unknown Artist') score += 2;
    if (track.album && track.album !== 'Unknown Album') score += 1;
    if (track.year) score += 1;
    if (track.genre) score += 1;
    
    // Prefer tracks with album art
    if (track.imageUrl && !track.imageUrl.includes('placeholder')) score += 2;
    
    return score;
  }
  
  static getRecommendedActions(duplicateGroup) {
    const bestTrack = this.getBestQualityTrack(duplicateGroup.tracks);
    const tracksToRemove = duplicateGroup.tracks.filter(track => track.id !== bestTrack.id);
    
    return {
      keep: bestTrack,
      remove: tracksToRemove,
      confidence: duplicateGroup.confidence,
      reason: `Keep highest quality version (${this.getTrackQualityDescription(bestTrack)})`
    };
  }
  
  static getTrackQualityDescription(track) {
    const parts = [];
    
    if (track.bitrate) {
      parts.push(`${track.bitrate}kbps`);
    }
    
    if (track.file) {
      const sizeMB = (track.file.size / (1024 * 1024)).toFixed(1);
      parts.push(`${sizeMB}MB`);
    }
    
    if (track.sampleRate) {
      parts.push(`${(track.sampleRate / 1000).toFixed(1)}kHz`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'Standard quality';
  }
}

export default DuplicateDetectionService;