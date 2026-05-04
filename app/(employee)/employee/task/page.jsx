// app/(employee)/task/page.jsx
'use client';

import React, { useEffect, useMemo, useState, useCallback, Fragment } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { createPortal } from 'react-dom';
import { Eye, X, Loader2, CalendarDays, ChevronDown, ClipboardEdit, PlayCircle, FolderKanban, Tag, Mic, Circle, CheckCircle2, Info, Phone, MapPin, UserRound, Search, LayoutGrid, Table2 } from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/* ----------------------------- Helpers & UI Components ----------------------------- */
// ✅ Replace your existing getAuthHeaders function with this:

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

const getAuthHeaders = async (forceRefresh = false) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return {};

    const token = await user.getIdToken(forceRefresh);
    return {
        Authorization: `Bearer ${token}`,
    };
};

const formatDate = (d) => {
    if (!d) return '—';
    try {
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return d;
    }
};

const formatTime = (time) => {
    if (!time) return '';
    return String(time).slice(0, 5);
};

const statusLabel = (s) => {
    if (!s) return 'To Do';
    return String(s)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
};

const StatusBadge = ({ status }) => {
    const base = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize';
    const s_lower = (status || 'to_do').toLowerCase();
    let style = 'bg-gray-100 text-gray-800'; // Default
    if (s_lower.includes('progress')) style = 'bg-blue-100 text-blue-800';
    if (s_lower.includes('completed')) style = 'bg-green-100 text-green-800';
    if (s_lower.includes('rejected')) style = 'bg-rose-100 text-rose-800';
    if (s_lower.includes('finalize')) style = 'bg-yellow-100 text-yellow-800';

    return <span className={`${base} ${style}`}>{statusLabel(status)}</span>;
};

const Loading = ({ text = 'Loading...' }) => (
    <div className="w-full flex items-center justify-center py-16 text-gray-600">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        <span>{text}</span>
    </div>
);

const ErrorBox = ({ msg }) => <div className="w-full rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-4 py-3 text-sm">{msg}</div>;

const Drawer = ({ open, onClose, children, title }) => {
    if (typeof document === 'undefined') return null;

    return createPortal(
        <>
        <div className={`fixed inset-0 z-[4990] bg-black/20  transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
        <div
            className={`fixed top-0 right-0 z-[5000] h-full w-full sm:w-[520px] bg-white dark:bg-gray-800 dark:text-gray-200 shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold text-gray-900 dark:text-gray-200">{title}</h3>
                <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-56px)]">{children}</div>
        </div>
        </>,
        document.body
    );
};

