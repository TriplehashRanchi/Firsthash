'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { Loader2, Wallet, TrendingUp, TrendingDown, Info } from 'lucide-react';
import Link from 'next/link';

// --- API Configuration ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// --- Helper Functions ---
const getAuthHeaders = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return {};
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
};

const formatCurrency = (value) => {
    const number = Number(value || 0);
    return `₹${number.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const monthName = (monthNumber) => {
    return new Date(2000, monthNumber - 1, 1).toLocaleString('en-US', { month: 'long' });
};

const StatusBadge = ({ status }) => {
    const isPaid = status === 'complete' || status === 'paid';
    const baseClasses = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize';
    const paidClasses = 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300';
    const pendingClasses = 'bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-300';
    
    return (
        <span className={`${baseClasses} ${isPaid ? paidClasses : pendingClasses}`}>
            {isPaid ? 'Paid' : 'Pending'}
        </span>
    );
};

// --- Main Salary Page Component ---
export default function MySalaryPage() {
    const [history, setHistory] = useState([]);
    const [summary, setSummary] = useState({ totalDue: 0, totalPaid: 0, balance: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSalaryData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const headers = await getAuthHeaders();
            
            // Fetch history and summary data in parallel for better performance
            const [historyResponse, summaryResponse] = await Promise.all([
                axios.get(`${API_URL}/api/employee/salary/history`, { headers }),
                axios.get(`${API_URL}/api/employee/salary/summary`, { headers }),
            ]);

            if (historyResponse.status !== 200 || summaryResponse.status !== 200) {
                throw new Error('Could not fetch all salary data.');
            }
            
            // Sort history by date, most recent first
            const sortedHistory = (historyResponse.data || []).sort((a, b) => 
                new Date(b.period_year, b.period_month - 1) - new Date(a.period_year, a.period_month - 1)
            );
            setHistory(sortedHistory);
            
            // Calculate balance from summary data
            const summaryData = summaryResponse.data;
            const balance = (summaryData.totalDue || 0) - (summaryData.totalPaid || 0);
            setSummary({ ...summaryData, balance });

        } catch (err) {
            setError(err.response?.data?.error || err.message || 'An error occurred while fetching your data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                fetchSalaryData();
            } else {
                setLoading(false);
                setError('Please sign in to view this page.');
            }
        });
        return () => unsubscribe();
    }, [fetchSalaryData]);

    const breadcrumbLinkStyles = "text-blue-600 hover:underline dark:text-blue-400";
const breadcrumbSeparatorStyles = "before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-gray-500 dark:text-gray-500";
const breadcrumbCurrentPageStyles = "text-gray-600 dark:text-gray-400";


    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                 <ul className="flex space-x-2 rtl:space-x-reverse mb-2">
                <li><Link href="/dashboard" className={breadcrumbLinkStyles}>Dashboard</Link></li>
                <li className={breadcrumbSeparatorStyles}><span className={breadcrumbCurrentPageStyles}>My Salary</span></li>
        </ul>
                <p className="text-gray-500 mt-1">A read-only overview of your monthly payments.</p>
            </div>

            {loading && (
                <div className="flex items-center justify-center p-12 text-gray-500">
                    <Loader2 className="animate-spin mr-3" />
                    Loading your financial details...
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
                    <strong>Error:</strong> {error}
                </div>
            )}
            
            {!loading && !error && (
                <div className="space-y-8">
                    {/* --- Summary Cards --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="panel text-center p-6">
                            <p className="text-sm font-medium text-gray-500 flex items-center justify-center gap-2">
                                <TrendingUp className="text-green-500" /> Total Paid to You
                            </p>
                            <p className="text-4xl font-bold text-green-600 mt-2">{formatCurrency(summary.totalPaid)}</p>
                        </div>
                        <div className="panel text-center p-6">
                            <p className="text-sm font-medium text-gray-500">Total Amount Earned</p>
                            <p className="text-4xl font-bold text-gray-800 mt-2">{formatCurrency(summary.totalDue)}</p>
                        </div>
                        <div className="panel text-center p-6">
                            <p className="text-sm font-medium text-gray-500 flex items-center justify-center gap-2">
                                <TrendingDown className="text-red-500" /> Remaining Balance Due
                            </p>
                            <p className={`text-4xl font-bold mt-2 ${summary.balance > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                {formatCurrency(summary.balance)}
                            </p>
                        </div>
                    </div>

                    {/* --- History Table --- */}
                    <div className="panel">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Payment History</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-slate-700">
                                    <tr className="text-left text-gray-600 dark:text-gray-300">
                                        <th className="p-3 font-semibold">Period</th>
                                        <th className="p-3 font-semibold">Amount Due</th>
                                        <th className="p-3 font-semibold">Amount Paid</th>
                                        <th className="p-3 font-semibold">Status</th>
                                        <th className="p-3 font-semibold">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length > 0 ? (
                                        history.map((record) => (
                                            <tr key={record.id} className="border-t border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                                <td className="p-3 font-semibold">{monthName(record.period_month)} {record.period_year}</td>
                                                <td className="p-3">{formatCurrency(record.amount_due)}</td>
                                                <td className="p-3 text-green-700 font-medium">{formatCurrency(record.amount_paid)}</td>
                                                <td className="p-3"><StatusBadge status={record.status} /></td>
                                                <td className="p-3 text-xs italic text-gray-500">{record.notes || '—'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center p-12 text-gray-500">
                                                <Info className="mx-auto mb-2" />
                                                No salary records have been generated for your account yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}