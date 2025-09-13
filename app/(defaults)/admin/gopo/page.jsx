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
import { useRouter, useSearchParams } from 'next/navigation';

const SuccessToast = ({ quoteUrl, newProjectId, onNavigate }) => {
    return (
        <div>
            <p className="font-semibold">Project Created Successfully!</p>
            <p className="text-sm mt-1">What would you like to do next?</p>
            <div className="flex gap-2 mt-3">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold" onClick={() => window.open(quoteUrl, '_blank')}>
                    View Quotation
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold" onClick={onNavigate}>
                    Go to Project
                </button>
            </div>
        </div>
    );
};

function Page() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const router = useRouter();
    const searchParams = useSearchParams(); // <-- Get URL search params
    const projectId = searchParams.get('projectId'); // <-- Get the projectId
    const isEditMode = Boolean(projectId); // <-- Determine if we are in edit mode
    const { currentUser, company, loading } = useAuth();


    const [projectName, setProjectName] = useState('');
    const [projectPackageCost, setProjectPackageCost] = useState(''); // Will hold string from input
    const [deliverablesTotalCost, setDeliverablesTotalCost] = useState(0);

    // --- State to hold data from child components ---
    const [clientsData, setClientsData] = useState(null);
    const [shootsData, setShootsData] = useState(null);
    const [deliverablesData, setDeliverablesData] = useState(null);
    const [receivedAmountData, setReceivedAmountData] = useState(null);
    const [paymentScheduleData, setPaymentScheduleData] = useState(null);

    // Validation states
    const [isClientsValid, setIsClientsValid] = useState(false);
    const [isProjectDetailsValid, setIsProjectDetailsValid] = useState(false);
    const [isShootsValid, setIsShootsValid] = useState(false);
    const [isDeliverablesValid, setIsDeliverablesValid] = useState(false);
    const [isReceivedValid, setIsReceivedValid] = useState(false);
    // const [isScheduleValid, setIsScheduleValid] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(isEditMode);
     const [isScheduleValid, setIsScheduleValid] = useState(false); 

    
    // --- NEW: useEffect to fetch data in Edit Mode ---
    useEffect(() => {
        if (isEditMode && currentUser) {
            const fetchProjectForEdit = async () => {
                setIsLoadingData(true);
                try {
                    const token = await currentUser.getIdToken();
                    const response = await axios.get(`${API_URL}/api/projects/${projectId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const data = response.data;

                    // --- Pre-fill all the states ---
                    setProjectName(data.projectName || '');
                    setProjectPackageCost(data.projectPackageCost?.toString() || '');
                    setDeliverablesTotalCost(data.deliverablesAdditionalCost || 0);

                    // Set data for child components
                    // NOTE: You must ensure your child components can handle this initial data.
                    setClientsData(data.clients);
                    setShootsData(data.shoots);
                    setDeliverablesData(data.deliverables);
                    setReceivedAmountData(data.receivedAmount);
                    setPaymentScheduleData(data.paymentSchedule);
                } catch (error) {
                    console.error('Failed to fetch project for editing:', error);
                    toast.error('Could not load project data for editing.');
                    router.push('/admin/projects'); // Redirect on error
                } finally {
                    setIsLoadingData(false);
                }
            };

            fetchProjectForEdit();
        }
    }, [isEditMode, projectId, currentUser, API_URL, router]);

    // --- NEW: useEffect to Pre-fill Data from a Lead ---
    useEffect(() => {
        // This effect should ONLY run if we are NOT in edit mode.
        if (!isEditMode) {
            const leadName = searchParams.get('lead_name');
            const leadPhone = searchParams.get('lead_phone');
            const leadEmail = searchParams.get('lead_email');
            const leadCost = searchParams.get('lead_cost');
            const leadEventLocation = searchParams.get('lead_event_location');

            // If a lead_name exists in the URL, we assume we're creating from a lead.
            if (leadName) {
                setProjectName(leadName);
            }

            if (leadCost) {
                setProjectPackageCost(leadCost);
            }

            // Pre-fill the client data. This structure must match what the
            // Clients component expects for its `initialData` prop.
            if (leadPhone || leadEmail) {
                const clientInitialData = {
                    clientDetails: {
                        name: leadName || '',
                        phone: leadPhone || '',
                        relation: '', // Default to empty, admin can select
                        email: leadEmail || '',
                    },
                    // These additional fields ensure the child component's UI state is correct
                    rawPhoneNumberInput: leadPhone || '',
                    currentStep: 'existing_found', // This forces the details form to be visible
                    isPhoneNumberValid: true, // Assume valid since it came from a lead
                };
                setClientsData(clientInitialData); // This state is passed as `initialData` to the Clients component
            }

            if(leadEventLocation) {
                const initialShootsData = [{
                id: `shoot-${Date.now()}`, // A temporary unique ID is good practice
                shootName: 'Main Event',     // A sensible default name for the shoot
                date: null,                  // Default to null, admin must pick a date
                startTime: '',               // Default to empty
                endTime: '',                 // Default to empty
                location: leadEventLocation, // Here is where we use the data from the URL!
            }];
            setShootsData(initialShootsData);
            }
        }
        // We only want this to run once when the page loads and params are available.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode]); // Dependency array ensures it runs when these values are determined.


    const handleSave = async () => {
    console.log('🟡 handleSave triggered');
    if (!projectName.trim()) {
        toast.error('Project name cannot be empty.');
        return;
    }

    console.log('🔍 Validation States:', {
        isClientsValid,
        isProjectDetailsValid,
        isShootsValid,
        isDeliverablesValid,
        isReceivedValid,
    });

    if (!currentUser) {
        toast.error('User not authenticated');
        return;
    }

    const validationChecks = [
        { isValid: isClientsValid, name: 'Clients' },
        { isValid: isProjectDetailsValid, name: 'Project Details' },
        { isValid: isShootsValid, name: 'Shoots' },
        { isValid: isDeliverablesValid, name: 'Deliverables' },
        { isValid: isReceivedValid, name: 'Received Amount' },
    ];

    const invalidSections = validationChecks.filter((check) => !check.isValid).map((check) => check.name);

    if (invalidSections.length === 0) {
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
            paymentSchedule: paymentScheduleData,
        };
        console.log('🟡 fullProjectData:', fullProjectData);

        const toastId = toast.loading(isEditMode ? 'Updating project...' : 'Saving project...');

        try {
            const token = await currentUser.getIdToken();

            // --- START: CORE LOGIC FOR CREATE VS. UPDATE ---

            if (isEditMode) {
                // --- ACTION: UPDATE an existing project ---
                await axios.put(`${API_URL}/api/projects/${projectId}`, fullProjectData, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                toast.update(toastId, {
                    render: 'Project Updated Successfully!',
                    type: 'success',
                    isLoading: false,
                    autoClose: 3000,
                });

                // Redirect back to the project details page after a short delay
                setTimeout(() => {
                    router.push(`/admin/show-details/${projectId}`);
                }, 1500);

            } else {
                // --- ACTION: CREATE a new project (Your original logic) ---
                const createProjectResponse = await axios.post(`${API_URL}/api/projects`, fullProjectData, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log('🟡 createProjectResponse:', createProjectResponse);

                if (!createProjectResponse.data.success) {
                    throw new Error('Failed to save the project details.');
                }

                const newProjectId = createProjectResponse.data.project_id;
                toast.update(toastId, { render: 'Generating quotation...', type: 'info' });

                // Automatically Generate the Quotation
                const createQuoteResponse = await axios.post(
                    `${API_URL}/api/projects/${newProjectId}/quotations`,
                    {}, // Empty body
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const quoteUrl = createQuoteResponse.data.url;

                toast.update(toastId, {
                    render: () => (
                        <SuccessToast
                            quoteUrl={quoteUrl}
                            newProjectId={newProjectId}
                            onNavigate={() => {
                                toast.dismiss(toastId);
                                router.push(`/admin/show-details/${newProjectId}`);
                            }}
                        />
                    ),
                    type: 'success',
                    isLoading: false,
                    autoClose: false,
                    closeOnClick: false,
                    closeButton: true,
                });
            }
            // --- END: CORE LOGIC FOR CREATE VS. UPDATE ---

        } catch (err) {
            console.error('❌ Save/Update process failed:', err?.response?.data || err.message);
            toast.update(toastId, {
                render: 'An error occurred. Please try again.',
                type: 'error',
                isLoading: false,
                autoClose: 5000,
            });
        }
    } else {
        toast.error(`Please fill all required sections: ${invalidSections.join(', ')}`);
    }
};


    if (isLoadingData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl">Loading Project Data...</p>
            </div>
        );
    }

    // --- Themed Styles ---
    const pageContainerStyles = 'min-h-screen p-6 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 transition-colors duration-300';
    const breadcrumbLinkStyles = 'text-blue-600 hover:underline dark:text-blue-400';
    const breadcrumbCurrentPageStyles = 'text-gray-600 dark:text-gray-400';
    const breadcrumbSeparatorStyles = "before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-gray-500 dark:text-gray-500";
    const projectNameInputStyles = 'bg-transparent text-3xl font-bold focus:outline-none flex-grow placeholder-gray-500 text-gray-900 dark:text-white dark:placeholder-gray-400';
    const successButtonStyles =
        'bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors';
    const totalCostSectionStyles = 'mt-10 pt-6 border-t border-gray-300 dark:border-gray-700';
    const totalCostLabelStyles = 'text-xl font-semibold text-gray-700 dark:text-gray-200';
    const totalCostValueStyles = 'text-3xl font-bold text-green-600 dark:text-green-400 ml-2';

    // Calculate overall total cost for display
    const overallTotalCostForDisplay = (parseFloat(projectPackageCost) || 0) + deliverablesTotalCost;

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
                    <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Enter Project Name" className={projectNameInputStyles} />
                </div>
            </div>

            <div className="grid gap-8 pt-5">
                <div>
                    {/* --- PASS onDataChange TO EACH CHILD --- */}
                    <Clients company={company} onValidChange={setIsClientsValid} onDataChange={setClientsData} initialData={clientsData} />
                    <ProjectDetails
                        onValidChange={setIsProjectDetailsValid}
                        packageCost={projectPackageCost}
                        onPackageCostChange={setProjectPackageCost}
                        // onDataChange={setProjectDetailsData}
                    />
                </div>
                <div>
                    <Shoots company={company} onValidChange={setIsShootsValid} onDataChange={setShootsData} initialData={shootsData} />
                    <Deliverables company={company} onValidChange={setIsDeliverablesValid} onDeliverablesCostChange={setDeliverablesTotalCost} onDataChange={setDeliverablesData} initialData={deliverablesData} />
                    <ReceivedAmount onValidChange={setIsReceivedValid} onDataChange={setReceivedAmountData} initialData={receivedAmountData} />
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
                 <button onClick={handleSave} className={successButtonStyles}>
                {isEditMode ? 'Update Project' : 'Save Project'}
            </button>
            </div>
        </div>
    );
}

export default Page;
