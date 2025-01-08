// hooks/useOfflineSession.ts
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface StoredSession {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires: string;
  timestamp: number;
}

export const useOfflineSession = () => {
  const { data: session, status } = useSession();
  const [offlineSession, setOfflineSession] = useState<StoredSession | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    // Initialize with the stored state if available, otherwise use navigator.onLine
    const storedOnlineState = localStorage.getItem('connectionState');
    return storedOnlineState ? JSON.parse(storedOnlineState) : navigator.onLine;
  });

  // Stable connection check with timeout
  const checkConnection = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch('/api/healthcheck', {
        method: 'HEAD',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }, []);

  // Debounced connection status update
  const updateOnlineStatus = useCallback(async () => {
    // First, check the basic navigator.onLine status
    const initialStatus = navigator.onLine;
    
    if (!initialStatus) {
      // If navigator says we're offline, we're definitely offline
      setIsOnline(false);
      localStorage.setItem('connectionState', 'false');
      return;
    }

    // If navigator says we're online, verify with a real connection check
    const isReallyOnline = await checkConnection();
    
    // Only update if the state is different
    if (isReallyOnline !== isOnline) {
      setIsOnline(isReallyOnline);
      localStorage.setItem('connectionState', JSON.stringify(isReallyOnline));
    }
  }, [isOnline, checkConnection]);

  // Monitor online status with debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleStatusChange = () => {
      // Clear any pending timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Wait 2 seconds before updating status to prevent flickering
      timeoutId = setTimeout(() => {
        updateOnlineStatus();
      }, 2000);
    };

    // Initial check
    updateOnlineStatus();

    // Set up event listeners
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    // Set up periodic check every 30 seconds
    const intervalId = setInterval(updateOnlineStatus, 30000);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      clearInterval(intervalId);
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, [updateOnlineStatus]);

  // Store session when online
  useEffect(() => {
    if (session && isOnline) {
      const sessionToStore: StoredSession = {
        user: session.user,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        timestamp: Date.now(),
      };
      localStorage.setItem('offlineSession', JSON.stringify(sessionToStore));
    }
  }, [session, isOnline]);

  // Load offline session
  useEffect(() => {
    if (!isOnline && status !== 'loading') {
      const storedSession = localStorage.getItem('offlineSession');
      if (storedSession) {
        const parsedSession: StoredSession = JSON.parse(storedSession);
        
        // Check if stored session is still valid (within 7 days)
        const isValid = Date.now() < new Date(parsedSession.expires).getTime();
        
        if (isValid) {
          setOfflineSession(parsedSession);
        } else {
          localStorage.removeItem('offlineSession');
          setOfflineSession(null);
        }
      }
    }
  }, [isOnline, status]);

  // Return combined session data
  return {
    session: isOnline ? session : offlineSession,
    status: isOnline ? status : offlineSession ? 'authenticated' : 'unauthenticated',
    isOnline
  };
};