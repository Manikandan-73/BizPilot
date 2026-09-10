import React from 'react';
import { MSMEProfile } from '../../types';
import { 
  FileCheck2, 
  ShieldCheck, 
  Award, 
  Building2, 
  QrCode, 
  Download, 
  Printer, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Layers, 
  Scale,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MSMECreditPassportViewProps {
  profile: MSMEProfile;
  onOpenModal: () => void;
}

export const MSMECreditPassportView: React.FC<MSMECreditPassportViewProps> = ({
  profile,
  onOpenModal
}) => {
  const handleDownload = () => {
    confetti({
      particleCount: 70,
      spread: 60,
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
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>STANDARDIZED MSME CREDIT DOSSIER</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            MSME Credit Passport
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            A unified, institutional-grade business credit report recognized by banks, NBFCs, and seed-stage investors across India.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Main Full Credit Report Document Container */}
      <div className="p-6 sm:p-10 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl space-y-8 relative overflow-hidden">
        
        {/* Subtle Background Watermark */}
        <div className="absolute right-6 top-1/3 opacity-5 pointer-events-none">
          <ShieldCheck className="w-96 h-96 text-purple-400" />
        </div>

        {/* Passport Header with QR & Business Entity */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-1 rounded bg-purple-600 text-white uppercase tracking-wider">
                BIZPILOT PASSPORT #BP-2026-9842
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED ENTITY
              </span>
            </div>
            
            <h1 className="text-3xl font-black text-white">
              {profile.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                Udyam: <strong>{profile.udyamNumber}</strong>
              </span>
              <span className="bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                GSTIN: <strong>{profile.gstin}</strong>
              </span>
              <span className="bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700 text-slate-400">
                Industry: {profile.industry}
              </span>
            </div>
          </div>

          {/* QR & Security Seal */}
          <div className="flex items-center gap-4 bg-slate-950 p-3.5 rounded-xl border border-slate-800 shrink-0 shadow-lg">
            <div className="w-16 h-16 bg-white p-1 rounded-lg flex items-center justify-center">
              <QrCode className="w-14 h-14 text-slate-950" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Verification Hash</div>
              <div className="text-xs font-mono text-purple-300 font-bold">0x9F42...88CA</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-1">Live RBI-AA Synced</div>
            </div>
          </div>
        </div>

        {/* 5 Core Passport Underwriting Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Business Health</div>
            <div className="text-3xl font-black text-sky-400">{profile.healthScore}<span className="text-xs text-slate-400">/100</span></div>
            <div className="text-[10px] text-emerald-400 font-semibold">Tier-A Prime</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Funding Readiness</div>
            <div className="text-3xl font-black text-purple-400">{profile.fundingReadinessScore}<span className="text-xs text-slate-400">/100</span></div>
            <div className="text-[10px] text-purple-300 font-semibold">Pre-Qualified</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Commercial Risk</div>
            <div className="text-3xl font-black text-emerald-400">CMR-3</div>
            <div className="text-[10px] text-slate-300 font-semibold">Low Default Risk</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Growth Potential</div>
            <div className="text-3xl font-black text-white">+{profile.revenueGrowth}%</div>
            <div className="text-[10px] text-emerald-400 font-semibold">High Growth</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-purple-500/40 text-center space-y-1 bg-purple-950/20">
            <div className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">Investor Attractiveness</div>
            <div className="text-3xl font-black text-purple-300">88<span className="text-xs text-slate-400">/100</span></div>
            <div className="text-[10px] text-emerald-400 font-semibold">Strong Candidate</div>
          </div>

        </div>

        {/* Detailed Underwriting Breakdown Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-purple-400" /> Solvency & Cash Ratios
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Debt Service Coverage Ratio (DSCR)</span>
                <span className="font-bold text-emerald-400">{profile.dscrRatio}x (Benchmark &gt; 1.25x)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Commercial Credit Score (CIBIL CMR)</span>
                <span className="font-bold text-white">{profile.creditScore} (CMR-3)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Annual GSTR Reconciled Turnover</span>
                <span className="font-bold text-white">{profile.turnover}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Uninterrupted Cash Runway</span>
                <span className="font-bold text-sky-400">{profile.runwayMonths} Months</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-400" /> AI Credit Committee Synthesis
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              "{profile.name} exhibits superior compliance hygiene with 100% on-time GSTR filings and zero Days Past Due (DPD) across past term borrowings. Recommended for priority sector lending (PSL) with collateral waiver under the CGTMSE framework."
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[10px]">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ✓ Pre-Approved Limit: {profile.estimatedCreditLimit}
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                ✓ PSB59 Fast-Track
              </span>
            </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            Official validation issued by <strong>BizPilot AI Underwriting Protocol</strong> in accordance with RBI MSME Master Guidelines.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenModal}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all"
            >
              Full Screen View
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md"
            >
              Print / Save PDF
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
