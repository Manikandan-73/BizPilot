import React, { useEffect } from 'react';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Organization } from '../../types/onboarding';

interface OnboardingSuccessProps {
  organization: Organization;
  onGoToDashboard: () => void;
}

export const OnboardingSuccess: React.FC<OnboardingSuccessProps> = ({ organization, onGoToDashboard }) => {
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
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-xl shadow-purple-600/30">
        <CheckCircle2 className="w-9 h-9 text-white" />
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-black text-white">Your business profile is ready.</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          BizPilot now has the information needed to analyze <span className="text-purple-300 font-semibold">{organization.name}</span>.
        </p>
      </div>

      <div className="w-full max-w-sm p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3 text-left">
        <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
        <p className="text-[11px] text-slate-400">
          Your profile is saved on this device. The dashboard below continues to use BizPilot's demo
          analysis data while live scoring for your business is being built.
        </p>
      </div>

      <button
        onClick={onGoToDashboard}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white font-bold text-sm shadow-xl shadow-purple-600/30 flex items-center gap-2 transition-all hover:scale-105"
      >
        Go to Dashboard
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};