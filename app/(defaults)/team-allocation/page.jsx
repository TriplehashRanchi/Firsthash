// app/dashboard/allocations/page.js
'use client';

import React, { useState, useEffect } from 'react';
import TeamAllocationCalendar from '../../../components/team/TeamAllocationCalendar';
import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';

// --- MOCK DATA (In a real app, fetch this from your API) ---
const MOCK_TEAM_MEMBERS = [
    { id: 'tm_01', name: 'Alex Johnson' },
    { id: 'tm_02', name: 'Maria Garcia' },
    { id: 'tm_03', name: 'Chen Wei' },
    { id: 'tm_04', name: 'Fatima Al-Sayed' },
    { id: 'tm_05', name: 'John Smith' },
    { id: 'tm_06', name: 'Priya Sharma' },
    { id: 'tm_07', name: 'David Lee' },
];

const MOCK_ROLES = [
    'Photographer', 'Videographer', 'TraditionalPhotographer', 'CandidPhotographer', 'DroneOperator',
    'Cinematographer', 'TraditionalVideographer', 'MakeupArtist', 'BusinessDevelopmentManager'
];

const MOCK_SHOOTS = [
    { id: 'shoot_01', eventDate: '2025-03-19', clientName: 'John Adams', functionName: 'Engagement', location: 'Ranchi', allocations: { Photographer: 'tm_01', Videographer: 'tm_02' }},
    { id: 'shoot_02', eventDate: '2025-03-28', clientName: 'John Adams', functionName: 'Haldi', location: 'qxwą', allocations: { Photographer: 'tm_03', TraditionalPhotographer: 'tm_04' }},
    { id: 'shoot_03', eventDate: '2025-03-28', clientName: 'John Adams', functionName: 'Birthday party', location: 'baliya', allocations: {}},
    { id: 'shoot_04', eventDate: '2025-03-28', clientName: 'Kunal Kumar', functionName: 'Sangeet', location: 'ghar', allocations: {}},
    { id: 'shoot_05', eventDate: '2025-03-29', clientName: 'Kunal Kumar', functionName: 'Engagement', location: 'homee', allocations: { Photographer: 'tm_05', DroneOperator: 'tm_01', MakeupArtist: 'tm_06' }},
    { id: 'shoot_06', eventDate: '2025-04-15', clientName: 'Sophia Williams', functionName: 'Wedding', location: 'Goa', allocations: { Photographer: 'tm_01', Videographer: 'tm_02', DroneOperator: 'tm_07' }},
];
// --- END MOCK DATA ---


function AllocationsPage() {
    const [theme, setTheme] = useState('light');

    // Effect to set initial theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        setTheme(initialTheme);
    }, []);

    // Effect to apply theme class to <html> and save to localStorage
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };
    
    // --- Theme-aware Styles ---
    const pageContainerStyles = "min-h-screen p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300";
    const breadcrumbLinkStyles = "text-blue-600 dark:text-blue-500 hover:underline";
    const breadcrumbCurrentPageStyles = "text-gray-500 dark:text-gray-400";
    const breadcrumbSeparatorStyles = "before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-gray-400 dark:text-gray-500";

    return (
        <main className={pageContainerStyles}>
             <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li><Link href="/dashboard" className={breadcrumbLinkStyles}>Dashboard</Link></li>
                <li className={breadcrumbSeparatorStyles}><span className={breadcrumbCurrentPageStyles}>Production Calendar</span></li>
            </ul>
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Allocation</h1>
                {/* <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button> */}
            </div>

            <TeamAllocationCalendar
                initialShoots={MOCK_SHOOTS}
                teamMembers={MOCK_TEAM_MEMBERS}
                roles={MOCK_ROLES}
            />

             <div className="mt-8 text-sm text-gray-600 dark:text-gray-500">
                <p><strong>How to use:</strong> Click on "not assigned" or an existing team member's name to open the assignment dropdown.</p>
                <p>The changes are saved automatically in the component's state.</p>
            </div>
        </main>
    );
}

export default AllocationsPage;