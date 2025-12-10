import React, { useState, useEffect } from "react";
import { useTheme } from "../store/ThemeContext";
import { useMusic } from "../store/MusicContext";
import { GlassCard, GlassPanel } from "./GlassCard";
import { DuplicateDetectionService } from "../services/duplicateDetectionService";

export const DuplicateManager = () => {
  const { theme } = useTheme();
  const { tracks, deleteTrack } = useMusic();
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedActions, setSelectedActions] = useState(new Map());
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    scanForDuplicates();
  }, [tracks]);

  const scanForDuplicates = async () => {
    setIsScanning(true);
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
    } finally {
      setIsScanning(false);
    }
  };

  const applyAction = async (groupId) => {
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
    }
  };

  const applyAllActions = async () => {
    const unappliedActions = Array.from(selectedActions.entries())
      .filter(([_, action]) => !action.applied);

    for (const [groupId, _] of unappliedActions) {
      await applyAction(groupId);
    }
  };

  const customizeAction = (groupId, keepTrackId) => {
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
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-500';
    if (confidence >= 0.7) return 'text-yellow-500';
    return 'text-red-500';
  };

  const visibleGroups = showResolved
    ? duplicateGroups
    : duplicateGroups.filter(group => {
      const action = selectedActions.get(group.id);
      return !action?.applied;
    });

  if (isScanning) {
    return (
      <GlassPanel className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h3 className={`text-lg font-semibold text-${theme.colors.text.primary} mb-2`}>
          Scanning for Duplicates
        </h3>
        <p className={`text-${theme.colors.text.secondary}`}>
          Analyzing {tracks.length} tracks...
        </p>
      </GlassPanel>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold text-${theme.colors.text.primary}`}>
            Duplicate Manager
          </h1>
          <p className={`text-${theme.colors.text.secondary} mt-1`}>
            Found {duplicateGroups.length} duplicate group{duplicateGroups.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowResolved(!showResolved)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${showResolved
                ? `bg-${theme.colors.primary.main} text-white`
                : `bg-${theme.colors.background.secondary} text-${theme.colors.text.secondary} hover:bg-${theme.colors.background.hover}`
              }
              border border-${theme.colors.border}
            `}
          >
            {showResolved ? 'Hide Resolved' : 'Show Resolved'}
          </button>

          <button
            onClick={scanForDuplicates}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-200
              bg-${theme.colors.background.secondary}
              hover:bg-${theme.colors.background.hover}
              text-${theme.colors.text.secondary}
              hover:text-${theme.colors.text.primary}
              border border-${theme.colors.border}
            `}
          >
            <svg className="w-4 h-4 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Rescan
          </button>

          {visibleGroups.length > 0 && (
            <button
              onClick={applyAllActions}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                bg-${theme.colors.primary.main}
                hover:bg-${theme.colors.primary.dark}
                text-white
              `}
            >
              Apply All Actions
            </button>
          )}
        </div>
      </div>

      {/* Duplicate Groups */}
      {visibleGroups.length === 0 ? (
        <GlassPanel className="p-8 text-center">
          <div className={`text-${theme.colors.text.muted} mb-4`}>
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className={`text-lg font-semibold text-${theme.colors.text.primary} mb-2`}>
            {showResolved ? 'All duplicates resolved' : 'No duplicates found'}
          </h3>
          <p className={`text-${theme.colors.text.secondary}`}>
            {showResolved
              ? 'All duplicate groups have been processed'
              : 'Your music library appears to be clean'
            }
          </p>
        </GlassPanel>
      ) : (
        <div className="space-y-6">
          {visibleGroups.map((group) => {
            const action = selectedActions.get(group.id);
            return (
              <DuplicateGroup
                key={group.id}
                group={group}
                action={action}
                onApplyAction={() => applyAction(group.id)}
                onCustomizeAction={(keepTrackId) => customizeAction(group.id, keepTrackId)}
                formatFileSize={formatFileSize}
                formatDuration={formatDuration}
                getConfidenceColor={getConfidenceColor}
                theme={theme}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const DuplicateGroup = ({
  group,
  action,
  onApplyAction,
  onCustomizeAction,
  formatFileSize,
  formatDuration,
  getConfidenceColor,
  theme
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <GlassCard className={`p-6 ${action?.applied ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`text-lg font-semibold text-${theme.colors.text.primary}`}>
              Duplicate Group
            </h3>
            <span className={`text-sm font-medium ${getConfidenceColor(group.confidence)}`}>
              {Math.round(group.confidence * 100)}% match
            </span>
            {action?.applied && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                Resolved
              </span>
            )}
          </div>
          <p className={`text-sm text-${theme.colors.text.secondary} mb-2`}>
            {group.reason}
          </p>
          <p className={`text-xs text-${theme.colors.text.muted}`}>
            {group.tracks.length} tracks found
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              p-2 rounded-lg transition-all duration-200
              bg-${theme.colors.background.secondary}
              hover:bg-${theme.colors.background.hover}
              text-${theme.colors.text.secondary}
              hover:text-${theme.colors.text.primary}
            `}
          >
            <svg
              className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {!action?.applied && (
            <button
              onClick={onApplyAction}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                bg-${theme.colors.primary.main}
                hover:bg-${theme.colors.primary.dark}
                text-white
              `}
            >
              Apply Action
            </button>
          )}
        </div>
      </div>

      {/* Recommended Action */}
      {action && (
        <div className={`p-4 rounded-lg bg-${theme.colors.background.secondary} mb-4`}>
          <h4 className={`font-medium text-${theme.colors.text.primary} mb-2`}>
            Recommended Action
          </h4>
          <p className={`text-sm text-${theme.colors.text.secondary} mb-2`}>
            {action.reason}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className={`text-green-400`}>
              Keep: {action.keep.title}
            </span>
            <span className={`text-red-400`}>
              Remove: {action.remove.length} track{action.remove.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Track Details */}
      {isExpanded && (
        <div className="space-y-3">
          {group.tracks.map((track) => {
            const isKeep = action?.keep.id === track.id;
            const isRemove = action?.remove.some(t => t.id === track.id);

            return (
              <div
                key={track.id}
                className={`
                  p-4 rounded-lg border transition-all duration-200
                  ${isKeep
                    ? `border-green-500 bg-green-500/10`
                    : isRemove
                      ? `border-red-500 bg-red-500/10`
                      : `border-${theme.colors.border} bg-${theme.colors.background.secondary}`
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={track.imageUrl || "/images/album-placeholder.svg"}
                      alt={track.album}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div>
                      <h5 className={`font-medium text-${theme.colors.text.primary}`}>
                        {track.title}
                      </h5>
                      <p className={`text-sm text-${theme.colors.text.secondary}`}>
                        {track.artist} • {track.album}
                      </p>
                      <div className={`text-xs text-${theme.colors.text.muted} mt-1`}>
                        {formatDuration(track.duration)} • {formatFileSize(track.file?.size)}
                        {track.bitrate && ` • ${track.bitrate}kbps`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isKeep && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        Keep
                      </span>
                    )}
                    {isRemove && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                        Remove
                      </span>
                    )}

                    {!action?.applied && (
                      <button
                        onClick={() => onCustomizeAction(track.id)}
                        className={`
                          px-3 py-1 rounded-md text-xs font-medium transition-all duration-200
                          ${isKeep
                            ? `bg-green-500 text-white`
                            : `bg-${theme.colors.background.tertiary} text-${theme.colors.text.secondary} hover:bg-${theme.colors.background.hover}`
                          }
                        `}
                      >
                        {isKeep ? 'Keeping' : 'Keep This'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
};

export default DuplicateManager;