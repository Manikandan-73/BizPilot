import React from 'react';
import { 
  Code2, 
  Server, 
  Database, 
  BrainCircuit, 
  LineChart, 
  Cpu,
  Layers,
  Terminal,
  ShieldAlert
} from 'lucide-react';

export const TechStackSection: React.FC = () => {
  const stackCategories = [
    {
      category: 'Frontend & UI',
      icon: Code2,
      color: 'text-violet-400 bg-violet-950/40 border-violet-800/40',
      items: [
        { name: 'React 18', role: 'Component Architecture & State' },
        { name: 'Tailwind CSS', role: 'Fintech Modern Design System & Clean Cards' },
        { name: 'Lucide & Canvas', role: 'Vector Graphics & Rich Micro-Interactions' }
      ]
    },
    {
      category: 'Backend Architecture',
      icon: Server,
      color: 'text-teal-400 bg-teal-950/40 border-teal-800/40',
      items: [
        { name: 'Python FastAPI', role: 'High-Throughput Asynchronous Core' },
        { name: 'Uvicorn & Celery', role: 'Distributed Background Queue for GST Parsing' },
        { name: 'Pydantic V2', role: 'Strict Financial Schema Validation' }
      ]
    },
    {
      category: 'Data & Security',
      icon: Database,
      color: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
      items: [
        { name: 'MySQL / PostgreSQL', role: 'ACID-Compliant Relational Financial Store' },
        { name: 'Redis Cache', role: 'Sub-millisecond Session & Telemetry Caching' },
        { name: 'AES-256 GCM', role: 'Bank-Grade Financial Ledger Encryption' }
      ]
    },
    {
      category: 'Generative AI & LLMs',
      icon: BrainCircuit,
      color: 'text-violet-400 bg-violet-950/40 border-violet-800/40',
      items: [
        { name: 'Google Gemini API', role: 'Multilingual Vernacular Reasoning & Synthesis' },
        { name: 'LangChain & RAG', role: 'MSME Credit Policy Retrieval-Augmented Generation' },
        { name: 'OpenAI GPT-4o', role: 'Explainable Financial Decision Copilot' }
      ]
    },
    {
      category: 'Machine Learning & Forecasting',
      icon: Cpu,
      color: 'text-teal-400 bg-teal-950/40 border-teal-800/40',
      items: [
        { name: 'Facebook Prophet', role: 'Time-Series Seasonality & Trend Decomposition' },
        { name: 'XGBoost & Scikit-Learn', role: 'Default Risk Classification & Credit Scoring' },
        { name: 'Pandas & NumPy', role: 'High-Precision Financial Ratio Arithmetic' }
      ]
    },
    {
      category: 'Visual Analytics & BI',
      icon: LineChart,
      color: 'text-violet-400 bg-violet-950/40 border-violet-800/40',
      items: [
        { name: 'Recharts & Chart.js', role: 'Interactive SVG Financial Visualizations' },
        { name: 'Power BI Embedded', role: 'Institutional Investor & Bank Reporting' },
        { name: 'PDF Engine', role: 'Official MSME Credit Passport Generation' }
      ]
    }
  ];

  return (
    <section className="py-12 sm:py-20 lg:py-24 relative bg-[#0F1219] border-t border-[#222936] min-w-0">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 min-w-0">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121722] border border-[#222936] text-violet-400 text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-violet-400" /> Enterprise-Grade Modern Stack
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#F8FAFC] tracking-tight">
            Built with State-of-the-Art Technology
          </h2>
          <p className="text-[#A7B0C0] text-xs sm:text-base leading-relaxed">
            Engineered for security, sub-second latency, explainable machine intelligence, and bank-level compliance.
          </p>
        </div>

        {/* 6 Tech Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
          {stackCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div 
                key={idx}
                className="p-4 sm:p-6 rounded-2xl bg-[#121722] border border-[#222936] shadow-sm hover:border-[#303848] hover:-translate-y-0.5 transition-all space-y-4 min-w-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${cat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[#F8FAFC] text-base">{cat.category}</h3>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-[#222936]">
                  {cat.items.map((item, iIdx) => (
                    <div key={iIdx} className="text-xs">
                      <div className="font-bold text-[#F8FAFC]">{item.name}</div>
                      <div className="text-[11px] text-[#A7B0C0]">{item.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
