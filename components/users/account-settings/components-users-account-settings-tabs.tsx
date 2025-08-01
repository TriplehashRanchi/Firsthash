'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Make sure to install: npm install axios
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'; // Import Firebase Auth functions

// Import your icon components
import IconDollarSignCircle from '@/components/icon/icon-dollar-sign-circle';
import IconFacebook from '@/components/icon/icon-facebook';
import IconGithub from '@/components/icon/icon-github';
import IconHome from '@/components/icon/icon-home';
import IconLinkedin from '@/components/icon/icon-linkedin';
import IconTwitter from '@/components/icon/icon-twitter';

// Define a TypeScript interface for your company data for better type safety
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

// Define your API's base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const ComponentsUsersAccountSettingsTabs = () => {
    const [tabs, setTabs] = useState<string>('home');
    const toggleTabs = (name: string) => setTabs(name);

    // --- START: COMPANY PROFILE LOGIC ---

    const [firebase_uid, setFirebaseUid] = useState<string | null>(null);
    const [companyData, setCompanyData] = useState<Partial<CompanyData>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Set up a real-time listener for Firebase authentication state
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
            if (user) {
                // User is signed in, set their UID
                setFirebaseUid(user.uid);
            } else {
                // User is signed out
                setFirebaseUid(null);
                setLoading(false);
                setError("Please log in to manage your company profile.");
            }
        });
        // Cleanup subscription on component unmount
        return () => unsubscribe();
    }, []);

    // 2. Helper function to get auth token for secure API calls
    const withAuth = async (opts: any = {}) => {
        const user = getAuth().currentUser;
        if (!user) throw new Error('User not logged in');
        const token = await user.getIdToken();
        return {
            ...opts,
            headers: {
                ...opts.headers,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        };
    };

    // 3. Fetch company data when the user's UID becomes available
    useEffect(() => {
        if (!firebase_uid) {
            return; // Don't fetch if there's no user
        }

        const fetchCompanyData = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = `${API_URL}/api/company/by-uid/${firebase_uid}`;
                const response = await axios.get(url, await withAuth());
                if (response.data) {
                    setCompanyData(response.data);
                }
            } catch (err: any) {
                if (err.response && err.response.status === 404) {
                    setError('No company profile found. Fill out the form and click Save to create one.');
                    setCompanyData({}); // Ensure form is empty for a new profile
                } else {
                    setError('Failed to fetch company data. Please try again later.');
                    console.error("Fetch Error:", err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCompanyData();
    }, [firebase_uid]); // This effect runs when firebase_uid changes

    // 4. Handle changes in any form input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCompanyData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // 5. Handle the form submission to save/update data
    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent page reload
        if (!firebase_uid) {
            setError('You must be logged in to save changes.');
            return;
        }
        setError(null);

        try {
            const url = `${API_URL}/api/company/by-uid/${firebase_uid}`;
            // A PUT request will update the existing resource
            const response = await axios.put(url, companyData, await withAuth());
            
            alert('Company profile saved successfully!');
            setCompanyData(response.data); // Update state with the final data from the server
        } catch (err) {
            setError('Failed to save profile. Please try again.');
            console.error('Save Error:', err);
        }
    };

    // --- END: COMPANY PROFILE LOGIC ---

    return (
        <div className="pt-5">
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">Settings</h5>
            </div>
            <div>
                <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
                    <li className="inline-block">
                        <button onClick={() => toggleTabs('home')} className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${tabs === 'home' ? '!border-primary text-primary' : ''}`}>
                            <IconHome />
                            Home
                        </button>
                    </li>
                    <li className="inline-block">
                        <button onClick={() => toggleTabs('payment-details')} className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${tabs === 'payment-details' ? '!border-primary text-primary' : ''}`}>
                            <IconDollarSignCircle />
                            Company Profile
                        </button>
                    </li>
                </ul>
            </div>


            {tabs === 'home' ? (
                <div>
                    <form className="mb-5 rounded-md border border-[#ebedf2] bg-white p-4 dark:border-[#191e3a] dark:bg-black">
                        <h6 className="mb-5 text-lg font-bold">General Information</h6>
                        <div className="flex flex-col sm:flex-row">
                            <div className="mb-5 w-full sm:w-2/12 ltr:sm:mr-4 rtl:sm:ml-4">
                                <img src="/assets//images/profile-34.jpeg" alt="img" className="mx-auto h-20 w-20 rounded-full object-cover md:h-32 md:w-32" />
                            </div>
                            <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="name">Full Name</label>
                                    <input id="name" type="text" placeholder="Jimmy Turner" className="form-input" />
                                </div>
                                <div>
                                    <label htmlFor="profession">Profession</label>
                                    <input id="profession" type="text" placeholder="Web Developer" className="form-input" />
                                </div>
                                <div>
                                    <label htmlFor="country">Country</label>
                                    <select id="country" className="form-select text-white-dark" name="country" defaultValue="United States">
                                        <option value="All Countries">All Countries</option>
                                        <option value="United States">United States</option>
                                        <option value="India">India</option>
                                        <option value="Japan">Japan</option>
                                        <option value="China">China</option>
                                        <option value="Brazil">Brazil</option>
                                        <option value="Norway">Norway</option>
                                        <option value="Canada">Canada</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="address">Address</label>
                                    <input id="address" type="text" placeholder="New York" className="form-input" />
                                </div>
                                <div>
                                    <label htmlFor="location">Location</label>
                                    <input id="location" type="text" placeholder="Location" className="form-input" />
                                </div>
                                <div>
                                    <label htmlFor="phone">Phone</label>
                                    <input id="phone" type="text" placeholder="+1 (530) 555-12121" className="form-input" />
                                </div>
                                <div>
                                    <label htmlFor="email">Email</label>
                                    <input id="email" type="email" placeholder="Jimmy@gmail.com" className="form-input" />
                                </div>
                                <div>
                                    <label htmlFor="web">Website</label>
                                    <input id="web" type="text" placeholder="Enter URL" className="form-input" />
                                </div>
                                <div>
                                    <label className="inline-flex cursor-pointer">
                                        <input type="checkbox" className="form-checkbox" />
                                        <span className="relative text-white-dark checked:bg-none">Make this my default address</span>
                                    </label>
                                </div>
                                <div className="mt-3 sm:col-span-2">
                                    <button type="button" className="btn btn-primary">
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                    <form className="rounded-md border border-[#ebedf2] bg-white p-4 dark:border-[#191e3a] dark:bg-black">
                        <h6 className="mb-5 text-lg font-bold">Social</h6>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div className="flex">
                                <div className="flex items-center justify-center rounded bg-[#eee] px-3 font-semibold ltr:mr-2 rtl:ml-2 dark:bg-[#1b2e4b]">
                                    <IconLinkedin className="h-5 w-5" />
                                </div>
                                <input type="text" placeholder="jimmy_turner" className="form-input" />
                            </div>
                            <div className="flex">
                                <div className="flex items-center justify-center rounded bg-[#eee] px-3 font-semibold ltr:mr-2 rtl:ml-2 dark:bg-[#1b2e4b]">
                                    <IconTwitter className="h-5 w-5" />
                                </div>
                                <input type="text" placeholder="jimmy_turner" className="form-input" />
                            </div>
                            <div className="flex">
                                <div className="flex items-center justify-center rounded bg-[#eee] px-3 font-semibold ltr:mr-2 rtl:ml-2 dark:bg-[#1b2e4b]">
                                    <IconFacebook className="h-5 w-5" />
                                </div>
                                <input type="text" placeholder="jimmy_turner" className="form-input" />
                            </div>
                            <div className="flex">
                                <div className="flex items-center justify-center rounded bg-[#eee] px-3 font-semibold ltr:mr-2 rtl:ml-2 dark:bg-[#1b2e4b]">
                                    <IconGithub />
                                </div>
                                <input type="text" placeholder="jimmy_turner" className="form-input" />
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                ''
            )}
             {tabs === 'payment-details' ? (
                // --- START OF UPDATED PAYMENT DETAILS TAB ---
                <div>
                    {loading ? (
                        <div className="panel">Loading Company Profile...</div>
                    ) : (
                        <form onSubmit={handleSaveChanges}>
                            {error && <div className="panel mb-4 rounded border border-red-300 bg-red-100 p-4 text-red-600">{error}</div>}
                            
                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                {/* Column 1: Company & Address Info */}
                                <div className="panel">
                                    <h5 className="mb-4 text-lg font-semibold">Company Information</h5>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="name">Company Name</label>
                                            <input id="name" name="name" type="text" placeholder="Enter Company Name" className="form-input" value={companyData.name || ''} onChange={handleInputChange} />
                                        </div>
                                         <div>
                                            <label htmlFor="address_line_1">Address Line 1</label>
                                            <input id="address_line_1" name="address_line_1" type="text" placeholder="e.g., 123 Main St" className="form-input" value={companyData.address_line_1 || ''} onChange={handleInputChange} />
                                        </div>
                                        <div>
                                            <label htmlFor="address_line_2">Address Line 2 (Optional)</label>
                                            <input id="address_line_2" name="address_line_2" type="text" placeholder="e.g., Suite 100" className="form-input" value={companyData.address_line_2 || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <label htmlFor="city">City</label>
                                                <input id="city" name="city" type="text" placeholder="e.g., New York" className="form-input" value={companyData.city || ''} onChange={handleInputChange} />
                                            </div>
                                            <div>
                                                <label htmlFor="state">State / Province</label>
                                                <input id="state" name="state" type="text" placeholder="e.g., NY" className="form-input" value={companyData.state || ''} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <label htmlFor="pincode">Pincode / ZIP Code</label>
                                                <input id="pincode" name="pincode" type="text" placeholder="e.g., 10001" className="form-input" value={companyData.pincode || ''} onChange={handleInputChange} />
                                            </div>
                                            <div>
                                                <label htmlFor="country">Country</label>
                                                <input id="country" name="country" type="text" placeholder="e.g., USA" className="form-input" value={companyData.country || ''} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Column 2: Banking & Tax Info */}
                                <div className="panel">
                                    <h5 className="mb-4 text-lg font-semibold">Banking & Tax Information</h5>
                                     <div className="space-y-4">
                                        <div>
                                            <label htmlFor="tax_id">Tax ID (e.g., GSTIN, EIN)</label>
                                            <input id="tax_id" name="tax_id" type="text" placeholder="Enter Tax ID" className="form-input" value={companyData.tax_id || ''} onChange={handleInputChange} />
                                        </div>
                                        <div>
                                            <label htmlFor="upi_id">UPI ID</label>
                                            <input id="upi_id" name="upi_id" type="text" placeholder="Enter UPI ID" className="form-input" value={companyData.upi_id || ''} onChange={handleInputChange} />
                                        </div>
                                        <div>
                                            <label htmlFor="bank_name">Bank Name</label>
                                            <input id="bank_name" name="bank_name" type="text" placeholder="Enter Bank Name" className="form-input" value={companyData.bank_name || ''} onChange={handleInputChange} />
                                        </div>
                                        <div>
                                            <label htmlFor="bank_account_number">Bank Account Number</label>
                                            <input id="bank_account_number" name="bank_account_number" type="text" placeholder="Enter Account Number" className="form-input" value={companyData.bank_account_number || ''} onChange={handleInputChange} />
                                        </div>
                                        <div>
                                            <label htmlFor="bank_ifsc_code">Bank IFSC Code</label>
                                            <input id="bank_ifsc_code" name="bank_ifsc_code" type="text" placeholder="Enter IFSC Code" className="form-input" value={companyData.bank_ifsc_code || ''} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-5 flex justify-end">
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}
                </div>
                 // --- END OF UPDATED PAYMENT DETAILS TAB ---
            ) : (
                ''
            )}
        </div>
    );
};

export default ComponentsUsersAccountSettingsTabs;