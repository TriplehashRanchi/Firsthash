'use client';
import React, { useState, useEffect } from 'react'; // Added useState, useEffect for input values and validation

const PaymentSchedule = ({ onValidChange }) => { // Assuming onValidChange prop
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(''); // Changed from 'date' to 'dueDate' for clarity

    // --- Styles for Light/Dark Mode ---
    const sectionWrapperStyles = "mb-6 p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-md dark:shadow-gray-700/50";
    const sectionHeadingStyles = "text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100"; // Adjusted margin slightly

    const inputBase = "w-full text-sm rounded-lg p-2.5 h-[42px] border"; // Standardized input height
    const themedInputStyles = `${inputBase} bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400`;

    // Basic validation: Assuming all fields are required if a payment schedule is entered.
    // If this component allows multiple rows, validation would be more complex.
    useEffect(() => {
        if (typeof onValidChange === 'function') {
            // If all fields are empty, consider it valid (as if no schedule is set yet for this single row)
            // OR if all fields are filled and amount is a valid number.
            const isEmpty = !amount && !description && !dueDate;
            const isFilledAndValid = 
                amount.trim() !== '' && !isNaN(parseFloat(amount)) && parseFloat(amount) >= 0 &&
                description.trim() !== '' &&
                dueDate.trim() !== '';
            
            onValidChange(isEmpty || isFilledAndValid);
        }
    }, [amount, description, dueDate, onValidChange]);

    return (
        <div className={sectionWrapperStyles}>
            <h2 className={sectionHeadingStyles}>Payment Schedule</h2>
            {/* If this component were to support multiple payment rows, you'd have an "Add" button and map over an array here. */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"> {/* Adjusted gap and responsive columns */}
                <input
                    type="number" // Appropriate for amount
                    placeholder="Amount*" // Added asterisk if required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={themedInputStyles}
                    min="0"
                />
                <input
                    type="text"
                    placeholder="Description*" // Added asterisk if required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={themedInputStyles}
                />
                <input
                    type="date"
                    placeholder="Due Date*" // More specific placeholder
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={themedInputStyles}
                />
            </div>
        </div>
    );
};

export default PaymentSchedule;
