// app/attendance/view/[id]/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// A simple loading component for better user experience
const LoadingSpinner = ({ text }) => (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50 text-gray-600">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4">{text}</p>
    </div>
);

export default function AttendanceViewPage() {
    const { id } = useParams();
    const router = useRouter();
    const [member, setMember] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchDetails = async () => {
            setLoading(true);
            setError(null);

            // 1️⃣ Ensure admin is logged in
            const user = getAuth().currentUser;
            if (!user) {
                setError('Admin not logged in.');
                setLoading(false);
                return;
            }

            try {
                // 2️⃣ Get a fresh Firebase JWT
                const token = await user.getIdToken();
                const headers = { Authorization: `Bearer ${token}` };

                // 3️⃣ Fetch both member and attendance in parallel, with auth headers
                const [memberRes, historyRes] = await Promise.all([axios.get(`${API_URL}/api/members/${id}`, { headers }),
                     axios.get(`${API_URL}/api/members/${id}/attendance`, { headers })]
                    );

                if (!memberRes.data) {
                    throw new Error('Member not found.');
                }
                setMember(memberRes.data);
                setHistory(historyRes.data);
            } catch (err) {
                console.error('Failed to fetch details', err);
                setError(err.response?.data?.error || err.message || 'Could not load attendance data for this member.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    if (loading) {
        return <LoadingSpinner text="Loading History..." />;
    }

    if (error) {
        return <div className="text-center mt-10 p-4 bg-red-100 text-red-700 rounded-md max-w-md mx-auto">{error}</div>;
    }

    return (
        <main className="min-h-screen p-6 md:p-8 bg-gray-50">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Attendance History</h1>
                    {member && <p className="text-lg text-gray-600">For {member.name}</p>}
                </div>
                <button onClick={() => router.back()} className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                        <path
                            fillRule="evenodd"
                            d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Back to Dashboard
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {history.length > 0 ? (
                            history.map((rec) => (
                                <tr key={rec.a_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                        {new Date(rec.a_date).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${rec.a_status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                        >
                                            {rec.a_status === 1 ? 'Present' : 'Absent'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.in_time || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.out_time || 'N/A'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-10 text-gray-500">
                                    No attendance records found for this member.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
