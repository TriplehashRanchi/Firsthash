'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
    const { register, loginWithGoogle } = useAuth();
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [mode, setMode] = useState(null); // null | 'email'
    const [form, setForm] = useState({
        name: '',
        phone: '',
        company_name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEmailSignup = async () => {
        if (!form.name || !form.phone || !form.company_name || !form.email || !form.password || !form.confirmPassword) {
            return toast.error('Please fill all required fields.');
        }

        if (form.password !== form.confirmPassword) {
            return toast.error('Passwords do not match.');
        }

        try {
            await register({
                email: form.email,
                password: form.password,
                name: form.name,
                phone: form.phone,
                companyName: form.company_name,
            });

            toast.success('Registered! Redirecting...');
            router.push('/subscribe');
        } catch (err) {
            console.error(err);
            toast.error('Registration failed.');
        }
    };

    const handleGoogleSignup = async () => {
        if (!form.name || !form.phone || !form.company_name) {
            return toast.error('Please fill all required fields.');
        }

        try {
            await loginWithGoogle({
                name: form.name,
                phone: form.phone,
                company_name: form.company_name,
            });

            toast.success('Signed up with Google!');
            router.push('/subscribe');
        } catch (err) {
            console.error(err);
            toast.error('Google signup failed.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
            <div className="w-full max-w-md space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 text-center">Start your Journey</h2>

                <div className="space-y-4">
                    <input type="text" name="name" placeholder="Full name" className="w-full p-3 border rounded" value={form.name} onChange={handleChange} required />

                    <input type="text" name="phone" placeholder="Phone number" className="w-full p-3 border rounded" value={form.phone} onChange={handleChange} required />

                    <input type="text" name="company_name" placeholder="Company name" className="w-full p-3 border rounded" value={form.company_name} onChange={handleChange} required />

                    {mode === 'email' && (
                        <>
                            <input type="email" name="email" placeholder="Email" className="w-full p-3 border rounded" value={form.email} onChange={handleChange} />

                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Password"
                                    className="w-full p-3 pr-10 border rounded"
                                    value={form.password}
                                    onChange={handleChange}
                                />
                                <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    className="w-full p-3 pr-10 border rounded"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                />
                                <button type="button" onClick={() => setShowConfirm((prev) => !prev)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700">
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <div className="space-y-3">
                    {mode === 'email' ? (
                        <button onClick={handleEmailSignup} className="w-full bg-black text-white py-3 rounded font-semibold">
                            Sign Up
                        </button>
                    ) : (
                        <button onClick={() => setMode('email')} className="w-full bg-black text-white py-3 rounded font-semibold">
                            Sign up with Email
                        </button>
                    )}

                    <button onClick={handleGoogleSignup} className="w-full bg-gray-100 text-black py-3 rounded font-semibold flex items-center justify-center space-x-2">
                        <span>Sign up with Google</span>
                    </button>
                </div>

                <p className="text-xs text-center text-gray-400">
                    <p className="text-sm text-center text-gray-500">
                        Already have an account?{' '}
                        <a href="/login" className="underline">
                            Login
                        </a>
                    </p>
                    By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
}
