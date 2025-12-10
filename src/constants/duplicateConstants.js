/**
 * Constants for duplicate detection and management
 */

// Similarity thresholds
export const SIMILARITY_THRESHOLDS = {
  TITLE_HIGH: 0.9,
  TITLE_VERY_HIGH: 0.95,
  ARTIST_HIGH: 0.8,
  EXACT_MATCH: 1.0
};

// Duration tolerances (in seconds)
export const DURATION_TOLERANCE = {
  EXACT_MATCH: 2,
  SIMILAR_MATCH: 5,
  LOOSE_MATCH: 10
};

// Quality scoring weights
export const QUALITY_WEIGHTS = {
  FILE_SIZE: 10, // Max points for file size
  BITRATE: 10,   // Max points for bitrate
  SAMPLE_RATE: 10, // Max points for sample rate
  METADATA: {
    TITLE: 2,
    ARTIST: 2,
    ALBUM: 1,
    YEAR: 1,
    GENRE: 1,
    ALBUM_ART: 2
  }
};

// File size limits
export const FILE_SIZE_LIMITS = {
  QUALITY_REFERENCE: 10 * 1024 * 1024, // 10MB
  IMPORT_MAX: 100 * 1024 * 1024 // 100MB
};

// Confidence calculation weights
export const CONFIDENCE_WEIGHTS = {
  TITLE_SIMILARITY: 0.4,
  ARTIST_SIMILARITY: 0.3,
  DURATION_SIMILARITY: 0.2,
  FILE_SIZE_SIMILARITY: 0.1
};