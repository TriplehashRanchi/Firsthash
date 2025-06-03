'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react'; // Example icons if you add multiple rows

// Accept onDataChange prop from Page.js
const PaymentSchedule = ({ onValidChange, onDataChange }) => {
    // For multiple installments, you'd use an array of objects here.
    // For simplicity, starting with one installment's fields, but structured for easy expansion.
    const createNewInstallment = (id = Date.now()) => ({ 
        id: id, 
        amount: '', 
        description: '', 
        dueDate: '' 
    });

    const [installments, setInstallments] = useState(() => [createNewInstallment()]);

    // --- useEffect for Validation ---
    useEffect(() => {
        if (typeof onValidChange === 'function') {
            let isValidOverall = true;
            if (installments.length === 0) {
                // If no installments are allowed, it's valid. If at least one is expected, this might be false.
                // For now, let's assume an empty schedule (no rows) is valid.
                isValidOverall = true; 
            } else {
                // Check if all existing installments are either completely empty OR completely valid
                isValidOverall = installments.every(inst => {
                    const isEmpty = !inst.amount && !inst.description && !inst.dueDate;
                    const isFilledAndValid =
                        inst.amount.toString().trim() !== '' && 
                        !isNaN(parseFloat(inst.amount)) && 
                        parseFloat(inst.amount) >= 0 &&
                        inst.description.trim() !== '' &&
                        inst.dueDate.trim() !== '';
                    return isEmpty || isFilledAndValid;
                });
            }
            onValidChange(isValidOverall);
        }
    }, [installments, onValidChange]);

    // --- useEffect for Reporting Data to Parent ---
    useEffect(() => {
        if (typeof onDataChange === 'function') {
            // Filter out installments where all fields are empty, unless it's the only row
            const relevantInstallments = installments.filter(inst => {
                return inst.amount.toString().trim() !== '' || inst.description.trim() !== '' || inst.dueDate.trim() !== '';
            });

            const componentData = {
                // Send only installments that have some data, or an empty array if all are blank
                paymentInstallments: relevantInstallments.map(inst => ({
                    ...inst,
                    amount: parseFloat(inst.amount) || 0, // Ensure amount is a number
                })),
            };
            // console.log('[PaymentSchedule.js] Reporting data:', componentData); // UNCOMMENT FOR DEBUGGING
            onDataChange(componentData);
        }
    }, [installments, onDataChange]); // Dependency: installments array and onDataChange prop

    // --- Event Handlers for a single installment (extend for multiple) ---
    const handleInstallmentChange = (index, field, value) => {
        setInstallments(prevInstallments => 
            prevInstallments.map((inst, i) => 
                i === index ? { ...inst, [field]: value } : inst
            )
        );
    };

    // --- Example handlers if you were to add multiple installment rows ---
    const addInstallmentRow = () => {
        setInstallments(prev => [...prev, createNewInstallment(Date.now() + prev.length)]);
    };

    const removeInstallmentRow = (idToRemove) => {
        setInstallments(prev => {
            const remaining = prev.filter(inst => inst.id !== idToRemove);
            return remaining.length === 0 ? [createNewInstallment()] : remaining; // Ensure at least one row if all are removed
        });
    };


    // --- Styles for Light/Dark Mode ---
    const sectionWrapperStyles = "mb-6 p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-md dark:shadow-gray-700/50";
    const sectionHeadingStyles = "text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100"; // Adjusted margin
    const inputBase = "w-full text-sm rounded-lg p-2.5 h-[42px] border";
    const themedInputStyles = `${inputBase} bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400`;
    const buttonStyles = "p-2 rounded-md text-white"; // Generic button style
    const addButtonStyle = `${buttonStyles} bg-blue-500 hover:bg-blue-600 flex items-center`;
    const removeButtonStyle = `${buttonStyles} bg-red-500 hover:bg-red-600 ml-2`;


    return (
        <div className={sectionWrapperStyles}>
            <div className="flex justify-between items-center mb-3">
                <h2 className={sectionHeadingStyles}>Payment Schedule</h2>
                <button onClick={addInstallmentRow} className={addButtonStyle} title="Add Payment Installment">
                    <Plus size={18} className="mr-1" /> Add Row
                </button>
            </div>
            
            {installments.map((installment, index) => (
                <div key={installment.id} className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr_auto] gap-3 mb-3 items-center">
                    <input
                        type="number"
                        placeholder="Amount*"
                        value={installment.amount}
                        onChange={(e) => handleInstallmentChange(index, 'amount', e.target.value)}
                        className={themedInputStyles}
                        min="0"
                    />
                    <input
                        type="text"
                        placeholder="Description*"
                        value={installment.description}
                        onChange={(e) => handleInstallmentChange(index, 'description', e.target.value)}
                        className={themedInputStyles}
                    />
                    <input
                        type="date"
                        value={installment.dueDate}
                        onChange={(e) => handleInstallmentChange(index, 'dueDate', e.target.value)}
                        className={themedInputStyles}
                    />
                    {installments.length > 1 && ( // Show remove button only if there's more than one row
                        <button 
                            onClick={() => removeInstallmentRow(installment.id)} 
                            className={removeButtonStyle}
                            title="Remove Installment"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            ))}
            {installments.length === 0 && ( // Should not happen with current logic but good for robustness
                 <p className="text-sm text-gray-500 dark:text-gray-400">No payment installments added.</p>
            )}
        </div>
    );
};

export default PaymentSchedule;