// File: app/memberForm/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Briefcase, Users, Star, Loader, Phone, Mail, Key, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAuth } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function MemberForm() {
    const { currentUser, company } = useAuth();
    console.log('Company:', company);
    console.log('Current user:', currentUser);
    const GLOBAL_ID = '00000000-0000-0000-0000-000000000000';
    const companyId = company.id; // adjust if dynamic

    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]);

    // First-level category options with icons
    const categories = [
        { id: 'freelancer', label: 'Freelancer', icon: <Star size={20} className="text-yellow-500" /> },
        { id: 'inhouse', label: 'In-House', icon: <Users size={20} className="text-blue-500" /> },
        { id: 'manager', label: 'Manager', icon: <Briefcase size={20} className="text-purple-500" /> },
    ];

    const [category, setCategory] = useState('freelancer');
    const [subtypes, setSubtypes] = useState([]);

    // Form fields state
    const [subtype, setSubtype] = useState('');
    const [fullName, setFullName] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [showRoles, setShowRoles] = useState(false);

    // Fetch all role types from backend
    useEffect(() => {
        async function fetchTypes() {
            setLoading(true);
            setError(null);
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (!user) throw new Error('Not logged in');
                const token = await user.getIdToken();

                const res = await fetch(`http://localhost:8080/api/roles?company_id=${companyId}`, { headers: { Authorization: `Bearer ${token}` } });

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

    // Update subtypes when category or types change
    useEffect(() => {
        if (types.length === 0) return;

        let codes = [];
        if (category === 'freelancer')
            codes = [1, 2]; // On Production, Post Production
        else if (category === 'inhouse') codes = [0, 1, 2]; // Manager, On Production, Post Production
        // For 'manager' category, subtype dropdown is hidden, so no codes needed here.

        const filtered = types.filter((t) => codes.includes(t.role_code));
        setSubtypes(filtered);

        // Set a default subtype when the list changes
        if (filtered.length > 0) {
            setSubtype(String(filtered[0].id));
        } else {
            setSubtype('');
        }
    }, [category, types]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const auth = getAuth();
        const admin = auth.currentUser;
        if (!admin) toast.error('Admin not logged in');
        const token = await admin.getIdToken();

        if (selectedRoles.length === 0) {
            alert('Please select at least one role.');
            return;
        }
        if (password !== confirmPwd) {
            alert('Passwords do not match. Please re-enter.');
            return;
        }
        if (!subtype && category !== 'manager') {
            alert('Please select a role for the member.');
            return;
        }

        // pick the right roleId…
        const roleId = category === 'manager' ? types.find((t) => t.role_code === 0)?.id : subtype;

        if (!roleId) {
            alert('A valid role could not be assigned.');
            return;
        }

        const payload = {
            member_type: Number(roleId), // instead of category
            role_ids: selectedRoles.map(Number),
            full_name: fullName,
            mobile_no: mobileNo,
            email,
            password,
            company_id: companyId,
            confirm_password: confirmPwd, // instead of confirmPwd
        };

        try {
            const response = await fetch('http://localhost:8080/api/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || response.statusText);
            }
            toast.success('Member created!');
            // reset
            setFullName('');
            setMobileNo('');
            setEmail('');
            setPassword('');
            setConfirmPwd('');
            setSelectedRoles([]);
        } catch (err) {
            console.error('Submission error:', err);
            alert(`Error: ${err.message}`);
        }
    };

    const renderInputField = (id, label, type, value, setter, placeholder, icon) => (
        <div className="relative">
            <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">
                {label}
            </label>
            <div className="absolute inset-y-0 left-0 top-6 flex items-center pl-3 pointer-events-none">{icon}</div>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                className="form-input w-full border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                required
            />
        </div>
    );

    return (
        <div className="min-h-screen  flex items-center justify-center p-1">
            <div className=" rounded-xl p-8 md:p-12 w-full max-w-4xl">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="bg-indigo-100 p-3 rounded-full mb-3">
                        <UserPlus size={32} className="text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Create New Member</h1>
                    <p className="text-gray-500 mt-1">Fill out the form to add a new member to the team.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader className="animate-spin text-indigo-500" size={40} />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* --- Category & Role Selection --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Member Category</label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategory(cat.id)}
                                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                                category === cat.id ? 'bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm' : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
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
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Specific Roles <span className="text-gray-500 text-xs">(select one or more)</span>
                                    </label>

                                    <div className="relative">
                                        <button
                                            onClick={() => setShowRoles(!showRoles)}
                                            className="w-full px-4 py-2 border rounded-md text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring"
                                        >
                                            {selectedRoles.length > 0 ? `${selectedRoles.length} role(s) selected` : 'Select roles...'}
                                        </button>

                                        {showRoles && (
                                            <div className="mt-2 p-3 border rounded-md bg-gray-50 max-h-60 overflow-y-auto space-y-2">
                                                {subtypes.length > 0 ? (
                                                    subtypes.map((t) => (
                                                        <label key={t.id} className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                value={t.id}
                                                                checked={selectedRoles.includes(String(t.id))}
                                                                onChange={(e) => {
                                                                    const id = e.target.value;
                                                                    setSelectedRoles((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
                                                                }}
                                                                className="form-checkbox h-4 w-4 text-indigo-600"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">{t.type_name}</span>
                                                        </label>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-500">No roles available for this category</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* --- Personal & Account Information --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
                            {renderInputField('fullName', 'Full Name', 'text', fullName, setFullName, 'John Doe', <User size={16} className="text-gray-400" />)}
                            {renderInputField('mobileNo', 'Mobile No.', 'tel', mobileNo, setMobileNo, '123-456-7890', <Phone size={16} className="text-gray-400" />)}
                            {renderInputField('email', 'Email Address', 'email', email, setEmail, 'email@example.com', <Mail size={16} className="text-gray-400" />)}
                            {renderInputField('password', 'Password', 'password', password, setPassword, '••••••••', <Key size={16} className="text-gray-400" />)}
                            {renderInputField('confirmPwd', 'Confirm Password', 'password', confirmPwd, setConfirmPwd, '••••••••', <Key size={16} className="text-gray-400" />)}
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
    );
}
