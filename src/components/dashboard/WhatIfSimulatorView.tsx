import React, { useState } from 'react';
import { MSMEProfile } from '../../types';
import { AIInsightBadge } from '../common/AIInsightBadge';
import { ScoreGauge } from '../common/ScoreGauge';
import { 
  SlidersHorizontal, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Percent, 
  Coins, 
  RotateCcw, 
  ShieldAlert, 
  ArrowRight,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface WhatIfSimulatorViewProps {
  profile: MSMEProfile;
  onNavigate: (tab: any) => void;
}

export const WhatIfSimulatorView: React.FC<WhatIfSimulatorViewProps> = ({
  profile,
  onNavigate
}) => {
  // Simulator Sliders State
  const [priceChange, setPriceChange] = useState<number>(10); // +10%
  const [hiringCount, setHiringCount] = useState<number>(2); // +2 staff
  const [materialCostChange, setMaterialCostChange] = useState<number>(0); // 0%
  const [marketingBoost, setMarketingBoost] = useState<number>(15); // +15% spend
  const [paymentTermsDays, setPaymentTermsDays] = useState<number>(45); // Days (baseline 58)

  // Baseline Monthly metrics (in ₹ Lakhs)
  const baseRevenue = 48.5; // ~₹4.85 Cr/yr
  const baseCOGS = 24.2;
  const baseStaffCost = 6.8;
  const baseOPEX = 7.5;
  const baseProfit = baseRevenue - (baseCOGS + baseStaffCost + baseOPEX); // 10.0L

  // Simulated Calculations
  // Price elasticity factor (e.g. -0.35: slight volume drop if price raises)
  const volumeRetention = 100 - (priceChange > 0 ? priceChange * 0.35 : priceChange * 0.2);
  const simRevenue = baseRevenue * (1 + priceChange / 100) * (volumeRetention / 100) * (1 + (marketingBoost * 0.15) / 100);
  const simCOGS = baseCOGS * (1 + materialCostChange / 100) * (volumeRetention / 100);
  const simStaffCost = baseStaffCost + hiringCount * 0.45; // ₹45k/mo per employee
  const simOPEX = baseOPEX * (1 + (marketingBoost * 0.08) / 100);
  const simProfit = simRevenue - (simCOGS + simStaffCost + simOPEX);
  
  const profitDelta = simProfit - baseProfit;
  const revenueDelta = simRevenue - baseRevenue;
  
  // Simulated Funding Readiness Score adjustment
  const scoreShift = Math.round(
    (profitDelta > 0 ? Math.min(profitDelta * 1.5, 8) : Math.max(profitDelta * 2, -12)) +
    (paymentTermsDays < 50 ? 4 : -2)
  );
  const simulatedFundingScore = Math.min(Math.max(profile.fundingReadinessScore + scoreShift, 45), 98);

  const resetDefaults = () => {
    setPriceChange(10);
    setHiringCount(2);
    setMaterialCostChange(0);
    setMarketingBoost(15);
    setPaymentTermsDays(45);
  };

  const comparisonData = [
    { metric: 'Revenue (₹L)', Baseline: parseFloat(baseRevenue.toFixed(1)), Simulated: parseFloat(simRevenue.toFixed(1)) },
    { metric: 'Total Cost (₹L)', Baseline: parseFloat((baseCOGS + baseStaffCost + baseOPEX).toFixed(1)), Simulated: parseFloat((simCOGS + simStaffCost + simOPEX).toFixed(1)) },
    { metric: 'Net Profit (₹L)', Baseline: parseFloat(baseProfit.toFixed(1)), Simulated: parseFloat(simProfit.toFixed(1)) }
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
            <SlidersHorizontal className="w-4 h-4 text-purple-400" />
            <span>INTERACTIVE SCENARIO MODELING</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            What-If Business & Capital Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test business decisions in real-time. Predict the immediate impact on revenue, EBITDA margin, cash runway, and lender underwriting scores.
          </p>
        </div>

        <button
          onClick={resetDefaults}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>
      </div>

      {/* Main Grid: Controls on Left, Dynamic Impact Dashboard on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: Interactive Sliders */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" /> Decision Levers
            </h3>
            <span className="text-[11px] text-purple-400 font-mono">Real-time Recalculation</span>
          </div>

          {/* Slider 1: Product Price Change */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-purple-400" /> "What if I change product price?"
              </span>
              <span className={`font-bold font-mono ${priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {priceChange >= 0 ? `+${priceChange}%` : `${priceChange}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="30"
              step="1"
              value={priceChange}
              onChange={(e) => setPriceChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-20% Discount</span>
              <span>Baseline (0%)</span>
              <span>+30% Premium</span>
            </div>
          </div>

          {/* Slider 2: Hiring Count */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" /> "What if I hire additional staff?"
              </span>
              <span className="font-bold text-sky-400 font-mono">
                +{hiringCount} Employees
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={hiringCount}
              onChange={(e) => setHiringCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 (Current)</span>
              <span>+5 Staff</span>
              <span>+10 Staff</span>
            </div>
          </div>

          {/* Slider 3: Raw Material Cost Volatility */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-amber-400" /> "What if raw material costs rise?"
              </span>
              <span className={`font-bold font-mono ${materialCostChange > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {materialCostChange > 0 ? `+${materialCostChange}%` : `${materialCostChange}%`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={materialCostChange}
              onChange={(e) => setMaterialCostChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% Stable</span>
              <span>+12% Inflation</span>
              <span>+25% Surge</span>
            </div>
          </div>

          {/* Slider 4: Marketing & Sales Spend */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> "What if I boost marketing budget?"
              </span>
              <span className="font-bold text-purple-400 font-mono">
                +{marketingBoost}% Spend
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={marketingBoost}
              onChange={(e) => setMarketingBoost(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% Base</span>
              <span>+25% Growth</span>
              <span>+50% Aggressive</span>
            </div>
          </div>

          {/* Slider 5: Payment Terms / Debtor Cycle */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-400" /> "What if debtor collection days shrink?"
              </span>
              <span className="font-bold text-emerald-400 font-mono">
                {paymentTermsDays} Days
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="75"
              step="5"
              value={paymentTermsDays}
              onChange={(e) => setPaymentTermsDays(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>20 Days (TReDS)</span>
              <span>45 Days</span>
              <span>75 Days (Delayed)</span>
            </div>
          </div>

        </div>

        {/* Right 7 Cols: Projected Impact Visuals */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Top 3 Impact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-lg">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Projected Monthly Revenue</div>
              <div className="text-2xl font-black text-white">₹{simRevenue.toFixed(1)} L</div>
              <div className={`text-xs font-semibold flex items-center ${revenueDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {revenueDelta >= 0 ? `+₹${revenueDelta.toFixed(1)} L (+${((revenueDelta / baseRevenue) * 100).toFixed(1)}%)` : `-₹${Math.abs(revenueDelta).toFixed(1)} L`}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-lg">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Projected Monthly Net Profit</div>
              <div className="text-2xl font-black text-sky-300">₹{simProfit.toFixed(1)} L</div>
              <div className={`text-xs font-semibold flex items-center ${profitDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {profitDelta >= 0 ? `+₹${profitDelta.toFixed(1)} L (+${((profitDelta / baseProfit) * 100).toFixed(1)}%)` : `-₹${Math.abs(profitDelta).toFixed(1)} L`}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-1 shadow-lg">
              <div className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">Simulated Funding Score</div>
              <div className="text-2xl font-black text-purple-300">{simulatedFundingScore}<span className="text-xs text-slate-400">/100</span></div>
              <div className="text-xs font-semibold text-purple-400">
                {scoreShift >= 0 ? `+${scoreShift} pts Boost` : `${scoreShift} pts Drop`}
              </div>
            </div>

          </div>

          {/* Scenario Comparison Chart */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Baseline vs Simulated Scenario Comparison
            </h4>

            <div className="h-56 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="metric" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Baseline" name="Current Baseline (₹L)" fill="#64748B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Simulated" name="Simulated Scenario (₹L)" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Simulation Rationale */}
          <AIInsightBadge 
            type={profitDelta >= 0 ? 'positive' : 'warning'} 
            title="AI Simulator Synthesis"
            actionText="Save Scenario as Playbook"
            onAction={() => onNavigate('growth-intelligence')}
          >
            {profitDelta >= 0 ? (
              <span>
                "Increasing prices by {priceChange}% combined with {hiringCount} additional sales staff expands net profit by <strong className="text-emerald-400">₹{profitDelta.toFixed(1)} Lakhs/mo</strong>. Price sensitivity remains low (-0.35 elasticity), resulting in an estimated 96.5% customer retention."
              </span>
            ) : (
              <span>
                "Caution: Higher cost inflation coupled with aggressive hiring reduces net operating margins by <strong className="text-rose-400">₹{Math.abs(profitDelta).toFixed(1)} Lakhs/mo</strong>. Consider locking vendor forward contracts before expanding headcounts."
              </span>
            )}
          </AIInsightBadge>

        </div>

      </div>

    </div>
  );
};
