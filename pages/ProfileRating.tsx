import React, { useState, useEffect } from 'react';
import { Smile, ThumbsUp, Meh, Frown, ThumbsDown, User, WifiOff } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import "./globals.css";

interface ProfileRatingProps {
  name: string;
  email: string;
}

interface Rating {
  rating: number;
  createdAt: string;
  customerNumber: string;
  email: string;
  synced?: boolean;
}

const ProfileRating: React.FC<ProfileRatingProps> = ({ name, email }) => {
  const [step, setStep] = useState('profile');
  const [isRated, setIsRated] = useState(false);
  const [customerNumber, setCustomerNumber] = useState('');
  const [error, setError] = useState('');
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [sumRating, setSumRating] = useState(0);
  const [weeklyRating, setWeeklyRating] = useState(0);
  const [monthlyRating, setMonthlyRating] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [oflineRate, setOflineRate] = useState(false);
  const router = useRouter();

  const emojis = [
    { icon: ThumbsUp, text: "Excellent - ممتاز", color: "text-green-500", value: 2 },
    { icon: Smile, text: "Good - جيد", color: "text-emerald-500", value: 1 },
    { icon: Meh, text: "Fair - مقبول", color: "text-yellow-500", value: 0 },
    { icon: Frown, text: "Poor - سيء", color: "text-orange-500", value: -1 },
    { icon: ThumbsDown, text: "Very Poor - سيء جداً", color: "text-red-500", value: -2 }
  ];



  useEffect(() => {
    console.log(oflineRate);
    setIsOnline(navigator.onLine);
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineRatings();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);


    loadLocalRatings();
    if (navigator.onLine) {
      fetchRatings();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadLocalRatings = () => {
    const localRatings = localStorage.getItem('offlineRatings');
    if (localRatings) {
      const parsedRatings = JSON.parse(localRatings);
      setRatings(prev => [...prev, ...parsedRatings]);
    }
  };

  const saveRatingLocally = (rating: Rating) => {
    const localRatings = localStorage.getItem('offlineRatings');
    const currentRatings = localRatings ? JSON.parse(localRatings) : [];
    currentRatings.push({ ...rating, synced: false });
    localStorage.setItem('offlineRatings', JSON.stringify(currentRatings));
  };

  const syncOfflineRatings = async () => {
    const localRatings = localStorage.getItem('offlineRatings');
    if (!localRatings) return;

    const unsyncedRatings = JSON.parse(localRatings).filter((r: Rating) => !r.synced);
    
    for (const rating of unsyncedRatings) {
      try {
        await fetch('/api/rating', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rating),
        });
        
      } catch (error) {
        console.error('Error syncing rating:', error);
        return;
      }
    }
    localStorage.setItem('offlineRatings', JSON.stringify([]));

    
    
  };

  const calculateRatings = (ratings: Rating[]) => {
    const now = new Date();
    
    const lastSaturday = new Date(now);
    lastSaturday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
    lastSaturday.setHours(0, 0, 0, 0);
  
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    
    const weeklySum = ratings
      .filter(rating => new Date(rating.createdAt) >= lastSaturday)
      .reduce((acc, rating) => acc + rating.rating, 0);
  
    const monthlySum = ratings
      .filter(rating => new Date(rating.createdAt) >= firstDayOfMonth)
      .reduce((acc, rating) => acc + rating.rating, 0);
  
    const totalSum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
  
    setWeeklyRating(weeklySum);
    setMonthlyRating(monthlySum);
    setSumRating(totalSum);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const fetchRatings = async () => {
    try {
      
      const response = await fetch(`/api/rating?email=${email}`);
      if (!response.ok) throw new Error('Failed to fetch ratings');
      
      const data = await response.json();
      setRatings(data);
      calculateRatings(data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleRatingSubmit = async (value: number): Promise<void> => {
    const newRating = {
      name,
      email,
      customerNumber,
      rating: value,
      createdAt: new Date().toISOString()
    };

    if (!isOnline) {
      saveRatingLocally(newRating);
      setRatings(prev => [...prev, newRating]);
      calculateRatings([...ratings, newRating]);
      setOflineRate(true);
    } else {
      try {
        const response = await fetch('/api/rating', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRating),
        });

        if (!response.ok) throw new Error('Failed to submit rating');
        fetchRatings();
      } catch (error) {
        console.error('Error submitting rating:', error);
        saveRatingLocally(newRating);
      }
    }

    setIsRated(true);
    setTimeout(() => {
      setIsRated(false);
      setStep('profile');
      setCustomerNumber('');
      setError('');
    }, 2000);
  };

  const handleSubmitNumber = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!customerNumber.trim()) {
      setError('Please enter customer number');
      return;
    }
    if (!/^\d+$/.test(customerNumber)) {
      setError('Please enter numbers only');
      return;
    }
    setError('');
    setStep('rating');
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (isRated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-green-300 to-green-600 p-4">
          <h1 className="text-white text-2xl font-bold text-center">Thank You</h1>
        </div>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center space-y-4">
            <Smile className="w-24 h-24 mx-auto text-green-500" />
            <p className="text-2xl font-bold text-gray-800">Rating Completed!</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'profile') {
    return (
      <div className="min-h-screen bg-gray-50">
        {!isOnline && (
          <div className="bg-yellow-100 p-2 text-center flex items-center justify-center space-x-2">
            <WifiOff className="w-4 h-4 text-yellow-700" />
            <span className="text-yellow-700">Offline Mode - Ratings will sync when online</span>
          </div>
        )}
        <div className="bg-gradient-to-r from-green-300 to-green-600 p-8">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-4">
              <img src={"logo.png"} alt="Logo" className="w-60/4 h-39/4 mx-auto relative z-10" />
            </div>
            <User className="w-24 h-24 mx-auto text-white" />
            <h1 className="text-white text-2xl font-bold">{name}</h1>
            <p className="text-white opacity-90">{email}</p>
          </div>
        </div>
        <div className="p-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-md space-y-6">
            <form onSubmit={handleSubmitNumber} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="tel"
                  value={customerNumber}
                  onChange={(e) => {
                    setCustomerNumber(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter Customer Number"
                  className={`w-full h-16 text-center text-2xl rounded-2xl border-2 ${error ? 'border-red-500 text-red-500' : 'border-purple-200 focus:border-purple-800 text-gray-800'} outline-none`}
                />
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full h-16 bg-purple-800 text-white text-xl rounded-2xl shadow-lg active:scale-95 transition-transform hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-2"
              >
                Proceed to Rating
              </button>
            </form>
          </div>
        </div>

        <div className="overflow-x-auto max-h-64 p-4">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="px-4 py-2 border-b text-purple-700">Rating</th>
                <th className="px-4 py-2 border-b text-purple-700">Customer Number</th>
                <th className="px-4 py-2 border-b text-purple-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((rating, index) => (
                <tr key={index} className="bg-white hover:bg-gray-100">
                  <td className="px-4 py-2 border-b text-gray-800">{rating.rating}</td>
                  <td className="px-4 py-2 border-b text-gray-800">{rating.customerNumber}</td>
                  <td className="px-4 py-2 border-b text-gray-800">{formatDate(rating.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mt-6">
          <div className="flex justify-center space-x-6 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-md">
              <p className="text-sm text-gray-600">Weekly Total</p>
              <p className="text-2xl font-bold text-purple-800">{weeklyRating}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <p className="text-sm text-gray-600">Monthly Total</p>
              <p className="text-2xl font-bold text-purple-800">{monthlyRating}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <p className="text-sm text-gray-600">All Time Total</p>
              <p className="text-2xl font-bold text-purple-800">{sumRating}</p>
            </div>
          </div>
        </div>
   
        <div className="flex justify-center mt-6  ">
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-red-600 transition-all focus:outline-none"
          >
            Sign Out
          </button>
        

        </div>
        <div className="flex justify-center mt-6  "> </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {!isOnline && (
        <div className="bg-yellow-100 p-2 text-center flex items-center justify-center space-x-2">
          <WifiOff className="w-4 h-4 text-yellow-700" />
          <span className="text-yellow-700">Offline Mode - Ratings will sync when online</span>
        </div>
      )}
      <div className="bg-gradient-to-r from-green-300 to-green-600 p-4 relative">
        <div className="absolute top-1 left-4">
          <img src="logo.png" alt="Logo" className="w-20 h-18" />
        </div>
        <h1 className="text-white text-2xl font-bold text-center">Rate Our Service</h1>
      </div>
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">How was our service today?</h2>
        <div className="flex flex-col space-y-4 max-w-xs mx-auto">
          {emojis.map((emoji) => (
            <button
              key={emoji.value}
              onClick={() => handleRatingSubmit(emoji.value)}
              className="flex items-center space-x-4 space-x-reverse p-4 rounded-2xl bg-white shadow-md hover:shadow-lg transition-shadow hover:bg-gray-50 active:scale-95 transition-transform"
            >
              <emoji.icon className={`w-12 h-12 ${emoji.color}`} />
              <span className="text-xl text-gray-700 flex-grow text-right">{emoji.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileRating;