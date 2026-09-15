/**
 * Decision Lab Scenario Simulation Engine
 * 
 * Reusable, pure financial simulation engine grounded strictly in an
 * organization's real metrics from BusinessAnalysis.
 * 
 * Core Features:
 * - 8 Scenario presets + combined scenario support
 * - Standard amortization EMI calculation
 * - Transparent assumptions
 * - Baseline vs Scenario metrics comparison
 * - Direction indicators (improves, worsens, neutral)
 * - BizPilot Scenario Score (0–100)
 * - Data-backed Verdict (Recommended, Caution, High Risk)
 * - Mathematical calculation breakdowns
 */

import { BusinessAnalysis, CalculatedFinancials, NormalizedFinancials } from '../types/business';

export type ScenarioType =
  | 'price_increase'
  | 'price_reduction'
  | 'sales_growth'
  | 'cost_reduction'
  | 'material_cost'
  | 'new_hire'
  | 'new_loan'
  | 'marketing_spend'
  | 'combined';

export type MetricDirection = 'improves' | 'worsens' | 'neutral';
export type DecisionVerdict = 'Recommended' | 'Caution' | 'High Risk';

export interface ScenarioParams {
  type: ScenarioType;
  name?: string;
  priceChangePercent?: number; // e.g. +5, +10, -5
  salesGrowthPercent?: number; // e.g. +10, +20
  costReductionPercent?: number; // e.g. -10 on OPEX or material
  costReductionTarget?: 'opex' | 'material';
  materialCostPercent?: number; // e.g. +5, +10
  monthlySalary?: number; // e.g. 25000
  hireCount?: number; // e.g. 1
  loanAmount?: number; // e.g. 1000000 (10 Lakhs)
  loanInterestRate?: number; // e.g. 11.5 (% p.a.)
  loanTenureMonths?: number; // e.g. 36
  marketingSpendMonthly?: number; // e.g. 15000
  marketingExpectedSalesGrowth?: number; // e.g. +5%
}

export interface MetricComparison {
  key: string;
  label: string;
  baseline: number | null;
  simulated: number | null;
  delta: number | null;
  percentDelta: number | null;
  direction: MetricDirection;
  unit: 'currency' | 'percent' | 'ratio' | 'months';
}

export interface CalculationStep {
  name: string;
  formula: string;
  values: string;
  result: string;
}

export interface SimulatedMetrics {
  monthlyRevenue: number;
  annualRevenue: number;
  monthlyOperatingExpenses: number;
  monthlyMaterialCost: number;
  monthlySalaryCost: number;
  totalMonthlyExpenses: number;
  monthlyEbitda: number;
  operatingMarginPercent: number | null;
  monthlyEMI: number;
  annualEmi: number;
  monthlyNetCashFlow: number;
  annualNetProfit: number;
  netMarginPercent: number | null;
  currentCashBalance: number;
  totalDebtOutstanding: number;
  dscr: number | null;
  debtToRevenue: number | null;
  runwayMonths: number | null;
  score: number;
  verdict: DecisionVerdict;
  verdictRationale: string;
  assumptions: string[];
  calculations: CalculationStep[];
}

export interface ScenarioResult {
  id: string;
  name: string;
  type: ScenarioType;
  params: ScenarioParams;
  simulated: SimulatedMetrics;
  comparisons: {
    revenue: MetricComparison;
    expenses: MetricComparison;
    ebitda: MetricComparison;
    margin: MetricComparison;
    netCashFlow: MetricComparison;
    dscr: MetricComparison;
    debtToRevenue: MetricComparison;
    runway: MetricComparison;
  };
}

/**
 * Standard Equated Monthly Installment (EMI) Formula:
 * EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
 */
export function calculateStandardEMI(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRatePercent <= 0) return Math.round(principal / tenureMonths);

  const r = annualRatePercent / 12 / 100;
  const n = tenureMonths;
  const compound = Math.pow(1 + r, n);
  const emi = (principal * r * compound) / (compound - 1);
  return Math.round(emi);
}

/**
 * Helper to determine metric change direction
 */
function evaluateDirection(
  baseline: number | null,
  simulated: number | null,
  higherIsBetter: boolean
): MetricDirection {
  if (baseline === null || simulated === null) return 'neutral';
  const diff = simulated - baseline;
  if (Math.abs(diff) < 0.001) return 'neutral';
  if (higherIsBetter) {
    return diff > 0 ? 'improves' : 'worsens';
  } else {
    return diff < 0 ? 'improves' : 'worsens';
  }
}

/**
 * Helper to construct a clean MetricComparison object
 */
function createComparison(
  key: string,
  label: string,
  baseline: number | null,
  simulated: number | null,
  higherIsBetter: boolean,
  unit: 'currency' | 'percent' | 'ratio' | 'months'
): MetricComparison {
  const delta = baseline !== null && simulated !== null ? parseFloat((simulated - baseline).toFixed(2)) : null;
  const percentDelta =
    baseline !== null && simulated !== null && baseline !== 0
      ? parseFloat((((simulated - baseline) / Math.abs(baseline)) * 100).toFixed(1))
      : null;

  return {
    key,
    label,
    baseline,
    simulated,
    delta,
    percentDelta,
    direction: evaluateDirection(baseline, simulated, higherIsBetter),
    unit,
  };
}

/**
 * Calculate BizPilot Scenario Score (0–100)
 * Uses transparent, deterministic scoring based on 4 pillars:
 * 1. Profitability & EBITDA Margin
 * 2. Monthly Net Cash Flow sustainability
 * 3. Debt Service Coverage Ratio (DSCR)
 * 4. Cash Runway & Liquidity Buffer
 */
export function calculateScenarioScore(
  baseFin: CalculatedFinancials,
  simFin: {
    monthlyEbitda: number;
    operatingMarginPercent: number | null;
    monthlyNetCashFlow: number;
    dscr: number | null;
    runwayMonths: number | null;
  }
): number {
  let score = 55; // Neutral starting baseline

  // 1. EBITDA & Margin Impact (up to +/- 20 pts)
  const baseMargin = baseFin.operatingMarginPercent ?? 0;
  const simMargin = simFin.operatingMarginPercent ?? 0;
  const marginDelta = simMargin - baseMargin;
  if (marginDelta >= 5) score += 20;
  else if (marginDelta >= 2.5) score += 14;
  else if (marginDelta > 0) score += 8;
  else if (marginDelta <= -5) score -= 20;
  else if (marginDelta <= -2.5) score -= 14;
  else if (marginDelta < 0) score -= 8;

  // 2. Net Cash Flow Impact (up to +/- 25 pts)
  const baseCashFlow = baseFin.monthlyNetCashFlow;
  const simCashFlow = simFin.monthlyNetCashFlow;
  if (simCashFlow > 0 && baseCashFlow > 0) {
    if (simCashFlow >= baseCashFlow * 1.15) score += 20;
    else if (simCashFlow >= baseCashFlow) score += 10;
    else if (simCashFlow < baseCashFlow * 0.8) score -= 10;
    else score -= 5;
  } else if (simCashFlow > 0 && baseCashFlow <= 0) {
    score += 25; // Turned cash-positive!
  } else if (simCashFlow <= 0 && baseCashFlow > 0) {
    score -= 30; // Turned cash-negative! Critical warning
  } else {
    // Both negative
    score -= 20;
    if (simCashFlow < baseCashFlow) score -= 10;
  }

  // 3. DSCR / Debt Service Impact (up to +/- 20 pts)
  if (simFin.dscr !== null) {
    if (simFin.dscr >= 1.75) score += 15;
    else if (simFin.dscr >= 1.4) score += 8;
    else if (simFin.dscr >= 1.15) score += 0;
    else if (simFin.dscr >= 1.0) score -= 15;
    else score -= 25; // Insolvent on debt service
  } else {
    score += 10; // Debt-free bonus
  }

  // 4. Cash Runway Impact (up to +/- 15 pts)
  const simRunway = simFin.runwayMonths ?? 0;
  if (simRunway >= 6) score += 12;
  else if (simRunway >= 3.5) score += 6;
  else if (simRunway >= 2) score += 0;
  else if (simRunway >= 1) score -= 10;
  else score -= 20;

  return Math.min(98, Math.max(8, score));
}

