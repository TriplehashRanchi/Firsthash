'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, X, Save, PackagePlus, Edit3 } from 'lucide-react';
import { getAuth } from "firebase/auth";

// --- Helper Functions & Constants ---
const generateId = () => typeof self !== 'undefined' && self.crypto ? self.crypto.randomUUID() : Math.random().toString(36).substring(2);
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// --- Authentication & API Wrapper ---
const getFirebaseToken = async () => {
  const user = getAuth().currentUser;
  if (!user) {
    console.error("User is not authenticated.");
    return null;
  }
  return await user.getIdToken();
};

const fetchWithAuth = async (url, options = {}) => {
    const token = await getFirebaseToken();
    if (!token) throw new Error("Authentication token is missing.");
    
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
    return fetch(url, { ...options, headers });
};

// --- Main Component ---
const DeliverablesBundle = ({ company, onBundleSelected }) => {
    
    // --- State Management ---
    const [customBundles, setCustomBundles] = useState([]); // State now holds an array from the API
    const [showCreateBundleModal, setShowCreateBundleModal] = useState(false);
    const [editingBundle, setEditingBundle] = useState(null); // Store the whole bundle object being edited
    const [newBundleName, setNewBundleName] = useState('');
    const [newBundleItems, setNewBundleItems] = useState([{ id: generateId(), title: '' }]);

    // --- Data Fetching from Backend ---
    const fetchBundles = useCallback(async () => {
        if (!company?.id) return;
        try {
            const response = await fetchWithAuth(`${API_URL}/api/deliverables/bundles?company_id=${company.id}`);
            if (!response.ok) throw new Error('Failed to fetch bundles');
            const data = await response.json();
            // Now expecting an array that includes the 'type' property
            setCustomBundles(data);
        } catch (error) {
            console.error("Error fetching bundles:", error);
        }
    }, [company]);

    useEffect(() => {
        fetchBundles();
    }, [fetchBundles]);

    // --- Bundle Management Handlers (API-connected) ---
const handleSaveCustomBundle = useCallback(async () => {
    const trimmedBundleName = newBundleName.trim();
    if (!trimmedBundleName) return alert("Please enter a name for the bundle.");
    
    const validBundleItems = newBundleItems.map(item => ({ title: item.title.trim() })).filter(item => item.title);
    if (validBundleItems.length === 0) return alert("Please add at least one item to the bundle.");
    
    // --- The Core Logic Change is Here ---
    const isEditing = !!editingBundle;
    
    const payload = {
        company_id: company.id,
        items: validBundleItems
    };

    let fetchOptions = {
        body: JSON.stringify(payload),
    };

    if (isEditing) {
        // For EDITING, use PUT and add the bundle_id to the payload
        fetchOptions.method = 'PUT';
        payload.bundle_id = editingBundle.id;
        fetchOptions.body = JSON.stringify(payload);
    } else {
        // For CREATING, use POST and add the bundle_name to the payload
        fetchOptions.method = 'POST';
        payload.bundle_name = trimmedBundleName.toLowerCase().replace(/\s+/g, '_');
        fetchOptions.body = JSON.stringify(payload);
    }
    
    try {
        await fetchWithAuth(`${API_URL}/api/deliverables/bundles`, fetchOptions);
        
        // On success, close modal and refresh data from server
        setShowCreateBundleModal(false);
        setEditingBundle(null); // Clear editing state
        fetchBundles(); // Refresh the list from the server
        
    } catch(error) {
         console.error(`Error ${isEditing ? 'updating' : 'creating'} bundle:`, error);
         alert(`Failed to ${isEditing ? 'update' : 'create'} bundle. Please try again.`);
    }

}, [newBundleName, newBundleItems, editingBundle, company, fetchBundles]);

    const handleDeleteCustomBundle = useCallback(async (bundle) => {
        if (!bundle || !bundle.id) return;

        if (window.confirm(`Are you sure you want to delete the bundle "${bundle.bundle_name.replace(/_/g, ' ')}"?`)) {
             try {
                await fetchWithAuth(`${API_URL}/api/deliverables/bundles`, {
                    method: 'DELETE',
                    body: JSON.stringify({ company_id: company.id, bundle_id: bundle.id }) // Assuming API needs company_id for security
                });
                fetchBundles(); // Refresh the list from the server
             } catch(error) {
                 console.error("Error deleting bundle:", error);
                 alert("Failed to delete bundle. Please try again.");
             }
        }
    }, [company, fetchBundles]);


    const openCreateOrEditBundleModal = (bundleToEdit = null) => {
        if (bundleToEdit) {
            setEditingBundle(bundleToEdit);
            setNewBundleName(bundleToEdit.bundle_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
            setNewBundleItems(bundleToEdit.items.map(item => ({ id: generateId(), title: item.title })));
        } else {
            setEditingBundle(null);
            setNewBundleName('');
            setNewBundleItems([{ id: generateId(), title: '' }]);
        }
        setShowCreateBundleModal(true);
    };
    
    // --- Modal Form Handlers (No changes needed here) ---
    const handleNewBundleItemChange = (itemId, value) => setNewBundleItems(prev => prev.map(item => item.id === itemId ? { ...item, title: value } : item));
    const addNewItemToNewBundle = () => setNewBundleItems(prev => [...prev, { id: generateId(), title: '' }]);
    const removeNewItemFromNewBundle = (itemId) => setNewBundleItems(prev => prev.filter(item => item.id !== itemId).length > 0 ? prev.filter(item => item.id !== itemId) : [{ id: generateId(), title: '' }]);


    // --- Style Definitions (Copied from original) ---
    const sectionWrapperStyles = "mb-8 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-2xl";
    const mainHeadingStyles = "text-3xl font-bold text-gray-800 dark:text-gray-50";
    const subHeadingStyles = "text-xl font-semibold text-gray-700 dark:text-gray-300";
    const cardBaseStyles = "p-5 rounded-xl border transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl";
    const cardTitleStyles = "text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2";
    const cardListStyles = "list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1.5 pl-1";
    const themedInputStyles = `w-full text-sm rounded-lg p-2.5 h-[42px] border bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400`;
    const primaryButtonStyles = "text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 px-5 py-2.5 rounded-lg flex items-center justify-center font-medium text-sm transition-colors";
    const secondaryButtonStyles = "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800/30 hover:bg-blue-200 dark:hover:bg-blue-700/40 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700 px-5 py-2.5 h-[42px] flex items-center justify-center rounded-lg font-medium text-sm transition-colors";
    const baseEditDeleteButton = "flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800";
    const editIconButtonAppliedStyles = `${baseEditDeleteButton} text-blue-600 bg-blue-100 hover:bg-blue-200 dark:text-blue-400 dark:bg-blue-800/30 dark:hover:bg-blue-700/40 focus:ring-blue-400 p-2`;
    const deleteIconButtonAppliedStyles = `${baseEditDeleteButton} text-red-500 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-800/30 dark:hover:bg-red-700/40 focus:ring-red-400 p-2`;
    const modalOverlayStyles = "fixed inset-0 bg-black/70 dark:bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm";
    const modalContentStyles = "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white p-6 rounded-xl shadow-2xl w-full max-w-xl";
    const modalHeaderStyles = "text-2xl font-semibold text-gray-800 dark:text-gray-100";
    const modalCloseButtonStyles = "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors";


    return (
        <div className={sectionWrapperStyles}>
            <div className="flex items-center justify-between mb-8">
                <h2 className={mainHeadingStyles}>Service Bundles</h2>
                <button onClick={() => openCreateOrEditBundleModal()} className={primaryButtonStyles} title="Create New Bundle">
                    <PackagePlus size={20} className="mr-2" /> Create New Bundle
                </button>
            </div>

            {/* Main Section for Displaying All Bundles */}
            <section>
                 <h3 className={`${subHeadingStyles} mb-4`}>
                    Your Saved Bundles
                    {customBundles.length === 0 && (
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">(None created yet)</span>
                    )}
                </h3>
                {customBundles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {customBundles.map((bundle) => (
                            <div key={bundle.id} className={`${cardBaseStyles} ${bundle.type === 'global' ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={cardTitleStyles}>
                                        {bundle.bundle_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </h4>
                                    <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                                        {bundle.type === 'global' ? (
                                             <span className="text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">Global</span>
                                        ) : (
                                            <>
                                                <button onClick={() => openCreateOrEditBundleModal(bundle)} className={editIconButtonAppliedStyles} title="Edit Bundle">
                                                    <Edit3 size={16}/>
                                                </button>
                                                <button onClick={() => handleDeleteCustomBundle(bundle)} className={deleteIconButtonAppliedStyles} title="Delete Bundle">
                                                    <Trash2 size={16}/>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <ul className={cardListStyles}>
                                    {bundle.items.map((item, idx) => <li key={idx}>{item.title}</li>)}
                                </ul>
                                 {onBundleSelected && (
                                    <button onClick={() => onBundleSelected(bundle.items)} className={`${bundle.type === 'global' ? secondaryButtonStyles : primaryButtonStyles} mt-5 w-full py-2`}>
                                        Select Bundle
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <PackagePlus size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 text-md">No bundles found.</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Click "Create New Bundle" to get started with your own.
                        </p>
                    </div>
                )}
            </section>
            
            {/* Modal for Creating/Editing Bundles (Logic remains very similar) */}
            {showCreateBundleModal && (
                 <div className={modalOverlayStyles}>
                    <div className={modalContentStyles}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={modalHeaderStyles}>{editingBundle ? "Edit Custom Bundle" : "Create Custom Bundle"}</h3>
                            <button onClick={() => setShowCreateBundleModal(false)} className={modalCloseButtonStyles}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-3 custom-scrollbar">
                            <div>
                                <label htmlFor="newBundleName" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Bundle Name</label>
                                <input id="newBundleName" type="text" placeholder="e.g., Real Estate Starter Pack" value={newBundleName} onChange={(e) => setNewBundleName(e.target.value)} className={themedInputStyles} disabled={!!editingBundle} />
                                {editingBundle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Bundle name cannot be changed after creation.</p>}
                            </div>
                            <div>
                                <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2.5">Items in this Bundle</h4>
                                <div className="space-y-2.5">
                                    {newBundleItems.map((item, index) => (
                                        <div key={item.id} className="flex items-center gap-2.5">
                                            <input type="text" placeholder={`Service or Item ${index + 1}`} value={item.title} onChange={(e) => handleNewBundleItemChange(item.id, e.target.value)} className={`${themedInputStyles} flex-grow`} />
                                            <button onClick={() => removeNewItemFromNewBundle(item.id)} className={`${deleteIconButtonAppliedStyles} p-2.5 h-[42px] w-[42px]`} title="Remove item" disabled={newBundleItems.length <= 1}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={addNewItemToNewBundle} className={`${secondaryButtonStyles} mt-4 px-4 py-2 text-sm`}>
                                    <Plus size={18} className="mr-1.5" /> Add Item
                                </button>
                            </div>
                        </div>
                        <div className="mt-8 pt-5 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button onClick={() => setShowCreateBundleModal(false)} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium mr-3 transition-colors">Cancel</button>
                            <button onClick={handleSaveCustomBundle} className={primaryButtonStyles}>
                                <Save size={18} className="mr-2" /> {editingBundle ? "Update Bundle" : "Save Bundle"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliverablesBundle;