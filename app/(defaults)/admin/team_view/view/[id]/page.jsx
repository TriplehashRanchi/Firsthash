"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const TYPE_LABELS = { 0: 'Freelancer', 1: 'In-house' };

// A dedicated component for displaying a piece of information.
const InfoRow = ({ label, value, isCurrency = false }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-600">{label}</dt>
        <dd className="mt-1 text-sm text-gray-800 sm:mt-0 sm:col-span-2">
            {isCurrency && value ? '₹' : ''}{value || 'N/A'}
        </dd>
    </div>
);

// A simple loading spinner component.
const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-10">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-gray-600">Loading Member Details...</p>
    </div>
);

export default function MemberViewPage() {
  const router = useRouter();
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);

      // 1️⃣ Ensure admin is logged in
      const user = getAuth().currentUser;
      if (!user) {
        setError("Admin not logged in.");
        setIsLoading(false);
        return;
      }

      try {
        // 2️⃣ Fetch fresh token
        const token = await user.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };

        // 3️⃣ Fetch member info + payment details in parallel
        const [memberRes, paymentRes] = await Promise.all([
          axios.get(`${API_URL}/api/members/${id}`, { headers }),
          axios.get(`${API_URL}/api/members/${id}/payment-details`, { headers }),
        ]);

        console.log(" MEMBER", memberRes.data);
        console.log(" BANK", paymentRes.data);

        setMember(memberRes.data);
        setPaymentDetails(paymentRes.data);
      } catch (err) {
        console.error("Failed to fetch details", err);
        setError("Could not load member data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);


    if (isLoading) return <LoadingSpinner />;
    if (!member) return <p className="p-6 text-center text-red-500">Failed to load member data.</p>;

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-800">Member Profile</h1>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700"
                    >
                        Back to Team
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                {/* Personal Information Card */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
                    </div>
                    <div className="px-6 divide-y divide-gray-200">
                        <dl>
                            <InfoRow label="Name" value={member.name} />
                            <InfoRow label="Email" value={member.email} />
                            <InfoRow label="Phone" value={member.phone} />
                            <InfoRow label="Address" value={member.address} />
                        </dl>
                    </div>
                </div>

                {/* Employment Details Card */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">Employment Details</h2>
                    </div>
                    <div className="px-6 divide-y divide-gray-200">
                        <dl>
                            <InfoRow label="Type" value={TYPE_LABELS[member.employee_type]} />
                            <InfoRow label="Role" value={member.role} />
                            <InfoRow label="Status" value={member.status} />
                            {member.employee_type === 1 && (
                                <InfoRow label="Salary" value={member.salary} isCurrency />
                            )}
                        </dl>
                    </div>
                </div>

                {/* Payment Details Card - Only shown for In-house employees */}
                {member.employee_type === 1 && (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800">Payment Details</h2>
                        </div>
                        <div className="px-6">
                            {!paymentDetails ? (
                                <p className="py-4 text-sm text-gray-500">No payment details have been recorded.</p>
                            ) : (
                                <dl className="divide-y divide-gray-200">
                                    <InfoRow label="Bank Name" value={paymentDetails.bank_name} />
                                    <InfoRow label="Branch Name" value={paymentDetails.branch_name} />
                                    <InfoRow label="IFSC Code" value={paymentDetails.ifsc_code} />
                                    <InfoRow label="Account Number" value={paymentDetails.account_number} />
                                    <InfoRow label="Account Holder" value={paymentDetails.account_holder} />
                                    <InfoRow label="Account Type" value={paymentDetails.account_type} />
                                    <InfoRow label="UPI ID" value={paymentDetails.upi_id} />
                                </dl>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}