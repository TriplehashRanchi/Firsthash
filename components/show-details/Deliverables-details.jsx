'use client';
import React from 'react';
import { PackageCheck, CalendarClock, ListTodo } from 'lucide-react';

// --- This component is now a pure "dumb" component. ---
// It receives all necessary data as props and has no internal state or complex logic.

const DeliverablesDetails = ({
    deliverables,
    tasks, // <-- Receives the full list of tasks for the project
    sectionTitleStyles,
    onManageTasks, // This would be the prop for future functionality to open a task modal
}) => {
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
        <div>
            <h3 className={sectionTitleStyles}>
                <PackageCheck className="w-5 h-5 mr-2.5 text-indigo-500 dark:text-indigo-400" />
                Project Deliverables
            </h3>

            <div className="mt-4 border-t border-slate-200 dark:border-slate-700/60">
                <div className="grid grid-cols-2 gap-x-4 mb-2 mt-4 px-2">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">DELIVERABLE</p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">RELATED TASKS</p>
                </div>

                {deliverables.map((item) => {
                    // For each deliverable in the list, get its task summary.
                    const taskInfo = getTasksForDeliverable(item.id);

                    return (
                        <div key={item.id} className="grid grid-cols-2 gap-x-4 py-2.5 px-2 border-b border-slate-200 dark:border-slate-700/60 last:border-b-0 group">
                            {/* Column 1: Deliverable Information (Title, Cost, Date) */}
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

                            {/* Column 2: Related Task Information and Action Button */}
                            <button
                                onClick={() => onManageTasks(item)} // <-- Calls parent handler with the deliverable object
                                className="flex items-center text-left text-sm -ml-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <ListTodo size={14} className="mr-2 text-slate-400 group-hover:text-indigo-500" />
                                {taskInfo.count > 0 ? (
                                    <div className="font-medium text-slate-600 dark:text-slate-300 group-hover:text-indigo-500">
                                        {taskInfo.count} {taskInfo.count === 1 ? 'Task' : 'Tasks'}
                                        <span className="text-xs text-slate-400 ml-1">({taskInfo.completedCount} complete)</span>
                                    </div>
                                ) : (
                                    <span className="italic text-slate-400 group-hover:text-slate-600">Create Tasks</span>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DeliverablesDetails;
