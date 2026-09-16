import React from 'react';
import { Wallet } from 'lucide-react';
import { FinancialProfile } from '../../../types/onboarding';
import { FormField, fieldInputClasses } from '../FormField';
import { useLanguage } from '../../../i18n/LanguageContext';

interface Step2FinancialsProps {
  data: FinancialProfile;
  errors: Partial<Record<keyof FinancialProfile, string>>;
  onChange: <K extends keyof FinancialProfile>(field: K, value: FinancialProfile[K]) => void;
}

interface FieldConfig {
  key: keyof FinancialProfile;
  i18nKey: string;
  defaultLabel: string;
  helperText: string;
  placeholder: string;
}

const FIELDS: FieldConfig[] = [
  { key: 'monthlyRevenue', i18nKey: 'onboarding.monthlyRevenue', defaultLabel: 'Monthly Revenue', helperText: 'Average sales income per month', placeholder: 'e.g. 400000' },
  { key: 'monthlyOperatingExpenses', i18nKey: 'onboarding.monthlyOpex', defaultLabel: 'Monthly Operating Expenses', helperText: 'Rent, utilities, admin & overheads', placeholder: 'e.g. 120000' },
  { key: 'monthlyMaterialCost', i18nKey: 'onboarding.monthlyMaterial', defaultLabel: 'Monthly Material / Production Cost', helperText: 'Raw materials & direct production cost', placeholder: 'e.g. 180000' },
  { key: 'monthlySalaryCost', i18nKey: 'onboarding.monthlySalary', defaultLabel: 'Monthly Salary Cost', helperText: 'Total payroll including owner drawings', placeholder: 'e.g. 90000' },
  { key: 'currentCashBalance', i18nKey: 'onboarding.cashBalance', defaultLabel: 'Current Cash Balance', helperText: 'Cash + bank balance available today', placeholder: 'e.g. 350000' },
  { key: 'accountsReceivable', i18nKey: 'onboarding.accountsReceivable', defaultLabel: 'Accounts Receivable', helperText: 'Money owed to you by customers', placeholder: 'e.g. 220000' },
  { key: 'accountsPayable', i18nKey: 'onboarding.accountsPayable', defaultLabel: 'Accounts Payable', helperText: 'Money you owe to suppliers/vendors', placeholder: 'e.g. 140000' },
  { key: 'inventoryValue', i18nKey: 'onboarding.inventoryValue', defaultLabel: 'Inventory Value', helperText: 'Current stock value at cost price', placeholder: 'e.g. 260000' },
];

export const Step2Financials: React.FC<Step2FinancialsProps> = ({ data, errors, onChange }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-violet-400">
        <Wallet className="w-4 h-4" />
        <h2 className="text-sm font-bold uppercase tracking-wider">{t('onboarding.step2', 'Financial Snapshot')}</h2>
      </div>

      <p className="text-xs text-[#707A8C] -mt-3">
        {t('onboarding.step2Subtitle', 'This is only used to build your baseline profile — we won\'t calculate any scores yet.')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {FIELDS.map((field) => (
          <FormField
            key={field.key}
            label={t(field.i18nKey, field.defaultLabel)}
            required
            error={errors[field.key]}
            helperText={field.helperText}
          >
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707A8C] text-sm">₹</span>
              <input
                type="number"
                value={data[field.key]}
                onChange={(e) => onChange(field.key, (e.target.value === '' ? '' : Number(e.target.value)) as FinancialProfile[typeof field.key])}
                placeholder={field.placeholder}
                min={0}
                className={fieldInputClasses(!!errors[field.key]) + ' pl-7'}
              />
            </div>
          </FormField>
        ))}
      </div>
    </div>
  );
};