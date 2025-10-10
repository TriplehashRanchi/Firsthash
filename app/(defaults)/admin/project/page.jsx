'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Package, CalendarDays, CheckCircle, XCircle, AlertTriangle, Clock, Eye, Loader2, Trash, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import axios from 'axios';
import Swal from 'sweetalert2';

// --- Constants (Keep these as they are) ---
const ProjectStatus = {
    ALL: 'all',
    ONGOING: 'ongoing',
    PENDING: 'pending',
    REJECTED: 'rejected',
    COMPLETED: 'completed',
};
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
        focusRing: 'focus:ring-blue-400',
    },
    [ProjectStatus.ONGOING]: {
        label: 'Ongoing',
        icon: <Clock size={14} className="mr-1.5 text-green-300" />,
        base: 'bg-green-500 dark:bg-green-500',
        hover: 'hover:bg-green-600 dark:hover:bg-green-600',
        text: 'text-white',
        pillBg: 'bg-green-100 dark:bg-green-400/20',
        pillText: 'text-green-700 dark:text-green-300',
        activePillBg: 'bg-white/20 dark:bg-green-400/30',
        activePillText: 'text-white dark:text-green-100',
        focusRing: 'focus:ring-green-400',
    },
    [ProjectStatus.PENDING]: {
        label: 'Pending',
        icon: <AlertTriangle size={14} className="mr-1.5 text-yellow-700 dark:text-yellow-600" />,
        base: 'bg-yellow-400 dark:bg-yellow-500',
        hover: 'hover:bg-yellow-500 dark:hover:bg-yellow-600',
        text: 'text-yellow-800 dark:text-yellow-900',
        pillBg: 'bg-yellow-100 dark:bg-yellow-400/20',
        pillText: 'text-yellow-700 dark:text-yellow-300',
        activePillBg: 'bg-black/10 dark:bg-yellow-700/40',
        activePillText: 'text-yellow-800 dark:text-yellow-100',
        focusRing: 'focus:ring-yellow-400',
    },
    [ProjectStatus.REJECTED]: {
        label: 'Rejected',
        icon: <XCircle size={14} className="mr-1.5 text-red-300" />,
        base: 'bg-red-500 dark:bg-red-500',
        hover: 'hover:bg-red-600 dark:hover:bg-red-600',
        text: 'text-white',
        pillBg: 'bg-red-100 dark:bg-red-400/20',
        pillText: 'text-red-700 dark:text-red-300',
        activePillBg: 'bg-white/20 dark:bg-red-400/30',
        activePillText: 'text-white dark:text-red-100',
        focusRing: 'focus:ring-red-400',
    },
    [ProjectStatus.COMPLETED]: {
        label: 'Completed',
        icon: <CheckCircle size={14} className="mr-1.5 text-orange-300" />,
        base: 'bg-orange-500 dark:bg-orange-500',
        hover: 'hover:bg-orange-600 dark:hover:bg-orange-600',
        text: 'text-white',
        pillBg: 'bg-orange-100 dark:bg-orange-400/20',
        pillText: 'text-orange-700 dark:text-orange-300',
        activePillBg: 'bg-white/20 dark:bg-orange-400/30',
        activePillText: 'text-white dark:text-orange-100',
        focusRing: 'focus:ring-orange-400',
    },
};
// --- Style constants (Keep these as they are) ---
const pageWrapperStyles = 'min-h-screen p-4 sm:p-6 lg:p-8 ';
const headerContainerStyles = 'mb-8';
const pageTitleStyles = 'text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-5';
const filterTabsContainerStyles = 'flex flex-wrap gap-2 items-center bg-slate-200 dark:bg-slate-800/70 p-1.5 rounded-xl shadow-sm';
const tabButtonBaseStyles =
    'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900';
const inactiveTabStyles = 'bg-transparent hover:bg-slate-300/50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400';
const tableWrapperStyles = 'overflow-x-auto bg-white dark:bg-slate-800 shadow-lg rounded-lg';
const tableStyles = 'min-w-full';
const thStyles = 'px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap border-b border-slate-200 dark:border-slate-700';
const tdStyles = 'px-6 py-4 whitespace-nowrap text-sm';
const textDefault = 'text-slate-700 dark:text-slate-200';
const textMuted = 'text-slate-500 dark:text-slate-400';
const rowHoverStyles = 'hover:bg-slate-50 dark:hover:bg-slate-700/40';
const actionButtonStyles = 'p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-700/50 transition-colors';
const breadcrumbLinkStyles = 'text-blue-600 hover:underline dark:text-blue-400';
const breadcrumbSeparatorStyles = "before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-gray-500 dark:text-gray-500";
const breadcrumbCurrentPageStyles = 'text-gray-600 dark:text-gray-400';

