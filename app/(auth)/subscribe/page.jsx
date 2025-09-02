'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SubscribePage() {
  const { currentUser, company, loading: authLoading } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [coupon, setCoupon] = useState('');
  const [couponDetails, setCouponDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [finalAmount, setFinalAmount] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/plans`);
        const activePlans = data.filter((plan) => plan.is_active);
        setPlans(activePlans);
        if (activePlans.length > 0) {
          setSelectedPlanId(activePlans[0].id);
          setFinalAmount(activePlans[0].price);
        }
      } catch (err) {
        console.error('Failed to fetch plans', err);
        toast.error('Failed to load plans');
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const selected = plans.find((p) => p.id === selectedPlanId);
    if (selected) {
      let amount = selected.price;
      if (couponDetails) {
        amount =
          couponDetails.discount_type === 'percent'
            ? Math.max(amount - Math.floor((amount * couponDetails.discount_value) / 100), 0)
            : Math.max(amount - couponDetails.discount_value * 100, 0);
      }
      setFinalAmount(amount);
    }
  }, [selectedPlanId, couponDetails, plans]);

  const validateCoupon = async () => {
    if (!coupon.trim() || !selectedPlanId) return;
    try {
      const { data } = await axios.get(`${API_URL}/api/coupons/${coupon.trim()}?plan_id=${selectedPlanId}`);
      setCouponDetails(data);
      toast.success('Coupon applied!');
    } catch (err) {
      toast.error('Invalid or expired coupon');
      setCouponDetails(null);
    }
  };

  const handleSubscribe = async () => {
    if (!currentUser || !company?.id || !selectedPlanId) {
      return toast.error('Missing user data');
    }

    setLoading(true);

    const selectedPlan = plans.find((p) => p.id === selectedPlanId);
    if (!selectedPlan) return toast.error('Plan not found');

    try {
      const res = await axios.post(`${API_URL}/api/subscribe/create-order`, {
        firebase_uid: currentUser.uid,
        plan: selectedPlan.name,
        coupon,
      });

      const { order_id, amount, razorpay_key_id } = res.data;

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;

      script.onload = () => {
        const rzp = new window.Razorpay({
          key: razorpay_key_id,
          amount: amount.toString(),
          currency: 'INR',
          name: 'FirstHash',
          description: `Plan: ${selectedPlan.name}`,
          order_id,
          handler: async function (response) {
            toast.success('Payment successful!');
            try {
              await axios.post(`${API_URL}/api/subscribe/verify`, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                firebase_uid: currentUser.uid,
                plan: selectedPlan.name,
              });
              toast.success('Subscription activated!');
              router.push('/admin/dashboard');
            } catch (err) {
              toast.error('Verification failed');
              console.error(err);
            }
          },
          prefill: {
            email: currentUser.email,
          },
          theme: { color: '#000000' },
          modal: {
            ondismiss: () => toast.error('Payment cancelled.'),
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

  if (authLoading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-800">Choose Your Plan</h2>

        <select
          value={selectedPlanId || ''}
          onChange={(e) => {
            setSelectedPlanId(parseInt(e.target.value));
            setCouponDetails(null);
          }}
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-black"
        >
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)} – ₹{(plan.price / 100).toFixed(0)}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Coupon code"
            className="w-full p-3 border rounded"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
          />
          <button
            onClick={validateCoupon}
            className="bg-black text-white px-4 py-2 rounded hover:opacity-90"
          >
            Apply
          </button>
        </div>

        {couponDetails && (
          <p className="text-green-600 text-sm mt-1">
            {couponDetails.discount_type === 'percent'
              ? `${couponDetails.discount_value}% off applied!`
              : `₹${couponDetails.discount_value} off applied!`}
          </p>
        )}

        <div className="text-right text-gray-700 text-md font-semibold">
          Final Payable: ₹{(finalAmount / 100).toFixed(0)}
        </div>

        <button
          disabled={loading}
          onClick={handleSubscribe}
          className="w-full bg-black text-white py-3 rounded font-semibold hover:bg-gray-900 transition"
        >
          {loading ? 'Processing...' : 'Subscribe & Pay'}
        </button>
      </div>
    </div>
  );
}
