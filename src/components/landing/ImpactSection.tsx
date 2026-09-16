import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Leaf, 
  Coins, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  Globe2,
  TreePine,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const ImpactSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'economic' | 'social' | 'environmental'>('economic');

  const economicStats = [
    { title: '₹1,240+ Crore', subtitle: 'Formal Institutional Credit Facilitated', desc: 'Pre-qualified & matched through PSB59 and collateral-free CGTMSE schemes.' },
    { title: '68% Reduction', subtitle: 'Informal High-Cost Borrowing', desc: 'Replacing 24-36% predatory money lenders with 8.5-10.5% bank working capital.' },
    { title: '2.4x Faster', subtitle: 'Average Loan Sanction Turnaround', desc: 'From 42 days down to under 18 days with verified MSME Credit Passports.' }
  ];

  const socialStats = [
    { title: '34,000+', subtitle: 'Women-Led MSMEs Supported', desc: 'Specialized Stand-Up India & Mudra Tarun eligibility optimizers for women entrepreneurs.' },
    { title: '62% Tier-2/3', subtitle: 'Rural & Semi-Urban Distribution', desc: 'Multilingual conversational interface empowering non-English vernacular business owners.' },
    { title: '145,000+', subtitle: 'Sustainable Jobs Protected', desc: 'Preventing premature insolvency and cash crunches across manufacturing & crafts clusters.' }
  ];

  const environmentalStats = [
    { title: '18 Million+', subtitle: 'Paper Documents Digitized', desc: '100% paperless digital credit underwriting and e-invoicing compliance.' },
    { title: '23% Reduction', subtitle: 'Perishable Food & Inventory Waste', desc: 'Predictive JIT inventory planning preventing spoilage in agro-processing units.' },
    { title: '4.8M kWh', subtitle: 'Estimated Energy Waste Eliminated', desc: 'Optimized batch manufacturing scheduling and cold-storage operations.' }
  ];

  return (
    <section className="py-24 relative bg-[#0F1219] border-y border-[#222936]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Globe2 className="w-3.5 h-3.5" /> Inclusive National Transformation
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#F8FAFC] tracking-tight">
            Measurable Triple-Bottom-Line Impact
          </h2>
          <p className="text-[#A7B0C0] text-sm sm:text-base leading-relaxed">
            BizPilot AI is designed not just as a software tool, but as national infrastructure driving formalization, inclusion, and sustainability.
          </p>
        </div>

        {/* Impact Selector Tabs */}
        <div className="flex justify-center mb-12">
          <div className="p-1.5 bg-[#0B0E14] rounded-2xl border border-[#222936] shadow-sm flex gap-2">
            <button
              onClick={() => setActiveTab('economic')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'economic'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                  : 'text-[#707A8C] hover:text-[#F8FAFC]'
              }`}
            >
              <Coins className="w-4 h-4" />
              Economic Impact
            </button>

            <button
              onClick={() => setActiveTab('social')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'social'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'text-[#707A8C] hover:text-[#F8FAFC]'
              }`}
            >
              <Users className="w-4 h-4" />
              Social Inclusion
            </button>

            <button
              onClick={() => setActiveTab('environmental')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'environmental'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-[#707A8C] hover:text-[#F8FAFC]'
              }`}
            >
              <Leaf className="w-4 h-4" />
              Environmental Sustainability
            </button>
          </div>
        </div>

        {/* Dynamic Impact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(activeTab === 'economic' ? economicStats : activeTab === 'social' ? socialStats : environmentalStats).map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-[#121722] border border-[#222936] shadow-sm hover:border-[#303848] hover:-translate-y-0.5 transition-all space-y-4 relative overflow-hidden group"
            >
              <div className={`text-3xl sm:text-4xl font-black ${
                activeTab === 'economic' 
                  ? 'text-violet-400' 
                  : activeTab === 'social' 
                    ? 'text-teal-400' 
                    : 'text-emerald-400'
              }`}>
                {item.title}
              </div>
              <h3 className="text-base font-bold text-[#F8FAFC] group-hover:text-violet-400 transition-colors">
                {item.subtitle}
              </h3>
              <p className="text-xs text-[#A7B0C0] leading-relaxed">
                {item.desc}
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] text-[#707A8C]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audited FY26 MSME Cohort Metric</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
