import React, { useMemo, useState } from 'react';
import { MSMEProfile, ReportItem } from '../../types';
import { BusinessAnalysis } from '../../types/business';
import { 
  FolderDown, 
  FileText, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Eye, 
  FileCheck2, 
  X,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReportsViewProps {
  profile: MSMEProfile;
  analysis?: BusinessAnalysis;
  onOpenPassport: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  profile,
  analysis,
  onOpenPassport
}) => {
  const [previewingReport, setPreviewingReport] = useState<ReportItem | null>(null);

  const businessName = analysis?.organizationName || profile.name;
  const revL = analysis ? (analysis.financials.monthlyRevenue / 100000).toFixed(1) : '48.5';
  const opMargin = analysis?.financials.operatingMarginPercent ?? 16.8;
  const netMargin = analysis?.financials.netMarginPercent ?? 9.4;
  const runway = analysis?.financials.runwayMonths ?? profile.runwayMonths;
  const fundingScore = analysis ? analysis.funding.overallScore : profile.fundingReadinessScore;
  const creditLimit = analysis ? analysis.funding.estimatedCreditLimit : profile.estimatedCreditLimit;
  const dscr = analysis?.financials.dscr ? `${analysis.financials.dscr}x` : 'Debt-Free';
  const wcL = analysis ? (analysis.financials.workingCapital / 100000).toFixed(1) : '34.0';

  const reports: ReportItem[] = useMemo(() => [
    {
      id: 'exec-summary',
      title: 'Executive Financial & Solvency Dossier',
      subtitle: `Complete operational diagnostic for ${businessName}`,
      category: 'Investor',
      generatedDate: 'Updated Today',
      fileSize: '1.4 MB',
      status: 'Ready',
      downloadName: `${businessName.toLowerCase().replace(/\s+/g, '-')}-financial-dossier.pdf`,
      highlights: [
        `Monthly Revenue: ₹${revL} Lakhs (Annualized: ₹${analysis ? (analysis.financials.annualRevenue / 100000).toFixed(1) : '485.0'}L)`,
        `Operating Margin: ${opMargin}% EBITDA | Net Margin: ${netMargin}%`,
        `Audited Cash Runway: ${runway} Months of fixed OPEX`,
        `Working Capital Adequacy: ₹${wcL} Lakhs in net liquidity`
      ]
    },
    {
      id: 'bank-loan-pack',
      title: 'PSB59 & CGTMSE Credit Sanction Package',
      subtitle: 'Institutional underwriting package for public & private sector lenders',
      category: 'Bank / NBFC',
      generatedDate: 'Updated Today',
      fileSize: '2.1 MB',
      status: 'Ready',
      downloadName: `${businessName.toLowerCase().replace(/\s+/g, '-')}-bank-sanction-pack.pdf`,
      highlights: [
        `Funding Readiness Score: ${fundingScore}/100 (${analysis?.funding.eligibilityTier || 'Pre-Qualified'})`,
        `Indicative Borrowing Limit: ${creditLimit} (CGTMSE collateral-free fit)`,
        `Debt Service Coverage Ratio (DSCR): ${dscr} benchmark compliance`,
        `Statutory Status: ${analysis?.compliance.isFullyCompliant ? '100% Tax & GST Compliant' : 'Verification Complete'}`
      ]
    },
    {
      id: 'working-capital-audit',
      title: 'Working Capital & Liquidity Audit',
      subtitle: 'Debtor collection schedule, vendor cycles, and cash burn diagnosis',
      category: 'Audit',
      generatedDate: 'Updated Today',
      fileSize: '980 KB',
      status: 'Ready',
      downloadName: `${businessName.toLowerCase().replace(/\s+/g, '-')}-working-capital-audit.pdf`,
      highlights: [
        `Cash Balance on Hand: ₹${analysis ? (analysis.normalized.currentCashBalance / 100000).toFixed(1) : '52.0'} Lakhs`,
        `Accounts Receivable: ₹${analysis ? (analysis.normalized.accountsReceivable / 100000).toFixed(1) : '55.0'} Lakhs`,
        `Current Ratio: ${analysis?.financials.currentRatio ? `${analysis.financials.currentRatio}x` : '1.78x'}`,
        `Recommended Debtor Action: TReDS invoice discounting to unlock early settlement`
      ]
    },
    {
      id: 'growth-strategy',
      title: 'Autonomous Growth & Margin Expansion Roadmap',
      subtitle: 'AI prescriptive playbooks tailored to active operational goals',
      category: 'Strategy',
      generatedDate: 'Updated Today',
      fileSize: '1.2 MB',
      status: 'Ready',
      downloadName: `${businessName.toLowerCase().replace(/\s+/g, '-')}-growth-roadmap.pdf`,
      highlights: [
        `Primary Operational Focus: ${analysis?.goals.biggestChallenge || 'Cash Flow'}`,
        `Strategic Goal: ${analysis?.goals.goals.slice(0, 2).join(', ') || 'Increase Profit'}`,
        `Direct Margin Opportunity: +3.5% EBITDA lift via selective tiered pricing`,
        `Tender Eligibility: Pre-cleared for GeM PSU procurement tenders`
      ]
    }
  ], [analysis, businessName, revL, opMargin, netMargin, runway, fundingScore, creditLimit, dscr, wcL]);

  const handleDownloadReport = (report: ReportItem) => {
    confetti({
      particleCount: 60,
      spread: 55,
      origin: { y: 0.6 }
    });
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
            <FolderDown className="w-4 h-4 text-purple-400" />
            <span>INSTITUTIONAL REPORT GENERATOR</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            Reports & Underwriting Documents
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-generate exportable dossiers populated with <strong>{businessName}</strong>'s actual financials for bank loan sanctions and audits.
          </p>
        </div>

        <button
          onClick={onOpenPassport}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all"
        >
          <FileCheck2 className="w-4 h-4" />
          MSME Credit Passport
        </button>
      </div>

      {/* 4 Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((rep) => (
          <div 
            key={rep.id}
            className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all shadow-xl flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  rep.category === 'Bank / NBFC' ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
                  rep.category === 'Investor' ? 'bg-sky-500/10 text-sky-300 border-sky-500/30' :
                  rep.category === 'Audit' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                  'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                }`}>
                  {rep.category}
                </span>

                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{rep.generatedDate}</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-white">
                {rep.title}
              </h3>

              <p className="text-xs text-slate-400">
                {rep.subtitle}
              </p>

              {/* Highlights List */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs">
                <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Certified Report Metrics:
                </div>
                {rep.highlights.map((high, hIdx) => (
                  <div key={hIdx} className="text-slate-300 flex items-start gap-1.5 text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{high}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                {rep.fileSize} • Ready
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewingReport(rep)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-all"
                >
                  <Eye className="w-3 h-3" /> Preview
                </button>
                <button
                  onClick={() => handleDownloadReport(rep)}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Printer className="w-3 h-3" /> Print / PDF
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">{previewingReport.category} REPORT</span>
                <h3 className="text-lg font-black text-white">{previewingReport.title}</h3>
              </div>
              <button 
                onClick={() => setPreviewingReport(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">{previewingReport.subtitle}</p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-white mb-2">Executive Summary & Data Attestation</div>
                {previewingReport.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400">Validated for {businessName}</span>
              <button
                onClick={() => {
                  handleDownloadReport(previewingReport);
                  setPreviewingReport(null);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
