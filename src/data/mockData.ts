import { 
  MSMEProfile, 
  FinancialHealthMetric, 
  CashFlowDataPoint, 
  FundingPillar, 
  GrowthPlaybook, 
  ReportItem 
} from '../types';

export const PROFILES: MSMEProfile[] = [
  {
    id: 'shree-ganesh-agro',
    name: 'Shree Ganesh Agro Foods',
    industry: 'Food Processing & Spices',
    sector: 'Agri-Processing MSME',
    udyamNumber: 'UDYAM-MH-19-0048291',
    gstin: '27AABCS1429B1ZX',
    incorporationYear: 2018,
    location: 'Nashik, Maharashtra',
    employees: 28,
    turnover: '₹4.85 Cr / yr',
    creditScore: 768,
    healthScore: 82,
    fundingReadinessScore: 74,
    revenueGrowth: 12.4,
    cashFlowStability: 89,
    loanEligibility: 'High',
    estimatedCreditLimit: '₹85.00 Lakhs',
    dscrRatio: 1.84,
    runwayMonths: 7.2
  },
  {
    id: 'apex-precision',
    name: 'Apex Precision Engineering Pvt Ltd',
    industry: 'Automotive & CNC Components',
    sector: 'Light Engineering MSME',
    udyamNumber: 'UDYAM-MH-26-0091834',
    gstin: '27AAACA9921D1ZB',
    incorporationYear: 2015,
    location: 'Bhosari MIDC, Pune',
    employees: 45,
    turnover: '₹9.40 Cr / yr',
    creditScore: 792,
    healthScore: 88,
    fundingReadinessScore: 81,
    revenueGrowth: 16.8,
    cashFlowStability: 92,
    loanEligibility: 'High',
    estimatedCreditLimit: '₹1.75 Cr',
    dscrRatio: 2.15,
    runwayMonths: 9.5
  },
  {
    id: 'kavita-textiles',
    name: 'Kavita Handlooms & Apparels',
    industry: 'Organic Cotton & Sustainable Apparel',
    sector: 'Textile D2C & Export MSME',
    udyamNumber: 'UDYAM-TN-03-0023412',
    gstin: '33AABCK8841M1ZY',
    incorporationYear: 2020,
    location: 'Tiruppur, Tamil Nadu',
    employees: 19,
    turnover: '₹2.90 Cr / yr',
    creditScore: 720,
    healthScore: 76,
    fundingReadinessScore: 68,
    revenueGrowth: 21.5,
    cashFlowStability: 74,
    loanEligibility: 'Medium',
    estimatedCreditLimit: '₹40.00 Lakhs',
    dscrRatio: 1.42,
    runwayMonths: 4.8
  }
];

export const FINANCIAL_HEALTH_METRICS: FinancialHealthMetric[] = [
  {
    category: 'Revenue Stability',
    score: 86,
    weight: 25,
    status: 'Healthy',
    insight: 'Top 3 clients account for 38% of revenue. Diversification has improved by 14% year-on-year.',
    recommendation: 'Maintain non-reliance on single buyers; add 2 distributor channels in Western zone.'
  },
  {
    category: 'Operating Profitability',
    score: 79,
    weight: 25,
    status: 'Healthy',
    insight: 'EBITDA margin currently at 16.8% (industry median: 14.2%). Net profit margin holds at 9.4%.',
    recommendation: 'Optimize power & cold-storage consumption to gain an estimated 1.2% additional margin.'
  },
  {
    category: 'Liquidity & Working Capital',
    score: 84,
    weight: 25,
    status: 'Healthy',
    insight: 'Current ratio is 1.78x with a Quick Ratio of 1.15x. Cash runway sits at 7.2 months of fixed OPEX.',
    recommendation: 'Collect receivables at 45 days rather than current 58 days to unlock ₹8.4L in liquid reserves.'
  },
  {
    category: 'Expense Efficiency',
    score: 78,
    weight: 25,
    status: 'Moderate',
    insight: 'Raw material procurement costs surged 7.1% during Q2 seasonal spikes, impacting gross margins.',
    recommendation: 'Implement advance spot-buying contracts with farmer producer collectives to hedge raw costs.'
  }
];

