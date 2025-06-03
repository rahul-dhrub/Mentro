import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

export const useOnlineStatus = () => {
  const { user, isLoaded } = useUser();
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const isOnlineRef = useRef(false);

  const updateStatus = async (isOnline: boolean, action?: string) => {
    if (!user || !isLoaded) return;

    try {
      await fetch('/api/user/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isOnline,
          action
        })
      });
      isOnlineRef.current = isOnline;
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const sendHeartbeat = async () => {
    if (!user || !isLoaded || !isOnlineRef.current) return;

    try {
      await fetch('/api/user/status', {
        method: 'PATCH'
      });
    } catch (error) {
      console.error('Error sending heartbeat:', error);
    }
  };

  const startHeartbeat = () => {
    if (heartbeatInterval.current) return;
    
    heartbeatInterval.current = setInterval(sendHeartbeat, 30000); // Every 30 seconds
  };

  const stopHeartbeat = () => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
  };

  const setOnline = () => {
    updateStatus(true, 'login');
    startHeartbeat();
  };

  const setOffline = () => {
    updateStatus(false, 'logout');
    stopHeartbeat();
  };

  useEffect(() => {
    if (!user || !isLoaded) return;

    // Set user online when component mounts
    setOnline();

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopHeartbeat();
      } else {
        setOnline();
      }
    };

    // Handle beforeunload (user leaving the page)
    const handleBeforeUnload = () => {
      setOffline();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setOffline();
    };
  }, [user, isLoaded]);

  return {
    setOnline,
    setOffline,
    sendHeartbeat
  };
}; 