/**
 * Determine decision verdict and data-backed explanation
 */
export function evaluateScenarioVerdict(
  score: number,
  baseFin: CalculatedFinancials,
  simFin: {
    monthlyNetCashFlow: number;
    monthlyEbitda: number;
    operatingMarginPercent: number | null;
    dscr: number | null;
    runwayMonths: number | null;
  }
): { verdict: DecisionVerdict; rationale: string } {
  const turnedNegative = simFin.monthlyNetCashFlow < 0 && baseFin.monthlyNetCashFlow >= 0;
  const dscrCritical = simFin.dscr !== null && simFin.dscr < 1.15;
  const runwayCritical = simFin.runwayMonths !== null && simFin.runwayMonths < 1.5;

  if (turnedNegative || (dscrCritical && simFin.dscr! < 1.0) || runwayCritical || score < 42) {
    let reason = 'This scenario poses substantial liquidity stress. ';
    if (turnedNegative) {
      reason += `Monthly net cash flow drops into a deficit of -₹${(Math.abs(simFin.monthlyNetCashFlow) / 1000).toFixed(0)}k/mo. `;
    }
    if (dscrCritical) {
      reason += `DSCR decreases to ${simFin.dscr}x, risking breach of banking covenant limits. `;
    }
    if (runwayCritical) {
      reason += `Projected cash runway tightens to only ${simFin.runwayMonths} months. `;
    }
    return {
      verdict: 'High Risk',
      rationale: reason.trim(),
    };
  }

  if (score >= 68 && simFin.monthlyNetCashFlow >= baseFin.monthlyNetCashFlow && (!simFin.dscr || simFin.dscr >= 1.35)) {
    const cashDelta = simFin.monthlyNetCashFlow - baseFin.monthlyNetCashFlow;
    return {
      verdict: 'Recommended',
      rationale: `This scenario expands operational headroom: monthly net cash flow improves by +₹${(cashDelta / 1000).toFixed(0)}k with healthy EBITDA margin (${simFin.operatingMarginPercent}%) and resilient debt coverage.`,
    };
  }

  return {
    verdict: 'Caution',
    rationale: 'Scenario maintains viable operations but reduces margin buffer or adds ongoing fixed commitments. Monitor working capital closely before implementing.',
  };
}

/**
 * MASTER SIMULATION RUNNER:
 * Simulates any scenario starting from real organization analysis metrics.
 */
