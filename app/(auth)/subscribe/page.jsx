'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SubscribePage() {
    const { currentUser, company, loading: authLoading } = useAuth();

    const router = useRouter();

    const [plan, setPlan] = useState('monthly');
    const [coupon, setCoupon] = useState('');
    const [loading, setLoading] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    if (authLoading) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    const handleSubscribe = async () => {
        if (!currentUser || !company?.id) {
            return toast.error('Missing user data');
        }

        setLoading(true);

        try {
            const res = await axios.post(`${API_URL}/api/subscribe/create-order`, {
                firebase_uid: currentUser.uid,
                plan,
                coupon,
            });

            const { order_id, amount, razorpay_key_id } = res.data;

            // Inject Razorpay checkout script
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;

            script.onload = () => {
                const options = {
                    key: razorpay_key_id,
                    amount: amount.toString(),
                    currency: 'INR',
                    name: 'FirstHash',
                    description: `Plan: ${plan}`,
                    order_id: order_id,
                    handler: async function (response) {
                        toast.success('Payment successful!');
                        try {
                            await axios.post(`${API_URL}/api/subscribe/verify`, {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                firebase_uid: currentUser.uid,
                                plan,
                            });

                            toast.success('Subscription activated!');
                            router.push('/dashboard');
                        } catch (err) {
                            toast.error('Verification failed');
                            console.error(err);
                        }
                    },
                    prefill: {
                        name: '',
                        email: currentUser.email,
                    },
                    theme: {
                        color: '#000000',
                    },
                };

                const rzp = new window.Razorpay({
                    ...options,
                    modal: {
                        ondismiss: function () {
                            toast.error('Payment was cancelled.');
                            // Optional: You can also inform backend here if needed.
                        },
                    },
                });
                rzp.open();
            };

            document.body.appendChild(script);
        } catch (err) {
            console.error(err);
            toast.error('Subscription failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
            <div className="w-full max-w-md space-y-6">
                <h2 className="text-2xl font-semibold text-center">Choose Your Plan</h2>

                <select value={plan} onChange={(e) => setPlan(e.target.value)} className="w-full p-3 border rounded">
                    <option value="monthly">Monthly - ₹499</option>
                    <option value="yearly">Yearly - ₹4999</option>
                </select>

                <input type="text" placeholder="Coupon code (optional)" className="w-full p-3 border rounded" value={coupon} onChange={(e) => setCoupon(e.target.value)} />

                <button disabled={loading} onClick={handleSubscribe} className="w-full bg-black text-white py-3 rounded font-semibold">
                    {loading ? 'Processing...' : 'Subscribe Now'}
                </button>
            </div>
        </div>
    );
}
