import React, { useState, useEffect } from 'react';
import { Smile, ThumbsUp, Meh, Frown, ThumbsDown, User } from 'lucide-react';
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
  customerNumber: string; // Add this property
  email: string;
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

  const calculateRatings = (ratings: Rating[]) => {
    const now = new Date();
    
    // Calculate the date of the last Saturday
    const lastSaturday = new Date(now);
    lastSaturday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
    lastSaturday.setHours(0, 0, 0, 0); // Set to start of the day
  
    // Calculate the first day of the current month
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0); // Set to start of the day
    
    // Weekly sum calculation from last Saturday
    const weeklySum = ratings
      .filter(rating => new Date(rating.createdAt) >= lastSaturday)
      .reduce((acc, rating) => acc + rating.rating, 0);
  
    // Monthly sum calculation from the 1st of the month
    const monthlySum = ratings
      .filter(rating => new Date(rating.createdAt) >= firstDayOfMonth)
      .reduce((acc, rating) => acc + rating.rating, 0);
  
    // Total sum
    const totalSum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
  
    setWeeklyRating(weeklySum);
    setMonthlyRating(monthlySum);
    setSumRating(totalSum);
  };
  


  const router = useRouter();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };
  const emojis = [
    { icon: ThumbsUp, text: "Excellent - ممتاز", color: "text-green-500", value: 2 },
    { icon: Smile, text: "Good - جيد", color: "text-emerald-500", value: 1 },
    { icon: Meh, text: "Fair - مقبول", color: "text-yellow-500", value: 0 },
    { icon: Frown, text: "Poor - سيء", color: "text-orange-500", value: -1 },
    { icon: ThumbsDown, text: "Very Poor - سيء جداً", color: "text-red-500", value: -2 }
  ];

  // Fetch user's previous ratings from the API
  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/rating?email=${email}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ratings');
      }

      const data = await response.json();
      setRatings(data);
      const sum = data.reduce((acc: number, rating: Rating) => acc + rating.rating, 0);
      setSumRating(sum);
      calculateRatings(data);
      
    
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  useEffect(() => {
    fetchRatings(); // Fetch ratings on component mount
  }, []);

  // Function to handle rating submission
  const handleRatingSubmit = async (value: number): Promise<void> => {
    try {
      const response = await fetch('/api/rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          customerNumber,
          rating: value,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      console.log('Rating submitted successfully');
      setIsRated(true);
      fetchRatings(); // Refresh ratings after a new submission

      setTimeout(() => {
        setIsRated(false);
        setStep('profile');
        setCustomerNumber('');
        setError('');
      }, 2000);
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError('There was an error submitting your rating. Please try again.');
    }
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
    router.push("/login");
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

        {/* Ratings table */}
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

        <div className="flex justify-center mt-6">
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-red-600 transition-all focus:outline-none"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
  <div className="bg-gradient-to-r from-green-300 to-green-600 p-4 relative">
    {/* Logo positioned in the top-left corner */}
    <div className="absolute top-1 left-4">
      <img src="logo.png" alt="Logo" className="w-20 h-18" />
    </div>
    {/* Title centered below */}
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
