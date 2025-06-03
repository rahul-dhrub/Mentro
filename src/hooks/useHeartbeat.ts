import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

export const useHeartbeat = (enabled: boolean = true) => {
  const { user, isLoaded } = useUser();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);
  const lastActivityRef = useRef(Date.now());

  const sendHeartbeat = async () => {
    if (!user || !isLoaded) return;

    try {
      const response = await fetch('/api/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Heartbeat failed:', response.status);
      }
    } catch (error) {
      console.error('Heartbeat error:', error);
    }
  };

  const sendOfflineSignal = async () => {
    if (!user || !isLoaded) return;

    try {
      await fetch('/api/heartbeat', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Offline signal error:', error);
    }
  };

  const updateActivity = () => {
    lastActivityRef.current = Date.now();
    isActiveRef.current = true;
  };

  const checkActivity = () => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Consider user inactive after 2 minutes of no activity
    if (timeSinceLastActivity > 120000) {
      isActiveRef.current = false;
    }
  };

  useEffect(() => {
    if (!enabled || !user || !isLoaded) return;

    // Activity tracking events
    const activityEvents = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Add activity listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Send initial heartbeat
    sendHeartbeat();

    // Set up heartbeat interval (every 5 seconds)
    intervalRef.current = setInterval(() => {
      checkActivity();
      
      // Only send heartbeat if user is still active
      if (isActiveRef.current) {
        sendHeartbeat();
      }
    }, 5000);

    // Handle page visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, send offline signal
        sendOfflineSignal();
      } else {
        // Page is visible again, update activity and send heartbeat
        updateActivity();
        sendHeartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle beforeunload (when user leaves the page)
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Use navigator.sendBeacon for reliable offline signal
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/heartbeat', JSON.stringify({ method: 'DELETE' }));
      } else {
        // Fallback for browsers that don't support sendBeacon
        sendOfflineSignal();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Remove event listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Send offline signal when component unmounts
      sendOfflineSignal();
    };
  }, [user, isLoaded, enabled]);

  return {
    sendHeartbeat,
    sendOfflineSignal,
  };
}; 