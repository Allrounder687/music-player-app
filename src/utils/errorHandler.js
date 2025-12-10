/**
 * Centralized error handling utilities
 * Provides consistent error logging and user-friendly error messages
 */

// Error types for categorization
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  PERMISSION: 'PERMISSION',
  NOT_FOUND: 'NOT_FOUND',
  UNKNOWN: 'UNKNOWN',
  REACT: 'REACT',
};

/**
 * Custom error class with additional context
 */
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, context = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Main error handler class
 */
export class ErrorHandler {
  static logError(error, context = '') {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      context,
      message: error.message,
      stack: error.stack,
      name: error.name,
      type: error.type || ERROR_TYPES.UNKNOWN,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${timestamp}] Error in ${context}:`, error);
    }

    // In production, you might want to send to a logging service
    // this.sendToLoggingService(errorInfo);

    return errorInfo;
  }

  static handleAsyncError(promise, context = '') {
    return promise.catch(error => {
      this.logError(error, context);
      return null; // Return null for failed async operations
    });
  }
}

/**
 * Handle React component errors
 */
export const handleReactError = (error, errorInfo, context = 'React Component') => {
  const appError = new AppError(
    error.message,
    ERROR_TYPES.REACT,
    {
      componentStack: errorInfo?.componentStack,
      context,
      originalError: error,
    }
  );

  ErrorHandler.logError(appError, context);
  return appError;
};

/**
 * Handle network errors
 */
export const handleNetworkError = (error, url, context = 'Network Request') => {
  const appError = new AppError(
    `Network request failed: ${error.message}`,
    ERROR_TYPES.NETWORK,
    {
      url,
      status: error.status,
      context,
      originalError: error,
    }
  );

  ErrorHandler.logError(appError, context);
  return appError;
};

/**
 * Handle validation errors
 */
export const handleValidationError = (message, field, context = 'Validation') => {
  const appError = new AppError(
    message,
    ERROR_TYPES.VALIDATION,
    {
      field,
      context,
    }
  );

  ErrorHandler.logError(appError, context);
  return appError;
};

export default ErrorHandler;