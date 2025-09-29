'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
    <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
    <p className="mt-4 text-sm text-gray-500">Loading Your Attendance...</p>
  </div>
);

const StatCard = ({ title, value, color }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200">
    <p className="text-sm dark:text-gray-200 font-medium text-gray-500">{title}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

export default function EmployeeAttendancePage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');

  // filter states
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1-12

  useEffect(() => {
    const fetchMyAttendance = async () => {
      setLoading(true);
      setError(null);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError('You must be logged in to view your attendance.');
        setLoading(false);
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      setUserName(user.displayName || 'Employee');
      try {
        const token = await user.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${API_URL}/api/self/attendance`, { headers });

        const sortedHistory = response.data.sort(
          (a, b) => new Date(b.a_date) - new Date(a.a_date)
        );
        setHistory(sortedHistory);
      } catch (err) {
        console.error('Failed to fetch attendance history:', err);
        setError(err.response?.data?.error || err.message || 'Could not load your attendance data.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyAttendance();
  }, [router]);

  // 🔍 Filter records based on selected month + year
  const filteredHistory = useMemo(() => {
    return history.filter((rec) => {
      const d = new Date(rec.a_date);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      return year === selectedYear && month === selectedMonth;
    });
  }, [history, selectedYear, selectedMonth]);

  // 📊 Stats for filtered data
  const stats = useMemo(() => {
    const totalDays = filteredHistory.length;
    if (totalDays === 0) return { present: 0, absent: 0, percentage: '0.00' };

    const presentDays = filteredHistory.filter((rec) => rec.a_status === 1).length;
    const absentDays = totalDays - presentDays;
    const percentage = ((presentDays / totalDays) * 100).toFixed(2);

    return { present: presentDays, absent: absentDays, percentage };
  }, [filteredHistory]);

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="text-center mt-20 p-6 bg-red-50 text-red-700 rounded-lg max-w-lg mx-auto border border-red-200">
        {error}
      </div>
    );

  const breadcrumbLinkStyles = 'text-blue-600 hover:underline dark:text-blue-400';
  const breadcrumbSeparatorStyles =
    "before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-gray-500 dark:text-gray-500";
  const breadcrumbCurrentPageStyles = 'text-gray-600 dark:text-gray-400';

  // Years for dropdown (last 3 years + current)
  const years = Array.from({ length: 4 }, (_, i) => today.getFullYear() - i);

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <ul className="flex space-x-1 rtl:space-x-reverse mb-2">
            <li>
              <Link href="/dashboard" className={breadcrumbLinkStyles}>
                Dashboard
              </Link>
            </li>
            <li className={breadcrumbSeparatorStyles}>
              <span className={breadcrumbCurrentPageStyles}>My Attendance</span>
            </li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome, {userName}. Here is your attendance.
          </p>
        </header>

        {/* --- FILTERS --- */}
        <div className="flex gap-4 mb-6">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-200"
          >
            {[
              'January',
              'February',
              'March',
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
            ].map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-200"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* --- STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Present Days" value={stats.present} color="text-green-600" />
          <StatCard title="Absent Days" value={stats.absent} color="text-red-600" />
          <StatCard title="Attendance %" value={`${stats.percentage}%`} color="text-blue-600" />
        </div>

        {/* --- TABLE --- */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 dark:text-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 dark:text-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 dark:text-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Clock In
                  </th>
                  <th className="px-6 py-3 dark:text-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Clock Out
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((rec) => (
                    <tr
                      key={rec.a_id || rec.a_date}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 dark:text-gray-200 whitespace-nowrap text-sm font-medium text-gray-800">
                        {new Date(rec.a_date).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            rec.a_status === 1
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {rec.a_status === 1 ? 'Present' : 'Absent'}
                        </span>
                      </td>
                      <td className="px-6 py-4 dark:text-gray-200 whitespace-nowrap text-sm text-gray-500">
                        {rec.in_time || 'N/A'}
                      </td>
                      <td className="px-6 py-4 dark:text-gray-200 whitespace-nowrap text-sm text-gray-500">
                        {rec.out_time || 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center dark:text-gray-200 py-12 text-gray-500"
                    >
                      No attendance records found for this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
