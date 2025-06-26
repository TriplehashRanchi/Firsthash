'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash, Plus, X, Search, Settings2, ListChecks, FolderOpen } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';

// Helper Hook
function useClickOutside(ref, callback, excludeRef) {
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target) && (!excludeRef || !excludeRef.current || !excludeRef.current.contains(event.target))) {
                callback();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref, callback, excludeRef]);
}

// Initial Data Arrays - Defined at the module level
const initialEventTitles = [
    'Haldi Ceremony', 'Mehndi Night', 'Sangeet Celebration', 'Wedding Ceremony', 'Reception Party', 'Engagement Soiree', 'Birthday Bash', 'Anniversary Gala', 'Corporate Conference', 'Product Launch Event', 'Baby Shower', 'Graduation Celebration', 'Housewarming', 'Roka Ceremony', 'Bridal Shower', 'Naming Ceremony', 'Retirement Party', 'Farewell Party', 'Get-Together', 'Festive Party (Diwali/Eid/Christmas)', 'Workshop/Seminar', 'Team Offsite', 'Influencer Meetup', 'Award Night', 'Music Concert', 'Charity Fundraiser', 'Cultural Fest'
];
const initialAvailableServices = [
    'Candid Photography', 'Traditional Photography', 'Cinematic Videography', 'Traditional Videography', 'Drone Aerial Shots', 'Drone FPV', 'Pre-Wedding Shoot', 'Post-Wedding Shoot', 'Album Design', 'Photo Booth', 'Live Streaming', 'Same Day Edit (SDE)', 'Makeup Artist (MUA)', 'Event MC/Anchor', 'DJ & Sound', 'Lighting Setup', 'Teaser Video', 'Highlight Reel', '4K Video Output', 'RAW Footages', 'Instagram Reels', 'Behind The Scenes (BTS)', 'Save The Date Video', 'Event Decor Photography', 'Wardrobe Styling', 'Venue Decor Services', 'Dance Choreography Coverage', 'Slow Motion Booth', 'Time-lapse Video', '360° Video Booth', 'Virtual Reality Experience', 'Social Media Content Creation', 'Green Screen Setup', 'Live Band Recording', 'Aerial Venue Mapping'
];

// --- Custom Option Component for Titles with Delete Button ---
const TitleOptionWithDelete = (props) => {
    const { children, innerProps, data, selectProps } = props;
    const handleDelete = (e) => {
        e.stopPropagation();
        if (selectProps && selectProps.onDeleteMasterTitleFromOption && data && data.value) {
            if (window.confirm(`Are you sure you want to delete "${data.value}" from the master list? This will also clear it from any shoot currently using it.`)) {
                selectProps.onDeleteMasterTitleFromOption(data.value);
            }
        }
    };
    return (
        <div {...innerProps} className={`flex items-center justify-between group px-3 py-2 ${props.isFocused ? 'bg-gray-100 dark:bg-gray-700' : ''} ${props.isSelected ? 'bg-blue-500 text-white dark:bg-blue-600' : 'dark:text-gray-200'}`}>
            <span className="truncate flex-grow">{children}</span>
            <button type="button" onClick={handleDelete} className="p-1 ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity" title={`Delete "${data.label}" from master list`}>
                <Trash size={14} />
            </button>
        </div>
    );
};

// --- EditableListItem Component (for Services) ---
const EditableListItem = ({ item, onDelete, isSelected, onToggleSelect, itemType = "service" }) => {
    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${item}" from the master list? This may affect existing shoots.`)) {
            onDelete(item);
        }
    };
    return (
        <div className={`group flex items-center justify-between p-1.5 rounded-md w-full transition-colors duration-150 ${isSelected ? 'bg-blue-100 dark:bg-blue-800/50 hover:bg-blue-200 dark:hover:bg-blue-700/60 border border-blue-500 dark:border-blue-600' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50 border border-gray-300 dark:border-gray-600'}`}>
            <span onClick={onToggleSelect ? onToggleSelect : undefined} className={`text-sm flex-grow truncate cursor-pointer py-1 ${isSelected ? 'font-semibold text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}`} title={`Click to ${isSelected ? 'deselect' : 'select'} "${item}"`}>
                <span className="mr-2 inline-flex items-center">
                    {isSelected ? <ListChecks size={16} className="text-blue-600 dark:text-blue-400" /> : <Plus size={16} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />}
                </span>
                {item}
            </span>
            <div className={`flex items-center gap-0.5 ml-2`}>
                <button onClick={handleDeleteClick} className="p-1 text-red-500 hover:text-red-700 opacity-70 hover:opacity-100" title={`Delete ${itemType} from master list`}><Trash size={14} /></button>
            </div>
        </div>
    );
};

