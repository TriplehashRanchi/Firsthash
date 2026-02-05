'use client';
import React, { useState } from 'react';
import { PackageCheck, CalendarClock, ListTodo, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { TaskManagementPanel } from '@/components/show-details/TaskManagementModal';
import AddNewBundleModalButton from '@/components/show-details/AddNewBundleModalButton';
import { dedupeTasks } from '@/lib/taskUtils';
import { importTaskBundleToDeliverable, listTaskBundles } from '@/lib/taskBundlesApi';

const DeliverablesDetails = ({
    projectId,
    deliverables,
    tasks,
    sectionTitleStyles,
    isReadOnly,
    teamMembers,
    onTaskCreate,
    onTaskUpdate,
    onTaskDelete,
    onTaskAssign,
    onTaskVoiceNote,
    onTaskBundleImported,
}) => {
    const { role } = useAuth();
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [activeDeliverableId, setActiveDeliverableId] = useState(null);
    const [activeAddTaskDeliverableId, setActiveAddTaskDeliverableId] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [bundleOptions, setBundleOptions] = useState([]);
    const [loadingBundleOptions, setLoadingBundleOptions] = useState(false);
    const [isImportingBundle, setIsImportingBundle] = useState(false);
    const [importForm, setImportForm] = useState({ bundle_id: '', due_base_date: '', skip_duplicates: true });

    if (!deliverables || deliverables.length === 0) {
        return <p className="text-slate-500 dark:text-slate-400 p-2">No deliverables specified for this project.</p>;
    }

    const getTasksForDeliverable = (deliverableId) => {
        const relatedTasks = dedupeTasks((tasks || []).filter((task) => task.deliverable_id === deliverableId));
        const completedTasks = relatedTasks.filter((task) => task.status === 'completed').length;
        return { count: relatedTasks.length, completedCount: completedTasks, tasks: relatedTasks };
    };

    const handleAddTask = (deliverableId) => {
        if (isReadOnly) return;
        setActiveAddTaskDeliverableId(deliverableId);
        setNewTaskTitle('');
    };

    const submitAddTask = (deliverableId) => {
        const title = newTaskTitle.trim();
        if (!title || isReadOnly) return;
        onTaskCreate({ title, deliverable_id: deliverableId, parent_task_id: null });
        setNewTaskTitle('');
        setActiveAddTaskDeliverableId(null);
    };

    const openImportBundleModal = async (deliverableId) => {
        if (isReadOnly) return;
        setActiveDeliverableId(deliverableId);
        setIsImportOpen(true);
        setLoadingBundleOptions(true);
        try {
            const bundles = await listTaskBundles();
            const sorted = [...(Array.isArray(bundles) ? bundles : [])].sort((a, b) => {
                const activeDelta = Number(!!b.is_active) - Number(!!a.is_active);
                if (activeDelta !== 0) return activeDelta;
                return String(a.name || '').localeCompare(String(b.name || ''));
            });
            setBundleOptions(sorted);
            setImportForm((prev) => ({
                ...prev,
                bundle_id: prev.bundle_id || (sorted[0]?.id ? String(sorted[0].id) : ''),
            }));
        } catch (error) {
            console.error('Failed to fetch task bundles:', error);
            alert(error.message || 'Could not load bundles. Please try again.');
        } finally {
            setLoadingBundleOptions(false);
        }
    };

    const handleImportBundle = async () => {
        if (!activeDeliverableId || !importForm.bundle_id) {
            alert('Please select a bundle to import.');
            return;
        }

        setIsImportingBundle(true);
        try {
            await importTaskBundleToDeliverable(activeDeliverableId, {
                bundle_id: Number(importForm.bundle_id),
                due_base_date: importForm.due_base_date || null,
                skip_duplicates: !!importForm.skip_duplicates,
            });
            if (typeof onTaskBundleImported === 'function') {
                await onTaskBundleImported();
            }
            setIsImportOpen(false);
            setActiveDeliverableId(null);
            setImportForm({ bundle_id: '', due_base_date: '', skip_duplicates: true });
        } catch (error) {
            console.error('Task bundle import failed:', error);
            alert(error.message || 'Could not import bundle. Please try again.');
        } finally {
            setIsImportingBundle(false);
        }
    };

    return (
        <div id="section-deliverables">
            <div className="md:flex justify-between items-center mb-8">
                <h3 className={sectionTitleStyles}>
                    <PackageCheck className="w-5 h-5 mr-2.5 text-indigo-500 dark:text-indigo-400" />
                    Project Deliverables
                </h3>

                <div className="flex items-center gap-2">
                    <AddNewBundleModalButton />
                    <Link href={`/${role === 'manager' ? 'manager' : 'admin'}/gopo?projectId=${projectId}&focus=deliverables`}>
                        <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Edit Deliverables</button>
                    </Link>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
                <div
                    className="grid py-2 bg-gray-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/60 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    style={{ gridTemplateColumns: '32px minmax(180px, 1fr) 170px 110px 160px 290px' }}
                >
                    <div className="pl-4 pr-2 border-r border-slate-200 dark:border-slate-700">#</div>
                    <div className="px-3 border-r border-slate-200 dark:border-slate-700">Tasks To Be Done</div>
                    <div className="px-3 border-r border-slate-200 dark:border-slate-700">Assignees</div>
                    <div className="px-3 border-r border-slate-200 dark:border-slate-700">Task Status</div>
                    <div className="px-3 border-r border-slate-200 dark:border-slate-700">Due Date</div>
                    <div className="px-2 text-right">Actions</div>
                </div>

                {deliverables.map((item, index) => {
                    const taskInfo = getTasksForDeliverable(item.id);

                    return (
                        <div key={item.id} className={index > 0 ? 'border-t border-slate-200 dark:border-slate-700/60' : ''}>
                            <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-700/60">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center leading-tight">
                                            <span className="mr-2 text-slate-500">{index + 1}.</span>
                                            {item.title}
                                        </p>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                            <ListTodo size={14} className="mr-2 text-slate-400" />
                                            {taskInfo.count > 0 ? (
                                                <span>
                                                    {taskInfo.count} {taskInfo.count === 1 ? 'Task' : 'Tasks'}
                                                    <span className="text-xs text-slate-400 ml-1">({taskInfo.completedCount} complete)</span>
                                                </span>
                                            ) : (
                                                <span className="italic text-slate-400">No tasks yet</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                        <div className="flex items-center text-slate-600 dark:text-slate-300">
                                            <CalendarClock size={14} className="mr-2 text-slate-400" />
                                            <span className="font-semibold mr-2">Final Due Date:</span>
                                            <span className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 text-sm">
                                                {item.estimated_date
                                                    ? new Date(item.estimated_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                            {!isReadOnly && (
                                                <button
                                                    onClick={() => handleAddTask(item.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <Plus size={14} />
                                                Add New Task
                                            </button>
                                        )}
                                        <button
                                            onClick={() => openImportBundleModal(item.id)}
                                            disabled={isReadOnly}
                                            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 disabled:opacity-40"
                                        >
                                            Import Bundle
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {activeAddTaskDeliverableId === item.id && !isReadOnly && (
                                <div className="px-5 pb-3 border-b border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/40">
                                    <div className="flex items-center gap-2">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && submitAddTask(item.id)}
                                            placeholder="Enter task name..."
                                            className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                                        />
                                        <button
                                            onClick={() => submitAddTask(item.id)}
                                            disabled={!newTaskTitle.trim()}
                                            className="px-3 py-2 text-xs font-semibold rounded-md bg-indigo-600 text-white disabled:bg-slate-400"
                                        >
                                            Add
                                        </button>
                                        <button
                                            onClick={() => {
                                                setActiveAddTaskDeliverableId(null);
                                                setNewTaskTitle('');
                                            }}
                                            className="px-3 py-2 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            <TaskManagementPanel
                                deliverable={item}
                                initialTasks={taskInfo.tasks}
                                showTaskListLabel={false}
                                unifiedMode={true}
                                hideTableHeader={true}
                                showAddTaskButton={false}
                                teamMembers={teamMembers}
                                onTaskCreate={onTaskCreate}
                                onTaskUpdate={onTaskUpdate}
                                onTaskDelete={onTaskDelete}
                                onTaskAssign={onTaskAssign}
                                onTaskVoiceNote={onTaskVoiceNote}
                                onTaskBundleImported={onTaskBundleImported}
                                isReadOnly={isReadOnly}
                            />
                        </div>
                    );
                })}
            </div>

            {isImportOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsImportOpen(false)} />
                    <div className="relative bg-white dark:bg-gray-900 rounded-xl w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-2xl">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Import Bundle</h4>
                            <p className="text-xs text-gray-500 mt-1">Populate tasks from a template.</p>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">Select Bundle</label>
                                <select
                                    value={importForm.bundle_id}
                                    onChange={(e) => setImportForm((prev) => ({ ...prev, bundle_id: e.target.value }))}
                                    disabled={loadingBundleOptions}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                >
                                    <option value="">Choose a template...</option>
                                    {bundleOptions.map((bundle) => (
                                        <option key={bundle.id} value={bundle.id}>
                                            {bundle.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">Due Base Date</label>
                                <input
                                    type="date"
                                    value={importForm.due_base_date}
                                    onChange={(e) => setImportForm((prev) => ({ ...prev, due_base_date: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={importForm.skip_duplicates}
                                    onChange={(e) => setImportForm((prev) => ({ ...prev, skip_duplicates: e.target.checked }))}
                                />
                                Skip duplicate task titles
                            </label>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl flex justify-end gap-3">
                            <button onClick={() => setIsImportOpen(false)} className="text-sm text-gray-600 hover:text-gray-900 dark:hover:text-gray-100">
                                Cancel
                            </button>
                            <button
                                onClick={handleImportBundle}
                                disabled={isImportingBundle || loadingBundleOptions}
                                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg shadow-sm"
                            >
                                {isImportingBundle ? 'Importing...' : 'Run Import'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliverablesDetails;
