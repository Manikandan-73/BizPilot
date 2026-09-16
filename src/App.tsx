import React, { useEffect, useMemo, useState } from 'react';
import {
  NavigationTab,
  LanguageCode,
  MSMEProfile
} from './types';
import { Organization, OnboardingRecord } from './types/business';
import { analyzeOrganization } from './analytics/financialAnalysis';
import { DEMO_ORGANIZATIONS } from './analytics/demoOrganizations';
import {
  loadOrganizationsByOwnerId,
  loadSelectedUserOrgId,
  saveSelectedUserOrgId,
  updateOrganizationRecord,
} from './services/organizationService';
import { formatINR } from './lib/currency';

import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { CreditPassportModal } from './components/common/CreditPassportModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './i18n/LanguageContext';
import { Sparkles, AlertTriangle } from 'lucide-react';

// Dashboard Views
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { FinancialHealthView } from './components/dashboard/FinancialHealthView';
import { CashFlowForecastView } from './components/dashboard/CashFlowForecastView';
import { FundingReadinessView } from './components/dashboard/FundingReadinessView';
import { MSMECreditPassportView } from './components/dashboard/MSMECreditPassportView';
import { WhatIfSimulatorView } from './components/dashboard/WhatIfSimulatorView';
import { DecisionLabView } from './components/dashboard/DecisionLabView';
import { AIBusinessAdvisorView } from './components/dashboard/AIBusinessAdvisorView';
import { GrowthIntelligenceView } from './components/dashboard/GrowthIntelligenceView';
import { AIAssistantView } from './components/dashboard/AIAssistantView';
import { ReportsView } from './components/dashboard/ReportsView';
import { SettingsView } from './components/dashboard/SettingsView';
import { SubscriptionPage } from './components/subscription/SubscriptionPage';
import { isSubscriptionActive, hasFeature, canAccessPlatform } from './config/plans';

