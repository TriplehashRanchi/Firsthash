'use client';
import React, { useState } from 'react';
import { Camera, CalendarDays, Clock, MapPin, Edit3, X, UserPlus, Users as UsersIcon, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
// --- MODAL COMPONENT (with corrected prop name) ---
const AssignmentModalContent = ({
    onClose,
    teamMembersToDisplay,
    serviceName,
    requiredCount,
    currentAssignedMemberIds,
    onSaveChanges,
    teamMembers, // <-- This prop name is what we will use consistently
}) => {
    const [selectedMemberIds, setSelectedMemberIds] = useState([...currentAssignedMemberIds]);

    const handleMemberSelect = (memberId) => {
        console.log('Selecting member:', memberId);
        console.log('Current selected:', selectedMemberIds);
        console.log('Required count:', requiredCount);

        setSelectedMemberIds((prevIds) => {
            if (prevIds.includes(memberId)) {
                const newIds = prevIds.filter((id) => id !== memberId);
                console.log('Removing member, new selection:', newIds);
                return newIds;
            } else {
                if (prevIds.length < requiredCount) {
                    const newIds = [...prevIds, memberId];
                    console.log('Adding member, new selection:', newIds);
                    return newIds;
                } else {
                    console.log('Max count reached, cannot add more. Current:', prevIds.length, 'Required:', requiredCount);
                    return prevIds;
                }
            }
        });
    };

    const handleSaveChangesClick = () => {
        onSaveChanges(selectedMemberIds);
    };

    // Now correctly uses the 'teamMembers' prop for lookups
    const getMemberById = (id) => (teamMembers || []).find((member) => member.id === id);

    return (
        <div className="fixed inset-0 bg-gray-600 dark:bg-slate-900 bg-opacity-50 dark:bg-opacity-80 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
            <div className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl shadow-2xl w-full max-w-lg border border-slate-300 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-300 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600 dark:from-purple-400 dark:to-pink-500 flex items-center">
                        <UserPlus size={26} className="mr-3 text-purple-500 dark:text-purple-400" /> Assign Team
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
                        Required:{' '}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {selectedMemberIds.length} / {requiredCount}
                        </span>{' '}
                        assigned
                    </p>
                </div>

                {currentAssignedMemberIds.length > 0 && (
                    <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Currently assigned:</p>
                        <div className="flex flex-wrap gap-2">
                            {currentAssignedMemberIds.map((id) => {
                                const member = getMemberById(id);
                                return member ? (
                                    <span key={id} className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-500 dark:text-white px-2 py-0.5 rounded-full">
                                        {member.name}
                                    </span>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}

                {teamMembersToDisplay.length > 0 ? (
                    <ul className="max-h-60 overflow-y-auto space-y-2 pr-1 mb-6 border border-slate-300 dark:border-slate-700 rounded-md p-3 bg-slate-50 dark:bg-slate-800/50">
                        {teamMembersToDisplay.map((member) => (
                            <li key={member.id}>
                                <label
                                    htmlFor={`member-${member.id}-${serviceName}`}
                                    className={`flex items-center w-full p-3 rounded-lg cursor-pointer transition-all duration-200 ease-in-out border-2 ${selectedMemberIds.includes(member.id) ? 'bg-indigo-500/10 dark:bg-indigo-600/20 border-indigo-500' : 'bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600/70'}`}
                                >
                                    <input
                                        type="checkbox"
                                        id={`member-${member.id}-${serviceName}`}
                                        checked={selectedMemberIds.includes(member.id)}
                                        onChange={() => handleMemberSelect(member.id)}
                                        disabled={!selectedMemberIds.includes(member.id) && selectedMemberIds.length >= requiredCount}
                                        className="h-5 w-5 rounded border-slate-400 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div className="flex-grow ml-4">
                                        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{member.name}</span>
                                        {/* This now displays only the member's relevant "on-production" roles */}
                                        <span className="block text-xs text-slate-600 dark:text-slate-400">{member.onProductionRoles.join(', ')}</span>
                                    </div>
                                    {selectedMemberIds.includes(member.id) && <CheckCircle size={18} className="text-green-500 ml-auto" />}
                                </label>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-10 my-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                        <UsersIcon size={32} className="mx-auto mb-2 text-slate-400" />
                        <p className="text-slate-600 dark:text-slate-400">No suitable employees found for {serviceName}.</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Available roles in team: {(teamMembers || []).map((m) => m.primaryRole).join(', ')}</p>
                    </div>
                )}

                <div className="flex justify-end space-x-4 pt-4 border-t border-slate-300 dark:border-slate-700">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-sm font-medium bg-slate-200 dark:bg-slate-600/50 ring-1 ring-slate-300 dark:ring-slate-500">
                        Cancel
                    </button>
                    <button onClick={handleSaveChangesClick} className="px-8 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-pink-600">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT (with corrected props and logic) ---
const ShootsTab = ({ projectId, isReadOnly, shoots, eligibleTeamMembers, sectionTitleStyles, DetailPairStylishComponent, ContentListItemComponent, onUpdateShootAssignment, onEditCity }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [assignmentContext, setAssignmentContext] = useState(null);
    const searchParams = useSearchParams();
    const { role } = useAuth();
    console.log('role', role);

    if (!Array.isArray(shoots) || shoots.length === 0) {
        return (
            <div className="text-center py-10">
                <Camera size={48} className="mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400">No shoots scheduled</p>
            </div>
        );
    }

    const sortedShoots = [...shoots].sort((a, b) => new Date(a.date) - new Date(b.date));

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Calculate date range for display
    const dateRangeDisplay =
        sortedShoots.length > 0
            ? sortedShoots.length === 1
                ? formatDate(sortedShoots[0].date)
                : `${formatDate(sortedShoots[0].date)} - ${formatDate(sortedShoots[sortedShoots.length - 1].date)}`
            : '';

    const openAssignmentModal = (shootId, serviceName, currentAssignments, requiredCount) => {
        console.log('Opening assignment modal:', {
            shootId,
            serviceName,
            currentAssignments,
            requiredCount,
        });

        // Handle both formats: array of objects with id/name OR array of names
        let currentIds = [];
        if (currentAssignments && Array.isArray(currentAssignments)) {
            if (currentAssignments.length > 0 && typeof currentAssignments[0] === 'object' && currentAssignments[0].id) {
                // Format: [{ id: 'xxx', name: 'John' }, ...]
                currentIds = currentAssignments.map((assignee) => assignee.id);
            } else {
                // Format: ['John Doe', 'Jane Smith', ...] - convert names to IDs
                currentIds = currentAssignments.map((name) => eligibleTeamMembers?.find((m) => m.name === name)?.id).filter((id) => id);
            }
        }

        console.log('Current assigned IDs:', currentIds);

        setAssignmentContext({ shootId, serviceName, currentAssignedMemberIds: currentIds, requiredCount });
        setIsModalOpen(true);
    };

    const closeAssignmentModal = () => {
        setIsModalOpen(false);
        setAssignmentContext(null);
    };

    const handleSaveChangesFromModal = (selectedMemberIdsArray) => {
        console.log('Saving changes:', {
            shootId: assignmentContext?.shootId,
            serviceName: assignmentContext?.serviceName,
            selectedIds: selectedMemberIdsArray,
        });

        if (assignmentContext && onUpdateShootAssignment) {
            // Pass the IDs directly - don't convert to names
            // Your backend expects: { serviceName, assigneeIds }
            onUpdateShootAssignment(
                assignmentContext.shootId,
                assignmentContext.serviceName,
                selectedMemberIdsArray, // Pass IDs directly
            );
        }
        closeAssignmentModal();
    };

    // --- SIMPLIFIED: Just return all team members for now ---
    // --- START: THE ONE-LINE FIX ---
    const getTeamMembersForService = (serviceName) => {
        // Step 1: Infer the ideal role keyword from the service name using a regular expression.
        // This handles variations like "Videographer" or "VideoGraphy".
        const lowerServiceName = serviceName.toLowerCase();
        let idealRoleKeyword = '';
        if (/photo/i.test(lowerServiceName)) idealRoleKeyword = 'photographer';
        else if (/video|cinematic/i.test(lowerServiceName)) idealRoleKeyword = 'videographer';
        else if (/drone/i.test(lowerServiceName)) idealRoleKeyword = 'drone';
        else if (/light/i.test(lowerServiceName)) idealRoleKeyword = 'lightman';

        // Step 2: Score and prepare each eligible team member.
        const scoredMembers = (eligibleTeamMembers || []).map((member) => {
            let score = 0;

            // Get a clean list of just their "on-production" roles for display.
            const onProductionRoles = member.roles.filter((role) => role.code === 1).map((role) => role.role);

            // Check if any of their on-production roles match the ideal keyword for this service.
            const hasIdealRole = onProductionRoles.some((role) => role.toLowerCase().includes(idealRoleKeyword));

            // Give a high score if they have the ideal role.
            if (idealRoleKeyword && hasIdealRole) {
                score = 10;
            }

            return {
                ...member,
                score,
                onProductionRoles, // Store the filtered roles for display in the modal
            };
        });

        // Step 3: Sort the members. Higher scores (more relevant) will appear first.
        return scoredMembers.sort((a, b) => b.score - a.score);
    };

    return (
        <>
            <div id="section-shoots">
                <div className="mb-4">
                    {/* Heading */}
                    <h3 className={`${sectionTitleStyles} flex items-center`}>
                        <Camera className="w-5 h-5 mr-2.5 text-indigo-600" />
                        Shoot Schedule
                    </h3>

                    {/* Date + Button in same row */}
                    <div className="flex items-center justify-between mt-2">
                        {dateRangeDisplay && (
                            <p className="flex items-center text-sm text-slate-500">
                                <CalendarDays size={14} className="mr-2" />
                                Event Dates: {dateRangeDisplay}
                            </p>
                        )}

                        {!isReadOnly && (
                            <Link href={`/${role === 'manager' ? 'manager' : 'admin'}/gopo?projectId=${projectId}&focus=shoots`}>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 transition-colors">
                                    <Edit3 size={16} />
                                    Edit
                                </button>
                            </Link>
                        )}
                    </div>
                </div>

                <div>
                    {sortedShoots.map((shoot, index) => (
                        <ContentListItemComponent key={shoot.id || index} className="mb-6 last:mb-0">
                            <h4 className="text-md font-semibold text-indigo-700 dark:text-indigo-300 mb-2 flex items-center">
                                <Camera size={18} className="mr-2 text-indigo-600" />
                                Shoot {index + 1}: {shoot.title}
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 mb-3">
                                <DetailPairStylishComponent label="Date" value={shoot.date} isDate icon={CalendarDays} />
                                <DetailPairStylishComponent label="Time" value={shoot.time} icon={Clock} />
                                <div className="flex items-center justify-between">
                                    <DetailPairStylishComponent label="City" value={shoot.city} icon={MapPin} />
                                    {!isReadOnly && (
                                        <button
                                            onClick={() => onEditCity && onEditCity(shoot)}
                                            className="ml-2 px-2 py-1 text-xs bg-indigo-50 text-indigo-600 
                   rounded-md hover:bg-indigo-100 dark:bg-indigo-500/10 
                   dark:text-indigo-300"
                                        >
                                            Change
                                        </button>
                                    )}
                                </div>
                            </div>

                            {shoot.selectedServices && Object.keys(shoot.selectedServices).length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/60">
                                    <div className="grid grid-cols-2 gap-x-4 mb-3 px-2">
                                        <p className="text-xs font-semibold text-slate-500 uppercase">Requirements</p>
                                        <p className="text-xs font-semibold text-slate-500 uppercase">Assign To</p>
                                    </div>

                                    {Object.entries(shoot.selectedServices).map(([serviceName, serviceDetails]) => {
                                        // Handle different possible structures for serviceDetails
                                        const quantity = serviceDetails?.quantity || serviceDetails?.count || serviceDetails || 1;
                                        const currentAssignments = shoot.assignments && shoot.assignments[serviceName] ? shoot.assignments[serviceName] : [];

                                        // Handle both assignment formats
                                        let assignedPersonNames = [];
                                        if (Array.isArray(currentAssignments)) {
                                            if (currentAssignments.length > 0 && typeof currentAssignments[0] === 'object' && currentAssignments[0].name) {
                                                // Format: [{ id: 'xxx', name: 'John' }, ...]
                                                assignedPersonNames = currentAssignments.map((a) => a.name);
                                            } else {
                                                // Format: ['John Doe', 'Jane Smith', ...]
                                                assignedPersonNames = currentAssignments;
                                            }
                                        }

                                        console.log('Service details for', serviceName, ':', serviceDetails, 'quantity:', quantity);

                                        return (
                                            <div key={serviceName} className="grid grid-cols-2 gap-x-4 py-3 px-2 border-b dark:border-slate-700/60 last:border-b-0">
                                                <p className="text-sm text-slate-800 dark:text-slate-200 flex items-center">
                                                    {serviceName} {quantity > 1 ? `(x${quantity})` : ''}
                                                </p>
                                                <div className="flex items-center group">
                                                    <button
                                                        disabled={isReadOnly}
                                                        onClick={() => openAssignmentModal(shoot.id, serviceName, currentAssignments, quantity)}
                                                        className="flex items-center text-left w-full p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                                                    >
                                                        <Edit3 size={16} className="mr-2 text-slate-500 flex-shrink-0 group-hover:text-indigo-500" />
                                                        {assignedPersonNames.length > 0 ? (
                                                            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-grow group-hover:text-indigo-500">
                                                                {assignedPersonNames.join(', ')}
                                                                {assignedPersonNames.length < quantity && (
                                                                    <span className="text-xs text-amber-600 ml-1">({quantity - assignedPersonNames.length} more needed)</span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm italic text-slate-500 flex-grow group-hover:text-indigo-500">Assign Team</span>
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
                    teamMembers={eligibleTeamMembers}
                />
            )}
        </>
    );
};

export default ShootsTab;
