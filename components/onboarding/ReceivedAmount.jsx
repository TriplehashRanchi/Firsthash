'use client';
import React, { useState, useEffect } from 'react'; // Added useState, useEffect for input values and validation

const ReceivedAmount = ({ onValidChange }) => { // Assuming onValidChange prop for consistency
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');

    // --- Styles for Light/Dark Mode ---
    const sectionWrapperStyles = "mb-6 p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-md dark:shadow-gray-700/50";
    const sectionHeadingStyles = "text-xl font-semibold mb-1 text-gray-800 dark:text-gray-100";
    const sectionSubheadingStyles = "text-sm text-gray-500 dark:text-gray-400 mb-3"; // Adjusted margin slightly

    const inputBase = "w-full text-sm rounded-lg p-2.5 h-[42px] border"; // Standardized input height
    const themedInputStyles = `${inputBase} bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400`;

    // Basic validation (optional, as the field is optional)
    // This example makes it valid if all fields are empty OR if amount is a number and date is present
    useEffect(() => {
        if (typeof onValidChange === 'function') {
            const isEmpty = !amount && !description && !date;
            const isPartiallyFilledValid = 
                (amount.trim() === '' || (!isNaN(parseFloat(amount)) && parseFloat(amount) >= 0)) &&
                (date.trim() === '' || date.trim() !== ''); // Date simply needs to be not empty if amount is filled
            
            // If all are empty, it's valid (optional field).
            // If amount is entered, it must be a number, and date should ideally be present.
            // Description is truly optional.
            let isValid = isEmpty;
            if (!isEmpty) {
                isValid = (amount.trim() === '' || (!isNaN(parseFloat(amount)) && parseFloat(amount) >= 0)) &&
                          (date.trim() !== ''); // If amount is provided, date becomes more important
            }
            onValidChange(isValid);
        }
    }, [amount, description, date, onValidChange]);


    return (
        <div className={sectionWrapperStyles}>
            <h2 className={sectionHeadingStyles}>Received Amount</h2>
            <p className={sectionSubheadingStyles}>
                Amount already paid by client while creating this project. This field is optional.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"> {/* Adjusted gap and responsive columns */}
                <input
                    type="number" // More appropriate for amount
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={themedInputStyles}
                    min="0" // Good for currency
                />
                <input
                    type="text" // Text for description
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={themedInputStyles}
                />
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={themedInputStyles}
                />
            </div>
        </div>
    );
};

export default ReceivedAmount;