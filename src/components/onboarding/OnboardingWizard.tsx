import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, X, CheckCircle2, Languages } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  BusinessChallenge,
  BusinessGoal,
  BusinessProfile,
  DebtProfile,
  FinancialProfile,
  GoalsProfile,
  LoanDetails,
  Organization,
  OnboardingDraft,
  OnboardingRecord,
  createEmptyDraft,
} from '../../types/onboarding';
import {
  clearOnboardingDraft,
  loadOnboardingDraft,
  saveOnboardingDraft,
  saveOrganizationRecord,
  loadOrganizationsByOwnerId,
} from '../../lib/onboardingStorage';
import { OnboardingProgress } from './OnboardingProgress';
import { Step1Business } from './steps/Step1Business';
import { Step2Financials } from './steps/Step2Financials';
import { Step3DebtCompliance } from './steps/Step3DebtCompliance';
import { Step4Goals } from './steps/Step4Goals';
import { OnboardingSuccess } from './OnboardingSuccess';

interface OnboardingWizardProps {
  onGoToDashboard: () => void;
  onExit: () => void;
}

type StepErrors = Record<string, any>;

function validateStep1(data: BusinessProfile): StepErrors {
  const errors: StepErrors = {};
  if (!data.businessName.trim()) errors.businessName = 'Business name is required.';
  if (!data.businessType) errors.businessType = 'Please select a business type.';
  if (!data.industry.trim()) errors.industry = 'Industry is required.';
  if (!data.location.trim()) errors.location = 'Location is required.';
  if (data.yearEstablished === '' || Number(data.yearEstablished) < 1900) {
    errors.yearEstablished = 'Enter a valid year.';
  }
  if (data.numberOfEmployees === '' || Number(data.numberOfEmployees) < 0) {
    errors.numberOfEmployees = 'Enter number of employees.';
  }
  if (data.annualTurnover === '' || Number(data.annualTurnover) <= 0) {
    errors.annualTurnover = 'Enter your annual turnover.';
  }
  return errors;
}

function validateStep2(data: FinancialProfile): StepErrors {
  const errors: StepErrors = {};
  (Object.keys(data) as (keyof FinancialProfile)[]).forEach((key) => {
    const value = data[key];
    if (value === '' || Number(value) < 0) {
      errors[key] = 'This field is required.';
    }
  });
  return errors;
}

function validateStep3(data: DebtProfile): StepErrors {
  const errors: StepErrors = {};
  if (data.hasLoans === null) errors.hasLoans = 'Please select Yes or No.';

  if (data.hasLoans === true) {
    const loanErrors: StepErrors = {};
    const loan = data.loanDetails;
    (['outstandingLoanAmount', 'monthlyEMI', 'interestRate', 'remainingTenureMonths'] as (keyof LoanDetails)[]).forEach((key) => {
      const value = loan ? loan[key] : '';
      if (value === '' || Number(value) < 0) {
        loanErrors[key] = 'Required.';
      }
    });
    if (Object.keys(loanErrors).length > 0) errors.loanDetails = loanErrors;
  }

  if (data.gstRegistered === null) errors.gstRegistered = 'Please select Yes or No.';
  if (data.itrAvailable === null) errors.itrAvailable = 'Please select Yes or No.';
  if (data.hasBusinessBankAccount === null) errors.hasBusinessBankAccount = 'Please select Yes or No.';

  return errors;
}

