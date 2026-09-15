import React from 'react';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { FeatureKey } from '../../config/plans';
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
    <div className="rounded-2xl bg-gradient-to-b from-purple-950/30 via-slate-900 to-slate-900 border border-purple-500/30 p-8 text-center max-w-xl mx-auto my-8 space-y-5 shadow-2xl">
      <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 mx-auto shadow-lg shadow-purple-950/40">
        <Lock className="w-6 h-6 text-purple-400" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3" />
          <span>Professional Exclusive</span>
        </div>
        <h3 className="text-xl font-bold text-white">
          {fallbackTitle || t('subscription.upgradeRequiredTitle', 'Available in Professional Plan')}
        </h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
          >
            <span>{t('subscription.upgradeToPro', 'Upgrade to Professional (₹999)')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
