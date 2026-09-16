import React from 'react';
import { NavigationTab } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
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
  FlaskConical,
  Bot,
  Zap,
  CreditCard,
  X,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  fundingScore: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  fundingScore,
  isOpen = false,
  onClose,
}) => {
  const { t, language } = useLanguage();

  const menuItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: string; isFlagship?: boolean }[] = [
    { id: 'dashboard', label: t('nav.dashboard', 'Executive Dashboard'), icon: LayoutDashboard },
    { id: 'financial-health', label: t('nav.financialHealth', 'Financial Health Score'), icon: HeartPulse, badge: '82/100' },
    { id: 'cash-flow', label: t('nav.cashFlow', 'Cash Flow Forecasting'), icon: TrendingUp, badge: t('nav.aiPredict', 'AI Predict') },
    { id: 'funding-readiness', label: t('nav.fundingReadiness', 'Funding Readiness'), icon: Award, isFlagship: true, badge: `${fundingScore}/100` },
    { id: 'credit-passport', label: t('nav.creditPassport', 'MSME Credit Passport'), icon: FileCheck2, badge: t('nav.pdf', 'PDF') },
    { id: 'decision-lab', label: t('nav.decisionLab', 'Decision Lab'), icon: FlaskConical, isFlagship: true, badge: 'PRO' },
    { id: 'what-if-simulator', label: t('nav.whatIfSimulator', 'What-If Simulator'), icon: SlidersHorizontal, badge: t('nav.interactive', 'Interactive') },
    { id: 'ai-advisor', label: t('nav.aiAdvisor', 'AI Business Advisor'), icon: Bot, badge: 'PRO' },
    { id: 'ai-assistant', label: t('nav.aiAssistant', 'AI Business Assistant'), icon: BotMessageSquare, badge: t('nav.multilingual', 'Multilingual') },
    { id: 'growth-intelligence', label: t('nav.growthIntelligence', 'Growth Intelligence'), icon: Compass },
    { id: 'reports', label: t('nav.reports', 'Reports & Audits'), icon: FolderDown },
    { id: 'billing', label: t('nav.billing', 'Subscription & Billing'), icon: CreditCard, badge: '30d' },
    { id: 'settings', label: t('nav.settings', 'Settings & Integrations'), icon: Settings2 }
  ];

  const handleItemClick = (tabId: NavigationTab) => {
    onSelectTab(tabId);
    if (onClose) {
      onClose();
    }
  };

  const renderContent = (isMobileDrawer = false) => (
    <>
      <div className="space-y-1">
        {isMobileDrawer ? (
          <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-[#222936]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center text-white font-bold shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-[#F8FAFC]">
                BizPilot <span className="text-[#8B5CF6]">AI</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#161C27] hover:bg-[#1E2536] text-[#A7B0C0] hover:text-[#F8FAFC] border border-[#222936] transition-all"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="px-3 py-2 text-[10px] font-bold text-[#707A8C] uppercase tracking-widest">
            {t('nav.platformNavigation', 'Platform Navigation')}
          </div>
        )}
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAI = item.id === 'ai-assistant' || item.id === 'ai-advisor';
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-[#8B5CF6]/10 text-[#F8FAFC] font-semibold border-l-2 border-[#8B5CF6] border-y border-r border-[#8B5CF6]/20 shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                  : 'text-[#707A8C] hover:text-[#F8FAFC] hover:bg-[#121824] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive 
                    ? (isAI ? 'text-[#14B8A6]' : 'text-[#8B5CF6]') 
                    : (isAI ? 'text-[#14B8A6]/70 group-hover:text-[#14B8A6]' : 'text-[#707A8C] group-hover:text-[#F8FAFC]')
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold shrink-0 ml-1.5 ${
                  item.badge === 'PRO'
                    ? 'bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30 font-bold'
                    : isAI
                      ? 'bg-[#14B8A6]/15 text-[#2DD4BF] border border-[#14B8A6]/30 font-medium'
                      : isActive
                        ? 'bg-[#8B5CF6]/20 text-[#F8FAFC]'
                        : 'bg-[#161C27] text-[#707A8C] border border-[#222936]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Integration / Stream Status Card */}
      <div className="p-3.5 rounded-2xl bg-[#121722] border border-[#222936] text-left relative overflow-hidden shadow-sm mt-4">
        <div className="flex items-center gap-2 text-[#A78BFA] text-xs font-bold mb-1">
          <Zap className="w-4 h-4 text-[#8B5CF6] fill-[#8B5CF6]" />
          <span>{language === 'ta' ? 'ஜிஎஸ்டி & வங்கி நேரலை இணைப்பு' : 'Automated GST & Bank Sync'}</span>
        </div>
        <p className="text-[11px] text-[#707A8C] leading-snug">
          {language === 'ta' 
            ? 'ஜிஎஸ்டி மற்றும் வங்கி தரவுகளுடன் உடனடி மதிப்பீட்டு இணைப்பு செயலில் உள்ளது.' 
            : 'Real-time integration active with GSTN & AA framework for live score updates.'}
        </p>
        <div className="mt-2.5 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 
            {language === 'ta' ? 'இணைப்பு செயலில் உள்ளது' : 'Live Stream Active'}
          </span>
          <span className="text-[#707A8C] font-medium">99.8% Sync</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#0B0E14] border-r border-[#222936] p-3 flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
        {renderContent(false)}
      </aside>

      {/* Mobile Off-Canvas Drawer Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer Panel */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#0B0E14] border-r border-[#222936] p-4 flex flex-col justify-between shadow-2xl overflow-y-auto z-10 animate-in slide-in-from-left duration-200">
            {renderContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
