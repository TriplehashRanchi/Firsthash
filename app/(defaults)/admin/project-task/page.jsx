// app/tasks/page.jsx
'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { Plus, Pencil, CheckCircle2, Calendar as CalendarIcon, X, Users, CornerDownRight, MessageSquarePlus, Trash2 } from 'lucide-react';

// --- Mock Data ---
const initialTasks = [
    {
        id: 1,
        client: 'Kunal Kumar',
        projectName: 'E-commerce Redesign',
        task: 'Design the new landing page hero section',
        assignedTo: ['Sana V.', 'David L.'],
        dueDate: '2024-08-15',
        status: 'todo',
        subTasks: [
            { id: 101, task: 'Create wireframes for hero section', assignedTo: ['Sana V.'], dueDate: '2024-08-05', status: 'completed' },
            { id: 102, task: 'Select final color palette', assignedTo: [], dueDate: '2024-08-08', status: 'todo' },
        ],
    },
    {
        id: 2,
        client: 'Rohan Sharma',
        projectName: 'Mobile App Development',
        task: 'Develop the user authentication flow',
        assignedTo: ['Alex G.'],
        dueDate: '2024-08-20',
        status: 'todo',
        subTasks: [],
    },
    {
        id: 3,
        client: 'Pixel Perfect Inc.',
        projectName: 'Corporate Website Update',
        task: 'Fix the responsive layout bugs on the pricing page',
        assignedTo: ['Leo R.'],
        dueDate: '2024-08-10',
        status: 'completed',
        subTasks: [],
    },
];

const TEAM_MEMBERS = [
    { id: 1, name: 'Sana V.', role: 'UI/UX Designer' },
    { id: 2, name: 'David L.', role: 'Frontend Developer' },
    { id: 3, name: 'Alex G.', role: 'Backend Developer' },
    { id: 4, name: 'Maria K.', role: 'DevOps Engineer' },
    { id: 5, name: 'John D.', role: 'Project Manager' },
    { id: 6, name: 'Chris P.', role: 'QA Tester' },
    { id: 7, name: 'Leo R.', role: 'Frontend Developer' },
    { id: 8, name: 'Mia W.', role: 'Content Strategist' },
];

