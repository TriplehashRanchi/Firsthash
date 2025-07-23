// File: app/memberForm/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Briefcase, Users, Star, Loader, Phone, Mail, Key, User } from 'lucide-react';

export default function MemberForm() {
  const GLOBAL_ID = '00000000-0000-0000-0000-000000000000';
  const companyId = GLOBAL_ID; // adjust if dynamic

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // First-level category options with icons
  const categories = [
    { id: 'freelancer', label: 'Freelancer', icon: <Star size={20} className="text-yellow-500" /> },
    { id: 'inhouse',    label: 'In-House',   icon: <Users size={20} className="text-blue-500" /> },
    { id: 'manager',    label: 'Manager',    icon: <Briefcase size={20} className="text-purple-500" /> },
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

  // Fetch all role types from backend
  useEffect(() => {
    async function fetchTypes() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8080/api/roles?company_id=${companyId}`);
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
    if (category === 'freelancer') codes = [1, 2]; // On Production, Post Production
    else if (category === 'inhouse') codes = [0, 1, 2]; // Manager, On Production, Post Production
    // For 'manager' category, subtype dropdown is hidden, so no codes needed here.

    const filtered = types.filter(t => codes.includes(t.role_code));
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
      if (password !== confirmPwd) {
        alert('Passwords do not match. Please re-enter.');
        return;
      }
      if (!subtype && category !== 'manager') {
        alert('Please select a role for the member.');
        return;
      }

      // pick the right roleId…
      const roleId = category === 'manager'
        ? types.find(t => t.role_code === 0)?.id
        : subtype;

      if (!roleId) {
        alert('A valid role could not be assigned.');
        return;
      }

     const payload = {
       category,            // <–– send it!
       member_type: roleId,
       full_name:  fullName,
       mobile_no:  mobileNo,
       email,
       password,
     };

      try {
        const response = await fetch('http://localhost:8080/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || response.statusText);
        }
        alert('Member saved successfully!');
        // reset form…
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
      <div className="absolute inset-y-0 left-0 top-6 flex items-center pl-3 pointer-events-none">
        {icon}
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => setter(e.target.value)}
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
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        category === cat.id
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm'
                          : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      {cat.icon}
                      <span className="font-semibold">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {category !== 'manager' && (
                <div>
                  <label htmlFor="subtype" className="block text-sm font-medium text-gray-600 mb-2">
                    Specific Role
                  </label>
                  <select
                    id="subtype"
                    value={subtype}
                    onChange={e => setSubtype(e.target.value)}
                    className="w-full border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    required={category !== 'manager'}
                    disabled={subtypes.length === 0}
                  >
                    {subtypes.length > 0 ? (
                        subtypes.map(st => (
                            <option key={st.id} value={st.id}>{st.type_name}</option>
                        ))
                    ) : (
                        <option>No roles available for this category</option>
                    )}
                  </select>
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