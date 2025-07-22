// app/attendance/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import AttendanceDashboard from '../../../../components/attandance-comp/AttendanceDashboard';

// =======================================================================================
//  DATA SOURCE (Stays in the main page as requested)
// =======================================================================================
const MOCK_STUDENTS = [
  { id: 'stu_01', name: 'Alex Johnson', avatarSeed: 'alex' },
  { id: 'stu_02', name: 'Maria Garcia', avatarSeed: 'maria' },
  { id: 'stu_03', name: 'Chen Wei', avatarSeed: 'chen' },
  { id: 'stu_04', name: 'Fatima Al-Sayed', avatarSeed: 'fatima' },
  { id: 'stu_05', name: 'John Smith', avatarSeed: 'john' },
  { id: 'stu_06', name: 'Priya Sharma', avatarSeed: 'priya' },
  { id: 'stu_07', name: 'David Lee', avatarSeed: 'david' },
];

const MOCK_ATTENDANCE_HISTORY = [
  { date: '2024-05-25', records: [ { studentId: 'stu_01', status: 'present' }, { studentId: 'stu_02', status: 'present' }, { studentId: 'stu_03', status: 'absent' }, { studentId: 'stu_04', status: 'present' }, { studentId: 'stu_05', status: 'late' }, { studentId: 'stu_06', status: 'present' }, { studentId: 'stu_07', status: 'present' }, ] },
  { date: '2024-05-24', records: [ { studentId: 'stu_01', status: 'present' }, { studentId: 'stu_02', status: 'present' }, { studentId: 'stu_03', status: 'present' }, { studentId: 'stu_04', status: 'present' }, { studentId: 'stu_05', status: 'present' }, { studentId: 'stu_06', status: 'absent' }, { studentId: 'stu_07', status: 'present' }, ] },
  { date: '2024-05-23', records: [ { studentId: 'stu_01', status: 'present' }, { studentId: 'stu_02', status: 'present' }, { studentId: 'stu_03', status: 'present' }, { studentId: 'stu_04', status: 'present' }, { studentId: 'stu_05', status: 'present' }, { studentId: 'stu_06', status: 'present' }, { studentId: 'stu_07', status: 'present' }, ] },
  { date: '2024-04-15', records: [ { studentId: 'stu_01', status: 'present' }, { studentId: 'stu_02', status: 'late' }, { studentId: 'stu_03', status: 'absent' }, { studentId: 'stu_04', status: 'present' }, { studentId: 'stu_05', status: 'present' }, { studentId: 'stu_06', status: 'present' }, { studentId: 'stu_07', status: 'present' }, ] },
];


function AttendancePage() {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(savedTheme || (systemPrefersDark ? 'dark' : 'light'));
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    return (
        <main className="min-h-screen p-4 sm:p-8 bg-slate-100 dark:bg-gray-900 text-slate-800 dark:text-slate-200 transition-colors duration-300">
             <div className="flex justify-between items-center mb-4">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Attendance Dashboard</h1>
            </div>

            <AttendanceDashboard 
            students={MOCK_STUDENTS} 
            initialHistory={MOCK_ATTENDANCE_HISTORY} 
            />
        </main>
    );
}

export default AttendancePage;