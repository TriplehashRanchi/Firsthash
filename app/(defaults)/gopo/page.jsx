'use client';
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';

// Ensure these paths are correct for your project structure
import Shoots from '../../../components/onboarding/Shoots';
import ProjectDetails from '../../../components/onboarding/ProjectDetails';
import Clients from '../../../components/onboarding/Clients';
import PaymentSchedule from '../../../components/onboarding/PaymentSchedule';
import Deliverables from '../../../components/onboarding/Deliverables';
import ReceivedAmount from '../../../components/onboarding/ReceivedAmount';

function Page() {
    const [projectName, setProjectName] = useState('');
    const [projectPackageCost, setProjectPackageCost] = useState(''); // Will hold string from input
    const [deliverablesTotalCost, setDeliverablesTotalCost] = useState(0);

    

    // --- State to hold data from child components ---
    const [clientsData, setClientsData] = useState(null);
    const [projectDetailsData, setProjectDetailsData] = useState(null);
    const [shootsData, setShootsData] = useState(null);
    const [deliverablesData, setDeliverablesData] = useState(null);
    const [receivedAmountData, setReceivedAmountData] = useState(null);
    const [paymentScheduleData, setPaymentScheduleData] = useState(null);


    console.log(clientsData)

    // Validation states
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

        const validationChecks = [
            { isValid: isClientsValid, name: "Clients" },
            { isValid: isProjectDetailsValid, name: "Project Details" },
            { isValid: isShootsValid, name: "Shoots" },
            { isValid: isDeliverablesValid, name: "Deliverables" },
            { isValid: isReceivedValid, name: "Received Amount" },
            { isValid: isScheduleValid, name: "Payment Schedule" }, // Make sure this is correctly set by PaymentSchedule
        ];

        const invalidSections = validationChecks.filter(check => !check.isValid).map(check => check.name);

        if (invalidSections.length === 0) {
            toast.success(`Project "${projectName}" data valid. Logging all data...`);
            
            const numericPackageCostValue = parseFloat(projectPackageCost) || 0;
            const currentOverallTotalCost = numericPackageCostValue + deliverablesTotalCost;

            // --- THIS IS WHERE ALL THE DATA IS GATHERED ---
            const fullProjectData = {
                projectName,
                projectPackageCost: numericPackageCostValue,
                deliverablesAdditionalCost: deliverablesTotalCost,
                overallTotalCost: currentOverallTotalCost,
                clients: clientsData,                 // Data from Clients component
                projectDetails: projectDetailsData,   // Data from ProjectDetails component
                shoots: shootsData,                   // Data from Shoots component
                deliverables: deliverablesData,       // Data from Deliverables component
                receivedAmount: receivedAmountData,   // Data from ReceivedAmount component
                paymentSchedule: paymentScheduleData, // Data from PaymentSchedule component
            };

            console.log("--- FULL PROJECT DATA TO BE SAVED ---");
            console.log(JSON.stringify(fullProjectData, null, 2)); // Pretty print for readability
            console.log("------------------------------------");
            
            // TODO: Send `fullProjectData` to your backend API
        } else {
            toast.error(`Please fill all required sections. Missing/Invalid: ${invalidSections.join(', ')}.`);
        }
    };

    // --- Themed Styles ---
    const pageContainerStyles = "min-h-screen p-6 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 transition-colors duration-300";
    const breadcrumbLinkStyles = "text-blue-600 hover:underline dark:text-blue-400";
    const breadcrumbCurrentPageStyles = "text-gray-600 dark:text-gray-400";
    const breadcrumbSeparatorStyles = "before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-gray-500 dark:text-gray-500";
    const projectNameInputStyles = "bg-transparent text-3xl font-bold focus:outline-none flex-grow placeholder-gray-500 text-gray-900 dark:text-white dark:placeholder-gray-400";
    const successButtonStyles = "bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors";
    const totalCostSectionStyles = "mt-10 pt-6 border-t border-gray-300 dark:border-gray-700";
    const totalCostLabelStyles = "text-xl font-semibold text-gray-700 dark:text-gray-200";
    const totalCostValueStyles = "text-3xl font-bold text-green-600 dark:text-green-400 ml-2";

    // Calculate overall total cost for display
    const overallTotalCostForDisplay = (parseFloat(projectPackageCost) || 0) + deliverablesTotalCost;

    return (
        <div className={pageContainerStyles}>
            <ToastContainer theme={typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'} position="top-right" autoClose={3000} />
            
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li><Link href="/dashboard" className={breadcrumbLinkStyles}>Dashboard</Link></li>
                <li className={breadcrumbSeparatorStyles}><span className={breadcrumbCurrentPageStyles}>Create Project</span></li>
            </ul>
            
            <div className="text-left">
                <div className="flex items-center justify-between mb-6">
                    <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Enter Project Name" className={projectNameInputStyles} />
                </div>
            </div>

            <div className="grid gap-8 pt-5">
                <div>
                    {/* --- PASS onDataChange TO EACH CHILD --- */}
                    <Clients 
                        onValidChange={setIsClientsValid} 
                        onDataChange={setClientsData} 
                    />
                    <ProjectDetails 
                        onValidChange={setIsProjectDetailsValid}
                        packageCost={projectPackageCost}
                        onPackageCostChange={setProjectPackageCost}
                        onDataChange={setProjectDetailsData} 
                    />
                </div>
                <div>
                    <Shoots 
                        onValidChange={setIsShootsValid} 
                        onDataChange={setShootsData} 
                    />
                    <Deliverables 
                        onValidChange={setIsDeliverablesValid}
                        onDeliverablesCostChange={setDeliverablesTotalCost}
                        onDataChange={setDeliverablesData} 
                    />
                    <ReceivedAmount 
                        onValidChange={setIsReceivedValid} 
                        onDataChange={setReceivedAmountData} 
                    />
                    <PaymentSchedule 
                        onValidChange={setIsScheduleValid} 
                        onDataChange={setPaymentScheduleData} 
                    />
                </div>
            </div>

            <div className={`${totalCostSectionStyles} flex justify-between items-center`}>
                <div> 
                    <span className={totalCostLabelStyles}>Overall Total:</span>
                    <span className={totalCostValueStyles}>₹{overallTotalCostForDisplay.toLocaleString()}</span>
                </div>
                <button onClick={handleSave} className={successButtonStyles}>Save Project</button>
            </div>
        </div>
    );
}

export default Page;