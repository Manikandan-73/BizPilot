import React, { useState } from 'react';
import { MSMEProfile } from '../../types';
import { FUNDING_PILLARS } from '../../data/mockData';
import { ScoreGauge } from '../common/ScoreGauge';
import { AIInsightBadge } from '../common/AIInsightBadge';
import { 
  Award, 
  Sparkles, 
  FileCheck2, 
  TrendingUp, 
  ShieldCheck, 
  Scale, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Landmark, 
  Percent, 
  Clock,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FundingReadinessViewProps {
  profile: MSMEProfile;
  onOpenPassport: () => void;
  onNavigate: (tab: any) => void;
}

export const FundingReadinessView: React.FC<FundingReadinessViewProps> = ({
  profile,
  onOpenPassport,
  onNavigate
}) => {
  const [expandedPillar, setExpandedPillar] = useState<number | null>(3); // expand 'Business Stability' by default (weakest)
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const toggleStep = (stepText: string) => {
    if (completedSteps.includes(stepText)) {
      setCompletedSteps(completedSteps.filter(s => s !== stepText));
    } else {
      setCompletedSteps([...completedSteps, stepText]);
      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.7 }
      });
    }
  };

  const bankMatches = [
    { bank: 'State Bank of India (SBI)', product: 'SME Gold & CGTMSE Scheme', maxLoan: '₹1.00 Cr', rate: '8.75% p.a.', match: '96% Fit', fastTrack: true },
    { bank: 'HDFC Bank', product: 'SmartUp Working Capital OD', maxLoan: '₹75.00 L', rate: '9.20% p.a.', match: '91% Fit', fastTrack: true },
    { bank: 'SIDBI', product: 'Direct Make-in-India Assistance', maxLoan: '₹2.50 Cr', rate: '8.25% p.a.', match: '88% Fit', fastTrack: false },
    { bank: 'ICICI Bank', product: 'InstaBIZ Collateral-Free Line', maxLoan: '₹50.00 L', rate: '9.50% p.a.', match: '85% Fit', fastTrack: true }
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-purple-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40">FLAGSHIP MODULE</span>
            <span>INSTITUTIONAL UNDERWRITING ENGINE</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            Funding Readiness Analyzer & Score Booster
          </h2>
          <p className="text-xs text-slate-300">
            Deconstruct your business through the eyes of public sector banks, NBFC credit committees, and venture debt underwriters.
          </p>
        </div>

        <button
          onClick={onOpenPassport}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
        >
          <FileCheck2 className="w-4 h-4" />
          View Verified Credit Passport
        </button>
      </div>

      {/* Flagship Score & 5-Pillar Radar Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 4 Cols: Flagship Score Gauge */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900/80 border border-purple-500/30 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
          <span className="text-xs font-bold text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
            <Award className="w-4 h-4 text-purple-400" /> Overall Readiness
          </span>

          <div className="py-2">
            <ScoreGauge 
              score={profile.fundingReadinessScore} 
              size={200} 
              strokeWidth={14} 
              label="Funding Readiness" 
              sublabel="Pre-Qualified" 
              colorScheme="purple"
            />
          </div>

          <div className="w-full pt-3 border-t border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Pre-Qualified Credit Line</span>
              <span className="font-bold text-emerald-400">{profile.estimatedCreditLimit}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Target Score For Sub-8.5% Rate</span>
              <span className="font-bold text-purple-300">85+ (+11 pts)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">CGTMSE Guarantee Support</span>
              <span className="font-bold text-sky-400">100% Eligible</span>
            </div>
          </div>
        </div>

        {/* Right 8 Cols: 5 Pillar Quick Score Breakdown Cards */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">5 Underwriting Pillars Analysis</h3>
                <p className="text-xs text-slate-400">Click each pillar below to see specific bank requirements and remediation steps.</p>
              </div>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Tier-A Qualifying
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {FUNDING_PILLARS.map((pillar, idx) => {
                const isExpanded = expandedPillar === idx;
                return (
                  <div 
                    key={idx}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      isExpanded 
                        ? 'bg-slate-950/90 border-purple-500/50 shadow-lg' 
                        : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Collapsible Header */}
                    <div 
                      onClick={() => setExpandedPillar(isExpanded ? null : idx)}
                      className="p-3.5 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                          pillar.score >= 80 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : pillar.score >= 70 
                              ? 'bg-sky-500/20 text-sky-400' 
                              : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {pillar.score}
                        </span>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-white">{pillar.name}</h4>
                          <span className="text-[10px] text-slate-400">{pillar.impactOnInterestRate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          pillar.status === 'Strong'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : pillar.status === 'Satisfactory'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {pillar.status}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {/* Collapsible Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-800 space-y-3 text-xs bg-slate-900/50">
                        <p className="text-slate-300 leading-relaxed">
                          <strong className="text-purple-300">Underwriter Assessment:</strong> {pillar.description}
                        </p>

                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Actionable Steps to Boost Score:
                          </span>
                          {pillar.actionItems.map((act, aIdx) => (
                            <div 
                              key={aIdx} 
                              onClick={() => toggleStep(act)}
                              className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/30 cursor-pointer text-slate-200 transition-colors"
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                completedSteps.includes(act) ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-600'
                              }`}>
                                {completedSteps.includes(act) && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </div>
                              <span className={`text-xs ${completedSteps.includes(act) ? 'line-through text-slate-500' : ''}`}>
                                {act}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Matched Bank & NBFC Lending Products Grid */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-400" />
              Pre-Matched MSME Lending Schemes & Bank Products
            </h3>
            <p className="text-xs text-slate-400">
              Matched based on your verified DSCR of {profile.dscrRatio}x, CMR-3 credit score, and GST volume.
            </p>
          </div>
          <span className="text-xs text-purple-300 font-semibold">
            PSB59 API Connected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bankMatches.map((b, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/40 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{b.match}</span>
                  {b.fastTrack && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                      Fast-Track 7-Day
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-white">{b.bank}</h4>
                <p className="text-[11px] text-slate-400 leading-snug">{b.product}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Limit</span>
                  <span className="font-bold text-white">{b.maxLoan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Indicative Rate</span>
                  <span className="font-bold text-emerald-400">{b.rate}</span>
                </div>
                <button
                  onClick={onOpenPassport}
                  className="w-full mt-2 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white text-[11px] font-semibold transition-all flex items-center justify-center gap-1"
                >
                  Apply with Passport
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
