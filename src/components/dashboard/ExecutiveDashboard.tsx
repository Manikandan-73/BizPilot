import React, { useMemo, useState } from 'react';
import { MSMEProfile } from '../../types';
import { Organization } from '../../types/business';
import { useSubscription } from '../../hooks/useSubscription';
import { hasFeature } from '../../config/plans';
import { BusinessAnalysis } from '../../types/business';
import { AIInsightBadge } from '../common/AIInsightBadge';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  HeartPulse,
  FlaskConical,
  Bot,
  Lock,
  ArrowRight, 
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
  organization?: Organization | null;
  onNavigate: (tab: any) => void;
  onOpenPassport: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  profile,
  analysis,
  organization,
  onNavigate,
  onOpenPassport
}) => {
  const { t, language } = useLanguage();
  const { subscription } = useSubscription({ organization });
  const isPro = hasFeature(subscription, 'advancedDecisionLab');

  const [chartView, setChartView] = useState<'area' | 'bar'>('area');
  const [timeframe, setTimeframe] = useState<'12m' | '6m'>('12m');

  // Generate 6-12 month forward projection derived deterministically from actual operational cash flow
  const fullChartData = useMemo(() => {
    if (!analysis || !analysis.cashFlow?.dataPoints?.length) {
      return [];
    }

    return analysis.cashFlow.dataPoints.map((dp) => {
      const revenue = parseFloat(((dp.predictedInflow ?? dp.actualInflow ?? 0) / 100000).toFixed(1));
      const expense = parseFloat(((dp.predictedOutflow ?? dp.actualOutflow ?? 0) / 100000).toFixed(1));
      const profit = parseFloat(((dp.predictedNetCash ?? dp.netCash ?? 0) / 100000).toFixed(1));

      return {
        month: dp.period,
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

  const grossMargin = analysis?.financials.grossMarginPercent ?? null;
  const netMargin = analysis?.financials.netMarginPercent ?? null;
  const opMargin = analysis?.financials.operatingMarginPercent ?? null;

  const topRisks = analysis?.growth.keyRisks ?? [];
  const topRecs = analysis?.growth.recommendations ?? [];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {t('executive.activePortfolio', 'Active Business Portfolio')}
            </span>
            <span className="text-xs text-slate-400">
              UDYAM: {profile.udyamNumber || (language === 'ta' ? 'வழங்கப்படவில்லை' : 'Not provided')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">
            {analysis?.organizationName || profile.name}
          </h1>
          <p className="text-xs text-slate-300">
            {analysis?.businessType || profile.sector} • {analysis?.location || profile.location} • {language === 'ta' ? 'விற்றுமுதல்: ' : 'Turnover: '}
            <strong className="text-purple-300">{profile.turnover}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('what-if-simulator')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            {t('executive.simulateDecision', 'Simulate Decision')}
          </button>

          <button
            onClick={onOpenPassport}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            {t('executive.downloadPassport', 'Download Passport')}
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
            <span className="font-semibold">{t('executive.kpiHealth', 'Business Health')}</span>
            <HeartPulse className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{healthScore}</span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> {analysis?.health.rating || t('common.optimal', 'Optimal')}
            </span>
            <span className="text-slate-400">
              {healthScore >= 75 ? t('executive.tierAPrime', 'Tier-A Prime') : t('executive.monitored', 'Monitored')}
            </span>
          </div>
        </div>

        {/* KPI 2: Funding Readiness Score */}
        <div 
          onClick={() => onNavigate('funding-readiness')}
          className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/40 hover:border-purple-500 transition-all cursor-pointer group shadow-lg bg-gradient-to-b from-purple-950/20 to-slate-900"
        >
          <div className="flex items-center justify-between text-xs text-purple-300">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {t('executive.kpiFunding', 'Funding Score')}
            </span>
            <Award className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-purple-300">{fundingScore}</span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-purple-300 font-semibold">
              {loanEligibility}
            </span>
            <span className="text-slate-400">{creditLimit}</span>
          </div>
        </div>

        {/* KPI 3: Operating Margin */}
        <div 
          onClick={() => onNavigate('financial-health')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">{t('executive.kpiMargin', 'Operating Margin')}</span>
            <TrendingUp className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-400">{opMargin !== null ? `${opMargin}%` : '—'}</span>
            <span className="text-xs text-slate-400">EBITDA</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-300 font-medium">Gross: {grossMargin !== null ? `${grossMargin}%` : '—'}</span>
            <span className="text-emerald-400 font-medium">
              {opMargin !== null ? (opMargin >= 12 ? t('common.healthy', 'Healthy') : t('common.needsAttention', 'Needs Focus')) : '—'}
            </span>
          </div>
        </div>

        {/* KPI 4: Cash Runway */}
        <div 
          onClick={() => onNavigate('cash-flow')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">{t('executive.kpiRunway', 'Cash Runway')}</span>
            <Coins className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{runwayMonths !== null ? runwayMonths : '—'}</span>
            <span className="text-xs text-slate-400">{t('common.months', 'Months')}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-300 font-medium">
              Net: ₹{(() => {
                if (analysis) return (analysis.financials.monthlyNetCashFlow / 100000).toFixed(1);
                if (organization?.financialProfile) {
                  const rev = typeof organization.financialProfile.monthlyRevenue === 'number' ? organization.financialProfile.monthlyRevenue : 0;
                  const exp = typeof organization.financialProfile.monthlyOperatingExpenses === 'number' ? organization.financialProfile.monthlyOperatingExpenses : 0;
                  return ((rev - exp) / 100000).toFixed(1);
                }
                return '0.0';
              })()}L/mo
            </span>
            <span className={(runwayMonths ?? 0) >= 3 ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
              {runwayMonths !== null ? (runwayMonths >= 3 ? t('common.optimal', 'Stable') : t('common.critical', 'Vulnerable')) : t('common.notAvailable', 'N/A')}
            </span>
          </div>
        </div>

        {/* KPI 5: Loan Eligibility Tier */}
        <div 
          onClick={() => onNavigate('funding-readiness')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">{t('executive.kpiEligibility', 'Loan Eligibility')}</span>
            <Landmark className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-400">{loanEligibility}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-300">{t('executive.cgtmseCoverage', 'CGTMSE Coverage')}</span>
            <span className="text-purple-300 font-semibold">{t('executive.bankReady', 'Bank Ready')}</span>
          </div>
        </div>

      </div>


      {/* Flagship Decision Intelligence Showcase */}
      <div className="rounded-2xl border p-5 transition-all shadow-xl ${
        isPro 
          ? 'bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border-purple-500/30' 
          : 'bg-slate-900/90 border-slate-800'
      }">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                {isPro 
                  ? (language === 'ta' ? 'மேம்பட்ட வணிக முடிவு நுண்ணறிவு (செயலில் உள்ளது)' : 'Professional Decision Intelligence Active')
                  : (language === 'ta' ? 'மேம்பட்ட வணிக முடிவு நுண்ணறிவு' : 'Professional Decision Intelligence')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500 text-white shadow-sm">
                PRO
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {language === 'ta' 
                ? 'பணத்தை செலவழிக்கும் முன் வணிக முடிவுகளை உருவகப்படுத்துங்கள்'
                : 'Simulate business decisions & stress-test impact before spending money'}
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              {language === 'ta'
                ? 'விலை உயர்வு, புதிய பணியாளர் சேர்த்தல், வங்கி கடன் மற்றும் செலவு குறைப்பு போன்ற முடிவுகளின் லாப மற்றும் பணப்புழக்க தாக்கத்தை நிகழ்நேரத்தில் கணிக்கவும்.'
                : 'Model price changes, new hires, term loans, and cost cuts with deterministic financial math and grounded AI diagnostic advisory.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {isPro ? (
              <>
                <button
                  onClick={() => onNavigate('decision-lab')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md shadow-purple-600/30"
                >
                  <FlaskConical className="w-4 h-4 text-purple-200" />
                  <span>{language === 'ta' ? 'முடிவு ஆய்வகம் திறக்க' : 'Open Decision Lab'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('ai-advisor')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-200 font-semibold text-xs border border-purple-500/30 transition-all"
                >
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>{language === 'ta' ? 'AI வணிக ஆலோசகர்' : 'AI Business Advisor'}</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => onNavigate('billing')}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
                >
                  <Lock className="w-3.5 h-3.5 text-purple-200" />
                  <span>{language === 'ta' ? 'புரோவுக்கு மேம்படுத்து (₹2 மட்டும்)' : 'Unlock with Professional (₹2 Test Mode)'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
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
                {t('executive.revenueExpenseTitle', 'Revenue, Expense & Cash Generation')}
                <span className="text-xs font-normal text-slate-400">
                  {t('executive.inLakhs', '(in ₹ Lakhs)')}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ta' 
                  ? 'செயலில் உள்ள வணிகத் தரவு மற்றும் மாதாந்திர செலவுகளின் அடிப்படையில்'
                  : 'Based on active operational financial data and recurring expense structures'}
              </p>
              <div className="pt-1">
                <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  Projected: Forecast based on current operational assumptions
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="p-1 bg-slate-950 rounded-lg border border-slate-800 flex">
                <button
                  onClick={() => setChartView('area')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    chartView === 'area' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('executive.trendArea', 'Trend Area')}
                </button>
                <button
                  onClick={() => setChartView('bar')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    chartView === 'bar' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('executive.monthlyBars', 'Monthly Bars')}
                </button>
              </div>

              <div className="p-1 bg-slate-950 rounded-lg border border-slate-800 flex">
                <button
                  onClick={() => setTimeframe('12m')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    timeframe === '12m' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('executive.timeframe12M', '12M')}
                </button>
                <button
                  onClick={() => setTimeframe('6m')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    timeframe === '6m' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('executive.timeframe6M', '6M')}
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
                    contentStyle={{ 
                      backgroundColor: '#0F172A', 
                      borderColor: '#334155', 
                      borderRadius: '8px', 
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="revenue" name={t('executive.revenue', 'Revenue (₹L)')} stroke="#8B5CF6" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
                  <Area type="monotone" dataKey="expense" name={t('executive.cost', 'Cost (₹L)')} stroke="#38BDF8" strokeWidth={2} fillOpacity={1} fill="url(#expGrad)" />
                  <Area type="monotone" dataKey="cashFlow" name={t('executive.netCash', 'Net Cash (₹L)')} stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#cashGrad)" />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0F172A', 
                      borderColor: '#334155', 
                      borderRadius: '8px', 
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="revenue" name={t('executive.revenue', 'Revenue (₹L)')} fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name={t('executive.cost', 'Cost (₹L)')} fill="#38BDF8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name={t('executive.netProfit', 'Net Profit (₹L)')} fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              {t('executive.grossMarginLabel', 'Gross Margin')}: <strong className="text-white">{grossMargin}%</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {t('executive.operatingMarginLabel', 'Operating Margin')}: <strong className="text-white">{opMargin}%</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              {t('executive.netMarginLabel', 'Net Profit Margin')}: <strong className="text-white">{netMargin}%</strong>
            </span>
          </div>

        </div>

        {/* Right 4 Cols: AI Executive Insights Panel */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" /> {t('executive.aiBriefTitle', 'AI Executive Brief')}
              </h3>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {t('executive.liveAnalysis', 'Live Analysis')}
              </span>
            </div>

            {topRecs.length > 0 && (
              <AIInsightBadge 
                type="recommendation" 
                title={t('executive.strategicRec', 'Strategic Recommendation')}
                actionText={language === 'ta' ? 'திட்டத்தைக் காண்க' : 'View Playbook'}
                onAction={() => onNavigate('growth-intelligence')}
              >
                {`"${topRecs[0]}"`}
              </AIInsightBadge>
            )}

            {topRisks.length > 0 && (
              <AIInsightBadge 
                type="warning" 
                title={t('executive.businessRisk', 'Business Risk Observation')}
                actionText={language === 'ta' ? 'முன்கணிப்பை ஆராய்க' : 'Inspect Cash Forecast'}
                onAction={() => onNavigate('cash-flow')}
              >
                {`"${topRisks[0]}"`}
              </AIInsightBadge>
            )}

            <AIInsightBadge 
              type="positive" 
              title={t('executive.borrowingCap', 'Borrowing Capacity')}
              actionText={language === 'ta' ? 'வங்கி பொருத்தங்கள்' : 'View Bank Matches'}
              onAction={() => onNavigate('funding-readiness')}
            >
              {language === 'ta'
                ? `தற்போதைய விற்றுமுதல் மற்றும் DSCR அடிப்படையில் உங்கள் கடன் தகுதி ${creditLimit} ஆகக் கணக்கிடப்பட்டுள்ளது.`
                : `"Based on current turnover and DSCR of ${analysis?.financials.dscr ?? 'clean leverage'}, estimated credit capacity stands at ${creditLimit}."`}
            </AIInsightBadge>
          </div>

          {/* Business Diagnostics Summary */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              {t('executive.diagnosticsTitle', 'Financial Diagnostics Breakdown')}
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{t('executive.monthlyRevLabel', 'Monthly Revenue')}</span>
                <span className="text-white font-semibold">{analysis ? `₹${(analysis.financials.monthlyRevenue / 100000).toFixed(2)}L` : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t('executive.monthlyCostLabel', 'Total Monthly Cost')}</span>
                <span className="text-slate-300 font-semibold">{analysis ? `₹${(analysis.financials.totalMonthlyExpenses / 100000).toFixed(2)}L` : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t('executive.workingCapLabel', 'Working Capital')}</span>
                <span className={analysis && analysis.financials.workingCapital >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {analysis ? `₹${(analysis.financials.workingCapital / 100000).toFixed(2)}L` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t('executive.dscrCoverageLabel', 'DSCR Coverage')}</span>
                <span className="text-purple-300 font-semibold">
                  {analysis?.financials.dscr ? `${analysis.financials.dscr}x` : t('executive.debtFree', 'Debt-Free')}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
