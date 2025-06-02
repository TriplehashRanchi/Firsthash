'use client';
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';

import Shoots from '../../../components/onboarding/Shoots';
import ProjectDetails from '../../../components/onboarding/ProjectDetails';
import Clients from '../../../components/onboarding/Clients';
import PaymentSchedule from '../../../components/onboarding/PaymentSchedule';
import Deliverables from '../../../components/onboarding/Deliverables';
import ReceivedAmount from '../../../components/onboarding/ReceivedAmount';

function Page() {
    const [projectName, setProjectName] = useState('');
    const [projectPackageCost, setProjectPackageCost] = useState('');
    const [deliverablesTotalCost, setDeliverablesTotalCost] = useState(0);

    const [isClientsValid, setIsClientsValid] = useState(false);
    const [isProjectDetailsValid, setIsProjectDetailsValid] = useState(false);
    const [isShootsValid, setIsShootsValid] = useState(false);
    const [isDeliverablesValid, setIsDeliverablesValid] = useState(false);
    const [isReceivedValid, setIsReceivedValid] = useState(false);
    const [isScheduleValid, setIsScheduleValid] = useState(false);

    const handleSave = () => {
        if (!projectName.trim()) {
            toast.error("Project name cannot be empty.");
            return;
        }

        let allValid = true;
        const missingSections = [];

        if (!isClientsValid) { missingSections.push("Clients"); allValid = false; }
        if (!isProjectDetailsValid) { missingSections.push("Project Details"); allValid = false; }
        if (!isShootsValid) { missingSections.push("Shoots"); allValid = false; }
        if (!isDeliverablesValid) { missingSections.push("Deliverables"); allValid = false; }
        if (!isReceivedValid) { missingSections.push("Received Amount"); allValid = false; }
        // if (!isScheduleValid && paymentScheduleIsActive) { /* Your condition for schedule validation */
        //     missingSections.push("Payment Schedule");
        //     allValid = false;
        // }

        if (allValid) {
            toast.success(`Project "${projectName}" data valid. Ready to send to backend.`);
            console.log("Project Name to save:", projectName);
            console.log("Package Cost:", projectPackageCost);
            console.log("Deliverables Additional Cost:", deliverablesTotalCost);
            console.log("Overall Total Cost:", overallTotalCost);
            console.log("All other data states:", {
                isClientsValid, isProjectDetailsValid, isShootsValid,
                isDeliverablesValid, isReceivedValid, isScheduleValid
            });
        } else {
            toast.error(`Please fill all required sections. Missing/Invalid: ${missingSections.join(', ')}.`);
        }
    };

    // --- Themed Styles ---
    const pageContainerStyles = "min-h-screen p-6 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 transition-colors duration-300";
    const breadcrumbLinkStyles = "text-blue-600 hover:underline dark:text-blue-400";
    const breadcrumbCurrentPageStyles = "text-gray-600 dark:text-gray-400";
    const breadcrumbSeparatorStyles = "before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-gray-500 dark:text-gray-500";
    const projectNameInputStyles = "bg-transparent text-3xl font-bold focus:outline-none flex-grow placeholder-gray-500 text-gray-900 dark:text-white dark:placeholder-gray-400";
    const successButtonStyles = "bg-blue-600 text-white px-6 py-3 rounded text-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800";
    
    const totalCostSectionStyles = "mt-10 pt-6 border-t border-gray-300 dark:border-gray-700"; // Base style for the section
    const totalCostLabelStyles = "text-xl font-semibold text-gray-700 dark:text-gray-200";
    const totalCostValueStyles = "text-3xl font-bold text-green-600 dark:text-green-400 ml-2";

    // Calculate overall total cost
    const overallTotalCost = (parseFloat(projectPackageCost) || 0) + deliverablesTotalCost;

    return (
        <div className={pageContainerStyles}>
            <ToastContainer theme={typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'} position="top-right" autoClose={3000} />
            
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <Link href="/dashboard" className={breadcrumbLinkStyles}>
                        Dashboard
                    </Link>
                </li>
                <li className={breadcrumbSeparatorStyles}>
                    <span className={breadcrumbCurrentPageStyles}>Create Project</span>
                </li>
            </ul>
            
            <div className="text-left">
                <div className="flex items-center justify-between mb-6">
                    <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Enter Project Name"
                        className={projectNameInputStyles}
                    />
                </div>
            </div>

            <div className="grid gap-8 pt-5">
                <div>
                    <Clients onValidChange={setIsClientsValid} />
                    <ProjectDetails 
                        onValidChange={setIsProjectDetailsValid}
                        packageCost={projectPackageCost}
                        onPackageCostChange={setProjectPackageCost}
                    />
                </div>
                <div>
                    <Shoots onValidChange={setIsShootsValid} />
                    <Deliverables 
                        onValidChange={setIsDeliverablesValid}
                        onDeliverablesCostChange={setDeliverablesTotalCost}
                    />
                    <ReceivedAmount onValidChange={setIsReceivedValid} />
                    <PaymentSchedule onValidChange={setIsScheduleValid} /> {/* Assuming this is now active */}
                </div>
            </div>

            {/* --- Total Cost Section & Save Button --- */}
            <div className={`${totalCostSectionStyles} flex justify-between items-center`}>
                {/* Left Side: Total Cost Display */}
                <div> 
                    <span className={totalCostLabelStyles}>Overall Total:</span>
                    <span className={totalCostValueStyles}>
                        ₹{overallTotalCost.toLocaleString()}
                    </span>
                </div>

                {/* Right Side: Save Button */}
                <button
                    onClick={handleSave}
                    className={successButtonStyles} 
                >
                    Save Project
                </button>
            </div>
        </div>
    );
}

export default Page;