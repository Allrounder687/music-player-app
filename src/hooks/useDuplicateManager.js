import { useState, useEffect, useCallback, useMemo } from 'react';
import { DuplicateDetectionService } from '../services/duplicateDetectionService';

/**
 * Custom hook for managing duplicate detection and resolution
 * @param {Array} tracks - Array of music tracks
 * @param {Function} deleteTrack - Function to delete a track
 * @returns {Object} Duplicate management state and actions
 */
export const useDuplicateManager = (tracks, deleteTrack) => {
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedActions, setSelectedActions] = useState(new Map());
  const [showResolved, setShowResolved] = useState(false);
  const [error, setError] = useState(null);

  const scanForDuplicates = useCallback(async () => {
    if (!tracks || tracks.length === 0) return;
    
    setIsScanning(true);
    setError(null);
    
    try {
      const duplicates = DuplicateDetectionService.findDuplicates(tracks);
      setDuplicateGroups(duplicates);
      
      // Initialize recommended actions
      const actions = new Map();
      duplicates.forEach(group => {
        const recommendation = DuplicateDetectionService.getRecommendedActions(group);
        actions.set(group.id, {
          ...recommendation,
          applied: false
        });
      });
      setSelectedActions(actions);
    } catch (error) {
      console.error('Error scanning for duplicates:', error);
      setError('Failed to scan for duplicates. Please try again.');
    } finally {
      setIsScanning(false);
    }
  }, [tracks]);

  const applyAction = useCallback(async (groupId) => {
    const action = selectedActions.get(groupId);
    if (!action || action.applied) return;

    try {
      // Remove the tracks marked for deletion
      for (const track of action.remove) {
        await deleteTrack(track.id);
      }

      // Mark action as applied
      const updatedActions = new Map(selectedActions);
      updatedActions.set(groupId, { ...action, applied: true });
      setSelectedActions(updatedActions);

    } catch (error) {
      console.error('Error applying duplicate action:', error);
      setError(`Failed to apply action for group ${groupId}. Please try again.`);
    }
  }, [selectedActions, deleteTrack]);

  const applyAllActions = useCallback(async () => {
    const unappliedActions = Array.from(selectedActions.entries())
      .filter(([_, action]) => !action.applied);

    for (const [groupId, _] of unappliedActions) {
      await applyAction(groupId);
    }
  }, [selectedActions, applyAction]);

  const customizeAction = useCallback((groupId, keepTrackId) => {
    const group = duplicateGroups.find(g => g.id === groupId);
    if (!group) return;

    const keepTrack = group.tracks.find(t => t.id === keepTrackId);
    const removeTrack = group.tracks.filter(t => t.id !== keepTrackId);

    const updatedActions = new Map(selectedActions);
    updatedActions.set(groupId, {
      keep: keepTrack,
      remove: removeTrack,
      confidence: group.confidence,
      reason: 'Custom selection',
      applied: false
    });
    setSelectedActions(updatedActions);
  }, [duplicateGroups, selectedActions]);

  // Memoized visible groups computation
  const visibleGroups = useMemo(() => {
    return showResolved 
      ? duplicateGroups 
      : duplicateGroups.filter(group => {
          const action = selectedActions.get(group.id);
          return !action?.applied;
        });
  }, [showResolved, duplicateGroups, selectedActions]);

  // Auto-scan when tracks change
  useEffect(() => {
    if (tracks.length > 0) {
      scanForDuplicates();
    }
  }, [tracks, scanForDuplicates]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    duplicateGroups,
    isScanning,
    selectedActions,
    showResolved,
    visibleGroups,
    error,
    setShowResolved,
    scanForDuplicates,
    applyAction,
    applyAllActions,
    customizeAction,
    clearError
  };
};