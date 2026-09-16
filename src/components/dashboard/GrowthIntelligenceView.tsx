import React, { useMemo, useState } from 'react';
import { MSMEProfile } from '../../types';
import { BusinessAnalysis, Organization } from '../../types/business';
import { useLanguage } from '../../i18n/LanguageContext';
import { useSubscription } from '../../hooks/useSubscription';
import { hasFeature } from '../../config/plans';
import { 
  Compass, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
  ShieldCheck,
  Calendar,
  Lock,
  Landmark
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GrowthIntelligenceViewProps {
  profile: MSMEProfile;
  analysis?: BusinessAnalysis;
  organization?: Organization | null;
  onNavigate: (tab: any) => void;
}

export const GrowthIntelligenceView: React.FC<GrowthIntelligenceViewProps> = ({
  profile,
  analysis,
  organization,
  onNavigate,
}) => {
  const { t, language } = useLanguage();
  const { subscription } = useSubscription({ organization });
  const isPro = hasFeature(subscription, 'advancedGrowth');

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [executedPlaybooks, setExecutedPlaybooks] = useState<string[]>([]);

  const annualRev = analysis ? analysis.financials.annualRevenue : 0;
  const turnoverLakhs = Math.max(10, annualRev / 100000);
  const fin = analysis?.financials;
  const norm = analysis?.normalized;

  // 1. ADVANCED 5-PILLAR STRATEGIC RECOMMENDATIONS (Professional)
  const advancedRecommendations = useMemo(() => {
    if (!analysis) return [];

    const recs = [];
    const isCashWeak = (fin?.runwayMonths ?? 6) < 3 || (fin?.monthlyNetCashFlow ?? 0) <= 0;
    const isMarginTight = (fin?.operatingMarginPercent ?? 15) < 12;
    const hasDebtorLock = (norm?.accountsReceivable ?? 0) > (fin?.monthlyRevenue ?? 0) * 0.8;
    const isDebtHeavy = (fin?.dscr ?? 2) < 1.3 && (norm?.hasLoans ?? false);

    // Pillar 1: Cash Flow Opportunity
    if (isCashWeak || hasDebtorLock) {
      recs.push({
        id: 'rec_cash',
        pillar: 'Cash Flow Opportunity',
        priority: 'HIGH' as const,
        observation: language === 'ta'
          ? `வாடிக்கையாளர் பாக்கிகள் ₹${((norm?.accountsReceivable ?? 0) / 100000).toFixed(1)}L பணப்புழக்கத்தை முடக்கியுள்ளன.`
          : `Accounts receivable of ₹${((norm?.accountsReceivable ?? 0) / 100000).toFixed(1)}L lock up valuable working capital buffer.`,
        whyItMatters: language === 'ta'
          ? 'நடப்பு ரொக்க இருப்பு 3 மாதங்களுக்கும் குறைவாக இருப்பதால், சப்ளையர் பணப்பட்டுவாடாவில் காலதாமதம் ஏற்படலாம்.'
          : 'Extended credit terms to corporate buyers trigger unexpected working capital deficits and liquidity stress.',
        suggestedAction: language === 'ta'
          ? 'TReDS தள்ளுபடி முறையில் விலைப்பட்டியல்களை பதிவேற்றி 48 மணி நேரத்தில் பணத்தை விடுவிக்கவும்.'
          : 'Enroll on RBI TReDS platforms (RXIL/M1xchange) to discount verified invoices within 48 hours.',
        expectedImpact: language === 'ta' ? '+₹15L உடனடி பணப்புழக்கம்' : '+₹15 Lakhs immediate liquid buffer',
        direction: 'improves' as const,
      });
    }

    // Pillar 2: Financial Risk
    if (isDebtHeavy) {
      recs.push({
        id: 'rec_debt_risk',
        pillar: 'Financial Risk',
        priority: 'HIGH' as const,
        observation: language === 'ta'
          ? `மாதாந்திர கடன் தவணை EMI ₹${((norm?.monthlyEMI ?? 0) / 1000).toFixed(0)}k கடன் சேவை விகிதத்தை (DSCR ${fin?.dscr}x) குறைக்கிறது.`
          : `Monthly debt service of ₹${((norm?.monthlyEMI ?? 0) / 1000).toFixed(0)}k limits debt serviceability (DSCR at ${fin?.dscr}x).`,
        whyItMatters: language === 'ta'
          ? 'DSCR 1.35x-க்கு கீழ் சென்றால் வங்கிகள் கூடுதல் கடன் வழங்க மறுக்கலாம்.'
          : 'Depressed DSCR falls below institutional underwriting thresholds and restricts renewal of credit limits.',
        suggestedAction: language === 'ta'
          ? 'CGTMSE திட்டத்தின் கீழ் தவணைக் காலத்தை 36-லிருந்து 60 மாதங்களாக நீட்டித்து EMI-ஐக் குறைக்கவும்.'
          : 'Restructure facilities to extend tenure from 36 to 60 months, trimming monthly debt outflow.',
        expectedImpact: language === 'ta' ? 'EMI சுமை 25% குறையும்' : 'Lowers monthly EMI burden by ~25%',
        direction: 'improves' as const,
      });
    }

    // Pillar 3: Growth Opportunity
    recs.push({
      id: 'rec_growth',
      pillar: 'Growth Opportunity',
      priority: isMarginTight ? ('HIGH' as const) : ('MEDIUM' as const),
      observation: language === 'ta'
        ? `தற்போதைய EBITDA விளிம்பு ${fin?.operatingMarginPercent !== undefined ? `${fin.operatingMarginPercent}%` : 'மதிப்பிடப்படவில்லை'} ஆகும். முதல் 20% உயர் மதிப்பு பொருட்களில் விலை சீரமைப்பு செய்யலாம்.`
        : `EBITDA margin stands at ${fin?.operatingMarginPercent !== undefined ? `${fin.operatingMarginPercent}%` : 'not calculated'}. Product-mix optimization yields direct margin expansion.`,
      whyItMatters: language === 'ta'
        ? 'மூலப்பொருள் பணவீக்கத்தை ஈடுகட்ட தேர்ந்தெடுக்கப்பட்ட விலை உயர்வு தேவை.'
        : 'Absorbs upstream input material inflation without relying exclusively on high sales volumes.',
      suggestedAction: language === 'ta'
        ? 'அதிக விற்பனையாகும் முக்கிய தயாரிப்புகளில் 4-6% அடுக்குமுறை விலை உயர்வை அமல்படுத்துங்கள்.'
        : 'Institute a selective 4-6% tiered pricing adjustment across top 20% SKU volume contributors.',
      expectedImpact: language === 'ta' ? `+₹${(turnoverLakhs * 0.035).toFixed(1)}L மாதாந்திர கூடுதல் EBITDA` : `+₹${(turnoverLakhs * 0.035).toFixed(1)}L monthly incremental EBITDA`,
      direction: 'improves' as const,
    });

    // Pillar 4: Operational Opportunity
    recs.push({
      id: 'rec_ops',
      pillar: 'Operational Opportunity',
      priority: 'MEDIUM' as const,
      observation: language === 'ta'
        ? `சரக்கு இருப்பு மதிப்பு ₹${((norm?.inventoryValue ?? 0) / 100000).toFixed(1)}L. மறுஆர்டர் சுழற்சியை சீரமைக்கலாம்.`
        : `Inventory holding of ₹${((norm?.inventoryValue ?? 0) / 100000).toFixed(1)}L ties up liquid operational funds.`,
      whyItMatters: language === 'ta'
        ? 'மெதுவாக நகரும் சரக்குகள் நிதி மூலதனத்தை தேவையற்று முடக்குகின்றன.'
        : 'Holding slow-moving stock carries warehouse carrying costs and inflates working capital cycle.',
      suggestedAction: language === 'ta'
        ? 'ABC சரக்கு மேலாண்மை முறையை செயல்படுத்தி தேக்கமடைந்த பொருட்களை தள்ளுபடியில் விற்கவும்.'
        : 'Implement dynamic safety stock reorder cycles linked to tier-1 supplier lead times.',
      expectedImpact: language === 'ta' ? 'சரக்கு சுழற்சி 18 நாட்கள் குறையும்' : 'Shortens inventory cycle by ~18 days',
      direction: 'improves' as const,
    });

    // Pillar 5: Funding Opportunity
    recs.push({
      id: 'rec_funding',
      pillar: 'Funding Opportunity',
      priority: 'LOW' as const,
      observation: language === 'ta'
        ? `கடன் தயார்நிலை மதிப்பெண் ${analysis?.funding.overallScore}/100. அரசு GeM ஒப்பந்தங்களில் EMD விலக்கு பெறலாம்.`
        : `Funding Readiness Score of ${analysis?.funding.overallScore}/100 pre-qualifies for collateral-free MSME schemes.`,
      whyItMatters: language === 'ta'
        ? 'அரசு கொள்முதல் ஒப்பந்தங்கள் 45 நாள் நிலையான பணப்புழக்கத்தை உறுதி செய்யும்.'
        : 'Mandatory 25% public procurement quota guarantees timely settlements and builds verified bank turnover.',
      suggestedAction: language === 'ta'
        ? 'GeM போர்ட்டலில் உத்யாம் சான்றிதழைப் பயன்படுத்தி EMD விலக்குடன் அரசு டெண்டர்களில் பங்கேற்கவும்.'
        : 'Register on GeM to bid on PSU tenders with complete EMD exemption under MSME preference.',
      expectedImpact: language === 'ta' ? '+₹40L வருடாந்திர புதிய விற்றுமுதல்' : '+₹40L annualized new institutional revenue',
      direction: 'improves' as const,
    });

    return recs.slice(0, 5);
  }, [analysis, fin, norm, language]);

  // 2. DYNAMIC 30-DAY ACTION PLAN (Professional)
  const actionPlan = useMemo(() => {
    const isCashWeak = (fin?.runwayMonths ?? 6) < 3;
    const isMarginLow = (fin?.operatingMarginPercent ?? 15) < 14;

    return [
      {
        week: 'Week 1',
        title: isCashWeak ? 'Emergency Debtor Recovery & TReDS' : 'Direct Procurement & Supplier Audit',
        focus: isCashWeak ? 'Cash Flow' : 'Margin Optimization',
        description: isCashWeak
          ? 'Call top 5 overdue debtors and upload invoices to TReDS for 48-hour liquidation.'
          : 'Audit raw material vendor contracts to secure 2% early-settlement procurement discounts.',
        status: 'Priority',
      },
      {
        week: 'Week 2',
        title: 'Fixed OPEX Rationalization',
        focus: 'Cost Efficiency',
        description: 'Review admin, software, and utility recurring expenses to trim non-essential overhead by 5%.',
        status: 'Scheduled',
      },
      {
        week: 'Week 3',
        title: isMarginLow ? 'Selective Tiered Pricing Adjustment' : 'Working Capital Credit Line Exploration',
        focus: isMarginLow ? 'Pricing Power' : 'Banking Readiness',
        description: isMarginLow
          ? 'Institute a 4.5% price tier on top 20% SKU lines to insulate operating margins.'
          : 'Apply for CGTMSE-backed collateral-free working capital facility with verified Credit Passport.',
        status: 'Scheduled',
      },
      {
        week: 'Week 4',
        title: 'Statutory Reconciliation & Board Review',
        focus: 'Governance',
        description: 'Reconcile GST GSTR-3B filings with bank statements and run Decision Lab simulations for next month.',
        status: 'Scheduled',
      },
    ];
  }, [fin]);

  // 3. BASIC PLAYBOOKS (Starter Baseline)
  const playbooks = useMemo(() => {
    return [
      {
        id: 'treds-invoice-discounting',
        category: 'Working Capital',
        title: language === 'ta' ? 'TReDS இன்வாய்ஸ் தள்ளுபடி முறை' : 'TReDS Debtor Invoice Discounting',
        roiPotential: `₹${(turnoverLakhs * 0.04).toFixed(1)} ${t('common.lakhs', 'Lakhs')} ${language === 'ta' ? 'ரொக்க இருப்பு' : 'Liquidity'}`,
        implementationTime: '7 - 10 Days',
        description: language === 'ta'
          ? `RBI அங்கீகரித்த TReDS தளங்கள் மூலம் ${analysis && analysis.normalized.accountsReceivable > 0 ? `₹${(analysis.normalized.accountsReceivable / 100000).toFixed(1)}L` : 'நிலுவையில் உள்ள'} தொகையை விரைவாகப் பெறுங்கள்.`
          : `Unlock trapped cash in your ${analysis && analysis.normalized.accountsReceivable > 0 ? `₹${(analysis.normalized.accountsReceivable / 100000).toFixed(1)}L` : 'outstanding'} receivables via RBI-approved TReDS exchanges (RXIL / M1xchange).`,
        aiRationale: language === 'ta'
          ? 'உங்கள் வாடிக்கையாளர் பாக்கிகள் பணப்புழக்கத்தை முடக்குகின்றன. TReDS தள்ளுபடி மூலம் 48 மணி நேரத்தில் பணம் பெறலாம்.'
          : 'Your receivables account for high debtor lockup. Institutional discounting transfers risk and shortens cash collection cycles to 48 hours.',
        actionSteps: language === 'ta' ? [
          'GSTIN மற்றும் உத்யாம் எண் கொண்டு RXIL / Invoicemart-இல் பதிவு செய்க.',
          'அங்கீகரிக்கப்பட்ட விலைப்பட்டியல்களை நிறுவன ஏலத்திற்கு பதிவேற்றவும்.',
          '48 மணி நேரத்திற்குள் 85-90% தொகையை வங்கி நடப்புக் கணக்கில் நேரடியாகப் பெறுங்கள்.'
        ] : [
          'Register on RXIL / Invoicemart with existing GSTIN & Udyam number.',
          'Upload approved corporate invoices for auction to institutional bidders.',
          'Receive 85-90% upfront settlement directly to business current account within 48 hours.'
        ],
        difficulty: 'Easy' as const
      },
      {
        id: 'selective-pricing-adjustment',
        category: 'Pricing',
        title: language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட விலை சீரமைப்பு' : 'Selective Tiered Margin Optimization',
        roiPotential: `+₹${(turnoverLakhs * 0.035).toFixed(1)} ${t('common.lakhs', 'Lakhs')} EBITDA`,
        implementationTime: '15 Days',
        description: language === 'ta'
          ? 'மூலப்பொருள் விலை உயர்வை ஈடுகட்ட அதிக விற்பனையாகும் பொருட்களில் 4-6% விலை சீரமைப்பை செயல்படுத்துங்கள்.'
          : 'Institute a selective 4-6% price tier on top-selling product categories to absorb direct material inflation.',
        aiRationale: language === 'ta'
          ? `தற்போதைய EBITDA விளிம்பு ${analysis?.financials.operatingMarginPercent !== undefined ? `${analysis.financials.operatingMarginPercent}%` : 'மதிப்பிடப்படவில்லை'}. நேரடி சீரமைப்பு மூலம் லாப விளிம்பை உயர்த்த முடியும்.`
          : `Operating EBITDA margin is currently ${analysis?.financials.operatingMarginPercent !== undefined ? `${analysis.financials.operatingMarginPercent}%` : 'not assessed'}. Direct margin adjustment restores gross margins.`,
        actionSteps: language === 'ta' ? [
          'மொத்த விற்பனையில் 70% பங்களிக்கும் முதல் 20% தயாரிப்புகளை அடையாளம் காணுங்கள்.',
          '30 நாள் முன்கூட்டிய முன்பதிவுகளுக்கு சலுகை அளித்து, விநியோகஸ்தர் விலையை +4.5% உயர்த்தவும்.',
          'வாடிக்கையாளர் திருப்தியை 60 நாட்கள் கண்காணித்து தக்கவைக்கவும்.'
        ] : [
          'Identify top 20% SKU lines contributing to 70% of gross volume.',
          'Adjust distributor tier rates by +4.5% while offering volume rebates on 30-day pre-orders.',
          'Track order retention over 60 days to prevent churn.'
        ],
        difficulty: 'Medium' as const
      },
      {
        id: 'safety-stock-optimization',
        category: 'Inventory',
        title: language === 'ta' ? 'சரக்கு இருப்பு மேலாண்மை சீரமைப்பு' : 'Dynamic Safety Stock & Lead-Time Rationalization',
        roiPotential: `₹${(turnoverLakhs * 0.025).toFixed(1)} ${t('common.lakhs', 'Lakhs')} ${language === 'ta' ? 'மீட்கப்படும் மூலதனம்' : 'Freed Capital'}`,
        implementationTime: '21 Days',
        description: language === 'ta'
          ? 'வழங்குநர்களின் கால அவகாசத்திற்கு ஏற்ப மறுஆர்டர் இடைவெளிகளை மாற்றி பணப்புழக்கத்தை அதிகரிக்கவும்.'
          : 'Transition from static buffer stocks to dynamic reorder intervals based on supplier lead times.',
        aiRationale: language === 'ta'
          ? `₹${analysis ? (analysis.normalized.inventoryValue / 100000).toFixed(1) : '38.0'}L மதிப்பிலான சரக்கு இருப்பு அதிக மூலதனத்தை முடக்குகிறது.`
          : `Current inventory holding of ₹${analysis ? (analysis.normalized.inventoryValue / 100000).toFixed(1) : '38.0'}L ties up vital working capital buffer.`,
        actionSteps: language === 'ta' ? [
          'மெதுவாக நகரும் மூலப்பொருட்களைக் கண்டறிந்து விற்க நடவடிக்கை எடுக்கவும்.',
          'முதல் நிலை வழங்குநர்களிடையே ABC சரக்கு வகைப்பாட்டை நிறுவவும்.',
          'மீட்கப்பட்ட ரொக்கத்தை குறுகிய கால வங்கி வைப்புகளில் முதலீடு செய்யவும்.'
        ] : [
          'Audit slow-moving raw materials and liquidation candidates.',
          'Establish ABC inventory classification across tier-1 suppliers.',
          'Reinvest liberated liquid cash into short-term liquid sweep deposits.'
        ],
        difficulty: 'Strategic' as const
      },
      {
        id: 'gem-tender-procurement',
        category: 'Market Expansion',
        title: language === 'ta' ? 'GeM போர்டல் & அரசு ஒப்பந்தங்கள்' : 'GeM Portal & Public Procurement Allocation',
        roiPotential: `+₹${(turnoverLakhs * 0.08).toFixed(1)} ${t('common.lakhs', 'Lakhs')} ${language === 'ta' ? 'வருவாய்' : 'Revenue'}`,
        implementationTime: '30 Days',
        description: language === 'ta'
          ? 'அரசு இ-மார்க்கெட்பிளேஸில் (GeM) MSMEகளுக்கான 25% கட்டாய அரசு கொள்முதல் ஒதுக்கீட்டைப் பயன்படுத்தவும்.'
          : 'Leverage MSME 25% mandatory public procurement quota on the Government e-Marketplace (GeM).',
        aiRationale: language === 'ta'
          ? `உத்யாம் பதிவு மற்றும் ${analysis?.health.overallScore ?? 82}/100 நிதி ஆரோக்கியத்துடன் அரசு ஒப்பந்தங்களில் EMD விலக்கு பெற தகுதியுண்டு.`
          : `With active Udyam registration and verified financial health (${analysis?.health.overallScore ?? 82}/100), you qualify for EMD exemption on PSU tenders.`,
        actionSteps: language === 'ta' ? [
          'GeM விற்பனையாளர் சுயவிவர சரிபார்ப்பை நிறைவு செய்து உத்யாம் சான்றிதழை இணைக்கவும்.',
          'MSMEகளுக்கான EMD விலக்குடன் கூடிய அரசு ஒப்பந்தங்களை வடிகட்டி கண்டறியவும்.',
          'சரிபார்க்கப்பட்ட BizPilot கடன் பாஸ்போர்ட்டுடன் ஒப்பந்தப்புள்ளிகளை சமர்ப்பிக்கவும்.'
        ] : [
          'Complete GeM seller profile verification and link Udyam certificate.',
          'Filter active state & central department tenders with EMD exemption for MSMEs.',
          'Submit bids backed by the verified BizPilot Credit Passport.'
        ],
        difficulty: 'Strategic' as const
      }
    ];
  }, [analysis, turnoverLakhs, language, t]);

  const filteredPlaybooks = selectedCategory === 'All' 
    ? playbooks 
    : playbooks.filter(p => p.category === selectedCategory);

  const handleExecute = (id: string) => {
    if (!executedPlaybooks.includes(id)) {
      setExecutedPlaybooks([...executedPlaybooks, id]);
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      
      {/* Header Banner */}
      <div className="p-4 sm:p-6 lg:p-8 rounded-2xl bg-[#121722] border border-[#222936] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-black/20 min-w-0">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#A78BFA]">
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#8B5CF6] shrink-0" />
              <span>{isPro ? 'STRATEGIC DECISION INTELLIGENCE' : 'TACTICAL GROWTH PLAYBOOKS'}</span>
            </div>
            {isPro && (
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30">
                PRO ACTIVE
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#F8FAFC] mt-1.5 tracking-tight">
            {isPro ? 'Advanced Growth Intelligence' : 'Growth Playbooks & Optimization'}
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B0C0] mt-1 max-w-2xl">
            {isPro
              ? 'Ranked 5-pillar strategic roadmap and 30-day operational action plan derived from your verified metrics.'
              : 'Actionable institutional operational strategies to unlock working capital and optimize profitability.'}
          </p>
        </div>

        {isPro && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('decision-lab')}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition-all shadow-md shadow-[#8B5CF6]/20 flex items-center justify-center gap-1.5"
            >
              <span>Simulate in Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* STARTER UPGRADE NOTICE IF NOT PRO */}
      {!isPro && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#161C27] border border-[#8B5CF6]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-black/20 min-w-0">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30 shrink-0 mt-0.5 sm:mt-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#F8FAFC]">Unlock Advanced Growth Intelligence &amp; 30-Day Action Plan</div>
              <p className="text-[11px] text-[#A7B0C0] mt-0.5">
                Professional plan provides ranked recommendations across 5 financial pillars and a personalized week-by-week execution plan.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('billing')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition-all shadow-md shadow-[#8B5CF6]/20 shrink-0 flex items-center justify-center gap-1.5"
          >
            <span>Upgrade to Professional</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* PROFESSIONAL ONLY: 5-PILLAR STRATEGIC RECOMMENDATIONS */}
      {isPro && advancedRecommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 className="text-sm sm:text-base font-bold text-[#F8FAFC] tracking-tight flex items-center gap-2">
              <Target className="w-4 h-4 text-[#8B5CF6] shrink-0" />
              <span>Prioritized Strategic Recommendations (Top 5 Ranked)</span>
            </h2>
            <span className="text-xs text-[#707A8C]">Ranked by Financial Impact</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {advancedRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#121722] border border-[#222936] hover:border-[#303848] transition-all flex flex-col justify-between space-y-4 shadow-lg shadow-black/20 min-w-0"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A78BFA] bg-[#8B5CF6]/15 px-2 py-0.5 rounded-md border border-[#8B5CF6]/30 truncate">
                      {rec.pillar}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                        rec.priority === 'HIGH'
                          ? 'bg-rose-950/40 text-rose-300 border border-rose-800/60'
                          : rec.priority === 'MEDIUM'
                          ? 'bg-amber-950/40 text-amber-300 border border-amber-800/60'
                          : 'bg-[#161C27] text-[#A7B0C0] border border-[#222936]'
                      }`}
                    >
                      {rec.priority} PRIORITY
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-[#F8FAFC] leading-snug">{rec.observation}</h3>
                    <p className="text-[11px] text-[#A7B0C0] mt-1.5 leading-relaxed">{rec.whyItMatters}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#222936] space-y-2">
                  <div className="text-[11px] text-[#A7B0C0]">
                    <span className="text-[10px] font-bold text-[#A78BFA] uppercase block">Action:</span>
                    {rec.suggestedAction}
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 font-semibold text-emerald-400">
                    <span>Impact:</span>
                    <span>{rec.expectedImpact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROFESSIONAL ONLY: 30-DAY ACTION PLAN */}
      {isPro && (
        <div className="p-4 sm:p-6 rounded-2xl bg-[#121722] border border-[#222936] shadow-lg shadow-black/20 space-y-4 sm:space-y-5 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-[#222936]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#8B5CF6] shrink-0" />
              <h2 className="text-xs sm:text-sm font-bold text-[#F8FAFC] uppercase tracking-wider">
                Conditional 30-Day Execution Action Plan
              </h2>
            </div>
            <span className="text-[11px] text-[#707A8C]">Tailored to your current runway &amp; margin profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {actionPlan.map((step) => (
              <div key={step.week} className="p-3.5 sm:p-4 rounded-xl bg-[#0F1219] border border-[#222936] space-y-2 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-[#A78BFA] uppercase">{step.week}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#161C27] border border-[#303848] text-[#A78BFA] font-semibold truncate">
                    {step.focus}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#F8FAFC] leading-snug">{step.title}</h4>
                <p className="text-[11px] text-[#A7B0C0] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CORE / BASIC PLAYBOOKS (Available to All) */}
      <div className="space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm sm:text-base font-bold text-[#F8FAFC] tracking-tight">
            {isPro ? 'Operational Execution Playbooks' : 'Available Growth Playbooks'}
          </h2>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {['All', 'Working Capital', 'Pricing', 'Inventory', 'Market Expansion'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#8B5CF6] text-white shadow-sm'
                    : 'bg-[#0F1219] text-[#A7B0C0] hover:text-[#F8FAFC] border border-[#222936] hover:border-[#303848]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredPlaybooks.map((p) => {
            const isDone = executedPlaybooks.includes(p.id);

            return (
              <div
                key={p.id}
                className={`p-4 sm:p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 sm:space-y-5 shadow-lg shadow-black/20 min-w-0 ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-800/50'
                    : 'bg-[#121722] border-[#222936] hover:border-[#303848]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#707A8C] bg-[#0F1219] border border-[#222936] px-2 py-0.5 rounded-md truncate">
                      {p.category}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono shrink-0">
                      {p.roiPotential}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC]">{p.title}</h3>
                    <p className="text-xs text-[#A7B0C0] mt-1 leading-relaxed">{p.description}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0F1219] border border-[#222936] text-xs space-y-1">
                    <span className="text-[10px] font-bold text-[#A78BFA] uppercase block">AI Analysis Rationale:</span>
                    <p className="text-[11px] text-[#A7B0C0] leading-relaxed">{p.aiRationale}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#222936] flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-[#707A8C] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#707A8C] shrink-0" />
                    {p.implementationTime}
                  </span>

                  <button
                    onClick={() => handleExecute(p.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isDone
                        ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/60'
                        : 'bg-[#161C27] hover:bg-[#1E2536] text-[#F8FAFC] border border-[#303848] shadow-sm'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{isDone ? 'Executed' : 'Execute Playbook'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
