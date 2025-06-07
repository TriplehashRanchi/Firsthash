// 'use client';

// import React, { useState } from 'react';
// import {
//     CheckCircle, UserCircle, Briefcase, CalendarDays, Camera, PackageCheck,
//     DollarSign, CreditCard, ListChecks, FileText, Users, MapPin, Clock, Tag, Edit3, Award, TrendingUp,
//     Info, CircleDollarSign, Landmark, CalendarClock
// } from 'lucide-react';

// // Import your tab components
// import Shoots from '../../../components/show-details/Shoot-details';
// import DeliverablesDetails from '../../../components/show-details/Deliverables-details';
// import Expence from '../../../components/show-details/Expence';

// // --- Helper Component for Key-Value Pairs ---
// const DetailPairStylish = ({ label, value, children, icon: IconComponent, isCurrency = false, isDate = false, highlight = false, className: customClassName = "" }) => {
//     const formatValue = () => {
//         if (value === null || value === undefined || value === '') return <span className="italic text-slate-400 dark:text-slate-500">N/A</span>;
//         if (isCurrency) return `₹ ${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
//         if (isDate) {
//             try {
//                 return new Date(value).toLocaleDateString('en-GB', {
//                     year: 'numeric', month: 'short', day: 'numeric'
//                 });
//             } catch (e) { return value.toString(); }
//         }
//         return value.toString();
//     };

//     return (
//         <div className={`py-2.5 flex items-start group ${customClassName}`}>
//             {IconComponent && <IconComponent className={`w-4 h-4 text-slate-400 dark:text-slate-500 mr-3 mt-1 flex-shrink-0 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors`} />}
//             <div className="flex-grow">
//                 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
//                 <div className={`
//                     text-slate-800 dark:text-slate-100 break-words
//                     ${highlight ? 'text-indigo-600 dark:text-indigo-300 font-bold text-lg' : 'text-sm font-medium'}
//                 `}>
//                     {children || formatValue()}
//                 </div>
//             </div>
//         </div>
//     );
// };

// // --- Helper Component for List Items (Shoots, Deliverables, Payments) ---
// const ContentListItem = ({ children, className = "" }) => (
//     <div className={`
//         py-4 border-b border-slate-200 dark:border-slate-700/60 last:border-b-0
//         ${className}
//     `}>
//         {children}
//     </div>
// );

// // Tab Definitions
// const TABS = {
//     OVERVIEW: 'overview',
//     CLIENT: 'client',
//     SHOOTS: 'shoots',
//     DELIVERABLES: 'deliverables',
//     FINANCIALS: 'financials',
//     PAYMENT_SCHEDULE: 'payment_schedule',
//     EXPENES: 'expenses',
// };

// const tabConfig = {
//     [TABS.OVERVIEW]: { label: 'Overview', icon: Award },
//     [TABS.CLIENT]: { label: 'Client', icon: UserCircle },
//     [TABS.SHOOTS]: { label: 'Shoots', icon: Camera },
//     [TABS.DELIVERABLES]: { label: 'Deliverables', icon: PackageCheck },
//     [TABS.FINANCIALS]: { label: 'Financials', icon: DollarSign },
//     [TABS.PAYMENT_SCHEDULE]: { label: 'Payment Plan', icon: CreditCard },
//     [TABS.EXPENES]: { label: 'Expenses', icon: ListChecks }
// };

