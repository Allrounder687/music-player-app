import React from "react";
import { GlassPanel } from "../GlassCard";

export const EmptyDuplicatesState = ({ theme, showResolved }) => {
  return (
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
  );
};