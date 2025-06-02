'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Save, PackagePlus, Edit3 } from 'lucide-react';

const generateId = () => typeof self !== 'undefined' && self.crypto ? self.crypto.randomUUID() : Math.random().toString(36).substring(2);


const predefinedDeliverableOptions = {
    wedding: [{ title: 'Wedding Shoot' }],
    photoshoot: [{ title: 'Photoshoot' }],
    videography: [{ title: 'Videography' }],
    fullWedding: [
        { title: 'Wedding Shoot' },
        { title: 'Photography' },
        { title: 'Videography' },
        { title: 'Drone Shoot' },
    ],
};

const DeliverablesBundle = ({ onBundleSelected }) => {
    const [showCreateBundleModal, setShowCreateBundleModal] = useState(false);
    const [editingBundleKey, setEditingBundleKey] = useState(null);
    const [newBundleName, setNewBundleName] = useState('');
    const [newBundleItems, setNewBundleItems] = useState([{ id: generateId(), title: '' }]);
    const [customDeliverableBundles, setCustomDeliverableBundles] = useState({});
    const [isDarkMode, setIsDarkMode] = useState(false); // Assuming you still need this for some styles

    // --- Styles Definitions ---
    const sectionWrapperStyles = "mb-6 p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-md dark:shadow-gray-700/50";
    const sectionHeadingStyles = "text-xl font-semibold text-gray-700 dark:text-gray-200";
    const inputBase = "w-full text-sm rounded-lg p-2.5 h-[42px] border";
    const themedInputStyles = `${inputBase} bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400`;
    const primaryButtonStyles = "text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 p-2.5 rounded-lg flex items-center justify-center";
    const secondaryButtonStyles = "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/30 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700 p-2.5 h-[42px] flex items-center justify-center rounded-lg transition-colors";
    const dangerButtonStyles = "text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 focus:ring-2 focus:ring-red-300 dark:focus:ring-red-400 p-2.5 h-[42px] flex items-center justify-center rounded-lg hover:bg-red-500/10 dark:hover:bg-red-400/10 transition-colors";
    const modalOverlayStyles = "fixed inset-0 bg-black/70 dark:bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm";
    const modalContentStyles = "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white p-6 rounded-xl shadow-2xl w-full max-w-lg";
    const modalHeaderStyles = "text-xl font-semibold text-gray-700 dark:text-white";
    const modalCloseButtonStyles = "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors";
    const modalListItemButtonStyles = "w-full text-left px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-blue-500 dark:focus:ring-blue-400";


    // useEffect for loading/saving custom bundles from/to localStorage (example)
    useEffect(() => {
        // Dark mode detection (if needed for styles not covered by Tailwind dark: variants)
        const checkDarkMode = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        
        // Load bundles
        const savedBundles = localStorage.getItem('customDeliverableBundles');
        if (savedBundles) {
            try {
                setCustomDeliverableBundles(JSON.parse(savedBundles));
            } catch (e) {
                console.error("Error parsing saved bundles from localStorage", e);
            }
        }
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        // Only attempt to setItem if customDeliverableBundles is not in its initial empty state
        // and it's different from what might have been initially loaded (or if nothing was loaded).
        // This avoids writing an empty object to localStorage on first mount if it was empty.
        if (Object.keys(customDeliverableBundles).length > 0) {
             localStorage.setItem('customDeliverableBundles', JSON.stringify(customDeliverableBundles));
        } else {
            // If customDeliverableBundles becomes empty after having items (e.g., all deleted),
            // remove the item from localStorage.
            if(localStorage.getItem('customDeliverableBundles')) {
                localStorage.removeItem('customDeliverableBundles');
            }
        }
    }, [customDeliverableBundles]);

    // ... (rest of your component logic: handleSaveCustomBundle, openCreateOrEditBundleModal, etc.)

    const handleSaveCustomBundle = () => {
        const trimmedBundleName = newBundleName.trim();
        if (!trimmedBundleName) {
            alert("Please enter a name for the bundle.");
            return;
        }
        const validBundleItems = newBundleItems
            .map(item => ({ title: item.title.trim() }))
            .filter(item => item.title !== '');

        if (validBundleItems.length === 0) {
            alert("Please add at least one valid deliverable title to the bundle.");
            return;
        }

        let bundleKeyToSave = editingBundleKey;
        if (!editingBundleKey) { 
            bundleKeyToSave = trimmedBundleName.toLowerCase().replace(/\s+/g, '_');
            if (predefinedDeliverableOptions[bundleKeyToSave] || (customDeliverableBundles && customDeliverableBundles[bundleKeyToSave])) {
                alert(`A bundle with the name (or similar key) "${trimmedBundleName}" already exists. Please choose a different name.`);
                return;
            }
        }

        setCustomDeliverableBundles(prev => ({
            ...prev,
            [bundleKeyToSave]: validBundleItems
        }));

        setShowCreateBundleModal(false);
        setNewBundleName('');
        setNewBundleItems([{ id: generateId(), title: '' }]);
        setEditingBundleKey(null);
    };

    const openCreateOrEditBundleModal = (bundleKeyToEdit = null) => {
        if (bundleKeyToEdit && customDeliverableBundles && customDeliverableBundles[bundleKeyToEdit]) {
            setEditingBundleKey(bundleKeyToEdit);
            setNewBundleName(bundleKeyToEdit.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
            setNewBundleItems(customDeliverableBundles[bundleKeyToEdit].map(item => ({ id: generateId(), title: item.title })));
        } else {
            setEditingBundleKey(null);
            setNewBundleName('');
            setNewBundleItems([{ id: generateId(), title: '' }]);
        }
        setShowCreateBundleModal(true);
    };
    
    const handleDeleteCustomBundle = (bundleKeyToDelete) => {
        if (window.confirm(`Are you sure you want to delete the bundle "${bundleKeyToDelete.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}"?`)) {
            setCustomDeliverableBundles(prev => {
                const updated = { ...prev };
                delete updated[bundleKeyToDelete];
                return updated;
            });
        }
    };

     const handleNewBundleItemChange = (itemId, value) => {
        setNewBundleItems(prev => prev.map(item => item.id === itemId ? { ...item, title: value } : item));
    };

    const addNewItemToNewBundle = () => {
        setNewBundleItems(prev => [...prev, { id: generateId(), title: '' }]);
    };

    const removeNewItemFromNewBundle = (itemId) => {
        setNewBundleItems(prev => {
            const filtered = prev.filter(item => item.id !== itemId);
            return filtered.length > 0 ? filtered : [{ id: generateId(), title: '' }];
        });
    };

    const allAvailableBundles = { ...predefinedDeliverableOptions, ...(customDeliverableBundles || {}) };


    return (
        <div className={sectionWrapperStyles}>
            <div className="flex items-center justify-between mb-6">
                <h2 className={sectionHeadingStyles}>Service Bundles</h2>
                <button
                    onClick={() => openCreateOrEditBundleModal()}
                    className={primaryButtonStyles}
                    title="Create New Bundle"
                >
                    <PackagePlus size={18} className="mr-1.5" /> Create New Bundle
                </button>
            </div>

            {/* List of All Bundles */}
            <div className="space-y-4">
                {Object.keys(predefinedDeliverableOptions).length > 0 && (
                    <section>
                        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">Predefined Bundles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(predefinedDeliverableOptions).map(([key, bundleContents]) => (
                                <div key={key} className="p-4 bg-gray-50 dark:bg-gray-700/60 rounded-lg border border-gray-200 dark:border-gray-600/70">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </h4>
                                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                                        {bundleContents.map((item, idx) => <li key={idx}>{item.title}</li>)}
                                    </ul>
                                    {onBundleSelected && (
                                        <button 
                                            onClick={() => onBundleSelected(predefinedDeliverableOptions[key])}
                                            className={`${secondaryButtonStyles} mt-3 w-full text-sm py-1.5`}
                                        >
                                            Select Bundle
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section>
                     <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2 mt-6">
                        Custom Bundles {(!customDeliverableBundles || Object.keys(customDeliverableBundles).length === 0) && "(None created yet)"}
                    </h3>
                    {customDeliverableBundles && Object.keys(customDeliverableBundles).length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(customDeliverableBundles).map(([key, bundleContents]) => (
                                <div key={key} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </h4>
                                            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                                                {bundleContents.map((item, idx) => <li key={idx}>{item.title}</li>)}
                                            </ul>
                                        </div>
                                        <div className="flex flex-col space-y-1 flex-shrink-0 ml-2">
                                            <button 
                                                onClick={() => openCreateOrEditBundleModal(key)}
                                                className={`${secondaryButtonStyles} p-1.5 h-auto w-auto`} 
                                                title="Edit Bundle"
                                            >
                                                <Edit3 size={14}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteCustomBundle(key)}
                                                className={`${dangerButtonStyles} p-1.5 h-auto w-auto`} 
                                                title="Delete Bundle"
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    </div>
                                     {onBundleSelected && (
                                        <button 
                                            onClick={() => onBundleSelected(customDeliverableBundles[key])}
                                            className={`${primaryButtonStyles} mt-3 w-full text-sm py-1.5`}
                                        >
                                            Select Bundle
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Modal for CREATING or EDITING a Custom Bundle */}
            {showCreateBundleModal && (
                 <div className={modalOverlayStyles}>
                    <div className={`${modalContentStyles} max-w-2xl`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={modalHeaderStyles}>
                                {editingBundleKey ? "Edit Custom Bundle" : "Create Custom Service Bundle"}
                            </h3>
                            <button onClick={() => {setShowCreateBundleModal(false); setEditingBundleKey(null);}} className={modalCloseButtonStyles}>
                                <X size={22} />
                            </button>
                        </div>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div>
                                <label htmlFor="newBundleName" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Bundle Name
                                </label>
                                <input
                                    id="newBundleName"
                                    type="text"
                                    placeholder="e.g., Engagement Special"
                                    value={newBundleName}
                                    onChange={(e) => setNewBundleName(e.target.value)}
                                    className={themedInputStyles}
                                    disabled={!!editingBundleKey}
                                />
                                {editingBundleKey && <p className="text-xs text-gray-400 mt-1">Bundle name (and its internal key) cannot be changed once created.</p>}
                            </div>
                            <div>
                                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Deliverable Items in this Bundle</h4>
                                <div className="space-y-2">
                                    {newBundleItems.map((item, index) => (
                                        <div key={item.id} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder={`Deliverable Title ${index + 1}`}
                                                value={item.title}
                                                onChange={(e) => handleNewBundleItemChange(item.id, e.target.value)}
                                                className={`${themedInputStyles} flex-grow`}
                                            />
                                            <button
                                                onClick={() => removeNewItemFromNewBundle(item.id)}
                                                className={dangerButtonStyles}
                                                title="Remove item from bundle"
                                                disabled={newBundleItems.length <= 1 && index === 0}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={addNewItemToNewBundle}
                                    className={`${secondaryButtonStyles} mt-3 px-3 py-1.5 text-sm`}
                                >
                                    <Plus size={16} className="mr-1" /> Add Item to Bundle
                                </button>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button
                                onClick={handleSaveCustomBundle}
                                className={primaryButtonStyles}
                            >
                                <Save size={18} className="mr-2" /> {editingBundleKey ? "Update Bundle" : "Save Bundle"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliverablesBundle;