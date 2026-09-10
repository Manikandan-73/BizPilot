import React, { useState } from 'react';
import { MSMEProfile, ReportItem } from '../../types';
import { REPORTS_LIST } from '../../data/mockData';
import { 
  FolderDown, 
  FileText, 
  Download, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Eye,
  Layers,
  FileCheck2,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReportsViewProps {
  profile: MSMEProfile;
  onOpenPassport: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  profile,
  onOpenPassport
}) => {
  const [reports, setReports] = useState<ReportItem[]>(REPORTS_LIST);
  const [previewingReport, setPreviewingReport] = useState<ReportItem | null>(null);

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
            Auto-generate exportable PDF dossiers for venture capital teasers, PSB59 bank loan sanctions, and working capital audits.
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
            className="p-6 rounded-2xl bg-slate-900/85 border border-slate-800 hover:border-purple-500/40 transition-all space-y-4 flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                  {rep.category}
                </span>
                <span className="text-xs text-slate-400">{rep.fileSize}</span>
              </div>

              <h3 className="text-base font-bold text-white leading-snug">
                {rep.title}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed">
                {rep.subtitle}
              </p>

              {/* Highlights tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {rep.highlights.map((hl, hIdx) => (
                  <span key={hIdx} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {hl}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Generated: {rep.generatedDate}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewingReport(rep)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
                <button
                  onClick={() => handleDownloadReport(rep)}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Report Preview Modal */}
      {previewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{previewingReport.title}</h3>
                  <p className="text-xs text-slate-400">Target Entity: {profile.name} • {profile.turnover}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewingReport(null)}
                className="text-slate-400 hover:text-white text-sm font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4 text-xs text-slate-300">
              <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-800">
                <span className="font-bold text-purple-400">BIZPILOT EXECUTIVE DOSSIER</span>
                <span className="text-slate-500 font-mono">ID: {previewingReport.id.toUpperCase()}</span>
              </div>
              <p className="leading-relaxed">
                <strong>Executive Summary:</strong> {profile.name} (UDYAM: {profile.udyamNumber}) is evaluated across 24-month audited financial metrics, tax filings, and liquidity models. The company demonstrates an audited Health Score of <strong>{profile.healthScore}/100</strong> and a Flagship Funding Readiness Score of <strong>{profile.fundingReadinessScore}/100</strong>.
              </p>
              <div className="grid grid-cols-3 gap-3 py-2 text-center">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">DSCR Coverage</div>
                  <div className="font-bold text-white text-sm">{profile.dscrRatio}x</div>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">CIBIL Commercial</div>
                  <div className="font-bold text-emerald-400 text-sm">CMR-3 (768)</div>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Working Capital Limit</div>
                  <div className="font-bold text-sky-400 text-sm">{profile.estimatedCreditLimit}</div>
                </div>
              </div>
              <p className="leading-relaxed text-slate-400">
                <strong>Lender Recommendation:</strong> Pre-qualified for fast-track credit lines with zero collateral requirements under CGTMSE guarantee protocol.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPreviewingReport(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Close Preview
              </button>
              <button
                onClick={() => handleDownloadReport(previewingReport)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
              >
                <Download className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
