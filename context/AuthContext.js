'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [company, setCompany] = useState(null);
    const [role, setRole] = useState(null); // 'admin' | 'employee'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [employeeType, setEmployeeType] = useState(null);
    const [detectedEmployeeType, setDetectedEmployeeType] = useState(null);

    // Unified fetch: role + company
    const fetchUserRoleAndCompany = async (firebase_uid) => {
        try {
            // 1) Get role (and ideally company_id) first
            const { data: roleData } = await axios.get(`${API_URL}/api/auth/user-role/${firebase_uid}`);
            const detectedRole = roleData?.role || null;
            const employeeCompanyId = roleData?.company_id || null;
            const employeeType = roleData?.employee_type ?? null;

            setRole(detectedRole);
            setEmployeeType(detectedEmployeeType);

            // 2) If admin → company by owner UID
            if (detectedRole === 'admin') {
                const res = await axios.get(`${API_URL}/api/company/by-uid/${firebase_uid}`, { validateStatus: () => true });
                if (res.status === 200) {
                    setCompany(res.data);
                } else {
                    console.warn('Admin company fetch failed:', res.status, res.data);
                    setCompany(null);
                }
            }

            // 3) If employee → company by ID (requires that /api/auth/user-role returns company_id)
            else if (detectedRole === 'employee') {
                if (employeeCompanyId) {
                    const res = await axios.get(`${API_URL}/api/company/by-id/${employeeCompanyId}`, { validateStatus: () => true });
                    if (res.status === 200) {
                        setCompany(res.data);
                    } else {
                        console.warn('Employee company fetch failed:', res.status, res.data);
                        setCompany(null);
                    }
                } else {
                    console.warn('Employee has no company_id in user-role payload');
                    setCompany(null);
                }
            } else if (detectedRole === 'manager') {
                if (employeeCompanyId) {
                    const res = await axios.get(`${API_URL}/api/company/by-id/${employeeCompanyId}`, { validateStatus: () => true });
                    if (res.status === 200) {
                        setCompany(res.data);
                    } else {
                        console.warn('manger company fetch failed:', res.status, res.data);
                        setCompany(null);
                    }
                } else {
                    console.warn('Employee has no company_id in user-role payload');
                    setCompany(null);
                }
            } else {
                // unknown role
                setCompany(null);
            }

            return detectedRole;
        } catch (err) {
            console.error('Error fetching user role and company:', err);
            // Keep role unknown, but don't crash the flow
            setCompany(null);
            return null;
        }
    };

    // Firebase auth listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) await fetchUserRoleAndCompany(user.uid);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Email signup
    const register = async ({ email, password, name, phone, companyName }) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const firebase_uid = cred.user.uid;

        await axios.post(`${API_URL}/api/auth/register`, {
            firebase_uid,
            email,
            name,
            phone,
            company_name: companyName,
        });

        await fetchUserRoleAndCompany(firebase_uid);
    };

    // Email login
    const login = async (email, password) => {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const firebase_uid = cred.user.uid;
        console.log('initialting');

        const role = await fetchUserRoleAndCompany(firebase_uid);
        console.log('role', role);

        console.log(typeof window !== 'undefined');

        if (typeof window !== 'undefined') {
            console.log('rolex', role);
            if (role === 'admin') {
                console.log('admin');
                window.location.href = '/admin/dashboard';
            } else if (role == 'manager') {
                console.log('manager');
                window.location.href = '/manager/dashboard';
            } else if (role === 'employee') {
                window.location.href = '/employee/dashboard';
            }
        }
    };

    // Google signup
    const loginWithGoogle = async ({ name, phone, company_name }) => {
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(auth, provider);
        const firebase_uid = cred.user.uid;

        try {
            // Check if user already exists in the DB
            const res = await axios.get(`${API_URL}/api/auth/user-role/${firebase_uid}`);
            const role = res?.data?.role;

            if (!role) {
                // User doesn't exist → Register now
                await axios.post(`${API_URL}/api/auth/register-google`, {
                    firebase_uid,
                    email: cred.user.email,
                    name: name || cred.user.displayName,
                    phone,
                    company_name,
                });
            }

            // Fetch company & role after login
            const detectedRole = await fetchUserRoleAndCompany(firebase_uid);

            // Redirect
            if (detectedRole === 'admin') {
                window.location.href = '/admin/dashboard';
            } else if (detectedRole === 'employee') {
                window.location.href = '/employee/dashboard';
            } else if (detectedRole === 'manager') 
                window.location.href = '/manager/dashboard'; 
            else {
                toast.error('Unknown role or user not authorized.');
            }
        } catch (err) {
            console.error('Google login error:', err);
            toast.error('Google login failed.');
        }
    };

    const logout = () => {
        setCompany(null);
        setRole(null);
        return signOut(auth);
    };

    const isSubscribedUser = !!company && new Date(company.plan_expiry) > new Date();

    const isAdmin = role === 'admin';
    const isEmployee = role === 'employee';
    const isManager = role === 'manager';

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                company,
                role,
                isAdmin,
                isEmployee,
                isManager,
                isSubscribedUser,
                register,
                login,
                loginWithGoogle,
                logout,
                loading,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
