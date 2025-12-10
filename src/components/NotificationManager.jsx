import React, { useState, useEffect, useCallback } from 'react';
import NotificationToast from './NotificationToast';

export const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Listen for library cleanup events
  useEffect(() => {
    const handleLibraryCleanup = (event) => {
      const { removed, invalid } = event.detail;
      
      if (removed > 0) {
        const message = removed === 1 
          ? `Removed invalid track: "${invalid[0]?.title || 'Unknown'}"`
          : `Removed ${removed} invalid tracks from your library`;
        
        addNotification(message, 'warning', 6000);
      }
    };

    window.addEventListener('libraryCleanup', handleLibraryCleanup);
    return () => window.removeEventListener('libraryCleanup', handleLibraryCleanup);
  }, [addNotification]);

  // Expose notification functions globally
  useEffect(() => {
    window.showNotification = addNotification;
    return () => {
      delete window.showNotification;
    };
  }, [addNotification]);

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2 pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationToast
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationManager;