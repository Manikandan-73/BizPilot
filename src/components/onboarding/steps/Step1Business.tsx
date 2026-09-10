import React from 'react';
import { Building2 } from 'lucide-react';
import { BUSINESS_TYPES, BusinessProfile, BusinessType } from '../../../types/onboarding';
import { FormField, fieldInputClasses } from '../FormField';

interface Step1BusinessProps {
  data: BusinessProfile;
  errors: Partial<Record<keyof BusinessProfile, string>>;
  onChange: <K extends keyof BusinessProfile>(field: K, value: BusinessProfile[K]) => void;
}

const CURRENT_YEAR = new Date().getFullYear();

export const Step1Business: React.FC<Step1BusinessProps> = ({ data, errors, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-purple-300">
        <Building2 className="w-4 h-4" />
        <h2 className="text-sm font-bold uppercase tracking-wider">Business Information</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Business Name" required error={errors.businessName} className="sm:col-span-2">
          <input
            type="text"
            value={data.businessName}
            onChange={(e) => onChange('businessName', e.target.value)}
            placeholder="e.g. Shree Ganesh Agro Foods"
            className={fieldInputClasses(!!errors.businessName)}
          />
        </FormField>

        <FormField label="Business Type" required error={errors.businessType}>
          <select
            value={data.businessType}
            onChange={(e) => onChange('businessType', e.target.value as BusinessType)}
            className={fieldInputClasses(!!errors.businessType)}
          >
            <option value="">Select business type</option>
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Industry" required error={errors.industry}>
          <input
            type="text"
            value={data.industry}
            onChange={(e) => onChange('industry', e.target.value)}
            placeholder="e.g. Food Processing & Spices"
            className={fieldInputClasses(!!errors.industry)}
          />
        </FormField>

        <FormField label="Location" required error={errors.location}>
          <input
            type="text"
            value={data.location}
            onChange={(e) => onChange('location', e.target.value)}
            placeholder="e.g. Nashik, Maharashtra"
            className={fieldInputClasses(!!errors.location)}
          />
        </FormField>

        <FormField label="Year Established" required error={errors.yearEstablished}>
          <input
            type="number"
            value={data.yearEstablished}
            onChange={(e) => onChange('yearEstablished', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder={`e.g. 2018`}
            min={1900}
            max={CURRENT_YEAR}
            className={fieldInputClasses(!!errors.yearEstablished)}
          />
        </FormField>

        <FormField label="Number of Employees" required error={errors.numberOfEmployees}>
          <input
            type="number"
            value={data.numberOfEmployees}
            onChange={(e) => onChange('numberOfEmployees', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 28"
            min={0}
            className={fieldInputClasses(!!errors.numberOfEmployees)}
          />
        </FormField>

        <FormField
          label="Annual Turnover"
          required
          error={errors.annualTurnover}
          helperText="Approximate figure in Indian Rupees (₹) for the last financial year"
        >
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
            <input
              type="number"
              value={data.annualTurnover}
              onChange={(e) => onChange('annualTurnover', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 4850000"
              min={0}
              className={fieldInputClasses(!!errors.annualTurnover) + ' pl-7'}
            />
          </div>
        </FormField>
      </div>
    </div>
  );
};