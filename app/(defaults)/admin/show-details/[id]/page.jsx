'use client';

// --- START: ADDED FOR API INTEGRATION ---
import React, { useState, useEffect, useMemo } from 'react'; // Changed from just 'useState'
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// --- END: ADDED FOR API INTEGRATION ---

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

import {
    CheckCircle,
    UserCircle,
    Camera,
    PackageCheck,
    IndianRupee,
    CreditCard,
    ListChecks,
    FileText,
    Users,
    Clock,
    Award,
    TrendingUp,
    Info,
    ReceiptIndianRupee,
    CalendarClock,
    PlusCircle,
    X,
    Loader2,
    Download,
    Edit,
} from 'lucide-react';

// Import your tab components
import Shoots from '@/components/show-details/Shoot-details';
import DeliverablesDetails from '@/components/show-details/Deliverables-details';
import Expence from '@/components/show-details/Expence';
import { TaskManagementModal } from '@/components/show-details/TaskManagementModal';
import { VoiceNoteRecorder } from '@/components/show-details/VoiceNoteRecorder';

// --- NEW: Helper Component for Status Badge ---
const StatusBadge = ({ status }) => {
    const dotStyles = {
        pending: 'bg-yellow-500',
        ongoing: 'bg-blue-500',
        completed: 'bg-green-500',
        rejected: 'bg-red-500',
    };

    const currentDotStyle = dotStyles[status.toLowerCase()] || dotStyles['Pending'];

    return <span className={`w-3.5 h-3.5 rounded-full ${currentDotStyle} shadow-md ring-2 ring-white dark:ring-slate-900`}></span>;
};

