'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { getAuth } from 'firebase/auth';
import { Plus, Trash2, ChevronDown, ChevronRight, Loader2, User, Briefcase, ChevronUp, CalendarDays } from 'lucide-react';

// --- Configuration ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const apiClient = axios.create({ baseURL: API_URL });

// --- Helper: Get Auth Token ---
const getAuthToken = async () => {
    const user = getAuth().currentUser;
    if (!user) throw new Error('User not authenticated.');
    return await user.getIdToken();
};

// --- Component for the Main Task Creation/Assignment Form ---
const AddTaskForm = ({ onAddTask, projects, deliverables, parentTasks, assignedToId = null, isAssigning = false }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // State for each individual link type
    const [linkedProjectId, setLinkedProjectId] = useState('');
    const [linkedDeliverableId, setLinkedDeliverableId] = useState('');
    const [linkedParentTaskId, setLinkedParentTaskId] = useState('');

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDueDate('');
        setLinkedProjectId('');
        setLinkedDeliverableId('');
        setLinkedParentTaskId('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setIsSaving(true);

        const taskData = {
            title,
            description,
            due_date: dueDate || null,
            project_id: linkedProjectId || null,
            deliverable_id: linkedDeliverableId || null,
            parent_task_id: linkedParentTaskId || null,
            // If an assignedToId is provided, add it to the task data
            ...(assignedToId && { assigned_to: assignedToId }),
        };

        try {
            await onAddTask(taskData);
            resetForm();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`p-5 bg-white rounded-xl shadow-lg border border-gray-200 mb-8 space-y-4 ${isAssigning ? 'bg-indigo-50 border-indigo-200' : ''}`}>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isAssigning ? 'What is the new task for this user?' : 'What is a new personal task?'}
                className="w-full text-lg border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
            />
            <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-600 appearance-none bg-white dark:bg-gray-800"
                />
            </div>

            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description (optional)..."
                className="w-full border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="2"
            />

            {/* Linking Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                    <label className="text-sm font-medium text-gray-700">Link to Project</label>
                    <select
                        value={linkedProjectId}
                        onChange={(e) => {
                            setLinkedProjectId(e.target.value);
                            setLinkedDeliverableId('');
                            setLinkedParentTaskId('');
                        }}
                        className="w-full mt-1 border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">-- None --</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Link to Deliverable</label>
                    <select
                        value={linkedDeliverableId}
                        onChange={(e) => {
                            setLinkedDeliverableId(e.target.value);
                            setLinkedProjectId('');
                            setLinkedParentTaskId('');
                        }}
                        className="w-full mt-1 border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">-- None --</option>
                        {deliverables.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.project_name} / {d.title}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Link to Parent Task</label>
                    <select
                        value={linkedParentTaskId}
                        onChange={(e) => {
                            setLinkedParentTaskId(e.target.value);
                            setLinkedProjectId('');
                            setLinkedDeliverableId('');
                        }}
                        className="w-full mt-1 border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">-- None --</option>
                        {parentTasks.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center justify-center w-48 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
                >
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : isAssigning ? 'Assign Task' : 'Add Personal Task'}
                </button>
            </div>
        </form>
    );
};

// --- Component to display a single Task Item ---
const TaskItem = ({ task, onToggleComplete, onDelete, level = 0 }) => {
    const isCompleted = task.status === 'completed';

    // In a real app, you might get the assignee's name from a members list
    const assigneeName = task.assignee_details?.name || 'Unassigned';

    const formattedDueDate = task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

    const isOverdue = task.due_date && !isCompleted && new Date(task.due_date) < new Date();

    return (
        <div style={{ marginLeft: `${level * 1.5}rem` }} className="my-1 border-b border-gray-100 last:border-b-0 py-2">
            <div className="flex items-center gap-3 p-2 rounded-lg">
                <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => onToggleComplete(task, !isCompleted)}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded-full focus:ring-indigo-500 cursor-pointer"
                />
                <div className="flex-grow">
                    <span className={`text-gray-800 ${isCompleted ? 'line-through text-gray-400' : ''}`}>{task.title}</span>
                </div>

                {formattedDueDate && <span className={`text-sm px-2 py-1 rounded-md ${isOverdue ? 'text-red-700 bg-red-100' : 'text-gray-600 bg-gray-100'}`}>{formattedDueDate}</span>}

                <button onClick={() => onDelete(task.id)} className="text-gray-400 hover:text-red-600" title="Delete task">
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

// --- NEW: Admin Task Assignment Component ---
const AdminTaskAssignment = ({ members, tasks, projects, deliverables, onAddTask, onToggleComplete, onDelete }) => {
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [isSectionVisible, setIsSectionVisible] = useState(true);

    const assignedTasks = useMemo(() => {
        if (!selectedMemberId) return [];
        // Filter tasks that are directly assigned to the selected member
        return tasks.filter((task) => task.assigned_to === selectedMemberId);
    }, [tasks, selectedMemberId]);

    // Parent tasks for the assignment form should be relevant to the selected user or unassigned
    const relevantParentTasks = useMemo(() => {
        return tasks.filter((task) => !task.parent_task_id && task.status !== 'completed' && (!task.assigned_to || task.assigned_to === selectedMemberId));
    }, [tasks, selectedMemberId]);

    return (
        <div className="mt-12 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
            <button onClick={() => setIsSectionVisible(!isSectionVisible)} className="w-full flex justify-between items-center text-left p-2 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                    <Briefcase className="text-indigo-600" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Admin Task Assignment</h2>
                        <p className="text-gray-500">Assign and manage tasks for your team members.</p>
                    </div>
                </div>
                {isSectionVisible ? <ChevronUp /> : <ChevronDown />}
            </button>

            {isSectionVisible && (
                <div className="mt-6">
                    <label htmlFor="member-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Select a Team Member to Manage Their Tasks:
                    </label>
                    <select
                        id="member-select"
                        value={selectedMemberId}
                        onChange={(e) => setSelectedMemberId(e.target.value)}
                        className="w-full md:w-1/2 border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">-- Select a Member --</option>
                        {members.map((member) => (
                            <option key={member.id} value={member.id}>
                                {member.name}
                            </option>
                        ))}
                    </select>

                    {selectedMemberId && (
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold mb-4 text-gray-700">Tasks for {members.find((m) => m.id === selectedMemberId)?.name}</h3>
                            {/* Form to add a new task for the selected user */}
                            <AddTaskForm onAddTask={onAddTask} projects={projects} deliverables={deliverables} parentTasks={relevantParentTasks} assignedToId={selectedMemberId} isAssigning={true} />

                            {/* List of existing tasks for the selected user */}
                            <div className="mt-6 border-t border-gray-200 pt-4">
                                {assignedTasks.length > 0 ? (
                                    assignedTasks.map((task) => <TaskItem key={task.id} task={task} onToggleComplete={onToggleComplete} onDelete={onDelete} />)
                                ) : (
                                    <div className="text-center py-10 text-gray-400">
                                        <User size={40} className="mx-auto mb-2" />
                                        <h4 className="text-lg font-semibold">No tasks assigned.</h4>
                                        <p>Assign a task using the form above.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Main Page Component ---
export default function GeneralTasksPage() {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [deliverables, setDeliverables] = useState([]);
    const [members, setMembers] = useState([]); // State for team members
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // TODO: Implement a real admin check based on user roles or claims
    const isAdmin = true; // For demonstration, assume the user is an admin.

    const fetchData = useCallback(async () => {
        setLoading(true);
        const user = getAuth().currentUser;
        if (!user) {
            setError('Authentication failed.');
            return setLoading(false);
        }

        try {
            const token = await user.getIdToken();
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch all data concurrently as per your snippet
            const [projectsRes, tasksRes, membersRes, deliverablesRes] = await Promise.all([
                apiClient.get('/api/projects', { headers }),
                apiClient.get('/api/tasks', { headers }),
                apiClient.get('/api/members', { headers }),
                apiClient.get('/api/deliverables', { headers }),
            ]);

            setProjects(projectsRes.data);
            setTasks(tasksRes.data);
            setMembers(membersRes.data);
            setDeliverables(deliverablesRes.data);
        } catch (err) {
            toast.error('Failed to load dashboard data.');
            setError(err.response?.data?.error || 'Could not fetch data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddTask = async (taskData) => {
        const tempId = `temp_${Date.now()}`;
        // Optimistically add the new task to the UI
        const newTask = { ...taskData, id: tempId, status: 'to_do' };
        setTasks((currentTasks) => [...currentTasks, newTask]);

        try {
            const token = await getAuthToken();
            const response = await apiClient.post('/api/tasks', taskData, { headers: { Authorization: `Bearer ${token}` } });
            // Replace temporary task with the real one from the server
            setTasks((currentTasks) => currentTasks.map((t) => (t.id === tempId ? response.data : t)));
            toast.success('Task added successfully!');
        } catch (err) {
            toast.error('Failed to add task.');
            // Rollback on failure
            setTasks((currentTasks) => currentTasks.filter((t) => t.id !== tempId));
            throw err;
        }
    };

    const handleToggleComplete = async (task, isCompleted) => {
        const newStatus = isCompleted ? 'completed' : 'to_do';
        const originalTasks = [...tasks];
        // Optimistic UI update
        const updatedTasks = tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t));
        setTasks(updatedTasks);
        try {
            const token = await getAuthToken();
            await apiClient.put(`/api/tasks/${task.id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (err) {
            toast.error('Failed to update status.');
            setTasks(originalTasks); // Rollback on failure
        }
    };

    const handleDeleteTask = async (taskId) => {
        const originalTasks = [...tasks];
        // Optimistic UI update
        setTasks((current) => current.filter((t) => t.id !== taskId));
        try {
            const token = await getAuthToken();
            await apiClient.delete(`/api/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Task deleted.');
        } catch (err) {
            toast.error('Failed to delete task.');
            setTasks(originalTasks); // Rollback on failure
        }
    };

    // Unassigned tasks for the "My Tasks" section
    const personalTasks = useMemo(() => {
        const userId = getAuth().currentUser?.uid;
        // Shows tasks assigned to no one OR explicitly to the current user
        return tasks.filter((task) => !task.parent_task_id && (!task.assigned_to || task.assigned_to === userId) && !task.project_id && !task.deliverable_id);
    }, [tasks]);

    const allParentTasks = useMemo(() => {
        return tasks.filter((task) => !task.parent_task_id && task.status !== 'completed');
    }, [tasks]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
            </div>
        );
    }

    return (
        <main className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">My Tasks</h1>
                <p className="text-gray-500 mb-6">Create your own standalone tasks here.</p>

                <AddTaskForm onAddTask={handleAddTask} projects={projects} deliverables={deliverables} parentTasks={allParentTasks} />

                <div className="mt-8 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                    {personalTasks.length > 0 ? (
                        personalTasks.map((task) => <TaskItem key={task.id} task={task} onToggleComplete={handleToggleComplete} onDelete={handleDeleteTask} />)
                    ) : (
                        <div className="text-center py-16 text-gray-400">
                            <h3 className="text-lg font-semibold">All Clear!</h3>
                            <p>No personal tasks found. Add one above to get started.</p>
                        </div>
                    )}
                </div>

                {/* --- Admin Section --- */}
                {isAdmin && (
                    <AdminTaskAssignment
                        members={members}
                        tasks={tasks}
                        projects={projects}
                        deliverables={deliverables}
                        onAddTask={handleAddTask}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDeleteTask}
                    />
                )}
            </div>
        </main>
    );
}
