"use client"; // This ensures the component runs on the client side

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router"; // Import useRouter
import "./globals.css";
const Home = () => {
  const { data: session } = useSession();
  const router = useRouter(); // Initialize useRouter

  if (session) {
    router.push("./pages/profile"); // Navigate to the profile page if the user is logged in
    return null; // Prevent rendering the rest of the component after redirect
  }

 
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-purple-900 to-purple-700 p-8">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-4">
              <img src={"logo.png"} alt="Logo" className="w-60 h-39 mx-auto relative z-10" /> {/* Logo */}
            </div>
          
          </div>
        </div>
        <div className="p-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-md space-y-6">
            
             
              <button onClick={() => signIn("google")}
                type="submit"
                className="w-full h-16 bg-purple-800 text-white text-xl rounded-2xl shadow-lg active:scale-95 transition-transform hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-2"
              >
              Sign in with Google
              </button>
        
          </div>
        </div>
      </div>
    );
 
};

export default Home;
