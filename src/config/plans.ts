/**
 * Centralized Subscription Plans & Entitlements Configuration
 * 
 * BizPilot AI Subscription Model:
 * 1. Starter (₹499 / 30 days) — "Financial Visibility"
 * 2. Professional (₹999 / 30 days) — "Financial Decision Intelligence"
 * 
 * All prices and feature entitlements must be derived strictly from this file.
 */

export type PlanId = 'starter' | 'professional';

export type FeatureKey =
  | 'financialHealth'
  | 'cashFlow'
  | 'fundingReadiness'
  | 'creditPassport'
  | 'basicGrowth'
  | 'basicAI'
  | 'basicWhatIf'
  | 'monthlyReport'
  | 'advancedAI'
  | 'advancedDecisionLab'
  | 'advancedGrowth'
  | 'detailedReport'
  | 'exportReports'
  | 'higherAILimits'
  | 'advancedFunding';

export interface PlanConfig {
  id: PlanId;
  name: string;
  tagline: string;
  positioning: string;
  priceINR: number;
  amountPaise: number; // For Razorpay API
  durationDays: number;
  popular?: boolean;
  features: {
    key: FeatureKey;
    label: string;
    description: string;
    included: boolean;
  }[];
}

export const PLAN_CONFIGS: Record<PlanId, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    tagline: 'Financial Visibility',
    positioning: 'Understand what is happening in your business.',
    priceINR: 1, // Temporary TEST MODE amount (100 paise)
    amountPaise: 100,
    durationDays: 30,
    features: [
      { key: 'financialHealth', label: 'Financial Health Score', description: 'Comprehensive solvency & liquidity indicators', included: true },
      { key: 'cashFlow', label: 'Cash Flow Forecasting', description: 'Real-time 90-day cash buffer & runway forecast', included: true },
      { key: 'fundingReadiness', label: 'Funding Readiness Audit', description: 'Bank loan eligibility score & borrowing capacity', included: true },
      { key: 'creditPassport', label: 'MSME Credit Passport', description: 'Standardized institutional credit assessment profile', included: true },
      { key: 'basicGrowth', label: 'Basic Growth Intelligence', description: 'Targeted operational margin & cost optimizations', included: true },
      { key: 'basicAI', label: 'Basic AI Business Assistant', description: 'Core financial query assistant & formula guidance', included: true },
      { key: 'basicWhatIf', label: 'Basic What-If Simulator', description: 'Revenue & hiring scenario modeling', included: true },
      { key: 'monthlyReport', label: 'Monthly Financial Report', description: 'Key performance indicators summary', included: true },
      { key: 'advancedAI', label: 'Advanced AI Business Advisor', description: 'Strategic executive advisor with multi-scenario reasoning', included: false },
      { key: 'advancedDecisionLab', label: 'Advanced Decision Lab', description: 'Multi-variable stress tests & strategic capital decisions', included: false },
      { key: 'advancedGrowth', label: 'Advanced Growth Intelligence', description: 'Predictive market expansion & procurement analytics', included: false },
      { key: 'detailedReport', label: 'Detailed AI Business Report', description: 'Deep-dive board & lender grade financial dossiers', included: false },
      { key: 'exportReports', label: 'Export & Share Reports', description: 'Institutional PDF export and external sharing', included: false },
      { key: 'higherAILimits', label: 'Higher AI Usage Limits', description: '5x query allowances & priority compute bandwidth', included: false },
      { key: 'advancedFunding', label: 'Advanced Funding Intelligence', description: 'Deep explainability, funding strategy & advanced loan preparation', included: false },
    ],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    tagline: 'Financial Decision Intelligence',
    positioning: 'Understand what is happening and decide what to do next.',
    priceINR: 2, // Temporary TEST MODE amount (200 paise)
    amountPaise: 200,
    durationDays: 30,
    popular: true,
    features: [
      { key: 'financialHealth', label: 'Financial Health Score', description: 'Comprehensive solvency & liquidity indicators', included: true },
      { key: 'cashFlow', label: 'Cash Flow Forecasting', description: 'Real-time 90-day cash buffer & runway forecast', included: true },
      { key: 'fundingReadiness', label: 'Funding Readiness Audit', description: 'Bank loan eligibility score & borrowing capacity', included: true },
      { key: 'creditPassport', label: 'MSME Credit Passport', description: 'Standardized institutional credit assessment profile', included: true },
      { key: 'basicGrowth', label: 'Basic Growth Intelligence', description: 'Targeted operational margin & cost optimizations', included: true },
      { key: 'basicAI', label: 'Basic AI Business Assistant', description: 'Core financial query assistant & formula guidance', included: true },
      { key: 'basicWhatIf', label: 'Basic What-If Simulator', description: 'Revenue & hiring scenario modeling', included: true },
      { key: 'monthlyReport', label: 'Monthly Financial Report', description: 'Key performance indicators summary', included: true },
      { key: 'advancedAI', label: 'Advanced AI Business Advisor', description: 'Strategic executive advisor with multi-scenario reasoning', included: true },
      { key: 'advancedDecisionLab', label: 'Advanced Decision Lab', description: 'Multi-variable stress tests & strategic capital decisions', included: true },
      { key: 'advancedGrowth', label: 'Advanced Growth Intelligence', description: 'Predictive market expansion & procurement analytics', included: true },
      { key: 'detailedReport', label: 'Detailed AI Business Report', description: 'Deep-dive board & lender grade financial dossiers', included: true },
      { key: 'exportReports', label: 'Export & Share Reports', description: 'Institutional PDF export and external sharing', included: true },
      { key: 'higherAILimits', label: 'Higher AI Usage Limits', description: '5x query allowances & priority compute bandwidth', included: true },
      { key: 'advancedFunding', label: 'Advanced Funding Intelligence', description: 'Deep explainability, funding strategy & advanced loan preparation', included: true },
    ],
  },
};

