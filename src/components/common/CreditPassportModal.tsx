import React from 'react';
import { MSMEProfile } from '../../types';
import { BusinessAnalysis, Organization } from '../../types/business';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  QrCode, 
  FileCheck2, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  FlaskConical,
  Bot,
  HeartPulse,
  Scale,
  Info,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreditPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MSMEProfile;
  analysis?: BusinessAnalysis;
  organization?: Organization | null;
  onNavigate?: (tab: any) => void;
}

export const CreditPassportModal: React.FC<CreditPassportModalProps> = ({
  isOpen,
  onClose,
  profile,
  analysis,
  organization,
  onNavigate,
}) => {
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  const handlePrint = () => {
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
  const turnover = profile.turnover;
  const vintageYears = analysis?.vintageYears ?? (profile.incorporationYear ? new Date().getFullYear() - profile.incorporationYear : null);
  const netMargin = analysis?.financials.netMarginPercent;
  const currentRatio = analysis?.financials.currentRatio;
  const isCompliant = analysis ? analysis.compliance.isFullyCompliant : true;
  const preparationChecklist = analysis?.funding.preparationChecklist ?? [];

  // Conditional Improvement Actions based strictly on actual metrics
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-sky-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {t('passport.title', 'MSME Credit Passport')}
                <span className="text-[10px] text-purple-300 font-normal px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">
                  {t('passport.indicativeCreditProfile', 'BizPilot Indicative Credit Profile')}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {t('passport.subtitle', 'Standardized institutional credit assessment summary for loan preparation and underwriting review.')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              title={t('common.printPdf', 'Print / Save PDF')}
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 max-h-[78vh] overflow-y-auto space-y-6">
          
          {/* Institutional Header with Stamp */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase">
                  {profile.sector || 'MSME Enterprise'}
                </span>
                <span className="text-xs text-slate-400">
                  ID: {profile.id ? profile.id.toUpperCase() : 'BIZ-2026-IND'}
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">{businessName}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                <span>{t('business.sector', 'Sector')}: <strong className="text-slate-200">{profile.sector || 'General Business'}</strong></span>
                <span>•</span>
                <span>{t('business.location', 'Location')}: <strong className="text-slate-200">{profile.location || 'India'}</strong></span>
                <span>•</span>
                <span>{t('business.vintage', 'Vintage')}: <strong className="text-slate-200">{vintageYears ? `${vintageYears} ${t('common.years', 'Years')}` : 'Not provided'}</strong></span>
                <span>•</span>
                <span>GSTIN: <strong className="text-slate-200">{profile.gstin || '29AAAAA0000A1Z5'}</strong></span>
              </div>
            </div>

            {/* Stamp / Verification Badge */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-purple-500/40 text-center min-w-[140px]">
              <QrCode className="w-10 h-10 text-purple-400 mx-auto mb-1 opacity-80" />
              <div className="text-[9px] font-black uppercase tracking-wider text-purple-300">
                {t('passport.indicativeStamp', 'Indicative Profile')}
              </div>
              <div className="text-[9px] text-slate-500">
                Verified: {new Date().toISOString().split('T')[0]}
              </div>
            </div>
          </div>

          {/* Underwriting Disclaimer Banner */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-200">{t('passport.disclaimerTitle', 'Institutional Underwriting Notice')}: </strong>
              {t('passport.disclaimerBody', 'This Credit Passport is a standardized indicative assessment generated strictly from deterministic financial ratios for planning purposes. It does not represent an official credit bureau score (CIBIL/CRIF) or guaranteed bank loan approval.')}
            </p>
          </div>

          {/* Core Institutional Scores Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">{t('passport.indicativeScore', 'Funding Readiness')}</div>
              <div className="text-2xl font-black text-purple-400">{fundingScore}/100</div>
              <div className="text-[10px] text-slate-500">{fundingScore >= 75 ? 'Prime Candidate' : fundingScore >= 50 ? 'Moderate Readiness' : 'Needs Preparation'}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">{t('passport.solvencyRatio', 'Health Score')}</div>
              <div className="text-2xl font-black text-emerald-400">{healthScore}/100</div>
              <div className="text-[10px] text-slate-500">{healthScore >= 75 ? 'Strong Solvency' : 'Stable'}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">{t('passport.annualTurnover', 'Annual Turnover')}</div>
              <div className="text-2xl font-black text-white">{turnover || '—'}</div>
              <div className="text-[10px] text-slate-500">Self-Reported</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">{t('passport.liquidityBuffer', 'Runway')}</div>
              <div className="text-2xl font-black text-sky-400">{runwayMonths} M</div>
              <div className="text-[10px] text-sky-400 font-semibold">Reserve Depth</div>
            </div>
          </div>

          {/* Operational & Solvency Ratios with Explanations */}
          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-purple-400" /> Operational & Solvency Ratios
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Debt Service Coverage (DSCR)</span>
                  <strong className="text-emerald-400">{dscr}</strong>
                </div>
                <p className="text-[10px] text-slate-400">
                  {t('passport.dscrExplanation', 'Measures how comfortably available cash can cover debt obligations.')}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Ratio (Working Capital)</span>
                  <strong className="text-white">{currentRatio ? `${currentRatio}x` : 'Not available'}</strong>
                </div>
                <p className="text-[10px] text-slate-400">
                  {t('passport.currentRatioExplanation', 'Measures short-term ability to meet current liabilities.')}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Net Margin</span>
                  <strong className="text-purple-300">{netMargin !== null && netMargin !== undefined ? `${netMargin}%` : 'Not available'}</strong>
                </div>
                <p className="text-[10px] text-slate-400">
                  {t('passport.netMarginExplanation', 'Shows how much profit remains from revenue after expenses.')}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cash Runway</span>
                  <strong className="text-sky-400">{runwayMonths} Months</strong>
                </div>
                <p className="text-[10px] text-slate-400">
                  {t('passport.runwayExplanation', 'Estimated number of months the current cash position can support the modeled net cash burn.')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-900">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Monthly Operating Revenue</span>
                <span className="font-bold text-white">
                  {analysis ? `₹${(analysis.financials.monthlyRevenue / 100000).toFixed(2)} ${t('common.lakhs', 'Lakhs')}` : 'Not available'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Total Monthly Outflows</span>
                <span className="font-bold text-white">
                  {analysis ? `₹${(analysis.financials.totalMonthlyExpenses / 100000).toFixed(2)} ${t('common.lakhs', 'Lakhs')}` : 'Not available'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Net Monthly Cash Flow</span>
                <span className="font-bold text-emerald-400">
                  {analysis ? `₹${(analysis.financials.monthlyNetCashFlow / 100000).toFixed(2)} ${t('common.lakhs', 'Lakhs')}` : 'Not available'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Estimated Borrowing Capacity</span>
                <span className="font-bold text-purple-300">{creditLimit}</span>
              </div>
            </div>
          </div>

          {/* Ground-truth Preparation Checklist Summary */}
          {preparationChecklist.length > 0 && (
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
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

          {/* How to Improve Your Profile */}
          <div className="p-5 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-3">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              {t('passport.howToImprove', 'How to Improve Your Profile')}
            </h4>
            <div className="space-y-2 text-xs">
              {improvementActions.map((act, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2 text-slate-200">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Connected Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">
              {language === 'ta' ? 'அடுத்த மூலோபாய நடவடிக்கைகள்:' : 'Next strategic actions:'}
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {onNavigate && (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate('decision-lab');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 border border-slate-700 transition-all"
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
                    {t('passport.testLoanImpact', 'Test Loan Impact in Decision Lab')}
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate('ai-assistant');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 border border-slate-700 transition-all"
                  >
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                    {t('passport.askAiAdvisor', 'Consult AI Advisor')}
                  </button>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            {t('passport.confidential', 'CONFIDENTIAL • Generated by BizPilot AI Financial Intelligence')}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-all"
          >
            {t('common.close', 'Close')}
          </button>
        </div>

      </div>
    </div>
  );
};
