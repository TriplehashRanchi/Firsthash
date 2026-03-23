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
    <div className="panel w-52 h-40 p-5 rounded-2xl shadow-md flex flex-col justify-between bg-indigo-100">
      
        <div className="flex justify-between items-start mt-2">
            <p className="text-gray-500 font-semibold text-sm">{title}</p>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>

     
        <div>
            <p className="text-3xl font-bold mb-2">{value}</p>
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
    chart: {
        type: 'bar',
        toolbar: { show: false },
    },

    plotOptions: {
        bar: {
            borderRadius: 8,
            columnWidth: '45%',
        },
    },

    dataLabels: {
        enabled: false,
    },

    stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
    },

    xaxis: {
        categories: chartData.categories,
        axisBorder: {
            show: true,
            color: '#6B7280', 
        },
        axisTicks: {
            show: true,
            color: '#6B7280',
        },
        labels: {
            style: {
                colors: '#374151', 
                fontSize: '13px',
                fontWeight: 500,
            },
        },
    },

    yaxis: {
        title: {
            text: 'Number of Projects',
            style: {
                color: '#374151',
                fontSize: '13px',
                fontWeight: 600,
            },
        },
        labels: {
            style: {
                colors: '#374151', 
                fontSize: '13px',
                fontWeight: 500,
            },
        },
    },

    grid: {
        borderColor: '#D1D5DB', 
        strokeDashArray: 3,
    },

    fill: {
        opacity: 1,
        colors: ['#6366F1'],
    },

    tooltip: {
        theme: 'light',
        y: {
            formatter: (val) => `${val} projects`,
        },
    },
};

    return (
        <div className="p-4 sm:p-6 space-y-6">
    <div className="mb-2">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-gray-500">
            An overview of your schedule, tasks, and financials.
        </p>
    </div>

    {loading && <LoadingState />}
    {error && <ErrorState message={error} />}

    {!loading && !error && (
        <>
            {/* ✅ MAIN 2 COLUMN LAYOUT */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

                {/* LEFT SIDE  */}
                <div className="space-y-6">

                    {/* CARDS */}
                    <div className="flex gap-2">
                        <StatCard title="Active Projects" value={totalProjects} icon={Briefcase} color="bg-blue-500" />
                        <StatCard title="Pending Tasks" value={pendingTasks} icon={ClipboardList} color="bg-amber-500" />
                        <StatCard title="Total Earned" value={formatCurrency(totalPaid)} icon={TrendingUp} color="bg-green-500" />
                    </div>

                    {/* UPCOMING */}
                    
                    <div className="panel bg-indigo-100 rounded-2xl p-5 shadow-md">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">

                        <div className="flex items-center gap-3">
                    {/* Icon like StatCard */}
                            <div className="p-3 rounded-full bg-indigo-400">
                                <Calendar className="w-5 h-5 text-black" />
                            </div>

                        <h2 className="text-lg font-semibold text-black">
                            Upcoming Schedule
                        </h2>
                    </div>

        
        <Link
            href="/employee/calendar"
            className="px-4 py-1.5 text-sm font-medium rounded-full bg-white text-indigo-600 shadow-sm hover:bg-indigo-50 transition"
        >
            View Calendar
        </Link>
    </div>


    <div className="space-y-3">
        {summaryData.projects.slice(0, 5).map((project) => (
            <div
                key={project.id}
                className="flex justify-between items-center p-3 rounded-3xl bg-white hover:shadow-sm transition"
            >
                <div>
                    <p className="font-semibold text-gray-800">
                        {project.name}
                    </p>
                    <p className="text-xs text-gray-500">
                        Client: {project.clientName}
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-sm text-gray-700">
                        {formatDate(project.minDate)}
                    </p>
                    <StatusBadge status={project.status} />
                </div>
            </div>
        ))}
    </div>
</div>

                    {/* SALARY */}
                   <div className="bg-indigo-100 rounded-2xl p-4 shadow-md">

    {/* Header */}
    <div className="flex items-center justify-between mb-3">

        <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-indigo-400">
                <Wallet className="w-4 h-4 text-black" />
            </div>

            <h2 className="text-sm font-semibold text-black">
                My Salary
            </h2>
        </div>

       <Link
    href="/employee/expense"
    className="px-3 py-1 text-xs font-medium rounded-full bg-white text-indigo-600 shadow-sm hover:bg-indigo-50 transition"
>
    View
</Link>

    </div>

    {/* Content */}
    <div className="flex gap-3">

        {/* Paid */}
        <div className="flex-1 p-3 bg-white rounded-xl shadow-sm">
            <p className="text-xs text-gray-500">Paid</p>
            <p className="text-lg font-bold text-green-600">
                {formatCurrency(totalPaid)}
            </p>
        </div>

        {/* Due */}
        <div className="flex-1 p-3 bg-white rounded-xl shadow-sm">
            <p className="text-xs text-gray-500">Due</p>
            <p className="text-lg font-bold text-red-500">
                {formatCurrency(salaryBalance)}
            </p>
        </div>

    </div>
</div>
</div>

                {/* ================= RIGHT SIDE ================= */}
                <div className="space-y-6">

                  
                    <div className="rounded-2xl p-5 bg-indigo-100 shadow-md">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-full bg-indigo-400">
                                <BarChart2 className="w-5 h-5 text-black" />
                            </div>
                            <h2 className="text-lg font-semibold text-black">
                                Monthly Workload
                            </h2>
                        </div>

                        <div className="bg-white rounded-xl p-4">
                            <Chart
                                options={chartOptions}
                                series={chartData.series}
                                type="bar"
                                height={260}   
                            />
                        </div>
                    </div>

                    {/* ✅ TASKS */}
                  
                    <div className="panel bg-indigo-100 rounded-2xl p-5 shadow-md">

    {/* Header */}
    <div className="flex items-center justify-between mb-4">

        <div className="flex items-center gap-3">
            {/* Icon like Upcoming */}
            <div className="p-3 rounded-full bg-indigo-400">
                <ClipboardList className="w-5 h-5 text-black" />
            </div>

            <h2 className="text-lg font-semibold text-black">
                My Tasks
            </h2>
        </div>

        <Link
            href="/employee/task"
            className="px-4 py-1.5 text-sm font-medium rounded-full bg-white text-indigo-600 shadow-sm hover:bg-indigo-50 transition"
        >
            View All
        </Link>
    </div>


    <div className="space-y-3">
        {summaryData.tasks.slice(0, 5).map((task) => (
            <div
                key={task.id}
                className="flex justify-between items-center p-3 rounded-3xl bg-white hover:shadow-sm transition"
            >
                <div>
                    <p className="font-semibold text-gray-800 truncate max-w-[180px]">
                        {task.title}
                    </p>
                    <p className="text-xs text-gray-500">
                        Due: {formatDate(task.due_date)}
                    </p>
                </div>

                <div className="text-right">
                    <StatusBadge status={task.status} />
                </div>
            </div>
        ))}
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