// --- ShootRow Component ---
const ShootRow = ({
    shoot, onChange, onServiceChange, onServiceCountChange,
    showServiceOptions, setShowServiceOptions, onDelete, canDelete, isFirst,
    masterEventTitles, onAddMasterTitle, onDeleteMasterTitle,
    masterServices, onAddMasterService, onDeleteMasterService,
}) => {
    if (!shoot) return <div className="text-red-500 p-2 border border-red-500 my-2">Error: Shoot data is missing.</div>;

    const servicesPanelRef = useRef(null);
    const servicesTriggerRef = useRef(null);
    const [newServiceNameMaster, setNewServiceNameMaster] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);

    useClickOutside(servicesPanelRef, () => { if(showServiceOptions) setShowServiceOptions(); }, servicesTriggerRef);

    useEffect(() => {
        const checkDarkMode = () => setIsDarkMode(typeof window !== "undefined" && document.documentElement.classList.contains('dark'));
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        if (typeof window !== "undefined") observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => { if (typeof window !== "undefined") observer.disconnect(); };
    }, []);

    const handleTitleSelectChange = (selectedOption) => onChange('title', selectedOption ? selectedOption.value : '');
    const handleTitleCreateOption = (inputValue) => {
        const newTitle = inputValue.trim();
        if (newTitle) {
            if (!masterEventTitles.some(t => t.toLowerCase() === newTitle.toLowerCase())) onAddMasterTitle(newTitle);
            onChange('title', newTitle);
        }
    };
    const handleDeleteCurrentMasterTitle = () => {
        if (shoot.title && window.confirm(`Delete "${shoot.title}" from master list? Clears from this shoot.`)) onDeleteMasterTitle(shoot.title);
    };

    const titleOptions = masterEventTitles.map(title => ({ value: title, label: title }));
    const currentTitleValueForSelect = shoot.title ? { value: shoot.title, label: shoot.title } : null;

    const customSelectStyles = { 
        control: (base, state) => ({ ...base, minHeight: '40px', height: '40px', backgroundColor: isDarkMode ? 'rgb(55, 65, 81)' : 'rgb(255, 255, 255)', borderColor: state.isFocused ? 'rgb(59, 130, 246)' : (isDarkMode ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)'), boxShadow: state.isFocused ? `0 0 0 2px rgba(59, 130, 246, ${isDarkMode ? 0.5 : 0.4})` : 'none', '&:hover': { borderColor: 'rgb(59, 130, 246)', }, paddingLeft: '30px', borderRadius: '0.375rem', fontSize: '0.875rem', }),
        valueContainer: (base) => ({ ...base, height: '40px', padding: '0px 2px 0px 8px', }),
        input: (base) => ({ ...base, margin: '0px', paddingTop: '0px', paddingBottom: '0px', color: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(17, 24, 39)', }),
        indicatorSeparator: () => ({ display: 'none' }),
        indicatorsContainer: (base) => ({ ...base, height: '40px' }),
        dropdownIndicator: (base) => ({ ...base, padding: '8px', color: isDarkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)', '&:hover': { color: isDarkMode ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)', }, }),
        clearIndicator: (base) => ({ ...base, padding: '8px', color: isDarkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)', '&:hover': { color: isDarkMode ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)', }, }),
        singleValue: (base) => ({ ...base, color: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(17, 24, 39)', }),
        menu: (base) => ({ ...base, backgroundColor: isDarkMode ? 'rgb(31, 41, 55)' : 'rgb(255, 255, 255)', borderColor: isDarkMode ? 'rgb(55, 65, 81)' : 'rgb(229, 231, 235)', borderWidth: '1px', borderRadius: '0.375rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', zIndex: 5000, marginTop: '4px' }), // Increased zIndex
        option: (base) => ({ ...base, padding: 0 }),
        placeholder: (base) => ({ ...base, color: isDarkMode ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)', marginLeft: '2px', marginRight: '2px', }),
    };
    const selectComponents = { Option: TitleOptionWithDelete };

    const handleAddNewMasterService = () => {
        const serviceToAdd = newServiceNameMaster.trim();
        if (serviceToAdd && !masterServices.some(s => s.toLowerCase() === serviceToAdd.toLowerCase())) {
            onAddMasterService(serviceToAdd);
            onServiceChange(serviceToAdd); 
            setNewServiceNameMaster('');
        } else if (serviceToAdd) alert(`Service "${serviceToAdd}" already exists or is invalid.`);
    };

    const inputBaseStyle = "w-full p-2 h-10 rounded border placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-sm";
    const lightModeInputStyle = "bg-white text-gray-800 border-gray-300";
    const darkModeInputStyle = "dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600";
    const fullInputStyle = `${inputBaseStyle} ${lightModeInputStyle} ${darkModeInputStyle}`;
    
    const selectedServicesArray = Object.keys(shoot.selectedServices || {});
    let selectedServicesText = 'Select services...';
    if (selectedServicesArray.length > 0) {
        selectedServicesText = selectedServicesArray.length <= 2 
            ? selectedServicesArray.join(', ') 
            : `${selectedServicesArray.slice(0, 2).join(', ')}, +${selectedServicesArray.length - 2}`;
    }

    return (
        <div className={`grid ${isFirst ? 'grid-cols-1 sm:grid-cols-5' : 'grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]'} gap-x-3 gap-y-2 sm:gap-y-1 mb-3 items-start sm:items-center pt-1`}>
            <div className="flex items-center gap-2 sm:col-span-1">
                <div className="relative flex-grow">
                    <CreatableSelect isClearable options={titleOptions} value={currentTitleValueForSelect} onChange={handleTitleSelectChange} onCreateOption={handleTitleCreateOption} placeholder="Event title..." styles={customSelectStyles} classNamePrefix="react-select" formatCreateLabel={(inputValue) => `Add "${inputValue}" & use`} menuPortalTarget={typeof document !== 'undefined' ? document.body : null} components={selectComponents} onDeleteMasterTitleFromOption={onDeleteMasterTitle} />
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none z-[1]" />
                </div>
                {shoot.title && masterEventTitles.includes(shoot.title) && !isFirst && (
                    <button type="button" onClick={handleDeleteCurrentMasterTitle} className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md border border-transparent hover:bg-red-500/10 dark:hover:bg-red-400/10" title={`Delete "${shoot.title}" from master list`} disabled={!shoot.title}>
                        <Trash size={16} />
                    </button>
                )}
            </div>
            <input type="date" className={fullInputStyle} value={shoot.date || ''} onChange={e => onChange('date', e.target.value)} />
            <input type="time" className={fullInputStyle} value={shoot.time || ''} onChange={e => onChange('time', e.target.value)} />
            <div className="relative">
                <input ref={servicesTriggerRef} placeholder="Services*" readOnly onClick={() => setShowServiceOptions()} value={selectedServicesText} className={`${fullInputStyle} cursor-pointer truncate pr-10`} title={Object.keys(shoot.selectedServices || {}).join(', ')} />
                <Settings2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>
            <input placeholder="Venue*" className={fullInputStyle} value={shoot.city || ''} onChange={e => onChange('city', e.target.value)} />
            {!isFirst && canDelete && (
                <button onClick={onDelete} className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded p-2 h-10 w-10 flex items-center justify-center" title="Delete Shoot" type="button">
                    <Trash size={16} />
                </button>
            )}

            {showServiceOptions && (
                <>
                    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 z-[4990]" onClick={() => setShowServiceOptions()} aria-hidden="true"></div> {/* High z-index */}
                    <div ref={servicesPanelRef} className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[5000] p-4 md:p-6 rounded-lg shadow-2xl w-[90vw] max-w-2xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 max-h-[85vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Manage & Select Services</h3>
                            <button onClick={() => setShowServiceOptions()} className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><X size={20} /></button>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-1 space-y-6 custom-scrollbar-thin">
                            <section>
                                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Available Services (Master List)</h4>
                                <div className="flex gap-2 mb-4 p-3 bg-white dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
                                    <input type="text" placeholder="Add new service to master list" value={newServiceNameMaster} onChange={(e) => setNewServiceNameMaster(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNewMasterService()} className="flex-grow p-2 text-sm border rounded bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500" />
                                    <button type="button" onClick={handleAddNewMasterService} className="px-4 py-2 text-sm rounded bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5 disabled:opacity-50" disabled={!newServiceNameMaster.trim()}><Plus size={16} /> Add</button>
                                </div>
                                {selectedServicesArray.length > 0 && (
                                <section className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Configure Selected Services ({selectedServicesArray.length})</h4>
                                    <div className="space-y-2.5 max-h-[calc(85vh_-_500px)] overflow-y-auto p-1 custom-scrollbar-thin">
                                        {selectedServicesArray.map(service => (<div key={service} className="flex items-center justify-between text-sm p-2.5 bg-white dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600"><span className="text-gray-800 dark:text-gray-200 truncate pr-2" title={service}>{service}</span><div className="flex items-center gap-2"><label htmlFor={`count-${shoot.id}-${service.replace(/\W/g, '-')}`} className="text-xs text-gray-600 dark:text-gray-400">Count:</label><input id={`count-${shoot.id}-${service.replace(/\W/g, '-')}`} type="number" min="1" value={(shoot.selectedServices || {})[service] || 1} onChange={e => onServiceCountChange(service, e.target.value)} className="p-1 w-16 rounded text-sm text-center border bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400" /></div></div>))}
                                    </div>
                                </section>
                            )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[calc(85vh_-_400px)] overflow-y-auto p-1 custom-scrollbar-thin">
                                    {masterServices.length > 0 ? masterServices.map(service => (<EditableListItem key={service} item={service} isSelected={(shoot.selectedServices || {})[service] !== undefined} onToggleSelect={() => onServiceChange(service)} onDelete={(val) => onDeleteMasterService(val)} itemType="service" />)) : <p className="text-sm text-gray-500 dark:text-gray-400 col-span-full text-center py-4">No services in master list. Add some!</p>}
                                </div>
                            </section>
                            
                        </div>
                        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <button type="button" onClick={() => setShowServiceOptions()} className="w-full text-white py-2.5 rounded text-sm font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800">Done</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// --- Shoots Component (Main Container) ---
const Shoots = ({ onValidChange, onDataChange }) => { // Added onDataChange prop
    const [shoots, setShoots] = useState([{ id: Date.now(), title: '', date: '', time: '', city: '', selectedServices: {}, showServiceOptions: false }]);
    const [masterEventTitles, setMasterEventTitles] = useState([...initialEventTitles].sort());
    const [masterServices, setMasterServices] = useState([...initialAvailableServices].sort());
    
    const addShootButtonStyles = "text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 p-2.5 rounded-lg flex items-center justify-center text-sm";

    // --- useCallback Handlers (as in your original code) ---
    const handleAddMasterTitle = useCallback((newTitle) => {
        const trimmedNewTitle = newTitle.trim();
        if (trimmedNewTitle && !masterEventTitles.some(t => t.toLowerCase() === trimmedNewTitle.toLowerCase())) {
            setMasterEventTitles(prev => [...prev, trimmedNewTitle].sort());
        } else if (trimmedNewTitle && masterEventTitles.some(t => t.toLowerCase() === trimmedNewTitle.toLowerCase())) {
            /* Already exists */
        } else if (trimmedNewTitle) {
            alert(`Title "${trimmedNewTitle}" is invalid.`);
        }
    }, [masterEventTitles]);

    const handleDeleteMasterTitle = useCallback((titleToDelete) => {
        setMasterEventTitles(prev => prev.filter(t => t !== titleToDelete));
        setShoots(prevShoots => prevShoots.map(s =>
            s.title === titleToDelete ? { ...s, title: '' } : s
        ));
    }, []); // Removed masterEventTitles from deps as it uses setMasterEventTitles

    const handleAddMasterService = useCallback((newService) => {
        const trimmedNewService = newService.trim();
        if (trimmedNewService && !masterServices.some(s => s.toLowerCase() === trimmedNewService.toLowerCase())) {
            setMasterServices(prev => [...prev, trimmedNewService].sort());
        } else if (trimmedNewService) { 
            alert(`Service "${trimmedNewService}" already exists or is invalid.`); 
        }
    }, [masterServices]);

    const handleDeleteMasterService = useCallback((serviceToDelete) => {
        setMasterServices(prev => prev.filter(s => s !== serviceToDelete));
        setShoots(prevShoots => prevShoots.map(shoot => {
            if (shoot.selectedServices && shoot.selectedServices[serviceToDelete] !== undefined) {
                const updatedSelectedServices = { ...shoot.selectedServices };
                delete updatedSelectedServices[serviceToDelete];
                return { ...shoot, selectedServices: updatedSelectedServices };
            } return shoot;
        }));
    }, []); // Removed masterServices from deps

    const handleShootFieldChange = (id, field, value) => setShoots(prevShoots => prevShoots.map(s => s.id === id ? { ...s, [field]: value } : s));
    const handleServiceToggleForShoot = (id, serviceName) => setShoots(prevShoots => prevShoots.map(s => { if (s.id !== id) return s; const updatedSelectedServices = { ...(s.selectedServices || {}) }; if (updatedSelectedServices[serviceName] !== undefined) delete updatedSelectedServices[serviceName]; else updatedSelectedServices[serviceName] = 1; return { ...s, selectedServices: updatedSelectedServices }; }));
    const handleServiceCountChangeForShoot = (id, service, count) => { const newCount = Math.max(1, Number(count) || 1); setShoots(prevShoots => prevShoots.map(s => s.id === id ? { ...s, selectedServices: { ...(s.selectedServices || {}), [service]: newCount } } : s)); };
    const toggleServiceOptionsPanelForShoot = (id) => setShoots(prevShoots => prevShoots.map(s => ({ ...s, showServiceOptions: s.id === id ? !s.showServiceOptions : false })));
    const addShoot = () => setShoots(prevShoots => [...prevShoots, { id: Date.now() + prevShoots.length + Math.random(), title: '', date: '', time: '', city: '', selectedServices: {}, showServiceOptions: false }]);
    const handleDeleteShoot = id => setShoots(prevShoots => {
        const remainingShoots = prevShoots.filter(s => s.id !== id);
        return remainingShoots.length > 0 ? remainingShoots : [{ id: Date.now(), title: '', date: '', time: '', city: '', selectedServices: {}, showServiceOptions: false }];
    });
    // --- END useCallback Handlers ---

    // --- useEffect for Validation ---
    useEffect(() => {
        if (typeof onValidChange === 'function') {
            let allShootsAreValid = true;
            if (shoots.length === 1 && shoots[0].title.trim() === '' && shoots[0].date.trim() === '' && shoots[0].city.trim() === '' && Object.keys(shoots[0].selectedServices).length === 0) {
                allShootsAreValid = true; // Consider a single, completely empty shoot row as "not yet started" / valid
            } else {
                allShootsAreValid = shoots.every(s => 
                    s && s.title?.trim() !== '' && 
                    s.date?.trim() !== '' && 
                    s.city?.trim() !== '' && 
                    s.selectedServices && Object.keys(s.selectedServices).length > 0
                );
            }
            onValidChange(allShootsAreValid);
        }
    }, [shoots, onValidChange]);

    // --- useEffect for body overflow (keep as is) ---
    useEffect(() => {
        const hasOpenModal = shoots.some(s => s.showServiceOptions);
        if (hasOpenModal) document.body.style.overflow = 'hidden'; 
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [shoots]);

    // --- CRITICAL: useEffect for Reporting Data to Parent ---
    useEffect(() => {
        if (typeof onDataChange === 'function') {
            // Filter out completely empty shoot objects before sending, unless it's the only one and is also empty
            const relevantShoots = shoots.filter(s => 
                s.title.trim() !== '' || s.date.trim() !== '' || s.time.trim() !== '' || 
                s.city.trim() !== '' || Object.keys(s.selectedServices).length > 0
            );

            const componentData = {
                shootList: relevantShoots.length > 0 ? relevantShoots : (shoots.length === 1 && relevantShoots.length === 0 ? [] : []), // Send empty array if only one blank shoot
                // Decide if master lists are project-specific or global templates.
                // If global, don't send. If project-specific, include them:
                // currentMasterEventTitles: masterEventTitles,
                // currentMasterServices: masterServices,
            };
            // console.log('[Shoots.js] Reporting data to parent:', componentData); // UNCOMMENT FOR DEBUGGING
            onDataChange(componentData);
        }
    // Dependencies: The state variables that make up `componentData` + `onDataChange` itself.
    }, [shoots, masterEventTitles, masterServices, onDataChange]);


    return (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-md dark:shadow-gray-700/50">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Shoot Schedule</h2>
                <button onClick={addShoot} className={addShootButtonStyles} title="Add Another Shoot" type="button">
                    <Plus size={16} className="mr-1.5" /> Add Shoot
                </button>
            </div>
            {shoots.map((shootItem, idx) => ( // Use map directly
                <ShootRow
                    key={shootItem.id} shoot={shootItem}
                    onChange={(field, value) => handleShootFieldChange(shootItem.id, field, value)}
                    onServiceChange={(serviceName) => handleServiceToggleForShoot(shootItem.id, serviceName)}
                    onServiceCountChange={(service, count) => handleServiceCountChangeForShoot(shootItem.id, service, count)}
                    showServiceOptions={shootItem.showServiceOptions}
                    setShowServiceOptions={() => toggleServiceOptionsPanelForShoot(shootItem.id)}
                    onDelete={() => handleDeleteShoot(shootItem.id)}
                    canDelete={shoots.length > 1} 
                    isFirst={idx === 0}
                    masterEventTitles={masterEventTitles}
                    onAddMasterTitle={handleAddMasterTitle}
                    onDeleteMasterTitle={handleDeleteMasterTitle}
                    masterServices={masterServices}
                    onAddMasterService={handleAddMasterService}
                    onDeleteMasterService={handleDeleteMasterService}
                />
            ))}
            {/* Removed the shoots.length === 0 empty state as handleDeleteShoot ensures at least one row */}
        </div>
    );
};

export default Shoots;