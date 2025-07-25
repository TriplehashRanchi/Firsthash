"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const TYPE_OPTIONS = [
    { value: 0, label: 'Freelancer' },
    { value: 1, label: 'In-house' }
];
const ACCOUNT_TYPES = [
    { value: 'savings', label: 'Savings' },
    { value: 'current', label: 'Current' }
];

// Reusable Components for UI Consistency

const Toast = ({ message, type, onClose }) => {
    if (!message) return null;
    const baseStyle = "fixed top-5 right-5 p-4 rounded-md shadow-lg text-white z-50 transition-transform transform";
    const typeStyle = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);
    return <div className={`${baseStyle} ${typeStyle}`}>{message}</div>;
};

const FormCard = ({ title, children }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
    </div>
);

const SelectField = ({ label, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
            {children}
        </select>
    </div>
);

const SaveButton = ({ isLoading, children }) => (
    <button type="submit" disabled={isLoading} className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center">
        {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
        {isLoading ? 'Saving...' : children}
    </button>
);

export default function MemberEditPage() {
    const router = useRouter();
    const { id } = useParams();

    // State Management
    const [form, setForm] = useState({ full_name: '', email: '', phone: '', employee_type: 1, address: '', salary: '', role_id: '' });
    const [bankForm, setBankForm] = useState({ bank_name: '', branch_name: '', ifsc_code: '', account_number: '', account_holder: '', account_type: 'savings', upi_id: '' });
    const [roles, setRoles] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [bankLoading, setBankLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });

    // Data Fetching
    useEffect(() => {
    if (!id) return;
    const fetchInitialData = async () => {
      const user = getAuth().currentUser;
      if (!user) {
        setToast({ message: "Admin not logged in", type: "error" });
        setPageLoading(false);
        return;
      }
      let token;
      try { token = await user.getIdToken(); }
      catch (e) { console.error(e); setToast({ message:"Auth failed",type:"error" }); setPageLoading(false); return; }

      try {
        const [rolesRes, memberRes, bankRes] = await Promise.all([
          axios.get(`${API_URL}/api/roles`,    { headers:{ Authorization:`Bearer ${token}` } }),
          axios.get(`${API_URL}/api/members/${id}`, { headers:{ Authorization:`Bearer ${token}` } }),
          axios.get(`${API_URL}/api/members/${id}/payment-details`, { headers:{ Authorization:`Bearer ${token}` } })
        ]);

        setRoles(rolesRes.data);
        const m = memberRes.data;
        setForm({
          full_name: m.name, email: m.email, phone: m.phone,
          employee_type: m.employee_type,
          address: m.address||'', salary: m.salary||'', role_id: m.role_id||''
        });
        if (bankRes.data) setBankForm(bankRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
        const msg = err.response?.data?.error || err.message;
        setToast({ message: msg, type:"error" });
      } finally {
        setPageLoading(false);
      }
    };
    fetchInitialData();
  }, [id]);

    // Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Convert employee_type and salary back to number
        const val = (name === 'employee_type' || name === 'salary') ? Number(value) : value;
        setForm(prev => ({ ...prev, [name]: val }));
    };

    const handleBankChange = (e) => {
        const { name, value } = e.target;
        setBankForm(prev => ({ ...prev, [name]: value }));
    };




const handleSubmit = async e => {
    e.preventDefault();
    const user = getAuth().currentUser;
    if (!user) {
      setToast({ message: "Admin not logged in", type:"error" });
      return;
    }

    setFormLoading(true);
    try {
      const token = await user.getIdToken();
      await axios.put(
        `${API_URL}/api/members/${id}`,
        { ...form, salary: form.employee_type===1?form.salary:null },
        { headers: { Authorization:`Bearer ${token}` } }
      );
      setToast({ message:"Member saved!", type:"success" });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || err.message;
      setToast({ message:msg, type:"error" });
    } finally {
      setFormLoading(false);
    }
  };


const handleBankSubmit = async e => {
    e.preventDefault();
    const user = getAuth().currentUser;
    if (!user) {
      setToast({ message: "Admin not logged in", type:"error" });
      return;
    }

    setBankLoading(true);
    try {
      const token = await user.getIdToken();
      await axios.put(
        `${API_URL}/api/members/${id}/payment-details`,
        bankForm,
        { headers: { Authorization:`Bearer ${token}` } }
      );
      setToast({ message:"Payment details saved!", type:"success" });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || err.message;
      setToast({ message:msg, type:"error" });
    } finally {
      setBankLoading(false);
    }
  };


    
    if (pageLoading) {
        return <div className="flex justify-center items-center h-screen bg-gray-50"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
            
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-800">Edit Member</h1>
                    <button onClick={() => router.back()} className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700">
                        Back to Team
                    </button>
                </div>
            </div>

            <div className="p-6 max-w-4xl mx-auto">
                {/* Member Details Form */}
                <form onSubmit={handleSubmit}>
                    <FormCard title="Personal & Employment Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} required />
                            <InputField label="Email Address" type="email" name="email" value={form.email} onChange={handleChange} required />
                            <InputField label="Mobile Number" name="phone" value={form.phone} onChange={handleChange} required />
                            <InputField label="Address" name="address" value={form.address} onChange={handleChange} />
                            <SelectField label="Employment Type" name="employee_type" value={form.employee_type} onChange={handleChange}>
                                {TYPE_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                            </SelectField>
                            <SelectField label="Role" name="role_id" value={form.role_id} onChange={handleChange} required>
                                <option value="">Select a role</option>
                                {roles.map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}
                            </SelectField>
                            {form.employee_type === 1 && (
                                <InputField label="Salary" type="number" name="salary" value={form.salary} onChange={handleChange} />
                            )}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <SaveButton isLoading={formLoading}>Save Changes</SaveButton>
                        </div>
                    </FormCard>
                </form>

                {/* Bank Details Form - Conditional */}
                {form.employee_type === 1 && (
                    <form onSubmit={handleBankSubmit}>
                        <FormCard title="Payment Details">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Bank Name" name="bank_name" value={bankForm.bank_name} onChange={handleBankChange} required />
                                <InputField label="Branch Name" name="branch_name" value={bankForm.branch_name} onChange={handleBankChange} required />
                                <InputField label="IFSC Code" name="ifsc_code" value={bankForm.ifsc_code} onChange={handleBankChange} required />
                                <InputField label="Account Number" name="account_number" value={bankForm.account_number} onChange={handleBankChange} required />
                                <InputField label="Account Holder Name" name="account_holder" value={bankForm.account_holder} onChange={handleBankChange} required />
                                <SelectField label="Account Type" name="account_type" value={bankForm.account_type} onChange={handleBankChange} required>
                                    {ACCOUNT_TYPES.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
                                </SelectField>
                                <div className="md:col-span-2">
                                  <InputField label="UPI ID (Optional)" name="upi_id" value={bankForm.upi_id} onChange={handleBankChange} />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <SaveButton isLoading={bankLoading}>Save Payment Details</SaveButton>
                            </div>
                        </FormCard>
                    </form>
                )}
            </div>
        </div>
    );
}