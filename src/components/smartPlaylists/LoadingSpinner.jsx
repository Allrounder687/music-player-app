import React from 'react';

export const LoadingSpinner = ({ size = 'default', className = '' }) => {
  const sizeClasses = {
    small: 'h-3 w-3 border',
    default: 'h-4 w-4 border-2',
    large: 'h-6 w-6 border-2'
  };

  return (
    <div 
      className={`animate-spin rounded-full border-white border-t-transparent ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default LoadingSpinner;