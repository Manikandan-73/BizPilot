import React, { useMemo } from 'react';
import { X, Building2, TrendingUp, ShieldCheck, CreditCard, Award, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { OnboardingRecord } from '../../types/business';
import { analyzeOrganization } from '../../analytics/financialAnalysis';
import { formatINR } from '../../lib/currency';
import { useLanguage } from '../../i18n/LanguageContext';

interface MSMESnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: OnboardingRecord;
}

export const MSMESnapshotModal: React.FC<MSMESnapshotModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const { t } = useLanguage();
  const org = record.organization;

  const analysis = useMemo(() => {
    return analyzeOrganization(org);
  }, [org]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#121722] border border-[#222936] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-[#F8FAFC]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#707A8C] hover:text-[#F8FAFC] hover:bg-[#161C27] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#222936]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 mb-1">
              <Building2 className="w-4 h-4" />
              <span>{t('admin.snapshotTitle', 'MSME Business Snapshot')}</span>
            </div>
            <h3 className="text-xl font-bold text-[#F8FAFC]">
              {org.businessProfile.businessName || org.name}
            </h3>
            <p className="text-xs text-[#707A8C] mt-0.5">
              {org.businessProfile.industry || 'General Industry'} • {org.businessProfile.location || 'India'}
            </p>
          </div>

          <div className="text-right">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
              org.accountStatus === 'suspended'
                ? 'bg-rose-950/50 text-rose-400 border border-rose-800/50'
                : 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/50'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${org.accountStatus === 'suspended' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
              {org.accountStatus === 'suspended' ? 'Suspended' : 'Active Account'}
            </span>
            <div className="text-[10px] text-[#707A8C] mt-1">
              Plan: <span className="text-violet-400 font-semibold">{org.subscription?.plan?.replace('_', ' ').toUpperCase() || 'STARTER'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-4">
          
          {/* Owner & Identity */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#0F1219] border border-[#222936]">
              <div className="text-[10px] font-medium text-[#707A8C]">Owner Name</div>
              <div className="text-xs font-bold text-[#F8FAFC] truncate mt-0.5">
                {record.user?.name || 'Owner'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#0F1219] border border-[#222936]">
              <div className="text-[10px] font-medium text-[#707A8C]">Owner Email</div>
              <div className="text-xs font-bold text-[#F8FAFC] truncate mt-0.5" title={record.ownerEmail}>
                {record.ownerEmail || 'N/A'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#0F1219] border border-[#222936]">
              <div className="text-[10px] font-medium text-[#707A8C]">Business Type</div>
              <div className="text-xs font-bold text-[#F8FAFC] truncate mt-0.5">
                {org.businessProfile.businessType || 'MSME'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#0F1219] border border-[#222936]">
              <div className="text-[10px] font-medium text-[#707A8C]">Employees</div>
              <div className="text-xs font-bold text-[#F8FAFC] mt-0.5">
                {org.businessProfile.numberOfEmployees || '—'}
              </div>
            </div>
          </div>

          {/* Scores Overview */}
          <div className="p-4 rounded-xl bg-[#0F1219] border border-[#222936]">
            <div className="text-xs font-bold text-[#F8FAFC] mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-violet-400" />
              <span>{t('admin.healthScores', 'Calculated Health & Funding Readiness')}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-black text-[#F8FAFC]">{analysis.health.overallScore}/100</div>
                <div className="text-[10px] text-[#707A8C] mt-0.5">Financial Health ({analysis.health.rating})</div>
              </div>
              <div>
                <div className="text-2xl font-black text-teal-400">{analysis.funding.overallScore}/100</div>
                <div className="text-[10px] text-[#707A8C] mt-0.5">Funding Score ({analysis.funding.eligibilityTier})</div>
              </div>
              <div>
                <div className="text-xl font-bold text-violet-400">{analysis.funding.estimatedCreditLimit}</div>
                <div className="text-[10px] text-[#707A8C] mt-0.5">Est. Credit Limit</div>
              </div>
            </div>
          </div>

          {/* Core Financial Metrics */}
          <div>
            <div className="text-xs font-bold text-[#F8FAFC] mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
              <span>{t('admin.financialOverview', 'Financial Metrics (Normalized INR)')}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0F1219] border border-[#222936]">
                <span className="text-[#707A8C] text-[10px] block">Monthly Revenue</span>
                <span className="font-bold text-emerald-400">{formatINR(analysis.financials.monthlyRevenue)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0F1219] border border-[#222936]">
                <span className="text-[#707A8C] text-[10px] block">Monthly OPEX</span>
                <span className="font-bold text-[#F8FAFC]">{formatINR(analysis.financials.monthlyOperatingExpenses)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0F1219] border border-[#222936]">
                <span className="text-[#707A8C] text-[10px] block">Current Cash</span>
                <span className="font-bold text-teal-400">{formatINR(analysis.financials.currentCashBalance)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0F1219] border border-[#222936]">
                <span className="text-[#707A8C] text-[10px] block">Gross Margin</span>
                <span className="font-bold text-violet-400">
                  {analysis.financials.grossMarginPercent ? `${analysis.financials.grossMarginPercent}%` : 'N/A'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0F1219] border border-[#222936]">
                <span className="text-[#707A8C] text-[10px] block">Monthly Net Cash Flow</span>
                <span className={`font-bold ${analysis.financials.monthlyNetCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatINR(analysis.financials.monthlyNetCashFlow)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0F1219] border border-[#222936]">
                <span className="text-[#707A8C] text-[10px] block">Cash Runway</span>
                <span className="font-bold text-amber-400">
                  {analysis.financials.runwayMonths ? `${analysis.financials.runwayMonths} mos` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Compliance & Debt Profile */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[#0F1219] border border-[#222936] flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${org.complianceProfile?.gstRegistered ? 'text-emerald-400' : 'text-[#707A8C]'}`} />
              <div>
                <div className="text-[10px] text-[#707A8C]">GST Registered</div>
                <div className="font-semibold text-[#F8FAFC]">{org.complianceProfile?.gstRegistered ? 'Yes' : 'No'}</div>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0F1219] border border-[#222936] flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${org.complianceProfile?.itrAvailable ? 'text-emerald-400' : 'text-[#707A8C]'}`} />
              <div>
                <div className="text-[10px] text-[#707A8C]">ITR Filed</div>
                <div className="font-semibold text-[#F8FAFC]">{org.complianceProfile?.itrAvailable ? 'Yes' : 'No'}</div>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0F1219] border border-[#222936] flex items-center gap-2">
              <CreditCard className={`w-4 h-4 ${org.debtProfile?.hasLoans ? 'text-amber-400' : 'text-emerald-400'}`} />
              <div>
                <div className="text-[10px] text-[#707A8C]">Existing Loans</div>
                <div className="font-semibold text-[#F8FAFC]">{org.debtProfile?.hasLoans ? 'Has Debt' : 'Debt Free'}</div>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-[#222936] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#161C27] hover:bg-[#1F2636] text-[#F8FAFC] border border-[#222936] text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
