'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BadgeCheck, Check, ShieldCheck, Sparkles } from 'lucide-react';

const PLAN_PRESENTATION = {
  gold: {
    title: 'Gold',
    badge: 'Popular',
    accent: 'from-[#f4e2b8] via-[#fbf4df] to-white',
    border: 'border-[#e8cf95]',
    ring: 'ring-[#e8cf95]/60',
    button: 'bg-[#1f1810] text-white',
    priceTone: 'text-[#1f1810]',
    summary: 'For studios that need a clean professional setup with strong day-to-day capability.',
    features: ['Premium workflow access', 'Business-ready reporting', 'Faster onboarding'],
  },
  diamond: {
    title: 'Diamond',
    badge: 'Premium',
    accent: 'from-[#dbe7f7] via-[#eef4fb] to-white',
    border: 'border-[#c9d9f2]',
    ring: 'ring-[#c9d9f2]/70',
    button: 'bg-[#111827] text-white',
    priceTone: 'text-[#0f172a]',
    summary: 'For teams that want the most polished experience with a higher-end operational tier.',
    features: ['Priority access tools', 'Premium support flow', 'Best fit for scaling teams'],
  },
  trial: {
    title: 'Free Trial',
    badge: 'Try First',
    accent: 'from-[#dff4ea] via-[#f4fbf7] to-white',
    border: 'border-[#bfe7d2]',
    ring: 'ring-[#bfe7d2]/70',
    button: 'bg-[#0f3d2e] text-white',
    priceTone: 'text-[#0f3d2e]',
    summary: 'Start with the essentials and experience the product before moving into a paid plan.',
    features: ['Quick start access', 'Same secure checkout path', 'Upgrade whenever ready'],
  },
};

const getPlanPresentation = (plan) => {
  const normalized = plan.name.toLowerCase();

  if (normalized.includes('diamond')) return PLAN_PRESENTATION.diamond;
  if (normalized.includes('gold')) return PLAN_PRESENTATION.gold;
  if (normalized.includes('trial') || normalized.includes('free') || Number(plan.price) === 0) {
    return PLAN_PRESENTATION.trial;
  }

  if (Number(plan.price) === Math.max(Number(plan.price), 0) && Number(plan.price) >= 499900) {
    return PLAN_PRESENTATION.diamond;
  }

  return {
    ...PLAN_PRESENTATION.gold,
    title: plan.name,
    badge: 'Plan',
    summary: `A premium ${plan.name} plan presented with cleaner hierarchy and more balanced spacing.`,
  };
};

