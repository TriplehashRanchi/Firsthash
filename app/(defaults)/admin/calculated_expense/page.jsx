'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
    Bot,
    CalendarDays,
    CircleDollarSign,
    Loader2,
    RefreshCcw,
    Search,
    TrendingDown,
    TrendingUp,
    WalletCards,
} from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatCompactCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(Number(value || 0));

const today = () => new Date().toISOString().slice(0, 10);

function getDefaultDateRange(granularity) {
    const now = new Date();
    const end = today();
    const start = new Date(now);
    if (granularity === 'yearly') {
        start.setFullYear(now.getFullYear() - 4, 0, 1);
    } else {
        start.setMonth(now.getMonth() - 11, 1);
    }
    return {
        dateFrom: start.toISOString().slice(0, 10),
        dateTo: end,
    };
}

function getPresetRange(preset, granularity) {
    const now = new Date();
    const currentYear = now.getFullYear();

    switch (preset) {
        case '30d': {
            const start = new Date(now);
            start.setDate(now.getDate() - 29);
            return { dateFrom: start.toISOString().slice(0, 10), dateTo: today() };
        }
        case '90d': {
            const start = new Date(now);
            start.setDate(now.getDate() - 89);
            return { dateFrom: start.toISOString().slice(0, 10), dateTo: today() };
        }
        case '12m':
            return getDefaultDateRange('monthly');
        case 'thisYear':
            return { dateFrom: `${currentYear}-01-01`, dateTo: today() };
        case 'lastYear':
            return { dateFrom: `${currentYear - 1}-01-01`, dateTo: `${currentYear - 1}-12-31` };
        case '5y':
            return getDefaultDateRange('yearly');
        default:
            return getDefaultDateRange(granularity);
    }
}

async function getAuthHeaders() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        throw new Error('Please sign in again to continue.');
    }
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
}

function mergeTrendRows(trends = {}) {
    const map = new Map();

    const upsert = (row, extra) => {
        if (!row?.periodKey) return;
        const existing = map.get(row.periodKey) || {
            periodKey: row.periodKey,
            periodLabel: row.periodLabel || row.periodKey,
            receivedRevenue: 0,
            pendingRevenue: 0,
            projectExpense: 0,
            personalExpense: 0,
            salaryExpense: 0,
            freelancerExpense: 0,
        };
        map.set(row.periodKey, { ...existing, ...extra });
    };

    (trends.revenueRows || []).forEach((row) =>
        upsert(row, {
            periodLabel: row.periodLabel,
            receivedRevenue: Number(row.receivedRevenue || 0),
            pendingRevenue: Number(row.pendingRevenue || 0),
        })
    );
    (trends.projectExpenseRows || []).forEach((row) =>
        upsert(row, { projectExpense: Number(row.projectExpense || 0) })
    );
    (trends.personalExpenseRows || []).forEach((row) =>
        upsert(row, { personalExpense: Number(row.personalExpense || 0) })
    );
    (trends.salaryExpenseRows || []).forEach((row) =>
        upsert(row, { salaryExpense: Number(row.salaryExpense || 0) })
    );
    (trends.freelancerExpenseRows || []).forEach((row) =>
        upsert(row, { freelancerExpense: Number(row.freelancerExpense || 0) })
    );

    return Array.from(map.values())
        .sort((a, b) => a.periodKey.localeCompare(b.periodKey))
        .map((row) => {
            const totalSpend =
                row.projectExpense + row.personalExpense + row.salaryExpense + row.freelancerExpense;
            return {
                ...row,
                totalSpend,
                totalProfit: row.receivedRevenue - totalSpend,
            };
        });
}