// --- Helper Components ---
const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const UserAvatar = ({ name }) => {
    const colors = ['bg-pink-500', 'bg-indigo-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return <div title={name} className={`w-8 h-8 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-xs ring-2 ring-white dark:ring-slate-800 transition-transform hover:scale-110`}> {getInitials(name)} </div>;
};

const AssignmentModal = ({ isOpen, onClose, onSave, currentAssignees, teamMembers }) => {
    const [selectedMembers, setSelectedMembers] = useState([]);
    useEffect(() => { isOpen && setSelectedMembers(currentAssignees || []); }, [isOpen, currentAssignees]);
    if (!isOpen) return null;
    const handleToggleMember = (memberName) => setSelectedMembers(prev => prev.includes(memberName) ? prev.filter(name => name !== memberName) : [...prev, memberName]);
    const handleSave = () => { onSave(selectedMembers); onClose(); };
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Users size={20} /> Assign Members</h3><button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={24} /></button></div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">{teamMembers.map((member) => (<label key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"><div><p className="font-medium text-slate-800 dark:text-slate-200">{member.name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{member.role}</p></div><input type="checkbox" checked={selectedMembers.includes(member.name)} onChange={() => handleToggleMember(member.name)} className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-600 dark:border-slate-500" /></label>))}</div>
                <div className="mt-6 flex justify-end space-x-3"><button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 dark:bg-slate-600 dark:text-slate-200 rounded-md hover:bg-slate-200 dark:hover:bg-slate-500">Cancel</button><button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800">Save</button></div>
            </div>
        </div>
    );
};

const AddSubTaskForm = ({ onSave, onCancel, openAssignmentModal }) => {
    const [subTask, setSubTask] = useState({ task: '', assignedTo: [], dueDate: '' });
    const handleSave = () => { if (!subTask.task || !subTask.dueDate) { alert('Please fill in task description and due date.'); return; } onSave({ ...subTask, id: Date.now(), status: 'todo' }); };
    const handleAssignClick = () => openAssignmentModal(subTask.assignedTo, (newAssignees) => setSubTask(prev => ({ ...prev, assignedTo: newAssignees })));
    return (
        <tr className="bg-slate-100 dark:bg-slate-900/50">
            <td className="px-6 py-4" colSpan="2"><input type="text" placeholder="Enter new sub-task description..." value={subTask.task} onChange={(e) => setSubTask(p => ({ ...p, task: e.target.value }))} className="w-full bg-transparent p-2 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none" /></td>
            <td className="px-6 py-4"><button onClick={handleAssignClick} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 font-medium transition-colors text-xs"><Users size={16} />{subTask.assignedTo.length > 0 ? `${subTask.assignedTo.length} Assigned` : 'Assign'}</button></td>
            <td className="px-6 py-4"><input type="date" value={subTask.dueDate} onChange={(e) => setSubTask(p => ({ ...p, dueDate: e.target.value }))} className="w-full bg-transparent p-2 rounded-md border border-slate-300 dark:border-slate-600 text-slate-500" style={{ colorScheme: 'dark' }} /></td>
            <td className="px-6 py-4 text-center"><span className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">To-Do</span></td>
            <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                    <button onClick={onCancel} className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 dark:text-slate-200 dark:bg-slate-600 dark:hover:bg-slate-500 rounded-md transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-sm">
                        Save
                    </button>
                </div>
            </td>

        </tr>
    );
};

// --- The Main Page Component ---
export default function TaskManagementPage() {
    const [tasks, setTasks] = useState(initialTasks);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ assignees: [], onSave: () => { } });
    const [openSubTaskFormFor, setOpenSubTaskFormFor] = useState(null);

    const openAssignmentModal = (currentAssignees, onSaveCallback) => {
        setModalConfig({ assignees: currentAssignees, onSave: onSaveCallback });
        setIsModalOpen(true);
    };

    const handleUpdateTask = (taskId, newValues) => setTasks(current => current.map(t => t.id === taskId ? { ...t, ...newValues } : t));
    const handleSetComplete = (taskId) => handleUpdateTask(taskId, { status: 'completed' });

    const handleAddSubTask = (parentId, newSubTask) => {
        setTasks(currentTasks => currentTasks.map(task => task.id === parentId ? { ...task, subTasks: [...task.subTasks, newSubTask] } : task));
        setOpenSubTaskFormFor(null);
    };

    const handleUpdateSubTaskAssignment = (parentId, subTaskId, newAssignees) => {
        setTasks(currentTasks => currentTasks.map(task => task.id === parentId ? { ...task, subTasks: task.subTasks.map(sub => sub.id === subTaskId ? { ...sub, assignedTo: newAssignees } : sub) } : task));
    };

    const handleDeleteSubTask = (parentId, subTaskId) => {
        if (window.confirm('Are you sure you want to delete this sub-task?')) {
            setTasks(currentTasks => currentTasks.map(task => task.id === parentId ? { ...task, subTasks: task.subTasks.filter(sub => sub.id !== subTaskId) } : task));
        }
    };

    const formatDate = (dateStr) => dateStr ? new Date(dateStr.replaceAll('-', '/')).toLocaleDateString('en-GB') : 'N/A';

    return (
        <>
            <AssignmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={modalConfig.onSave} currentAssignees={modalConfig.assignees} teamMembers={TEAM_MEMBERS} />
            <div className="bg-gray-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 min-h-screen w-full p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-8"><h1 className="text-3xl font-bold text-slate-900 dark:text-white">Task Management</h1></header>
                    <div className="bg-white dark:bg-slate-800/60 rounded-xl shadow-lg overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <tr className='border-b border-slate-200 dark:border-slate-700'>
                                        <th scope="col" className="px-6 py-4 font-medium">Project / Client</th>
                                        <th scope="col" className="px-6 py-4 font-medium">Tasks to be done</th>
                                        <th scope="col" className="px-6 py-4 font-medium">Assign to</th>
                                        <th scope="col" className="px-6 py-4 font-medium">Due Date</th>
                                        <th scope="col" className="px-6 py-4 font-medium text-center">Status</th>
                                        <th scope="col" className="px-6 py-4 font-medium text-center">Subtask</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                                    {tasks.map((task) => (
                                        <Fragment key={task.id}>
                                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-slate-900 dark:text-white">{task.projectName}</div><div className="text-xs text-slate-500 dark:text-slate-400">{task.client}</div></td>
                                                <td className="px-6 py-4 max-w-sm"><p className="text-slate-700 dark:text-slate-200">{task.task}</p></td>
                                                <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center" onClick={() => openAssignmentModal(task.assignedTo, (newA) => handleUpdateTask(task.id, { assignedTo: newA }))}><button className="flex items-center">{task.assignedTo.length > 0 ? (<><div className="flex -space-x-2 pr-2">{task.assignedTo.map(name => <UserAvatar key={name} name={name} />)}</div><span className="p-1.5 rounded-full bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-600/50 dark:hover:bg-slate-600" title="Edit assignment"><Pencil size={14} className="text-slate-500 dark:text-slate-400" /></span></>) : (<span className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 font-medium transition-colors text-xs" title="Assign task"><Plus size={16} />Assign</span>)}</button></div></td>
                                                <td className="px-6 py-4 whitespace-nowrap"><div className="relative group"><span className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><CalendarIcon size={16} className="text-slate-400 dark:text-slate-500" />{formatDate(task.dueDate)}</span><input type="date" value={task.dueDate} onChange={(e) => handleUpdateTask(task.id, { dueDate: e.target.value })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" style={{ colorScheme: 'dark' }} /></div></td>
                                                <td className="px-6 py-4 text-center">{task.status === 'todo' ? (<button onClick={() => handleSetComplete(task.id)} className="px-4 py-1.5 rounded-md text-xs font-semibold text-yellow-800 bg-yellow-100 hover:bg-yellow-200 dark:text-yellow-200 dark:bg-yellow-500/20 dark:hover:bg-yellow-500/30 border border-yellow-200 dark:border-yellow-500/30">To-Do</button>) : (<span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-500/20"><CheckCircle2 size={16} />Completed</span>)}</td>
                                                <td className="px-6 py-4 text-center"><button onClick={() => setOpenSubTaskFormFor(openSubTaskFormFor === task.id ? null : task.id)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Add sub-task"><MessageSquarePlus size={18} className="text-slate-500" /></button></td>
                                            </tr>
                                            {task.subTasks.map(sub => (
                                                <tr key={sub.id} className="bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-100/70 dark:hover:bg-slate-700/40">
                                                    <td></td>
                                                    <td className="pl-12 pr-6 py-3 max-w-sm"><div className="flex items-center gap-2"><CornerDownRight size={16} className="text-slate-400 dark:text-slate-500 flex-shrink-0" /><p className="text-slate-600 dark:text-slate-300">{sub.task}</p></div></td>
                                                    <td className="px-6 py-3 whitespace-nowrap"><button className="flex items-center" onClick={() => openAssignmentModal(sub.assignedTo, (newA) => handleUpdateSubTaskAssignment(task.id, sub.id, newA))}>{sub.assignedTo.length > 0 ? (<><div className="flex -space-x-2 pr-2">{sub.assignedTo.map(name => <UserAvatar key={name} name={name} />)}</div><span className="p-1.5 rounded-full bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-600/50 dark:hover:bg-slate-600" title="Edit assignment"><Pencil size={14} className="text-slate-500 dark:text-slate-400" /></span></>) : (<span className="text-xs text-slate-400 italic hover:text-slate-600 dark:hover:text-slate-200">Assign</span>)}</button></td>
                                                    <td className="px-6 py-3 whitespace-nowrap"><div className="flex items-center gap-2 text-sm text-slate-500"><CalendarIcon size={14} />{formatDate(sub.dueDate)}</div></td>
                                                    <td className="px-6 py-3 text-center">{sub.status === 'todo' ? (<span className="px-3 py-1 rounded-full text-xs font-medium text-yellow-800 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-500/10">To-Do</span>) : (<span className="px-3 py-1 rounded-full inline-flex items-center gap-1.5 text-xs font-medium text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-500/10"><CheckCircle2 size={14} />Completed</span>)}</td>
                                                    <td className="px-6 py-3 text-center"><button onClick={() => handleDeleteSubTask(task.id, sub.id)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors" title="Delete sub-task"><Trash2 size={16} className="text-slate-500 hover:text-red-600 dark:hover:text-red-400" /></button></td>
                                                </tr>
                                            ))}
                                            {openSubTaskFormFor === task.id && (<AddSubTaskForm onSave={(newSubTask) => handleAddSubTask(task.id, newSubTask)} onCancel={() => setOpenSubTaskFormFor(null)} openAssignmentModal={openAssignmentModal} />)}
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}