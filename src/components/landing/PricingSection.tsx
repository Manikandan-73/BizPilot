import React from 'react';
import { Check, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { PLAN_CONFIGS } from '../../config/plans';

interface PricingSectionProps {
  onSelectPlan: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const { t } = useLanguage();
  const starter = PLAN_CONFIGS.starter;
  const professional = PLAN_CONFIGS.professional;

  const plans = [
    {
      id: starter.id,
      name: starter.name,
      price: `₹${starter.priceINR}`,
      period: '30 days',
      description: starter.positioning,
      badge: starter.tagline,
      features: starter.features
        .filter((f) => f.included)
        .slice(0, 6)
        .map((f) => f.label),
      cta: `Get Started (₹${starter.priceINR})`,
      highlighted: false,
    },
    {
      id: professional.id,
      name: professional.name,
      price: `₹${professional.priceINR}`,
      period: '30 days',
      description: professional.positioning,
      badge: 'Most Popular for MSMEs',
      features: [
        'All Starter Features Included',
        'Advanced AI Business Advisor',
        'Advanced Decision Lab & Stress Testing',
        'Advanced Growth Intelligence',
        'Detailed Board & Lender Business Report',
        'Export & Share Reports (PDF / Print)',
      ],
      cta: `Get Professional (₹${professional.priceINR})`,
      highlighted: true,
    },
  ];

  return (
    <section className="py-12 sm:py-20 lg:py-24 relative bg-[#090B10] border-y border-[#222936] overflow-hidden min-w-0">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10 min-w-0">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121722] border border-[#222936] text-violet-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Simple, Transparent Pricing
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#F8FAFC] tracking-tight">
            {t('landing.pricingTitle', 'Flexible Plans for Every MSME Stage')}
          </h2>
          <p className="text-[#A7B0C0] text-xs sm:text-base leading-relaxed">
            {t('landing.pricingSubtitle', 'Tailored for Indian Micro, Small, and Medium Enterprises, Startups, and Manufacturers. No hidden fees. Cancel anytime.')}
          </p>
        </div>

        {/* Exactly 2 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto min-w-0">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl p-4 sm:p-8 flex flex-col justify-between transition-all relative min-w-0 ${
                p.highlighted
                  ? 'bg-[#161C27] border-2 border-violet-500 shadow-2xl shadow-violet-500/10 hover:-translate-y-0.5 z-10'
                  : 'bg-[#121722] border border-[#222936] shadow-sm hover:border-[#303848] hover:-translate-y-0.5'
              }`}
            >
              {p.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-violet-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm whitespace-nowrap">
                  {p.badge}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
                    {p.name}
                    {p.highlighted && <Zap className="w-4 h-4 text-violet-400 fill-violet-400" />}
                  </h3>
                  {!p.highlighted && (
                    <span className="text-[10px] uppercase font-bold text-[#707A8C] tracking-wider">
                      {p.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#A7B0C0] min-h-[36px]">{p.description}</p>

                <div className="pt-2 border-t border-[#222936]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-[#F8FAFC]">{p.price}</span>
                    <span className="text-xs text-[#707A8C] font-medium">/{p.period}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-[#222936] text-xs">
                  {p.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-[#A7B0C0]">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        p.highlighted 
                          ? 'bg-violet-950/60 text-violet-400 border border-violet-800/40' 
                          : 'bg-[#0F1219] text-violet-400 border border-[#222936]'
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-[#222936]">
                <button
                  onClick={onSelectPlan}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    p.highlighted
                      ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40'
                      : 'bg-[#161C27] hover:bg-[#1C2433] text-[#F8FAFC] border border-[#222936] hover:border-[#303848] shadow-sm'
                  }`}
                >
                  <span>{p.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
