import React, { useState } from 'react';
import { MSMEProfile } from '../../types';
import { BusinessAnalysis, Organization } from '../../types/business';
import { ScoreGauge } from '../common/ScoreGauge';
import { useLanguage } from '../../i18n/LanguageContext';
import { useSubscription } from '../../hooks/useSubscription';
import { hasFeature } from '../../config/plans';
import { FeatureGate } from '../subscription/FeatureGate';
import { 
  FileCheck2, 
  ShieldCheck, 
  Scale, 
  ArrowRight, 
  CheckCircle2, 
  Landmark, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  HelpCircle,
  X,
  AlertTriangle,
  AlertCircle,
  Clock,
  TrendingUp,
  ExternalLink,
  Bot,
  FlaskConical,
  HeartPulse,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FundingReadinessViewProps {
  profile: MSMEProfile;
  analysis?: BusinessAnalysis;
  organization?: Organization | null;
  onOpenPassport: () => void;
  onNavigate: (tab: any) => void;
}

export const FundingReadinessView: React.FC<FundingReadinessViewProps> = ({
  profile,
  analysis,
  organization,
  onOpenPassport,
  onNavigate
}) => {
  const { t, language } = useLanguage();
  const { subscription } = useSubscription({ organization });
  const isPro = hasFeature(subscription, 'advancedFunding');

  const [expandedPillar, setExpandedPillar] = useState<number | null>(0);
  const [showExplainModal, setShowExplainModal] = useState<boolean>(false);
  const [completedChecklist, setCompletedChecklist] = useState<string[]>([]);

  const toggleChecklist = (id: string) => {
    if (completedChecklist.includes(id)) {
      setCompletedChecklist(completedChecklist.filter(item => item !== id));
    } else {
      setCompletedChecklist([...completedChecklist, id]);
      confetti({
        particleCount: 40,
        spread: 45,
        origin: { y: 0.7 }
      });
    }
  };

  const funding = analysis?.funding;
  const fundingScore = funding ? funding.overallScore : profile.fundingReadinessScore;
  const creditLimit = funding ? funding.estimatedCreditLimit : profile.estimatedCreditLimit;
  const eligibilityTier = funding ? funding.eligibilityTier : profile.loanEligibility;
  const pillars = funding ? funding.pillars : [];
  const dimensions = funding?.dimensions ?? [];
  const strengths = funding?.strengths ?? [];
  const gaps = funding?.gaps ?? [];
  const actionPlan = funding?.actionPlan ?? [];
  const preparationChecklist = funding?.preparationChecklist ?? [];
  const debtAssessment = funding?.debtAssessment;
  const fundingStrategy = funding?.fundingStrategy;
  const bankMatches = funding?.bankMatches ?? [];

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Page Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-purple-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-purple-300">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 uppercase tracking-wider text-[10px]">
              {t('funding.indicativeTag', 'Indicative')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 uppercase tracking-wider text-[10px]">
              {t('funding.estimatedTag', 'Estimated')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase tracking-wider text-[10px]">
              {t('funding.notApproval', 'Not a loan approval')}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">
            {t('funding.headerTitle', 'Funding Readiness')}
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {t('funding.headerSubtitle', 'Understand how your current financial profile may support future funding applications.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowExplainModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold text-xs flex items-center gap-1.5 border border-purple-500/30 transition-all shadow-md"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            {t('funding.explainScoreBtn', 'Explain my score')}
          </button>
          <button
            onClick={onOpenPassport}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
          >
            <FileCheck2 className="w-4 h-4" />
            {t('funding.generatePassport', 'Generate Credit Passport')}
          </button>
        </div>
      </div>

      {/* 2. Top Split: Score Gauge & Estimated Borrowing Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: Score Card & Explain CTA */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-purple-500/30 flex flex-col items-center justify-between text-center space-y-4 shadow-xl">
          <div className="w-full flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-purple-300 uppercase tracking-wider text-[10px]">
              {t('funding.fundingScoreLabel', 'Funding Score')}
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              0–100 Scale
            </span>
          </div>

          <div className="py-2">
            <ScoreGauge 
              score={fundingScore} 
              size={190} 
              strokeWidth={14} 
              label={language === 'ta' ? 'தயார்நிலை' : 'Readiness'} 
              sublabel={`${eligibilityTier} ${language === 'ta' ? 'தகுதி' : 'Tier'}`} 
              colorScheme="purple"
            />
          </div>

          <div className="w-full pt-3 border-t border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">{t('funding.borrowingLimit', 'Estimated Borrowing Limit')}</span>
              <span className="font-bold text-emerald-400">{creditLimit}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">{t('funding.debtOutstanding', 'Active Debt Outstanding')}</span>
              <span className="font-bold text-white">
                {analysis?.normalized.hasLoans 
                  ? `₹${(analysis.normalized.outstandingLoanAmount / 100000).toFixed(1)} ${t('common.lakhs', 'Lakhs')}` 
                  : t('executive.debtFree', 'Debt-Free')}
              </span>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setShowExplainModal(true)}
                className="w-full py-2 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-purple-500/30 transition-all"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {language === 'ta' ? `எனது மதிப்பெண் ${fundingScore} ஆனது ஏன்?` : `Why is my score ${fundingScore}?`}
              </button>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Transparent Score Breakdown Grid */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-400" />
                {language === 'ta' ? 'மதிப்பெண் கணக்கீட்டு பரிமாணங்கள்' : 'Transparent Score Breakdown'}
              </h3>
              <span className="text-[10px] text-purple-300 font-semibold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                5 Underwriting Dimensions
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'ta' 
                ? 'உங்கள் மதிப்பெண் கீழேயுள்ள 5 குறிப்பிட்ட நிதி பரிமாணங்களின் மூலம் கணக்கிடப்படுகிறது:' 
                : 'Your score is deterministically calculated across these 5 core underwriting dimensions:'}
            </p>
          </div>

          <div className="space-y-2.5">
            {dimensions.map((dim, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{dim.factor}</span>
                    <span className="text-[10px] text-slate-400">({dim.weight}% Weight)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      dim.contribution === 'positive'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {dim.contribution === 'positive' ? '✓ Positive' : '⚠ Negative'}
                    </span>
                    <span className="font-black text-white text-xs">
                      {dim.rawScore} / {dim.weight} pts
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[80%]">{dim.metricsSummary}</span>
                  <span className={`font-semibold ${
                    dim.status === 'Strong' ? 'text-emerald-400' :
                    dim.status === 'Satisfactory' ? 'text-sky-400' :
                    dim.status === 'Needs Attention' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {dim.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800">
            <span>{language === 'ta' ? 'மொத்த எடை: 100 புள்ளிகள்' : 'Total Scoring Base: 100 Points'}</span>
            <button 
              onClick={() => onNavigate('what-if-simulator')}
              className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              {language === 'ta' ? 'மதிப்பெண் உருவகப்படுத்துதல்' : 'Simulate Score Improvement'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 3. Strengths & Gaps (Data-Driven, Max 5 Items Each) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* What's Helping Your Funding Readiness */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{t('funding.whatsHelping', "What's Helping Your Funding Readiness")}</span>
          </div>
          <div className="space-y-2 text-xs">
            {strengths.length > 0 ? (
              strengths.map((str, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/10 flex items-start gap-2 text-slate-200">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span className="leading-relaxed">{str}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 p-3 italic">
                {language === 'ta' ? 'சாதகமான தரவுகள் கண்டறியப்படவில்லை.' : 'No major operational strengths recorded yet.'}
              </div>
            )}
          </div>
        </div>

        {/* What Is Holding You Back */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm border-b border-slate-800 pb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{t('funding.whatsHoldingBack', 'What Is Holding You Back')}</span>
          </div>
          <div className="space-y-2 text-xs">
            {gaps.length > 0 ? (
              gaps.map((gap, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/10 flex items-start gap-2 text-slate-200">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span className="leading-relaxed">{gap}</span>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ta' ? 'முக்கிய நிதி இடைவெளிகள் எதுவும் கண்டறியப்படவில்லை.' : 'No critical funding gaps detected. Profile meets baseline underwriting criteria.'}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. Action Plan: Gap Resolution */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              {t('funding.actionPlanTitle', 'Funding Gap Resolution Action Plan')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'ta' ? 'உங்கள் கடன் தகுதியை உயர்த்த முன்னுரிமை பரிந்துரைகள்' : 'Targeted operational actions to resolve identified underwriting gaps and boost loan eligibility'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {actionPlan.map((item, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5 hover:border-purple-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{item.issue}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                  item.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  item.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {item.priority} Priority
                </span>
              </div>

              <div className="space-y-1 text-slate-300 text-[11px] leading-relaxed">
                <div>
                  <strong className="text-slate-400">{t('funding.whyItMatters', 'Why It Matters')}: </strong>
                  {item.whyItMatters}
                </div>
                <div className="pt-1">
                  <strong className="text-purple-300">{t('funding.recommendedAction', 'Recommended Action')}: </strong>
                  {item.action}
                </div>
              </div>

              <div className="pt-1 text-[10px] text-emerald-400 font-semibold flex items-center gap-1 border-t border-slate-900">
                <TrendingUp className="w-3 h-3" />
                <span>Expected Impact: {item.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Funding Preparation Checklist (9 Items, Data-Grounded Statuses) */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-sky-400" />
              {t('funding.checklistTitle', 'Funding Preparation Checklist')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('funding.checklistSubtitle', 'Essential records and documentation needed when approaching institutional lenders')}
            </p>
          </div>
          <span className="text-[10px] text-slate-400 italic">
            {language === 'ta' ? 'வணிகத்தால் வழங்கப்பட்ட தகவல்கள் அடிப்படையில்' : 'Based on information provided by the business. BizPilot does not claim external verification.'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {preparationChecklist.map((chk) => (
            <div 
              key={chk.id}
              onClick={() => toggleChecklist(chk.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                completedChecklist.includes(chk.id)
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400 block">
                    {chk.category}
                  </span>
                  <span className={`font-semibold text-xs block mt-0.5 ${completedChecklist.includes(chk.id) ? 'line-through text-slate-400' : 'text-white'}`}>
                    {chk.title}
                  </span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                  chk.status === 'provided' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  chk.status === 'incomplete' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                  'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {chk.status === 'provided' ? t('funding.statusProvided', 'Information provided') :
                   chk.status === 'incomplete' ? t('funding.statusIncomplete', 'Information incomplete') :
                   t('funding.statusNotProvided', 'Not provided')}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                {chk.details}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Debt Capacity Assessment & Estimated Funding Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Debt Capacity Assessment */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-1 border-b border-slate-800 pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-400" />
                {t('funding.debtCapacityTitle', 'Debt Capacity Assessment')}
              </h3>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                debtAssessment?.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                debtAssessment?.status === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {debtAssessment?.status}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'ta' ? 'தற்போதுள்ள கடன்கள் மற்றும் மாதாந்திர தவணை சுமையின் மதிப்பாய்வு' : 'Comprehensive evaluation of debt serviceability and leverage headroom'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs py-1">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{t('funding.currentEmi', 'Current Monthly EMI')}</span>
              <strong className="text-white text-sm">
                {analysis?.normalized.hasLoans ? `₹${((debtAssessment?.currentEmi ?? 0) / 1000).toFixed(0)}k/mo` : '₹0 (Debt-Free)'}
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{t('funding.annualDebtService', 'Annual Debt Service')}</span>
              <strong className="text-white text-sm">
                {analysis?.normalized.hasLoans ? `₹${((debtAssessment?.annualDebtService ?? 0) / 100000).toFixed(1)}L` : '₹0'}
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{t('funding.dscr', 'Debt Service Coverage (DSCR)')}</span>
              <strong className="text-emerald-400 text-sm">
                {debtAssessment?.dscr ? `${debtAssessment.dscr}x` : t('executive.debtFree', 'Debt-Free')}
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{t('funding.debtToRevenue', 'Debt-to-Revenue Ratio')}</span>
              <strong className="text-slate-200 text-sm">
                {debtAssessment?.debtToRevenue ? `${(debtAssessment.debtToRevenue * 100).toFixed(1)}%` : '0%'}
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{t('funding.emiBurden', 'Monthly EMI Burden')}</span>
              <strong className="text-slate-200 text-sm">
                {debtAssessment?.emiBurdenPercent !== null && debtAssessment?.emiBurdenPercent !== undefined ? `${debtAssessment.emiBurdenPercent}%` : '0%'}
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{language === 'ta' ? 'வணிக வயது' : 'Business Vintage'}</span>
              <strong className="text-purple-300 text-sm">
                {analysis?.vintageYears ? `${analysis.vintageYears} ${t('common.years', 'Years')}` : 'Not enough information'}
              </strong>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed p-3 rounded-xl bg-slate-950 border border-slate-800">
            {debtAssessment?.assessmentNote}
          </p>
        </div>

        {/* Right 5 Cols: Estimated Funding Capacity & Disclaimers */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/40 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 block">
              {t('funding.fundingCapacityTitle', 'Estimated Funding Capacity')}
            </span>
            <div className="text-3xl font-black text-white">
              {creditLimit}
            </div>
            <p className="text-xs text-purple-200/90 leading-relaxed">
              {t('funding.fundingCapacityDisclaimer', 'Indicative estimate based on your current financial profile. Actual eligibility depends on lender policies, documentation, credit history, collateral/security requirements and other factors.')}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {language === 'ta' ? 'கடன் திட்டமிடல் குறிப்பு' : 'Planning Purpose Only'}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'ta'
                ? 'BizPilot AI வங்கி அல்லது கடன் தரகர் அல்ல. அனைத்து கடன் வரம்புகளும் உங்களின் விற்றுமுதல் மற்றும் நிதி விகிதங்களின் அடிப்படையில் கணக்கிடப்பட்ட மாதிரி வரம்புகள் ஆகும்.'
                : 'BizPilot AI is not a lender or financial intermediary. This capacity represents an indicative model based on 15–20% of annualized revenue minus existing debt.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={() => onNavigate('decision-lab')}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              {t('funding.testLoanImpact', 'Test Loan Impact')}
            </button>
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
            >
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              {t('funding.askAiAdvisor', 'Ask AI Advisor')}
            </button>
          </div>
        </div>

      </div>

      {/* 7. Professional Section: Strategic Funding Assessment (Gated) */}
      <FeatureGate
        feature="advancedFunding"
        isAllowed={isPro}
        onUpgrade={() => onNavigate('billing')}
        fallbackTitle={language === 'ta' ? 'தொழில்முறை கடன் மூலோபாயம் (Professional Plan)' : 'Professional Strategic Funding Assessment'}
        fallbackDescription={language === 'ta' 
          ? 'உங்கள் வணிகம் இப்போது கடன் பெற விண்ணப்பிக்கலாமா அல்லது நிதி சுயவிவரத்தை முதலில் மேம்படுத்த வேண்டுமா என்பதை அறிய தொழில்முறை திட்டத்திற்கு மாறவும்.' 
          : 'Unlock strategic timing guidance on whether to apply for funding now or improve operational margins first, with tailored AI gap resolutions.'}
      >
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/40 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {t('funding.fundingStrategyTitle', 'Strategic Funding Assessment')}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Professional Strategy
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('funding.fundingStrategySubtitle', 'Professional guidance on whether your business should consider funding now')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{t('funding.timingLabel', 'Funding Timing')}:</span>
              <span className={`text-xs font-black px-3 py-1 rounded-lg border ${
                fundingStrategy?.timing === 'Ready to Prepare'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : fundingStrategy?.timing === 'Improve First'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {fundingStrategy?.timing === 'Ready to Prepare' ? t('funding.timingReady', 'Ready to Prepare') :
                 fundingStrategy?.timing === 'Improve First' ? t('funding.timingImprove', 'Improve First') :
                 t('funding.timingAttention', 'Needs Attention')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                {language === 'ta' ? 'கடன் பரிந்துரை' : 'BizPilot Strategic Verdict'}
              </span>
              <div className="text-sm font-bold text-white">
                {fundingStrategy?.recommendation}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {fundingStrategy?.rationale}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                {t('funding.keyPrereq', 'Key Prerequisite')}
              </span>
              <div className="text-xs text-slate-200 leading-relaxed">
                {fundingStrategy?.keyPrerequisite}
              </div>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('decision-lab')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-all"
                >
                  {language === 'ta' ? 'முடிவு ஆய்வகத்தில் சோதிக்க' : 'Test Debt Impact in Decision Lab'}
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </FeatureGate>

      {/* 8. Funding Readiness Trend (No Fake Data) */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Clock className="w-4 h-4 text-purple-400" />
          <span>{t('funding.trendTitle', 'Funding Readiness History')}</span>
        </div>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          {t('funding.noHistory', 'Funding readiness history will appear as more financial snapshots are recorded.')}
        </p>
      </div>

      {/* 9. Indicative MSME Bank & NBFC Product Matches (Illustrative) */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-400" />
            {t('funding.productMatchesTitle', 'Indicative MSME Bank & NBFC Product Matches (Illustrative)')}
          </h3>
          <p className="text-xs text-slate-400">
            {language === 'ta' ? 'உங்கள் விற்றுமுதல் மற்றும் கடன் தகுதியின் அடிப்படையிலான மாதிரி திட்டங்கள்' : 'Illustrative MSME lending products matched with your active cash flow and compliance profile'}
          </p>
        </div>

        <div className="p-3 px-4 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200">
          <p className="text-[11px] leading-relaxed">
            <strong>Underwriting Disclaimer:</strong> Indicative lender products and criteria are displayed for informational and business planning purposes only. Funding is subject to formal lender underwriting, KYC verification, credit bureau scoring (CIBIL/CMR), and statutory approvals. BizPilot AI is not a lender or loan broker.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bankMatches.map((match, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{match.bank}</h4>
                  <div className="text-xs text-purple-300 font-semibold">{match.product}</div>
                </div>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {match.match}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">{t('funding.indicativeLimit', 'Indicative Limit')}</span>
                  <strong className="text-white">{match.maxLoan}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{t('funding.interestRate', 'Interest Rate')}</span>
                  <strong className="text-emerald-400">{match.rate}</strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">{match.reason}</p>

              <div className="flex items-center justify-between pt-1">
                {match.fastTrack ? (
                  <span className="text-[10px] text-purple-300 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {language === 'ta' ? 'டிஜிட்டல் கடன் ஆய்வு' : 'Digital Assessment'}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">
                    {language === 'ta' ? 'நிலையான கிளை அனுமதி' : 'Standard Branch Sanction'}
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('decision-lab')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 border border-slate-700 transition-all"
                  >
                    {language === 'ta' ? 'சோதிக்க' : 'Test Scenario'}
                  </button>
                  <button
                    onClick={onOpenPassport}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-all shadow"
                  >
                    {language === 'ta' ? 'பாஸ்போர்ட்டுடன் பார்க்க' : 'View with Passport'}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 10. "Why is my score X?" Explainability Modal */}
      {showExplainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  {language === 'ta' ? `எனது மதிப்பெண் ${fundingScore} ஆனது ஏன்?` : `Why is my score ${fundingScore}?`}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('funding.explainModalSubtitle', 'Transparent breakdown of factors and metrics contributing to your score')}
                </p>
              </div>
              <button
                onClick={() => setShowExplainModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {dimensions.map((dim, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{dim.factor}</span>
                      <span className="text-[10px] text-slate-400">({dim.weight}% max)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        dim.contribution === 'positive' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {dim.contribution === 'positive' ? '✓ Positive Contribution' : '⚠ Negative Contribution'}
                      </span>
                      <span className="font-bold text-white text-xs">{dim.rawScore} / {dim.weight} pts</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {dim.explanation}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 italic">
                {language === 'ta' ? 'உண்மையான நிறுவனத் தரவுகளிலிருந்து கணக்கிடப்பட்டது.' : 'Evaluated strictly from your actual organizational financial profile.'}
              </span>
              <button
                onClick={() => setShowExplainModal(false)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all"
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