export const PLAN_ENTITLEMENTS: Record<PlanId, Record<FeatureKey, boolean>> = {
  starter: {
    financialHealth: true,
    cashFlow: true,
    fundingReadiness: true,
    creditPassport: true,
    basicGrowth: true,
    basicAI: true,
    basicWhatIf: true,
    monthlyReport: true,
    advancedAI: false,
    advancedDecisionLab: false,
    advancedGrowth: false,
    detailedReport: false,
    exportReports: false,
    higherAILimits: false,
    advancedFunding: false,
  },
  professional: {
    financialHealth: true,
    cashFlow: true,
    fundingReadiness: true,
    creditPassport: true,
    basicGrowth: true,
    basicAI: true,
    basicWhatIf: true,
    monthlyReport: true,
    advancedAI: true,
    advancedDecisionLab: true,
    advancedGrowth: true,
    detailedReport: true,
    exportReports: true,
    higherAILimits: true,
    advancedFunding: true,
  },
};

export interface SubscriptionSnapshot {
  plan: PlanId | 'starter_free' | 'pro_growth' | 'business_leader' | null;
  status: 'active' | 'trial' | 'expired' | 'suspended' | 'pending' | 'cancelled';
  startDate?: string | null;
  expiryDate?: string | null;
  paymentId?: string | null;
  orderId?: string | null;
  amount?: number | null;
}

export function normalizePlanId(rawPlan?: string | null): PlanId | null {
  if (!rawPlan) return null;
  const p = rawPlan.toLowerCase().trim();
  if (p === 'starter' || p === 'starter_free') return 'starter';
  if (p === 'professional' || p === 'pro_growth' || p === 'business_leader') return 'professional';
  return null;
}

export function isSubscriptionActive(sub?: SubscriptionSnapshot | null, asOfDate: Date = new Date()): boolean {
  if (!sub) return false;
  if (sub.status !== 'active') return false;
  if (!sub.expiryDate) return false;

  const expiryTime = new Date(sub.expiryDate).getTime();
  if (isNaN(expiryTime)) return false;

  return asOfDate.getTime() < expiryTime;
}

export function getDaysRemaining(sub?: SubscriptionSnapshot | null, asOfDate: Date = new Date()): number {
  if (!sub || !sub.expiryDate) return 0;
  const expiryTime = new Date(sub.expiryDate).getTime();
  if (isNaN(expiryTime)) return 0;

  const diffMs = expiryTime - asOfDate.getTime();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / 86400000);
}

export function hasFeature(sub: SubscriptionSnapshot | null | undefined, feature: FeatureKey): boolean {
  if (!isSubscriptionActive(sub)) {
    return false;
  }
  const planId = normalizePlanId(sub?.plan);
  if (!planId) return false;
  return PLAN_ENTITLEMENTS[planId]?.[feature] === true;
}

export function calculateExpiryDate(startDate: Date = new Date(), durationDays: number = 30): string {
  const expiry = new Date(startDate.getTime() + durationDays * 86400000);
  return expiry.toISOString();
}

/**
 * High-level platform authorization check.
 * - Administrators bypass MSME subscription requirements.
 * - MSMEs are strictly authorized ONLY when authenticated and having an active, unexpired subscription.
 * - Unverified, pending, expired, or cancelled accounts return false.
 */
export function canAccessPlatform(
  user: any,
  sub?: SubscriptionSnapshot | null,
  isAdmin: boolean = false
): boolean {
  if (!user) return false;
  if (isAdmin) return true;
  return isSubscriptionActive(sub) && sub?.status === 'active';
}

