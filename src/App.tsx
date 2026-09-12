import React, { useEffect, useState } from 'react';
import {
  NavigationTab,
  LanguageCode,
  MSMEProfile
} from './types';

import { PROFILES } from './data/mockData';
import {
  loadOrganizationRecords,
  loadSelectedOrganizationId,
  saveSelectedOrganizationId,
  updateOrganizationRecord
} from './lib/onboardingStorage';
import { OnboardingRecord } from './types/onboarding';

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

  const [activeTab, setActiveTab] =
    useState<NavigationTab>('dashboard');

  const [currentProfile, setCurrentProfile] =
    useState<MSMEProfile>(PROFILES[0]);

  const [currentLanguage, setCurrentLanguage] =
    useState<LanguageCode>('en');

  const [isPassportModalOpen, setIsPassportModalOpen] =
    useState<boolean>(false);

  const [showOnboarding, setShowOnboarding] =
    useState<boolean>(false);

  const [allProfiles, setAllProfiles] =
    useState<MSMEProfile[]>(PROFILES);
  const [organizations, setOrganizations] = useState<OnboardingRecord[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  /*
   * Convert saved onboarding data into the profile format
   * already used by the dashboard.
   */
  const createProfileFromSavedBusiness = (
    record: OnboardingRecord,
    previousProfile: MSMEProfile = PROFILES[0]
  ): MSMEProfile | null => {
    if (!record) return null;

    const business = record.organization.businessProfile;

    return {
      ...previousProfile,

      id: record.organization.id,

      name:
        business.businessName ||
        previousProfile.name,

      industry:
        business.industry ||
        previousProfile.industry,

      sector:
        business.businessType ||
        previousProfile.sector,

      incorporationYear:
        typeof business.yearEstablished === 'number'
          ? business.yearEstablished
          : previousProfile.incorporationYear,

      location:
        business.location ||
        previousProfile.location,

      employees:
        typeof business.numberOfEmployees === 'number'
          ? business.numberOfEmployees
          : previousProfile.employees,

      turnover:
        typeof business.annualTurnover === 'number'
          ? `₹${business.annualTurnover.toLocaleString('en-IN')}`
          : previousProfile.turnover,

      /*
       * These values still use the existing demo values.
       * We will make these real from the financial data next.
       */
      udyamNumber:
        previousProfile.udyamNumber,

      gstin:
        previousProfile.gstin,

      creditScore:
        previousProfile.creditScore,

      healthScore:
        previousProfile.healthScore,

      fundingReadinessScore:
        previousProfile.fundingReadinessScore,

      revenueGrowth:
        previousProfile.revenueGrowth,

      cashFlowStability:
        previousProfile.cashFlowStability,

      loanEligibility:
        previousProfile.loanEligibility,

      estimatedCreditLimit:
        previousProfile.estimatedCreditLimit,

      dscrRatio:
        previousProfile.dscrRatio,

      runwayMonths:
        previousProfile.runwayMonths
    };
  };

  /*
   * Load saved business whenever the application starts.
   */
  useEffect(() => {
    const loadSavedOrganizations = async () => {
      try {
        setDataError(null);
        const records = await loadOrganizationRecords();
        setOrganizations(records);
        if (records.length === 0) return;

        const selectedId = await loadSelectedOrganizationId();
        const selectedRecord = records.find((record) => record.organization.id === selectedId) ?? records[0];
        const savedProfile = createProfileFromSavedBusiness(selectedRecord);
        setCurrentProfile(savedProfile ?? PROFILES[0]);
        setAllProfiles([
          ...records.map((record) => createProfileFromSavedBusiness(record)).filter((profile): profile is MSMEProfile => profile !== null),
          ...PROFILES.filter((profile) => !records.some((record) => record.organization.id === profile.id)),
        ]);
        setIsAppMode(true);
        setActiveTab('dashboard');
      } catch (error) {
        setDataError(error instanceof Error ? error.message : 'Unable to load your businesses.');
      }
    };

    loadSavedOrganizations();
  }, []);

  /*
   * Update the current profile.
   * Also save the changes back to the selected Firestore organization.
   */
  const handleUpdateProfile = async (
    updated: Partial<MSMEProfile>
  ) => {
    setCurrentProfile((prev) => ({
      ...prev,
      ...updated
    }));

    /*
     * Update the profile shown in the dropdown as well.
     */
    setAllProfiles((prevProfiles) =>
      prevProfiles.map((profile) =>
        profile.id === currentProfile.id
          ? {
              ...profile,
              ...updated
            }
          : profile
      )
    );

    /*
     * Persist editable business information.
     */
    const record = organizations.find((item) => item.organization.id === currentProfile.id);
    if (!record) return;

    const business = record.organization.businessProfile;

    const turnoverNumber =
      typeof updated.turnover === 'string'
        ? Number(
            updated.turnover.replace(/[^\d.]/g, '')
          )
        : business.annualTurnover;

    record.organization.businessProfile = {
      ...business,

      businessName:
        updated.name ??
        business.businessName,

      location:
        updated.location ??
        business.location,

      numberOfEmployees:
        typeof updated.employees === 'number'
          ? updated.employees
          : business.numberOfEmployees,

      annualTurnover:
        Number.isFinite(turnoverNumber)
          ? turnoverNumber
          : business.annualTurnover
    };

    record.organization.name =
      record.organization.businessProfile.businessName;

    record.organization.updatedAt = new Date().toISOString();
    try {
      await updateOrganizationRecord(record.organization);
      setOrganizations((previous) => previous.map((item) => item.organization.id === record.organization.id ? record : item));
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to save business changes.');
    }
  };

  /*
   * Render the active dashboard page.
   */
  const renderActiveDashboardView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ExecutiveDashboard
            profile={currentProfile}
            onNavigate={(tab) =>
              setActiveTab(tab)
            }
            onOpenPassport={() =>
              setIsPassportModalOpen(true)
            }
          />
        );

      case 'financial-health':
        return (
          <FinancialHealthView
            profile={currentProfile}
            onNavigate={(tab) =>
              setActiveTab(tab)
            }
          />
        );

      case 'cash-flow':
        return (
          <CashFlowForecastView
            profile={currentProfile}
            onNavigate={(tab) =>
              setActiveTab(tab)
            }
          />
        );

      case 'funding-readiness':
        return (
          <FundingReadinessView
            profile={currentProfile}
            onOpenPassport={() =>
              setIsPassportModalOpen(true)
            }
            onNavigate={(tab) =>
              setActiveTab(tab)
            }
          />
        );

      case 'credit-passport':
        return (
          <MSMECreditPassportView
            profile={currentProfile}
            onOpenModal={() =>
              setIsPassportModalOpen(true)
            }
          />
        );

      case 'what-if-simulator':
        return (
          <WhatIfSimulatorView
            profile={currentProfile}
            onNavigate={(tab) =>
              setActiveTab(tab)
            }
          />
        );

      case 'growth-intelligence':
        return (
          <GrowthIntelligenceView
            profile={currentProfile}
            onNavigate={(tab) =>
              setActiveTab(tab)
            }
          />
        );

      case 'ai-assistant':
        return (
          <AIAssistantView
            profile={currentProfile}
            currentLanguage={currentLanguage}
            onSelectLanguage={setCurrentLanguage}
            onNavigate={(tab) =>
              setActiveTab(tab)
            }
          />
        );

      case 'reports':
        return (
          <ReportsView
            profile={currentProfile}
            onOpenPassport={() =>
              setIsPassportModalOpen(true)
            }
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
            onNavigate={(tab) =>
              setActiveTab(tab)
            }
            onOpenPassport={() =>
              setIsPassportModalOpen(true)
            }
          />
        );
    }
  };

  /*
   * Onboarding screen
   */
  if (showOnboarding) {
    return (
      <OnboardingWizard
        onExit={() =>
          setShowOnboarding(false)
        }

        onGoToDashboard={async () => {
          const records = await loadOrganizationRecords();
          setOrganizations(records);
          const record = records[0];
          if (record) {
            const savedProfile = createProfileFromSavedBusiness(record, currentProfile);
            if (savedProfile) setCurrentProfile(savedProfile);
            setAllProfiles([
              ...records.map((item) => createProfileFromSavedBusiness(item)).filter((profile): profile is MSMEProfile => profile !== null),
              ...PROFILES.filter((profile) => !records.some((item) => item.organization.id === profile.id)),
            ]);
          }

          setShowOnboarding(false);
          setIsAppMode(true);
          setActiveTab('dashboard');

          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
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
        onSelectProfile={(profile) => {
          setCurrentProfile(profile);
          void saveSelectedOrganizationId(profile.id);
          setIsAppMode(true);
          setActiveTab('dashboard');
        }}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
        isAppMode={isAppMode}
        onToggleAppMode={setIsAppMode}
        onOpenCreditPassport={() =>
          setIsPassportModalOpen(true)
        }
        onStartOnboarding={() =>
          setShowOnboarding(true)
        }
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

              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
            }}
            onOpenCreditPassport={() =>
              setIsPassportModalOpen(true)
            }
          />
        </main>
      ) : (
        <div className="flex-1 flex overflow-hidden">

          {/* Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);

              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
            }}
            fundingScore={
              currentProfile.fundingReadinessScore
            }
          />

          {/* Dashboard */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
            {renderActiveDashboardView()}
          </main>
        </div>
      )}

      {/* Footer */}
      {!isAppMode && <Footer />}

      {/* Credit Passport Modal */}
      <CreditPassportModal
        isOpen={isPassportModalOpen}
        onClose={() =>
          setIsPassportModalOpen(false)
        }
        profile={currentProfile}
      />
    </div>
  );
};

export default App;