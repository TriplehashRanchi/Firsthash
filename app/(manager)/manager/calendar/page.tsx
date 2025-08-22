'use client';

import IconX from '@/components/icon/icon-x';
import { Transition, Dialog, DialogBackdrop, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
// ✅ 1. IMPORT THE NEW ICON
import { Loader2, User, Calendar, Eye, ChevronsRight } from 'lucide-react';
import Link from 'next/link';

// --- API Configuration ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// --- Authentication Helper ---
const getAuthHeaders = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return {};
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
};

const ComponentsAppsCalendar = () => {
    // --- State Management ---
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewEvent, setViewEvent] = useState<any>(null);

    // --- Data Fetching Logic (Unchanged) ---
    const fetchAssignedEvents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const headers = await getAuthHeaders();
            
            const response = await axios.get(`${API_URL}/api/employee/projects/assigned`, { headers });

            if (response.status !== 200 || !Array.isArray(response.data)) {
                throw new Error('Could not fetch assigned projects.');
            }

            const calendarEvents = response.data.map((project: any) => {
                if (!project || !project.id || !project.minDate) return null;
                return {
                    id: project.id,
                    title: project.name,
                    start: project.minDate,
                    end: project.maxDate,
                    className: 'primary',
                    extendedProps: {
                        projectName: project.name,
                        clientName: project.clientName,
                        status: project.status,
                        shootCount: project.shoots,
                        fullDate: new Date(project.minDate).toLocaleString('en-US', {
                            dateStyle: 'full',
                            timeStyle: 'short',
                        }),
                    },
                };
            }).filter(Boolean);

            setEvents(calendarEvents);
        } catch (err: any) {
            console.error('Failed to fetch calendar data:', err);
            setError(err.message || 'Could not load your schedule. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                fetchAssignedEvents();
            } else {
                setLoading(false);
                setError('Please sign in to view your schedule.');
            }
        });
        return () => unsubscribe();
    }, [fetchAssignedEvents]);

    const handleViewDetails = (eventInfo: any) => {
        // The `event` property might be nested under `event` again depending on source
        const event = eventInfo.event || eventInfo;
        setViewEvent(event);
        setIsViewModalOpen(true);
    };

    // ✅ 2. CREATE THE CUSTOM EVENT RENDERER
    // This function customizes the look of each event on the calendar.
    const renderEventContent = (eventInfo: any) => {
        // `isStart` is true only for the first day an event is rendered.
        if (eventInfo.isStart) {
            // On the first day, show the full title.
            return (
                <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                    <i>{eventInfo.event.title}</i>
                </div>
            );
        } else {
            // On continuation days, show our custom "Continues" message.
            return (
                <div className="flex items-center text-xs italic text-gray-500">
                    <ChevronsRight className="w-4 h-4 mr-1" />
                    Continues
                </div>
            );
        }
    };
       const breadcrumbLinkStyles = "text-blue-600 hover:underline dark:text-blue-400";
const breadcrumbSeparatorStyles = "before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-gray-500 dark:text-gray-500";
const breadcrumbCurrentPageStyles = "text-gray-600 dark:text-gray-400";



    return (
        <div>
            {/* Page Header */}
            <div className="mb-6">
                <ul className="flex space-x-2 rtl:space-x-reverse mb-2">
                    <li><Link href="/dashboard" className={breadcrumbLinkStyles}>Dashboard</Link></li>
                    <li className={breadcrumbSeparatorStyles}><span className={breadcrumbCurrentPageStyles}>Calender</span></li>
                </ul>
                <p className="text-gray-500">A calendar and list view of your assigned projects.</p>
            </div>

            {loading && (
                <div className="flex justify-center items-center p-10 panel">
                    <Loader2 className="w-8 h-8 mr-2 animate-spin text-primary" />
                    <span>Loading your schedule...</span>
                </div>
            )}
            
            {error && <div className="text-center text-red-500 bg-red-50 p-4 rounded-md panel">{error}</div>}

            {!loading && !error && (
                <div className="flex flex-col lg:flex-row lg:gap-6">
                    {/* Left Column: Calendar Panel */}
                    <div className="panel flex-1 lg:w-3/5 xl:w-2/3">
                        <div className="calendar-wrapper">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek',
                                }}
                                events={events}
                                eventClick={handleViewDetails}
                                // ✅ 3. APPLY THE CUSTOM RENDERER
                                eventContent={renderEventContent}
                                editable={false}
                                dayMaxEvents={true}
                                selectable={false}
                                droppable={false}
                            />
                        </div>
                    </div>

                    {/* Right Column: Project List Panel */}
                    <div className="panel lg:w-2/5 xl:w-1/3 mt-6 lg:mt-0">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Upcoming Projects List</h2>
                        <div className="overflow-y-auto h-[500px] lg:h-full">
                            {events.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500">
                                            <th className="p-2">Project</th>
                                            <th className="p-2">Date</th>
                                            <th className="p-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.map((event) => (
                                            <tr key={event.id} className="border-t hover:bg-gray-50">
                                                <td className="p-2">
                                                    <div className="font-semibold">{event.title}</div>
                                                    <div className="text-xs text-gray-500">Client: {event.extendedProps.clientName}</div>
                                                </td>
                                                <td className="p-2 text-xs">
                                                    {new Date(event.start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                </td>
                                                <td className="p-2">
                                                    <button 
                                                        onClick={() => handleViewDetails({ event: event })} 
                                                        className="p-1 text-gray-500 hover:text-primary"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    No projects assigned.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal (Unchanged) */}
            <Transition appear show={isViewModalOpen} as={Fragment}>
                <Dialog as="div" onClose={() => setIsViewModalOpen(false)} className="relative z-50">
                    <TransitionChild as={Fragment} enter="duration-300 ease-out" enterFrom="opacity-0" enterTo="opacity-100" leave="duration-200 ease-in" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <DialogBackdrop className="fixed inset-0 bg-[black]/60" />
                    </TransitionChild>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <TransitionChild as={Fragment} enter="duration-300 ease-out" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="duration-200 ease-in" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <DialogPanel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <button type="button" className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4" onClick={() => setIsViewModalOpen(false)}>
                                        <IconX />
                                    </button>
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        Project Details
                                    </div>
                                    {viewEvent && (
                                        <div className="p-5 space-y-4">
                                            <h3 className="text-xl font-semibold">{viewEvent.extendedProps.projectName}</h3>
                                            
                                            <div className="flex items-start space-x-3 text-gray-700">
                                                <User className="w-5 h-5 mt-1 text-gray-500 flex-shrink-0" />
                                                <div>
                                                    <p className="font-semibold">Client</p>
                                                    <p>{viewEvent.extendedProps.clientName}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="border-t pt-4">
                                                <p className="font-semibold">Project Start Date</p>
                                                <p className="text-primary">{viewEvent.extendedProps.fullDate}</p>
                                            </div>
                                            
                                            <div className="border-t pt-4">
                                                <p className="font-semibold">Total Shoots in Project</p>
                                                <p className="font-bold text-lg text-info">{viewEvent.extendedProps.shootCount}</p>
                                            </div>

                                            <div className="!mt-8 flex items-center justify-end">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setIsViewModalOpen(false)}>
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ComponentsAppsCalendar;