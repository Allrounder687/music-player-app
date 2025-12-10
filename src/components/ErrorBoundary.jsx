import React from 'react';
import { useTheme } from '../store/ThemeContext';
import { handleReactError, AppError, ERROR_TYPES } from '../utils/errorHandler';

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Use centralized error handling
    handleReactError(error, errorInfo, 'ErrorBoundary');
    
    // Create structured error for better debugging
    const appError = new AppError(
      error.message,
      ERROR_TYPES.UNKNOWN,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        props: this.props
      }
    );
    
    // Store error for potential reporting
    this.appError = appError;
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={() => this.setState({ hasError: false, error: null, errorInfo: null })}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, onRetry }) => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center bg-${theme.colors.background.main}`}>
      <div className={`max-w-md w-full mx-4 p-6 bg-${theme.colors.background.secondary} rounded-lg border border-${theme.colors.border}`}>
        <div className="text-center">
          <svg className={`w-16 h-16 mx-auto mb-4 text-red-500`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h2 className={`text-xl font-bold text-${theme.colors.text.primary} mb-2`}>
            Something went wrong
          </h2>
          <p className={`text-${theme.colors.text.secondary} mb-4`}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className={`text-left mb-4 p-3 bg-${theme.colors.background.tertiary} rounded text-xs`}>
              <summary className={`cursor-pointer text-${theme.colors.text.muted} mb-2`}>
                Error Details
              </summary>
              <pre className={`text-red-400 whitespace-pre-wrap`}>
                {error && error.toString()}
                {errorInfo && errorInfo.componentStack}
              </pre>
            </details>
          )}
          
          <button
            onClick={onRetry}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-200
              bg-${theme.colors.primary.main}
              hover:bg-${theme.colors.primary.dark}
              text-white
            `}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export const ErrorBoundary = (props) => <ErrorBoundaryClass {...props} />;