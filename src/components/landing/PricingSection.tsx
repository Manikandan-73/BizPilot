import React from 'react';
import { Check, Sparkles, Zap, Building2, ShieldCheck, ArrowRight } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const plans = [
    {
      name: 'Starter Free',
      price: '₹0',
      period: 'Forever Free',
      description: 'Ideal for early micro-enterprises looking to check their baseline financial health.',
      features: [
        'Single Company Profile',
        'Basic Financial Health Score (82/100)',
        '30-Day Cash Flow Projection',
        'Basic Funding Readiness Score',
        'Community AI Assistant (English/Hindi)',
        'Standard Email Support'
      ],
      cta: 'Get Started Free',
      highlighted: false,
      badge: 'Free Tier'
    },
    {
      name: 'Pro Growth',
      price: '₹499',
      period: 'per month',
      description: 'Perfect for fast-growing small retailers, traders, and D2C brands expanding turnover.',
      features: [
        'Automated GSTN & Bank Data Sync',
        '90-Day Predictive Cash Flow & Alert Engine',
        'Detailed Funding Readiness 5-Pillar Breakdown',
        'Downloadable MSME Credit Passport (PDF)',
        'Interactive What-If Business Decision Simulator',
        'Multilingual AI Assistant (5 Languages)',
        'WhatsApp Alert Summaries'
      ],
      cta: 'Start 14-Day Free Trial',
      highlighted: true,
      badge: 'Most Popular for MSMEs'
    },
    {
      name: 'Business Leader',
      price: '₹1,999',
      period: 'per month',
      description: 'For established manufacturing, engineering & agro-processing firms targeting institutional debt.',
      features: [
        'Everything in Pro Plan',
        'Direct PSB59 & CGTMSE Loan Matchmaking',
        'TReDS Bill Discounting Integration',
        'Full 12-Month Financial Stress Testing',
        'Growth Intelligence & Pricing Playbooks',
        'Dedicated CA / Credit Officer Support',
        'Audit-Ready Bank Dossier Exporter'
      ],
      cta: 'Unlock Business Plan',
      highlighted: false,
      badge: 'Best for Manufacturers'
    },
    {
      name: 'Enterprise / CA Firm',
      price: 'Custom',
      period: 'Billed Annually',
      description: 'For Chartered Accountants, Incubators, NBFCs, and MSME clusters managing multiple entities.',
      features: [
        'Multi-Entity Portfolio Dashboard (50+ MSMEs)',
        'Automated Batch Credit Assessment API',
        'Custom Risk Scoring & Underwriting Models',
        'White-label Credit Passport for Clients',
        'Dedicated Solutions Architect',
        '99.9% Uptime SLA & Custom ERP Connectors'
      ],
      cta: 'Contact Enterprise Sales',
      highlighted: false,
      badge: 'For CAs & Lenders'
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> Transparent & Accessible Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Flexible Plans for Every MSME Stage
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Tailored for Indian Micro, Small, and Medium Enterprises, Startups, and Manufacturers. No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* 4 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                p.highlighted
                  ? 'bg-gradient-to-b from-purple-950/80 via-slate-900 to-slate-900 border-2 border-purple-500 shadow-2xl shadow-purple-900/40 scale-105 z-10'
                  : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {p.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-sky-400 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                  {p.badge}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{p.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[36px]">{p.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{p.price}</span>
                    <span className="text-xs text-slate-400 font-medium">/{p.period}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-slate-800 text-xs">
                  {p.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800">
                <button
                  onClick={onSelectPlan}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    p.highlighted
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {p.cta}
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
