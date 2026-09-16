import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MSMEProfile } from '../../types';
import { BusinessAnalysis, Organization } from '../../types/business';
import { analyzeBusiness } from '../../analytics/financialAnalysis';
import { useLanguage } from '../../i18n/LanguageContext';
import { useSubscription } from '../../hooks/useSubscription';
import { hasFeature } from '../../config/plans';
import { FeatureGate } from '../subscription/FeatureGate';
import { askAIAdvisor } from '../../services/aiService';
import { 
  Bot, 
  Sparkles, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  Calculator, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  RotateCcw,
  Compass,
  Landmark,
  FileCheck2,
  DollarSign
} from 'lucide-react';

interface AIBusinessAdvisorViewProps {
  profile: MSMEProfile;
  analysis?: BusinessAnalysis;
  organization?: Organization | null;
  onNavigate: (tab: any) => void;
}

interface AdvisorMessage {
  id: string;
  sender: 'user' | 'advisor';
  timestamp: string;
  diagnosis?: string;
  why?: string;
  recommendation?: string;
  expectedImpact?: string;
  risk?: string;
  nextStep?: string;
  rawText?: string;
  calculationExplanation?: {
    metric: string;
    formula: string;
    actualValues: string;
    result: string;
  };
}

export const AIBusinessAdvisorView: React.FC<AIBusinessAdvisorViewProps> = ({
  profile,
  analysis,
  organization,
  onNavigate,
}) => {
  const { t, language } = useLanguage();
  const { subscription } = useSubscription({ organization });
  const isAllowed = hasFeature(subscription, 'advancedAI');

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

  const fin = effectiveAnalysis.financials;
  const norm = effectiveAnalysis.normalized;
  const busName = effectiveAnalysis.organizationName;

  // Formatted display values
  const revL = (fin.monthlyRevenue / 100000).toFixed(1);
  const ebitdaL = (fin.monthlyEbitda / 100000).toFixed(1);
  const netCashL = (fin.monthlyNetCashFlow / 100000).toFixed(1);
  const cashL = (norm.currentCashBalance / 100000).toFixed(1);
  const emiK = (norm.monthlyEMI / 1000).toFixed(0);
  const dscrText = fin.dscr ? `${fin.dscr}x` : (language === 'ta' ? 'கடன் இல்லை' : 'Debt-Free');

  // Initial welcome message structured as advice
  const initialMessages: AdvisorMessage[] = [
    {
      id: 'msg_welcome',
      sender: 'advisor',
      timestamp: language === 'ta' ? 'இப்போது' : 'Just now',
      diagnosis: language === 'ta'
        ? `${busName} நிறுவனத்தின் நேரலை நிதி அறிக்கை வெற்றிகரமாக ஏற்றப்பட்டது. மாதாந்திர வருவாய் ₹${revL}L, EBITDA விளிம்பு ${fin.operatingMarginPercent}%, மற்றும் நிகர பணப்புழக்கம் ₹${netCashL}L ஆக உள்ளது.`
        : `Live financial intelligence loaded for ${busName}. Current operations generate ₹${revL}L monthly revenue at ${fin.operatingMarginPercent}% EBITDA margin, with net monthly cash flow of ₹${netCashL}L.`,
      why: language === 'ta'
        ? `மாதாந்திர மொத்த செலவுகள் ₹${(fin.totalMonthlyExpenses / 100000).toFixed(1)}L மற்றும் தவணை EMI ₹${emiK}k. பணப்புழக்க இருப்பு ${fin.runwayMonths} மாதங்கள் நீடிக்கும்.`
        : `Total monthly expenses stand at ₹${(fin.totalMonthlyExpenses / 100000).toFixed(1)}L against debt EMI obligations of ₹${emiK}k/mo. Liquid cash reserves provide ${fin.runwayMonths} months of runway.`,
      recommendation: language === 'ta'
        ? 'எந்தவொரு முக்கிய வணிக முடிவை எடுப்பதற்கு முன்பும் (விலை மாற்றம், பணியாளர் நியமனம், புதிய கடன்), கீழேயுள்ள பகுப்பாய்வு வினாக்களைப் பயன்படுத்தவும் அல்லது Decision Lab-ல் உருவகப்படுத்தவும்.'
        : 'Before committing to major business moves (price adjustments, hiring, borrowing), review the strategic questions below or test decisions in Decision Lab.',
      expectedImpact: language === 'ta'
        ? 'அனுமானங்களின் அடிப்படையில் பண இழப்புகளைத் தவிர்த்து, கடன் தகுதியையும் லாபத்தையும் அதிகரிக்கலாம்.'
        : 'Prevents operational cash deficits, safeguards DSCR covenants, and targets high-ROI capital decisions.',
      risk: language === 'ta'
        ? 'முன்கணிப்பு இல்லாமல் எடுக்கப்படும் முடிவுகள் பணப்புழக்கத்தை முடக்கும்.'
        : 'Unplanned expansion without margin verification risks covenant breach and working capital strain.',
      nextStep: language === 'ta'
        ? 'கீழேயுள்ள பரிந்துரைக்கப்பட்ட கேள்விகளில் ஒன்றை அழுத்தவும் அல்லது உங்கள் வினவலை உள்ளிடவும்.'
        : 'Select one of the suggested strategic prompts below or type your specific question.',
      calculationExplanation: {
        metric: 'Debt Service Coverage Ratio (DSCR)',
        formula: 'Monthly EBITDA ÷ Monthly EMI Obligations',
        actualValues: `₹${fin.monthlyEbitda.toLocaleString('en-IN')} ÷ ₹${norm.monthlyEMI.toLocaleString('en-IN')}`,
        result: dscrText,
      },
    },
  ];

  const [messages, setMessages] = useState<AdvisorMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedCalcs, setExpandedCalcs] = useState<Record<string, boolean>>({});
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const toggleCalc = (id: string) => {
    setExpandedCalcs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Structured reasoning engine grounded in actual MSME numbers
  const generateGroundedResponse = (query: string): AdvisorMessage => {
    const q = query.toLowerCase();
    const id = 'msg_' + Date.now();
    const ts = language === 'ta' ? 'இப்போது' : 'Just now';

    // 1. "Why is my cash flow weak?"
    if (q.includes('cash flow') || q.includes('weak') || q.includes('runway') || q.includes('பணப்புழக்கம்')) {
      const isNegative = fin.monthlyNetCashFlow <= 0;
      const debtorLock = norm.accountsReceivable > fin.monthlyRevenue;

      return {
        id,
        sender: 'advisor',
        timestamp: ts,
        diagnosis: language === 'ta'
          ? (isNegative
              ? `உங்கள் மாதாந்திர நிகர பணப்புழக்கம் பற்றாக்குறையில் உள்ளது (-₹${(Math.abs(fin.monthlyNetCashFlow) / 1000).toFixed(0)}k/mo).`
              : `உங்கள் பணப்புழக்கம் நேர்மறையாக உள்ளது (₹${netCashL}L/mo), ஆனால் ${debtorLock ? 'வாடிக்கையாளர் பாக்கிகள் பணத்தை முடக்குகின்றன' : 'கடன் தவணைகள் அழுத்தத்தை ஏற்படுத்துகின்றன'}.`)
          : (isNegative
              ? `Your business is operating at an active monthly net cash deficit of -₹${(Math.abs(fin.monthlyNetCashFlow) / 1000).toFixed(0)}k/month.`
              : `Monthly cash flow is positive at ₹${netCashL}L/month, but operational liquidity is constrained by ${debtorLock ? 'heavy accounts receivable lockup' : 'fixed monthly debt service commitments'}.`),
        why: language === 'ta'
          ? `மாதாந்திர EBITDA ₹${ebitdaL}L ஆக இருக்கும்போது, கடன் தவணை EMI ₹${emiK}k மற்றும் மூலப்பொருள் செலவு ₹${(fin.monthlyMaterialCost / 100000).toFixed(1)}L பணத்தை உறிஞ்சுகின்றன. வசூலாகாத பாக்கிகள்: ₹${(norm.accountsReceivable / 100000).toFixed(1)}L.`
          : `Monthly EBITDA of ₹${ebitdaL}L is depleted by ₹${emiK}k EMI debt outflow and ₹${(fin.monthlyMaterialCost / 100000).toFixed(1)}L raw materials. Trapped receivables stand at ₹${(norm.accountsReceivable / 100000).toFixed(1)}L.`,
        recommendation: language === 'ta'
          ? 'வாடிக்கையாளர் கடன் வசூலை 15 நாட்கள் முடுக்கி விடுங்கள் அல்லது TReDS இன்வாய்ஸ் தள்ளுபடி முறையை பரிசீலிக்கவும். தேவையற்ற அலுவலக OPEX-ஐ 8% குறைக்கவும்.'
          : 'Accelerate debtor collection cycles by 15 days or leverage TReDS invoice discounting. Freeze non-critical OPEX until cash reserves reach 3 full operating months.',
        expectedImpact: language === 'ta'
          ? `₹${(norm.accountsReceivable * 0.3 / 100000).toFixed(1)}L ரொக்க இருப்பு உடனடி நடப்புக் கணக்கிற்குள் விடுவிக்கப்படலாம்.`
          : `Unlocks approximately ₹${(norm.accountsReceivable * 0.3 / 100000).toFixed(1)}L in trapped cash reserves, lifting cash runway by +1.8 months.`,
        risk: language === 'ta'
          ? 'நடவடிக்கை எடுக்காவிட்டால், பணப்புழக்க இருப்பு 60 நாட்களுக்குள் நெருக்கடிக்குள்ளாகும்.'
          : 'Persistent debtor lag combined with fixed monthly EMI commitments risks unplanned liquidity shortfalls during supplier settlement windows.',
        nextStep: language === 'ta'
          ? 'Decision Lab-ல் "செலவு குறைப்பு (Cost Reduction)" உருவகத்தை இயக்கி பணப்புழக்க மாற்றத்தைப் பாருங்கள்.'
          : 'Run the "Cost Reduction" or "Sales Growth" scenario in Decision Lab to model positive liquidity buffers.',
        calculationExplanation: {
          metric: 'Monthly Net Cash Flow',
          formula: 'Monthly EBITDA - Monthly Loan EMI Obligations',
          actualValues: `₹${fin.monthlyEbitda.toLocaleString('en-IN')} - ₹${norm.monthlyEMI.toLocaleString('en-IN')}`,
          result: `₹${fin.monthlyNetCashFlow.toLocaleString('en-IN')}/mo`,
        },
      };
    }

    // 2. "Can I afford to hire another employee?"
    if (q.includes('hire') || q.includes('employee') || q.includes('salary') || q.includes('பணியாளர்') || q.includes('வேலை')) {
      const avgSalary = 25000;
      const affordable = fin.monthlyNetCashFlow > avgSalary * 2;
      const newCashFlow = fin.monthlyNetCashFlow - avgSalary;

      return {
        id,
        sender: 'advisor',
        timestamp: ts,
        diagnosis: language === 'ta'
          ? (affordable
              ? `ஆம், உங்கள் தற்போதைய நிதி நிலை ₹${(avgSalary / 1000).toFixed(0)}k ஊதியத்தில் பணியாளரை நியமிப்பதை தாங்கக்கூடியதாக உள்ளது.`
              : `எச்சரிக்கை: புதிய பணியாளரை நியமிப்பது தற்போதைய மாதாந்திர நிகர பணப்புழக்கத்தை (₹${netCashL}L) கடுமையான அழுத்தத்திற்கு உள்ளாக்கும்.`)
          : (affordable
              ? `Yes, based on current monthly net cash flow of ₹${netCashL}L, your business can absorb an estimated monthly salary of ₹${avgSalary.toLocaleString('en-IN')}.`
              : `Caution: Hiring additional staff at this stage will compress your net cash buffer (₹${netCashL}L/mo) and erode operational liquidity.`),
        why: language === 'ta'
          ? `தற்போதைய மாதாந்திர ஊழியர் ஊதிய செலவு ₹${(norm.monthlySalaryCost / 100000).toFixed(1)}L (${effectiveAnalysis.employees} பணியாளர்கள்). புதிய ஊழியர் ஊதியம் ₹${(avgSalary / 1000).toFixed(0)}k சேர்க்கப்பட்டால் நிகர பணப்புழக்கம் ₹${(newCashFlow / 100000).toFixed(1)}L ஆக குறையும்.`
          : `Current staff payroll is ₹${(norm.monthlySalaryCost / 100000).toFixed(1)}L across ${effectiveAnalysis.employees} staff. Adding ₹${avgSalary.toLocaleString('en-IN')}/mo shifts net cash flow to ₹${(newCashFlow / 100000).toFixed(1)}L/mo.`,
        recommendation: language === 'ta'
          ? 'புதிய பணியாளர் நியமனத்தை நேரடி வருவாய் பெருக்கும் விற்பனை அல்லது உற்பத்தி பணிகளுக்கு மட்டுமே ஒதுக்குங்கள்.'
          : 'Proceed only if the hire directly drives incremental billable output or sales within 60 days. Tie compensation to performance milestones where feasible.',
        expectedImpact: language === 'ta'
          ? 'வருவாய் இலக்குகள் எட்டப்பட்டால் மாதாந்திர விற்றுமுதல் 8-12% அதிகரிக்கும்.'
          : 'Operational throughput expands; if hiring drives a modest +8% sales expansion, incremental gross profit will easily offset payroll cost.',
        risk: language === 'ta'
          ? 'வருவாய் கூடாமல் செலவு மட்டும் அதிகரித்தால் மாதாந்திர லாப விளிம்பு 1.5% குறையும்.'
          : 'Fixed monthly payroll commitments increase without immediate revenue offset, trimming EBITDA margin by ~0.8%.',
        nextStep: language === 'ta'
          ? 'Decision Lab-ல் "Hire Employee" உருவகத்தை இயக்கி அதன் சரியான தாக்கத்தை சரிபார்க்கவும்.'
          : 'Simulate this hire in Decision Lab with exact salary numbers to verify safety margins.',
        calculationExplanation: {
          metric: 'Post-Hire Projected Net Cash Flow',
          formula: 'Current Net Cash Flow - Monthly New Hire Salary',
          actualValues: `₹${fin.monthlyNetCashFlow.toLocaleString('en-IN')} - ₹${avgSalary.toLocaleString('en-IN')}`,
          result: `₹${newCashFlow.toLocaleString('en-IN')}/mo`,
        },
      };
    }

    // 3. "Can I safely take another loan?"
    if (q.includes('loan') || q.includes('debt') || q.includes('borrow') || q.includes('emi') || q.includes('கடன்')) {
      const dscrVal = fin.dscr ?? 5;
      const canBorrow = dscrVal >= 1.5 && fin.monthlyNetCashFlow > 50000;
      const sampleLoanEmi = 24000; // ~10L @ 11% 48m
      const newEbitda = fin.monthlyEbitda;
      const newTotalEmi = norm.monthlyEMI + sampleLoanEmi;
      const postLoanDscr = (newEbitda / newTotalEmi).toFixed(2);

      return {
        id,
        sender: 'advisor',
        timestamp: ts,
        diagnosis: language === 'ta'
          ? (canBorrow
              ? `உங்கள் தற்போதைய DSCR விகிதம் ${dscrText} ஆக உள்ளதால், பிணையில்லா கடன் அல்லது நடைமுறை மூலதன கடன் பெற தகுதியுள்ளது.`
              : `உயர் இடர்: உங்கள் கடன் சுமை அல்லது DSCR விகிதம் (${dscrText}) புதிய கடன் வாங்குவதை பரிந்துரைக்கவில்லை.`)
          : (canBorrow
              ? `Your current DSCR of ${dscrText} comfortably satisfies bank underwriting criteria (benchmarked > 1.35x).`
              : `High Risk: Taking additional debt is unadvisable given existing EMI commitments of ₹${emiK}k/mo and current coverage ratio (${dscrText}).`),
        why: language === 'ta'
          ? `மாதாந்திர EBITDA ₹${ebitdaL}L ஆக உள்ளது. புதிய ₹10L கடன் பெற்றால் மாதாந்திர EMI ₹${(newTotalEmi / 1000).toFixed(0)}k ஆக உயரும், DSCR ${postLoanDscr}x ஆக மாறும்.`
          : `Monthly EBITDA is ₹${ebitdaL}L against current EMI of ₹${emiK}k. An additional ₹10L facility (~₹24k/mo EMI) moves total debt service to ₹${(newTotalEmi / 1000).toFixed(0)}k, shifting DSCR to ${postLoanDscr}x.`,
        recommendation: language === 'ta'
          ? 'CGTMSE திட்டத்தின் கீழ் பிணையில்லா முன்கூட்டியே அங்கீகரிக்கப்பட்ட கடன் வரம்புகளை மட்டுமே பயன்படுத்தவும். நீண்ட கால தவணையை (36-48 மாதங்கள்) தேர்வு செய்யவும்.'
          : 'Prioritize collateral-free CGTMSE schemes or working capital credit lines over short-term high-interest borrowing. Choose at least 36 to 48 months tenure.',
        expectedImpact: language === 'ta'
          ? 'ரொக்க இருப்பு அதிகரிக்கும்; மூலப்பொருள் கொள்முதலில் மொத்த தள்ளுபடி பெற முடியும்.'
          : 'Injects liquid working capital, allowing early supplier payment discounts (2-3% COGS savings) without straining equity.',
        risk: language === 'ta'
          ? 'வருவாய் குறைந்த காலங்களில் EMI கட்ட இயலாமை ஏற்படலாம்.'
          : 'Fixed repayment obligation increases debt-to-revenue ratio and reduces future borrowing ceiling.',
        nextStep: language === 'ta'
          ? 'Decision Lab-ல் "Take New Loan" உருவகத்தை இயக்கி புதிய EMI சுமையை பார்க்கவும்.'
          : 'Test the exact loan amount and interest in Decision Lab before submitting loan documents to banks.',
        calculationExplanation: {
          metric: 'Projected Post-Loan DSCR',
          formula: 'Monthly EBITDA ÷ (Existing EMI + New Monthly EMI)',
          actualValues: `₹${fin.monthlyEbitda.toLocaleString('en-IN')} ÷ ₹${newTotalEmi.toLocaleString('en-IN')}`,
          result: `${postLoanDscr}x`,
        },
      };
    }

    // 4. "Should I reduce costs or increase prices?"
    if (q.includes('price') || q.includes('cost') || q.includes('reduce') || q.includes('increase') || q.includes('விலை') || q.includes('செலவு')) {
      const price5Uplift = Math.round(fin.monthlyRevenue * 0.05);
      const opex10Savings = Math.round(norm.monthlyOperatingExpenses * 0.1);

      return {
        id,
        sender: 'advisor',
        timestamp: ts,
        diagnosis: language === 'ta'
          ? `விலையை 5% உயர்த்துவது செலவை 10% குறைப்பதை விட அதிக லாபத்தை (${price5Uplift > opex10Savings ? 'நேரடியாக' : 'ஒப்பீட்டளவில்'}) தரும்.`
          : `Mathematical comparison: A selective 5% price optimization generates +₹${(price5Uplift / 1000).toFixed(0)}k/mo, whereas a 10% OPEX cut saves +₹${(opex10Savings / 1000).toFixed(0)}k/mo.`,
        why: language === 'ta'
          ? `தற்போதைய மாதாந்திர வருவாய் ₹${revL}L, OPEX ₹${(norm.monthlyOperatingExpenses / 100000).toFixed(1)}L. வருவாய் அடிப்படை அதிகமாக இருப்பதால் சிறிய விலை மாற்றமும் அதிக லாபத்தை உருவாக்குகிறது.`
          : `Monthly revenue base (₹${revL}L) is significantly larger than fixed OPEX (₹${(norm.monthlyOperatingExpenses / 100000).toFixed(1)}L). Pricing leverage flows 100% directly to EBITDA assuming volume retention.`,
        recommendation: language === 'ta'
          ? 'முதலில் தேர்ந்தெடுக்கப்பட்ட உயர்-மதிப்பு தயாரிப்புகளில் 4-6% விலை சீரமைப்பை அமல்படுத்துங்கள். அதே நேரத்தில் தேவையற்ற அலுவலக செலவுகளில் 5% குறைப்பை இணையுங்கள்.'
          : 'Implement a tiered 4-5% price adjustment on your top 20% high-demand products, paired with modest 5% procurement rationalization.',
        expectedImpact: language === 'ta'
          ? `EBITDA லாப விளிம்பு ${fin.operatingMarginPercent}%-லிருந்து சுமார் ${((fin.operatingMarginPercent ?? 15) + 3.5).toFixed(1)}%-ஆக உயரும்.`
          : `Lifts operating EBITDA margin from ${fin.operatingMarginPercent}% to ~ ${((fin.operatingMarginPercent ?? 15) + 3.5).toFixed(1)}%, adding ₹${((price5Uplift + opex10Savings) / 100000).toFixed(1)}L net monthly cash.`,
        risk: language === 'ta'
          ? 'முழு தயாரிப்புகளிலும் விலை ஏற்றினால் வாடிக்கையாளர் வெளியேற்றம் ஏற்படலாம்.'
          : 'Across-the-board price spikes without value communication risk customer attrition. Tier selectively.',
        nextStep: language === 'ta'
          ? 'Decision Lab-ல் "Price Increase" மற்றும் "Cost Reduction" இரண்டையும் ஒப்பிட்டுப் பாருங்கள்.'
          : 'Compare both scenarios side-by-side in Decision Lab to observe exact bottom-line variance.',
        calculationExplanation: {
          metric: 'Pricing vs Cost Reduction Leverage',
          formula: 'Price +5% Uplift vs OPEX -10% Savings',
          actualValues: `+₹${price5Uplift.toLocaleString('en-IN')} (Price) vs +₹${opex10Savings.toLocaleString('en-IN')} (Cost)`,
          result: price5Uplift >= opex10Savings ? 'Price change yields higher net return' : 'Cost reduction yields higher net return',
        },
      };
    }

    // Default / General query
    return {
      id,
      sender: 'advisor',
      timestamp: ts,
      diagnosis: language === 'ta'
        ? `${busName} நிதி நிலைமை: மாதாந்திர வருவாய் ₹${revL}L, நிகர லாப விளிம்பு ${fin.netMarginPercent}%, பணப்புழக்க இருப்பு ${fin.runwayMonths} மாதங்கள்.`
        : `Financial standing for ${busName}: Monthly Revenue ₹${revL}L, Operating Margin ${fin.operatingMarginPercent}%, Net Cash Flow ₹${netCashL}L/mo, Runway ${fin.runwayMonths} months.`,
      why: language === 'ta'
        ? `நிறுவனத்தின் நிதி ஆரோக்கிய மதிப்பெண் ${effectiveAnalysis.health.overallScore}/100 மற்றும் கடன் தயார்நிலை மதிப்பெண் ${effectiveAnalysis.funding.overallScore}/100 ஆகும்.`
        : `Organization Financial Health is rated at ${effectiveAnalysis.health.overallScore}/100 with Funding Readiness at ${effectiveAnalysis.funding.overallScore}/100 (${effectiveAnalysis.funding.eligibilityTier}).`,
      recommendation: language === 'ta'
        ? 'செயல்பாட்டு பணப்புழக்கத்தை நிலையாக பராமரித்து, மாதாந்திர விற்றுமுதலை நிலைநிறுத்துவதில் கவனம் செலுத்துங்கள்.'
        : 'Focus on strengthening working capital turnover and sustaining operating margins above 15% before taking on additional long-term commitments.',
      expectedImpact: language === 'ta'
        ? 'வங்கி கடன் தகுதியும் பிணையில்லா கடன் வரம்பும் அதிகரிக்கும்.'
        : 'Solidifies institutional underwriting profile and unlocks Tier-A prime commercial terms.',
      risk: language === 'ta'
        ? 'கடன் காலதாமதம் மற்றும் அதிக மூலப்பொருள் செலவு லாபத்தை குறைக்கலாம்.'
        : 'Delayed debtor receipts remain the primary operational friction point.',
      nextStep: language === 'ta'
        ? 'Decision Lab-ஐப் பயன்படுத்தி முக்கிய வணிக முடிவுகளை உருவகப்படுத்துங்கள்.'
        : 'Open Decision Lab to run predictive simulations on pricing, hiring, or debt capacity.',
      calculationExplanation: {
        metric: 'EBITDA Margin',
        formula: '(Monthly Revenue - Total Monthly Costs) ÷ Monthly Revenue',
        actualValues: `(₹${fin.monthlyRevenue.toLocaleString('en-IN')} - ₹${fin.totalMonthlyExpenses.toLocaleString('en-IN')}) ÷ ₹${fin.monthlyRevenue.toLocaleString('en-IN')}`,
        result: `${fin.operatingMarginPercent}%`,
      },
    };
  };

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputText;
    if (!text.trim()) return;

    const userMsg: AdvisorMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      timestamp: language === 'ta' ? 'இப்போது' : 'Just now',
      rawText: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputText('');
    setIsTyping(true);

    try {
      const serverAdvice = await askAIAdvisor(text, {
        organizationId: organization?.id || profile.id,
        language: language as 'en' | 'ta',
        context: organization || { organization: { ...profile, financials: fin, normalized: norm } },
      });

      const response: AdvisorMessage = {
        id: 'msg_' + Date.now(),
        sender: 'advisor',
        timestamp: language === 'ta' ? 'இப்போது' : 'Just now',
        diagnosis: serverAdvice.diagnosis,
        why: serverAdvice.why,
        recommendation: serverAdvice.recommendation,
        expectedImpact: serverAdvice.expectedImpact,
        risk: serverAdvice.risk,
        nextStep: serverAdvice.nextStep,
        rawText: serverAdvice.rawText,
      };

      setMessages((prev) => [...prev, response]);
    } catch (err: any) {
      console.warn('[AI Advisor Server Error]:', err?.message);
      if (err?.message?.includes('signed in')) {
        const errorMsg: AdvisorMessage = {
          id: 'msg_' + Date.now(),
          sender: 'advisor',
          timestamp: language === 'ta' ? 'இப்போது' : 'Just now',
          diagnosis: language === 'ta'
            ? 'நேரலை Google Gemini AI ஆலோசகரைப் பயன்படுத்த தயவுசெய்து உங்கள் தொழில்முறை (Professional) கணக்கில் உள்நுழையவும்.'
            : 'Please sign in to your Professional account to consult with the live Google Gemini AI Business Advisor.',
          recommendation: language === 'ta'
            ? 'பதிவு செய்து தொடக்க (Starter) அல்லது தொழில்முறை (Professional) திட்டத்தைத் தேர்வு செய்யவும்.'
            : 'Sign in or create an account, then activate a Professional subscription to unlock executive AI decision intelligence.',
          nextStep: 'Sign In / Register',
        };
        setMessages((prev) => [...prev, errorMsg]);
      } else if (err.status === 403 || (err.message && err.message.includes('Professional'))) {
        const errorMsg: AdvisorMessage = {
          id: 'msg_' + Date.now(),
          sender: 'advisor',
          timestamp: language === 'ta' ? 'இப்போது' : 'Just now',
          diagnosis: err.message,
          recommendation: language === 'ta'
            ? 'தயவுசெய்து தொழில்முறை (Professional) திட்டத்திற்கு மேம்படுத்தவும்.'
            : 'Please upgrade to the Professional plan to unlock AI Business Advisor.',
          nextStep: 'Upgrade in Billing',
        };
        setMessages((prev) => [...prev, errorMsg]);
      } else {
        const errorMsg: AdvisorMessage = {
          id: 'msg_' + Date.now(),
          sender: 'advisor',
          timestamp: language === 'ta' ? 'இப்போது' : 'Just now',
          diagnosis: err?.message || (language === 'ta'
            ? 'AI ஆலோசகர் சேவை தற்காலிகமாக கிடைக்கவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
            : 'AI Business Advisor is temporarily unavailable. Please try again.'),
          recommendation: 'Please retry your prompt in a few moments.',
          nextStep: 'Retry',
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const suggestedPrompts = [
    { key: 'cash_flow', label: t('advisor.promptCashFlow', 'Why is my cash flow weak?') },
    { key: 'hire', label: t('advisor.promptHire', 'Can I afford to hire another employee?') },
    { key: 'risk', label: t('advisor.promptRisk', 'What is the biggest financial risk in my business?') },
    { key: 'pricing', label: t('advisor.promptPricing', 'Should I reduce costs or increase prices?') },
    { key: 'loan', label: t('advisor.promptLoan', 'Can I safely take another loan?') },
    { key: 'focus', label: t('advisor.promptFocus', 'What should I focus on this month?') },
    { key: 'funding', label: t('advisor.promptFunding', 'How can I improve my funding readiness?') },
  ];

  return (
    <FeatureGate
      feature="advancedAI"
      isAllowed={isAllowed}
      onUpgrade={() => onNavigate('billing')}
      fallbackTitle={t('advisor.proExclusiveTitle', 'AI Business Advisor is Available in Professional')}
      fallbackDescription={t(
        'advisor.proExclusiveDesc',
        'Professional unlocks your dedicated financial decision partner. Receive structured diagnostic breakdowns, explainable formulas, and grounded strategic recommendations.'
      )}
    >
      <div className="space-y-6 pb-16 font-sans">
        
        {/* Top Header Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>{t('advisor.tagline', 'EXECUTIVE DECISION INTELLIGENCE')}</span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                PRO EXCLUSIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight">
              {t('advisor.headerTitle', 'AI Business Advisor')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {t('advisor.headerSubtitle', 'Your financial decision partner. Grounded in your actual numbers, delivering structured diagnoses, risk evaluations, and practical next steps.')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('decision-lab')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
            >
              <span>{t('advisor.openDecisionLab', 'Open Decision Lab')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Compact Business Snapshot Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-md">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800 text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Live Financial Telemetry Snapshot
            </span>
            <span className="text-[11px] text-slate-400">{busName}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase">Monthly Revenue</span>
              <div className="font-bold text-white text-sm mt-0.5">₹{revL}L</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase">Operating Margin</span>
              <div className="font-bold text-purple-300 text-sm mt-0.5">{fin.operatingMarginPercent ?? 0}%</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase">Cash Runway</span>
              <div className="font-bold text-amber-400 text-sm mt-0.5">{fin.runwayMonths ?? 0} months</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase">DSCR Coverage</span>
              <div className="font-bold text-white text-sm mt-0.5">{dscrText}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase">Funding Readiness</span>
              <div className="font-bold text-emerald-400 text-sm mt-0.5">{effectiveAnalysis.funding.overallScore}/100</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase">Financial Health</span>
              <div className="font-bold text-indigo-400 text-sm mt-0.5">{effectiveAnalysis.health.overallScore}/100</div>
            </div>
          </div>
        </div>

        {/* Suggested Prompts Bar */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400">
            {t('advisor.suggestedPromptsTitle', 'Decision Prompts (Grounded in Your Data):')}
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {suggestedPrompts.map((p) => (
              <button
                key={p.key}
                onClick={() => handleSend(p.label)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-purple-500/40 transition-all shrink-0 shadow-sm"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advisor Structured Chat Stream */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-xl overflow-hidden flex flex-col h-[560px]">
          
          {/* Messages Scroll Area */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';

              if (isUser) {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-xl p-4 rounded-2xl bg-purple-600 text-white text-xs font-medium shadow-md">
                      <div>{msg.rawText}</div>
                      <div className="text-[10px] text-purple-200 mt-1 text-right">{msg.timestamp}</div>
                    </div>
                  </div>
                );
              }

              const isCalcExpanded = !!expandedCalcs[msg.id];

              return (
                <div key={msg.id} className="flex gap-3 max-w-3xl">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-indigo-600/30">
                    <Bot className="w-4 h-4" />
                  </div>

                  <div className="flex-1 p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 text-xs shadow-lg">
                    
                    {/* Diagnosis */}
                    {msg.diagnosis && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Diagnosis</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed font-medium">
                          {msg.diagnosis}
                        </p>
                      </div>
                    )}

                    {/* Why */}
                    {msg.why && (
                      <div className="space-y-1 pt-2 border-t border-slate-800/80">
                        <div className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                          Why (Financial Metric Drivers)
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          {msg.why}
                        </p>
                      </div>
                    )}

                    {/* Recommendation */}
                    {msg.recommendation && (
                      <div className="space-y-1 pt-2 border-t border-slate-800/80">
                        <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Strategic Recommendation</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed">
                          {msg.recommendation}
                        </p>
                      </div>
                    )}

                    {/* Expected Impact & Risk Grid */}
                    {(msg.expectedImpact || msg.risk) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                        {msg.expectedImpact && (
                          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-1">
                            <span className="text-[10px] font-bold text-emerald-300 uppercase">Expected Impact</span>
                            <p className="text-[11px] text-slate-300 leading-relaxed">{msg.expectedImpact}</p>
                          </div>
                        )}
                        {msg.risk && (
                          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/20 space-y-1">
                            <span className="text-[10px] font-bold text-rose-300 uppercase">Risk Considerations</span>
                            <p className="text-[11px] text-slate-300 leading-relaxed">{msg.risk}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Next Step */}
                    {msg.nextStep && (
                      <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-purple-300 uppercase block">Practical Next Step:</span>
                          <span className="text-[11px] text-slate-200">{msg.nextStep}</span>
                        </div>
                        <button
                          onClick={() => onNavigate('decision-lab')}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold transition-all shrink-0 flex items-center gap-1"
                        >
                          <span>Test in Lab</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Explainable AI Calculation Toggle */}
                    {msg.calculationExplanation && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => toggleCalc(msg.id)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          <span>
                            {isCalcExpanded ? 'Hide Calculation Breakdown' : 'Why? View Exact Calculation Breakdown'}
                          </span>
                          {isCalcExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {isCalcExpanded && (
                          <div className="mt-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1.5">
                            <div className="font-bold text-slate-200">{msg.calculationExplanation.metric}</div>
                            <div className="text-[10px] text-slate-400">Formula: {msg.calculationExplanation.formula}</div>
                            <div className="text-slate-300">
                              Values: {msg.calculationExplanation.actualValues} = <span className="text-emerald-400 font-bold">{msg.calculationExplanation.result}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  <span>Evaluating financial telemetry and simulating decisions...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* User Input Bar */}
          <div className="p-4 bg-slate-950/90 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2.5"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t('advisor.inputPlaceholder', 'Ask a financial or strategic decision question...')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                <span>{t('common.send', 'Ask Advisor')}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </FeatureGate>
  );
};
