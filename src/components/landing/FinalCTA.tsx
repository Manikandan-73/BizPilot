import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface FinalCTAProps {
  onStartTrial: () => void;
  onRequestDemo: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({
  onStartTrial,
  onRequestDemo
}) => {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-slate-950 via-purple-950/30 to-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900 border border-purple-500/40 shadow-2xl backdrop-blur-2xl space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Accelerate Your MSME Growth Today
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Empowering Every MSME to <br className="hidden sm:inline" />
            <span className="text-gradient-purple">Become Funding Ready</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            AI-driven financial intelligence, growth planning, and funding readiness in one platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartTrial}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white font-extrabold text-sm shadow-xl shadow-purple-600/40 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onRequestDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:border-purple-500/50"
            >
              Request Custom Demo
            </button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 border-t border-slate-800/80 mt-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Instant GSTN Link
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Export Bankable Passport in 60s
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};
