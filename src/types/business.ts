/**
 * Canonical Business Data Models & Central Analysis Engine Types
 *
 * This file defines:
 * 1. The Firestore Business/Organization schema stored under `organizations/{id}`
 * 2. The Central Financial/Business Analysis Engine output contract (`BusinessAnalysis`)
 * 3. Safe normalization helpers to convert form inputs into clean numeric metrics
 */

import {
  FinancialHealthMetric,
  CashFlowDataPoint,
  FundingPillar,
} from './index';

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

/** Minimal user representation attached to organization record */
export interface OnboardingUser {
  id: string;
  name: string;
  email: string;
}

/** Business profile entered during onboarding or settings */
export interface BusinessProfile {
  businessName: string;
  businessType: BusinessType | '';
  industry: string;
  location: string;
  yearEstablished: number | '';
  numberOfEmployees: number | '';
  annualTurnover: number | ''; // in INR
}

/** Operational and financial figures collected from the user */
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

/** Loan and debt facility details */
export interface LoanDetails {
  outstandingLoanAmount: number | '';
  monthlyEMI: number | '';
  interestRate: number | ''; // annual percentage rate (e.g. 10.5)
  remainingTenureMonths: number | '';
}

/** Debt and compliance profile from step 3 of onboarding */
export interface DebtProfile {
  hasLoans: boolean | null;
  loanDetails: LoanDetails | null;
  gstRegistered: boolean | null;
  itrAvailable: boolean | null;
  hasBusinessBankAccount: boolean | null;
}

export interface ComplianceProfile {
  gstRegistered: boolean;
  itrAvailable: boolean;
  hasBusinessBankAccount: boolean;
}

export interface GoalsProfile {
  goals: BusinessGoal[];
  biggestChallenge: BusinessChallenge | null;
}

export type UserRole = 'admin' | 'msme';

export type SubscriptionPlan = 'starter' | 'professional';

export type SubscriptionStatus = 
  | 'active' 
  | 'trial' 
  | 'expired' 
  | 'suspended' 
  | 'pending' 
  | 'cancelled';

export interface SubscriptionDetails {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  expiryDate: string;
  billingCycle?: 'monthly' | 'yearly';
  amount?: number;
  currency?: 'INR';
  paymentId?: string | null;
  orderId?: string | null;
  lastPaymentAt?: string | null;
  notes?: string;
  updatedBy?: string;
  updatedAt?: string;
  reason?: string;
}

export interface PaymentRecord {
  id: string;
  paymentId: string;
  orderId: string;
  uid: string;
  organizationId: string;
  plan: SubscriptionPlan;
  amount: number;
  currency: 'INR';
  status: 'captured' | 'failed' | 'pending';
  createdAt: string;
  verifiedAt: string;
  provider: 'razorpay';
  userEmail?: string;
}

/** The primary Organization document stored in Firestore collection `organizations` */
export interface Organization {
  id: string;
  name: string;
  ownerId?: string;
  ownerEmail?: string;
  businessProfile: BusinessProfile;
  financialProfile: FinancialProfile;
  debtProfile: DebtProfile;
  complianceProfile: ComplianceProfile;
  goals: GoalsProfile;
  subscription?: SubscriptionDetails;
  accountStatus?: 'active' | 'suspended';
  accessStatus?: 'active' | 'pending_payment' | 'expired' | 'suspended';
  registrationStatus?: 'pending_payment' | 'completed';
  createdAt: string;
  updatedAt: string;
}

/** Persisted organization record with author metadata */
export interface OnboardingRecord {
  ownerId?: string;
  ownerEmail?: string;
  user: OnboardingUser;
  organization: Organization;
}

/* ==========================================================================
 * CENTRAL ANALYSIS ENGINE CONTRACT
 * Every dashboard view receives this single computed analysis object.
 * ========================================================================== */

/** Strictly clean, normalized numbers used for math (no empty strings or undefined) */
export interface NormalizedFinancials {
  monthlyRevenue: number;
  monthlyOperatingExpenses: number;
  monthlyMaterialCost: number;
  monthlySalaryCost: number;
  currentCashBalance: number;
  accountsReceivable: number;
  accountsPayable: number;
  inventoryValue: number;
  outstandingLoanAmount: number;
  monthlyEMI: number;
  interestRate: number;
  remainingTenureMonths: number;
  hasLoans: boolean;
}

/** Comprehensive financial metrics computed by the central engine */
export interface CalculatedFinancials {
  monthlyRevenue: number;
  annualRevenue: number;
  monthlyOperatingExpenses: number;
  monthlyMaterialCost: number;
  monthlySalaryCost: number;
  totalMonthlyExpenses: number; // OPEX + Material + Salary

  monthlyGrossProfit: number; // Revenue - Material
  grossMarginPercent: number | null; // null if revenue <= 0

