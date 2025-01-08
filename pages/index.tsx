"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import "./globals.css";

interface NetworkState {
  isOnline: boolean;
  lastChecked: number;
}

const Home = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [localAuthPending, setLocalAuthPending] = useState<boolean>(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Store network state
      const networkState: NetworkState = {
        isOnline: true,
        lastChecked: Date.now()
      };
      localStorage.setItem('network_state', JSON.stringify(networkState));
    };

    const handleOffline = () => {
      setIsOnline(false);
      const networkState: NetworkState = {
        isOnline: false,
        lastChecked: Date.now()
      };
      localStorage.setItem('network_state', JSON.stringify(networkState));
    };

    // Check initial state
    setIsOnline(navigator.onLine);
    
    // Load previous network state
    const savedNetworkState = localStorage.getItem('network_state');
    if (savedNetworkState) {
      const state: NetworkState = JSON.parse(savedNetworkState);
      // Only use saved state if it's recent (within last 5 minutes)
      if (Date.now() - state.lastChecked < 5 * 60 * 1000) {
        setIsOnline(state.isOnline);
      }
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle offline authentication attempt
  useEffect(() => {
    if (localAuthPending && isOnline) {
      // If we're back online and there was a pending auth attempt
      setLocalAuthPending(false);
      signIn("google"); // Retry the authentication
    }
  }, [isOnline, localAuthPending]);

  // Handle session-based redirect
  useEffect(() => {
    if (session) {
      // Store session info locally for offline access
      localStorage.setItem('last_session_state', JSON.stringify({
        isAuthenticated: true,
        timestamp: Date.now()
      }));
      router.push("/profile");
    }
  }, [session, router]);

  const handleSignIn = () => {
    if (!isOnline) {
      setLocalAuthPending(true);
      // Store the pending auth request
      localStorage.setItem('auth_pending', 'true');
      alert("You're currently offline. The sign-in will be attempted when you're back online.");
      return;
    }
    signIn("google");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 p-8">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-4">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-60 h-39 mx-auto relative z-10"
            />
          </div>
          {!isOnline && (
            <div className="text-yellow-300 text-sm mb-4">
              You're currently offline. Some features may be limited.
            </div>
          )}
        </div>
      </div>
      <div className="p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <button
            onClick={handleSignIn}
            type="submit"
            className={`w-full h-16 text-white text-xl rounded-2xl shadow-lg active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-2 ${
              isOnline 
                ? 'bg-purple-800 hover:bg-purple-900' 
                : 'bg-purple-600 cursor-not-allowed'
            }`}
          >
            {isOnline ? 'Sign in with Google' : 'Sign in (Offline Mode)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;