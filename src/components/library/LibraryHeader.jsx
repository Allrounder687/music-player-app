import React from "react";
import { useTheme } from "../../store/ThemeContext";

export const LibraryHeader = ({ 
  filteredCount, 
  totalCount, 
  onFileImport, 
  isImporting 
}) => {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 className={`text-3xl font-bold text-${theme.colors.text.primary}`}>
          Music Library
        </h1>
        <p className={`text-${theme.colors.text.secondary} mt-1`}>
          {filteredCount} of {totalCount} tracks
        </p>
      </div>

      <div className="flex items-center gap-4">
        <label className={`
          px-4 py-2 rounded-lg font-medium cursor-pointer transition-all duration-200
          bg-${theme.colors.primary.main}
          hover:bg-${theme.colors.primary.dark}
          text-white
          ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          {isImporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
              Importing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 4.414V13a1 1 0 11-2 0V4.414L7.707 5.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Import Music
            </>
          )}
          <input
            type="file"
            multiple
            accept="audio/*"
            onChange={onFileImport}
            className="hidden"
            disabled={isImporting}
          />
        </label>
      </div>
    </div>
  );
};