import React from 'react';
import { MSMEProfile } from '../../types';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  Award, 
  Building2, 
  QrCode, 
  FileCheck2, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreditPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MSMEProfile;
}

export const CreditPassportModal: React.FC<CreditPassportModalProps> = ({
  isOpen,
  onClose,
  profile
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-sky-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Official MSME Credit Passport
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  VERIFIED • FY 2026-27
                </span>
              </h3>
              <p className="text-xs text-slate-400">Institutional Bank & NBFC Underwriting Dossier</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-purple-600/30"
            >
              <Download className="w-3.5 h-3.5" />
              Download / Print PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Passport Body */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-100 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
          
          {/* Certificate Header Stamp */}
          <div className="border border-purple-500/30 bg-purple-950/20 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10">
              <ShieldCheck className="w-48 h-48 text-purple-400" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-purple-400 tracking-wider uppercase">
                  Government & Lending Ecosystem Identifier
                </span>
                <h2 className="text-2xl font-extrabold text-white mt-1">
                  {profile.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-sky-400" />
                    Udyam: <strong className="text-white ml-1">{profile.udyamNumber}</strong>
                  </span>
                  <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                    GSTIN: <strong className="text-white ml-1">{profile.gstin}</strong>
                  </span>
                  <span className="bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700 text-slate-400">
                    Est. {profile.incorporationYear} • {profile.location}
                  </span>
                </div>
              </div>

              {/* QR & Verification seal */}
              <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-lg border border-slate-800 shrink-0">
                <div className="w-16 h-16 bg-white p-1 rounded flex items-center justify-center">
                  {/* Stylized QR Code Mock */}
                  <div className="w-full h-full bg-slate-950 rounded flex flex-col items-center justify-center p-1 text-[8px] text-cyan-400 font-mono leading-none">
                    <QrCode className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Passport Hash</div>
                  <div className="text-xs font-mono text-purple-300 font-bold">#BP-IN-9824X</div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> 100% Tamper Proof
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key 4 Rating Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center">
              <div className="text-xs text-slate-400 font-medium">Business Health</div>
              <div className="text-3xl font-extrabold text-sky-400 mt-1">{profile.healthScore}<span className="text-xs text-slate-400">/100</span></div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-1">Excellent (Top 12%)</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center">
              <div className="text-xs text-slate-400 font-medium">Funding Readiness</div>
              <div className="text-3xl font-extrabold text-purple-400 mt-1">{profile.fundingReadinessScore}<span className="text-xs text-slate-400">/100</span></div>
              <div className="text-[10px] text-purple-300 font-semibold mt-1">Bankable • Tier-A</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center">
              <div className="text-xs text-slate-400 font-medium">Commercial Risk</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">CMR-3</div>
              <div className="text-[10px] text-slate-300 font-semibold mt-1">Low Probability of Default</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center">
              <div className="text-xs text-slate-400 font-medium">Eligible Credit Line</div>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">{profile.estimatedCreditLimit}</div>
              <div className="text-[10px] text-amber-300 font-semibold mt-1">Under CGTMSE Guarantee</div>
            </div>
          </div>

          {/* Financial Ratios & Underwriting Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-purple-400" /> Key Underwriting Ratios
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Debt Service Coverage Ratio (DSCR)</span>
                  <span className="font-semibold text-emerald-400">{profile.dscrRatio}x (Healthy &gt; 1.25x)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Annual Turnover (GST Verified)</span>
                  <span className="font-semibold text-white">{profile.turnover}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Cash Flow Stability Index</span>
                  <span className="font-semibold text-sky-400">{profile.cashFlowStability}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Cash Runway Horizon</span>
                  <span className="font-semibold text-white">{profile.runwayMonths} Months</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-400" /> AI Auditor Endorsement
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                "Based on 24 months of GSTR-3B filings and 12-month verified bank reconciliation, {profile.name} demonstrates strong margin predictability, disciplined tax hygiene, and superior debt-servicing ability."
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                  ✓ 100% On-time GST
                </span>
                <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded">
                  ✓ Zero Cheque Bounces
                </span>
                <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded">
                  ✓ Pre-Approved for PSB59
                </span>
              </div>
            </div>
          </div>

          {/* Footer certification stamp */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <div>
              Generated via <strong>BizPilot AI Intelligence Engine</strong> • Recognized by MSME Lending Partners
            </div>
            <div className="text-slate-500">
              Valid through: March 2027 • Ref: BP-PASSPORT-2026-09
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