export const REVENUE_EXPENSE_DATA = [
  { month: 'Apr', revenue: 36.2, expense: 29.8, profit: 6.4, cashFlow: 5.2 },
  { month: 'May', revenue: 38.5, expense: 30.2, profit: 8.3, cashFlow: 6.8 },
  { month: 'Jun', revenue: 41.0, expense: 32.5, profit: 8.5, cashFlow: 7.1 },
  { month: 'Jul', revenue: 39.8, expense: 33.1, profit: 6.7, cashFlow: 5.9 },
  { month: 'Aug', revenue: 43.4, expense: 34.0, profit: 9.4, cashFlow: 8.2 },
  { month: 'Sep', revenue: 45.2, expense: 35.8, profit: 9.4, cashFlow: 8.0 },
  { month: 'Oct', revenue: 47.8, expense: 37.0, profit: 10.8, cashFlow: 9.4 },
  { month: 'Nov', revenue: 51.2, expense: 39.5, profit: 11.7, cashFlow: 10.2 },
  { month: 'Dec', revenue: 53.0, expense: 41.2, profit: 11.8, cashFlow: 10.5 },
  { month: 'Jan', revenue: 49.5, expense: 39.0, profit: 10.5, cashFlow: 8.9 },
  { month: 'Feb', revenue: 52.8, expense: 40.5, profit: 12.3, cashFlow: 11.1 },
  { month: 'Mar', revenue: 56.4, expense: 42.8, profit: 13.6, cashFlow: 12.4 }
];

export const CASH_FLOW_FORECAST_DATA: CashFlowDataPoint[] = [
  { period: 'Jan (Hist)', actualInflow: 49.5, actualOutflow: 39.0, netCash: 10.5 },
  { period: 'Feb (Hist)', actualInflow: 52.8, actualOutflow: 40.5, netCash: 12.3 },
  { period: 'Mar (Hist)', actualInflow: 56.4, actualOutflow: 42.8, netCash: 13.6 },
  { period: 'Apr (Pred)', netCash: 12.8, predictedInflow: 57.2, predictedOutflow: 44.4, predictedNetCash: 12.8, confidenceLower: 10.2, confidenceUpper: 15.1 },
  { period: 'May (Pred)', netCash: 11.2, predictedInflow: 58.5, predictedOutflow: 47.3, predictedNetCash: 11.2, confidenceLower: 8.5, confidenceUpper: 14.0 },
  { period: 'Jun (Pred)', netCash: 6.4, predictedInflow: 54.0, predictedOutflow: 47.6, predictedNetCash: 6.4, confidenceLower: 3.1, confidenceUpper: 9.8 },
  { period: 'Jul (Pred)', netCash: 14.5, predictedInflow: 62.0, predictedOutflow: 47.5, predictedNetCash: 14.5, confidenceLower: 11.0, confidenceUpper: 18.2 },
  { period: 'Aug (Pred)', netCash: 16.2, predictedInflow: 65.5, predictedOutflow: 49.3, predictedNetCash: 16.2, confidenceLower: 12.5, confidenceUpper: 19.9 },
  { period: 'Sep (Pred)', netCash: 17.8, predictedInflow: 68.0, predictedOutflow: 50.2, predictedNetCash: 17.8, confidenceLower: 13.8, confidenceUpper: 21.6 }
];

export const FUNDING_PILLARS: FundingPillar[] = [
  {
    name: 'Documentation & Compliance',
    score: 88,
    maxScore: 100,
    status: 'Strong',
    description: 'GST-3B & GSTR-1 filed on time (100% on-time record in last 24 months). Audited balance sheets with zero auditor qualifications.',
    impactOnInterestRate: '-0.40% interest discount eligibility',
    actionItems: [
      'Upload updated Udyam registration re-classification certificate',
      'Maintain automated e-invoicing link with GSTN'
    ]
  },
  {
    name: 'Revenue Consistency',
    score: 78,
    maxScore: 100,
    status: 'Satisfactory',
    description: 'Compound Monthly Growth Rate (CMGR) is 2.1%. Low seasonality volatility (standard deviation 6.8%).',
    impactOnInterestRate: 'Unlocks ₹25L additional working capital headroom',
    actionItems: [
      'Reduce top 2 customer concentration from 26% to under 20%',
      'Formalize long-term purchase contracts (3+ quarters)'
    ]
  },
  {
    name: 'Credit & Repayment Behaviour',
    score: 82,
    maxScore: 100,
    status: 'Strong',
    description: 'Commercial CIBIL Rank is CMR-3 (Low Risk). Zero Days Past Due (DPD) on past machinery term loans in 36 months.',
    impactOnInterestRate: 'Fast-track approval under PSB59 & CGTMSE guarantee',
    actionItems: [
      'Close 1 inactive overdraft facility to reduce contingent liability footprint'
    ]
  },
  {
    name: 'Business Stability & Working Capital',
    score: 64,
    maxScore: 100,
    status: 'Needs Attention',
    description: 'Working capital cycle currently stretches to 72 days (Receivables 58 days + Inventory 34 days - Payables 20 days).',
    impactOnInterestRate: 'May require 15% extra collateral without improvement',
    actionItems: [
      'Adopt TReDS invoice discounting to shrink receivables cycle to 25 days',
      'Negotiate 40-day credit terms with top 3 packaging vendors'
    ]
  },
  {
    name: 'Growth Potential & Unit Economics',
    score: 76,
    maxScore: 100,
    status: 'Satisfactory',
    description: 'Gross margin at 34.2%. Addressable market expanding by 18% YoY with entry into retail modern trade.',
    impactOnInterestRate: 'Qualifies for Startup India / SIDBI venture debt',
    actionItems: [
      'Document customer retention cohorts to demonstrate sticky B2B demand'
    ]
  }
];

export const GROWTH_PLAYBOOKS: GrowthPlaybook[] = [
  {
    id: 'gp-1',
    category: 'Working Capital',
    title: 'TReDS Bill Discounting Integration',
    roiPotential: '+₹14.2 Lakhs liquid cash released',
    implementationTime: '10-14 Days',
    difficulty: 'Easy',
    description: 'Onboard your B2B corporate buyer invoices to RXIL/Invoicemart TReDS platforms to get funds within 48 hours at 7.5-8.5% interest instead of waiting 60 days.',
    aiRationale: 'Your average debtor cycle is 58 days on ₹1.2 Cr receivables. Discounting Tier-1 corporate buyers frees cash instantly with zero collateral burden.',
    actionSteps: [
      'Obtain TReDS registration via Udyam portal link',
      'Upload verified GST invoices for top 3 enterprise corporate buyers',
      'Set automated auto-acceptance bids from participating public sector banks'
    ]
  },
  {
    id: 'gp-2',
    category: 'Pricing',
    title: 'Value-Tier SKU Repricing & Bulk Surcharge Optimization',
    roiPotential: '+3.8% Net EBITDA expansion',
    implementationTime: '2-3 Weeks',
    difficulty: 'Medium',
    description: 'Increase wholesale pricing on top 2 high-inelastic spice SKUs by 6.5% while offering 2% prompt-payment discount for sub-15 day clearances.',
    aiRationale: 'BizPilot AI elasticity analysis shows price sensitivity for your organic-grade category is low (-0.42). Competitors raised prices by 8% in Q1.',
    actionSteps: [
      'Update wholesale catalog rate card for 500g and 1kg institutional packs',
      'Attach 2% cash discount incentive clause on invoices paid within 10 days',
      'Track gross margin shift over the first 30 days post-revision'
    ]
  },
  {
    id: 'gp-3',
    category: 'Inventory',
    title: 'Just-In-Time Raw Material Buffer Optimization',
    roiPotential: 'Save ₹6.5 Lakhs in carrying & spoilage costs',
    implementationTime: '15 Days',
    difficulty: 'Medium',
    description: 'Transition from 45-day raw material batch buffer to 22-day synchronized delivery schedule using predictive demand forecasting.',
    aiRationale: 'Holding 45 days inventory ties down ₹32L in working capital while incurring 2.8% storage wastage in monsoon season.',
    actionSteps: [
      'Establish fortnightly scheduled bulk dispatch agreements with cold chain suppliers',
      'Implement QR-based batch expiry and first-in-first-out (FIFO) tracking',
      'Set automated reorder alerts at 15-day safety stock threshold'
    ]
  },
  {
    id: 'gp-4',
    category: 'Market Expansion',
    title: 'Government e-Marketplace (GeM) & CSD Canteen Empanelment',
    roiPotential: '+₹85 Lakhs annual recurring revenue',
    implementationTime: '4-6 Weeks',
    difficulty: 'Strategic',
    description: 'Leverage MSME Udyam priority procurement reservation (25% public procurement mandate) to bid for institutional state grain & food supply tenders.',
    aiRationale: 'Your high compliance score (88/100) and FSSAI certification give you top tier pre-qualification eligibility for public sector procurement.',
    actionSteps: [
      'Register primary seller profile on GeM portal with Udyam verification',
      'Upload FSSAI, ISO and test laboratory batch certifications',
      'Participate in reserved MSME L1 tenders in Western railway & defense canteens'
    ]
  }
];

export const REPORTS_LIST: ReportItem[] = [
  {
    id: 'rep-investor-readiness',
    title: 'MSME Investor & Lender Readiness Dossier',
    subtitle: 'Comprehensive 18-page investment memorandum with historical ratios and growth forecast',
    category: 'Investor',
    generatedDate: '05 Sep 2026',
    fileSize: '2.4 MB',
    status: 'Ready',
    downloadName: 'BizPilot_Investor_Readiness_Report.pdf',
    highlights: ['Financial Health 82/100', 'DSCR 1.84x', 'CAGR 14.8%', 'Low Risk CMR-3']
  },
  {
    id: 'rep-credit-passport',
    title: 'Official MSME Credit Passport & Bankability Audit',
    subtitle: 'Bank-grade creditworthiness assessment validated for CGTMSE / PSB59 loan applications',
    category: 'Bank / NBFC',
    generatedDate: '05 Sep 2026',
    fileSize: '1.8 MB',
    status: 'Ready',
    downloadName: 'MSME_Credit_Passport_ShreeGaneshAgro.pdf',
    highlights: ['CIBIL 768', 'Bankability Score 74/100', 'Pre-qualified ₹85L limit']
  },
  {
    id: 'rep-cashflow-stress',
    title: '90-Day Predictive Cash Flow & Runway Stress Test',
    subtitle: 'Sensitivity scenario modeling for input price volatility and payment delays',
    category: 'Strategy',
    generatedDate: '01 Sep 2026',
    fileSize: '1.2 MB',
    status: 'Ready',
    downloadName: 'Cash_Flow_Stress_Test_Q3.pdf',
    highlights: ['7.2 Months Runway', 'Day 45 Cash Warning', 'TReDS Recommendation']
  },
  {
    id: 'rep-gst-audit',
    title: 'GST Reconciliation & Tax Compliance Integrity Report',
    subtitle: 'Detailed GSTR-2B vs 3B input tax credit match rate and compliance score',
    category: 'Audit',
    generatedDate: '28 Aug 2026',
    fileSize: '3.1 MB',
    status: 'Ready',
    downloadName: 'GST_Reconciliation_Audit_FY26.pdf',
    highlights: ['99.4% ITC Match', 'Zero Penalties', 'On-time Filing Badge']
  }
];