  monthlyEbitda: number; // Revenue - Total Monthly Expenses
  annualEbitda: number;
  operatingMarginPercent: number | null;

  monthlyEmi: number;
  annualEmi: number;
  monthlyNetCashFlow: number; // EBITDA - EMI
  annualNetProfit: number;
  netMarginPercent: number | null;

  currentCashBalance: number;
  accountsReceivable: number;
  accountsPayable: number;
  inventoryValue: number;

  workingCapital: number; // (Cash + AR + Inventory) - AP
  currentRatio: number | null; // (Cash + AR + Inventory) / AP
  quickRatio: number | null; // (Cash + AR) / AP

  cashBurnRate: number; // Positive burn if Net Cash Flow < 0, else 0
  runwayMonths: number | null; // Cash / Monthly Burn or Cash / Outflow
  
  totalDebtOutstanding: number;
  dscr: number | null; // EBITDA / EMI
  debtToAnnualRevenue: number | null; // Debt / Annual Revenue
  emiBurdenRatio: number | null; // EMI / Monthly Revenue
}

export interface BankProductMatch {
  bank: string;
  product: string;
  maxLoan: string;
  rate: string;
  match: string;
  fastTrack: boolean;
  reason: string;
}

export interface HealthScoreResult {
  overallScore: number; // 0–100
  rating: 'Optimal' | 'Healthy' | 'Moderate' | 'Critical';
  summary: string;
  metrics: FinancialHealthMetric[];
}

export interface FundingDimension {
  key: 'compliance' | 'stability' | 'vintage' | 'liquidity' | 'debt';
  factor: string;
  rawScore: number;
  weight: number; // max points (25, 25, 20, 15, 15)
  percentage: number; // 0–100
  contribution: 'positive' | 'negative';
  status: 'Strong' | 'Satisfactory' | 'Needs Attention' | 'Critical';
  explanation: string;
  metricsSummary: string;
}

export interface FundingActionItem {
  issue: string;
  whyItMatters: string;
  action: string;
  impact: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  status: 'provided' | 'incomplete' | 'not_provided';
  details: string;
}

export interface DebtCapacityAssessment {
  currentEmi: number;
  annualDebtService: number;
  dscr: number | null;
  debtToRevenue: number | null;
  emiBurdenPercent: number | null;
  status: 'Healthy' | 'Moderate' | 'Needs Attention';
  assessmentNote: string;
}

export interface FundingStrategyResult {
  recommendation: 'Potentially suitable for further preparation' | 'Consider improving profile first' | 'Funding profile currently needs attention';
  timing: 'Ready to Prepare' | 'Improve First' | 'Needs Attention';
  rationale: string;
  keyPrerequisite: string;
}

export interface FundingReadinessResult {
  overallScore: number; // 0–100
  eligibilityTier: 'High' | 'Medium' | 'Low' | 'Not Eligible';
  estimatedCreditLimit: string;
  estimatedCreditLimitValue: number;
  pillars: FundingPillar[];
  bankMatches: BankProductMatch[];
  strengths: string[];
  gaps: string[];
  actionItems: string[];
  dimensions: FundingDimension[];
  actionPlan: FundingActionItem[];
  preparationChecklist: ChecklistItem[];
  debtAssessment: DebtCapacityAssessment;
  fundingStrategy: FundingStrategyResult;
}

export interface CashFlowForecastResult {
  dataPoints: CashFlowDataPoint[];
  historicalMonthlyAverage: number;
  projectedRunwayMonths: number | null;
  hasRunwayWarning: boolean;
  warningMessage?: string;
  cashBufferStatus: 'Safe' | 'Adequate' | 'Vulnerable' | 'Critical';
}

export interface GrowthObservations {
  keyRisks: string[];
  recommendations: string[];
  suggestedPlaybookCategories: string[];
}

export interface ComplianceSummary {
  gstRegistered: boolean;
  itrAvailable: boolean;
  hasBusinessBankAccount: boolean;
  complianceScore: number; // 0–100
  isFullyCompliant: boolean;
  missingItems: string[];
}

/** Complete unified analysis result produced by the central engine for an organization */
export interface BusinessAnalysis {
  organizationId: string;
  organizationName: string;
  businessType: string;
  industry: string;
  location: string;
  vintageYears: number;
  employees: number;
  annualTurnoverDeclared: number;

  normalized: NormalizedFinancials;
  financials: CalculatedFinancials;
  health: HealthScoreResult;
  funding: FundingReadinessResult;
  cashFlow: CashFlowForecastResult;
  growth: GrowthObservations;
  compliance: ComplianceSummary;
  goals: GoalsProfile;
  
  generatedAt: string;
}

/**
 * Safe numeric extractor: handles numbers, strings, empty strings, NaN, and negative numbers.
 */
export function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}
