'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEmailLogin = async () => {
    if (!form.email || !form.password) {
      return toast.error('Please enter both email and password.');
    }

    try {
      setLoading(true);
      await login(form.email, form.password);
      // redirection handled in AuthContext
    } catch (err) {
      console.error(err);
      toast.error('Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle({
        name: 'Google User', // dummy (already handled in AuthContext)
        phone: '0000000000',
        company_name: 'Untitled Studio',
      });
      // redirection handled in AuthContext
    } catch (err) {
      console.error(err);
      toast.error('Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <h2 className="text-2xl font-semibold text-center">Login to FirstHash</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-3 border rounded"
          value={form.email}
          onChange={handleChange}
        />

       <div className="relative w-full">
      <input
        type={showPassword ? "text" : "password"}
        name="password"
        placeholder="Password"
        className="w-full p-3 pr-10 border rounded"
        value={form.password}
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>

        <button
          onClick={handleEmailLogin}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded font-semibold"
        >
          {loading ? 'Logging in...' : 'Login with Email'}
        </button>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-gray-100 text-black py-3 rounded font-semibold flex items-center justify-center space-x-2"
        >
          <span>Login with Google</span>
        </button>

        <p className="text-sm text-center text-gray-500">
          Don’t have an account? <a href="/register" className="underline">Register</a>
        </p>
      </div>
    </div>
  );
}
