import React, { useState } from 'react';
import { MSMEProfile, LanguageCode } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  Building,
  ChevronDown,
  Globe, 
  Bell, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Layers, 
  ArrowRight, 
  PlusCircle,
  Check,
  LogOut,
  User as UserIcon
} from 'lucide-react';

interface HeaderProps {
  currentProfile: MSMEProfile;
  profiles: MSMEProfile[];
  onSelectProfile: (profile: MSMEProfile) => void;
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  isAppMode: boolean;
  onToggleAppMode: (isApp: boolean) => void;
  onOpenCreditPassport: () => void;
  onStartOnboarding: () => void;
  isAuthenticated?: boolean;
  userEmail?: string | null;
  userName?: string | null;
  onLogout?: () => void;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
  isAdmin?: boolean;
  onOpenAdminPortal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  profiles,
  onSelectProfile,
  currentLanguage: _legacyLang,
  onSelectLanguage,
  isAppMode,
  onToggleAppMode,
  onOpenCreditPassport,
  onStartOnboarding,
  isAuthenticated = false,
  userEmail,
  userName,
  onLogout,
  onOpenLogin,
  onOpenRegister,
  isAdmin = false,
  onOpenAdminPortal,
}) => {
  const { language, setLanguage, t } = useLanguage();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const supportedLanguages = [
    { code: 'en' as const, label: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'ta' as const, label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  ];

  const handleLanguageSelect = (code: 'en' | 'ta') => {
    setLanguage(code);
    onSelectLanguage(code);
    setLangDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Switcher */}
        <div className="flex items-center gap-6">
          <div 
            onClick={() => onToggleAppMode(false)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white font-black shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-all">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                BizPilot <span className="text-purple-400 font-black">AI</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  MSME
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block">
                {language === 'ta' ? 'நிதி & வளர்ச்சி நுண்ணறிவு' : 'Funding & Growth Intelligence'}
              </p>
            </div>
          </div>

          {/* Navigation Mode Pill */}
          <div className="hidden md:flex items-center p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => onToggleAppMode(false)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                !isAppMode 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('nav.productTour', 'Product Tour')}
            </button>
            <button
              onClick={() => onToggleAppMode(true)}
              className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                isAppMode 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {t('nav.liveWorkspace', 'Live Workspace')}
            </button>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
              {/* Active MSME Profile or Authenticated Identity */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {isAdmin && onOpenAdminPortal && (
                <button
                  onClick={onOpenAdminPortal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900/90 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all shadow-sm shadow-purple-900/30"
                  title={t('admin.adminPortal', 'Admin Portal')}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden sm:inline">{t('admin.adminPortal', 'Admin Portal')}</span>
                </button>
              )}

              {/* Active MSME Profile Selector for authenticated user with multiple MSMEs */}
              <div className="relative">
                <button
                  onClick={() => {
                    if (profiles.length > 1) {
                      setProfileDropdownOpen(!profileDropdownOpen);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 transition-all ${
                    profiles.length > 1 ? 'hover:bg-slate-800 cursor-pointer' : 'cursor-default'
                  }`}
                  title={profiles.length > 1 ? t('header.switchStartup', 'Switch MSME Business') : currentProfile.name}
                >
                  <Building className="w-3.5 h-3.5 text-purple-400" />
                  <div className="text-left hidden lg:block">
                    <div className="font-semibold text-white leading-tight truncate max-w-[140px]">
                      {currentProfile.name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span className="text-purple-300 font-mono">{currentProfile.sector || 'MSME'}</span>
                      {profiles.length > 1 && (
                        <span className="text-[9px] px-1 py-0.2 bg-purple-500/20 text-purple-300 rounded font-semibold">
                          {profiles.length} MSMEs
                        </span>
                      )}
                    </div>
                  </div>
                  {profiles.length > 1 && (
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 ml-1 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {profiles.length > 1 && profileDropdownOpen && (
                  <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
                    <div className="flex items-center justify-between px-2.5 py-1 mb-1 border-b border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {t('header.myStartups', 'My MSME Businesses')}
                      </span>
                      <span className="text-[10px] font-bold text-purple-400">
                        {profiles.length} Active
                      </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {profiles.map((p) => {
                        const isSelected = p.id === currentProfile.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              onSelectProfile(p);
                              setProfileDropdownOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start justify-between ${
                              isSelected 
                                ? 'bg-purple-950/60 border border-purple-500/40 text-white' 
                                : 'hover:bg-slate-800/80 text-slate-300'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-bold text-white truncate">{p.name}</div>
                              <div className="text-[11px] text-slate-400 truncate">{p.sector} • {p.location}</div>
                              <div className="text-[10px] text-purple-300 mt-0.5 font-mono">
                                {p.turnover} | Health: {p.healthScore}/100
                              </div>
                            </div>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onStartOnboarding();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>{t('header.registerAnother', 'Register Another MSME')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Account / Logout */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-500/40 border border-slate-700/80 text-xs font-semibold text-slate-300 transition-all"
                title={t('auth.logout', 'Log Out')}
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400 hover:text-rose-400" />
                <span className="hidden md:inline">{t('auth.logout', 'Log Out')}</span>
              </button>
            </div>
          ) : null}

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 transition-all font-medium"
              title={t('header.changeLanguage', 'Change Language')}
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline font-semibold">
                {language === 'ta' ? 'தமிழ்' : 'English'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50">
                <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {t('header.changeLanguage', 'Select Language')}
                </div>
                {supportedLanguages.map((item) => {
                  const isSelected = language === item.code;
                  return (
                    <button
                      key={item.code}
                      onClick={() => handleLanguageSelect(item.code)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all ${
                        isSelected 
                          ? 'bg-purple-600 text-white font-semibold shadow-sm' 
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{item.flag}</span>
                        <span>{item.native}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-purple-200' : 'text-slate-400'}`}>
                          ({item.label})
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications Toggle */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 transition-all"
              title="Alerts & AI Insights"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-500"></span>
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white">
                    {language === 'ta' ? 'AI நுண்ணறிவு எச்சரிக்கைகள்' : 'AI Intelligence Alerts'}
                  </span>
                  <span className="text-[10px] text-purple-400 font-semibold">2 New</span>
                </div>
                <div className="p-2.5 bg-amber-950/30 border border-amber-500/30 rounded-lg text-xs text-amber-200">
                  <div className="font-semibold text-amber-300">
                    {language === 'ta' ? 'பணப்புழக்க எச்சரிக்கை' : 'Cash Flow Runway Alert'}
                  </div>
                  <div>
                    {language === 'ta' ? 'அடுத்த 45 நாட்களில் ₹3.2 இலட்சம் பணப் பற்றாக்குறை ஏற்பட வாய்ப்பு.' : 'Supplier payouts in 45 days may trigger ₹3.2L liquid buffer dip.'}
                  </div>
                </div>
                <div className="p-2.5 bg-purple-950/30 border border-purple-500/30 rounded-lg text-xs text-purple-200">
                  <div className="font-semibold text-purple-300">
                    {language === 'ta' ? 'CGTMSE கடன் பொருத்தம் கண்டறியப்பட்டது' : 'CGTMSE Loan Match Found'}
                  </div>
                  <div>
                    {language === 'ta' ? 'PSB59 வழியாக ₹85 இலட்சம் வரை பிணையில்லா கடனுக்கு தகுதி உள்ளது.' : 'Eligible for ₹85 Lakhs collateral-free scheme via PSB59.'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Start MSME Onboarding CTA */}
          {isAuthenticated && (
            <button
              onClick={onStartOnboarding}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-semibold transition-all hover:border-purple-500/50"
            >
              <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
              {t('header.startOnboarding', 'Set Up My Business')}
            </button>
          )}

          {/* MSME Credit Passport Action CTA */}
          <button
            onClick={onOpenCreditPassport}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
          >
            <FileText className="w-3.5 h-3.5" />
            {t('header.openPassport', 'Credit Passport')}
          </button>

          {/* Unauthenticated Auth Buttons */}
          {!isAuthenticated && (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-all hover:border-purple-500/50"
              >
                {t('auth.signIn', 'Sign In')}
              </button>
              <button
                onClick={onOpenRegister}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
              >
                {t('auth.registerMsme', 'Register MSME')}
              </button>
            </div>
          )}

          {!isAppMode ? (
            <button
              onClick={() => onToggleAppMode(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/20 transition-all"
            >
              {language === 'ta' ? 'பணியிடத்தை தொடங்கு' : 'Launch App'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onToggleAppMode(false)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
            >
              {t('nav.productTour', 'Home Tour')}
            </button>
          )}

        </div>

      </div>
    </header>
  );
};