export const App: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, loading: authLoading, logout, isAdmin } = useAuth();

  const [authView, setAuthView] = useState<'none' | 'login' | 'register'>('none');
  const [adminWorkspacePreview, setAdminWorkspacePreview] = useState<boolean>(false);
  const [isAppMode, setIsAppMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isPassportModalOpen, setIsPassportModalOpen] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Authenticated MSME organizations state (supports multiple startups per account)
  const [userOrgs, setUserOrgs] = useState<Organization[]>([]);
  const [activeUserOrgId, setActiveUserOrgId] = useState<string | null>(null);
  const [orgLoading, setOrgLoading] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Demo fallback state (only for unauthenticated demo preview)
  const [selectedDemoOrgId, setSelectedDemoOrgId] = useState<string>(DEMO_ORGANIZATIONS[0].id);

  // Fetch all organizations owned by the authenticated user
  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setUserOrgs([]);
      setActiveUserOrgId(null);
      return;
    }

    const fetchUserOrganizations = async () => {
      setOrgLoading(true);
      setDataError(null);
      try {
        const records = await loadOrganizationsByOwnerId(user.uid);
        if (!cancelled) {
          if (records.length > 0) {
            const orgs = records.map((r) => r.organization);
            setUserOrgs(orgs);
            
            // Restore previously selected startup or default to first
            const savedId = loadSelectedUserOrgId(user.uid);
            const matched = orgs.find((o) => o.id === savedId);
            const chosenId = matched ? matched.id : orgs[0].id;
            setActiveUserOrgId(chosenId);

            setIsAppMode(true);
            setShowOnboarding(false);
          } else {
            // New user without any organization yet -> prompt onboarding for MSMEs only
            setUserOrgs([]);
            setActiveUserOrgId(null);
            if (!isAdmin) {
              setShowOnboarding(true);
            }
          }
        }
      } catch (error: any) {
        if (!cancelled) {
          setDataError(error instanceof Error ? error.message : 'Unable to connect to your business records.');
        }
      } finally {
        if (!cancelled) {
          setOrgLoading(false);
        }
      }
    };

    void fetchUserOrganizations();

    return () => {
      cancelled = true;
    };
  }, [user?.uid, isAdmin]);

  // The active organization:
  // For authenticated MSMEs: strictly the user's active startup among userOrgs
  // For unauthenticated demo preview: selected demo organization
  const activeOrg: Organization = useMemo(() => {
    if (user) {
      if (userOrgs.length > 0) {
        const found = userOrgs.find((o) => o.id === activeUserOrgId);
        if (found) return found;
        return userOrgs[0];
      }
      // If user is logged in but has no org yet, return dummy placeholder while wizard loads
      return {
        id: `pending-${user.uid}`,
        name: user.displayName || 'My MSME',
        ownerId: user.uid,
        ownerEmail: user.email || '',
        businessProfile: {
          businessName: user.displayName || 'My MSME',
          businessType: 'Sole Proprietorship',
          industry: 'General',
          location: 'India',
          yearEstablished: 2024,
          numberOfEmployees: 5,
          annualTurnover: 0,
        },
        financialProfile: {
          monthlyRevenue: 0,
          monthlyOperatingExpenses: 0,
          monthlyMaterialCost: 0,
          monthlySalaryCost: 0,
          currentCashBalance: 0,
          accountsReceivable: 0,
          accountsPayable: 0,
          inventoryValue: 0,
        },
        debtProfile: {
          hasLoans: false,
          loanDetails: null,
          gstRegistered: false,
          itrAvailable: false,
          hasBusinessBankAccount: false,
        },
        complianceProfile: {
          gstRegistered: false,
          itrAvailable: false,
          hasBusinessBankAccount: false,
        },
        goals: {
          goals: ['Improve Cash Flow'],
          biggestChallenge: 'Cash Flow',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const demo = DEMO_ORGANIZATIONS.find((d) => d.id === selectedDemoOrgId);
    return demo || DEMO_ORGANIZATIONS[0];
  }, [user, userOrgs, activeUserOrgId, selectedDemoOrgId]);

  // SINGLE CENTRAL ANALYSIS ENGINE EXECUTION
  const analysis = useMemo(() => {
    return analyzeOrganization(activeOrg);
  }, [activeOrg]);

  // Dynamic MSMEProfile synthesized from activeOrg and calculated analysis
  const currentProfile: MSMEProfile = useMemo(() => {
    const turnoverNum = typeof activeOrg.businessProfile.annualTurnover === 'number'
      ? activeOrg.businessProfile.annualTurnover
      : analysis.financials.annualRevenue;

    // Grounded MSME Profile: No fabricated GSTIN, Udyam, growth, DSCR or runway fallbacks
    const hasUdyam = Boolean((activeOrg.businessProfile as any)?.udyamNumber || (activeOrg.complianceProfile as any)?.udyamRegistration);
    const udyamVal = hasUdyam ? ((activeOrg.businessProfile as any)?.udyamNumber || 'Registered') : null;
    const gstinVal = (activeOrg.businessProfile as any)?.gstin || (activeOrg.complianceProfile as any)?.gstin || (activeOrg.complianceProfile?.gstRegistered ? 'GST-Registered' : null);

    return {
      id: activeOrg.id,
      name: activeOrg.businessProfile.businessName || activeOrg.name,
      industry: activeOrg.businessProfile.industry || 'Enterprise',
      sector: activeOrg.businessProfile.businessType || 'MSME',
      udyamNumber: udyamVal,
      gstin: gstinVal,
      incorporationYear: typeof activeOrg.businessProfile.yearEstablished === 'number' 
        ? activeOrg.businessProfile.yearEstablished 
        : (activeOrg.businessProfile.yearEstablished ? Number(activeOrg.businessProfile.yearEstablished) : null),
      location: activeOrg.businessProfile.location || 'India',
      employees: typeof activeOrg.businessProfile.numberOfEmployees === 'number' 
        ? activeOrg.businessProfile.numberOfEmployees 
        : (activeOrg.businessProfile.numberOfEmployees ? Number(activeOrg.businessProfile.numberOfEmployees) : null),
      turnover: formatINR(turnoverNum),
      creditScore: Math.round(550 + (analysis.health.overallScore * 2.5)),
      healthScore: analysis.health.overallScore,
      fundingReadinessScore: analysis.funding.overallScore,
      revenueGrowth: null, // Deterministic: No historical revenue comparison recorded; do not fabricate from operating margin
      cashFlowStability: analysis.health.overallScore,
      loanEligibility: analysis.funding.eligibilityTier,
      estimatedCreditLimit: analysis.funding.estimatedCreditLimit,
      dscrRatio: analysis.financials.dscr,
      runwayMonths: analysis.financials.runwayMonths,
    };
  }, [activeOrg, analysis]);

  // Profiles list passed to Header:
  // For authenticated MSMEs: strictly ALL organizations owned by this user
  // For unauthenticated demo preview: all demo profiles
  const allProfiles: MSMEProfile[] = useMemo(() => {
    if (user) {
      if (userOrgs.length === 0) {
        return [currentProfile];
      }
      return userOrgs.map((org) => {
        const orgAnalysis = org.id === activeOrg.id ? analysis : analyzeOrganization(org);
        const turnoverNum = typeof org.businessProfile.annualTurnover === 'number'
          ? org.businessProfile.annualTurnover
          : orgAnalysis.financials.annualRevenue;

        const hasUdyam = Boolean((org.businessProfile as any)?.udyamNumber || (org.complianceProfile as any)?.udyamRegistration);
        const udyamVal = hasUdyam ? ((org.businessProfile as any)?.udyamNumber || 'Registered') : null;
        const gstinVal = (org.businessProfile as any)?.gstin || (org.complianceProfile as any)?.gstin || (org.complianceProfile?.gstRegistered ? 'GST-Registered' : null);

        return {
          id: org.id,
          name: org.businessProfile.businessName || org.name,
          industry: org.businessProfile.industry || 'Enterprise',
          sector: org.businessProfile.businessType || 'MSME',
          udyamNumber: udyamVal,
          gstin: gstinVal,
          incorporationYear: typeof org.businessProfile.yearEstablished === 'number' 
            ? org.businessProfile.yearEstablished 
            : (org.businessProfile.yearEstablished ? Number(org.businessProfile.yearEstablished) : null),
          location: org.businessProfile.location || 'India',
          employees: typeof org.businessProfile.numberOfEmployees === 'number' 
            ? org.businessProfile.numberOfEmployees 
            : (org.businessProfile.numberOfEmployees ? Number(org.businessProfile.numberOfEmployees) : null),
          turnover: formatINR(turnoverNum),
          creditScore: Math.round(550 + (orgAnalysis.health.overallScore * 2.5)),
          healthScore: orgAnalysis.health.overallScore,
          fundingReadinessScore: orgAnalysis.funding.overallScore,
          revenueGrowth: null,
          cashFlowStability: orgAnalysis.health.overallScore,
          loanEligibility: orgAnalysis.funding.eligibilityTier,
          estimatedCreditLimit: orgAnalysis.funding.estimatedCreditLimit,
          dscrRatio: orgAnalysis.financials.dscr,
          runwayMonths: orgAnalysis.financials.runwayMonths,
        };
      });
    }

    // Unauthenticated visitors preview demo profiles
    return DEMO_ORGANIZATIONS.map((org) => {
      const orgAnalysis = analyzeOrganization(org);
      const turnoverNum = typeof org.businessProfile.annualTurnover === 'number'
        ? org.businessProfile.annualTurnover
        : orgAnalysis.financials.annualRevenue;

      const hasUdyam = Boolean((org.businessProfile as any)?.udyamNumber);
      const udyamVal = hasUdyam ? ((org.businessProfile as any)?.udyamNumber) : null;
      const gstinVal = (org.businessProfile as any)?.gstin || (org.complianceProfile?.gstRegistered ? 'GST-Registered' : null);

      return {
        id: org.id,
        name: org.businessProfile.businessName || org.name,
        industry: org.businessProfile.industry || 'Enterprise',
        sector: org.businessProfile.businessType || 'MSME',
        udyamNumber: udyamVal,
        gstin: gstinVal,
        incorporationYear: typeof org.businessProfile.yearEstablished === 'number' 
          ? org.businessProfile.yearEstablished 
          : (org.businessProfile.yearEstablished ? Number(org.businessProfile.yearEstablished) : null),
        location: org.businessProfile.location || 'India',
        employees: typeof org.businessProfile.numberOfEmployees === 'number' 
          ? org.businessProfile.numberOfEmployees 
          : (org.businessProfile.numberOfEmployees ? Number(org.businessProfile.numberOfEmployees) : null),
        turnover: formatINR(turnoverNum),
        creditScore: Math.round(550 + (orgAnalysis.health.overallScore * 2.5)),
        healthScore: orgAnalysis.health.overallScore,
        fundingReadinessScore: orgAnalysis.funding.overallScore,
        revenueGrowth: null,
        cashFlowStability: orgAnalysis.health.overallScore,
        loanEligibility: orgAnalysis.funding.eligibilityTier,
        estimatedCreditLimit: orgAnalysis.funding.estimatedCreditLimit,
        dscrRatio: orgAnalysis.financials.dscr,
        runwayMonths: orgAnalysis.financials.runwayMonths,
      };
    });
  }, [user, userOrgs, activeOrg.id, currentProfile, analysis]);

  // Handle switching active organization
  const handleSelectProfile = (profile: MSMEProfile) => {
    if (user) {
      // Phase 8 Hardening: User can ONLY switch to an organization they actually own
      const isOwned = userOrgs.some((o) => o.id === profile.id);
      if (isOwned) {
        setActiveUserOrgId(profile.id);
        saveSelectedUserOrgId(user.uid, profile.id);
        setIsAppMode(true);
        setActiveTab('dashboard');
      } else {
        console.warn('Security Warning: Attempted unauthorized switch to non-owned organization:', profile.id);
      }
    } else {
      // Unauthenticated visitor selecting demo profile
      const isDemo = DEMO_ORGANIZATIONS.some((d) => d.id === profile.id);
      if (isDemo) {
        setSelectedDemoOrgId(profile.id);
        setIsAppMode(true);
        setActiveTab('dashboard');
      }
    }
  };

  // Handle updates from Settings
  const handleUpdateOrganization = async (updatedOrg: Organization) => {
    try {
      if (user) {
        updatedOrg.ownerId = user.uid;
        updatedOrg.ownerEmail = user.email || undefined;
      }
      await updateOrganizationRecord(updatedOrg);
      if (user) {
        setUserOrgs((prev) => prev.map((o) => (o.id === updatedOrg.id ? updatedOrg : o)));
      }
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to save changes to Firestore.');
    }
  };

  const handleUpdateProfileLegacy = (updated: Partial<MSMEProfile>) => {
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

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout();
      setUserOrgs([]);
      setActiveUserOrgId(null);
      setAdminWorkspacePreview(false);
      setShowOnboarding(false);
      setIsAppMode(false);
      setAuthView('login');
      setActiveTab('dashboard');
    } catch (err: any) {
      setDataError(err.message || 'Logout failed.');
    }
  };

  // Render the active dashboard module
  const renderActiveDashboardView = () => {
    // STRICT ACCESS GUARD:
    // If authenticated MSME does not have an active verified subscription,
    // block all dashboard views and redirect immediately to the subscription/payment completion view.
    if (user && !isAdmin && !canAccessPlatform(user, activeOrg?.subscription, isAdmin) && activeTab !== 'billing' && activeTab !== 'subscription') {
      return (
        <SubscriptionPage
          organization={activeOrg}
          uid={user?.uid}
          userEmail={user?.email}
          userName={user?.displayName}
          onSubscriptionUpdated={(newSub) => {
            if (activeOrg) {
              const updatedOrg: Organization = {
                ...activeOrg,
                subscription: newSub,
                accessStatus: 'active',
                updatedAt: new Date().toISOString(),
              };
              setUserOrgs((prev) =>
                prev.map((o) => (o.id === updatedOrg.id ? updatedOrg : o))
              );
            }
          }}
          onContinueToDashboard={() => setActiveTab('dashboard')}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <ExecutiveDashboard
            profile={currentProfile}
            analysis={analysis}
            organization={activeOrg}
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
            organization={activeOrg}
            onOpenPassport={() => setIsPassportModalOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );

      case 'credit-passport':
        return (
          <MSMECreditPassportView
            profile={currentProfile}
            analysis={analysis}
            organization={activeOrg}
            onOpenModal={() => setIsPassportModalOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );

      case 'decision-lab':
        return (
          <DecisionLabView
            profile={currentProfile}
            analysis={analysis}
            organization={activeOrg}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );

      case 'ai-advisor':
        return (
          <AIBusinessAdvisorView
            profile={currentProfile}
            analysis={analysis}
            organization={activeOrg}
            onNavigate={(tab) => setActiveTab(tab)}
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
            organization={activeOrg}
            currentLanguage={language}
            onSelectLanguage={(lang) => setLanguage(lang as 'en' | 'ta')}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );

      case 'reports':
        return (
          <ReportsView
            profile={currentProfile}
            analysis={analysis}
            organization={activeOrg}
            onNavigate={(tab) => setActiveTab(tab)}
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

      case 'billing':
      case 'subscription':
        return (
          <SubscriptionPage
            organization={activeOrg}
            uid={user?.uid}
            userEmail={user?.email}
            userName={user?.displayName}
            onSubscriptionUpdated={(newSub) => {
              if (activeOrg) {
                const updatedOrg: Organization = {
                  ...activeOrg,
                  subscription: newSub,
                  updatedAt: new Date().toISOString(),
                };
                setUserOrgs((prev) =>
                  prev.map((o) => (o.id === updatedOrg.id ? updatedOrg : o))
                );
              }
            }}
            onContinueToDashboard={() => setActiveTab('dashboard')}
          />
        );

      default:
        // If MSME user has expired or no active subscription, gate dashboard views and prompt subscription
        if (user && !isAdmin && !isSubscriptionActive(activeOrg?.subscription)) {
          return (
            <SubscriptionPage
              organization={activeOrg}
              uid={user?.uid}
              userEmail={user?.email}
              userName={user?.displayName}
              onSubscriptionUpdated={(newSub) => {
                if (activeOrg) {
                  const updatedOrg: Organization = {
                    ...activeOrg,
                    subscription: newSub,
                    updatedAt: new Date().toISOString(),
                  };
                  setUserOrgs((prev) =>
                    prev.map((o) => (o.id === updatedOrg.id ? updatedOrg : o))
                  );
                }
              }}
              onContinueToDashboard={() => setActiveTab('dashboard')}
            />
          );
        }

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

  // Full-screen session loading indicator
  if (authLoading || (user && !isAdmin && orgLoading && userOrgs.length === 0 && !showOnboarding)) {
    return (
      <div className="min-h-screen bg-[#090B10] flex flex-col items-center justify-center text-[#F8FAFC] p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center text-white shadow-xl shadow-[#8B5CF6]/25 animate-pulse mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <div className="text-base font-bold text-[#F8FAFC] tracking-tight">
          BizPilot <span className="text-[#8B5CF6]">AI</span>
        </div>
        <p className="text-xs text-[#707A8C] mt-1">
          {language === 'ta' ? 'அமர்வை ஏற்றுகிறது...' : 'Loading workspace...'}
        </p>
      </div>
    );
  }

  // Explicit Login View
  if (!user && authView === 'login') {
    return (
      <LoginPage
        onSuccess={() => {
          setAuthView('none');
        }}
        onSwitchToRegister={() => setAuthView('register')}
        onGoHome={() => {
          setAuthView('none');
          setIsAppMode(false);
        }}
      />
    );
  }

  // Explicit Registration View (Stage A: Account Creation)
  if (authView === 'register') {
    return (
      <RegisterPage
        onSuccess={() => {
          setAuthView('none');
          // Once Firebase account is created, transition directly to Stage B — MSME Onboarding
          setShowOnboarding(true);
        }}
        onSwitchToLogin={() => setAuthView('login')}
        onGoHome={() => {
          setAuthView('none');
          setIsAppMode(false);
        }}
      />
    );
  }

  // Onboarding screen overlay - Strictly requires authenticated Firebase user (Stage B)
  if (showOnboarding) {
    if (!user) {
      // Unauthenticated access strictly blocked: redirect to Registration
      return (
        <RegisterPage
          onSuccess={() => {
            setAuthView('none');
            setShowOnboarding(true);
          }}
          onSwitchToLogin={() => setAuthView('login')}
          onGoHome={() => {
            setShowOnboarding(false);
            setAuthView('none');
            setIsAppMode(false);
          }}
        />
      );
    }

    return (
      <OnboardingWizard
        onExit={() => {
          setShowOnboarding(false);
          if (!user) setIsAppMode(false);
        }}
        onGoToDashboard={async () => {
          if (user) {
            const records = await loadOrganizationsByOwnerId(user.uid);
            if (records.length > 0) {
              const orgs = records.map((r) => r.organization);
              setUserOrgs(orgs);
              const newOrgId = records[0].organization.id;
              setActiveUserOrgId(newOrgId);
              saveSelectedUserOrgId(user.uid, newOrgId);
            }
          }
          setShowOnboarding(false);
          setIsAppMode(true);
          setActiveTab('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  // Role-based routing: Admin User Dashboard vs MSME User Dashboard
  if (user && isAdmin && !adminWorkspacePreview) {
    return (
      <AdminDashboard
        onSwitchToUserWorkspace={() => {
          setAdminWorkspacePreview(true);
          setIsAppMode(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#090B10] text-[#F8FAFC] font-sans">
      
      {/* Header */}
      <Header
        currentProfile={currentProfile}
        profiles={allProfiles}
        onSelectProfile={handleSelectProfile}
        currentLanguage={language}
        onSelectLanguage={(lang) => setLanguage(lang as 'en' | 'ta')}
        isAppMode={isAppMode}
        onToggleAppMode={(appMode) => {
          setIsAppMode(appMode);
        }}
        onOpenCreditPassport={() => setIsPassportModalOpen(true)}
        onStartOnboarding={() => setShowOnboarding(true)}
        isAuthenticated={!!user}
        userEmail={user?.email}
        userName={user?.displayName}
        onLogout={handleLogout}
        onOpenLogin={() => setAuthView('login')}
        onOpenRegister={() => setAuthView('register')}
        isAdmin={isAdmin}
        onOpenAdminPortal={() => setAdminWorkspacePreview(false)}
      />

      {dataError && (
        <div className="border-b border-rose-500/30 bg-rose-950/40 px-4 py-2 text-center text-xs text-rose-300 font-medium">
          {dataError}
        </div>
      )}

      {/* Account status alert banner for suspended MSME accounts */}
      {user && !isAdmin && activeOrg?.subscription?.status === 'suspended' && (
        <div className="border-b border-rose-500/30 bg-rose-950/40 px-4 py-2.5 text-center text-xs text-rose-300 flex items-center justify-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{t('settings.accountSuspendedBanner', 'Your account is currently suspended. Please contact admin@bizpilot.in to restore access.')}</span>
        </div>
      )}

      {/* Account status alert banner for expired MSME subscriptions */}
      {user && !isAdmin && activeOrg?.subscription?.status === 'expired' && (
        <div className="border-b border-amber-500/30 bg-amber-950/40 px-4 py-2.5 text-center text-xs text-amber-300 flex items-center justify-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{t('settings.subscriptionExpiredBanner', 'Your subscription plan has expired. Please contact administration to renew.')}</span>
        </div>
      )}

      {/* Main Content */}
      {!isAppMode ? (
        <main className="flex-1">
          <LandingPage
            onLaunchDemo={() => {
              if (user && userOrgs.length > 0) {
                setIsAppMode(true);
              } else if (user && userOrgs.length === 0) {
                setShowOnboarding(true);
              } else {
                // Launch unauthenticated demo mode
                setIsAppMode(true);
              }
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenCreditPassport={() => setIsPassportModalOpen(true)}
            onStartTrial={() => setAuthView('register')}
          />
        </main>
      ) : (
        // Phase 8 Subscription Gate: If user is authenticated MSME but has no active paid subscription,
        // render full-screen subscription payment gateway without sidebar access.
        user && !isAdmin && !canAccessPlatform(user, activeOrg?.subscription, isAdmin) ? (
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl mx-auto w-full">
            {renderActiveDashboardView()}
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
        )
      )}

      {/* Footer (Landing mode only) */}
      {!isAppMode && <Footer />}

      {/* Credit Passport Modal */}
      <CreditPassportModal
        isOpen={isPassportModalOpen}
        onClose={() => setIsPassportModalOpen(false)}
        profile={currentProfile}
        analysis={analysis}
        organization={activeOrg}
        onNavigate={(tab) => {
          setIsPassportModalOpen(false);
          setActiveTab(tab);
        }}
      />
    </div>
  );
};

export default App;