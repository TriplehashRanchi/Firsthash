// /app/admin/team/view/[id]/page.jsx

"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { 
    ArrowLeft, User, Mail, Phone, MapPin, Briefcase, ShieldCheck, 
    Banknote, Building, Library, Hash, UserCheck, Pencil
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// --- Reusable UI Components for a Professional Look ---

// Avatar: Displays user image or a fallback initial
const Avatar = ({ name, imageUrl }) => {
    const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';

    return (
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-4 ring-white dark:ring-slate-800 shadow-lg">
            {imageUrl ? (
                <img src={imageUrl} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : (
                <span className="text-3xl font-bold text-white">{getInitials(name)}</span>
            )}
        </div>
    );
};

// StatusBadge: A colored badge for employment status
const StatusBadge = ({ status }) => {
    const statusStyles = {
        'Active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'Inactive': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        'On Leave': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    const style = statusStyles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${style}`}>{status}</span>;
};

// DetailItem: An improved InfoRow with an icon
const DetailItem = ({ icon: Icon, label, value, isCurrency = false }) => (
    <div className="py-4 flex items-start">
        <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-4 mt-1 flex-shrink-0" />
        <div className="flex-grow">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 break-words">
                {isCurrency && value ? `₹${Number(value).toLocaleString('en-IN')}` : (value || <span className="italic text-slate-400">Not Provided</span>)}
            </p>
        </div>
    </div>
);

// InfoCard: A reusable card component for sections
const InfoCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center">
            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        </div>
        <div className="px-6 divide-y divide-slate-200 dark:divide-slate-700">
            {children}
        </div>
    </div>
);

// LoadingSpinner: A more visually appealing loader
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-slate-600 dark:text-slate-300 text-lg">Loading Member Details...</p>
    </div>
);

// --- Main Page Component ---

export default function MemberViewPage() {
    const router = useRouter();
    const { id } = useParams();
    const [member, setMember] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const TYPE_LABELS = { 0: 'Freelancer', 1: 'In-house' };

    useEffect(() => {
        if (!id) return;

        const fetchDetails = async () => {
            setIsLoading(true);
            setError(null);
            const user = getAuth().currentUser;
            if (!user) {
                setError("Authentication required. Please log in.");
                setIsLoading(false);
                return;
            }

            try {
                const token = await user.getIdToken();
                const headers = { Authorization: `Bearer ${token}` };

                const [memberRes, paymentRes] = await Promise.all([
                    axios.get(`${API_URL}/api/members/${id}`, { headers }),
                    axios.get(`${API_URL}/api/members/${id}/payment-details`, { headers }),
                ]);

                setMember(memberRes.data);
                setPaymentDetails(paymentRes.data);
            } catch (err) {
                console.error("Failed to fetch details", err);
                setError(err.response?.data?.error || "Could not load member data. The member may not exist.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    if (isLoading) return <LoadingSpinner />;
    
    if (error) {
        return (
             <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 text-center">
                <p className="text-red-500 font-semibold">{error}</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Go Back
                </button>
            </div>
        )
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
            
            {/* Navigation Header */}
            <div className="p-4 sm:p-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Team List
                </button>
            </div>

            {/* Profile Header */}
            <div className="bg-white dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-700 px-6 py-8">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-6">
                    <Avatar name={member.name} imageUrl={member.imageUrl /* Assuming you have an imageUrl property */} />
                    <div className="text-center sm:text-left flex-grow">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{member.name}</h1>
                        <p className="text-md text-blue-600 dark:text-blue-400 font-semibold mt-1">{member.role}</p>
                        <div className="mt-2">
                           <StatusBadge status={member.status || 'Active'} />
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        <button 
                            onClick={() => router.push(`/admin/team_view/edit/${id}`)}
                            className="flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                        >
                            <Pencil size={16} className="mr-2" />
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <InfoCard title="Personal Information" icon={User}>
                            <DetailItem icon={Mail} label="Email Address" value={member.email} />
                            <DetailItem icon={Phone} label="Phone Number" value={member.phone} />
                            <DetailItem icon={MapPin} label="Address" value={member.address} />
                        </InfoCard>

                        <InfoCard title="Employment Details" icon={Briefcase}>
                            <DetailItem icon={UserCheck} label="Employee Type" value={TYPE_LABELS[member.employee_type]} />
                            <DetailItem icon={ShieldCheck} label="Primary Role" value={member.role} />
                            {member.employee_type === 1 && (
                                <DetailItem icon={Banknote} label="Salary" value={member.salary} isCurrency />
                            )}
                        </InfoCard>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="lg:col-span-1 space-y-6">
                         {member.employee_type === 1 && (
                            <InfoCard title="Payment Details" icon={Library}>
                                {!paymentDetails ? (
                                    <p className="p-6 text-sm text-slate-500 dark:text-slate-400">No payment details have been recorded.</p>
                                ) : (
                                    <>
                                        <DetailItem icon={Building} label="Bank Name" value={paymentDetails.bank_name} />
                                        <DetailItem icon={Hash} label="Account Number" value={paymentDetails.account_number} />
                                        <DetailItem icon={Hash} label="IFSC Code" value={paymentDetails.ifsc_code} />
                                        <DetailItem icon={User} label="Account Holder" value={paymentDetails.account_holder} />
                                        <DetailItem icon={Phone} label="UPI ID" value={paymentDetails.upi_id} />
                                    </>
                                )}
                            </InfoCard>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}