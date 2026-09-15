import React, { useState } from 'react';
import {
  Building2,
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  CreditCard,
  RefreshCw,
  Languages,
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { BUSINESS_TYPES, BusinessProfile, BusinessType } from '../../types/onboarding';
import { Organization, OnboardingRecord, SubscriptionDetails } from '../../types/business';
import { saveOrganizationRecord } from '../../services/organizationService';
import { PLAN_CONFIGS, PlanId } from '../../config/plans';
import { launchRazorpayCheckout } from '../../services/paymentService';
import { FormField, fieldInputClasses } from '../onboarding/FormField';

interface MSMERegistrationFlowProps {
  onRegistrationComplete: (org: Organization) => void;
  onSwitchToLogin: () => void;
  onGoHome: () => void;
}

type RegStep = 'business' | 'account' | 'plan' | 'payment_pending' | 'success';

export const MSMERegistrationFlow: React.FC<MSMERegistrationFlowProps> = ({
  onRegistrationComplete,
  onSwitchToLogin,
  onGoHome,
}) => {
  const { register, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [step, setStep] = useState<RegStep>('business');

  // Step 1: Business Details
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    businessName: '',
    businessType: '',
    industry: '',
    location: '',
    yearEstablished: new Date().getFullYear() - 2,
    numberOfEmployees: 10,
    annualTurnover: 5000000,
  });
  const [bizErrors, setBizErrors] = useState<Record<string, string>>({});

  // Step 2: Account Details
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountError, setAccountError] = useState<string | null>(null);

  // Step 3: Plan Selection
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>('professional');

  // Step 4: Payment state & created pending org
  const [createdOrg, setCreatedOrg] = useState<Organization | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [verifiedSubscription, setVerifiedSubscription] = useState<SubscriptionDetails | null>(null);

  // Validate Step 1: Business Details
  const validateBusiness = (): boolean => {
    const errs: Record<string, string> = {};
    if (!businessProfile.businessName.trim()) {
      errs.businessName = t('onboarding.businessNameReq', 'Business legal name is required.');
    }
    if (!businessProfile.businessType) {
      errs.businessType = t('onboarding.businessTypeReq', 'Select legal structure.');
    }
    if (!businessProfile.industry.trim()) {
      errs.industry = t('onboarding.industryReq', 'Industry domain is required.');
    }
    if (!businessProfile.location.trim()) {
      errs.location = t('onboarding.locationReq', 'Location (City, State) is required.');
    }
    if (businessProfile.yearEstablished === '' || Number(businessProfile.yearEstablished) < 1900) {
      errs.yearEstablished = t('onboarding.yearReq', 'Enter a valid established year.');
    }
    if (businessProfile.annualTurnover === '' || Number(businessProfile.annualTurnover) <= 0) {
      errs.annualTurnover = t('onboarding.turnoverReq', 'Enter your approximate turnover.');
    }

    setBizErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Validate Step 2: Account Details
  const validateAccount = (): boolean => {
    setAccountError(null);
    if (!ownerName.trim()) {
      setAccountError(t('auth.nameRequired', 'Full name is required.'));
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailPattern.test(email.trim())) {
      setAccountError(t('auth.emailRequired', 'A valid email address is required.'));
      return false;
    }
    if (password.length < 6) {
      setAccountError(t('auth.passwordLength', 'Password must be at least 6 characters long.'));
      return false;
    }
    if (password !== confirmPassword) {
      setAccountError(t('auth.passwordsDoNotMatch', 'Passwords do not match.'));
      return false;
    }
    return true;
  };

  // Proceed from Step 1 to Step 2
  const handleProceedToAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateBusiness()) {
      setStep('account');
    }
  };

  // Proceed from Step 2 to Step 3: Creates/pre-registers Firebase user & pending organization record
  const handleProceedToPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAccount()) return;

    setPaymentLoading(true);
    setAccountError(null);

    try {
      // 1. Create Firebase Authentication Account
      let authenticatedUser = user;
      if (!authenticatedUser) {
        authenticatedUser = await register(ownerName.trim(), email.trim(), password);
      }

      const uid = authenticatedUser.uid;
      const userMail = authenticatedUser.email || email.trim();
      const now = new Date().toISOString();

      // 2. Initialize pending Organization record (Strictly locked with accessStatus: 'pending_payment')
      const orgId = 'org-' + Date.now();
      const initialOrg: Organization = {
        id: orgId,
        name: businessProfile.businessName.trim(),
        ownerId: uid,
        ownerEmail: userMail,
        businessProfile,
        financialProfile: {
          monthlyRevenue: Math.round(Number(businessProfile.annualTurnover) / 12),
          monthlyOperatingExpenses: Math.round(Number(businessProfile.annualTurnover) * 0.7 / 12),
          monthlyMaterialCost: Math.round(Number(businessProfile.annualTurnover) * 0.4 / 12),
          monthlySalaryCost: Math.round(Number(businessProfile.annualTurnover) * 0.2 / 12),
          currentCashBalance: Math.round(Number(businessProfile.annualTurnover) * 0.15),
          accountsReceivable: Math.round(Number(businessProfile.annualTurnover) * 0.12),
          accountsPayable: Math.round(Number(businessProfile.annualTurnover) * 0.08),
          inventoryValue: Math.round(Number(businessProfile.annualTurnover) * 0.1),
        },
        debtProfile: {
          hasLoans: false,
          loanDetails: null,
          gstRegistered: true,
          itrAvailable: true,
          hasBusinessBankAccount: true,
        },
        complianceProfile: {
          gstRegistered: true,
          itrAvailable: true,
          hasBusinessBankAccount: true,
        },
        goals: {
          goals: ['Improve Cash Flow', 'Get Business Funding'],
          biggestChallenge: 'Cash Flow',
        },
        subscription: {
          plan: 'starter',
          status: 'pending', // NOT ACTIVE
          startDate: now,
          expiryDate: now,
          amount: 0,
          currency: 'INR',
          notes: 'Registration started. Awaiting payment verification.',
        },
        accountStatus: 'active',
        accessStatus: 'pending_payment', // ACCESS STRICTLY BLOCKED BEFORE PAYMENT
        registrationStatus: 'pending_payment',
        createdAt: now,
        updatedAt: now,
      };

      const record: OnboardingRecord = {
        ownerId: uid,
        ownerEmail: userMail,
        user: {
          id: uid,
          name: ownerName.trim(),
          email: userMail,
        },
        organization: initialOrg,
      };

      await saveOrganizationRecord(record);
      setCreatedOrg(initialOrg);
      setStep('plan');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setAccountError(t('auth.emailInUse', 'An account with this email already exists.'));
      } else {
        setAccountError(err.message || 'Failed to initialize registration.');
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  // Launch Razorpay Standard Checkout in TEST MODE
  const handleLaunchPayment = async (planIdToPay: PlanId) => {
    if (!createdOrg || !user) {
      setPaymentError('Registration session expired. Please restart.');
      return;
    }

    setPaymentLoading(true);
    setPaymentError(null);

    await launchRazorpayCheckout({
      planId: planIdToPay,
      organizationId: createdOrg.id,
      uid: user.uid,
      userEmail: user.email || email,
      userName: ownerName || user.displayName || undefined,
      businessName: businessProfile.businessName,
      onSuccess: (res) => {
        setPaymentLoading(false);
        setVerifiedSubscription(res.subscription);
        const activatedOrg: Organization = {
          ...createdOrg,
          subscription: res.subscription,
          accessStatus: 'active',
          registrationStatus: 'completed',
          updatedAt: new Date().toISOString(),
        };
        setCreatedOrg(activatedOrg);
        setStep('success');
      },
      onError: (err) => {
        setPaymentLoading(false);
        setPaymentError(err || 'Payment could not be completed. Please try again.');
        setStep('payment_pending');
      },
      onDismiss: () => {
        setPaymentLoading(false);
        setPaymentError('Payment was cancelled. Your BizPilot account has not been activated yet.');
        setStep('payment_pending');
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-purple-600/20 via-indigo-500/15 to-sky-400/20 blur-[140px] pointer-events-none rounded-full" />

      {/* Top Header Bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10 max-w-5xl mx-auto w-full">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('common.back', 'Back to Home')}</span>
        </button>

        <button
          onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-purple-400 transition-all shadow-sm backdrop-blur-md"
        >
          <Languages className="w-3.5 h-3.5 text-purple-400" />
          <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
        </button>
      </div>

      <div className="max-w-3xl mx-auto w-full relative z-10 mt-8 sm:mt-2">
        {/* Step Indicator */}
        <div className="mb-6 flex items-center justify-center gap-2 text-xs">
          {[
            { id: 'business', label: '1. Business' },
            { id: 'account', label: '2. Credentials' },
            { id: 'plan', label: '3. Choose Plan' },
            { id: 'success', label: '4. Activated' },
          ].map((s) => {
            const isCurrent = step === s.id || (step === 'payment_pending' && s.id === 'plan');
            return (
              <span
                key={s.id}
                className={
                  'px-3 py-1 rounded-full text-[11px] font-bold border transition-all ' +
                  (isCurrent
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800')
                }
              >
                {s.label}
              </span>
            );
          })}
        </div>

        {/* STEP 1: BUSINESS DETAILS */}
        {step === 'business' && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl bg-slate-900/90 backdrop-blur-xl space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {t('auth.step1Title', 'Business Information')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('auth.step1Subtitle', 'Provide your MSME registration details to personalize your financial intelligence.')}
              </p>
            </div>

            <form onSubmit={handleProceedToAccount} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label={t('onboarding.businessName', 'Business Legal Name')} required error={bizErrors.businessName} className="sm:col-span-2">
                  <input
                    type="text"
                    value={businessProfile.businessName}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, businessName: e.target.value })}
                    placeholder={t('onboarding.businessNamePh', 'e.g. Shree Ganesh Agro Foods')}
                    className={fieldInputClasses(!!bizErrors.businessName)}
                  />
                </FormField>

                <FormField label={t('onboarding.businessType', 'Legal Structure')} required error={bizErrors.businessType}>
                  <select
                    value={businessProfile.businessType}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, businessType: e.target.value as BusinessType })}
                    className={fieldInputClasses(!!bizErrors.businessType)}
                  >
                    <option value="">{t('common.select', 'Select structure')}</option>
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label={t('onboarding.industry', 'Industry Domain')} required error={bizErrors.industry}>
                  <input
                    type="text"
                    value={businessProfile.industry}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, industry: e.target.value })}
                    placeholder="e.g. Manufacturing / Food Processing"
                    className={fieldInputClasses(!!bizErrors.industry)}
                  />
                </FormField>

                <FormField label={t('onboarding.location', 'Location (City, State)')} required error={bizErrors.location}>
                  <input
                    type="text"
                    value={businessProfile.location}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, location: e.target.value })}
                    placeholder="e.g. Coimbatore, Tamil Nadu"
                    className={fieldInputClasses(!!bizErrors.location)}
                  />
                </FormField>

                <FormField label={t('onboarding.yearEstablished', 'Year Established')} required error={bizErrors.yearEstablished}>
                  <input
                    type="number"
                    value={businessProfile.yearEstablished}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, yearEstablished: Number(e.target.value) || '' })}
                    className={fieldInputClasses(!!bizErrors.yearEstablished)}
                  />
                </FormField>

                <FormField label={t('onboarding.annualTurnover', 'Annual Turnover (₹)')} required error={bizErrors.annualTurnover} className="sm:col-span-2">
                  <input
                    type="number"
                    value={businessProfile.annualTurnover}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, annualTurnover: Number(e.target.value) || '' })}
                    placeholder="e.g. 5000000 (50 Lakhs)"
                    className={fieldInputClasses(!!bizErrors.annualTurnover)}
                  />
                </FormField>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  {t('auth.alreadyHaveAccount', 'Already have an account? Sign in')}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
                >
                  <span>{t('common.next', 'Next: Login Credentials')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: ACCOUNT / CREDENTIALS */}
        {step === 'account' && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl bg-slate-900/90 backdrop-blur-xl space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {t('auth.accountStepTitle', 'Create Sign-in Credentials')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('auth.accountStepSubtitle', 'Secure your MSME portal with Firebase authentication.')}
              </p>
            </div>

            {accountError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{accountError}</span>
              </div>
            )}

            <form onSubmit={handleProceedToPlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('auth.fullName', 'Owner / Managing Director Name')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('auth.email', 'Email Address')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. owner@mybusiness.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('auth.password', 'Password')}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('auth.confirmPassword', 'Confirm Password')}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep('business')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('common.back', 'Back')}</span>
                </button>

                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-purple-600/30 disabled:opacity-50"
                >
                  {paymentLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>{t('common.next', 'Next: Choose Plan & Pay')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: PLAN SELECTION & RAZORPAY TEST CHECKOUT */}
        {(step === 'plan' || step === 'payment_pending') && (
          <div className="space-y-6">
            {/* Payment Failure / Cancellation Recovery Banner */}
            {paymentError && (
              <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs space-y-2 shadow-xl">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{t('subscription.regIncompleteTitle', 'Registration Incomplete — Payment Required')}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {paymentError}
                </p>
                <div className="text-[11px] text-amber-300/80">
                  {t('subscription.paymentRequiredNotice', 'Your BizPilot workspace cannot be opened until subscription payment is completed.')}
                </div>
              </div>
            )}

            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Razorpay Test Mode
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                {t('subscription.choosePlanTitle', 'Select Plan & Activate Platform Access')}
              </h2>
              <p className="text-xs text-slate-400">
                One-time 30-day term. Zero auto-renewal, test mode amounts.
              </p>
            </div>

            {/* 2-Column Test Plan Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Starter (₹1 Test Price) */}
              <div
                onClick={() => setSelectedPlanId('starter')}
                className={
                  'rounded-2xl p-6 border cursor-pointer transition-all flex flex-col justify-between ' +
                  (selectedPlanId === 'starter'
                    ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/40 shadow-xl'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700')
                }
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Financial Visibility</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">TEST: ₹1</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">Starter</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-black text-white">₹{PLAN_CONFIGS.starter.priceINR}</span>
                      <span className="text-xs text-slate-400">/ 30 days</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-3 border-t border-slate-800">
                    {PLAN_CONFIGS.starter.features.slice(0, 6).map((f) => (
                      <div key={f.key} className="flex items-center gap-2 text-slate-300 text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{f.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchPayment('starter');
                    }}
                    disabled={paymentLoading}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 hover:border-purple-500/40 transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                    <span>Pay ₹1 &amp; Activate Starter</span>
                  </button>
                </div>
              </div>

              {/* Professional (₹2 Test Price) */}
              <div
                onClick={() => setSelectedPlanId('professional')}
                className={
                  'rounded-2xl p-6 border-2 cursor-pointer transition-all flex flex-col justify-between relative ' +
                  (selectedPlanId === 'professional'
                    ? 'bg-gradient-to-b from-purple-950/50 to-slate-900 border-purple-500 ring-2 ring-purple-500/40 shadow-2xl shadow-purple-900/30'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700')
                }
              >
                <div className="absolute -top-3 right-6">
                  <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider">
                    RECOMMENDED
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-purple-300">Decision Intelligence</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">TEST: ₹2</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-1.5">
                      Professional
                      <Zap className="w-4 h-4 text-purple-400 fill-purple-400" />
                    </h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-black text-white">₹{PLAN_CONFIGS.professional.priceINR}</span>
                      <span className="text-xs text-slate-400">/ 30 days</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-3 border-t border-slate-800">
                    <div className="text-[10px] font-bold text-purple-300 uppercase">Everything in Starter, plus:</div>
                    {[
                      'Advanced AI Business Advisor',
                      'Advanced Decision Lab',
                      'Advanced Growth Intelligence',
                      'Detailed AI Business Report',
                      'Export / Share Reports (PDF)',
                    ].map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-slate-200 text-[11px]">
                        <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchPayment('professional');
                    }}
                    disabled={paymentLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay ₹2 &amp; Activate Professional</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 4: VERIFIED ACCOUNT ACTIVATED SUCCESS */}
        {step === 'success' && (
          <div className="glass-panel rounded-2xl p-8 border border-emerald-500/40 shadow-2xl bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-900 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto shadow-2xl shadow-emerald-950/50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Payment &amp; Account Activated</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {t('subscription.accountReadyTitle', 'Your BizPilot AI Account is Ready!')}
              </h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Payment has been confirmed with Razorpay. Your 30-day access is officially active.
              </p>
            </div>

            {/* Plan Details Confirmation */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 max-w-sm mx-auto grid grid-cols-2 gap-3 text-left text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Plan</span>
                <div className="font-bold text-white capitalize">{verifiedSubscription?.plan || 'Professional'}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Status</span>
                <div className="font-bold text-emerald-400">Active (30 Days)</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Valid Until</span>
                <div className="font-mono text-slate-200 text-[11px]">
                  {verifiedSubscription?.expiryDate ? new Date(verifiedSubscription.expiryDate).toLocaleDateString() : '30 days'}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Payment ID</span>
                <div className="font-mono text-purple-300 text-[11px] truncate" title={verifiedSubscription?.paymentId || ''}>
                  {verifiedSubscription?.paymentId || 'Captured'}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  if (createdOrg) {
                    onRegistrationComplete(createdOrg);
                  }
                }}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 inline-flex items-center gap-2"
              >
                <span>{t('subscription.enterPlatform', 'Enter BizPilot Platform')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
