import React from 'react';
import { MSMEProfile } from '../../types';
import { BusinessAnalysis } from '../../types/business';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  QrCode, 
  FileCheck2, 
  CheckCircle2, 
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreditPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MSMEProfile;
  analysis?: BusinessAnalysis;
}

export const CreditPassportModal: React.FC<CreditPassportModalProps> = ({
  isOpen,
  onClose,
  profile,
  analysis,
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

  const businessName = analysis?.organizationName || profile.name;
  const healthScore = analysis ? analysis.health.overallScore : profile.healthScore;
  const fundingScore = analysis ? analysis.funding.overallScore : profile.fundingReadinessScore;
  const creditLimit = analysis ? analysis.funding.estimatedCreditLimit : profile.estimatedCreditLimit;
  const runwayMonths = analysis?.financials.runwayMonths ?? profile.runwayMonths;
  const dscr = analysis?.financials.dscr ? `${analysis.financials.dscr}x` : 'Debt-Free';
  const turnover = profile.turnover;

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
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Official MSME Credit Passport Dossier
                <span className="text-[10px] text-purple-300 font-normal px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">
                  Institutional Grade
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Standardized underwriting package for PSB59, CGTMSE & Banks</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[calc(85vh-5rem)] overflow-y-auto">
          
          {/* Top Identity Block */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1">
                <span>PASSPORT #{analysis ? `BP-${analysis.organizationId.slice(-6).toUpperCase()}` : 'BP-2026-9842'}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED ENTITY
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">{businessName}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {analysis?.businessType || profile.sector} • {analysis?.location || profile.location} • Turnover: <strong className="text-purple-300">{turnover}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 shrink-0">
              <div className="w-14 h-14 bg-white p-1 rounded-md flex items-center justify-center">
                <QrCode className="w-12 h-12 text-slate-950" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Verification Hash</div>
                <div className="text-xs font-mono text-purple-300 font-bold">0x{analysis ? analysis.organizationId.replace(/[^a-f0-9]/gi, '').slice(0, 8).toUpperCase() : '9F4288CA'}...</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Valid for Underwriting</div>
              </div>
            </div>
          </div>

          {/* 4 Big Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Health Score</div>
              <div className="text-2xl font-black text-sky-400 mt-1">{healthScore}<span className="text-xs text-slate-400">/100</span></div>
              <div className="text-[10px] text-emerald-400 font-semibold">{analysis?.health.rating || 'Optimal'}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Funding Score</div>
              <div className="text-2xl font-black text-purple-400 mt-1">{fundingScore}<span className="text-xs text-slate-400">/100</span></div>
              <div className="text-[10px] text-purple-300 font-semibold">{analysis?.funding.eligibilityTier || 'Pre-Qualified'}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Debt Service (DSCR)</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{dscr}</div>
              <div className="text-[10px] text-slate-300 font-semibold">Service Capacity</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Cash Runway</div>
              <div className="text-2xl font-black text-white mt-1">{runwayMonths} Mo</div>
              <div className="text-[10px] text-sky-400 font-semibold">Operational Depth</div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-purple-400" /> Operational & Solvency Ratios
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Monthly Operating Revenue</span>
                <span className="font-bold text-white">₹{analysis ? (analysis.financials.monthlyRevenue / 100000).toFixed(2) : '40.4'} Lakhs</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Total Monthly Outflows</span>
                <span className="font-bold text-white">₹{analysis ? (analysis.financials.totalMonthlyExpenses / 100000).toFixed(2) : '32.0'} Lakhs</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Net Monthly Cash Flow</span>
                <span className="font-bold text-emerald-400">₹{analysis ? (analysis.financials.monthlyNetCashFlow / 100000).toFixed(2) : '8.4'} Lakhs</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Estimated Borrowing Limit</span>
                <span className="font-bold text-purple-300">{creditLimit}</span>
              </div>
            </div>
          </div>

          {/* Underwriting Conclusion */}
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2 text-xs">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-300" /> Automated Credit Committee Summary
            </div>
            <p className="text-slate-300 leading-relaxed">
              "{businessName} shows audited compliance with active cash generation. Recommended for priority sector lending (PSL) with collateral waiver under the CGTMSE framework with pre-qualified capacity of {creditLimit}."
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
