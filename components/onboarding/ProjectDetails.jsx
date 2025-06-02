'use client';
import React, { useEffect } from 'react'; // Removed useState for packageCost

const ProjectDetails = ({ 
    onValidChange, 
    packageCost, // Receive packageCost as a prop
    onPackageCostChange // Callback to update packageCost in parent
}) => {
    // ProjectName state can remain local if not needed by parent for total cost
    const [projectName, setProjectName] = React.useState('');

    React.useEffect(() => {
        // Ensure packageCost is treated as a number for validation
        const numericPackageCost = parseFloat(packageCost);
        const isValid = 
            projectName.trim() !== '' && 
            packageCost.trim() !== '' && 
            !isNaN(numericPackageCost) && 
            numericPackageCost >= 0;
        onValidChange?.(isValid);
    }, [projectName, packageCost, onValidChange]);

    // --- Styles (assuming these are defined or imported) ---
    const inputBaseStyles = "w-full p-2 rounded border";
    const themedInputStyles = `${inputBaseStyles} bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400`;
    const currencyPrefixStyles = "p-2 rounded-l border border-r-0 bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-600";
    const currencyInputStyles = `w-full p-2 rounded-r border bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400`;
    const sectionWrapperStyles = "mb-6 p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-md dark:shadow-gray-700/50";
    const sectionHeadingStyles = "text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200";
    


    return (
        <div className={sectionWrapperStyles}>
            <h2 className={sectionHeadingStyles}>Project Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <input
                    type="text"
                    placeholder="Project name*"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className={`${themedInputStyles} col-span-1 sm:col-span-2`}
                />
                <div className="flex items-center col-span-1 sm:col-span-2">
                    <span className={currencyPrefixStyles}>₹</span>
                    <input
                        type="number"
                        placeholder="Package cost*"
                        value={packageCost} // Use prop value
                        onChange={(e) => onPackageCostChange(e.target.value)} // Call parent's updater
                        min="0"
                        className={currencyInputStyles}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;