// // Initial Data
// const initialProjectData = {
//     "projectName": "Birthday Celebration",
//     "projectPackageCost": 30000,
//     "deliverablesAdditionalCost": 4444,
//     "overallTotalCost": 34447,
//     "clients": { "clientDetails": { "name": "Rohan Sharma", "phone": "+919999999999", "relation": "Groom", "email": "rohan@example.com" }, "rawPhoneNumberInput": "9999999999", "currentStep": "existing_found", "isPhoneNumberValid": true },
//     "projectDetails": { "eventTitle": "Anika & Rohan's Wedding", "eventDate": "2024-12-15", "eventType": "Wedding", "city": "Mumbai", "venue": "Grand Hyatt", "packageCost": 30000 },
//     "shoots": {
//         "shootList": [
//             {
//                 "id": 1748946215149, "title": "Haldi Ceremony", "date": "2024-12-14", "time": "10:00", "city": "Mumbai",
//                 "selectedServices": { "Candid Photography": 1, "Traditional Videography": 1 },
//                 "assignments": { "Candid Photography": [], "Traditional Videography": [] }
//             },
//             {
//                 "id": 1748946215150, "title": "Wedding Ceremony", "date": "2024-12-15", "time": "18:00", "city": "Mumbai",
//                 "selectedServices": { "Candid Photography": 2, "Cinematic Videography": 1, "Drone Aerial Shots": 1 },
//                 "assignments": { "Candid Photography": [], "Cinematic Videography": [], "Drone Aerial Shots": [] }
//             }
//         ]
//     },
//     "deliverables": {
//         "deliverableItems": [
//             { "id": "04acd7f5-bcfd-4b41-a886-e12573f381a1", "title": "Premium Photo Album (30 Pages)", "isAdditionalCharge": true, "additionalChargeAmount": 4444, "date": "2025-01-15", "assignments": { "assigned": [] }, "requiredCount": 1 },
//             { "id": "e224eb05-5a4e-4f22-aba7-f8e064958db8", "title": "Online Gallery Access (1 Year)", "isAdditionalCharge": false, "additionalChargeAmount": 0, "date": "2024-12-20", "assignments": { "assigned": [] }, "requiredCount": 1 },
//             { "id": "f335eb06-6b5e-5g33-acb8-f9f175069db9", "title": "Cinematic Wedding Film (5-7 mins)", "isAdditionalCharge": false, "additionalChargeAmount": 0, "date": "2025-02-10", "assignments": { "assigned": [] }, "requiredCount": 1 }
//         ],
//         "activeCustomBundleTemplates": {}
//     },
//     "receivedAmount": { "transaction": { "amount": 15000, "description": "Advance Payment", "date": "2024-11-01" } },
//     "paymentSchedule": { "paymentInstallments": [{ "id": 1748946215177, "amount": 10000, "description": "Second Installment (Post-Haldi)", "dueDate": "2024-12-16" }, { "id": 1748946215178, "amount": 9447, "description": "Final Payment (Before Delivery)", "dueDate": "2025-01-10" }] },
//     "expenses": [
//         { "id": 1, "productName": "Office Supplies", "category": "Stationery", "expense": 450.00 },
//         { "id": 2, "productName": "Marketing Campaign", "category": "Advertising", "expense": 2500.00 },
//         { "id": 3, "productName": "Software License", "category": "Technology", "expense": 1200.00 },
//         { "id": 4, "productName": "Team Lunch", "category": "Food & Entertainment", "expense": 320.00 },
//         { "id": 5, "productName": "Equipment Maintenance", "category": "Maintenance", "expense": 800.00 },
//         { "id": 6, "productName": "Training Materials", "category": "Education", "expense": 650.00 }
//     ]
// };


// function ProjectReviewPage() {
//     const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
//     const [fullProjectData, setFullProjectData] = useState(initialProjectData);

//     const handleUpdateShootAssignment = (shootId, serviceName, assignedPersonNamesArray) => {
//         setFullProjectData(prevData => {
//             const updatedShootList = prevData.shoots.shootList.map(shoot => {
//                 if (shoot.id === shootId) {
//                     const newAssignments = { ...(shoot.assignments || {}) };
//                     newAssignments[serviceName] = assignedPersonNamesArray;
//                     return { ...shoot, assignments: newAssignments };
//                 }
//                 return shoot;
//             });
//             return { ...prevData, shoots: { ...prevData.shoots, shootList: updatedShootList } };
//         });
//     };

//     // Handler for updating deliverable assignments
//     const handleUpdateDeliverableAssignment = (deliverableId, assignedPersonNamesArray) => {
//         setFullProjectData(prevData => {
//             const updatedDeliverableItems = prevData.deliverables.deliverableItems.map(item => {
//                 if (item.id === deliverableId) {
//                     return {
//                         ...item,
//                         assignments: {
//                             ...(item.assignments || {}),
//                             assigned: assignedPersonNamesArray
//                         }
//                     };
//                 }
//                 return item;
//             });
//             return {
//                 ...prevData,
//                 deliverables: {
//                     ...prevData.deliverables,
//                     deliverableItems: updatedDeliverableItems
//                 }
//             };
//         });
//     };

//     const handleApprove = () => {
//         console.log("Project Approved (current state):", fullProjectData);
//         alert("Project Approved! Check console for data.");
//     };

//     const handleAddExpense = (formData) => {
//         const newExpense = { ...formData, id: Date.now(), expense: parseFloat(formData.expense) };
//         setFullProjectData(prev => ({
//             ...prev,
//             expenses: [...(prev.expenses || []), newExpense]
//         }));
//     };

//     const handleUpdateExpense = (updatedExpense) => {
//         setFullProjectData(prev => ({
//             ...prev,
//             expenses: prev.expenses.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp)
//         }));
//     };

//     const handleDeleteExpense = (expenseId) => {
//         setFullProjectData(prev => ({
//             ...prev,
//             expenses: prev.expenses.filter(exp => exp.id !== expenseId)
//         }));
//     };

//     // --- Page Styles ---
//     const pageContainerStyles = "min-h-screen p-4 sm:p-6 lg:p-8 bg-slate-100 dark:bg-slate-900";
//     const mainContentWrapperStyles = "max-w-6xl mx-auto bg-white dark:bg-slate-800 shadow-xl [border-radius:0px] -z-20";
//     const filterTabsContainerStyles = "flex flex-wrap gap-2 items-center bg-slate-100/80 dark:bg-slate-700/60 p-2 rounded-2xl shadow-inner sticky top-4 backdrop-blur-sm";
//     const tabButtonBaseStyles = "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transform hover:-translate-y-0.5 hover:shadow-md";
//     const inactiveTabStyles = "bg-slate-200/70 hover:bg-slate-300/70 dark:bg-slate-600/50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 focus:ring-indigo-300 dark:focus:ring-indigo-600";
//     const activeTabStyles = "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg focus:ring-purple-500 dark:from-indigo-500 dark:to-purple-500";
//     const approveButtonStyles = "bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3.5 px-10 rounded-lg shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-60 transition-all duration-300 ease-in-out flex items-center justify-center text-lg transform active:scale-95 hover:-translate-y-0.5";
//     const sectionTitleStyles = "text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center";
//     const subSectionSeparator = "pt-6 mt-6 border-t border-slate-200 dark:border-slate-700/60";

//     if (!fullProjectData) {
//         return <div className={pageContainerStyles}><p className="text-center text-xl text-slate-600 dark:text-slate-300 ">Loading project data...</p></div>;
//     }

//     const { clients, projectDetails, shoots: shootsObject, deliverables, receivedAmount, paymentSchedule } = fullProjectData;

//     // NOTE: Collapsed the full JSX for renderTabContent for brevity. The logic is correct.
//     const fullRenderTabContent = () => {
//         switch (activeTab) {
//             case TABS.OVERVIEW:
//                 return (
//                     <div>
//                         <div>
//                             <h3 className={sectionTitleStyles}>
//                                 <Info className="w-5 h-5 mr-2.5 text-indigo-500 dark:text-indigo-400" />
//                                 Key Information
//                             </h3>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
//                                 <DetailPairStylish label="Client" value={clients?.clientDetails?.name} icon={UserCircle} highlight />
//                                 <DetailPairStylish label="Event" value={projectDetails?.eventTitle || fullProjectData.projectName} icon={Briefcase} highlight />
//                                 <DetailPairStylish label="Event Date" value={projectDetails?.eventDate} isDate icon={CalendarDays} />
//                                 <DetailPairStylish label="Total Shoots" value={shootsObject?.shootList?.length || 0} icon={Camera} />
//                             </div>
//                         </div>
//                         <div className={subSectionSeparator}>
//                             <h3 className={sectionTitleStyles}>
//                                 <DollarSign className="w-5 h-5 mr-2.5 text-indigo-500 dark:text-indigo-400" />
//                                 Quick Financials
//                             </h3>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
//                                 <DetailPairStylish label="Package Cost" value={fullProjectData.projectPackageCost} isCurrency icon={PackageCheck} />
//                                 <DetailPairStylish label="Additional Costs" value={fullProjectData.deliverablesAdditionalCost} isCurrency icon={ListChecks} />
//                                 <DetailPairStylish label="Amount Received" value={receivedAmount?.transaction?.amount} isCurrency icon={TrendingUp} />
//                                 <DetailPairStylish
//                                     label="Balance Due"
//                                     value={fullProjectData.overallTotalCost - (receivedAmount?.transaction?.amount || 0)}
//                                     isCurrency
//                                     icon={CircleDollarSign}
//                                     highlight
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 );
//             case TABS.CLIENT:
//                 const hasClientDetails = clients?.clientDetails;
//                 const hasEventDetails = projectDetails;

//                 if (!hasClientDetails && !hasEventDetails) {
//                     return <p className="text-slate-500 dark:text-slate-400 p-2">No client or event details available.</p>;
//                 }

//                 return (
//                     <div>
//                         {hasClientDetails && (
//                             <div>
//                                 <h3 className={sectionTitleStyles}>
//                                     <UserCircle className="w-5 h-5 mr-2.5 text-indigo-500 dark:text-indigo-400" />
//                                     Client Details
//                                 </h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
//                                     <DetailPairStylish label="Full Name" value={clients.clientDetails.name} icon={UserCircle} highlight />
//                                     <DetailPairStylish label="Phone Number" value={clients.clientDetails.phone} icon={Clock} />
//                                     <DetailPairStylish label="Relation" value={clients.clientDetails.relation} icon={Users} />
//                                     <DetailPairStylish label="Email Address" value={clients.clientDetails.email} icon={FileText} />
//                                 </div>
//                             </div>
//                         )}

