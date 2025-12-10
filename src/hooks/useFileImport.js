import { useState, useCallback } from 'react';
import { MetadataService } from '../services/metadataService';
import { SUPPORTED_AUDIO_TYPES } from '../constants/libraryConstants';

export const useFileImport = (onTracksImported) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importProgress, setImportProgress] = useState(0);

  const validateFile = (file) => {
    if (!SUPPORTED_AUDIO_TYPES.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
    
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      throw new Error(`File too large: ${file.name}`);
    }
    
    return true;
  };

  const handleFileImport = useCallback(async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsImporting(true);
    setImportError(null);
    setImportProgress(0);

    try {
      const processedTracks = [];
      const totalFiles = files.length;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          validateFile(file);
          
          if (file.type.startsWith('audio/')) {
            const track = await MetadataService.processAudioFile(file);
            processedTracks.push(track);
          }
        } catch (fileError) {
          console.warn(`Failed to process ${file.name}:`, fileError.message);
          // Continue with other files instead of failing completely
        }
        
        setImportProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      if (processedTracks.length > 0) {
        onTracksImported?.(processedTracks);
      } else {
        setImportError('No valid audio files were found');
      }
    } catch (error) {
      console.error('Error importing files:', error);
      setImportError(error.message || 'Failed to import files');
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      event.target.value = ''; // Reset file input
    }
  }, [onTracksImported]);

  return {
    isImporting,
    importError,
    importProgress,
    handleFileImport,
    clearError: () => setImportError(null)
  };
};