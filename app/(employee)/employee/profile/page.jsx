'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { getAuth, updateProfile } from 'firebase/auth';
import { Loader2, Mail, Phone, Upload, X, Save, Edit3, User, Landmark } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// --- Helper Functions ---
const getAuthHeaders = async () => {
  const auth = getAuth();
  const u = auth.currentUser;
  if (!u) return {};
  const token = await u.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

const prettyType = (t) => {
  const map = { 0: 'Freelancer', 1: 'In‑house', 2: 'Manager' };
  return t === null || t === undefined ? '—' : (map?.[t] ?? String(t));
};

// --- UI Components ---
const Avatar = ({ name, photoURL }) => {
  const initials = useMemo(() => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'U';
  }, [name]);

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name || 'User'}
        className="mx-auto h-20 w-20 rounded-full object-cover md:h-32 md:w-32"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  }
  return (
    <div
      className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-2xl font-semibold text-gray-700 md:h-32 md:w-32"
      title={name || 'User'}
    >
      {initials}
    </div>
  );
};

// --- Main Profile Page Component ---
export default function EmployeeMyProfilePage() {
  const [tabs, setTabs] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [bank, setBank] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [draftProfile, setDraftProfile] = useState({ name: '', phone: '', address: '' });
  const [draftBank, setDraftBank] = useState({
    account_holder: '', bank_name: '', branch_name: '', ifsc_code: '',
    account_number: '', account_type: '', upi_id: ''
  });

  const auth = getAuth();
  const photoURL = auth.currentUser?.photoURL || null;

  const fetchData = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const headers = await getAuthHeaders();

      const [pRes, bRes] = await Promise.all([
        axios.get(`${API_URL}/api/self/profile`, { headers }),
        axios.get(`${API_URL}/api/self/payment-details`, { headers }),
      ]);

      const prof = pRes.data || null;
      const bankd = bRes.data || null;

      setProfile(prof);
      setBank(bankd);

      // Preload drafts for editing
      setDraftProfile({
        name: prof?.name || '',
        phone: prof?.phone || '',
        address: prof?.address || '',
      });
      setDraftBank({
        account_holder: bankd?.account_holder || (prof?.name || ''),
        bank_name: bankd?.bank_name || '',
        branch_name: bankd?.branch_name || '',
        ifsc_code: bankd?.ifsc_code || '',
        account_number: bankd?.account_number || '',
        account_type: bankd?.account_type || '',
        upi_id: bankd?.upi_id || '',
      });
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const u = auth.currentUser;
      if (!u) throw new Error('Not logged in');

      const form = new FormData();
      form.append('file', file);
      form.append('uploadType', 'employee_photos');

      const headers = await getAuthHeaders();
      const res = await axios.post(`${API_URL}/api/uploads`, form, { headers });
      const url = res?.data?.url;
      if (!url) throw new Error('Upload failed: url missing');

      await updateProfile(u, { photoURL: url });
      e.target.value = '';
      alert('Profile photo updated successfully!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to upload/update photo.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleProfileChange = (e) => setDraftProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleBankChange = (e) => setDraftBank((b) => ({ ...b, [e.target.name]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const headers = await getAuthHeaders();
      const res = await axios.put(`${API_URL}/api/self/profile`, draftProfile, { headers });
      setProfile(res.data);
      setIsEditingProfile(false);
      alert('Profile details saved.');
    } catch (err) {
      console.error(err);
      alert('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const saveBank = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const headers = await getAuthHeaders();
      await axios.put(`${API_URL}/api/self/payment-details`, draftBank, { headers });
      setBank({ ...draftBank });
      setIsEditingBank(false);
      alert('Bank details saved.');
    } catch (err) {
      console.error(err);
      alert('Failed to save bank details.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        <span>Loading your profile…</span>
      </div>
    );
  }

  if (error) {
    return <div className="panel m-4 bg-red-100 border border-red-300 text-red-700 p-4">{error}</div>;
  }

  if (!profile) {
    return <div className="panel m-4 bg-yellow-100 border border-yellow-300 text-yellow-700 p-4">No profile found.</div>;
  }


  return (
    <div className="pt-5">
      <div className="mb-5 flex items-center justify-between">
        <h5 className="text-lg font-semibold dark:text-white-light">My Profile Settings</h5>
      </div>
      <div>
        <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
          <li className="inline-block">
            <button
              onClick={() => setTabs('profile')}
              className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${tabs === 'profile' ? '!border-primary text-primary' : ''}`}
            >
              <User /> Employee Profile
            </button>
          </li>
          <li className="inline-block">
            <button
              onClick={() => setTabs('bank')}
              className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${tabs === 'bank' ? '!border-primary text-primary' : ''}`}
            >
              <Landmark /> Bank Details
            </button>
          </li>
        </ul>
      </div>

      {tabs === 'profile' ? (
        <div className="panel">
            <form onSubmit={saveProfile}>
                <h6 className="mb-5 text-lg font-bold">General Information</h6>
                <div className="flex flex-col sm:flex-row">
                    <div className="mb-5 w-full sm:w-2/12 ltr:sm:mr-4 rtl:sm:ml-4">
                        <div className="flex flex-col items-center">
                            <label htmlFor="photoUpload" className="mb-2 cursor-pointer" title="Click to change photo">
                                <Avatar name={profile.name} photoURL={photoURL} />
                            </label>
                            <input id="photoUpload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                            {uploading && <div className="mt-2 text-sm text-blue-500">Uploading...</div>}
                        </div>
                    </div>
                    <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label htmlFor="name">Full Name</label>
                            <input id="name" name="name" type="text" placeholder="Your Name" className="form-input" value={draftProfile.name} onChange={handleProfileChange} />
                        </div>
                        <div>
                            <label htmlFor="phone">Phone</label>
                            <input id="phone" name="phone" type="text" placeholder="Your Phone Number" className="form-input" value={draftProfile.phone} onChange={handleProfileChange} />
                        </div>
                         <div>
                            <label htmlFor="address">Address</label>
                            <input id="address" name="address" type="text" placeholder="Your Address" className="form-input" value={draftProfile.address} onChange={handleProfileChange} />
                        </div>
                        <div>
                            <label htmlFor="email">Email (Cannot be changed)</label>
                            <input id="email" name="email" type="email" placeholder="Your Login Email" className="form-input bg-gray-100 dark:bg-gray-700" value={profile.email || ''} readOnly disabled />
                        </div>
                        <div className="mt-3 sm:col-span-2">
                            <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
      ) : null}

      {tabs === 'bank' ? (
         <div className="panel">
            <form onSubmit={saveBank}>
                 <h5 className="mb-4 text-lg font-semibold">Banking Information</h5>
                 <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div><label htmlFor="account_holder">Account Holder</label><input id="account_holder" name="account_holder" type="text" className="form-input" value={draftBank.account_holder} onChange={handleBankChange} /></div>
                    <div><label htmlFor="bank_name">Bank Name</label><input id="bank_name" name="bank_name" type="text" className="form-input" value={draftBank.bank_name} onChange={handleBankChange} /></div>
                    <div><label htmlFor="branch_name">Branch</label><input id="branch_name" name="branch_name" type="text" className="form-input" value={draftBank.branch_name} onChange={handleBankChange} /></div>
                    <div><label htmlFor="ifsc_code">IFSC Code</label><input id="ifsc_code" name="ifsc_code" type="text" className="form-input" value={draftBank.ifsc_code} onChange={handleBankChange} /></div>
                    <div><label htmlFor="account_number">Account Number</label><input id="account_number" name="account_number" type="text" className="form-input" value={draftBank.account_number} onChange={handleBankChange} /></div>
                    <div><label htmlFor="account_type">Account Type</label><input id="account_type" name="account_type" type="text" className="form-input" value={draftBank.account_type} onChange={handleBankChange} /></div>
                    <div><label htmlFor="upi_id">UPI ID</label><input id="upi_id" name="upi_id" type="text" className="form-input" value={draftBank.upi_id} onChange={handleBankChange} /></div>
                 </div>
                 <div className="mt-5 flex justify-end">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                         {saving ? 'Saving...' : 'Save Bank Details'}
                    </button>
                 </div>
            </form>
        </div>
      ) : null}

    </div>
  );
}