import React, { useState } from 'react';
import { 
  NavigationTab, 
  LanguageCode, 
  MSMEProfile 
} from './types';
import { PROFILES } from './data/mockData';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { CreditPassportModal } from './components/common/CreditPassportModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';

// Dashboard Views
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { FinancialHealthView } from './components/dashboard/FinancialHealthView';
import { CashFlowForecastView } from './components/dashboard/CashFlowForecastView';
import { FundingReadinessView } from './components/dashboard/FundingReadinessView';
import { MSMECreditPassportView } from './components/dashboard/MSMECreditPassportView';
import { WhatIfSimulatorView } from './components/dashboard/WhatIfSimulatorView';
import { GrowthIntelligenceView } from './components/dashboard/GrowthIntelligenceView';
import { AIAssistantView } from './components/dashboard/AIAssistantView';
import { ReportsView } from './components/dashboard/ReportsView';
import { SettingsView } from './components/dashboard/SettingsView';

export const App: React.FC = () => {
  const [isAppMode, setIsAppMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [currentProfile, setCurrentProfile] = useState<MSMEProfile>(PROFILES[0]);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [isPassportModalOpen, setIsPassportModalOpen] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  const handleUpdateProfile = (updated: Partial<MSMEProfile>) => {
    setCurrentProfile(prev => ({ ...prev, ...updated }));
  };

  const renderActiveDashboardView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ExecutiveDashboard
            profile={currentProfile}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenPassport={() => setIsPassportModalOpen(true)}
          />
        );
      case 'financial-health':
        return (
          <FinancialHealthView
            profile={currentProfile}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'cash-flow':
        return (
          <CashFlowForecastView
            profile={currentProfile}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'funding-readiness':
        return (
          <FundingReadinessView
            profile={currentProfile}
            onOpenPassport={() => setIsPassportModalOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'credit-passport':
        return (
          <MSMECreditPassportView
            profile={currentProfile}
            onOpenModal={() => setIsPassportModalOpen(true)}
          />
        );
      case 'what-if-simulator':
        return (
          <WhatIfSimulatorView
            profile={currentProfile}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'growth-intelligence':
        return (
          <GrowthIntelligenceView
            profile={currentProfile}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'ai-assistant':
        return (
          <AIAssistantView
            profile={currentProfile}
            currentLanguage={currentLanguage}
            onSelectLanguage={setCurrentLanguage}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'reports':
        return (
          <ReportsView
            profile={currentProfile}
            onOpenPassport={() => setIsPassportModalOpen(true)}
          />
        );
      case 'settings':
        return (
          <SettingsView
            profile={currentProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      default:
        return (
          <ExecutiveDashboard
            profile={currentProfile}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenPassport={() => setIsPassportModalOpen(true)}
          />
        );
    }
  };

  if (showOnboarding) {
    return (
      <OnboardingWizard
        onExit={() => setShowOnboarding(false)}
        onGoToDashboard={() => {
          setShowOnboarding(false);
          setIsAppMode(true);
          setActiveTab('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0F172A] text-slate-100 font-sans">
      {/* Top Header */}
      <Header
        currentProfile={currentProfile}
        profiles={PROFILES}
        onSelectProfile={setCurrentProfile}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
        isAppMode={isAppMode}
        onToggleAppMode={setIsAppMode}
        onOpenCreditPassport={() => setIsPassportModalOpen(true)}
        onStartOnboarding={() => setShowOnboarding(true)}
      />

      {/* Main Content Area */}
      {!isAppMode ? (
        /* Landing Page Mode */
        <main className="flex-1">
          <LandingPage
            onLaunchDemo={() => {
              setIsAppMode(true);
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenCreditPassport={() => setIsPassportModalOpen(true)}
          />
        </main>
      ) : (
        /* SaaS Application Dashboard Mode */
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Navigation */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            fundingScore={currentProfile.fundingReadinessScore}
          />

          {/* Main Dashboard Panel */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
            {renderActiveDashboardView()}
          </main>
        </div>
      )}

      {/* Global Footer (shown on landing page) */}
      {!isAppMode && <Footer />}

      {/* Reusable Credit Passport Modal */}
      <CreditPassportModal
        isOpen={isPassportModalOpen}
        onClose={() => setIsPassportModalOpen(false)}
        profile={currentProfile}
      />
    </div>
  );
};

export default App;