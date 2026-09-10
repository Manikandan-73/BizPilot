import React from 'react';
import { Wallet } from 'lucide-react';
import { FinancialProfile } from '../../../types/onboarding';
import { FormField, fieldInputClasses } from '../FormField';

interface Step2FinancialsProps {
  data: FinancialProfile;
  errors: Partial<Record<keyof FinancialProfile, string>>;
  onChange: <K extends keyof FinancialProfile>(field: K, value: FinancialProfile[K]) => void;
}

interface FieldConfig {
  key: keyof FinancialProfile;
  label: string;
  helperText: string;
  placeholder: string;
}

const FIELDS: FieldConfig[] = [
  { key: 'monthlyRevenue', label: 'Monthly Revenue', helperText: 'Average sales income per month', placeholder: 'e.g. 400000' },
  { key: 'monthlyOperatingExpenses', label: 'Monthly Operating Expenses', helperText: 'Rent, utilities, admin & overheads', placeholder: 'e.g. 120000' },
  { key: 'monthlyMaterialCost', label: 'Monthly Material / Production Cost', helperText: 'Raw materials & direct production cost', placeholder: 'e.g. 180000' },
  { key: 'monthlySalaryCost', label: 'Monthly Salary Cost', helperText: 'Total payroll including owner drawings', placeholder: 'e.g. 90000' },
  { key: 'currentCashBalance', label: 'Current Cash Balance', helperText: 'Cash + bank balance available today', placeholder: 'e.g. 350000' },
  { key: 'accountsReceivable', label: 'Accounts Receivable', helperText: 'Money owed to you by customers', placeholder: 'e.g. 220000' },
  { key: 'accountsPayable', label: 'Accounts Payable', helperText: 'Money you owe to suppliers/vendors', placeholder: 'e.g. 140000' },
  { key: 'inventoryValue', label: 'Inventory Value', helperText: 'Current stock value at cost price', placeholder: 'e.g. 260000' },
];

export const Step2Financials: React.FC<Step2FinancialsProps> = ({ data, errors, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-purple-300">
        <Wallet className="w-4 h-4" />
        <h2 className="text-sm font-bold uppercase tracking-wider">Financial Snapshot</h2>
      </div>
      <p className="text-xs text-slate-500 -mt-3">
        This is only used to build your baseline profile — we won't calculate any scores yet.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {FIELDS.map((field) => (
          <FormField
            key={field.key}
            label={field.label}
            required
            error={errors[field.key]}
            helperText={field.helperText}
          >
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
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