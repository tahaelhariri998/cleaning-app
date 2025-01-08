// app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProfileRating from './ProfileRating';
import Admin from './admin';
import "./globals.css";

const Profile = () => {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const router = useRouter();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadLocalData = () => {
      if (!session?.user?.email) return;
      
      const localData = localStorage.getItem(`profile_${session.user.email}`);
      if (localData) {
        const userData = JSON.parse(localData);
        setName(userData.name || "");
      }
      
      const localPendingChanges = localStorage.getItem(`pending_${session.user.email}`);
      if (localPendingChanges) {
        setPendingChanges(JSON.parse(localPendingChanges));
      }
    };

    loadLocalData();
  }, [session]);

  // Fetch user data when online
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.email || !isOnline) return;

      try {
        const response = await fetch(`/api/user?email=${session.user.email}`);
        const userData = await response.json();
        const userName = userData?.name || "";

        setName(userName);
        // Save to localStorage
        localStorage.setItem(`profile_${session.user.email}`, JSON.stringify({ name: userName }));

        const nameParts = userName.trim().split(" ");
        if (nameParts.length < 2) {
          setIsEditing(true);
          setMessage("Please enter your full name (First and Last). You cannot proceed without updating.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // If fetch fails, try to load from localStorage
        const localData = localStorage.getItem(`profile_${session.user.email}`);
        if (localData) {
          const userData = JSON.parse(localData);
          setName(userData.name || "");
        }
      }
    };

    fetchUserData();
  }, [session, isOnline]);

  // Sync pending changes when back online
  useEffect(() => {
    const syncPendingChanges = async () => {
      if (!isOnline || pendingChanges.length === 0) return;

      for (const change of pendingChanges) {
        try {
          const response = await fetch("/api/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(change)
          });

          if (!response.ok) {
            throw new Error("Failed to sync change");
          }
        } catch (error) {
          console.error("Error syncing change:", error);
          return; // Stop syncing if there's an error
        }
      }

      // Clear pending changes after successful sync
      setPendingChanges([]);
      localStorage.removeItem(`pending_${session?.user?.email}`);
    };

    syncPendingChanges();
  }, [isOnline, pendingChanges]);

  const handleSave = async () => {
    if (!name) return;

    const nameParts = name.trim().split(" ");
    if (nameParts.length < 2) {
      setMessage("Please enter a valid full name (First and Last). Both are required.");
      return;
    }

    const changeData = {
      email: session?.user?.email,
      name: name,
    };

    // Save to localStorage immediately
    localStorage.setItem(`profile_${session?.user?.email}`, JSON.stringify({ name }));

    if (!isOnline) {
      // Store in pending changes
      const newPendingChanges = [...pendingChanges, changeData];
      setPendingChanges(newPendingChanges);
      localStorage.setItem(`pending_${session?.user?.email}`, JSON.stringify(newPendingChanges));
      setMessage("Changes saved locally. Will sync when back online.");
      setIsEditing(false);
      return;
    }

    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changeData),
      });

      if (!response.ok) {
        throw new Error("Failed to update user information");
      }

      setMessage("User information updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error(`Error updating user information: ${error}`);
      // Store failed request in pending changes
      const newPendingChanges = [...pendingChanges, changeData];
      setPendingChanges(newPendingChanges);
      localStorage.setItem(`pending_${session?.user?.email}`, JSON.stringify(newPendingChanges));
      setMessage("Changes saved locally. Will retry when connection improves.");
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return router.push("/");
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-purple-900 to-purple-700 p-8">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-white text-2xl font-bold mb-4">Edit Profile</h1>
            <p className="text-white opacity-90 mb-6">Email: {session.user?.email}</p>
            {!isOnline && (
              <p className="text-yellow-300 text-sm">You are currently offline. Changes will be saved locally.</p>
            )}
          </div>
        </div>
        <div className="p-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full h-16 text-center text-2xl rounded-2xl border-2 border-purple-200 focus:border-purple-800 text-gray-800 outline-none"
              />
              <button
                onClick={handleSave}
                className="w-full h-16 bg-purple-800 text-white text-xl rounded-2xl shadow-lg active:scale-95 transition-transform hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-2"
              >
                Save
              </button>
            </div>
            {message && (
              <p className="text-center text-red-500 text-sm mt-4">{message}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (session.user?.email === "almashhadalneeq@gmail.com") {
    return (
      <div>
        <Admin name={"Admin"} email={session.user?.email || ""} />
      </div>
    );
  }
  
  return (
    <div>
      <ProfileRating name={name || ""} email={session.user?.email || ""} />
    </div>
  );
};

export default Profile;