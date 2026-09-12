import React, { useMemo, useState } from 'react';
import { MSMEProfile } from '../../types';
import { BusinessAnalysis } from '../../types/business';
import { AIInsightBadge } from '../common/AIInsightBadge';
import { 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  Calendar, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  Sliders
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
  analysis?: BusinessAnalysis;
  onNavigate: (tab: any) => void;
}

export const CashFlowForecastView: React.FC<CashFlowForecastViewProps> = ({
  profile,
  analysis,
  onNavigate
}) => {
  const [selectedHorizon, setSelectedHorizon] = useState<'30d' | '90d' | '180d'>('90d');
  const [stressFactor, setStressFactor] = useState<number>(0); // 0%, 10%, 20% delay on receivables

  const rawPoints = analysis?.cashFlow.dataPoints ?? [];

  // Filter based on selected horizon
  const horizonPoints = useMemo(() => {
    if (rawPoints.length === 0) return [];
    if (selectedHorizon === '30d') return rawPoints.slice(0, 2);
    if (selectedHorizon === '90d') return rawPoints.slice(0, 4);
    return rawPoints.slice(0, 7);
  }, [rawPoints, selectedHorizon]);

  // Convert values to ₹ Lakhs for clean chart scaling and apply debtor stress factor
  const displayData = useMemo(() => {
    return horizonPoints.map((item) => {
      const predNet = item.predictedNetCash !== undefined ? item.predictedNetCash / 100000 : 0;
      const predInflow = item.predictedInflow !== undefined ? item.predictedInflow / 100000 : 0;
      const predOutflow = item.predictedOutflow !== undefined ? item.predictedOutflow / 100000 : 0;
      const lower = item.confidenceLower !== undefined ? item.confidenceLower / 100000 : predNet;
      const upper = item.confidenceUpper !== undefined ? item.confidenceUpper / 100000 : predNet;

      if (stressFactor > 0) {
        const adjustedInflow = predInflow * (1 - stressFactor / 100);
        const adjustedNet = adjustedInflow - predOutflow;
        return {
          period: item.period,
          actualInflow: item.actualInflow ? parseFloat((item.actualInflow / 100000).toFixed(1)) : undefined,
          actualOutflow: item.actualOutflow ? parseFloat((item.actualOutflow / 100000).toFixed(1)) : undefined,
          predictedInflow: parseFloat(adjustedInflow.toFixed(1)),
          predictedOutflow: parseFloat(predOutflow.toFixed(1)),
          predictedNetCash: parseFloat(adjustedNet.toFixed(1)),
          confidenceLower: parseFloat((lower * (1 - (stressFactor * 1.2) / 100)).toFixed(1)),
          confidenceUpper: parseFloat((upper * (1 - (stressFactor * 0.8) / 100)).toFixed(1)),
        };
      }

      return {
        period: item.period,
        actualInflow: item.actualInflow ? parseFloat((item.actualInflow / 100000).toFixed(1)) : undefined,
        actualOutflow: item.actualOutflow ? parseFloat((item.actualOutflow / 100000).toFixed(1)) : undefined,
        predictedInflow: parseFloat(predInflow.toFixed(1)),
        predictedOutflow: parseFloat(predOutflow.toFixed(1)),
        predictedNetCash: parseFloat(predNet.toFixed(1)),
        confidenceLower: parseFloat(lower.toFixed(1)),
        confidenceUpper: parseFloat(upper.toFixed(1)),
      };
    });
  }, [horizonPoints, stressFactor]);

  const nextMonth = rawPoints[1];
  const nextMonthNet = nextMonth?.predictedNetCash ? (nextMonth.predictedNetCash / 100000).toFixed(1) : '12.8';
  const nextMonthInflow = nextMonth?.predictedInflow ? (nextMonth.predictedInflow / 100000).toFixed(1) : '48.5';
  const nextMonthOutflow = nextMonth?.predictedOutflow ? (nextMonth.predictedOutflow / 100000).toFixed(1) : '38.5';

  const runwayMonths = analysis?.financials.runwayMonths ?? profile.runwayMonths;
  const bufferStatus = analysis?.cashFlow.cashBufferStatus ?? 'Safe';
  const hasWarning = analysis?.cashFlow.hasRunwayWarning ?? false;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span>PREDICTIVE CASH FLOW FORECAST</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            Cash Flow & Liquidity Runway Forecast
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Forward-looking liquidity projections synthesized from active operating cash inflows, fixed expense commitments, and debt EMI obligations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-3 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Forward Cash Modeling
          </span>
        </div>
      </div>

      {hasWarning && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200">
            <strong className="text-white block font-bold mb-0.5">Cash Buffer Deficit Warning</strong>
            {analysis?.cashFlow.warningMessage || 'Projected cash reserves are running tight against monthly operating expenses. Consider accelerating debtor recovery.'}
          </div>
        </div>
      )}

      {/* 3 Forecast Projection Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Next Month Projection */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Next Month Projection (M+1)</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-white">₹{nextMonthNet} L</div>
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> Projected Net
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Inflow: <strong className="text-slate-200">₹{nextMonthInflow} L</strong> • Outflow: <strong className="text-slate-200">₹{nextMonthOutflow} L</strong>
          </div>
        </div>

        {/* Card 2: Cash Runway Duration */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Projected Cash Runway</span>
            <ShieldAlert className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-white">{runwayMonths} Months</div>
            <span className="text-xs text-sky-400 font-semibold">Current Burn Rate</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Current Cash: <strong className="text-slate-200">₹{analysis ? (analysis.normalized.currentCashBalance / 100000).toFixed(1) : '52.0'} L</strong>
          </div>
        </div>

        {/* Card 3: 90-Day Liquidity Buffer */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">90-Day Liquidity Health</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className={`text-2xl font-black ${bufferStatus === 'Safe' ? 'text-emerald-400' : bufferStatus === 'Adequate' ? 'text-sky-400' : 'text-amber-400'}`}>
              {bufferStatus}
            </div>
            <span className="text-xs text-slate-400">Reserve Status</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Receivables: <strong className="text-slate-200">₹{analysis ? (analysis.normalized.accountsReceivable / 100000).toFixed(1) : '55.0'} L</strong>
          </div>
        </div>

      </div>

      {/* Main Forecast Chart Box */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Monthly Inflow vs Outflow & Net Cash
              <span className="text-xs font-normal text-slate-400">(in ₹ Lakhs)</span>
            </h3>
            <p className="text-xs text-slate-400">Current month reflects baseline figures; forward months show model projections with confidence intervals</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Stress testing control */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Debtor Delay Stress:</span>
              <select
                value={stressFactor}
                onChange={(e) => setStressFactor(Number(e.target.value))}
                className="bg-slate-900 text-white rounded px-2 py-0.5 border border-slate-700 outline-none"
              >
                <option value={0}>0% (Standard)</option>
                <option value={10}>+10% Delay</option>
                <option value={20}>+20% Delay</option>
              </select>
            </div>

            {/* Timeframe horizon toggle */}
            <div className="p-1 bg-slate-950 rounded-lg border border-slate-800 flex">
              <button
                onClick={() => setSelectedHorizon('30d')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedHorizon === '30d' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                30D
              </button>
              <button
                onClick={() => setSelectedHorizon('90d')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedHorizon === '90d' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                90D
              </button>
              <button
                onClick={() => setSelectedHorizon('180d')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedHorizon === '180d' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                180D
              </button>
            </div>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={displayData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="period" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#F8FAFC' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="predictedInflow" name="Projected Inflow (₹L)" fill="#38BDF8" stroke="#38BDF8" fillOpacity={0.15} />
              <Area type="monotone" dataKey="predictedOutflow" name="Projected Outflow (₹L)" fill="#F43F5E" stroke="#F43F5E" fillOpacity={0.15} />
              <Line type="monotone" dataKey="predictedNetCash" name="Net Cash Flow (₹L)" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="confidenceUpper" name="Upper Band (+15%)" stroke="#64748B" strokeDasharray="4 4" strokeWidth={1} dot={false} />
              <Line type="monotone" dataKey="confidenceLower" name="Lower Band (-15%)" stroke="#64748B" strokeDasharray="4 4" strokeWidth={1} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-800">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Monthly Inflow Base: <strong className="text-white">₹{analysis ? (analysis.normalized.monthlyRevenue / 100000).toFixed(1) : '48.5'} Lakhs</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            Monthly Outflow Base: <strong className="text-white">₹{analysis ? (analysis.financials.totalMonthlyExpenses / 100000).toFixed(1) : '38.5'} Lakhs</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Monthly EMI Outflow: <strong className="text-white">₹{analysis ? (analysis.normalized.monthlyEMI / 1000).toFixed(0) : '180'}k/mo</strong>
          </span>
        </div>

      </div>

    </div>
  );
};
