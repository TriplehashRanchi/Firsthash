'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import axios from 'axios';
import toast from 'react-hot-toast';

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
            const detectedEmployeeType = roleData?.employee_type ?? null;

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

    // Email login// In AuthContext.js
const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const firebase_uid = cred.user.uid;
    const role = await fetchUserRoleAndCompany(firebase_uid);
    return { role }; // Return the user's role
};

    // Google signup
    // Google signup/login
const loginWithGoogle = async ({ name, phone, company_name }) => {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const firebase_uid = cred.user.uid;
  let isNewUser = false;

  try {
    let role = null;
    try {
      const res = await axios.get(`${API_URL}/api/auth/user-role/${firebase_uid}`);
      role = res?.data?.role || null;
    } catch (err) {
      if (err.response?.status !== 404) {
        throw err; // Re-throw if it's not a 'user not found' error
      }
    }

    if (!role) {
      isNewUser = true;
      await axios.post(`${API_URL}/api/auth/register-google`, {
        firebase_uid,
        email: cred.user.email,
        name: name || cred.user.displayName,
        phone,
        company_name,
      });
    }

    await fetchUserRoleAndCompany(firebase_uid);
    return { isNewUser }; // Return the user's status

  } catch (err) {
    console.error('Google login error:', err);
    toast.error('Google login failed.');
    throw err;
  }
};


    const logout = () => {
        setCompany(null);
        setRole(null);
        return signOut(auth);
    };

    const isSubscribedUser = !!company && new Date(company.plan_expiry) > new Date();

    // const isAdmin = role === 'admin';
    // const isEmployee = role === 'employee';
    // const isManager = role === 'manager';

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                company,
                role,
                isAdmin :role === 'admin',
                isEmployee : role === 'employee',
                isManager : role === 'manager',
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
