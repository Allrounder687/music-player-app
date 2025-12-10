/**
 * Library Watcher Service for monitoring music folders and detecting changes
 * Note: This is a client-side implementation with limitations due to browser security.
 * For full folder watching, an Electron main process implementation would be needed.
 */
export class LibraryWatcherService {
  static watchers = new Map();
  static callbacks = new Set();
  
  static addCallback(callback) {
    this.callbacks.add(callback);
  }
  
  static removeCallback(callback) {
    this.callbacks.delete(callback);
  }
  
  static notifyCallbacks(event) {
    this.callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in library watcher callback:', error);
      }
    });
  }
  
  // Simulate folder watching by periodically checking for changes
  static startWatching(folderId, folderHandle) {
    if (this.watchers.has(folderId)) {
      this.stopWatching(folderId);
    }
    
    const watcher = {
      folderId,
      folderHandle,
      lastScan: Date.now(),
      files: new Map(),
      interval: null
    };
    
    // Initial scan
    this.scanFolder(watcher);
    
    // Set up periodic scanning (every 30 seconds)
    watcher.interval = setInterval(() => {
      this.scanFolder(watcher);
    }, 30000);
    
    this.watchers.set(folderId, watcher);
    
    console.log(`Started watching folder: ${folderId}`);
  }
  
  static stopWatching(folderId) {
    const watcher = this.watchers.get(folderId);
    if (watcher) {
      if (watcher.interval) {
        clearInterval(watcher.interval);
      }
      this.watchers.delete(folderId);
      console.log(`Stopped watching folder: ${folderId}`);
    }
  }
  
  static async scanFolder(watcher) {
    try {
      const currentFiles = new Map();
      
      // Scan the folder for audio files
      for await (const [name, handle] of watcher.folderHandle.entries()) {
        if (handle.kind === 'file') {
          const file = await handle.getFile();
          if (this.isAudioFile(file)) {
            const fileInfo = {
              name: file.name,
              size: file.size,
              lastModified: file.lastModified,
              handle: handle
            };
            currentFiles.set(name, fileInfo);
          }
        }
      }
      
      // Compare with previous scan
      this.compareFiles(watcher, currentFiles);
      
      // Update watcher state
      watcher.files = currentFiles;
      watcher.lastScan = Date.now();
      
    } catch (error) {
      console.error('Error scanning folder:', error);
    }
  }
  
  static compareFiles(watcher, currentFiles) {
    const previousFiles = watcher.files;
    
    // Check for new files
    for (const [name, fileInfo] of currentFiles) {
      if (!previousFiles.has(name)) {
        this.notifyCallbacks({
          type: 'file_added',
          folderId: watcher.folderId,
          fileName: name,
          fileInfo: fileInfo
        });
      } else {
        // Check for modified files
        const prevFile = previousFiles.get(name);
        if (prevFile.lastModified !== fileInfo.lastModified) {
          this.notifyCallbacks({
            type: 'file_modified',
            folderId: watcher.folderId,
            fileName: name,
            fileInfo: fileInfo
          });
        }
      }
    }
    
    // Check for deleted files
    for (const [name, fileInfo] of previousFiles) {
      if (!currentFiles.has(name)) {
        this.notifyCallbacks({
          type: 'file_deleted',
          folderId: watcher.folderId,
          fileName: name,
          fileInfo: fileInfo
        });
      }
    }
  }
  
  static isAudioFile(file) {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.wma'];
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    return audioExtensions.includes(extension);
  }
  
  static async addFolderToWatch() {
    try {
      // Use File System Access API (Chrome/Edge only)
      if ('showDirectoryPicker' in window) {
        const folderHandle = await window.showDirectoryPicker();
        const folderId = `folder_${Date.now()}`;
        
        this.startWatching(folderId, folderHandle);
        
        return {
          id: folderId,
          name: folderHandle.name,
          handle: folderHandle
        };
      } else {
        throw new Error('File System Access API not supported');
      }
    } catch (error) {
      console.error('Error adding folder to watch:', error);
      throw error;
    }
  }
  
  static getWatchedFolders() {
    return Array.from(this.watchers.values()).map(watcher => ({
      id: watcher.folderId,
      name: watcher.folderHandle.name,
      lastScan: watcher.lastScan,
      fileCount: watcher.files.size
    }));
  }
  
  static stopAllWatching() {
    for (const folderId of this.watchers.keys()) {
      this.stopWatching(folderId);
    }
  }
}

export default LibraryWatcherService;