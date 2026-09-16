import React, { useState } from 'react';
import { MSMEProfile } from '../../types';
import { BusinessAnalysis } from '../../types/business';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  SlidersHorizontal, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  RotateCcw, 
  Zap, 
  CheckCircle2,
  Coins
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
  analysis?: BusinessAnalysis;
  onNavigate: (tab: any) => void;
}

export const WhatIfSimulatorView: React.FC<WhatIfSimulatorViewProps> = ({
  profile,
  analysis,
}) => {
  const { t, language } = useLanguage();

  // Baseline Monthly metrics in ₹ Lakhs (derived strictly from organization financial data)
  const hasValidData = Boolean(analysis && analysis.financials && analysis.financials.monthlyRevenue > 0);
  const baseRevenue = hasValidData ? analysis!.financials.monthlyRevenue / 100000 : 0;
  const baseCOGS = hasValidData ? analysis!.financials.monthlyMaterialCost / 100000 : 0;
  const baseStaffCost = hasValidData ? analysis!.financials.monthlySalaryCost / 100000 : 0;
  const baseOPEX = hasValidData ? analysis!.financials.monthlyOperatingExpenses / 100000 : 0;
  const baseEMI = hasValidData ? analysis!.financials.monthlyEmi / 100000 : 0;
  const baseCash = hasValidData ? analysis!.financials.currentCashBalance / 100000 : 0;
  const baseProfit = baseRevenue - (baseCOGS + baseStaffCost + baseOPEX + baseEMI);

  // Simulator Sliders State
  const [priceChange, setPriceChange] = useState<number>(5); // +5%
  const [hiringCount, setHiringCount] = useState<number>(1); // +1 staff
  const [materialCostChange, setMaterialCostChange] = useState<number>(0); // 0%
  const [marketingBoost, setMarketingBoost] = useState<number>(10); // +10% spend
  const [additionalLoanLakhs, setAdditionalLoanLakhs] = useState<number>(0); // ₹ Lakhs

  // Simulated Calculations
  const volumeRetention = 100 - (priceChange > 0 ? priceChange * 0.35 : priceChange * 0.2);
  const simRevenue = Math.max(0, baseRevenue * (1 + priceChange / 100) * (volumeRetention / 100) * (1 + (marketingBoost * 0.12) / 100));
  const simCOGS = Math.max(0, baseCOGS * (1 + materialCostChange / 100) * (volumeRetention / 100));
  const avgStaffSalaryLakhs = analysis && analysis.employees > 0 ? (baseStaffCost / analysis.employees) : 0.45;
  const simStaffCost = Math.max(0, baseStaffCost + hiringCount * avgStaffSalaryLakhs);
  const simOPEX = Math.max(0, baseOPEX * (1 + (marketingBoost * 0.08) / 100));
  const additionalEmi = additionalLoanLakhs > 0 ? (additionalLoanLakhs * 0.024) : 0; // ~₹2,400 per lakh at 10.5% for 48m
  const simEMI = baseEMI + additionalEmi;

  const simTotalCost = simCOGS + simStaffCost + simOPEX + simEMI;
  const simProfit = simRevenue - simTotalCost;
  
  const profitDelta = simProfit - baseProfit;

  // Simulated Cash Runway
  const simCashBalance = baseCash + additionalLoanLakhs;
  const simRunway = simProfit < 0 
    ? parseFloat((simCashBalance / Math.abs(simProfit)).toFixed(1))
    : parseFloat((simCashBalance / Math.max(1, simTotalCost)).toFixed(1));

  // Simulated DSCR: (Revenue - OPEX - Material - Staff) / EMI
  const simEbitda = simRevenue - (simCOGS + simStaffCost + simOPEX);
  const simDscr = simEMI > 0 ? parseFloat((simEbitda / simEMI).toFixed(2)) : null;

  // Simulated Scores
  const healthBase = analysis ? analysis.health.overallScore : profile.healthScore;
  const fundingBase = analysis ? analysis.funding.overallScore : profile.fundingReadinessScore;

  const scoreShift = Math.round(
    (profitDelta > 0 ? Math.min(profitDelta * 1.5, 10) : Math.max(profitDelta * 2.5, -18)) +
    (additionalLoanLakhs > 25 ? -4 : 0)
  );

  const simulatedHealthScore = Math.min(Math.max(healthBase + scoreShift, 30), 99);

  const resetDefaults = () => {
    setPriceChange(0);
    setHiringCount(0);
    setMaterialCostChange(0);
    setMarketingBoost(0);
    setAdditionalLoanLakhs(0);
  };

  const comparisonData = [
    { metric: t('whatIf.revenueMetric', 'Revenue (₹L)'), Baseline: parseFloat(baseRevenue.toFixed(1)), Simulated: parseFloat(simRevenue.toFixed(1)) },
    { metric: t('whatIf.outflowMetric', 'Total Outflows (₹L)'), Baseline: parseFloat((baseCOGS + baseStaffCost + baseOPEX + baseEMI).toFixed(1)), Simulated: parseFloat(simTotalCost.toFixed(1)) },
    { metric: t('whatIf.profitMetric', 'Net Profit (₹L)'), Baseline: parseFloat(baseProfit.toFixed(1)), Simulated: parseFloat(simProfit.toFixed(1)) }
  ];

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Header Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#121722] border border-[#222936] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-black/20 min-w-0">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A78BFA]">
            <SlidersHorizontal className="w-4 h-4 text-[#8B5CF6] shrink-0" />
            <span>{t('whatIf.bannerTag', 'INTERACTIVE SCENARIO MODELING')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#F8FAFC] mt-1">
            {t('whatIf.title', 'What-If Business & Capital Simulator')}
          </h2>
          <p className="text-xs text-[#A7B0C0] mt-0.5">
            {language === 'ta' 
              ? 'வணிக முடிவுகளை நிகழ்நேரத்தில் உருவகப்படுத்துங்கள். உங்கள் உண்மையான அடிப்படை எண்களின் அடிப்படையில் கட்டமைக்கப்பட்டது.'
              : `Test business decisions in real-time. Modeled dynamically on ${analysis?.organizationName || profile.name}'s actual baseline numbers.`}
          </p>
        </div>

        <button
          onClick={resetDefaults}
          className="w-full md:w-auto px-3.5 py-2 rounded-xl bg-[#161C27] hover:bg-[#1E2536] text-[#F8FAFC] text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#303848] transition-all shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#A78BFA]" />
          {t('whatIf.resetBaseline', 'Reset Baseline')}
        </button>
      </div>

      {/* Main Simulator Grid */}
      <div className="p-3 px-4 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-xs text-[#A78BFA] flex flex-col sm:flex-row sm:items-center gap-1.5">
        <span className="font-bold text-[#F8FAFC] uppercase tracking-wider text-[10px] bg-[#8B5CF6]/20 px-2 py-0.5 rounded border border-[#8B5CF6]/30 shrink-0 self-start sm:self-auto">Simulation Notice</span>
        <span>Scenario Simulation Disclaimer: Projections are mathematical sensitivity models based on user-adjusted parameters and your organization's actual financial baseline. They do not constitute guaranteed financial outcomes.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 min-w-0">
        
        {/* Left 5 Cols: Sliders Control Station */}
        <div className="lg:col-span-5 p-4 sm:p-6 rounded-2xl bg-[#121722] border border-[#222936] space-y-5 shadow-lg shadow-black/20 min-w-0">
          <div className="flex items-center justify-between border-b border-[#222936] pb-3">
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#8B5CF6]" /> 
              {t('whatIf.decisionVars', 'Decision Variables')}
            </h3>
            <span className="text-[10px] text-[#A78BFA] font-semibold bg-[#8B5CF6]/15 px-2 py-0.5 rounded border border-[#8B5CF6]/30">
              {t('whatIf.liveBaseline', 'Live Baseline')}
            </span>
          </div>

          {/* Slider 1: Product Pricing Change */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#A7B0C0] font-medium">
                {t('whatIf.pricing', 'Product / Service Pricing')}:
              </span>
              <strong className={priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {priceChange > 0 ? `+${priceChange}%` : `${priceChange}%`}
              </strong>
            </div>
            <input 
              type="range" 
              min="-20" 
              max="30" 
              step="1"
              value={priceChange}
              onChange={(e) => setPriceChange(Number(e.target.value))}
              className="w-full accent-[#8B5CF6] bg-[#161C27] h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#707A8C]">
              <span>-20% ({language === 'ta' ? 'தள்ளுபடி' : 'Discount'})</span>
              <span>0%</span>
              <span>+30% ({language === 'ta' ? 'உயர்வு' : 'Premium'})</span>
            </div>
          </div>

          {/* Slider 2: Additional Hires */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#A7B0C0] font-medium flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-sky-400" /> 
                {t('whatIf.employees', 'New Employees')}:
              </span>
              <strong className="text-[#F8FAFC]">
                {hiringCount > 0 ? `+${hiringCount}` : hiringCount === 0 ? '0' : `${hiringCount}`}
              </strong>
            </div>
            <input 
              type="range" 
              min="-3" 
              max="10" 
              step="1"
              value={hiringCount}
              onChange={(e) => setHiringCount(Number(e.target.value))}
              className="w-full accent-sky-500 bg-[#161C27] h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#707A8C]">
              <span>-3</span>
              <span>0</span>
              <span>+10</span>
            </div>
          </div>

          {/* Slider 3: Raw Material Inflation */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#A7B0C0] font-medium">
                {t('whatIf.materialCost', 'Material / Direct Cost Shift')}:
              </span>
              <strong className={materialCostChange <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {materialCostChange > 0 ? `+${materialCostChange}%` : `${materialCostChange}%`}
              </strong>
            </div>
            <input 
              type="range" 
              min="-15" 
              max="25" 
              step="1"
              value={materialCostChange}
              onChange={(e) => setMaterialCostChange(Number(e.target.value))}
              className="w-full accent-rose-500 bg-[#161C27] h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#707A8C]">
              <span>-15%</span>
              <span>0%</span>
              <span>+25%</span>
            </div>
          </div>

          {/* Slider 4: Marketing Budget Boost */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#A7B0C0] font-medium">
                {t('whatIf.marketing', 'Marketing & Sales Spend')}:
              </span>
              <strong className="text-[#A78BFA]">+{marketingBoost}%</strong>
            </div>
            <input 
              type="range" 
              min="0" 
              max="50" 
              step="5"
              value={marketingBoost}
              onChange={(e) => setMarketingBoost(Number(e.target.value))}
              className="w-full accent-[#8B5CF6] bg-[#161C27] h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#707A8C]">
              <span>0%</span>
              <span>+25%</span>
              <span>+50%</span>
            </div>
          </div>

          {/* Slider 5: Additional Debt Facility */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#A7B0C0] font-medium flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" /> 
                {t('whatIf.newLoan', 'New Working Capital Loan')}:
              </span>
              <strong className="text-amber-400">
                {additionalLoanLakhs > 0 ? `₹${additionalLoanLakhs} ${t('common.lakhs', 'Lakhs')}` : '₹0'}
              </strong>
            </div>
            <input 
              type="range" 
              min="0" 
              max="50" 
              step="5"
              value={additionalLoanLakhs}
              onChange={(e) => setAdditionalLoanLakhs(Number(e.target.value))}
              className="w-full accent-amber-500 bg-[#161C27] h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#707A8C]">
              <span>₹0</span>
              <span>₹25 L</span>
              <span>₹50 L</span>
            </div>
          </div>

        </div>

        {/* Right 7 Cols: Projected Impact & Comparison Visuals */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5 min-w-0">
          
          {/* 3 Simulation Result Scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            
            <div className="p-4 rounded-xl bg-[#121722] border border-[#222936] shadow-lg shadow-black/20 space-y-1 min-w-0">
              <div className="text-[10px] text-[#707A8C] uppercase font-bold truncate">
                {t('whatIf.simProfit', 'Simulated Net Profit')}
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#F8FAFC]">₹{simProfit.toFixed(1)} L</div>
              <div className="flex items-center text-xs">
                {profitDelta >= 0 ? (
                  <span className="text-emerald-400 font-semibold flex items-center truncate">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5 shrink-0" /> +₹{profitDelta.toFixed(1)} L/mo
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold flex items-center truncate">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5 shrink-0" /> -₹{Math.abs(profitDelta).toFixed(1)} L/mo
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#121722] border border-[#8B5CF6]/30 shadow-lg shadow-black/20 space-y-1 min-w-0">
              <div className="text-[10px] text-[#A78BFA] uppercase font-bold truncate">
                {t('whatIf.simHealth', 'Simulated Health Score')}
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#A78BFA]">{simulatedHealthScore}<span className="text-xs text-[#707A8C]">/100</span></div>
              <div className="text-xs font-semibold text-[#A7B0C0] truncate">
                Shift: {scoreShift >= 0 ? `+${scoreShift}` : scoreShift} pts
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#121722] border border-[#222936] shadow-lg shadow-black/20 space-y-1 min-w-0">
              <div className="text-[10px] text-[#707A8C] uppercase font-bold truncate">
                {t('whatIf.simRunway', 'Simulated Runway')}
              </div>
              <div className="text-xl sm:text-2xl font-black text-sky-400">{simRunway} Mo</div>
              <div className="text-xs text-[#A7B0C0] truncate">
                DSCR: <strong className="text-[#F8FAFC]">{simDscr ? `${simDscr}x` : t('executive.debtFree', 'Debt-Free')}</strong>
              </div>
            </div>

          </div>

          {/* Side-by-Side Comparison Chart */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#121722] border border-[#222936] space-y-3 shadow-lg shadow-black/20 min-w-0">
            <h4 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#8B5CF6] shrink-0" /> 
              {t('whatIf.chartTitle', 'Baseline vs Simulated Projection (in ₹ Lakhs)')}
            </h4>
            <div className="h-60 w-full pt-2 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222936" vertical={false} />
                  <XAxis dataKey="metric" stroke="#707A8C" fontSize={11} tickLine={false} />
                  <YAxis stroke="#707A8C" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#161C27', 
                      borderColor: '#303848', 
                      borderRadius: '8px', 
                      fontSize: '12px',
                      color: '#F8FAFC',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)'
                    }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#A7B0C0' }} />
                  <Bar dataKey="Baseline" fill="#475569" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Simulated" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Simulation Commentary Banner */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#0F1219] border border-[#222936] text-xs space-y-2 shadow-sm min-w-0">
            <div className="font-bold text-[#F8FAFC] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 
              {t('whatIf.diagnosticSummary', 'Simulator Diagnostic Summary')}
            </div>
            <p className="text-[#A7B0C0] leading-relaxed">
              {profitDelta >= 0 
                ? (language === 'ta'
                    ? `இந்த சூழ்நிலை மாதாந்திர நிகர லாபத்தை ₹${profitDelta.toFixed(1)} இலட்சம் அதிகரிக்கிறது. உங்கள் நிதி ஆரோக்கிய மதிப்பெண் ${simulatedHealthScore}/100 ஆக உயர்ந்து கடன் தகுதியை மேம்படுத்துகிறது.`
                    : `This scenario expands monthly net profit by ₹${profitDelta.toFixed(1)} Lakhs (+${((profitDelta / Math.max(1, baseProfit)) * 100).toFixed(0)}%), boosting your financial health score to ${simulatedHealthScore}/100 and improving your borrowing headroom.`)
                : (language === 'ta'
                    ? `எச்சரிக்கை: இந்த முடிவு மாதாந்திர லாபத்தில் ₹${Math.abs(profitDelta).toFixed(1)} இலட்சம் குறைவை ஏற்படுத்துகிறது. பணப்புழக்க இருப்பு ${simRunway} மாதங்களாக மாறும்.`
                    : `Caution: This combination creates a monthly profit contraction of ₹${Math.abs(profitDelta).toFixed(1)} Lakhs. Your cash runway shifts to ${simRunway} months.`)}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
