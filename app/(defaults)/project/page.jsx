'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Info, Package, CalendarDays, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'; // Added more icons

// --- Mock Data (as before) ---
const initialProjects = [
    { id: 'proj1', name: 'Birthday Party Extravaganza', weddingDate: null, shoots: 2, deliverablesCompleted: 3, deliverablesTotal: 5, tasks: 1, clientName: 'Aarav Sharma', packageCost: 15000, additionalCost: 2500, status: 'ongoing' },
    { id: 'proj2', name: 'Corporate Annual Gala', weddingDate: '2024-09-15', shoots: 5, deliverablesCompleted: 8, deliverablesTotal: 10, tasks: 3, clientName: 'Priya Singh', packageCost: 75000, additionalCost: 5000, status: 'pending' },
    { id: 'proj3', name: 'Product Launch Event', weddingDate: '2024-07-20', shoots: 1, deliverablesCompleted: 2, deliverablesTotal: 2, tasks: 0, clientName: 'Rohan Mehta', packageCost: 30000, additionalCost: 0, status: 'completed' },
    { id: 'proj4', name: 'Pre-Wedding Shoot', weddingDate: null, shoots: 1, deliverablesCompleted: 0, deliverablesTotal: 1, tasks: 1, clientName: 'Sneha Reddy', packageCost: 20000, additionalCost: 1000, status: 'rejected' },
    { id: 'proj5', name: 'Music Video Production', weddingDate: null, shoots: 3, deliverablesCompleted: 1, deliverablesTotal: 4, tasks: 2, clientName: 'Vikram Kumar', packageCost: 45000, additionalCost: 7000, status: 'ongoing' },
];

const ProjectStatus = {
    ALL: 'all',
    ONGOING: 'ongoing',
    PENDING: 'pending',
    REJECTED: 'rejected',
    COMPLETED: 'completed',
};

// Enhanced statusConfig with icons and more refined colors
const statusConfig = {
    [ProjectStatus.ALL]: {
        label: 'All',
        icon: <Package size={14} className="mr-1.5" />,
        base: 'bg-blue-500 dark:bg-blue-500',
        hover: 'hover:bg-blue-600 dark:hover:bg-blue-600',
        text: 'text-white',
        pillBg: 'bg-blue-100 dark:bg-blue-400/20',
        pillText: 'text-blue-700 dark:text-blue-300',
        activePillBg: 'bg-white/20 dark:bg-blue-400/30',
        activePillText: 'text-white dark:text-blue-100',
        focusRing: 'focus:ring-blue-400'
    },
    [ProjectStatus.ONGOING]: {
        label: 'Ongoing',
        icon: <Clock size={14} className="mr-1.5 text-green-300" />, // Icon for active tab
        base: 'bg-green-500 dark:bg-green-500',
        hover: 'hover:bg-green-600 dark:hover:bg-green-600',
        text: 'text-white',
        pillBg: 'bg-green-100 dark:bg-green-400/20',
        pillText: 'text-green-700 dark:text-green-300',
        activePillBg: 'bg-white/20 dark:bg-green-400/30',
        activePillText: 'text-white dark:text-green-100',
        focusRing: 'focus:ring-green-400'
    },
    [ProjectStatus.PENDING]: {
        label: 'Pending',
        icon: <AlertTriangle size={14} className="mr-1.5 text-yellow-700 dark:text-yellow-600" />, // Icon for active tab
        base: 'bg-yellow-400 dark:bg-yellow-500',
        hover: 'hover:bg-yellow-500 dark:hover:bg-yellow-600',
        text: 'text-yellow-800 dark:text-yellow-900', // Darker text for yellow
        pillBg: 'bg-yellow-100 dark:bg-yellow-400/20',
        pillText: 'text-yellow-700 dark:text-yellow-300',
        activePillBg: 'bg-black/10 dark:bg-yellow-700/40',
        activePillText: 'text-yellow-800 dark:text-yellow-100',
        focusRing: 'focus:ring-yellow-400'
    },
    [ProjectStatus.REJECTED]: {
        label: 'Rejected',
        icon: <XCircle size={14} className="mr-1.5 text-red-300" />, // Icon for active tab
        base: 'bg-red-500 dark:bg-red-500',
        hover: 'hover:bg-red-600 dark:hover:bg-red-600',
        text: 'text-white',
        pillBg: 'bg-red-100 dark:bg-red-400/20',
        pillText: 'text-red-700 dark:text-red-300',
        activePillBg: 'bg-white/20 dark:bg-red-400/30',
        activePillText: 'text-white dark:text-red-100',
        focusRing: 'focus:ring-red-400'
    },
    [ProjectStatus.COMPLETED]: {
        label: 'Completed',
        icon: <CheckCircle size={14} className="mr-1.5 text-orange-300" />, // Icon for active tab
        base: 'bg-orange-500 dark:bg-orange-500',
        hover: 'hover:bg-orange-600 dark:hover:bg-orange-600',
        text: 'text-white',
        pillBg: 'bg-orange-100 dark:bg-orange-400/20',
        pillText: 'text-orange-700 dark:text-orange-300',
        activePillBg: 'bg-white/20 dark:bg-orange-400/30',
        activePillText: 'text-white dark:text-orange-100',
        focusRing: 'focus:ring-orange-400'
    },
};