function validateStep4(data: GoalsProfile): StepErrors {
  const errors: StepErrors = {};
  if (data.goals.length === 0) errors.goals = 'Select at least one goal.';
  if (!data.biggestChallenge) errors.biggestChallenge = 'Please select one option.';
  return errors;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onGoToDashboard, onExit }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [draft, setDraft] = useState<OnboardingDraft>(createEmptyDraft());
  const [errors, setErrors] = useState<StepErrors>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrganization, setCompletedOrganization] = useState<Organization | null>(null);

  // Resume any in-progress draft on mount so a refresh doesn't lose answers.
  useEffect(() => {
    let cancelled = false;
    loadOnboardingDraft(user?.uid)
      .then((saved) => {
        if (!cancelled && saved) setDraft(saved);
      })
      .catch((error) => {
        if (!cancelled) {
          setErrors({
            submit: error instanceof Error ? error.message : 'Unable to load your saved onboarding draft.',
          });
        }
      })
      .finally(() => {
        if (!cancelled) setIsHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  // Autosave the draft as the user progresses.
  useEffect(() => {
    if (!isHydrated) return;
    saveOnboardingDraft(draft, user?.uid).catch((error) => {
      setErrors({
        submit: error instanceof Error ? error.message : 'Unable to save your onboarding draft.',
      });
    });
  }, [draft, isHydrated, user?.uid]);

  const updateBusiness = <K extends keyof BusinessProfile>(field: K, value: BusinessProfile[K]) => {
    setDraft((prev) => ({ ...prev, businessProfile: { ...prev.businessProfile, [field]: value } }));
  };

  const updateFinancial = <K extends keyof FinancialProfile>(field: K, value: FinancialProfile[K]) => {
    setDraft((prev) => ({ ...prev, financialProfile: { ...prev.financialProfile, [field]: value } }));
  };

  const updateDebt = <K extends keyof DebtProfile>(field: K, value: DebtProfile[K]) => {
    setDraft((prev) => {
      const next: DebtProfile = { ...prev.debtProfile, [field]: value };
      if (field === 'hasLoans' && value === false) {
        next.loanDetails = null;
      }
      if (field === 'hasLoans' && value === true && !next.loanDetails) {
        next.loanDetails = { outstandingLoanAmount: '', monthlyEMI: '', interestRate: '', remainingTenureMonths: '' };
      }
      return { ...prev, debtProfile: next };
    });
  };

  const updateLoanDetail = <K extends keyof LoanDetails>(field: K, value: LoanDetails[K]) => {
    setDraft((prev) => ({
      ...prev,
      debtProfile: {
        ...prev.debtProfile,
        loanDetails: {
          ...(prev.debtProfile.loanDetails ?? { outstandingLoanAmount: '', monthlyEMI: '', interestRate: '', remainingTenureMonths: '' }),
          [field]: value,
        },
      },
    }));
  };

  const toggleGoal = (goal: BusinessGoal) => {
    setDraft((prev) => {
      const exists = prev.goals.goals.includes(goal);
      const goals = exists ? prev.goals.goals.filter((g) => g !== goal) : [...prev.goals.goals, goal];
      return { ...prev, goals: { ...prev.goals, goals } };
    });
  };

  const selectChallenge = (challenge: BusinessChallenge) => {
    setDraft((prev) => ({ ...prev, goals: { ...prev.goals, biggestChallenge: challenge } }));
  };

  const goToStep = (step: OnboardingDraft['currentStep']) => {
    setErrors({});
    setDraft((prev) => ({ ...prev, currentStep: step }));
  };

  const handleBack = () => {
    if (draft.currentStep === 1) return;
    goToStep((draft.currentStep - 1) as OnboardingDraft['currentStep']);
  };

  const handleContinue = async () => {
    let stepErrors: StepErrors = {};
    if (draft.currentStep === 1) stepErrors = validateStep1(draft.businessProfile);
    if (draft.currentStep === 2) stepErrors = validateStep2(draft.financialProfile);
    if (draft.currentStep === 3) stepErrors = validateStep3(draft.debtProfile);
    if (draft.currentStep === 4) stepErrors = validateStep4(draft.goals);

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});

    if (draft.currentStep < 4) {
      goToStep((draft.currentStep + 1) as OnboardingDraft['currentStep']);
      return;
    }

    // Final step — build and persist the completed organization.
    if (!user?.uid) {
      setErrors({ submit: 'You must be authenticated with Firebase to register an organization.' });
      return;
    }

    setIsSubmitting(true);
    const nowDate = new Date();
    const now = nowDate.toISOString();
    const ownerId = user.uid;
    const ownerEmail = user.email || '';

    // Check if user already owns an organization to prevent duplicates
    let existingOrgId = `org-${Date.now()}`;
    try {
      const existingRecords = await loadOrganizationsByOwnerId(ownerId);
      if (existingRecords.length > 0) {
        existingOrgId = existingRecords[0].organization.id;
      }
    } catch (e) {
      console.warn('Could not check existing organizations:', e);
    }

    const organization: Organization = {
      id: existingOrgId,
      name: draft.businessProfile.businessName,
      ownerId,
      ownerEmail,
      businessProfile: draft.businessProfile,
      financialProfile: draft.financialProfile,
      debtProfile: draft.debtProfile,
      complianceProfile: {
        gstRegistered: !!draft.debtProfile.gstRegistered,
        itrAvailable: !!draft.debtProfile.itrAvailable,
        hasBusinessBankAccount: !!draft.debtProfile.hasBusinessBankAccount,
      },
      goals: draft.goals,
      accessStatus: 'pending_payment',
      subscription: {
        plan: 'starter',
        status: 'pending',
        startDate: now,
        expiryDate: now,
        billingCycle: 'monthly',
        notes: 'Registration complete. Subscription payment required to activate access.',
      },
      accountStatus: 'active',
      createdAt: now,
      updatedAt: now,
    };

    const record: OnboardingRecord = {
      ownerId,
      ownerEmail,
      user: {
        id: ownerId,
        name: user.displayName || draft.businessProfile.businessName || 'Business Owner',
        email: ownerEmail,
      },
      organization,
    };

    try {
      await saveOrganizationRecord(record);
      await clearOnboardingDraft(user?.uid);
      setCompletedOrganization(organization);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Unable to save this business. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#090B10] text-[#F8FAFC] flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-[#121722] p-8 rounded-2xl border border-[#222936] shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white mx-auto shadow-md shadow-violet-600/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-[#F8FAFC]">
            {t('auth.pleaseSignInFirst', 'Please sign in first to set up your business.')}
          </h2>
          <p className="text-xs text-[#A7B0C0]">
            An authenticated Firebase user account is required before starting the MSME onboarding process.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={onExit}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-600/20 transition-all"
            >
              {t('auth.signIn', 'Sign In')} / {t('auth.register', 'Register')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (completedOrganization) {
    return (
      <OnboardingShell onExit={onExit} showExit={false}>
        <OnboardingSuccess organization={completedOrganization} onGoToDashboard={onGoToDashboard} />
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell onExit={onExit} showExit>
      {errors.submit && (
        <div className="mb-4 rounded-xl border border-rose-800/40 bg-rose-950/40 p-3 text-xs text-rose-300">
          {errors.submit}
        </div>
      )}
      <OnboardingProgress currentStep={draft.currentStep} />

      <div className="mt-8">
        {draft.currentStep === 1 && (
          <Step1Business data={draft.businessProfile} errors={errors} onChange={updateBusiness} />
        )}
        {draft.currentStep === 2 && (
          <Step2Financials data={draft.financialProfile} errors={errors} onChange={updateFinancial} />
        )}
        {draft.currentStep === 3 && (
          <Step3DebtCompliance
            data={draft.debtProfile}
            errors={errors}
            onChange={updateDebt}
            onLoanDetailChange={updateLoanDetail}
          />
        )}
        {draft.currentStep === 4 && (
          <Step4Goals data={draft.goals} errors={errors} onToggleGoal={toggleGoal} onSelectChallenge={selectChallenge} />
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-[#222936] flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={draft.currentStep === 1}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#A7B0C0] hover:text-[#F8FAFC] hover:bg-[#161C27] border border-[#222936] transition-all disabled:opacity-0 disabled:pointer-events-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('common.back', 'Back')}
        </button>

        <button
          onClick={handleContinue}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-600/20 transition-all disabled:opacity-60 disabled:pointer-events-none"
        >
          {draft.currentStep === 4 ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? t('common.saving', 'Saving...') : t('common.complete', 'Complete Business Setup')}
            </>
          ) : (
            <>
              {t('common.continue', 'Continue')}
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </OnboardingShell>
  );
};

const OnboardingShell: React.FC<{ children: React.ReactNode; onExit: () => void; showExit: boolean }> = ({
  children,
  onExit,
  showExit,
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F8FAFC] flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-md shadow-violet-600/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-lg font-extrabold tracking-tight text-[#F8FAFC]">
              BizPilot <span className="text-violet-400 font-black">AI</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#121722] text-[#A7B0C0] border border-[#222936] hover:border-violet-500 hover:text-[#F8FAFC] transition-all shadow-sm"
              title={t('header.changeLanguage', 'Change Language')}
            >
              <Languages className="w-3.5 h-3.5 text-violet-400" />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {showExit && (
              <button
                onClick={onExit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#A7B0C0] hover:text-[#F8FAFC] bg-[#121722] border border-[#222936] hover:bg-[#161C27] transition-all shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
                {t('onboarding.exitToMain', 'Save & Exit')}
              </button>
            )}
          </div>
        </div>

        <div className="bg-[#121722] rounded-2xl p-6 sm:p-8 border border-[#222936] shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
};