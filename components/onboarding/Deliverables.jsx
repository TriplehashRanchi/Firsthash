'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';

const generateId = () => self.crypto.randomUUID();

const deliverableOptions = {
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

const Deliverables = ({ onValidChange, onDeliverablesCostChange }) => {
    const [items, setItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    // const [customBundleName, setCustomBundleName] = useState(''); // Removed: No longer needed
    const [isDarkMode, setIsDarkMode] = useState(false);

    // --- Styles (remain the same) ---
    const sectionWrapperStyles = "mb-6 p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-md dark:shadow-gray-700/50";
    const sectionHeadingStyles = "text-xl font-semibold text-gray-700 dark:text-gray-200";
    const inputBase = "w-full text-sm rounded-lg p-2.5 h-[42px] border";
    const themedInputStyles = `${inputBase} bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400`;
    const themedSelectStyles = `${themedInputStyles} appearance-none`;
    const commonSelectArrowStyle = (isDarkMode) => ({
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='${isDarkMode ? '%239ca3af' : '%236b7280'}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '1em',
        paddingRight: '2.5rem'
    });
    const itemRowStyles = "grid items-center p-4 rounded-xl mb-4 gap-x-5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600/70 shadow-lg";
    const columnHeaderStyles = "text-sm font-medium text-gray-500 dark:text-gray-400 px-4 items-center";
    const primaryButtonStyles = "text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 p-2.5 rounded-lg flex items-center justify-center";
    const secondaryButtonStyles = "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/30 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700 p-2.5 h-[42px] flex items-center justify-center rounded-lg transition-colors";
    const dangerButtonStyles = "text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 focus:ring-2 focus:ring-red-300 dark:focus:ring-red-400 p-2.5 h-[42px] flex items-center justify-center rounded-lg hover:bg-red-500/10 dark:hover:bg-red-400/10 transition-colors";
    const modalOverlayStyles = "fixed inset-0 bg-black/70 dark:bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm";
    const modalContentStyles = "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white p-6 rounded-xl shadow-2xl w-full max-w-lg";
    const modalHeaderStyles = "text-xl font-semibold text-gray-700 dark:text-white";
    const modalCloseButtonStyles = "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors";
    const modalListItemButtonStyles = "w-full text-left px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-blue-500 dark:focus:ring-blue-400";
    const currencySymbolStyles = "absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-sm text-gray-500 dark:text-gray-400";
    const actionIconGroupStyles = "flex items-center gap-1";

    // --- Helper Function to create a new deliverable item ---
    const createNewDeliverableItem = (title = '', isAdditional = false) => ({
        id: generateId(),
        title: title,
        baseCost: 0,
        isAdditionalCharge: isAdditional,
        additionalChargeAmount: 0,
        date: '',
    });

     // --- Initial state for items: start with one empty item ---
    useState(() => {
        if (items.length === 0) {
            setItems([createNewDeliverableItem()]);
        }
        return items;
    });

    // --- Effects ---
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true });
        setIsDarkMode(document.documentElement.classList.contains('dark'));
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (typeof onValidChange === 'function') {
            const isValid = items.length > 0 && items.every(item =>
                item.title && item.title.trim() !== '' &&
                (item.isAdditionalCharge ? (item.additionalChargeAmount > 0) : true)
            );
            onValidChange(isValid);
        }
    }, [items, onValidChange]);

    useEffect(() => {
        const currentTotalAdditionalCharges = items.reduce((sum, item) => {
            if (item.isAdditionalCharge) {
                return sum + (item.additionalChargeAmount || 0);
            }
            return sum;
        }, 0);
        onDeliverablesCostChange?.(currentTotalAdditionalCharges);
    }, [items, onDeliverablesCostChange]);


    // --- Handlers ---
    const addSingleDeliverableRow = () => {
        setItems((prev) => [...prev, createNewDeliverableItem()]);
    };

    const addDeliverablesFromPreset = (optionKey) => {
        const selectedPresetItems = deliverableOptions[optionKey].map((presetItem) =>
            createNewDeliverableItem(presetItem.title, false)
        );
        if (items.length === 1 && items[0].title === '') {
            setItems(selectedPresetItems);
        } else {
            setItems((prev) => [...prev, ...selectedPresetItems]);
        }
        setShowModal(false);
    };

    // handleAddCustomBundle function is removed as the feature is removed.

    const handleChange = (id, field, value) => {
        setItems((prevItems) =>
            prevItems.map((item) => {
                if (item.id === id) {
                    const updatedItem = { ...item };
                    if (field === 'title' || field === 'date') {
                        updatedItem[field] = value;
                    } else if (field === 'costTypeDropdown') {
                        updatedItem.isAdditionalCharge = value === 'additional';
                        if (!updatedItem.isAdditionalCharge) {
                            updatedItem.additionalChargeAmount = 0;
                        }
                    } else if (field === 'additionalChargeInput') {
                        updatedItem.additionalChargeAmount = parseInt(value, 10) || 0;
                    }
                    return updatedItem;
                }
                return item;
            })
        );
    };

    const handleRemove = (idToRemove) => {
        setItems((prevItems) => {
            const newItems = prevItems.filter((item) => item.id !== idToRemove);
            if (newItems.length === 0) {
                return [createNewDeliverableItem()];
            }
            return newItems;
        });
    };

    const openPresetModal = () => setShowModal(true);

    const gridColumnsClass = "grid-cols-[minmax(200px,_2fr)_1fr_160px_auto] sm:grid-cols-[minmax(200px,_2fr)_350px_160px_auto]";
    const columnHeaderGridColumnsClass = "grid-cols-[minmax(200px,_2fr)_1fr_160px_96px] sm:grid-cols-[minmax(200px,_2fr)_350px_160px_96px]";

    return (
        <div className={sectionWrapperStyles}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className={sectionHeadingStyles}>Deliverables</h2>
                <button
                    onClick={openPresetModal}
                    className={primaryButtonStyles}
                    title="Add from Preset"
                >
                    <Plus size={18}/>
                </button>
            </div>

            {/* Column Headers */}
            {items.length > 0 && (items.length > 1 || items[0].title !== '' || items[0].date !== '' || items[0].additionalChargeAmount > 0 || items[0].isAdditionalCharge) && (
                <div className={`grid ${columnHeaderGridColumnsClass} gap-x-5 mb-3 ${columnHeaderStyles}`}>
                    <div className="col-span-1">Title</div>
                    <div className="col-span-1">Cost (₹)</div>
                    <div className="col-span-1 text-left">Date</div>
                    <div className="col-span-1 text-center">Actions</div>
                </div>
            )}

            {/* Deliverable Items */}
            {items.map((item) => (
                <div
                    key={item.id}
                    className={`${itemRowStyles} ${gridColumnsClass}`}
                >
                    <input
                        type="text"
                        placeholder="Deliverable Name"
                        value={item.title || ''}
                        onChange={(e) => handleChange(item.id, 'title', e.target.value)}
                        className={themedInputStyles}
                    />
                    <div className="flex items-center gap-2 w-full">
                        <select
                            value={item.isAdditionalCharge ? 'additional' : 'package'}
                            onChange={(e) => handleChange(item.id, 'costTypeDropdown', e.target.value)}
                            className={`${themedSelectStyles} ${item.isAdditionalCharge ? 'w-[160px] sm:w-[190px] flex-none' : 'w-full'
                                }`}
                            style={commonSelectArrowStyle(isDarkMode)}
                        >
                            <option value="package">Part of package</option>
                            <option value="additional">Additional Charges</option>
                        </select>
                        {item.isAdditionalCharge && (
                            <div className="relative flex-1 min-w-0">
                                <span className={currencySymbolStyles}>₹</span>
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    value={item.additionalChargeAmount === 0 ? '' : item.additionalChargeAmount}
                                    onChange={(e) => handleChange(item.id, 'additionalChargeInput', e.target.value)}
                                    className={`${themedInputStyles} pl-7`}
                                    min="0"
                                />
                            </div>
                        )}
                    </div>
                    <input
                        type="date"
                        value={item.date || ''}
                        onChange={(e) => handleChange(item.id, 'date', e.target.value)}
                        className={themedInputStyles}
                    />
                    <div className={`${actionIconGroupStyles} justify-center`}>
                        <button
                            onClick={addSingleDeliverableRow}
                            className={secondaryButtonStyles}
                            title="Add New Deliverable Row"
                        >
                            <Plus size={18} />
                        </button>
                        <button
                            onClick={() => handleRemove(item.id)}
                            className={dangerButtonStyles}
                            title="Remove Deliverable"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}

            {/* Modal for Selecting Presets ONLY */}
            {showModal && (
                <div className={modalOverlayStyles}>
                    <div className={modalContentStyles}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={modalHeaderStyles}>Select Service Bundle</h3>
                            <button onClick={() => setShowModal(false)} className={modalCloseButtonStyles}>
                                <X size={22} />
                            </button>
                        </div>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {/* Preset Options */}
                            {Object.entries(deliverableOptions).map(([key]) => (
                                <button
                                    key={key}
                                    onClick={() => addDeliverablesFromPreset(key)}
                                    className={modalListItemButtonStyles}
                                >
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Deliverables;



















