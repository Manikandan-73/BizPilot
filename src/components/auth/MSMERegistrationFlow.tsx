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
          monthlyOperatingExpenses: 0,
          monthlyMaterialCost: 0,
          monthlySalaryCost: 0,
          currentCashBalance: 0,
          accountsReceivable: 0,
          accountsPayable: 0,
          inventoryValue: 0,
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
    <div className="min-h-screen bg-[#090B10] text-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Top Header Bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10 max-w-5xl mx-auto w-full">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#A7B0C0] hover:text-[#F8FAFC] bg-[#121722] border border-[#222936] hover:bg-[#161C27] transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('common.back', 'Back to Home')}</span>
        </button>

        <button
          onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#121722] text-[#A7B0C0] border border-[#222936] hover:border-violet-500 hover:text-[#F8FAFC] transition-all shadow-sm"
        >
          <Languages className="w-3.5 h-3.5 text-violet-400" />
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
                    ? 'bg-[#161C27] text-violet-400 border-violet-500 shadow-sm'
                    : 'bg-[#121722] text-[#707A8C] border-[#222936]')
                }
              >
                {s.label}
              </span>
            );
          })}
        </div>

        {/* STEP 1: BUSINESS DETAILS */}
        {step === 'business' && (
          <div className="bg-[#121722] rounded-2xl p-6 sm:p-8 border border-[#222936] shadow-xl space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-[#F8FAFC] tracking-tight">
                {t('auth.step1Title', 'Business Information')}
              </h2>
              <p className="text-xs text-[#A7B0C0]">
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

              <div className="pt-4 flex items-center justify-between border-t border-[#222936]">
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
                >
                  {t('auth.alreadyHaveAccount', 'Already have an account? Sign in')}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-violet-600/20"
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
          <div className="bg-[#121722] rounded-2xl p-6 sm:p-8 border border-[#222936] shadow-xl space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-[#F8FAFC] tracking-tight">
                {t('auth.accountStepTitle', 'Create Sign-in Credentials')}
              </h2>
              <p className="text-xs text-[#A7B0C0]">
                {t('auth.accountStepSubtitle', 'Secure your MSME portal with Firebase authentication.')}
              </p>
            </div>

            {accountError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{accountError}</span>
              </div>
            )}

            <form onSubmit={handleProceedToPlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                  {t('auth.fullName', 'Owner / Managing Director Name')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707A8C]" />
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D1118] border border-[#222936] text-[#F8FAFC] text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 placeholder:text-[#707A8C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                  {t('auth.email', 'Email Address')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707A8C]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. owner@mybusiness.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D1118] border border-[#222936] text-[#F8FAFC] text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 placeholder:text-[#707A8C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                    {t('auth.password', 'Password')}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707A8C]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D1118] border border-[#222936] text-[#F8FAFC] text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 placeholder:text-[#707A8C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                    {t('auth.confirmPassword', 'Confirm Password')}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707A8C]" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D1118] border border-[#222936] text-[#F8FAFC] text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 placeholder:text-[#707A8C]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#222936]">
                <button
                  type="button"
                  onClick={() => setStep('business')}
                  className="text-xs text-[#A7B0C0] hover:text-[#F8FAFC] flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('common.back', 'Back')}</span>
                </button>

                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-violet-600/20 disabled:opacity-50"
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
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs space-y-2 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{t('subscription.regIncompleteTitle', 'Registration Incomplete — Payment Required')}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-200/80">
                  {paymentError}
                </p>
                <div className="text-[11px] text-amber-300">
                  {t('subscription.paymentRequiredNotice', 'Your BizPilot workspace cannot be opened until subscription payment is completed.')}
                </div>
              </div>
            )}

            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#121722] text-violet-400 border border-[#222936]">
                Razorpay Test Mode
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight mt-1">
                {t('subscription.choosePlanTitle', 'Select Plan & Activate Platform Access')}
              </h2>
              <p className="text-xs text-[#A7B0C0]">
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
                    ? 'bg-[#161C27] border-violet-500 ring-2 ring-violet-500/20 shadow-xl'
                    : 'bg-[#121722] border-[#222936] hover:border-[#303848] shadow-sm')
                }
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#707A8C]">Financial Visibility</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0F1219] text-[#A7B0C0] font-mono border border-[#222936]">TEST: ₹1</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#F8FAFC]">Starter</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-black text-[#F8FAFC]">₹{PLAN_CONFIGS.starter.priceINR}</span>
                      <span className="text-xs text-[#707A8C]">/ 30 days</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-3 border-t border-[#222936]">
                    {PLAN_CONFIGS.starter.features.slice(0, 6).map((f) => (
                      <div key={f.key} className="flex items-center gap-2 text-[#A7B0C0] text-[11px]">
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
                    className="w-full py-2.5 rounded-xl bg-[#161C27] hover:bg-[#1A2230] text-[#F8FAFC] border border-[#222936] hover:border-[#303848] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-violet-400" />
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
                    ? 'bg-[#161C27] border-violet-500 ring-2 ring-violet-500/20 shadow-2xl shadow-violet-500/10'
                    : 'bg-[#121722] border-violet-500/50 hover:border-violet-500 shadow-sm')
                }
              >
                <div className="absolute -top-3 right-6">
                  <span className="px-3 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                    RECOMMENDED
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-violet-400">Decision Intelligence</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-950/40 text-violet-300 font-mono border border-violet-800/40">TEST: ₹2</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-1.5">
                      Professional
                      <Zap className="w-4 h-4 text-violet-400 fill-violet-400" />
                    </h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-black text-[#F8FAFC]">₹{PLAN_CONFIGS.professional.priceINR}</span>
                      <span className="text-xs text-[#707A8C]">/ 30 days</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-3 border-t border-[#222936]">
                    <div className="text-[10px] font-bold text-violet-400 uppercase">Everything in Starter, plus:</div>
                    {[
                      'Advanced AI Business Advisor',
                      'Advanced Decision Lab',
                      'Advanced Growth Intelligence',
                      'Detailed AI Business Report',
                      'Export / Share Reports (PDF)',
                    ].map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-[#A7B0C0] text-[11px]">
                        <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />
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
                    className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40"
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
          <div className="bg-[#121722] rounded-2xl p-8 border border-emerald-500/40 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400 mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-800/40">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Payment &amp; Account Activated</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">
                {t('subscription.accountReadyTitle', 'Your BizPilot AI Account is Ready!')}
              </h2>
              <p className="text-xs text-[#A7B0C0] max-w-md mx-auto">
                Payment has been confirmed with Razorpay. Your 30-day access is officially active.
              </p>
            </div>

            {/* Plan Details Confirmation */}
            <div className="p-4 rounded-xl bg-[#0F1219] border border-[#222936] max-w-sm mx-auto grid grid-cols-2 gap-3 text-left text-xs">
              <div>
                <span className="text-[10px] text-[#707A8C] uppercase">Plan</span>
                <div className="font-bold text-[#F8FAFC] capitalize">{verifiedSubscription?.plan || 'Professional'}</div>
              </div>
              <div>
                <span className="text-[10px] text-[#707A8C] uppercase">Status</span>
                <div className="font-bold text-emerald-400">Active (30 Days)</div>
              </div>
              <div>
                <span className="text-[10px] text-[#707A8C] uppercase">Valid Until</span>
                <div className="font-mono text-[#A7B0C0] text-[11px]">
                  {verifiedSubscription?.expiryDate ? new Date(verifiedSubscription.expiryDate).toLocaleDateString() : '30 days'}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-[#707A8C] uppercase">Payment ID</span>
                <div className="font-mono text-violet-400 text-[11px] truncate" title={verifiedSubscription?.paymentId || ''}>
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
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition-all hover:scale-105 inline-flex items-center gap-2"
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
