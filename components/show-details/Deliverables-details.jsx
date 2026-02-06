'use client';
import React, { useMemo, useState } from 'react';
import { PackageCheck, CalendarClock, ListTodo, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { TaskManagementPanel } from '@/components/show-details/TaskManagementModal';
import AddNewBundleModalButton from '@/components/show-details/AddNewBundleModalButton';
import { dedupeTasks } from '@/lib/taskUtils';
import { importTaskBundleToDeliverable, importTaskBundleToDeliverable2, listTaskBundles, updateDeliverable2DueDate } from '@/lib/taskBundlesApi';

const DeliverablesDetails = ({
    projectId,
    deliverables2,
    quotationDeliverables,
    showQuotationDeliverables,
    onEnableQuotationDeliverables,
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
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [activeAddTaskDeliverableId, setActiveAddTaskDeliverableId] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [quotationAddTaskDeliverableId, setQuotationAddTaskDeliverableId] = useState(null);
    const [quotationNewTaskTitle, setQuotationNewTaskTitle] = useState('');
    const [bundleOptions, setBundleOptions] = useState([]);
    const [loadingBundleOptions, setLoadingBundleOptions] = useState(false);
    const [isImportingBundle, setIsImportingBundle] = useState(false);
    const [importForm, setImportForm] = useState({ bundle_id: '', deliverable_title: '', due_date: '' });
    const [isTitleDirty, setIsTitleDirty] = useState(false);
    const [isQuotationImportOpen, setIsQuotationImportOpen] = useState(false);
    const [activeQuotationDeliverableId, setActiveQuotationDeliverableId] = useState(null);
    const [quotationImportForm, setQuotationImportForm] = useState({ bundle_id: '', due_base_date: '', skip_duplicates: true });
    const [isEnablingQuotationDeliverables, setIsEnablingQuotationDeliverables] = useState(false);
    const [editingDueDateId, setEditingDueDateId] = useState(null);
    const [editingDueDateValue, setEditingDueDateValue] = useState('');
    const [savingDueDateId, setSavingDueDateId] = useState(null);

    const deliverableItems = useMemo(() => (Array.isArray(deliverables2) ? deliverables2 : []), [deliverables2]);
    const quotationItems = useMemo(
        () => (Array.isArray(quotationDeliverables) ? quotationDeliverables : []),
        [quotationDeliverables],
    );

    const selectedBundle = useMemo(
        () => bundleOptions.find((bundle) => String(bundle.id) === String(importForm.bundle_id)),
        [bundleOptions, importForm.bundle_id],
    );

    const getTasksForDeliverable = (deliverableId) => {
        const relatedTasks = dedupeTasks((tasks || []).filter((task) => task.deliverable_2_id === deliverableId));
        const completedTasks = relatedTasks.filter((task) => task.status === 'completed').length;
        return { count: relatedTasks.length, completedCount: completedTasks, tasks: relatedTasks };
    };

    const getTasksForQuotationDeliverable = (deliverableId) => {
        const relatedTasks = dedupeTasks((tasks || []).filter((task) => task.deliverable_id === deliverableId));
        const completedTasks = relatedTasks.filter((task) => task.status === 'completed').length;
        return { count: relatedTasks.length, completedCount: completedTasks, tasks: relatedTasks };
    };

    const handleAddTask = (deliverableId) => {
        if (isReadOnly) return;
        setActiveAddTaskDeliverableId(deliverableId);
        setNewTaskTitle('');
    };

    const handleQuotationAddTask = (deliverableId) => {
        if (isReadOnly) return;
        setQuotationAddTaskDeliverableId(deliverableId);
        setQuotationNewTaskTitle('');
    };

    const submitAddTask = (deliverableId) => {
        const title = newTaskTitle.trim();
        if (!title || isReadOnly) return;
        onTaskCreate({ title, deliverable_2_id: deliverableId, parent_task_id: null, due_date: null });
        setNewTaskTitle('');
        setActiveAddTaskDeliverableId(null);
    };

    const submitQuotationAddTask = (deliverableId) => {
        const title = quotationNewTaskTitle.trim();
        if (!title || isReadOnly) return;
        onTaskCreate({ title, deliverable_id: deliverableId, parent_task_id: null });
        setQuotationNewTaskTitle('');
        setQuotationAddTaskDeliverableId(null);
    };

    const openImportBundleModal = async () => {
        if (isReadOnly) return;
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
                deliverable_title: prev.deliverable_title || sorted[0]?.name || '',
            }));
        } catch (error) {
            console.error('Failed to fetch task bundles:', error);
            alert(error.message || 'Could not load bundles. Please try again.');
        } finally {
            setLoadingBundleOptions(false);
        }
    };

    const openQuotationImportBundleModal = async (deliverableId) => {
        if (isReadOnly) return;
        setActiveQuotationDeliverableId(deliverableId);
        setIsQuotationImportOpen(true);
        setLoadingBundleOptions(true);
        try {
            const bundles = await listTaskBundles();
            const sorted = [...(Array.isArray(bundles) ? bundles : [])].sort((a, b) => {
                const activeDelta = Number(!!b.is_active) - Number(!!a.is_active);
                if (activeDelta !== 0) return activeDelta;
                return String(a.name || '').localeCompare(String(b.name || ''));
            });
            setBundleOptions(sorted);
            setQuotationImportForm((prev) => ({
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
        if (!projectId || !importForm.bundle_id) {
            alert('Please select a bundle to import.');
            return;
        }

        if (importForm.deliverable_title && !importForm.deliverable_title.trim()) {
            alert('Deliverable title must be non-empty.');
            return;
        }

        setIsImportingBundle(true);
        try {
            const response = await importTaskBundleToDeliverable2(projectId, {
                bundle_id: Number(importForm.bundle_id),
                deliverable_title: importForm.deliverable_title.trim() || undefined,
                due_date: importForm.due_date || undefined,
            });
            if (response?.created_count !== undefined) {
                toast.success(`Created ${response.created_count} tasks`);
            } else {
                toast.success('Deliverable imported successfully.');
            }
            if (typeof onTaskBundleImported === 'function') {
                await onTaskBundleImported(response);
            }
            setIsImportOpen(false);
            setImportForm({ bundle_id: '', deliverable_title: '', due_date: '' });
            setIsTitleDirty(false);
        } catch (error) {
            console.error('Task bundle import failed:', error);
            alert(error.message || 'Could not import bundle. Please try again.');
        } finally {
            setIsImportingBundle(false);
        }
    };

    const handleQuotationImportBundle = async () => {
        if (!activeQuotationDeliverableId || !quotationImportForm.bundle_id) {
            alert('Please select a bundle to import.');
            return;
        }

        setIsImportingBundle(true);
        try {
            await importTaskBundleToDeliverable(activeQuotationDeliverableId, {
                bundle_id: Number(quotationImportForm.bundle_id),
                due_base_date: quotationImportForm.due_base_date || null,
                skip_duplicates: !!quotationImportForm.skip_duplicates,
            });
            toast.success('Bundle imported successfully.');
            if (typeof onTaskBundleImported === 'function') {
                await onTaskBundleImported();
            }
            setIsQuotationImportOpen(false);
            setActiveQuotationDeliverableId(null);
            setQuotationImportForm({ bundle_id: '', due_base_date: '', skip_duplicates: true });
        } catch (error) {
            console.error('Task bundle import failed:', error);
            alert(error.message || 'Could not import bundle. Please try again.');
        } finally {
            setIsImportingBundle(false);
        }
    };

    const startEditDueDate = (deliverable) => {
        if (isReadOnly) return;
        setEditingDueDateId(deliverable.id);
        setEditingDueDateValue(deliverable?.due_date ? String(deliverable.due_date).slice(0, 10) : '');
    };

    const cancelEditDueDate = () => {
        setEditingDueDateId(null);
        setEditingDueDateValue('');
    };

    const saveDueDate = async (deliverableId) => {
        if (!deliverableId) return;
        setSavingDueDateId(deliverableId);
        try {
            const payload = { due_date: editingDueDateValue || null };
            await updateDeliverable2DueDate(deliverableId, payload);
            toast.success('Due date updated.');
            if (typeof onTaskBundleImported === 'function') {
                await onTaskBundleImported();
            }
            cancelEditDueDate();
        } catch (error) {
            console.error('Failed to update due date:', error);
            toast.error(error.message || 'Could not update due date.');
        } finally {
            setSavingDueDateId(null);
        }
    };

    return (
        <div id="section-deliverables">
            <div className="md:flex justify-between items-center mb-8">
                <h3 className={sectionTitleStyles}>
                    <PackageCheck className="w-5 h-5 mr-2.5 text-indigo-500 dark:text-indigo-400" />
                    Internal Deliverables
                </h3>

                <div className="flex items-center gap-2">
                    {!showQuotationDeliverables && (
                        <button
                            onClick={async () => {
                                if (typeof onEnableQuotationDeliverables !== 'function') return;
                                setIsEnablingQuotationDeliverables(true);
                                await onEnableQuotationDeliverables();
                                setIsEnablingQuotationDeliverables(false);
                            }}
                            disabled={isReadOnly || typeof onEnableQuotationDeliverables !== 'function' || isEnablingQuotationDeliverables}
                            className="px-3 py-1 text-sm rounded-md border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                        >
                            {isEnablingQuotationDeliverables ? 'Importing...' : 'Import Quotation Deliverable'}
                        </button>
                    )}
                    <AddNewBundleModalButton />
                    <button
                        onClick={openImportBundleModal}
                        disabled={isReadOnly}
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        Import Deliverable
                    </button>
                </div>
            </div>

            {deliverableItems.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">No Internal Deliverables Yet</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Import a task bundle to create your first internal deliverable.</p>
                    <button
                        onClick={openImportBundleModal}
                        disabled={isReadOnly}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        <Plus size={16} />
                        Import Deliverable
                    </button>
                </div>
            ) : (
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

                    {deliverableItems.map((item, index) => {
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
                                            <div className="flex items-center text-slate-600 dark:text-slate-300 gap-2">
                                                <CalendarClock size={14} className="text-slate-400" />
                                                <span className="font-semibold">Due Date:</span>
                                                {editingDueDateId === item.id ? (
                                                    <>
                                                        <input
                                                            type="date"
                                                            value={editingDueDateValue}
                                                            onChange={(e) => setEditingDueDateValue(e.target.value)}
                                                            className="rounded-md border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 text-sm px-2 py-1"
                                                        />
                                                        <button
                                                            onClick={() => saveDueDate(item.id)}
                                                            disabled={savingDueDateId === item.id}
                                                            className="px-2 py-1 text-xs rounded-md bg-indigo-600 text-white disabled:bg-slate-400"
                                                        >
                                                            {savingDueDateId === item.id ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button
                                                            onClick={cancelEditDueDate}
                                                            className="px-2 py-1 text-xs rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 text-sm">
                                                            {item.due_date
                                                                ? new Date(item.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                                                                : 'N/A'}
                                                        </span>
                                                        {!isReadOnly && (
                                                            <button
                                                                onClick={() => startEditDueDate(item)}
                                                                className="px-2 py-1 text-xs rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                    </>
                                                )}
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
            )}

            {showQuotationDeliverables && (
                <div className="mt-8">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <p className="text-base font-semibold text-slate-800 dark:text-slate-100">Quotation Deliverables</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">These are from the original quotation and are separate from internal deliverables.</p>
                        </div>
                    </div>

                    {quotationItems.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400 p-2">No quotation deliverables specified for this project.</p>
                    ) : (
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

                            {quotationItems.map((item, index) => {
                                const taskInfo = getTasksForQuotationDeliverable(item.id);

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
                                                            {item.date
                                                                ? new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                                                                : 'N/A'}
                                                        </span>
                                                    </div>
                                                    {!isReadOnly && (
                                                        <button
                                                            onClick={() => handleQuotationAddTask(item.id)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                        >
                                                            <Plus size={14} />
                                                            Add New Task
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => openQuotationImportBundleModal(item.id)}
                                                        disabled={isReadOnly}
                                                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 disabled:opacity-40"
                                                    >
                                                        Import Bundle
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {quotationAddTaskDeliverableId === item.id && !isReadOnly && (
                                            <div className="px-5 pb-3 border-b border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/40">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={quotationNewTaskTitle}
                                                        onChange={(e) => setQuotationNewTaskTitle(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && submitQuotationAddTask(item.id)}
                                                        placeholder="Enter task name..."
                                                        className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                                                    />
                                                    <button
                                                        onClick={() => submitQuotationAddTask(item.id)}
                                                        disabled={!quotationNewTaskTitle.trim()}
                                                        className="px-3 py-2 text-xs font-semibold rounded-md bg-indigo-600 text-white disabled:bg-slate-400"
                                                    >
                                                        Add
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setQuotationAddTaskDeliverableId(null);
                                                            setQuotationNewTaskTitle('');
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
                    )}
                </div>
            )}

            {isImportOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsImportOpen(false)} />
                    <div className="relative bg-white dark:bg-gray-900 rounded-xl w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-2xl">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Import Deliverable</h4>
                            <p className="text-xs text-gray-500 mt-1">Create a new internal deliverable from a bundle.</p>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">Select Bundle</label>
                                <select
                                    value={importForm.bundle_id}
                                    onChange={(e) => {
                                        const nextValue = e.target.value;
                                        const nextBundle = bundleOptions.find((bundle) => String(bundle.id) === String(nextValue));
                                        setImportForm((prev) => ({
                                            ...prev,
                                            bundle_id: nextValue,
                                            deliverable_title: isTitleDirty ? prev.deliverable_title : nextBundle?.name || '',
                                        }));
                                    }}
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
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">Deliverable Title</label>
                                <input
                                    type="text"
                                    value={importForm.deliverable_title}
                                    onChange={(e) => {
                                        setIsTitleDirty(true);
                                        setImportForm((prev) => ({ ...prev, deliverable_title: e.target.value }));
                                    }}
                                    placeholder={selectedBundle?.name ? `Defaults to ${selectedBundle.name}` : 'Optional'}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">Due Date</label>
                                <input
                                    type="date"
                                    value={importForm.due_date}
                                    onChange={(e) => setImportForm((prev) => ({ ...prev, due_date: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                />
                            </div>
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

            {isQuotationImportOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsQuotationImportOpen(false)} />
                    <div className="relative bg-white dark:bg-gray-900 rounded-xl w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-2xl">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Import Bundle</h4>
                            <p className="text-xs text-gray-500 mt-1">Populate tasks from a template.</p>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">Select Bundle</label>
                                <select
                                    value={quotationImportForm.bundle_id}
                                    onChange={(e) => setQuotationImportForm((prev) => ({ ...prev, bundle_id: e.target.value }))}
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
                                    value={quotationImportForm.due_base_date}
                                    onChange={(e) => setQuotationImportForm((prev) => ({ ...prev, due_base_date: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={quotationImportForm.skip_duplicates}
                                    onChange={(e) => setQuotationImportForm((prev) => ({ ...prev, skip_duplicates: e.target.checked }))}
                                />
                                Skip duplicate task titles
                            </label>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl flex justify-end gap-3">
                            <button onClick={() => setIsQuotationImportOpen(false)} className="text-sm text-gray-600 hover:text-gray-900 dark:hover:text-gray-100">
                                Cancel
                            </button>
                            <button
                                onClick={handleQuotationImportBundle}
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
