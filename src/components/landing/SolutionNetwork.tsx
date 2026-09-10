import React, { useState } from 'react';
import { 
  Sparkles, 
  HeartPulse, 
  TrendingUp, 
  Award, 
  Boxes, 
  Compass, 
  Lightbulb,
  CheckCircle,
  Zap,
  ArrowRight
} from 'lucide-react';

export const SolutionNetwork: React.FC = () => {
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
      desc: 'Conversational explainable guidance in 5 Indian languages for non-finance founders and entrepreneurs.',
      metric: 'Multilingual AI'
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-purple-600/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/50 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Autonomous MSME Financial Engine
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Meet <span className="text-gradient-purple">BizPilot AI</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            One central intelligent engine connected to every critical dimension of your business operations and capital strategy.
          </p>
        </div>

        {/* Interactive Network Visualization Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left / Central AI Engine Hub Visual */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            
            {/* Pulsing Concentric Rings */}
            <div className="absolute w-72 h-72 rounded-full border border-purple-500/20 animate-ping opacity-20 pointer-events-none" />
            <div className="absolute w-96 h-96 rounded-full border border-sky-500/20 pointer-events-none" />

            {/* Central Core */}
            <div className="relative z-10 w-32 h-32 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-400 p-1 shadow-2xl shadow-purple-600/50 flex flex-col items-center justify-center text-center">
              <div className="w-full h-full bg-slate-950/80 rounded-[22px] flex flex-col items-center justify-center p-2 backdrop-blur-md">
                <Sparkles className="w-8 h-8 text-sky-300 animate-pulse" />
                <span className="text-xs font-black text-white mt-1">BizPilot Core</span>
                <span className="text-[9px] text-purple-300 uppercase tracking-widest font-semibold">AI Neural Bus</span>
              </div>
            </div>

            {/* Satellite Node Pills in Circle / Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mt-8">
              {nodes.map((n) => {
                const Icon = n.icon;
                const isSelected = activeNode === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => setActiveNode(n.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'bg-purple-950/70 border-purple-500 text-white shadow-lg shadow-purple-900/30 scale-105'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${n.color} flex items-center justify-center text-white shadow-sm`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 font-semibold">{n.metric}</span>
                    </div>
                    <div className="text-xs font-bold truncate text-white">{n.title}</div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Right Selected Node Deep Dive */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 relative overflow-hidden shadow-2xl">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${nodes[activeNode].color} flex items-center justify-center text-white shadow-lg`}>
                    {React.createElement(nodes[activeNode].icon, { className: 'w-6 h-6' })}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Subsystem</span>
                    <h3 className="text-xl font-extrabold text-white">{nodes[activeNode].title}</h3>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${nodes[activeNode].badgeColor}`}>
                  {nodes[activeNode].metric}
                </span>
              </div>

              {/* Description & Impact */}
              <div className="py-6 space-y-4">
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                  {nodes[activeNode].desc}
                </p>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
                  <div className="font-bold text-purple-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-purple-400" /> Explainable AI Automation
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    BizPilot constantly reconciles operational telemetry with standard banking underwriting rules, removing guesswork for MSME leaders.
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">Click any subsystem node on the left to explore</span>
                <button
                  onClick={() => setActiveNode((activeNode + 1) % nodes.length)}
                  className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors"
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
