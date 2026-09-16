import React, { useEffect } from 'react';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Organization } from '../../types/onboarding';
import { useLanguage } from '../../i18n/LanguageContext';

interface OnboardingSuccessProps {
  organization: Organization;
  onGoToDashboard: () => void;
}

export const OnboardingSuccess: React.FC<OnboardingSuccessProps> = ({ organization, onGoToDashboard }) => {
  const { t } = useLanguage();

  useEffect(() => {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6C63FF', '#8B5CF6', '#38BDF8'],
    });
  }, []);

  return (
    <div className="flex flex-col items-center text-center py-10 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shadow-sm">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-black text-[#F8FAFC]">
          {t('onboarding.successTitle', 'Your business profile is ready.')}
        </h2>
        <p className="text-sm text-[#A7B0C0] leading-relaxed">
          {t('onboarding.successSubtitle', 'BizPilot now has the information needed to analyze')}{' '}
          <span className="text-violet-400 font-semibold">{organization.name}</span>.
        </p>
      </div>

      <div className="w-full max-w-sm p-4 rounded-xl bg-[#0F1219] border border-[#222936] flex items-center gap-3 text-left">
        <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
        <p className="text-[11px] text-[#A7B0C0]">
          Your business profile is saved. Please select a plan (Starter ₹1 or Professional ₹2 in Test Mode) to activate your 30-day workspace.
        </p>
      </div>

      <button
        onClick={onGoToDashboard}
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-600/20 flex items-center gap-2 transition-all hover:scale-105"
      >
        {t('onboarding.choosePlanAndActivate', 'Choose Plan & Activate Account')}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};