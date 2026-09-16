import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface FinalCTAProps {
  onStartTrial: () => void;
  onRequestDemo: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({
  onStartTrial,
  onRequestDemo
}) => {
  const { t } = useLanguage();

  return (
    <section className="py-12 sm:py-20 lg:py-24 relative overflow-hidden bg-[#090B10] border-t border-[#222936] min-w-0">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-600/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10 text-center min-w-0">
        
        <div className="p-5 sm:p-10 lg:p-14 rounded-3xl bg-[#0F1219] border border-[#222936] shadow-2xl space-y-5 sm:space-y-6 min-w-0">
          
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[#121722] border border-[#222936] text-violet-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span>Accelerate Your MSME Growth Today</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#F8FAFC] tracking-tight leading-tight">
            {t('landing.finalCtaTitle', 'Ready to Transform Your Business Finances?')}
          </h2>

          <p className="text-xs sm:text-base lg:text-lg text-[#A7B0C0] max-w-2xl mx-auto leading-relaxed font-normal">
            {t('landing.finalCtaSubtitle', 'Join progressive Indian MSMEs utilizing BizPilot AI to secure credit, predict cash flow, and accelerate growth.')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 w-full sm:w-auto">
            <button
              onClick={onStartTrial}
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>{t('landing.startFreeTrial', 'Start Free Trial')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onRequestDemo}
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl bg-[#121722] hover:bg-[#171D29] text-[#F8FAFC] border border-[#222936] hover:border-[#303848] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>{t('landing.requestConsultation', 'Request Custom Demo')}</span>
            </button>
          </div>

          <div className="pt-4 sm:pt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-[#707A8C] border-t border-[#222936] mt-4 sm:mt-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" /> Instant GSTN Link
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Export Bankable Passport in 60s
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};
