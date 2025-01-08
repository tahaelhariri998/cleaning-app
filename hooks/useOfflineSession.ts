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

const isBrowser = typeof window !== 'undefined';

export const useOfflineSession = () => {
  const { data: session, status } = useSession();
  const [offlineSession, setOfflineSession] = useState<StoredSession | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (!isBrowser) return true;
    return navigator.onLine;
  });

  const checkConnection = useCallback(async () => {
    if (!isBrowser) return true;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

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

  // Monitor online status
  useEffect(() => {
    if (!isBrowser) return;

    let timeoutId: NodeJS.Timeout;

    const handleStatusChange = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        const online = await checkConnection();
        setIsOnline(online);
        if (online) {
          try {
            localStorage.setItem('connectionState', 'true');
          } catch (error) {
            console.error('Error accessing localStorage:', error);
          }
        } else {
          try {
            localStorage.setItem('connectionState', 'false');
          } catch (error) {
            console.error('Error accessing localStorage:', error);
          }
        }
      }, 2000);
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    handleStatusChange(); // Initial check

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, [checkConnection]);

  // Store session when online
  useEffect(() => {
    if (!isBrowser || !session || !isOnline) return;

    try {
      const sessionToStore: StoredSession = {
        user: session.user,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        timestamp: Date.now(),
      };
      localStorage.setItem('offlineSession', JSON.stringify(sessionToStore));
    } catch (error) {
      console.error('Error storing session:', error);
    }
  }, [session, isOnline]);

  // Load offline session
  useEffect(() => {
    if (!isBrowser || isOnline || status === 'loading') return;

    try {
      const storedSession = localStorage.getItem('offlineSession');
      if (storedSession) {
        const parsedSession: StoredSession = JSON.parse(storedSession);
        const isValid = Date.now() < new Date(parsedSession.expires).getTime();
        
        if (isValid) {
          setOfflineSession(parsedSession);
        } else {
          localStorage.removeItem('offlineSession');
          setOfflineSession(null);
        }
      }
    } catch (error) {
      console.error('Error loading offline session:', error);
    }
  }, [isOnline, status]);

  return {
    session: isOnline ? session : offlineSession,
    status: isOnline ? status : offlineSession ? 'authenticated' : 'unauthenticated',
    isOnline
  };
};