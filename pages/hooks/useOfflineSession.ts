// hooks/useOfflineSession.ts
import { useState, useEffect } from 'react';
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
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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