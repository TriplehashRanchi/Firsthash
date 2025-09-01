// File: components/team/TeamAllocation.js

'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Users, Briefcase, DollarSign } from 'lucide-react';

const generateId = () => typeof self !== 'undefined' && self.crypto ? self.crypto.randomUUID() : Math.random().toString(36).substring(2);

// Predefined list of common roles. In a real app, this might come from an API or be user-configurable.
const PREDEFINED_ROLES = [
    'Lead Photographer',
    'Second Photographer',
    'Lead Cinematographer',
    'Second Cinematographer',
    'Drone Operator',
    'Assistant',
    'Photo Editor',
    'Video Editor',
    'Live Stream Technician',
];

const TeamAllocation = ({ projects, teamMembers, onDataChange, onValidChange }) => {
    
    const createNewAllocationRow = () => ({
        id: generateId(),
        role: '',
        assignedTo: '', // will store team member's ID
        payment: '',
    });

    const [selectedProject, setSelectedProject] = useState(''); // Store project ID
    const [allocations, setAllocations] = useState(() => [createNewAllocationRow()]);

    // --- DATA REPORTING: Report validity and data changes to the parent component ---

    useEffect(() => {
        // 1. Report Validity Change
        if (typeof onValidChange === 'function') {
            const isProjectSelected = selectedProject.trim() !== '';
            
            // A row is considered "partially filled" if at least one field has a value.
            // The form is valid if a project is selected AND there are no partially filled rows (i.e., all filled rows are complete).
            const isTableValid = allocations.every(alloc => {
                const isPartiallyFilled = alloc.role || alloc.assignedTo || alloc.payment;
                const isFullyFilled = alloc.role && alloc.assignedTo && Number(alloc.payment) > 0;
                return !isPartiallyFilled || isFullyFilled; // A row is valid if it's empty OR fully filled.
            });
            
            onValidChange(isProjectSelected && isTableValid);
        }

        // 2. Report Data Change
        if (typeof onDataChange === 'function') {
            // Filter out any rows that aren't fully filled before sending data up
            const cleanAllocations = allocations
                .filter(alloc => alloc.role && alloc.assignedTo && Number(alloc.payment) > 0)
                .map(alloc => ({
                    ...alloc,
                    payment: Number(alloc.payment),
                }));
            
            const totalPayout = cleanAllocations.reduce((sum, alloc) => sum + alloc.payment, 0);

            const componentData = {
                selectedProject: selectedProject,
                projectName: projects.find(p => p.id === selectedProject)?.name || '',
                allocations: cleanAllocations,
                totalPayout: totalPayout,
            };
            onDataChange(componentData);
        }
    }, [selectedProject, allocations, onValidChange, onDataChange, projects]);


    // --- Memoized Values for efficient rendering ---

    // Calculate total payout to display on the component UI
    const totalPayoutDisplay = useMemo(() => {
        return allocations.reduce((sum, alloc) => sum + (Number(alloc.payment) || 0), 0);
    }, [allocations]);

    // Get a set of assigned member IDs to disable them in other dropdowns
    const assignedMemberIds = useMemo(() => {
        return new Set(allocations.map(a => a.assignedTo).filter(Boolean));
    }, [allocations]);

    // --- Event Handlers ---

    const handleRowChange = (id, field, value) => {
        setAllocations(prev =>
            prev.map(alloc => (alloc.id === id ? { ...alloc, [field]: value } : alloc))
        );
    };

    const addRow = () => {
        setAllocations(prev => [...prev, createNewAllocationRow()]);
    };

    const removeRow = (id) => {
        setAllocations(prev => {
            const newAllocations = prev.filter(alloc => alloc.id !== id);
            // If all rows are removed, add a fresh one back
            return newAllocations.length > 0 ? newAllocations : [createNewAllocationRow()];
        });
    };

    // --- Style Definitions ---
    const sectionWrapperStyles = "p-4 sm:p-6 bg-white dark:bg-gray-900/50 rounded-lg shadow-md dark:shadow-gray-700/50";
    const inputBaseStyles = "w-full p-2.5 rounded-md border h-[42px] text-sm";
    const themedInputStyles = `${inputBaseStyles} bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent`;
    const themedSelectStyles = `${themedInputStyles} appearance-none`;
    const selectArrowStyles = { backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`};
    const currencySymbolStyles = "absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-sm text-gray-500 dark:text-gray-400";
    const iconButtonStyles = "p-2 rounded-md transition-colors duration-150";
    
    return (
        <div className={sectionWrapperStyles}>
            {/* Project Selection */}
            <div className="mb-8">
                <label htmlFor="project-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select a Project*
                </label>
                <select id="project-select" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
                    className={themedSelectStyles} style={{...selectArrowStyles, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}>
                    <option value="" disabled>-- Choose a project --</option>
                    {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                </select>
            </div>
            
            {/* Allocation Table - Renders only when a project is selected */}
            {selectedProject && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Assign Roles & Payment</h3>
                        <button onClick={addRow} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors">
                            <Plus size={16} /> Add Role
                        </button>
                    </div>

                    {/* Table Header for larger screens */}
                    <div className="hidden sm:grid grid-cols-[2fr_2fr_1fr_auto] gap-4 mb-2 px-3">
                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2"><Briefcase size={14}/> Role*</div>
                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2"><Users size={14}/> Team Member*</div>
                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2"><DollarSign size={14}/> Payment (INR)*</div>
                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">Action</div>
                    </div>

                    {/* Table Body */}
                    <div className="space-y-3">
                        {allocations.map(alloc => (
                            <div key={alloc.id} className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr_auto] gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg items-center">
                                
                                <div className="w-full">
                                    <label className="sm:hidden text-xs font-medium text-gray-500 dark:text-gray-400">Role*</label>
                                    <select value={alloc.role} onChange={(e) => handleRowChange(alloc.id, 'role', e.target.value)}
                                        className={themedSelectStyles} style={{...selectArrowStyles, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}>
                                        <option value="" disabled>-- Select a role --</option>
                                        {PREDEFINED_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                    </select>
                                </div>
                                
                                <div className="w-full">
                                    <label className="sm:hidden text-xs font-medium text-gray-500 dark:text-gray-400">Team Member*</label>
                                    <select value={alloc.assignedTo} onChange={(e) => handleRowChange(alloc.id, 'assignedTo', e.target.value)}
                                        className={themedSelectStyles} style={{...selectArrowStyles, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}>
                                        <option value="" disabled>-- Assign to --</option>
                                        {teamMembers.map(member => (
                                            <option key={member.id} value={member.id} disabled={assignedMemberIds.has(member.id) && alloc.assignedTo !== member.id}>
                                                {member.name} {assignedMemberIds.has(member.id) && alloc.assignedTo !== member.id ? '(Assigned)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="relative w-full">
                                    <label className="sm:hidden text-xs font-medium text-gray-500 dark:text-gray-400">Payment (INR)*</label>
                                    <span className={currencySymbolStyles}>₹</span>
                                    <input type="number" placeholder="e.g., 5000" value={alloc.payment} onChange={(e) => handleRowChange(alloc.id, 'payment', e.target.value)}
                                        className={`${themedInputStyles} pl-7`} min="0" />
                                </div>

                                <div className="text-center sm:self-end sm:pb-0.5">
                                    <label className="sm:hidden text-xs font-medium text-gray-500 dark:text-gray-400">Action</label>
                                    <button onClick={() => removeRow(alloc.id)} className={`${iconButtonStyles} text-red-500 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-900/50 dark:hover:bg-red-800/60`}
                                        title="Remove Allocation">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total Payout Summary within the component */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center">
                        <span className="text-md font-semibold text-gray-600 dark:text-gray-300">Team Cost for this Project:</span>
                        <span className="text-xl font-bold text-gray-800 dark:text-gray-100 ml-2">
                            ₹{totalPayoutDisplay.toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamAllocation;