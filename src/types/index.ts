export * from './business';

export type NavigationTab = 
  | 'dashboard'
  | 'financial-health'
  | 'cash-flow'
  | 'funding-readiness'
  | 'credit-passport'
  | 'what-if-simulator'
  | 'decision-lab'
  | 'growth-intelligence'
  | 'ai-assistant'
  | 'ai-advisor'
  | 'reports'
  | 'settings'
  | 'billing'
  | 'subscription';

export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'mr';

export interface MSMEProfile {
  id: string;
  name: string;
  industry: string;
  sector: string;
  udyamNumber: string;
  gstin: string;
  incorporationYear: number;
  location: string;
  employees: number;
  turnover: string;
  creditScore: number;
  healthScore: number;
  fundingReadinessScore: number;
  revenueGrowth: number;
  cashFlowStability: number;
  loanEligibility: 'High' | 'Medium' | 'Low';
  estimatedCreditLimit: string;
  dscrRatio: number;
  runwayMonths: number;
}

export interface MetricCardData {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  iconName: string;
  scoreCategory?: 'excellent' | 'good' | 'average' | 'poor';
}

export interface FinancialHealthMetric {
  category: string;
  score: number;
  weight: number;
  status: 'Optimal' | 'Healthy' | 'Moderate' | 'Critical';
  insight: string;
  recommendation: string;
}

export interface CashFlowDataPoint {
  period: string;
  actualInflow?: number;
  actualOutflow?: number;
  netCash: number;
  predictedInflow?: number;
  predictedOutflow?: number;
  predictedNetCash?: number;
  confidenceLower?: number;
  confidenceUpper?: number;
}

export interface FundingPillar {
  name: string;
  score: number;
  maxScore: number;
  status: 'Strong' | 'Satisfactory' | 'Needs Attention' | 'Critical';
  description: string;
  impactOnInterestRate: string;
  actionItems: string[];
}

export interface ScenarioImpact {
  priceChange: number;
  hiringCount: number;
  materialCostChange: number;
  marketingSpendChange: number;
  paymentTermsDays: number;
  projectedRevenue: number;
  projectedNetProfit: number;
  projectedRunway: number;
  projectedHealthScore: number;
  projectedFundingScore: number;
  riskWarning?: string;
}

export interface GrowthPlaybook {
  id: string;
  category: 'Pricing' | 'Inventory' | 'Working Capital' | 'Market Expansion';
  title: string;
  roiPotential: string;
  implementationTime: string;
  description: string;
  aiRationale: string;
  actionSteps: string[];
  difficulty: 'Easy' | 'Medium' | 'Strategic';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  language?: LanguageCode;
  actionButtons?: { label: string; action: string }[];
  audioSupported?: boolean;
}

export interface ReportItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Investor' | 'Bank / NBFC' | 'Strategy' | 'Audit';
  generatedDate: string;
  fileSize: string;
  status: 'Ready' | 'Generating';
  downloadName: string;
  highlights: string[];
}
