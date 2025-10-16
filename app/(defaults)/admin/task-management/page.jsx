'use client';

import React, { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import Link from 'next/link';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { getAuth } from 'firebase/auth';
import { Trash2, Edit, Save, X, Briefcase, ChevronRight, ChevronDown, Mic, PlayCircle, PlusCircle, Loader2, Users, CheckCircle2, Circle, Search, ChevronLeft, CalendarDays } from 'lucide-react';

import Select from 'react-select';

// --- Configuration & API Client ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const apiClient = axios.create({ baseURL: API_URL });

import { VoiceNoteRecorder } from '@/components/show-details/VoiceNoteRecorder';

// --- Reusable UI Components ---

const LoadingSpinner = ({ text }) => (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="w-10 h-10 dark:bg-gray-900 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 dark:text-gray-200 text-lg text-gray-600">{text}</p>
    </div>
);

// StatusBadge
const StatusBadge = ({ status = 'to_do' }) => {
    const s = String(status).toLowerCase().trim();
    const styles = {
        to_do: 'bg-gray-100 text-gray-800',
        in_progress: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        finalize: 'bg-emerald-100 text-emerald-800', // ← NEW
    };
    const currentStyle = styles[s] || 'bg-yellow-100 text-yellow-800';
    const formatted = s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStyle}`}>{formatted}</span>;
};

// --- NEW HELPER COMPONENTS FOR BADGES ---
const InfoBadge = ({ text, colorClass }) => {
    if (!text || text === '—') return null;
    return <span className={`inline-block ml-2 px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${colorClass}`}>{text}</span>;
};

const colorClasses = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-orange-100 text-orange-800',
    'bg-teal-100 text-teal-800',
];

// --- Redesigned, Compact, and Smart AddTaskForm ---
const AddTaskForm = ({ onAddTask, projects, deliverables, members, parentTasks, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [linkedProjectId, setLinkedProjectId] = useState('');
    const [linkedDeliverableId, setLinkedDeliverableId] = useState('');
    const [assignedToId, setAssignedToId] = useState('');
    const [assignedToIds, setAssignedToIds] = useState([]);

    // --- Data transformation for react-select (no changes needed) ---
    const memberOptions = useMemo(() => members.map((m) => ({ value: m.firebase_uid, label: m.name })), [members]);
    const projectOptions = useMemo(() => projects.map((p) => ({ value: p.id, label: p.name })), [projects]);
    const deliverableOptions = useMemo(
        () =>
            deliverables.map((d) => ({
                value: d.id,
                label: `${d.client_name ? d.client_name + ' - ' : ''}${d.project_name} / ${d.title}`,
            })),
        [deliverables],
    );

    // --- Form Logic (no changes needed) ---
    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDueDate('');
        setLinkedProjectId('');
        setLinkedDeliverableId('');
        setAssignedToId('');
        setAssignedToIds([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('Title is required.');
            return;
        }
        setIsSaving(true);
        const taskData = {
            title,
            description,
            due_date: dueDate || null,
            project_id: linkedProjectId || null,
            deliverable_id: linkedDeliverableId || null,
            assigneeIds: assignedToIds,
        };
        try {
            const ok = await onAddTask(taskData);
            if (ok !== false) {
                toast.success('Task added!');
                resetForm();
                onClose();
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to add task.');
        } finally {
            setIsSaving(false);
        }
    };

    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: '#F9FAFB',
            borderColor: state.isFocused ? '#6366F1' : '#D1D5DB',
            borderRadius: '0.5rem',
            padding: '0.1rem',
            boxShadow: state.isFocused ? '0 0 0 1px #6366F1' : 'none',
            '&:hover': { borderColor: '#9CA3AF' },
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#6366F1' : state.isFocused ? '#EEF2FF' : 'white',
            color: state.isSelected ? 'white' : '#111827',
            padding: '0.5rem 1rem',
        }),
        singleValue: (provided) => ({ ...provided, color: '#1F2937' }),
        placeholder: (provided) => ({ ...provided, color: '#6B7280' }),
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 ">
            <div>
                <label htmlFor="task-title" className="block dark:text-gray-200  text-sm font-medium text-gray-600 mb-1.5">
                    Task Title
                </label>
                <input
                    id="task-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full bg-gray-50 dark:bg-gray-800 dark:text-gray-200 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    required
                />
            </div>

            <div className="grid grid-cols-1 dark:text-gray-200 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="task-assignee" className="block dark:text-gray-200 text-sm font-medium text-gray-600 mb-1.5">
                        Assign To
                    </label>
                    <Select
                        id="task-assignee"
                        isMulti // This prop enables multi-selection
                        styles={customSelectStyles}
                        options={memberOptions}
                        placeholder="Select members..."
                        value={memberOptions.filter((o) => assignedToIds.includes(o.value))}
                        onChange={(options) => setAssignedToIds(options ? options.map((o) => o.value) : [])}
                    />
                </div>
                <div>
                    <label htmlFor="task-due-date" className="block dark:text-gray-200 text-sm font-medium text-gray-600 mb-1.5">
                        Due Date
                    </label>

                    <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />

                        <input
                            id="task-due-date"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 dark:text-gray-200 border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm dark:text-gray-200 font-medium text-gray-600 mb-1.5">Project</label>
                    <Select
                        styles={customSelectStyles}
                        options={projectOptions}
                        isClearable
                        placeholder="Link to a project..."
                        value={projectOptions.find((o) => o.value === linkedProjectId)}
                        onChange={(option) => setLinkedProjectId(option ? option.value : '')}
                        // Disable if a deliverable is already selected
                        isDisabled={!!linkedDeliverableId}
                    />
                </div>
                <div>
                    <label className="block text-sm dark:text-gray-200 font-medium text-gray-600 mb-1.5">Deliverable</label>
                    <Select
                        styles={customSelectStyles}
                        options={deliverableOptions}
                        isClearable
                        placeholder="Link to a deliverable..."
                        value={deliverableOptions.find((o) => o.value === linkedDeliverableId)}
                        onChange={(option) => setLinkedDeliverableId(option ? option.value : '')}
                        // Disable if a project is already selected
                        isDisabled={!!linkedProjectId}
                    />
                </div>
            </div>
            {/* Additional Details */}
            <div>
                <label htmlFor="task-description" className="block dark:text-gray-200  text-sm font-medium text-gray-600 mb-1.5">
                    Description
                </label>
                <textarea
                    id="task-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more details (optional)..."
                    className="w-full bg-gray-50 dark:bg-gray-800 dark:text-gray-200 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    rows="2" // Reduced rows
                />
            </div>
            {/* Final Action Buttons */}
            <div className="flex justify-end items-center gap-3 pt-4 mt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center justify-center min-w-[9rem] px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors shadow-sm"
                >
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : 'Assign Task'}
                </button>
            </div>
        </form>
    );
};

// --- Modal Components ---
const CreateTaskModal = ({ isOpen, onClose, ...props }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed  inset-0 bg-black bg-opacity-60 flex justify-center items-start pt-16 z-50">
            <div className="bg-white  dark:bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-3xl relative transform transition-all">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" title="Close">
                    <X size={24} />
                </button>
                <h2 className="text-2xl dark:text-gray-200 font-bold text-gray-800 mb-6">Create & Assign a New Task</h2>
                <AddTaskForm onClose={onClose} {...props} />
            </div>
        </div>
    );
};

const CustomOption = (props) => {
    const { innerProps, label, data } = props;
    return (
        <div {...innerProps} className="p-3 hover:bg-indigo-50 cursor-pointer">
            <div className="font-medium text-gray-800">{label}</div>
            {data.primaryRole && <div className="text-xs text-gray-500 mt-0.5">{data.primaryRole}</div>}
        </div>
    );
};

// --- CHANGE START: This is a new modal component for managing assignees of an existing task ---
const AssigneeModal = ({ isOpen, onClose, task, members, onAssigneeChange }) => {
    // State to hold the selected assignee IDs within the modal
    const [selectedAssignees, setSelectedAssignees] = useState(task?.assignee_ids || []);

    const memberOptions = useMemo(
        () =>
            members.map((m) => ({
                value: m.firebase_uid,
                label: m.name,
                ...m, // Include all member data like `primaryRole`
            })),
        [members],
    );

    // --- FIX 2: Robustly handle any format for assignee_ids ---
    // This useEffect now correctly handles null, string, and array formats.
    useEffect(() => {
        if (task) {
            let currentIds = [];
            if (Array.isArray(task.assignee_ids)) {
                currentIds = task.assignee_ids;
            } else if (typeof task.assignee_ids === 'string' && task.assignee_ids) {
                currentIds = task.assignee_ids.split(',').map((id) => id.trim());
            }
            setSelectedAssignees(currentIds);
        }
    }, [task]);

    // useEffect(() => {
    //     setSelectedAssignees(task?.assignee_ids || []);
    // }, [task]);

    // This function calls the main handler passed from the parent page to save the changes.
    const handleSave = () => {
        onAssigneeChange(task, selectedAssignees);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Assign Team Members to "{task.title}"</h3>

                <Select
                    isMulti
                    options={memberOptions}
                    value={memberOptions.filter((o) => selectedAssignees.includes(o.value))}
                    onChange={(options) => setSelectedAssignees(options ? options.map((o) => o.value) : [])}
                    components={{ Option: CustomOption }}
                    autoFocus
                />
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Filter Configuration ---
const STATUS_FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'To Do', value: 'to_do' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Finalize', value: 'finalize' },
];

// --- The Main Task Dashboard Page ---
export default function ProjectTaskDashboardPage() {
    // Data states
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [deliverables, setDeliverables] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false); // Default to false until auth check completes
    const [roles, setRoles] = useState([]);

    // UI/Control states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editedTask, setEditedTask] = useState({});
    const [statusEditingTaskId, setStatusEditingTaskId] = useState(null);

    // const [assigneeEditingTaskId, setAssigneeEditingTaskId] = useState(null);
    const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false); // Manages modal visibility
    const [taskForAssigneeModal, setTaskForAssigneeModal] = useState(null); // Holds the task being edited
    const [dueDateEditingTaskId, setDueDateEditingTaskId] = useState(null);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [taskForVoiceNote, setTaskForVoiceNote] = useState(null);
    const [addingSubtaskTo, setAddingSubtaskTo] = useState(null);
    const [fullyShownTasks, setFullyShownTasks] = useState(new Set());
    const [voiceModalState, setVoiceModalState] = useState({
        isOpen: false,
        task: null,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [tasksPerPage] = useState(15);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                setIsAdmin(false);
                return;
            }

            try {
                // force refresh once so new claims propagate
                const { claims } = await user.getIdTokenResult(true);
                const role = claims?.role; // 'admin' | 'leader' | etc.
                setIsAdmin(role === 'admin');
            } catch (e) {
                console.error('Failed to read claims', e);
                setIsAdmin(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // --- Data Fetching ---
    const fetchData = useCallback(async (showLoading = false) => {
        if (showLoading) setLoading(true);
        const user = getAuth().currentUser;
        if (!user) {
            setError('Authentication failed.');
            if (showLoading) setLoading(false);
            return;
        }
        try {
            const token = await user.getIdToken();
            const headers = { Authorization: `Bearer ${token}` };

            const [projectsRes, tasksRes, membersRes, deliverablesRes] = await Promise.all([
                apiClient.get('/api/projects', { headers }),
                apiClient.get('/api/tasks', { headers }),
                apiClient.get('/api/members', { headers }),
                apiClient.get('/api/deliverables', { headers }),
            ]);

            const parsedMembers = membersRes.data.map((member) => {
                try {
                    // Check if 'roles' is a string and needs parsing
                    const rolesArray = typeof member.roles === 'string' && member.roles ? JSON.parse(member.roles) : member.roles || [];

                    return {
                        ...member,
                        // Ensure 'roles' is always an array
                        roles: Array.isArray(rolesArray) ? rolesArray : [],
                        // Add a 'primaryRole' for easy access in the UI
                        primaryRole: rolesArray.length > 0 ? rolesArray[0].role_name : '',
                    };
                } catch (e) {
                    console.error('Failed to parse roles for member:', member.name, e);
                    // Return a default structure on parsing error
                    return { ...member, roles: [], primaryRole: '' };
                }
            });

            setProjects(projectsRes.data);
            setTasks(tasksRes.data);
            setMembers(parsedMembers);

            setDeliverables(deliverablesRes.data);
        } catch (err) {
            toast.error('Failed to load dashboard data.');
            setError(err.response?.data?.error || 'Could not fetch data.');
        } finally {
            if (showLoading) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(true);
    }, [fetchData]);

    // --- Data Processing & Memoization ---
    const processedTasks = useMemo(() => {
        if (!tasks.length) return [];

        const projectMap = new Map(projects.map((p) => [String(p.id), p]));
        const memberMap = new Map(members.map((m) => [m.firebase_uid, m]));
        const deliverableMap = new Map(deliverables.map((d) => [String(d.id), d]));
        const taskMap = new Map();
        const memberMapByName = new Map(members.map((member) => [member.name, member]));

        tasks.forEach((task) => {
            const project = projectMap.get(String(task.project_id));
            const deliverable = deliverableMap.get(String(task.deliverable_id));

            const assigneeNames = task.assignments || [];
            const clientName = project?.client_name || project?.clientName || deliverable?.client_name || deliverable?.clientName || '—';

            let assigneeIdArray = [];
            if (typeof task.assignee_ids === 'string' && task.assignee_ids.trim()) {
                assigneeIdArray = task.assignee_ids.split(',');
            }

            const assignees = assigneeIdArray.map((id) => memberMap.get(id.trim())).filter(Boolean);

            const finalAssignees = assignees.length > 0 ? assignees : [{ name: 'Unassigned', firebase_uid: 'unassigned', primaryRole: '' }];

            taskMap.set(task.id, {
                ...task,
                taskTitle: task.title,
                projectName: project?.name || '—',
                projectClientName: clientName, // ✅ Added line
                deliverableName: deliverable?.title || '—',
                assignees: finalAssignees,
                children: [],
            });
        });

        console.log('TASK MAP', taskMap);

        const roots = [];
        taskMap.forEach((task) => {
            if (task.parent_task_id && taskMap.has(task.parent_task_id)) {
                taskMap.get(task.parent_task_id).children.push(task);
            } else {
                roots.push(task);
            }
        });

        return roots;
    }, [tasks, projects, members, deliverables]);

    const filteredAndSearchedTasks = useMemo(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase().trim();

        if (statusFilter === 'all' && !lowercasedSearchTerm) {
            return processedTasks;
        }

        const filterAndSearch = (tasksToFilter) => {
            return tasksToFilter.reduce((acc, task) => {
                const filteredChildren = task.children ? filterAndSearch(task.children) : [];
                const matchesStatus = statusFilter === 'all' || (task.status || 'to_do').toLowerCase() === statusFilter;
                const matchesSearch =
                    lowercasedSearchTerm === '' ||
                    task.taskTitle.toLowerCase().includes(lowercasedSearchTerm) ||
                    (task.assignees && task.assignees.some((a) => a.name.toLowerCase().includes(lowercasedSearchTerm)));

                if ((matchesStatus && matchesSearch) || filteredChildren.length > 0) {
                    acc.push({ ...task, children: filteredChildren });
                }
                return acc;
            }, []);
        };

        return filterAndSearch(processedTasks);
    }, [processedTasks, statusFilter, searchTerm]);

    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = filteredAndSearchedTasks.slice(indexOfFirstTask, indexOfLastTask);
    const totalPages = Math.ceil(filteredAndSearchedTasks.length / tasksPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // --- Event Handlers ---
    const handleToggleRow = (taskId) => {
        setExpandedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
        setAddingSubtaskTo(null);
    };
    const handleEditClick = (task) => {
        setEditingTaskId(task.id);
        setStatusEditingTaskId(null);
        setEditedTask({ taskTitle: task.taskTitle, status: task.status });
        setAddingSubtaskTo(null);
        setDueDateEditingTaskId(null);

        const formattedDueDate = task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '';

        setEditedTask({
            taskTitle: task.taskTitle,
            status: task.status,
            dueDate: formattedDueDate,
        });
        setAddingSubtaskTo(null);
    };

    const handleCancelEdit = () => {
        setEditingTaskId(null);
        setEditedTask({});
    };

    const handleTaskUpdate = async (taskId, updatePayload) => {
        const user = getAuth().currentUser;
        if (!user) {
            toast.error('Not authenticated!');
            return false;
        }
        try {
            const token = await user.getIdToken();
            await apiClient.put(`/api/tasks/${taskId}`, updatePayload, { headers: { Authorization: `Bearer ${token}` } });
            await fetchData();
            return true;
        } catch (err) {
            console.error('Update task error:', err);
            toast.error(`Failed to update task: ${err.message}`);
            return false;
        }
    };

    const handleSaveEdit = async () => {
        if (!editedTask.taskTitle || !editedTask.status) {
            return toast.error('Task title and status cannot be empty.');
        }
        toast.loading('Updating task...');
        const success = await handleTaskUpdate(editingTaskId, {
            title: editedTask.taskTitle,
            status: editedTask.status,
            due_date: editedTask.dueDate || null,
        });
        toast.dismiss();

        if (success) {
            toast.success('Task updated successfully.');
            handleCancelEdit();
        }
    };

    const handleDueDateChange = async (task, newDueDate) => {
        setDueDateEditingTaskId(null);
        const originalDate = task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '';
        if (originalDate === newDueDate) return;
        toast.loading('Updating due date...');
        const success = await handleTaskUpdate(task.id, { due_date: newDueDate || null });
        toast.dismiss();
        if (success) {
            toast.success('Due date updated!');
        }
    };

    const handleStatusChange = async (task, newStatusRaw) => {
        const newStatus = (newStatusRaw || '').toLowerCase().trim();
        if ((task.status || '').toLowerCase().trim() === newStatus) return;

        toast.loading('Updating status...');
        const ok = await handleTaskUpdate(task.id, { status: newStatus });
        toast.dismiss();
        if (ok) toast.success('Status updated!');
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure? This will delete the task and all its sub-tasks.')) return;
        const originalTasks = [...tasks];
        setTasks((current) => current.filter((t) => t.id !== taskId && t.parent_task_id !== taskId));
        try {
            const token = await getAuth().currentUser.getIdToken();
            await apiClient.delete(`/api/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Task deleted.');
        } catch (err) {
            toast.error('Failed to delete task.');
            setTasks(originalTasks);
        }
    };

    const handleAddNewTask = async (taskData) => {
        toast.loading('Creating new task...');
        try {
            const token = await getAuth().currentUser.getIdToken();
            await apiClient.post('/api/tasks', taskData, { headers: { Authorization: `Bearer ${token}` } });
            toast.dismiss();
            toast.success('Task created successfully!');
            await fetchData();
        } catch (err) {
            toast.dismiss();
            toast.error(err.response?.data?.error || 'Failed to create task.');
            throw err;
        }
    };

    const handleAddNewSubtask = async (parentId, subtaskData) => {
        toast.loading('Adding sub-task...');
        const parentTask = tasks.find((t) => t.id === parentId);
        if (!parentTask) {
            toast.dismiss();
            toast.error('Parent task not found.');
            return;
        }
        try {
            const token = await getAuth().currentUser.getIdToken();
            const payload = { ...subtaskData, parent_task_id: parentId, project_id: parentTask.project_id };
            await apiClient.post('/api/tasks', payload, { headers: { Authorization: `Bearer ${token}` } });
            toast.dismiss();
            toast.success('Sub-task added!');
            setAddingSubtaskTo(null);
            await fetchData();
        } catch (err) {
            toast.dismiss();
            toast.error('Failed to add sub-task.');
        }
    };

    const handleAssigneeChange = async (task, newAssigneeIds) => {
        toast.loading('Re-assigning task...');
        try {
            const token = await getAuth().currentUser.getIdToken();
            const headers = { Authorization: `Bearer ${token}` };
            // The payload sent to the backend now contains an array of IDs.
            // Your backend API endpoint `/api/tasks/${task.id}/assignees` must be designed to accept this structure.
            const payload = { assigneeIds: newAssigneeIds || [] };
            await apiClient.put(`/api/tasks/${task.id}/assignees`, payload, { headers });
            toast.dismiss();
            toast.success('Task re-assigned!');
            await fetchData(); // Refresh data to show the change in the UI.
        } catch (err) {
            toast.dismiss();
            toast.error(err.response?.data?.error || 'Failed to re-assign task.');
            console.error('Assignee update error:', err);
        }
    };

    const handleOpenAssigneeModal = (task) => {
        setTaskForAssigneeModal(task);
        setIsAssigneeModalOpen(true);
    };

    // Resets the state and closes the modal.
    const handleCloseAssigneeModal = () => {
        setIsAssigneeModalOpen(false);
        setTaskForAssigneeModal(null);
    };

    const handleToggleSubtaskForm = (taskId) => {
        setAddingSubtaskTo((prev) => (prev === taskId ? null : taskId));
    };

    const handleVoiceNoteRequest = (task) => {
        setTaskForVoiceNote(task);
    };

    const handleOpenVoiceModal = (task) => {
        setVoiceModalState({ isOpen: true, task: task });
    };

    const handleCloseVoiceModal = () => {
        setVoiceModalState({ isOpen: false, task: null });
    };

    const handleUploadVoiceNote = async (audioBlob) => {
        const taskToUpdate = voiceModalState.task;
        if (!taskToUpdate) return;
        toast.loading('Uploading voice note...');
        const formData = new FormData();
        formData.append('file', audioBlob, `voicenote_${taskToUpdate.id}.webm`);
        formData.append('uploadType', 'voice-notes');
        try {
            const token = await getAuth().currentUser.getIdToken();
            const uploadResponse = await apiClient.post('/api/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
            });
            const { url: voice_note_url } = uploadResponse.data;
            const success = await handleTaskUpdate(taskToUpdate.id, { voice_note_url });
            toast.dismiss();
            if (success) {
                toast.success('Voice note saved!');
                handleCloseVoiceModal();
            } else {
                toast.error('Failed to link voice note to task.');
            }
        } catch (err) {
            toast.dismiss();
            toast.error('Voice note upload failed.');
            console.error('Upload error:', err);
        }
    };

    const handleToggleFullTaskText = (taskId) => {
        setFullyShownTasks((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    // --- Render ---
    if (loading) return <LoadingSpinner text="Building Task Dashboard..." />;
    if (error)
        return (
            <div className="p-8 text-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-lg mx-auto" role="alert">
                    {error}
                </div>
            </div>
        );

    const breadcrumbLinkStyles = 'text-blue-600 hover:underline dark:text-blue-400';
    const breadcrumbSeparatorStyles = "before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-gray-500 dark:text-gray-500";
    const breadcrumbCurrentPageStyles = 'text-gray-600 dark:text-gray-400';

    return (
        <main className="min-h-screen p-4 sm:p-6 lg:p-8">
            <Toaster position="top-right" />
            <VoiceNoteRecorder isOpen={voiceModalState.isOpen} onClose={handleCloseVoiceModal} task={voiceModalState.task} onUpload={handleUploadVoiceNote} />
            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onAddTask={handleAddNewTask}
                projects={projects}
                deliverables={deliverables}
                members={members}
                parentTasks={tasks.filter((t) => !t.parent_task_id)}
            />
            <AssigneeModal isOpen={isAssigneeModalOpen} onClose={handleCloseAssigneeModal} task={taskForAssigneeModal} members={members} onAssigneeChange={handleAssigneeChange} />
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                            <li>
                                <Link href="/dashboard" className={breadcrumbLinkStyles}>
                                    Dashboard
                                </Link>
                            </li>
                            <li className={breadcrumbSeparatorStyles}>
                                <span className={breadcrumbCurrentPageStyles}>Task Management</span>
                            </li>
                        </ul>
                        {/* <p className="text-gray-600 mt-1">A unified view of all tasks across your projects.</p> */}
                    </div>
                    <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-black text-white font-semibold rounded-lg shadow-sm transition-colors">
                        <PlusCircle size={20} />
                        Assign New Task
                    </button>
                </div>

                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by task name or assignee..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // Reset page on new search
                                }}
                                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-700 dark:text-gray-200"
                            />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {STATUS_FILTERS.map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => {
                                        setStatusFilter(filter.value);
                                        setCurrentPage(1); // Reset page on filter change
                                    }}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                        statusFilter === filter.value
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="w-2/5  dark:text-gray-200 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Task
                                    </th>
                                    <th scope="col" className="px-6 dark:text-gray-200 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Client
                                    </th>
                                    <th scope="col" className="px-6 dark:text-gray-200 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 dark:text-gray-200 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Assign To
                                    </th>
                                    <th scope="col" className="px-6 dark:text-gray-200 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Due Date
                                    </th>
                                    <th scope="col" className="px-6 dark:text-gray-200 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                                {currentTasks.map((task) => (
                                    <TaskRow
                                        key={task.id}
                                        task={task}
                                        level={0}
                                        members={members}
                                        memberMap={processedTasks.memberMap}
                                        isExpanded={expandedRows.has(task.id)}
                                        onToggle={handleToggleRow}
                                        onOpenVoiceModal={handleOpenVoiceModal}
                                        editingTaskId={editingTaskId}
                                        editedTask={editedTask}
                                        onEditChange={setEditedTask}
                                        onEditClick={handleEditClick}
                                        onCancelEdit={handleCancelEdit}
                                        onSaveEdit={handleSaveEdit}
                                        isAdmin={isAdmin}
                                        statusEditingTaskId={statusEditingTaskId}
                                        onSetStatusEditingId={setStatusEditingTaskId}
                                        onStatusChange={handleStatusChange}
                                        onOpenAssigneeModal={handleOpenAssigneeModal}
                                        onAssigneeChange={handleAssigneeChange}
                                        onDelete={handleDeleteTask}
                                        onVoiceNote={handleVoiceNoteRequest}
                                        addingSubtaskTo={addingSubtaskTo}
                                        onToggleSubtaskForm={handleToggleSubtaskForm}
                                        onAddSubtask={handleAddNewSubtask}
                                        dueDateEditingTaskId={dueDateEditingTaskId}
                                        onSetDueDateEditingId={setDueDateEditingTaskId}
                                        onDueDateChange={handleDueDateChange}
                                        fullyShownTasks={fullyShownTasks}
                                        onToggleFullText={handleToggleFullTaskText}
                                    />
                                ))}
                            </tbody>
                        </table>
                        {filteredAndSearchedTasks.length === 0 && !loading && (
                            <div className="text-center py-20 text-gray-500">
                                <Briefcase size={48} className="mx-auto text-gray-400" />
                                <h3 className="mt-2 text-lg font-medium text-gray-900">No tasks match your criteria</h3>
                                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or status filter.</p>
                            </div>
                        )}
                    </div>
                </div>
                {totalPages > 1 && (
                    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing <span className="font-semibold text-gray-800 dark:text-gray-200">{indexOfFirstTask + 1}</span>
                            to{' '}
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {indexOfLastTask > filteredAndSearchedTasks.length ? filteredAndSearchedTasks.length : indexOfLastTask}
                            </span>
                            of <span className="font-semibold text-gray-800 dark:text-gray-200">{filteredAndSearchedTasks.length}</span> results
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

const AddSubtaskRow = ({ parentId, level, onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSave(parentId, { title, status: 'to_do' });
        setTitle('');
    };
    return (
        <tr className="bg-indigo-50">
            {' '}
            <td colSpan="5">
                {' '}
                <form onSubmit={handleSubmit} className="flex items-center gap-2 py-2 px-4" style={{ paddingLeft: `${level * 1.5 + 1}rem` }}>
                    {' '}
                    <PlusCircle size={16} className="text-gray-400 flex-shrink-0" />{' '}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter title for new sub-task..."
                        className="flex-grow bg-white border border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        autoFocus
                    />{' '}
                    <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 rounded-md p-2" title="Save Sub-task">
                        {' '}
                        <Save size={16} />{' '}
                    </button>{' '}
                    <button type="button" onClick={onCancel} className="text-gray-600 hover:bg-gray-200 rounded-md p-2" title="Cancel">
                        {' '}
                        <X size={16} />{' '}
                    </button>{' '}
                </form>{' '}
            </td>{' '}
        </tr>
    );
};
const AdminStatusToggle = ({ task, onStatusComplete }) => {
  const status = (task.status || "").toLowerCase().trim();
  const [isFinalized, setIsFinalized] = useState(status === "finalize");
  const [isCompleted, setIsCompleted] = useState(status === "completed");
  const [busy, setBusy] = useState(false);

  const handleToggle = async () => {
    if (busy || isCompleted) return;
    setBusy(true);
    try {
      // Call your backend to mark as completed
      await onStatusComplete(task, "completed");
      // Turn green briefly before hiding
      setIsFinalized(false);
      setIsCompleted(true);
    } finally {
      setBusy(false);
    }
  };

  // ✅ If completed, hide the toggle
  if (isCompleted) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-[15px] font-semibold text-slate-800">
        Finalized
      </span>

      <button
        onClick={handleToggle}
        disabled={busy}
        className={[
          "relative w-[52px] h-[30px] rounded-full border transition-all duration-300 ease-in-out focus:outline-none",
          isFinalized
            ? "bg-gray-300 border-gray-300" // gray before click
            : "bg-emerald-500 border-emerald-500", // turns green after click
          busy ? "opacity-70 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
        title="Click to mark as completed"
      >
        <span
          className={[
            "absolute top-[3px] left-[3px] h-[24px] w-[24px] rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out",
            isFinalized ? "translate-x-0" : "translate-x-[22px]",
          ].join(" ")}
        />
      </button>
    </div>
  );
};


const TaskRow = ({ task, level, isExpanded, expandedRows, onToggle, members, isAdmin, fullyShownTasks, onToggleFullText, ...handlers }) => {
    const isEditing = handlers.editingTaskId === task.id;
    const isEditingStatus = handlers.statusEditingTaskId === task.id;
    // const isEditingAssignee = handlers.assigneeEditingTaskId === task.id;
    const isEditingDueDate = handlers.dueDateEditingTaskId === task.id;
    const isAddingSubtask = handlers.addingSubtaskTo === task.id;
    const hasChildren = task.children && task.children.length > 0;
    const audioRef = React.useRef(null);
    React.useEffect(() => {
        if (task.voice_note_url) {
            audioRef.current = new Audio(task.voice_note_url);
            audioRef.current.onerror = () => {
                toast.error('Error loading audio file.');
            };
        }
    }, [task.voice_note_url]);
    const formattedDueDate = task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'N/A';
    const isOverdue = task.due_date && task.status !== 'completed' && new Date(task.due_date) < new Date();
    const currentAssigneeSimpleId = Array.isArray(task.assignee_ids) ? task.assignee_ids[0] || null : null;
    const currentAssignee = currentAssigneeSimpleId ? handlers.memberMap.get(parseInt(currentAssigneeSimpleId)) : null;
    const currentAssigneeFirebaseUid = Array.isArray(task.assignee_ids) ? task.assignee_ids[0] || '' : task.assignee_ids || '';

    const words = task.taskTitle.split(' ');
    const isLong = words.length > 10;
    const isFullyShown = fullyShownTasks.has(task.id);
    const displayText = isLong && !isFullyShown ? words.slice(0, 10).join(' ') : task.taskTitle;

    const primaryAssignee = task.assignees && task.assignees.length > 0 ? task.assignees[0] : { name: 'Unassigned', primaryRole: '' };
    const normalizedStatus = (task.status || '').toLowerCase().trim();
    return (
        <Fragment className="dark:bg-gray-900">
            <tr className={level > 0 ? 'bg-gray-50/50 dark:bg-gray-900 hover:bg-gray-100/50' : 'hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-100'}>
                {/* Task Title */}
                {/* Task Title with Client */}
                <td className="px-6 py-4 align-top whitespace-nowrap">
                    <div className="flex dark:text-gray-100 items-start gap-2" style={{ paddingLeft: `${level * 1.5}rem` }}>
                        <div className="flex-shrink-0 pt-1">
                            {hasChildren ? (
                                <button onClick={() => onToggle(task.id)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                            ) : (
                                <div className="w-8" />
                            )}
                        </div>

                        <div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={handlers.editedTask.taskTitle}
                                    onChange={(e) => handlers.onEditChange({ ...handlers.editedTask, taskTitle: e.target.value })}
                                    className="w-full bg-white dark:bg-gray-700 dark:text-gray-200 border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                                />
                            ) : (
                                <>
                                    <div className="flex items-center flex-wrap">
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">{displayText}</span>
                                        {isLong && !isFullyShown && (
                                            <button onClick={() => onToggleFullText(task.id)} className="ml-1 text-indigo-600 dark:text-gray-400 hover:underline font-bold">
                                                ...
                                            </button>
                                        )}
                                    </div>

                                    {/* Project + Deliverable tags */}
                                    <div className="mt-1">
                                        <InfoBadge text={task.projectName} colorClass="bg-blue-100 text-blue-800" />
                                        <InfoBadge text={task.deliverableName} colorClass="bg-green-100 text-green-800" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{task.projectClientName || '—'}</td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                    {normalizedStatus === 'finalize' ? <AdminStatusToggle task={task} onStatusComplete={handlers.onStatusChange} /> : <StatusBadge status={task.status} />}
                </td>
                {/* Assign To */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div onClick={() => handlers.onOpenAssigneeModal(task)} className="flex items-center gap-2 cursor-pointer group">
                        <div className="flex -space-x-2 overflow-hidden">
                            {task.assignees.slice(0, 3).map((assignee, index) => (
                                <span
                                    key={assignee.firebase_uid || index}
                                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-bold  transition"
                                >
                                    {assignee.name === 'Unassigned' ? '?' : assignee.name.charAt(0)}
                                </span>
                            ))}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium dark:text-gray-200 group-hover:text-indigo-600 transition">{primaryAssignee.name}</span>
                            {/* This now displays the role correctly */}
                            {primaryAssignee.primaryRole && <span className="text-xs dark:text-gray-200 text-gray-500">{primaryAssignee.primaryRole}</span>}
                            {task.assignees.length > 1 && primaryAssignee.name !== 'Unassigned' && (
                                <span className="text-xs dark:text-gray-200 text-gray-500 mt-1">+{task.assignees.length - 1} more</span>
                            )}
                        </div>
                    </div>
                </td>
                {/* Due Date */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isEditing ? (
                        <input
                            type="date"
                            value={handlers.editedTask.dueDate}
                            onChange={(e) => handlers.onEditChange({ ...handlers.editedTask, dueDate: e.target.value })}
                            className="w-full bg-white dark:bg-gray-700  border-gray-300 rounded-md py-1 px-2 text-sm"
                        />
                    ) : isEditingDueDate ? (
                        <input
                            type="date"
                            defaultValue={task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''}
                            onBlur={(e) => handlers.onDueDateChange(task, e.target.value)}
                            className="w-full bg-white border dark:text-gray-200 dark:bg-gray-700 border-indigo-500 rounded-md py-1 px-2 text-sm"
                            autoFocus
                        />
                    ) : (
                        <div
                            onClick={() => handlers.onSetDueDateEditingId(task.id)}
                            className={`cursor-pointer inline-block px-2 py-1 rounded-md ${isOverdue ? 'text-red-700 dark:text-red-600 bg-red-100 font-semibold' : 'text-gray-700 dark:text-gray-200'}`}
                        >
                            {formattedDueDate}
                        </div>
                    )}
                </td>
                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-start gap-3">
                        {isEditing ? (
                            <>
                                <button onClick={handlers.onSaveEdit} className="text-green-600 hover:text-green-900" title="Save">
                                    <Save size={18} />
                                </button>
                                <button onClick={handlers.onCancelEdit} className="text-gray-500 hover:text-gray-800" title="Cancel">
                                    <X size={18} />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => handlers.onOpenVoiceModal(task)}
                                    className={task.voice_note_url ? 'text-green-600 hover:text-green-900' : 'text-blue-600 hover:text-blue-900'}
                                    title={task.voice_note_url ? 'Play/Edit Voice Note' : 'Add Voice Note'}
                                >
                                    {task.voice_note_url ? <PlayCircle size={16} /> : <Mic size={16} />}
                                </button>
                                <button onClick={() => handlers.onToggleSubtaskForm(task.id)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800" title="Add Sub-task">
                                    <PlusCircle size={16} />
                                </button>
                                <button onClick={() => handlers.onEditClick(task)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900" title="Edit Task">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => handlers.onDelete(task.id)} className="text-red-500 hover:text-red-800" title="Delete Task">
                                    <Trash2 size={16} />
                                </button>
                                <button onClick={() => handlers.onOpenAssigneeModal(task)} className="text-purple-600 dark:text-purple-400 hover:text-purple-900" title="Manage Assignees">
                                    <Users size={16} />
                                </button>
                            </>
                        )}
                    </div>
                </td>
            </tr>
            {isAddingSubtask && <AddSubtaskRow parentId={task.id} level={level + 1} onSave={handlers.onAddSubtask} onCancel={() => handlers.onToggleSubtaskForm(null)} />}

            {isExpanded &&
                hasChildren &&
                task.children.map((child) => (
                    <TaskRow
                        key={child.id}
                        task={child}
                        level={level + 1}
                        isExpanded={handlers.expandedRows?.has(child.id)}
                        onToggle={onToggle}
                        members={members}
                        isAdmin={isAdmin}
                        fullyShownTasks={fullyShownTasks}
                        onToggleFullText={onToggleFullText}
                        {...handlers}
                    />
                ))}
        </Fragment>
    );
};
