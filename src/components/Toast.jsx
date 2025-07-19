import React, { useEffect } from 'react';
import { useMusic } from '../store/MusicContext';
import { FaCheck, FaExclamationTriangle, FaInfo, FaTimes } from 'react-icons/fa';

export const Toast = () => {
  const { toasts, removeToast } = useMusic();

  // Auto-remove toasts after 1.5 seconds
  useEffect(() => {
    toasts.forEach(toast => {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, 1500);

      return () => clearTimeout(timer);
    });
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheck className="text-green-400" />;
      case 'error':
        return <FaTimes className="text-red-400" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-400" />;
      case 'info':
      default:
        return <FaInfo className="text-blue-400" />;
    }
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-900 border-green-500 text-green-100';
      case 'error':
        return 'bg-red-900 border-red-500 text-red-100';
      case 'warning':
        return 'bg-yellow-900 border-yellow-500 text-yellow-100';
      case 'info':
      default:
        return 'bg-blue-900 border-blue-500 text-blue-100';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.slice(-3).map((toast) => ( // Show only last 3 toasts
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 shadow-lg max-w-sm animate-slide-in ${getToastStyles(toast.type)}`}
        >
          {getToastIcon(toast.type)}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-auto text-white/70 hover:text-white"
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};