function buildAiInsights(summary, trendData, projectPerformance) {
    if (!summary) return [];

    const totalRevenue = Number(summary.totalReceivedRevenue || 0);
    const totalSpend = Number(summary.totalSpend || 0);
    const totalProfit = Number(summary.totalProfit || 0);
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const spendMix = [
        { label: 'Project expenses', value: Number(summary.totalProjectExpense || 0) },
        { label: 'Personal expenses', value: Number(summary.totalPersonalExpense || 0) },
        { label: 'Salary payouts', value: Number(summary.totalSalaryExpense || 0) },
        { label: 'Freelancer payouts', value: Number(summary.totalFreelancerExpense || 0) },
    ].sort((a, b) => b.value - a.value);

    const latest = trendData[trendData.length - 1];
    const previous = trendData[trendData.length - 2];
    const latestDelta = latest && previous ? latest.totalProfit - previous.totalProfit : null;
    const bestProject = (projectPerformance || [])[0];

    return [
        {
            title: 'AI Margin Read',
            body:
                totalRevenue > 0
                    ? `Current profit margin is ${margin.toFixed(1)}%. ${margin >= 25 ? 'Healthy operating spread.' : margin >= 10 ? 'Margin is positive but watch costs.' : 'Margin is tight and needs attention.'}`
                    : 'No paid revenue in the selected range yet, so profit margin is not meaningful.',
        },
        {
            title: 'AI Spend Driver',
            body:
                spendMix[0]?.value > 0
                    ? `${spendMix[0].label} are the largest cost block at ${formatCurrency(spendMix[0].value)}. This is the first area to optimize if you want to improve profit.`
                    : 'No cost driver detected yet in the selected range.',
        },
        {
            title: 'AI Momentum',
            body:
                latest && previous
                    ? `${latest.periodLabel} profit ${latestDelta >= 0 ? 'improved' : 'dropped'} by ${formatCurrency(Math.abs(latestDelta))} versus ${previous.periodLabel}.`
                    : 'Need at least two periods of data to calculate momentum.',
        },
        {
            title: 'AI Project Signal',
            body: bestProject
                ? `${bestProject.projectName} is currently the strongest project in this view with ${formatCurrency(bestProject.projectProfit)} profit.`
                : 'No project profitability signal available yet.',
        },
    ];
}

