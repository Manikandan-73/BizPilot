import React, { useState } from 'react';
import { MSMEProfile } from '../../types';
import { GROWTH_PLAYBOOKS } from '../../data/mockData';
import { AIInsightBadge } from '../common/AIInsightBadge';
import { 
  Compass, 
  Sparkles, 
  Tag, 
  Boxes, 
  Coins, 
  Globe2, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GrowthIntelligenceViewProps {
  profile: MSMEProfile;
  onNavigate: (tab: any) => void;
}

export const GrowthIntelligenceView: React.FC<GrowthIntelligenceViewProps> = ({
  profile,
  onNavigate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [executedPlaybooks, setExecutedPlaybooks] = useState<string[]>([]);

  const categories = ['All', 'Working Capital', 'Pricing', 'Inventory', 'Market Expansion'];

  const filteredPlaybooks = selectedCategory === 'All' 
    ? GROWTH_PLAYBOOKS 
    : GROWTH_PLAYBOOKS.filter(p => p.category === selectedCategory);

  const handleExecute = (id: string) => {
    if (!executedPlaybooks.includes(id)) {
      setExecutedPlaybooks([...executedPlaybooks, id]);
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>AI GROWTH INTELLIGENCE & ACTION ROADMAPS</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            Autonomous Growth Playbooks
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Prescriptive strategic playbooks customized for {profile.sector} to unlock margin expansion, shrink working capital cycles, and win government tenders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> +₹24.5L Total Value Unlock
          </span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Playbooks Roadmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPlaybooks.map((pb) => {
          const isExecuted = executedPlaybooks.includes(pb.id);
          
          return (
            <div
              key={pb.id}
              className={`p-6 rounded-2xl border transition-all space-y-4 flex flex-col justify-between shadow-xl ${
                isExecuted
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40'
              }`}
            >
              <div className="space-y-3">
                
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
                    {pb.category}
                  </span>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> {pb.roiPotential}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {pb.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {pb.description}
                </p>

                {/* AI Rationale Box */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                  <div className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Optimization Rationale
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {pb.aiRationale}
                  </p>
                </div>

                {/* Action steps */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Execution Steps:</div>
                  {pb.actionSteps.map((step, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {pb.implementationTime}
                </span>

                <button
                  onClick={() => handleExecute(pb.id)}
                  disabled={isExecuted}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isExecuted
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30'
                  }`}
                >
                  {isExecuted ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Roadmap Activated
                    </>
                  ) : (
                    <>
                      Deploy Playbook
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
