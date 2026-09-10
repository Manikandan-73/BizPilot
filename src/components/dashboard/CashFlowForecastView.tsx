import React, { useState } from 'react';
import { MSMEProfile } from '../../types';
import { CASH_FLOW_FORECAST_DATA } from '../../data/mockData';
import { AIInsightBadge } from '../common/AIInsightBadge';
import { 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  Calendar, 
  Sparkles, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  CheckCircle2, 
  Info,
  Sliders,
  DollarSign
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface CashFlowForecastViewProps {
  profile: MSMEProfile;
  onNavigate: (tab: any) => void;
}

export const CashFlowForecastView: React.FC<CashFlowForecastViewProps> = ({
  profile,
  onNavigate
}) => {
  const [selectedHorizon, setSelectedHorizon] = useState<'30d' | '90d' | '180d'>('90d');
  const [stressFactor, setStressFactor] = useState<number>(0); // 0% delay, 10% delay, 20% delay

  const displayData = CASH_FLOW_FORECAST_DATA.map((item) => {
    if (item.predictedNetCash !== undefined && stressFactor > 0) {
      const adjustedNet = item.predictedNetCash * (1 - stressFactor / 100);
      return {
        ...item,
        predictedNetCash: parseFloat(adjustedNet.toFixed(1)),
        confidenceLower: parseFloat((item.confidenceLower! * (1 - (stressFactor * 1.3) / 100)).toFixed(1))
      };
    }
    return item;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span>MACHINE LEARNING PREDICTIVE FORECASTING</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            Cash Flow & Liquidity Runway Forecast
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Powered by Prophet & XGBoost time-series algorithms analyzing 24 months of GSTR reconciliation and invoice clearances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-3 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> 92.4% Forecast Accuracy
          </span>
        </div>
      </div>

      {/* 3 Forecast Projection Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Next Month Projection */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Next Month Projection (Apr)</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-white">₹12.8 L</div>
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +5.7% Net Cash
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Inflow: <strong className="text-slate-200">₹57.2 L</strong> • Outflow: <strong className="text-slate-200">₹44.4 L</strong>
          </div>
        </div>

        {/* Card 2: Next Quarter Projection */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Next Quarter Net Cumulative</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-sky-300">₹30.4 L</div>
            <span className="text-xs text-sky-400 font-semibold">
              7.2 Mos Runway
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Expected Q1 Inflow: <strong className="text-slate-200">₹169.7 L</strong>
          </div>
        </div>

        {/* Card 3: Risk Alert Card */}
        <div className="p-5 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-amber-300">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Critical Risk Alert
            </span>
            <span className="text-[10px] font-bold bg-amber-500/20 px-2 py-0.5 rounded text-amber-300">
              In 45 Days
            </span>
          </div>
          <div className="text-sm font-bold text-white">
            "Potential cash shortage in 45 days (June cycle)."
          </div>
          <div className="text-[11px] text-amber-200/80">
            Estimated ₹3.2L buffer compression due to advance crop procurement.
          </div>
        </div>

      </div>

      {/* Main Forecasting Graph with Confidence Interval */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Predictive Cash Generation & Confidence Band
              <span className="text-xs font-normal text-slate-400">(in ₹ Lakhs)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Includes 95% Bayesian confidence bounds for risk variance
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Stress Test Filter */}
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-300">Delay Stress Test:</span>
              <button
                onClick={() => setStressFactor(0)}
                className={`px-2 py-0.5 rounded ${stressFactor === 0 ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'}`}
              >
                0%
              </button>
              <button
                onClick={() => setStressFactor(15)}
                className={`px-2 py-0.5 rounded ${stressFactor === 15 ? 'bg-amber-600 text-white font-bold' : 'text-slate-400'}`}
              >
                +15%
              </button>
              <button
                onClick={() => setStressFactor(30)}
                className={`px-2 py-0.5 rounded ${stressFactor === 30 ? 'bg-rose-600 text-white font-bold' : 'text-slate-400'}`}
              >
                +30%
              </button>
            </div>
          </div>
        </div>

        {/* Forecast Chart */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={displayData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="predNetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="period" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#F8FAFC' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              
              {/* Confidence interval area */}
              <Area 
                type="monotone" 
                dataKey="confidenceUpper" 
                name="Confidence Range Upper (₹L)" 
                stroke="none" 
                fill="url(#confidenceGrad)" 
              />
              
              {/* Actual Net Cash */}
              <Line 
                type="monotone" 
                dataKey="netCash" 
                name="Historical Net Cash (₹L)" 
                stroke="#10B981" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#10B981' }} 
              />
              
              {/* Predicted Net Cash */}
              <Line 
                type="monotone" 
                dataKey="predictedNetCash" 
                name="AI Predicted Net Cash (₹L)" 
                stroke="#38BDF8" 
                strokeWidth={3} 
                strokeDasharray="5 5" 
                dot={{ r: 4, fill: '#38BDF8' }} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* AI Action Recommendations Grid */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          <AIInsightBadge 
            type="warning" 
            title="Mitigate Day-45 Shortfall"
            actionText="Launch Bill Discounting"
            onAction={() => onNavigate('growth-intelligence')}
          >
            "Pre-discount ₹10.5L invoices of corporate buyers via TReDS 10 days before June 1st to maintain a minimum ₹8.0L liquid buffer."
          </AIInsightBadge>

          <AIInsightBadge 
            type="positive" 
            title="Buffer Optimization Strategy"
            actionText="Simulate Hiring & Cash Impact"
            onAction={() => onNavigate('what-if-simulator')}
          >
            "July through September shows a 38% seasonal demand surge. Locking in supplier credit terms now will prevent margin erosion."
          </AIInsightBadge>
        </div>

      </div>

    </div>
  );
};
