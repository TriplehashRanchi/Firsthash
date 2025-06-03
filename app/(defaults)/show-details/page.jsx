// app/project-review/[projectId]/page.jsx (Example path)
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { 
    CheckCircle, UserCircle, Briefcase, CalendarDays, Camera, PackageCheck, 
    DollarSign, CreditCard, ListChecks, FileText, Users, MapPin, Clock, Tag, Edit3, Award, TrendingUp,
    Info, CircleDollarSign, Landmark, CalendarClock // <<<< CORRECTED: Info icon is now imported
} from 'lucide-react';

//import { CircleDollarSign } from 'lucide-react';


// --- Re-styled Helper Components for a "Vibrant & Polished" Look ---

const SectionCard = ({ title, icon: IconComponent, children, className = "", fullWidth = false }) => (
    <div className={`
        bg-white dark:bg-slate-800/70 backdrop-blur-sm shadow-xl dark:shadow-slate-900/70 rounded-xl 
        overflow-hidden ${className}
        transition-all duration-300 ease-out hover:shadow-indigo-500/20 dark:hover:shadow-indigo-400/20 
    `}>
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/50 flex items-center space-x-3 bg-slate-50/50 dark:bg-slate-700/30 rounded-t-xl">
            {IconComponent && <IconComponent className="w-6 h-6 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />}
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
                {title}
            </h3>
        </div>
        <div className={`p-6 ${fullWidth ? '' : 'space-y-3'}`}>
            {children}
        </div>
    </div>
);


const DetailPairStylish = ({ label, value, children, icon: IconComponent, isCurrency = false, isDate = false, highlight = false }) => {
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
        <div className="py-2 flex items-start group">
            {IconComponent && <IconComponent className={`w-4 h-4 text-slate-400 dark:text-slate-500 mr-3 mt-1 flex-shrink-0 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors`} />}
            <div className="flex-grow">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
                <div className={`
                    text-slate-700 dark:text-slate-100 break-words 
                    ${highlight ? 'text-indigo-600 dark:text-indigo-300 font-bold text-lg' : 'text-sm font-medium'}
                `}>
                    {children || formatValue()}
                </div>
            </div>
        </div>
    );
};

const ItemCard = ({ children, className = "" }) => (
    <div className={`
        bg-gradient-to-br from-slate-50 to-white dark:from-slate-700/40 dark:to-slate-800/60 
        p-4 rounded-lg border border-slate-200 dark:border-slate-700 
        shadow-md hover:shadow-lg transition-shadow duration-200
        ${className}
    `}>
        {children}
    </div>
);


// Tab Definitions
const TABS = {
    OVERVIEW: 'overview',
    CLIENT: 'client',
    EVENT: 'event',
    SHOOTS: 'shoots',
    DELIVERABLES: 'deliverables',
    FINANCIALS: 'financials',
    PAYMENT_SCHEDULE: 'payment_schedule',
};

const tabConfig = {
    [TABS.OVERVIEW]: { label: 'Overview', icon: Award },
    [TABS.CLIENT]: { label: 'Client', icon: UserCircle },
    [TABS.EVENT]: { label: 'Event', icon: Briefcase },
    [TABS.SHOOTS]: { label: 'Shoots', icon: Camera },
    [TABS.DELIVERABLES]: { label: 'Deliverables', icon: PackageCheck },
    [TABS.FINANCIALS]: { label: 'Financials', icon: DollarSign },
    [TABS.PAYMENT_SCHEDULE]: { label: 'Payment Plan', icon: CreditCard },
};


