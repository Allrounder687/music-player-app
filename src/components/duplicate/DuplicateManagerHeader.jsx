import React from "react";

export const DuplicateManagerHeader = ({
  theme,
  duplicateGroups,
  showResolved,
  setShowResolved,
  scanForDuplicates,
  applyAllActions,
  visibleGroups
}) => {
  return (
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
          aria-pressed={showResolved}
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
          aria-label="Rescan for duplicates"
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
            aria-label="Apply all recommended actions"
          >
            Apply All Actions
          </button>
        )}
      </div>
    </div>
  );
};