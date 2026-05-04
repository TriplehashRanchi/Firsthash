'use client';

import { Transition, Dialog, DialogBackdrop, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useState, useEffect, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
// ✅ 1. IMPORT THE NEW ICON
import { Loader2, User, Eye, ChevronsRight, X } from 'lucide-react';

// --- API Configuration ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const parseScheduleDate = (value: any) => {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

    const dateValue = String(value);
    const dateOnlyMatch = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateOnlyMatch) {
        const [, year, month, day] = dateOnlyMatch;
        return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatScheduleDate = (value: any, options: Intl.DateTimeFormatOptions) => {
    const date = parseScheduleDate(value);
    return date ? date.toLocaleDateString('en-GB', options) : '—';
};

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
                const scheduleDate = project?.nextDate || project?.minDate;
                const scheduleDateObject = parseScheduleDate(scheduleDate);
                const maxDateObject = parseScheduleDate(project?.maxDate);

                if (!project || !project.id || !scheduleDateObject) return null;
                return {
                    id: project.id,
                    title: project.name,
                    start: scheduleDate,
                    end: maxDateObject && maxDateObject >= scheduleDateObject ? project.maxDate : scheduleDate,
                    className: 'primary',
                    extendedProps: {
                        projectName: project.name,
                        clientName: project.clientName,
                        status: project.status,
                        shootCount: project.assignedShoots || project.shoots,
                        upcomingDate: project.nextDate,
                        fullDate: formatScheduleDate(scheduleDate, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
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

    const upcomingEvents = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return events
            .filter((event) => {
                const upcomingDate = parseScheduleDate(event.extendedProps?.upcomingDate);
                return upcomingDate ? upcomingDate >= today : false;
            })
            .sort((a, b) => {
                const aDate = parseScheduleDate(a.extendedProps?.upcomingDate)?.getTime() || 0;
                const bDate = parseScheduleDate(b.extendedProps?.upcomingDate)?.getTime() || 0;
                return aDate - bDate;
            });
    }, [events]);

    return (
        <div>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold">My Schedule</h1>
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
                            {upcomingEvents.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 dark:text-gray-200">
                                            <th className="p-2 dark:text-gray-300">Project</th>
                                            <th className="p-2 dark:text-gray-300">Date</th>
                                            <th className="p-2 dark:text-gray-300">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {upcomingEvents.map((event) => (
                                            <tr key={event.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="p-2">
                                                    <div className="font-semibold">{event.title}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Client: {event.extendedProps.clientName}</div>
                                                </td>
                                                <td className="p-2 text-xs">
                                                    {formatScheduleDate(event.extendedProps.upcomingDate, { day: '2-digit', month: 'short' })}
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
                                    No upcoming projects assigned.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Drawer */}
            <Transition appear show={isViewModalOpen} as={Fragment}>
                <Dialog as="div" onClose={() => setIsViewModalOpen(false)} className="relative z-[5000]">
                    <TransitionChild as={Fragment} enter="duration-300 ease-out" enterFrom="opacity-0" enterTo="opacity-100" leave="duration-200 ease-in" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <DialogBackdrop className="fixed inset-0 z-[4990] bg-[black]/60 backdrop-blur-sm" />
                    </TransitionChild>
                    <div className="fixed inset-0 z-[5000] flex justify-end">
                        <TransitionChild as={Fragment} enter="transform transition ease-in-out duration-300" enterFrom="translate-x-full" enterTo="translate-x-0" leave="transform transition ease-in-out duration-300" leaveFrom="translate-x-0" leaveTo="translate-x-full">
                            <DialogPanel className="flex h-full w-full max-w-xl flex-col overflow-hidden bg-white text-black shadow-2xl dark:bg-gray-900 dark:text-white-dark">
                                <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5 dark:border-gray-800 dark:bg-gray-900">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-primary">Schedule</p>
                                        <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">Project Details</h3>
                                    </div>
                                    <button
                                        type="button"
                                        className="rounded-full p-2 text-gray-400 outline-none transition hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                                        onClick={() => setIsViewModalOpen(false)}
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6">
                                    {viewEvent && (
                                        <div className="space-y-6">
                                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950/60">
                                                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Project</p>
                                                <h3 className="mt-2 text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100">{viewEvent.extendedProps.projectName}</h3>
                                            </div>
                                            
                                            <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800">
                                                    <User className="h-5 w-5 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Client</p>
                                                    <p className="mt-1 font-semibold">{viewEvent.extendedProps.clientName || '—'}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Project Start Date</p>
                                                    <p className="mt-2 font-semibold text-primary">{viewEvent.extendedProps.fullDate}</p>
                                                </div>
                                                <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Shoots</p>
                                                    <p className="mt-2 text-2xl font-black text-info">{viewEvent.extendedProps.shootCount}</p>
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <button type="button" className="btn btn-outline-danger w-full" onClick={() => setIsViewModalOpen(false)}>
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ComponentsAppsCalendar;