//                         {hasEventDetails && (
//                             <div className={hasClientDetails ? subSectionSeparator : ''}>
//                                 <h3 className={sectionTitleStyles}>
//                                     <Briefcase className="w-5 h-5 mr-2.5 text-indigo-500 dark:text-indigo-400" />
//                                     Event Specifications
//                                 </h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
//                                     <DetailPairStylish label="Event Title" value={projectDetails.eventTitle} icon={Edit3} highlight />
//                                     <DetailPairStylish label="Event Date" value={projectDetails.eventDate} isDate icon={CalendarDays} />
//                                     <DetailPairStylish label="Event Type" value={projectDetails.eventType} icon={Tag} />
//                                     <DetailPairStylish label="City" value={projectDetails.city} icon={MapPin} />
//                                     <DetailPairStylish label="Venue" value={projectDetails.venue} icon={Landmark} customClassName="md:col-span-2" />
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 );
//             case TABS.SHOOTS:
//                 if (!shootsObject || !shootsObject.shootList) {
//                     return <p className="text-slate-500 dark:text-slate-400 p-2">Shoot data is not available.</p>;
//                 }
//                 return (
//                     <Shoots
//                         shoots={shootsObject.shootList}
//                         sectionTitleStyles={sectionTitleStyles}
//                         DetailPairStylishComponent={DetailPairStylish}
//                         ContentListItemComponent={ContentListItem}
//                         onUpdateShootAssignment={handleUpdateShootAssignment}
//                     />
//                 );
//             case TABS.DELIVERABLES:
//                 if (!deliverables || !deliverables.deliverableItems || deliverables.deliverableItems.length === 0) {
//                     return <p className="text-slate-500 dark:text-slate-400 p-2">Deliverables data is not available or empty.</p>;
//                 }
//                 return (
//                     <DeliverablesDetails
//                         deliverables={deliverables.deliverableItems}
//                         sectionTitleStyles={sectionTitleStyles}
//                         onUpdateDeliverableAssignment={handleUpdateDeliverableAssignment}
//                     />
//                 );

//             // --- THIS IS THE CORRECTED BLOCK ---
//             case TABS.EXPENES:
//                 return (
//                     <Expence
//                         expenses={fullProjectData.expenses || []}
//                         onAddExpense={handleAddExpense}
//                         onUpdateExpense={handleUpdateExpense}
//                         onDeleteExpense={handleDeleteExpense}
//                         sectionTitleStyles={sectionTitleStyles}
//                     />
//                 );


//             case TABS.FINANCIALS:
//                 return (
//                     <div>
//                         <h3 className={sectionTitleStyles}>
//                             <CircleDollarSign className="w-5 h-5 mr-2.5 text-indigo-500 dark:text-indigo-400" />
//                             Financial Breakdown
//                         </h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
//                             <DetailPairStylish label="Base Package Cost" value={fullProjectData.projectPackageCost} isCurrency icon={PackageCheck} />
//                             <DetailPairStylish label="Additional Deliverables Cost" value={fullProjectData.deliverablesAdditionalCost} isCurrency icon={ListChecks} />
//                         </div>
//                         <div className={subSectionSeparator}>
//                             <DetailPairStylish label="Subtotal Project Cost" value={fullProjectData.overallTotalCost} isCurrency highlight icon={DollarSign} />
//                         </div>
//                         {receivedAmount?.transaction && (
//                             <div className={subSectionSeparator}>
//                                 <div>
//                                     <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center"><TrendingUp size={18} className="mr-2 text-green-500" />Amount Received</h4>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
//                                         <DetailPairStylish label="Amount Paid" value={receivedAmount.transaction.amount} isCurrency />
//                                         <DetailPairStylish label="Payment Date" value={receivedAmount.transaction.date} isDate />
//                                         <DetailPairStylish label="Payment Note" value={receivedAmount.transaction.description} customClassName="md:col-span-2" />
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                         <div className="mt-6 pt-6 border-t-2 border-indigo-500 dark:border-indigo-400">
//                             <DetailPairStylish
//                                 label="Final Balance Due"
//                                 value={fullProjectData.overallTotalCost - (receivedAmount?.transaction?.amount || 0)}
//                                 isCurrency
//                                 highlight
//                                 icon={CircleDollarSign}
//                             />
//                         </div>
//                     </div>
//                 );
//             case TABS.PAYMENT_SCHEDULE:
//                 if (!paymentSchedule || !paymentSchedule.paymentInstallments || paymentSchedule.paymentInstallments.length === 0) {
//                     return <p className="text-slate-500 dark:text-slate-400 p-2">Payment schedule not available or empty.</p>;
//                 }
//                 return (
//                     <div>
//                         <h3 className={sectionTitleStyles}>
//                             <CreditCard className="w-5 h-5 mr-2.5 text-indigo-500 dark:text-indigo-400" />
//                             Payment Installment Plan
//                         </h3>
//                         <div>
//                             {paymentSchedule.paymentInstallments.map((installment, index) => (
//                                 <ContentListItem key={installment.id || index}>
//                                     <div className="flex justify-between items-start">
//                                         <p className="text-md font-medium text-slate-800 dark:text-slate-100 flex-grow pr-2">
//                                             {installment.description || `Installment ${index + 1}`}
//                                         </p>
//                                         <p className="text-md font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
//                                             {`₹ ${Number(installment.amount).toLocaleString('en-IN')}`}
//                                         </p>
//                                     </div>
//                                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center">
//                                         <CalendarClock size={12} className="mr-1.5" /> Due: {installment.dueDate ? new Date(installment.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
//                                     </p>
//                                 </ContentListItem>
//                             ))}
//                         </div>
//                     </div>
//                 );
//             default:
//                 return <p className="text-slate-500 dark:text-slate-400 p-2">Select a tab to view details.</p>;
//         }
//     };


