import React, { useEffect, useState } from 'react';
import { MSMEProfile } from '../../types';
import { Organization, BusinessType, BUSINESS_TYPES } from '../../types/business';
import { BusinessAnalysis } from '../../types/business';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Settings2,
  Building2,
  Save,
  Coins,
  FileCheck2,
  Globe,
  Check,
  AlertTriangle,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SettingsViewProps {
  profile: MSMEProfile;
  organization?: Organization;
  analysis?: BusinessAnalysis;
  onUpdateProfile: (updated: Partial<MSMEProfile>) => void;
  onUpdateOrganization?: (updated: Organization) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  organization,
  onUpdateProfile,
  onUpdateOrganization
}) => {
  const { language, setLanguage, t } = useLanguage();

  // Business Profile Form
  const [businessName, setBusinessName] = useState(organization?.businessProfile.businessName || profile.name);
  const [businessType, setBusinessType] = useState<BusinessType | ''>(organization?.businessProfile.businessType || 'Private Limited');
  const [industry, setIndustry] = useState(organization?.businessProfile.industry || profile.industry);
  const [location, setLocation] = useState(organization?.businessProfile.location || profile.location);
  const [employees, setEmployees] = useState(organization?.businessProfile.numberOfEmployees ?? profile.employees);
  const [annualTurnover, setAnnualTurnover] = useState<number | ''>(organization?.businessProfile.annualTurnover ?? '');

  // Financial Profile Form
  const [monthlyRevenue, setMonthlyRevenue] = useState<number | ''>(organization?.financialProfile.monthlyRevenue ?? '');
  const [monthlyOperatingExpenses, setMonthlyOperatingExpenses] = useState<number | ''>(organization?.financialProfile.monthlyOperatingExpenses ?? '');
  const [monthlyMaterialCost, setMonthlyMaterialCost] = useState<number | ''>(organization?.financialProfile.monthlyMaterialCost ?? '');
  const [monthlySalaryCost, setMonthlySalaryCost] = useState<number | ''>(organization?.financialProfile.monthlySalaryCost ?? '');
  const [currentCashBalance, setCurrentCashBalance] = useState<number | ''>(organization?.financialProfile.currentCashBalance ?? '');
  const [accountsReceivable, setAccountsReceivable] = useState<number | ''>(organization?.financialProfile.accountsReceivable ?? '');
  const [accountsPayable, setAccountsPayable] = useState<number | ''>(organization?.financialProfile.accountsPayable ?? '');

  // Debt & Compliance
  const [hasLoans, setHasLoans] = useState<boolean>(organization?.debtProfile.hasLoans ?? false);
  const [outstandingLoanAmount, setOutstandingLoanAmount] = useState<number | ''>(organization?.debtProfile.loanDetails?.outstandingLoanAmount ?? '');
  const [monthlyEMI, setMonthlyEMI] = useState<number | ''>(organization?.debtProfile.loanDetails?.monthlyEMI ?? '');
  const [gstRegistered, setGstRegistered] = useState<boolean>(organization?.complianceProfile.gstRegistered ?? false);
  const [itrAvailable, setItrAvailable] = useState<boolean>(organization?.complianceProfile.itrAvailable ?? false);
  const [hasBusinessBankAccount, setHasBusinessBankAccount] = useState<boolean>(organization?.complianceProfile.hasBusinessBankAccount ?? false);

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (organization) {
      setBusinessName(organization.businessProfile.businessName || organization.name);
      setBusinessType(organization.businessProfile.businessType || 'Private Limited');
      setIndustry(organization.businessProfile.industry || '');
      setLocation(organization.businessProfile.location || '');
      setEmployees(organization.businessProfile.numberOfEmployees);
      setAnnualTurnover(organization.businessProfile.annualTurnover);

      setMonthlyRevenue(organization.financialProfile.monthlyRevenue);
      setMonthlyOperatingExpenses(organization.financialProfile.monthlyOperatingExpenses);
      setMonthlyMaterialCost(organization.financialProfile.monthlyMaterialCost);
      setMonthlySalaryCost(organization.financialProfile.monthlySalaryCost);
      setCurrentCashBalance(organization.financialProfile.currentCashBalance);
      setAccountsReceivable(organization.financialProfile.accountsReceivable);
      setAccountsPayable(organization.financialProfile.accountsPayable);

      setHasLoans(organization.debtProfile.hasLoans ?? false);
      setOutstandingLoanAmount(organization.debtProfile.loanDetails?.outstandingLoanAmount ?? '');
      setMonthlyEMI(organization.debtProfile.loanDetails?.monthlyEMI ?? '');

      setGstRegistered(organization.complianceProfile.gstRegistered);
      setItrAvailable(organization.complianceProfile.itrAvailable);
      setHasBusinessBankAccount(organization.complianceProfile.hasBusinessBankAccount);
    } else {
      setBusinessName(profile.name);
      setLocation(profile.location);
      setEmployees(profile.employees);
    }
    setIsSaved(false);
  }, [organization, profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (organization && onUpdateOrganization) {
        const updatedOrg: Organization = {
          ...organization,
          name: businessName,
          businessProfile: {
            ...organization.businessProfile,
            businessName,
            businessType,
            industry,
            location,
            numberOfEmployees: employees === '' ? '' : Number(employees),
            annualTurnover: annualTurnover === '' ? '' : Number(annualTurnover),
          },
          financialProfile: {
            ...organization.financialProfile,
            monthlyRevenue: monthlyRevenue === '' ? '' : Number(monthlyRevenue),
            monthlyOperatingExpenses: monthlyOperatingExpenses === '' ? '' : Number(monthlyOperatingExpenses),
            monthlyMaterialCost: monthlyMaterialCost === '' ? '' : Number(monthlyMaterialCost),
            monthlySalaryCost: monthlySalaryCost === '' ? '' : Number(monthlySalaryCost),
            currentCashBalance: currentCashBalance === '' ? '' : Number(currentCashBalance),
            accountsReceivable: accountsReceivable === '' ? '' : Number(accountsReceivable),
            accountsPayable: accountsPayable === '' ? '' : Number(accountsPayable),
          },
          debtProfile: {
            ...organization.debtProfile,
            hasLoans,
            loanDetails: hasLoans ? {
              outstandingLoanAmount: outstandingLoanAmount === '' ? '' : Number(outstandingLoanAmount),
              monthlyEMI: monthlyEMI === '' ? '' : Number(monthlyEMI),
              interestRate: organization.debtProfile.loanDetails?.interestRate ?? 10.5,
              remainingTenureMonths: organization.debtProfile.loanDetails?.remainingTenureMonths ?? 48,
            } : null,
            gstRegistered,
            itrAvailable,
            hasBusinessBankAccount,
          },
          complianceProfile: {
            gstRegistered,
            itrAvailable,
            hasBusinessBankAccount,
          },
          updatedAt: new Date().toISOString(),
        };

        await onUpdateOrganization(updatedOrg);
      }

      onUpdateProfile({
        name: businessName,
        location,
        employees: typeof employees === 'number' ? employees : Number(employees) || profile.employees,
        turnover: typeof annualTurnover === 'number' ? `₹${(annualTurnover / 10000000).toFixed(2)} Cr` : profile.turnover,
      });

      setIsSaved(true);
      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.7 }
      });
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 flex items-center justify-between shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
            <Settings2 className="w-4 h-4 text-purple-400" />
            <span>{t('settings.bannerTag', 'ORGANIZATION SETTINGS & PERSISTENCE')}</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            {t('settings.title', 'Business Profile & Financial Ledger')}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('settings.subtitle', 'Editing figures here updates Firestore and immediately recalibrates all analysis models across the platform.')}
          </p>
        </div>
      </div>

      {/* Subscription & Account Status Card */}
      {organization?.subscription && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30 shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Current Subscription
              </span>
              <div className="text-lg font-black text-white flex items-center gap-2 mt-0.5">
                <span>{organization.subscription.plan.replace('_', ' ').toUpperCase()}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  organization.accountStatus === 'suspended'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                    : organization.subscription.status === 'trial'
                    ? 'bg-sky-950/60 text-sky-300 border border-sky-500/30'
                    : organization.subscription.status === 'expired'
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {organization.accountStatus === 'suspended' ? 'Suspended' : organization.subscription.status}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400">Subscription Expiry</span>
              <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                {new Date(organization.subscription.expiryDate).toLocaleDateString()}
              </div>
              <span className="text-[10px] text-purple-300">
                Billing: {(organization.subscription.billingCycle || '30 days').toUpperCase()}
              </span>
            </div>
          </div>

          {organization.accountStatus === 'suspended' && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Your account has been suspended by the platform administrator. Please contact support@bizpilot.in.</span>
            </div>
          )}

          {organization.subscription.status === 'expired' && organization.accountStatus !== 'suspended' && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Your subscription has expired. Contact your administrator or renew your subscription to maintain uninterrupted services.</span>
            </div>
          )}
        </div>
      )}

      {/* Global Application Preferences (Language) */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
          <Globe className="w-4 h-4 text-purple-400" /> 
          {t('settings.preferencesTitle', 'Application Preferences (Global)')}
        </h3>

        {/* Language Preference */}
        <div className="space-y-2.5 max-w-md">
          <label className="block text-xs font-bold text-slate-300">
            {t('settings.selectLanguage', 'Platform Language')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`p-3.5 rounded-xl border text-left transition-all relative ${
                language === 'en'
                  ? 'border-purple-600 bg-purple-950/50 text-white shadow-sm ring-2 ring-purple-500/20'
                  : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">🇬🇧</span>
                {language === 'en' && <Check className="w-4 h-4 text-purple-400" />}
              </div>
              <div className="font-bold text-xs">{t('settings.english', 'English')}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">MSME Financial Terminology</div>
            </button>

            <button
              type="button"
              onClick={() => setLanguage('ta')}
              className={`p-3.5 rounded-xl border text-left transition-all relative ${
                language === 'ta'
                  ? 'border-purple-600 bg-purple-950/50 text-white shadow-sm ring-2 ring-purple-500/20'
                  : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">🇮🇳</span>
                {language === 'ta' && <Check className="w-4 h-4 text-purple-400" />}
              </div>
              <div className="font-bold text-xs">{t('settings.tamil', 'தமிழ் (Tamil)')}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">இயற்கையான தமிழ் நிதிச் சொற்கள்</div>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Business Identity */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building2 className="w-4 h-4 text-purple-400" /> 
            {t('settings.identityTitle', 'Business Identity & Structure')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t('settings.legalName', 'Business Legal Name')}
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t('settings.constitution', 'Legal Constitution')}
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-500"
              >
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t('settings.industryLabel', 'Industry / Domain')}
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t('settings.locationLabel', 'Location (City, State)')}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t('settings.employeesLabel', 'Number of Employees')}
              </label>
              <input
                type="number"
                value={employees}
                onChange={(e) => setEmployees(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-500"
                min={1}
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t('settings.turnoverLabel', 'Annual Turnover (INR ₹)')}
              </label>
              <input
                type="number"
                value={annualTurnover}
                onChange={(e) => setAnnualTurnover(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-500"
                min={0}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Operating Financials */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Coins className="w-4 h-4 text-emerald-400" /> 
            {t('settings.financialsTitle', 'Operational Financials (Monthly INR ₹)')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t('settings.monthlyRev', 'Gross Monthly Revenue')}
              </label>
              <input
                type="number"
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-500"
                min={0}
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t('settings.monthlyMaterial', 'Monthly Raw Material / COGS')}
              </label>
              <input
                type="number"
                value={monthlyMaterialCost}
                onChange={(e) => setMonthlyMaterialCost(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-500"
                min={0}
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t('settings.monthlySalary', 'Monthly Payroll / Salaries')}
              </label>
              <input
                type="number"
                value={monthlySalaryCost}
                onChange={(e) => setMonthlySalaryCost(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-500"
                min={0}
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t('settings.monthlyOpex', 'Monthly Fixed OPEX')}
              </label>
              <input
                type="number"
                value={monthlyOperatingExpenses}
                onChange={(e) => setMonthlyOperatingExpenses(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-500"
                min={0}
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t('settings.liquidCash', 'Current Liquid Cash Balance')}
              </label>
              <input
                type="number"
                value={currentCashBalance}
                onChange={(e) => setCurrentCashBalance(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-500"
                min={0}
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t('settings.receivables', 'Accounts Receivable (Debtors)')}
              </label>
              <input
                type="number"
                value={accountsReceivable}
                onChange={(e) => setAccountsReceivable(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-500"
                min={0}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Debt & Compliance */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <FileCheck2 className="w-4 h-4 text-sky-400" /> 
            {t('settings.debtTitle', 'Debt Facilities & Statutory Compliance')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t('settings.outstandingLoans', 'Total Outstanding Loans (₹)')}
              </label>
              <input
                type="number"
                value={outstandingLoanAmount}
                onChange={(e) => setOutstandingLoanAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-500"
                min={0}
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t('settings.monthlyEmi', 'Total Monthly EMI (₹)')}
              </label>
              <input
                type="number"
                value={monthlyEMI}
                onChange={(e) => setMonthlyEMI(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-500"
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-purple-500/50 transition-colors">
              <input
                type="checkbox"
                checked={gstRegistered}
                onChange={(e) => setGstRegistered(e.target.checked)}
                className="accent-purple-600 rounded"
              />
              <span className="text-slate-300 font-medium">
                {t('settings.gstEntity', 'GST Registered Entity')}
              </span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-purple-500/50 transition-colors">
              <input
                type="checkbox"
                checked={itrAvailable}
                onChange={(e) => setItrAvailable(e.target.checked)}
                className="accent-purple-600 rounded"
              />
              <span className="text-slate-300 font-medium">
                {t('settings.filedItr', 'Filed ITR Available')}
              </span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-purple-500/50 transition-colors">
              <input
                type="checkbox"
                checked={hasBusinessBankAccount}
                onChange={(e) => setHasBusinessBankAccount(e.target.checked)}
                className="accent-purple-600 rounded"
              />
              <span className="text-slate-300 font-medium">
                {t('settings.activeAccount', 'Active Current Account')}
              </span>
            </label>
          </div>
        </div>

        {/* Save Button Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {isSaved && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> {t('settings.savedSuccess', 'Changes saved to Firestore!')}
            </span>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            {isSaving ? t('common.saving', 'Saving...') : t('settings.saveAndRecalculate', 'Save & Recalculate')}
          </button>
        </div>

      </form>

    </div>
  );
};