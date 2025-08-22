'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import Link from 'next/link';
// ✅ FIX: Added 'Briefcase' to the import list to fix the ReferenceError
import { Loader2, User, Calendar, ClipboardList, Wallet, Receipt, TrendingUp, BarChart2, Briefcase } from 'lucide-react';
import dynamic from 'next/dynamic';
// --- API Configuration ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Dynamically import the Chart component to prevent SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// --- Helper Components & Functions ---

const getAuthHeaders = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return {};
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
};

const formatDate = (d) => {
    if (!d) return '—';
    try {
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return 'Invalid Date';
    }
};

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const statusLabel = (s) => {
    if (!s) return 'To Do';
    const map = { to_do: 'To Do', in_progress: 'In Progress', done: 'Done', completed: 'Completed', rejected: 'Rejected', ongoing: 'Ongoing' };
    return map[s] || String(s).replace(/_/g, ' ');
};

const StatusBadge = ({ status }) => {
    const base = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize';
    const styles = {
        to_do: 'bg-gray-100 text-gray-800',
        in_progress: 'bg-blue-100 text-blue-800',
        done: 'bg-green-100 text-green-800',
        completed: 'bg-green-100 text-green-800',
        rejected: 'bg-rose-100 text-rose-800',
        ongoing: 'bg-indigo-100 text-indigo-800',
        default: 'bg-gray-100 text-gray-800',
    };
    return <span className={`${base} ${styles[status] || styles.default}`}>{statusLabel(status)}</span>;
};

const LoadingState = () => (
    <div className="flex justify-center items-center p-10 panel"><Loader2 className="w-8 h-8 mr-2 animate-spin text-primary" /><span>Loading your dashboard...</span></div>
);

const ErrorState = ({ message }) => (
    <div className="text-center text-red-500 bg-red-50 p-4 rounded-md panel">{message}</div>
);

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="panel flex items-start justify-between">
        <div>
            <p className="text-gray-500 font-semibold">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
    </div>
);


// --- Main Dashboard Page Component ---
const  EmployeeDashboardPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summaryData, setSummaryData] = useState({
        tasks: [],
        projects: [],
        salary: {},
        expenses: [],
    });

    // --- Unified Data Fetching Logic (Unchanged) ---
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const headers = await getAuthHeaders();
            const [tasksRes, projectsRes, salaryRes, expensesRes] = await Promise.all([
                axios.get(`${API_URL}/api/employee/tasks/assigned`, { headers }),
                axios.get(`${API_URL}/api/employee/projects/assigned`, { headers }),
                axios.get(`${API_URL}/api/employee/salary/summary`, { headers }),
                axios.get(`${API_URL}/api/employee/expenses`, { headers }),
            ]);

            if (tasksRes.status !== 200 || projectsRes.status !== 200 || salaryRes.status !== 200 || expensesRes.status !== 200) {
                throw new Error('Could not load all dashboard data.');
            }

            setSummaryData({
                tasks: tasksRes.data || [],
                projects: projectsRes.data || [],
                salary: salaryRes.data || {},
                expenses: expensesRes.data || [],
            });
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError(err.message || 'Could not load your dashboard. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) fetchDashboardData();
            else { setLoading(false); setError('Please sign in to view your dashboard.'); }
        });
        return () => unsubscribe();
    }, [fetchDashboardData]);

    // Derived data for stat cards
    const totalProjects = summaryData.projects.length;
    const pendingTasks = summaryData.tasks.filter(task => task.status !== 'completed' && task.status !== 'done').length;
    const totalPaid = summaryData.salary.totalPaid || 0;
    const salaryBalance = (summaryData.salary.totalDue || 0) - totalPaid;

    // Prepare data for the workload chart
    const chartData = React.useMemo(() => {
        const counts = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            counts[key] = { month: d.toLocaleString('en-US', { month: 'short' }), year: d.getFullYear(), count: 0 };
        }
        summaryData.projects.forEach(project => {
            const startDate = new Date(project.minDate);
            const key = `${startDate.getFullYear()}-${startDate.getMonth()}`;
            if (counts[key]) counts[key].count += 1;
        });
        const sortedCounts = Object.values(counts).sort((a,b) => (a.year * 12 + (new Date(Date.parse(a.month +" 1, 2012")).getMonth())) - (b.year * 12 + (new Date(Date.parse(b.month +" 1, 2012")).getMonth())));
        return {
            categories: sortedCounts.map(c => c.month),
            series: [{ name: 'Projects', data: sortedCounts.map(c => c.count) }]
        };
    }, [summaryData.projects]);

    const chartOptions = {
    chart: { type: 'bar', height: 350, toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: { categories: chartData.categories },
    yaxis: { title: { text: 'Number of Projects' } },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val) => `${val} projects` } },
};

          const breadcrumbLinkStyles = "text-blue-600 hover:underline dark:text-blue-400";
