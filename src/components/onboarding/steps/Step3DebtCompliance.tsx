import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { DebtProfile, LoanDetails } from '../../../types/onboarding';
import { FormField, fieldInputClasses } from '../FormField';
import { YesNoToggle } from '../ChoiceControls';
import { useLanguage } from '../../../i18n/LanguageContext';

type DebtErrors = Partial<Record<keyof DebtProfile, string>> & {
  loanDetails?: Partial<Record<keyof LoanDetails, string>>;
};

interface Step3DebtComplianceProps {
  data: DebtProfile;
  errors: DebtErrors;
  onChange: <K extends keyof DebtProfile>(field: K, value: DebtProfile[K]) => void;
  onLoanDetailChange: <K extends keyof LoanDetails>(field: K, value: LoanDetails[K]) => void;
}

const EMPTY_LOAN: LoanDetails = {
  outstandingLoanAmount: '',
  monthlyEMI: '',
  interestRate: '',
  remainingTenureMonths: '',
};

export const Step3DebtCompliance: React.FC<Step3DebtComplianceProps> = ({
  data,
  errors,
  onChange,
  onLoanDetailChange,
}) => {
  const { t } = useLanguage();
  const loan = data.loanDetails ?? EMPTY_LOAN;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-violet-400">
        <ShieldCheck className="w-4 h-4" />
        <h2 className="text-sm font-bold uppercase tracking-wider">{t('onboarding.step3', 'Debt & Compliance')}</h2>
      </div>

      <FormField label={t('onboarding.hasLoans', 'Does your business currently have any loans?')} required error={errors.hasLoans}>
        <YesNoToggle value={data.hasLoans} onChange={(v) => onChange('hasLoans', v)} />
      </FormField>

      {data.hasLoans === true && (
        <div className="p-4 sm:p-5 rounded-xl bg-[#0F1219] border border-[#222936] space-y-4">
          <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider">
            {t('onboarding.existingLoanDetails', 'Existing Loan Details')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={t('onboarding.outstandingLoan', 'Outstanding Loan Amount')} required error={errors.loanDetails?.outstandingLoanAmount}>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707A8C] text-sm">₹</span>
                <input
                  type="number"
                  value={loan.outstandingLoanAmount}
                  onChange={(e) => onLoanDetailChange('outstandingLoanAmount', e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 1200000"
                  min={0}
                  className={fieldInputClasses(!!errors.loanDetails?.outstandingLoanAmount) + ' pl-7'}
                />
              </div>
            </FormField>

            <FormField label={t('onboarding.monthlyEMI', 'Monthly EMI')} required error={errors.loanDetails?.monthlyEMI}>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707A8C] text-sm">₹</span>
                <input
                  type="number"
                  value={loan.monthlyEMI}
                  onChange={(e) => onLoanDetailChange('monthlyEMI', e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 32000"
                  min={0}
                  className={fieldInputClasses(!!errors.loanDetails?.monthlyEMI) + ' pl-7'}
                />
              </div>
            </FormField>

            <FormField label={t('onboarding.interestRate', 'Interest Rate')} required error={errors.loanDetails?.interestRate} helperText="Annual rate, in %">
              <div className="relative">
                <input
                  type="number"
                  value={loan.interestRate}
                  onChange={(e) => onLoanDetailChange('interestRate', e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 11.5"
                  min={0}
                  step={0.1}
                  className={fieldInputClasses(!!errors.loanDetails?.interestRate) + ' pr-8'}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#707A8C] text-sm">%</span>
              </div>
            </FormField>

            <FormField label={t('onboarding.tenureMonths', 'Remaining Tenure (months)')} required error={errors.loanDetails?.remainingTenureMonths}>
              <input
                type="number"
                value={loan.remainingTenureMonths}
                onChange={(e) => onLoanDetailChange('remainingTenureMonths', e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 24"
                min={0}
                className={fieldInputClasses(!!errors.loanDetails?.remainingTenureMonths)}
              />
            </FormField>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
        <FormField label={t('onboarding.gstRegistered', 'GST Registered Entity?')} required error={errors.gstRegistered}>
          <YesNoToggle value={data.gstRegistered} onChange={(v) => onChange('gstRegistered', v)} />
        </FormField>

        <FormField label={t('onboarding.itrAvailable', 'Audited / Filed ITR Available?')} required error={errors.itrAvailable}>
          <YesNoToggle value={data.itrAvailable} onChange={(v) => onChange('itrAvailable', v)} />
        </FormField>

        <FormField label={t('onboarding.bankAccount', 'Active Business Current Account?')} required error={errors.hasBusinessBankAccount}>
          <YesNoToggle value={data.hasBusinessBankAccount} onChange={(v) => onChange('hasBusinessBankAccount', v)} />
        </FormField>
      </div>
    </div>
  );
};