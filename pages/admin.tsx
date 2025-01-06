import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  console.log(name, email); 
  const [allRatings, setAllRatings] = useState<Rating[]>([]);
  const [selectedDayRatings, setSelectedDayRatings] = useState<Rating[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedUser, setSelectedUser] = useState<Rating[] | null>(null);
  const [activeTab, setActiveTab] = useState('all-time'); // Default tab is 'all-time'

  // Fetch all ratings from the API
  const fetchRatings = async () => {
    try {
      const response = await fetch('/api/rating', { method: 'GET' });
      if (!response.ok) throw new Error('Failed to fetch ratings');
      const data = await response.json();
      setAllRatings(data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  // Filter ratings by selected date
  const filterRatingsByDate = (date: Date | null) => {
    if (!date) return;
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const filteredRatings = allRatings.filter((rating) => {
      const createdAt = new Date(rating.createdAt);
      return createdAt >= startOfDay && createdAt <= endOfDay;
    });

    setSelectedDayRatings(filteredRatings);
  };

  // Filter ratings for the last week
  const filterWeeklyRatings = () => {
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    return allRatings.filter((rating) => {
      const createdAt = new Date(rating.createdAt);
      return createdAt >= oneWeekAgo && createdAt <= now;
    });
  };

  // Filter ratings for the last month
  const filterMonthlyRatings = () => {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    return allRatings.filter((rating) => {
      const createdAt = new Date(rating.createdAt);
      return createdAt >= oneMonthAgo && createdAt <= now;
    });
  };

  useEffect(() => {
    fetchRatings(); // Fetch ratings when the component mounts
  }, []);

  useEffect(() => {
    if (selectedDate) filterRatingsByDate(selectedDate); // Apply date filter if a date is selected
  }, [selectedDate]);

  // Handle click on user name to show their specific ratings
  const handleUserClick = (email: string) => {
    const userRatings = allRatings.filter((rating) => rating.email === email);
    setSelectedUser(userRatings); // Set the ratings of the selected user
  };

  // Render the ratings table
  const renderTable = (ratingsData: Rating[]) => {
    const aggregatedRatings = Object.entries(
      ratingsData.reduce((acc: { [key: string]: { name: string; rating: number; customerNumber: string } }, rating) => {
        const userKey = rating.email;
        if (acc[userKey]) {
          acc[userKey].rating += rating.rating;
        } else {
          acc[userKey] = { name: rating.name, rating: rating.rating, customerNumber: rating.customerNumber };
        }
        return acc;
      }, {} as { [key: string]: { name: string; rating: number; customerNumber: string } })
    );

    return aggregatedRatings
      .sort((a, b) => b[1].rating - a[1].rating) // Sort by total rating in descending order
      .map(([userEmail, { name, rating }], index) => {
        let medalEmoji = '';
        if (index === 0) medalEmoji = '🥇';
        else if (index === 1) medalEmoji = '🥈';
        else if (index === 2) medalEmoji = '🥉';

        return (
          <tr
            key={userEmail}
            className={`bg-white hover:bg-gray-100 ${index < 3 ? 'bg-yellow-100' : ''}`}
            onClick={() => handleUserClick(userEmail)} // Add click handler
          >
            <td className="px-4 py-2 border-b text-gray-800">{index + 1}</td>
            <td className="px-4 py-2 border-b text-gray-800 flex items-center">
              {name} {medalEmoji && <span className="ml-2">{medalEmoji}</span>}
            </td>
            <td className="px-4 py-2 border-b text-gray-800">{rating}</td>
            
          </tr>
        );
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 p-8">
        <div className="max-w-full mx-auto text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Admin Dashboard</h1>
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('all-time')}
                className={`px-6 py-2 rounded-lg ${activeTab === 'all-time' ? 'bg-purple-700 text-white' : 'bg-gray-200 text-black'}`}
              >
                All Time Ratings
              </button>
              <button
                onClick={() => setActiveTab('weekly')}
                className={`px-6 py-2 rounded-lg ${activeTab === 'weekly' ? 'bg-purple-700 text-white' : 'bg-gray-200 text-black'}`}
              >
                Weekly Ratings
              </button>
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-6 py-2 rounded-lg ${activeTab === 'monthly' ? 'bg-purple-700 text-white' : 'bg-gray-200 text-black'}`}
              >
                Monthly Ratings
              </button>
              <button
                onClick={() => setActiveTab('select-day')}
                className={`px-6 py-2 rounded-lg ${activeTab === 'select-day' ? 'bg-purple-700 text-white' : 'bg-gray-200 text-black'}`}
              >
                Select Day Ratings
              </button>
            </div>
          </div>

          {/* All Time Ratings */}
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

          {/* Weekly Ratings */}
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
                <tbody>{renderTable(filterWeeklyRatings())}</tbody>
              </table>
            </div>
          )}

          {/* Monthly Ratings */}
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
                <tbody>{renderTable(filterMonthlyRatings())}</tbody>
              </table>
            </div>
          )}

          {/* Select Day Ratings */}
          {activeTab === 'select-day' && (
            <div className="p-4 text-center">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                className="border rounded-lg px-4 py-2"
                placeholderText="Select a date"
              />
              {selectedDate && (
                <div className="overflow-x-auto p-4 mt-4">
                  <table className="min-w-full table-auto border-collapse table-layout-fixed">
                    <thead>
                      <tr className="bg-gray-200 text-left">
                        <th className="px-4 py-2 border-b text-purple-700 w-1/12">Rank</th>
                        <th className="px-4 py-2 border-b text-purple-700 w-1/4">Name</th>
                        <th className="px-4 py-2 border-b text-purple-700 w-1/6">Total Rating</th>
                      
                      </tr>
                    </thead>
                    <tbody>{renderTable(selectedDayRatings)}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* User Specific Ratings */}
          {selectedUser && (
            <div className="overflow-x-auto p-4 mt-6">
              <h2 className="text-xl font-semibold mb-4">Ratings for {selectedUser[0].name}</h2>
              <table className="min-w-full table-auto border-collapse table-layout-fixed">
                <thead>
                  <tr className="bg-gray-200 text-left">
                    <th className="px-4 py-2 border-b text-purple-700">Rating</th>
                    <th className="px-4 py-2 border-b text-purple-700">Customer Number</th> {/* Added customer number column */}
                    <th className="px-4 py-2 border-b text-purple-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedUser.map((rating, index) => (
                    <tr key={index} className="bg-white hover:bg-gray-100">
                      <td className="px-4 py-2 border-b text-gray-800">{rating.rating}</td>
                      <td className="px-4 py-2 border-b text-gray-800">{rating.customerNumber}</td> {/* Added customer number */}
                      <td className="px-4 py-2 border-b text-gray-800">{new Date(rating.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="flex justify-center items-center ">
  <button
    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
    onClick={() => alert('Signing out...')}
  >
    Sign Out
  </button>
</div>
      </div>
    </div>
  );
};

export default ProfileRating;
