import React, { useState, useMemo, useEffect } from 'react';
import { MSMEProfile } from '../../types';
import { BusinessAnalysis, Organization } from '../../types/business';
import { analyzeBusiness } from '../../analytics/financialAnalysis';
import { useLanguage } from '../../i18n/LanguageContext';
import { useSubscription } from '../../hooks/useSubscription';
import { hasFeature } from '../../config/plans';
import { FeatureGate } from '../subscription/FeatureGate';
import { 
  simulateScenario, 
  ScenarioType, 
  ScenarioParams, 
  ScenarioResult 
} from '../../analytics/scenarioSimulation';
import { getSavedScenarios, saveScenariosToStorage } from '../../analytics/reportGenerator';
import { 
  FlaskConical, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Plus, 
  Trash2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal, 
  Landmark, 
  Users, 
  Tag, 
  Megaphone, 
  Layers, 
  ArrowRight,
  Calculator
} from 'lucide-react';

interface DecisionLabViewProps {
  profile: MSMEProfile;
  analysis?: BusinessAnalysis;
  organization?: Organization | null;
  onNavigate: (tab: any) => void;
}

export const DecisionLabView: React.FC<DecisionLabViewProps> = ({
  profile,
  analysis,
  organization,
  onNavigate,
}) => {
  const { t, language } = useLanguage();
  const { subscription } = useSubscription({ organization });
  const isAllowed = hasFeature(subscription, 'advancedDecisionLab');

  // Selected scenario preset
  const [selectedType, setSelectedType] = useState<ScenarioType>('price_increase');

  // Scenario Input Parameters
  const [pricePct, setPricePct] = useState<number>(10);
  const [salesGrowthPct, setSalesGrowthPct] = useState<number>(15);
  const [costReductionPct, setCostReductionPct] = useState<number>(10);
  const [costTarget, setCostTarget] = useState<'opex' | 'material'>('opex');
  const [materialSurgePct, setMaterialSurgePct] = useState<number>(10);
  const [hireSalary, setHireSalary] = useState<number>(25000);
  const [hireCount, setHireCount] = useState<number>(1);
  const [loanAmount, setLoanAmount] = useState<number>(1000000); // 10 Lakhs
  const [loanRate, setLoanRate] = useState<number>(11.0);
  const [loanTenure, setLoanTenure] = useState<number>(36);
  const [marketingSpend, setMarketingSpend] = useState<number>(15000);
  const [marketingGrowth, setMarketingGrowth] = useState<number>(5);

  // Combined Scenario Parameters
  const [combPrice, setCombPrice] = useState<number>(5);
  const [combSales, setCombSales] = useState<number>(10);
  const [combOpex, setCombOpex] = useState<number>(5);
  const [combHireSalary, setCombHireSalary] = useState<number>(0);
  const [combHireCount, setCombHireCount] = useState<number>(0);

  // Saved scenarios for multi-scenario comparison
  const [savedScenarios, setSavedScenarios] = useState<ScenarioResult[]>([]);
  const [showCalculations, setShowCalculations] = useState<boolean>(false);

  // Deterministically derive analysis from organization data; no fake fallbacks
  const effectiveAnalysis: BusinessAnalysis = useMemo(() => {
    if (analysis) return analysis;
    if (organization && organization.financialProfile && Number(organization.financialProfile.monthlyRevenue) > 0) {
      return analyzeBusiness(organization, profile);
    }
    // Safe baseline when no organization financials have been entered yet
    return analyzeBusiness(
      organization || {
        id: profile.id,
        name: profile.name,
        businessProfile: {
          businessName: profile.name,
          businessType: (profile.sector as any) || 'Private Limited',
          industry: profile.industry || 'Manufacturing',
          location: profile.location || 'India',
          numberOfEmployees: profile.employees || 1,
          annualTurnover: 0,
          yearEstablished: 2024,
        },
        financialProfile: {
          monthlyRevenue: 0,
          monthlyOperatingExpenses: 0,
          monthlyMaterialCost: 0,
          monthlySalaryCost: 0,
          currentCashBalance: 0,
          accountsReceivable: 0,
          accountsPayable: 0,
        },
        debtProfile: { hasLoans: false },
        complianceProfile: {
          gstRegistered: false,
          itrAvailable: false,
          hasBusinessBankAccount: false,
        },
      } as any,
      profile
    );
  }, [analysis, organization, profile]);

  useEffect(() => {
    const loaded = getSavedScenarios(effectiveAnalysis.organizationId);
    if (loaded && loaded.length > 0) {
      setSavedScenarios(loaded);
    }
  }, [effectiveAnalysis.organizationId]);

  // Current active scenario parameters
  const currentParams: ScenarioParams = useMemo(() => {
    switch (selectedType) {
      case 'price_increase':
        return { type: 'price_increase', priceChangePercent: pricePct };
      case 'price_reduction':
        return { type: 'price_reduction', priceChangePercent: -Math.abs(pricePct) };
      case 'sales_growth':
        return { type: 'sales_growth', salesGrowthPercent: salesGrowthPct };
      case 'cost_reduction':
        return { type: 'cost_reduction', costReductionPercent: costReductionPct, costReductionTarget: costTarget };
      case 'material_cost':
        return { type: 'material_cost', materialCostPercent: materialSurgePct };
      case 'new_hire':
        return { type: 'new_hire', monthlySalary: hireSalary, hireCount };
      case 'new_loan':
        return { type: 'new_loan', loanAmount, loanInterestRate: loanRate, loanTenureMonths: loanTenure };
      case 'marketing_spend':
        return { type: 'marketing_spend', marketingSpendMonthly: marketingSpend, marketingExpectedSalesGrowth: marketingGrowth };
      case 'combined':
        return {
          type: 'combined',
          priceChangePercent: combPrice,
          salesGrowthPercent: combSales,
          costReductionPercent: combOpex,
          monthlySalary: combHireSalary > 0 ? combHireSalary : undefined,
          hireCount: combHireCount > 0 ? combHireCount : undefined,
        };
    }
  }, [
    selectedType,
    pricePct,
    salesGrowthPct,
    costReductionPct,
    costTarget,
    materialSurgePct,
    hireSalary,
    hireCount,
    loanAmount,
    loanRate,
    loanTenure,
    marketingSpend,
    marketingGrowth,
    combPrice,
    combSales,
    combOpex,
    combHireSalary,
    combHireCount,
  ]);

  // Execute simulation in real-time
  const currentResult: ScenarioResult = useMemo(() => {
    return simulateScenario(effectiveAnalysis, currentParams);
  }, [effectiveAnalysis, currentParams]);

  // Save current scenario to comparison list & localStorage
  const handleSaveScenario = () => {
    if (savedScenarios.some((s) => s.name === currentResult.name)) return;
    const updated = [...savedScenarios, currentResult];
    setSavedScenarios(updated);
    saveScenariosToStorage(effectiveAnalysis.organizationId, updated);
  };

  const handleRemoveSaved = (id: string) => {
    const updated = savedScenarios.filter((s) => s.id !== id);
    setSavedScenarios(updated);
    saveScenariosToStorage(effectiveAnalysis.organizationId, updated);
  };

  // Helper formatting currency
  const fmtLakh = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return '—';
    return (val / 100000).toFixed(2);
  };

  const fmtCurrency = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return '—';
    return '₹' + Math.round(val).toLocaleString('en-IN');
  };

  const presetButtons = [
    { type: 'price_increase', label: t('decisionLab.priceIncrease', 'Price Increase'), icon: Tag },
    { type: 'price_reduction', label: t('decisionLab.priceReduction', 'Price Reduction'), icon: Tag },
    { type: 'sales_growth', label: t('decisionLab.salesGrowth', 'Sales Growth'), icon: TrendingUp },
    { type: 'cost_reduction', label: t('decisionLab.costReduction', 'Cost Reduction'), icon: SlidersHorizontal },
    { type: 'material_cost', label: t('decisionLab.materialCost', 'Material Cost Surge'), icon: TrendingDown },
    { type: 'new_hire', label: t('decisionLab.newHire', 'Hire Employee'), icon: Users },
    { type: 'new_loan', label: t('decisionLab.newLoan', 'Take New Loan'), icon: Landmark },
    { type: 'marketing_spend', label: t('decisionLab.marketingSpend', 'Marketing Spend'), icon: Megaphone },
    { type: 'combined', label: t('decisionLab.combined', 'Combined Strategy'), icon: Layers },
  ];

  return (
    <FeatureGate
      feature="advancedDecisionLab"
      isAllowed={isAllowed}
      onUpgrade={() => onNavigate('billing')}
      fallbackTitle={t('decisionLab.proExclusiveTitle', 'Decision Lab is Available in Professional')}
      fallbackDescription={t(
        'decisionLab.proExclusiveDesc',
        'Professional allows you to test pricing changes, hiring, new loans, and cost cuts before making them. Compare multiple scenarios and see exact financial impacts.'
      )}
    >
      <div className="space-y-6 sm:space-y-8 pb-16 font-sans">
        
        {/* Header Banner */}
        <div className="p-4 sm:p-6 lg:p-8 rounded-2xl bg-[#121722] border border-[#222936] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-black/20">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#A78BFA]">
              <FlaskConical className="w-4 h-4 text-[#8B5CF6]" />
              <span>{t('decisionLab.tagline', 'FLAGSHIP FINANCIAL SIMULATION')}</span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30">
                PRO EXCLUSIVE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#F8FAFC] mt-1.5 tracking-tight">
              {t('decisionLab.headerTitle', 'Decision Lab')}
            </h1>
            <p className="text-xs sm:text-sm text-[#A7B0C0] mt-1 max-w-2xl">
              {t('decisionLab.headerSubtitle', 'Test business decisions before you make them. Model pricing, hiring, loans, and cost cuts against your live financial baseline.')}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => onNavigate('ai-advisor')}
              className="w-full md:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-[#161C27] hover:bg-[#1E2536] text-[#F8FAFC] border border-[#303848] hover:border-[#8B5CF6]/50 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>{t('decisionLab.consultAi', 'Consult AI Advisor')}</span>
            </button>
          </div>
        </div>

        {/* Current Business Baseline Card */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#121722] border border-[#222936] shadow-lg shadow-black/20 space-y-4 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#222936]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider">
                {t('decisionLab.baselineTitle', 'Current Business Baseline')}
              </h2>
            </div>
            <span className="text-[11px] text-[#707A8C] font-mono truncate">
              {effectiveAnalysis.organizationName}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3 text-xs">
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#0F1219] border border-[#222936]">
              <span className="text-[10px] text-[#707A8C] uppercase font-semibold">Monthly Revenue</span>
              <div className="font-bold text-[#F8FAFC] text-sm mt-0.5">₹{fmtLakh(effectiveAnalysis.financials.monthlyRevenue)}L</div>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#0F1219] border border-[#222936]">
              <span className="text-[10px] text-[#707A8C] uppercase font-semibold">Total Expenses</span>
              <div className="font-bold text-[#A7B0C0] text-sm mt-0.5">₹{fmtLakh(effectiveAnalysis.financials.totalMonthlyExpenses)}L</div>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#0F1219] border border-[#222936]">
              <span className="text-[10px] text-[#707A8C] uppercase font-semibold">Monthly EBITDA</span>
              <div className="font-bold text-[#A78BFA] text-sm mt-0.5">₹{fmtLakh(effectiveAnalysis.financials.monthlyEbitda)}L</div>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#0F1219] border border-[#222936]">
              <span className="text-[10px] text-[#707A8C] uppercase font-semibold">EBITDA Margin</span>
              <div className="font-bold text-[#F8FAFC] text-sm mt-0.5">{effectiveAnalysis.financials.operatingMarginPercent ?? 0}%</div>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#0F1219] border border-[#222936]">
              <span className="text-[10px] text-[#707A8C] uppercase font-semibold">Net Cash Flow</span>
              <div className="font-bold text-emerald-400 text-sm mt-0.5">₹{fmtLakh(effectiveAnalysis.financials.monthlyNetCashFlow)}L</div>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#0F1219] border border-[#222936]">
              <span className="text-[10px] text-[#707A8C] uppercase font-semibold">DSCR Coverage</span>
              <div className="font-bold text-[#F8FAFC] text-sm mt-0.5">{effectiveAnalysis.financials.dscr ? `${effectiveAnalysis.financials.dscr}x` : 'Debt-Free'}</div>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#0F1219] border border-[#222936] col-span-2 sm:col-span-1">
              <span className="text-[10px] text-[#707A8C] uppercase font-semibold">Cash Runway</span>
              <div className="font-bold text-amber-400 text-sm mt-0.5">{effectiveAnalysis.financials.runwayMonths ?? 0}m</div>
            </div>
          </div>
        </div>

        {/* Scenario Builder Presets */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <h2 className="text-base font-bold text-[#F8FAFC] tracking-tight">
              {t('decisionLab.chooseScenario', '1. Select Decision to Simulate')}
            </h2>
            <span className="text-xs text-[#707A8C]">8 Presets + Combined Multi-Variable</span>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
            {presetButtons.map((btn) => {
              const Icon = btn.icon;
              const isSelected = selectedType === btn.type;
              return (
                <button
                  key={btn.type}
                  onClick={() => setSelectedType(btn.type as ScenarioType)}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 text-xs font-semibold ${
                    isSelected
                      ? 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/40 shadow-sm ring-1 ring-[#8B5CF6]/40'
                      : 'bg-[#0F1219] text-[#A7B0C0] border-[#222936] hover:border-[#303848] hover:bg-[#161C27] hover:text-[#F8FAFC]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#8B5CF6]' : 'text-[#707A8C]'}`} />
                  <span className="truncate">{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Scenario Parameter Inputs */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#121722] border border-[#222936] space-y-6 shadow-lg shadow-black/20 min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-[#222936]">
            <h3 className="text-sm font-bold text-[#F8FAFC]">
              {t('decisionLab.adjustVariables', '2. Set Scenario Assumptions')}
            </h3>
            <span className="text-xs text-[#A78BFA] font-semibold">{currentResult.name}</span>
          </div>

          {/* Price Increase / Reduction */}
          {(selectedType === 'price_increase' || selectedType === 'price_reduction') && (
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A7B0C0] font-medium">Price Adjustment Percentage</span>
                <span className="font-bold text-[#A78BFA] text-sm">{selectedType === 'price_increase' ? `+${pricePct}%` : `-${pricePct}%`}</span>
              </div>
              <div className="flex items-center gap-3">
                {[5, 10, 15, 20].map((val) => (
                  <button
                    key={val}
                    onClick={() => setPricePct(val)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      pricePct === val
                        ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-sm'
                        : 'bg-[#0F1219] text-[#A7B0C0] border-[#222936] hover:border-[#303848] hover:text-[#F8FAFC]'
                    }`}
                  >
                    {selectedType === 'price_increase' ? `+${val}%` : `-${val}%`}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#707A8C] italic">
                Assumption: Sales unit volume remains unchanged (inelastic demand benchmark).
              </p>
            </div>
          )}

          {/* Sales Growth */}
          {selectedType === 'sales_growth' && (
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A7B0C0] font-medium">Sales Volume Growth Percentage</span>
                <span className="font-bold text-[#A78BFA] text-sm">+{salesGrowthPct}%</span>
              </div>
              <div className="flex items-center gap-3">
                {[5, 10, 15, 20, 30].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSalesGrowthPct(val)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      salesGrowthPct === val
                        ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-sm'
                        : 'bg-[#0F1219] text-[#A7B0C0] border-[#222936] hover:border-[#303848] hover:text-[#F8FAFC]'
                    }`}
                  >
                    +{val}%
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#707A8C] italic">
                Assumption: Variable material procurement scales proportionally with sales volume; fixed overhead remains constant.
              </p>
            </div>
          )}

          {/* Cost Reduction */}
          {selectedType === 'cost_reduction' && (
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCostTarget('opex')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    costTarget === 'opex' ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-sm' : 'bg-[#0F1219] text-[#A7B0C0] border-[#222936] hover:text-[#F8FAFC]'
                  }`}
                >
                  Operating Expenses (Rent, Utilities, Admin)
                </button>
                <button
                  onClick={() => setCostTarget('material')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    costTarget === 'material' ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-sm' : 'bg-[#0F1219] text-[#A7B0C0] border-[#222936] hover:text-[#F8FAFC]'
                  }`}
                >
                  Raw Material Procurement
                </button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A7B0C0] font-medium">Reduction Percentage</span>
                <span className="font-bold text-[#A78BFA] text-sm">-{costReductionPct}%</span>
              </div>
              <div className="flex items-center gap-3">
                {[5, 10, 15, 20].map((val) => (
                  <button
                    key={val}
                    onClick={() => setCostReductionPct(val)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      costReductionPct === val
                        ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-sm'
                        : 'bg-[#0F1219] text-[#A7B0C0] border-[#222936] hover:border-[#303848] hover:text-[#F8FAFC]'
                    }`}
                  >
                    -{val}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Material Cost Surge */}
          {selectedType === 'material_cost' && (
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A7B0C0] font-medium">Raw Material Inflation Surge</span>
                <span className="font-bold text-rose-400 text-sm">+{materialSurgePct}%</span>
              </div>
              <div className="flex items-center gap-3">
                {[5, 10, 15, 25].map((val) => (
                  <button
                    key={val}
                    onClick={() => setMaterialSurgePct(val)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      materialSurgePct === val
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-[#0F1219] text-[#A7B0C0] border-[#222936] hover:border-[#303848] hover:text-[#F8FAFC]'
                    }`}
                  >
                    +{val}%
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#707A8C] italic">
                Tests business shock-absorption capacity if suppliers raise raw material rates without pricing flexibility.
              </p>
            </div>
          )}

          {/* New Hire */}
          {selectedType === 'new_hire' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                  Monthly Gross Salary (₹)
                </label>
                <input
                  type="number"
                  value={hireSalary}
                  onChange={(e) => setHireSalary(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F1219] border border-[#303848] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#8B5CF6] focus:bg-[#161C27]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                  Number of Employees
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={hireCount}
                  onChange={(e) => setHireCount(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F1219] border border-[#303848] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#8B5CF6] focus:bg-[#161C27]"
                />
              </div>
              <div className="sm:col-span-2 text-[11px] text-[#A78BFA] font-medium">
                Total monthly payroll addition: <strong>₹{(hireSalary * hireCount).toLocaleString('en-IN')}</strong>/month
              </div>
            </div>
          )}

          {/* New Loan */}
          {selectedType === 'new_loan' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              <div>
                <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                  Loan Amount (₹)
                </label>
                <input
                  type="number"
                  value={loanAmount}
                  step={50000}
                  onChange={(e) => setLoanAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F1219] border border-[#303848] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#8B5CF6] focus:bg-[#161C27]"
                />
                <span className="text-[10px] text-[#707A8C] mt-1 block">
                  ₹{(loanAmount / 100000).toFixed(1)} Lakhs
                </span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                  Annual Interest Rate (% p.a.)
                </label>
                <input
                  type="number"
                  step={0.25}
                  value={loanRate}
                  onChange={(e) => setLoanRate(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F1219] border border-[#303848] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#8B5CF6] focus:bg-[#161C27]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                  Tenure (Months)
                </label>
                <input
                  type="number"
                  value={loanTenure}
                  onChange={(e) => setLoanTenure(Number(e.target.value) || 12)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F1219] border border-[#303848] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#8B5CF6] focus:bg-[#161C27]"
                />
              </div>
              <div className="sm:col-span-3 p-3 rounded-xl bg-[#0F1219] border border-[#222936] text-xs flex items-center justify-between">
                <span className="text-[#A7B0C0]">Calculated Additional Monthly EMI:</span>
                <span className="font-bold text-amber-400 text-sm">
                  ₹{currentResult.simulated.monthlyEMI - effectiveAnalysis.financials.monthlyEmi > 0
                    ? (currentResult.simulated.monthlyEMI - effectiveAnalysis.financials.monthlyEmi).toLocaleString('en-IN')
                    : '0'}/mo
                </span>
              </div>
            </div>
          )}

          {/* Marketing Spend */}
          {selectedType === 'marketing_spend' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                  Additional Monthly Marketing Budget (₹)
                </label>
                <input
                  type="number"
                  value={marketingSpend}
                  onChange={(e) => setMarketingSpend(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F1219] border border-[#303848] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#8B5CF6] focus:bg-[#161C27]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                  Target Sales Uplift (% growth)
                </label>
                <input
                  type="number"
                  value={marketingGrowth}
                  onChange={(e) => setMarketingGrowth(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F1219] border border-[#303848] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#8B5CF6] focus:bg-[#161C27]"
                />
              </div>
            </div>
          )}

          {/* Combined Multi-Variable Scenario */}
          {selectedType === 'combined' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
              <div>
                <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                  Price Change (%)
                </label>
                <input
                  type="number"
                  value={combPrice}
                  onChange={(e) => setCombPrice(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F1219] border border-[#303848] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#8B5CF6] focus:bg-[#161C27]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                  Sales Growth (%)
                </label>
                <input
                  type="number"
                  value={combSales}
                  onChange={(e) => setCombSales(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F1219] border border-[#303848] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#8B5CF6] focus:bg-[#161C27]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
                  OPEX Reduction (%)
                </label>
                <input
                  type="number"
                  value={combOpex}
                  onChange={(e) => setCombOpex(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F1219] border border-[#303848] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#8B5CF6] focus:bg-[#161C27]"
                />
              </div>
            </div>
          )}
        </div>

        {/* SIMULATION OUTPUT & VERDICT */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-[#F8FAFC] tracking-tight">
              {t('decisionLab.simulationOutput', '3. Simulation Analysis & Decision Verdict')}
            </h2>
            <button
              onClick={handleSaveScenario}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold transition-all shadow-md shadow-[#8B5CF6]/20 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('decisionLab.saveToCompare', 'Save to Comparison')}</span>
            </button>
          </div>

          {/* Verdict and Score Hero Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            
            {/* BizPilot Scenario Score */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[#121722] border border-[#222936] flex flex-col justify-between shadow-lg shadow-black/20">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#707A8C]">
                  Scenario Resilience
                </span>
                <div className="text-lg sm:text-xl font-bold text-[#F8FAFC] mt-1">BizPilot Scenario Score</div>
                <p className="text-[11px] text-[#A7B0C0] mt-1">
                  Transparent composite rating derived from margin, net cash flow, DSCR, and runway resilience.
                </p>
              </div>

              <div className="pt-6">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-[#F8FAFC]">{currentResult.simulated.score}</span>
                  <span className="text-xs text-[#707A8C] font-bold">/ 100</span>
                </div>
                <div className="w-full bg-[#161C27] h-2.5 rounded-full overflow-hidden border border-[#222936]">
                  <div
                    className={`h-full rounded-full transition-all ${
                      currentResult.simulated.score >= 70
                        ? 'bg-emerald-500'
                        : currentResult.simulated.score >= 45
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${currentResult.simulated.score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Decision Verdict */}
            <div className="md:col-span-2 p-4 sm:p-6 rounded-2xl bg-[#121722] border border-[#222936] flex flex-col justify-between shadow-lg shadow-black/20">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#707A8C]">
                    Decision Verdict
                  </span>
                  
                  {currentResult.simulated.verdict === 'Recommended' && (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Recommended
                    </span>
                  )}
                  {currentResult.simulated.verdict === 'Caution' && (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-950/40 text-amber-300 border border-amber-800/60 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Proceed with Caution
                    </span>
                  )}
                  {currentResult.simulated.verdict === 'High Risk' && (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-950/40 text-rose-300 border border-rose-800/60 flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                      High Risk
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#F8FAFC]">
                  {currentResult.simulated.verdict === 'Recommended'
                    ? 'Viable Strategic Decision'
                    : currentResult.simulated.verdict === 'Caution'
                    ? 'Requires Operational Safeguards'
                    : 'Significant Financial Strain Detected'}
                </h3>
                <p className="text-xs text-[#A7B0C0] mt-2 leading-relaxed">
                  {currentResult.simulated.verdictRationale}
                </p>
              </div>

              {/* Assumptions Tag List */}
              <div className="pt-4 border-t border-[#222936] mt-4">
                <span className="text-[10px] font-bold text-[#707A8C] uppercase tracking-wider block mb-2">
                  Active Assumptions:
                </span>
                <ul className="space-y-1">
                  {currentResult.simulated.assumptions.map((ass, i) => (
                    <li key={i} className="text-[11px] text-[#A7B0C0] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] shrink-0"></span>
                      <span>{ass}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Baseline vs Scenario Side-by-Side Comparison Table */}
          <div className="rounded-2xl border border-[#222936] bg-[#121722] overflow-hidden shadow-lg shadow-black/20 min-w-0">
            <div className="p-3.5 sm:p-4 bg-[#0F1219] border-b border-[#222936] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                Baseline vs. Scenario Comparison Matrix
              </h3>
              <span className="text-[10px] text-[#707A8C]">
                All currency values in ₹ Lakhs unless specified
              </span>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[540px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#222936] bg-[#0F1219]/80 text-[#707A8C] text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Financial Metric</th>
                    <th className="py-3 px-4">Current Baseline</th>
                    <th className="py-3 px-4 text-[#A78BFA]">Projected Scenario</th>
                    <th className="py-3 px-4">Net Variance</th>
                    <th className="py-3 px-4 text-right">Indicator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222936]">
                  {Object.values(currentResult.comparisons).map((comp) => {
                    const isCurrency = comp.unit === 'currency';
                    const isPercent = comp.unit === 'percent';
                    const isRatio = comp.unit === 'ratio';
                    const isMonths = comp.unit === 'months';

                    const baseDisplay = isCurrency
                      ? `₹${fmtLakh(comp.baseline)}L`
                      : isPercent
                      ? `${comp.baseline ?? '—'}%`
                      : isRatio
                      ? (comp.baseline ? `${comp.baseline}x` : 'Debt-Free')
                      : `${comp.baseline ?? '—'}m`;

                    const simDisplay = isCurrency
                      ? `₹${fmtLakh(comp.simulated)}L`
                      : isPercent
                      ? `${comp.simulated ?? '—'}%`
                      : isRatio
                      ? (comp.simulated ? `${comp.simulated}x` : 'Debt-Free')
                      : `${comp.simulated ?? '—'}m`;

                    const deltaDisplay = isCurrency
                      ? `${(comp.delta ?? 0) >= 0 ? '+' : ''}₹${fmtLakh(comp.delta)}L`
                      : isPercent
                      ? `${(comp.delta ?? 0) >= 0 ? '+' : ''}${comp.delta}%`
                      : isRatio
                      ? `${(comp.delta ?? 0) >= 0 ? '+' : ''}${comp.delta}x`
                      : `${(comp.delta ?? 0) >= 0 ? '+' : ''}${comp.delta}m`;

                    return (
                      <tr key={comp.key} className="hover:bg-[#161C27]/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#F8FAFC]">{comp.label}</td>
                        <td className="py-3 px-4 font-mono text-[#A7B0C0]">{baseDisplay}</td>
                        <td className="py-3 px-4 font-mono font-bold text-[#F8FAFC]">{simDisplay}</td>
                        <td className="py-3 px-4 font-mono">
                          <span
                            className={`${
                              comp.direction === 'improves'
                                ? 'text-emerald-400 font-bold'
                                : comp.direction === 'worsens'
                                ? 'text-rose-400 font-bold'
                                : 'text-[#707A8C]'
                            }`}
                          >
                            {deltaDisplay}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {comp.direction === 'improves' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-800/50">
                              <TrendingUp className="w-3 h-3 text-emerald-400" />
                              Improves
                            </span>
                          )}
                          {comp.direction === 'worsens' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/40 text-rose-300 border border-rose-800/50">
                              <TrendingDown className="w-3 h-3 text-rose-400" />
                              Worsens
                            </span>
                          )}
                          {comp.direction === 'neutral' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#161C27] text-[#707A8C] border border-[#222936]">
                              <Minus className="w-3 h-3" />
                              Neutral
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expandable "How This Was Calculated" Section */}
          <div className="rounded-2xl border border-[#222936] bg-[#121722] overflow-hidden shadow-lg shadow-black/20">
            <button
              onClick={() => setShowCalculations(!showCalculations)}
              className="w-full p-4 flex items-center justify-between text-xs font-bold text-[#A7B0C0] hover:text-[#F8FAFC] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#8B5CF6]" />
                <span>How This Was Calculated (Exact Mathematical Formulas)</span>
              </div>
              {showCalculations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showCalculations && (
              <div className="p-4 pt-0 space-y-3 text-xs border-t border-[#222936] font-mono">
                {currentResult.simulated.calculations.map((calc, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#0F1219] border border-[#222936] space-y-1">
                    <div className="font-bold text-[#A78BFA] text-[11px]">{calc.name}</div>
                    <div className="text-[10px] text-[#707A8C]">Formula: {calc.formula}</div>
                    <div className="text-[11px] text-[#A7B0C0]">
                      {calc.values} = <span className="font-bold text-emerald-400">{calc.result}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MULTI-SCENARIO COMPARISON TABLE */}
        {savedScenarios.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-[#222936]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#F8FAFC] tracking-tight">
                  {t('decisionLab.comparisonTableTitle', '4. Compare Saved Scenarios')}
                </h2>
                <p className="text-xs text-[#A7B0C0]">
                  Side-by-side strategic analysis across multiple alternative business decisions.
                </p>
              </div>
              <button
                onClick={() => setSavedScenarios([])}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="rounded-2xl border border-[#222936] bg-[#121722] overflow-hidden shadow-lg shadow-black/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#222936] bg-[#0F1219] text-[#707A8C] text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-3 px-4">Scenario Name</th>
                      <th className="py-3 px-4">Monthly Revenue</th>
                      <th className="py-3 px-4">Net Cash Flow</th>
                      <th className="py-3 px-4">EBITDA Margin</th>
                      <th className="py-3 px-4">DSCR</th>
                      <th className="py-3 px-4">Scenario Score</th>
                      <th className="py-3 px-4">Verdict</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222936]">
                    {/* Baseline Row */}
                    <tr className="bg-[#0F1219]/60">
                      <td className="py-3 px-4 font-bold text-[#F8FAFC] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        Baseline
                      </td>
                      <td className="py-3 px-4 font-mono text-[#A7B0C0]">₹{fmtLakh(effectiveAnalysis.financials.monthlyRevenue)}L</td>
                      <td className="py-3 px-4 font-mono text-emerald-400 font-bold">₹{fmtLakh(effectiveAnalysis.financials.monthlyNetCashFlow)}L</td>
                      <td className="py-3 px-4 font-mono text-[#A7B0C0]">{effectiveAnalysis.financials.operatingMarginPercent}%</td>
                      <td className="py-3 px-4 font-mono text-[#A7B0C0]">{effectiveAnalysis.financials.dscr ? `${effectiveAnalysis.financials.dscr}x` : 'Debt-Free'}</td>
                      <td className="py-3 px-4 font-mono text-[#707A8C]">55 / 100</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] text-[#707A8C] font-semibold uppercase">Current State</span>
                      </td>
                      <td className="py-3 px-4 text-right">—</td>
                    </tr>

                    {/* Saved Scenario Rows */}
                    {savedScenarios.map((scen) => {
                      const isBest =
                        savedScenarios.length > 1 &&
                        scen.simulated.score === Math.max(...savedScenarios.map((s) => s.simulated.score));

                      return (
                        <tr key={scen.id} className="hover:bg-[#161C27]/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-[#F8FAFC]">
                            <div className="flex items-center gap-2">
                              <span>{scen.name}</span>
                              {isBest && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-950/50 text-emerald-300 border border-emerald-800/60">
                                  Top Pick
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[#A7B0C0]">
                            ₹{fmtLakh(scen.simulated.monthlyRevenue)}L
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                            ₹{fmtLakh(scen.simulated.monthlyNetCashFlow)}L
                          </td>
                          <td className="py-3 px-4 font-mono text-[#A7B0C0]">
                            {scen.simulated.operatingMarginPercent}%
                          </td>
                          <td className="py-3 px-4 font-mono text-[#A7B0C0]">
                            {scen.simulated.dscr ? `${scen.simulated.dscr}x` : 'Debt-Free'}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-[#F8FAFC]">
                            {scen.simulated.score} / 100
                          </td>
                          <td className="py-3 px-4">
                            {scen.simulated.verdict === 'Recommended' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-800/60">
                                Recommended
                              </span>
                            )}
                            {scen.simulated.verdict === 'Caution' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/40 text-amber-300 border border-amber-800/60">
                                Caution
                              </span>
                            )}
                            {scen.simulated.verdict === 'High Risk' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/40 text-rose-300 border border-rose-800/60">
                                High Risk
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleRemoveSaved(scen.id)}
                              className="text-[#707A8C] hover:text-rose-400 p-1 transition-colors"
                              title="Delete scenario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </FeatureGate>
  );
};
