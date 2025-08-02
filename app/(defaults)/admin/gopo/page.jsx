'use client';
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';

// Ensure these paths are correct for your project structure
import Shoots from '../../../../components/onboarding/Shoots';
import ProjectDetails from '../../../../components/onboarding/ProjectDetails';
import Clients from '../../../../components/onboarding/Clients';
// import PaymentSchedule from '../../../../components/onboarding/PaymentSchedule';
import Deliverables from '../../../../components/onboarding/Deliverables';
import ReceivedAmount from '../../../../components/onboarding/ReceivedAmount';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';


const SuccessToast = ({ quoteUrl, newProjectId, onNavigate }) => {
    return (
        <div>
            <p className="font-semibold">Project Created Successfully!</p>
            <p className="text-sm mt-1">What would you like to do next?</p>
            <div className="flex gap-2 mt-3">
                <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold"
                    onClick={() => window.open(quoteUrl, '_blank')}
                >
                    View Quotation
                </button>
                <button 
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold"
                    onClick={onNavigate}
                >
                    Go to Project
                </button>
            </div>
        </div>
    );
};

function Page() {

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const [projectName, setProjectName] = useState('');
    const [projectPackageCost, setProjectPackageCost] = useState(''); // Will hold string from input
    const [deliverablesTotalCost, setDeliverablesTotalCost] = useState(0);

    const {currentUser, company, loading} = useAuth();

    // --- State to hold data from child components ---
    const [clientsData, setClientsData] = useState(null);
    // const [projectDetailsData, setProjectDetailsData] = useState(null);
    const [shootsData, setShootsData] = useState(null);
    const [deliverablesData, setDeliverablesData] = useState(null);
    const [receivedAmountData, setReceivedAmountData] = useState(null);
    // const [paymentScheduleData, setPaymentScheduleData] = useState(null);

    // Validation states
    const [isClientsValid, setIsClientsValid] = useState(false);
    const [isProjectDetailsValid, setIsProjectDetailsValid] = useState(false);
    const [isShootsValid, setIsShootsValid] = useState(false);
    const [isDeliverablesValid, setIsDeliverablesValid] = useState(false);
    const [isReceivedValid, setIsReceivedValid] = useState(false);
    // const [isScheduleValid, setIsScheduleValid] = useState(false);

    const router = useRouter();
    // const [toastId, setToastId] = useState(null);

const handleSave = async () => {
console.log("🟡 handleSave triggered");
  if (!projectName.trim()) {
    toast.error("Project name cannot be empty.");
    return;
  }

  console.log("🔍 Validation States:", {
  isClientsValid,
  isProjectDetailsValid,
  isShootsValid,
  isDeliverablesValid,
  isReceivedValid,
  // isScheduleValid
});

if (!currentUser) {
  toast.error("User not authenticated");
  return;
}


  const validationChecks = [
    { isValid: isClientsValid, name: "Clients" },
    { isValid: isProjectDetailsValid, name: "Project Details" },
    { isValid: isShootsValid, name: "Shoots" },
    { isValid: isDeliverablesValid, name: "Deliverables" },
    { isValid: isReceivedValid, name: "Received Amount" },
    // { isValid: isScheduleValid, name: "Payment Schedule" },
  ];

  const invalidSections = validationChecks.filter(check => !check.isValid).map(check => check.name);

  if (invalidSections.length === 0) {
        // --- START: MODIFIED LOGIC ---
        const numericPackageCostValue = parseFloat(projectPackageCost) || 0;
        const currentOverallTotalCost = numericPackageCostValue + deliverablesTotalCost;

        const fullProjectData = {
            projectName,
            projectPackageCost: numericPackageCostValue,
            deliverablesAdditionalCost: deliverablesTotalCost,
            overallTotalCost: currentOverallTotalCost,
            clients: clientsData,
            shoots: shootsData,
            deliverables: deliverablesData,
            receivedAmount: receivedAmountData,
        };

        const toastId = toast.loading("Saving project..."); // Show a loading indicator

        try {
            const token = await currentUser.getIdToken();
            
            // --- ACTION 1: Create the Project ---
            const createProjectResponse = await axios.post(`${API_URL}/api/projects`, fullProjectData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!createProjectResponse.data.success) {
                throw new Error("Failed to save the project details.");
            }
            
            const newProjectId = createProjectResponse.data.project_id;
            toast.update(toastId, { render: "Generating quotation...", type: "info" });

            // --- ACTION 2: Automatically Generate the Quotation ---
            const createQuoteResponse = await axios.post(
                `${API_URL}/api/projects/${newProjectId}/quotations`, 
                {}, // Empty body, as the backend fetches the data
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const quoteUrl = createQuoteResponse.data.url;

              toast.update(toastId, { 
                render: () => (
                    <SuccessToast
                        quoteUrl={quoteUrl}
                        newProjectId={newProjectId}
                        onNavigate={() => {
                            // Close the toast programmatically before navigating
                            toast.dismiss(toastId);
                            router.push(`/admin/show-details/${newProjectId}`); // Your correct path
                        }}
                    />
                ),
                type: "success", 
                isLoading: false, 
                autoClose: false, // It will now stay until the user interacts with it
                closeOnClick: false,
                closeButton: true,
            });


        } catch (err) {
            console.error('❌ Save process failed:', err?.response?.data || err.message);
            toast.update(toastId, { render: "An error occurred. Please try again.", type: "error", isLoading: false, autoClose: 5000 });
        }
        // --- END: MODIFIED LOGIC ---
    } else {
        toast.error(`Please fill all required sections: ${invalidSections.join(', ')}`);
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
                        company={company}
                        onValidChange={setIsClientsValid} 
                        onDataChange={setClientsData} 
                    />
                    <ProjectDetails 
                        onValidChange={setIsProjectDetailsValid}
                        packageCost={projectPackageCost}
                        onPackageCostChange={setProjectPackageCost}
                        // onDataChange={setProjectDetailsData} 
                    />
                </div>
                <div>
                    <Shoots 
                        company={company}
                        onValidChange={setIsShootsValid} 
                        onDataChange={setShootsData} 
                    />
                    <Deliverables 
                        company={company}
                        onValidChange={setIsDeliverablesValid}
                        onDeliverablesCostChange={setDeliverablesTotalCost}
                        onDataChange={setDeliverablesData} 
                    />
                    <ReceivedAmount 
                        onValidChange={setIsReceivedValid} 
                        onDataChange={setReceivedAmountData} 
                    />
                    {/* <PaymentSchedule 
                        onValidChange={setIsScheduleValid} 
                        onDataChange={setPaymentScheduleData} 
                    /> */}
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