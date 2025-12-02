// components/CreditsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { CREDIT_PLANS } from '../constants';
import Button from './ui/Button';
import GlassCard from './ui/GlassCard';
import Input from './ui/Input';
import Loader from './ui/Loader';
import { backendApi } from '../services/backendApi';
import { ApiResponse, CreditPlan } from '../types';
import { Head } from '@unhead/react';

const CreditsPage = () => {
  const { user, loading: authLoading, isAuthenticated, updateUserCredits } = useAuth(); // Added updateUserCredits
  const [availableCreditPlans, setAvailableCreditPlans] = useState<CreditPlan[]>([]); // New state for dynamic plans
  const [selectedPlan, setSelectedPlan] = useState<{ id: number, credits: number, price: number, usdValue: number } | null>(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [utrCode, setUtrCode] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [globalNotice, setGlobalNotice] = useState(''); // Existing global notice (from LandingPage useEffect)
  const [creditsPageNotice, setCreditsPageNotice] = useState(''); // New credits page specific notice
  const [noticeError, setNoticeError] = useState<string | null>(null);
  const [oxapayRedirecting, setOxapayRedirecting] = useState(false);
  const [upiRedirecting, setUpiRedirecting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'crypto'>('crypto');

  const isIndianUser = user?.country === 'India';
  const currencySymbol = isIndianUser ? '₹' : '$';
  const currencyCode = isIndianUser ? 'INR' : 'USD';

  // Fetch global and credits page notices
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const globalResponse: ApiResponse<string> = await backendApi.getGlobalNotice();
        if (globalResponse.success) {
          setGlobalNotice(globalResponse.data);
        } else {
          setNoticeError(globalResponse.message || 'Failed to fetch global notice.');
        }

        const creditsPageResponse: ApiResponse<string> = await backendApi.getCreditsPageNotice();
        if (creditsPageResponse.success) {
          setCreditsPageNotice(creditsPageResponse.data);
        } else {
          setNoticeError(creditsPageResponse.message || 'Failed to fetch credits page notice.');
        }
      } catch (err) {
        console.error('Error fetching notices for CreditsPage:', err);
        setNoticeError('An unexpected error occurred while fetching notices.');
      }
    };
    fetchNotices();
  }, []);

  // Fetch dynamic credit plans
  useEffect(() => {
    const fetchCreditPlans = async () => {
      try {
        const response: ApiResponse<CreditPlan[]> = await backendApi.getAvailableCreditPlans();
        if (response.success) {
          setAvailableCreditPlans(response.data);
        } else {
          console.error('Failed to fetch credit plans:', response.message);
          setAvailableCreditPlans(CREDIT_PLANS); // Fallback to constants if dynamic fetch fails, or show error
        }
      } catch (err) {
        console.error('Error fetching credit plans:', err);
        setAvailableCreditPlans(CREDIT_PLANS); // Fallback
      }
    };
    fetchCreditPlans();
  }, [isAuthenticated]); // Rerun if auth status changes


  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <Loader message="Loading user data..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <GlassCard className="p-8 text-center">
          <h2 className="text-2xl font-bold text-darkText dark:text-lightText mb-4">Access Denied</h2>
          <p className="text-gray-500 dark:text-gray-400">Please log in to view and manage your credits.</p>
        </GlassCard>
      </div>
    );
  }

  const getPlanPrice = (plan: CreditPlan) => {
    return isIndianUser ? plan.inrPrice : plan.usdPrice;
  };

  const handlePlanSelect = (plan: CreditPlan) => {
    const price = getPlanPrice(plan);
    setSelectedPlan({
      id: plan.id, // Add ID to selected plan
      credits: plan.credits,
      price: price,
      usdValue: plan.usdPrice, // Store USD value for crypto payments
    });
    setAmountPaid(String(price)); // Pre-fill amount for UPI if applicable
    setUtrCode(''); // Clear UTR
    setNote(''); // Clear note
    setFormError(null);
    setFormSuccess(null);
  };

  const handlePaymentSubmit = async (e: any) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!selectedPlan) {
      setFormError('Please select a credit plan.');
      return;
    }
    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      setFormError('Please enter a valid amount paid.');
      return;
    }
    if (!utrCode.trim()) {
      setFormError('Please enter the UTR Code.');
      return;
    }
    if (!paymentDate) {
      setFormError('Please select the date of payment.');
      return;
    }

    setSubmittingPayment(true);
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setFormError('Authentication token not found.');
        setSubmittingPayment(false);
        return;
      }
      const response: ApiResponse<{ message: string }> = await backendApi.submitPaymentRequest(
        token,
        `${selectedPlan.credits} Credits`,
        selectedPlan.credits, // Pass explicit credits
        parseFloat(amountPaid),
        utrCode.trim(),
        paymentDate,
        note.trim()
      );

      if (response.success) {
        setFormSuccess(response.data.message);
        // Clear form fields after submission
        setSelectedPlan(null);
        setAmountPaid('');
        setUtrCode('');
        setPaymentDate(new Date().toISOString().slice(0, 10));
        setNote('');
      } else {
        setFormError(response.message || 'Failed to submit payment request.');
      }
    } catch (err) {
      console.error('Payment submission error:', err);
      setFormError('An unexpected error occurred while submitting payment.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleCryptoPayment = async () => {
    if (!selectedPlan || !user) {
      setFormError('Please select a credit plan and ensure you are logged in.');
      return;
    }
    setFormError(null);
    setFormSuccess(null);
    setOxapayRedirecting(true);

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setFormError('Authentication token not found.');
      setOxapayRedirecting(false);
      return;
    }

    const amountInUSD = selectedPlan.usdValue;
    const orderId = `${user.id}-${selectedPlan.credits}-${Date.now()}`;

    // Construct return URL ensuring hash consistency for React Router
    // This redirects to the Profile page where verification happens automatically
    const baseUrl = window.location.origin + window.location.pathname;
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    const returnUrl = `${cleanBaseUrl}#/profile`;

    try {
      const response: ApiResponse<{ message: string; paymentUrl?: string }> = await backendApi.submitCryptoPaymentIntent(
        token,
        orderId,
        selectedPlan.credits,
        amountInUSD,
        returnUrl
      );

      if (response.success && response.data.paymentUrl) {
        window.location.replace(response.data.paymentUrl);
      } else {
        setFormError(response.message || 'Failed to initiate crypto payment.');
        setOxapayRedirecting(false);
      }
    } catch (err) {
      console.error('Crypto payment initiation error:', err);
      setFormError('An unexpected error occurred while initiating crypto payment.');
      setOxapayRedirecting(false);
    }
  };

  const handleUpiPayment = async () => {
    if (!selectedPlan || !user) {
      setFormError('Please select a credit plan and ensure you are logged in.');
      return;
    }
    setFormError(null);
    setFormSuccess(null);
    setUpiRedirecting(true);

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setFormError('Authentication token not found.');
      setUpiRedirecting(false);
      return;
    }

    const amountInINR = selectedPlan.price; // Price shown for Indian users
    const orderId = `${user.id}-upi-${selectedPlan.credits}-${Date.now()}`;

    const baseUrl = window.location.origin + window.location.pathname;
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    const returnUrl = `${cleanBaseUrl}#/profile`;

    try {
      const response: ApiResponse<{ message: string; paymentUrl?: string }> = await backendApi.submitUpiPaymentIntent(
        token,
        orderId,
        selectedPlan.credits,
        amountInINR,
        returnUrl
      );

      if (response.success && response.data.paymentUrl) {
        window.location.replace(response.data.paymentUrl);
      } else {
        setFormError(response.message || 'Failed to initiate UPI payment.');
        setUpiRedirecting(false);
      }
    } catch (err) {
      console.error('UPI payment initiation error:', err);
      setFormError('An unexpected error occurred while initiating UPI payment.');
      setUpiRedirecting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Buy Credits - VERONIKAextra Images</title>
        <meta name="description" content="Purchase credits to generate more AI images. Flexible pricing plans to suit your creative needs." />
        <meta name="keywords" content="AI, image generation, credits, purchase, VERONIKAextra, payments" />
        <meta property="og:title" content="Buy Credits - VERONIKAextra Images" />
        <meta property="og:description" content="Purchase credits to generate more AI images. Flexible pricing plans to suit your creative needs." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://veronikaextra-images.com/credits" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Buy Credits - VERONIKAextra Images" />
        <meta name="twitter:description" content="Purchase credits to generate more AI images. Flexible pricing plans to suit your creative needs." />
        <link rel="canonical" href="https://veronikaextra-images.com/credits" />
      </Head>
      <div className="flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 min-h-[calc(100vh-160px)]">
        {/* Notices */}
        {globalNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl mb-6"
          >
            <GlassCard className="p-4 text-center bg-accent/20 border-accent/50">
              <p className="font-semibold text-lg">{globalNotice}</p>
            </GlassCard>
          </motion.div>
        )}
        {creditsPageNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-4xl mb-6"
          >
            <GlassCard className="p-4 text-center bg-blue-500/20 border-blue-500/50">
              <p className="font-semibold text-lg">{creditsPageNotice}</p>
            </GlassCard>
          </motion.div>
        )}
        {noticeError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl mb-6"
          >
            <GlassCard className="p-4 text-center bg-red-500/20 border-red-500/50">
              <p className="font-semibold text-lg">Error: {noticeError}</p>
            </GlassCard>
          </motion.div>
        )}

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl mb-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-darkText dark:text-lightText mb-3">
            Purchase Credits
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Select a credit package to unlock more AI image generations
          </p>
        </motion.div>

        {/* Credit Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-4xl mb-10"
        >
          <h2 className="text-2xl font-bold text-darkText dark:text-lightText mb-6 text-center">Available Credit Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCreditPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -5 }}
              >
                <GlassCard
                  className={`p-6 cursor-pointer transition-all duration-300 ${selectedPlan?.id === plan.id
                    ? 'ring-2 ring-premiumGradientStart shadow-premium-glow'
                    : 'hover:shadow-lg'
                    }`}
                  onClick={() => handlePlanSelect(plan)}
                >
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-darkText dark:text-lightText mb-2">{plan.credits} Credits</h3>
                    <p className="text-2xl font-extrabold text-premiumGradientStart mb-4">
                      {currencySymbol}{getPlanPrice(plan)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isIndianUser
                        ? `≈ $${plan.usdPrice} USD`
                        : `≈ ₹${plan.inrPrice} INR`}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Payment Section */}
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl"
          >
            <GlassCard className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-darkText dark:text-lightText mb-6 text-center">
                Complete Your Purchase
              </h2>

              {/* Selected Plan Summary */}
              <div className="mb-6 p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50">
                <h3 className="text-lg font-semibold text-darkText dark:text-lightText mb-2">Selected Plan</h3>
                <p className="text-darkText dark:text-lightText">
                  <span className="font-bold">{selectedPlan.credits} Credits</span> for {currencySymbol}{selectedPlan.price}
                </p>
              </div>

              {/* Payment Options */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-darkText dark:text-lightText mb-4 text-center">Payment Method</h3>

                {isIndianUser ? (
                  <div className="mb-6">
                    <div className="flex space-x-4 mb-6 justify-center">
                      <button
                        onClick={() => setPaymentMethod('upi')}
                        className={`px-4 py-2 rounded-lg transition-all ${paymentMethod === 'upi'
                          ? 'bg-premiumGradientStart text-white shadow-lg'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        Pay with UPI
                      </button>
                      <button
                        onClick={() => setPaymentMethod('crypto')}
                        className={`px-4 py-2 rounded-lg transition-all ${paymentMethod === 'crypto'
                          ? 'bg-premiumGradientStart text-white shadow-lg'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        Pay with oxaPay
                      </button>
                    </div>

                    {paymentMethod === 'upi' ? (
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Pay securely using UPI via our payment gateway
                        </p>
                        <Button
                          variant="primary"
                          className="w-full"
                          onClick={handleUpiPayment}
                          loading={upiRedirecting}
                        >
                          {upiRedirecting ? 'Redirecting to UPI...' : 'Pay with UPI'}
                        </Button>
                      </div>
                    ) : (
                      // Crypto Payment Button (for Indian users who select it)
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Pay securely with cryptocurrency via oxaPay (Oxapay)
                        </p>
                        <Button
                          variant="premium"
                          className="w-full"
                          onClick={handleCryptoPayment}
                          loading={oxapayRedirecting}
                        >
                          {oxapayRedirecting ? 'Redirecting to oxaPay...' : 'Pay with oxaPay'}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  // Crypto Payment Button (for non-Indian users)
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Pay securely with cryptocurrency via oxaPay (Oxapay)
                    </p>
                    <Button
                      variant="premium"
                      className="w-full"
                      onClick={handleCryptoPayment}
                      loading={oxapayRedirecting}
                    >
                      {oxapayRedirecting ? 'Redirecting to oxaPay...' : 'Pay with oxaPay'}
                    </Button>
                  </div>
                )}
              </div>

              

              {/* Form Feedback */}
              {formError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-center"
                >
                  <p className="text-red-600 dark:text-red-400 font-medium">{formError}</p>
                </motion.div>
              )}
              {formSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-center"
                >
                  <p className="text-green-600 dark:text-green-400 font-medium">{formSuccess}</p>
                </motion.div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full max-w-4xl mt-10"
        >
          <GlassCard className="p-6 text-center">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span className="text-darkText dark:text-lightText">Secure Payments</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span className="text-darkText dark:text-lightText">Instant Credit Delivery</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span className="text-darkText dark:text-lightText">24/7 Support</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </>
  );
};

export default CreditsPage;
