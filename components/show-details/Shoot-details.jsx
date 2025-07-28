'use client';
import React, { useState } from 'react';
import { Camera, CalendarDays, Clock, MapPin, Edit3, X, UserPlus, Users as UsersIcon, CheckCircle } from 'lucide-react';

// --- REMOVED: The hardcoded ALL_TEAM_MEMBERS array is gone. ---
// This component now receives the team members list as a prop.

// --- CONFIGURATION: This logic can remain as it's part of the component's business logic ---
const SERVICE_TO_REQUIRED_ROLE = {
    "Candid Photography": "Photographer",
    "Traditional Photography": "Photographer",
    "Cinematic Videography": "Videographer",
    "Traditional Videography": "Videographer",
    "Drone Aerial Shots": "Drone Operator",
};

// --- MODAL COMPONENT: Now accepts teamMembers as a prop ---
const AssignmentModalContent = ({
    onClose,
    teamMembersToDisplay,
    serviceName,
    requiredCount,
    currentAssignedMemberIds,
    onSaveChanges,
    teamMembers // <-- NEW: Receives the full team list to find members by ID
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
    
    // Uses the teamMembers prop instead of a hardcoded array
    const getMemberById = (id) => teamMembers.find(member => member.id === id);

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
                        For Service: <span className="font-semibold text-slate-700 dark:text-slate-200">{serviceName}</span>
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
                    <div className="text-slate-500 dark:text-slate-400 text-center py-10 my-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                        <UsersIcon size={32} className="mx-auto mb-2 text-slate-400 dark:text-slate-500" />
                        No suitable employees found for this service.
                    </div>
                )}

                <div className="flex justify-end space-x-4 pt-4 border-t border-slate-300 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-600/50 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors ring-1 ring-slate-300 dark:ring-slate-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveChangesClick}
                        className="px-8 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 transition-opacity shadow-lg
                                   dark:text-slate-900 dark:from-purple-400 dark:to-pink-500"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT: Now accepts teamMembers as a prop ---
