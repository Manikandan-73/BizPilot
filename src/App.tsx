import React, { useEffect, useMemo, useState } from 'react';
import {
  NavigationTab,
  LanguageCode,
  MSMEProfile
} from './types';
import { Organization, OnboardingRecord } from './types/business';
import { analyzeOrganization } from './analytics/financialAnalysis';
import { DEMO_ORGANIZATIONS, getDemoOrganization } from './analytics/demoOrganizations';
import {
  loadOrganizationRecords,
  loadSelectedOrganizationId,
  saveSelectedOrganizationId,
  updateOrganizationRecord
} from './services/organizationService';
import { formatINR } from './lib/currency';

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
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [isPassportModalOpen, setIsPassportModalOpen] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  const [records, setRecords] = useState<OnboardingRecord[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>(DEMO_ORGANIZATIONS[0].id);
  const [dataError, setDataError] = useState<string | null>(null);

  // Load organizations and active selection from Firestore on initial mount
  useEffect(() => {
    const initOrganizations = async () => {
      try {
        setDataError(null);
        const loadedRecords = await loadOrganizationRecords();
        setRecords(loadedRecords);

        const savedId = await loadSelectedOrganizationId();
        if (savedId) {
          setSelectedOrgId(savedId);
          setIsAppMode(true);
        } else if (loadedRecords.length > 0) {
          setSelectedOrgId(loadedRecords[0].organization.id);
          setIsAppMode(true);
        } else {
          setSelectedOrgId(DEMO_ORGANIZATIONS[0].id);
        }
      } catch (error) {
        setDataError(error instanceof Error ? error.message : 'Unable to connect to business records.');
      }
    };

    initOrganizations();
  }, []);

  // Combined list of user-created Firestore organizations + default demo MSMEs
  const allOrganizations: Organization[] = useMemo(() => {
    const userOrgs = records.map((r) => r.organization);
    // Keep user organizations first, followed by demo profiles
    const demoRemainder = DEMO_ORGANIZATIONS.filter(
      (demo) => !userOrgs.some((u) => u.id === demo.id)
    );
    return [...userOrgs, ...demoRemainder];
  }, [records]);

  // The active selected organization
  const activeOrg: Organization = useMemo(() => {
    const found = allOrganizations.find((org) => org.id === selectedOrgId);
    return found || records[0]?.organization || DEMO_ORGANIZATIONS[0];
  }, [allOrganizations, selectedOrgId, records]);

  // SINGLE CENTRAL ANALYSIS ENGINE EXECUTION:
  // All dashboard features consume this single calculated analysis object
  const analysis = useMemo(() => {
    return analyzeOrganization(activeOrg);
  }, [activeOrg]);

  // Dynamic MSMEProfile synthesized from activeOrg and calculated analysis
  const currentProfile: MSMEProfile = useMemo(() => {
    const turnoverNum = typeof activeOrg.businessProfile.annualTurnover === 'number'
      ? activeOrg.businessProfile.annualTurnover
      : analysis.financials.annualRevenue;

    return {
      id: activeOrg.id,
      name: activeOrg.businessProfile.businessName || activeOrg.name,
      industry: activeOrg.businessProfile.industry || 'Enterprise',
      sector: activeOrg.businessProfile.businessType || 'MSME',
      udyamNumber: 'UDYAM-REGISTERED',
      gstin: activeOrg.complianceProfile.gstRegistered ? '27AABCS1429B1ZX' : 'NOT-REGISTERED',
      incorporationYear: typeof activeOrg.businessProfile.yearEstablished === 'number' 
        ? activeOrg.businessProfile.yearEstablished 
        : 2020,
      location: activeOrg.businessProfile.location || 'India',
      employees: typeof activeOrg.businessProfile.numberOfEmployees === 'number' 
        ? activeOrg.businessProfile.numberOfEmployees 
        : 10,
      turnover: formatINR(turnoverNum),
      creditScore: Math.round(550 + (analysis.health.overallScore * 2.5)),
      healthScore: analysis.health.overallScore,
      fundingReadinessScore: analysis.funding.overallScore,
      revenueGrowth: analysis.financials.operatingMarginPercent ? Math.min(25, Math.max(5, analysis.financials.operatingMarginPercent)) : 12.4,
      cashFlowStability: Math.min(99, Math.max(60, analysis.health.overallScore + 5)),
      loanEligibility: analysis.funding.eligibilityTier === 'High' ? 'High' : analysis.funding.eligibilityTier === 'Medium' ? 'Medium' : 'Low',
      estimatedCreditLimit: analysis.funding.estimatedCreditLimit,
      dscrRatio: analysis.financials.dscr ?? 2.0,
      runwayMonths: analysis.financials.runwayMonths ?? 6,
    };
  }, [activeOrg, analysis]);

  // Synthesize MSMEProfiles list for dropdown switcher in Header
  const allProfiles: MSMEProfile[] = useMemo(() => {
    return allOrganizations.map((org) => {
      const orgAnalysis = analyzeOrganization(org);
      const turnoverNum = typeof org.businessProfile.annualTurnover === 'number'
        ? org.businessProfile.annualTurnover
        : orgAnalysis.financials.annualRevenue;

      return {
        id: org.id,
        name: org.businessProfile.businessName || org.name,
        industry: org.businessProfile.industry || 'Enterprise',
        sector: org.businessProfile.businessType || 'MSME',
        udyamNumber: 'UDYAM-REGISTERED',
        gstin: org.complianceProfile.gstRegistered ? '27AABCS1429B1ZX' : 'NOT-REGISTERED',
        incorporationYear: typeof org.businessProfile.yearEstablished === 'number' 
          ? org.businessProfile.yearEstablished 
          : 2020,
        location: org.businessProfile.location || 'India',
        employees: typeof org.businessProfile.numberOfEmployees === 'number' 
          ? org.businessProfile.numberOfEmployees 
          : 10,
        turnover: formatINR(turnoverNum),
        creditScore: Math.round(550 + (orgAnalysis.health.overallScore * 2.5)),
        healthScore: orgAnalysis.health.overallScore,
        fundingReadinessScore: orgAnalysis.funding.overallScore,
        revenueGrowth: orgAnalysis.financials.operatingMarginPercent ? Math.min(25, Math.max(5, orgAnalysis.financials.operatingMarginPercent)) : 12.4,
        cashFlowStability: Math.min(99, Math.max(60, orgAnalysis.health.overallScore + 5)),
        loanEligibility: orgAnalysis.funding.eligibilityTier === 'High' ? 'High' : orgAnalysis.funding.eligibilityTier === 'Medium' ? 'Medium' : 'Low',
        estimatedCreditLimit: orgAnalysis.funding.estimatedCreditLimit,
        dscrRatio: orgAnalysis.financials.dscr ?? 2.0,
        runwayMonths: orgAnalysis.financials.runwayMonths ?? 6,
      };
    });
  }, [allOrganizations]);

  // Handle switching active organization
  const handleSelectProfile = (profile: MSMEProfile) => {
    setSelectedOrgId(profile.id);
    void saveSelectedOrganizationId(profile.id);
    setIsAppMode(true);
    setActiveTab('dashboard');
  };

  // Handle updates from Settings
  const handleUpdateOrganization = async (updatedOrg: Organization) => {
    try {
      await updateOrganizationRecord(updatedOrg);
      setRecords((prev) =>
        prev.map((r) =>
          r.organization.id === updatedOrg.id ? { ...r, organization: updatedOrg } : r
        )
      );
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to save changes to Firestore.');
    }
  };

  const handleUpdateProfileLegacy = (updated: Partial<MSMEProfile>) => {
    // Legacy support for simple profile field edits
    if (activeOrg) {
      const modified: Organization = {
        ...activeOrg,
        name: updated.name ?? activeOrg.name,
        businessProfile: {
          ...activeOrg.businessProfile,
          businessName: updated.name ?? activeOrg.businessProfile.businessName,
          location: updated.location ?? activeOrg.businessProfile.location,
          numberOfEmployees: typeof updated.employees === 'number' ? updated.employees : activeOrg.businessProfile.numberOfEmployees,
        },
        updatedAt: new Date().toISOString(),
      };
      void handleUpdateOrganization(modified);
    }
  };

  // Render the active dashboard module with real calculated analysis
  const renderActiveDashboardView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ExecutiveDashboard
            profile={currentProfile}
            analysis={analysis}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenPassport={() => setIsPassportModalOpen(true)}
          />
        );

      case 'financial-health':
        return (
          <FinancialHealthView
            profile={currentProfile}
            analysis={analysis}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );

      case 'cash-flow':
        return (
          <CashFlowForecastView
            profile={currentProfile}
            analysis={analysis}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );

      case 'funding-readiness':
        return (
          <FundingReadinessView
            profile={currentProfile}
            analysis={analysis}
            onOpenPassport={() => setIsPassportModalOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );

      case 'credit-passport':
        return (
          <MSMECreditPassportView
            profile={currentProfile}
            analysis={analysis}
            onOpenModal={() => setIsPassportModalOpen(true)}
          />
        );

      case 'what-if-simulator':
        return (
          <WhatIfSimulatorView
            profile={currentProfile}
            analysis={analysis}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );

      case 'growth-intelligence':
        return (
          <GrowthIntelligenceView
            profile={currentProfile}
            analysis={analysis}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );

      case 'ai-assistant':
        return (
          <AIAssistantView
            profile={currentProfile}
            analysis={analysis}
            currentLanguage={currentLanguage}
            onSelectLanguage={setCurrentLanguage}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );

      case 'reports':
        return (
          <ReportsView
            profile={currentProfile}
            analysis={analysis}
            onOpenPassport={() => setIsPassportModalOpen(true)}
          />
        );

      case 'settings':
        return (
          <SettingsView
            profile={currentProfile}
            organization={activeOrg}
            analysis={analysis}
            onUpdateProfile={handleUpdateProfileLegacy}
            onUpdateOrganization={handleUpdateOrganization}
          />
        );

      default:
        return (
          <ExecutiveDashboard
            profile={currentProfile}
            analysis={analysis}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenPassport={() => setIsPassportModalOpen(true)}
          />
        );
    }
  };

  // Onboarding screen overlay
  if (showOnboarding) {
    return (
      <OnboardingWizard
        onExit={() => setShowOnboarding(false)}
        onGoToDashboard={async () => {
          const loaded = await loadOrganizationRecords();
          setRecords(loaded);
          if (loaded.length > 0) {
            setSelectedOrgId(loaded[0].organization.id);
            void saveSelectedOrganizationId(loaded[0].organization.id);
          }
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
      
      {/* Header */}
      <Header
        currentProfile={currentProfile}
        profiles={allProfiles}
        onSelectProfile={handleSelectProfile}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
        isAppMode={isAppMode}
        onToggleAppMode={setIsAppMode}
        onOpenCreditPassport={() => setIsPassportModalOpen(true)}
        onStartOnboarding={() => setShowOnboarding(true)}
      />

      {dataError && (
        <div className="border-b border-rose-500/30 bg-rose-950/40 px-4 py-2 text-center text-xs text-rose-200">
          {dataError}
        </div>
      )}

      {/* Main Content */}
      {!isAppMode ? (
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
        <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            fundingScore={analysis.funding.overallScore}
          />

          {/* Dashboard Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
            {renderActiveDashboardView()}
          </main>
        </div>
      )}

      {/* Footer (Landing mode only) */}
      {!isAppMode && <Footer />}

      {/* Credit Passport Modal */}
      <CreditPassportModal
        isOpen={isPassportModalOpen}
        onClose={() => setIsPassportModalOpen(false)}
        profile={currentProfile}
        analysis={analysis}
      />
    </div>
  );
};

export default App;