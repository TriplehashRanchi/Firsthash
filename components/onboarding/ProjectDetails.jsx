'use client';
import React, { useEffect } from 'react';

/**
 * ProjectDetails Component (Refactored)
 *
 * This component is now simplified to handle only the project's package cost.
 * The redundant "Event Title" has been removed to create a single source of truth
 * for the project name in the main page component.
 */
const ProjectDetails = ({ onValidChange, packageCost, onPackageCostChange }) => {

    // --- useEffect for Validation ---
    // The validation logic now only cares about the packageCost prop.
    useEffect(() => {
        // Ensure packageCost is treated as a string for validation checks
        const packageCostString = packageCost || '';
        const numericPackageCost = parseFloat(packageCostString);

        // A valid state is when the input is not empty and contains a number >= 0.
        const isValid = 
            packageCostString.trim() !== '' && 
            !isNaN(numericPackageCost) && 
            numericPackageCost >= 0;
            
        // Notify the parent component of the validation status.
        onValidChange?.(isValid);
    }, [packageCost, onValidChange]);

    // --- NO onDataChange or local state needed ---
    // This component's only job is to display and update the packageCost prop,
    // making it a much simpler "controlled component".

    // --- Styles ---
    const sectionWrapperStyles = "mb-0 p-4 bg-white dark:bg-gray-900/50 rounded-lg shadow-md dark:shadow-gray-700/50";
    const sectionHeadingStyles = "text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200";
    const currencyPrefixStyles = "p-2 rounded-l border border-r-0 bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-600 h-[42px] flex items-center";
    const currencyInputStyles = `w-full p-2 rounded-r border bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 h-[42px]`;

    return (
        <div className={sectionWrapperStyles}>
            {/* The heading is updated to be more specific. */}
            <h2 className={sectionHeadingStyles}>Project Cost Details</h2>

            {/* The layout is simplified to handle a single input field gracefully. */}
            <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="sm:col-span-1 flex items-center">
                    <span className={currencyPrefixStyles}>₹</span>
                    <input
                        id="pdPackageCost"
                        type="text" // Keep as text to allow for empty intermediate states
                        placeholder="Package Cost*"
                        value={packageCost} // Directly use the prop value
                        onChange={(e) => onPackageCostChange(e.target.value)} // Call the parent's update function
                        className={currencyInputStyles}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;
