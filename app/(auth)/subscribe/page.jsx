'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BadgeCheck, Check, ShieldCheck, Sparkles, Crown, X, ArrowRight, Lock, Zap } from 'lucide-react';

const PLAN_PRESENTATION = {
  annual: {
    title: '1Lakh + GST',
    badge: 'Annual Pro',
    accent: 'from-amber-400/[0.16] via-amber-400/[0.04] to-transparent',
    border: 'border-amber-400/25',
    ring: 'ring-amber-400/30',
    button: 'btn-gold',
    priceTone: 'text-stone-950',
    glowClass: 'glow-gold',
    hoverClass: 'hover-gold',
    iconBg: 'bg-amber-400/10 border-amber-400/20',
    iconColor: 'text-amber-400',
    badgeColor: 'text-amber-400',
    checkBg: 'bg-amber-400/10',
    checkColor: 'text-amber-400',
    modalLine: 'from-amber-400 via-orange-400 to-amber-500',
    summary: 'Annual Pro access with GST handled through invoice details before payment.',
    features: ['Base subscription: ₹1,00,000', 'GST captured through GSTIN', 'Invoice + payment link flow', 'Priority support'],
  },
  trial: {
    title: 'Product Trail',
    badge: 'Free Trial',
    accent: 'from-cyan-400/[0.16] via-cyan-400/[0.04] to-transparent',
    border: 'border-cyan-400/25',
    ring: 'ring-cyan-400/30',
    button: 'btn-cyan',
    priceTone: 'text-stone-950',
    glowClass: 'glow-cyan',
    hoverClass: 'hover-cyan',
    iconBg: 'bg-cyan-400/10 border-cyan-400/20',
    iconColor: 'text-cyan-400',
    badgeColor: 'text-cyan-400',
    checkBg: 'bg-cyan-400/10',
    checkColor: 'text-cyan-400',
    modalLine: 'from-cyan-400 via-teal-400 to-cyan-500',
    summary: 'A clear 14-day product trial with limited access and no payment required.',
    features: ['14 days access', 'Allowed once per company', '2 users included', 'Limited projects/customers'],
  },
};

const normalizePlanName = (name = '') => name.toLowerCase().replace(/[^a-z0-9]/g, '');

const ALLOWED_PLAN_NAMES = new Set(['1lakhgst', 'producttrail', 'producttrial']);

const isAllowedPlan = (plan) => ALLOWED_PLAN_NAMES.has(normalizePlanName(plan.name));

const isTrialPlan = (plan) => {
  const normalized = normalizePlanName(plan?.name);
  return normalized === 'producttrail' || normalized === 'producttrial' || Number(plan?.price) === 0;
};

const getPlanSortOrder = (plan) => {
  const normalized = normalizePlanName(plan.name);
  if (normalized === '1lakhgst') return 0;
  if (normalized === 'producttrail' || normalized === 'producttrial') return 1;
  return 2;
};

const getPlanPresentation = (plan) => {
  if (isTrialPlan(plan)) return PLAN_PRESENTATION.trial;
  return { ...PLAN_PRESENTATION.annual, title: plan.name, badge: 'Annual' };
};

const formatPlanPrice = (amountInPaise) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amountInPaise || 0) / 100);

const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i;

