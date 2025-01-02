// app/profile/page.tsx (For App Router)
"use client"; // This ensures this component runs on the client-side

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // For navigation to voting page
import ProfileRating from './ProfileRating';
import Admin from './admin';
import "./globals.css";

const Profile = () => {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch(`/api/user?email=${session.user.email}`);
  

        const userData = await response.json();
        const userName = userData?.name || "";

        setName(userName);

        const nameParts = userName.trim().split(" ");
        if (nameParts.length < 2) {
          setIsEditing(true);
          setMessage(
            "Please enter your full name (First and Last). You cannot proceed without updating."
          );
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [session]);

  const handleSave = async () => {
    if (!name) return;

    const nameParts = name.trim().split(" ");
    if (nameParts.length < 2) {
      setMessage("Please enter a valid full name (First and Last). Both are required.");
      return;
    }

    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session?.user?.email,
          name: name,
        }),
      });

      if (!response.ok) {
        console.error("Failed to update user information", response);
        throw new Error("Failed to update user information");
      }

      setMessage("User information updated successfully");
      setIsEditing(false);
      

    } catch (error) {
      setMessage("Error updating user information");
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return router.push("/login");
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-purple-900 to-purple-700 p-8">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-white text-2xl font-bold mb-4">Edit Profile</h1>
            <p className="text-white opacity-90 mb-6">Email: {session.user?.email}</p>
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

if (session.user?.email === "nextgraft@gmail.com") {
  return (
    <div>
      
      <Admin name={"Admin"} email={session.user?.email || ""} />
      </div>
   
  );
}
else {
  return (
    <div>
      
      <ProfileRating name={name || ""} email={session.user?.email || ""} />
      </div>
   
  );
};}

export default Profile;