const breadcrumbSeparatorStyles = "before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-gray-500 dark:text-gray-500";
const breadcrumbCurrentPageStyles = "text-gray-600 dark:text-gray-400";


    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="mb-2">
                <ul className="flex space-x-2 rtl:space-x-reverse mb-2">
                <li><Link href="/dashboard" className={breadcrumbLinkStyles}>Dashboard</Link></li>
                <li className={breadcrumbSeparatorStyles}><span className={breadcrumbCurrentPageStyles}>Dashboard</span></li>
        </ul>
                <p className="text-gray-500">An overview of your schedule, tasks, and financials.</p>
            </div>

            {loading && <LoadingState />}
            {error && <ErrorState message={error} />}

            {!loading && !error && (
                <>
                    {/* --- Top-Level Stat Cards --- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        <StatCard title="Active Projects" value={totalProjects} icon={Briefcase} color="bg-blue-500" />
                        <StatCard title="Pending Tasks" value={pendingTasks} icon={ClipboardList} color="bg-amber-500" />
                        <StatCard title="Total Earned" value={formatCurrency(totalPaid)} icon={TrendingUp} color="bg-green-500" />
                    </div>

                    {/* --- Workload Chart --- */}
                    <div className="panel">
                        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><BarChart2 className="w-5 h-5" /> Monthly Workload</h2>
                        <Chart options={chartOptions} series={chartData.series} type="bar" height={350} />
                    </div>

                    {/* ✅ NEW: Grid for all four summary cards with links */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Card 1: Upcoming Schedule */}
                        <div className="panel">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2"><Calendar className="w-5 h-5" /> Upcoming Schedule</h2>
                                <Link href="/manager/calendar" className="btn btn-sm btn-outline-primary">View Calendar</Link>
                            </div>
                            <div className="space-y-3">
                                {summaryData.projects.slice(0, 5).map((project) => (
                                    <div key={project.id} className="flex items-center justify-between p-3 rounded-md bg-gray-50 hover:bg-gray-100">
                                        <div><p className="font-semibold">{project.name}</p><p className="text-xs text-gray-500">Client: {project.clientName}</p></div>
                                        <div className="text-right"><p className="font-medium text-sm">{formatDate(project.minDate)}</p><StatusBadge status={project.status} /></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                      

                        {/* Card 3: My Salary Summary */}
                        <div className="panel">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2"><Wallet className="w-5 h-5" /> My Salary</h2>
                                <Link href="/manager/expense" className="btn btn-sm btn-outline-primary">View History</Link>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 rounded-lg text-center">
                                    <p className="text-sm text-green-800">Total Paid to Date</p>
                                    <p className="text-2xl font-bold text-green-900">{formatCurrency(totalPaid)}</p>
                                </div>
                                <div className="p-4 bg-red-50 rounded-lg text-center">
                                    <p className="text-sm text-red-800">Current Balance Due</p>
                                    <p className="text-2xl font-bold text-red-900">{formatCurrency(salaryBalance)}</p>
                                </div>
                            </div>
                        </div>


                    </div>
                </>
            )}
        </div>
    );
};

export default EmployeeDashboardPage;