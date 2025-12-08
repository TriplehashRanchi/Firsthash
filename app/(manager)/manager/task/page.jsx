// app/(employee)/task/page.jsx
'use client';

import React, { useEffect, useMemo, useState, useCallback, Fragment } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { Eye, X, Loader2, CalendarDays, ChevronDown, ClipboardEdit, PlayCircle, FolderKanban, Tag, Mic, Circle, CheckCircle2, Info } from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/* ----------------------------- Helpers & UI Components ----------------------------- */
const getAuthHeaders = async () => {
    const auth = getAuth();
    const u = auth.currentUser;
    if (!u) return {};
    const token = await u.getIdToken();
    return { Authorization: `Bearer ${token}` };
};

const formatDate = (d) => {
    if (!d) return '—';
    try {
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return d;
    }
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
    <div className="w-full dark:bg-gray-900 flex items-center justify-center py-16 text-gray-600">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        <span>{text}</span>
    </div>
);

const ErrorBox = ({ msg }) => <div className="w-full dark:bg-gray-900 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-4 py-3 text-sm">{msg}</div>;

const Drawer = ({ open, onClose, children, title }) => (
    <>
        <div className={`fixed dark:bg-gray-900 inset-0 bg-black/20 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
        <div className={`fixed top-0 right-0 h-full w-full sm:w-[520px] bg-white shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex dark:bg-gray-900 items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold dark:text-gray-200 text-gray-900">{title}</h3>
                <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="p-4 dark:bg-gray-900 overflow-y-auto h-[calc(100%-56px)]">{children}</div>
        </div>
    </>
);

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
        <div className="fixed  inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-800">Update Task Status</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">Task: {task?.title}</p>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Choose a status</label>
                        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full p-2 border rounded-md bg-white text-sm">
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">New status message</label>
                            <input
                                type="text"
                                value={newStatusText}
                                onChange={(e) => setNewStatusText(e.target.value)}
                                placeholder="e.g., Awaiting client feedback"
                                className="w-full p-2 border rounded-md text-sm"
                                autoFocus
                            />
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-100">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Status'}
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
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-3">
                    <div className="font-semibold text-gray-800">
                        <Mic className="inline-block w-4 h-4 mr-2 text-green-600" />
                        Voice Note
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-1">Task: {title}</p>
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
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Task Details</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">TITLE</label>
                        <p className="text-gray-800">{task.title}</p>
                    </div>
                    {task.description && (
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">DESCRIPTION</label>
                            <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
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

// This is the new, self-contained Table component
const TaskTable = ({ tasks, onUpdateStatusClick, onPlayAudio, onShowDetails }) => {
    const [expandedTaskId, setExpandedTaskId] = useState(null);
    const toggleExpand = (taskId) => {
        setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
    };

    if (!tasks || tasks.length === 0) {
        return null;
    }

    return (
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-50/70 text-gray-600">
                    <tr>
                        <th className="px-4 py-3 text-left font-semibold w-[30%]">Task</th>
                        <th className="px-4 py-3 text-left font-semibold">Project</th>
                        <th className="px-4 py-3 text-left font-semibold">Due Date</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                        <th className="px-4 py-3 text-left font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {tasks.map((task) => {
                        const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                        const isLongTitle = task.title.length > 70; // Check if the title is long

                        return (
                            <tr key={task.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 align-top">
                                    <div className="flex items-start gap-2">
                                        <span className="font-semibold text-gray-800">{expandedTaskId === task.id ? task.title : isLongTitle ? task.title.substring(0, 70) + '...' : task.title}</span>

                                        {isLongTitle && (
                                            <button onClick={() => toggleExpand(task.id)} className="text-blue-500 hover:text-blue-700 flex-shrink-0" title="Expand">
                                                <Info className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 align-top whitespace-nowrap">
                                    <div className="text-gray-600">{task.project_name || 'No Project'}</div>
                                </td>
                                <td className={`px-4 py-3 align-top whitespace-nowrap ${isOverdue ? 'text-rose-600 font-medium' : 'text-gray-700'}`}>{formatDate(task.due_date)}</td>
                                <td className="px-4 py-3 align-top whitespace-nowrap">
                                    <StatusBadge status={task.status} />
                                </td>
                                <td className="px-4 py-3 align-top whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onUpdateStatusClick(task)}
                                            className="p-2 rounded-md text-gray-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                                            title="Update Status"
                                        >
                                            <ClipboardEdit className="w-4 h-4" />
                                        </button>
                                        {task.voice_note_url && (
                                            <button
                                                onClick={() => onPlayAudio(task)}
                                                className="p-2 rounded-md text-gray-500 hover:bg-green-100 hover:text-green-600 transition-colors"
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

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setErr('');
            const headers = await getAuthHeaders();
            if (!headers.Authorization) {
                setErr('Please sign in to view your work.');
                setLoading(false);
                return;
            }
            const [tRes, pRes, csRes] = await Promise.all([
                axios.get(`${API_URL}/api/employee/tasks/assigned`, { headers }),
                axios.get(`${API_URL}/api/employee/projects/assigned`, { headers }),
                axios.get(`${API_URL}/api/employee/tasks/custom-statuses`, { headers }),
            ]);
            setTasks(Array.isArray(tRes.data) ? tRes.data : []);
            setProjects(Array.isArray(pRes.data) ? pRes.data : []);
            setCustomStatuses(Array.isArray(csRes.data) ? csRes.data : []);
        } catch (e) {
            console.error(e);
            setErr('Failed to connect to the server.');
        } finally {
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

    const handleUpdateTaskStatus = async (task, newStatus) => {
        const toastId = toast.loading('Updating status...');
        try {
            const headers = await getAuthHeaders();
            const response = await axios.put(`${API_URL}/api/employee/tasks/${task.id}/status`, { status: newStatus }, { headers });
            if (response.status === 200) {
                toast.success('Status updated!', { id: toastId });
                await fetchAll();
            } else {
                toast.error(response.data?.error || 'Failed to update.', { id: toastId });
            }
        } catch (e) {
            toast.error('An error occurred.', { id: toastId });
            console.error(e);
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
            else if (dueDate.getTime() === today.getTime()) groups.today.push(task);
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

    const openProjectDetails = async (projectId) => {
        setActiveProjectId(projectId);
        setDetails(null);
        setDetailsLoading(true);
        setDetailsOpen(true);
        try {
            const headers = await getAuthHeaders();
            const pr = await axios.get(`${API_URL}/api/employee/projects/${projectId}/view`, { headers });
            setDetails(pr.data);
        } catch (e) {
            console.error(e);
            setDetails(null);
        } finally {
            setDetailsLoading(false);
        }
    };

    const breadcrumbLinkStyles = 'text-blue-600 hover:underline dark:text-gray-200';
    const breadcrumbSeparatorStyles = "before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-gray-500 dark:text-gray-200";
    const breadcrumbCurrentPageStyles = 'text-gray-600 dark:text-gray-200';

    return (
        <div className="p-1 dark:bg-gray-900 sm:p-6 space-y-8 bg-gray-50 min-h-screen">
            <Toaster position="top-right" />
            <UpdateStatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal} task={taskToUpdate} customStatuses={customStatuses} onSubmit={handleUpdateTaskStatus} />
            <AudioPlayerModal {...audioPlayerData} onClose={handleCloseAudioPlayer} />
            <TaskDetailsModal isOpen={isDetailsModalOpen} onClose={handleCloseDetails} task={taskForDetails} />

            <div>
                <ul className="flex space-x-1 rtl:space-x-reverse mb-2">
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

            <div className="flex items-center dark:bg-gray-800  px-3 py-2 border rounded-lg w-full sm:w-96 bg-white shadow-sm">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your tasks..." className="w-full dark:bg-gray-800 dark:text-gray-200  outline-none text-sm" />
            </div>

            {loading && <Loading text="Loading your work..." />}
            {!loading && err && <ErrorBox msg={err} />}

            {/* My Tasks */}
            {!loading && !err && (
                <div className="space-y-8">
                    {Object.entries(groupedTasks).map(
                        ([groupKey, groupTasks]) =>
                            groupTasks.length > 0 && (
                                <div key={groupKey}>
                                    <h2 className="text-base font-semibold text-gray-800 mb-3 capitalize">{groupKey.replace('_', ' ')}</h2>
                                    <TaskTable tasks={groupTasks} onUpdateStatusClick={handleOpenStatusModal} onPlayAudio={handlePlayAudio} />
                                </div>
                            ),
                    )}
                </div>
            )}

            {/* Assigned Projects */}
            {!loading && !err && (
                <div className="space-y-3">
                    <h2 className="text-lg dark:text-gray-200 font-semibold text-gray-900">Assigned Projects</h2>
                    <div className="overflow-x-auto rounded-lg border bg-white dark:bg-gray-800 ">
                        <table className="min-w-full  text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="px-4 py-3 dark:text-gray-200 text-left font-medium">Project</th>
                                    <th className="px-4 py-3 dark:text-gray-200 text-left font-medium">Client</th>
                                    <th className="px-4 py-3 dark:text-gray-200 text-left font-medium">Dates</th>
                                    <th className="px-4 py-3 dark:text-gray-200 text-left font-medium">Counts</th>
                                    <th className="px-4 py-3 dark:text-gray-200 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 dark:text-gray-200 text-left font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProjects.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 dark:text-gray-200 py-8 text-center text-gray-500">
                                            No projects assigned to you.
                                        </td>
                                    </tr>
                                )}
                                {filteredProjects.map((p) => (
                                    <tr key={p.id} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">{p.name}</div>
                                        </td>
                                        <td className="px-4 py-3">{p.clientName || '—'}</td>
                                        <td className="px-4 py-3">
                                            <div>
                                                {formatDate(p.minDate)} — {formatDate(p.maxDate)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-700">
                                            <div>Shoots: {p.shoots ?? 0}</div>
                                            <div>
                                                Deliverables: {p.deliverablesCompleted ?? 0}/{p.deliverablesTotal ?? 0}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={p.status} />
                                        </td>
                                        <td className="px-4 py-3">
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
                </div>
            )}

            {/* Drawer: project details */}
            <Drawer open={detailsOpen} onClose={() => setDetailsOpen(false)} title="Project Details">
                {!activeProjectId ? (
                    <div className="text-sm text-gray-500 dark:text-gray-200">No project selected.</div>
                ) : (
                    <>
                        {detailsLoading && <Loading text="Loading project details..." />}
                        {!detailsLoading && !details && <div className="text-sm text-gray-500 dark:text-gray-200">Couldn’t load project details.</div>}
                        {!detailsLoading && details && (
                            <>
                                <section className="mb-6 dark:bg-gray-900">
                                    <h4 className="text-sm dark:text-gray-200 font-semibold text-gray-900 mb-2">Overview</h4>
                                    <div className="text-sm grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-200">Project:</span> <span className="font-medium">{details.projectName || details.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-200">Client:</span> {details.clientName || '—'}
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-200">Status:</span> {statusLabel(details.projectStatus || details.status)}
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-200">Total:</span> ₹{Number(details.overallTotalCost ?? details.totalCost ?? 0).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                </section>
                                {Array.isArray(details?.shoots?.shootList) && details.shoots.shootList.length > 0 && (
                                    <section className="mb-6 dark:bg-gray-900">
                                        <h4 className="text-sm dark:text-gray-200 font-semibold text-gray-900 mb-2">Shoots</h4>
                                        <div className="space-y-2 dark:text-gray-200">
                                            {details.shoots.shootList.map((s) => (
                                                <div key={s.id} className="border rounded dark:text-gray-200 p-2 text-sm">
                                                    <div className="font-medium dark:text-gray-200">
                                                        {s.title} — {s.city}
                                                    </div>
                                                    <div className="text-gray-500 dark:text-gray-200">
                                                        <CalendarDays className="inline-block w-4 h-4 mr-1 align[-2px] dark:text-gray-200" />
                                                        {formatDate(s.date)} {s.time ? `• ${s.time}` : ''}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                                {Array.isArray(details?.deliverables?.deliverableItems) && details.deliverables.deliverableItems.length > 0 && (
                                    <section className="mb-6 dark:bg-gray-900">
                                        <h4 className="text-sm dark:text-gray-200 font-semibold text-gray-900 mb-2">Deliverables</h4>
                                        <div className="space-y-1 text-sm dark:text-gray-200">
                                            {details.deliverables.deliverableItems.map((d) => (
                                                <div key={d.id} className="flex items-center dark:text-gray-200 justify-between border-b py-1">
                                                    <div>{d.title}</div>
                                                    <div className="text-xs dark:text-gray-200 text-gray-500">{statusLabel(d.status || '')}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </>
                        )}
                    </>
                )}
            </Drawer>
        </div>
    );
}
