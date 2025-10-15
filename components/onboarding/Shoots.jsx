'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash, Plus, X, Search, Settings2, ListChecks, Loader2, Clock, CalendarDays, Trash2 } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';
import { getAuth } from 'firebase/auth';
import AddShootModal from '@/components/common/AddShoots';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// --- Authentication Helper Functions ---
const getFirebaseToken = async () => {
    const user = getAuth().currentUser;
    if (!user) {
        console.error('User is not authenticated.');
        return null;
    }
    return await user.getIdToken();
};

const fetchWithAuth = async (url, options = {}) => {
    const token = await getFirebaseToken();
    if (!token) {
        throw new Error('Authentication token is missing. Cannot make API request.');
    }
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
    return fetch(url, { ...options, headers });
};

// --- Helper Hook ---
function useClickOutside(ref, callback, excludeRef) {
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target) && (!excludeRef || !excludeRef.current || !excludeRef.current.contains(event.target))) {
                callback();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [ref, callback, excludeRef]);
}

// --- Custom Option Component for Titles with Delete Button ---
const TitleOptionWithDelete = (props) => {
    const { children, innerProps, data, selectProps } = props;
    const handleDelete = (e) => {
        e.stopPropagation();
        if (selectProps && selectProps.onDeleteMasterTitleFromOption && data && data.value) {
            if (window.confirm(`Are you sure you want to delete "${data.value}" from the master list?`)) {
                selectProps.onDeleteMasterTitleFromOption(data.value);
            }
        }
    };
    return (
        <div
            {...innerProps}
            className={`flex items-center justify-between group px-3 py-2 ${props.isFocused ? 'bg-gray-100 dark:bg-gray-700' : ''} ${props.isSelected ? 'bg-blue-500 text-white dark:bg-blue-600' : 'dark:text-gray-200'}`}
        >
            <span className="truncate flex-grow">{children}</span>
            <button
                type="button"
                onClick={handleDelete}
                className="p-1 ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover:opacity-100"
                title={`Delete "${data.label}"`}
            >
                <Trash size={14} />
            </button>
        </div>
    );
};

