import React, { useMemo, useState } from 'react';
import { MSMEProfile } from '../../types';
import { BusinessAnalysis } from '../../types/business';
import { AIInsightBadge } from '../common/AIInsightBadge';
import { 
  HeartPulse, 
  Award, 
  TrendingUp, 
  Coins, 
  ArrowUpRight, 
  Sparkles, 
  Zap, 
  FileText, 
  Landmark
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface ExecutiveDashboardProps {
  profile: MSMEProfile;
  analysis?: BusinessAnalysis;
  onNavigate: (tab: any) => void;
  onOpenPassport: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  profile,
  analysis,
  onNavigate,
  onOpenPassport
}) => {
  const [chartView, setChartView] = useState<'area' | 'bar'>('area');
  const [timeframe, setTimeframe] = useState<'12m' | '6m'>('12m');

  // Generate dynamic 12-month chart data derived from actual monthly financials
  const fullChartData = useMemo(() => {
    const revL = analysis ? analysis.financials.monthlyRevenue / 100000 : 48.5;
    const expL = analysis ? analysis.financials.totalMonthlyExpenses / 100000 : 38.5;
    const profitL = analysis ? analysis.financials.monthlyNetCashFlow / 100000 : 10.0;

    const monthNames = [
      'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
      'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'
    ];

    return monthNames.map((month, idx) => {
      // Apply subtle realistic seasonality factor (-4% to +6%)
      const factor = 1 + ((idx - 5) * 0.012);
      const revenue = parseFloat((revL * factor).toFixed(1));
      const expense = parseFloat((expL * (1 + ((idx - 5) * 0.008))).toFixed(1));
      const profit = parseFloat((revenue - expense).toFixed(1));

      return {
        month,
        revenue,
        expense,
        profit,
        cashFlow: profit,
      };
    });
  }, [analysis]);

  const chartData = timeframe === '6m' ? fullChartData.slice(6) : fullChartData;

  const healthScore = analysis ? analysis.health.overallScore : profile.healthScore;
  const fundingScore = analysis ? analysis.funding.overallScore : profile.fundingReadinessScore;
  const creditLimit = analysis ? analysis.funding.estimatedCreditLimit : profile.estimatedCreditLimit;
  const runwayMonths = analysis ? (analysis.financials.runwayMonths ?? 0) : profile.runwayMonths;
  const loanEligibility = analysis ? analysis.funding.eligibilityTier : profile.loanEligibility;

  const grossMargin = analysis?.financials.grossMarginPercent ?? 34.2;
  const netMargin = analysis?.financials.netMarginPercent ?? 9.4;
  const opMargin = analysis?.financials.operatingMarginPercent ?? 16.8;

  const topRisks = analysis?.growth.keyRisks ?? [];
  const topRecs = analysis?.growth.recommendations ?? [];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Active Business Portfolio
            </span>
            <span className="text-xs text-slate-400">UDYAM: {profile.udyamNumber || 'UDYAM-REGISTERED'}</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            {analysis?.organizationName || profile.name}
          </h1>
          <p className="text-xs text-slate-300">
            {analysis?.businessType || profile.sector} • {analysis?.location || profile.location} • Turnover: <strong className="text-purple-300">{profile.turnover}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('what-if-simulator')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            Simulate Decision
          </button>

          <button
            onClick={onOpenPassport}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            Download Passport
          </button>
        </div>
      </div>

      {/* 5 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* KPI 1: Business Health Score */}
        <div 
          onClick={() => onNavigate('financial-health')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Business Health</span>
            <HeartPulse className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{healthScore}</span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> {analysis?.health.rating || 'Optimal'}
            </span>
            <span className="text-slate-400">{healthScore >= 75 ? 'Tier-A Prime' : 'Monitored'}</span>
          </div>
        </div>

        {/* KPI 2: Funding Readiness Score */}
        <div 
          onClick={() => onNavigate('funding-readiness')}
          className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/40 hover:border-purple-500 transition-all cursor-pointer group shadow-lg bg-gradient-to-b from-purple-950/20 to-slate-900"
        >
          <div className="flex items-center justify-between text-xs text-purple-300">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Funding Score
            </span>
            <Award className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-purple-300">{fundingScore}</span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-purple-300 font-semibold">{loanEligibility}</span>
            <span className="text-slate-400">{creditLimit}</span>
          </div>
        </div>

        {/* KPI 3: Operating Margin */}
        <div 
          onClick={() => onNavigate('financial-health')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Operating Margin</span>
            <TrendingUp className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-400">{opMargin}%</span>
            <span className="text-xs text-slate-400">EBITDA</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-300 font-medium">Gross: {grossMargin}%</span>
            <span className="text-emerald-400">{opMargin >= 12 ? 'Healthy' : 'Needs Focus'}</span>
          </div>
        </div>

        {/* KPI 4: Cash Runway */}
        <div 
          onClick={() => onNavigate('cash-flow')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Cash Runway</span>
            <Coins className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{runwayMonths}</span>
            <span className="text-xs text-slate-400">Months</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-300 font-medium">
              Net: ₹{analysis ? (analysis.financials.monthlyNetCashFlow / 100000).toFixed(1) : '10.0'}L/mo
            </span>
            <span className={runwayMonths >= 3 ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
              {runwayMonths >= 3 ? 'Stable' : 'Vulnerable'}
            </span>
          </div>
        </div>

        {/* KPI 5: Loan Eligibility Tier */}
        <div 
          onClick={() => onNavigate('funding-readiness')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Loan Eligibility</span>
            <Landmark className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-400">{loanEligibility}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-300">CGTMSE Coverage</span>
            <span className="text-purple-300 font-semibold">Bank Ready</span>
          </div>
        </div>

      </div>

      {/* Main Graph & AI Copilot Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Revenue, Expense, & Cash Flow Multi-Graph */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Revenue, Expense & Cash Generation
                <span className="text-xs font-normal text-slate-400">(in ₹ Lakhs)</span>
              </h3>
              <p className="text-xs text-slate-400">Based on active operational financial data and recurring expense structures</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="p-1 bg-slate-950 rounded-lg border border-slate-800 flex">
                <button
                  onClick={() => setChartView('area')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    chartView === 'area' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Trend Area
                </button>
                <button
                  onClick={() => setChartView('bar')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    chartView === 'bar' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly Bars
                </button>
              </div>

              <div className="p-1 bg-slate-950 rounded-lg border border-slate-800 flex">
                <button
                  onClick={() => setTimeframe('12m')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    timeframe === '12m' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  12M
                </button>
                <button
                  onClick={() => setTimeframe('6m')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    timeframe === '6m' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  6M
                </button>
              </div>
            </div>
          </div>

          {/* Graph Display */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue (₹L)" stroke="#8B5CF6" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
                  <Area type="monotone" dataKey="expense" name="Cost (₹L)" stroke="#38BDF8" strokeWidth={2} fillOpacity={1} fill="url(#expGrad)" />
                  <Area type="monotone" dataKey="cashFlow" name="Net Cash (₹L)" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#cashGrad)" />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="revenue" name="Revenue (₹L)" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Cost (₹L)" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Net Profit (₹L)" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              Gross Margin: <strong className="text-white">{grossMargin}%</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Operating Margin: <strong className="text-white">{opMargin}%</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              Net Profit Margin: <strong className="text-white">{netMargin}%</strong>
            </span>
          </div>

        </div>

        {/* Right 4 Cols: AI Executive Insights Panel */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" /> AI Executive Brief
              </h3>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Live Analysis
              </span>
            </div>

            {topRecs.length > 0 && (
              <AIInsightBadge 
                type="recommendation" 
                title="Strategic Recommendation"
                actionText="View Playbook"
                onAction={() => onNavigate('growth-intelligence')}
              >
                {`"${topRecs[0]}"`}
              </AIInsightBadge>
            )}

            {topRisks.length > 0 && (
              <AIInsightBadge 
                type="warning" 
                title="Business Risk Observation"
                actionText="Inspect Cash Forecast"
                onAction={() => onNavigate('cash-flow')}
              >
                {`"${topRisks[0]}"`}
              </AIInsightBadge>
            )}

            <AIInsightBadge 
              type="positive" 
              title="Borrowing Capacity"
              actionText="View Bank Matches"
              onAction={() => onNavigate('funding-readiness')}
            >
              {`"Based on current turnover and DSCR of ${analysis?.financials.dscr ?? 'clean leverage'}, estimated credit capacity stands at ${creditLimit}."`}
            </AIInsightBadge>
          </div>

          {/* Business Diagnostics Summary */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Financial Diagnostics Breakdown
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Monthly Revenue</span>
                <span className="text-white font-semibold">₹{analysis ? (analysis.financials.monthlyRevenue / 100000).toFixed(2) : '48.5'}L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Monthly Cost</span>
                <span className="text-slate-300 font-semibold">₹{analysis ? (analysis.financials.totalMonthlyExpenses / 100000).toFixed(2) : '38.5'}L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Working Capital</span>
                <span className={analysis && analysis.financials.workingCapital >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  ₹{analysis ? (analysis.financials.workingCapital / 100000).toFixed(2) : '34.0'}L
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DSCR Coverage</span>
                <span className="text-purple-300 font-semibold">
                  {analysis?.financials.dscr ? `${analysis.financials.dscr}x` : 'Debt-Free'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
