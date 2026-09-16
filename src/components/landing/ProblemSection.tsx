import React from 'react';
import { 
  EyeOff, 
  TrendingDown, 
  UserX, 
  XCircle, 
  Landmark, 
  AlertOctagon, 
  ArrowDownRight
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const ProblemSection: React.FC = () => {
  const { t } = useLanguage();

  const problems = [
    {
      icon: EyeOff,
      title: 'No Financial Visibility',
      desc: 'Most MSME founders maintain raw books in spreadsheets or Tally without understanding real-time unit economics, debtor days, or cash burn rates.',
      stat: '78%',
      statLabel: 'lack real-time cash visibility'
    },
    {
      icon: TrendingDown,
      title: 'Poor Cash Flow Planning',
      desc: 'Unforeseen seasonal inventory spikes and delayed receivables create sudden liquidity crunches, forcing distress borrowing.',
      stat: '64%',
      statLabel: 'face sudden working capital deficits'
    },
    {
      icon: UserX,
      title: 'Lack of Business Consultants',
      desc: 'High CA and CFO advisory fees ($2,000+/mo) keep strategic financial planning inaccessible to micro and small businesses.',
      stat: '91%',
      statLabel: 'cannot afford dedicated CFO advisory'
    },
    {
      icon: XCircle,
      title: 'Frequent Loan Rejections',
      desc: 'Banks reject MSME loan files due to non-standardized documentation, low DSCR visibility, or lack of structured collateral narratives.',
      stat: '85%',
      statLabel: 'first-time loan applications rejected'
    },
    {
      icon: Landmark,
      title: 'Dependence on Informal Lenders',
      desc: 'Desperate for working capital, MSMEs turn to informal moneylenders charging predatory interest rates of 24% to 36% per annum.',
      stat: '₹28L Cr',
      statLabel: 'trapped in high-cost informal credit'
    }
  ];

  return (
    <section className="py-20 relative bg-[#0F1219] border-y border-[#222936]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-800/40 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <AlertOctagon className="w-3.5 h-3.5" /> The $530 Billion MSME Credit Chasm
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#F8FAFC] tracking-tight">
            {t('landing.problemTitle', 'The MSME Credit Paradox in India')}
          </h2>
          <p className="text-[#A7B0C0] text-sm sm:text-base leading-relaxed">
            {t('landing.problemSubtitle', 'Indian MSMEs generate 30% of GDP yet 85% struggle to secure timely bank credit due to fragmented books, invoice lag, and informal documentation.')}
          </p>
        </div>

        {/* Big Counter Banner */}
        <div className="mb-14 p-8 rounded-2xl bg-[#121722] border border-[#222936] text-center relative overflow-hidden shadow-lg">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-around gap-6">
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black text-violet-400">
                63 Million+
              </div>
              <div className="text-sm font-semibold text-[#F8FAFC]">MSMEs Operating in India</div>
              <p className="text-xs text-[#707A8C] max-w-xs">Contributing ~30% to India's GDP and 45% to total exports</p>
            </div>

            <div className="h-12 w-px bg-[#222936] hidden md:block"></div>

            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black text-rose-400">
                &lt; 15%
              </div>
              <div className="text-sm font-semibold text-[#F8FAFC]">Access to Formal Bank Credit</div>
              <p className="text-xs text-[#707A8C] max-w-xs">Over 85% remain underbanked or rely on expensive non-institutional loans</p>
            </div>

            <div className="h-12 w-px bg-[#222936] hidden md:block"></div>

            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black text-amber-400">
                42 Days
              </div>
              <div className="text-sm font-semibold text-[#F8FAFC]">Average Loan Processing Delay</div>
              <p className="text-xs text-[#707A8C] max-w-xs">Manual paperwork, multiple branch visits, and opaque criteria</p>
            </div>
          </div>
        </div>

        {/* 5 Problem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-[#121722] border border-[#222936] hover:border-[#303848] transition-all hover:translate-y-[-2px] group space-y-4 flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#F8FAFC] group-hover:text-violet-400 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#A7B0C0] leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#222936] flex items-baseline justify-between">
                  <span className="text-xl font-extrabold text-rose-400">{p.stat}</span>
                  <span className="text-[11px] text-[#707A8C] font-medium">{p.statLabel}</span>
                </div>
              </div>
            );
          })}

          {/* Callout box */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161C27] to-[#121722] border border-violet-500/30 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="space-y-2">
              <div className="text-xs font-bold text-violet-400 uppercase tracking-wider">The Solution</div>
              <h3 className="text-lg font-extrabold text-[#F8FAFC]">BizPilot AI changes this paradigm.</h3>
              <p className="text-xs text-[#A7B0C0] leading-relaxed">
                By synthesizing GSTIN filings, bank statements, and operational telemetry into an explainable Funding Readiness Index &amp; Credit Passport.
              </p>
            </div>
            <div className="text-xs font-semibold text-violet-400 flex items-center gap-1">
              <span>Turning opaque numbers into banker-ready insights</span>
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