// --- EditableListItem Component (for Roles) ---
const EditableListItem = ({ role, onDelete, isSelected, onToggleSelect, itemType = 'role' }) => {
    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${role.type_name}" from the master list?`)) {
            onDelete(role.id);
        }
    };
    const isGlobal = role.company_id === '00000000-0000-0000-0000-000000000000';
    return (
        <div
            className={`group flex items-center justify-between p-1.5 rounded-md w-full transition-colors duration-150 ${isSelected ? 'bg-blue-100 dark:bg-blue-800/50 hover:bg-blue-200 border border-blue-500' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 border border-gray-300'}`}
        >
            <span
                onClick={onToggleSelect ? onToggleSelect : undefined}
                className={`text-sm flex-grow truncate cursor-pointer py-1 ${isSelected ? 'font-semibold text-blue-700' : 'text-gray-700'}`}
                title={`Click to ${isSelected ? 'deselect' : 'select'} "${role.type_name}"`}
            >
                <span className="mr-2 inline-flex items-center">{isSelected ? <ListChecks size={16} className="text-blue-600" /> : <Plus size={16} className="text-gray-400" />}</span>
                {role.type_name}
            </span>
            <div className="flex items-center gap-0.5 ml-2">
                {isGlobal ? (
                    <button disabled title="Global roles cannot be deleted" className="p-1 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-40">
                        <Trash size={14} />
                    </button>
                ) : (
                    <button onClick={handleDeleteClick} className="p-1 text-red-500 hover:text-red-700 opacity-70 hover:opacity-100" title={`Delete ${itemType}`}>
                        <Trash size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

// --- ShootRow Component ---
const ShootRow = ({
    shoot,
    onChange,
    onRoleChange,
    onRoleCountChange,
    showRoleOptions,
    setShowRoleOptions,
    onDelete,
    canDelete,
    isFirst,
    masterEventTitles,
    onAddMasterTitle,
    onDeleteMasterTitle,
    masterRoles,
    onAddMasterRole,
    onDeleteMasterRole,
}) => {
    if (!shoot) return <div className="text-red-500 p-2 border border-red-500 my-2">Error: Shoot data is missing.</div>;

    const rolesPanelRef = useRef(null);
    const rolesTriggerRef = useRef(null);
    const [newRoleNameMaster, setNewRoleNameMaster] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);

    useClickOutside(
        rolesPanelRef,
        () => {
            if (showRoleOptions) setShowRoleOptions();
        },
        rolesTriggerRef,
    );

    useEffect(() => {
        const checkDarkMode = () => setIsDarkMode(typeof window !== 'undefined' && document.documentElement.classList.contains('dark'));
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        if (typeof window !== 'undefined') observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => {
            if (typeof window !== 'undefined') observer.disconnect();
        };
    }, []);

    const handleTitleSelectChange = (selectedOption) => onChange('title', selectedOption ? selectedOption.value : '');
    const handleTitleCreateOption = (inputValue) => {
        const newTitle = inputValue.trim();
        if (newTitle) {
            if (!masterEventTitles.some((t) => t.toLowerCase() === newTitle.toLowerCase())) onAddMasterTitle(newTitle);
            onChange('title', newTitle);
        }
    };
    const handleDeleteCurrentMasterTitle = () => {
        if (shoot.title && window.confirm(`Delete "${shoot.title}" from master list?`)) onDeleteMasterTitle(shoot.title);
    };

    const titleOptions = masterEventTitles.map((title) => ({ value: title, label: title }));
    const currentTitleValueForSelect = shoot.title ? { value: shoot.title, label: shoot.title } : null;

    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '40px',
            height: '40px',
            backgroundColor: isDarkMode ? 'rgb(55, 65, 81)' : 'rgb(255, 255, 255)',
            borderColor: state.isFocused ? 'rgb(59, 130, 246)' : isDarkMode ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)',
            boxShadow: state.isFocused ? `0 0 0 2px rgba(59, 130, 246, ${isDarkMode ? 0.5 : 0.4})` : 'none',
            '&:hover': { borderColor: 'rgb(59, 130, 246)' },
            paddingLeft: '30px',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
        }),
        valueContainer: (base) => ({ ...base, height: '40px', padding: '0px 2px 0px 8px' }),
        input: (base) => ({ ...base, margin: '0px', paddingTop: '0px', paddingBottom: '0px', color: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(17, 24, 39)' }),
        indicatorSeparator: () => ({ display: 'none' }),
        indicatorsContainer: (base) => ({ ...base, height: '40px' }),
        dropdownIndicator: (base) => ({
            ...base,
            padding: '8px',
            color: isDarkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
            '&:hover': { color: isDarkMode ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)' },
        }),
        clearIndicator: (base) => ({
            ...base,
            padding: '8px',
            color: isDarkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
            '&:hover': { color: isDarkMode ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)' },
        }),
        singleValue: (base) => ({ ...base, color: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(17, 24, 39)' }),
        menu: (base) => ({
            ...base,
            backgroundColor: isDarkMode ? 'rgb(31, 41, 55)' : 'rgb(255, 255, 255)',
            borderColor: isDarkMode ? 'rgb(55, 65, 81)' : 'rgb(229, 231, 235)',
            borderWidth: '1px',
            borderRadius: '0.375rem',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            zIndex: 5000,
            marginTop: '4px',
        }),
        option: (base) => ({ ...base, padding: 0 }),
        placeholder: (base) => ({ ...base, color: isDarkMode ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)', marginLeft: '2px', marginRight: '2px' }),
    };
    const selectComponents = { Option: TitleOptionWithDelete };

    const handleAddNewMasterRole = () => {
        const roleToAdd = newRoleNameMaster.trim();
        if (roleToAdd && !masterRoles.some((r) => r.type_name.toLowerCase() === roleToAdd.toLowerCase())) {
            onAddMasterRole(roleToAdd);
            setNewRoleNameMaster('');
        } else if (roleToAdd) alert(`Role "${roleToAdd}" already exists.`);
    };

    const inputBaseStyle =
        'w-full p-2 h-10 rounded border placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-sm';
    const lightModeInputStyle = 'bg-white text-gray-800 border-gray-300';
    const darkModeInputStyle = 'dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600';
    const fullInputStyle = `${inputBaseStyle} ${lightModeInputStyle} ${darkModeInputStyle}`;

    const selectedRoleIds = Object.keys(shoot.selectedRoles || {});
    let selectedRolesText = 'Select roles...';
    if (selectedRoleIds.length > 0) {
        const selectedRoleNames = selectedRoleIds.map((id) => {
            const role = masterRoles.find((r) => r.id.toString() === id);
            return role ? role.type_name : `ID ${id}`;
        });

        selectedRolesText = selectedRoleNames.length <= 2 ? selectedRoleNames.join(', ') : `${selectedRoleNames.slice(0, 2).join(', ')}, +${selectedRoleNames.length - 2}`;
    }

    return (
        <div
            className={`grid ${isFirst ? 'grid-cols-1 sm:grid-cols-5' : 'grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]'} gap-x-3 gap-y-2 sm:gap-y-1 mb-3 items-start sm:items-center pt-1`}
        >
            <div className="flex items-center gap-2 sm:col-span-1">
                <div className="relative flex-grow">
                    <CreatableSelect
                        isClearable
                        options={titleOptions}
                        value={currentTitleValueForSelect}
                        onChange={handleTitleSelectChange}
                        onCreateOption={handleTitleCreateOption}
                        placeholder="Add Shoots..."
                        styles={customSelectStyles}
                        classNamePrefix="react-select"
                        formatCreateLabel={(inputValue) => `Add "${inputValue}" & use`}
                        menuPortalTarget={document.body}
                        components={selectComponents}
                        onDeleteMasterTitleFromOption={onDeleteMasterTitle}
                    />
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none z-[1]" />
                </div>
                {shoot.title && masterEventTitles.includes(shoot.title) && !isFirst && (
                    <button
                        type="button"
                        onClick={handleDeleteCurrentMasterTitle}
                        className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md border border-transparent hover:bg-red-500/10"
                        title={`Delete "${shoot.title}"`}
                        disabled={!shoot.title}
                    >
                        <Trash size={16} />
                    </button>
                )}
            </div>
            <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input type="date" className={`${fullInputStyle} pl-10 appearance-none`} value={shoot.date || ''} onChange={(e) => onChange('date', e.target.value)} />
            </div>
            <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input type="time" className={`${fullInputStyle} pl-10 appearance-none`} value={shoot.time || ''} onChange={(e) => onChange('time', e.target.value)} />
            </div>
            <div className="relative">
                <input
                    ref={rolesTriggerRef}
                    placeholder="Roles*"
                    readOnly
                    onClick={() => setShowRoleOptions()}
                    value={selectedRolesText}
                    className={`${fullInputStyle} cursor-pointer truncate pr-10`}
                    title={Object.keys(shoot.selectedRoles || {})
                        .map((id) => masterRoles.find((r) => r.id.toString() === id)?.type_name)
                        .join(', ')}
                />
                <Settings2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>
            <input placeholder="Venue" className={fullInputStyle} value={shoot.city || ''} onChange={(e) => onChange('city', e.target.value)} />
            {!isFirst && canDelete && (
                <button
                    onClick={onDelete}
                    className="bg-red-500 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded p-2 h-10 w-10 flex items-center justify-center"
                    title="Delete Shoot"
                    type="button"
                >
                    <Trash2 size={16} />
                </button>
            )}

            {showRoleOptions && (
                <>
                    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 z-[4990]" onClick={() => setShowRoleOptions()} aria-hidden="true"></div>
                    <div
                        ref={rolesPanelRef}
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[5000] p-4 md:p-6 rounded-lg shadow-2xl w-[90vw] max-w-2xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 max-h-[85vh] flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Manage Requirements</h3>
                            <button onClick={() => setShowRoleOptions()} className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-1 space-y-6 custom-scrollbar-thin">
                            <section>
                                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Master List</h4>
                                <div className="flex gap-2 mb-4 p-3 bg-white dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
                                    <input
                                        type="text"
                                        placeholder="Add new role to master list"
                                        value={newRoleNameMaster}
                                        onChange={(e) => setNewRoleNameMaster(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddNewMasterRole()}
                                        className="flex-grow p-2 text-sm border rounded bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-500 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddNewMasterRole}
                                        className="px-4 py-2 text-sm rounded bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5"
                                        disabled={!newRoleNameMaster.trim()}
                                    >
                                        <Plus size={16} /> Add
                                    </button>
                                </div>
                                {selectedRoleIds.length > 0 && (
                                    <section className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Configure Selected Roles ({selectedRoleIds.length})</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1 custom-scrollbar-thin">
                                            {selectedRoleIds.map((roleId) => {
                                                const role = masterRoles.find((r) => r.id.toString() === roleId);
                                                if (!role) return null;
                                                return (
                                                    <div
                                                        key={roleId}
                                                        className="flex items-center justify-between text-sm p-2.5 bg-white dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600"
                                                    >
                                                        <span className="text-gray-800 dark:text-gray-200 truncate pr-2" title={role.type_name}>
                                                            {role.type_name}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <label htmlFor={`count-${shoot.id}-${roleId}`} className="text-xs text-gray-600 dark:text-gray-400">
                                                                Count:
                                                            </label>
                                                            <input
                                                                id={`count-${shoot.id}-${roleId}`}
                                                                type="number"
                                                                min="1"
                                                                value={(shoot.selectedRoles || {})[roleId] || 1}
                                                                onChange={(e) => onRoleCountChange(roleId, e.target.value)}
                                                                className="p-1 w-16 rounded text-sm text-center border bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[calc(85vh_-_400px)] overflow-y-auto p-1 custom-scrollbar-thin">
                                    {masterRoles.length > 0 ? (
                                        masterRoles.map((role) => (
                                            <EditableListItem
                                                key={role.id}
                                                role={role}
                                                isSelected={(shoot.selectedRoles || {})[role.id] !== undefined}
                                                onToggleSelect={() => onRoleChange(role.id)}
                                                onDelete={(id) => onDeleteMasterRole(id)}
                                                itemType="role"
                                            />
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 col-span-full text-center py-4">No on-production roles found. Add some!</p>
                                    )}
                                </div>
                            </section>
                        </div>
                        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowRoleOptions()}
                                className="w-full text-white py-2.5 rounded text-sm font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// --- Shoots Component (Main Container) ---
const Shoots = ({ company, onValidChange, onDataChange, initialData }) => {
    // FIX: Initialize state to null to indicate it's not ready yet.
    const [shoots, setShoots] = useState(null);
    const [masterEventTitles, setMasterEventTitles] = useState([]);
    const [masterRoles, setMasterRoles] = useState([]);
    const [newShootTitle, setNewShootTitle] = useState('');
    const [creatingShoot, setCreatingShoot] = useState(false);

    useEffect(() => {
        const fetchMasterData = async () => {
            if (!company?.id) return;
            try {
                const [eventRes, roleRes] = await Promise.all([fetchWithAuth(`${API_URL}/api/events?company_id=${company.id}`), fetchWithAuth(`${API_URL}/api/roles?company_id=${company.id}`)]);

                if (!eventRes.ok || !roleRes.ok) {
                    throw new Error(`API Error: ${eventRes.status} | ${roleRes.status}`);
                }

                const eventTitles = await eventRes.json();
                const allRoles = await roleRes.json();
                const onProductionRoles = allRoles.filter((role) => role.role_code === 1);

                setMasterEventTitles(eventTitles.map((e) => e.title));
                setMasterRoles(onProductionRoles);
            } catch (err) {
                console.error('Error fetching master data:', err);
            }
        };
        fetchMasterData();
    }, [company]);

    // FIX: This robust initialization effect runs ONLY ONCE when data is ready.
    useEffect(() => {
        // Guard clause: Wait for master data to load, and only run if shoots haven't been set yet.
        if (masterRoles.length === 0 || shoots !== null) {
            return;
        }

        // EDIT MODE: If initialData from the parent component exists, process it.
        if (initialData && initialData.shootList) {
            const shootsWithFormattedDate = initialData.shootList.map((s) => ({
                ...s,
                id: s.id || Date.now() + Math.random(), // Ensure every shoot has a unique ID
                date: s.date ? new Date(s.date).toISOString().split('T')[0] : '',
                selectedRoles: s.selectedServices
                    ? Object.keys(s.selectedServices).reduce((acc, serviceName) => {
                          const role = masterRoles.find((r) => r.type_name === serviceName);
                          if (role) {
                              acc[role.id] = s.selectedServices[serviceName];
                          }
                          return acc;
                      }, {})
                    : {},
                showRoleOptions: false,
            }));

            // If there's valid data, use it. Otherwise, start with a fresh empty shoot.
            if (shootsWithFormattedDate.length > 0) {
                setShoots(shootsWithFormattedDate);
            } else {
                setShoots([{ id: Date.now(), title: '', date: '', time: '', city: '', selectedRoles: {}, showRoleOptions: false }]);
            }
        }
        // CREATE MODE: If no initialData, start with a single empty shoot.
        else {
            setShoots([{ id: Date.now(), title: '', date: '', time: '', city: '', selectedRoles: {}, showRoleOptions: false }]);
        }
        // FIX: The dependency array is corrected to prevent re-running on every `shoots` change.
    }, [initialData, masterRoles]);

    // FIX: This effect now safely waits for `shoots` to be initialized before sending data to the parent.
    useEffect(() => {
        if (shoots !== null && typeof onDataChange === 'function') {
            const relevantShoots = shoots.filter((s) => s.title.trim() !== '' || s.date.trim() !== '' || s.time.trim() !== '' || s.city.trim() !== '' || Object.keys(s.selectedRoles).length > 0);

            const shootsForParent = relevantShoots.map((shoot) => {
                const selectedServices = {};
                for (const roleId in shoot.selectedRoles) {
                    const role = masterRoles.find((r) => r.id.toString() === roleId);
                    if (role) {
                        selectedServices[role.type_name] = shoot.selectedRoles[roleId];
                    }
                }
                const { selectedRoles, showRoleOptions, ...restOfShoot } = shoot;
                return {
                    ...restOfShoot,
                    selectedServices: selectedServices,
                };
            });

            onDataChange({
                shootList: shootsForParent,
            });
        }
    }, [shoots, onDataChange, masterRoles]);

    // FIX: Validation also waits for initialization.
    useEffect(() => {
        if (typeof onValidChange === 'function') {
            if (shoots === null) {
                onValidChange(false);
                return;
            }

            let allShootsAreValid = true;
            if (shoots.length === 1 && shoots[0].title.trim() === '' && shoots[0].date.trim() === '' && shoots[0].city.trim() === '' && Object.keys(shoots[0].selectedRoles).length === 0) {
                allShootsAreValid = true;
            } else {
                allShootsAreValid = shoots.every((s) => s && s.title?.trim() !== '' && s.date?.trim() !== '' && s.selectedRoles && Object.keys(s.selectedRoles).length > 0);
            }
            onValidChange(allShootsAreValid);
        }
    }, [shoots, onValidChange]);

    const addShootButtonStyles =
        'text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 p-2.5 rounded-lg flex items-center justify-center text-sm';

    const handleAddMasterTitle = useCallback(
        async (newTitle) => {
            const trimmed = newTitle.trim();
            if (!trimmed || masterEventTitles.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return;
            setMasterEventTitles((prev) => [...prev, trimmed].sort());
            if (company?.id) {
                try {
                    await fetchWithAuth(`${API_URL}/api/events`, {
                        method: 'POST',
                        body: JSON.stringify({ title: trimmed, company_id: company.id }),
                    });
                } catch (err) {
                    console.error('Failed to add event title:', err);
                }
            }
        },
        [masterEventTitles, company],
    );

    const handleDeleteMasterTitle = useCallback(
        async (titleToDelete) => {
            setMasterEventTitles((prev) => prev.filter((t) => t !== titleToDelete));
            setShoots((prevShoots) => prevShoots.map((s) => (s.title === titleToDelete ? { ...s, title: '' } : s)));
            if (company?.id) {
                try {
                    await fetchWithAuth(`${API_URL}/api/events`, {
                        method: 'DELETE',
                        body: JSON.stringify({ title: titleToDelete, company_id: company.id }),
                    });
                } catch (err) {
                    console.error('Failed to delete event title:', err);
                }
            }
        },
        [company],
    );

    const handleAddMasterRole = useCallback(
        async (newRoleName) => {
            const trimmed = newRoleName.trim();
            if (!trimmed || masterRoles.some((r) => r.type_name.toLowerCase() === trimmed.toLowerCase())) {
                alert(`Role "${trimmed}" already exists.`);
                return;
            }

            if (company?.id) {
                try {
                    const response = await fetchWithAuth(`${API_URL}/api/roles`, {
                        method: 'POST',
                        body: JSON.stringify({
                            type_name: trimmed,
                            company_id: company.id,
                            role_code: 1, // Automatically set to "On Production"
                        }),
                    });
                    if (!response.ok) {
                        const errData = await response.json().catch(() => ({}));
                        throw new Error(errData.error || 'Failed to create role');
                    }
                    const newRole = await response.json();
                    setMasterRoles((prev) => [...prev, newRole].sort((a, b) => a.type_name.localeCompare(b.type_name)));
                } catch (err) {
                    console.error('Failed to add role:', err);
                    alert(`Error: ${err.message}`);
                }
            }
        },
        [masterRoles, company],
    );

    const handleDeleteMasterRole = useCallback(
        async (roleIdToDelete) => {
            if (company?.id) {
                try {
                    const response = await fetchWithAuth(`${API_URL}/api/roles/${roleIdToDelete}`, {
                        method: 'DELETE',
                    });
                    if (!response.ok) throw new Error('Failed to delete role');

                    setMasterRoles((prev) => prev.filter((r) => r.id !== roleIdToDelete));
                    setShoots((prevShoots) =>
                        prevShoots.map((shoot) => {
                            if (shoot.selectedRoles?.[roleIdToDelete]) {
                                const updated = { ...shoot.selectedRoles };
                                delete updated[roleIdToDelete];
                                return { ...shoot, selectedRoles: updated };
                            }
                            return shoot;
                        }),
                    );
                } catch (err) {
                    console.error('Failed to delete role:', err);
                }
            }
        },
        [company],
    );

    const handleShootFieldChange = (id, field, value) => setShoots((prevShoots) => prevShoots.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    const handleRoleToggleForShoot = (id, roleId) =>
        setShoots((prevShoots) =>
            prevShoots.map((s) => {
                if (s.id !== id) return s;
                const updatedSelectedRoles = { ...(s.selectedRoles || {}) };
                if (updatedSelectedRoles[roleId] !== undefined) delete updatedSelectedRoles[roleId];
                else updatedSelectedRoles[roleId] = 1;
                return { ...s, selectedRoles: updatedSelectedRoles };
            }),
        );
    const handleRoleCountChangeForShoot = (id, roleId, count) => {
        const newCount = Math.max(1, Number(count) || 1);
        setShoots((prevShoots) => prevShoots.map((s) => (s.id === id ? { ...s, selectedRoles: { ...(s.selectedRoles || {}), [roleId]: newCount } } : s)));
    };
    const toggleRoleOptionsPanelForShoot = (id) => setShoots((prevShoots) => prevShoots.map((s) => ({ ...s, showRoleOptions: s.id === id ? !s.showRoleOptions : false })));
    const addShoot = () =>
        setShoots((prevShoots) => [...prevShoots, { id: Date.now() + prevShoots.length + Math.random(), title: '', date: '', time: '', city: '', selectedRoles: {}, showRoleOptions: false }]);
    const handleDeleteShoot = (id) =>
        setShoots((prevShoots) => {
            const remainingShoots = prevShoots.filter((s) => s.id !== id);
            return remainingShoots.length > 0 ? remainingShoots : [{ id: Date.now(), title: '', date: '', time: '', city: '', selectedRoles: {}, showRoleOptions: false }];
        });

    // FIX: Safely handle body overflow for modals
    useEffect(() => {
        // Don't do anything if the component isn't ready
        if (!shoots) return;

        const hasOpenModal = shoots.some((s) => s.showRoleOptions);
        if (hasOpenModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        // Cleanup function to restore scrolling when the component unmounts
        return () => {
            document.body.style.overflow = '';
        };
    }, [shoots]);

    // FIX: Render a loading state until the component is initialized.
    if (shoots === null) {
        return (
            <div className="mb-6 p-4 bg-white dark:bg-gray-900/50 rounded-lg shadow-md flex items-center justify-center min-h-[150px]">
                <Loader2 className="animate-spin mr-2 text-blue-500" />
                <p className="text-gray-600 dark:text-gray-300">Loading Shoot Schedule...</p>
            </div>
        );
    }

    return (
        <div className="mb-6 p-4 bg-white dark:bg-gray-900/50 rounded-lg shadow-md dark:shadow-gray-700/50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Shoot Schedule</h2>
                    <AddShootModal onAddShoot={handleAddMasterTitle} />
                </div>
                <button onClick={addShoot} className={addShootButtonStyles} title="Add Another Shoot" type="button">
                    <Plus size={16} className="mr-1.5" /> Add Shoot
                </button>
            </div>
            {shoots.map((shootItem, idx) => (
                <ShootRow
                    key={shootItem.id}
                    shoot={shootItem}
                    onChange={(field, value) => handleShootFieldChange(shootItem.id, field, value)}
                    onRoleChange={(roleId) => handleRoleToggleForShoot(shootItem.id, roleId)}
                    onRoleCountChange={(roleId, count) => handleRoleCountChangeForShoot(shootItem.id, roleId, count)}
                    showRoleOptions={shootItem.showRoleOptions}
                    setShowRoleOptions={() => toggleRoleOptionsPanelForShoot(shootItem.id)}
                    onDelete={() => handleDeleteShoot(shootItem.id)}
                    canDelete={shoots.length > 1}
                    isFirst={idx === 0}
                    masterEventTitles={masterEventTitles}
                    onAddMasterTitle={handleAddMasterTitle}
                    onDeleteMasterTitle={handleDeleteMasterTitle}
                    masterRoles={masterRoles}
                    onAddMasterRole={handleAddMasterRole}
                    onDeleteMasterRole={handleDeleteMasterRole}
                />
            ))}
        </div>
    );
};

export default Shoots;
