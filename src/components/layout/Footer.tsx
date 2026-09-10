import React from 'react';
import { Sparkles, Shield, Heart, Award, ArrowUpRight, Github, Twitter, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        
        {/* Col 1 */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-sky-400 flex items-center justify-center text-white font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-lg font-black text-white">BizPilot <span className="text-purple-400">AI</span></span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            India's premier AI-powered MSME Funding Readiness & Growth Intelligence Platform. Empowering 63M+ enterprises to achieve creditworthiness and financial visibility.
          </p>
          <div className="flex items-center gap-3 text-slate-500 pt-2">
            <span className="text-xs flex items-center gap-1 text-emerald-400">
              <Shield className="w-3.5 h-3.5" /> ISO 27001 Certified & RBI AA Framework Compliant
            </span>
          </div>
        </div>

        {/* Col 2 */}
        <div className="space-y-2 text-xs">
          <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Platform Capabilities</h4>
          <ul className="space-y-1.5 text-slate-400">
            <li className="hover:text-purple-300 cursor-pointer transition-colors">Financial Health Score Gauge</li>
            <li className="hover:text-purple-300 cursor-pointer transition-colors">Predictive Cash Flow Runway</li>
            <li className="hover:text-purple-300 cursor-pointer transition-colors">Funding Readiness Analyzer</li>
            <li className="hover:text-purple-300 cursor-pointer transition-colors">MSME Credit Passport (Bankable)</li>
            <li className="hover:text-purple-300 cursor-pointer transition-colors">What-If Decision Simulator</li>
            <li className="hover:text-purple-300 cursor-pointer transition-colors">Multilingual AI Copilot</li>
          </ul>
        </div>

        {/* Col 3 */}
        <div className="space-y-2 text-xs">
          <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Ecosystem & Integrations</h4>
          <ul className="space-y-1.5 text-slate-400">
            <li className="hover:text-purple-300 cursor-pointer transition-colors">GSTN & e-Invoicing Portal</li>
            <li className="hover:text-purple-300 cursor-pointer transition-colors">TReDS (RXIL, Invoicemart, M1xchange)</li>
            <li className="hover:text-purple-300 cursor-pointer transition-colors">Account Aggregator (Setu / Sahamati)</li>
            <li className="hover:text-purple-300 cursor-pointer transition-colors">PSB59 & CGTMSE Scheme Matcher</li>
            <li className="hover:text-purple-300 cursor-pointer transition-colors">Tally, Zoho Books, Busy ERP Connectors</li>
          </ul>
        </div>

        {/* Col 4 */}
        <div className="space-y-3 text-xs">
          <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">National Impact</h4>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-purple-400 font-bold text-sm">63 Million+ MSMEs</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Bridging the \$530 Billion credit gap through explainable financial intelligence and data-backed lending.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for Indian Innovators & Founders</span>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div>
          © {new Date().getFullYear()} BizPilot AI Technologies Pvt Ltd. All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
          <span>•</span>
          <span className="hover:text-slate-300 cursor-pointer">Security & Encryption</span>
          <span>•</span>
          <span className="hover:text-slate-300 cursor-pointer">Lender API Docs</span>
        </div>
      </div>
    </footer>
  );
};