const ShootsTab = ({ 
    shoots, 
    teamMembers, // <-- NEW PROP
    sectionTitleStyles, 
    DetailPairStylishComponent, 
    ContentListItemComponent,
    onUpdateShootAssignment
}) => {

    console.log("🟡 shoots:", shoots);
    console.log("🟡 teamMembers:", teamMembers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [assignmentContext, setAssignmentContext] = useState(null); 

    if (!Array.isArray(shoots) || shoots.length === 0) { 
        return (
            <div>
                 <h3 className={sectionTitleStyles}>
                    <Camera className="w-5 h-5 mr-2.5 text-indigo-600 dark:text-indigo-400" />
                    Shoot Schedule
                </h3>
                <p className="text-slate-500 dark:text-slate-400 p-2">No shoots scheduled.</p>
            </div>
        );
    }
    
    const sortedShoots = [...shoots].sort((a, b) => new Date(a.date) - new Date(b.date));

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };
    
    const startDate = sortedShoots[0]?.date;
    const endDate = sortedShoots[sortedShoots.length - 1]?.date;
    let dateRangeDisplay = '';
    if (startDate) {
        if (startDate === endDate) {
            dateRangeDisplay = formatDate(startDate);
        } else {
            dateRangeDisplay = `${formatDate(startDate)} - ${formatDate(endDate)}`;
        }
    }

    const openAssignmentModal = (shootId, serviceName, currentAssignedNamesArray, requiredCount) => {
        // Uses the teamMembers prop to find employee IDs from their names
        const currentIds = (currentAssignedNamesArray || [])
            .map(name => teamMembers.find(m => m.name === name)?.id)
            .filter(id => id); 

        setAssignmentContext({ 
            shootId, 
            serviceName, 
            currentAssignedMemberIds: currentIds,
            requiredCount 
        });
        setIsModalOpen(true);
    };

    const closeAssignmentModal = () => {
        setIsModalOpen(false);
        setAssignmentContext(null);
    };

    const handleSaveChangesFromModal = (selectedMemberIdsArray) => {
        if (assignmentContext && onUpdateShootAssignment) {
            // Uses the teamMembers prop to find employee names from their IDs
            const selectedNames = selectedMemberIdsArray
                .map(id => teamMembers.find(m => m.id === id)?.name)
                .filter(name => name); 

            onUpdateShootAssignment(
                assignmentContext.shootId, 
                assignmentContext.serviceName, 
                selectedNames
            );
        }
        closeAssignmentModal();
    };



    const getTeamMembersForService = (serviceName) => {
        const requiredRole = SERVICE_TO_REQUIRED_ROLE[serviceName];
        if (requiredRole) {
            const directMatches = [];
            const otherMembers = [];
            // Uses the teamMembers prop
            (teamMembers || []).forEach(member => {
                if (member.roles.includes(requiredRole)) {
                    directMatches.push(member);
                } else {
                    otherMembers.push(member);
                }
            });
            return [...directMatches, ...otherMembers];
        }
        return teamMembers || []; // Returns the prop, or an empty array if undefined
    };
    
    return (
        <>
            <div>
                <div className="mb-4">
                    <h3 className={sectionTitleStyles}>
                        <Camera className="w-5 h-5 mr-2.5 text-indigo-600 dark:text-indigo-400" />
                        Shoot Schedule
                    </h3>
                    {dateRangeDisplay && (
                        <p className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1 pl-1">
                            <CalendarDays size={14} className="mr-2"/>
                            Event Dates: {dateRangeDisplay}
                        </p>
                    )}
                </div>

                <div> 
                    {sortedShoots.map((shoot, index) => ( 
                        <ContentListItemComponent key={shoot.id || index} className="mb-6 last:mb-0">
                            <h4 className="text-md font-semibold text-indigo-700 dark:text-indigo-300 mb-2 flex items-center">
                                <Camera size={18} className="mr-2 text-indigo-600 dark:text-indigo-400"/> Shoot {index + 1}: {shoot.title}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 mb-3">
                                <DetailPairStylishComponent label="Date" value={shoot.date} isDate icon={CalendarDays}/>
                                <DetailPairStylishComponent label="Time" value={shoot.time} icon={Clock}/>
                                <DetailPairStylishComponent label="City" value={shoot.city} icon={MapPin}/>
                            </div>

                            {shoot.selectedServices && Object.keys(shoot.selectedServices).length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/60">
                                    <div className="grid grid-cols-2 gap-x-4 mb-3 px-2">
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Requirements</p>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assign To</p>
                                    </div>

                                    {Object.entries(shoot.selectedServices).map(([serviceName, requiredCount]) => {
                                        const assignedPersonNames = (shoot.assignments && Array.isArray(shoot.assignments[serviceName]))
                                                                    ? shoot.assignments[serviceName] 
                                                                    : [];
                                        return (
                                            <div 
                                                key={serviceName} 
                                                className="grid grid-cols-2 gap-x-4 py-3 px-2 border-b border-slate-200 dark:border-slate-700/60 last:border-b-0"
                                            >
                                                <p className="text-sm text-slate-800 dark:text-slate-200 flex items-center">
                                                    {serviceName} {requiredCount > 1 ? `(x${requiredCount})` : ''}
                                                </p>
                                                
                                                <div className="flex items-center group">
                                                    <button 
                                                        onClick={() => openAssignmentModal(shoot.id, serviceName, assignedPersonNames, requiredCount)}
                                                        className="flex items-center text-left w-full p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                    >
                                                        <Edit3 size={16} className="mr-2 text-slate-500 dark:text-slate-400 flex-shrink-0 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                                                        {assignedPersonNames.length > 0 ? (
                                                            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-grow group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                                                                {assignedPersonNames.join(', ')}
                                                                {assignedPersonNames.length < requiredCount && 
                                                                    <span className="text-xs text-amber-600 dark:text-amber-500 ml-1">({requiredCount - assignedPersonNames.length} more needed)</span>}
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm italic text-slate-500 dark:text-slate-500 flex-grow group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                                                                Team not assign
                                                            </span>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </ContentListItemComponent>
                    ))}
                </div>
            </div>

            {isModalOpen && assignmentContext && (
                <AssignmentModalContent
                    onClose={closeAssignmentModal}
                    teamMembersToDisplay={getTeamMembersForService(assignmentContext.serviceName)}
                    serviceName={assignmentContext.serviceName}
                    requiredCount={assignmentContext.requiredCount}
                    currentAssignedMemberIds={assignmentContext.currentAssignedMemberIds}
                    onSaveChanges={handleSaveChangesFromModal}
                    teamMembers={teamMembers} // <-- Pass the teamMembers list down to the modal
                />
            )}
        </>
    );
};

export default ShootsTab;