const getPlanAmountLabel = (plan, amountInPaise) => {
  if (!plan) return formatPlanPrice(amountInPaise);
  if (isTrialPlan(plan)) return formatPlanPrice(0);
  return `${formatPlanPrice(amountInPaise)} + GST`;
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
  const [gstNumber, setGstNumber] = useState('');
  const [gstError, setGstError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) || plans[0] || null;
  const selectedTheme = selectedPlan ? getPlanPresentation(selectedPlan) : PLAN_PRESENTATION.annual;

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/plans`);
        const activePlans = data
          .filter((plan) => plan.is_active && isAllowedPlan(plan))
          .sort((a, b) => getPlanSortOrder(a) - getPlanSortOrder(b));
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

    const trimmedGstNumber = gstNumber.trim().toUpperCase();
    if (!isTrialPlan(selectedPlan) && !GSTIN_PATTERN.test(trimmedGstNumber)) {
      setLoading(false);
      setGstError('Enter a valid 15-character GSTIN.');
      return toast.error('Valid GSTIN is required for the annual plan');
    }

    let res;

    try {
      res = await axios.post(`${API_URL}/api/subscribe/create-order`, {
        firebase_uid: currentUser.uid,
        plan: selectedPlan.name,
        coupon,
        gst_number: isTrialPlan(selectedPlan) ? null : trimmedGstNumber,
      });

      if (res.data.free_checkout) {
        toast.success('Subscription activated successfully!');
        router.push('/admin/dashboard');
        return;
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
          prefill: { email: currentUser.email },
          theme: { color: '#000000' },
          modal: { ondismiss: () => toast.error('Payment cancelled.') },
        });
        rzp.open();
      };

      script.onerror = () => {
        toast.error('Failed to load payment gateway. Please try again.');
        setLoading(false);
      };

      document.body.appendChild(script);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Subscription failed.');
    } finally {
      if (!res?.data?.free_checkout) setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Loading</span>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .btn-gold {
          background: linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%);
          color: #000;
          box-shadow: 0 4px 18px rgba(245, 158, 11, 0.25);
          transition: all 0.2s ease;
          font-weight: 700;
        }
        .btn-gold:hover:not(:disabled) {
          box-shadow: 0 8px 28px rgba(245, 158, 11, 0.35);
          transform: translateY(-1px);
        }
        .btn-cyan {
          background: linear-gradient(135deg, #67e8f9 0%, #06b6d4 100%);
          color: #000;
          box-shadow: 0 4px 18px rgba(6, 182, 212, 0.22);
          transition: all 0.2s ease;
          font-weight: 700;
        }
        .btn-cyan:hover:not(:disabled) {
          box-shadow: 0 8px 28px rgba(6, 182, 212, 0.32);
          transform: translateY(-1px);
        }
        .glow-gold {
          border-color: rgba(251, 191, 36, 0.35) !important;
          box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.25), 0 18px 48px rgba(15,23,42,0.08);
        }
        .glow-cyan {
          border-color: rgba(34, 211, 238, 0.35) !important;
          box-shadow: 0 0 0 1px rgba(34, 211, 238, 0.25), 0 18px 48px rgba(15,23,42,0.08);
        }
        .hover-gold { transition: all 0.3s ease; }
        .hover-gold:hover {
          border-color: rgba(251, 191, 36, 0.14) !important;
          box-shadow: 0 18px 44px rgba(15,23,42,0.08);
          transform: translateY(-4px);
        }
        .hover-cyan { transition: all 0.3s ease; }
        .hover-cyan:hover {
          border-color: rgba(34, 211, 238, 0.14) !important;
          box-shadow: 0 18px 44px rgba(15,23,42,0.08);
          transform: translateY(-4px);
        }
        .plan-card { transition: all 0.3s ease; }
        @keyframes orb1 {
          0%, 100% { transform: translate(0px, 0px); }
          40% { transform: translate(30px, -40px); }
          70% { transform: translate(-20px, 25px); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0px, 0px); }
          35% { transform: translate(-35px, 25px); }
          65% { transform: translate(20px, -30px); }
        }
        @keyframes orb3 {
          0%, 100% { transform: translate(0px, 0px); }
          30% { transform: translate(25px, 30px); }
          60% { transform: translate(-15px, -20px); }
        }
        .orb-1 { animation: orb1 14s ease-in-out infinite; }
        .orb-2 { animation: orb2 18s ease-in-out infinite 3s; }
        .orb-3 { animation: orb3 22s ease-in-out infinite 6s; }
        .price-bar-glow {
          box-shadow: 0 12px 32px rgba(15,23,42,0.08);
        }
        .modal-shadow {
          box-shadow: 0 30px 90px rgba(15,23,42,0.18), 0 0 0 1px rgba(15,23,42,0.06);
        }
      `}</style>

      <div className="relative min-h-screen overflow-hidden bg-white">
        {/* Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-20 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-16 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-stone-500">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Subscription Plans
            </div>

            <h1 className="text-5xl font-black tracking-[-0.04em] text-stone-950 sm:text-6xl lg:text-[5.5rem] lg:leading-[1.02]">
              Choose your{' '}
              <span className="text-stone-950">plan</span>
            </h1>

            <p className="mx-auto mt-5 max-w-md text-base leading-7 text-stone-600 sm:text-lg">
              Start with a free trial or unlock the full annual platform with dedicated support.
            </p>

            {/* Price summary bar */}
            <div className="mx-auto mt-10 inline-flex items-center gap-5 rounded-2xl border border-stone-200 bg-white px-5 py-4 price-bar-glow">
              <div className="text-left">
                <div className="text-[9px] font-bold uppercase tracking-[0.28em] text-stone-500">Selected total</div>
                <div className="mt-0.5 text-2xl font-black tracking-[-0.04em] text-stone-950">
                  {getPlanAmountLabel(selectedPlan, finalAmount)}
                </div>
              </div>
              <div className="h-8 w-px bg-stone-200" />
              <button
                onClick={() => selectedPlan && setShowCheckoutModal(true)}
                disabled={!selectedPlan}
                className="btn-gold flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const theme = getPlanPresentation(plan);
              const isTrial = isTrialPlan(plan);

              return (
                <div
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlanId(plan.id);
                    setCouponDetails(null);
                    setCoupon('');
                    setGstError('');
                  }}
                  className={`plan-card relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border bg-white ${
                    isSelected ? `${theme.glowClass}` : `border-stone-200 ${theme.hoverClass}`
                  }`}
                  style={{ minHeight: 480 }}
                >
                  {/* Top gradient */}
                  <div className={`absolute inset-x-0 top-0 h-36 bg-gradient-to-b ${theme.accent}`} />

                  {/* Selected checkmark */}
                  {isSelected && (
                    <div className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm">
                      <Check className="h-3.5 w-3.5 text-stone-950" strokeWidth={3} />
                    </div>
                  )}

                  <div className="relative flex h-full flex-col p-7">
                    {/* Card top row */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className={`text-[9px] font-black uppercase tracking-[0.35em] ${theme.badgeColor}`}>
                          {theme.badge}
                        </div>
                        <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-stone-950">
                          {plan.name}
                        </h3>
                      </div>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${theme.iconBg}`}>
                        {isTrial
                          ? <ShieldCheck className={`h-5 w-5 ${theme.iconColor}`} />
                          : <Crown className={`h-5 w-5 ${theme.iconColor}`} />
                        }
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mt-9">
                      <div className="flex items-end gap-2">
                        <div className={`text-[3.25rem] font-black leading-none tracking-[-0.05em] ${theme.priceTone}`}>
                          {formatPlanPrice(plan.price)}
                        </div>
                        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">
                          {isTrial ? '/ trial' : '+ gst / yr'}
                        </div>
                      </div>

                      {!isTrial && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] font-medium text-stone-600">
                            GST 18% on invoice
                          </div>
                          <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] font-medium text-stone-600">
                            Payment link after GSTIN
                          </div>
                        </div>
                      )}

                      <p className="mt-5 min-h-[52px] text-sm leading-6 text-stone-600">
                        {theme.summary}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="my-5 h-px w-full bg-stone-200" />

                    {/* Features */}
                    <div className="space-y-3">
                      {theme.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3">
                          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${theme.checkBg}`}>
                            <Check className={`h-2.5 w-2.5 ${theme.checkColor}`} strokeWidth={3} />
                          </div>
                          <span className="text-sm text-stone-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action row */}
                    <div className="mt-auto flex items-center gap-3 pt-8">
                      <button
                        type="button"
                        className={`flex-1 rounded-2xl px-4 py-3 text-sm transition ${
                          isSelected
                            ? `${theme.button}`
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-950'
                        }`}
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
                          className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 hover:text-stone-950"
                        >
                          {isTrial ? 'Activate' : 'Pay'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust row */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-[11px] font-medium text-stone-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secured by Razorpay
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5" />
              Instant activation
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-3.5 w-3.5" />
              GST invoice provided
            </div>
          </div>
        </div>

        {/* Checkout modal */}
        {showCheckoutModal && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-0 pt-6 sm:items-center sm:pb-6">
            <div
              className="absolute inset-0 bg-stone-950/30 backdrop-blur-sm"
              onClick={() => setShowCheckoutModal(false)}
            />
            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white modal-shadow">
              {/* Colored top line */}
              <div className={`h-[2px] w-full bg-gradient-to-r ${selectedTheme.modalLine}`} />

              <div className="p-6">
                {/* Modal header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className={`text-[9px] font-black uppercase tracking-[0.32em] ${selectedTheme.badgeColor}`}>
                      Checkout
                    </div>
                    <h2 className="mt-1.5 text-2xl font-black tracking-[-0.04em] text-stone-950">
                      {selectedPlan.name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCheckoutModal(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-500 transition hover:bg-stone-100 hover:text-stone-950"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  {/* GSTIN input */}
                  {!isTrialPlan(selectedPlan) && (
                    <div>
                      <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.28em] text-stone-500">
                        GSTIN
                      </label>
                      <input
                        type="text"
                        placeholder="22AAAAA0000A1Z5"
                        className={`w-full rounded-2xl border bg-white px-4 py-3 font-mono text-sm uppercase text-stone-950 placeholder:text-stone-400 focus:outline-none transition ${
                          gstError
                            ? 'border-red-500/40 focus:border-red-500/60'
                            : 'border-stone-200 focus:border-stone-400'
                        }`}
                        value={gstNumber}
                        maxLength={15}
                        onChange={(e) => {
                          setGstNumber(e.target.value.toUpperCase());
                          setGstError('');
                        }}
                      />
                      <p className={`mt-2 text-xs ${gstError ? 'text-red-600' : 'text-stone-500'}`}>
                        {gstError || 'We validate GSTIN for invoice and payment link processing.'}
                      </p>
                    </div>
                  )}

                  {/* Order summary */}
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-600">Plan</span>
                      <span className="font-bold text-stone-950">{selectedPlan.name}</span>
                    </div>
                    {!isTrialPlan(selectedPlan) && (
                      <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-3 text-xs">
                        <span className="text-stone-600">GST</span>
                        <span className="text-right text-stone-500">Added on invoice after GSTIN</span>
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-3">
                      <span className="text-sm text-stone-600">Total</span>
                      <span className={`text-3xl font-black tracking-[-0.04em] ${selectedTheme.priceTone}`}>
                        {getPlanAmountLabel(selectedPlan, finalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* CTA button */}
                  <button
                    disabled={loading || plans.length === 0}
                    onClick={handleSubscribe}
                    className={`flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${selectedTheme.button}`}
                  >
                    {loading ? (
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {loading
                      ? 'Processing...'
                      : isTrialPlan(selectedPlan)
                        ? 'Activate Trial'
                        : 'Validate GSTIN & Continue'}
                  </button>

                  {/* Security note */}
                  <div className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-3.5">
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-500" />
                    <p className="text-xs leading-5 text-stone-600">
                      <span className="font-semibold text-stone-950">Secure Razorpay checkout.</span>{' '}
                      Trial needs no payment. Annual Pro uses invoice details first, then payment link.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