export default function CalculatedExpensePage() {
    const { company, currentUser, loading: authLoading } = useAuth();
    const [granularity, setGranularity] = useState('monthly');
    const [filters, setFilters] = useState(() => getDefaultDateRange('monthly'));
    const [preset, setPreset] = useState('12m');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [projectSearch, setProjectSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);

    const fetchOverview = useCallback(async (mode = 'load') => {
        try {
            if (mode === 'refresh') {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError('');

            const headers = await getAuthHeaders();
            const response = await axios.get(`${API_URL}/api/calculated-expense/overview`, {
                headers,
                params: {
                    granularity,
                    date_from: filters.dateFrom,
                    date_to: filters.dateTo,
                    top_projects_limit: 12,
                },
            });

            setData(response.data);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to load calculated expense dashboard.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters.dateFrom, filters.dateTo, granularity]);

    useEffect(() => {
        if (!authLoading && currentUser) {
            fetchOverview();
        }
        if (!authLoading && !currentUser) {
            setLoading(false);
            setError('Please sign in to view this page.');
        }
    }, [authLoading, currentUser, fetchOverview]);

    useEffect(() => {
        if (!autoRefresh || !currentUser) return undefined;
        const timer = setInterval(() => {
            fetchOverview('refresh');
        }, 60000);
        return () => clearInterval(timer);
    }, [autoRefresh, currentUser, fetchOverview]);

    const summary = data?.summary;
    const trendData = useMemo(() => mergeTrendRows(data?.trends), [data]);
    const aiInsights = useMemo(
        () => buildAiInsights(summary, trendData, data?.projectPerformance || []),
        [summary, trendData, data]
    );

    const filteredProjects = useMemo(() => {
        const q = projectSearch.trim().toLowerCase();
        const items = data?.projectPerformance || [];
        if (!q) return items;
        return items.filter((item) =>
            [item.projectName, item.clientName]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(q))
        );
    }, [data, projectSearch]);

    const spendMix = useMemo(() => {
        if (!summary) return [];
        return [
            { name: 'Project', value: Number(summary.totalProjectExpense || 0) },
            { name: 'Personal', value: Number(summary.totalPersonalExpense || 0) },
            { name: 'Salary', value: Number(summary.totalSalaryExpense || 0) },
            { name: 'Freelancer', value: Number(summary.totalFreelancerExpense || 0) },
        ];
    }, [summary]);

    const handlePresetChange = (value) => {
        setPreset(value);
        const nextGranularity = value === '5y' ? 'yearly' : granularity;
        if (value === '5y' && granularity !== 'yearly') {
            setGranularity('yearly');
        }
        setFilters(getPresetRange(value, nextGranularity));
    };

    const handleGranularityChange = (next) => {
        setGranularity(next);
        setPreset(next === 'yearly' ? '5y' : '12m');
        setFilters(getDefaultDateRange(next));
    };

    const summaryCards = [
        {
            label: 'Received Revenue',
            value: summary?.totalReceivedRevenue,
            tone: 'from-emerald-500 via-green-500 to-teal-500',
            icon: CircleDollarSign,
        },
        {
            label: 'Total Spend',
            value: summary?.totalSpend,
            tone: 'from-rose-500 via-orange-500 to-amber-500',
            icon: WalletCards,
        },
        {
            label: 'Profit',
            value: summary?.totalProfit,
            tone: summary?.totalProfit >= 0 ? 'from-sky-500 via-cyan-500 to-blue-600' : 'from-red-500 via-rose-500 to-pink-600',
            icon: summary?.totalProfit >= 0 ? TrendingUp : TrendingDown,
        },
        {
            label: 'Pending Revenue',
            value: summary?.totalPendingRevenue,
            tone: 'from-violet-500 via-fuchsia-500 to-pink-500',
            icon: CalendarDays,
        },
    ];

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_24%),linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(241,245,249,1)_100%)] p-4 sm:p-6 lg:p-8 dark:bg-none">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <ul className="mb-3 flex space-x-2 rtl:space-x-reverse">
                        <li>
                            <Link href="/admin/dashboard" className="text-blue-600 hover:underline dark:text-blue-400">
                                Dashboard
                            </Link>
                        </li>
                        <li className="text-gray-500 before:mr-2 before:content-['/'] dark:text-gray-500">
                            <span className="text-gray-600 dark:text-gray-400">Calculated Expense</span>
                        </li>
                    </ul>

                    <div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_20px_80px_-30px_rgba(15,23,42,0.35)] backdrop-blur xl:p-8 dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                            <div className="max-w-3xl">
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                                    <Bot className="h-3.5 w-3.5" />
                                    AI Finance Console
                                </div>
                                <h1 className="text-3xl font-black tracking-tight text-slate-900 xl:text-5xl dark:text-white">
                                    Calculated Expense Intelligence
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 xl:text-base dark:text-slate-300">
                                    Real-time admin finance view across project earnings, project expenses, personal expenses, salary payouts, freelancer payouts, and overall profit.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px]">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Company</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-white">{company?.name || 'Loading...'}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Last Updated</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-white">
                                        {data?.generatedAt ? new Date(data.generatedAt).toLocaleString('en-IN') : 'Waiting...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6 rounded-[28px] border border-slate-200/70 bg-white/90 p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => handleGranularityChange('monthly')}
                                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${granularity === 'monthly' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
                            >
                                Monthly View
                            </button>
                            <button
                                type="button"
                                onClick={() => handleGranularityChange('yearly')}
                                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${granularity === 'yearly' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
                            >
                                Yearly View
                            </button>
                            <select
                                value={preset}
                                onChange={(e) => handlePresetChange(e.target.value)}
                                className="form-select min-w-[140px]"
                            >
                                <option value="30d">Last 30 days</option>
                                <option value="90d">Last 90 days</option>
                                <option value="12m">Last 12 months</option>
                                <option value="thisYear">This year</option>
                                <option value="lastYear">Last year</option>
                                <option value="5y">Last 5 years</option>
                            </select>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                                max={filters.dateTo}
                                className="form-input"
                            />
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                                min={filters.dateFrom}
                                max={today()}
                                className="form-input"
                            />
                            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                <input
                                    type="checkbox"
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                    className="h-4 w-4"
                                />
                                Auto refresh
                            </label>
                            <button
                                type="button"
                                onClick={() => fetchOverview('refresh')}
                                className="btn btn-outline-primary flex items-center justify-center gap-2"
                            >
                                {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {error ? <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

                {loading ? (
                    <div className="flex min-h-[320px] items-center justify-center rounded-[32px] border border-slate-200 bg-white/90 text-slate-500 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)]">
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Building finance intelligence...
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                            {summaryCards.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <div key={card.label} className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)]">
                                        <div className={`h-2 bg-gradient-to-r ${card.tone}`} />
                                        <div className="p-5">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                                                <Icon className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">
                                                {formatCurrency(card.value)}
                                            </p>
                                            <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                                                {formatCompactCurrency(card.value)} in compact view
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
                            <div className="rounded-[32px] border border-slate-200/70 bg-white/90 p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)]">
                                <div className="mb-5">
                                    <h2 className="text-xl font-bold text-slate-900">Revenue vs Spend vs Profit</h2>
                                    <p className="mt-1 text-sm text-slate-500">Track operating momentum across the selected periods.</p>
                                </div>
                                <div className="h-[360px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData}>
                                            <defs>
                                                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.04} />
                                                </linearGradient>
                                                <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.04} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="periodLabel" tick={{ fontSize: 12 }} />
                                            <YAxis tickFormatter={formatCompactCurrency} tick={{ fontSize: 12 }} />
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                            <Legend />
                                            <Area type="monotone" dataKey="receivedRevenue" name="Received Revenue" stroke="#10b981" fill="url(#revFill)" strokeWidth={3} />
                                            <Area type="monotone" dataKey="totalSpend" name="Total Spend" stroke="#f97316" fill="url(#spendFill)" strokeWidth={3} />
                                            <Area type="monotone" dataKey="totalProfit" name="Profit" stroke="#2563eb" fillOpacity={0} strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="rounded-[32px] border border-slate-200/70 bg-white/90 p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)]">
                                <div className="mb-5">
                                    <h2 className="text-xl font-bold text-slate-900">Expense Mix</h2>
                                    <p className="mt-1 text-sm text-slate-500">See which cost blocks are driving burn.</p>
                                </div>
                                <div className="h-[360px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={spendMix}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                            <YAxis tickFormatter={formatCompactCurrency} tick={{ fontSize: 12 }} />
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                            <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#0f172a" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[32px] border border-slate-200/70 bg-white/90 p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)]">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">AI Highlights</h2>
                                    <p className="mt-1 text-sm text-slate-500">Generated from the live finance metrics on this page.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                                {aiInsights.map((item) => (
                                    <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                        <p className="text-sm font-bold text-slate-900">{item.title}</p>
                                        <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[32px] border border-slate-200/70 bg-white/90 p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)]">
                            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Project Profitability</h2>
                                    <p className="mt-1 text-sm text-slate-500">Revenue vs direct project spend and freelancer billed cost.</p>
                                </div>
                                <div className="relative w-full lg:w-[320px]">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={projectSearch}
                                        onChange={(e) => setProjectSearch(e.target.value)}
                                        placeholder="Search project or client..."
                                        className="form-input pl-10"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50">
                                        <tr className="text-left text-slate-600">
                                            <th className="p-3 font-semibold">Project</th>
                                            <th className="p-3 font-semibold">Client</th>
                                            <th className="p-3 font-semibold">Revenue</th>
                                            <th className="p-3 font-semibold">Project Expense</th>
                                            <th className="p-3 font-semibold">Freelancer Cost</th>
                                            <th className="p-3 font-semibold">Total Spend</th>
                                            <th className="p-3 font-semibold">Profit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProjects.length ? (
                                            filteredProjects.map((project) => (
                                                <tr key={project.projectId} className="border-t border-slate-200">
                                                    <td className="p-3 font-medium text-slate-900">{project.projectName}</td>
                                                    <td className="p-3 text-slate-600">{project.clientName || '-'}</td>
                                                    <td className="p-3 font-semibold text-emerald-600">{formatCurrency(project.receivedRevenue)}</td>
                                                    <td className="p-3 text-slate-700">{formatCurrency(project.projectExpense)}</td>
                                                    <td className="p-3 text-slate-700">{formatCurrency(project.freelancerBilledCost)}</td>
                                                    <td className="p-3 text-slate-700">{formatCurrency(project.totalProjectSpend)}</td>
                                                    <td className={`p-3 font-semibold ${Number(project.projectProfit) >= 0 ? 'text-sky-600' : 'text-rose-600'}`}>
                                                        {formatCurrency(project.projectProfit)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="p-12 text-center text-slate-500">
                                                    No project records match the current filters.
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
        </div>
    );
}
