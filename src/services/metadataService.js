/**
 * Enhanced metadata service with multiple API fallbacks
 * Supports MusicBrainz, JioSaavn (for Hindi music), TheAudioDB, and more
 */
export class MetadataService {
  static lastRequestTime = 0;
  static requestQueue = [];
  static isProcessingQueue = false;
  static cache = new Map(); // Simple in-memory cache
  static failedUrls = new Set(); // Track failed image URLs

  // API endpoints and configurations
  static APIs = {
    MUSICBRAINZ: 'https://musicbrainz.org/ws/2',
    COVER_ART_ARCHIVE: 'https://coverartarchive.org',
    JIOSAAVN: 'https://saavn.dev/api', // For Hindi/Bollywood music
    AUDIODB: 'https://www.theaudiodb.com/api/v1/json/2',
    LYRICS_OVH: 'https://api.lyrics.ovh/v1'
  };

  static async extractMetadata(file) {
    try {
      const fileName = file.name.replace(/\.[^/.]+$/, "");

      // Enhanced filename parsing with multiple patterns
      let { title, artist, album } = this.parseFilename(fileName);

      return {
        title: title || file.name.replace(/\.[^/.]+$/, ""),
        artist: artist || "Unknown Artist",
        album: album || "Unknown Album",
        year: null,
        genre: null,
        duration: 0,
        bitrate: null,
        sampleRate: null,
        track: null,
        albumArtist: artist || "Unknown Artist",
        composer: null,
        comment: null,
        picture: null,
        language: this.detectLanguage(fileName, artist) // Detect if Hindi/Bollywood
      };
    } catch (error) {
      console.error('Error extracting metadata:', error);
      return this.getDefaultMetadata(file);
    }
  }

  static parseFilename(fileName) {
    let title = fileName;
    let artist = "Unknown Artist";
    let album = null;

    // Pattern 1: "Artist - Title"
    if (fileName.includes(' - ')) {
      const parts = fileName.split(' - ');
      if (parts.length >= 2) {
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }
    }
    // Pattern 2: "Artist_Title" or "Artist__Title"
    else if (fileName.includes('_')) {
      const parts = fileName.split(/_+/);
      if (parts.length >= 2) {
        artist = parts[0].trim();
        title = parts.slice(1).join(' ').trim();
      }
    }
    // Pattern 3: "Title (Artist)" or "Title - Artist"
    else if (fileName.includes('(') && fileName.includes(')')) {
      const match = fileName.match(/^(.+?)\s*\((.+?)\)\s*$/);
      if (match) {
        title = match[1].trim();
        artist = match[2].trim();
      }
    }
    // Pattern 4: Extract from path-like structure "Artist/Album/Title"
    else if (fileName.includes('/')) {
      const parts = fileName.split('/');
      if (parts.length >= 3) {
        artist = parts[parts.length - 3];
        album = parts[parts.length - 2];
        title = parts[parts.length - 1];
      } else if (parts.length === 2) {
        artist = parts[0];
        title = parts[1];
      }
    }

    // Clean up common artifacts
    title = this.cleanMetadataString(title);
    artist = this.cleanMetadataString(artist);
    album = album ? this.cleanMetadataString(album) : null;

    return { title, artist, album };
  }

  static cleanMetadataString(str) {
    if (!str) return str;

    return str
      .replace(/\.(mp3|flac|wav|aac|ogg|m4a)$/i, '') // Remove extensions
      .replace(/\[.*?\]/g, '') // Remove [tags]
      .replace(/\(feat\..*?\)/gi, '') // Remove (feat. Artist)
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  static detectLanguage(fileName, artist) {
    const hindiIndicators = [
      'hindi', 'bollywood', 'desi', 'punjabi', 'tamil', 'telugu',
      'rahman', 'kishore', 'lata', 'asha', 'rafi', 'udit', 'alka',
      'shreya', 'arijit', 'rahat', 'shankar', 'vishal', 'pritam'
    ];

    const searchText = `${fileName} ${artist}`.toLowerCase();
    return hindiIndicators.some(indicator => searchText.includes(indicator)) ? 'hindi' : 'english';
  }

  static async enrichMetadata(track) {
    try {
      // Check cache first
      const cacheKey = `${track.artist}:${track.title}`.toLowerCase();
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        return { ...track, ...cached };
      }

      // Use cascading fallback system
      const enrichedData = await this.rateLimitedFetch(track.artist, track.title, track.language);

      // Cache successful results
      if (enrichedData && Object.keys(enrichedData).length > 0) {
        this.cache.set(cacheKey, enrichedData);
      }

      return { ...track, ...enrichedData };
    } catch (error) {
      console.error('Error enriching metadata:', error);
      return track;
    }
  }

  static async rateLimitedFetch(artist, title, language = 'english') {
    return new Promise((resolve) => {
      this.requestQueue.push({ artist, title, language, resolve });
      this.processQueue();
    });
  }

  static async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const { artist, title, language, resolve } = this.requestQueue.shift();

