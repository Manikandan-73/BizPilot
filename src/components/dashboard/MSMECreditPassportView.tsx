import React from 'react';
import { MSMEProfile } from '../../types';
import { BusinessAnalysis, Organization } from '../../types/business';
import { useLanguage } from '../../i18n/LanguageContext';
import { useSubscription } from '../../hooks/useSubscription';
import { hasFeature } from '../../config/plans';
import { FeatureGate } from '../subscription/FeatureGate';
import { 
  FileCheck2, 
  ShieldCheck, 
  QrCode, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  FlaskConical,
  Bot,
  HeartPulse,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MSMECreditPassportViewProps {
  profile: MSMEProfile;
  analysis?: BusinessAnalysis;
  organization?: Organization | null;
  onOpenModal: () => void;
  onNavigate?: (tab: any) => void;
}

export const MSMECreditPassportView: React.FC<MSMECreditPassportViewProps> = ({
  profile,
  analysis,
  organization,
  onOpenModal,
  onNavigate
}) => {
  const { t, language } = useLanguage();
  const { subscription } = useSubscription({ organization });
  const isPro = hasFeature(subscription, 'advancedFunding');

  const handleDownload = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
    window.print();
  };

  const businessName = analysis?.organizationName || profile.name;
  const healthScore = analysis ? analysis.health.overallScore : profile.healthScore;
  const fundingScore = analysis ? analysis.funding.overallScore : profile.fundingReadinessScore;
  const creditLimit = analysis ? analysis.funding.estimatedCreditLimit : profile.estimatedCreditLimit;
  const runwayMonths = analysis?.financials.runwayMonths ?? profile.runwayMonths;
  const dscr = analysis?.financials.dscr ? `${analysis.financials.dscr}x` : t('executive.debtFree', 'Debt-Free');
  const turnoverFormatted = profile.turnover;
  const isCompliant = analysis ? analysis.compliance.isFullyCompliant : true;
  const vintageYears = analysis?.vintageYears ?? (profile.incorporationYear ? new Date().getFullYear() - profile.incorporationYear : null);
  const currentRatio = analysis?.financials.currentRatio;
  const netMargin = analysis?.financials.netMarginPercent;
  const preparationChecklist = analysis?.funding.preparationChecklist ?? [];
  const fundingStrategy = analysis?.funding.fundingStrategy;

  // Conditional profile improvements
  const improvementActions: string[] = [];
  if (analysis?.normalized.hasLoans && (analysis.financials.dscr ?? 0) < 1.3) {
    improvementActions.push('Improve DSCR: Target minimum 1.35x coverage through pricing reviews or tenure extension.');
  }
  if ((analysis?.financials.runwayMonths ?? 0) < 3) {
    improvementActions.push('Build cash buffer: Retain operating cash reserves to achieve a minimum 90-day liquidity buffer.');
  }
  if (analysis && analysis.normalized.accountsReceivable > analysis.financials.monthlyRevenue * 0.9 && analysis.normalized.accountsReceivable > 0) {
    improvementActions.push('Reduce overdue receivables: Collect 60+ day aging customer invoices to unlock working capital.');
  }
  if (!analysis?.compliance.gstRegistered || !analysis?.compliance.itrAvailable) {
    improvementActions.push('Complete compliance: Maintain timely GSTR-3B filings and past 2 years audited ITR records.');
  }
  if (analysis && (analysis.financials.operatingMarginPercent ?? 0) < 12 && analysis.financials.operatingMarginPercent !== null) {
    improvementActions.push('Improve operating margin: Optimize raw material procurement to raise EBITDA margin above 15%.');
  }
  if (improvementActions.length === 0) {
    improvementActions.push('Maintain clean debt service records and compile 6 months banking statements for future credit expansion.');
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {t('passport.title', 'MSME Credit Passport')}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {t('passport.indicativeCreditProfile', 'BizPilot Indicative Credit Profile')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('passport.subtitle', 'Standardized institutional credit assessment summary for loan preparation and underwriting review.')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenModal}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all shadow-md"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            {t('passport.fullScreen', 'Full Screen View')}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            {t('common.printPdf', 'Print / Save PDF')}
          </button>
        </div>
      </div>

      {/* Underwriting Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-200">{t('passport.disclaimerTitle', 'Institutional Underwriting Notice')}: </strong>
          {t('passport.disclaimerBody', 'This Credit Passport is an indicative assessment generated strictly from deterministic financial ratios for planning purposes. It does not represent an official credit bureau score (CIBIL/CRIF) or guaranteed bank loan approval.')}
        </p>
      </div>

      {/* Passport Document Container */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
        
        {/* Enterprise Identification Banner */}
        <div className="p-6 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase">
                {profile.sector || 'MSME Enterprise'}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                REG: {profile.id ? profile.id.toUpperCase() : 'BIZ-2026-IND'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">{businessName}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span>{t('business.sector', 'Sector')}: <strong className="text-slate-200">{profile.sector || 'Manufacturing'}</strong></span>
              <span>•</span>
              <span>{t('business.location', 'Location')}: <strong className="text-slate-200">{profile.location || 'India'}</strong></span>
              <span>•</span>
              <span>{t('business.vintage', 'Vintage')}: <strong className="text-slate-200">{vintageYears ? `${vintageYears} ${t('common.years', 'Years')}` : 'Not provided'}</strong></span>
              <span>•</span>
              <span>GSTIN: <strong className="text-slate-200">{profile.gstin || (language === 'ta' ? 'வழங்கப்படவில்லை' : 'Not registered')}</strong></span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center min-w-[150px] shadow-inner">
            <QrCode className="w-12 h-12 text-purple-400 mx-auto mb-1.5 opacity-80" />
            <div className="text-[10px] font-black uppercase tracking-wider text-purple-300">
              {t('passport.indicativeStamp', 'Indicative Profile')}
            </div>
            <div className="text-[9px] text-slate-500">
              {new Date().toISOString().split('T')[0]}
            </div>
          </div>
        </div>

        {/* Primary Scores Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase">{t('passport.indicativeScore', 'Funding Readiness')}</div>
            <div className="text-2xl font-black text-purple-400">{fundingScore}/100</div>
            <div className="text-[10px] text-slate-500">{fundingScore >= 75 ? 'Prime Candidate' : fundingScore >= 50 ? 'Moderate Readiness' : 'Needs Preparation'}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase">{t('passport.solvencyRatio', 'Health Score')}</div>
            <div className="text-2xl font-black text-emerald-400">{healthScore}/100</div>
            <div className="text-[10px] text-slate-500">{healthScore >= 75 ? 'Strong Solvency' : 'Stable'}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase">{t('passport.annualTurnover', 'Annual Turnover')}</div>
            <div className="text-2xl font-black text-white">{turnoverFormatted || '—'}</div>
            <div className="text-[10px] text-slate-500">Self-Reported</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase">{t('passport.liquidityBuffer', 'Runway')}</div>
            <div className="text-2xl font-black text-sky-400">{runwayMonths} M</div>
            <div className="text-[10px] text-sky-400 font-semibold">Reserve Depth</div>
          </div>
        </div>

        {/* Operational & Financial Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-purple-400" /> Operational & Solvency Ratios
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Debt Service Coverage (DSCR)</span>
                  <span className="font-bold text-emerald-400">{dscr}</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {t('passport.dscrExplanation', 'Measures how comfortably available cash can cover debt obligations.')}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Ratio</span>
                  <span className="font-bold text-white">{currentRatio ? `${currentRatio}x` : 'Not available'}</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {t('passport.currentRatioExplanation', 'Measures short-term ability to meet current liabilities.')}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Net Profit Margin</span>
                  <span className="font-bold text-purple-300">{netMargin !== null && netMargin !== undefined ? `${netMargin}%` : 'Not available'}</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {t('passport.netMarginExplanation', 'Shows how much profit remains from revenue after expenses.')}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cash Runway Buffer</span>
                  <span className="font-bold text-sky-400">{runwayMonths} {t('common.months', 'Months')}</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {t('passport.runwayExplanation', 'Estimated number of months the current cash position can support the modeled net cash burn.')}
                </p>
              </div>
            </div>
          </div>

          {/* How to Improve Your Profile */}
          <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              {t('passport.howToImprove', 'How to Improve Your Profile')}
            </h4>
            <div className="space-y-2 text-xs">
              {improvementActions.map((act, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-start gap-2 text-slate-300">
                  <span className="text-purple-400 font-bold mt-0.5">•</span>
                  <span className="leading-relaxed">{act}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-900 flex flex-wrap gap-2 text-[10px]">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ✓ Borrowing Capacity: {creditLimit}
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                ✓ Indicative Planning Assessment
              </span>
            </div>
          </div>

        </div>

        {/* Preparation Checklist Summary */}
        {preparationChecklist.length > 0 && (
          <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-purple-400" />
              {t('funding.checklistTitle', 'Loan Application Preparation Checklist')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              {preparationChecklist.map((item) => (
                <div 
                  key={item.id} 
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="font-medium text-slate-200">{item.title}</div>
                    <div className="text-[10px] text-slate-400">{item.details}</div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded shrink-0 ${
                    item.status === 'provided'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : item.status === 'incomplete'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {item.status === 'provided' ? t('funding.provided', 'Provided') :
                     item.status === 'incomplete' ? t('funding.incomplete', 'Incomplete') :
                     t('funding.notProvided', 'Not Provided')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professional Exclusive Strategic Funding Intelligence (Gated) */}
        <FeatureGate
          feature="advancedFunding"
          isAllowed={isPro}
          onUpgrade={() => onNavigate && onNavigate('billing')}
          fallbackTitle={language === 'ta' ? 'தொழில்முறை கடன் மூலோபாயம் (Professional Plan)' : 'Professional Strategic Funding Intelligence'}
          fallbackDescription={language === 'ta' 
            ? 'உங்கள் வணிகம் இப்போது கடன் பெற விண்ணப்பிக்கலாமா அல்லது நிதி சுயவிவரத்தை முதலில் மேம்படுத்த வேண்டுமா என்பதை அறிய தொழில்முறை திட்டத்திற்கு மாறவும்.' 
            : 'Upgrade to Professional to unlock institutional timing recommendations, underwriting gap analysis, and tailored capital advisory.'}
        >
          <div className="p-5 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {t('funding.fundingStrategyTitle', 'Strategic Funding Assessment')}
                </h4>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Professional
                </span>
              </div>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded border ${
                fundingStrategy?.timing === 'Ready to Prepare'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : fundingStrategy?.timing === 'Improve First'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {fundingStrategy?.timing === 'Ready to Prepare' ? t('funding.timingReady', 'Ready to Prepare') :
                 fundingStrategy?.timing === 'Improve First' ? t('funding.timingImprove', 'Improve First') :
                 t('funding.timingAttention', 'Needs Attention')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-purple-300 uppercase">Strategic Verdict</div>
                <div className="font-bold text-white">{fundingStrategy?.recommendation}</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{fundingStrategy?.rationale}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-sky-300 uppercase">{t('funding.keyPrereq', 'Key Prerequisite')}</div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{fundingStrategy?.keyPrerequisite}</p>
              </div>
            </div>
          </div>
        </FeatureGate>

        {/* Institutional Regulatory Disclaimer */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-300 font-semibold">{language === 'ta' ? 'அறிவிப்பு: ' : 'Disclaimer: '}</strong>
            {language === 'ta' 
              ? 'இது ஒரு சுட்டிக்காட்டும் வணிக நுண்ணறிவு மதிப்பீடு மட்டுமே, அதிகாரப்பூர்வ கடன் பணியக அறிக்கை அல்லது கடன் வழங்கும் முடிவு அல்ல.'
              : 'This is an indicative business intelligence assessment, not an official credit bureau report or lender decision.'}
          </p>
        </div>

        {/* Action Footer with Connected Navigation */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            {onNavigate && (
              <>
                <button
                  onClick={() => onNavigate('decision-lab')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 border border-slate-700 transition-all"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
                  {t('passport.testLoanImpact', 'Test Loan Impact')}
                </button>
                <button
                  onClick={() => onNavigate('ai-assistant')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 border border-slate-700 transition-all"
                >
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  {t('passport.askAiAdvisor', 'Ask AI Advisor')}
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenModal}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all"
            >
              {t('passport.fullScreen', 'Full Screen View')}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md"
            >
              {t('common.printPdf', 'Print / Save PDF')}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
