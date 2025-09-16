// app/attendance/page.jsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
// import toast from 'react-hot-toast';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// --- Reusable UI Components ---

const Toast = ({ message, type, onClose }) => {
    if (!message) return null;
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);
    return <div className={`fixed top-5 right-5 p-4 rounded-md shadow-lg text-white z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{message}</div>;
};

const IconButton = ({ as: Component = 'button', children, text, ...props }) => (
    <Component className="group relative text-gray-500 hover:text-gray-800 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed" {...props}>
        {children}
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {text}
        </div>
    </Component>
);

const AttendanceModal = ({ member, onClose, onSave }) => {
    const today = new Date().toISOString().slice(0, 10);
    const [record, setRecord] = useState({
        in_time: '',
        out_time: '',
        a_status: 0,
        ...member.todayRecord,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (field, value) => {
        setRecord((prev) => ({ ...prev, [field]: value }));
    };

    const handleStatusToggle = (checked) => {
        handleChange('a_status', checked ? 1 : 0);
        if (!checked) {
            handleChange('in_time', '');
            handleChange('out_time', '');
        }
    };

    const handleSave = async () => {
        // 1️⃣ Ensure admin is logged in
        const user = getAuth().currentUser;
        if (!user) {
            toast.error('Admin not logged in');
            return;
        }

        // 2️⃣ Get fresh Firebase JWT
        let token;
        try {
            token = await user.getIdToken();
        } catch (err) {
            console.error('Error fetching auth token:', err);
            toast.error('Failed to authenticate');
            return;
        }

        // 3️⃣ Build your payload
        const payload = [
            {
                firebase_uid: member.id,
                a_date: today,
                in_time: record.in_time || null,
                out_time: record.out_time || null,
                a_status: record.a_status,
            },
        ];

        setIsSaving(true);
        try {
            // 4️⃣ Send with auth header
            await axios.post(`${API_URL}/api/members/attendance`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            onSave();
        } catch (err) {
            console.error('Failed to save attendance', err);
            toast.error(err.response?.data?.error || 'Error saving attendance');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60  flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900  p-8 w-full max-w-md">
                <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                    <li>
                        <a className="text-blue-600 hover:underline dark:text-blue-400" href="/dashboard">
                            Dashboard
                        </a>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-gray-500 dark:text-gray-500">
                        <span className="text-gray-600 dark:text-gray-400">Mark Attendance</span>
                    </li>
                </ul>
                <p className="text-gray-600 mt-1">
                    For {member.name} on {new Date().toLocaleDateString()}
                </p>
                <div className="mt-6 space-y-6">
                    <div className="flex items-center dark:bg-gray-900 justify-between bg-gray-50 p-4 rounded-lg">
                        <span className={`font-semibold ${record.a_status === 1 ? 'text-green-700' : 'text-gray-700'}`}>{record.a_status === 1 ? 'Present' : 'Absent'}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={record.a_status === 1} onChange={(e) => handleStatusToggle(e.target.checked)} className="sr-only peer" />
                            <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${record.a_status === 1 ? 'opacity-100' : 'opacity-50'}`}>
                        <div>
                            <label className="block dark:text-gray-400 mb-1 font-medium text-gray-700">Clock In</label>
                            <input
                                type="time"
                                value={record.in_time || ''}
                                onChange={(e) => handleChange('in_time', e.target.value)}
                                disabled={record.a_status !== 1}
                                className="w-full border-gray-300 dark:bg-gray-900 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 dark:text-gray-400 font-medium text-gray-700">Clock Out</label>
                            <input
                                type="time"
                                value={record.out_time || ''}
                                onChange={(e) => handleChange('out_time', e.target.value)}
                                disabled={record.a_status !== 1}
                                className="w-full border-gray-300 dark:bg-gray-900 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 w-28 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center"
                    >
                        {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const toLocalYYYYMMDD = (dateInput) => {
    const date = new Date(dateInput);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- Main Page Component ---

export default function AttendancePage() {
    const [members, setMembers] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ message: '', type: '' });
    const [modalMember, setModalMember] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [toastMsg, setToastMsg] = useState({ message: '', type: '' });

    const fetchData = async () => {
        setLoading(true);

        // 1️⃣ Ensure admin is logged in
        const user = getAuth().currentUser;
        if (!user) {
            toast.error('Admin not logged in');
            setLoading(false);
            return;
        }

        // 2️⃣ Grab a fresh token
        let token;
        try {
            token = await user.getIdToken();
        } catch (err) {
            console.error('Error getting token', err);
            toast.error('Authentication failed');
            setLoading(false);
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        try {
            // 3️⃣ Fire both requests with the auth header
            const [membersRes, attendanceRes] = await Promise.all([axios.get(`${API_URL}/api/members`, { headers }), axios.get(`${API_URL}/api/members/attendance`, { headers })]);

            // map members
            setMembers(membersRes.data.map((m) => ({ id: m.firebase_uid, name: m.name })));

            // reduce attendance into a date-indexed object
            const attendanceByDate = attendanceRes.data.reduce((acc, rec) => {
                const { firebase_uid, a_date, a_status, in_time, out_time } = rec;
                const dateKey = toLocalYYYYMMDD(a_date);

                acc[firebase_uid] = acc[firebase_uid] || {};
                acc[firebase_uid][dateKey] = { a_status, in_time, out_time };
                return acc;
            }, {});

            setAttendance(attendanceByDate);
        } catch (err) {
            console.error('Error fetching data:', err);
            toast.error('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ===== FIX #3: USE THE HELPER FUNCTION FOR LOOKUP =====
    const processedMembers = useMemo(() => {
        const todayKey = toLocalYYYYMMDD(new Date());

        return members.map((member) => {
            const todayRecord = attendance[member.id]?.[todayKey];
            let status = 'Not Marked';
            let statusColor = 'bg-gray-200 text-gray-800';

            if (todayRecord) {
                status = todayRecord.a_status === 1 ? 'Present' : 'Absent';
                statusColor = todayRecord.a_status === 1 ? 'bg-green-100 text-green-800 dark:bg-green-400 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-400 dark:text-red-300';
            }

            return { ...member, todayRecord, status, statusColor };
        });
    }, [members, attendance]);

    const handleSaveSuccess = () => {
        setModalMember(null);
        setToast({ message: 'Attendance saved successfully!', type: 'success' });
        fetchData();
    };

    const filteredMembers = useMemo(() => {
        return processedMembers.filter((member) => {
            const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'present' && member.status === 'Present') ||
                (statusFilter === 'absent' && member.status === 'Absent') ||
                (statusFilter === 'not_marked' && member.status === 'Not Marked');

            return matchesSearch && matchesStatus;
        });
    }, [processedMembers, searchQuery, statusFilter]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    // --- The rest of the return statement is unchanged and will now work ---
    return (
        <main className="min-h-screen p-6 rounded md:p-8 bg-white dark:bg-gray-900">
            <Toast message={toastMsg.message} type={toastMsg.type} onClose={() => setToastMsg({ message: '', type: '' })} />
            {modalMember && <AttendanceModal member={modalMember} onClose={() => setModalMember(null)} onSave={handleSaveSuccess} />}

            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <a className="text-blue-600 hover:underline dark:text-blue-400" href="/dashboard">
                        Dashboard
                    </a>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-gray-500 dark:text-gray-500">
                    <span class="text-gray-600 dark:text-gray-400">Attendance Dashboard</span>
                </li>
            </ul>
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-3">
                {/* Search */}
                <input
                    type="text"
                    placeholder="Search member..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-1/3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Filters */}
                <div className="flex space-x-2">
                    {['all', 'present', 'absent', 'not_marked'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium ${statusFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-200 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Today's Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredMembers.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-black rounded-full flex items-center justify-center text-white font-bold">{member.name.charAt(0)}</div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium dark:text-gray-200">{member.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.statusColor}`}>{member.status}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <div className="flex items-center justify-center space-x-5">
                                        <IconButton as={Link} href={`/admin/attendance/view/${member.id}`} text="View History">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                                                />
                                            </svg>
                                        </IconButton>
                                        <IconButton onClick={() => setModalMember(member)} text="Mark / Edit">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                                />
                                            </svg>
                                        </IconButton>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalMember && <AttendanceModal member={modalMember} onClose={() => setModalMember(null)} onSave={fetchData} />}
        </main>
    );
}
