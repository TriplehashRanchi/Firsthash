'use client';
import React from 'react';
import { PackageCheck, CalendarClock, ListTodo } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { TaskManagementPanel } from '@/components/show-details/TaskManagementModal';

const DeliverablesDetails = ({
    projectId,
    deliverables,
    tasks, // <-- Receives the full list of tasks for the project
    sectionTitleStyles,
    isReadOnly,
    teamMembers,
    onTaskCreate,
    onTaskUpdate,
    onTaskDelete,
    onTaskAssign,
    onTaskVoiceNote,
}) => {
    const { role } = useAuth();
       console.log('role', role);

    // If there are no deliverables, show a message.
    if (!deliverables || deliverables.length === 0) {
        return <p className="text-slate-500 dark:text-slate-400 p-2">No deliverables specified for this project.</p>;
    }

    // Helper function to find and summarize tasks for a specific deliverable ID.
    const getTasksForDeliverable = (deliverableId) => {
        // Filter the entire tasks array to find ones linked to this deliverable.
        const relatedTasks = (tasks || []).filter((task) => task.deliverable_id === deliverableId);
        // Count how many of those tasks are marked as 'completed'.
        const completedTasks = relatedTasks.filter((task) => task.status === 'completed').length;

        return {
            count: relatedTasks.length,
            completedCount: completedTasks,
            tasks: relatedTasks, // Return the tasks themselves for potential future use
        };
    };

    return (
        <div id="section-deliverables">
            <div className="md:flex justify-between items-center mb-8">
                <h3 className={sectionTitleStyles}>
                    <PackageCheck className="w-5 h-5 mr-2.5 text-indigo-500 dark:text-indigo-400" />
                    Project Deliverables
                </h3>

                <Link href={`/${role === 'manager' ? 'manager' : 'admin'}/gopo?projectId=${projectId}&focus=deliverables`}>
                    <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Edit Deliverables</button>
                </Link>
            </div>

            <div className="space-y-6">
                {deliverables.map((item) => {
                    const taskInfo = getTasksForDeliverable(item.id);

                    return (
                        <div key={item.id} className="border border-slate-200 dark:border-slate-700/60 rounded-xl p-4">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center">
                                        {item.title}
                                        {item.is_additional_charge > 0 && (
                                            <span className="ml-3 text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                + {`₹ ${Number(item.additional_charge_amount).toLocaleString('en-IN')}`}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center">
                                        <CalendarClock size={12} className="mr-1.5" /> Est. Delivery:{' '}
                                        {item.estimated_date ? new Date(item.estimated_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                    </p>
                                </div>
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

                            <div className="mt-4">
                                <TaskManagementPanel
                                    deliverable={item}
                                    initialTasks={taskInfo.tasks}
                                    teamMembers={teamMembers}
                                    onTaskCreate={onTaskCreate}
                                    onTaskUpdate={onTaskUpdate}
                                    onTaskDelete={onTaskDelete}
                                    onTaskAssign={onTaskAssign}
                                    onTaskVoiceNote={onTaskVoiceNote}
                                    isReadOnly={isReadOnly}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DeliverablesDetails;
