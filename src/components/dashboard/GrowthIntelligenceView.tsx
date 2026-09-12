import React, { useMemo, useState } from 'react';
import { MSMEProfile } from '../../types';
import { BusinessAnalysis } from '../../types/business';
import { 
  Compass, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GrowthIntelligenceViewProps {
  profile: MSMEProfile;
  analysis?: BusinessAnalysis;
  onNavigate: (tab: any) => void;
}

export const GrowthIntelligenceView: React.FC<GrowthIntelligenceViewProps> = ({
  profile,
  analysis,
  onNavigate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [executedPlaybooks, setExecutedPlaybooks] = useState<string[]>([]);

  const categories = ['All', 'Working Capital', 'Pricing', 'Inventory', 'Market Expansion'];

  const annualRev = analysis ? analysis.financials.annualRevenue : 48500000;
  const turnoverLakhs = Math.max(10, annualRev / 100000);
  const challenge = analysis?.goals.biggestChallenge || 'Cash Flow';

  // Build business-specific dynamic playbooks
  const playbooks = useMemo(() => {
    return [
      {
        id: 'treds-invoice-discounting',
        category: 'Working Capital',
        title: 'TReDS Debtor Invoice Discounting',
        roiPotential: `₹${(turnoverLakhs * 0.04).toFixed(1)} Lakhs Liquidity`,
        implementationTime: '7 - 10 Days',
        description: `Unlock trapped cash in your ₹${analysis ? (analysis.normalized.accountsReceivable / 100000).toFixed(1) : '55.0'}L receivables via RBI-approved TReDS exchanges (RXIL / M1xchange).`,
        aiRationale: `Your receivables account for high debtor lockup. Institutional discounting transfers risk and shortens cash collection cycles to 48 hours.`,
        actionSteps: [
          'Register on RXIL / Invoicemart with existing GSTIN & Udyam number.',
          'Upload approved corporate invoices for auction to institutional bidders.',
          'Receive 85-90% upfront settlement directly to business current account within 48 hours.'
        ],
        difficulty: 'Easy' as const
      },
      {
        id: 'selective-pricing-adjustment',
        category: 'Pricing',
        title: 'Selective Tiered Margin Optimization',
        roiPotential: `+₹${(turnoverLakhs * 0.035).toFixed(1)} Lakhs EBITDA`,
        implementationTime: '15 Days',
        description: `Institute a selective 4-6% price tier on top-selling product categories to absorb direct material inflation.`,
        aiRationale: `Operating EBITDA margin is currently ${analysis?.financials.operatingMarginPercent ?? 16.8}%. Direct margin adjustment restores gross margins above 20%.`,
        actionSteps: [
          'Identify top 20% SKU lines contributing to 70% of gross volume.',
          'Adjust distributor tier rates by +4.5% while offering volume rebates on 30-day pre-orders.',
          'Track order retention over 60 days to prevent churn.'
        ],
        difficulty: 'Medium' as const
      },
      {
        id: 'safety-stock-optimization',
        category: 'Inventory',
        title: 'Dynamic Safety Stock & Lead-Time Rationalization',
        roiPotential: `₹${(turnoverLakhs * 0.025).toFixed(1)} Lakhs Freed Capital`,
        implementationTime: '21 Days',
        description: `Transition from static buffer stocks to dynamic reorder intervals based on supplier lead times.`,
        aiRationale: `Current inventory holding of ₹${analysis ? (analysis.normalized.inventoryValue / 100000).toFixed(1) : '38.0'}L ties up vital working capital buffer.`,
        actionSteps: [
          'Audit slow-moving raw materials and liquidation candidates.',
          'Establish ABC inventory classification across tier-1 suppliers.',
          'Reinvest liberated liquid cash into short-term liquid sweep deposits.'
        ],
        difficulty: 'Strategic' as const
      },
      {
        id: 'gem-tender-procurement',
        category: 'Market Expansion',
        title: 'GeM Portal & Public Procurement Allocation',
        roiPotential: `+₹${(turnoverLakhs * 0.08).toFixed(1)} Lakhs Revenue`,
        implementationTime: '30 Days',
        description: `Leverage MSME 25% mandatory public procurement quota on the Government e-Marketplace (GeM).`,
        aiRationale: `With active Udyam registration and verified financial health (${analysis?.health.overallScore ?? 82}/100), you qualify for EMD exemption on PSU tenders.`,
        actionSteps: [
          'Complete GeM seller profile verification and link Udyam certificate.',
          'Filter active state & central department tenders with EMD exemption for MSMEs.',
          'Submit bids backed by the verified BizPilot Credit Passport.'
        ],
        difficulty: 'Strategic' as const
      }
    ];
  }, [analysis, turnoverLakhs]);

  const filteredPlaybooks = selectedCategory === 'All' 
    ? playbooks 
    : playbooks.filter(p => p.category === selectedCategory);

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
            Prescriptive strategic playbooks customized for <strong>{analysis?.organizationName || profile.name}</strong> to unlock margin expansion and solve <strong>{challenge}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Quantified Value Unlock
          </span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === cat 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Playbook Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPlaybooks.map((playbook) => {
          const isDone = executedPlaybooks.includes(playbook.id);

          return (
            <div 
              key={playbook.id}
              className={`p-6 rounded-2xl border transition-all space-y-4 shadow-xl relative overflow-hidden flex flex-col justify-between ${
                isDone 
                  ? 'bg-emerald-950/20 border-emerald-500/40' 
                  : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {playbook.category}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {playbook.roiPotential}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {playbook.implementationTime}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {playbook.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {playbook.description}
                </p>

                {/* AI Rationale Box */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 text-xs space-y-1">
                  <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Tailored AI Diagnostic:
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {playbook.aiRationale}
                  </p>
                </div>

                {/* Action steps */}
                <div className="space-y-2 pt-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Implementation Steps:</div>
                  {playbook.actionSteps.map((step, sIdx) => (
                    <div key={sIdx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold text-slate-400">
                        {sIdx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  playbook.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                  playbook.difficulty === 'Medium' ? 'bg-sky-500/10 text-sky-400' : 'bg-purple-500/10 text-purple-400'
                }`}>
                  Difficulty: {playbook.difficulty}
                </span>

                <button
                  onClick={() => handleExecute(playbook.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isDone 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'bg-slate-800 hover:bg-emerald-600 text-white border border-slate-700 hover:border-transparent'
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </>
                  ) : (
                    <>
                      Execute Playbook <ArrowRight className="w-3 h-3" />
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
