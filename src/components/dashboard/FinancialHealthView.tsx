import React from 'react';
import { MSMEProfile } from '../../types';
import { BusinessAnalysis } from '../../types/business';
import { ScoreGauge } from '../common/ScoreGauge';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  HeartPulse, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ArrowRight
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
  const { t, language } = useLanguage();

  const healthScore = analysis ? analysis.health.overallScore : profile.healthScore;
  const rating = analysis ? analysis.health.rating : 'Optimal';
  const summary = analysis ? analysis.health.summary : 'Holistic financial diagnostic evaluated from your active operational and financial data.';
  const metrics = analysis ? analysis.health.metrics : [];
  const runwayMonths = analysis?.financials.runwayMonths ?? profile.runwayMonths;
  const dscr = analysis?.financials.dscr;
  const opMargin = analysis?.financials.operatingMarginPercent ?? null;
  const isTaxCompliant = analysis ? analysis.compliance.isFullyCompliant : true;

  const underwritingGrade =
    healthScore >= 80 ? 'Prime (Tier A)' : healthScore >= 65 ? 'Sound (Tier B)' : healthScore >= 50 ? 'Moderate (Tier C)' : 'High Risk';

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#121722] border border-[#222936] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-black/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A78BFA]">
            <HeartPulse className="w-4 h-4 text-[#8B5CF6]" />
            <span>{t('health.bannerTag', 'EXPLAINABLE FINANCIAL DIAGNOSTICS')}</span>
          </div>
          <h2 className="text-2xl font-black text-[#F8FAFC] mt-1">
            {t('health.title', 'Financial Health Score & Diagnostics')}
          </h2>
          <p className="text-xs text-[#A7B0C0] mt-0.5">
            {t('health.subtitle', 'Holistic underwriting assessment synthesized from active revenue, cost structures, working capital, and loan telemetry.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1 border ${
            isTaxCompliant 
              ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30' 
              : 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" /> 
            {isTaxCompliant ? t('health.fullyCompliant', 'Fully Compliant') : t('health.compliancePending', 'Compliance Pending')}
          </span>
        </div>
      </div>

      {/* Large Gauge & Primary AI Explanation Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 4 cols: Large Circular Gauge */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#121722] border border-[#222936] flex flex-col items-center justify-center text-center space-y-4 shadow-lg shadow-black/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
            <HeartPulse className="w-32 h-32 text-[#8B5CF6]" />
          </div>

          <span className="text-xs font-bold text-[#707A8C] uppercase tracking-widest">
            {t('health.overallGauge', 'Overall Health Gauge')}
          </span>

          <div className="py-2">
            <ScoreGauge 
              score={healthScore} 
              size={200} 
              strokeWidth={14} 
              label={language === 'ta' ? 'வணிக ஆரோக்கியம்' : 'Business Health'} 
              sublabel={underwritingGrade} 
              colorScheme="purple"
            />
          </div>

          <div className="w-full pt-3 border-t border-[#222936] text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#707A8C]">{t('health.underwritingGrade', 'Underwriting Grade')}</span>
              <span className="font-bold text-[#A78BFA]">{underwritingGrade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#707A8C]">{t('health.healthStatus', 'Health Status')}</span>
              <span className="font-bold text-[#10B981]">{rating}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#707A8C]">{t('health.auditedRunway', 'Audited Cash Runway')}</span>
              <span className="font-bold text-[#F8FAFC]">{runwayMonths} {t('common.months', 'Months')}</span>
            </div>
          </div>
        </div>

        {/* Right 8 cols: Central AI Diagnosis & Explainability Narrative */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#121722] border border-[#222936] space-y-5 shadow-lg shadow-black/20 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A78BFA] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#8B5CF6]" /> 
                {t('health.diagnosticSummary', 'Explainable Diagnostic Summary')}
              </span>
              <span className="text-[10px] font-medium text-[#707A8C]">
                {t('health.activeData', 'Active Business Data')}
              </span>
            </div>

            {/* Central Explainable Callout */}
            <div className="p-4 rounded-xl bg-[#0F1219] border border-[#222936] text-[#F8FAFC] space-y-2">
              <div className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                {`"${summary}"`}
              </div>
              <p className="text-xs text-[#A7B0C0] leading-relaxed">
                {analysis?.growth.recommendations[0] || 'Optimizing collection cycles and maintaining debt discipline will improve your institutional credit profile.'}
              </p>
            </div>

            {/* Quick 4 Sub-Pillar Status Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#0D1118] border border-[#222936]">
                <div className="text-[10px] text-[#707A8C] uppercase font-semibold">{t('health.opProfitability', 'Operating Margin')}</div>
                <div className="text-lg font-black text-[#A78BFA]">{opMargin !== null ? `${opMargin}%` : '—'}</div>
                <div className="text-[10px] text-[#10B981] font-semibold">{opMargin !== null ? (opMargin >= 12 ? 'Healthy EBITDA' : 'Margin Pressure') : 'Not available'}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0D1118] border border-[#222936]">
                <div className="text-[10px] text-[#707A8C] uppercase font-semibold">{t('health.liquidityRunway', 'Cash Runway')}</div>
                <div className="text-lg font-black text-[#38BDF8]">{runwayMonths !== null ? `${runwayMonths} Mo` : '—'}</div>
                <div className="text-[10px] text-[#10B981] font-semibold">{runwayMonths !== null ? (runwayMonths >= 3 ? 'Safe Buffer' : 'Tight Buffer') : 'Not available'}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0D1118] border border-[#222936]">
                <div className="text-[10px] text-[#707A8C] uppercase font-semibold">{t('health.debtDscr', 'Debt DSCR')}</div>
                <div className="text-lg font-black text-[#10B981]">{dscr ? `${dscr}x` : 'N/A'}</div>
                <div className="text-[10px] text-[#707A8C] font-semibold">{dscr ? (dscr >= 1.3 ? 'Bankable' : 'Strained') : 'Debt-Free'}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0D1118] border border-[#222936]">
                <div className="text-[10px] text-[#707A8C] uppercase font-semibold">{t('health.wcHealth', 'Working Capital')}</div>
                <div className="text-lg font-black text-[#F59E0B]">{analysis?.financials.currentRatio ? `${analysis.financials.currentRatio}x` : '—'}</div>
                <div className="text-[10px] text-[#F59E0B] font-semibold">{analysis?.financials.workingCapital && analysis.financials.workingCapital > 0 ? 'Positive Working Capital' : 'Working Capital Deficit'}</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#222936] flex items-center justify-between text-xs">
            <span className="text-[#707A8C]">
              {language === 'ta' ? 'செயலில் உள்ள நிதித் தகவல்களிலிருந்து கணக்கிடப்பட்டது' : 'Diagnostic calculated from active financial inputs'}
            </span>
            <button
              onClick={() => onNavigate('what-if-simulator')}
              className="text-[#A78BFA] hover:text-[#C4B5FD] font-semibold flex items-center gap-1 transition-colors"
            >
              {t('health.simulateImprovement', 'Simulate Margin Improvement')}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Detailed Health Dimension Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#8B5CF6]" />
          {t('health.dimensionsTitle', 'In-Depth Financial Health Dimensions')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-xl bg-[#121722] border border-[#222936] hover:border-[#8B5CF6]/40 hover:bg-[#171D29] hover:shadow-lg hover:shadow-black/20 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#F8FAFC]">{metric.category}</h4>
                  <div className="text-[10px] text-[#707A8C]">
                    {t('health.weight', 'Diagnostic Weight')}: {metric.weight}%
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    metric.status === 'Optimal' ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30' :
                    metric.status === 'Healthy' ? 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30' :
                    metric.status === 'Moderate' ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30' :
                    'bg-[#F43F5E]/15 text-[#F43F5E] border-[#F43F5E]/30'
                  }`}>
                    {metric.status}
                  </span>
                  <span className="text-base font-black text-[#F8FAFC]">{metric.score}/100</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-[#222936] overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    metric.score >= 80 ? 'bg-[#10B981]' :
                    metric.score >= 65 ? 'bg-[#38BDF8]' :
                    metric.score >= 50 ? 'bg-[#F59E0B]' :
                    'bg-[#F43F5E]'
                  }`}
                  style={{ width: `${metric.score}%` }}
                />
              </div>

              <div className="p-3 rounded-lg bg-[#0F1219] border border-[#222936] text-xs text-[#A7B0C0] space-y-1">
                <div className="font-medium text-[#F8FAFC] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#8B5CF6]" /> 
                  {t('health.insight', 'Insight')}:
                </div>
                <p className="text-[#A7B0C0] leading-relaxed">{metric.insight}</p>
              </div>

              <div className="text-xs text-[#A7B0C0] flex items-start gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#F8FAFC]">{t('health.recommendation', 'Recommendation')}:</strong> {metric.recommendation}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
