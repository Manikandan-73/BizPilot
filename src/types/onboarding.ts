/**
 * MSME Onboarding data model.
 *
 * Conceptual relationship:
 *   User -> Organization (MSME) -> BusinessProfile
 *                                -> FinancialProfile
 *                                -> DebtProfile
 *                                -> ComplianceProfile
 *                                -> GoalsProfile
 *
 * These types intentionally mirror what a future `POST /api/business/profile`
 * payload would look like, so the persistence layer can be swapped from
 * localStorage to a real API without reshaping the onboarding UI.
 */

export const BUSINESS_TYPES = [
  'Sole Proprietorship',
  'Partnership',
  'LLP',
  'Private Limited',
  'Other',
] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const BUSINESS_GOALS = [
  'Improve Cash Flow',
  'Increase Profit',
  'Get Business Funding',
  'Expand Business',
  'Reduce Expenses',
  'Improve Creditworthiness',
  'Increase Sales',
  'Manage Inventory',
] as const;
export type BusinessGoal = (typeof BUSINESS_GOALS)[number];

export const BUSINESS_CHALLENGES = [
  'Cash Flow',
  'Funding',
  'Sales',
  'Expenses',
  'Inventory',
  'Debt',
  'Growth',
  'Not Sure',
] as const;
export type BusinessChallenge = (typeof BUSINESS_CHALLENGES)[number];

/** Minimal local "user" — no real auth exists yet. */
export interface OnboardingUser {
  id: string;
  name: string;
  email: string;
}

export interface BusinessProfile {
  businessName: string;
  businessType: BusinessType | '';
  industry: string;
  location: string;
  yearEstablished: number | '';
  numberOfEmployees: number | '';
  annualTurnover: number | ''; // stored in INR
}

export interface FinancialProfile {
  monthlyRevenue: number | '';
  monthlyOperatingExpenses: number | '';
  monthlyMaterialCost: number | '';
  monthlySalaryCost: number | '';
  currentCashBalance: number | '';
  accountsReceivable: number | '';
  accountsPayable: number | '';
  inventoryValue: number | '';
}

export interface LoanDetails {
  outstandingLoanAmount: number | '';
  monthlyEMI: number | '';
  interestRate: number | ''; // percentage
  remainingTenureMonths: number | '';
}

export interface DebtProfile {
  hasLoans: boolean | null;
  loanDetails: LoanDetails | null;
  gstRegistered: boolean | null;
  itrAvailable: boolean | null;
  hasBusinessBankAccount: boolean | null;
}

export interface GoalsProfile {
  goals: BusinessGoal[];
  biggestChallenge: BusinessChallenge | null;
}

export interface Organization {
  id: string;
  name: string;
  businessProfile: BusinessProfile;
  financialProfile: FinancialProfile;
  debtProfile: DebtProfile;
  complianceProfile: {
    gstRegistered: boolean;
    itrAvailable: boolean;
    hasBusinessBankAccount: boolean;
  };
  goals: GoalsProfile;
  createdAt: string;
  updatedAt: string;
}

/** The full record persisted once onboarding is completed. */
export interface OnboardingRecord {
  user: OnboardingUser;
  organization: Organization;
}

/** In-progress wizard state, persisted per-step so a refresh doesn't lose progress. */
export interface OnboardingDraft {
  currentStep: 1 | 2 | 3 | 4;
  businessProfile: BusinessProfile;
  financialProfile: FinancialProfile;
  debtProfile: DebtProfile;
  goals: GoalsProfile;
}

export function createEmptyDraft(): OnboardingDraft {
  return {
    currentStep: 1,
    businessProfile: {
      businessName: '',
      businessType: '',
      industry: '',
      location: '',
      yearEstablished: '',
      numberOfEmployees: '',
      annualTurnover: '',
    },
    financialProfile: {
      monthlyRevenue: '',
      monthlyOperatingExpenses: '',
      monthlyMaterialCost: '',
      monthlySalaryCost: '',
      currentCashBalance: '',
      accountsReceivable: '',
      accountsPayable: '',
      inventoryValue: '',
    },
    debtProfile: {
      hasLoans: null,
      loanDetails: null,
      gstRegistered: null,
      itrAvailable: null,
      hasBusinessBankAccount: null,
    },
    goals: {
      goals: [],
      biggestChallenge: null,
    },
  };
}