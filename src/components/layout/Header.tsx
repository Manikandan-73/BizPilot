import React, { useState } from 'react';
import { MSMEProfile, LanguageCode } from '../../types';
import { 
  Building, 
  ChevronDown, 
  Globe, 
  Bell, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  ExternalLink,
  Layers,
  ArrowRight,
  PlusCircle
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
}

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  profiles,
  onSelectProfile,
  currentLanguage,
  onSelectLanguage,
  isAppMode,
  onToggleAppMode,
  onOpenCreditPassport,
  onStartOnboarding,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const languageLabels: Record<LanguageCode, { label: string; flag: string }> = {
    en: { label: 'English', flag: '🇬🇧' },
    hi: { label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
    ta: { label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    te: { label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
    mr: { label: 'मराठी (Marathi)', flag: '🇮🇳' }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
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
              <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block">Funding & Growth Intelligence</p>
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
              Product Tour
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
              Live Workspace
            </button>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          
          {/* Active MSME Profile Switcher (Only in app mode or toggleable) */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 transition-all"
            >
              <Building className="w-3.5 h-3.5 text-purple-400" />
              <div className="text-left hidden lg:block">
                <div className="font-semibold text-white leading-tight truncate max-w-[140px]">
                  {currentProfile.name}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 inline" /> Udyam Verified
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                  Switch Active MSME Dataset
                </div>
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProfile(p);
                      setProfileDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start justify-between ${
                      p.id === currentProfile.id 
                        ? 'bg-purple-950/60 border border-purple-500/40 text-white' 
                        : 'hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white">{p.name}</div>
                      <div className="text-[11px] text-slate-400">{p.sector} • {p.location}</div>
                      <div className="text-[10px] text-purple-300 mt-1 font-mono">
                        Turnover: {p.turnover} | Health: {p.healthScore}/100
                      </div>
                    </div>
                    {p.id === currentProfile.id && (
                      <span className="w-2 h-2 rounded-full bg-purple-400 mt-1"></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Multilingual Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 transition-all"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-medium hidden sm:inline">{languageLabels[currentLanguage].label.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50">
                {(Object.keys(languageLabels) as LanguageCode[]).map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      onSelectLanguage(code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between ${
                      currentLanguage === code ? 'bg-purple-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{languageLabels[code].label}</span>
                    <span>{languageLabels[code].flag}</span>
                  </button>
                ))}
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
                  <span className="text-xs font-bold text-white">AI Intelligence Alerts</span>
                  <span className="text-[10px] text-purple-400">2 New</span>
                </div>
                <div className="p-2 bg-amber-950/30 border border-amber-500/30 rounded-lg text-xs text-amber-200">
                  <div className="font-semibold text-amber-300">Cash Flow Runway Alert</div>
                  <div>Supplier payouts in 45 days may trigger ₹3.2L liquid buffer dip.</div>
                </div>
                <div className="p-2 bg-purple-950/30 border border-purple-500/30 rounded-lg text-xs text-purple-200">
                  <div className="font-semibold text-purple-300">CGTMSE Loan Match Found</div>
                  <div>Eligible for ₹85 Lakhs collateral-free scheme via PSB59.</div>
                </div>
              </div>
            )}
          </div>

          {/* Start MSME Onboarding CTA */}
          <button
            onClick={onStartOnboarding}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-semibold transition-all hover:border-purple-500/50"
          >
            <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
            Set Up My Business
          </button>

          {/* MSME Credit Passport Action CTA */}
          <button
            onClick={onOpenCreditPassport}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
          >
            <FileText className="w-3.5 h-3.5" />
            Credit Passport
          </button>

          {!isAppMode ? (
            <button
              onClick={() => onToggleAppMode(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/20 transition-all"
            >
              Launch App
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onToggleAppMode(false)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
            >
              Home Tour
            </button>
          )}

        </div>

      </div>
    </header>
  );
};