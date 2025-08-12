// components/team/TeamAllocationCalendar.js
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, X, UserPlus, CheckCircle, ChevronLeft, ChevronRight, CalendarX, UserMinus, MapPin, Film, Users } from 'lucide-react'; // Added Users icon

// --- (UNCHANGED) Helper function for generating simple avatars ---
const getAvatarUrl = (name) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=64`;
};

// --- (MODIFIED) The Assignment Modal now understands required counts ---
const AssignmentModal = ({
    isOpen,
    onClose,
    teamMembers,
    role,
    currentAssignedMemberIds,
    requiredCount = 1,
    onSaveChanges,
})  => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [toAdd, setToAdd] = useState([]);
    const [toRemove, setToRemove] = useState([]);

    // --- NEW: Determine if the selection limit has been reached
    const isAtCapacity = selectedIds.length >= requiredCount;

    useEffect(() => {
        if (isOpen) {
            const initialIds = currentAssignedMemberIds || [];
            setSelectedIds(initialIds);
            setToAdd([]);
            setToRemove([]);
        }
    }, [isOpen, currentAssignedMemberIds]);

    useEffect(() => {
        if (!isOpen) return;
        
        const originalSet = new Set(currentAssignedMemberIds || []);
        const selectedSet = new Set(selectedIds || []);

        const adding = [...selectedSet].filter(id => !originalSet.has(id));
        const removing = [...originalSet].filter(id => !selectedSet.has(id));
        
        setToAdd(adding.map(id => teamMembers.find(m => m.id === id)).filter(Boolean));
        setToRemove(removing.map(id => teamMembers.find(m => m.id === id)).filter(Boolean));
        
    }, [selectedIds, currentAssignedMemberIds, isOpen, teamMembers]);

    if (!isOpen) return null;

    const handleMemberSelect = (memberId) => {
        setSelectedIds(prevIds => {
            const isCurrentlySelected = prevIds.includes(memberId);
            if (isCurrentlySelected) {
                // Always allow de-selection
                return prevIds.filter(id => id !== memberId);
            } else if (prevIds.length < requiredCount) {
                // Allow selection only if not at capacity
                return [...prevIds, memberId];
            }
            // If at capacity and trying to add, do nothing
            return prevIds;
        });
    };

    const handleSaveChangesClick = () => onSaveChanges(selectedIds);
    
    // --- NEW: Dynamic styling for the requirement counter
    const requirementMet = selectedIds.length === requiredCount;
    const counterColor = requirementMet ? 'text-green-500 dark:text-green-400' : 'text-slate-500 dark:text-slate-400';

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60] backdrop-blur-sm transition-opacity duration-300" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-slate-700/80 transform transition-all duration-300 scale-95 opacity-0 animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700/80">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center"><UserPlus size={28} className="mr-3 text-indigo-500"/> Assign Team Members</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            For Role: <span className="font-semibold text-indigo-500 dark:text-indigo-400">{role.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </p>
                    </div>
                    {/* --- NEW: Requirement Counter in Header --- */}
                    <div className="text-right">
                         <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ml-4" aria-label="Close modal"><X size={20} /></button>
                        <div className={`mt-2 text-sm font-bold flex items-center justify-end gap-2 ${counterColor}`}>
                           <Users size={16} />
                           <span>Required: {selectedIds.length} / {requiredCount} assigned</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                    <div className="md:col-span-2">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">Select team members to assign:</p>
                        <ul className="max-h-[50vh] overflow-y-auto space-y-3 pr-2 -mr-2">
                            {teamMembers.map(member => {
                                const isSelected = selectedIds.includes(member.id);
                                // --- NEW: Disable selection if at capacity and member is not already selected ---
                                const isDisabled = isAtCapacity && !isSelected;
                                return (
                                <li key={member.id}>
                                    <label
                                        htmlFor={`member-${member.id}-${role}`}
                                        className={`relative flex items-center w-full p-4 rounded-xl transition-all duration-200 border-2 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 shadow-md' : 'bg-slate-50 dark:bg-slate-800/60 border-transparent'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer'}`}
                                    >
                                        <input type="checkbox" id={`member-${member.id}-${role}`} checked={isSelected} onChange={() => handleMemberSelect(member.id)} className="sr-only" disabled={isDisabled} />
                                        <img src={getAvatarUrl(member.name)} alt={member.name} className="h-10 w-10 rounded-full mr-4 border-2 border-white dark:border-slate-700"/>
                                        <div className="flex-grow">
                                            <span className="block font-semibold text-slate-800 dark:text-slate-100">{member.name}</span>
                                             <span className="block text-xs text-indigo-500 dark:text-indigo-400 font-medium">
                                                {(member.roles && member.roles.length > 0) ? member.roles.join(', ') : 'No role specified'}
                                            </span>
                                        </div>
                                        {isSelected && <div className="absolute top-3 right-3 text-indigo-500"><CheckCircle size={20} strokeWidth={2.5}/></div>}
                                    </label>
                                </li>
                            )})}
                        </ul>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 h-fit sticky top-6">
                        <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Assignment Changes</h4>
                        {toAdd.length === 0 && toRemove.length === 0 ? <div className="text-center py-8"><p className="text-sm text-slate-400 dark:text-slate-500">No changes made yet.</p></div> : <div className="space-y-4">
                            {toAdd.length > 0 && <div><h5 className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center mb-2"><UserPlus size={16} className="mr-2"/>To Be Added</h5><div className="space-y-2">{toAdd.map(m => <div key={m.id} className="text-sm text-slate-600 dark:text-slate-300 bg-green-50 dark:bg-green-900/30 p-2 rounded-md">{m.name}</div>)}</div></div>}
                            {toRemove.length > 0 && <div><h5 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center mb-2"><UserMinus size={16} className="mr-2"/>To Be Removed</h5><div className="space-y-2">{toRemove.map(m => <div key={m.id} className="text-sm text-slate-600 dark:text-slate-300 bg-red-50 dark:bg-red-900/30 p-2 rounded-md">{m.name}</div>)}</div></div>}
                        </div>}
                    </div>
                </div>
                <div className="flex justify-end space-x-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl border-t border-slate-200 dark:border-slate-700/80">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors ring-1 ring-inset ring-slate-300 dark:ring-slate-600">Cancel</button>
                    <button onClick={handleSaveChangesClick} className="px-8 py-2.5 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 transform hover:scale-105">Save Changes</button>
                </div>
            </div>
        </div>
    );
};


// --- (MODIFIED) Allocation Slot now shows required count ---
const AllocationSlot = ({ role, assignedMembers, requiredCount, onClick }) => {
    const displayMembers = assignedMembers.slice(0, 3);
    const remainingCount = assignedMembers.length - displayMembers.length;

    return (
        <div
            onClick={onClick}
            className="flex-1 min-w-[150px] bg-white dark:bg-slate-800/70 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer transition-all duration-200 group relative"
        >
            <div className="flex justify-between items-baseline">
                 <h4 className="font-bold text-sm text-slate-500 dark:text-slate-400 mb-3">{role.replace(/([A-Z])/g, ' $1').trim()}</h4>
            </div>
            {assignedMembers.length > 0 ? (
                <div className="flex items-center -space-x-3">
                    {displayMembers.map(member => (
                        <img key={member.id} src={getAvatarUrl(member.name)} alt={member.name} className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-800" title={member.name} />
                    ))}
                    {remainingCount > 0 && (
                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-200 border-2 border-white dark:border-slate-800">
                            +{remainingCount}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center h-9">
                    <div className="w-full h-full rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:border-indigo-400 group-hover:text-indigo-400 transition-colors">
                        <Plus size={16} />
                        <span className="text-xs ml-1 font-semibold">Assign</span>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- (MODIFIED) Event Card Component now handles the new data structure ---
const ShootCard = ({ shoot, roles, teamMembers, onOpenModal }) => {
    const eventDate = new Date(shoot.eventDate);
    const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = eventDate.getDate();

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/60 overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
            <div className="p-6 flex items-start gap-5">
                <div className="flex-shrink-0 text-center bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 w-20 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-bold text-indigo-500 dark:text-indigo-400">{month}</p>
                    <p className="text-3xl font-extrabold text-slate-700 dark:text-slate-200 tracking-tight">{day}</p>
                </div>
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{shoot.clientName}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-slate-500 dark:text-slate-400 mt-2 gap-x-4 gap-y-1">
                        <span className="flex items-center"><Film size={14} className="mr-2" />{shoot.functionName}</span>
                        <span className="flex items-center"><MapPin size={14} className="mr-2" />{shoot.location}</span>
                    </div>
                </div>
            </div>
            <div className="px-6 pb-6 pt-4 bg-slate-50/70 dark:bg-slate-900/40">
                <h4 className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 mb-3 tracking-wider">Assignments</h4>
                <div className="flex gap-4 overflow-x-auto pb-2 -mb-2">
                    {roles.map(role => {
                        // --- MODIFIED: Handle new allocation object { required, assigned } ---
                        const allocation = shoot.allocations[role] || { required: 1, assigned: [] };
                        const assignedMemberIds = allocation.assigned;
                        const requiredCount = allocation.required;
                        const assignedMembers = teamMembers.filter(tm => assignedMemberIds.includes(tm.id));
                        
                        return (
                            <AllocationSlot
                                key={role}
                                role={role}
                                assignedMembers={assignedMembers}
                                requiredCount={requiredCount}
                                onClick={() => onOpenModal(shoot.id, role)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};


// --- (MODIFIED) Main Component with updated state management for new data structure ---
const TeamAllocationCalendar = ({ initialShoots, teamMembers, roles, onSaveAllocation }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [shootsData, setShootsData] = useState([]);

    // This effect ensures the internal state is updated when the props change
    useEffect(() => {
       const transformedShoots = (initialShoots || []).map(shoot => {
            const newAllocations = {};
            roles.forEach(role => {
                newAllocations[role] = shoot.allocations?.[role] || { required: 1, assigned: [] };
            });
            return { ...shoot, allocations: newAllocations };
        });
        setShootsData(transformedShoots);
    }, [initialShoots, roles]);

    const [modalContext, setModalContext] = useState(null);

    const openModal = (shootId, role) => setModalContext({ shootId, role });
    const closeModal = () => setModalContext(null);
    const handleMonthChange = (inc) => setCurrentDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + inc); return n; });
    const handleYearChange = (inc) => setCurrentDate(d => { const n = new Date(d); n.setFullYear(n.getFullYear() + inc); return n; });

    const filteredShoots = useMemo(() => {
        return (shootsData || [])
            .filter(shoot => {
                const shootDate = new Date(shoot.eventDate);
                return shootDate.getMonth() === currentDate.getMonth() && shootDate.getFullYear() === currentDate.getFullYear();
            })
            .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
    }, [shootsData, currentDate]);

    const handleUpdateAllocation = (shootId, role, teamMemberIds) => {
        // 1. Optimistic UI Update for a snappy user experience
        setShootsData(prevShoots =>
            prevShoots.map(shoot => {
                if (shoot.id === shootId) {
                    const newAllocations = { ...shoot.allocations };
                    if (!newAllocations[role]) newAllocations[role] = { required: 1, assigned: [] };
                    newAllocations[role].assigned = teamMemberIds || [];
                    return { ...shoot, allocations: newAllocations };
                }
                return shoot;
            })
        );
        
        // 2. Call the save function from the parent page to trigger the API call
        if (typeof onSaveAllocation === 'function') {
            onSaveAllocation(shootId, role, teamMemberIds);
        }

        closeModal();
    };

    const formattedDate = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const currentShootForModal = modalContext ? shootsData.find(s => s.id === modalContext.shootId) : null;
    const currentAllocation = currentShootForModal?.allocations[modalContext?.role];
    
    const navButtonStyles = "p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition-colors";
    
    // --- MODIFIED: Get data for modal from the new structure ---
   
    const currentAllocationIds = currentAllocation?.assigned || [];
    const currentRequiredCount = currentAllocation?.required || 1;
    
    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 rounded-2xl w-full min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-1 space-x-1 shadow-sm">
                    <button onClick={() => handleYearChange(-1)} className={navButtonStyles} aria-label="Previous year"><ChevronLeft size={14} /></button>
                    <button onClick={() => handleMonthChange(-1)} className={navButtonStyles} aria-label="Previous month"><ChevronLeft size={20} /></button>
                    <span className="w-36 text-center font-bold text-base text-indigo-600 dark:text-indigo-400 tabular-nums">{formattedDate}</span>
                    <button onClick={() => handleMonthChange(1)} className={navButtonStyles} aria-label="Next month"><ChevronRight size={20} /></button>
                    <button onClick={() => handleYearChange(1)} className={navButtonStyles} aria-label="Next year"><ChevronRight size={14} /></button>
                </div>
            </div>

            <div className="space-y-6">
                {filteredShoots.length > 0 ? (
                    filteredShoots.map(shoot => (
                        <ShootCard key={shoot.id} shoot={shoot} roles={roles} teamMembers={teamMembers} onOpenModal={openModal} />
                    ))
                ) : (
                    <div className="text-center py-24 bg-white dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                            <CalendarX size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
                            <p className="font-semibold text-xl text-slate-500 dark:text-slate-400">No Events Found</p>
                            <p className="text-md">There are no events scheduled for {formattedDate}.</p>
                        </div>
                    </div>
                )}
            </div>

            <AssignmentModal
                isOpen={!!modalContext}
                onClose={closeModal}
                teamMembers={teamMembers}
                role={modalContext?.role || ''}
                 currentAssignedMemberIds={currentAllocation?.assigned || []}
                requiredCount={currentAllocation?.required || 1}
                onSaveChanges={(teamMemberIds) => {
                    if (modalContext) {
                        handleUpdateAllocation(modalContext.shootId, modalContext.role, teamMemberIds);
                    }
                }}
            />

            <style jsx global>{`
                @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default TeamAllocationCalendar;