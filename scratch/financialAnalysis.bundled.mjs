// src/types/business.ts
function safeNumber(value, fallback = 0) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.-]/g, "");
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

// src/analytics/financialAnalysis.ts
function normalizeOrganizationData(org) {
  const fin = org.financialProfile || {};
  const debt = org.debtProfile || {};
  const loan = debt.loanDetails || {};
  const hasLoans = debt.hasLoans === true;
  return {
    monthlyRevenue: Math.max(0, safeNumber(fin.monthlyRevenue)),
    monthlyOperatingExpenses: Math.max(0, safeNumber(fin.monthlyOperatingExpenses)),
    monthlyMaterialCost: Math.max(0, safeNumber(fin.monthlyMaterialCost)),
    monthlySalaryCost: Math.max(0, safeNumber(fin.monthlySalaryCost)),
    currentCashBalance: Math.max(0, safeNumber(fin.currentCashBalance)),
    accountsReceivable: Math.max(0, safeNumber(fin.accountsReceivable)),
    accountsPayable: Math.max(0, safeNumber(fin.accountsPayable)),
    inventoryValue: Math.max(0, safeNumber(fin.inventoryValue)),
    outstandingLoanAmount: hasLoans ? Math.max(0, safeNumber(loan.outstandingLoanAmount)) : 0,
    monthlyEMI: hasLoans ? Math.max(0, safeNumber(loan.monthlyEMI)) : 0,
    interestRate: hasLoans ? Math.max(0, safeNumber(loan.interestRate)) : 0,
    remainingTenureMonths: hasLoans ? Math.max(0, safeNumber(loan.remainingTenureMonths)) : 0,
    hasLoans
  };
}
function calculateFinancialMetrics(norm) {
  const annualRevenue = norm.monthlyRevenue * 12;
  const totalMonthlyExpenses = norm.monthlyOperatingExpenses + norm.monthlyMaterialCost + norm.monthlySalaryCost;
  const monthlyGrossProfit = norm.monthlyRevenue - norm.monthlyMaterialCost;
  const grossMarginPercent = norm.monthlyRevenue > 0 ? parseFloat((monthlyGrossProfit / norm.monthlyRevenue * 100).toFixed(1)) : null;
  const monthlyEbitda = norm.monthlyRevenue - totalMonthlyExpenses;
  const annualEbitda = monthlyEbitda * 12;
  const operatingMarginPercent = norm.monthlyRevenue > 0 ? parseFloat((monthlyEbitda / norm.monthlyRevenue * 100).toFixed(1)) : null;
  const annualEmi = norm.monthlyEMI * 12;
  const monthlyNetCashFlow = monthlyEbitda - norm.monthlyEMI;
  const annualNetProfit = monthlyNetCashFlow * 12;
  const netMarginPercent = norm.monthlyRevenue > 0 ? parseFloat((monthlyNetCashFlow / norm.monthlyRevenue * 100).toFixed(1)) : null;
  const currentAssets = norm.currentCashBalance + norm.accountsReceivable + norm.inventoryValue;
  const workingCapital = currentAssets - norm.accountsPayable;
  const currentRatio = norm.accountsPayable > 0 ? parseFloat((currentAssets / norm.accountsPayable).toFixed(2)) : null;
  const quickAssets = norm.currentCashBalance + norm.accountsReceivable;
  const quickRatio = norm.accountsPayable > 0 ? parseFloat((quickAssets / norm.accountsPayable).toFixed(2)) : null;
  const cashBurnRate = monthlyNetCashFlow < 0 ? Math.abs(monthlyNetCashFlow) : 0;
  const totalMonthlyOutflow = totalMonthlyExpenses + norm.monthlyEMI;
  let runwayMonths = null;
  if (cashBurnRate > 0) {
    runwayMonths = parseFloat((norm.currentCashBalance / cashBurnRate).toFixed(1));
  } else if (totalMonthlyOutflow > 0) {
    runwayMonths = parseFloat((norm.currentCashBalance / totalMonthlyOutflow).toFixed(1));
  }
  const dscr = norm.monthlyEMI > 0 ? parseFloat((monthlyEbitda / norm.monthlyEMI).toFixed(2)) : null;
  const debtToAnnualRevenue = annualRevenue > 0 ? parseFloat((norm.outstandingLoanAmount / annualRevenue).toFixed(2)) : null;
  const emiBurdenRatio = norm.monthlyRevenue > 0 ? parseFloat((norm.monthlyEMI / norm.monthlyRevenue * 100).toFixed(1)) : null;
  return {
    monthlyRevenue: norm.monthlyRevenue,
    annualRevenue,
    monthlyOperatingExpenses: norm.monthlyOperatingExpenses,
    monthlyMaterialCost: norm.monthlyMaterialCost,
    monthlySalaryCost: norm.monthlySalaryCost,
    totalMonthlyExpenses,
    monthlyGrossProfit,
    grossMarginPercent,
    monthlyEbitda,
    annualEbitda,
    operatingMarginPercent,
    monthlyEmi: norm.monthlyEMI,
    annualEmi,
    monthlyNetCashFlow,
    annualNetProfit,
    netMarginPercent,
    currentCashBalance: norm.currentCashBalance,
    accountsReceivable: norm.accountsReceivable,
    accountsPayable: norm.accountsPayable,
    inventoryValue: norm.inventoryValue,
    workingCapital,
    currentRatio,
    quickRatio,
    cashBurnRate,
    runwayMonths,
    totalDebtOutstanding: norm.outstandingLoanAmount,
    dscr,
    debtToAnnualRevenue,
    emiBurdenRatio
  };
}
function evaluateFinancialHealth(norm, fin) {
  const metrics = [];
  let profitScore = 12;
  const opMargin = fin.operatingMarginPercent ?? 0;
  if (opMargin >= 22) profitScore = 25;
  else if (opMargin >= 15) profitScore = 22;
  else if (opMargin >= 10) profitScore = 18;
  else if (opMargin >= 5) profitScore = 14;
  else if (opMargin > 0) profitScore = 10;
  else profitScore = 4;
  metrics.push({
    category: "Operating Profitability",
    score: Math.round(profitScore / 25 * 100),
    weight: 25,
    status: profitScore >= 20 ? "Optimal" : profitScore >= 15 ? "Healthy" : profitScore >= 10 ? "Moderate" : "Critical",
    insight: `Operating EBITDA margin is ${opMargin}% with monthly EBITDA of \u20B9${(fin.monthlyEbitda / 1e5).toFixed(1)} Lakhs.`,
    recommendation: opMargin < 12 ? "Target direct procurement discounts and optimize OPEX to bring operating margin above 15%." : "Sustain current margins while scaling order volume across higher-margin client segments."
  });
  let liquidityScore = 12;
  const runway = fin.runwayMonths ?? 0;
  if (runway >= 6) liquidityScore = 25;
  else if (runway >= 4) liquidityScore = 20;
  else if (runway >= 2.5) liquidityScore = 15;
  else if (runway >= 1.5) liquidityScore = 10;
  else liquidityScore = 5;
  metrics.push({
    category: "Liquidity & Cash Runway",
    score: Math.round(liquidityScore / 25 * 100),
    weight: 25,
    status: liquidityScore >= 20 ? "Optimal" : liquidityScore >= 15 ? "Healthy" : liquidityScore >= 10 ? "Moderate" : "Critical",
    insight: `Cash balance of \u20B9${(norm.currentCashBalance / 1e5).toFixed(1)}L provides ${runway > 0 ? `${runway} months` : "less than 1 month"} of runway.`,
    recommendation: runway < 3 ? "Accelerate accounts receivable recovery and negotiate 15 extra creditor days to build a 3-month reserve." : "Maintain a minimum 90-day cash operating reserve in liquid sweep accounts."
  });
  let debtScore = 25;
  if (norm.hasLoans) {
    const dscrVal = fin.dscr ?? 0;
    if (dscrVal >= 2) debtScore = 25;
    else if (dscrVal >= 1.5) debtScore = 21;
    else if (dscrVal >= 1.25) debtScore = 16;
    else if (dscrVal >= 1) debtScore = 11;
    else debtScore = 4;
  }
  metrics.push({
    category: "Debt Serviceability (DSCR)",
    score: Math.round(debtScore / 25 * 100),
    weight: 25,
    status: debtScore >= 20 ? "Optimal" : debtScore >= 15 ? "Healthy" : debtScore >= 10 ? "Moderate" : "Critical",
    insight: norm.hasLoans ? `DSCR stands at ${fin.dscr ?? "N/A"}x against a monthly EMI commitment of \u20B9${(norm.monthlyEMI / 1e3).toFixed(1)}k.` : "Business operates debt-free with zero monthly EMI obligations.",
    recommendation: norm.hasLoans ? (fin.dscr ?? 0) < 1.3 ? "Refinance existing facilities to extend tenure and lower monthly EMI burden." : "DSCR comfortably supports working capital lines or term loan expansions." : "Clean debt profile makes the company a strong candidate for collateral-free credit lines."
  });
  let wcScore = 15;
  const isWcPositive = fin.workingCapital > 0;
  const cr = fin.currentRatio;
  if (isWcPositive && cr && cr >= 1.5) wcScore = 25;
  else if (isWcPositive && cr && cr >= 1.2) wcScore = 20;
  else if (isWcPositive) wcScore = 16;
  else if (cr && cr >= 0.9) wcScore = 10;
  else wcScore = 5;
  metrics.push({
    category: "Working Capital Health",
    score: Math.round(wcScore / 25 * 100),
    weight: 25,
    status: wcScore >= 20 ? "Optimal" : wcScore >= 15 ? "Healthy" : wcScore >= 10 ? "Moderate" : "Critical",
    insight: `Net working capital is \u20B9${(fin.workingCapital / 1e5).toFixed(1)}L with a Current Ratio of ${cr ?? "N/A"}${cr ? "x" : ""}.`,
    recommendation: fin.workingCapital < 0 ? "Urgent: Accounts payable exceed liquid assets. Structure debtor recovery to clear short-term liabilities." : "Working capital position is stable. Monitor debtor collection cycles regularly."
  });
  const totalPoints = profitScore + liquidityScore + debtScore + wcScore;
  const overallScore = Math.min(100, Math.max(0, totalPoints));
  let rating = "Critical";
  let summary = "";
  if (overallScore >= 80) {
    rating = "Optimal";
    summary = "Outstanding financial diagnostic. Strong profitability, comfortable liquidity, and low debt distress.";
  } else if (overallScore >= 65) {
    rating = "Healthy";
    summary = "Sound operational profile. Good cash flow fundamentals with actionable opportunities in working capital.";
  } else if (overallScore >= 50) {
    rating = "Moderate";
    summary = "Moderate risk profile. Margins or debt service coverage require management attention.";
  } else {
    rating = "Critical";
    summary = "Vulnerable financial posture. Immediate working capital, cost-reduction, or cash runway actions needed.";
  }
  return {
    overallScore,
    rating,
    summary,
    metrics
  };
}
function evaluateFundingReadiness(org, norm, fin, _overallHealthScore) {
  const compliance = org.complianceProfile || {};
  const establishedYear = safeNumber(org.businessProfile?.yearEstablished);
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const hasVintage = establishedYear > 1900 && establishedYear <= currentYear;
  const vintage = hasVintage ? Math.max(0, currentYear - establishedYear) : 0;
  let compScore = 0;
  if (compliance.gstRegistered) compScore += 10;
  if (compliance.itrAvailable) compScore += 10;
  if (compliance.hasBusinessBankAccount) compScore += 5;
  let finScore = 0;
  if (fin.operatingMarginPercent && fin.operatingMarginPercent >= 12) finScore += 10;
  else if (fin.operatingMarginPercent && fin.operatingMarginPercent > 0) finScore += 6;
  if (fin.monthlyNetCashFlow > 0) finScore += 8;
  if (!norm.hasLoans || fin.dscr && fin.dscr >= 1.5) finScore += 7;
  else if (fin.dscr && fin.dscr >= 1.2) finScore += 4;
  let trackScore = 0;
  if (vintage >= 5) trackScore += 15;
  else if (vintage >= 3) trackScore += 12;
  else if (vintage >= 1) trackScore += 8;
  else trackScore += 4;
  if (fin.annualRevenue >= 5e6) trackScore += 5;
  else if (fin.annualRevenue >= 25e5) trackScore += 3;
  let bufferScore = 0;
  if ((fin.runwayMonths ?? 0) >= 4) bufferScore += 8;
  else if ((fin.runwayMonths ?? 0) >= 2) bufferScore += 5;
  if (fin.workingCapital > 0) bufferScore += 7;
  let capacityScore = 15;
  if (norm.hasLoans) {
    const debtRatio = fin.debtToAnnualRevenue ?? 0;
    if (debtRatio > 0.6) capacityScore = 4;
    else if (debtRatio > 0.4) capacityScore = 8;
    else capacityScore = 12;
  }
  const overallScore = Math.min(100, compScore + finScore + trackScore + bufferScore + capacityScore);
  let eligibilityTier = "Not Eligible";
  if (overallScore >= 75) eligibilityTier = "High";
  else if (overallScore >= 60) eligibilityTier = "Medium";
  else if (overallScore >= 45) eligibilityTier = "Low";
  const grossCapacity = Math.round(fin.annualRevenue * 0.2);
  const netCapacity = Math.max(0, grossCapacity - norm.outstandingLoanAmount);
  const estimatedCreditLimitValue = netCapacity > 0 ? netCapacity : Math.round(fin.annualRevenue * 0.1);
  const formattedLimit = estimatedCreditLimitValue >= 1e7 ? `\u20B9${(estimatedCreditLimitValue / 1e7).toFixed(2)} Cr` : `\u20B9${(estimatedCreditLimitValue / 1e5).toFixed(2)} Lakhs`;
  const dimensions = [
    {
      key: "compliance",
      factor: "Statutory & Tax Compliance",
      rawScore: compScore,
      weight: 25,
      percentage: Math.round(compScore / 25 * 100),
      contribution: compScore >= 20 ? "positive" : "negative",
      status: compScore >= 20 ? "Strong" : compScore >= 15 ? "Satisfactory" : compScore >= 10 ? "Needs Attention" : "Critical",
      explanation: `GST: ${compliance.gstRegistered ? "Active (+10)" : "Missing (+0)"}, ITR: ${compliance.itrAvailable ? "Verified (+10)" : "Missing (+0)"}, Current Bank Account: ${compliance.hasBusinessBankAccount ? "Active (+5)" : "Missing (+0)"}.`,
      metricsSummary: `${compScore}/25 pts \u2014 ${compliance.gstRegistered ? "GST Registered" : "Unregistered"}, ${compliance.itrAvailable ? "ITR Available" : "No ITR"}`
    },
    {
      key: "stability",
      factor: "Financial Stability & Cash Flow",
      rawScore: finScore,
      weight: 25,
      percentage: Math.round(finScore / 25 * 100),
      contribution: finScore >= 18 ? "positive" : "negative",
      status: finScore >= 18 ? "Strong" : finScore >= 14 ? "Satisfactory" : finScore >= 8 ? "Needs Attention" : "Critical",
      explanation: `Operating Margin: ${fin.operatingMarginPercent !== null ? `${fin.operatingMarginPercent}% (${fin.operatingMarginPercent >= 12 ? "+10" : fin.operatingMarginPercent > 0 ? "+6" : "+0"})` : "None (+0)"}, Monthly Cash Generation: ${fin.monthlyNetCashFlow > 0 ? "Positive (+8)" : "Deficit (+0)"}, Debt Coverage: ${!norm.hasLoans ? "Debt-Free (+7)" : fin.dscr && fin.dscr >= 1.5 ? `DSCR ${fin.dscr}x (+7)` : fin.dscr && fin.dscr >= 1.2 ? `DSCR ${fin.dscr}x (+4)` : "Low DSCR (+0)"}.`,
      metricsSummary: `${finScore}/25 pts \u2014 Margin: ${fin.operatingMarginPercent ?? 0}%, Net Flow: \u20B9${(fin.monthlyNetCashFlow / 1e3).toFixed(0)}k/mo`
    },
    {
      key: "vintage",
      factor: "Business Vintage & Operating Scale",
      rawScore: trackScore,
      weight: 20,
      percentage: Math.round(trackScore / 20 * 100),
      contribution: trackScore >= 15 ? "positive" : "negative",
      status: trackScore >= 15 ? "Strong" : trackScore >= 11 ? "Satisfactory" : "Needs Attention",
      explanation: `Operational Age: ${hasVintage ? `${vintage} year(s) (${vintage >= 5 ? "+15" : vintage >= 3 ? "+12" : vintage >= 1 ? "+8" : "+4"})` : "Not provided (+4)"}, Declared Annual Turnover: \u20B9${(fin.annualRevenue / 1e5).toFixed(1)}L (${fin.annualRevenue >= 5e6 ? "+5" : fin.annualRevenue >= 25e5 ? "+3" : "+0"}).`,
      metricsSummary: `${trackScore}/20 pts \u2014 ${hasVintage ? `${vintage} Years Vintage` : "Vintage Not Provided"}, Turnover: \u20B9${(fin.annualRevenue / 1e5).toFixed(1)}L`
    },
    {
      key: "liquidity",
      factor: "Liquidity Buffer & Working Capital",
      rawScore: bufferScore,
      weight: 15,
      percentage: Math.round(bufferScore / 15 * 100),
      contribution: bufferScore >= 12 ? "positive" : "negative",
      status: bufferScore >= 12 ? "Strong" : bufferScore >= 8 ? "Satisfactory" : "Critical",
      explanation: `Cash Runway: ${fin.runwayMonths !== null ? `${fin.runwayMonths} month(s) (${fin.runwayMonths >= 4 ? "+8" : fin.runwayMonths >= 2 ? "+5" : "+0"})` : "No cash (+0)"}, Working Capital: ${fin.workingCapital > 0 ? `Positive \u20B9${(fin.workingCapital / 1e5).toFixed(1)}L (+7)` : `Deficit \u20B9${(fin.workingCapital / 1e5).toFixed(1)}L (+0)`}.`,
      metricsSummary: `${bufferScore}/15 pts \u2014 Runway: ${fin.runwayMonths ?? 0} Mo, Net WC: \u20B9${(fin.workingCapital / 1e5).toFixed(1)}L`
    },
    {
      key: "debt",
      factor: "Debt Capacity & Serviceability",
      rawScore: capacityScore,
      weight: 15,
      percentage: Math.round(capacityScore / 15 * 100),
      contribution: norm.hasLoans ? (fin.dscr ?? 0) >= 1.3 && (fin.debtToAnnualRevenue ?? 0) <= 0.5 ? "positive" : "negative" : "positive",
      status: capacityScore >= 12 ? "Strong" : capacityScore >= 8 ? "Satisfactory" : "Needs Attention",
      explanation: norm.hasLoans ? `Debt of \u20B9${(norm.outstandingLoanAmount / 1e5).toFixed(1)}L against turnover (${(fin.debtToAnnualRevenue ?? 0) > 0.6 ? "High leverage: +4" : (fin.debtToAnnualRevenue ?? 0) > 0.4 ? "Moderate leverage: +8" : "Low leverage: +12"}), Monthly EMI: \u20B9${(norm.monthlyEMI / 1e3).toFixed(0)}k/mo.` : "Zero active debt commitments. 100% debt capacity headroom available (+15).",
      metricsSummary: `${capacityScore}/15 pts \u2014 ${norm.hasLoans ? `Debt: \u20B9${(norm.outstandingLoanAmount / 1e5).toFixed(1)}L, DSCR: ${fin.dscr ? `${fin.dscr}x` : "N/A"}` : "Debt-Free"}`
    }
  ];
  const candidateStrengths = [];
  if (fin.operatingMarginPercent !== null && fin.operatingMarginPercent >= 15) {
    candidateStrengths.push(`Strong operating profitability with ${fin.operatingMarginPercent}% EBITDA margin.`);
  }
  if (fin.monthlyNetCashFlow > 0) {
    candidateStrengths.push(`Positive monthly net cash generation of \u20B9${(fin.monthlyNetCashFlow / 1e3).toFixed(0)}k/mo supports debt repayment.`);
  }
  if (!norm.hasLoans) {
    candidateStrengths.push("Debt-free balance sheet provides unencumbered borrowing headroom with zero monthly EMI drag.");
  } else if (fin.dscr && fin.dscr >= 1.5) {
    candidateStrengths.push(`Comfortable Debt Service Coverage Ratio (DSCR) of ${fin.dscr}x exceeds standard lender benchmark (1.30x).`);
  }
  if (compliance.gstRegistered && compliance.itrAvailable && compliance.hasBusinessBankAccount) {
    candidateStrengths.push("Complete statutory tax compliance across GST, ITR, and dedicated business current account.");
  }
  if ((fin.runwayMonths ?? 0) >= 3) {
    candidateStrengths.push(`Healthy liquidity buffer of ${fin.runwayMonths} months provides operational safety margin.`);
  }
  if (vintage >= 3) {
    candidateStrengths.push(`Established operational track record of ${vintage} years qualifies for prime PSU bank schemes.`);
  }
  if (fin.workingCapital > 0) {
    candidateStrengths.push(`Positive working capital balance of \u20B9${(fin.workingCapital / 1e5).toFixed(1)}L demonstrates balance sheet stability.`);
  }
  const strengths = candidateStrengths.slice(0, 5);
  const candidateGaps = [];
  if (norm.hasLoans && (fin.dscr ?? 0) < 1.3) {
    candidateGaps.push(`Constrained debt coverage: DSCR of ${fin.dscr ?? "N/A"}x falls below the 1.30x institutional benchmark.`);
  }
  if (norm.hasLoans && (fin.emiBurdenRatio ?? 0) > 20) {
    candidateGaps.push(`Elevated debt servicing: Monthly EMI absorbs ${Math.round(fin.emiBurdenRatio ?? 0)}% of monthly turnover.`);
  }
  if ((fin.runwayMonths ?? 0) < 2.5) {
    candidateGaps.push(`Short liquidity buffer: Cash reserves support only ${fin.runwayMonths ?? "less than 1"} month(s) of operations.`);
  }
  if (norm.accountsReceivable > fin.monthlyRevenue * 0.9 && norm.accountsReceivable > 0) {
    candidateGaps.push(`High receivables lockup: \u20B9${(norm.accountsReceivable / 1e5).toFixed(1)}L tied up in customer credit.`);
  }
  if (!compliance.gstRegistered) {
    candidateGaps.push("GST registration is not recorded, restricting access to formal institutional lending and CGTMSE schemes.");
  }
  if (!compliance.itrAvailable) {
    candidateGaps.push("Income Tax Returns (ITR) are not available, which lenders require for formal underwriting.");
  }
  if (fin.monthlyNetCashFlow <= 0) {
    candidateGaps.push("Negative monthly cash flow (cash burn) requires operational stabilization prior to new borrowing.");
  }
  if (fin.operatingMarginPercent !== null && fin.operatingMarginPercent < 10) {
    candidateGaps.push(`Low EBITDA margin (${fin.operatingMarginPercent}%) leaves minimal operating cushion for loan interest.`);
  }
  const gaps = candidateGaps.slice(0, 5);
  const actionPlan = [];
  if (norm.hasLoans && (fin.dscr ?? 0) < 1.3) {
    actionPlan.push({
      issue: `Constrained Debt Coverage (DSCR: ${fin.dscr ?? "N/A"}x)`,
      whyItMatters: "Lenders require minimum 1.30x DSCR to ensure regular principal and interest servicing without default risk.",
      action: "Improve operating margins through pricing reviews, or restructure facilities from 36 to 60 months to lower monthly EMI.",
      impact: "Restores DSCR above 1.35x benchmark",
      priority: "HIGH"
    });
  }
  if (norm.accountsReceivable > fin.monthlyRevenue * 0.9 && norm.accountsReceivable > 0) {
    actionPlan.push({
      issue: `Customer Receivables Overhang (\u20B9${(norm.accountsReceivable / 1e5).toFixed(1)}L)`,
      whyItMatters: "Delayed customer collections create working capital pressure and inflate debt requirements.",
      action: "Prioritize collections on 60+ day aging invoices or register on RBI-approved TReDS portals for 48-hour invoice discounting.",
      impact: `Unlocks up to \u20B9${(norm.accountsReceivable * 0.8 / 1e5).toFixed(1)}L in cash`,
      priority: "HIGH"
    });
  }
  if ((fin.runwayMonths ?? 0) < 2.5) {
    actionPlan.push({
      issue: `Constrained Liquidity Runway (${fin.runwayMonths ?? 0} Mo)`,
      whyItMatters: "Banks consider thin cash balances a significant vulnerability during revenue fluctuations.",
      action: "Postpone discretionary CAPEX and retain operating surplus until reaching a 90-day cash operating reserve.",
      impact: "Boosts liquidity pillar by up to 10 points",
      priority: "HIGH"
    });
  }
  if (!compliance.gstRegistered || !compliance.itrAvailable) {
    actionPlan.push({
      issue: "Statutory Tax Filing Incompleteness",
      whyItMatters: "PSU banks and CGTMSE guarantee schemes mandate minimum 2 years of formal GSTR-3B and ITR records.",
      action: "Register for GST and ensure past two financial years of audited ITR returns are readily accessible in digital format.",
      impact: "Unlocks subsidized MSME lending schemes",
      priority: "HIGH"
    });
  }
  if (fin.monthlyNetCashFlow <= 0) {
    actionPlan.push({
      issue: "Negative Monthly Cash Flow",
      whyItMatters: "Taking new loans while operating at a monthly cash deficit accelerates insolvency risk.",
      action: "Re-align direct material costs and monthly OPEX with current sales run rate before seeking debt expansion.",
      impact: "Restores positive monthly cash flow",
      priority: "MEDIUM"
    });
  }
  if (actionPlan.length === 0) {
    actionPlan.push({
      issue: "Profile Maintenance & Readiness",
      whyItMatters: "Strong profile enables negotiation of preferential interest spreads with PSU and private lenders.",
      action: "Compile last 6 months current bank statements and GSTR-3B returns to prepare formal application dossiers.",
      impact: "Fast-tracks sanction timeline by 2\u20133 weeks",
      priority: "LOW"
    });
  }
  const preparationChecklist = [
    {
      id: "reg_details",
      category: "Identity",
      title: "Business Registration & Structure",
      status: org.businessProfile?.businessName && org.businessProfile?.businessType ? "provided" : "incomplete",
      details: org.businessProfile?.businessType ? `${org.businessProfile.businessType} structure recorded` : "Structure details missing"
    },
    {
      id: "gst_info",
      category: "Taxation",
      title: "GST Registration (GSTR-1 & 3B)",
      status: compliance.gstRegistered ? "provided" : "not_provided",
      details: compliance.gstRegistered ? "GST registration indicated as active" : "GST registration not recorded"
    },
    {
      id: "itr_info",
      category: "Taxation",
      title: "Income Tax Returns (ITR / Audits)",
      status: compliance.itrAvailable ? "provided" : "not_provided",
      details: compliance.itrAvailable ? "Formal ITR availability indicated" : "ITR filings not recorded"
    },
    {
      id: "bank_account",
      category: "Banking",
      title: "Business Current Bank Account",
      status: compliance.hasBusinessBankAccount ? "provided" : "not_provided",
      details: compliance.hasBusinessBankAccount ? "Dedicated current business bank account confirmed" : "Business current account not recorded"
    },
    {
      id: "fin_statements",
      category: "Financials",
      title: "Operating Financial Records",
      status: fin.monthlyRevenue > 0 && fin.totalMonthlyExpenses > 0 ? "provided" : "incomplete",
      details: fin.monthlyRevenue > 0 ? `Monthly Revenue: \u20B9${(fin.monthlyRevenue / 1e5).toFixed(1)}L, OPEX: \u20B9${(fin.totalMonthlyExpenses / 1e5).toFixed(1)}L` : "Financial numbers not provided"
    },
    {
      id: "loan_records",
      category: "Leverage",
      title: "Existing Loan & EMI Schedule",
      status: norm.hasLoans ? norm.outstandingLoanAmount > 0 && norm.monthlyEMI > 0 ? "provided" : "incomplete" : "provided",
      details: norm.hasLoans ? `Outstanding: \u20B9${(norm.outstandingLoanAmount / 1e5).toFixed(1)}L, EMI: \u20B9${(norm.monthlyEMI / 1e3).toFixed(0)}k/mo` : "Business recorded as debt-free"
    },
    {
      id: "wc_records",
      category: "Working Capital",
      title: "Receivables & Payables Ledger",
      status: norm.accountsReceivable > 0 || norm.accountsPayable > 0 ? "provided" : "incomplete",
      details: norm.accountsReceivable > 0 ? `AR: \u20B9${(norm.accountsReceivable / 1e5).toFixed(1)}L, AP: \u20B9${(norm.accountsPayable / 1e5).toFixed(1)}L` : "Working capital ledger details not provided"
    },
    {
      id: "vintage_record",
      category: "Track Record",
      title: "Business Vintage Documentation",
      status: hasVintage ? "provided" : "not_provided",
      details: hasVintage ? `Established in ${establishedYear} (${vintage} years track record)` : "Year of establishment not provided"
    },
    {
      id: "compliance_dossier",
      category: "Compliance",
      title: "Statutory Compliance Documentation",
      status: compliance.gstRegistered && compliance.itrAvailable && compliance.hasBusinessBankAccount ? "provided" : "incomplete",
      details: compliance.gstRegistered && compliance.itrAvailable ? "Statutory documents declared complete" : "Statutory documents incomplete"
    }
  ];
  let debtStatus = "Healthy";
  let debtAssessmentNote = "";
  if (!norm.hasLoans) {
    debtStatus = "Healthy";
    debtAssessmentNote = `Business operates debt-free with zero EMI drag. Unencumbered cash generation supports indicative borrowing headroom up to ${formattedLimit} without existing debt overhang.`;
  } else if ((fin.dscr ?? 0) >= 1.4 && (fin.emiBurdenRatio ?? 0) <= 20) {
    debtStatus = "Healthy";
    debtAssessmentNote = `Current DSCR of ${fin.dscr}x and EMI burden of ${Math.round(fin.emiBurdenRatio ?? 0)}% represent a comfortable debt capacity for facility renewal or modest term debt expansion.`;
  } else if ((fin.dscr ?? 0) >= 1.15) {
    debtStatus = "Moderate";
    debtAssessmentNote = `Moderate debt capacity: DSCR of ${fin.dscr ?? "N/A"}x indicates debt service is viable but leaves limited operating cushion. Facility restructuring is recommended before additional borrowing.`;
  } else {
    debtStatus = "Needs Attention";
    debtAssessmentNote = `Elevated debt servicing strain: Current EMI commitments absorb ${Math.round(fin.emiBurdenRatio ?? 0)}% of revenue. Focus on cash flow stabilization before seeking new loan facilities.`;
  }
  const debtAssessment = {
    currentEmi: norm.monthlyEMI,
    annualDebtService: norm.monthlyEMI * 12,
    dscr: fin.dscr,
    debtToRevenue: fin.debtToAnnualRevenue,
    emiBurdenPercent: fin.emiBurdenRatio !== null ? Math.round(fin.emiBurdenRatio) : null,
    status: debtStatus,
    assessmentNote: debtAssessmentNote
  };
  let strategyRec = "Consider improving profile first";
  let strategyTiming = "Improve First";
  let strategyRationale = "";
  let keyPrereq = "";
  if (overallScore >= 70 && (fin.dscr === null || fin.dscr >= 1.35) && fin.monthlyNetCashFlow > 0 && compliance.gstRegistered) {
    strategyRec = "Potentially suitable for further preparation";
    strategyTiming = "Ready to Prepare";
    strategyRationale = "Your financial stability, positive operating cash flow, and debt coverage indicate that your profile is well-positioned to assemble formal bank application dossiers.";
    keyPrereq = "Prepare last 6 months business current account statements and audited P&L for sanction submission.";
  } else if (overallScore >= 45 && fin.monthlyNetCashFlow > 0) {
    strategyRec = "Consider improving profile first";
    strategyTiming = "Improve First";
    strategyRationale = "Your business demonstrates core operating viability, but key gaps (such as DSCR headroom, compliance records, or liquidity buffer) should be strengthened to secure favorable terms.";
    keyPrereq = "Execute the top recommendation in your Funding Action Plan before filing applications.";
  } else {
    strategyRec = "Funding profile currently needs attention";
    strategyTiming = "Needs Attention";
    strategyRationale = "Current operating cash flow constraints or high leverage represent elevated borrowing risk. Focus on operational turnaround and cash collection before taking on new debt.";
    keyPrereq = "Restore positive monthly operating net cash flow and resolve statutory compliance gaps.";
  }
  const fundingStrategy = {
    recommendation: strategyRec,
    timing: strategyTiming,
    rationale: strategyRationale,
    keyPrerequisite: keyPrereq
  };
  const bankMatches = [
    {
      bank: "State Bank of India (SBI)",
      product: "SME Gold & CGTMSE Scheme (Illustrative)",
      maxLoan: formattedLimit,
      rate: overallScore >= 75 ? "8.65% p.a. (Illustrative rate)" : "9.25% p.a. (Illustrative rate)",
      match: `${Math.min(98, Math.max(65, overallScore + 5))}% Fit`,
      fastTrack: compliance.gstRegistered && compliance.itrAvailable,
      reason: compliance.gstRegistered ? "GST registered with active business vintage qualifies for subsidized CGTMSE credit." : "Requires formal GST registration for fast-track sanction."
    },
    {
      bank: "SIDBI",
      product: "Direct Make-in-India Assistance (Illustrative)",
      maxLoan: `\u20B9${(Math.max(25e5, estimatedCreditLimitValue * 1.5) / 1e5).toFixed(0)} Lakhs`,
      rate: "8.25% p.a. (Illustrative rate)",
      match: `${Math.min(95, Math.max(60, overallScore))}% Fit`,
      fastTrack: vintage >= 3 && fin.monthlyNetCashFlow > 0,
      reason: vintage >= 3 ? "Business vintage >= 3 years meets SIDBI direct lending criteria." : "SIDBI prefers businesses with 3+ years of audited operational track record."
    },
    {
      bank: "HDFC Bank",
      product: "SmartUp Working Capital OD (Illustrative)",
      maxLoan: formattedLimit,
      rate: overallScore >= 75 ? "9.10% p.a. (Illustrative rate)" : "9.80% p.a. (Illustrative rate)",
      match: `${Math.min(94, Math.max(62, overallScore - 2))}% Fit`,
      fastTrack: compliance.hasBusinessBankAccount,
      reason: `Structured overdraft linked to monthly business banking turnover of \u20B9${(fin.monthlyRevenue / 1e5).toFixed(1)}L.`
    },
    {
      bank: "ICICI Bank",
      product: "InstaBIZ Working Capital Line (Illustrative)",
      maxLoan: `\u20B9${(Math.min(5e6, estimatedCreditLimitValue) / 1e5).toFixed(0)} Lakhs`,
      rate: "9.45% p.a. (Illustrative rate)",
      match: `${Math.min(92, Math.max(60, overallScore - 4))}% Fit`,
      fastTrack: compliance.gstRegistered,
      reason: "Indicative digital working capital line subject to formal GSTR-3B assessment."
    }
  ];
  const pillars = [
    {
      name: "Statutory & Tax Compliance",
      score: Math.round(compScore / 25 * 100),
      maxScore: 100,
      status: compScore >= 20 ? "Strong" : compScore >= 15 ? "Satisfactory" : "Needs Attention",
      description: "Evaluates GST filing consistency, verified ITR filings, and business banking discipline.",
      impactOnInterestRate: compScore >= 20 ? "-0.75% discount" : "+0.50% risk premium",
      actionItems: [
        !compliance.gstRegistered ? "Register for GST to unlock institutional MSME lending." : "Maintain timely GSTR-1 & 3B filings.",
        !compliance.itrAvailable ? "Ensure 2 years of formal ITR filings are up to date." : "Keep audited computation sheets accessible."
      ]
    },
    {
      name: "Cash Flow & Debt Serviceability",
      score: Math.round(finScore / 25 * 100),
      maxScore: 100,
      status: finScore >= 18 ? "Strong" : finScore >= 12 ? "Satisfactory" : "Needs Attention",
      description: "Measures operating cash generation and ability to service loan principal + interest.",
      impactOnInterestRate: finScore >= 18 ? "-0.50% discount" : "+0.75% risk premium",
      actionItems: [
        (fin.dscr ?? 2) < 1.3 ? "Improve DSCR above 1.35x before applying for new term facilities." : "DSCR supports higher working capital limits.",
        fin.monthlyNetCashFlow <= 0 ? "Address monthly operating cash burn." : "Net positive cash flow confirmed."
      ]
    },
    {
      name: "Business Vintage & Operational Scale",
      score: Math.round(trackScore / 20 * 100),
      maxScore: 100,
      status: trackScore >= 15 ? "Strong" : trackScore >= 10 ? "Satisfactory" : "Needs Attention",
      description: "Reflects operating years, employee headcount, and annualized revenue turnover.",
      impactOnInterestRate: trackScore >= 15 ? "-0.25% discount" : "+0.25% spread",
      actionItems: [
        vintage < 3 ? "Target CGTMSE or early-stage collateral-free loans (<3 years vintage)." : "Vintage >= 3 years qualifies for prime PSU bank rates."
      ]
    },
    {
      name: "Working Capital & Liquidity Buffer",
      score: Math.round(bufferScore / 15 * 100),
      maxScore: 100,
      status: bufferScore >= 12 ? "Strong" : bufferScore >= 8 ? "Satisfactory" : "Critical",
      description: "Checks liquid cash reserves, debtor cycles, and inventory turnover efficiency.",
      impactOnInterestRate: bufferScore >= 12 ? "Standard Prime Rate" : "+0.50% liquidity buffer premium",
      actionItems: [
        fin.workingCapital < 0 ? "Inject working capital or shorten receivable recovery days." : "Working capital adequacy confirmed."
      ]
    },
    {
      name: "Existing Debt & Leverage Health",
      score: Math.round(capacityScore / 15 * 100),
      maxScore: 100,
      status: capacityScore >= 12 ? "Strong" : capacityScore >= 8 ? "Satisfactory" : "Critical",
      description: "Ratio of total outstanding debt compared to annual revenue turnover.",
      impactOnInterestRate: capacityScore >= 12 ? "-0.25% discount" : "+0.75% leverage load",
      actionItems: [
        norm.hasLoans ? "Maintain clean EMI repayment track record without single 30+ DPD delays." : "Zero debt profile provides unencumbered borrowing headroom."
      ]
    }
  ];
  const actionItems = actionPlan.map((a) => a.action);
  return {
    overallScore,
    eligibilityTier,
    estimatedCreditLimit: formattedLimit,
    estimatedCreditLimitValue,
    pillars,
    bankMatches,
    strengths,
    gaps,
    actionItems,
    dimensions,
    actionPlan,
    preparationChecklist,
    debtAssessment,
    fundingStrategy
  };
}
function generateCashFlowForecast(norm, fin) {
  const months = ["Current (Actual)", "Month +1", "Month +2", "Month +3", "Month +4", "Month +5", "Month +6"];
  const dataPoints = [];
  const baseInflow = norm.monthlyRevenue;
  const baseOutflow = fin.totalMonthlyExpenses + norm.monthlyEMI;
  const baseNet = baseInflow - baseOutflow;
  dataPoints.push({
    period: months[0],
    actualInflow: baseInflow,
    actualOutflow: baseOutflow,
    netCash: baseNet,
    predictedInflow: baseInflow,
    predictedOutflow: baseOutflow,
    predictedNetCash: baseNet,
    confidenceLower: baseNet,
    confidenceUpper: baseNet
  });
  let runningCash = norm.currentCashBalance;
  let hasRunwayWarning = false;
  for (let i = 1; i <= 6; i++) {
    const trendFactor = 1 + i * 0.015;
    const predInflow = Math.round(baseInflow * trendFactor);
    const predOutflow = Math.round(baseOutflow * (1 + i * 8e-3));
    const predNet = predInflow - predOutflow;
    runningCash += predNet;
    if (runningCash < baseOutflow * 0.5) {
      hasRunwayWarning = true;
    }
    const variance = Math.round(Math.abs(predNet) * 0.15 + baseInflow * 0.05);
    dataPoints.push({
      period: months[i],
      netCash: predNet,
      predictedInflow: predInflow,
      predictedOutflow: predOutflow,
      predictedNetCash: predNet,
      confidenceLower: predNet - variance,
      confidenceUpper: predNet + variance
    });
  }
  let cashBufferStatus = "Safe";
  if (runningCash < 0 || fin.runwayMonths && fin.runwayMonths < 1.5) {
    cashBufferStatus = "Critical";
  } else if (fin.runwayMonths && fin.runwayMonths < 3) {
    cashBufferStatus = "Vulnerable";
  } else if (fin.runwayMonths && fin.runwayMonths < 5) {
    cashBufferStatus = "Adequate";
  }
  const warningMessage = hasRunwayWarning ? `Warning: Cash reserves are projected to dip below safe 30-day operating requirements within the next 90 days.` : void 0;
  return {
    dataPoints,
    historicalMonthlyAverage: baseInflow,
    projectedRunwayMonths: fin.runwayMonths,
    hasRunwayWarning,
    warningMessage,
    cashBufferStatus
  };
}
function generateGrowthObservations(org, norm, fin, health) {
  const risks = [];
  const recommendations = [];
  const suggestedPlaybookCategories = [];
  if (norm.accountsReceivable > norm.monthlyRevenue * 1.5) {
    risks.push(`Receivables of \u20B9${(norm.accountsReceivable / 1e5).toFixed(1)}L exceed 45-day sales turnover, trapping liquid working capital.`);
    recommendations.push("Implement a structured 15-day debtor payment follow-up schedule or offer 1.5% early payment cash discounts.");
    suggestedPlaybookCategories.push("Working Capital");
  }
  if (fin.operatingMarginPercent !== null && fin.operatingMarginPercent < 10) {
    risks.push(`Low operating margin (${fin.operatingMarginPercent}%) leaves minimal safety buffer against raw material price inflation.`);
    recommendations.push("Review unit-level economics; renegotiate bulk vendor pricing or institute selective 5-8% price adjustments on key lines.");
    suggestedPlaybookCategories.push("Pricing");
  }
  if (fin.monthlyNetCashFlow < 0) {
    risks.push(`Operating at a monthly net deficit of \u20B9${(Math.abs(fin.monthlyNetCashFlow) / 1e5).toFixed(1)}L per month.`);
    recommendations.push("Enact non-essential OPEX freeze immediately to extend existing cash runway.");
    suggestedPlaybookCategories.push("Working Capital");
  }
  if (norm.hasLoans && fin.emiBurdenRatio && fin.emiBurdenRatio > 25) {
    risks.push(`Monthly EMI commitments consume ${fin.emiBurdenRatio}% of gross monthly sales, straining operational flexibility.`);
    recommendations.push("Consider loan restructuring or tenure extension under CGTMSE to reduce monthly debt outflow.");
  }
  if (!org.complianceProfile?.gstRegistered || !org.complianceProfile?.itrAvailable) {
    risks.push("Missing statutory GST/ITR documentation restricts access to formal institutional banking credit.");
    recommendations.push("Complete GST and ITR formalization to establish verifiable institutional credit history.");
  }
  if (risks.length === 0) {
    risks.push("Concentration risk: Ensure sales volume is not overly reliant on top 2 clients.");
    recommendations.push("Explore expansion into complementary geographical markets using surplus working capital.");
    suggestedPlaybookCategories.push("Market Expansion");
  }
  return {
    keyRisks: risks,
    recommendations,
    suggestedPlaybookCategories
  };
}
function evaluateCompliance(org) {
  const comp = org.complianceProfile || {};
  const gst = !!comp.gstRegistered;
  const itr = !!comp.itrAvailable;
  const bank = !!comp.hasBusinessBankAccount;
  let score = 0;
  const missingItems = [];
  if (gst) score += 40;
  else missingItems.push("GST Registration");
  if (itr) score += 40;
  else missingItems.push("Audited / Filed ITR");
  if (bank) score += 20;
  else missingItems.push("Current Business Bank Account");
  return {
    gstRegistered: gst,
    itrAvailable: itr,
    hasBusinessBankAccount: bank,
    complianceScore: score,
    isFullyCompliant: score === 100,
    missingItems
  };
}
function analyzeOrganization(org) {
  const normalized = normalizeOrganizationData(org);
  const financials = calculateFinancialMetrics(normalized);
  const health = evaluateFinancialHealth(normalized, financials);
  const funding = evaluateFundingReadiness(org, normalized, financials, health.overallScore);
  const cashFlow = generateCashFlowForecast(normalized, financials);
  const growth = generateGrowthObservations(org, normalized, financials, health);
  const compliance = evaluateCompliance(org);
  const vintageYears = Math.max(
    0,
    (/* @__PURE__ */ new Date()).getFullYear() - (safeNumber(org.businessProfile?.yearEstablished) || (/* @__PURE__ */ new Date()).getFullYear())
  );
  return {
    organizationId: org.id,
    organizationName: org.name || org.businessProfile?.businessName || "Business Profile",
    businessType: org.businessProfile?.businessType || "MSME",
    industry: org.businessProfile?.industry || "Enterprise",
    location: org.businessProfile?.location || "India",
    vintageYears,
    employees: safeNumber(org.businessProfile?.numberOfEmployees),
    annualTurnoverDeclared: safeNumber(org.businessProfile?.annualTurnover),
    normalized,
    financials,
    health,
    funding,
    cashFlow,
    growth,
    compliance,
    goals: org.goals || { goals: [], biggestChallenge: null },
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function analyzeBusiness(org, _profile) {
  return analyzeOrganization(org);
}
export {
  analyzeBusiness,
  analyzeOrganization,
  calculateFinancialMetrics,
  evaluateCompliance,
  evaluateFinancialHealth,
  evaluateFundingReadiness,
  generateCashFlowForecast,
  generateGrowthObservations,
  normalizeOrganizationData
};
