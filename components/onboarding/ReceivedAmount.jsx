'use client';
import { set } from 'lodash';
import React, { useState, useEffect, useRef } from 'react';

// Accept onDataChange prop from Page.js
const ReceivedAmount = ({ onValidChange, onDataChange, initialData }) => { 
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
     const isInitialized = useRef(false);


  useEffect(() => {
        if (initialData && initialData.transactions && !isInitialized.current) {
            if (initialData.transactions.length > 0) {
                const firstTx = initialData.transactions[0];
                const receivedDate = firstTx.date || firstTx.date_received;

                setAmount(firstTx.amount?.toString() || '');
                setDescription(firstTx.description || '');
                setDate(receivedDate ? new Date(receivedDate).toISOString().split('T')[0] : '');
            }
            // Set the flag to true so this block never runs again.
            isInitialized.current = true;
        }
    }, [initialData]);

    // --- useEffect for Validation ---
    useEffect(() => {
        if (typeof onValidChange === 'function') {
            const amountStr = amount.toString().trim(); // Ensure amount is string for trim
            const dateStr = date.toString().trim();

            // If all fields are empty, it's considered valid (optional section)
            const isEmpty = !amountStr && !description.trim() && !dateStr;
            
            let isValid = isEmpty;
            if (!isEmpty) {
                // If not empty, amount must be a valid non-negative number, and date must be present
                // Description is truly optional.
                const isAmountValid = amountStr !== '' && !isNaN(parseFloat(amountStr)) && parseFloat(amountStr) >= 0;
                const isDatePresent = dateStr !== '';
                isValid = isAmountValid && isDatePresent;
            }
            onValidChange(isValid);
        }
    }, [amount, description, date, onValidChange]);

    // --- CRITICAL: useEffect for Reporting Data to Parent ---
    useEffect(() => {
        if (typeof onDataChange === 'function') {
            const amountStr = amount.toString().trim();
            const dateStr = date.toString().trim();
            const descriptionStr = description.trim();

            // Only send a transaction object if there's meaningful data
            // Otherwise, send null or an empty indicator for this section
            const transactionData = (amountStr || descriptionStr || dateStr) 
                ? {
                    amount: parseFloat(amountStr) || 0, // Ensure numeric amount, default to 0
                    description: descriptionStr,
                    date: dateStr,
                  }
                : null; // Or you could send an empty object: { amount: 0, description: '', date: '' }

            const componentData = {
                transaction: transactionData,
            };
            // console.log('[ReceivedAmount.js] Reporting data:', componentData); // UNCOMMENT FOR DEBUGGING
            onDataChange({
                transactions: transactionData ? [transactionData] : [],
            });
        }
    // Dependencies: All state variables that form the componentData + onDataChange prop
    }, [amount, description, date, onDataChange]);


    // --- Styles for Light/Dark Mode ---
    const sectionWrapperStyles = "mb-6 p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-md dark:shadow-gray-700/50";
    const sectionHeadingStyles = "text-xl font-semibold mb-1 text-gray-800 dark:text-gray-100";
    const sectionSubheadingStyles = "text-sm text-gray-500 dark:text-gray-400 mb-3";
    const inputBase = "w-full text-sm rounded-lg p-2.5 h-[42px] border";
    const themedInputStyles = `${inputBase} bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400`;
    const labelStyles = "block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"; // Added for consistency


    return (
        <div className={sectionWrapperStyles}>
            <h2 className={sectionHeadingStyles}>Received Amount</h2>
            <p className={sectionSubheadingStyles}>
                Optional: Amount already paid by client for this project.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"> {/* Changed gap to 4 for consistency */}
                <div>
                    <label htmlFor="receivedAmount" className={labelStyles}>Amount (₹)</label>
                    <input
                        id="receivedAmount"
                        type="number"
                        placeholder="e.g., 10000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={themedInputStyles}
                        min="0"
                    />
                </div>
                <div>
                    <label htmlFor="receivedDesc" className={labelStyles}>Description (Optional)</label>
                    <input
                        id="receivedDesc"
                        type="text"
                        placeholder="e.g., Advance Payment"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={themedInputStyles}
                    />
                </div>
                <div>
                    <label htmlFor="receivedDate" className={labelStyles}>Date Received</label>
                    <input
                        id="receivedDate"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={themedInputStyles}
                    />
                </div>
            </div>
        </div>
    );
};

export default ReceivedAmount;