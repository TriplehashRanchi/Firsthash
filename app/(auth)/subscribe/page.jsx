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
  }, [API_URL]);

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
    if (!selectedPlan) {
      setLoading(false);
      return toast.error('Plan not found');
    }

    let res; // Declare res outside try-catch to access it in finally block

    try {
      res = await axios.post(`${API_URL}/api/subscribe/create-order`, {
        firebase_uid: currentUser.uid,
        plan: selectedPlan.name,
        coupon,
      });
      
      // Check for free checkout response
      if (res.data.free_checkout) {
        toast.success('Subscription activated successfully!');
        router.push('/admin/dashboard');
        return; // Stop execution to prevent Razorpay script loading
      }

      const { order_id, amount, razorpay_key_id } = res.data;

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;

      script.onload = () => {
        const rzp = new window.Razorpay({
          key: razorpay_key_id,
          amount: amount.toString(),
          currency: 'INR',
          name: 'IPCStudios',
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
      
      script.onerror = () => {
        toast.error('Failed to load payment gateway. Please try again.');
        setLoading(false);
      }

      document.body.appendChild(script);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || 'Subscription failed.';
      toast.error(errorMessage);
    } finally {
      // Only set loading to false if it's not a free checkout redirect
      if (!res?.data?.free_checkout) {
        setLoading(false);
      }
    }
  };

  if (authLoading) return <div className="text-center mt-20 text-lg font-medium">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Choose Your Plan
        </h2>
        <p className="mt-4 text-lg text-gray-500">
          Select the perfect plan that fits your business needs. Upgrade anytime.
        </p>
      </div>

      <div className="w-full max-w-5xl mx-auto space-y-12">
        
        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            
            return (
              <div
                key={plan.id}
                onClick={() => {
                  setSelectedPlanId(plan.id);
                  setCouponDetails(null);
                  setCoupon(''); // Optional: clear coupon if plan changes
                }}
                className={`relative flex flex-col p-8 bg-white rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                  isSelected 
                    ? 'border-black shadow-xl scale-105 z-10' 
                    : 'border-transparent shadow-md hover:shadow-lg hover:border-gray-300'
                }`}
              >
                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl">
                    Selected
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 capitalize">
                  {plan.name}
                </h3>
                
                <div className="mt-4 flex items-baseline text-4xl font-extrabold text-gray-900">
                  ₹{(plan.price / 100).toFixed(0)}
                  <span className="ml-1 text-xl font-medium text-gray-500">
                    /{plan.interval || 'mo'}
                  </span>
                </div>
                
                <p className="mt-4 text-gray-500 flex-grow">
                  Full access to all {plan.name} features to boost your business.
                </p>

                {/* Custom radio-like indicator for visual accessibility */}
                <div className="mt-6 flex items-center text-sm font-semibold">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    isSelected ? 'border-black' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                  </div>
                  {isSelected ? 'Currently Selected' : 'Select Plan'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Checkout / Summary Section */}
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
            Order Summary
          </h3>

          <div className="space-y-6">
            {/* Coupon Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Have a coupon code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
                <button
                  onClick={validateCoupon}
                  disabled={!coupon.trim()}
                  className="bg-black text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
              {couponDetails && (
                <p className="text-green-600 text-sm mt-2 font-medium">
                  {couponDetails.discount_type === 'percent'
                    ? `✓ ${couponDetails.discount_value}% off applied!`
                    : `✓ ₹${couponDetails.discount_value} off applied!`}
                </p>
              )}
            </div>

            {/* Total Section */}
            <div className="flex justify-between items-center py-4 border-t border-gray-100">
              <span className="text-gray-600 font-medium">Total to pay</span>
              <span className="text-3xl font-extrabold text-gray-900">
                ₹{(finalAmount / 100).toFixed(0)}
              </span>
            </div>

            {/* Subscribe Button */}
            <button
              disabled={loading || plans.length === 0}
              onClick={handleSubscribe}
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 hover:shadow-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : null}
              {loading ? 'Processing...' : 'Subscribe & Pay'}
            </button>
            <p className="text-xs text-center text-gray-400 mt-4">
              Secured safely by Razorpay
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}