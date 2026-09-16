import React from 'react';
import { Check, Minus, Sparkles, Zap } from 'lucide-react';
import { PLAN_CONFIGS, PlanId } from '../../config/plans';
import { useLanguage } from '../../i18n/LanguageContext';

interface PlanComparisonProps {
  currentPlanId?: PlanId | null;
  onSelectPlan: (planId: PlanId) => void;
  loading?: boolean;
}

export const PlanComparison: React.FC<PlanComparisonProps> = ({
  currentPlanId,
  onSelectPlan,
  loading = false,
}) => {
  const { t } = useLanguage();
  const starter = PLAN_CONFIGS.starter;
  const professional = PLAN_CONFIGS.professional;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121722] border border-[#222936] text-violet-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('subscription.pricingTitleBadge', 'Simple, Transparent Pricing')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
          {t('subscription.choosePlanTitle', 'Choose the Right Intelligence for Your MSME')}
        </h2>
        <p className="text-xs sm:text-sm text-[#A7B0C0]">
          {t('subscription.choosePlanSubtitle', 'One-time 30 days access. No auto-renewal, zero lock-in, institutional bank-recognized analysis.')}
        </p>
      </div>

      {/* 2-Column Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        
        {/* Starter Plan */}
        <div className="relative rounded-2xl bg-[#121722] border border-[#222936] p-6 sm:p-8 flex flex-col justify-between hover:border-[#303848] transition-all shadow-sm">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#707A8C]">
                {starter.tagline}
              </span>
              {currentPlanId === 'starter' && (
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#0F1219] text-violet-400 border border-[#222936]">
                  {t('subscription.currentPlan', 'Current Plan')}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#F8FAFC]">{starter.name}</h3>
              <p className="text-xs text-[#A7B0C0] mt-1">{starter.positioning}</p>
            </div>

            <div className="flex items-baseline gap-1.5 pt-2 border-t border-[#222936]">
              <span className="text-3xl sm:text-4xl font-black text-[#F8FAFC]">₹{starter.priceINR}</span>
              <span className="text-xs text-[#707A8C] font-medium">/ 30 {t('common.days', 'days')}</span>
            </div>

            <div className="space-y-2.5 pt-4">
              <div className="text-[11px] font-bold text-[#A7B0C0] uppercase tracking-wider">
                {t('subscription.includedFeatures', 'Included in Starter:')}
              </div>
              {starter.features.map((feat) => (
                <div key={feat.key} className="flex items-start gap-2.5 text-xs">
                  {feat.included ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-950/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-800/40">
                      <Check className="w-3 h-3" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-[#0F1219] text-[#707A8C] flex items-center justify-center shrink-0 mt-0.5 border border-[#222936]">
                      <Minus className="w-3 h-3" />
                    </div>
                  )}
                  <span className={feat.included ? 'text-[#A7B0C0]' : 'text-[#707A8C] line-through'}>
                    {feat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#222936]">
            <button
              onClick={() => onSelectPlan('starter')}
              disabled={loading || currentPlanId === 'starter'}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-[#161C27] hover:bg-[#1C2433] text-[#F8FAFC] border border-[#222936] hover:border-[#303848] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentPlanId === 'starter'
                ? t('subscription.activeOnStarter', 'Active Plan')
                : `Get Starter (₹${starter.priceINR})`}
            </button>
          </div>
        </div>

        {/* Professional Plan */}
        <div className="relative rounded-2xl bg-[#161C27] border-2 border-violet-500 p-6 sm:p-8 flex flex-col justify-between shadow-2xl shadow-violet-500/10">
          <div className="absolute -top-3 right-6">
            <span className="px-3 py-1 rounded-full bg-violet-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
              {t('subscription.recommended', 'MOST POPULAR')}
            </span>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
                {professional.tagline}
              </span>
              {currentPlanId === 'professional' && (
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-violet-950/40 text-violet-400 border border-violet-800/40">
                  {t('subscription.currentPlan', 'Current Plan')}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
                {professional.name}
                <Zap className="w-4 h-4 text-violet-400 fill-violet-400" />
              </h3>
              <p className="text-xs text-[#A7B0C0] mt-1">{professional.positioning}</p>
            </div>

            <div className="flex items-baseline gap-1.5 pt-2 border-t border-[#222936]">
              <span className="text-3xl sm:text-4xl font-black text-[#F8FAFC]">₹{professional.priceINR}</span>
              <span className="text-xs text-[#707A8C] font-medium">/ 30 {t('common.days', 'days')}</span>
            </div>

            <div className="space-y-2.5 pt-4">
              <div className="text-[11px] font-bold text-violet-400 uppercase tracking-wider">
                {t('subscription.everythingInStarterPlus', 'Everything in Starter, plus:')}
              </div>
              {professional.features.map((feat) => (
                <div key={feat.key} className="flex items-start gap-2.5 text-xs">
                  <div className="w-4 h-4 rounded-full bg-violet-950/60 text-violet-400 flex items-center justify-center shrink-0 mt-0.5 border border-violet-800/40">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-[#A7B0C0] font-medium">
                    {feat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#222936]">
            <button
              onClick={() => onSelectPlan('professional')}
              disabled={loading || currentPlanId === 'professional'}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentPlanId === 'professional'
                ? t('subscription.activeOnPro', "You're on the Professional plan")
                : currentPlanId === 'starter'
                ? `Upgrade to Professional (₹${professional.priceINR})`
                : `Get Professional (₹${professional.priceINR})`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
