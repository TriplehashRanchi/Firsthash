'use client';

import React, { useState } from 'react';
import {
    CheckCircle, UserCircle, Camera, PackageCheck, IndianRupee, CreditCard, ListChecks, FileText, Users, Clock, Award, TrendingUp,
    Info, ReceiptIndianRupee, CalendarClock, PlusCircle, X,
    CalendarDays
} from 'lucide-react';

// Import your tab components
import Shoots from '@/components/show-details/Shoot-details';
import DeliverablesDetails from '@/components/show-details/Deliverables-details';
import Expence from '@/components/show-details/Expence';

// --- NEW: Helper Component for Status Badge ---
const StatusBadge = ({ status }) => {
    const dotStyles = {
        'Pending': 'bg-yellow-500',
        'Ongoing': 'bg-green-500',
        'Completed': 'bg-orange-500',
        'Rejected': 'bg-red-500',
    };

    const currentDotStyle = dotStyles[status] || dotStyles['Pending'];

    return (
        <span className={`w-3.5 h-3.5 rounded-full ${currentDotStyle} shadow-md ring-2 ring-white dark:ring-slate-900`}></span>
    );
};



// --- Helper Component for Key-Value Pairs ---
const DetailPairStylish = ({ label, value, children, icon: IconComponent, isCurrency = false, isDate = false, highlight = false, className: customClassName = "" }) => {
    const formatValue = () => {
        if (value === null || value === undefined || value === '') return <span className="italic text-slate-400 dark:text-slate-500">N/A</span>;
        if (isCurrency) return `₹ ${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        if (isDate) {
            try {
                return new Date(value).toLocaleDateString('en-GB', {
                    year: 'numeric', month: 'short', day: 'numeric'
                });
            } catch (e) { return value.toString(); }
        }
        return value.toString();
    };

    return (
        <div className={`py-2.5 flex items-start group ${customClassName}`}>
            {IconComponent && <IconComponent className={`w-4 h-4 text-slate-400 dark:text-slate-500 mr-3 mt-1 flex-shrink-0 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors`} />}
            <div className="flex-grow">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
                <div className={`
                    text-slate-800 dark:text-slate-100 break-words
                    ${highlight ? 'text-indigo-600 dark:text-indigo-300 font-bold text-lg' : 'text-sm font-medium'}
                `}>
                    {children || formatValue()}
                </div>
            </div>
        </div>
    );
};

// --- Helper Component for List Items (Shoots, Deliverables, Payments) ---
const ContentListItem = ({ children, className = "" }) => (
    <div className={`
        py-4 border-b border-slate-200 dark:border-slate-700/60 last:border-b-0
        ${className}
    `}>
        {children}
    </div>
);

// --- Add Payment Modal Component ---
const AddPaymentModal = ({ isOpen, onClose, onSave }) => {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || !date || isNaN(parseFloat(amount))) {
            alert("Please fill in a valid Amount and Date.");
            return;
        }
        onSave({ amount: parseFloat(amount), date, description });
        // Reset form
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
    };

    const handleModalContentClick = (e) => e.stopPropagation();

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-md transform transition-all"
                onClick={handleModalContentClick}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Add New Bill / Payment</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount Paid (₹)</label>
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
                            <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Date</label>
                            <div className="relative">
                                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                                <input
                                    type="date"
                                    id="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Note / Description</label>
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
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 dark:bg-slate-600 dark:text-slate-200 border border-transparent rounded-md hover:bg-slate-200 dark:hover:bg-slate-500">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Save Payment
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
    [TABS.FINANCIALS]: { label: 'Financials', icon: IndianRupee }
};

// --- Initial Data with transactions array and NEW projectStatus ---
const initialProjectData = {
    "projectStatus": "Ongoing", // <-- CHANGED to 'Pending' to demonstrate the feature
    "projectName": "Birthday Celebration",
    "projectPackageCost": 30000,
    "deliverablesAdditionalCost": 4444,
    "overallTotalCost": 34447,
    "clients": { "clientDetails": { "name": "Rohan Sharma", "phone": "+919999999999", "relation": "Groom", "email": "rohan@example.com" }, "rawPhoneNumberInput": "9999999999", "currentStep": "existing_found", "isPhoneNumberValid": true },
    "projectDetails": { "eventTitle": "Anika & Rohan's Wedding", "eventDate": "2024-12-15", "eventType": "Wedding", "city": "Mumbai", "venue": "Grand Hyatt", "packageCost": 30000 },
    "shoots": {
        "shootList": [
            { "id": 1748946215149, "title": "Haldi Ceremony", "date": "2024-12-14", "time": "10:00", "city": "Mumbai", "selectedServices": { "Candid Photography": 1, "Traditional Videography": 1 }, "assignments": { "Candid Photography": [], "Traditional Videography": [] } },
            { "id": 1748946215150, "title": "Wedding Ceremony", "date": "2024-12-15", "time": "18:00", "city": "Mumbai", "selectedServices": { "Candid Photography": 2, "Cinematic Videography": 1, "Drone Aerial Shots": 1 }, "assignments": { "Candid Photography": [], "Cinematic Videography": [], "Drone Aerial Shots": [] } }
        ]
    },
    "deliverables": {
        "deliverableItems": [
            { "id": "04acd7f5-bcfd-4b41-a886-e12573f381a1", "title": "Premium Photo Album (30 Pages)", "isAdditionalCharge": true, "additionalChargeAmount": 4444, "date": "2025-01-15", "assignments": { "assigned": [] }, "requiredCount": 1 },
            { "id": "e224eb05-5a4e-4f22-aba7-f8e064958db8", "title": "Online Gallery Access (1 Year)", "isAdditionalCharge": false, "additionalChargeAmount": 0, "date": "2024-12-20", "assignments": { "assigned": [] }, "requiredCount": 1 },
            { "id": "f335eb06-6b5e-5g33-acb8-f9f175069db9", "title": "Cinematic Wedding Film (5-7 mins)", "isAdditionalCharge": false, "additionalChargeAmount": 0, "date": "2025-02-10", "assignments": { "assigned": [] }, "requiredCount": 1 }
        ],
        "activeCustomBundleTemplates": {}
    },
    "receivedAmount": {
        "transactions": [
            { "id": 1, "amount": 15000, "description": "Advance Payment", "date": "2024-11-01" }
        ]
    },
    "paymentSchedule": { "paymentInstallments": [{ "id": 1748946215177, "amount": 10000, "description": "Second Installment (Post-Haldi)", "dueDate": "2024-12-16" }, { "id": 1748946215178, "amount": 9447, "description": "Final Payment (Before Delivery)", "dueDate": "2025-01-10" }] },
    "expenses": [
        { "id": 1, "productName": "Office Supplies", "category": "Stationery", "expense": 450.00 },
        { "id": 2, "productName": "Marketing Campaign", "category": "Advertising", "expense": 2500.00 }
    ]
};


function ProjectReviewPage() {
    const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
    const [fullProjectData, setFullProjectData] = useState(initialProjectData);
    const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

    // --- State Update Handlers ---

    const handleAddPayment = (newTransaction) => {
        setFullProjectData(prev => {
            const existingTransactions = prev.receivedAmount?.transactions || [];
            return {
                ...prev,
                receivedAmount: {
                    ...prev.receivedAmount,
                    transactions: [...existingTransactions, { ...newTransaction, id: Date.now() }]
                }
            };
        });
        setIsAddPaymentModalOpen(false);
    };

    const handleUpdateShootAssignment = (shootId, serviceName, assignedPersonNamesArray) => {
        setFullProjectData(prevData => {
            const updatedShootList = prevData.shoots.shootList.map(shoot => {
                if (shoot.id === shootId) {
                    return { ...shoot, assignments: { ...(shoot.assignments || {}), [serviceName]: assignedPersonNamesArray } };
                }
                return shoot;
            });
            return { ...prevData, shoots: { ...prevData.shoots, shootList: updatedShootList } };
        });
    };

    const handleUpdateDeliverableAssignment = (deliverableId, assignedPersonNamesArray) => {
        setFullProjectData(prevData => {
            const updatedDeliverableItems = prevData.deliverables.deliverableItems.map(item => {
                if (item.id === deliverableId) {
                    return {
                        ...item,
                        assignments: {
                            ...(item.assignments || {}),
                            assigned: assignedPersonNamesArray
                        }
                    };
                }
                return item;
            });
            return {
                ...prevData,
                deliverables: {
                    ...prevData.deliverables,
                    deliverableItems: updatedDeliverableItems
                }
            };
        });
    };

    const handleAddExpense = (formData) => {
        const newExpense = { ...formData, id: Date.now(), expense: parseFloat(formData.expense) };
        setFullProjectData(prev => ({ ...prev, expenses: [...(prev.expenses || []), newExpense] }));
    };

    const handleUpdateExpense = (updatedExpense) => {
        setFullProjectData(prev => ({ ...prev, expenses: prev.expenses.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp) }));
    };

    const handleDeleteExpense = (expenseId) => {
        setFullProjectData(prev => ({ ...prev, expenses: prev.expenses.filter(exp => exp.id !== expenseId) }));
    };
    
    // --- NEW: Handler for status change ---
    const handleStatusChange = () => {
        const currentStatus = fullProjectData.projectStatus;
        let newStatus = currentStatus;

        if (currentStatus === 'Pending') {
            newStatus = 'Ongoing';
            alert("Project has been approved and is now Ongoing.");
        } else if (currentStatus === 'Ongoing') {
            newStatus = 'Completed';
            alert("Project has been marked as Completed.");
        } else {
            console.log("No status change action for status:", currentStatus);
            return;
        }

        setFullProjectData(prevData => ({
            ...prevData,
            projectStatus: newStatus
        }));
    };


    // --- Page Styles ---
    const pageContainerStyles = "min-h-screen p-4 sm:p-6 lg:p-8 bg-transparent dark:bg-slate-900";
    const mainContentWrapperStyles = "max-w-6xl mx-auto bg-transparent shadow-none rounded-2xl";
    const filterTabsContainerStyles = "inline-flex gap-2 items-center bg-slate-100/80 dark:bg-slate-700/60 p-2 rounded-2xl shadow-inner sticky top-4 backdrop-blur-sm overflow-x-auto";
    const tabButtonBaseStyles = "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transform hover:-translate-y-0.5 hover:shadow-md";
    const inactiveTabStyles = "bg-slate-200/70 hover:bg-slate-300/70 dark:bg-slate-600/50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 focus:ring-indigo-300 dark:focus:ring-indigo-600";
    const activeTabStyles = "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg focus:ring-purple-500 dark:from-indigo-500 dark:to-purple-500";
    const sectionTitleStyles = "text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center";
    const subSectionSeparator = "pt-6 mt-6 border-t border-slate-200 dark:border-slate-700/60";

    if (!fullProjectData) {
        return <div className={pageContainerStyles}><p className="text-center text-xl text-slate-600 dark:text-slate-300 ">Loading project data...</p></div>;
    }

    const { clients, projectDetails, shoots: shootsObject, deliverables, receivedAmount, paymentSchedule } = fullProjectData;
    const totalReceived = receivedAmount?.transactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

    const fullRenderTabContent = () => {
        switch (activeTab) {
            case TABS.OVERVIEW:
                return (
                    <div>
                        {/* Project & Client Info Section */}
                        <div>
                            <h3 className={sectionTitleStyles}><Info className="w-5 h-5 mr-2.5 text-indigo-500" />Project & Client Information</h3>
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
                            <h3 className={sectionTitleStyles}><IndianRupee className="w-5 h-5 mr-2.5 text-indigo-500" />Quick Financials</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                <DetailPairStylish label="Package Cost" value={fullProjectData.projectPackageCost} isCurrency icon={PackageCheck} />
                                <DetailPairStylish label="Additional Costs" value={fullProjectData.deliverablesAdditionalCost} isCurrency icon={ListChecks} />
                                <DetailPairStylish label="Amount Received" value={totalReceived} isCurrency icon={TrendingUp} />
                                <DetailPairStylish label="Balance Due" value={fullProjectData.overallTotalCost - totalReceived} isCurrency icon={ReceiptIndianRupee} highlight />
                            </div>
                        </div>
                    </div>
                );
            case TABS.SHOOTS:
                return <Shoots shoots={shootsObject.shootList} sectionTitleStyles={sectionTitleStyles} DetailPairStylishComponent={DetailPairStylish} ContentListItemComponent={ContentListItem} onUpdateShootAssignment={handleUpdateShootAssignment} />;
            case TABS.DELIVERABLES:
                return <DeliverablesDetails deliverables={deliverables.deliverableItems} sectionTitleStyles={sectionTitleStyles} onUpdateDeliverableAssignment={handleUpdateDeliverableAssignment} />;
            case TABS.EXPENES:
                return <Expence expenses={fullProjectData.expenses || []} onAddExpense={handleAddExpense} onUpdateExpense={handleUpdateExpense} onDeleteExpense={handleDeleteExpense} sectionTitleStyles={sectionTitleStyles} />;
            case TABS.FINANCIALS:
                return (
                    <div>
                        {/* Cost Breakdown Section */}
                        <h3 className={sectionTitleStyles}><ReceiptIndianRupee className="w-5 h-5 mr-2.5 text-indigo-500" />Financial Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
                            <DetailPairStylish label="Base Package Cost" value={fullProjectData.projectPackageCost} isCurrency icon={PackageCheck} />
                            <DetailPairStylish label="Additional Deliverables Cost" value={fullProjectData.deliverablesAdditionalCost} isCurrency icon={ListChecks} />
                            <DetailPairStylish label="Total Project Cost" value={fullProjectData.overallTotalCost} isCurrency highlight icon={IndianRupee} />
                        </div>

                        {/* Amount Received Section */}
                        <div className={subSectionSeparator}>
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center"><TrendingUp size={18} className="mr-2 text-green-500" />Amount Received</h4>
                                <button
                                    onClick={() => setIsAddPaymentModalOpen(true)}
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
                                            <th scope="col" className="px-4 py-3">Amount Paid</th>
                                            <th scope="col" className="px-4 py-3">Payment Date</th>
                                            <th scope="col" className="px-4 py-3">Payment Note</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(receivedAmount?.transactions || []).length > 0 ? (
                                            receivedAmount.transactions.map((tx) => (
                                                <tr key={tx.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/40">
                                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                                        {`₹ ${Number(tx.amount).toLocaleString('en-IN')}`}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {tx.description || <span className="italic text-slate-400">No note</span>}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="text-center py-4 px-4 text-slate-500 italic">No payments have been recorded yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payment Schedule Section */}
                        {paymentSchedule?.paymentInstallments?.length > 0 && (
                            <div className={subSectionSeparator}>
                                <h3 className={sectionTitleStyles}><CreditCard className="w-5 h-5 mr-2.5 text-indigo-500" />Payment Installment Plan</h3>
                                <div>
                                    {paymentSchedule.paymentInstallments.map((installment, index) => (
                                        <ContentListItem key={installment.id || index}>
                                            <div className="flex justify-between items-start">
                                                <p className="text-md font-medium text-slate-800 dark:text-slate-100 flex-grow pr-2">{installment.description || `Installment ${index + 2}`}</p>
                                                <p className="text-md font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{`₹ ${Number(installment.amount).toLocaleString('en-IN')}`}</p>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center">
                                                <CalendarClock size={12} className="mr-1.5" /> Due: {installment.dueDate ? new Date(installment.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                            </p>
                                        </ContentListItem>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Final Balance Section */}
                        <div className="mt-6 pt-6 border-t-2 border-indigo-500 dark:border-indigo-400">
                            <DetailPairStylish label="Final Balance Due" value={fullProjectData.overallTotalCost - totalReceived} isCurrency highlight icon={ReceiptIndianRupee} />
                        </div>
                    </div>
                );
            default:
                return <p className="text-slate-500 dark:text-slate-400 p-2">Select a tab to view details.</p>;
        }
    };


    return (
        <>
            <AddPaymentModal
                isOpen={isAddPaymentModalOpen}
                onClose={() => setIsAddPaymentModalOpen(false)}
                onSave={handleAddPayment}
            />
            <div className={pageContainerStyles}>
                <div className={mainContentWrapperStyles}>
                    <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate-200 dark:border-slate-700/60 rounded-t-2xl">

                        
                        <div className="flex items-center gap-x-2">
                            {fullProjectData.projectStatus && <StatusBadge status={fullProjectData.projectStatus} />}
                            <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-50">
                                {projectDetails?.eventTitle || fullProjectData.projectName || 'Project Review'}
                            </h1>
                        </div>

                        
                        <div className="flex items-center gap-x-2 ml-auto">
                            {projectDetails?.eventType && (
                                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                                    {projectDetails.eventType}
                                </span>
                            )}
                            
                            {fullProjectData.projectStatus === 'Pending' && (
                                <button
                                    onClick={handleStatusChange}
                                    className="px-3 py-1 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-[5px] transition-colors"
                                >
                                    Approve
                                </button>
                            )}
                            {fullProjectData.projectStatus === 'Ongoing' && (
                                <button
                                    onClick={handleStatusChange}
                                    className="px-3 py-1 text-sm font-medium bg-green-500 hover:bg-green-600 text-white rounded-[5px] transition-colors"
                                >
                                    Set Complete
                                </button>
                            )}
                        </div>

                    </div>



                    <div className="p-4 sm:p-6 md:p-8">
                        <div className={filterTabsContainerStyles}>
                            {Object.entries(tabConfig).map(([tabKey, { label, icon: Icon }]) => (
                                <button key={tabKey} onClick={() => setActiveTab(tabKey)} className={`${tabButtonBaseStyles} ${activeTab === tabKey ? activeTabStyles : inactiveTabStyles}`}>
                                    <Icon size={16} className="mr-2" />
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="mt-8 min-h-[350px]">{fullRenderTabContent()}</div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProjectReviewPage;