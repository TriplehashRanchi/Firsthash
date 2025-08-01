'use client';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

// Import your icon components
import IconDollarSignCircle from '@/components/icon/icon-dollar-sign-circle';
import IconFacebook from '@/components/icon/icon-facebook';
import IconGithub from '@/components/icon/icon-github';
import IconHome from '@/components/icon/icon-home';
import IconLinkedin from '@/components/icon/icon-linkedin';
import IconTwitter from '@/components/icon/icon-twitter';

// Define TypeScript interfaces for your data
interface AdminData {
    name: string;
    email: string;
    phone: string;
    photo: string;
}

interface CompanyData {
    id?: string;
    name: string;
    logo: string;
    country: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    pincode: string;
    tax_id: string;
    upi_id: string;
    bank_name: string;
    bank_account_number: string;
    bank_ifsc_code: string;
    payment_qr_code_url: string;
    owner_admin_uid?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const ComponentsUsersAccountSettingsTabs = () => {
    const [tabs, setTabs] = useState<string>('home');
    const toggleTabs = (name: string) => setTabs(name);

    // --- State Management for BOTH Admin and Company ---
    const [firebase_uid, setFirebaseUid] = useState<string | null>(null);
    const [adminData, setAdminData] = useState<Partial<AdminData>>({});
    const [companyData, setCompanyData] = useState<Partial<CompanyData>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    // --- Auth Listener and Secure Request Helper ---
    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user: User | null) => {
            if (user) {
                setFirebaseUid(user.uid);
            } else {
                setFirebaseUid(null);
                setLoading(false);
                setError("Please log in to manage your profile.");
            }
        });
    }, []);

    const withAuth = async (isMultipart = false) => {
        const user = getAuth().currentUser;
        if (!user) throw new Error('User not logged in');
        const token = await user.getIdToken();
        return {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
            },
        };
    };

    // --- Fetch BOTH Admin and Company Data Concurrently ---
    useEffect(() => {
        if (!firebase_uid) return;
        
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [adminRes, companyRes] = await Promise.all([
                    axios.get(`${API_URL}/api/admins/profile`, await withAuth()),
                    axios.get(`${API_URL}/api/company/by-uid/${firebase_uid}`, await withAuth())
                ]);
                setAdminData(adminRes.data);
                setCompanyData(companyRes.data);
            } catch (err: any) {
                 setError('Failed to fetch profile data. Please refresh the page.');
                 console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [firebase_uid]);

    // --- Handlers for Admin Profile ("Home" Tab) ---
    const handleAdminInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAdminData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAdminPhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uploadType', 'admin_photos');

        try {
            const res = await axios.post(`${API_URL}/api/uploads`, formData, await withAuth(true));
            setAdminData(prev => ({ ...prev, photo: res.data.url }));
            alert('Photo uploaded! Click "Save Admin Profile" to finalize.');
        } catch (err) {
            setError("Failed to upload photo.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleAdminProfileSave = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.put(`${API_URL}/api/admins/profile`, adminData, await withAuth());
            setAdminData(res.data);
            alert('Admin profile saved successfully!');
        } catch (err) {
            alert('Failed to save admin profile.');
            console.error(err);
        }
    };
    
    // --- Handlers for Company Profile ("Company Profile" Tab) ---
    const handleCompanyInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCompanyData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uploadType', 'logos');
        try {
            const res = await axios.post(`${API_URL}/api/uploads`, formData, await withAuth(true));
            setCompanyData(prev => ({ ...prev, logo: res.data.url }));
            alert('Logo uploaded! Click "Save Company Changes" to finalize.');
        } catch (err) {
            setError("Failed to upload logo.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleQrCodeChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uploadType', 'qrcodes'); // Organize QR codes in their own folder on the backend

        try {
            const res = await axios.post(`${API_URL}/api/uploads`, formData, await withAuth(true));
            // Update the companyData state with the new QR code URL
            setCompanyData(prev => ({ ...prev, payment_qr_code_url: res.data.url }));
            alert('QR Code uploaded! Click "Save Company Changes" to finalize.');
        } catch (err) {
            setError("Failed to upload QR code.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleCompanySaveChanges = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.put(`${API_URL}/api/company/by-uid/${firebase_uid}`, companyData, await withAuth());
            setCompanyData(res.data);
            alert('Company profile saved successfully!');
        } catch (err) {
            setError('Failed to save company profile.');
        }
    };

    return (
        <div className="pt-5">
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">Settings</h5>
            </div>
            <div>
                 <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
                    <li className="inline-block">
                        <button onClick={() => toggleTabs('home')} className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${tabs === 'home' ? '!border-primary text-primary' : ''}`}>
                            <IconHome /> Admin Profile
                        </button>
                    </li>
                    <li className="inline-block">
                        <button onClick={() => toggleTabs('payment-details')} className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${tabs === 'payment-details' ? '!border-primary text-primary' : ''}`}>
                            <IconDollarSignCircle /> Company Profile
                        </button>
                    </li>
                </ul>
            </div>
            {tabs === 'home' ? (
                <div>
                    {loading ? <div className="panel">Loading Profile...</div> : (
                        <form onSubmit={handleAdminProfileSave} className="mb-5 rounded-md border border-[#ebedf2] bg-white p-4 dark:border-[#191e3a] dark:bg-black">
                            <h6 className="mb-5 text-lg font-bold">General Information</h6>
                            <div className="flex flex-col sm:flex-row">
                                <div className="mb-5 w-full sm:w-2/12 ltr:sm:mr-4 rtl:sm:ml-4">
                                    <div className="flex flex-col items-center">
                                        <label htmlFor="adminPhotoUpload" className="mb-2 cursor-pointer" title="Click to change photo">
                                            <img src={adminData.photo || '/assets/images/profile-34.jpeg'} alt="Admin Profile" className="mx-auto h-20 w-20 rounded-full object-cover md:h-32 md:w-32" />
                                        </label>
                                        <input id="adminPhotoUpload" type="file" accept="image/*" className="hidden" onChange={handleAdminPhotoChange} disabled={isUploading} />
                                        {isUploading && <div className="mt-2 text-sm text-blue-500">Uploading...</div>}
                                    </div>
                                </div>
                                <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="adminName">Full Name</label>
                                        <input id="adminName" name="name" type="text" placeholder="Your Name" className="form-input" value={adminData.name || ''} onChange={handleAdminInputChange} />
                                    </div>
                                    <div>
                                        <label htmlFor="adminPhone">Phone</label>
                                        <input id="adminPhone" name="phone" type="text" placeholder="Your Phone Number" className="form-input" value={adminData.phone || ''} onChange={handleAdminInputChange} />
                                    </div>
                                    <div>
                                        <label htmlFor="adminEmail">Email (Cannot be changed)</label>
                                        <input id="adminEmail" name="email" type="email" placeholder="Your Login Email" className="form-input bg-gray-100 dark:bg-gray-700" value={adminData.email || ''} readOnly disabled />
                                    </div>
                                    <div className="mt-3 sm:col-span-2">
                                        <button type="submit" className="btn btn-primary" disabled={isUploading}>
                                            {isUploading ? 'Uploading Photo...' : 'Save Admin Profile'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            ) : null}

            {tabs === 'payment-details' ? (
                <div>
                     {loading ? <div className="panel">Loading Company Profile...</div> : (
                        <form onSubmit={handleCompanySaveChanges}>
                            {error && <div className="panel mb-4 rounded border border-red-300 bg-red-100 p-4 text-red-600">{error}</div>}
                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                <div className="panel">
                                    <h5 className="mb-4 text-lg font-semibold">Company & Address</h5>
                                    <div className="mb-5">
                                        <label className="mb-2 block font-semibold">Company Logo</label>
                                        <div className="flex items-center space-x-4">
                                            {companyData.logo ? <img src={companyData.logo} alt="Company Logo" className="h-20 w-20 rounded-full object-cover" /> : <div className="grid h-20 w-20 place-content-center rounded-full bg-gray-200">No Logo</div>}
                                            <input type="file" accept="image/*" className="form-input file:mr-4 file:rounded-md file:border-0 file:bg-primary/90 file:px-4 file:py-2 file:text-white hover:file:bg-primary" onChange={handleLogoChange} disabled={isUploading} />
                                            {isUploading && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div><label htmlFor="companyName">Company Name</label><input id="companyName" name="name" type="text" className="form-input" value={companyData.name || ''} onChange={handleCompanyInputChange} /></div>
                                        <div><label htmlFor="address_line_1">Address Line 1</label><input id="address_line_1" name="address_line_1" type="text" className="form-input" value={companyData.address_line_1 || ''} onChange={handleCompanyInputChange} /></div>
                                        <div><label htmlFor="address_line_2">Address Line 2 (Optional)</label><input id="address_line_2" name="address_line_2" type="text" className="form-input" value={companyData.address_line_2 || ''} onChange={handleCompanyInputChange} /></div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div><label htmlFor="city">City</label><input id="city" name="city" type="text" className="form-input" value={companyData.city || ''} onChange={handleCompanyInputChange} /></div>
                                            <div><label htmlFor="state">State / Province</label><input id="state" name="state" type="text" className="form-input" value={companyData.state || ''} onChange={handleCompanyInputChange} /></div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div><label htmlFor="pincode">Pincode / ZIP Code</label><input id="pincode" name="pincode" type="text" className="form-input" value={companyData.pincode || ''} onChange={handleCompanyInputChange} /></div>
                                            <div><label htmlFor="country">Country</label><input id="country" name="country" type="text" className="form-input" value={companyData.country || ''} onChange={handleCompanyInputChange} /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="panel">
                                    <h5 className="mb-4 text-lg font-semibold">Banking & Tax Information</h5>
                                    <div className="space-y-4">
                                        <div><label htmlFor="tax_id">Tax ID</label><input id="tax_id" name="tax_id" type="text" className="form-input" value={companyData.tax_id || ''} onChange={handleCompanyInputChange} /></div>
                                        <div><label htmlFor="upi_id">UPI ID</label><input id="upi_id" name="upi_id" type="text" className="form-input" value={companyData.upi_id || ''} onChange={handleCompanyInputChange} /></div>
                                        <div><label htmlFor="bank_name">Bank Name</label><input id="bank_name" name="bank_name" type="text" className="form-input" value={companyData.bank_name || ''} onChange={handleCompanyInputChange} /></div>
                                        <div><label htmlFor="bank_account_number">Bank Account Number</label><input id="bank_account_number" name="bank_account_number" type="text" className="form-input" value={companyData.bank_account_number || ''} onChange={handleCompanyInputChange} /></div>
                                        <div><label htmlFor="bank_ifsc_code">Bank IFSC Code</label><input id="bank_ifsc_code" name="bank_ifsc_code" type="text" className="form-input" value={companyData.bank_ifsc_code || ''} onChange={handleCompanyInputChange} /></div>
                                       <div>
                                            <label className="mb-2 block font-semibold text-gray-700">Payment QR Code Image</label>
                                            <div className="flex items-center space-x-4">
                                                {companyData.payment_qr_code_url ? (
                                                    <img src={companyData.payment_qr_code_url} alt="Payment QR Code" className="h-20 w-20 rounded-md object-contain border p-1" />
                                                ) : (
                                                    <div className="grid h-20 w-20 place-content-center rounded-md border bg-gray-100 text-sm text-gray-500">No QR</div>
                                                )}
                                                <div className="flex-1">
                                                    <input type="file" accept="image/*" className="form-input file:mr-4 file:rounded-md file:border-0 file:bg-primary/90 file:px-4 file:py-2 file:text-white hover:file:bg-primary" onChange={handleQrCodeChange} disabled={isUploading} />
                                                    {isUploading && <div className="mt-2 text-sm text-blue-500">Uploading...</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 flex justify-end">
                                <button type="submit" className="btn btn-primary" disabled={isUploading}>
                                    {isUploading ? 'Uploading...' : 'Save Company Changes'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default ComponentsUsersAccountSettingsTabs;