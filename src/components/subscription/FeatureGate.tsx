import React from 'react';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { FeatureKey, PLAN_CONFIGS } from '../../config/plans';
import { useLanguage } from '../../i18n/LanguageContext';

interface FeatureGateProps {
  feature: FeatureKey;
  isAllowed: boolean;
  onUpgrade?: () => void;
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  isAllowed,
  onUpgrade,
  children,
  fallbackTitle,
  fallbackDescription,
}) => {
  const { t } = useLanguage();

  if (isAllowed) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-2xl bg-[#121722] border border-[#222936] p-8 text-center max-w-xl mx-auto my-8 space-y-5 shadow-xl">
      <div className="w-14 h-14 rounded-2xl bg-violet-950/40 border border-violet-800/40 flex items-center justify-center text-violet-400 mx-auto shadow-sm">
        <Lock className="w-6 h-6 text-violet-400" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0F1219] border border-[#222936] text-violet-400 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3" />
          <span>Professional Exclusive</span>
        </div>
        <h3 className="text-xl font-bold text-[#F8FAFC]">
          {fallbackTitle || t('subscription.upgradeRequiredTitle', 'Available in Professional Plan')}
        </h3>
        <p className="text-xs text-[#A7B0C0] max-w-md mx-auto">
          {fallbackDescription ||
            t(
              'subscription.upgradeRequiredDesc',
              'Upgrade to Professional to unlock strategic scenario testing, AI Decision Lab, and board-grade reporting.'
            )}
        </p>
      </div>

      {onUpgrade && (
        <div className="pt-2">
          <button
            onClick={onUpgrade}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-600/25 transition-all"
          >
            <span>{t('subscription.upgradeToPro', `Upgrade to Professional (₹${PLAN_CONFIGS.professional.priceINR})`)}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
