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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#121722] border border-[#303848] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[calc(100vh-2rem)] flex flex-col min-w-0">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#222936] bg-[#0F1219] shrink-0 gap-3 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#8B5CF6] flex items-center justify-center text-white font-bold shadow-sm shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-[#F8FAFC] flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                <span>{t('passport.title', 'MSME Credit Passport')}</span>
                <span className="text-[9px] sm:text-[10px] text-[#A78BFA] font-medium px-1.5 sm:px-2 py-0.5 rounded bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 shrink-0">
                  {t('passport.indicativeCreditProfile', 'BizPilot Indicative Credit Profile')}
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#707A8C] line-clamp-1 sm:line-clamp-none">
                {t('passport.subtitle', 'Standardized institutional credit assessment summary for loan preparation and underwriting review.')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="p-1.5 sm:p-2 rounded-lg bg-[#161C27] hover:bg-[#171D29] text-[#A7B0C0] hover:text-[#F8FAFC] border border-[#222936] transition-all"
              title={t('common.printPdf', 'Print / Save PDF')}
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg bg-[#161C27] hover:bg-[#171D29] text-[#A7B0C0] hover:text-[#F8FAFC] border border-[#222936] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 bg-[#121722] min-w-0 flex-1">
          
          {/* Institutional Header with Stamp */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#0F1219] border border-[#222936] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 min-w-0">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#14B8A6]/15 text-[#2DD4BF] border border-[#14B8A6]/30 uppercase">
                  {profile.sector || 'MSME Enterprise'}
                </span>
                <span className="text-xs text-[#707A8C]">
                  ID: {profile.id ? profile.id.toUpperCase() : 'BIZ-2026-IND'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#F8FAFC] tracking-tight">{businessName}</h2>
              <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs text-[#707A8C] pt-1">
                <span>{t('business.sector', 'Sector')}: <strong className="text-[#A7B0C0] font-semibold">{profile.sector || 'General Business'}</strong></span>
                <span className="hidden xs:inline">•</span>
                <span>{t('business.location', 'Location')}: <strong className="text-[#A7B0C0] font-semibold">{profile.location || 'India'}</strong></span>
                <span className="hidden xs:inline">•</span>
                <span>{t('business.vintage', 'Vintage')}: <strong className="text-[#A7B0C0] font-semibold">{vintageYears ? `${vintageYears} ${t('common.years', 'Years')}` : 'Not provided'}</strong></span>
                <span className="hidden xs:inline">•</span>
                <span>GSTIN: <strong className="text-[#A7B0C0] font-semibold">{profile.gstin || (language === 'ta' ? 'வழங்கப்படவில்லை' : 'Not registered')}</strong></span>
              </div>
            </div>

            {/* Stamp / Verification Badge */}
            <div className="w-full md:w-auto p-3 rounded-xl bg-[#161C27] border border-[#303848] text-center min-w-[140px] shadow-sm shrink-0">
              <QrCode className="w-8 h-8 sm:w-10 sm:h-10 text-[#8B5CF6] mx-auto mb-1 opacity-90" />
              <div className="text-[9px] font-black uppercase tracking-wider text-[#A78BFA]">
                {t('passport.indicativeStamp', 'Indicative Profile')}
              </div>
              <div className="text-[9px] text-[#707A8C]">
                Verified: {new Date().toISOString().split('T')[0]}
              </div>
            </div>
          </div>

          {/* Underwriting Disclaimer Banner */}
          <div className="p-3 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-start gap-2.5 text-xs text-[#A7B0C0] min-w-0">
            <Info className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-[#F8FAFC]">{t('passport.disclaimerTitle', 'Institutional Underwriting Notice')}: </strong>
              {t('passport.disclaimerBody', 'This Credit Passport is a standardized indicative assessment generated strictly from deterministic financial ratios for planning purposes. It does not represent an official credit bureau score (CIBIL/CRIF) or guaranteed bank loan approval.')}
            </p>
          </div>

          {/* Core Institutional Scores Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center min-w-0">
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#0F1219] border border-[#222936] space-y-1 min-w-0">
              <div className="text-[10px] text-[#707A8C] font-bold uppercase truncate">{t('passport.indicativeScore', 'Funding Readiness')}</div>
              <div className="text-xl sm:text-2xl font-black text-[#8B5CF6]">{fundingScore}/100</div>
              <div className="text-[10px] text-[#707A8C] truncate">{fundingScore >= 75 ? 'Prime Candidate' : fundingScore >= 50 ? 'Moderate Readiness' : 'Needs Preparation'}</div>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#0F1219] border border-[#222936] space-y-1 min-w-0">
              <div className="text-[10px] text-[#707A8C] font-bold uppercase truncate">{t('passport.solvencyRatio', 'Health Score')}</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">{healthScore}/100</div>
              <div className="text-[10px] text-[#707A8C] truncate">{healthScore >= 75 ? 'Strong Solvency' : 'Stable'}</div>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#0F1219] border border-[#222936] space-y-1 min-w-0">
              <div className="text-[10px] text-[#707A8C] font-bold uppercase truncate">{t('passport.annualTurnover', 'Annual Turnover')}</div>
              <div className="text-xl sm:text-2xl font-black text-[#F8FAFC] truncate">{turnover || '—'}</div>
              <div className="text-[10px] text-[#707A8C] truncate">Self-Reported</div>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#0F1219] border border-[#222936] space-y-1 min-w-0">
              <div className="text-[10px] text-[#707A8C] font-bold uppercase truncate">{t('passport.liquidityBuffer', 'Runway')}</div>
              <div className="text-xl sm:text-2xl font-black text-[#14B8A6]">{runwayMonths} M</div>
              <div className="text-[10px] text-[#14B8A6] font-semibold truncate">Reserve Depth</div>
            </div>
          </div>

          {/* Operational & Solvency Ratios with Explanations */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#0F1219] border border-[#222936] shadow-sm space-y-4 min-w-0">
            <h4 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-[#8B5CF6]" /> Operational &amp; Solvency Ratios
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs min-w-0">
              <div className="p-3 rounded-lg bg-[#121722] border border-[#222936] space-y-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[#A7B0C0] truncate">Debt Service Coverage (DSCR)</span>
                  <strong className="text-emerald-400 shrink-0">{dscr}</strong>
                </div>
                <p className="text-[10px] text-[#707A8C]">
                  {t('passport.dscrExplanation', 'Measures how comfortably available cash can cover debt obligations.')}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#121722] border border-[#222936] space-y-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[#A7B0C0] truncate">Current Ratio (Working Capital)</span>
                  <strong className="text-[#F8FAFC] shrink-0">{currentRatio ? `${currentRatio}x` : 'Not available'}</strong>
                </div>
                <p className="text-[10px] text-[#707A8C]">
                  {t('passport.currentRatioExplanation', 'Measures short-term ability to meet current liabilities.')}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#121722] border border-[#222936] space-y-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[#A7B0C0] truncate">Net Margin</span>
                  <strong className="text-[#8B5CF6] shrink-0">{netMargin !== null && netMargin !== undefined ? `${netMargin}%` : 'Not available'}</strong>
                </div>
                <p className="text-[10px] text-[#707A8C]">
                  {t('passport.netMarginExplanation', 'Shows how much profit remains from revenue after expenses.')}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#121722] border border-[#222936] space-y-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[#A7B0C0] truncate">Cash Runway</span>
                  <strong className="text-[#14B8A6] shrink-0">{runwayMonths} Months</strong>
                </div>
                <p className="text-[10px] text-[#707A8C]">
                  {t('passport.runwayExplanation', 'Estimated number of months the current cash position can support the modeled net cash burn.')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs pt-2 border-t border-[#222936] min-w-0">
              <div className="flex justify-between items-center py-1 gap-2">
                <span className="text-[#707A8C] truncate">Monthly Operating Revenue</span>
                <span className="font-bold text-[#F8FAFC] shrink-0">
                  {analysis ? `₹${(analysis.financials.monthlyRevenue / 100000).toFixed(2)} ${t('common.lakhs', 'Lakhs')}` : 'Not available'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 gap-2">
                <span className="text-[#707A8C] truncate">Total Monthly Outflows</span>
                <span className="font-bold text-[#F8FAFC] shrink-0">
                  {analysis ? `₹${(analysis.financials.totalMonthlyExpenses / 100000).toFixed(2)} ${t('common.lakhs', 'Lakhs')}` : 'Not available'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 gap-2">
                <span className="text-[#707A8C] truncate">Net Monthly Cash Flow</span>
                <span className="font-bold text-emerald-400 shrink-0">
                  {analysis ? `₹${(analysis.financials.monthlyNetCashFlow / 100000).toFixed(2)} ${t('common.lakhs', 'Lakhs')}` : 'Not available'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 gap-2">
                <span className="text-[#707A8C] truncate">Estimated Borrowing Capacity</span>
                <span className="font-bold text-[#8B5CF6] shrink-0">{creditLimit}</span>
              </div>
            </div>
          </div>

          {/* Ground-truth Preparation Checklist Summary */}
          {preparationChecklist.length > 0 && (
            <div className="p-4 sm:p-5 rounded-xl bg-[#0F1219] border border-[#222936] shadow-sm space-y-3 min-w-0">
              <h4 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-[#8B5CF6]" />
                {t('funding.checklistTitle', 'Loan Application Preparation Checklist')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs min-w-0">
                {preparationChecklist.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-2.5 rounded-lg bg-[#121722] border border-[#222936] flex items-start justify-between gap-2 min-w-0"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-medium text-[#F8FAFC] truncate">{item.title}</div>
                      <div className="text-[10px] text-[#707A8C] line-clamp-2">{item.details}</div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      item.status === 'provided'
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                        : item.status === 'incomplete'
                        ? 'bg-amber-950/40 text-amber-400 border border-amber-500/30'
                        : 'bg-[#161C27] text-[#707A8C] border border-[#222936]'
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
          <div className="p-4 sm:p-5 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 space-y-3 min-w-0">
            <h4 className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
              {t('passport.howToImprove', 'How to Improve Your Profile')}
            </h4>
            <div className="space-y-2 text-xs">
              {improvementActions.map((act, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-[#121722] border border-[#8B5CF6]/20 shadow-sm flex items-start gap-2 text-[#F8FAFC] min-w-0">
                  <span className="text-[#8B5CF6] font-bold shrink-0">•</span>
                  <span className="leading-relaxed">{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Connected Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 border-t border-[#222936] min-w-0">
            <span className="text-[11px] text-[#707A8C]">
              {language === 'ta' ? 'அடுத்த மூலோபாய நடவடிக்கைகள்:' : 'Next strategic actions:'}
            </span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs w-full sm:w-auto">
              {onNavigate && (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate('decision-lab');
                    }}
                    className="w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded-lg bg-[#161C27] hover:bg-[#171D29] text-[#F8FAFC] font-semibold flex items-center justify-center gap-1.5 border border-[#222936] transition-all"
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    <span>{t('passport.testLoanImpact', 'Test Loan Impact in Decision Lab')}</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate('ai-assistant');
                    }}
                    className="w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded-lg bg-[#161C27] hover:bg-[#171D29] text-[#F8FAFC] font-semibold flex items-center justify-center gap-1.5 border border-[#222936] transition-all"
                  >
                    <Bot className="w-3.5 h-3.5 text-[#14B8A6]" />
                    <span>{t('passport.askAiAdvisor', 'Consult AI Advisor')}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Institutional Regulatory Disclaimer */}
          <div className="p-3 rounded-xl bg-[#0F1219] border border-[#222936] flex items-start gap-2.5 text-xs text-[#707A8C] min-w-0">
            <Info className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong className="text-[#A7B0C0] font-semibold">{language === 'ta' ? 'அறிவிப்பு: ' : 'Disclaimer: '}</strong>
              {language === 'ta' 
                ? 'இது ஒரு சுட்டிக்காட்டும் வணிக நுண்ணறிவு மதிப்பீடு மட்டுமே, அதிகாரப்பூர்வ கடன் பணியக அறிக்கை அல்லது கடன் வழங்கும் முடிவு அல்ல.'
                : 'This is an indicative business intelligence assessment, not an official credit bureau report or lender decision.'}
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#0F1219] border-t border-[#222936] flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-xs shrink-0">
          <span className="text-[#707A8C] text-[10px] sm:text-[11px] text-center sm:text-left">
            {t('passport.confidential', 'CONFIDENTIAL • Generated by BizPilot AI Financial Intelligence')}
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#161C27] hover:bg-[#171D29] text-[#F8FAFC] border border-[#222936] font-semibold transition-all text-center"
          >
            {t('common.close', 'Close')}
          </button>
        </div>

      </div>
    </div>
  );
};
