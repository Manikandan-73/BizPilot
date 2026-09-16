import React, { useState } from 'react';
import { 
  Sparkles, 
  HeartPulse, 
  TrendingUp, 
  Award, 
  Boxes, 
  Compass, 
  Lightbulb,
  Zap, 
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const SolutionNetwork: React.FC = () => {
  const { t } = useLanguage();
  const [activeNode, setActiveNode] = useState<number>(0);

  const nodes = [
    {
      id: 0,
      title: 'Financial Health',
      icon: HeartPulse,
      color: 'from-pink-500 to-rose-500',
      badgeColor: 'border-pink-500/40 text-pink-300 bg-pink-950/30',
      desc: 'Real-time liquidity, profitability, DSCR, and operational efficiency analysis with instant health grading.',
      metric: '82/100 Index'
    },
    {
      id: 1,
      title: 'Cash Flow Forecasting',
      icon: TrendingUp,
      color: 'from-sky-400 to-blue-600',
      badgeColor: 'border-sky-500/40 text-sky-300 bg-sky-950/30',
      desc: 'Prophet & XGBoost machine learning models forecasting 30 to 90-day cash positions and proactive shortfall alerts.',
      metric: '90-Day Runway'
    },
    {
      id: 2,
      title: 'Funding Readiness',
      icon: Award,
      color: 'from-purple-500 to-indigo-600',
      badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-950/30',
      desc: 'Bankability audit evaluating 5 critical underwriting pillars to unlock low-interest public & private sector loans.',
      metric: '74/100 Tier-A'
    },
    {
      id: 3,
      title: 'Growth Intelligence',
      icon: Compass,
      color: 'from-emerald-400 to-teal-600',
      badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/30',
      desc: 'Strategic recommendations for margin expansion, GeM tender empanelment, and working capital optimization.',
      metric: '+₹14.2L Cash'
    },
    {
      id: 4,
      title: 'Inventory Planning',
      icon: Boxes,
      color: 'from-amber-400 to-orange-500',
      badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-950/30',
      desc: 'Dynamic safety stock calibration, dead inventory reduction, and JIT vendor replenishment schedules.',
      metric: '-22% Holding Cost'
    },
    {
      id: 5,
      title: 'Business Recommendations',
      icon: Lightbulb,
      color: 'from-cyan-400 to-indigo-500',
      badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/30',
      desc: 'Conversational explainable guidance in Indian languages for MSME business leaders and entrepreneurs.',
      metric: 'Multilingual'
    }
  ];

  return (
    <section className="py-20 relative bg-[#090B10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121722] border border-[#222936] text-violet-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Autonomous MSME Financial Engine
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#F8FAFC] tracking-tight">
            {t('landing.solutionTitle', 'The BizPilot Financial Network')}
          </h2>
          <p className="text-[#A7B0C0] text-sm sm:text-base leading-relaxed">
            {t('landing.solutionSubtitle', 'A synchronized platform connecting transaction data to institutional underwriting protocols.')}
          </p>
        </div>

        {/* Interactive Network Visualization Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center min-w-0">
          
          {/* Left / Central AI Engine Hub Visual */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#0F1219] border border-[#222936] shadow-xl min-w-0 overflow-hidden">
            
            {/* Concentric Rings */}
            <div className="absolute w-72 h-72 rounded-full border border-violet-500/10 animate-ping opacity-40 pointer-events-none" />
            <div className="absolute w-96 h-96 rounded-full border border-violet-500/5 pointer-events-none" />

            {/* Central Core */}
            <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-teal-400 p-1 shadow-lg shadow-violet-500/20 flex flex-col items-center justify-center text-center shrink-0">
              <div className="w-full h-full bg-[#0B0E14] rounded-[22px] flex flex-col items-center justify-center p-2">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-violet-400" />
                <span className="text-xs font-black text-[#F8FAFC] mt-1">BizPilot Core</span>
                <span className="text-[9px] text-teal-400 uppercase tracking-widest font-semibold">AI Neural Bus</span>
              </div>
            </div>

            {/* Satellite Node Pills in Circle / Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full mt-6 sm:mt-8 min-w-0">
              {nodes.map((n) => {
                const Icon = n.icon;
                const isSelected = activeNode === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => setActiveNode(n.id)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all relative overflow-hidden group min-w-0 ${
                      isSelected
                        ? 'bg-[#161C27] border-violet-500 text-[#F8FAFC] shadow-md shadow-violet-500/10 scale-105'
                        : 'bg-[#121722] border-[#222936] text-[#A7B0C0] hover:border-[#303848] hover:bg-[#171D29]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${n.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono text-[#707A8C] font-semibold truncate ml-1">{n.metric}</span>
                    </div>
                    <div className="text-xs font-bold truncate text-[#F8FAFC]">{n.title}</div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Right Selected Node Deep Dive */}
          <div className="lg:col-span-6 space-y-6 min-w-0">
            <div className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-[#0F1219] border border-[#222936] relative overflow-hidden shadow-xl min-w-0">
              
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-[#222936]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr ${nodes[activeNode].color} flex items-center justify-center text-white shadow-md shrink-0`}>
                    {React.createElement(nodes[activeNode].icon, { className: 'w-5 h-5 sm:w-6 sm:h-6' })}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#707A8C] uppercase tracking-widest block truncate">Selected Subsystem</span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#F8FAFC] truncate">{nodes[activeNode].title}</h3>
                  </div>
                </div>
                <span className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold border shrink-0 ${nodes[activeNode].badgeColor}`}>
                  {nodes[activeNode].metric}
                </span>
              </div>

              {/* Description & Impact */}
              <div className="py-6 space-y-4">
                <p className="text-[#A7B0C0] text-sm sm:text-base leading-relaxed">
                  {nodes[activeNode].desc}
                </p>

                <div className="p-4 rounded-xl bg-[#121722] border border-[#222936] space-y-2 text-xs">
                  <div className="font-bold text-violet-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-violet-400" /> Explainable AI Automation
                  </div>
                  <p className="text-[#A7B0C0] leading-relaxed">
                    BizPilot constantly reconciles operational telemetry with standard banking underwriting rules, removing guesswork for MSME leaders.
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-[#707A8C]">Click any subsystem node on the left to explore</span>
                <button
                  onClick={() => setActiveNode((activeNode + 1) % nodes.length)}
                  className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 transition-colors"
                >
                  Next Node
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
