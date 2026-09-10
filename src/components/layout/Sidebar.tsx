import React from 'react';
import { NavigationTab } from '../../types';
import { 
  LayoutDashboard, 
  HeartPulse, 
  TrendingUp, 
  Award, 
  FileCheck2, 
  SlidersHorizontal, 
  Compass, 
  BotMessageSquare, 
  FolderDown, 
  Settings2,
  Sparkles,
  Zap
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  fundingScore: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  fundingScore
}) => {
  const menuItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: string; isFlagship?: boolean }[] = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'financial-health', label: 'Financial Health Score', icon: HeartPulse, badge: '82/100' },
    { id: 'cash-flow', label: 'Cash Flow Forecasting', icon: TrendingUp, badge: 'AI Predict' },
    { id: 'funding-readiness', label: 'Funding Readiness', icon: Award, isFlagship: true, badge: `${fundingScore}/100` },
    { id: 'credit-passport', label: 'MSME Credit Passport', icon: FileCheck2, badge: 'PDF' },
    { id: 'what-if-simulator', label: 'What-If Simulator', icon: SlidersHorizontal, badge: 'Interactive' },
    { id: 'growth-intelligence', label: 'Growth Intelligence', icon: Compass },
    { id: 'ai-assistant', label: 'AI Business Assistant', icon: BotMessageSquare, badge: 'Multilingual' },
    { id: 'reports', label: 'Reports & Audits', icon: FolderDown },
    { id: 'settings', label: 'Settings & Integrations', icon: Settings2 }
  ];

  return (
    <aside className="w-64 bg-slate-950/70 border-r border-slate-800/80 p-3 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Platform Navigation
        </div>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-purple-600/20 text-purple-200 border border-purple-500/40 shadow-sm shadow-purple-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ml-1.5 ${
                  item.isFlagship
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm'
                    : isActive
                      ? 'bg-purple-500/30 text-purple-200'
                      : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Pro Card */}
      <div className="p-3.5 rounded-xl bg-gradient-to-b from-slate-900 to-purple-950/40 border border-purple-500/20 text-left relative overflow-hidden">
        <div className="flex items-center gap-2 text-purple-300 text-xs font-bold mb-1">
          <Zap className="w-4 h-4 text-purple-400 fill-purple-400" />
          <span>Automated GST & Bank Sync</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          Real-time integration active with GSTN & AA framework for live score updates.
        </p>
        <div className="mt-2.5 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live Stream Active
          </span>
          <span className="text-slate-400">99.8% Sync</span>
        </div>
      </div>
    </aside>
  );
};
