import React, { useState } from 'react';
import { MSMEProfile } from '../../types';
import { BusinessAnalysis } from '../../types/business';
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
  CheckCircle2, 
  Landmark, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FundingReadinessViewProps {
  profile: MSMEProfile;
  analysis?: BusinessAnalysis;
  onOpenPassport: () => void;
  onNavigate: (tab: any) => void;
}

export const FundingReadinessView: React.FC<FundingReadinessViewProps> = ({
  profile,
  analysis,
  onOpenPassport,
  onNavigate
}) => {
  const [expandedPillar, setExpandedPillar] = useState<number | null>(0);
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

  const fundingScore = analysis ? analysis.funding.overallScore : profile.fundingReadinessScore;
  const creditLimit = analysis ? analysis.funding.estimatedCreditLimit : profile.estimatedCreditLimit;
  const eligibilityTier = analysis ? analysis.funding.eligibilityTier : profile.loanEligibility;
  const pillars = analysis ? analysis.funding.pillars : [];
  const bankMatches = analysis ? analysis.funding.bankMatches : [
    { bank: 'State Bank of India (SBI)', product: 'SME Gold & CGTMSE Scheme', maxLoan: '₹1.00 Cr', rate: '8.75% p.a.', match: '96% Fit', fastTrack: true, reason: 'High GST compliance fit.' },
    { bank: 'HDFC Bank', product: 'SmartUp Working Capital OD', maxLoan: '₹75.00 L', rate: '9.20% p.a.', match: '91% Fit', fastTrack: true, reason: 'Turnover-linked overdraft.' },
    { bank: 'SIDBI', product: 'Direct Make-in-India Assistance', maxLoan: '₹2.50 Cr', rate: '8.25% p.a.', match: '88% Fit', fastTrack: false, reason: 'Direct MSME manufacturing facility.' },
    { bank: 'ICICI Bank', product: 'InstaBIZ Collateral-Free Line', maxLoan: '₹50.00 L', rate: '9.50% p.a.', match: '85% Fit', fastTrack: true, reason: 'Instant digital sanction.' }
  ];

  const strengths = analysis?.funding.strengths ?? ['GST registration verified', 'Consistent turnover history'];
  const gaps = analysis?.funding.gaps ?? [];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-purple-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40">UNDERWRITING ENGINE</span>
            <span>REAL FINANCIAL READINESS</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            Funding Readiness Analyzer & Score Booster
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Evaluates your actual operating profit, debt service coverage (DSCR), compliance records, and credit appetite against bank lending benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPassport}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
          >
            <FileCheck2 className="w-4 h-4" />
            Generate Credit Passport
          </button>
        </div>
      </div>

      {/* Top Split: Score Card & Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 4 Cols: Big Gauge */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900/80 border border-purple-500/30 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
          <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">
            Institutional Funding Readiness
          </span>

          <div className="py-2">
            <ScoreGauge 
              score={fundingScore} 
              size={190} 
              strokeWidth={14} 
              label="Funding Score" 
              sublabel={`${eligibilityTier} Eligibility`} 
              colorScheme="purple"
            />
          </div>

          <div className="w-full pt-3 border-t border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Estimated Borrowing Limit</span>
              <span className="font-bold text-emerald-400">{creditLimit}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">CGTMSE Collateral-Free Fit</span>
              <span className="font-bold text-purple-300">{eligibilityTier === 'High' ? 'Eligible (Up to ₹5 Cr)' : 'Eligible with Conditions'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Active Debt Outstanding</span>
              <span className="font-bold text-white">₹{analysis ? (analysis.normalized.outstandingLoanAmount / 100000).toFixed(1) : '0'} Lakhs</span>
            </div>
          </div>
        </div>

        {/* Right 8 Cols: Underwriting Verdict */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" /> Automated Underwriting Diagnosis
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {eligibilityTier} Bank Fit
              </span>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-slate-200 space-y-2">
              <div className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {eligibilityTier === 'High' 
                  ? 'Strong creditworthiness: Cash flows and compliance meet prime bank criteria.' 
                  : eligibilityTier === 'Medium'
                  ? 'Moderate creditworthiness: Bankable under CGTMSE guarantee with working capital focus.'
                  : 'Action required: Resolve identified gaps before filing loan applications.'}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {strengths.join(' ')} {gaps.length > 0 ? `Key gaps to address: ${gaps.join(' ')}` : ''}
              </p>
            </div>

            {/* Strengths & Gaps List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 space-y-1.5">
                <div className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Underwriting Strengths
                </div>
                {strengths.map((item, i) => (
                  <div key={i} className="text-slate-300 text-[11px] flex items-start gap-1">
                    <span className="text-emerald-400">•</span> {item}
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 space-y-1.5">
                <div className="font-bold text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Improvement Opportunities
                </div>
                {gaps.length > 0 ? gaps.map((item, i) => (
                  <div key={i} className="text-slate-300 text-[11px] flex items-start gap-1">
                    <span className="text-amber-400">•</span> {item}
                  </div>
                )) : (
                  <div className="text-slate-400 text-[11px]">All primary statutory criteria are currently satisfied.</div>
                )}
              </div>
            </div>

          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">DSCR: <strong className="text-white">{analysis?.financials.dscr ? `${analysis.financials.dscr}x` : 'Debt-Free'}</strong></span>
            <button
              onClick={() => onNavigate('reports')}
              className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              Export Loan Pack
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 5 Funding Pillars Accordion */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Scale className="w-4 h-4 text-purple-400" />
          5 Underwriting Pillars Breakdown
        </h3>

        <div className="space-y-3">
          {pillars.map((pillar, idx) => (
            <div 
              key={idx}
              className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-all shadow-lg"
            >
              <div 
                onClick={() => setExpandedPillar(expandedPillar === idx ? null : idx)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    pillar.status === 'Strong' ? 'bg-emerald-500/20 text-emerald-300' :
                    pillar.status === 'Satisfactory' ? 'bg-sky-500/20 text-sky-300' :
                    'bg-amber-500/20 text-amber-300'
                  }`}>
                    {pillar.score}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{pillar.name}</h4>
                    <p className="text-[10px] text-slate-400">{pillar.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    pillar.status === 'Strong' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    pillar.status === 'Satisfactory' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {pillar.status}
                  </span>
                  {expandedPillar === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {expandedPillar === idx && (
                <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 space-y-3 text-xs">
                  <div className="text-[11px] text-purple-300 font-semibold">
                    Interest Rate Impact: <span className="text-white">{pillar.impactOnInterestRate}</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action Items to Boost Score:</div>
                    {pillar.actionItems.map((action, aIdx) => (
                      <div 
                        key={aIdx}
                        onClick={() => toggleStep(action)}
                        className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                          completedSteps.includes(action)
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 line-through'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{action}</span>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${completedSteps.includes(action) ? 'text-emerald-400' : 'text-slate-600'}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Matched Bank & NBFC Loan Schemes */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Landmark className="w-4 h-4 text-emerald-400" />
          Pre-Qualified MSME Bank & NBFC Matches
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bankMatches.map((match, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{match.bank}</h4>
                  <div className="text-xs text-purple-300 font-semibold">{match.product}</div>
                </div>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {match.match}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">Indicative Limit</span>
                  <strong className="text-white">{match.maxLoan}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Interest Rate</span>
                  <strong className="text-emerald-400">{match.rate}</strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">{match.reason}</p>

              <div className="flex items-center justify-between pt-1">
                {match.fastTrack ? (
                  <span className="text-[10px] text-purple-300 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Digital Underwriting
                  </span>
                ) : <span className="text-[10px] text-slate-500">Standard Branch Sanction</span>}

                <button
                  onClick={onOpenPassport}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-all"
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
