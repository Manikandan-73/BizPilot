import React from 'react';
import { MSMEProfile } from '../../types';
import { FINANCIAL_HEALTH_METRICS } from '../../data/mockData';
import { ScoreGauge } from '../common/ScoreGauge';
import { AIInsightBadge } from '../common/AIInsightBadge';
import { 
  HeartPulse, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Scale, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface FinancialHealthViewProps {
  profile: MSMEProfile;
  onNavigate: (tab: any) => void;
}

export const FinancialHealthView: React.FC<FinancialHealthViewProps> = ({
  profile,
  onNavigate
}) => {
  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
            <HeartPulse className="w-4 h-4 text-purple-400" />
            <span>EXPLAINABLE FINANCIAL DIAGNOSTICS</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            Financial Health Score & Diagnostics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Holistic underwriting assessment synthesized from GSTR-1, GSTR-3B, Bank AA telemetry and audited balance sheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Tax Compliant
          </span>
        </div>
      </div>

      {/* Large Gauge & Primary AI Explanation Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 4 cols: Large Circular Gauge */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900/80 border border-purple-500/30 flex flex-col items-center justify-center text-center space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <HeartPulse className="w-32 h-32 text-purple-400" />
          </div>

          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Overall Health Gauge
          </span>

          <div className="py-2">
            <ScoreGauge 
              score={profile.healthScore} 
              size={200} 
              strokeWidth={14} 
              label="Business Health" 
              sublabel="Tier-A Prime MSME" 
              colorScheme="purple"
            />
          </div>

          <div className="w-full pt-3 border-t border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Underwriting Grade</span>
              <span className="font-bold text-purple-300">Prime (Tier A)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Solvency Risk Index</span>
              <span className="font-bold text-emerald-400">Very Low (&lt; 2.1%)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Audited Cash Runway</span>
              <span className="font-bold text-white">{profile.runwayMonths} Months</span>
            </div>
          </div>
        </div>

        {/* Right 8 cols: Central AI Diagnosis & Explainability Narrative */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" /> Explainable AI Diagnostic Summary
              </span>
              <span className="text-[10px] text-slate-400">Updated today</span>
            </div>

            {/* Central Explainable Callout */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-slate-200 space-y-2">
              <div className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-300" />
                "Your business has healthy revenue growth (+12.4%) and strong gross margins (34.2%), but carries high inventory carrying costs and extended debtor cycles."
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                By shrinking your average collection period from 58 days down to 42 days, you will boost your liquidity score by +8 points and increase annual available free cash flow by ₹8.4 Lakhs.
              </p>
            </div>

            {/* Quick 4 Sub-Pillar Status Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">Revenue Stability</div>
                <div className="text-lg font-black text-sky-400">86/100</div>
                <div className="text-[10px] text-emerald-400 font-semibold">Low Concentration</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">Operating Margin</div>
                <div className="text-lg font-black text-purple-400">79/100</div>
                <div className="text-[10px] text-emerald-400 font-semibold">16.8% EBITDA</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">Liquidity & DSCR</div>
                <div className="text-lg font-black text-emerald-400">84/100</div>
                <div className="text-[10px] text-slate-300 font-semibold">1.84x DSCR</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">Expense Efficiency</div>
                <div className="text-lg font-black text-amber-400">78/100</div>
                <div className="text-[10px] text-amber-300 font-semibold">Raw Material Lag</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Benchmark comparison against 2,400+ Indian {profile.sector} peers</span>
            <button
              onClick={() => onNavigate('what-if-simulator')}
              className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              Simulate Margin Improvement
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 4 Detailed Health Dimension Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          In-Depth Financial Health Dimensions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FINANCIAL_HEALTH_METRICS.map((metric, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                    0{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{metric.category}</h4>
                    <span className="text-[10px] text-slate-400">Pillar Weight: {metric.weight}%</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-white">{metric.score}<span className="text-xs text-slate-400">/100</span></div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    metric.status === 'Optimal' || metric.status === 'Healthy'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {metric.status}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    metric.score >= 80 ? 'bg-gradient-to-r from-purple-500 to-sky-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'
                  }`}
                  style={{ width: `${metric.score}%` }}
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                <div className="text-slate-300 font-medium leading-snug">
                  <strong className="text-purple-300">Observation:</strong> {metric.insight}
                </div>
                <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-900">
                  <strong className="text-sky-300">Recommendation:</strong> {metric.recommendation}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