//     return (
//         <div className={pageContainerStyles}>
//             <div className={mainContentWrapperStyles}>
//                 <div className="px-6 py-5 flex items-center border-b border-slate-200 dark:border-slate-700/60 rounded-t-2xl">
//                     <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-50 ">
//                         {projectDetails?.eventTitle || fullProjectData.projectName || 'Project Review'}
//                     </h1>
//                 </div>

//                 <div className="p-4 sm:p-6 md:p-8">
//                     <div className={filterTabsContainerStyles}>
//                         {Object.entries(tabConfig).map(([tabKey, { label, icon: Icon }]) => (
//                             <button
//                                 key={tabKey}
//                                 onClick={() => setActiveTab(tabKey)}
//                                 className={`${tabButtonBaseStyles} ${activeTab === tabKey ? activeTabStyles : inactiveTabStyles}`}
//                             >
//                                 <Icon size={16} className="mr-2" />
//                                 {label}
//                             </button>
//                         ))}
//                     </div>

//                     <div className="mt-8 min-h-[350px]">
//                         {fullRenderTabContent()}
//                     </div>
//                 </div>
//             </div>

//             <footer className="max-w-5xl mx-auto mt-10 mb-6 text-center">
//                 <button onClick={handleApprove} className={approveButtonStyles}>
//                     <CheckCircle size={22} className="mr-2.5" />
//                     Approve & Finalize Project
//                 </button>
//             </footer>
//         </div>
//     );
// }

// export default ProjectReviewPage;
























'use client';

import React, { useState } from 'react';
import {
    CheckCircle, UserCircle, Briefcase, CalendarDays, Camera, PackageCheck,
    DollarSign, CreditCard, ListChecks, FileText, Users, MapPin, Clock, Tag, Edit3, Award, TrendingUp,
    Info, CircleDollarSign, Landmark, CalendarClock
} from 'lucide-react';

// Import your tab components
import Shoots from '../../../components/show-details/Shoot-details';
import DeliverablesDetails from '../../../components/show-details/Deliverables-details';
import Expence from '../../../components/show-details/Expence';

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

// --- MODIFIED: Tab Definitions (Payment Plan removed) ---
const TABS = {
    OVERVIEW: 'overview',
    CLIENT: 'client',
    SHOOTS: 'shoots',
    DELIVERABLES: 'deliverables',
    FINANCIALS: 'financials',
    EXPENES: 'expenses',
};

// --- MODIFIED: Tab Configuration (Payment Plan removed) ---
const tabConfig = {
    [TABS.OVERVIEW]: { label: 'Overview', icon: Award },
    [TABS.CLIENT]: { label: 'Client', icon: UserCircle },
    [TABS.SHOOTS]: { label: 'Shoots', icon: Camera },
    [TABS.DELIVERABLES]: { label: 'Deliverables', icon: PackageCheck },
    [TABS.FINANCIALS]: { label: 'Financials', icon: DollarSign },
    [TABS.EXPENES]: { label: 'Expenses', icon: ListChecks }
};

