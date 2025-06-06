'use client';
import React, { useState } from 'react';
import { PackageCheck, CalendarClock, Edit3, X, UserPlus, Users as UsersIcon, CheckCircle } from 'lucide-react';

// --- Expanded Team Data ---
const ALL_TEAM_MEMBERS = [
    // Core Team
    { id: "dg1", name: "Dheeraj Giri", roles: ["Photographer"], primaryRole: "Traditional Photographer" },
    { id: "as1", name: "Amit Sharma", roles: ["Photographer", "Drone Operator"], primaryRole: "Candid Photographer" },
    { id: "ps1", name: "Priya Singh", roles: ["Videographer", "Editor"], primaryRole: "Cinematic Videographer & Editor" },
    { id: "rv1", name: "Rahul Verma", roles: ["Photographer"], primaryRole: "General Photographer" },
    { id: "sp1", name: "Sneha Patel", roles: ["Videographer"], primaryRole: "Traditional Videographer" },
    { id: "ar1", name: "Anita Rao", roles: ["Editor"], primaryRole: "Lead Photo Editor" },
    { id: "vc1", name: "Vikram Choudhary", roles: ["Photographer", "Drone Operator"], primaryRole: "Drone Operator & Photographer" },
    { id: "mi1", name: "Meena Iyer", roles: ["Videographer"], primaryRole: "Videographer Assistant" },
    { id: "ap1", name: "Aarav Patel", roles: ["Photographer"], primaryRole: "Event Photographer" },
    { id: "ir1", name: "Ishaan Reddy", roles: ["Photographer"], primaryRole: "Assistant Photographer" },
    { id: "zk1", name: "Zara Khan", roles: ["Videographer"], primaryRole: "Lead Videographer" },
    { id: "km1", name: "Kabir Mehta", roles: ["Videographer"], primaryRole: "Second Videographer" },
    { id: "rj1", name: "Rohan Joshi", roles: ["Drone Operator"], primaryRole: "FPV Drone Pilot" },
    { id: "ng1", name: "Naina Gupta", roles: ["Editor"], primaryRole: "Lead Video Editor" },
    { id: "rk1", name: "Raj Kumar", roles: ["Assistant"], primaryRole: "General Assistant" },
    { id: "sk1", "name": "Simran Kaur", roles: ["Assistant", "Coordinator"], primaryRole: "Production Coordinator" },
    // Additional Members
    { id: "aj1", name: "Aditya Joshi", roles: ["Photographer", "Editor"], primaryRole: "Photographer & Retoucher" },
    { id: "pg1", name: "Pooja Gupta", roles: ["Coordinator"], primaryRole: "Client Coordinator" },
    { id: "ss1", name: "Sanjay Singh", roles: ["Videographer", "Drone Operator"], primaryRole: "Videographer & Drone" },
    { id: "kd1", name: "Kavita Desai", roles: ["Editor"], primaryRole: "Album Designer" },
    { id: "ma1", name: "Mohan Agrawal", roles: ["Assistant"], primaryRole: "Lighting Assistant" },
    { id: "ts1", name: "Tina Saini", roles: ["Photographer"], primaryRole: "Second Photographer" },
];

const getRoleForDeliverable = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('video') || lowerTitle.includes('film') || lowerTitle.includes('reel') || lowerTitle.includes('cinematic')) return 'Editor';
    if (lowerTitle.includes('album') || lowerTitle.includes('photo') || lowerTitle.includes('gallery')) return 'Editor';
    if (lowerTitle.includes('coordinat')) return 'Coordinator';
    return 'Assistant';
};
// --- End Team Data ---


// --- Inline Modal Component Logic (Adapted from ShootsTab) ---
const AssignmentModalContent = ({
    onClose,
    teamMembersToDisplay,
    serviceName, // Will be the deliverable title
    requiredCount,
    currentAssignedMemberIds,
    onSaveChanges,
}) => {
    const [selectedMemberIds, setSelectedMemberIds] = useState([...currentAssignedMemberIds]);

    const handleMemberSelect = (memberId) => {
        setSelectedMemberIds(prevIds => {
            if (prevIds.includes(memberId)) {
                return prevIds.filter(id => id !== memberId);
            } else {
                if (prevIds.length < requiredCount) {
                    return [...prevIds, memberId];
                }
                return prevIds;
            }
        });
    };

    const handleSaveChangesClick = () => {
        onSaveChanges(selectedMemberIds);
    };
    
    const getMemberById = (id) => ALL_TEAM_MEMBERS.find(member => member.id === id);

    return (
        <div className="fixed inset-0 bg-gray-600 dark:bg-slate-900 bg-opacity-50 dark:bg-opacity-80 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
            <div className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl shadow-2xl w-full max-w-lg border border-slate-300 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-300 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600 dark:from-purple-400 dark:to-pink-500 flex items-center">
                        <UserPlus size={26} className="mr-3 text-purple-500 dark:text-purple-400"/> Assign Team
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">
                        For Deliverable: <span className="font-semibold text-slate-700 dark:text-slate-200">{serviceName}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Required: <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedMemberIds.length} / {requiredCount}</span> assigned
                    </p>
                </div>
                
                {currentAssignedMemberIds.length > 0 && (
                    <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Currently assigned:</p>
                        <div className="flex flex-wrap gap-2">
                            {currentAssignedMemberIds.map(id => {
                                const member = getMemberById(id);
                                return member ? (
                                    <span key={id} className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-500 dark:text-white px-2 py-0.5 rounded-full">{member.name}</span>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}

                {teamMembersToDisplay.length > 0 ? (
                    <ul className="max-h-60 overflow-y-auto space-y-2 pr-1 mb-6 border border-slate-300 dark:border-slate-700 rounded-md p-3 bg-slate-50 dark:bg-slate-800/50">
                        {teamMembersToDisplay.map(member => (
                            <li key={member.id}>
                                <label
                                    htmlFor={`member-${member.id}-${serviceName}`}
                                    className={`flex items-center w-full p-3 rounded-lg cursor-pointer transition-all duration-200 ease-in-out
                                                border-2 
                                                ${selectedMemberIds.includes(member.id)
                                                    ? 'bg-indigo-500/10 dark:bg-indigo-600/20 border-indigo-500 dark:border-indigo-500 shadow-lg transform scale-[1.02]' 
                                                    : 'bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600/70 hover:border-slate-400 dark:hover:border-slate-500'
                                                }
                                                ${!selectedMemberIds.includes(member.id) && selectedMemberIds.length >= requiredCount ? 'opacity-60 cursor-not-allowed' : ''}
                                            `}
                                >
                                    <input
                                        type="checkbox"
                                        id={`member-${member.id}-${serviceName}`}
                                        checked={selectedMemberIds.includes(member.id)}
                                        onChange={() => handleMemberSelect(member.id)}
                                        disabled={!selectedMemberIds.includes(member.id) && selectedMemberIds.length >= requiredCount}
                                        className="h-5 w-5 rounded border-slate-400 dark:border-slate-500 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-slate-600 mr-4 shadow-sm"
                                    />
                                    <div className="flex-grow">
                                        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{member.name}</span>
                                        <span className="block text-xs text-slate-600 dark:text-slate-400">{member.primaryRole}</span>
                                    </div>
                                    {selectedMemberIds.includes(member.id) && <CheckCircle size={18} className="text-green-500 dark:text-green-400 ml-auto" />}
                                </label>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-slate-500 dark:text-slate-400 text-center py-10 my-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg"><UsersIcon size={32} className="mx-auto mb-2 text-slate-400 dark:text-slate-500" />No suitable employees found.</div>
                )}
                <div className="flex justify-end space-x-4 pt-4 border-t border-slate-300 dark:border-slate-700">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-600/50 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors ring-1 ring-slate-300 dark:ring-slate-500">Cancel</button>
                    <button onClick={handleSaveChangesClick} className="px-8 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 transition-opacity shadow-lg dark:text-slate-900 dark:from-purple-400 dark:to-pink-500">Save Changes</button>
                </div>
            </div>
        </div>
    );
};
// --- End Inline Modal Component ---

const DeliverablesDetails = ({
    deliverables, sectionTitleStyles, onUpdateDeliverableAssignment
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [assignmentContext, setAssignmentContext] = useState(null);

    if (!deliverables || deliverables.length === 0) {
        return <p className="text-slate-500 dark:text-slate-400 p-2">No deliverables specified.</p>;
    }

    const openAssignmentModal = (deliverableId, deliverableTitle, currentAssignedNamesArray, requiredCount) => {
        const currentIds = (currentAssignedNamesArray || []).map(name => ALL_TEAM_MEMBERS.find(m => m.name === name)?.id).filter(id => id);
        setAssignmentContext({ deliverableId, deliverableTitle, currentAssignedMemberIds: currentIds, requiredCount });
        setIsModalOpen(true);
    };

    const closeAssignmentModal = () => {
        setIsModalOpen(false);
        setAssignmentContext(null);
    };

    const handleSaveChangesFromModal = (selectedMemberIdsArray) => {
        if (assignmentContext && onUpdateDeliverableAssignment) {
            const selectedNames = selectedMemberIdsArray.map(id => ALL_TEAM_MEMBERS.find(m => m.id === id)?.name).filter(name => name);
            onUpdateDeliverableAssignment(assignmentContext.deliverableId, selectedNames);
        }
        closeAssignmentModal();
    };

    const getTeamMembersForDeliverable = (title) => {
        const requiredRole = getRoleForDeliverable(title);
        if (requiredRole) {
            const directMatches = [];
            const otherMembers = [];
            ALL_TEAM_MEMBERS.forEach(member => {
                if (member.roles.includes(requiredRole)) {
                    directMatches.push(member);
                } else {
                    otherMembers.push(member);
                }
            });
            return [...directMatches, ...otherMembers];
        }
        return ALL_TEAM_MEMBERS;
    };

    return (
        <>
            <div>
                <h3 className={sectionTitleStyles}>
                    <PackageCheck className="w-5 h-5 mr-2.5 text-indigo-500 dark:text-indigo-400" />
                    Project Deliverables
                </h3>
                
                <div className="mt-4 border-t border-slate-200 dark:border-slate-700/60">
                    <div className="grid grid-cols-2 gap-x-4 mb-2 mt-4 px-2">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">DELIVERABLE</p>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ASSIGN TO</p>
                    </div>

                    {deliverables.map((item) => {
                        const assignedPersonNames = item.assignments?.assigned || [];
                        const requiredCount = item.requiredCount || 1;
                        
                        return (
                            <div key={item.id} className="grid grid-cols-2 gap-x-4 py-2.5 px-2 border-b border-slate-200 dark:border-slate-700/60 last:border-b-0 group">
                                <div>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center">
                                        {item.title} {requiredCount > 1 ? `(x${requiredCount})` : ''}
                                        {item.isAdditionalCharge && (
                                            <span className="ml-3 text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                + {`₹ ${Number(item.additionalChargeAmount).toLocaleString('en-IN')}`}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center">
                                        <CalendarClock size={12} className="mr-1.5"/> Est. Delivery: {item.date ? new Date(item.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric'}) : 'N/A'}
                                    </p>
                                </div>

                                <button
                                    onClick={() => openAssignmentModal(item.id, item.title, assignedPersonNames, requiredCount)}
                                    className="flex items-center text-left text-sm -ml-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <Edit3 size={14} className="mr-2 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                                    {assignedPersonNames.length > 0 ? (
                                        <div className="font-medium text-slate-600 dark:text-slate-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors truncate">
                                            {assignedPersonNames.join(', ')}
                                            {assignedPersonNames.length < requiredCount && 
                                                <span className="text-xs text-amber-600 dark:text-amber-500 ml-1">({requiredCount - assignedPersonNames.length} more needed)</span>}
                                        </div>
                                    ) : (
                                        <span className="italic text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                                            Team not assign
                                        </span>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {isModalOpen && assignmentContext && (
                <AssignmentModalContent
                    onClose={closeAssignmentModal}
                    teamMembersToDisplay={getTeamMembersForDeliverable(assignmentContext.deliverableTitle)}
                    serviceName={assignmentContext.deliverableTitle}
                    requiredCount={assignmentContext.requiredCount}
                    currentAssignedMemberIds={assignmentContext.currentAssignedMemberIds}
                    onSaveChanges={handleSaveChangesFromModal}
                />
            )}
        </>
    );
};

export default DeliverablesDetails;
