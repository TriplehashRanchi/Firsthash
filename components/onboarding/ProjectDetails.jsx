'use client';
import React, { useState, useEffect } from 'react'; // Ensured useState is imported

const ProjectDetails = ({ 
    onValidChange, 
    packageCost,         
    onPackageCostChange, 
    onDataChange         
}) => {
   
    const [eventTitle, setEventTitle] = useState(''); 
    

    // --- useEffect for Validation ---
    useEffect(() => {
        const packageCostString = packageCost || '';
        const numericPackageCost = parseFloat(packageCostString);

        const isValid = 
            eventTitle.trim() !== '' &&      
            packageCostString.trim() !== '' && 
            !isNaN(numericPackageCost) && 
            numericPackageCost >= 0;
        onValidChange?.(isValid);
    }, [eventTitle, packageCost, onValidChange]); 

    // --- useEffect for Reporting Data to Parent ---
    useEffect(() => {
        if (typeof onDataChange === 'function') {
            const componentData = {
                eventTitle: eventTitle,
                packageCost: parseFloat(packageCost) || 0, // packageCost prop, converted to number
                
            };
            // console.log('[ProjectDetails.js] Reporting data:', componentData); // UNCOMMENT FOR DEBUGGING
            onDataChange(componentData);
        }
    // Dependencies: All local state + props that form the componentData + onDataChange
    }, [eventTitle, packageCost, onDataChange]); // Added eventTitle and onDataChange

    // --- Styles ---
    const inputBaseStyles = "w-full p-2 rounded border h-[42px]"; // Added h-[42px] for consistency
    const themedInputStyles = `${inputBaseStyles} bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400`;
    const currencyPrefixStyles = "p-2 rounded-l border border-r-0 bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-600 h-[42px] flex items-center";
    const currencyInputStyles = `w-full p-2 rounded-r border bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 h-[42px]`;
    const sectionWrapperStyles = "mb-6 p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-md dark:shadow-gray-700/50";
    const sectionHeadingStyles = "text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200";
    // const labelStyles = "block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"; // If you add labels


    return (
        <div className={sectionWrapperStyles}>
            <h2 className={sectionHeadingStyles}>Project Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Simplified grid to two columns */}
                {/* Project Name / Event Title specific to this section */}
                <div className="sm:col-span-1"> {/* Takes one column */}
                     {/* <label htmlFor="pdEventTitle" className={labelStyles}>Event Title*</label> */} 
                    <input
                        id="pdEventTitle" // Give a unique ID
                        type="text"
                        placeholder="Event Title*" // Changed placeholder for clarity
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        className={themedInputStyles}
                    />
                </div>

                {/* Package Cost */}
                <div className="sm:col-span-1 flex items-center"> {/* Takes one column */}
                     {/* <label htmlFor="pdPackageCost" className={labelStyles}>Package Cost (₹)*</label> */} {/* Optional Label */}
                    <span className={currencyPrefixStyles}>₹</span>
                    <input
                        id="pdPackageCost"
                        type="text" // Keep as text so Page.js manages string, allowing empty input
                        placeholder="Package cost*"
                        value={packageCost} // Use prop value from Page.js (string)
                        onChange={(e) => onPackageCostChange(e.target.value)} // Call parent's updater with string
                        min="0" // Browser hint
                        className={currencyInputStyles}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;