// Initial Data
const initialProjectData = {
    "projectName": "Birthday Celebration",
    "projectPackageCost": 30000,
    "deliverablesAdditionalCost": 4444,
    "overallTotalCost": 34447,
    "clients": { "clientDetails": { "name": "Rohan Sharma", "phone": "+919999999999", "relation": "Groom", "email": "rohan@example.com" }, "rawPhoneNumberInput": "9999999999", "currentStep": "existing_found", "isPhoneNumberValid": true },
    "projectDetails": { "eventTitle": "Anika & Rohan's Wedding", "eventDate": "2024-12-15", "eventType": "Wedding", "city": "Mumbai", "venue": "Grand Hyatt", "packageCost": 30000 },
    "shoots": {
        "shootList": [
            {
                "id": 1748946215149, "title": "Haldi Ceremony", "date": "2024-12-14", "time": "10:00", "city": "Mumbai",
                "selectedServices": { "Candid Photography": 1, "Traditional Videography": 1 },
                "assignments": { "Candid Photography": [], "Traditional Videography": [] }
            },
            {
                "id": 1748946215150, "title": "Wedding Ceremony", "date": "2024-12-15", "time": "18:00", "city": "Mumbai",
                "selectedServices": { "Candid Photography": 2, "Cinematic Videography": 1, "Drone Aerial Shots": 1 },
                "assignments": { "Candid Photography": [], "Cinematic Videography": [], "Drone Aerial Shots": [] }
            }
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
    "receivedAmount": { "transaction": { "amount": 15000, "description": "Advance Payment", "date": "2024-11-01" } },
    "paymentSchedule": { "paymentInstallments": [{ "id": 1748946215177, "amount": 10000, "description": "Second Installment (Post-Haldi)", "dueDate": "2024-12-16" }, { "id": 1748946215178, "amount": 9447, "description": "Final Payment (Before Delivery)", "dueDate": "2025-01-10" }] },
    "expenses": [
        { "id": 1, "productName": "Office Supplies", "category": "Stationery", "expense": 450.00 },
        { "id": 2, "productName": "Marketing Campaign", "category": "Advertising", "expense": 2500.00 },
        { "id": 3, "productName": "Software License", "category": "Technology", "expense": 1200.00 },
        { "id": 4, "productName": "Team Lunch", "category": "Food & Entertainment", "expense": 320.00 },
        { "id": 5, "productName": "Equipment Maintenance", "category": "Maintenance", "expense": 800.00 },
        { "id": 6, "productName": "Training Materials", "category": "Education", "expense": 650.00 }
    ]
};


function ProjectReviewPage() {
    const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
    const [fullProjectData, setFullProjectData] = useState(initialProjectData);

    const handleUpdateShootAssignment = (shootId, serviceName, assignedPersonNamesArray) => {
        setFullProjectData(prevData => {
            const updatedShootList = prevData.shoots.shootList.map(shoot => {
                if (shoot.id === shootId) {
                    const newAssignments = { ...(shoot.assignments || {}) };
                    newAssignments[serviceName] = assignedPersonNamesArray;
                    return { ...shoot, assignments: newAssignments };
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

    const handleApprove = () => {
        console.log("Project Approved (current state):", fullProjectData);
        alert("Project Approved! Check console for data.");
    };


    const handleAddExpense = (formData) => {
        const newExpense = { ...formData, id: Date.now(), expense: parseFloat(formData.expense) };
        setFullProjectData(prev => ({
            ...prev,
            expenses: [...(prev.expenses || []), newExpense]
        }));
    };

    const handleUpdateExpense = (updatedExpense) => {
        setFullProjectData(prev => ({
            ...prev,
            expenses: prev.expenses.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp)
        }));
    };

    const handleDeleteExpense = (expenseId) => {
        setFullProjectData(prev => ({
            ...prev,
            expenses: prev.expenses.filter(exp => exp.id !== expenseId)
        }));
    };

    // --- Page Styles ---
    const pageContainerStyles = "min-h-screen p-4 sm:p-6 lg:p-8 bg-slate-100 dark:bg-slate-900";
    const mainContentWrapperStyles = "max-w-6xl mx-auto bg-white dark:bg-slate-800 shadow-xl [border-radius:0px] -z-20";
    const filterTabsContainerStyles = "flex flex-wrap gap-2 items-center bg-slate-100/80 dark:bg-slate-700/60 p-2 rounded-2xl shadow-inner sticky top-4 backdrop-blur-sm";
    const tabButtonBaseStyles = "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transform hover:-translate-y-0.5 hover:shadow-md";
    const inactiveTabStyles = "bg-slate-200/70 hover:bg-slate-300/70 dark:bg-slate-600/50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 focus:ring-indigo-300 dark:focus:ring-indigo-600";
    const activeTabStyles = "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg focus:ring-purple-500 dark:from-indigo-500 dark:to-purple-500";
    const approveButtonStyles = "bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3.5 px-10 rounded-lg shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-60 transition-all duration-300 ease-in-out flex items-center justify-center text-lg transform active:scale-95 hover:-translate-y-0.5";
    const sectionTitleStyles = "text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center";
    const subSectionSeparator = "pt-6 mt-6 border-t border-slate-200 dark:border-slate-700/60";

    if (!fullProjectData) {
        return <div className={pageContainerStyles}><p className="text-center text-xl text-slate-600 dark:text-slate-300 ">Loading project data...</p></div>;
    }

    const { clients, projectDetails, shoots: shootsObject, deliverables, receivedAmount, paymentSchedule } = fullProjectData;

    const fullRenderTabContent = () => {
        switch (activeTab) {
            case TABS.OVERVIEW:
                return (
                    <div>
                        <div>
                            <h3 className={sectionTitleStyles}>
                                <Info className="w-5 h-5 mr-2.5 text-indigo-500 dark:text-indigo-400" />
                                Key Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                <DetailPairStylish label="Client" value={clients?.clientDetails?.name} icon={UserCircle} highlight />
                                <DetailPairStylish label="Event" value={projectDetails?.eventTitle || fullProjectData.projectName} icon={Briefcase} highlight />
                                <DetailPairStylish label="Event Date" value={projectDetails?.eventDate} isDate icon={CalendarDays} />
                                <DetailPairStylish label="Total Shoots" value={shootsObject?.shootList?.length || 0} icon={Camera} />
                            </div>
                        </div>
                        <div className={subSectionSeparator}>
                            <h3 className={sectionTitleStyles}>
                                <DollarSign className="w-5 h-5 mr-2.5 text-indigo-500 dark:text-indigo-400" />
                                Quick Financials
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                <DetailPairStylish label="Package Cost" value={fullProjectData.projectPackageCost} isCurrency icon={PackageCheck} />
                                <DetailPairStylish label="Additional Costs" value={fullProjectData.deliverablesAdditionalCost} isCurrency icon={ListChecks} />
                                <DetailPairStylish label="Amount Received" value={receivedAmount?.transaction?.amount} isCurrency icon={TrendingUp} />
                                <DetailPairStylish
                                    label="Balance Due"
                                    value={fullProjectData.overallTotalCost - (receivedAmount?.transaction?.amount || 0)}
                                    isCurrency
                                    icon={CircleDollarSign}
                                    highlight
                                />
                            </div>
                        </div>
                    </div>
                );
            case TABS.CLIENT:
                const hasClientDetails = clients?.clientDetails;
                const hasEventDetails = projectDetails;

                if (!hasClientDetails && !hasEventDetails) {
                    return <p className="text-slate-500 dark:text-slate-400 p-2">No client or event details available.</p>;
                }

                return (
                    <div>
                        {hasClientDetails && (
                            <div>
                                <h3 className={sectionTitleStyles}>
                                    <UserCircle className="w-5 h-5 mr-2.5 text-indigo-500 dark:text-indigo-400" />
                                    Client Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <DetailPairStylish label="Full Name" value={clients.clientDetails.name} icon={UserCircle} highlight />
                                    <DetailPairStylish label="Phone Number" value={clients.clientDetails.phone} icon={Clock} />
                                    <DetailPairStylish label="Relation" value={clients.clientDetails.relation} icon={Users} />
                                    <DetailPairStylish label="Email Address" value={clients.clientDetails.email} icon={FileText} />
                                </div>
                            </div>
                        )}

                        {hasEventDetails && (
                            <div className={hasClientDetails ? subSectionSeparator : ''}>
                                <h3 className={sectionTitleStyles}>
                                    <Briefcase className="w-5 h-5 mr-2.5 text-indigo-500 dark:text-indigo-400" />
                                    Event Specifications
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <DetailPairStylish label="Event Title" value={projectDetails.eventTitle} icon={Edit3} highlight />
                                    <DetailPairStylish label="Event Date" value={projectDetails.eventDate} isDate icon={CalendarDays} />
                                    <DetailPairStylish label="Event Type" value={projectDetails.eventType} icon={Tag} />
                                    <DetailPairStylish label="City" value={projectDetails.city} icon={MapPin} />
                                    <DetailPairStylish label="Venue" value={projectDetails.venue} icon={Landmark} customClassName="md:col-span-2" />
                                </div>
                            </div>
                        )}
                    </div>
                );
            case TABS.SHOOTS:
                if (!shootsObject || !shootsObject.shootList) {
                    return <p className="text-slate-500 dark:text-slate-400 p-2">Shoot data is not available.</p>;
                }
                return (
                    <Shoots
                        shoots={shootsObject.shootList}
                        sectionTitleStyles={sectionTitleStyles}
                        DetailPairStylishComponent={DetailPairStylish}
                        ContentListItemComponent={ContentListItem}
                        onUpdateShootAssignment={handleUpdateShootAssignment}
                    />
                );
            case TABS.DELIVERABLES:
                if (!deliverables || !deliverables.deliverableItems || deliverables.deliverableItems.length === 0) {
                    return <p className="text-slate-500 dark:text-slate-400 p-2">Deliverables data is not available or empty.</p>;
                }
                return (
                    <DeliverablesDetails
                        deliverables={deliverables.deliverableItems}
                        sectionTitleStyles={sectionTitleStyles}
                        onUpdateDeliverableAssignment={handleUpdateDeliverableAssignment}
                    />
                );
            case TABS.EXPENES:
                return (
                    <Expence
                        expenses={fullProjectData.expenses || []}
                        onAddExpense={handleAddExpense}
                        onUpdateExpense={handleUpdateExpense}
                        onDeleteExpense={handleDeleteExpense}
                        sectionTitleStyles={sectionTitleStyles}
                    />
                );

            // --- MODIFIED: Financials Tab now includes Payment Schedule ---
            case TABS.FINANCIALS:
                return (
                    <div>
                        {/* Cost Breakdown Section */}
                        <h3 className={sectionTitleStyles}>
                            <CircleDollarSign className="w-5 h-5 mr-2.5 text-indigo-500 dark:text-indigo-400" />
                            Financial Breakdown
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                            <DetailPairStylish label="Base Package Cost" value={fullProjectData.projectPackageCost} isCurrency icon={PackageCheck} />
                            <DetailPairStylish label="Additional Deliverables Cost" value={fullProjectData.deliverablesAdditionalCost} isCurrency icon={ListChecks} />
                        </div>
                        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700/60">
                            <DetailPairStylish label="Subtotal Project Cost" value={fullProjectData.overallTotalCost} isCurrency highlight icon={DollarSign} />
                        </div>

                        {/* Amount Received Section */}
                        {receivedAmount?.transaction && (
                            <div className={subSectionSeparator}>
                                <div>
                                    <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center"><TrendingUp size={18} className="mr-2 text-green-500" />Amount Received</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                        <DetailPairStylish label="Amount Paid" value={receivedAmount.transaction.amount} isCurrency />
                                        <DetailPairStylish label="Payment Date" value={receivedAmount.transaction.date} isDate />
                                        <DetailPairStylish label="Payment Note" value={receivedAmount.transaction.description} customClassName="md:col-span-2" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- NEWLY ADDED: Payment Schedule Section --- */}
                        {paymentSchedule?.paymentInstallments?.length > 0 && (
                            <div className={subSectionSeparator}>
                                <h3 className={sectionTitleStyles}>
                                    <CreditCard className="w-5 h-5 mr-2.5 text-indigo-500 dark:text-indigo-400" />
                                    Payment Installment Plan
                                </h3>
                                <div>
                                    {paymentSchedule.paymentInstallments.map((installment, index) => (
                                        <ContentListItem key={installment.id || index}>
                                            <div className="flex justify-between items-start">
                                                <p className="text-md font-medium text-slate-800 dark:text-slate-100 flex-grow pr-2">
                                                    {installment.description || `Installment ${index + 2}`}
                                                </p>
                                                <p className="text-md font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                                                    {`₹ ${Number(installment.amount).toLocaleString('en-IN')}`}
                                                </p>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center">
                                                <CalendarClock size={12} className="mr-1.5" /> Due: {installment.dueDate ? new Date(installment.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                            </p>
                                        </ContentListItem>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* --- End of Payment Schedule Section --- */}

                        {/* Final Balance Section */}
                        <div className="mt-6 pt-6 border-t-2 border-indigo-500 dark:border-indigo-400">
                            <DetailPairStylish
                                label="Final Balance Due"
                                value={fullProjectData.overallTotalCost - (receivedAmount?.transaction?.amount || 0)}
                                isCurrency
                                highlight
                                icon={CircleDollarSign}
                            />
                        </div>
                    </div>
                );

            // --- REMOVED: The standalone Payment Schedule tab case ---
            
            default:
                return <p className="text-slate-500 dark:text-slate-400 p-2">Select a tab to view details.</p>;
        }
    };


    return (
        <div className={pageContainerStyles}>
            <div className={mainContentWrapperStyles}>
                <div className="px-6 py-5 flex items-center border-b border-slate-200 dark:border-slate-700/60 rounded-t-2xl">
                    <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-50 ">
                        {projectDetails?.eventTitle || fullProjectData.projectName || 'Project Review'}
                    </h1>
                </div>

                <div className="p-4 sm:p-6 md:p-8">
                    <div className={filterTabsContainerStyles}>
                        {Object.entries(tabConfig).map(([tabKey, { label, icon: Icon }]) => (
                            <button
                                key={tabKey}
                                onClick={() => setActiveTab(tabKey)}
                                className={`${tabButtonBaseStyles} ${activeTab === tabKey ? activeTabStyles : inactiveTabStyles}`}
                            >
                                <Icon size={16} className="mr-2" />
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 min-h-[350px]">
                        {fullRenderTabContent()}
                    </div>
                </div>
            </div>

            <footer className="max-w-5xl mx-auto mt-10 mb-6 text-center">
                <button onClick={handleApprove} className={approveButtonStyles}>
                    <CheckCircle size={22} className="mr-2.5" />
                    Approve & Finalize Project
                </button>
            </footer>
        </div>
    );
}

export default ProjectReviewPage;