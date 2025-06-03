'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Save, PackagePlus, Edit3, Settings2 } from 'lucide-react'; // Added Settings2

const generateId = () => typeof self !== 'undefined' && self.crypto ? self.crypto.randomUUID() : Math.random().toString(36).substring(2);

const predefinedDeliverableOptions = {
    weddingEssentials: [{ title: 'Wedding Photography' }, { title: 'Digital Gallery' }],
    photoshootBasic: [{ title: '1-Hour Portrait Session' }, { title: 'Online Proofing' }],
    videographyStarter: [{ title: 'Event Filming (4 hours)' }, { title: 'Basic Edit' }],
    fullCoverageWedding: [
        { title: 'Full-Day Wedding Photography' },
        { title: 'Full-Day Videography' },
        { title: 'Engagement Session' },
        { title: 'Premium Wedding Album' },
    ],
};

const Deliverables = ({ onValidChange, onDeliverablesCostChange, onDataChange }) => { // Added onDataChange
    
    const createNewDeliverableItem = (title = '', isAdditional = false, additionalAmount = 0, dateVal = '') => ({
        id: generateId(), title, isAdditionalCharge: isAdditional, additionalChargeAmount: Number(additionalAmount) || 0, date: dateVal,
    });

    const [items, setItems] = useState(() => [createNewDeliverableItem()]); // Initialize with one empty item
    const [isDarkMode, setIsDarkMode] = useState(false);

    // State for managing custom bundles
    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [showManageBundlesModal, setShowManageBundlesModal] = useState(false);
    const [editingBundleKey, setEditingBundleKey] = useState(null);
    const [newBundleName, setNewBundleName] = useState('');
    const [newBundleItems, setNewBundleItems] = useState(() => [{ id: generateId(), title: '' }]);
    const [customDeliverableBundles, setCustomDeliverableBundles] = useState({});

    // --- Dark Mode Detection ---
    useEffect(() => {
        const observer = new MutationObserver(() => setIsDarkMode(document.documentElement.classList.contains('dark')));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        setIsDarkMode(document.documentElement.classList.contains('dark')); // Initial check
        return () => observer.disconnect();
    }, []);

    // --- Load/Save Custom Bundles from/to localStorage ---
    useEffect(() => {
        const savedBundles = localStorage.getItem('customDeliverableBundles');
        if (savedBundles) {
            try { setCustomDeliverableBundles(JSON.parse(savedBundles)); }
            catch (e) { console.error("Error parsing saved custom bundles:", e); }
        }
    }, []);

    useEffect(() => {
        // Avoid writing empty object on initial load if nothing was there
        if (Object.keys(customDeliverableBundles).length > 0 || localStorage.getItem('customDeliverableBundles')) {
            localStorage.setItem('customDeliverableBundles', JSON.stringify(customDeliverableBundles));
        }
    }, [customDeliverableBundles]);

    // --- useEffect for Validation ---
    useEffect(() => {
        if (typeof onValidChange === 'function') {
            const isValid = items.length > 0 && items.every(item =>
                item.title && item.title.trim() !== '' &&
                (item.isAdditionalCharge ? (Number(item.additionalChargeAmount) > 0) : true)
            );
            onValidChange(isValid);
        }
    }, [items, onValidChange]);

    // --- useEffect for Calculating and Reporting Additional Costs ---
    useEffect(() => {
        const currentTotalAdditionalCharges = items.reduce((sum, item) =>
            item.isAdditionalCharge ? sum + (Number(item.additionalChargeAmount) || 0) : sum, 0);
        onDeliverablesCostChange?.(currentTotalAdditionalCharges);
    }, [items, onDeliverablesCostChange]);

    // --- CRITICAL: useEffect for Reporting Full Data to Parent ---
    useEffect(() => {
        if (typeof onDataChange === 'function') {
            const componentData = {
                deliverableItems: items.filter(item => item.title.trim() !== ''), // Only send items with a title
                // savedCustomBundleTemplates: customDeliverableBundles, // Send if these are project-specific
                                                                       // If global templates, you might not send.
                                                                       // For now, let's assume they are useful context.
                activeCustomBundleTemplates: customDeliverableBundles 
            };
            // console.log('[Deliverables.js] Reporting data to parent:', componentData); // UNCOMMENT FOR DEBUGGING
            onDataChange(componentData);
        }
    // Dependencies: All state that constitutes the data to be sent + onDataChange prop
    }, [items, customDeliverableBundles, onDataChange]);


    // --- Event Handlers for Deliverable Items ---
    const addSingleDeliverableRow = () => setItems(prev => [...prev, createNewDeliverableItem()]);

    const addDeliverablesFromBundle = (bundleToAdd) => {
        const newItemsToAdd = bundleToAdd.map(item => createNewDeliverableItem(item.title, false));
        if (items.length === 1 && items[0].title.trim() === '' && !items[0].isAdditionalCharge && !items[0].date) {
            setItems(newItemsToAdd.length > 0 ? newItemsToAdd : [createNewDeliverableItem()]);
        } else {
            setItems(prev => [...prev, ...newItemsToAdd]);
        }
        setShowSelectionModal(false);
    };
    
    const handleChange = (id, field, value) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item };
                if (field === 'title' || field === 'date') {
                    updatedItem[field] = value;
                } else if (field === 'costTypeDropdown') {
                    updatedItem.isAdditionalCharge = value === 'additional';
                    if (!updatedItem.isAdditionalCharge) updatedItem.additionalChargeAmount = 0;
                } else if (field === 'additionalChargeInput') {
                    updatedItem.additionalChargeAmount = value === '' ? 0 : parseInt(value, 10) || 0;
                }
                return updatedItem;
            }
            return item;
        }));
    };

    const handleRemove = (idToRemove) => {
        setItems(prevItems => {
            const newItems = prevItems.filter(item => item.id !== idToRemove);
            return newItems.length === 0 ? [createNewDeliverableItem()] : newItems;
        });
    };

    // --- Event Handlers for Custom Bundles ---
    const handleSaveCustomBundle = () => {
        const trimmedBundleName = newBundleName.trim();
        if (!trimmedBundleName) { alert("Please enter a name for the bundle."); return; }
        const validBundleItems = newBundleItems.map(item => ({ title: item.title.trim() })).filter(item => item.title !== '');
        if (validBundleItems.length === 0) { alert("Please add at least one valid item to the bundle."); return; }

        let bundleKeyToSave = editingBundleKey;
        if (!editingBundleKey) {
            bundleKeyToSave = trimmedBundleName.toLowerCase().replace(/\s+/g, '_');
            if (predefinedDeliverableOptions[bundleKeyToSave] || customDeliverableBundles[bundleKeyToSave]) {
                alert(`A bundle with a similar name "${trimmedBundleName}" already exists.`); return;
            }
        }
        setCustomDeliverableBundles(prev => ({ ...prev, [bundleKeyToSave]: validBundleItems }));
        setShowManageBundlesModal(false); 
        setNewBundleName(''); 
        setNewBundleItems([{ id: generateId(), title: '' }]); 
        setEditingBundleKey(null);
    };

    const openManageBundlesModal = (bundleKeyToEdit = null) => {
        if (bundleKeyToEdit && customDeliverableBundles[bundleKeyToEdit]) {
            setEditingBundleKey(bundleKeyToEdit);
            setNewBundleName(bundleKeyToEdit.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
            setNewBundleItems(customDeliverableBundles[bundleKeyToEdit].map(item => ({ id: generateId(), title: item.title })));
        } else {
            setEditingBundleKey(null); 
            setNewBundleName(''); 
            setNewBundleItems([{ id: generateId(), title: '' }]);
        }
        setShowManageBundlesModal(true);
    };

    const handleDeleteCustomBundle = (bundleKeyToDelete) => {
        if (window.confirm(`Are you sure you want to delete the custom bundle "${bundleKeyToDelete.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}"?`)) {
            setCustomDeliverableBundles(prev => { 
                const updated = { ...prev }; 
                delete updated[bundleKeyToDelete]; 
                return updated; 
            });
            if (editingBundleKey === bundleKeyToDelete) {
                 setShowManageBundlesModal(false); 
                 setEditingBundleKey(null);
                 setNewBundleName(''); 
                 setNewBundleItems([{ id: generateId(), title: '' }]);
            }
        }
    };

    const handleNewBundleItemChange = (itemId, value) => setNewBundleItems(prev => prev.map(item => item.id === itemId ? { ...item, title: value } : item));
    const addNewItemToNewBundle = () => setNewBundleItems(prev => [...prev, { id: generateId(), title: '' }]);
    const removeNewItemFromNewBundle = (itemId) => {
        setNewBundleItems(prev => {
            const filtered = prev.filter(item => item.id !== itemId);
            return filtered.length > 0 ? filtered : [{ id: generateId(), title: '' }];
        });
    };


    // --- Style Constants (ensure these are fully defined as in your original component) ---
    const pageSectionWrapperStyles = "mb-6 p-4 sm:p-8 bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/40";
    const sectionHeadingStyles = "text-xl font-semibold text-gray-700 dark:text-gray-200"; 
    const inputBase = "w-full text-sm rounded-lg p-3 h-[44px] border transition-colors duration-200";
    const themedInputStyles = `${inputBase} bg-white text-gray-900 border-gray-300 dark:bg-gray-700/60 dark:text-gray-100 dark:border-gray-600/80 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-transparent`;
    const themedSelectStyles = `${themedInputStyles} appearance-none`;
    const commonSelectArrowStyle = (isDark) => ({ /* ... your styles ... */ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='${isDark ? '%239ca3af' : '%236b7280'}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em', paddingRight: '2.5rem' });
    const itemRowStyles = "grid items-center p-3 sm:p-4 rounded-xl mb-3 gap-x-3 sm:gap-x-4 bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700/60 shadow-md";
    const columnHeaderStyles = "text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 px-1 sm:px-2 pb-2";
    const buttonBaseStyles = "px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg flex items-center justify-center font-medium text-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 transform active:scale-95";
    const primaryButtonStyles = `${buttonBaseStyles} text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-blue-300 dark:focus:ring-blue-800 shadow-md hover:shadow-lg hover:-translate-y-0.5`;
    const secondaryButtonStyles = `${buttonBaseStyles} text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/30 focus:ring-blue-200 dark:focus:ring-blue-600/50 border border-blue-200 dark:border-blue-500/30 hover:border-blue-300 dark:hover:border-blue-400`;
    const iconButtonBase = "flex items-center justify-center rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 p-2.5";
    const addRowIconButtonStyles = `${iconButtonBase} text-green-600 bg-green-100 hover:bg-green-200 dark:text-green-300 dark:bg-green-700/50 dark:hover:bg-green-600/60 focus:ring-green-500`;
    const removeRowIconButtonStyles = `${iconButtonBase} text-red-600 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-700/50 dark:hover:bg-red-600/60 focus:ring-red-500`;
    // const editBundleIconButtonStyles = `${iconButtonBase} ...`; // Define if needed
    const modalOverlayStyles = "fixed inset-0 bg-black/80 dark:bg-black/90 flex justify-center items-center z-50 p-4 backdrop-blur-md";
    const modalContentStyles = "bg-white dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-gray-50 p-6 sm:p-8 rounded-xl shadow-2xl dark:shadow-black/50 w-full max-w-xl sm:max-w-2xl";
    const modalHeaderStyles = "text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-50";
    const modalCloseButtonStyles = "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white p-2 rounded-full hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800";
    const modalListItemButtonStyles = "w-full text-left px-4 py-3.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/80 dark:hover:bg-gray-600/90 text-gray-800 dark:text-gray-200 focus:ring-blue-500 dark:focus:ring-blue-400 font-medium";
    const currencySymbolStyles = "absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-sm text-gray-500 dark:text-gray-400";
    const gridColumnsClass = "grid-cols-[minmax(150px,_2fr)_1.5fr_1fr_auto] sm:grid-cols-[minmax(200px,_2fr)_1.5fr_1fr_auto]";
    const columnHeaderGridColumnsClass = "grid-cols-[minmax(150px,_2fr)_1.5fr_1fr_100px] sm:grid-cols-[minmax(200px,_2fr)_1.5fr_1fr_110px]";
    // --- END Style Constants ---


    return (
        <div className={pageSectionWrapperStyles}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
                <h2 className={sectionHeadingStyles}>Deliverables</h2>
                <div className="flex items-center gap-2 mt-3 sm:mt-0">
                    <button onClick={() => setShowSelectionModal(true)} className={`${secondaryButtonStyles} px-3 sm:px-4`} title="Add from Preset or Custom Bundle">
                        <Plus size={20}/> <span className="ml-1.5 hidden sm:inline">Import</span>
                    </button>
                    <button onClick={() => openManageBundlesModal()} className={`${primaryButtonStyles} px-3 sm:px-4`} title="Create or Manage Custom Bundles">
                        <Settings2 size={20}/> <span className="ml-1.5 hidden sm:inline">Create Bundles</span>
                    </button>
                </div>
            </div>

            {/* Column Headers */}
            {items.length > 0 && (items.length > 1 || items[0].title.trim() !== '' || items[0].date !== '' || Number(items[0].additionalChargeAmount) > 0 || items[0].isAdditionalCharge) && (
                <div className={`grid ${columnHeaderGridColumnsClass} gap-x-3 sm:gap-x-4 mb-2 ${columnHeaderStyles}`}>
                    <div className="col-span-1">Title</div>
                    <div className="col-span-1">Cost (₹)</div>
                    <div className="col-span-1 text-left">Est. Date</div>
                    <div className="col-span-1 text-center">Actions</div>
                </div>
            )}

            {/* Deliverable Items List */}
            {items.map((item) => (
                <div key={item.id} className={`${itemRowStyles} ${gridColumnsClass}`}>
                    <input type="text" placeholder="Deliverable Name" value={item.title || ''} onChange={(e) => handleChange(item.id, 'title', e.target.value)} className={themedInputStyles} />
                    <div className="flex items-center gap-2 w-full">
                        <select value={item.isAdditionalCharge ? 'additional' : 'package'} onChange={(e) => handleChange(item.id, 'costTypeDropdown', e.target.value)}
                            className={`${themedSelectStyles} ${item.isAdditionalCharge ? 'w-[140px] sm:w-[160px] flex-none' : 'w-full'}`} style={commonSelectArrowStyle(isDarkMode)}>
                            <option value="package">Part of package</option>
                            <option value="additional">Additional Charge</option>
                        </select>
                        {item.isAdditionalCharge && (
                            <div className="relative flex-1 min-w-0">
                                <span className={currencySymbolStyles}>₹</span>
                                <input type="number" placeholder="Amount" value={item.additionalChargeAmount === 0 ? '' : item.additionalChargeAmount} onChange={(e) => handleChange(item.id, 'additionalChargeInput', e.target.value)}
                                    className={`${themedInputStyles} pl-7`} min="0" />
                            </div>
                        )}
                    </div>
                    <input type="date" value={item.date || ''} onChange={(e) => handleChange(item.id, 'date', e.target.value)} className={themedInputStyles} />
                    <div className="flex items-center gap-1.5 justify-center">
                        <button onClick={addSingleDeliverableRow} className={addRowIconButtonStyles} title="Add New Row Below"> <Plus size={18} /> </button>
                        <button onClick={() => handleRemove(item.id)} className={removeRowIconButtonStyles} title="Remove This Row"> <Trash2 size={18} /> </button>
                    </div>
                </div>
            ))}
            
            {/* --- Modals --- */}
            {/* Selection Modal */}
            {showSelectionModal && (
                 <div className={modalOverlayStyles}>
                    <div className={modalContentStyles}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={modalHeaderStyles}>Add Items to Deliverables</h3>
                            <button onClick={() => setShowSelectionModal(false)} className={modalCloseButtonStyles} title="Close"><X size={24} /></button>
                        </div>
                        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-3 -mr-1">
                            {Object.keys(predefinedDeliverableOptions).length > 0 && (
                                <div>
                                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2.5">Predefined Options</h4>
                                    <div className="space-y-2">
                                        {Object.entries(predefinedDeliverableOptions).map(([key, bundleContent]) => (
                                            <button key={key} onClick={() => addDeliverablesFromBundle(bundleContent)} className={modalListItemButtonStyles}>
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {Object.keys(customDeliverableBundles).length > 0 && (
                                <div className={Object.keys(predefinedDeliverableOptions).length > 0 ? "mt-4" : ""}>
                                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2.5">Your Custom Bundles</h4>
                                    <div className="space-y-2">
                                        {Object.entries(customDeliverableBundles).map(([key, bundleContent]) => (
                                            <button key={key} onClick={() => addDeliverablesFromBundle(bundleContent)} className={modalListItemButtonStyles}>
                                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {Object.keys(predefinedDeliverableOptions).length === 0 && Object.keys(customDeliverableBundles).length === 0 && (
                                 <p className="text-gray-500 dark:text-gray-400 text-center py-4">No predefined or custom bundles available.</p>
                             )}
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Bundles Modal */}
            {showManageBundlesModal && (
                <div className={modalOverlayStyles}>
                    <div className={modalContentStyles}>
                        <div className="flex justify-between items-center mb-6 sm:mb-8">
                            <h3 className={modalHeaderStyles}>{editingBundleKey ? "Edit Custom Bundle" : "Create New Custom Bundle"}</h3>
                            <button onClick={() => {setShowManageBundlesModal(false); setEditingBundleKey(null); setNewBundleName(''); setNewBundleItems([{id: generateId(), title: ''}]);}} className={modalCloseButtonStyles} title="Close">
                                <X size={26} />
                            </button>
                        </div>
                        <div className="space-y-5 max-h-[60vh] sm:max-h-[65vh] overflow-y-auto pr-3 -mr-1">
                            {/* Bundle Name Input */}
                            <div>
                                <label htmlFor="newBundleNameInput" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Bundle Name</label>
                                <input id="newBundleNameInput" type="text" placeholder="e.g., Premium Package" value={newBundleName} onChange={(e) => setNewBundleName(e.target.value)} className={themedInputStyles} disabled={!!editingBundleKey} />
                                {editingBundleKey && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Bundle name is fixed after creation.</p>}
                            </div>
                            {/* Bundle Items */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2.5">Items in this Bundle</h4>
                                <div className="space-y-3">
                                    {newBundleItems.map((item, index) => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <input type="text" placeholder={`Item ${index + 1}`} value={item.title} onChange={(e) => handleNewBundleItemChange(item.id, e.target.value)} className={`${themedInputStyles} flex-grow`} />
                                            <button onClick={() => removeNewItemFromNewBundle(item.id)} className={`${removeRowIconButtonStyles} h-[44px] w-[44px] flex-shrink-0`} title="Remove item" disabled={newBundleItems.length <= 1 && index === 0}>
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={addNewItemToNewBundle} className={`${secondaryButtonStyles} mt-4 px-4 py-2 text-sm`}>
                                    <Plus size={18} className="mr-1.5" /> Add Item
                                </button>
                            </div>
                            {/* Delete Bundle Button (if editing) */}
                            {editingBundleKey && (
                                <div className="mt-6 pt-4 border-t border-gray-200/60 dark:border-gray-700/50">
                                    <button onClick={() => handleDeleteCustomBundle(editingBundleKey)}
                                        className={`${buttonBaseStyles} w-full text-red-600 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-700/40 dark:hover:bg-red-600/50 focus:ring-red-500`}>
                                        <Trash2 size={18} className="mr-2" /> Delete This Bundle
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* Modal Actions */}
                        <div className="mt-8 pt-6 border-t border-gray-200/80 dark:border-gray-700/60 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                            <button onClick={() => {setShowManageBundlesModal(false); setEditingBundleKey(null); setNewBundleName(''); setNewBundleItems([{id: generateId(), title: ''}]);}}
                                className={`${buttonBaseStyles} text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-gray-300 dark:focus:ring-gray-600 w-full sm:w-auto`}>
                                Cancel
                            </button>
                            <button onClick={handleSaveCustomBundle} className={`${primaryButtonStyles} w-full sm:w-auto`}>
                                <Save size={18} className="mr-2" /> {editingBundleKey ? "Update Bundle" : "Save Bundle"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Deliverables;