// --- Helper Component for Key-Value Pairs ---
const DetailPairStylish = ({ label, value, children, icon: IconComponent, isCurrency = false, isDate = false, highlight = false, className: customClassName = '' }) => {
    const formatValue = () => {
        if (value === null || value === undefined || value === '') return <span className="italic text-slate-400 dark:text-slate-500">N/A</span>;
        if (isCurrency) return `₹ ${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        if (isDate) {
            try {
                return new Date(value).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });
            } catch (e) {
                return value.toString();
            }
        }
        return value.toString();
    };

    return (
        <div className={`py-2.5 flex items-start group ${customClassName}`}>
            {IconComponent && (
                <IconComponent className={`w-4 h-4 text-slate-400 dark:text-slate-500 mr-3 mt-1 flex-shrink-0 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors`} />
            )}
            <div className="flex-grow">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
                <div
                    className={`
                    text-slate-800 dark:text-slate-100 break-words
                    ${highlight ? 'text-indigo-600 dark:text-indigo-300 font-bold text-lg' : 'text-sm font-medium'}
                `}
                >
                    {children || formatValue()}
                </div>
            </div>
        </div>
    );
};

// --- Helper Component for List Items (Shoots, Deliverables, Payments) ---
const ContentListItem = ({ children, className = '' }) => (
    <div
        className={`
        py-4 border-b border-slate-200 dark:border-slate-700/60 last:border-b-0
        ${className}
    `}
    >
        {children}
    </div>
);

// --- Add Payment Modal Component ---
const AddPaymentModal = ({ isOpen, onClose, currentUser, projectId, fetchProjectData, balanceDue }) => {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const numericAmount = parseFloat(amount);

        if (!amount || !date || isNaN(numericAmount)) {
            toast.error('Please fill in a valid Amount and Date.');
            return;
        }

        if (numericAmount > balanceDue) {
            toast.error(`Amount exceeds balance due (₹${balanceDue.toLocaleString('en-IN')})`);
            return;
        }

        setLoading(true);

        try {
            const token = await currentUser.getIdToken();
            const response = await axios.post(
                `${API_URL}/api/finance/projects/${projectId}/report`,
                {
                    amount: numericAmount,
                    date_received: date,
                    description,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const { url } = response.data;
            toast.success('Bill generated successfully!');
            window.open(url, '_blank');
            fetchProjectData();
            onClose();
        } catch (err) {
            console.error('Failed to generate bill:', err);
            toast.error('Failed to save payment or generate bill.');
        } finally {
            setLoading(false);
        }
    };

    const handleModalContentClick = (e) => e.stopPropagation();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <ToastContainer />

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-md transform transition-all" onClick={handleModalContentClick}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Add New Bill / Payment</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Amount Paid (₹)
                            </label>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="e.g., 10000"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Payment Date
                            </label>
                            <input
                                type="date"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Payment Note / Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                                placeholder="e.g., Advance payment via UPI"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                            ></textarea>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 dark:bg-slate-600 dark:text-slate-200 border border-transparent rounded-md hover:bg-slate-200 dark:hover:bg-slate-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm 
    ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'} 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                    Generating...
                                </span>
                            ) : (
                                'Save Payment'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
// --- Tab Definitions ---
const TABS = {
    OVERVIEW: 'overview',
    SHOOTS: 'shoots',
    DELIVERABLES: 'deliverables',
    EXPENES: 'expenses',
    FINANCIALS: 'financials',
};

// --- Tab Configuration ---
const tabConfig = {
    [TABS.OVERVIEW]: { label: 'Overview', icon: Award },
    [TABS.SHOOTS]: { label: 'Shoots', icon: Camera },
    [TABS.DELIVERABLES]: { label: 'Deliverables', icon: PackageCheck },
    [TABS.EXPENES]: { label: 'Expenses', icon: ListChecks },
    [TABS.FINANCIALS]: { label: 'Financials', icon: IndianRupee },
};

// --- Initial Data with transactions array and NEW projectStatus ---
const initialProjectData = {
    projectStatus: 'Ongoing', // <-- CHANGED to 'Pending' to demonstrate the feature
    projectName: 'Birthday Celebration',
    projectPackageCost: 30000,
    deliverablesAdditionalCost: 4444,
    overallTotalCost: 34447,
    clients: {
        clientDetails: { name: 'Rohan Sharma', phone: '+919999999999', relation: 'Groom', email: 'rohan@example.com' },
        rawPhoneNumberInput: '9999999999',
        currentStep: 'existing_found',
        isPhoneNumberValid: true,
    },
    projectDetails: { eventTitle: "Anika & Rohan's Wedding", eventDate: '2024-12-15', eventType: 'Wedding', city: 'Mumbai', venue: 'Grand Hyatt', packageCost: 30000 },
    shoots: {
        shootList: [
            {
                id: 1748946215149,
                title: 'Haldi Ceremony',
                date: '2024-12-14',
                time: '10:00',
                city: 'Mumbai',
                selectedServices: { 'Candid Photography': 1, 'Traditional Videography': 1 },
                assignments: { 'Candid Photography': [], 'Traditional Videography': [] },
            },
            {
                id: 1748946215150,
                title: 'Wedding Ceremony',
                date: '2024-12-15',
                time: '18:00',
                city: 'Mumbai',
                selectedServices: { 'Candid Photography': 2, 'Cinematic Videography': 1, 'Drone Aerial Shots': 1 },
                assignments: { 'Candid Photography': [], 'Cinematic Videography': [], 'Drone Aerial Shots': [] },
            },
        ],
    },
    deliverables: {
        deliverableItems: [
            {
                id: '04acd7f5-bcfd-4b41-a886-e12573f381a1',
                title: 'Premium Photo Album (30 Pages)',
                isAdditionalCharge: true,
                additionalChargeAmount: 4444,
                date: '2025-01-15',
                assignments: { assigned: [] },
                requiredCount: 1,
            },
            {
                id: 'e224eb05-5a4e-4f22-aba7-f8e064958db8',
                title: 'Online Gallery Access (1 Year)',
                isAdditionalCharge: false,
                additionalChargeAmount: 0,
                date: '2024-12-20',
                assignments: { assigned: [] },
                requiredCount: 1,
            },
            {
                id: 'f335eb06-6b5e-5g33-acb8-f9f175069db9',
                title: 'Cinematic Wedding Film (5-7 mins)',
                isAdditionalCharge: false,
                additionalChargeAmount: 0,
                date: '2025-02-10',
                assignments: { assigned: [] },
                requiredCount: 1,
            },
        ],
        activeCustomBundleTemplates: {},
    },
    receivedAmount: {
        transactions: [{ id: 1, amount: 15000, description: 'Advance Payment', date: '2024-11-01' }],
    },
    paymentSchedule: {
        paymentInstallments: [
            { id: 1748946215177, amount: 10000, description: 'Second Installment (Post-Haldi)', dueDate: '2024-12-16' },
            { id: 1748946215178, amount: 9447, description: 'Final Payment (Before Delivery)', dueDate: '2025-01-10' },
        ],
    },
    expenses: [
        { id: 1, productName: 'Office Supplies', category: 'Stationery', expense: 450.0 },
        { id: 2, productName: 'Marketing Campaign', category: 'Advertising', expense: 2500.0 },
    ],
};

function ProjectReviewPage() {
    const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);

    // --- START: ADDED/MODIFIED FOR API INTEGRATION ---
    const [fullProjectData, setFullProjectData] = useState(null); // Changed to null
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [currentDeliverable, setCurrentDeliverable] = useState(null);
    const [isVoiceNoteModalOpen, setIsVoiceNoteModalOpen] = useState(false);
    const [taskForVoiceNote, setTaskForVoiceNote] = useState(null);
    const [isGeneratingQuote, setIsGeneratingQuote] = useState(false); // For loading state on the button
    const [isGenerating, setIsGenerating] = useState(false);
    const [isFullPaidToggled, setIsFullPaidToggled] = useState(false); // <-- ADD THIS
    const [isGeneratingFullPaid, setIsGeneratingFullPaid] = useState(false); // <-- AND ADD THIS
    const [processingPaymentId, setProcessingPaymentId] = useState(null);
    // const [quotations, setQuotations] = useState([]); // To store a list of generated quotes

    const params = useParams();
    const projectId = params.id;
    const { currentUser } = useAuth();
    const router = useRouter();

    const fetchProjectData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = await currentUser.getIdToken();
            const response = await axios.get(`${API_URL}/api/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFullProjectData(response.data);
            console.log('Fetched project data:', response.data);
        } catch (err) {
            console.error('Failed to fetch project data:', err);
            setError('Could not load project details. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!projectId || !currentUser) {
            setIsLoading(false);
            return;
        }

        fetchProjectData();
    }, [projectId, currentUser]);

    // --- END: ADDED/MODIFIED FOR API INTEGRATION ---

    const handleManageTasks = (deliverable) => {
        setCurrentDeliverable(deliverable);
        setIsTaskModalOpen(true);
    };
    const handleEditProject = () => {
        router.push(`/admin/gopo?projectId=${projectId}`);
    };
    console.log("EDIT", handleEditProject);

    // --- NEW: Handler to create a task via API ---
    // File: ProjectReviewPage.jsx

    // --- START: COMPLETE TASK HANDLER FUNCTIONS ---

    // --- START: ADD THE NEW HANDLER for generating a quote ---
    const handleGenerateQuotation = async () => {
        if (!projectId || !currentUser) return;

        setIsGeneratingQuote(true);
        try {
            const token = await currentUser.getIdToken();
            const response = await axios.post(
                `${API_URL}/api/projects/${projectId}/quotations`,
                {}, // POST request with an empty body
                { headers: { Authorization: `Bearer ${token}` } },
            );

            const newQuote = response.data;
            alert(`Quotation (Version ${newQuote.version}) generated successfully!`);
            window.open(newQuote.url, '_blank');

            // Update the main state object with the new quotation
            setFullProjectData((prevData) => ({
                ...prevData,
                quotations: [...(prevData.quotations || []), newQuote],
            }));
        } catch (err) {
            console.error('Failed to generate quotation:', err);
            alert('Error: Could not generate the quotation. Please check the server logs.');
        } finally {
            setIsGeneratingQuote(false);
        }
    };

    const handleTaskVoiceNote = (task) => {
        setTaskForVoiceNote(task);
        setIsVoiceNoteModalOpen(true);
    };

    /**
     * This function is passed to the VoiceNoteRecorder. It handles the actual upload and DB update.
     */
    const handleUploadVoiceNote = async (audioBlob) => {
        if (!currentUser || !taskForVoiceNote) return;
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'voicenote.webm');
            formData.append('uploadType', 'voice-notes');

            const token = await currentUser.getIdToken();

            // 1. Upload the file to your server
            const uploadResponse = await axios.post(`${API_URL}/api/uploads`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
            });
            const { url: voice_note_url } = uploadResponse.data;

            // 2. Update the task with the new URL
            await handleTaskUpdate(taskForVoiceNote.id, { voice_note_url });

            // 3. (Optional but good UX) Update local state immediately
            setFullProjectData((prevData) => ({
                ...prevData,
                tasks: prevData.tasks.map((t) => (t.id === taskForVoiceNote.id ? { ...t, voice_note_url } : t)),
            }));
        } catch (err) {
            console.error('Voice note upload failed:', err);
            alert('Error: Could not upload voice note.');
        }
    };

    /**
     * Creates a new task via the API and optimistically updates the local state.
     * @param {object} taskData - The data for the new task (e.g., { title, deliverable_id }).
     */
    const handleTaskCreate = async (taskData) => {
        if (!currentUser || !projectId) return alert('Cannot create task: Missing user or project context.');

        // Optimistic UI Update: Add the new task to the state immediately for a fast UX.
        // We create a temporary ID for the React key and mark it as 'syncing'.
        const tempId = `temp_${Date.now()}`;
        const newTaskOptimistic = {
            ...taskData,
            id: tempId,
            status: 'to_do',
            assignments: [],
            isSyncing: true, // A flag to show it's being saved
        };
        setFullProjectData((prevData) => ({
            ...prevData,
            tasks: [...(prevData.tasks || []), newTaskOptimistic],
        }));

        try {
            const token = await currentUser.getIdToken();
            const response = await axios.post(`${API_URL}/api/tasks`, taskData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const savedTask = response.data;

            // Final UI Update: Replace the temporary task with the real one from the server.
            setFullProjectData((prevData) => ({
                ...prevData,
                tasks: prevData.tasks.map((task) => (task.id === tempId ? { ...savedTask, assignments: [] } : task)),
            }));
        } catch (err) {
            console.error('Failed to create task:', err);
            alert('Error: Could not save the new task. Please try again.');
            // Rollback: If the API call fails, remove the temporary task from the UI.
            setFullProjectData((prevData) => ({
                ...prevData,
                tasks: prevData.tasks.filter((task) => task.id !== tempId),
            }));
        }
    };

    /**
     * Updates an existing task's details (e.g., title, status) via the API.
     * @param {string} taskId - The UUID of the task to update.
     * @param {object} updateData - The fields to update (e.g., { status: 'completed' }).
     */
    const handleTaskUpdate = async (taskId, updateData) => {
        if (!currentUser) return alert('Cannot update task: Missing user context.');

        // Store the original tasks in case we need to revert
        const originalTasks = fullProjectData.tasks;

        // Optimistic UI Update: Apply the change immediately.
        setFullProjectData((prevData) => ({
            ...prevData,
            tasks: prevData.tasks.map((task) => (task.id === taskId ? { ...task, ...updateData } : task)),
        }));

        try {
            const token = await currentUser.getIdToken();
            await axios.put(`${API_URL}/api/tasks/${taskId}`, updateData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // If successful, the optimistic update is now confirmed. No further action needed.
        } catch (err) {
            console.error('Failed to update task:', err);
            alert('Error: Could not save task updates. Reverting changes.');
            // Rollback: If the API call fails, revert to the original state.
            setFullProjectData((prevData) => ({
                ...prevData,
                tasks: originalTasks,
            }));
        }
    };

    /**
     * Deletes a task via the API.
     * @param {string} taskId - The UUID of the task to delete.
     */
    const handleTaskDelete = async (taskId) => {
        if (!currentUser) return alert('Cannot delete task: Missing user context.');

        // Store the original tasks in case we need to revert
        const originalTasks = fullProjectData.tasks;

        // Optimistic UI Update: Remove the task from the list immediately.
        setFullProjectData((prevData) => ({
            ...prevData,
            tasks: prevData.tasks.filter((task) => task.id !== taskId),
        }));

        try {
            const token = await currentUser.getIdToken();
            await axios.delete(`${API_URL}/api/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // If successful, the optimistic deletion is confirmed.
        } catch (err) {
            console.error('Failed to delete task:', err);
            alert('Error: Could not delete the task. Reverting changes.');
            // Rollback: If the API call fails, restore the task list.
            setFullProjectData((prevData) => ({
                ...prevData,
                tasks: originalTasks,
            }));
        }
    };

    /**
     * Updates the assignees for a specific task via the API.
     * @param {string} taskId - The UUID of the task.
     * @param {string[]} assigneeIds - An array of employee firebase_uids to be assigned.
     */
    const handleTaskAssign = async (taskId, assigneeIds) => {
        if (!currentUser) return alert('Cannot assign task: Missing user context.');

        const originalTasks = fullProjectData.tasks;

        // Optimistic UI Update: Find the names from the IDs and update the local state.
        const assigneeNames = assigneeIds.map((id) => fullProjectData.teamMembers.find((m) => m.id === id)?.name).filter(Boolean); // Filter out any nulls if a member isn't found

        setFullProjectData((prevData) => ({
            ...prevData,
            tasks: prevData.tasks.map((task) => (task.id === taskId ? { ...task, assignments: assigneeNames } : task)),
        }));

        try {
            const token = await currentUser.getIdToken();
            await axios.put(
                `${API_URL}/api/tasks/${taskId}/assignees`,
                { assigneeIds },
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            // If successful, the optimistic update is confirmed.
        } catch (err) {
            console.error('Failed to update assignees:', err);
            alert('Error: Could not save assignee changes. Reverting changes.');
            // Rollback: If the API call fails, restore the original task list.
            setFullProjectData((prevData) => ({
                ...prevData,
                tasks: originalTasks,
            }));
        }
    };

    // --- END: COMPLETE TASK HANDLER FUNCTIONS ---

    // --- State Update Handlers ---

    // const handleAddPayment = (newTransaction) => {
    //     setFullProjectData(prev => {
    //         const existingTransactions = prev.receivedAmount?.transactions || [];
    //         return {
    //             ...prev,
    //             receivedAmount: {
    //                 ...prev.receivedAmount,
    //                 transactions: [...existingTransactions, { ...newTransaction, id: Date.now() }]
    //             }
    //         };
    //     });
    //     setIsAddPaymentModalOpen(false);
    // };

    // --- START: NEW, API-CONNECTED SHOOT ASSIGNMENT HANDLER ---
    const handleUpdateShootAssignment = async (shootId, serviceName, assigneeIds) => {
        if (!currentUser) return alert('Cannot update assignment: Missing user context.');

        const originalShoots = fullProjectData.shoots.shootList;

        // Optimistic UI Update
        const assigneeObjects = assigneeIds.map((id) => {
            const member = fullProjectData.teamMembers.find((m) => m.id === id);
            return { id, name: member ? member.name : 'Unknown' };
        });

        setFullProjectData((prevData) => {
            const updatedShootList = prevData.shoots.shootList.map((shoot) => {
                if (shoot.id === shootId) {
                    const newAssignments = { ...shoot.assignments, [serviceName]: assigneeObjects };
                    return { ...shoot, assignments: newAssignments };
                }
                return shoot;
            });
            return { ...prevData, shoots: { ...prevData.shoots, shootList: updatedShootList } };
        });

        try {
            const token = await currentUser.getIdToken();
            await axios.put(`${API_URL}/api/shoots/${shootId}/assignments`, { serviceName, assigneeIds }, { headers: { Authorization: `Bearer ${token}` } });
            // Success! The optimistic update is now confirmed.
        } catch (err) {
            console.error('Failed to update shoot assignment:', err);
            alert('Error: Could not save shoot assignment. Reverting changes.');
            // Rollback on failure
            setFullProjectData((prevData) => ({
                ...prevData,
                shoots: { ...prevData.shoots, shootList: originalShoots },
            }));
        }
    };

    const handleUpdateDeliverableAssignment = (deliverableId, assignedPersonNamesArray) => {
        setFullProjectData((prevData) => {
            const updatedDeliverableItems = prevData.deliverables.deliverableItems.map((item) => {
                if (item.id === deliverableId) {
                    return {
                        ...item,
                        assignments: {
                            ...(item.assignments || {}),
                            assigned: assignedPersonNamesArray,
                        },
                    };
                }
                return item;
            });
            return {
                ...prevData,
                deliverables: {
                    ...prevData.deliverables,
                    deliverableItems: updatedDeliverableItems,
                },
            };
        });
    };

    const handleAddPayment = async (newTransaction) => {
        if (!currentUser || !projectId) return;
        const tempId = `temp_${Date.now()}`;
        const optimisticPayment = { ...newTransaction, id: tempId };

        setFullProjectData((prev) => ({
            ...prev,
            receivedAmount: {
                transactions: [...(prev.receivedAmount?.transactions || []), optimisticPayment],
            },
        }));
        setIsAddPaymentModalOpen(false);

        try {
            const token = await currentUser.getIdToken();
            const response = await axios.post(`${API_URL}/api/projects/${projectId}/payments`, newTransaction, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const savedPayment = response.data;
            setFullProjectData((prev) => ({
                ...prev,
                receivedAmount: {
                    transactions: prev.receivedAmount.transactions.map((t) => (t.id === tempId ? savedPayment : t)),
                },
            }));
        } catch (err) {
            console.error('Failed to add payment:', err);
            alert('Error: Could not save payment.');
            // Rollback
            setFullProjectData((prev) => ({
                ...prev,
                receivedAmount: {
                    transactions: prev.receivedAmount.transactions.filter((t) => t.id !== tempId),
                },
            }));
        }
    };

    const handleAddExpense = async (formData) => {
        if (!currentUser || !projectId) return;
        // We need to add a date to the form data for the backend
        const expenseData = { ...formData, date: new Date().toISOString().split('T')[0] };
        const tempId = `temp_${Date.now()}`;
        const optimisticExpense = { ...expenseData, id: tempId, expense: parseFloat(expenseData.expense) };

        setFullProjectData((prev) => ({ ...prev, expenses: [...(prev.expenses || []), optimisticExpense] }));

        try {
            const token = await currentUser.getIdToken();
            const response = await axios.post(`${API_URL}/api/projects/${projectId}/expenses`, expenseData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const savedExpense = response.data;
            // The backend returns a full object, map it to the frontend's expected structure
            const finalExpense = { id: savedExpense.id, productName: savedExpense.description, category: savedExpense.category, expense: parseFloat(savedExpense.amount) };
            setFullProjectData((prev) => ({
                ...prev,
                expenses: prev.expenses.map((e) => (e.id === tempId ? finalExpense : e)),
            }));
        } catch (err) {
            console.error('Failed to add expense:', err);
            alert('Error: Could not save expense.');
            // Rollback
            setFullProjectData((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => e.id !== tempId) }));
        }
    };

    const handleUpdateExpense = async (updatedExpense) => {
        const tempId = `temp_${Date.now()}`;
        const optimisticExpense = { ...updatedExpense, id: tempId };
        setFullProjectData((prev) => ({ ...prev, expenses: prev.expenses.map((e) => (e.id === updatedExpense.id ? optimisticExpense : e)) }));

        try {
            const token = await currentUser.getIdToken();
            const response = await axios.put(`${API_URL}/api/projects/${projectId}/expenses/${updatedExpense.id}`, updatedExpense, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const savedExpense = response.data;
            // The backend returns a full object, map it to the frontend's expected structure
            const finalExpense = { id: savedExpense.id, productName: savedExpense.description, category: savedExpense.category, expense: parseFloat(savedExpense.amount) };
            setFullProjectData((prev) => ({
                ...prev,
                expenses: prev.expenses.map((e) => (e.id === tempId ? finalExpense : e)),
            }));
        } catch (err) {
            console.error('Failed to update expense:', err);
            alert('Error: Could not save expense.');
            // Rollback
            setFullProjectData((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => e.id !== tempId) }));
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        setFullProjectData((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => e.id !== expenseId) }));

        try {
            const token = await currentUser.getIdToken();
            await axios.delete(`${API_URL}/api/projects/${projectId}/expenses/${expenseId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) {
            console.error('Failed to delete expense:', err);
            alert('Error: Could not delete expense.');
            // Rollback
            setFullProjectData((prev) => ({ ...prev, expenses: [...prev.expenses, { id: expenseId }] }));
        }
    };

    // --- NEW: Handler for status change ---
    const handleStatusChange = async (newStatus) => {
        if (!currentUser || !projectId) return;

        const originalStatus = fullProjectData.projectStatus;

        // Optimistic UI Update
        setFullProjectData((prevData) => ({
            ...prevData,
            projectStatus: newStatus,
        }));

        // Guide user to the next step after approval
        if (newStatus === 'ongoing') {
            setActiveTab(TABS.SHOOTS);
            alert('Project approved and is now Ongoing.');
        } else if (newStatus === 'completed') {
            alert('Project has been marked as Completed.');
        }

        try {
            const token = await currentUser.getIdToken();
            await axios.put(`${API_URL}/api/projects/${projectId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
            // If successful, the change is saved.
        } catch (err) {
            console.error('Failed to update project status:', err);
            alert(`Error: Could not update status. Reverting.`);
            // Rollback on failure
            setFullProjectData((prevData) => ({
                ...prevData,
                projectStatus: originalStatus,
            }));
        }
    };

    const handleMarkAsPaid = async (paymentId) => {
        if (!currentUser) return;

        setProcessingPaymentId(paymentId); // Set loading state for this specific row

        try {
            const token = await currentUser.getIdToken();
            const response = await axios.put(
                `${API_URL}/api/finance/payments/${paymentId}/mark-as-paid`,
                {}, // No body needed, ID is in URL
                { headers: { Authorization: `Bearer ${token}` } },
            );

            const { updatedPayment } = response.data;

            // Update the main state to reflect the change immediately
            setFullProjectData((prev) => ({
                ...prev,
                receivedAmount: {
                    transactions: prev.receivedAmount.transactions.map((t) => (t.id === paymentId ? updatedPayment : t)),
                },
            }));

            // Open the newly generated bill
            window.open(updatedPayment.file_url, '_blank');
        } catch (err) {
            console.error('Failed to mark payment as paid:', err);
            alert('Error: Could not mark the payment as paid. Please try again.');
        } finally {
            setProcessingPaymentId(null); // Clear loading state
        }
    };

    // --- START: CORRECTED useMemo HOOKS ---
    const eligibleShootTeam = useMemo(() => {
        if (!fullProjectData?.teamMembers) return [];
        // RULE: Show members who have at least ONE role with code = 1 (On-Production)
        return fullProjectData.teamMembers.filter((member) => member.roles.some((role) => role.code === 1));
    }, [fullProjectData?.teamMembers]);

    const eligibleDeliverableTeam = useMemo(() => {
        if (!fullProjectData?.teamMembers) return [];
        // RULE: Show members who have at least ONE role with code = 2 (Post-Production)
        // We'll also add pre-production (code 3) for future-proofing
        return fullProjectData.teamMembers.filter((member) => member.roles.some((role) => role.code === 2 || role.code === 3));
    }, [fullProjectData?.teamMembers]);

    // --- Page Styles ---
    const pageContainerStyles = 'min-h-screen p-4 sm:p-6 lg:p-8 bg-transparent dark:bg-slate-900';
    const mainContentWrapperStyles = 'max-w-6xl mx-auto bg-transparent shadow-none rounded-2xl';
    const filterTabsContainerStyles = 'inline-flex gap-2 items-center bg-slate-100/80 dark:bg-slate-700/60 p-2 rounded-2xl shadow-inner sticky top-4 backdrop-blur-sm overflow-x-auto';
    const tabButtonBaseStyles =
        'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transform hover:-translate-y-0.5 hover:shadow-md';
    const inactiveTabStyles = 'bg-slate-200/70 hover:bg-slate-300/70 dark:bg-slate-600/50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 focus:ring-indigo-300 dark:focus:ring-indigo-600';
    const activeTabStyles = 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg focus:ring-purple-500 dark:from-indigo-500 dark:to-purple-500';
    const sectionTitleStyles = 'text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center';
    const subSectionSeparator = 'pt-6 mt-6 border-t border-slate-200 dark:border-slate-700/60';
    // Add this line
    const disabledTabStyles = 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed transform-none hover:shadow-none';

    // --- START: ADDED FOR API INTEGRATION ---
    if (isLoading) {
        return (
            <div className={pageContainerStyles}>
                <div className="flex justify-center items-center h-screen">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    <p className="ml-4 text-xl text-slate-600 dark:text-slate-300">Loading Project...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={pageContainerStyles}>
                <div className="text-center mt-20 p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">An Error Occurred</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">{error}</p>
                </div>
            </div>
        );
    }
    // --- END: ADDED FOR API INTEGRATION ---

    if (!fullProjectData) {
        return (
            <div className={pageContainerStyles}>
                <p className="text-center text-xl text-slate-600 dark:text-slate-300 ">Project not found.</p>
            </div>
        );
    }
    const isPending = fullProjectData.projectStatus === 'pending';
    const isInteractionDisabled = fullProjectData.projectStatus !== 'ongoing';
    const isReadOnly = fullProjectData.projectStatus !== 'ongoing';

    const { clients, projectDetails, shoots: shootsObject, deliverables, receivedAmount, paymentSchedule, quotations } = fullProjectData;

    const totalReceived = receivedAmount?.transactions?.reduce((sum, tx) => (tx.type === 'received' ? sum + (tx.amount || 0) : sum), 0) || 0;

    const totalCost = Number(fullProjectData?.overallTotalCost || 0);
    const balanceDue = totalCost - totalReceived;

    const fullRenderTabContent = () => {
        if (isPending && activeTab !== TABS.OVERVIEW) {
            return (
                <div className="text-center py-10">
                    <p className="text-slate-500 dark:text-slate-400">This section is not available for pending projects.</p>
                    <p className="font-medium text-slate-600 dark:text-slate-300 mt-1">Please approve the project to proceed.</p>
                </div>
            );
        }
        switch (activeTab) {
            case TABS.OVERVIEW:
                return (
                    <div>
                        {/* Project & Client Info Section */}
                        <div>
                            <h3 className={sectionTitleStyles}>
                                <Info className="w-5 h-5 mr-2.5 text-indigo-500" />
                                Project & Client Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                                <DetailPairStylish label="Client Name" value={clients?.clientDetails?.name} icon={UserCircle} highlight />
                                <DetailPairStylish label="Phone Number" value={clients?.clientDetails?.phone} icon={Clock} />
                                <DetailPairStylish label="Relation" value={clients?.clientDetails?.relation} icon={Users} />
                                <DetailPairStylish label="Total Shoots" value={shootsObject?.shootList?.length || 0} icon={Camera} />
                                <DetailPairStylish label="Email Address" value={clients?.clientDetails?.email} icon={FileText} customClassName="lg:col-span-2" />
                            </div>
                        </div>

                        {/* Quick Financials Section */}
                        <div className={subSectionSeparator}>
                            <h3 className={sectionTitleStyles}>
                                <IndianRupee className="w-5 h-5 mr-2.5 text-indigo-500" />
                                Quick Financials
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                <DetailPairStylish label="Package Cost" value={fullProjectData.projectPackageCost} isCurrency icon={PackageCheck} />
                                <DetailPairStylish label="Additional Costs" value={fullProjectData.deliverablesAdditionalCost} isCurrency icon={ListChecks} />
                                <DetailPairStylish label="Amount Received" value={totalReceived} isCurrency icon={TrendingUp} />
                                <DetailPairStylish label="Balance Due" value={fullProjectData.overallTotalCost - totalReceived} isCurrency icon={ReceiptIndianRupee} highlight />
                            </div>
                        </div>

                        <div className={subSectionSeparator}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className={sectionTitleStyles}>
                                    <FileText className="w-5 h-5 mr-2.5 text-indigo-500" />
                                    Quotations
                                </h3>
                                <button
                                    onClick={handleGenerateQuotation}
                                    disabled={isGeneratingQuote}
                                    className="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-400 disabled:cursor-not-allowed"
                                >
                                    {isGeneratingQuote ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <PlusCircle size={16} className="mr-1.5" />
                                            Generate New Quote
                                        </>
                                    )}
                                </button>
                            </div>

                            {quotations.length > 0 ? (
                                <ul className="space-y-2">
                                    {quotations.map((quote) => (
                                        <li
                                            key={quote.id || quote.version}
                                            className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                                        >
                                            <div>
                                                <p className="font-medium text-slate-700 dark:text-slate-200">Quotation - Version {quote.version}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    Generated on: {new Date(quote.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <a
                                                href={quote.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline hover:text-indigo-800 dark:hover:text-indigo-300"
                                            >
                                                <Download size={16} /> View PDF
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-8 px-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                                    <FileText size={40} className="mx-auto text-slate-400 dark:text-slate-500" />
                                    <p className="mt-2 font-medium text-slate-600 dark:text-slate-300">No Quotations Generated</p>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Click the button to create the first version.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case TABS.SHOOTS:
                return (
                    <Shoots
                        shoots={shootsObject.shootList}
                        isReadOnly={isReadOnly}
                        eligibleTeamMembers={eligibleShootTeam || []} // <-- ADD THIS PROP
                        sectionTitleStyles={sectionTitleStyles}
                        DetailPairStylishComponent={DetailPairStylish}
                        ContentListItemComponent={ContentListItem}
                        onUpdateShootAssignment={handleUpdateShootAssignment}
                    />
                );
            case TABS.DELIVERABLES:
                return (
                    <DeliverablesDetails
                        isReadOnly={isReadOnly}
                        deliverables={fullProjectData.deliverables.deliverableItems}
                        tasks={fullProjectData.tasks || []}
                        sectionTitleStyles={sectionTitleStyles}
                        onManageTasks={handleManageTasks} // <-- Pass the handler down
                    />
                );

            case TABS.EXPENES:
                return (
                    <Expence
                        isReadOnly={isReadOnly}
                        expenses={fullProjectData.expenses || []}
                        onAddExpense={handleAddExpense}
                        onUpdateExpense={handleUpdateExpense}
                        onDeleteExpense={handleDeleteExpense}
                        sectionTitleStyles={sectionTitleStyles}
                    />
                );
            case TABS.FINANCIALS:
                return (
                    <div>
                        {/* Cost Breakdown Section */}
                        <h3 className={sectionTitleStyles}>
                            <ReceiptIndianRupee className="w-5 h-5 mr-2.5 text-indigo-500" />
                            Financial Breakdown
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
                            <DetailPairStylish label="Base Package Cost" value={fullProjectData.projectPackageCost} isCurrency icon={PackageCheck} />
                            <DetailPairStylish label="Additional Deliverables Cost" value={fullProjectData.deliverablesAdditionalCost} isCurrency icon={ListChecks} />
                            <DetailPairStylish label="Total Project Cost" value={fullProjectData.overallTotalCost} isCurrency highlight icon={IndianRupee} />
                        </div>

                        {/* Amount Received Section */}
                        <div className={subSectionSeparator}>
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center">
                                    <TrendingUp size={18} className="mr-2 text-green-500" />
                                    Amount Received
                                </h4>
                                <button
                                    onClick={() => setIsAddPaymentModalOpen(true)}
                                    disabled={isReadOnly}
                                    className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400"
                                >
                                    <PlusCircle size={16} className="mr-1.5" />
                                    New Bill
                                </button>
                            </div>
                            <div className="overflow-x-auto bg-slate-50/50 dark:bg-slate-800/20 rounded-lg border border-slate-200 dark:border-slate-700">
                                <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                                    <thead className="text-xs text-slate-700 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-700/50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3">
                                                Amount Paid
                                            </th>
                                            <th scope="col" className="px-4 py-3">
                                                Payment Date
                                            </th>
                                            <th scope="col" className="px-4 py-3">
                                                Payment Note
                                            </th>
                                            <th scope="col" className="px-4 py-3">
                                                Invoice
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-center">
                                                Status
                                            </th>{' '}
                                            {/* New Column */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...(receivedAmount?.transactions || [])].map((tx) => {
                                            const isProcessing = processingPaymentId === tx.id;
                                            const isPaid = tx.status === 'paid';

                                            return (
                                                <tr key={tx.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/40">
                                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">₹ {Number(tx.amount).toLocaleString('en-IN')}</td>
                                                    <td className="px-4 py-3">
                                                        {tx.date_received
                                                            ? new Date(tx.date_received).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                                                            : 'Not Received'}
                                                    </td>
                                                    <td className="px-4 py-3">{tx.description || <span className="italic text-slate-400">No note</span>}</td>
                                                    <td className="px-4 py-3">
                                                        {tx.file_url ? (
                                                            <a
                                                                href={tx.file_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                                                            >
                                                                <Download size={14} /> View Bill
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-400 italic">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {isProcessing ? (
                                                            <div className="flex justify-center items-center">
                                                                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                                                            </div>
                                                        ) : isPaid ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-300 rounded-full">
                                                                <CheckCircle size={14} /> Paid
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleMarkAsPaid(tx.id)}
                                                                disabled={isReadOnly || !tx.file_url}
                                                                className="px-3 py-1 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title={!tx.file_url ? 'Generate a bill first' : 'Mark as Paid'}
                                                            >
                                                                Mark as Paid
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payment Schedule Section */}
                        {paymentSchedule?.paymentInstallments?.length > 0 && (
                            <div className={subSectionSeparator}>
                                <h3 className={sectionTitleStyles}>
                                    <CreditCard className="w-5 h-5 mr-2.5 text-indigo-500" />
                                    Payment Installment Plan
                                </h3>
                                <div>
                                    {paymentSchedule.paymentInstallments.map((installment, index) => (
                                        <ContentListItem key={installment.id || index}>
                                            <div className="flex justify-between items-start">
                                                <p className="text-md font-medium text-slate-800 dark:text-slate-100 flex-grow pr-2">{installment.description || `Installment ${index + 2}`}</p>
                                                <p className="text-md font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{`₹ ${Number(installment.amount).toLocaleString('en-IN')}`}</p>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center">
                                                <CalendarClock size={12} className="mr-1.5" /> Due:{' '}
                                                {installment.due_date ? new Date(installment.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                            </p>
                                        </ContentListItem>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Final Balance Section */}
                        {/* --- START: MODIFIED Final Balance Section --- */}

                        {/* Final Balance Section */}
                        <div className="mt-6 pt-6 border-t-2 border-indigo-500 dark:border-indigo-400">
                            <DetailPairStylish label="Final Balance Due" value={fullProjectData.overallTotalCost - totalReceived} isCurrency highlight icon={ReceiptIndianRupee} />
                        </div>
                        {/* <button onClick={handleGenerateFinancePDF} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
                            Generate Financial Report
                        </button> */}
                    </div>
                );
            default:
                return <p className="text-slate-500 dark:text-slate-400 p-2">Select a tab to view details.</p>;
        }
    };

    return (
        // The single, top-level fragment that wraps everything. This fixes the error.
        <>
            {/*
          MODALS:
          These are now conditionally mounted. They will only exist in the DOM if the project is NOT read-only.
          This is a clean way to prevent any interaction when the project is pending, completed, or rejected.
        */}
            {!isReadOnly && (
                <>
                    <AddPaymentModal
                        isOpen={isAddPaymentModalOpen}
                        onClose={() => setIsAddPaymentModalOpen(false)}
                        currentUser={currentUser}
                        projectId={projectId}
                        fetchProjectData={fetchProjectData}
                        balanceDue={totalCost - totalReceived}
                    />

                    {currentDeliverable && (
                        <TaskManagementModal
                            isOpen={isTaskModalOpen}
                            onClose={() => setIsTaskModalOpen(false)}
                            deliverable={currentDeliverable}
                            initialTasks={(fullProjectData.tasks || []).filter((t) => t.deliverable_id === currentDeliverable.id)}
                            teamMembers={eligibleDeliverableTeam}
                            onTaskCreate={handleTaskCreate}
                            onTaskUpdate={handleTaskUpdate}
                            onTaskDelete={handleTaskDelete}
                            onTaskAssign={handleTaskAssign}
                            onTaskVoiceNote={handleTaskVoiceNote}
                        />
                    )}
                    <VoiceNoteRecorder isOpen={isVoiceNoteModalOpen} onClose={() => setIsVoiceNoteModalOpen(false)} task={taskForVoiceNote} onUpload={handleUploadVoiceNote} />
                </>
            )}

            {/* MAIN PAGE LAYOUT */}
            <div className={pageContainerStyles}>
                <div className={mainContentWrapperStyles}>
                    {/* HEADER SECTION */}
                    <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate-200 dark:border-slate-700/60 rounded-t-2xl">
                        <div className="flex items-center gap-x-4">
                            <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-50">
                                {fullProjectData.projectDetails?.eventTitle || fullProjectData.projectName || 'Project Review'}
                            </h1>
                            {/* Status badge shows the current status */}
                            {fullProjectData.projectStatus && <StatusBadge status={fullProjectData.projectStatus} />}
                        </div>

                        <div className="flex items-center gap-x-2 ml-auto">
                            {fullProjectData.projectDetails?.eventType && (
                                <span className="px-3 py-1 text-xs font-medium rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                                    {fullProjectData.projectDetails.eventType}
                                </span>
                            )}

                            {/* Status Change Buttons: Rendered based on the current project status. */}
                            {fullProjectData.projectStatus === 'pending' && (
                                <button
                                    onClick={() => handleStatusChange('ongoing')}
                                    className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
                                >
                                    Approve Project
                                </button>
                            )}
                            {fullProjectData.projectStatus === 'ongoing' && (
                                <button
                                    onClick={() => handleStatusChange('completed')}
                                    className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md"
                                >
                                    Mark as Complete
                                </button>
                            )}
                            {/* --- NEW EDIT BUTTON --- */}
                            {fullProjectData.projectStatus === 'pending' && (
                                <button
                                    onClick={handleEditProject}
                                    className="flex items-center px-4 py-2 text-sm font-medium bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-md"
                                >
                                    <Edit size={16} className="mr-1.5" />
                                    Edit Project
                                </button>
                            )}
                        </div>
                    </div>

                    {/* CONTENT SECTION */}
                    <div className="p-4 sm:p-6 md:p-8">
                        {/* Banners for different states provide clear user feedback. */}
                        {isPending && (
                            <div className="mb-6 p-4 flex items-center gap-3 text-sm text-yellow-800 bg-yellow-100 rounded-lg dark:text-yellow-300 dark:bg-yellow-900/50">
                                <Info size={18} />
                                <div>
                                    <span className="font-semibold">Action Required:</span> This project is pending approval and is locked.
                                </div>
                            </div>
                        )}
                        {(fullProjectData.projectStatus === 'completed' || fullProjectData.projectStatus === 'rejected') && (
                            <div className="mb-6 p-4 flex items-center gap-3 text-sm text-gray-800 bg-gray-100 rounded-lg dark:text-gray-300 dark:bg-gray-900/50">
                                <Info size={18} />
                                <div>
                                    <span className="font-semibold">Project Archived:</span> This project is {fullProjectData.projectStatus} and is now read-only.
                                </div>
                            </div>
                        )}

                        {/* TABS CONTAINER */}
                        <div className={filterTabsContainerStyles}>
                            {Object.entries(tabConfig).map(([tabKey, { label, icon: Icon }]) => {
                                // Tab buttons are disabled ONLY when the project is pending.
                                const isDisabled = isPending && tabKey !== TABS.OVERVIEW;
                                const buttonClasses = `${tabButtonBaseStyles} ${isDisabled ? disabledTabStyles : activeTab === tabKey ? activeTabStyles : inactiveTabStyles}`;

                                return (
                                    <button key={tabKey} onClick={() => setActiveTab(tabKey)} disabled={isDisabled} className={buttonClasses}>
                                        <Icon size={16} className="mr-2" />
                                        {label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* RENDERED TAB CONTENT */}
                        <div className="mt-8 min-h-[350px]">{fullRenderTabContent()}</div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProjectReviewPage;