const ProjectListPage = () => {
    const [projects, setProjects] = useState([]);
    const [allProjects, setAllProjects] = useState([]); // Store all projects for pill counts
    const [activeFilter, setActiveFilter] = useState(ProjectStatus.ALL);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [projectsPerPage] = useState(15);
    const router = useRouter();
    const { currentUser } = useAuth();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    // --- Data Fetching Effect ---
    useEffect(() => {
        const fetchProjects = async () => {
            if (!currentUser) return;

            setIsLoading(true);
            setError(null);
            try {
                const token = await currentUser.getIdToken();
                const endpoint = `${API_URL}/api/projects`;

                // Fetch the filtered list for display
                const response = await axios.get(endpoint, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { status: activeFilter },
                });
                setProjects(response.data);

                // If we're on 'all', we can update the master list for counts
                if (activeFilter === ProjectStatus.ALL) {
                    setAllProjects(response.data);
                } else if (allProjects.length === 0) {
                    // If we load a filtered view first, fetch the 'all' list in the background for accurate counts
                    const allResponse = await axios.get(endpoint, {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { status: 'all' },
                    });
                    setAllProjects(allResponse.data);
                }
            } catch (err) {
                console.error('Failed to fetch projects:', err);
                setError('Could not load projects. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, [currentUser, activeFilter]);

    // --- Helper function for Pill Counts ---
    const getStatusPillCount = useCallback(
        (statusValue) => {
            if (statusValue === ProjectStatus.ALL) return allProjects.length;
            return allProjects.filter((p) => p.status === statusValue).length;
        },
        [allProjects],
    );

    const handleDeleteProject = async (projectId) => {
        try {
            const token = await currentUser.getIdToken();

            const res = await axios.delete(`${API_URL}/api/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 200) {
                setProjects((prev) => prev.filter((p) => p.id !== projectId));
                setAllProjects((prev) => prev.filter((p) => p.id !== projectId));

                Swal.fire('Deleted!', 'Project has been deleted.', 'success');
            }
        } catch (error) {
            console.error('Failed to delete project:', error);
            Swal.fire('Error', 'Failed to delete project.', 'error');
        }
    };

    // --- NEW: Intelligent Date Formatting Function ---
    const formatEventDateRange = (minDateStr, maxDateStr) => {
        // Helper to format a single date string
        const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        if (!minDateStr) {
            return <span className={`${textMuted} italic`}>No Shoots Scheduled</span>;
        }

        const minDate = formatDate(minDateStr);
        // maxDateStr will be the same as minDateStr if there's only one shoot
        const maxDate = formatDate(maxDateStr);

        if (minDate === maxDate) {
            return (
                <div className="flex items-center gap-1.5">
                    <CalendarDays size={14} className={textMuted} />
                    <span>{minDate}</span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-1.5">
                <CalendarDays size={14} className={textMuted} />
                <span>{`${minDate} - ${maxDate}`}</span>
            </div>
        );
    };

    const handleNavigate = (projectId) => {
        router.push(`/admin/show-details/${projectId}`);
    };

    const filteredProjects = projects.filter((project) => project.name.toLowerCase().includes(searchTerm.toLowerCase()) || project.clientName.toLowerCase().includes(searchTerm.toLowerCase()));

    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // --- NEW: Refactored Render Logic for Table Body ---
    const renderTableBody = () => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan="9" className="px-6 py-20 text-center">
                        <div className="flex justify-center items-center">
                            <Loader2 size={32} className="text-slate-400 animate-spin" />
                            <p className="ml-4 text-lg text-slate-500">Loading Projects...</p>
                        </div>
                    </td>
                </tr>
            );
        }

        if (error) {
            return (
                <tr>
                    <td colSpan="9" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center text-red-500">
                            <AlertTriangle size={48} className="mb-4" />
                            <p className="text-xl font-medium mb-1">An Error Occurred</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </td>
                </tr>
            );
        }

        if (projects.length === 0) {
            return (
                <tr>
                    <td colSpan="9" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center">
                            <Package size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                            <p className="text-xl font-medium text-slate-500 dark:text-slate-400 mb-1">No projects found.</p>
                            <p className="text-sm text-slate-400 dark:text-slate-500">Try selecting a different filter.</p>
                        </div>
                    </td>
                </tr>
            );
        }

        return currentProjects.map((project) => (
            <tr key={project.id} className={`${rowHoverStyles} transition-colors duration-150`}>
                <td className={`${tdStyles} font-medium ${textDefault}`}>{project.name}</td>
                <td className={`${tdStyles} ${textDefault}`}>{formatEventDateRange(project.minDate, project.maxDate)}</td>
                <td className={`${tdStyles} text-center`}>
                    {(() => {
                        const statusKey = project.status?.toLowerCase() || ProjectStatus.PENDING;
                        const config = statusConfig[statusKey] || statusConfig[ProjectStatus.PENDING];

                        return (
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${config.pillBg} ${config.pillText}`}>
                                {config.icon}
                                {config.label}
                            </span>
                        );
                    })()}
                </td>
                <td className={`${tdStyles} ${textDefault} text-center`}>{project.shoots}</td>
                <td className={`${tdStyles} ${textDefault} text-center`}>
                    {project.deliverablesCompleted}/{project.deliverablesTotal}
                </td>
                <td className={`${tdStyles} ${textDefault} text-center`}>{project.tasks}</td>
                <td className={`${tdStyles} ${textDefault}`}>{project.clientName}</td>
                <td className={`${tdStyles} font-medium ${textDefault} text-right`}>₹{project.packageCost.toLocaleString()}</td>
                <td className={`${tdStyles} ${textDefault} text-right`}>₹{project.additionalCost.toLocaleString()}</td>
                <td className={`${tdStyles} text-center`}>
                    <button onClick={() => handleNavigate(project.id)} className={actionButtonStyles} title="View Project Details">
                        <Eye size={18} />
                    </button>

                    <button
                        onClick={async () => {
                            if (project.status === ProjectStatus.ONGOING || project.status === ProjectStatus.PENDING) {
                                return; // do nothing if disabled
                            }

                            const result = await Swal.fire({
                                title: 'Confirm Deletion',
                                text: `Type the project name (${project.name}) to confirm deletion.`,
                                input: 'text',
                                inputPlaceholder: 'Enter project name',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#d33',
                                cancelButtonColor: '#3085d6',
                                confirmButtonText: 'Delete Project',
                                preConfirm: (value) => {
                                    if (value !== project.name) {
                                        Swal.showValidationMessage('Project name does not match');
                                        return false;
                                    }
                                    return true;
                                },
                            });

                            if (result.isConfirmed) {
                                handleDeleteProject(project.id);
                            }
                        }}
                        disabled={project.status === ProjectStatus.ONGOING || project.status === ProjectStatus.PENDING}
                        className={`ml-2 ${actionButtonStyles} ${
                            project.status === ProjectStatus.ONGOING || project.status === ProjectStatus.PENDING
                                ? 'opacity-50 cursor-not-allowed'
                                : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                        }`}
                        title={project.status === ProjectStatus.ONGOING || project.status === ProjectStatus.PENDING ? 'Cannot delete ongoing or pending projects' : 'Delete Project'}
                    >
                        <Trash2 size={18} />
                    </button>
                </td>
            </tr>
        ));
    };

    return (
        <div className={pageWrapperStyles}>
            <div className={headerContainerStyles}>
                <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                    <li>
                        <Link href="/dashboard" className={breadcrumbLinkStyles}>
                            Dashboard
                        </Link>
                    </li>
                    <li className={breadcrumbSeparatorStyles}>
                        <span className={breadcrumbCurrentPageStyles}>Project Overview</span>
                    </li>
                </ul>
                <div className={filterTabsContainerStyles}>
                    {Object.values(ProjectStatus).map((statusValue) => {
                        const config = statusConfig[statusValue];
                        const isActive = activeFilter === statusValue;
                        const count = getStatusPillCount(statusValue);
                        return (
                            <button
                                key={statusValue}
                                onClick={() => setActiveFilter(statusValue)}
                                className={`${tabButtonBaseStyles} ${isActive ? `${config.base} ${config.text} shadow-md` : inactiveTabStyles} ${config.focusRing}`}
                            >
                                {isActive && config.icon}
                                {config.label}
                                <span
                                    className={`ml-2 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${isActive ? `${config.activePillBg} ${config.activePillText}` : `${config.pillBg} ${config.pillText}`}`}
                                >
                                    {isLoading && allProjects.length === 0 ? '...' : count}
                                </span>
                            </button>
                        );
                    })}
                    <div className="relative flex-grow ml-auto min-w-[200px] mt-2 sm:mt-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by project or client..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:outline-none text-slate-700 dark:text-slate-200"
                        />
                    </div>
                </div>
            </div>

            <div className={tableWrapperStyles}>
                <table className={tableStyles}>
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th scope="col" className={thStyles}>
                                Name
                            </th>
                            <th scope="col" className={thStyles}>
                                Event Dates
                            </th>
                            <th scope="col" className={`${thStyles} text-center`}>
                                Status
                            </th>
                            <th scope="col" className={`${thStyles} text-center`}>
                                Shoots
                            </th>
                            <th scope="col" className={`${thStyles} text-center`}>
                                Deliverables
                            </th>
                            <th scope="col" className={`${thStyles} text-center`}>
                                Tasks
                            </th>
                            <th scope="col" className={thStyles}>
                                Client
                            </th>
                            <th scope="col" className={`${thStyles} text-right`}>
                                Package Cost
                            </th>
                            <th scope="col" className={`${thStyles} text-right`}>
                                Additional Cost
                            </th>
                            <th scope="col" className={`${thStyles} text-center`}>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">{renderTableBody()}</tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="mt-6 flex justify-between items-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{indexOfFirstProject + 1}</span> to{' '}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{indexOfLastProject > filteredProjects.length ? filteredProjects.length : indexOfLastProject}</span> of{' '}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredProjects.length}</span> results
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectListPage;