function ProjectReviewPage() {
    const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);

    const fullProjectData = { 
        "projectName": "Birthday Celebration",
        "projectPackageCost": 30000,
        "deliverablesAdditionalCost": 4444,
        "overallTotalCost": 34447,
        "clients": { "clientDetails": { "name": "Rohan Sharma", "phone": "+919999999999", "relation": "Groom", "email": "rohan@example.com" }, "rawPhoneNumberInput": "9999999999", "currentStep": "existing_found", "isPhoneNumberValid": true },
        "projectDetails": { "eventTitle": "Anika & Rohan's Wedding", "eventDate": "2024-12-15", "eventType": "Wedding", "city": "Mumbai", "venue": "Grand Hyatt", "packageCost": 30000 },
        "shoots": { "shootList": [ { "id": 1748946215149, "title": "Haldi Ceremony", "date": "2024-12-14", "time": "10:00", "city": "Mumbai", "selectedServices": { "Candid Photography": 1, "Traditional Videography": 1 }, }, { "id": 1748946215150, "title": "Wedding Ceremony", "date": "2024-12-15", "time": "18:00", "city": "Mumbai", "selectedServices": { "Candid Photography": 2, "Cinematic Videography": 1, "Drone Aerial Shots": 1 }, } ] },
        "deliverables": { "deliverableItems": [ { "id": "04acd7f5-bcfd-4b41-a886-e12573f381a1", "title": "Premium Photo Album (30 Pages)", "isAdditionalCharge": true, "additionalChargeAmount": 4444, "date": "2025-01-15" }, { "id": "e224eb05-5a4e-4f22-aba7-f8e064958db8", "title": "Online Gallery Access (1 Year)", "isAdditionalCharge": false, "additionalChargeAmount": 0, "date": "2024-12-20" } ], "activeCustomBundleTemplates": {} },
        "receivedAmount": { "transaction": { "amount": 15000, "description": "Advance Payment", "date": "2024-11-01" } },
        "paymentSchedule": { "paymentInstallments": [ { "id": 1748946215177, "amount": 10000, "description": "Second Installment (Post-Haldi)", "dueDate": "2024-12-16" }, { "id": 1748946215178, "amount": 9447, "description": "Final Payment (Before Delivery)", "dueDate": "2025-01-10" } ] }
    };


    const handleApprove = () => {
        console.log("Project Approved:", fullProjectData);
        alert("Project Approved! Check console for data.");
    };

    const pageContainerStyles = "min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800";
    const mainContentWrapperStyles = "max-w-6xl mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden";
    const pageTitleStyles = "text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 tracking-tight";
    const overallTotalPillStyles = "mt-3 inline-block text-lg font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-500/20 px-5 py-1.5 rounded-full shadow";
    
    const filterTabsContainerStyles = "flex flex-wrap gap-2 items-center bg-white/50 dark:bg-slate-700/40 p-2 rounded-xl shadow-inner mb-6 sticky top-4 z-30 backdrop-blur-sm";
    const tabButtonBaseStyles = "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transform hover:-translate-y-0.5 hover:shadow-lg";
    const inactiveTabStyles = "bg-slate-100 hover:bg-slate-200 dark:bg-slate-600/50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 focus:ring-indigo-300 dark:focus:ring-indigo-600";
    const activeTabStyles = "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl focus:ring-purple-500 dark:from-indigo-500 dark:to-purple-500";
    const approveButtonStyles = "bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3.5 px-10 rounded-lg shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-60 transition-all duration-300 ease-in-out flex items-center justify-center text-lg transform active:scale-95 hover:-translate-y-0.5";
    
    if (!fullProjectData) {
        return <div className={pageContainerStyles}><p className="text-center text-xl text-slate-600 dark:text-slate-300">Loading project data...</p></div>;
    }

    const { clients, projectDetails, shoots, deliverables, receivedAmount, paymentSchedule } = fullProjectData;

    const renderTabContent = () => {
        switch (activeTab) {
            case TABS.OVERVIEW:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SectionCard title="Key Information" icon={Info} className="md:col-span-1">
                            <DetailPairStylish label="Client" value={clients?.clientDetails?.name} icon={UserCircle} highlight/>
                            <DetailPairStylish label="Event" value={projectDetails?.eventTitle || fullProjectData.projectName} icon={Briefcase} highlight/>
                            <DetailPairStylish label="Event Date" value={projectDetails?.eventDate} isDate icon={CalendarDays} />
                            <DetailPairStylish label="Total Shoots" value={shoots?.shootList?.length || 0} icon={Camera} />
                        </SectionCard>
                        <SectionCard title="Quick Financials" icon={DollarSign} className="md:col-span-1">
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
                        </SectionCard>
                    </div>
                );
            case TABS.CLIENT:
                return clients?.clientDetails ? (
                    <SectionCard title="Client Details" icon={UserCircle} fullWidth>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                            <DetailPairStylish label="Full Name" value={clients.clientDetails.name} icon={UserCircle} highlight />
                            <DetailPairStylish label="Phone Number" value={clients.clientDetails.phone} icon={Clock} />
                            <DetailPairStylish label="Relation" value={clients.clientDetails.relation} icon={Users} />
                            <DetailPairStylish label="Email Address" value={clients.clientDetails.email} icon={FileText} />
                        </div>
                    </SectionCard>
                ) : <p className="text-slate-500 dark:text-slate-400 p-6">No client details available.</p>;
            
            case TABS.EVENT:
                return projectDetails ? (
                     <SectionCard title="Event Specifications" icon={Briefcase} fullWidth>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                            <DetailPairStylish label="Event Title" value={projectDetails.eventTitle} icon={Edit3} highlight />
                            <DetailPairStylish label="Event Date" value={projectDetails.eventDate} isDate icon={CalendarDays} />
                            <DetailPairStylish label="Event Type" value={projectDetails.eventType} icon={Tag} />
                            <DetailPairStylish label="City" value={projectDetails.city} icon={MapPin} />
                            <DetailPairStylish label="Venue" value={projectDetails.venue} icon={Landmark} className="md:col-span-2"/>
                        </div>
                    </SectionCard>
                ) : <p className="text-slate-500 dark:text-slate-400 p-6">No event details available.</p>;

            case TABS.SHOOTS:
                return shoots?.shootList?.length > 0 ? (
                    <SectionCard title="Shoot Schedule Details" icon={Camera} fullWidth>
                        <div className="space-y-6">
                        {shoots.shootList.map((shoot, index) => (
                            <ItemCard key={shoot.id || index}>
                                <h4 className="text-md font-semibold text-indigo-600 dark:text-indigo-300 mb-2 flex items-center">
                                    <Camera size={18} className="mr-2"/> Shoot {index + 1}: {shoot.title}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
                                    <DetailPairStylish label="Date" value={shoot.date} isDate icon={CalendarDays}/>
                                    <DetailPairStylish label="Time" value={shoot.time} icon={Clock}/>
                                    <DetailPairStylish label="City" value={shoot.city} icon={MapPin}/>
                                </div>
                                {shoot.selectedServices && Object.keys(shoot.selectedServices).length > 0 && (
                                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-600">
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Services:</p>
                                        <ul className="list-disc list-inside pl-1 space-y-0.5 text-xs text-slate-700 dark:text-slate-300">
                                            {Object.entries(shoot.selectedServices).map(([service, count]) => (
                                                <li key={service}>{service} {count > 1 ? `(x${count})` : ''}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </ItemCard>
                        ))}
                        </div>
                    </SectionCard>
                ) : <p className="text-slate-500 dark:text-slate-400 p-6">No shoots scheduled.</p>;

            case TABS.DELIVERABLES:
                 return deliverables?.deliverableItems?.length > 0 ? (
                    <SectionCard title="Project Deliverables" icon={PackageCheck} fullWidth>
                        <div className="space-y-4">
                        {deliverables.deliverableItems.map((item) => (
                            <ItemCard key={item.id}>
                                <div className="flex justify-between items-start">
                                    <p className="text-md font-medium text-slate-800 dark:text-slate-100">{item.title}</p>
                                    {item.isAdditionalCharge && (
                                        <span className="ml-3 text-sm font-semibold bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                                            + {`₹ ${Number(item.additionalChargeAmount).toLocaleString('en-IN')}`}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center">
                                    <CalendarDays size={12} className="mr-1.5"/> Est. Delivery: {item.date ? new Date(item.date).toLocaleDateString('en-GB', { day:'numeric', month:'short'}) : 'N/A'}
                                </p>
                            </ItemCard>
                        ))}
                        </div>
                    </SectionCard>
                ) : <p className="text-slate-500 dark:text-slate-400 p-6">No deliverables specified.</p>;
            
            case TABS.FINANCIALS:
                return (
                     <SectionCard title="Complete Financial Breakdown" icon={CircleDollarSign} fullWidth>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                            <DetailPairStylish label="Base Package Cost" value={fullProjectData.projectPackageCost} isCurrency />
                            <DetailPairStylish label="Additional Deliverables" value={fullProjectData.deliverablesAdditionalCost} isCurrency />
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-600">
                           <DetailPairStylish label="Subtotal Project Cost" value={fullProjectData.overallTotalCost} isCurrency highlight/>
                        </div>

                        {receivedAmount?.transaction && (
                             <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-600">
                                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center"><ListChecks size={16} className="mr-2"/>Amount Received Details</h4>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <DetailPairStylish label="Amount Paid" value={receivedAmount.transaction.amount} isCurrency />
                                    <DetailPairStylish label="Payment Date" value={receivedAmount.transaction.date} isDate />
                                    <DetailPairStylish label="Payment Note" value={receivedAmount.transaction.description} className="md:col-span-2"/>
                                 </div>
                            </div>
                        )}
                         <div className="mt-4 pt-4 border-t-2 border-indigo-500 dark:border-indigo-400">
                            <DetailPairStylish 
                                label="Final Balance Due" 
                                value={fullProjectData.overallTotalCost - (receivedAmount?.transaction?.amount || 0)} 
                                isCurrency 
                                highlight
                            />
                        </div>
                    </SectionCard>
                );

            case TABS.PAYMENT_SCHEDULE:
                return paymentSchedule?.paymentInstallments?.length > 0 ? (
                    <SectionCard title="Payment Installment Plan" icon={CreditCard} fullWidth>
                        <div className="space-y-4">
                        {paymentSchedule.paymentInstallments.map((installment, index) => (
                            <ItemCard key={installment.id || index}>
                                <div className="flex justify-between items-start"> {/* Changed to items-start for better alignment if description is long */}
                                    <p className="text-md font-medium text-slate-800 dark:text-slate-100 flex-grow pr-2">
                                        {installment.description || `Installment ${index + 1}`}
                                    </p>
                                    <p className="text-md font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                                        {`₹ ${Number(installment.amount).toLocaleString('en-IN')}`}
                                    </p>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center">
                                <CalendarClock size={12} className="mr-1.5"/> Due: {installment.dueDate ? new Date(installment.dueDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric'}) : 'N/A'}
                                </p>
                            </ItemCard>
                        ))}
                        </div>
                    </SectionCard>
                ) : <p className="text-slate-500 dark:text-slate-400 p-6">No payment schedule defined.</p>;

            default:
                return <p className="text-slate-500 dark:text-slate-400 p-6">Select a tab to view details.</p>;
        }
    };

    return (
        <div className={pageContainerStyles}>
            <div className={mainContentWrapperStyles}>
                {/* Header Section */}
                <header className="px-6 py-8 text-center">
                    <nav className="mb-6 text-left">
                        <ol className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <li><Link href="/dashboard" className="hover:underline text-indigo-600 dark:text-indigo-400">Dashboard</Link></li>
                            <li><span className="text-slate-400 dark:text-slate-500">/</span></li>
                            <li><span className="font-medium text-slate-700 dark:text-slate-200">Project Review</span></li>
                        </ol>
                    </nav>
                    <h1 className={pageTitleStyles}>{fullProjectData.projectName || 'Project Review'}</h1>
                    {projectDetails?.eventTitle && projectDetails.eventTitle !== fullProjectData.projectName && (
                        <p className="mt-1 text-lg text-slate-600 dark:text-slate-400">{projectDetails.eventTitle}</p>
                    )}
                     <div className={overallTotalPillStyles}>
                        Overall Value: <span className="font-extrabold">{`₹ ${Number(fullProjectData.overallTotalCost).toLocaleString('en-IN')}`}</span>
                    </div>
                </header>

                {/* Tabs Navigation */}
                <div className="px-4 sm:px-6">
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
                </div>
                
                {/* Tab Content Area */}
                <div className="px-2 sm:px-4 md:px-6 py-8 min-h-[300px]"> {/* Added min-height */}
                    {renderTabContent()}
                </div>
            </div>

            {/* Approve Button */}
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