      // Rate limiting: 1 second between requests
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      const waitTime = Math.max(0, 1000 - timeSinceLastRequest);

      if (waitTime > 0) {
        await new Promise(r => setTimeout(r, waitTime));
      }

      try {
        const result = await this.fetchWithCascadingFallbacks(artist, title, language);
        resolve(result);
      } catch (error) {
        console.error('Error in cascading fetch:', error);
        resolve({});
      }

      this.lastRequestTime = Date.now();
    }

    this.isProcessingQueue = false;
  }

  static async fetchWithCascadingFallbacks(artist, title, language) {
    const methods = language === 'hindi'
      ? [
        () => this.fetchFromJioSaavn(artist, title),
        () => this.fetchFromAudioDB(artist, title),
        () => this.fetchFromMusicBrainz(artist, title),
      ]
      : [
        () => this.fetchFromMusicBrainz(artist, title),
        () => this.fetchFromAudioDB(artist, title),
        () => this.fetchFromJioSaavn(artist, title), // Fallback for Hindi songs
      ];

    for (const method of methods) {
      try {
        const result = await method();
        if (result && (result.imageUrl || result.album || result.year)) {
          console.log(`✅ Found metadata using ${result.source} for: ${artist} - ${title}`);
          return result;
        }
      } catch (error) {
        console.warn(`❌ API failed for ${artist} - ${title}:`, error.message);
        continue;
      }
    }

    console.log(`🔍 No metadata found for: ${artist} - ${title}`);
    return {};
  }

  static async fetchFromJioSaavn(artist, title) {
    try {
      const query = `${artist} ${title}`.trim();
      const response = await fetch(
        `${this.APIs.JIOSAAVN}/search/songs?query=${encodeURIComponent(query)}&limit=1`,
        {
          headers: {
            'User-Agent': 'MusicPlayer/1.0.0'
          }
        }
      );

      if (!response.ok) throw new Error(`JioSaavn API error: ${response.status}`);

      const data = await response.json();

      if (data.data?.results?.length > 0) {
        const song = data.data.results[0];
        const imageUrl = song.image?.[1]?.link || song.image?.[2]?.link || song.image?.[0]?.link;

        return {
          source: 'jiosaavn',
          album: song.album?.name,
          artist: song.primaryArtists || artist,
          title: song.name || title,
          year: song.year ? parseInt(song.year) : undefined,
          duration: song.duration ? parseInt(song.duration) : undefined,
          imageUrl: await this.validateImageUrl(imageUrl),
          language: song.language,
          label: song.label,
        };
      }
    } catch (error) {
      throw new Error(`JioSaavn: ${error.message}`);
    }
    return null;
  }

  static async fetchFromAudioDB(artist, title) {
    try {
      // Try searching by album first (often more successful)
      const albumResponse = await fetch(
        `${this.APIs.AUDIODB}/searchalbum.php?s=${encodeURIComponent(artist)}&a=${encodeURIComponent(title)}`
      );

      if (albumResponse.ok) {
        const albumData = await albumResponse.json();
        if (albumData.album?.length > 0) {
          const album = albumData.album[0];
          return {
            source: 'audiodb-album',
            album: album.strAlbum,
            artist: album.strArtist || artist,
            year: album.intYearReleased ? parseInt(album.intYearReleased) : undefined,
            genre: album.strGenre,
            imageUrl: await this.validateImageUrl(album.strAlbumThumb || album.strAlbumThumbHQ),
            description: album.strDescriptionEN,
            label: album.strLabel,
          };
        }
      }

      // Fallback: search by artist
      const artistResponse = await fetch(
        `${this.APIs.AUDIODB}/search.php?s=${encodeURIComponent(artist)}`
      );

      if (artistResponse.ok) {
        const artistData = await artistResponse.json();
        if (artistData.artists?.length > 0) {
          const artistInfo = artistData.artists[0];
          return {
            source: 'audiodb-artist',
            artist: artistInfo.strArtist || artist,
            genre: artistInfo.strGenre,
            imageUrl: await this.validateImageUrl(artistInfo.strArtistThumb),
            biography: artistInfo.strBiographyEN,
          };
        }
      }
    } catch (error) {
      throw new Error(`AudioDB: ${error.message}`);
    }
    return null;
  }

  static async fetchFromMusicBrainz(artist, title) {
    try {
      const searchTerm = `artist:"${artist}" AND recording:"${title}"`;
      const searchUrl = `${this.APIs.MUSICBRAINZ}/recording/?query=${encodeURIComponent(searchTerm)}&fmt=json&limit=1&inc=releases`;

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'MusicPlayer/1.0.0 (contact@example.com)'
        }
      });

      if (!response.ok) throw new Error(`MusicBrainz API error: ${response.status}`);

      const data = await response.json();

      if (data.recordings?.length > 0) {
        const recording = data.recordings[0];
        const release = recording.releases?.[0];

        let imageUrl = null;
        if (release?.id) {
          imageUrl = await this.getAlbumArtwork(release.id);
        }

        return {
          source: 'musicbrainz',
          album: release?.title,
          artist: recording['artist-credit']?.[0]?.name || artist,
          title: recording.title || title,
          year: release?.date ? new Date(release.date).getFullYear() : undefined,
          genre: recording.tags?.[0]?.name,
          duration: recording.length ? Math.round(recording.length / 1000) : undefined,
          imageUrl: imageUrl,
          mbid: recording.id,
          releaseId: release?.id,
        };
      }
    } catch (error) {
      throw new Error(`MusicBrainz: ${error.message}`);
    }
    return null;
  }

  static async validateImageUrl(url) {
    if (!url || this.failedUrls.has(url)) return null;

    try {
      const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
      if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
        return url;
      }
    } catch (error) {
      // Ignore network errors for image validation
    }

    this.failedUrls.add(url);
    return null;
  }

  static async getAlbumArtwork(releaseId) {
    const sizes = ['1200', '500', '250'];

    for (const size of sizes) {
      try {
        const artUrl = `${this.APIs.COVER_ART_ARCHIVE}/release/${releaseId}/front-${size}`;
        const validUrl = await this.validateImageUrl(artUrl);
        if (validUrl) return validUrl;
      } catch (error) {
        continue;
      }
    }

    // Try original size
    try {
      const artUrl = `${this.APIs.COVER_ART_ARCHIVE}/release/${releaseId}/front`;
      return await this.validateImageUrl(artUrl);
    } catch (error) {
      return null;
    }
  }

  static async fetchLyrics(artist, title) {
    try {
      const response = await fetch(`${this.APIs.LYRICS_OVH}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
      if (response.ok) {
        const data = await response.json();
        return data.lyrics;
      }
    } catch (error) {
      console.warn('Lyrics fetch failed:', error);
    }
    return null;
  }

  static getDefaultMetadata(file) {
    return {
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "Unknown Artist",
      album: "Unknown Album",
      duration: 0,
    };
  }

  static async processAudioFile(file) {
    console.log(`🎵 Processing audio file: ${file.name}`);

    const metadata = await this.extractMetadata(file);
    const [enrichedMetadata, audioMetadata] = await Promise.all([
      this.enrichMetadata(metadata),
      this.extractAudioMetadata(file)
    ]);

    // Handle album art with fallbacks
    let imageUrl = null;

    // 1. Try embedded album art first
    if (metadata.picture) {
      imageUrl = this.createAlbumArtUrl(metadata.picture);
      console.log('📷 Using embedded album art');
    }

    // 2. Use online fetched image if no embedded art
    if (!imageUrl && enrichedMetadata.imageUrl) {
      imageUrl = enrichedMetadata.imageUrl;
      console.log(`📷 Using online album art from ${enrichedMetadata.source}`);
    }

    // 3. Fallback to placeholder
    if (!imageUrl) {
      imageUrl = "/images/album-placeholder.svg";
      console.log('📷 Using placeholder album art');
    }

    const finalMetadata = {
      ...metadata,
      ...audioMetadata,
      ...enrichedMetadata,
      file: file,
      filePath: file.path || file.name,
      imageUrl: imageUrl,
      dateAdded: new Date().toISOString(),
      id: `imported-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    };

    console.log(`✅ Processed ${file.name}:`, {
      title: finalMetadata.title,
      artist: finalMetadata.artist,
      album: finalMetadata.album,
      hasArtwork: !finalMetadata.imageUrl.includes('placeholder'),
      source: finalMetadata.source || 'local',
      language: finalMetadata.language
    });

    return finalMetadata;
  }

  static async extractAudioMetadata(file) {
    try {
      const audio = new Audio();
      const audioUrl = URL.createObjectURL(file);

      return new Promise((resolve) => {
        const cleanup = () => URL.revokeObjectURL(audioUrl);

        const timeout = setTimeout(() => {
          cleanup();
          resolve({ duration: 0 });
        }, 10000); // 10 second timeout

        audio.addEventListener('loadedmetadata', () => {
          clearTimeout(timeout);
          const duration = audio.duration || 0;
          cleanup();
          resolve({ duration: Math.round(duration) });
        });

        audio.addEventListener('error', () => {
          clearTimeout(timeout);
          cleanup();
          resolve({ duration: 0 });
        });

        audio.src = audioUrl;
      });
    } catch (error) {
      console.error('Error extracting audio metadata:', error);
      return { duration: 0 };
    }
  }

  static createAlbumArtUrl(picture) {
    if (!picture) return null;

    try {
      const blob = new Blob([picture.data], { type: picture.format });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating album art URL:', error);
      return null;
    }
  }

  // Utility method to clear cache
  static clearCache() {
    this.cache.clear();
    this.failedUrls.clear();
    console.log('🧹 Metadata cache cleared');
  }

  // Get cache statistics
  static getCacheStats() {
    return {
      cacheSize: this.cache.size,
      failedUrls: this.failedUrls.size,
      queueLength: this.requestQueue.length,
      isProcessing: this.isProcessingQueue
    };
  }
}

export default MetadataService;
