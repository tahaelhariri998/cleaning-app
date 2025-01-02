import React, { useState, useEffect } from 'react';
 
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import './globals.css';

interface ProfileRatingProps {
  name: string;
  email: string;
}

interface Rating {
  rating: number;
  createdAt: string;
  customerNumber: string;
  email: string;
  name: string;
}

const ProfileRating: React.FC<ProfileRatingProps> = ({ name, email }) => {
 console.log(name,email);
  const [allRatings, setAllRatings] = useState<Rating[]>([]);
  const [weeklyRatings, setWeeklyRatings] = useState<Rating[]>([]);
  const [monthlyRatings, setMonthlyRatings] = useState<Rating[]>([]);
  const [activeTab, setActiveTab] = useState('all-time');
  const [sumRating, setSumRating] = useState(0);
  const [weeklyRating, setWeeklyRating] = useState(0);
  const [monthlyRating, setMonthlyRating] = useState(0);
  const router = useRouter();
  console.log(sumRating,weeklyRating,monthlyRating);

  const calculateRatings = (ratings: Rating[]) => {
    const now = new Date();

    const lastSaturday = new Date(now);
    lastSaturday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
    lastSaturday.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const aggregateRatings = (ratings: Rating[]) => {
      const userRatings: { [key: string]: number } = {};
      ratings.forEach((rating) => {
        const userKey = rating.email;
        if (userRatings[userKey]) {
          userRatings[userKey] += rating.rating;
        } else {
          userRatings[userKey] = rating.rating;
        }
      });
      return userRatings;
    };

    const weeklySum = ratings.filter(rating => new Date(rating.createdAt) >= lastSaturday);
    const monthlySum = ratings.filter(rating => new Date(rating.createdAt) >= firstDayOfMonth);

    setWeeklyRating(Object.values(aggregateRatings(weeklySum)).reduce((acc, curr) => acc + curr, 0));
    setMonthlyRating(Object.values(aggregateRatings(monthlySum)).reduce((acc, curr) => acc + curr, 0));
    setSumRating(Object.values(aggregateRatings(ratings)).reduce((acc, curr) => acc + curr, 0));
  };

  const fetchRatings = async () => {
    try {
      const response = await fetch('/api/rating', { method: 'GET' });

      if (!response.ok) {
        throw new Error('Failed to fetch ratings');
      }

      const data = await response.json();
      setAllRatings(data);
      setWeeklyRatings(data.filter((rating) => new Date(rating.createdAt) >= new Date(new Date().setDate(new Date().getDate() - 7))));
      setMonthlyRatings(data.filter((rating) => new Date(rating.createdAt) >= new Date(new Date().setDate(1))));
      calculateRatings(data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };


  const renderTable = (ratingsData: Rating[]) => {
    const aggregatedRatings = Object.entries(
      ratingsData.reduce((acc: { [key: string]: { name: string; rating: number } }, rating) => {
        const userKey = rating.email;
        if (acc[userKey]) {
          acc[userKey].rating += rating.rating;
        } else {
          acc[userKey] = { name: rating.name, rating: rating.rating };
        }
        return acc;
      }, {})
    );

    return aggregatedRatings
      .sort((a, b) => b[1].rating - a[1].rating)
      .map(([userEmail, { name, rating }], index) => (
        <tr key={userEmail} className={`bg-white hover:bg-gray-100 ${index < 3 ? 'bg-yellow-100' : ''}`}>
          <td className="px-4 py-2 border-b text-gray-800">{index + 1}</td>
          <td className="px-4 py-2 border-b text-gray-800">{name}</td>
      
          <td className="px-4 py-2 border-b text-gray-800">{rating}</td>
        </tr>
      ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 p-8">
        <div className="max-w-full mx-auto text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Admin Dashboard</h1>
          <div className="flex justify-center space-x-4 mb-6">
            <button onClick={() => setActiveTab('all-time')} className={`px-6 py-2 rounded-lg ${activeTab === 'all-time' ? 'bg-purple-700 text-gray' : 'bg-gray-200 text-black'}`}>
              All Time Ratings
            </button>
            <button onClick={() => setActiveTab('weekly')} className={`px-6 py-2 rounded-lg ${activeTab === 'weekly' ? 'bg-purple-700 text-gray' : 'bg-gray-200 text-black'}`}>
              Weekly Ratings
            </button>
            <button onClick={() => setActiveTab('monthly')} className={`px-6 py-2 rounded-lg ${activeTab === 'monthly' ? 'bg-purple-700 text-gray' : 'bg-gray-200 text-black'}`}>
              Monthly Ratings
            </button>
          </div>
          {activeTab === 'all-time' && (
            <div className="overflow-x-auto p-4">
              <table className="min-w-full table-auto border-collapse table-layout-fixed">
                <thead>
                  <tr className="bg-gray-200 text-left">
                    <th className="px-4 py-2 border-b text-purple-700 w-1/12">Rank</th>
                    <th className="px-4 py-2 border-b text-purple-700 w-1/4">Name</th>
     
                    <th className="px-4 py-2 border-b text-purple-700 w-1/6">Total Rating</th>
                  </tr>
                </thead>
                <tbody>{renderTable(allRatings)}</tbody>
              </table>
            </div>
          )}
          {activeTab === 'weekly' && (
            <div className="overflow-x-auto p-4">
              <table className="min-w-full table-auto border-collapse table-layout-fixed">
                <thead>
                  <tr className="bg-gray-200 text-left">
                    <th className="px-4 py-2 border-b text-purple-700 w-1/12">Rank</th>
                    <th className="px-4 py-2 border-b text-purple-700 w-1/4">Name</th>
                
                    <th className="px-4 py-2 border-b text-purple-700 w-1/6">Total Rating</th>
                  </tr>
                </thead>
                <tbody>{renderTable(weeklyRatings)}</tbody>
              </table>
            </div>
          )}
          {activeTab === 'monthly' && (
            <div className="overflow-x-auto p-4">
              <table className="min-w-full table-auto border-collapse table-layout-fixed">
                <thead>
                  <tr className="bg-gray-200 text-left">
                    <th className="px-4 py-2 border-b text-purple-700 w-1/12">Rank</th>
                    <th className="px-4 py-2 border-b text-purple-700 w-1/4">Name</th>
                  
                    <th className="px-4 py-2 border-b text-purple-700 w-1/6">Total Rating</th>
                  </tr>
                </thead>
                <tbody>{renderTable(monthlyRatings)}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <div className="p-6 text-center">
        <button
          onClick={handleSignOut}
          className="bg-red-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-red-600 transition duration-300"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfileRating;
