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
      <div className="p-6 rounded-2xl bg-[#121722] border border-[#222936] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-black/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/20">
              {t('executive.activePortfolio', 'Active Business Portfolio')}
            </span>
            <span className="text-xs text-[#707A8C] font-mono">
              UDYAM: {profile.udyamNumber || (language === 'ta' ? 'வழங்கப்படவில்லை' : 'Not provided')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#F8FAFC] tracking-tight">
            {analysis?.organizationName || profile.name}
          </h1>
          <p className="text-xs text-[#A7B0C0] font-medium">
            {analysis?.businessType || profile.sector} • {analysis?.location || profile.location} • {language === 'ta' ? 'விற்றுமுதல்: ' : 'Turnover: '}
            <strong className="text-[#8B5CF6] font-bold">{profile.turnover}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('what-if-simulator')}
            className="px-3.5 py-2 rounded-xl bg-[#161C27] hover:bg-[#1A2230] text-[#F8FAFC] text-xs font-semibold flex items-center gap-1.5 border border-[#222936] hover:border-[#303848] transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-[#8B5CF6]" />
            {t('executive.simulateDecision', 'Simulate Decision')}
          </button>

          <button
            onClick={onOpenPassport}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#8B5CF6]/20 transition-all hover:-translate-y-0.5"
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
          className="p-4 rounded-2xl bg-[#121722] border border-[#222936] hover:border-[#8B5CF6]/50 hover:bg-[#171D29] hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-[#707A8C] group-hover:text-[#A7B0C0]">
            <span className="font-semibold">{t('executive.kpiHealth', 'Business Health')}</span>
            <HeartPulse className="w-4 h-4 text-[#8B5CF6] group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#F8FAFC]">{healthScore}</span>
            <span className="text-xs text-[#707A8C] font-medium">/100</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-[#10B981] font-bold flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> {analysis?.health.rating || t('common.optimal', 'Optimal')}
            </span>
            <span className="text-[#707A8C] font-medium">
              {healthScore >= 75 ? t('executive.tierAPrime', 'Tier-A Prime') : t('executive.monitored', 'Monitored')}
            </span>
          </div>
        </div>

        {/* KPI 2: Funding Readiness Score */}
        <div 
          onClick={() => onNavigate('funding-readiness')}
          className="p-4 rounded-2xl bg-[#121722] border border-[#222936] hover:border-[#8B5CF6]/50 hover:bg-[#171D29] hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-[#A78BFA] group-hover:text-[#C4B5FD]">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#8B5CF6]" /> {t('executive.kpiFunding', 'Funding Score')}
            </span>
            <Award className="w-4 h-4 text-[#8B5CF6] group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#8B5CF6]">{fundingScore}</span>
            <span className="text-xs text-[#707A8C] font-medium">/100</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-[#A78BFA] font-semibold">
              {loanEligibility}
            </span>
            <span className="text-[#707A8C] font-medium">{creditLimit}</span>
          </div>
        </div>

        {/* KPI 3: Operating Margin */}
        <div 
          onClick={() => onNavigate('financial-health')}
          className="p-4 rounded-2xl bg-[#121722] border border-[#222936] hover:border-[#14B8A6]/50 hover:bg-[#171D29] hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-[#707A8C] group-hover:text-[#A7B0C0]">
            <span className="font-semibold">{t('executive.kpiMargin', 'Operating Margin')}</span>
            <TrendingUp className="w-4 h-4 text-[#14B8A6] group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#10B981]">{opMargin !== null ? `${opMargin}%` : '—'}</span>
            <span className="text-xs text-[#707A8C] font-medium">EBITDA</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-[#707A8C] font-medium">Gross: {grossMargin !== null ? `${grossMargin}%` : '—'}</span>
            <span className="text-[#10B981] font-bold">
              {opMargin !== null ? (opMargin >= 12 ? t('common.healthy', 'Healthy') : t('common.needsAttention', 'Needs Focus')) : '—'}
            </span>
          </div>
        </div>

        {/* KPI 4: Cash Runway */}
        <div 
          onClick={() => onNavigate('cash-flow')}
          className="p-4 rounded-2xl bg-[#121722] border border-[#222936] hover:border-[#14B8A6]/50 hover:bg-[#171D29] hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-[#707A8C] group-hover:text-[#A7B0C0]">
            <span className="font-semibold">{t('executive.kpiRunway', 'Cash Runway')}</span>
            <Coins className="w-4 h-4 text-[#14B8A6] group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#F8FAFC]">{runwayMonths !== null ? runwayMonths : '—'}</span>
            <span className="text-xs text-[#707A8C] font-medium">{t('common.months', 'Months')}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-[#707A8C] font-medium">
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
            <span className={(runwayMonths ?? 0) >= 3 ? 'text-[#10B981] font-bold' : 'text-[#F59E0B] font-bold'}>
              {runwayMonths !== null ? (runwayMonths >= 3 ? t('common.optimal', 'Stable') : t('common.critical', 'Vulnerable')) : t('common.notAvailable', 'N/A')}
            </span>
          </div>
        </div>

        {/* KPI 5: Loan Eligibility Tier */}
        <div 
          onClick={() => onNavigate('funding-readiness')}
          className="p-4 rounded-2xl bg-[#121722] border border-[#222936] hover:border-[#10B981]/50 hover:bg-[#171D29] hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-[#707A8C] group-hover:text-[#A7B0C0]">
            <span className="font-semibold">{t('executive.kpiEligibility', 'Loan Eligibility')}</span>
            <Landmark className="w-4 h-4 text-[#10B981] group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#10B981]">{loanEligibility}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-[#707A8C]">{t('executive.cgtmseCoverage', 'CGTMSE Coverage')}</span>
            <span className="text-[#8B5CF6] font-bold">{t('executive.bankReady', 'Bank Ready')}</span>
          </div>
        </div>

      </div>


      {/* Flagship Decision Intelligence Showcase */}
      <div className={`rounded-2xl p-5 transition-all shadow-lg ${
        isPro 
          ? 'bg-[#121722] border-2 border-[#8B5CF6]/40 shadow-[#8B5CF6]/5' 
          : 'bg-[#121722] border border-[#222936]'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/20">
                <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#A78BFA]">
                {isPro 
                  ? (language === 'ta' ? 'மேம்பட்ட வணிக முடிவு நுண்ணறிவு (செயலில் உள்ளது)' : 'Professional Decision Intelligence Active')
                  : (language === 'ta' ? 'மேம்பட்ட வணிக முடிவு நுண்ணறிவு' : 'Professional Decision Intelligence')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30 shadow-sm">
                PRO
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC]">
              {language === 'ta' 
                ? 'பணத்தை செலவழிக்கும் முன் வணிக முடிவுகளை உருவகப்படுத்துங்கள்'
                : 'Simulate business decisions & stress-test impact before spending money'}
            </h2>
            <p className="text-xs text-[#A7B0C0] max-w-2xl">
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
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white font-semibold text-xs transition-all shadow-md shadow-[#8B5CF6]/20"
                >
                  <FlaskConical className="w-4 h-4 text-white" />
                  <span>{language === 'ta' ? 'முடிவு ஆய்வகம் திறக்க' : 'Open Decision Lab'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('ai-advisor')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#161C27] hover:bg-[#1C2433] text-[#14B8A6] font-semibold text-xs border border-[#14B8A6]/30 transition-all shadow-sm"
                >
                  <Bot className="w-4 h-4 text-[#14B8A6]" />
                  <span>{language === 'ta' ? 'AI வணிக ஆலோசகர்' : 'AI Business Advisor'}</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => onNavigate('billing')}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white font-bold text-xs shadow-lg shadow-[#8B5CF6]/25 transition-all hover:shadow-[#8B5CF6]/40"
                >
                  <Lock className="w-3.5 h-3.5 text-white" />
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
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#121722] border border-[#222936] space-y-4 shadow-lg shadow-black/20">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222936]">
            <div>
              <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                {t('executive.revenueExpenseTitle', 'Revenue, Expense & Cash Generation')}
                <span className="text-xs font-normal text-[#707A8C]">
                  {t('executive.inLakhs', '(in ₹ Lakhs)')}
                </span>
              </h3>
              <p className="text-xs text-[#707A8C]">
                {language === 'ta' 
                  ? 'செயலில் உள்ள வணிகத் தரவு மற்றும் மாதாந்திர செலவுகளின் அடிப்படையில்'
                  : 'Based on active operational financial data and recurring expense structures'}
              </p>
              <div className="pt-1.5">
                <span className="text-[10px] font-semibold text-[#A78BFA] bg-[#8B5CF6]/10 px-2 py-0.5 rounded-md border border-[#8B5CF6]/20">
                  Projected: Forecast based on current operational assumptions
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="p-1 bg-[#0D1118] rounded-xl border border-[#222936] flex">
                <button
                  onClick={() => setChartView('area')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    chartView === 'area' ? 'bg-[#8B5CF6] text-white shadow-sm font-semibold' : 'text-[#707A8C] hover:text-[#F8FAFC]'
                  }`}
                >
                  {t('executive.trendArea', 'Trend Area')}
                </button>
                <button
                  onClick={() => setChartView('bar')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    chartView === 'bar' ? 'bg-[#8B5CF6] text-white shadow-sm font-semibold' : 'text-[#707A8C] hover:text-[#F8FAFC]'
                  }`}
                >
                  {t('executive.monthlyBars', 'Monthly Bars')}
                </button>
              </div>

              <div className="p-1 bg-[#0D1118] rounded-xl border border-[#222936] flex">
                <button
                  onClick={() => setTimeframe('12m')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    timeframe === '12m' ? 'bg-[#161C27] text-[#F8FAFC] shadow-sm font-semibold' : 'text-[#707A8C] hover:text-[#F8FAFC]'
                  }`}
                >
                  {t('executive.timeframe12M', '12M')}
                </button>
                <button
                  onClick={() => setTimeframe('6m')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    timeframe === '6m' ? 'bg-[#161C27] text-[#F8FAFC] shadow-sm font-semibold' : 'text-[#707A8C] hover:text-[#F8FAFC]'
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
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748B" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#64748B" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222936" vertical={false} />
                  <XAxis dataKey="month" stroke="#707A8C" fontSize={11} tickLine={false} />
                  <YAxis stroke="#707A8C" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#161C27', 
                      borderColor: '#303848', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      color: '#F8FAFC',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                    }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="revenue" name={t('executive.revenue', 'Revenue (₹L)')} stroke="#8B5CF6" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
                  <Area type="monotone" dataKey="expense" name={t('executive.cost', 'Cost (₹L)')} stroke="#64748B" strokeWidth={2} fillOpacity={1} fill="url(#expGrad)" />
                  <Area type="monotone" dataKey="cashFlow" name={t('executive.netCash', 'Net Cash (₹L)')} stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#cashGrad)" />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222936" vertical={false} />
                  <XAxis dataKey="month" stroke="#707A8C" fontSize={11} tickLine={false} />
                  <YAxis stroke="#707A8C" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#161C27', 
                      borderColor: '#303848', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      color: '#F8FAFC',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                    }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="revenue" name={t('executive.revenue', 'Revenue (₹L)')} fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name={t('executive.cost', 'Cost (₹L)')} fill="#475569" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name={t('executive.netProfit', 'Net Profit (₹L)')} fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-between text-xs text-[#707A8C] border-t border-[#222936]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
              {t('executive.grossMarginLabel', 'Gross Margin')}: <strong className="text-[#F8FAFC]">{grossMargin}%</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              {t('executive.operatingMarginLabel', 'Operating Margin')}: <strong className="text-[#F8FAFC]">{opMargin}%</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#14B8A6]"></span>
              {t('executive.netMarginLabel', 'Net Profit Margin')}: <strong className="text-[#F8FAFC]">{netMargin}%</strong>
            </span>
          </div>

        </div>

        {/* Right 4 Cols: AI Executive Insights Panel */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="p-5 rounded-2xl bg-[#121722] border border-[#222936] space-y-4 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#14B8A6]" /> {t('executive.aiBriefTitle', 'AI Executive Brief')}
              </h3>
              <span className="text-[10px] text-[#10B981] font-semibold bg-[#10B981]/10 px-2.5 py-0.5 rounded-full border border-[#10B981]/20">
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
          <div className="p-4 rounded-2xl bg-[#0F1219] border border-[#222936] space-y-2.5">
            <div className="text-[11px] font-bold text-[#F8FAFC] uppercase tracking-wider">
              {t('executive.diagnosticsTitle', 'Financial Diagnostics Breakdown')}
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#707A8C]">{t('executive.monthlyRevLabel', 'Monthly Revenue')}</span>
                <span className="text-[#F8FAFC] font-bold">{analysis ? `₹${(analysis.financials.monthlyRevenue / 100000).toFixed(2)}L` : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#707A8C]">{t('executive.monthlyCostLabel', 'Total Monthly Cost')}</span>
                <span className="text-[#A7B0C0] font-medium">{analysis ? `₹${(analysis.financials.totalMonthlyExpenses / 100000).toFixed(2)}L` : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#707A8C]">{t('executive.workingCapLabel', 'Working Capital')}</span>
                <span className={analysis && analysis.financials.workingCapital >= 0 ? 'text-[#10B981] font-bold' : 'text-[#F43F5E] font-bold'}>
                  {analysis ? `₹${(analysis.financials.workingCapital / 100000).toFixed(2)}L` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#707A8C]">{t('executive.dscrCoverageLabel', 'DSCR Coverage')}</span>
                <span className="text-[#8B5CF6] font-bold">
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
