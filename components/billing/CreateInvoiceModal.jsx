'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, CalendarDays, Loader2, IndianRupee, FileText } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';

export default function CreateInvoiceModal({ isOpen, onClose, onSuccess }) {
    const { currentUser } = useAuth();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // Form State
    const [amount, setAmount] = useState('');
    const [dateReceived, setDateReceived] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [isGst, setIsGst] = useState(false);
    
    // Project Search State
    const [projectSearchQuery, setProjectSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    // Submission State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dropdownRef = useRef(null);

    // Click outside handler for dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Project Search Debounce
    useEffect(() => {
        const searchProjects = async () => {
            if (!projectSearchQuery || projectSearchQuery.length < 2) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            // Don't search if we just selected a project and the query matches its name
            if (selectedProject && projectSearchQuery === selectedProject.projectName) {
                return;
            }

            setIsSearching(true);
            try {
                const token = await currentUser?.getIdToken();
                const res = await axios.get(`${API_URL}/api/billing/projects/search`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { q: projectSearchQuery, limit: 10 }
                });
                
                // Handle different potential backend response structures
                let results = [];
                if (Array.isArray(res.data)) {
                    results = res.data;
                } else if (res.data && Array.isArray(res.data.data)) {
                    results = res.data.data;
                } else if (res.data && Array.isArray(res.data.items)) {
                    results = res.data.items;
                } else if (res.data && Array.isArray(res.data.projects)) {
                    results = res.data.projects;
                }
                
                setSearchResults(results);
                setDropdownOpen(true);
            } catch (err) {
                console.error("Project search failed", err);
                // Mock data for fallback testing if API isn't ready:
                // setSearchResults([
                //    { id: 'p1', projectName: 'Wedding - Sharma', clientName: 'Rahul', receivedAmount: 1000, remainingAmount: 5000, collectableAmount: 1000 },
                //    { id: 'p2', projectName: 'Corporate - Tech', clientName: 'Amit', receivedAmount: 2000, remainingAmount: 2000, collectableAmount: 0 }
                // ]);
                // setDropdownOpen(true);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(searchProjects, 400);
        return () => clearTimeout(timer);
    }, [projectSearchQuery, currentUser, API_URL, selectedProject]);

    const handleProjectSelect = (project) => {
        setSelectedProject(project);
        setProjectSearchQuery(project.projectName);
        setDropdownOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedProject) {
            Swal.fire('Error', 'Please select a project from the search results.', 'error');
            return;
        }

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            Swal.fire('Error', 'Please enter a valid amount.', 'error');
            return;
        }
        
        // Ensure billing amount does not exceed collectable amount
        const maxAmount = selectedProject.collectableAmount || 0;
        if (Number(amount) > maxAmount) {
            Swal.fire('Error', `Amount cannot exceed the total collectable amount of ₹${maxAmount.toLocaleString()}.`, 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = await currentUser?.getIdToken();
            const payload = {
                projectId: selectedProject.id,
                amount: Number(amount),
                date_received: dateReceived,
                description,
                is_gst: isGst
            };
            
            const res = await axios.post(`${API_URL}/api/billing/invoices`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                icon: 'success',
                title: 'Invoice Created',
                text: 'The invoice has been created successfully.',
                timer: 2000,
                showConfirmButton: false
            });

            // If backend returns PDF immediately, we could open it here
            if (res.data?.url) {
                window.open(res.data.url, '_blank');
            }

            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || 'Failed to create invoice';
            Swal.fire('Error', msg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
                        <FileText className="mr-2 text-blue-500" size={20} />
                        Create Invoice
                    </h2>
                    <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-5 overflow-y-auto">
                    <form id="create-invoice-form" onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* Project Search */}
                        <div className="relative" ref={dropdownRef}>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Search Project <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Start typing project or client name..."
                                value={projectSearchQuery}
                                onChange={(e) => {
                                    setProjectSearchQuery(e.target.value);
                                    if (selectedProject && e.target.value !== selectedProject.projectName) {
                                        setSelectedProject(null); // Clear selection if user types
                                    }
                                }}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-slate-900 dark:text-slate-200"
                                required
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-9 text-slate-400">
                                    <Loader2 size={16} className="animate-spin" />
                                </div>
                            )}

                            {/* Dropdown Results */}
                            {dropdownOpen && searchResults.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                                    {searchResults.map((proj) => (
                                        <div 
                                            key={proj.id} 
                                            onClick={() => handleProjectSelect(proj)}
                                            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                                        >
                                            <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">{proj.projectName}</div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-xs text-slate-500">{proj.clientName}</span>
                                                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                                    Col: ₹{proj.collectableAmount?.toLocaleString() || 0}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {dropdownOpen && searchResults.length === 0 && projectSearchQuery.length >= 2 && !isSearching && !selectedProject && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-4 text-center text-sm text-slate-500">
                                    No projects found matching '{projectSearchQuery}'
                                </div>
                            )}
                        </div>

                        {/* Amount & Date Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Amount {selectedProject && <span className="text-xs text-purple-600 dark:text-purple-400 font-normal ml-1">(Max: ₹{(selectedProject.collectableAmount || 0).toLocaleString()})</span>} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IndianRupee size={16} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        max={selectedProject?.collectableAmount || ''}
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-slate-900 dark:text-slate-200"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Date Received <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CalendarDays size={16} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="date"
                                        value={dateReceived}
                                        onChange={(e) => setDateReceived(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-slate-900 dark:text-slate-200"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Description (Optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="E.g., Second installment, final settlement..."
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-slate-900 dark:text-slate-200 resize-none"
                            />
                        </div>

                        {/* GST Checkbox */}
                        <div className="flex items-center">
                            <input
                                id="gst-checkbox"
                                type="checkbox"
                                checked={isGst}
                                onChange={(e) => setIsGst(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="gst-checkbox" className="ml-2 block text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                Include GST (18%)
                            </label>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="create-invoice-form"
                        disabled={isSubmitting || !selectedProject}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={16} className="mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Create Invoice'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
