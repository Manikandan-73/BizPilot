import React, { useMemo, useState } from 'react';
import { MSMEProfile } from '../../types';
import { BusinessAnalysis } from '../../types/business';
import { useLanguage } from '../../i18n/LanguageContext';
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
}) => {
  const { t, language } = useLanguage();

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
  const nextMonthNet = nextMonth && nextMonth.predictedNetCash !== undefined ? (nextMonth.predictedNetCash / 100000).toFixed(1) : '—';
  const nextMonthInflow = nextMonth && nextMonth.predictedInflow !== undefined ? (nextMonth.predictedInflow / 100000).toFixed(1) : '—';
  const nextMonthOutflow = nextMonth && nextMonth.predictedOutflow !== undefined ? (nextMonth.predictedOutflow / 100000).toFixed(1) : '—';

  const runwayMonths = analysis?.financials.runwayMonths ?? profile.runwayMonths;
  const bufferStatus = analysis?.cashFlow.cashBufferStatus ?? 'Safe';
  const hasWarning = analysis?.cashFlow.hasRunwayWarning ?? false;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#121722] border border-[#222936] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-black/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#A78BFA]">
            <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
            <span>{t('cashFlow.bannerTag', 'PREDICTIVE CASH FLOW FORECAST')}</span>
          </div>
          <h2 className="text-2xl font-bold text-[#F8FAFC] mt-1">
            {t('cashFlow.title', 'Cash Flow & Liquidity Runway Forecast')}
          </h2>
          <p className="text-xs text-[#A7B0C0] mt-0.5">
            {t('cashFlow.subtitle', 'Forward-looking liquidity projections synthesized from active operating cash inflows, fixed expense commitments, and debt EMI obligations.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/20 flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" /> {t('cashFlow.modeling', 'Forward Cash Modeling')}
          </span>
        </div>
      </div>

      {hasWarning && (
        <div className="p-4 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <div className="text-xs text-[#A7B0C0]">
            <strong className="text-[#F59E0B] block font-bold mb-0.5">
              {t('cashFlow.warningTitle', 'Cash Buffer Deficit Warning')}
            </strong>
            {analysis?.cashFlow.warningMessage || 'Projected cash reserves are running tight against monthly operating expenses. Consider accelerating debtor recovery.'}
          </div>
        </div>
      )}

      {/* 3 Forecast Projection Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Card 1: Next Month Projection */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121722] border border-[#222936] hover:border-[#8B5CF6]/40 hover:bg-[#171D29] hover:shadow-lg hover:shadow-black/20 space-y-2 transition-all min-w-0">
          <div className="flex items-center justify-between text-xs text-[#707A8C]">
            <span className="font-semibold uppercase tracking-wider truncate">
              {t('cashFlow.nextMonth', 'Next Month Projection (M+1)')}
            </span>
            <Calendar className="w-4 h-4 text-[#8B5CF6] shrink-0" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">₹{nextMonthNet} L</div>
            <span className="text-xs text-[#10B981] font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> {t('cashFlow.projectedNet', 'Projected Net')}
            </span>
          </div>
          <div className="text-[11px] text-[#707A8C] truncate">
            {t('cashFlow.inflow', 'Inflow')}: <strong className="text-[#F8FAFC]">₹{nextMonthInflow} L</strong> • {t('cashFlow.outflow', 'Outflow')}: <strong className="text-[#F8FAFC]">₹{nextMonthOutflow} L</strong>
          </div>
        </div>

        {/* Card 2: Cash Runway Duration */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121722] border border-[#222936] hover:border-[#14B8A6]/40 hover:bg-[#171D29] hover:shadow-lg hover:shadow-black/20 space-y-2 transition-all min-w-0">
          <div className="flex items-center justify-between text-xs text-[#707A8C]">
            <span className="font-semibold uppercase tracking-wider truncate">
              {t('cashFlow.projectedRunway', 'Projected Cash Runway')}
            </span>
            <ShieldAlert className="w-4 h-4 text-[#14B8A6] shrink-0" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">{runwayMonths} {t('common.months', 'Months')}</div>
            <span className="text-xs text-[#14B8A6] font-semibold">
              {t('cashFlow.burnRate', 'Current Burn Rate')}
            </span>
          </div>
          <div className="text-[11px] text-[#707A8C] truncate">
            {t('cashFlow.currentCash', 'Current Cash')}: <strong className="text-[#F8FAFC]">₹{analysis ? (analysis.normalized.currentCashBalance / 100000).toFixed(1) : '52.0'} L</strong>
          </div>
        </div>

        {/* Card 3: 90-Day Liquidity Buffer */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121722] border border-[#222936] hover:border-[#10B981]/40 hover:bg-[#171D29] hover:shadow-lg hover:shadow-black/20 space-y-2 transition-all min-w-0">
          <div className="flex items-center justify-between text-xs text-[#707A8C]">
            <span className="font-semibold uppercase tracking-wider truncate">
              {t('cashFlow.liquidityHealth90D', '90-Day Liquidity Health')}
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className={`text-xl sm:text-2xl font-bold ${bufferStatus === 'Safe' ? 'text-[#10B981]' : bufferStatus === 'Adequate' ? 'text-[#14B8A6]' : 'text-[#F59E0B]'}`}>
              {bufferStatus}
            </div>
            <span className="text-xs text-[#707A8C]">
              {t('cashFlow.reserveStatus', 'Reserve Status')}
            </span>
          </div>
          <div className="text-[11px] text-[#707A8C] truncate">
            {t('cashFlow.receivables', 'Receivables')}: <strong className="text-[#F8FAFC]">{analysis ? `₹${(analysis.normalized.accountsReceivable / 100000).toFixed(1)} L` : '—'}</strong>
          </div>
        </div>

      </div>

      {/* Forecast Disclaimer Banner */}
      <div className="p-3 px-4 rounded-xl bg-[#0F1219] border border-[#222936] text-xs flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="font-bold text-[#A78BFA] uppercase tracking-wider text-[10px] bg-[#8B5CF6]/15 px-2 py-0.5 rounded border border-[#8B5CF6]/30 shrink-0 self-start sm:self-auto">Forecast Notice</span>
        <span className="text-[#707A8C]">Projected: Forecast based on current operational assumptions. Forward figures (M+1 to M+6) are deterministic scenario models, not guaranteed cash flows.</span>
      </div>

      {/* Main Forecast Chart Box */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#121722] border border-[#222936] space-y-4 shadow-lg shadow-black/20 min-w-0">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#222936]">
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
              {t('cashFlow.chartTitle', 'Monthly Inflow vs Outflow & Net Cash')}
              <span className="text-xs font-normal text-[#707A8C]">
                {t('executive.inLakhs', '(in ₹ Lakhs)')}
              </span>
            </h3>
            <p className="text-xs text-[#707A8C]">
              {language === 'ta' 
                ? 'தற்போதைய மாதம் அடிப்படை எண்களைக் காட்டுகிறது; வரவிருக்கும் மாதங்கள் மாதிரி முன்கணிப்புகளைக் காட்டுகின்றன' 
                : 'Current month reflects baseline figures; forward months show model projections with confidence intervals'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Stress testing control */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0D1118] border border-[#222936]">
              <Sliders className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-[#707A8C] font-medium">
                {t('cashFlow.stressLabel', 'Debtor Delay Stress')}:
              </span>
              <select
                value={stressFactor}
                onChange={(e) => setStressFactor(Number(e.target.value))}
                className="bg-[#161C27] text-[#F8FAFC] font-medium rounded-lg px-2 py-0.5 border border-[#303848] outline-none focus:border-[#8B5CF6]"
              >
                <option value={0}>0% ({t('cashFlow.stressStandard', 'Standard')})</option>
                <option value={10}>+10% ({t('cashFlow.stressModerate', 'Delay')})</option>
                <option value={20}>+20% ({t('cashFlow.stressSevere', 'Severe')})</option>
              </select>
            </div>

            {/* Timeframe horizon toggle */}
            <div className="p-1 bg-[#0D1118] rounded-xl border border-[#222936] flex">
              <button
                onClick={() => setSelectedHorizon('30d')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedHorizon === '30d' ? 'bg-[#8B5CF6] text-white shadow-sm' : 'text-[#707A8C] hover:text-[#F8FAFC]'
                }`}
              >
                30D
              </button>
              <button
                onClick={() => setSelectedHorizon('90d')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedHorizon === '90d' ? 'bg-[#8B5CF6] text-white shadow-sm' : 'text-[#707A8C] hover:text-[#F8FAFC]'
                }`}
              >
                90D
              </button>
              <button
                onClick={() => setSelectedHorizon('180d')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedHorizon === '180d' ? 'bg-[#8B5CF6] text-white shadow-sm' : 'text-[#707A8C] hover:text-[#F8FAFC]'
                }`}
              >
                180D
              </button>
            </div>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-72 sm:h-80 w-full pt-2 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={displayData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222936" vertical={false} />
              <XAxis dataKey="period" stroke="#707A8C" fontSize={11} tickLine={false} />
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
              <Area type="monotone" dataKey="predictedInflow" name={t('cashFlow.inflow', 'Inflow (₹L)')} fill="#14B8A6" stroke="#14B8A6" fillOpacity={0.15} />
              <Area type="monotone" dataKey="predictedOutflow" name={t('cashFlow.outflow', 'Outflow (₹L)')} fill="#F43F5E" stroke="#F43F5E" fillOpacity={0.1} />
              <Line type="monotone" dataKey="predictedNetCash" name={t('executive.netCash', 'Net Cash (₹L)')} stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: '#8B5CF6' }} />
              <Line type="monotone" dataKey="confidenceUpper" name="Upper Band (+15%)" stroke="#707A8C" strokeDasharray="4 4" strokeWidth={1} dot={false} />
              <Line type="monotone" dataKey="confidenceLower" name="Lower Band (-15%)" stroke="#707A8C" strokeDasharray="4 4" strokeWidth={1} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-3 flex flex-wrap items-center justify-between gap-2.5 text-xs text-[#707A8C] border-t border-[#222936]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#14B8A6] shrink-0"></span>
            {language === 'ta' ? 'அடிப்படை வரவு: ' : 'Monthly Inflow Base: '}
            <strong className="text-[#F8FAFC]">{analysis ? `₹${(analysis.normalized.monthlyRevenue / 100000).toFixed(1)} ${t('common.lakhs', 'Lakhs')}` : 'Not provided'}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F43F5E] shrink-0"></span>
            {language === 'ta' ? 'அடிப்படை செலவு: ' : 'Monthly Outflow Base: '}
            <strong className="text-[#F8FAFC]">{analysis ? `₹${(analysis.financials.totalMonthlyExpenses / 100000).toFixed(1)} ${t('common.lakhs', 'Lakhs')}` : 'Not provided'}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6] shrink-0"></span>
            {language === 'ta' ? 'மாதாந்திர தவணை EMI: ' : 'Monthly EMI Outflow: '}
            <strong className="text-[#F8FAFC]">{analysis ? (analysis.normalized.hasLoans ? `₹${(analysis.normalized.monthlyEMI / 1000).toFixed(0)}k/mo` : '₹0 (Debt-Free)') : 'Not provided'}</strong>
          </span>
        </div>

      </div>

    </div>
  );
};
