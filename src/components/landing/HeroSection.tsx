import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  TrendingUp, 
  HeartPulse, 
  Award, 
  Zap, 
  CheckCircle2, 
  Bot,
  Play
} from 'lucide-react';
import { ScoreGauge } from '../common/ScoreGauge';
import { useLanguage } from '../../i18n/LanguageContext';

interface HeroSectionProps {
  onLaunchDemo: () => void;
  onOpenCreditPassport: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onLaunchDemo,
  onOpenCreditPassport
}) => {
  const { t } = useLanguage();

  return (
    <section className="relative pt-8 pb-20 overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-purple-600/20 via-indigo-500/15 to-sky-400/20 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-purple-600/10 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top announcement pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 backdrop-blur-md shadow-lg shadow-purple-900/10 text-xs text-purple-200">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="font-semibold text-white">BizPilot AI 2.0</span>
            <span className="text-purple-400">•</span>
            <span>{t('landing.badge', 'Empowering India\'s 63M+ MSMEs for Institutional Funding')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
          </div>
        </div>

        {/* Hero Headline & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
            {t('landing.heroTitlePrefix', 'Your AI Business Copilot for')}{' '}
            <span className="text-gradient-purple">{t('landing.heroFundingGrowth', 'Funding, Growth')}</span> &{' '}
            <span className="text-gradient-cyan">{t('landing.heroIntelligence', 'Financial Intelligence')}</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            {t('landing.heroSubtitle', 'Helping MSMEs become funding-ready through AI-powered financial analysis, cash-flow forecasting, and growth intelligence.')}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onLaunchDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white font-bold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 group transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-purple-200 group-hover:rotate-12 transition-transform" />
              {t('landing.launchDemo', 'Try Demo Platform')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenCreditPassport}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:border-purple-500/50"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              {t('landing.explorePassport', 'View Investor Report & Passport')}
            </button>
          </div>

          {/* Social Proof Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>GSTR &amp; Bank Statement AI Parser</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>PSB59 &amp; CGTMSE Ready</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero Jargon • Explainable AI</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Illustration / Glassmorphism Mockup */}
        <div className="mt-14 relative max-w-5xl mx-auto">
          {/* Outer glow frame */}
          <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-b from-purple-500/30 via-slate-800/60 to-slate-900 border border-purple-500/30 shadow-2xl shadow-purple-950/60 backdrop-blur-2xl">
            
            {/* Top header bar */}
            <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800/80 shadow-sm">
              
              {/* Window Controls & Live Status */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="text-xs font-mono text-slate-400 ml-2">bizpilot.ai/live-intelligence</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-emerald-400 font-semibold">Live Enterprise Engine</span>
                </div>
              </div>

              {/* Grid of Interactive Preview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
                
                {/* Score Gauges Block */}
                <div className="md:col-span-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800/90 flex flex-col justify-between space-y-4">
                  <div className="text-left">
                    <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5" /> MSME Health Index
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">Shree Ganesh Agro Foods</h4>
                  </div>
                  
                  <div className="flex items-center justify-center py-2">
                    <ScoreGauge 
                      score={82} 
                      size={140} 
                      strokeWidth={10} 
                      label="Health" 
                      sublabel="Top 12% MSMEs" 
                      colorScheme="purple"
                    />
                  </div>

                  <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/20 text-left">
                    <div className="text-[10px] font-bold text-purple-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI Copilot Diagnosis
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-tight">
                      Healthy +12.4% revenue growth, optimal DSCR 1.84x.
                    </p>
                  </div>
                </div>

                {/* Center KPI & Funding Gauge */}
                <div className="md:col-span-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800/90 flex flex-col justify-between space-y-4">
                  <div className="text-left">
                    <div className="text-[10px] font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Flagship Readiness
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">Lender Underwriting Score</h4>
                  </div>

                  <div className="flex items-center justify-center py-2">
                    <ScoreGauge 
                      score={74} 
                      size={140} 
                      strokeWidth={10} 
                      label="Funding" 
                      sublabel="Eligible ₹85L" 
                      colorScheme="blue"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-slate-800/80 border border-slate-700/50 shadow-sm">
                      <div className="text-[10px] text-slate-400">Cash Runway</div>
                      <div className="font-bold text-emerald-400">7.2 Mos</div>
                    </div>
                    <div className="p-2 rounded bg-slate-800/80 border border-slate-700/50 shadow-sm">
                      <div className="text-[10px] text-slate-400">Eligibility</div>
                      <div className="font-bold text-purple-400">High Tier</div>
                    </div>
                  </div>
                </div>

                {/* Right Analytics & AI Stream */}
                <div className="md:col-span-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800/90 flex flex-col justify-between space-y-3 text-left">
                  <div>
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Cash Runway Forecast
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl font-black text-white">+12.4%</span>
                      <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Stability: 89%
                      </span>
                    </div>
                  </div>

                  {/* Visual simulated sparkline bars */}
                  <div className="space-y-1.5 py-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Historical 12M</span>
                      <span>Next 90 Days AI Projected</span>
                    </div>
                    <div className="h-12 flex items-end gap-1 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
                      {[35, 42, 50, 48, 62, 70, 75, 82, 88, 92, 98, 105].map((val, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 rounded-t transition-all ${
                            i >= 8 ? 'bg-gradient-to-t from-sky-500 to-cyan-300' : 'bg-purple-600/70'
                          }`}
                          style={{ height: `${(val / 105) * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* AI Quick chat preview */}
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2 shadow-sm">
                    <Bot className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-slate-300 leading-snug">
                      <strong className="text-purple-300 font-semibold">BizPilot AI:</strong> "Reduce DPD on supplier invoices to raise funding score to 82."
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>

          {/* Floating interactive badge */}
          <div className="hidden lg:flex absolute -bottom-5 -left-6 items-center gap-3 p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40 backdrop-blur-xl shadow-xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-left text-xs">
              <div className="font-bold text-white">PSB59 &amp; CGTMSE Match</div>
              <div className="text-emerald-400 text-[10px]">Pre-Qualified for ₹85L Scheme</div>
            </div>
          </div>

          <div className="hidden lg:flex absolute -top-4 -right-6 items-center gap-3 p-3 rounded-xl bg-slate-900/90 border border-purple-500/40 backdrop-blur-xl shadow-xl">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-left text-xs">
              <div className="font-bold text-white">What-If Simulator</div>
              <div className="text-purple-300 text-[10px]">+10% Pricing = +₹4.2L Profit</div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
