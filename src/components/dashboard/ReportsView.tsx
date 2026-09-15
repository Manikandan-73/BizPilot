import React, { useMemo, useState } from 'react';
import { MSMEProfile } from '../../types';
import { BusinessAnalysis, Organization } from '../../types/business';
import { analyzeBusiness } from '../../analytics/financialAnalysis';
import { useLanguage } from '../../i18n/LanguageContext';
import { useSubscription } from '../../hooks/useSubscription';
import { hasFeature } from '../../config/plans';
import { generateBusinessReport, BusinessIntelligenceReport } from '../../analytics/reportGenerator';
import { 
  FolderDown, 
  Printer, 
  Share2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Lock, 
  ArrowRight, 
  TrendingUp, 
  ShieldAlert, 
  Calendar, 
  Landmark, 
  Zap, 
  Bot, 
  FlaskConical, 
  Layers,
  FileCheck2,
  RefreshCw,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReportsViewProps {
  profile: MSMEProfile;
  analysis?: BusinessAnalysis;
  organization?: Organization | null;
  onNavigate?: (tab: any) => void;
  onOpenPassport?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  profile,
  analysis,
  organization,
  onNavigate,
  onOpenPassport
}) => {
  const { t, language } = useLanguage();
  const { subscription } = useSubscription({ organization });
  
  // Entitlement checks
  const isPro = hasFeature(subscription, 'detailedReport');
  const canExport = hasFeature(subscription, 'exportReports');

  const [isGenerating, setIsGenerating] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

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

  // Generate deterministic report object
  const report: BusinessIntelligenceReport = useMemo(() => {
    return generateBusinessReport(
      effectiveAnalysis,
      profile,
      organization,
      isPro,
      language === 'ta' ? 'ta' : 'en'
    );
  }, [effectiveAnalysis, profile, organization, isPro, language]);

  // Handle Refresh / Regenerate
  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      confetti({ particleCount: 40, spread: 45, origin: { y: 0.6 } });
    }, 600);
  };

  // Handle PDF Export / Print
  const handleExportPDF = () => {
    if (!canExport) {
      if (onNavigate) onNavigate('billing');
      return;
    }
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    window.print();
  };

  // Handle Web Share
  const handleShare = async () => {
    if (!canExport) {
      if (onNavigate) onNavigate('billing');
      return;
    }

    const shareData = {
      title: `${report.metadata.organizationName} - Business Intelligence Report`,
      text: `BizPilot AI Business Intelligence Report for ${report.metadata.organizationName}. Financial Health Score: ${report.executiveSummary.headlineMetrics.healthScore}/100, DSCR: ${report.executiveSummary.headlineMetrics.dscrLabel}. Generated on ${report.metadata.generatedDate}.`,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        setShareSuccess(language === 'ta' ? 'அறிக்கை வெற்றிகரமாக பகிரப்பட்டது!' : 'Report shared successfully!');
        setTimeout(() => setShareSuccess(null), 3000);
      } catch (e) {
        // User cancelled or share failed
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
        setShareSuccess(language === 'ta' ? 'அறிக்கை சுருக்கம் கிளிப்போர்டில் நகலெடுக்கப்பட்டது!' : 'Report summary copied to clipboard!');
        setTimeout(() => setShareSuccess(null), 3500);
      } catch (e) {
        console.warn('Clipboard write failed:', e);
      }
    }
  };

  // Formatting helpers
  const fmtLakh = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return '—';
    return (val / 100000).toFixed(2);
  };

  const fmtCurrency = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return '—';
    return '₹' + Math.round(val).toLocaleString('en-IN');
  };

  return (
    <div className="space-y-6 pb-16 print:p-0 print:space-y-4 print:pb-0">
      
      {/* Embedded Print CSS to force crisp white document formatting */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          body, html, #root {
            background-color: #ffffff !important;
            color: #0f172a !important;
          }
          .no-print, aside, header, nav, .no-print-btn, .upgrade-banner {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .report-sheet {
            background-color: #ffffff !important;
            color: #0f172a !important;
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .report-card {
            background-color: #f8fafc !important;
            color: #0f172a !important;
            border: 1px solid #e2e8f0 !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .report-section {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-bottom: 16px !important;
          }
          .print-dark-text {
            color: #0f172a !important;
          }
          .print-muted-text {
            color: #475569 !important;
          }
          .print-border {
            border-color: #cbd5e1 !important;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}} />

      {/* Screen-Only Header Banner */}
      <div className="no-print p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>{t('reports.businessIntelligenceReport', 'Business Intelligence Report')}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              isPro ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}>
              {report.metadata.planName.toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            {report.metadata.organizationName}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            {t('reports.reportSubtitle', 'AI-powered financial analysis and actionable business insights.')}
          </p>
          
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <strong>{t('reports.generatedDate', 'Generated')}:</strong> {report.metadata.generatedDate}
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <strong>{t('reports.reportPeriod', 'Period')}:</strong> {report.metadata.reportPeriod}
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <strong>{t('reports.plan', 'Plan')}:</strong> {report.metadata.planName}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-purple-400' : ''}`} />
            <span>{isGenerating ? t('reports.generating', 'Generating...') : t('reports.generateReport', 'Generate Report')}</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('reports.exportPdf', 'Export PDF')}</span>
            {!canExport && <Lock className="w-3 h-3 text-purple-300 ml-0.5" />}
          </button>

          <button
            onClick={handleShare}
            className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span>{t('reports.share', 'Share')}</span>
            {!canExport && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
          </button>

          {onOpenPassport && (
            <button
              onClick={onOpenPassport}
              className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-purple-500/30 transition-all"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-purple-400" />
              <span>{t('reports.creditPassportBtn', 'MSME Credit Passport')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Share Toast */}
      {shareSuccess && (
        <div className="no-print p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{shareSuccess}</span>
        </div>
      )}

      {/* Plan Notice Strip */}
      <div className="no-print p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isPro ? 'bg-purple-400' : 'bg-sky-400'}`}></span>
          {isPro 
            ? t('reports.proNotice', 'Professional Plan — Comprehensive 14-section institutional business intelligence dossier active.')
            : t('reports.starterNotice', 'Starter Plan — Showing Basic Monthly Financial Report with core indicators.')}
        </span>
        {!isPro && onNavigate && (
          <button
            onClick={() => onNavigate('billing')}
            className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
          >
            <span>{t('reports.upgradeToPro', 'Upgrade to Professional')}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* THE OFFICIAL BUSINESS INTELLIGENCE DOSSIER (Rendered & Print Ready)       */}
      {/* ========================================================================= */}
      <div className="report-sheet bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xl print:border-none print:p-0">
        
        {/* Dedicated Print-Only Branding Header */}
        <div className="print-only border-b-2 border-slate-800 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xl font-black text-slate-900">BIZPILOT <span className="text-purple-600">AI</span></div>
              <div className="text-xs text-slate-500 uppercase font-semibold">Institutional Financial Intelligence Platform</div>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">{report.metadata.organizationName}</h1>
              <div className="text-xs text-slate-600">{report.metadata.industry} • {report.metadata.location}</div>
            </div>
            <div className="text-right text-xs text-slate-600 space-y-0.5">
              <div><strong>Report:</strong> Business Intelligence Dossier</div>
              <div><strong>Period:</strong> {report.metadata.reportPeriod}</div>
              <div><strong>Generated:</strong> {report.metadata.generatedDate}</div>
              <div><strong>Classification:</strong> Confidential Management Report</div>
            </div>
          </div>
        </div>

        {/* 1. COVER / EXECUTIVE SUMMARY */}
        <section className="report-section space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 print:text-purple-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              1. {t('reports.executiveSummary', 'Cover & Executive Summary')}
            </h2>
            <span className="text-xs text-slate-500 print:text-slate-600 font-mono">SEC-01</span>
          </div>

          <div className="report-card p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-slate-800">
              {language === 'ta' ? 'வணிக நோய் கண்டறிதல் (Business Diagnosis)' : 'Executive Financial Diagnosis'}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 print:text-slate-800 leading-relaxed font-sans">
              {report.executiveSummary.diagnosis}
            </p>
          </div>

          {/* Key KPI Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="report-card p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 print:text-slate-600 font-medium">Monthly Revenue</div>
              <div className="text-lg font-bold text-white print:text-slate-900 mt-1">₹{fmtLakh(report.executiveSummary.headlineMetrics.monthlyRevenue)}L</div>
              <div className="text-[10px] text-slate-500 font-mono">₹{fmtLakh(report.executiveSummary.headlineMetrics.annualRevenue)}L /yr</div>
            </div>

            <div className="report-card p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 print:text-slate-600 font-medium">Operating EBITDA</div>
              <div className="text-lg font-bold text-emerald-400 print:text-emerald-700 mt-1">₹{fmtLakh(report.executiveSummary.headlineMetrics.monthlyEbitda)}L</div>
              <div className="text-[10px] text-emerald-400/80 font-mono">{report.executiveSummary.headlineMetrics.operatingMarginPercent}% EBITDA</div>
            </div>

            <div className="report-card p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 print:text-slate-600 font-medium">Cash Runway</div>
              <div className="text-lg font-bold text-purple-300 print:text-purple-800 mt-1">{report.executiveSummary.headlineMetrics.cashRunwayMonths ?? '—'} mo</div>
              <div className="text-[10px] text-slate-500 font-mono">Audited reserve</div>
            </div>

            <div className="report-card p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 print:text-slate-600 font-medium">Debt Service (DSCR)</div>
              <div className="text-lg font-bold text-sky-400 print:text-sky-800 mt-1">{report.executiveSummary.headlineMetrics.dscrLabel}</div>
              <div className="text-[10px] text-slate-500 font-mono">Coverage ratio</div>
            </div>
          </div>
        </section>

        {/* 2. FINANCIAL PERFORMANCE */}
        <section className="report-section space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 print:text-purple-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              2. {t('reports.financialPerformance', 'Financial Performance')}
            </h2>
            <span className="text-xs text-slate-500 print:text-slate-600 font-mono">SEC-02</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-600 uppercase font-semibold">
                  <th className="py-2.5 px-3">Metric</th>
                  <th className="py-2.5 px-3">Monthly Value</th>
                  <th className="py-2.5 px-3">Annualized Run-Rate</th>
                  <th className="py-2.5 px-3">Margin / Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-semibold text-white print:text-slate-900">Gross Operating Revenue</td>
                  <td className="py-2.5 px-3 text-slate-200 print:text-slate-800">₹{fmtLakh(report.financialPerformance.monthlyRevenue)} Lakhs</td>
                  <td className="py-2.5 px-3 text-slate-300 print:text-slate-700">₹{fmtLakh(report.financialPerformance.annualRevenue)} Lakhs</td>
                  <td className="py-2.5 px-3 text-slate-400">100.0% Base</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-semibold text-white print:text-slate-900">Total Operating Expenses (OPEX + COGS)</td>
                  <td className="py-2.5 px-3 text-slate-200 print:text-slate-800">₹{fmtLakh(report.financialPerformance.monthlyExpenses)} Lakhs</td>
                  <td className="py-2.5 px-3 text-slate-300 print:text-slate-700">₹{fmtLakh(report.financialPerformance.annualExpenses)} Lakhs</td>
                  <td className="py-2.5 px-3 text-slate-400">{Math.round((report.financialPerformance.monthlyExpenses / (report.financialPerformance.monthlyRevenue || 1)) * 100)}% of Rev</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-semibold text-white print:text-slate-900">Gross Profit (Revenue - Material)</td>
                  <td className="py-2.5 px-3 text-slate-200 print:text-slate-800">₹{fmtLakh(report.financialPerformance.monthlyGrossProfit)} Lakhs</td>
                  <td className="py-2.5 px-3 text-slate-300 print:text-slate-700">₹{fmtLakh(report.financialPerformance.monthlyGrossProfit * 12)} Lakhs</td>
                  <td className="py-2.5 px-3 text-emerald-400 print:text-emerald-700 font-semibold">{report.financialPerformance.grossMarginPercent}% Gross</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-semibold text-white print:text-slate-900">Operating EBITDA</td>
                  <td className="py-2.5 px-3 text-emerald-400 print:text-emerald-700 font-semibold">₹{fmtLakh(report.financialPerformance.monthlyEbitda)} Lakhs</td>
                  <td className="py-2.5 px-3 text-emerald-400 print:text-emerald-700">₹{fmtLakh(report.financialPerformance.annualEbitda)} Lakhs</td>
                  <td className="py-2.5 px-3 text-emerald-400 print:text-emerald-700 font-semibold">{report.financialPerformance.operatingMarginPercent}% EBITDA</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-semibold text-white print:text-slate-900">Net Profit (After EMI / Debt Outflows)</td>
                  <td className="py-2.5 px-3 text-sky-400 print:text-sky-800 font-semibold">₹{fmtLakh(report.financialPerformance.monthlyNetProfit)} Lakhs</td>
                  <td className="py-2.5 px-3 text-sky-400 print:text-sky-800 font-semibold">₹{fmtLakh(report.financialPerformance.annualNetProfit)} Lakhs</td>
                  <td className="py-2.5 px-3 text-sky-400 print:text-sky-800 font-semibold">{report.financialPerformance.netMarginPercent}% Net</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 print:text-slate-600 italic">
            * {report.financialPerformance.trendNotice}
          </div>
        </section>

        {/* 3. FINANCIAL HEALTH */}
        <section className="report-section space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 print:text-purple-700 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              3. {t('reports.financialHealth', 'Financial Health')}
            </h2>
            <span className="text-xs text-slate-500 print:text-slate-600 font-mono">SEC-03</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="report-card p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center flex flex-col justify-center">
              <div className="text-xs text-slate-400 print:text-slate-600 font-semibold">Overall Health Score</div>
              <div className="text-3xl font-black text-purple-400 print:text-purple-700 mt-2">{report.financialHealth.overallScore}<span className="text-xs text-slate-500">/100</span></div>
              <div className="text-xs text-emerald-400 print:text-emerald-700 font-bold mt-1">{report.financialHealth.rating}</div>
            </div>

            <div className="sm:col-span-3 space-y-2">
              {report.financialHealth.pillars.map((pillar, idx) => (
                <div key={idx} className="report-card p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white print:text-slate-900">{pillar.category}</div>
                    <div className="text-[11px] text-slate-400 print:text-slate-600">{pillar.insight}</div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className="text-xs font-bold text-purple-300 print:text-purple-800">{pillar.score}/100</span>
                    <div className="text-[10px] text-slate-500">{pillar.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. CASH FLOW & RUNWAY */}
        <section className="report-section space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 print:text-purple-700 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              4. {t('reports.cashFlow', 'Cash Flow & Runway')}
            </h2>
            <span className="text-xs text-slate-500 print:text-slate-600 font-mono">SEC-04</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="report-card p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 print:text-slate-600">Net Monthly Cash Flow</div>
              <div className={`text-base font-bold mt-1 ${report.cashFlow.monthlyNetCashFlow >= 0 ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-rose-700'}`}>
                {report.cashFlow.monthlyNetCashFlow >= 0 ? '+' : ''}₹{fmtLakh(report.cashFlow.monthlyNetCashFlow)} Lakhs
              </div>
            </div>

            <div className="report-card p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 print:text-slate-600">Liquid Cash Balance</div>
              <div className="text-base font-bold text-white print:text-slate-900 mt-1">₹{fmtLakh(report.cashFlow.currentCashBalance)} Lakhs</div>
            </div>

            <div className="report-card p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 print:text-slate-600">Receivables (AR)</div>
              <div className="text-base font-bold text-amber-300 print:text-amber-700 mt-1">₹{fmtLakh(report.cashFlow.accountsReceivable)} Lakhs</div>
            </div>

            <div className="report-card p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 print:text-slate-600">Payables (AP)</div>
              <div className="text-base font-bold text-slate-300 print:text-slate-700 mt-1">₹{fmtLakh(report.cashFlow.accountsPayable)} Lakhs</div>
            </div>
          </div>

          {/* 6-Month Projection Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-600 font-semibold">
                  <th className="py-2 px-3">Forecast Window</th>
                  <th className="py-2 px-3">Projected Inflow</th>
                  <th className="py-2 px-3">Projected Outflow</th>
                  <th className="py-2 px-3">Net Cash Generated</th>
                  <th className="py-2 px-3">Estimated Ending Cash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 print:divide-slate-200 font-mono">
                {report.cashFlow.projected6MonthCash.slice(0, 4).map((p, pIdx) => (
                  <tr key={pIdx} className="hover:bg-slate-800/20">
                    <td className="py-2 px-3 text-white print:text-slate-900 font-sans">{p.month}</td>
                    <td className="py-2 px-3 text-slate-300 print:text-slate-700">₹{fmtLakh(p.inflow)}L</td>
                    <td className="py-2 px-3 text-slate-300 print:text-slate-700">₹{fmtLakh(p.outflow)}L</td>
                    <td className={`py-2 px-3 font-bold ${p.netCash >= 0 ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-rose-700'}`}>
                      {p.netCash >= 0 ? '+' : ''}₹{fmtLakh(p.netCash)}L
                    </td>
                    <td className="py-2 px-3 text-purple-300 print:text-purple-800">₹{fmtLakh(p.projectedEndingBalance)}L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 print:text-slate-600 italic">
            * {report.cashFlow.forecastDisclaimer}
          </div>
        </section>

        {/* 5. DEBT & SERVICEABILITY */}
        <section className="report-section space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 print:text-purple-700 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-purple-400" />
              5. {t('reports.debtServiceability', 'Debt & Serviceability')}
            </h2>
            <span className="text-xs text-slate-500 print:text-slate-600 font-mono">SEC-05</span>
          </div>

          <div className="report-card p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-300 print:text-slate-800">
              {report.debtServiceability.dscrExplanation}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
              <div>
                <div className="text-[11px] text-slate-400 print:text-slate-600">Monthly EMI</div>
                <div className="text-base font-bold text-white print:text-slate-900">₹{fmtLakh(report.debtServiceability.monthlyEmi)} Lakhs</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 print:text-slate-600">Annual Debt Service</div>
                <div className="text-base font-bold text-white print:text-slate-900">₹{fmtLakh(report.debtServiceability.annualDebtService)} Lakhs</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 print:text-slate-600">DSCR Coverage</div>
                <div className="text-base font-bold text-emerald-400 print:text-emerald-700">
                  {report.debtServiceability.dscr ? `${report.debtServiceability.dscr}x` : 'Debt-Free'}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 print:text-slate-600">EMI Burden Ratio</div>
                <div className="text-base font-bold text-purple-300 print:text-purple-800">
                  {report.debtServiceability.emiBurdenRatio ? `${report.debtServiceability.emiBurdenRatio}%` : '0%'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. WORKING CAPITAL */}
        <section className="report-section space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 print:text-purple-700 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              6. {t('reports.workingCapital', 'Working Capital')}
            </h2>
            <span className="text-xs text-slate-500 print:text-slate-600 font-mono">SEC-06</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="report-card p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 print:text-slate-600">Working Capital Net</div>
              <div className="text-base font-bold text-white print:text-slate-900 mt-1">
                {report.workingCapital.workingCapital !== null ? `₹${fmtLakh(report.workingCapital.workingCapital)}L` : 'Not enough data'}
              </div>
            </div>

            <div className="report-card p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 print:text-slate-600">Current Ratio</div>
              <div className="text-base font-bold text-emerald-400 print:text-emerald-700 mt-1">
                {report.workingCapital.currentRatio !== null ? `${report.workingCapital.currentRatio}x` : 'Not enough data'}
              </div>
            </div>

            <div className="report-card p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 print:text-slate-600">Quick Ratio</div>
              <div className="text-base font-bold text-sky-400 print:text-sky-800 mt-1">
                {report.workingCapital.quickRatio !== null ? `${report.workingCapital.quickRatio}x` : 'Not enough data'}
              </div>
            </div>

            <div className="report-card p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 print:text-slate-600">Inventory Value</div>
              <div className="text-base font-bold text-slate-300 print:text-slate-700 mt-1">
                {report.workingCapital.inventoryValue !== null ? `₹${fmtLakh(report.workingCapital.inventoryValue)}L` : 'Not enough data'}
              </div>
            </div>
          </div>
        </section>

        {/* 7. FUNDING READINESS */}
        <section className="report-section space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 print:text-purple-700 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-purple-400" />
              7. {t('reports.fundingReadiness', 'Funding Readiness')}
            </h2>
            <span className="text-xs text-slate-500 print:text-slate-600 font-mono">SEC-07</span>
          </div>

          <div className="report-card p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs text-slate-400 print:text-slate-600">Institutional Underwriting Readiness</div>
                <div className="text-lg font-bold text-white print:text-slate-900 mt-0.5">
                  Tier: <span className="text-emerald-400 print:text-emerald-700">{report.fundingReadiness.eligibilityTier}</span> • Limit: <span className="text-purple-300 print:text-purple-800">{report.fundingReadiness.estimatedCreditLimit}</span>
                </div>
              </div>
              <div className="text-xs font-mono px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 print:text-purple-800">
                Score: {report.fundingReadiness.overallScore}/100
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
              <div className="text-xs text-slate-300 print:text-slate-700">
                GST Registered: <strong className="text-emerald-400">Yes</strong>
              </div>
              <div className="text-xs text-slate-300 print:text-slate-700">
                ITR Track Record: <strong className="text-emerald-400">Verified</strong>
              </div>
              <div className="text-xs text-slate-300 print:text-slate-700">
                Current Account: <strong className="text-emerald-400">Active</strong>
              </div>
              <div className="text-xs text-slate-300 print:text-slate-700">
                CGTMSE Fit: <strong className="text-purple-400">Eligible</strong>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 print:text-slate-600 italic pt-1">
              * {report.fundingReadiness.disclaimer}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PROFESSIONAL-TIER SECTIONS (Gated for Starter users)                    */}
        {/* ========================================================================= */}

        {!isPro ? (
          /* Elegant Starter Upgrade Card */
          <div className="no-print p-8 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/40 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-6 h-6 text-purple-400" />
            </div>
            <div className="space-y-1 max-w-lg mx-auto">
              <h3 className="text-lg font-bold text-white">
                {t('reports.unlockFullReport', 'Unlock the full Business Intelligence Report')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('reports.unlockDescription', 'Get AI-powered recommendations, scenario analysis, detailed risk insights and export capabilities with Professional.')}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate && onNavigate('billing')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all inline-flex items-center gap-2"
              >
                <span>{t('reports.upgradeToPro', 'Upgrade to Professional')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Full Professional Dossier Sections */
          <>
            {/* 8. GROWTH INTELLIGENCE */}
            <section className="report-section space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 print:text-purple-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  8. {t('reports.growthIntelligence', 'Growth Intelligence')}
                </h2>
                <span className="text-xs text-slate-500 print:text-slate-600 font-mono">SEC-08 (PRO)</span>
              </div>

              <div className="space-y-2.5">
                {report.growthIntelligence.topOpportunities.map((opp, idx) => (
                  <div key={idx} className="report-card p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white print:text-slate-900">{opp.opportunity}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        opp.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' :
                        opp.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                        'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {opp.priority}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 print:text-slate-700">{opp.why}</div>
                    <div className="text-[11px] text-emerald-400 print:text-emerald-700 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Impact: {opp.expectedImpact} • Next: {opp.suggestedAction}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 9. RISK ANALYSIS */}
            <section className="report-section space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 print:text-purple-700 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  9. {t('reports.riskAnalysis', 'Risk Analysis')}
                </h2>
                <span className="text-xs text-slate-500 print:text-slate-600 font-mono">SEC-09 (PRO)</span>
              </div>

              <div className="space-y-2.5">
                {report.riskAnalysis.keyRisks.map((rk, idx) => (
                  <div key={idx} className="report-card p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white print:text-slate-900">{rk.riskName}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        rk.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}>
                        {rk.severity}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 print:text-slate-700"><strong>Telemetry:</strong> {rk.metricContext}</div>
                    <div className="text-xs text-slate-400 print:text-slate-600">{rk.impactExplanation}</div>
                    <div className="text-[11px] text-purple-300 print:text-purple-800 font-semibold">Mitigation: {rk.mitigationStep}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* 10. DECISION LAB INSIGHTS */}
            <section className="report-section space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 print:text-purple-700 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-purple-400" />
                  10. {t('reports.decisionLabInsights', 'Decision Lab Insights')}
                </h2>
                <span className="text-xs text-slate-500 print:text-slate-600 font-mono">SEC-10 (PRO)</span>
              </div>

              {report.decisionLab.hasScenarios ? (
                <div className="space-y-3">
                  {report.decisionLab.topPickSummary && (
                    <div className="report-card p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 print:text-slate-800 font-semibold">
                      {report.decisionLab.topPickSummary}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {report.decisionLab.scenarios.map((sc, sIdx) => (
                      <div key={sIdx} className="report-card p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white print:text-slate-900">{sc.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            sc.verdict === 'Recommended' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
                            sc.verdict === 'Caution' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                            'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          }`}>
                            {sc.verdict}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 print:text-slate-700 flex justify-between">
                          <span>Simulated Rev: <strong>₹{fmtLakh(sc.simulatedRevenue)}L</strong></span>
                          <span>Score: <strong>{sc.scenarioScore}/100</strong></span>
                        </div>
                        <div className="text-[11px] text-slate-400 print:text-slate-600">{sc.comparisonSummary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="report-card p-6 rounded-xl bg-slate-950/40 border border-slate-800 text-center space-y-1">
                  <div className="text-xs text-slate-400 print:text-slate-600">{report.decisionLab.emptyMessage}</div>
                  <p className="text-[11px] text-slate-500">Run simulations in the Decision Lab to automatically embed comparative financial forecasts into this report.</p>
                </div>
              )}
            </section>

            {/* 11. AI BUSINESS ADVISOR INSIGHTS */}
            <section className="report-section space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 print:text-purple-700 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  11. {t('reports.aiAdvisorInsights', 'AI Business Advisor Insights')}
                </h2>
                <span className="text-xs text-slate-500 print:text-slate-600 font-mono">SEC-11 (PRO)</span>
              </div>

              <div className="report-card p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Diagnosis</div>
                  <p className="text-xs text-slate-200 print:text-slate-800 mt-0.5">{report.aiAdvisor.diagnosis}</p>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Operational Driver</div>
                  <p className="text-xs text-slate-300 print:text-slate-700 mt-0.5">{report.aiAdvisor.why}</p>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-emerald-400 uppercase">Strategic Recommendation</div>
                  <p className="text-xs text-emerald-300 print:text-emerald-800 mt-0.5 font-medium">{report.aiAdvisor.recommendation}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <div className="text-xs text-slate-400 print:text-slate-600">
                    <strong>Expected Impact:</strong> {report.aiAdvisor.expectedImpact}
                  </div>
                  <div className="text-xs text-purple-300 print:text-purple-800">
                    <strong>Next Action:</strong> {report.aiAdvisor.nextStep}
                  </div>
                </div>
              </div>
            </section>

            {/* 12. KEY RECOMMENDATIONS */}
            <section className="report-section space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 print:text-purple-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  12. {t('reports.keyRecommendations', 'Key Recommendations')}
                </h2>
                <span className="text-xs text-slate-500 print:text-slate-600 font-mono">SEC-12 (PRO)</span>
              </div>

              <div className="space-y-2.5">
                {report.keyRecommendations.map((rec, idx) => (
                  <div key={idx} className="report-card p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white print:text-slate-900">{rec.recommendation}</div>
                      <div className="text-[11px] text-slate-400 print:text-slate-600">{rec.reason}</div>
                      <div className="text-[11px] text-purple-300 print:text-purple-800"><strong>Next Step:</strong> {rec.suggestedNextStep}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                      rec.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 13. 30-DAY ACTION PLAN */}
            <section className="report-section space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 print:text-purple-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  13. {t('reports.actionPlan30Day', '30-Day Action Plan')}
                </h2>
                <span className="text-xs text-slate-500 print:text-slate-600 font-mono">SEC-13 (PRO)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.actionPlan30Day.map((wk) => (
                  <div key={wk.weekNumber} className="report-card p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 print:text-purple-800">Week {wk.weekNumber}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{wk.focusArea}</span>
                    </div>
                    <div className="text-xs font-semibold text-white print:text-slate-900">{wk.weekTitle}</div>
                    <p className="text-[11px] text-slate-300 print:text-slate-700">{wk.primaryAction}</p>
                    <div className="text-[10px] text-emerald-400 print:text-emerald-700 font-bold">Target: {wk.metricTarget}</div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* 14. METHODOLOGY & DISCLAIMER */}
        <section className="report-section pt-4 border-t border-slate-800 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-700">
            14. {t('reports.methodology', 'Methodology & Framework')}
          </div>
          <p className="text-[11px] text-slate-400 print:text-slate-600 leading-relaxed">
            {report.methodology}
          </p>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[10px] text-slate-500 print:text-slate-600 leading-relaxed">
            <strong>{t('reports.disclaimer', 'Disclaimer')}:</strong> {report.disclaimer}
          </div>
        </section>

      </div>

    </div>
  );
};
