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
    // const [isDarkMode, setIsDarkMode] = useState(false); // isDarkMode state not directly used for styling now as Tailwind handles it

    // --- Enhanced Styles Definitions ---
    const sectionWrapperStyles = "mb-8 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-2xl"; // Enhanced shadow and dark bg
    const mainHeadingStyles = "text-3xl font-bold text-gray-800 dark:text-gray-50";
    const subHeadingStyles = "text-xl font-semibold text-gray-700 dark:text-gray-300"; // For "Predefined" and "Custom"

    const cardBaseStyles = "p-5 rounded-xl border transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl";
    const predefinedCardStyles = `${cardBaseStyles} bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700`;
    const customCardStyles = `${cardBaseStyles} bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700`;
    
    const cardTitleStyles = "text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2";
    const cardListStyles = "list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1.5 pl-1"; // Added more space and better colors

    const inputBase = "w-full text-sm rounded-lg p-2.5 h-[42px] border";
    const themedInputStyles = `${inputBase} bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400`;
    
    const primaryButtonStyles = "text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 px-5 py-2.5 rounded-lg flex items-center justify-center font-medium text-sm transition-colors"; // Standardized padding/font
    const secondaryButtonStyles = "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800/30 hover:bg-blue-200 dark:hover:bg-blue-700/40 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700 px-5 py-2.5 h-[42px] flex items-center justify-center rounded-lg font-medium text-sm transition-colors"; // Standardized padding/font, adjusted dark bg
    
    // For small icon-only buttons, we use base styles and apply padding overrides
    const baseEditDeleteButton = "flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800";
    const editIconButtonAppliedStyles = `${baseEditDeleteButton} text-blue-600 bg-blue-100 hover:bg-blue-200 dark:text-blue-400 dark:bg-blue-800/30 dark:hover:bg-blue-700/40 focus:ring-blue-400 p-2`; // p-2 for a bit more space
    const deleteIconButtonAppliedStyles = `${baseEditDeleteButton} text-red-500 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-800/30 dark:hover:bg-red-700/40 focus:ring-red-400 p-2`; // p-2

    const modalOverlayStyles = "fixed inset-0 bg-black/70 dark:bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm";
    const modalContentStyles = "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white p-6 rounded-xl shadow-2xl w-full max-w-xl"; // Slightly wider modal
    const modalHeaderStyles = "text-2xl font-semibold text-gray-800 dark:text-gray-100"; // Larger modal header
    const modalCloseButtonStyles = "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors";


    useEffect(() => {
        // document.documentElement.classList.contains('dark') // isDarkMode can be set here if needed for non-Tailwind JS logic
        const savedBundles = localStorage.getItem('customDeliverableBundles');
        if (savedBundles) {
            try {
                setCustomDeliverableBundles(JSON.parse(savedBundles));
            } catch (e) {
                console.error("Error parsing saved bundles from localStorage", e);
            }
        }
    }, []);

    useEffect(() => {
        if (Object.keys(customDeliverableBundles).length > 0) {
             localStorage.setItem('customDeliverableBundles', JSON.stringify(customDeliverableBundles));
        } else {
            if(localStorage.getItem('customDeliverableBundles')) {
                localStorage.removeItem('customDeliverableBundles');
            }
        }
    }, [customDeliverableBundles]);

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

    return (
        <div className={sectionWrapperStyles}>
            <div className="flex items-center justify-between mb-8"> {/* Increased bottom margin */}
                <h2 className={mainHeadingStyles}>Service Bundles</h2>
                <button
                    onClick={() => openCreateOrEditBundleModal()}
                    className={primaryButtonStyles}
                    title="Create New Bundle"
                >
                    <PackagePlus size={20} className="mr-2" /> Create New Bundle
                </button>
            </div>

            <div className="space-y-8"> {/* Increased space between sections */}
                {Object.keys(predefinedDeliverableOptions).length > 0 && (
                    <section>
                        <h3 className={`${subHeadingStyles} mb-4`}>Predefined Bundles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Increased gap */}
                            {Object.entries(predefinedDeliverableOptions).map(([key, bundleContents]) => (
                                <div key={key} className={predefinedCardStyles}>
                                    <h4 className={cardTitleStyles}>
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </h4>
                                    <ul className={cardListStyles}>
                                        {bundleContents.map((item, idx) => <li key={idx}>{item.title}</li>)}
                                    </ul>
                                    {onBundleSelected && (
                                        <button 
                                            onClick={() => onBundleSelected(predefinedDeliverableOptions[key])}
                                            className={`${secondaryButtonStyles} mt-5 w-full py-2`} // Adjusted mt and specific py
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
                     <h3 className={`${subHeadingStyles} mb-4`}>
                        Custom Bundles 
                        {(!customDeliverableBundles || Object.keys(customDeliverableBundles).length === 0) && (
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">(None created yet)</span>
                        )}
                    </h3>
                    {customDeliverableBundles && Object.keys(customDeliverableBundles).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Increased gap */}
                            {Object.entries(customDeliverableBundles).map(([key, bundleContents]) => (
                                <div key={key} className={customCardStyles}>
                                    <div className="flex justify-between items-start mb-1"> {/* Add mb to separate from list */}
                                        <h4 className={cardTitleStyles}>
                                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </h4>
                                        <div className="flex items-center space-x-2 flex-shrink-0 ml-3"> 
                                            <button 
                                                onClick={() => openCreateOrEditBundleModal(key)}
                                                className={editIconButtonAppliedStyles}
                                                title="Edit Bundle"
                                            >
                                                <Edit3 size={16}/> {/* Slightly larger icon */}
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteCustomBundle(key)}
                                                className={deleteIconButtonAppliedStyles}
                                                title="Delete Bundle"
                                            >
                                                <Trash2 size={16}/> {/* Slightly larger icon */}
                                            </button>
                                        </div>
                                    </div>
                                    <ul className={cardListStyles}>
                                        {bundleContents.map((item, idx) => <li key={idx}>{item.title}</li>)}
                                    </ul>
                                     {onBundleSelected && (
                                        <button 
                                            onClick={() => onBundleSelected(customDeliverableBundles[key])}
                                            className={`${primaryButtonStyles} mt-5 w-full py-2`} // Adjusted mt and specific py
                                        >
                                            Select Bundle
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <PackagePlus size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 text-md">
                                You haven't created any custom bundles yet.
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Click "Create New Bundle" to get started.
                            </p>
                        </div>
                    )}
                </section>
            </div>

            {showCreateBundleModal && (
                 <div className={modalOverlayStyles}>
                    <div className={modalContentStyles}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={modalHeaderStyles}>
                                {editingBundleKey ? "Edit Custom Bundle" : "Create Custom Service Bundle"}
                            </h3>
                            <button onClick={() => {setShowCreateBundleModal(false); setEditingBundleKey(null);}} className={modalCloseButtonStyles}>
                                <X size={24} /> {/* Slightly larger close icon */}
                            </button>
                        </div>
                        <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-3 custom-scrollbar"> {/* Increased space, pr for scrollbar */}
                            <div>
                                <label htmlFor="newBundleName" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Bundle Name
                                </label>
                                <input
                                    id="newBundleName"
                                    type="text"
                                    placeholder="e.g., Premium Wedding Package"
                                    value={newBundleName}
                                    onChange={(e) => setNewBundleName(e.target.value)}
                                    className={themedInputStyles}
                                    disabled={!!editingBundleKey}
                                />
                                {editingBundleKey && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Bundle name (and its internal key) cannot be changed once created.</p>}
                            </div>
                            <div>
                                <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2.5">Deliverable Items in this Bundle</h4>
                                <div className="space-y-2.5">
                                    {newBundleItems.map((item, index) => (
                                        <div key={item.id} className="flex items-center gap-2.5">
                                            <input
                                                type="text"
                                                placeholder={`Service or Item ${index + 1}`}
                                                value={item.title}
                                                onChange={(e) => handleNewBundleItemChange(item.id, e.target.value)}
                                                className={`${themedInputStyles} flex-grow`}
                                            />
                                            <button
                                                onClick={() => removeNewItemFromNewBundle(item.id)}
                                                className={`${deleteIconButtonAppliedStyles} p-2.5 h-[42px] w-[42px]`} // Match input height
                                                title="Remove item"
                                                disabled={newBundleItems.length <= 1 && index === 0}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={addNewItemToNewBundle}
                                    className={`${secondaryButtonStyles} mt-4 px-4 py-2 text-sm`} // Adjusted style reference
                                >
                                    <Plus size={18} className="mr-1.5" /> Add Item to Bundle
                                </button>
                            </div>
                        </div>
                        <div className="mt-8 pt-5 border-t border-gray-200 dark:border-gray-700 flex justify-end"> {/* More spacing */}
                            <button
                                onClick={() => {setShowCreateBundleModal(false); setEditingBundleKey(null);}}
                                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium mr-3 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveCustomBundle}
                                className={primaryButtonStyles} // Reuses defined primary style
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