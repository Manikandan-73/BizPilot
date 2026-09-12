import React from 'react';
import { MSMEProfile } from '../../types';
import { BusinessAnalysis } from '../../types/business';
import { ScoreGauge } from '../common/ScoreGauge';
import { 
  HeartPulse, 
  ShieldCheck, 
  Sparkles, 
  Scale, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

interface FinancialHealthViewProps {
  profile: MSMEProfile;
  analysis?: BusinessAnalysis;
  onNavigate: (tab: any) => void;
}

export const FinancialHealthView: React.FC<FinancialHealthViewProps> = ({
  profile,
  analysis,
  onNavigate
}) => {
  const healthScore = analysis ? analysis.health.overallScore : profile.healthScore;
  const rating = analysis ? analysis.health.rating : 'Optimal';
  const summary = analysis ? analysis.health.summary : 'Holistic financial diagnostic evaluated from your active operational and financial data.';
  const metrics = analysis ? analysis.health.metrics : [];
  const runwayMonths = analysis?.financials.runwayMonths ?? profile.runwayMonths;
  const dscr = analysis?.financials.dscr;
  const opMargin = analysis?.financials.operatingMarginPercent ?? 16.8;
  const isTaxCompliant = analysis ? analysis.compliance.isFullyCompliant : true;

  const underwritingGrade =
    healthScore >= 80 ? 'Prime (Tier A)' : healthScore >= 65 ? 'Sound (Tier B)' : healthScore >= 50 ? 'Moderate (Tier C)' : 'High Risk';

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
            Holistic underwriting assessment synthesized from active revenue, cost structures, working capital, and loan telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-3 py-1 rounded-lg flex items-center gap-1 border ${
            isTaxCompliant 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" /> {isTaxCompliant ? 'Fully Compliant' : 'Compliance Pending'}
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
              score={healthScore} 
              size={200} 
              strokeWidth={14} 
              label="Business Health" 
              sublabel={underwritingGrade} 
              colorScheme="purple"
            />
          </div>

          <div className="w-full pt-3 border-t border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Underwriting Grade</span>
              <span className="font-bold text-purple-300">{underwritingGrade}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Health Status</span>
              <span className="font-bold text-emerald-400">{rating}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Audited Cash Runway</span>
              <span className="font-bold text-white">{runwayMonths} Months</span>
            </div>
          </div>
        </div>

        {/* Right 8 cols: Central AI Diagnosis & Explainability Narrative */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" /> Explainable Diagnostic Summary
              </span>
              <span className="text-[10px] text-slate-400">Active Business Data</span>
            </div>

            {/* Central Explainable Callout */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-slate-200 space-y-2">
              <div className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-300" />
                {`"${summary}"`}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis?.growth.recommendations[0] || 'Optimizing collection cycles and maintaining debt discipline will improve your institutional credit profile.'}
              </p>
            </div>

            {/* Quick 4 Sub-Pillar Status Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">Operating Margin</div>
                <div className="text-lg font-black text-purple-400">{opMargin}%</div>
                <div className="text-[10px] text-emerald-400 font-semibold">{opMargin >= 12 ? 'Healthy EBITDA' : 'Margin Pressure'}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">Cash Runway</div>
                <div className="text-lg font-black text-sky-400">{runwayMonths} Mo</div>
                <div className="text-[10px] text-emerald-400 font-semibold">{runwayMonths >= 3 ? 'Safe Buffer' : 'Tight Buffer'}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">Debt DSCR</div>
                <div className="text-lg font-black text-emerald-400">{dscr ? `${dscr}x` : 'N/A'}</div>
                <div className="text-[10px] text-slate-300 font-semibold">{dscr ? (dscr >= 1.3 ? 'Bankable' : 'Strained') : 'Debt-Free'}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">Current Ratio</div>
                <div className="text-lg font-black text-amber-400">{analysis?.financials.currentRatio ? `${analysis.financials.currentRatio}x` : '1.8x'}</div>
                <div className="text-[10px] text-amber-300 font-semibold">{analysis?.financials.workingCapital && analysis.financials.workingCapital > 0 ? 'Positive Working Capital' : 'Working Capital Deficit'}</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Diagnostic calculated from active financial inputs</span>
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

      {/* Detailed Health Dimension Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          In-Depth Financial Health Dimensions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/30 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{metric.category}</h4>
                  <div className="text-[10px] text-slate-400">Diagnostic Weight: {metric.weight}%</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    metric.status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    metric.status === 'Healthy' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                    metric.status === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {metric.status}
                  </span>
                  <span className="text-base font-black text-white">{metric.score}/100</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    metric.score >= 80 ? 'bg-emerald-500' :
                    metric.score >= 65 ? 'bg-sky-500' :
                    metric.score >= 50 ? 'bg-amber-500' :
                    'bg-rose-500'
                  }`}
                  style={{ width: `${metric.score}%` }}
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                <div className="font-medium text-slate-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" /> Insight:
                </div>
                <p className="text-slate-400 leading-relaxed">{metric.insight}</p>
              </div>

              <div className="text-xs text-slate-300 flex items-start gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300"><strong className="text-white">Recommendation:</strong> {metric.recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