/* ----------------------------- NEW: Update Status Modal ----------------------------- */
const UpdateStatusModal = ({ isOpen, onClose, task, customStatuses = [], onSubmit }) => {
    const [selectedStatus, setSelectedStatus] = useState('');
    const [newStatusText, setNewStatusText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const predefined = ['in_progress', 'completed', 'finalize', ...customStatuses];
        if (predefined.includes(task?.status)) {
            setSelectedStatus(task.status);
            setNewStatusText('');
        } else {
            setSelectedStatus('other');
            setNewStatusText(task?.status === 'to_do' ? '' : task?.status || '');
        }
    }, [isOpen, task, customStatuses]);

    const handleSubmit = async () => {
        const finalStatus = selectedStatus === 'other' ? newStatusText.trim() : selectedStatus;
        if (!finalStatus) {
            toast.error('Please select or enter a status.');
            return;
        }
        setIsSubmitting(true);
        await onSubmit(task, finalStatus);
        setIsSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-gray-900 dark:bg-opacity-30 flex justify-center items-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b">
                    <h3 className="font-semibold dark:text-gray-200 text-gray-800">Update Task Status</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">Task: {task?.title}</p>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm dark:text-gray-300 font-medium text-gray-700 mb-1">Choose a status</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full p-2 border dark:bg-gray-700 dark:text-gray-200 rounded-md bg-white text-sm"
                        >
                            <option value="in_progress">In Progress</option>
                            <option value="finalize">Finalize</option>
                            {customStatuses.length > 0 && <option disabled>--- Custom Statuses ---</option>}
                            {customStatuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                            <option value="other">Other (write a new one)...</option>
                        </select>
                    </div>
                    {selectedStatus === 'other' && (
                        <div>
                            <label className="block text-sm dark:text-gray-300 font-medium text-gray-700 mb-1">New status message</label>
                            <input
                                type="text"
                                value={newStatusText}
                                onChange={(e) => setNewStatusText(e.target.value)}
                                placeholder="e.g., Awaiting client feedback"
                                className="w-full p-2 border dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm"
                                autoFocus
                            />
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-100">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 min-w-[120px]"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isSubmitting ? 'Saving...' : 'Save Status'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ✅ NEW: On-Page Audio Player Modal
const AudioPlayerModal = ({ isOpen, onClose, url, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-gray-900 dark:bg-opacity-30 flex justify-center items-center p-4 z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-3">
                    <div className="font-semibold text-gray-800">
                        <Mic className="inline-block w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                        Voice Note
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full dark:text-gray-500 hover:bg-gray-100">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">Task: {title}</p>
                <audio key={url} controls autoPlay className="w-full">
                    <source src={url} type="audio/webm" />
                    Your browser does not support the audio element.
                </audio>
            </div>
        </div>
    );
};

// This is the new modal for showing the full task details
const TaskDetailsModal = ({ isOpen, onClose, task }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-gray-900 dark:bg-opacity-30 flex justify-center items-center p-4 z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-semibold dark:text-gray-200 text-gray-800">Task Details</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">TITLE</label>
                        <p className="text-gray-800 dark:text-gray-200">{task.title}</p>
                    </div>
                    {task.description && (
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">DESCRIPTION</label>
                            <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{task.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PriorityPill = ({ priority }) => {
    const p = (priority || 'medium').toLowerCase();
    const styles = {
        high: 'bg-rose-100 text-rose-700',
        medium: 'bg-amber-100 text-amber-700',
        low: 'bg-teal-100 text-teal-700',
    };
    return <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[p] || 'bg-gray-100 text-gray-700'}`}>{p}</div>;
};

const ProjectDetailCard = ({ label, value, icon: Icon }) => (
    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {Icon && <Icon className="h-4 w-4" />}
            {label}
        </div>
        <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{value || '—'}</div>
    </div>
);

const ContactLine = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/60">
        <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
        <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
            <div className="break-words text-sm font-medium text-gray-800 dark:text-gray-200">{value || '—'}</div>
        </div>
    </div>
);

const EmptyProjectDetail = ({ children }) => (
    <div className="rounded-xl border border-dashed border-gray-200 py-6 text-center text-sm italic text-gray-400 dark:border-gray-700 dark:text-gray-500">
        {children}
    </div>
);

// This is the new, self-contained Table component
const TaskTable = ({ tasks, onUpdateStatusClick, onPlayAudio, onShowDetails }) => {
    if (!tasks || tasks.length === 0) {
        return null;
    }

    return (
        <div className="overflow-x-auto rounded-lg border bg-white dark:bg-gray-800 shadow-sm">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-50/70 text-gray-600">
                    <tr>
                        <th className="px-4 py-3 dark:text-gray-200 text-left font-semibold w-[30%]">Task</th>
                        <th className="px-4 py-3 dark:text-gray-200 text-left font-semibold">Project</th>
                        <th className="px-4 py-3 dark:text-gray-200 text-left font-semibold">Due Date</th>
                        <th className="px-4 py-3 dark:text-gray-200 text-left font-semibold">Status</th>
                        <th className="px-4 py-3 dark:text-gray-200 text-left font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {tasks.map((task) => {
                        const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                        const isLongTitle = task.title.length > 70; // Check if the title is long

                        return (
                            <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-3 align-top">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{isLongTitle ? `${task.title.substring(0, 70)}...` : task.title}</span>
                                        {isLongTitle && (
                                            <button onClick={() => onShowDetails(task)} className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 flex-shrink-0" title="View full details">
                                                <Info className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 align-top whitespace-nowrap">
                                    <div className="text-gray-600 dark:text-gray-200">{task.project_name || 'No Project'}</div>
                                </td>
                                <td className={`px-4 py-3 align-top whitespace-nowrap ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-gray-700 dark:text-gray-200'}`}>
                                    {formatDate(task.due_date)}
                                </td>
                                <td className="px-4 py-3 align-top whitespace-nowrap">
                                    <StatusBadge status={task.status} />
                                </td>
                                <td className="px-4 py-3 align-top whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onUpdateStatusClick(task)}
                                            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                                            title="Update Status"
                                        >
                                            <ClipboardEdit className="w-4 h-4" />
                                        </button>
                                        {task.voice_note_url && (
                                            <button
                                                onClick={() => onPlayAudio(task)}
                                                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-green-100 hover:text-green-600 transition-colors"
                                                title="Play voice note"
                                            >
                                                <PlayCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

/* ------------------------------- Main Page Component ------------------------------ */
export default function TaskPage() {
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [customStatuses, setCustomStatuses] = useState([]);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('overdue');
    const [taskView, setTaskView] = useState('table');
    const [projectView, setProjectView] = useState('table');
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [details, setDetails] = useState(null);
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [taskToUpdate, setTaskToUpdate] = useState(null);
    // ✅ NEW: State for the audio player modal
    const [audioPlayerData, setAudioPlayerData] = useState({ isOpen: false, url: '', title: '' });
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [taskForDetails, setTaskForDetails] = useState(null);

    // 🔍 Inside your TaskPage component, update fetchAll() like this:

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setErr('');

            const auth = getAuth();
            if (!auth.currentUser) {
                setErr('Please sign in to view your work.');
                setLoading(false);
                return;
            }

            const tRes = await makeRequestWithRetry((headers) =>
                axios.get(`${API_URL}/api/employee/tasks/assigned`, { headers })
            );

            setTasks(Array.isArray(tRes.data) ? tRes.data : []);
            setLoading(false);

            makeRequestWithRetry((headers) =>
                axios.get(`${API_URL}/api/employee/projects/assigned`, { headers })
            )
                .then((pRes) => setProjects(Array.isArray(pRes.data) ? pRes.data : []))
                .catch((e) => {
                    console.error('Projects fetch failed:', e);
                });

            makeRequestWithRetry((headers) =>
                axios.get(`${API_URL}/api/employee/tasks/custom-statuses`, { headers })
            )
                .then((csRes) => setCustomStatuses(Array.isArray(csRes.data) ? csRes.data : []))
                .catch((e) => {
                    console.error('Custom statuses fetch failed:', e);
                });
        } catch (e) {
            console.error('fetchAll error:', e);

            if (e?.response?.status === 401) {
                setErr('Session expired. Please login again.');
            } else if (e?.request) {
                setErr('Server not reachable. Check backend or API URL.');
            } else {
                setErr('Failed to load your work.');
            }

            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const auth = getAuth();
        const unsub = auth.onAuthStateChanged((u) => {
            if (u) fetchAll();
            else {
                setLoading(false);
                setErr('Please sign in to view your work.');
            }
        });
        return () => unsub();
    }, [fetchAll]);

    const handleShowDetails = (task) => {
        setTaskForDetails(task);
        setIsDetailsModalOpen(true);
    };
    const handleCloseDetails = () => {
        setTaskForDetails(null);
        setIsDetailsModalOpen(false);
    };

    // 🔍 Replace your handleUpdateTaskStatus function with this:

    const handleUpdateTaskStatus = async (task, newStatus) => {
        const toastId = toast.loading('Updating status...');
        const oldStatus = task.status;

        try {
            setTasks((prev) =>
                prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
            );

            await makeRequestWithRetry((headers) =>
                axios.put(
                    `${API_URL}/api/employee/tasks/${task.id}/status`,
                    { status: newStatus },
                    { headers }
                )
            );

            toast.success('Status updated!', { id: toastId });
        } catch (e) {
            console.error(e);

            setTasks((prev) =>
                prev.map((t) => (t.id === task.id ? { ...t, status: oldStatus } : t))
            );

            if (e?.response?.status === 401) {
                toast.error('Session expired. Please login again.', { id: toastId });
            } else {
                toast.error('Failed to update.', { id: toastId });
            }
        }
    };

    const handleOpenStatusModal = (task) => {
        setTaskToUpdate(task);
        setIsStatusModalOpen(true);
    };
    const handleCloseStatusModal = () => {
        setTaskToUpdate(null);
        setIsStatusModalOpen(false);
    };

    // ✅ NEW: Handlers for the audio player
    const handlePlayAudio = (task) => {
        setAudioPlayerData({ isOpen: true, url: task.voice_note_url, title: task.title });
    };
    const handleCloseAudioPlayer = () => {
        setAudioPlayerData({ isOpen: false, url: '', title: '' });
    };

    const groupedTasks = useMemo(() => {
        const s = search.trim().toLowerCase();
        const filtered = tasks.filter((t) => {
            const text = `${t.title || ''} ${t.description || ''} ${t.project_name || ''}`.toLowerCase();
            return s ? text.includes(s) : true;
        });

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - today.getDay()) + 1); // End of Sunday

        const groups = { overdue: [], today: [], week: [], upcoming: [] };
        for (const task of filtered) {
            if (!task.due_date) {
                groups.upcoming.push(task);
                continue;
            }
            const dueDate = new Date(task.due_date);
            if (dueDate < today) groups.overdue.push(task);
            else if (dueDate.toDateString() === today.toDateString()) groups.today.push(task);
            else if (dueDate <= endOfWeek) groups.week.push(task);
            else groups.upcoming.push(task);
        }
        return groups;
    }, [tasks, search]);

    const filteredProjects = useMemo(() => {
        const s = search.trim().toLowerCase();
        return projects.filter((p) => {
            const text = `${p.name || ''} ${p.clientName || ''}`.toLowerCase();
            return s ? text.includes(s) : true;
        });
    }, [projects, search]);

    const overdueTasks = groupedTasks.overdue;

    const openProjectDetails = async (projectId) => {
        setActiveProjectId(projectId);
        setDetails(null);
        setDetailsLoading(true);
        setDetailsOpen(true);

        try {
            const pr = await makeRequestWithRetry((headers) =>
                axios.get(`${API_URL}/api/employee/projects/${projectId}/view`, { headers })
            );

            setDetails(pr.data);
        } catch (e) {
            console.error('Project details fetch failed:', e);
            setDetails(null);
        } finally {
            setDetailsLoading(false);
        }
    };

    const breadcrumbLinkStyles = 'text-blue-600 dark:text-blue-400 hover:underline';
    const breadcrumbSeparatorStyles = "before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-gray-500";
    const breadcrumbCurrentPageStyles = 'text-gray-600 dark:text-gray-400';

    return (
        <div className="p-1 sm:p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Toaster position="top-right" />
            <UpdateStatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal} task={taskToUpdate} customStatuses={customStatuses} onSubmit={handleUpdateTaskStatus} />
            <AudioPlayerModal {...audioPlayerData} onClose={handleCloseAudioPlayer} />
            <TaskDetailsModal isOpen={isDetailsModalOpen} onClose={handleCloseDetails} task={taskForDetails} />

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <ul className="mb-2 flex space-x-1 rtl:space-x-reverse">
                        <li>
                            <Link href="/dashboard" className={breadcrumbLinkStyles}>
                                Dashboard
                            </Link>
                        </li>
                        <li className={breadcrumbSeparatorStyles}>
                            <span className={breadcrumbCurrentPageStyles}>My Work</span>
                        </li>
                    </ul>
                    <p className="text-sm text-gray-500 dark:text-gray-200">Everything you’re assigned to. Update your task status here.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    {[
                        { key: 'overdue', label: 'Overdue', count: overdueTasks.length },
                        { key: 'projects', label: 'Assigned Projects', count: filteredProjects.length },
                    ].map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setActiveTab(item.key)}
                            className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
                                activeTab === item.key
                                    ? 'border-gray-900 bg-gray-900 text-white shadow-sm dark:border-white dark:bg-white dark:text-gray-950'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                        >
                            {item.label}
                            <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === item.key ? 'bg-white/15' : 'bg-gray-100 dark:bg-gray-700'}`}>{item.count}</span>
                        </button>
                    ))}
                </div>
            </div>

            {loading && <Loading text="Loading your work..." />}
            {!loading && err && <ErrorBox msg={err} />}

            {!loading && !err && activeTab === 'overdue' && (
                <section className="space-y-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Overdue</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tasks that need attention first.</p>
                        </div>
                        <span className="w-fit rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 dark:bg-rose-900/20 dark:text-rose-300">
                            {overdueTasks.length} pending
                        </span>
                    </div>
                    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                            <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search overdue tasks..."
                                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-200"
                            />
                        </div>
                        <div className="inline-flex w-fit rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
                            <button
                                type="button"
                                onClick={() => setTaskView('table')}
                                className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                                    taskView === 'table'
                                        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                            >
                                <Table2 className="h-4 w-4" />
                                Table
                            </button>
                            <button
                                type="button"
                                onClick={() => setTaskView('grid')}
                                className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                                    taskView === 'grid'
                                        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                            >
                                <LayoutGrid className="h-4 w-4" />
                                Cards
                            </button>
                        </div>
                    </div>
                    {taskView === 'grid' ? (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {overdueTasks.length === 0 && (
                                <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 md:col-span-2 xl:col-span-3">
                                    No overdue tasks found.
                                </div>
                            )}
                            {overdueTasks.map((task) => {
                                const title = task.title || 'Untitled task';
                                const isLongTitle = title.length > 90;

                                return (
                                    <div
                                        key={task.id}
                                        className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="line-clamp-2 text-base font-bold text-gray-900 dark:text-gray-100">
                                                    {isLongTitle ? `${title.substring(0, 90)}...` : title}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{task.project_name || 'No Project'}</p>
                                            </div>
                                            <StatusBadge status={task.status} />
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                            <div className="rounded-lg bg-rose-50 p-3 dark:bg-rose-900/20">
                                                <p className="text-xs font-semibold uppercase text-rose-500 dark:text-rose-300">Due Date</p>
                                                <p className="mt-1 font-medium text-rose-600 dark:text-rose-300">{formatDate(task.due_date)}</p>
                                            </div>
                                            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/60">
                                                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Status</p>
                                                <p className="mt-1 font-medium text-gray-800 dark:text-gray-200">{statusLabel(task.status)}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-sm dark:border-gray-700">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenStatusModal(task)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                                                    title="Update Status"
                                                >
                                                    <ClipboardEdit className="h-4 w-4" />
                                                    Update
                                                </button>
                                                {task.voice_note_url && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePlayAudio(task)}
                                                        className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-green-50 hover:text-green-600 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                                                        title="Play voice note"
                                                    >
                                                        <PlayCircle className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {isLongTitle && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleShowDetails(task)}
                                                    className="inline-flex items-center gap-1 font-semibold text-gray-900 transition hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                                                >
                                                    <Info className="h-4 w-4" />
                                                    Details
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : overdueTasks.length > 0 ? (
                        <TaskTable tasks={overdueTasks} onUpdateStatusClick={handleOpenStatusModal} onPlayAudio={handlePlayAudio} onShowDetails={handleShowDetails} />
                    ) : (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                            No overdue tasks found.
                        </div>
                    )}
                </section>
            )}

            {!loading && !err && activeTab === 'projects' && (
                <section className="space-y-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Assigned Projects</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Open a project to see only your assigned shoot plan and client location.</p>
                        </div>
                        <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                            {filteredProjects.length} projects
                        </span>
                    </div>
                    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                            <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search assigned projects..."
                                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-200"
                            />
                        </div>
                        <div className="inline-flex w-fit rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
                            <button
                                type="button"
                                onClick={() => setProjectView('table')}
                                className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                                    projectView === 'table'
                                        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                            >
                                <Table2 className="h-4 w-4" />
                                Table
                            </button>
                            <button
                                type="button"
                                onClick={() => setProjectView('grid')}
                                className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                                    projectView === 'grid'
                                        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                            >
                                <LayoutGrid className="h-4 w-4" />
                                Cards
                            </button>
                        </div>
                    </div>
                    {projectView === 'grid' ? (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {filteredProjects.length === 0 && (
                                <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 md:col-span-2 xl:col-span-3">
                                    No projects assigned to you.
                                </div>
                            )}
                            {filteredProjects.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => openProjectDetails(p.id)}
                                    className="group rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="truncate text-base font-bold text-gray-900 dark:text-gray-100">{p.name || 'Project'}</h3>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{p.clientName || 'Client not added'}</p>
                                        </div>
                                        <StatusBadge status={p.status} />
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/60">
                                            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Dates</p>
                                            <p className="mt-1 font-medium text-gray-800 dark:text-gray-200">
                                                {formatDate(p.minDate)} - {formatDate(p.maxDate)}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/60">
                                            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Shoots</p>
                                            <p className="mt-1 font-medium text-gray-800 dark:text-gray-200">{p.shoots ?? 0}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-sm dark:border-gray-700">
                                        <span className="text-gray-500 dark:text-gray-400">
                                            Deliverables {p.deliverablesCompleted ?? 0}/{p.deliverablesTotal ?? 0}
                                        </span>
                                        <span className="inline-flex items-center gap-1 font-semibold text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                                            <Eye className="h-4 w-4" />
                                            View
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                    <div className="overflow-x-auto rounded-lg border bg-white dark:bg-gray-800">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50  text-gray-600 dark:text-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Project</th>
                                    <th className="px-4 py-3 text-left font-medium">Client</th>
                                    <th className="px-4 py-3 text-left font-medium">Dates</th>
                                    <th className="px-4 py-3 text-left font-medium">Counts</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProjects.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            No projects assigned to you.
                                        </td>
                                    </tr>
                                )}
                                {filteredProjects.map((p) => (
                                    <tr key={p.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900 dark:text-gray-200">{p.name}</div>
                                        </td>
                                        <td className="px-4 py-3 dark:text-gray-200">{p.clientName || '—'}</td>
                                        <td className="px-4 py-3 dark:text-gray-200">
                                            <div>
                                                {formatDate(p.minDate)} — {formatDate(p.maxDate)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-200">
                                            <div>Shoots: {p.shoots ?? 0}</div>
                                            <div>
                                                Deliverables: {p.deliverablesCompleted ?? 0}/{p.deliverablesTotal ?? 0}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={p.status} />
                                        </td>
                                        <td className="px-4 py-3 dark:text-gray-200">
                                            <button
                                                onClick={() => openProjectDetails(p.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border hover:bg-gray-100"
                                                title="View details"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span className="text-sm">View</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    )}
                </section>
            )}

            {/* Drawer: project details */}
            <Drawer open={detailsOpen} onClose={() => setDetailsOpen(false)} title="Project Details">
                {!activeProjectId ? (
                    <div className="text-sm text-gray-500">No project selected.</div>
                ) : (
                    <>
                        {detailsLoading && <Loading text="Loading project details..." />}
                        {!detailsLoading && !details && <div className="text-sm text-gray-500 dark:text-gray-400">Couldn’t load project details.</div>}
                        {!detailsLoading && details && (
                            <div className="space-y-6">
                                <section>
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Project Brief</p>
                                            <h4 className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{details.projectName || details.name || 'Project'}</h4>
                                        </div>
                                        <StatusBadge status={details.projectStatus || details.status} />
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <ProjectDetailCard label="Client" value={details.clientName} icon={UserRound} />
                                        <ProjectDetailCard label="My Assigned Shoots" value={details?.shoots?.shootList?.length || 0} icon={CalendarDays} />
                                    </div>
                                </section>

                                <section>
                                    <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-200">Client Work Location</h4>
                                    <div className="space-y-2">
                                        <ContactLine icon={Phone} label="Phone" value={details.clientPhone || details.clients?.clientDetails?.phone} />
                                        <ContactLine icon={MapPin} label="Client Address" value={details.clientAddress || details.clients?.clientDetails?.address || 'Address not added. Please ask the manager before going to the shoot.'} />
                                        {(details.clientNotes || details.clients?.clientDetails?.notes) && <ContactLine icon={Info} label="Client Notes" value={details.clientNotes || details.clients?.clientDetails?.notes} />}
                                    </div>
                                </section>

                                {Array.isArray(details?.shoots?.shootList) && details.shoots.shootList.length > 0 && (
                                    <section>
                                        <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-200">My Assigned Shoot Plan</h4>
                                        <div className="space-y-3">
                                            {details.shoots.shootList.map((s) => (
                                                <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                        <div>
                                                            <div className="font-semibold text-gray-900 dark:text-gray-100">{s.title || 'Shoot'}</div>
                                                            <div className="mt-1 flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                                                <MapPin className="h-4 w-4" />
                                                                {s.city || 'Location not added'}
                                                            </div>
                                                        </div>
                                                        <div className="rounded-lg bg-gray-50 px-3 py-2 text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                                                            <CalendarDays className="mr-1 inline-block h-4 w-4 align-[-2px]" />
                                                            {formatDate(s.date)}
                                                            {s.time ? (
                                                                <>
                                                                    <span aria-hidden="true"> &middot; </span>
                                                                    {formatTime(s.time)}
                                                                </>
                                                            ) : null}
                                                        </div>
                                                    </div>

                                                    {Object.keys(s.selectedServices || {}).length > 0 && (
                                                        <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-700">
                                                            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">My assigned services</div>
                                                            <div className="space-y-2">
                                                                {Object.entries(s.selectedServices || {}).map(([serviceName, quantity]) => (
                                                                    <div key={serviceName} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/60">
                                                                        <div className="flex items-center justify-between gap-3">
                                                                            <span className="font-medium text-gray-800 dark:text-gray-200">{serviceName}</span>
                                                                            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">Need {quantity}</span>
                                                                        </div>
                                                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                            Assigned to you as: {serviceName}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {Object.keys(s.selectedServices || {}).length === 0 && (
                                                        <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                                                            Services are not added for this shoot yet. Confirm requirements with the manager before travel.
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                                {(!Array.isArray(details?.shoots?.shootList) || details.shoots.shootList.length === 0) && <EmptyProjectDetail>No shoots are assigned to you for this project.</EmptyProjectDetail>}
                            </div>
                        )}
                    </>
                )}
            </Drawer>
        </div>
    );
}