export function simulateScenario(
  analysis: BusinessAnalysis,
  params: ScenarioParams
): ScenarioResult {
  const norm = analysis.normalized;
  const baseFin = analysis.financials;

  const assumptions: string[] = [];
  const calculations: CalculationStep[] = [];

  let simRev = norm.monthlyRevenue;
  let simOpex = norm.monthlyOperatingExpenses;
  let simMaterial = norm.monthlyMaterialCost;
  let simSalary = norm.monthlySalaryCost;
  let simCash = norm.currentCashBalance;
  let additionalEmi = 0;
  let additionalDebt = 0;

  // Apply scenario modifications based on parameters
  switch (params.type) {
    case 'price_increase': {
      const pct = params.priceChangePercent ?? 10;
      simRev = Math.round(norm.monthlyRevenue * (1 + pct / 100));
      assumptions.push(`Price increased by ${pct}%.`);
      assumptions.push('Assumes sales volume remains unchanged (inelastic demand).');
      assumptions.push('Variable procurement and fixed costs remain at baseline.');
      break;
    }

    case 'price_reduction': {
      const pct = Math.abs(params.priceChangePercent ?? 5);
      simRev = Math.round(norm.monthlyRevenue * (1 - pct / 100));
      assumptions.push(`Price reduced by ${pct}%.`);
      assumptions.push('Assumes sales volume remains constant unless paired with sales volume growth.');
      break;
    }

    case 'sales_growth': {
      const pct = params.salesGrowthPercent ?? 15;
      const factor = 1 + pct / 100;
      simRev = Math.round(norm.monthlyRevenue * factor);
      // Variable material costs scale proportionally with sales volume
      simMaterial = Math.round(norm.monthlyMaterialCost * factor);
      assumptions.push(`Sales volume increases by ${pct}%.`);
      assumptions.push('Raw material & COGS scale directly proportional to sales volume.');
      assumptions.push('Fixed OPEX and staff payroll remain constant.');
      break;
    }

    case 'cost_reduction': {
      const pct = Math.abs(params.costReductionPercent ?? 10);
      const target = params.costReductionTarget ?? 'opex';
      if (target === 'material') {
        simMaterial = Math.round(norm.monthlyMaterialCost * (1 - pct / 100));
        assumptions.push(`Material procurement costs reduced by ${pct}% via bulk negotiation or supplier rationalization.`);
      } else {
        simOpex = Math.round(norm.monthlyOperatingExpenses * (1 - pct / 100));
        assumptions.push(`Fixed operating expenses (utilities, admin, rent) trimmed by ${pct}%.`);
      }
      assumptions.push('Revenue generation remains unhindered.');
      break;
    }

    case 'material_cost': {
      const pct = params.materialCostPercent ?? 10;
      simMaterial = Math.round(norm.monthlyMaterialCost * (1 + pct / 100));
      assumptions.push(`Raw material costs inflate by ${pct}%.`);
      assumptions.push('Selling price is not adjusted, absorbing margin compression internally.');
      break;
    }

    case 'new_hire': {
      const salary = params.monthlySalary ?? 25000;
      const count = params.hireCount ?? 1;
      const additionalMonthlyPayroll = salary * count;
      simSalary = norm.monthlySalaryCost + additionalMonthlyPayroll;
      assumptions.push(`Hiring ${count} staff member(s) at monthly salary of ₹${salary.toLocaleString('en-IN')}.`);
      assumptions.push(`Total monthly payroll expands by +₹${additionalMonthlyPayroll.toLocaleString('en-IN')}.`);
      assumptions.push('Immediate revenue contribution from new hire is assumed neutral in Month 1.');
      break;
    }

    case 'new_loan': {
      const principal = params.loanAmount ?? 1000000; // 10L default
      const rate = params.loanInterestRate ?? 11.0;
      const tenure = params.loanTenureMonths ?? 36;
      additionalEmi = calculateStandardEMI(principal, rate, tenure);
      additionalDebt = principal;
      simCash = norm.currentCashBalance + principal;
      assumptions.push(`New loan facility of ₹${(principal / 100000).toFixed(1)} Lakhs at ${rate}% interest p.a. for ${tenure} months.`);
      assumptions.push(`Calculated standard monthly EMI of ₹${additionalEmi.toLocaleString('en-IN')}.`);
      assumptions.push('Loan proceeds injected directly into liquid cash reserves.');
      break;
    }

    case 'marketing_spend': {
      const spend = params.marketingSpendMonthly ?? 15000;
      const growthPct = params.marketingExpectedSalesGrowth ?? 0;
      simOpex = norm.monthlyOperatingExpenses + spend;
      if (growthPct > 0) {
        simRev = Math.round(norm.monthlyRevenue * (1 + growthPct / 100));
        simMaterial = Math.round(norm.monthlyMaterialCost * (1 + growthPct / 100));
      }
      assumptions.push(`Additional marketing & advertising allocation of ₹${spend.toLocaleString('en-IN')}/month.`);
      if (growthPct > 0) {
        assumptions.push(`Expected organic sales uplift of ${growthPct}%.`);
      } else {
        assumptions.push('Conservative baseline test: sales volume remains flat to test downside risk.');
      }
      break;
    }

    case 'combined': {
      // Combines price + sales + cost changes
      if (params.priceChangePercent) {
        simRev = Math.round(simRev * (1 + params.priceChangePercent / 100));
        assumptions.push(`Price adjusted by ${params.priceChangePercent > 0 ? '+' : ''}${params.priceChangePercent}%.`);
      }
      if (params.salesGrowthPercent) {
        const factor = 1 + params.salesGrowthPercent / 100;
        simRev = Math.round(simRev * factor);
        simMaterial = Math.round(simMaterial * factor);
        assumptions.push(`Sales volume changed by ${params.salesGrowthPercent > 0 ? '+' : ''}${params.salesGrowthPercent}%.`);
      }
      if (params.costReductionPercent) {
        simOpex = Math.round(simOpex * (1 - Math.abs(params.costReductionPercent) / 100));
        assumptions.push(`OPEX reduced by ${Math.abs(params.costReductionPercent)}%.`);
      }
      if (params.monthlySalary && params.hireCount) {
        simSalary += params.monthlySalary * params.hireCount;
        assumptions.push(`Hired ${params.hireCount} employee(s) at ₹${params.monthlySalary}/mo.`);
      }
      if (params.marketingSpendMonthly) {
        simOpex += params.marketingSpendMonthly;
        assumptions.push(`Marketing spend of ₹${params.marketingSpendMonthly}/mo.`);
      }
      break;
    }
  }

  // Derive consolidated simulated metrics
  const annualRev = simRev * 12;
  const simTotalExpenses = simOpex + simMaterial + simSalary;
  const simEbitda = simRev - simTotalExpenses;
  const simOpMargin = simRev > 0 ? parseFloat(((simEbitda / simRev) * 100).toFixed(1)) : null;

  const totalMonthlyEmi = norm.monthlyEMI + additionalEmi;
  const annualEmi = totalMonthlyEmi * 12;
  const simNetCashFlow = simEbitda - totalMonthlyEmi;
  const annualNetProfit = simNetCashFlow * 12;
  const simNetMargin = simRev > 0 ? parseFloat(((simNetCashFlow / simRev) * 100).toFixed(1)) : null;

  const totalDebt = norm.outstandingLoanAmount + additionalDebt;
  const debtToRev = annualRev > 0 ? parseFloat((totalDebt / annualRev).toFixed(2)) : null;

  const dscr = totalMonthlyEmi > 0 ? parseFloat((simEbitda / totalMonthlyEmi).toFixed(2)) : null;

  // Runway calculation
  let simRunway: number | null = null;
  const totalOutflow = simTotalExpenses + totalMonthlyEmi;
  if (simNetCashFlow < 0) {
    simRunway = parseFloat((simCash / Math.abs(simNetCashFlow)).toFixed(1));
  } else if (totalOutflow > 0) {
    simRunway = parseFloat((simCash / totalOutflow).toFixed(1));
  }

  // Record mathematical steps
  calculations.push({
    name: 'Total Monthly Expenses',
    formula: 'OPEX + Material Cost + Salary Payroll',
    values: `₹${simOpex.toLocaleString()} + ₹${simMaterial.toLocaleString()} + ₹${simSalary.toLocaleString()}`,
    result: `₹${simTotalExpenses.toLocaleString()}`,
  });
  calculations.push({
    name: 'Monthly EBITDA',
    formula: 'Monthly Revenue - Total Monthly Expenses',
    values: `₹${simRev.toLocaleString()} - ₹${simTotalExpenses.toLocaleString()}`,
    result: `₹${simEbitda.toLocaleString()}`,
  });
  calculations.push({
    name: 'Monthly Net Cash Flow',
    formula: 'Monthly EBITDA - Total Monthly EMI',
    values: `₹${simEbitda.toLocaleString()} - ₹${totalMonthlyEmi.toLocaleString()}`,
    result: `₹${simNetCashFlow.toLocaleString()}`,
  });
  if (totalMonthlyEmi > 0) {
    calculations.push({
      name: 'DSCR (Debt Service Coverage Ratio)',
      formula: 'Monthly EBITDA ÷ Total Monthly EMI',
      values: `₹${simEbitda.toLocaleString()} ÷ ₹${totalMonthlyEmi.toLocaleString()}`,
      result: `${dscr}x`,
    });
  }

  // Score & Verdict
  const score = calculateScenarioScore(baseFin, {
    monthlyEbitda: simEbitda,
    operatingMarginPercent: simOpMargin,
    monthlyNetCashFlow: simNetCashFlow,
    dscr,
    runwayMonths: simRunway,
  });

  const { verdict, rationale } = evaluateScenarioVerdict(score, baseFin, {
    monthlyNetCashFlow: simNetCashFlow,
    monthlyEbitda: simEbitda,
    operatingMarginPercent: simOpMargin,
    dscr,
    runwayMonths: simRunway,
  });

  const simulated: SimulatedMetrics = {
    monthlyRevenue: simRev,
    annualRevenue: annualRev,
    monthlyOperatingExpenses: simOpex,
    monthlyMaterialCost: simMaterial,
    monthlySalaryCost: simSalary,
    totalMonthlyExpenses: simTotalExpenses,
    monthlyEbitda: simEbitda,
    operatingMarginPercent: simOpMargin,
    monthlyEMI: totalMonthlyEmi,
    annualEmi,
    monthlyNetCashFlow: simNetCashFlow,
    annualNetProfit,
    netMarginPercent: simNetMargin,
    currentCashBalance: simCash,
    totalDebtOutstanding: totalDebt,
    dscr,
    debtToRevenue: debtToRev,
    runwayMonths: simRunway,
    score,
    verdict,
    verdictRationale: rationale,
    assumptions,
    calculations,
  };

  const scenarioName = params.name || formatDefaultScenarioName(params);

  return {
    id: 'scen_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name: scenarioName,
    type: params.type,
    params,
    simulated,
    comparisons: {
      revenue: createComparison('revenue', 'Monthly Revenue', baseFin.monthlyRevenue, simRev, true, 'currency'),
      expenses: createComparison('expenses', 'Monthly Total Costs', baseFin.totalMonthlyExpenses, simTotalExpenses, false, 'currency'),
      ebitda: createComparison('ebitda', 'Monthly EBITDA', baseFin.monthlyEbitda, simEbitda, true, 'currency'),
      margin: createComparison('margin', 'Operating Margin', baseFin.operatingMarginPercent, simOpMargin, true, 'percent'),
      netCashFlow: createComparison('netCashFlow', 'Net Cash Flow', baseFin.monthlyNetCashFlow, simNetCashFlow, true, 'currency'),
      dscr: createComparison('dscr', 'DSCR Ratio', baseFin.dscr, dscr, true, 'ratio'),
      debtToRevenue: createComparison('debtToRevenue', 'Debt-to-Revenue', baseFin.debtToAnnualRevenue, debtToRev, false, 'ratio'),
      runway: createComparison('runway', 'Cash Runway', baseFin.runwayMonths, simRunway, true, 'months'),
    },
  };
}

