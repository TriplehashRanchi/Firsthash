'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    HiOutlineEye,
    HiX,
    HiSearch,
    HiOutlineDocumentText,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineLocationMarker,
    HiOutlineCalendar,
    HiOutlineUser,
    HiOutlineOfficeBuilding,
    HiOutlineCurrencyDollar,
    HiOutlinePencilAlt,
    HiOutlineClock,
    HiOutlineHashtag,
    HiChevronDown, HiCheck
} from 'react-icons/hi';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
);

const DetailItem = ({ icon, label, value }) => {
    // Return null to hide the item completely if there's no data
    if (!value && value !== 0) {
        return null;
    }

    return (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-indigo-100 rounded-lg text-indigo-600 dark:text-indigo-400">{icon}</div>
            <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-base text-gray-800 dark:text-gray-300 break-words">{String(value)}</p>
            </div>
        </div>
    );
};


// A more robust config for easier styling and future additions
const statusConfig = {
    'New': { textColor: 'text-blue-700 dark:text-blue-300', dotColor: 'bg-blue-500',hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/50',},
    'Hot Lead': {textColor: 'text-red-700 dark:text-red-400', dotColor: 'bg-red-500',hoverBg: 'hover:bg-red-50 dark:hover:bg-red-900/50',},
    'Cold Lead': {textColor: 'text-gray-600 dark:text-gray-400', dotColor: 'bg-gray-500',hoverBg: 'hover:bg-gray-100 dark:hover:bg-gray-700/50',},
    'Contacted': { textColor: 'text-yellow-700 dark:text-yellow-400', dotColor: 'bg-yellow-500',hoverBg: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/50', },
    'Converted': {textColor: 'text-green-700 dark:text-green-400',dotColor: 'bg-green-500',hoverBg: 'hover:bg-green-50 dark:hover:bg-green-900/50',},
    'Rejected': { textColor: 'text-purple-700 dark:text-purple-400', dotColor: 'bg-purple-500', hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/50', },
};


const StatusDropdown = ({ lead, onStatusChange }) => {
    const [currentStatus, setCurrentStatus] = useState(lead.lead_status || 'New');
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownAbove, setIsDropdownAbove] = useState(false);
    const dropdownRef = useRef(null); // Ref for the main container

    const currentConfig = statusConfig[currentStatus] || statusConfig['Cold Lead'];

    const handleSelect = async (status) => {
        setIsOpen(false);
        if (status === currentStatus) return;

        const previousStatus = currentStatus;
        setCurrentStatus(status);

        try {
            await onStatusChange(lead.id, status);
        } catch (error) {
            setCurrentStatus(previousStatus);
            console.error("Failed to update status:", error);
        }
    };

    // --- NEW LOGIC TO CHECK POSITION ---
    const toggleDropdown = () => {
        if (!isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropdownHeight = 250; // Approximate height of the dropdown panel

            // If not enough space below, open above
            setIsDropdownAbove(spaceBelow < dropdownHeight);
        }
        setIsOpen(!isOpen);
    };

    // Dynamically set position classes
    const dropdownPositionClasses = isDropdownAbove
        ? 'bottom-full mb-2 origin-bottom-right'
        : 'top-full mt-2 origin-top-right';

    return (
        <div ref={dropdownRef} className="relative inline-block text-left w-36">
            <div>
                <button
                    type="button"
                    onClick={toggleDropdown} // Use the new toggle function
                    className={`inline-flex items-center justify-between w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-3 py-1.5 bg-white dark:bg-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 transition-all duration-150 ${currentConfig.hoverBg}`}
                >
                    <div className="flex items-center">
                        <span className={`w-2.5 h-2.5 mr-2 rounded-full ${currentConfig.dotColor}`}></span>
                        <span className={`${currentConfig.textColor}`}>{currentStatus}</span>
                    </div>
                    <HiChevronDown className={`h-5 w-5 ml-1 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
                </button>
            </div>

            {isOpen && (
                <div
                    className={`absolute right-0 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-20 transition ease-out duration-100 ${dropdownPositionClasses}`}
                    // Animation style works for both directions
                    style={{ transition: 'opacity 100ms, transform 100ms', opacity: 1, transform: 'scale(1)' }}
                >
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {Object.entries(statusConfig).map(([status, config]) => (
                            <a
                                key={status}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSelect(status);
                                }}
                                className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                role="menuitem"
                            >
                                <div className="flex items-center">
                                    <span className={`w-2.5 h-2.5 mr-3 rounded-full ${config.dotColor}`}></span>
                                    {status}
                                </div>
                                {currentStatus === status && (
                                    <HiCheck className="w-5 h-5 text-indigo-600" />
                                )}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- THE NEW "GLAMOUR" LeadDetailModal ---
const LeadDetailModal = ({ lead, onClose }) => {
    if (!lead) return null;

    // Helper to create initials for the avatar
    const getInitials = (name = '') => {
        const parts = name.split(' ');
        return (parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : name.substring(0, 2)).toUpperCase();
    };

    // Helper for formatting dates cleanly
    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Helper for formatting currency
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return null;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl m-4 flex flex-col transform animate-scale-in">
                {/* Glamorous Header */}
                <div className="flex items-start justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-t-xl">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-full bg-indigo-200 dark:bg-gray-700 flex items-center dark:text-gray-200 justify-center text-3xl font-bold text-indigo-700 border-4 border-white shadow-sm">
                            {getInitials(lead.full_name)}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200">{lead.full_name}</h2>
                            <p className="text-base text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                                <HiOutlineHashtag /> Lead ID: {lead.id}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Body with Paired Information */}
                <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh]">
                    {/* Section 1: Contact & Location */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2">Contact & Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem icon={<HiOutlineMail size={22} />} label="Email Address" value={lead.email} />
                            <DetailItem icon={<HiOutlinePhone size={22} />} label="Phone Number" value={lead.phone_number} />
                            <DetailItem icon={<HiOutlineLocationMarker size={22} />} label="Address" value={lead.address} />
                        </div>
                    </section>

                    {/* Section 2: Event & Submission Details */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2">Event & Submission Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem icon={<HiOutlineCalendar size={22} />} label="Event Date" value={formatDate(lead.date)} />
                            {/* <DetailItem icon={<HiOutlineClock size={22} />} label="Submitted On" value={new Date(lead.created_at).toLocaleString()} /> */}
                            <DetailItem icon={<HiOutlineOfficeBuilding size={22} />} label="Company Name" value={lead.company_name} />
                            <DetailItem icon={<HiOutlineLocationMarker size={22} />} label="Event Location" value={lead.event_location} />
                            <DetailItem icon={<HiOutlineCurrencyDollar size={22} />} label="Amount" value={formatCurrency(lead.coverage_amount)} />
                            <DetailItem icon={<HiOutlineUser size={22} />} label="Gender" value={lead.gender} />
                        </div>
                    </section>

                    {/* Section 3: Custom Form Data */}
                    {lead.raw_payload && lead.raw_payload.length > 0 && (
                        <section>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Custom Form Data</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {lead.raw_payload.map((field, index) => (
                                    <DetailItem
                                        key={index}
                                        icon={<HiOutlinePencilAlt size={22} />}
                                        label={field.name.replace(/_/g, ' ')} // Make label readable
                                        value={field.value}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Clean Footer */}
                <div className="px-6 py-4 bg-gray-100 dark:bg-gray-800 border-t rounded-b-xl text-right">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-transform hover:scale-105"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// This is the main component for displaying your leads
export default function LeadsDashboard() {
    const { currentUser: user } = useAuth();
    const [leads, setLeads] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user === undefined) return; // Wait until auth state is determined

        if (user?.uid) {
            const fetchLeads = async () => {
                setIsLoading(true);
                setError('');
                try {
                    const response = await fetch(`${API_URL}/api/leads/${user.uid}`);
                    if (!response.ok) throw new Error('Failed to fetch leads.');
                    const data = await response.json();
                    setLeads(data);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchLeads();
        } else {
            // If user is null (logged out), stop loading and clear leads
            setIsLoading(false);
            setLeads([]);
        }
    }, [user]);

    const handleStatusChange = async (leadId, newStatus) => {
        try {
            const response = await fetch(`${API_URL}/api/leads/${leadId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                // Send `lead_status` in the body to match the controller
                body: JSON.stringify({ lead_status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Server responded with an error.');
            }
            
            // Update local state to ensure UI is in sync with the database
            setLeads(currentLeads =>
                currentLeads.map(lead => 
                    lead.id === leadId ? { ...lead, lead_status: newStatus } : lead
                )
            );

        } catch (err) {
            console.error('Error updating lead status:', err);
            // Re-throw the error so the StatusDropdown component can catch it and revert its state
            throw err;
        }
    };

    // Memoized filtering to prevent re-calculating on every render
    const filteredLeads = useMemo(() => {
        if (!searchQuery) return leads;
        return leads.filter(
            (lead) => lead.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || lead.email.toLowerCase().includes(searchQuery.toLowerCase()) || lead.phone_number.includes(searchQuery),
        );
    }, [leads, searchQuery]);

    if (isLoading) {
        return (
            <div className="p-8">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="p-4 md:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Dashboard Header */}
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div>
                        <ul className="flex space-x-2 rtl:space-x-reverse">
                            <li>
                                <Link href="/dashboard" className="text-blue-600 dark:text-blue-500 hover:underline">
                                    Dashboard
                                </Link>
                            </li>
                            <li className="before:content-['/'] ltr:before:mr-2 text-gray-500 dark:text-gray-400">
                                <span>All Leads</span>
                            </li>
                        </ul>
                        <p className="text-gray-500 dark:text-gray-300 mt-1">View and manage all your collected leads.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 mt-2 md:mt-0">
                        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Leads Received</h2>
                        <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{leads.length}</p>
                    </div>
                </div>

                {/* Search and Table Container */}
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
                    {/* Search Bar */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <HiSearch className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, email, or phone..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:text-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:placeholder-gray-600 dark:focus:placeholder-gray-500 dark:focus:ring-indigo-600 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Leads Table */}
                    {/* Leads Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {/* --- HEADER ROW --- */}
                                    <th className="px-6 py-3 dark:text-gray-300 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 dark:text-gray-300 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 dark:text-gray-300 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</th>
                                    <th className="px-6 py-3 dark:text-gray-300 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 dark:text-gray-300 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Source</th>
                                    <th className="px-6 py-3 dark:text-gray-300 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                                {filteredLeads.length > 0 ? (
                                    filteredLeads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            {/* --- DATA ROWS --- */}
                                            <td className="px-6 py-4 dark:text-gray-300 whitespace-nowrap text-sm font-medium text-gray-900">{lead.full_name}</td>
                                            <td className="px-6 py-4 dark:text-gray-300 whitespace-nowrap text-sm text-gray-500">{lead.email}</td>
                                            <td className="px-6 py-4 dark:text-gray-300 whitespace-nowrap text-sm text-gray-500">{lead.phone_number}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <StatusDropdown lead={lead} onStatusChange={handleStatusChange} />
                                            </td>
                                            <td className="px-6 py-4 dark:text-gray-300 whitespace-nowrap text-sm text-gray-500">{lead.source || 'LP/Form'}</td>
                                            <td className="px-6 py-4 dark:text-gray-300 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => setSelectedLead(lead)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100"
                                                    title="View Full Details"
                                                >
                                                    <HiOutlineEye className="w-6 h-6" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        {/* --- EMPTY STATE ROW --- */}
                                        <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <HiOutlineDocumentText className="w-12 h-12 text-gray-300 mb-2" />
                                                <span className="font-semibold">No Leads Found</span>
                                                <span className="text-xs text-gray-400">{searchQuery ? 'Try adjusting your search query.' : 'You have not received any leads yet.'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Render the Modal */}
            <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
        </div>
    );
}
