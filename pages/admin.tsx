import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface ProfileRatingProps {
    name: string;
    email: string;
}

interface Rating {
    id: string;
    rating: number;
    createdAt: string;
    customerNumber: string;
    email: string;
    name: string;
}

interface UserSummary {
    email: string;
    name: string;
    visits: number;
    completed: boolean;
    completedRatings: number;
    points: number;
    clicked?: boolean;
}

const ratingDescriptions: { [key: number]: string } = {
    2: "Excellent",
    1: "Good",
    0: "Fair",
    "-1": "Poor",
    "-2": "Very Poor",
};

const ProfileRating: React.FC<ProfileRatingProps> = ({ name, email }) => {
    console.log(name, email);
    const [allRatings, setAllRatings] = useState<Rating[]>([]);
    const [selectedDayRatings, setSelectedDayRatings] = useState<Rating[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedUser, setSelectedUser] = useState<Rating[] | null>(null);
    const [activeTab, setActiveTab] = useState<'all-time' | 'monthly' | 'select-day'>('all-time');
    const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date());
    const [filteredRatingsForTable, setFilteredRatingsForTable] = useState<Rating[]>([]);
    const [dailySummary, setDailySummary] = useState<UserSummary[]>([]);
    const [visitCounts, setVisitCounts] = useState<{ [email: string]: number }>({});
    const [clickedRowEmail, setClickedRowEmail] = useState<string | null>(null); // State to track clicked row
    const [summaryInitializedForDate, setSummaryInitializedForDate] = useState<Date | null>(null);
    const [isDateChanged, setIsDateChanged] = useState(false);  //new state for tracking date change
    console.log(selectedUserEmail);

    const handleComplaint = async (rating: Rating) => {
        try {
            const updatedCustomerNumber = `${rating.customerNumber} Complaint`;
            const response = await fetch(`/api/rating?id=${rating.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...rating,
                    customerNumber: updatedCustomerNumber,
                    rating: -2,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit complaint');
            }

            setAllRatings(prevRatings =>
                prevRatings?.map(r =>
                    r.id === rating.id ? { ...r, customerNumber: updatedCustomerNumber, rating: -2 } : r
                )
            );
            setFilteredRatingsForTable(prevRatings =>
                prevRatings?.map(r =>
                    r.id === rating.id ? { ...r, customerNumber: updatedCustomerNumber, rating: -2 } : r
                )
            );

            if (selectedUser) {
                setSelectedUser(prevRatings =>
                    prevRatings ? prevRatings.map(r =>
                        r.id === rating.id ? { ...r, customerNumber: updatedCustomerNumber, rating: -2 } : r
                    ) : null
                );
            }

            alert(`Complaint submitted for customer number: ${updatedCustomerNumber}`);
            fetchRatings();
        } catch (error) {
            console.error('Error submitting complaint:', error);
            if (error instanceof Error) {
                alert(`Failed to submit complaint: ${error.message}`);
            } else {
                alert('Failed to submit complaint');
            }
        }
    };


    const fetchRatings = async () => {
        try {
            const response = await fetch('/api/rating', { method: 'GET' });
            if (!response.ok) throw new Error('Failed to fetch ratings');
            const data = await response.json();

            setAllRatings(data);
            setFilteredRatingsForTable(data);
        } catch (error) {
            console.error('Error fetching ratings:', error);
        }
    };

    const filterRatingsByDate = (date: Date | null) => {
        if (!date) return;
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const filteredRatings = allRatings.filter((rating) => {
            const createdAt = new Date(rating.createdAt);
            return createdAt >= startOfDay && createdAt <= endOfDay;
        });

        setSelectedDayRatings(filteredRatings);
        setFilteredRatingsForTable(filteredRatings);

        return filteredRatings; // Return filtered ratings for use in useEffect
    };

    const filterMonthlyRatings = () => {
        if (!selectedMonth) return [];
        const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
        const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0, 23, 59, 59, 999);
        const filteredRatings = allRatings.filter((rating) => {
            const createdAt = new Date(rating.createdAt);
            return createdAt >= startOfMonth && createdAt <= endOfMonth;
        });
        setFilteredRatingsForTable(filteredRatings);
        return filteredRatings;
    };

    useEffect(() => {
        fetchRatings();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            const filteredRatings = filterRatingsByDate(selectedDate);

            // Check if summary is already initialized for this date
            if (!summaryInitializedForDate || selectedDate.toDateString() !== summaryInitializedForDate.toDateString() || isDateChanged) {
                // Generate new daily summary only if the date is different or the date has changed explicitly
                if (filteredRatings) {
                    generateDailySummary(filteredRatings);
                }
                setSummaryInitializedForDate(selectedDate);
                setIsDateChanged(false);  // Reset the flag after using it
            } else {
                // Update daily summary with existing visitCounts
                if (!filteredRatings) return;
                const updatedDailySummary = Array.from(new Map(filteredRatings.map(rating => [rating.email, {
                    email: rating.email,
                    name: rating.name,
                    visits: 0,
                    completed: false,
                    completedRatings: 0,
                    points: 0,
                }])).values()).map(user => ({
                    ...user,
                    completedRatings: filteredRatings.filter(rating => rating.email === user.email).length,
                    visits: visitCounts[user.email] !== undefined ? visitCounts[user.email] :
                        filteredRatings.filter(rating => rating.email === user.email).length,
                }));
                setDailySummary(updatedDailySummary);
                setFilteredRatingsForTable(filteredRatings);
            }
        }
    }, [selectedDate, isDateChanged]);  // Also include isDateChanged as a dependency

    useEffect(() => {
        if (activeTab === 'monthly') filterMonthlyRatings();
    }, [selectedMonth, activeTab]);

    useEffect(() => {
        if (activeTab === 'all-time') setFilteredRatingsForTable(allRatings);
    }, [activeTab]);

    const handleUserClick = (email: string) => {
        let userRatings: Rating[] = [];
        if (activeTab === 'all-time') {
            userRatings = allRatings.filter((rating) => rating.email === email);
        }
        else if (activeTab === 'monthly') {
            userRatings = filterMonthlyRatings().filter(rating => rating.email === email)
        }
        else if (activeTab === 'select-day') {
            userRatings = selectedDayRatings.filter((rating) => rating.email === email)
        }
        setSelectedUser(userRatings);
        setSelectedUserEmail(email);
        setClickedRowEmail(email);
    };

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
            .sort((a, b) => b[1].rating - a[1].rating)
            .map(([userEmail, { name, rating }], index) => {
                let medalEmoji = '';
                if (index === 0) medalEmoji = '🥇';
                else if (index === 1) medalEmoji = '🥈';
                else if (index === 2) medalEmoji = '🥉';
                else if (index === 3) medalEmoji = '🎖️';
                else if (index === 4) medalEmoji = '🏅';
                return (
                    <tr
                        key={userEmail}
                        className={`bg-white hover:bg-gray-100  ${(clickedRowEmail === userEmail) ? 'bg-cyan-400 hover:bg-cyan-400 ' : ''}`}
                        onClick={() => handleUserClick(userEmail)}
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

    const handleVisitChange = (email: string, value: string) => {
        const numValue = Number(value);

        const completedRatings = dailySummary.find(user => user.email === email)?.completedRatings || 0;
        if (numValue < completedRatings) {
            alert(`Visits cannot be less than completed ratings (${completedRatings}) for ${email}`);
            setVisitCounts(prevCounts => ({
                ...prevCounts,
                [email]: completedRatings,
            }));
            setDailySummary(prevSummary =>
                prevSummary.map(user =>
                    user.email === email ? { ...user, visits: completedRatings } : user
                )
            );
            return;
        }
        const newVisits = {
            ...visitCounts,
            [email]: numValue,
        };
        setVisitCounts(newVisits);
        setDailySummary((prevSummary) =>
            prevSummary.map((user) =>
                user.email === email ? { ...user, visits: numValue } : user
            )
        );
    };

    const handleCompletionStatus = async (email: string, completed: boolean) => {
        const updateSummary = async () => {
            const updatedSummary = await Promise.all(dailySummary.map(async (user) => {
                if (user.email === email) {
                    let updatedPoints = 0;
                    const visitCount = visitCounts[user.email] !== undefined ? visitCounts[user.email] : user.visits;
                    const completedRatingsCount = selectedDayRatings.filter(rating => rating.email === email).length;

                    if (!completed) {
                        const difference = visitCount - completedRatingsCount;
                        const completedRatingsTotal = selectedDayRatings
                            .filter(rating => rating.email === email)
                            .reduce((sum, rating) => sum + rating.rating, 0);
                        updatedPoints = -2 * difference + completedRatingsTotal;

                        for (let i = 0; i < difference; i++) {

                            const newRating = {
                                name,
                                email,
                                "customerNumber": "penalty",
                                rating: -2,
                                createdAt: new Date().toISOString()
                            };

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

                            }
                        }

                    } else {
                        const completedRatingsTotal = selectedDayRatings
                            .filter(rating => rating.email === email)
                            .reduce((sum, rating) => sum + rating.rating, 0);
                        updatedPoints = completedRatingsTotal;
                    }

                    return { ...user, completed, points: updatedPoints, clicked: true };
                }
                return user;
            }));
            setDailySummary(updatedSummary);
        };
        updateSummary();
    };

    const generateDailySummary = (ratings: Rating[]) => {
        const userMap = new Map<string, UserSummary>();

        ratings.forEach((rating) => {
            if (!userMap.has(rating.email)) {
                userMap.set(rating.email, {
                    email: rating.email,
                    name: rating.name,
                    visits: 0,  // Default visits
                    completed: false,
                    completedRatings: 0,
                    points: 0,
                });
            }
            const user = userMap.get(rating.email);
            if (user) {
                user.completedRatings++;
            }

        });

        const newVisitCounts: { [key: string]: number } = {};

        userMap.forEach(user => {
            newVisitCounts[user.email] = user.completedRatings;
        });

        setVisitCounts(newVisitCounts);

        setDailySummary(Array.from(userMap.values()).map(user => ({
            ...user,
            visits: visitCounts[user.email] !== undefined ? visitCounts[user.email] : user.completedRatings,
        })));
    };

    const renderDailySummaryTable = () => {
        return (
            <div className="overflow-x-auto p-4 mt-4">
                <table className="min-w-full table-auto border-collapse table-layout-fixed">
                    <thead>
                        <tr className="bg-gray-200 text-left">
                            <th className="px-4 py-2 border-b text-purple-700">Name</th>
                            <th className="px-4 py-2 border-b text-purple-700">Visits</th>
                            <th className="px-4 py-2 border-b text-purple-700">Completed Ratings</th>
                            <th className="px-4 py-2 border-b text-purple-700">Points</th>
                            <th className="px-4 py-2 border-b text-purple-700">Completed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dailySummary.map((user) => {

                            const isDisabledComplete = user.visits !== user.completedRatings;
                            const isDisabledNotComplete = user.visits === user.completedRatings;

                            return (
                                <tr key={user.email} className={`bg-white hover:bg-gray-100 ${clickedRowEmail === user.email ? 'bg-green-200' : ''}`}>
                                    <td className="px-4 py-2 border-b text-gray-800">{user.name}</td>
                                    <td className="px-4 py-2 border-b text-gray-800">
                                        <input
                                            type="number"
                                            className="border rounded px-2 py-1 w-20"
                                            value={visitCounts[user.email] !== undefined ? visitCounts[user.email] : user.visits}
                                            onChange={(e) => handleVisitChange(user.email, e.target.value)}
                                        />
                                    </td>
                                    <td className="px-4 py-2 border-b text-gray-800">{user.completedRatings}</td>
                                    <td className="px-4 py-2 border-b text-gray-800">{user.points}</td>
                                    <td className="px-4 py-2 border-b text-gray-800">
                                        {!user.clicked ? (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleCompletionStatus(user.email, true)}
                                                    disabled={isDisabledComplete}
                                                    className={`bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded ${isDisabledComplete ? 'opacity-50 cursor-not-allowed' : ''}`}

                                                >
                                                    Complete
                                                </button>
                                                <button
                                                    onClick={() => handleCompletionStatus(user.email, false)}
                                                    disabled={isDisabledNotComplete}
                                                    className={`bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ${isDisabledNotComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    Not Complete
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={`font-semibold ${user.completed ? "text-green-600" : "text-red-600"}`}>
                                                {user.completed ? "Completed" : "Not Completed"}
                                            </span>
                                        )}

                                    </td>

                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
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
                                <tbody>{renderTable(filteredRatingsForTable)}</tbody>
                            </table>
                        </div>
                    )}


                    {activeTab === 'monthly' && (
                        <div className="p-4 text-center">
                            <DatePicker
                                selected={selectedMonth}
                                onChange={(date) => setSelectedMonth(date)}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                className="border rounded-lg px-4 py-2"
                                placeholderText="Select a month"
                            />
                            <div className="overflow-x-auto p-4 mt-4">
                                <table className="min-w-full table-auto border-collapse table-layout-fixed">
                                    <thead>
                                        <tr className="bg-gray-200 text-left">
                                            <th className="px-4 py-2 border-b text-purple-700 w-1/12">Rank</th>
                                            <th className="px-4 py-2 border-b text-purple-700 w-1/4">Name</th>
                                            <th className="px-4 py-2 border-b text-purple-700 w-1/6">Total Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody>{renderTable(filteredRatingsForTable)}</tbody>
                                </table>
                            </div>
                        </div>

                    )}

                    {activeTab === 'select-day' && (
                        <div className="p-4 text-center">
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => { setSelectedDate(date); setIsDateChanged(true); }}  //set the date change to true when a new date is picked
                                className="border rounded-lg px-4 py-2"
                                placeholderText="Select a date"
                            />
                            {selectedDate && (
                                <div className="mt-4">
                                    <div className="overflow-x-auto p-4 mt-4">
                                        <table className="min-w-full table-auto border-collapse table-layout-fixed">
                                            <thead>
                                                <tr className="bg-gray-200 text-left">
                                                    <th className="px-4 py-2 border-b text-purple-700 w-1/12">Rank</th>
                                                    <th className="px-4 py-2 border-b text-purple-700 w-1/4">Name</th>
                                                    <th className="px-4 py-2 border-b text-purple-700 w-1/6">Total Rating</th>

                                                </tr>
                                            </thead>
                                            <tbody>{renderTable(filteredRatingsForTable)}</tbody>
                                        </table>
                                    </div>
                                    {renderDailySummaryTable()}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedUser && (
                        <div className="overflow-x-auto p-4 mt-6">
                            <h2 className="text-xl font-semibold mb-4">Ratings for {selectedUser[0].name}</h2>
                            <table className="min-w-full table-auto border-collapse table-layout-fixed">
                                <thead>
                                    <tr className="bg-gray-200 text-left">
                                        <th className="px-4 py-2 border-b text-purple-700">Rating</th>
                                        <th className="px-4 py-2 border-b text-purple-700">Customer Number</th>
                                        <th className="px-4 py-2 border-b text-purple-700">Date & Time</th>
                                        <th className="px-4 py-2 border-b text-purple-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedUser.map((rating, index) => (
                                        <tr key={index} className="bg-white hover:bg-gray-100">
                                            <td className="px-4 py-2 border-b text-gray-800">
                                                {rating.rating} - {ratingDescriptions[rating.rating] || 'Unknown'}
                                            </td>
                                            <td className="px-4 py-2 border-b text-gray-800">{rating.customerNumber}</td>
                                            <td className="px-4 py-2 border-b text-gray-800">
                                                {new Date(rating.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-2 border-b text-gray-800">
                                                {rating.customerNumber.includes("Complaint") ? (
                                                    <span className="text-red-500">Complained</span>

                                                ) : (
                                                    <button
                                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                                                        onClick={() => handleComplaint(rating)}
                                                    >
                                                        Complaint
                                                    </button>
                                                )}
                                            </td>
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