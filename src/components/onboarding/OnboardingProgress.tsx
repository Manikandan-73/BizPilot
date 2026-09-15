import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useLanguage } from '../../i18n/LanguageContext';

interface OnboardingProgressProps {
  currentStep: 1 | 2 | 3 | 4;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ currentStep }) => {
  const { t } = useLanguage();

  const stepLabels = [
    t('onboarding.step1', 'Business'),
    t('onboarding.step2', 'Financials'),
    t('onboarding.step3', 'Debt & Compliance'),
    t('onboarding.step4', 'Goals'),
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-purple-300 uppercase tracking-widest">
            {t('onboarding.title', 'Business Setup')}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">
            {t('common.step', 'Step')} {currentStep} / 4
          </h1>
        </div>
        <span className="hidden sm:block text-xs text-slate-400 font-medium">
          {stepLabels.join(' → ')}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {stepLabels.map((label, idx) => {
          const stepNumber = idx + 1;
          const isComplete = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all',
                    isComplete && 'bg-purple-600 border-purple-500 text-white',
                    isActive && !isComplete && 'bg-purple-950/60 border-purple-500 text-purple-200 ring-2 ring-purple-500/30',
                    !isActive && !isComplete && 'bg-slate-900 border-slate-700 text-slate-500'
                  )}
                >
                  {isComplete ? <Check className="w-3.5 h-3.5" /> : stepNumber}
                </div>
                <span
                  className={cn(
                    'text-[11px] font-semibold hidden md:inline',
                    isActive ? 'text-white' : isComplete ? 'text-purple-300' : 'text-slate-500'
                  )}
                >
                  {label}
                </span>
              </div>
              {stepNumber !== stepLabels.length && (
                <div
                  className={cn(
                    'flex-1 h-0.5 rounded-full transition-all',
                    isComplete ? 'bg-purple-600' : 'bg-slate-800'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};