/**
 * Format human-readable default scenario title
 */
function formatDefaultScenarioName(params: ScenarioParams): string {
  switch (params.type) {
    case 'price_increase':
      return `Price Increase (+${params.priceChangePercent ?? 10}%)`;
    case 'price_reduction':
      return `Price Reduction (-${params.priceChangePercent ?? 5}%)`;
    case 'sales_growth':
      return `Sales Expansion (+${params.salesGrowthPercent ?? 15}%)`;
    case 'cost_reduction':
      return `OPEX Reduction (-${params.costReductionPercent ?? 10}%)`;
    case 'material_cost':
      return `Material Cost Surge (+${params.materialCostPercent ?? 10}%)`;
    case 'new_hire':
      return `Hire ${params.hireCount ?? 1} Staff (₹${((params.monthlySalary ?? 25000) / 1000).toFixed(0)}k/mo)`;
    case 'new_loan':
      return `New Loan ₹${((params.loanAmount ?? 1000000) / 100000).toFixed(1)}L @ ${params.loanInterestRate ?? 11}%`;
    case 'marketing_spend':
      return `Marketing Spend +₹${((params.marketingSpendMonthly ?? 15000) / 1000).toFixed(0)}k/mo`;
    case 'combined':
      return 'Combined Strategic Plan';
    default:
      return 'Business Decision Scenario';
  }
}
