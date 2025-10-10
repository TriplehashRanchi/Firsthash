'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { BriefcaseBusiness, Icon, Mail, MapPin, MoveLeft, PhoneIcon, Smartphone, User } from 'lucide-react';

// --- Configuration ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const TYPE_OPTIONS = [
    { value: 0, label: 'Freelancer' },
    { value: 1, label: 'In-house' },
    { value: 2, label: 'Manager' },
];
const ACCOUNT_TYPES = [
    { value: 'savings', label: 'Savings' },
    { value: 'current', label: 'Current' },
];

const Toast = ({ message, type, onClose }) => {
    if (!message) return null;

    const typeStyles = {
        success: {
            bg: 'bg-emerald-500',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                />
            ),
        },
        error: {
            bg: 'bg-rose-500',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                />
            ),
        },
    };

    const current = typeStyles[type] || typeStyles.success;

    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-5 right-5 flex items-center p-4 rounded-lg shadow-2xl text-white z-[100] ${current.bg}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 flex-shrink-0">
                {current.icon}
            </svg>
            <span>{message}</span>
        </div>
    );
};

const FormCard = ({ title, description, children }) => (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm mb-8">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const InputField = ({ label, icon, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
        <div className="relative">
            {icon && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">{icon}</div>}
            <input
                {...props}
                className={`w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 ${icon ? 'pl-10' : ''}`}
            />
        </div>
    </div>
);

const SelectField = ({ label, icon, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
        <div className="relative">
            {icon && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">{icon}</div>}
            <select
                {...props}
                className={`w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 appearance-none ${icon ? 'pl-10' : ''}`}
            >
                {children}
            </select>
        </div>
    </div>
);

const SaveButton = ({ isLoading, children }) => (
    <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400/80 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-100"
    >
        {isLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2.5"></div>}
        {isLoading ? 'Saving...' : children}
    </button>
);

const RolesModal = ({ roles, selectedRoles, setSelectedRoles, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredRoles = useMemo(() => roles.filter((role) => role.type_name.toLowerCase().includes(searchTerm.toLowerCase())), [roles, searchTerm]);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-95" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-2 dark:text-slate-100">Select Roles</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Assign one or more functional roles to this member.</p>
                <InputField placeholder="Search roles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 mt-4">
                    {filteredRoles.map((role) => (
                        <label
                            key={role.id}
                            htmlFor={`role-${role.id}`}
                            className="flex items-center p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors duration-150"
                        >
                            <input
                                type="checkbox"
                                id={`role-${role.id}`}
                                checked={selectedRoles.includes(role.id)}
                                onChange={() => setSelectedRoles((prev) => (prev.includes(role.id) ? prev.filter((id) => id !== role.id) : [...prev, role.id]))}
                                className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-3 text-sm font-medium text-slate-800 dark:text-slate-300">{role.type_name}</span>
                        </label>
                    ))}
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---

export default function MemberEditPage() {
    const router = useRouter();
    const { id } = useParams();

    const [form, setForm] = useState({ full_name: '', email: '', phone: '', alternate_phone: '', employee_type: 1, address: '', salary: '' });
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [bankForm, setBankForm] = useState({ bank_name: '', branch_name: '', ifsc_code: '', account_number: '', account_holder: '', account_type: 'savings', upi_id: '' });
    const [allRoles, setAllRoles] = useState([]);
    const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [bankLoading, setBankLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });

    useEffect(() => {
        // ... (Data fetching logic remains the same as your previous correct version)
        if (!id) return;
        const fetchInitialData = async () => {
            const user = getAuth().currentUser;
            if (!user) {
                setToast({ message: 'Authentication failed. Please log in.', type: 'error' });
                setPageLoading(false);
                return;
            }
            const token = await user.getIdToken();
            try {
                const [rolesRes, memberRes, bankRes] = await Promise.all([
                    axios.get(`${API_URL}/api/roles`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/api/members/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/api/members/${id}/payment-details`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                setAllRoles(rolesRes.data);
                const memberData = memberRes.data;
                setForm({
                    full_name: memberData.name || '',
                    email: memberData.email || '',
                    phone: memberData.phone || '',
                    alternate_phone: memberData.alternate_phone || '',
                    employee_type: memberData.employee_type,
                    address: memberData.address || '',
                    salary: memberData.salary || null,
                });
                let rolesToSet = [];
                if (memberData.roles && typeof memberData.roles === 'string') {
                    try {
                        rolesToSet = JSON.parse(memberData.roles).map((r) => r.role_id);
                    } catch (e) {
                        console.error('Failed to parse roles:', e);
                    }
                } else if (memberData.roles && Array.isArray(memberData.roles)) {
                    rolesToSet = memberData.roles.map((r) => r.role_id);
                } else if (memberData.role_id) {
                    rolesToSet = [memberData.role_id];
                }
                setSelectedRoles(rolesToSet);
                if (bankRes.data && Object.keys(bankRes.data).length > 0) setBankForm(bankRes.data);
            } catch (err) {
                console.error('Error loading data:', err);
                setToast({ message: err.response?.data?.error || 'Failed to load member data.', type: 'error' });
            } finally {
                setPageLoading(false);
            }
        };
        fetchInitialData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const val = name === 'employee_type' || name === 'salary' ? Number(value) || '' : value;
        setForm((prev) => ({ ...prev, [name]: val }));
    };

    const handleBankChange = (e) => {
        setBankForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Roles are now optional, so no validation check is needed here
        const user = getAuth().currentUser;
        if (!user) {
            setToast({ message: 'Admin not logged in.', type: 'error' });
            return;
        }
        setFormLoading(true);
        try {
            const token = await user.getIdToken();
            const payload = {
                ...form,
                salary: [0, 1, 2].includes(form.employee_type) ? form.salary || null : null,
                alternate_phone: form.alternate_phone || null,
                address: form.address || null,
                roles: selectedRoles,
            };
            await axios.put(`${API_URL}/api/members/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            setToast({ message: 'Member details saved successfully!', type: 'success' });
        } catch (err) {
            console.error(err);
            setToast({ message: err.response?.data?.error || 'Failed to save member details.', type: 'error' });
        } finally {
            setFormLoading(false);
        }
    };

    const handleBankSubmit = async (e) => {
        e.preventDefault();
        const user = getAuth().currentUser;
        if (!user) {
            setToast({ message: 'Admin not logged in', type: 'error' });
            return;
        }
        setBankLoading(true);
        try {
            const token = await user.getIdToken();
            await axios.put(`${API_URL}/api/members/${id}/payment-details`, bankForm, { headers: { Authorization: `Bearer ${token}` } });
            setToast({ message: 'Payment details saved!', type: 'success' });
        } catch (err) {
            console.error(err);
            setToast({ message: err.response?.data?.error || 'Failed to save payment details.', type: 'error' });
        } finally {
            setBankLoading(false);
        }
    };

    const getRolesButtonText = () => {
        if (selectedRoles.length === 0) return 'Select roles...';
        if (allRoles.length > 0) {
            const firstRole = allRoles.find((role) => role.id === selectedRoles[0]);
            if (firstRole) {
                return selectedRoles.length === 1 ? firstRole.type_name : `${firstRole.type_name} +${selectedRoles.length - 1} more`;
            }
        }
        return `${selectedRoles.length} role(s) selected`;
    };

    // Show salary/payment forms for In-house (1) and Manager (2)
    const showSensitiveForms = [0, 1, 2].includes(form.employee_type);

    if (pageLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-900">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
            {isRolesModalOpen && <RolesModal roles={allRoles} selectedRoles={selectedRoles} setSelectedRoles={setSelectedRoles} onClose={() => setIsRolesModalOpen(false)} />}

            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 px-6 py-4 sticky top-0 z-40">
                <div className="flex items-center justify-between max-w-5xl mx-auto">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Edit Member</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Updating profile for <span className="font-semibold text-blue-600">{form.full_name || '...'}</span>
                        </p>
                    </div>
                    <button onClick={() => router.back()} className="px-4 py-2">
                        <MoveLeft />
                    </button>
                </div>
            </header>

            <main className="p-4 sm:p-6 max-w-5xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <FormCard title="Personal & Employment Details" description="Manage the member's personal information, employment type, and functional roles.">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                            <InputField label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} required icon={<User className="w-4 h-4 " />} />
                            <InputField label="Email Address" type="email" name="email" value={form.email} onChange={handleChange} required icon={<Mail className="w-4 h-4 " />} />
                            <InputField label="Mobile Number" name="phone" value={form.phone} onChange={handleChange} required icon={<PhoneIcon className="w-4 h-4 " />} />
                            <InputField label="Alternate Mobile" name="alternate_phone" value={form.alternate_phone} onChange={handleChange} icon={<Smartphone className="w-4 h-4 " />} />
                            <div className="md:col-span-2">
                                <InputField label="Address" name="address" value={form.address} onChange={handleChange} icon={<MapPin className="w-4 h-4 " />} />
                            </div>
                            <SelectField label="Employment Type" name="employee_type" value={form.employee_type} onChange={handleChange} icon={<BriefcaseBusiness className="w-4 h-4" />}>
                                {TYPE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </SelectField>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Roles</label>
                                <button
                                    type="button"
                                    onClick={() => setIsRolesModalOpen(true)}
                                    className="w-full text-left px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 truncate transition-colors"
                                >
                                    {getRolesButtonText()}
                                </button>
                            </div>
                            {showSensitiveForms && (
                                <div className="md:col-span-2">
                                    <InputField label="Salary" type="number" name="salary" placeholder="e.g., 50000" value={form.salary} onChange={handleChange} />
                                </div>
                            )}
                        </div>
                        <div className="mt-8 flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
                            <SaveButton isLoading={formLoading}>Save Changes</SaveButton>
                        </div>
                    </FormCard>
                </form>

                {showSensitiveForms && (
                    <form onSubmit={handleBankSubmit}>
                        <FormCard title="Payment Details" description="Bank account information for salary and reimbursements. This information is stored securely.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                <InputField label="Bank Name" name="bank_name" value={bankForm.bank_name} onChange={handleBankChange} required />
                                <InputField label="Branch Name" name="branch_name" value={bankForm.branch_name} onChange={handleBankChange} required />
                                <InputField label="IFSC Code" name="ifsc_code" value={bankForm.ifsc_code} onChange={handleBankChange} required />
                                <InputField label="Account Number" name="account_number" value={bankForm.account_number} onChange={handleBankChange} required />
                                <InputField label="Account Holder Name" name="account_holder" value={bankForm.account_holder} onChange={handleBankChange} required />
                                <SelectField label="Account Type" name="account_type" value={bankForm.account_type} onChange={handleBankChange} required>
                                    {ACCOUNT_TYPES.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </SelectField>
                                <div className="md:col-span-2">
                                    <InputField label="UPI ID (Optional)" name="upi_id" value={bankForm.upi_id} onChange={handleBankChange} />
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
                                <SaveButton isLoading={bankLoading}>Save Payment Details</SaveButton>
                            </div>
                        </FormCard>
                    </form>
                )}
            </main>
        </div>
    );
}