const ProjectListPage = () => {
    const [projects, setProjects] = useState(initialProjects);
    const [activeFilter, setActiveFilter] = useState(ProjectStatus.ALL);
    // isDarkMode state can be removed if all dark mode styling is handled by Tailwind's dark: prefix
    // const [isDarkMode, setIsDarkMode] = useState(false);
    // useEffect(() => { /* ... dark mode detection ... */ }, []);

    const filteredProjects = useMemo(() => {
        if (activeFilter === ProjectStatus.ALL) return projects;
        return projects.filter(project => project.status === activeFilter);
    }, [projects, activeFilter]);

    const getStatusPillCount = (statusValue) => {
        if (statusValue === ProjectStatus.ALL) return projects.length;
        return projects.filter(p => p.status === statusValue).length;
    };

    // --- Refined Styles ---
    const pageWrapperStyles = "min-h-screen p-4 sm:p-6 lg:p-8 bg-slate-100 dark:bg-slate-900"; // Lighter light bg, consistent dark
    const headerContainerStyles = "mb-8"; // Container for page title and filters
    const pageTitleStyles = "text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-5";
    
    const filterTabsContainerStyles = "flex flex-wrap gap-2 items-center bg-slate-200 dark:bg-slate-800/70 p-1.5 rounded-xl shadow-sm"; // Softer shadow
    const tabButtonBaseStyles = "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900"; // Adjusted padding, added flex items-center
    const inactiveTabStyles = "bg-transparent hover:bg-slate-300/50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400";
    
    const tableWrapperStyles = "overflow-x-auto bg-white dark:bg-slate-800 shadow-lg rounded-lg"; // Softer shadow, consistent rounding
    const tableStyles = "min-w-full";
    const thStyles = "px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap border-b border-slate-200 dark:border-slate-700"; // Changed border style
    const tdStyles = "px-6 py-4 whitespace-nowrap text-sm";
    const textDefault = "text-slate-700 dark:text-slate-200";
    const textMuted = "text-slate-500 dark:text-slate-400";
    const rowHoverStyles = "hover:bg-slate-50 dark:hover:bg-slate-700/40"; // Softer hover


    const formatDate = (dateString) => {
        if (!dateString) return <span className={`${textMuted} italic`}>No Date</span>; // Italicized
        try {
            const date = new Date(dateString);
            return (
                <div className="flex items-center gap-1.5">
                    <CalendarDays size={14} className={textMuted} />
                    <span>{date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
            );
        } catch (e) {
            return <span className="text-red-500 dark:text-red-400">Invalid Date</span>;
        }
    };

    return (
        <div className={pageWrapperStyles}>
            <div className={headerContainerStyles}>
                <h1 className={pageTitleStyles}>Projects Overview</h1> {/* Added a page title */}
                <div className={filterTabsContainerStyles}>
                    {Object.values(ProjectStatus).map(statusValue => {
                        const config = statusConfig[statusValue];
                        const isActive = activeFilter === statusValue;
                        const count = getStatusPillCount(statusValue);

                        return (
                            <button
                                key={statusValue}
                                onClick={() => setActiveFilter(statusValue)}
                                className={`
                                    ${tabButtonBaseStyles}
                                    ${isActive
                                        ? `${config.base} ${config.text} shadow-md ${config.focusRing}`
                                        : `${inactiveTabStyles} focus:ring-slate-500 dark:focus:ring-slate-600`
                                    }
                                `}
                            >
                                {isActive && config.icon} {/* Show icon only on active tab for less clutter */}
                                {config.label}
                                <span className={`ml-2 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide
                                    ${isActive
                                        ? `${config.activePillBg} ${config.activePillText}`
                                        : `${config.pillBg} ${config.pillText}`
                                    }
                                `}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={tableWrapperStyles}>
                <table className={tableStyles}>
                    <thead className="bg-slate-50 dark:bg-slate-800/50"> {/* Slightly different header bg */}
                        <tr>
                            <th scope="col" className={thStyles}>Name</th>
                            <th scope="col" className={thStyles}>Event Date</th>
                            <th scope="col" className={`${thStyles} text-center`}>Shoots</th> {/* Centered */}
                            <th scope="col" className={`${thStyles} text-center`}>Deliverables</th> {/* Centered */}
                            <th scope="col" className={`${thStyles} text-center`}>Tasks</th> {/* Centered */}
                            <th scope="col" className={thStyles}>Client</th>
                            <th scope="col" className={`${thStyles} text-right`}> {/* Right aligned */}
                                <div className="inline-flex items-center gap-1">
                                    Package Cost
                                    <Info size={14} className={textMuted} title="Base cost of the project package" />
                                </div>
                            </th>
                            <th scope="col" className={`${thStyles} text-right`}> {/* Right aligned */}
                                <div className="inline-flex items-center gap-1">
                                    Additional Cost
                                    <Info size={14} className={textMuted} title="Extra charges beyond package" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => (
                                <tr key={project.id} className={`${rowHoverStyles} transition-colors duration-150`}>
                                    <td className={`${tdStyles} font-medium ${textDefault}`}>
                                        {project.name}
                                    </td>
                                    <td className={`${tdStyles} ${textDefault}`}>{formatDate(project.weddingDate)}</td>
                                    <td className={`${tdStyles} ${textDefault} text-center`}>{project.shoots}</td>
                                    <td className={`${tdStyles} ${textDefault} text-center`}>
                                        {project.deliverablesCompleted}/{project.deliverablesTotal}
                                    </td>
                                    <td className={`${tdStyles} ${textDefault} text-center`}>{project.tasks}</td>
                                    <td className={`${tdStyles} ${textDefault}`}>{project.clientName}</td>
                                    <td className={`${tdStyles} font-medium ${textDefault} text-right`}>
                                        ₹{project.packageCost.toLocaleString()}
                                    </td>
                                    <td className={`${tdStyles} ${textDefault} text-right`}> {/* Default text color for non-zero */}
                                        ₹{project.additionalCost.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="px-6 py-20 text-center"> {/* Increased padding */}
                                    <div className="flex flex-col items-center">
                                        <Package size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                                        <p className="text-xl font-medium text-slate-500 dark:text-slate-400 mb-1">
                                            No projects found.
                                        </p>
                                        <p className="text-sm text-slate-400 dark:text-slate-500">
                                            Try selecting a different status or adding new projects.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProjectListPage;





