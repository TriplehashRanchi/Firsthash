'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import Link from 'next/link';
import { 
    Loader2, 
    Calendar, 
    ClipboardList, 
    Wallet, 
    TrendingUp, 
    BarChart2, 
    Briefcase, 
    ChevronRight,
    Clock,
    CheckCircle2,
    ClipboardEdit,
    X
} from 'lucide-react';
import dynamic from 'next/dynamic';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
const DEFAULT_TASK_STATUSES = [
    { value: 'to_do', label: 'To Do' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'not_working', label: 'Not Working' },
    { value: 'overdue', label: 'Overdue' },
];

// --- Helper Functions ---
const getAuthHeaders = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return {};
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
};

const makeRequestWithRetry = async (requestFn) => {
    try {
        let headers = await getAuthHeaders(false);
        return await requestFn(headers);
    } catch (error) {
        if (error?.response?.status === 401) {
            const freshHeaders = await getAuthHeaders(true);
            return await requestFn(freshHeaders);
        }
        throw error;
    }
};

const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
};

const formatCurrency = (value) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

const isCompletedStatus = (status) => ['completed', 'complete', 'done'].includes(String(status || '').toLowerCase());

// --- Styled Sub-Components ---

const StatusBadge = ({ status }) => {
    const styles = {
        to_do: 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-300',
        in_progress: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
        completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
        complete: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
        done: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
        not_working: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        overdue: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
        rejected: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
        ongoing: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
    };
    const normalized = String(status || 'to_do').toLowerCase();
    const label = status?.replace(/_/g, ' ') || 'To Do';
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${styles[normalized] || styles.to_do}`}>
            {label}
        </span>
    );
};

const UpdateStatusModal = ({ isOpen, onClose, task, customStatuses = [], onSubmit }) => {
    const [selectedStatus, setSelectedStatus] = useState('ongoing');
    const [customStatus, setCustomStatus] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const knownStatuses = [...DEFAULT_TASK_STATUSES.map((status) => status.value), ...customStatuses];
        if (knownStatuses.includes(task?.status)) {
            setSelectedStatus(task.status);
            setCustomStatus('');
        } else {
            setSelectedStatus('custom');
            setCustomStatus(task?.status && task.status !== 'to_do' ? task.status : '');
        }
    }, [isOpen, task, customStatuses]);

    if (!isOpen) return null;

    const handleSave = async () => {
        const nextStatus = selectedStatus === 'custom' ? customStatus.trim() : selectedStatus;
        if (!nextStatus) {
            toast.error('Select a status or write a custom update.');
            return;
        }

        setSaving(true);
        try {
            await onSubmit(task, nextStatus);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-gray-700">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-gray-100">Update Task Status</h3>
                        <p className="mt-1 line-clamp-1 text-sm text-slate-500 dark:text-gray-400">{task?.title}</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-gray-700 dark:hover:text-gray-200">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="space-y-4 p-5">
                    <div className="grid grid-cols-2 gap-2">
                        {DEFAULT_TASK_STATUSES.map((status) => (
                            <button
                                key={status.value}
                                type="button"
                                onClick={() => setSelectedStatus(status.value)}
                                className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                                    selectedStatus === status.value
                                        ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-gray-950'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                    {customStatuses.length > 0 ? (
                        <select
                            value={selectedStatus}
                            onChange={(event) => setSelectedStatus(event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                        >
                            <option value={selectedStatus}>Choose saved or custom status</option>
                            {customStatuses.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                            <option value="custom">Write custom status</option>
                        </select>
                    ) : null}
                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-slate-500 dark:text-gray-400">Custom update</label>
                        <input
                            value={customStatus}
                            onChange={(event) => {
                                setCustomStatus(event.target.value);
                                setSelectedStatus('custom');
                            }}
                            placeholder="e.g. Waiting for client, Overdue due to missing files"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 rounded-b-2xl bg-slate-50 p-5 dark:bg-gray-900">
                    <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSave} disabled={saving} className="inline-flex min-w-28 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400">
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, trend }) => (
    <div className="bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-tight">{title}</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-gray-200">{value}</h3>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-gray-700 rounded-full">
                <Icon className="w-5 h-5 text-slate-600 dark:text-gray-300" />
            </div>
        </div>
        {trend && <p className="text-[11px] mt-2 text-emerald-600 dark:text-emerald-400 font-medium">{trend}</p>}
    </div>
);

const SectionHeader = ({ title, link, icon: Icon }) => (
    <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-slate-900 dark:text-gray-200" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-gray-200">{title}</h2>
        </div>
        <Link href={link} className="text-xs font-semibold text-slate-500 dark:text-gray-400 hover:text-black dark:hover:text-gray-200 flex items-center gap-1 transition-colors">
            View All <ChevronRight className="w-3 h-3" />
        </Link>
    </div>
);

const EmployeeDashboardPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userName, setUserName] = useState('');
    const [summaryData, setSummaryData] = useState({ tasks: [], projects: [], salary: {}, expenses: [] });
    const [customStatuses, setCustomStatuses] = useState([]);
    const [statusTask, setStatusTask] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const headers = await getAuthHeaders();
            const [tasksRes, projectsRes, salaryRes, expensesRes, customStatusesRes] = await Promise.all([
                axios.get(`${API_URL}/api/employee/tasks/assigned`, { headers }),
                axios.get(`${API_URL}/api/employee/projects/assigned`, { headers }),
                axios.get(`${API_URL}/api/employee/salary/summary`, { headers }),
                axios.get(`${API_URL}/api/employee/expenses`, { headers }),
                axios.get(`${API_URL}/api/employee/tasks/custom-statuses`, { headers }),
            ]);

            setSummaryData({
                tasks: tasksRes.data || [],
                projects: projectsRes.data || [],
                salary: salaryRes.data || {},
                expenses: expensesRes.data || [],
            });
            setCustomStatuses(Array.isArray(customStatusesRes.data) ? customStatusesRes.data : []);
        } catch (err) {
            setError('Unable to sync dashboard data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setUserName(user.displayName?.split(' ')[0] || 'Team Member');
                fetchDashboardData();
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [fetchDashboardData]);

    const totalPaid = summaryData.salary.totalPaid || 0;
    const salaryBalance = (summaryData.salary.totalDue || 0) - totalPaid;

    const handleUpdateTaskStatus = async (task, nextStatus) => {
        if (!task?.id) return;

        const previousTasks = summaryData.tasks;
        const toastId = toast.loading('Updating status...');
        setSummaryData((prev) => ({
            ...prev,
            tasks: prev.tasks.map((item) => (item.id === task.id ? { ...item, status: nextStatus } : item)),
        }));

        try {
            await makeRequestWithRetry((headers) =>
                axios.put(`${API_URL}/api/employee/tasks/${task.id}/status`, { status: nextStatus }, { headers }),
            );
            if (!DEFAULT_TASK_STATUSES.some((status) => status.value === nextStatus)) {
                setCustomStatuses((prev) => (prev.includes(nextStatus) ? prev : [...prev, nextStatus]));
            }
            toast.success('Status updated.', { id: toastId });
        } catch (err) {
            setSummaryData((prev) => ({ ...prev, tasks: previousTasks }));
            toast.error(err?.response?.data?.error || 'Failed to update status.', { id: toastId });
        }
    };

    const chartConfig = useMemo(() => {
        const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return {
            series: [{ name: 'Allocated Projects', data: [2, 4, 3, 7, 5, 8] }], // Placeholder or derived data
            options: {
                chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
                fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 90, 100] } },
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 2, colors: ['#0f172a'] },
                xaxis: { categories, axisBorder: { show: false }, axisTicks: { show: false } },
                yaxis: { show: false },
                grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
                colors: ['#0f172a'],
            }
        };
    }, []);

    if (loading) return (
        <div className="flex h-96 items-center justify-center dark:bg-gray-900">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400 dark:text-gray-400" />
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto p-6 space-y-8 bg-white dark:bg-gray-900 min-h-screen text-slate-900 dark:text-gray-200">
            <Toaster position="top-right" />
            <UpdateStatusModal
                isOpen={Boolean(statusTask)}
                onClose={() => setStatusTask(null)}
                task={statusTask}
                customStatuses={customStatuses}
                onSubmit={handleUpdateTaskStatus}
            />
            
            {/* --- Header Area --- */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-gray-700 pb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-200">Welcome back, {userName}</h1>
                    <p className="text-slate-500 dark:text-gray-400 mt-1">Here is what&apos;s happening with your projects today.</p>
                </div>
            </header>

            {/* --- Quick Stats --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Active Projects" value={summaryData.projects.length} icon={Briefcase} trend="+2 from last month" />
                <StatCard title="Pending Tasks" value={summaryData.tasks.filter(t => !isCompletedStatus(t.status)).length} icon={ClipboardList} />
                <StatCard title="Earnings" value={formatCurrency(totalPaid)} icon={TrendingUp} trend="Paid this year" />
                <StatCard title="Due Date" value="Oct 24" icon={Calendar} trend="Next Milestone" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* --- Left Column: Workload & Schedule (2/3 width) --- */}
                <div className="xl:col-span-2 space-y-8">
                    
                    {/* Workload Chart */}
                    <div className="bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart2 className="w-5 h-5 text-slate-900 dark:text-gray-200" />
                            <h2 className="text-lg font-bold text-slate-900 dark:text-gray-200">Project Workload</h2>
                        </div>
                        <div className="h-[280px]">
                            {typeof window !== 'undefined' && (
                                <Chart options={chartConfig.options} series={chartConfig.series} type="area" height="100%" />
                            )}
                        </div>
                    </div>

                    {/* Project Schedule List */}
                    <section>
                        <SectionHeader title="Active Schedule" link="/employee/calendar" icon={Clock} />
                        <div className="grid gap-3">
                            {summaryData.projects.slice(0, 4).map((project) => (
                                <div key={project.id} className="group flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-xl hover:border-slate-300 dark:hover:border-gray-600 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-gray-700 flex items-center justify-center font-bold text-slate-400 dark:text-gray-300 group-hover:bg-black dark:group-hover:bg-gray-600 group-hover:text-white transition-colors">
                                            {project.name[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-gray-200">{project.name}</h4>
                                            <p className="text-xs text-slate-500 dark:text-gray-400">Client: {project.clientName || 'Internal'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase leading-none mb-1">Deadline</p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-gray-200">{formatDate(project.minDate)}</p>
                                        </div>
                                        <StatusBadge status={project.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* --- Right Column: Tasks & Financials (1/3 width) --- */}
                <div className="space-y-8">
                    
                    {/* Tasks Card */}
                    <div className="bg-slate-50 dark:bg-gray-800 rounded-2xl p-6 border border-slate-100 dark:border-gray-700">
                        <SectionHeader title="Priority Tasks" link="/employee/task" icon={CheckCircle2} />
                        <div className="space-y-3 mt-4">
                            {summaryData.tasks.length > 0 ? summaryData.tasks.slice(0, 6).map((task) => (
                                <div key={task.id} className="bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-slate-200/60 dark:border-gray-700 shadow-sm flex flex-col gap-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-sm font-bold text-slate-800 dark:text-gray-200 leading-tight line-clamp-2">{task.title}</p>
                                        <StatusBadge status={task.status} />
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] font-medium text-slate-400 dark:text-gray-400 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {formatDate(task.due_date)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setStatusTask(task)}
                                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            <ClipboardEdit className="h-3.5 w-3.5" />
                                            Update
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center py-10 text-slate-400 dark:text-gray-400 text-sm italic">No pending tasks</p>
                            )}
                        </div>
                    </div>

                    {/* Small Salary/Wallet Card */}
                    <div className="bg-black dark:bg-gray-800 text-white dark:text-gray-200 rounded-2xl p-6 shadow-xl border border-transparent dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <Wallet className="w-6 h-6 text-slate-400 dark:text-gray-400" />
                            <span className="text-[10px] font-bold bg-slate-800 dark:bg-gray-700 px-2 py-1 rounded">FINANCIAL SUMMARY</span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-slate-400 dark:text-gray-400 text-xs uppercase tracking-widest">Total Paid Out</p>
                                <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
                            </div>
                            <div className="pt-4 border-t border-slate-800 dark:border-gray-700 flex justify-between items-center">
                                <div>
                                    <p className="text-slate-400 dark:text-gray-400 text-[10px] uppercase">Pending Invoice</p>
                                    <p className="text-lg font-semibold text-rose-400">{formatCurrency(salaryBalance)}</p>
                                </div>
                                <Link href="/employee/expense" className="p-2 bg-white dark:bg-gray-200 rounded-full text-black hover:scale-110 transition-transform">
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboardPage;
