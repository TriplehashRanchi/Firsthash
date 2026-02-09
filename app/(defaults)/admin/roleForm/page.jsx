// File: app/memberForm/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Briefcase, Users, Star, Loader, Phone, Mail, Key, User, X, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAuth } from 'firebase/auth';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const RoleSelectionModal = ({ isOpen, onClose, availableRoles, initialSelectedRoles, onSave }) => {
    const [tempSelectedRoles, setTempSelectedRoles] = useState(initialSelectedRoles);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTempSelectedRoles(initialSelectedRoles);
            setSearchQuery('');
        }
    }, [isOpen, initialSelectedRoles]);

    const handleCheckboxChange = (roleId) => {
        const id = String(roleId);
        setTempSelectedRoles((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleSave = () => {
        onSave(tempSelectedRoles);
        onClose();
    };

    const filteredRoles = availableRoles.filter((role) => role.type_name?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-4 pb-4 border-b">
                        <h2 className="text-xl font-bold">Select Roles</h2>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="mb-4">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search roles..."
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto space-y-2 p-1">
                        {availableRoles.length > 0 && filteredRoles.length > 0 ? (
                            filteredRoles.map((role) => (
                                <label key={role.id} className="flex items-center p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        value={role.id}
                                        checked={tempSelectedRoles.includes(String(role.id))}
                                        onChange={() => handleCheckboxChange(role.id)}
                                        className="form-checkbox h-4 w-4 text-indigo-600 border-slate-400 rounded focus:ring-indigo-500"
                                    />
                                    <span className="ml-3 text-sm font-medium text-slate-800 dark:text-slate-200">{role.type_name}</span>
                                </label>
                            ))
                        ) : availableRoles.length > 0 ? (
                            <p className="text-sm text-center text-slate-500 p-4">No matching roles found.</p>
                        ) : (
                            <p className="text-sm text-center text-slate-500 p-4">No roles available for this category.</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-5 mt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500">
                            Cancel
                        </button>
                        <button type="button" onClick={handleSave} className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                            Confirm Selection
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default function MemberForm() {
    const { currentUser, company } = useAuth();
    const companyId = company?.id;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]);

    const categories = [
        { id: 'freelancer', label: 'Freelancer', icon: <Star size={20} className="text-yellow-500" /> },
        { id: 'inhouse', label: 'In-House', icon: <Users size={20} className="text-blue-500" /> },
        { id: 'manager', label: 'Manager', icon: <Briefcase size={20} className="text-purple-500" /> },
    ];

    const [category, setCategory] = useState('freelancer');
    const [subtypes, setSubtypes] = useState([]);

    const [fullName, setFullName] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [alternatePhone, setAlternatePhone] = useState('');

    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const handleSaveRoles = (newSelectedRoles) => {
        setSelectedRoles(newSelectedRoles);
    };

    useEffect(() => {
        if (!companyId) return;
        async function fetchTypes() {
            setLoading(true);
            setError(null);
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (!user) throw new Error('Not logged in');
                const token = await user.getIdToken();
                const res = await fetch(`${API_URL}/api/roles?company_id=${companyId}`, { headers: { Authorization: `Bearer ${token}` } });
                if (!res.ok) throw new Error(`Fetch error: ${res.statusText}`);
                const data = await res.json();
                setTypes(data);
            } catch (err) {
                console.error(err);
                setError('Could not load member types. Please try again later.');
            }
            setLoading(false);
        }
        fetchTypes();
    }, [companyId]);

    useEffect(() => {
        if (types.length === 0) return;
        let codes = [];
        if (category === 'freelancer') codes = [1, 2];
        else if (category === 'inhouse') codes = [0, 1, 2];
        const filtered = types.filter((t) => codes.includes(t.role_code));
        setSubtypes(filtered);
    }, [category, types]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        const admin = auth.currentUser;
        if (!admin) return toast.error('Admin not logged in');
        const token = await admin.getIdToken();

        // Map category to member_type code
        let member_type;
        if (category === 'manager') {
            member_type = 2;
        } else if (category === 'inhouse') {
            member_type = 1;
            if (selectedRoles.length === 0) return toast.error('Please select at least one role for the member.');
        } else if (category === 'freelancer') {
            member_type = 0;
            if (selectedRoles.length === 0) return toast.error('Please select at least one role for the member.');
        }

        if (password !== confirmPwd) return toast.error('Passwords do not match.');

        const payload = {
            member_type,
            role_ids: selectedRoles.map(Number),
            full_name: fullName,
            mobile_no: mobileNo,
            ...(alternatePhone && { alternate_phone: alternatePhone }),
            email,
            password,
            company_id: companyId,
            confirm_password: confirmPwd,
        };

        const toastId = toast.loading('Creating member...');
        try {
            const response = await fetch(`${API_URL}/api/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            console.log('response', response);
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || response.statusText);
            }
            toast.success('Member created successfully!', { id: toastId });
            setFullName('');
            setMobileNo('');
            setAlternatePhone('');
            setEmail('');
            setPassword('');
            setConfirmPwd('');
            setSelectedRoles([]);
        } catch (err) {
            console.error('Submission error:', err);
            toast.error(`Error: ${err.message}`, { id: toastId });
        }
    };

    const renderInputField = (id, label, type, value, setter, placeholder, icon, required = true) => (
        <div className="relative">
            <label htmlFor={id} className="block dark:text-gray-200 text-sm font-medium text-gray-600 mb-1">
                {label}
            </label>
            <div className="absolute inset-y-0 left-0 top-6 flex items-center pl-3 pointer-events-none">{icon}</div>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                className="form-input dark:text-gray-200 w-full border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                required={required}
            />
        </div>
    );

    return (
        <>
            <div className="min-h-screen flex items-center justify-center p-1">
                <div className="rounded-xl p-8 md:p-12 w-full max-w-4xl">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="bg-indigo-100 p-3 dark:bg-gray-900 rounded-full mb-3">
                            <UserPlus size={32} className="text-indigo-600" />
                        </div>
                        <h1 className="text-3xl font-bold dark:text-gray-200 text-gray-800">Create New Member</h1>
                        <p className="text-gray-500 dark:text-gray-200 mt-1">Fill out the form to add a new member to the team.</p>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader className="animate-spin text-indigo-500" size={40} />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
                                <div>
                                    <label className="block text-sm font-medium dark:text-gray-200 mb-2">Member Category</label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => {
                                                    setCategory(cat.id);
                                                    setSelectedRoles([]);
                                                }}
                                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all whitespace-nowrap
          ${
              category === cat.id
                  ? 'bg-indigo-50 dark:bg-slate-800 dark:text-white border-indigo-500 text-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-700 border-gray-300 text-gray-500 hover:border-gray-400 dark:text-gray-100'
          }`}
                                            >
                                                {cat.icon}
                                                <span className="font-semibold">{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {category !== 'manager' && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium dark:text-gray-200 text-gray-600 mb-1">
                                            Specific Roles <span className="text-gray-500 dark:text-gray-200 text-xs">(select one or more)</span>
                                        </label>
                                        <div className="relative">
                                            {/* CHANGED: This button now opens the modal */}
                                            <button
                                                type="button"
                                                onClick={() => setIsRoleModalOpen(true)}
                                                className="w-full dark:text-gray-200 px-4 py-2 border rounded-md text-left bg-white dark:bg-slate-800 hover:bg-gray-50 focus:outline-none focus:ring"
                                            >
                                                {selectedRoles.length > 0 ? `${selectedRoles.length} role(s) selected` : 'Click to select roles...'}
                                            </button>
                                            {/* REMOVED: The old dropdown UI has been deleted from here */}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 dark:text-gray-200  md:grid-cols-2 gap-8 border-t pt-8">
                                {renderInputField('fullName', 'Full Name', 'text', fullName, setFullName, 'John Doe', <User size={16} className="text-gray-400 dark:text-gray-200" />)}
                                {renderInputField('mobileNo', 'Mobile No.', 'tel', mobileNo, setMobileNo, '123-456-7890', <Phone size={16} className="text-gray-400 dark:text-gray-200" />)}
                                {renderInputField(
                                    'alternatePhone',
                                    'Alternate Phone No.',
                                    'tel',
                                    alternatePhone,
                                    setAlternatePhone,
                                    '987-654-3210',
                                    <Phone size={16} className="text-gray-400 dark:text-gray-200" />,
                                    false,
                                )}
                                {renderInputField('email', 'Email Address', 'email', email, setEmail, 'email@example.com', <Mail size={16} className="text-gray-400 dark:text-gray-200" />)}
                                {renderInputField('password', 'Password', 'password', password, setPassword, '••••••••', <Key size={16} className="text-gray-400 dark:text-gray-200" />)}
                                {renderInputField('confirmPwd', 'Confirm Password', 'password', confirmPwd, setConfirmPwd, '••••••••', <Key size={16} className="text-gray-400 dark:text-gray-200" />)}
                            </div>
                            <div className="flex justify-end pt-8 border-t">
                                <button
                                    type="submit"
                                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105"
                                >
                                    <UserPlus size={20} />
                                    Add Member
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* ADDED: The RoleSelectionModal component is rendered here. It will only be visible when isRoleModalOpen is true. */}
            <RoleSelectionModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} availableRoles={subtypes} initialSelectedRoles={selectedRoles} onSave={handleSaveRoles} />
        </>
    );
}
