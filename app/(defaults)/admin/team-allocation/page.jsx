// app/dashboard/allocations/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import TeamAllocationCalendar from '../../../../components/team/TeamAllocationCalendar';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function AllocationsPage() {
    const [calendarData, setCalendarData] = useState({ shoots: [], teamMembers: [], roles: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAllocationData = async () => {
        try {
            setIsLoading(true);
            setError('');
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) throw new Error("Authentication failed. Please log in.");
            
            const token = await user.getIdToken();
            const headers = { Authorization: `Bearer ${token}` };

            const res = await axios.get(`${API_URL}/api/projects/allocations`, { headers });
            setCalendarData(res.data);

        } catch (e) {
            setError(e?.response?.data?.error || e.message || 'Failed to load allocation data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchAllocationData();
            } else {
                setIsLoading(false);
                setError("Please log in to view the allocation calendar.");
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSaveAllocation = async (shootId, role, teamMemberIds) => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();
            await axios.put(
                `${API_URL}/api/shoots/${shootId}/assignments`,
                { serviceName: role, assigneeIds: teamMemberIds },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (e) {
            alert(e?.response?.data?.error || 'Failed to save assignment. Reverting changes.');
            fetchAllocationData(); 
        }
    };
    
    const pageContainerStyles = "min-h-screen p-4 sm:p-6  dark:bg-gray-900";
    const breadcrumbLinkStyles = "text-blue-600 dark:text-blue-500 hover:underline";

    return (
        <main className={pageContainerStyles}>
             <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li><Link href="/dashboard" className={breadcrumbLinkStyles}>Dashboard</Link></li>
                <li className="before:content-['/'] ltr:before:mr-2 text-gray-500"><span>Production Calendar</span></li>
            </ul>
            
            {/* <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Team Allocation</h1> */}

            {isLoading && <div className="text-center p-8"><p>Loading Allocation Calendar...</p></div>}
            {error && <div className="text-center p-8 bg-red-100 text-red-700 rounded-lg"><p>{error}</p></div>}

            {!isLoading && !error && (
                <TeamAllocationCalendar
                    initialShoots={calendarData.shoots}
                    teamMembers={calendarData.teamMembers}
                    roles={calendarData.roles}
                    onSaveAllocation={handleSaveAllocation}
                />
            )}
        </main>
    );
}

export default AllocationsPage;