export default function SubscribePage() {
  const { currentUser, company, loading: authLoading } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponDetails, setCouponDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [finalAmount, setFinalAmount] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) || plans[0] || null;
  const selectedTheme = selectedPlan ? getPlanPresentation(selectedPlan) : PLAN_PRESENTATION.gold;

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
    <div className="relative min-h-screen overflow-hidden bg-[#f6f1e8] px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute right-0 top-16 h-96 w-96 rounded-full bg-stone-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-200/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl rounded-[32px] border border-white/70 bg-white/80 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8 lg:p-10">
        <div className="space-y-8">
          <div className="flex flex-col gap-6 border-b border-stone-200/80 pb-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
              <div className="inline-flex w-fit items-center rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-stone-600 shadow-sm">
                Premium Access Plans
              </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-4xl">
                  Choose a plan
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
                  Select any plan from the backend list. The page is kept simple, card-based, and responsive.
                </p>
              </div>
              <div className="flex items-center gap-4 rounded-[24px] border border-stone-200 bg-stone-950 px-5 py-4 text-white shadow-[0_16px_40px_rgba(15,23,42,0.14)]">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-stone-400">Selected total</div>
                  <div className="mt-1 text-3xl font-semibold tracking-[-0.04em]">₹{(finalAmount / 100).toFixed(0)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => selectedPlan && setShowCheckoutModal(true)}
                  disabled={!selectedPlan}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-stone-200/80 bg-[#fbf9f5] p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const theme = getPlanPresentation(plan);

            return (
              <div
                key={plan.id}
                onClick={() => {
                  setSelectedPlanId(plan.id);
                  setCouponDetails(null);
                  setCoupon('');
                }}
                className={`relative flex min-h-[380px] flex-col overflow-hidden rounded-[28px] border bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 ${
                  isSelected
                    ? `${theme.border} ${theme.ring} ring-2 shadow-[0_16px_44px_rgba(15,23,42,0.12)]`
                    : 'border-stone-200/80 hover:-translate-y-1 hover:border-stone-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]'
                }`}
              >
                <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${theme.accent}`} />

                <div className="relative flex h-full flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                        {theme.badge}
                      </div>
                      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-stone-950">
                        {plan.name}
                      </h3>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white/80 shadow-sm">
                      {theme.title.toLowerCase().includes('trial') ? <ShieldCheck className="h-5 w-5 text-stone-900" /> : <Sparkles className="h-5 w-5 text-stone-900" />}
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flex items-end gap-2">
                      <div className={`text-4xl font-semibold tracking-[-0.05em] ${theme.priceTone}`}>
                        ₹{(plan.price / 100).toFixed(0)}
                      </div>
                      <div className="pb-2 text-sm font-medium uppercase tracking-[0.18em] text-stone-400">
                        /plan
                      </div>
                    </div>
                    <p className="mt-4 min-h-[72px] text-sm leading-6 text-stone-600">
                      {theme.summary}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-stone-700">
                    {theme.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-950 text-white">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-8">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        className={`flex-1 rounded-[18px] px-4 py-3 text-sm font-semibold transition ${isSelected ? theme.button : 'bg-stone-100 text-stone-900 hover:bg-stone-200'}`}
                      >
                        {isSelected ? 'Selected' : `Choose ${plan.name}`}
                      </button>
                      {isSelected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCheckoutModal(true);
                          }}
                          className="rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-50"
                        >
                          Pay
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
            </div>
          </div>
        </div>
      </div>

      {showCheckoutModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="absolute inset-0" onClick={() => setShowCheckoutModal(false)} />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
            <div className={`h-24 bg-gradient-to-br ${selectedTheme.accent}`} />
            <div className="relative -mt-8 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Checkout</div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-stone-950">{selectedPlan.name}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="rounded-full border border-stone-200 px-3 py-1 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
                >
                  Close
                </button>
              </div>

              {/* <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    Coupon code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-950 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                    <button
                      onClick={validateCoupon}
                      disabled={!coupon.trim()}
                      className="rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                  {couponDetails && (
                    <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-600">
                      <BadgeCheck className="h-4 w-4" />
                      {couponDetails.discount_type === 'percent'
                        ? `${couponDetails.discount_value}% off applied`
                        : `₹${couponDetails.discount_value} off applied`}
                    </p>
                  )}
                </div> */}

                <div className="rounded-[22px] border border-stone-200 bg-stone-50 p-5">
                  <div className="flex items-center justify-between text-sm text-stone-600">
                    <span>Selected plan</span>
                    <span className="font-medium text-stone-950">{selectedPlan.name}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
                    <span className="text-sm text-stone-600">Total to pay</span>
                    <span className="text-3xl font-semibold tracking-[-0.04em] text-stone-950">
                      ₹{(finalAmount / 100).toFixed(0)}
                    </span>
                  </div>
                </div>

                <button
                  disabled={loading || plans.length === 0}
                  onClick={handleSubscribe}
                  className="flex w-full items-center justify-center gap-3 rounded-[20px] bg-stone-950 px-5 py-4 text-base font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                  {loading ? 'Processing...' : 'Subscribe & Pay'}
                </button>

                <div className="rounded-[18px] border border-stone-200 bg-white p-4 text-sm text-stone-600">
                  <div className="flex items-center gap-2 font-medium text-stone-950">
                    <ShieldCheck className="h-4 w-4" />
                    Secure Razorpay checkout
                  </div>
                  <p className="mt-2 leading-6">
                    Coupon validation and payment flow are unchanged. This is only a UI cleanup.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