export const MULTILINGUAL_GREETINGS = {
  en: {
    welcome: 'Hello! I am BizPilot AI, your Business Copilot. How can I assist you with your funding readiness, cash flow projections, or growth strategies today?',
    sampleQuestions: [
      'How can I improve my Funding Readiness score from 74 to 85?',
      'Why is there a potential cash shortage alert in 45 days?',
      'Am I eligible for a collateral-free CGTMSE bank loan?',
      'What happens to my profit if I increase prices by 8%?'
    ]
  },
  hi: {
    welcome: 'नमस्ते! मैं बिज़पायलट AI हूँ, आपका बिज़नेस कोपायलट। आज मैं आपके फंडिंग स्कोर, कैश फ्लो पूर्वानुमान या बिज़नेस ग्रोथ में कैसे मदद कर सकता हूँ?',
    sampleQuestions: [
      'मेरा फंडिंग रेडीनेस स्कोर 74 से 85 तक कैसे बढ़ाया जाए?',
      '45 दिनों में कैश की कमी की चेतावनी क्यों आ रही है?',
      'क्या मैं बिना गारंटी वाले CGTMSE बैंक लोन के लिए पात्र हूँ?',
      'यदि मैं 8% दाम बढ़ाऊँ तो मेरे मुनाफे पर क्या असर पड़ेगा?'
    ]
  },
  ta: {
    welcome: 'வணக்கம்! நான் பிஸ்பைலட் AI, உங்கள் வணிக வழிகாட்டி. நிதி பெறுவதற்கான தகுதி, பணப்புழக்க கணிப்பு அல்லது வணிக வளர்ச்சிக்கான ஆலோசனைகளில் நான் எவ்வாறு உதவ முடியும்?',
    sampleQuestions: [
      'எனது நிதி தயார்நிலை மதிப்பெண்ணை (Funding Score) 74 இலிருந்து 85 ஆக உயர்த்துவது எப்படி?',
      '45 நாட்களில் பணப்பற்றாக்குறை ஏற்படும் என ஏன் எச்சரிக்கை காட்டுகிறது?',
      'பிணையில்லா CGTMSE அரசு கடன் பெற எனக்கு தகுதி உள்ளதா?',
      'விலையை 8% அதிகரித்தால் எனது லாபம் எவ்வாறு மாறும்?'
    ]
  },
  te: {
    welcome: 'నమస్కారం! నేను BizPilot AI, మీ వ్యాపార కోపైలట్. నిధుల సంసిద్ధత, నగదు ప్రవాహ అంచనాలు లేదా వ్యాపార వృద్ధిలో ఈరోజు మీకు ఎలా సహాయపడగలను?',
    sampleQuestions: [
      'నా ఫండింగ్ రెడీనెస్ స్కోర్‌ను 74 నుండి 85కి ఎలా పెంచుకోవాలి?',
      '45 రోజుల్లో నగదు కొరత హెచ్చరిక ఎందుకు వస్తోంది?',
      'నేను పూచీకత్తు లేని CGTMSE బ్యాంక్ రుణానికి అర్హుడనా?',
      'నేను ధరలను 8% పెంచితే నా లాభం ఎలా మారుతుంది?'
    ]
  },
  mr: {
    welcome: 'नमस्कार! मी बिझपायलट AI आहे, आपला व्यवसाय भागीदार. आपल्या बिझनेसचा फंडिंग स्कोअर, कॅश फ्लो अंदाज आणि वाढीच्या धोरणांसाठी मी कशी मदत करू शकेन?',
    sampleQuestions: [
      'माझा फंडिंग रेडीनेस स्कोअर 74 वरून 85 कसा वाढवता येईल?',
      '45 दिवसांत कॅश टंचाईचा इशारा का दाखवत आहे?',
      'मला विनातारण CGTMSE बँक कर्जासाठी पात्रता आहे का?',
      'किंमती 8% वाढवल्यास नफ्यावर काय परिणाम होईल?'
    ]
  }
};
