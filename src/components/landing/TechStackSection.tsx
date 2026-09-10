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
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      items: [
        { name: 'React 18', role: 'Component Architecture & State' },
        { name: 'Tailwind CSS', role: 'Fintech Dark Navy & Glassmorphism Design System' },
        { name: 'Lucide & Canvas', role: 'Vector Graphics & Rich Micro-Interactions' }
      ]
    },
    {
      category: 'Backend Architecture',
      icon: Server,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      items: [
        { name: 'Python FastAPI', role: 'High-Throughput Asynchronous Core' },
        { name: 'Uvicorn & Celery', role: 'Distributed Background Queue for GST Parsing' },
        { name: 'Pydantic V2', role: 'Strict Financial Schema Validation' }
      ]
    },
    {
      category: 'Data & Security',
      icon: Database,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      items: [
        { name: 'MySQL / PostgreSQL', role: 'ACID-Compliant Relational Financial Store' },
        { name: 'Redis Cache', role: 'Sub-millisecond Session & Telemetry Caching' },
        { name: 'AES-256 GCM', role: 'Bank-Grade Financial Ledger Encryption' }
      ]
    },
    {
      category: 'Generative AI & LLMs',
      icon: BrainCircuit,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      items: [
        { name: 'Google Gemini API', role: 'Multilingual Vernacular Reasoning & Synthesis' },
        { name: 'LangChain & RAG', role: 'MSME Credit Policy Retrieval-Augmented Generation' },
        { name: 'OpenAI GPT-4o', role: 'Explainable Financial Decision Copilot' }
      ]
    },
    {
      category: 'Machine Learning & Forecasting',
      icon: Cpu,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      items: [
        { name: 'Facebook Prophet', role: 'Time-Series Seasonality & Trend Decomposition' },
        { name: 'XGBoost & Scikit-Learn', role: 'Default Risk Classification & Credit Scoring' },
        { name: 'Pandas & NumPy', role: 'High-Precision Financial Ratio Arithmetic' }
      ]
    },
    {
      category: 'Visual Analytics & BI',
      icon: LineChart,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      items: [
        { name: 'Recharts & Chart.js', role: 'Interactive SVG Financial Visualizations' },
        { name: 'Power BI Embedded', role: 'Institutional Investor & Bank Reporting' },
        { name: 'PDF Engine', role: 'Official MSME Credit Passport Generation' }
      ]
    }
  ];

  return (
    <section className="py-24 relative bg-slate-950/70 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-purple-400" /> Enterprise-Grade Modern Stack
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Built with State-of-the-Art Technology
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Engineered for security, sub-second latency, explainable machine intelligence, and bank-level compliance.
          </p>
        </div>

        {/* 6 Tech Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stackCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/30 transition-all space-y-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${cat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">{cat.category}</h3>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                  {cat.items.map((item, iIdx) => (
                    <div key={iIdx} className="text-xs">
                      <div className="font-bold text-slate-200">{item.name}</div>
                      <div className="text-[11px] text-slate-400">{item.role}</div>
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
