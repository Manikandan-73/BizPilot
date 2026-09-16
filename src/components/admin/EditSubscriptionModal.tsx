import React, { useState } from 'react';
import { X, Calendar, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Clock } from 'lucide-react';
import { OnboardingRecord, SubscriptionDetails, SubscriptionPlan, SubscriptionStatus } from '../../types/business';
import { updateMSMESubscription } from '../../services/adminService';
import { useLanguage } from '../../i18n/LanguageContext';
import { PLAN_CONFIGS } from '../../config/plans';

interface EditSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: OnboardingRecord;
  onSave: (updatedSubscription: SubscriptionDetails) => void;
}

export const EditSubscriptionModal: React.FC<EditSubscriptionModalProps> = ({
  isOpen,
  onClose,
  record,
  onSave,
}) => {
  const { t } = useLanguage();
  const existingSub = record.organization.subscription;
  const initialPlan: SubscriptionPlan =
    existingSub?.plan === 'professional' ||
    (existingSub?.plan as any) === 'pro_growth' ||
    (existingSub?.plan as any) === 'business_leader'
      ? 'professional'
      : 'starter';

  const [plan, setPlan] = useState<SubscriptionPlan>(initialPlan);
  const [status, setStatus] = useState<SubscriptionStatus>(existingSub?.status || 'active');
  const [expiryDate, setExpiryDate] = useState<string>(
    existingSub?.expiryDate ? existingSub.expiryDate.split('T')[0] : new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(existingSub?.billingCycle || 'monthly');
  const [notes, setNotes] = useState<string>(existingSub?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePresetDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setExpiryDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updatedSub: SubscriptionDetails = {
        plan,
        status,
        startDate: existingSub?.startDate || new Date().toISOString(),
        expiryDate: new Date(expiryDate + 'T23:59:59.000Z').toISOString(),
        billingCycle,
        notes: notes.trim(),
      };

      await updateMSMESubscription(record.organization.id, updatedSub);
      onSave(updatedSub);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#121722] border border-[#222936] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-[#F8FAFC]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#707A8C] hover:text-[#F8FAFC] hover:bg-[#161C27] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-950/40 border border-violet-800/40 flex items-center justify-center text-violet-400 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F8FAFC]">
              {t('admin.editSubscription', 'Edit Subscription')}
            </h3>
            <p className="text-xs text-[#707A8C]">
              {record.organization.businessProfile.businessName || record.organization.name}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Plan Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
              {t('admin.plan', 'Subscription Plan')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'starter' as const, label: `Starter (₹${PLAN_CONFIGS.starter.priceINR})` },
                { key: 'professional' as const, label: `Professional (₹${PLAN_CONFIGS.professional.priceINR})` },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPlan(p.key)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                    plan === p.key
                      ? 'bg-violet-600 text-white border-violet-500 shadow-sm'
                      : 'bg-[#0D1118] text-[#A7B0C0] border-[#222936] hover:bg-[#161C27]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
              {t('admin.status', 'Subscription Status')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'active' as const, label: t('admin.active', 'Active'), activeColor: 'bg-emerald-950/50 text-emerald-300 border-emerald-700/60 ring-1 ring-emerald-500' },
                { key: 'trial' as const, label: t('admin.trial', 'Trial'), activeColor: 'bg-teal-950/50 text-teal-300 border-teal-700/60 ring-1 ring-teal-500' },
                { key: 'expired' as const, label: t('admin.expired', 'Expired'), activeColor: 'bg-amber-950/50 text-amber-300 border-amber-700/60 ring-1 ring-amber-500' },
                { key: 'suspended' as const, label: t('admin.suspended', 'Suspended'), activeColor: 'bg-rose-950/50 text-rose-300 border-rose-700/60 ring-1 ring-rose-500' },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStatus(s.key)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                    status === s.key
                      ? s.activeColor
                      : 'bg-[#0D1118] border-[#222936] text-[#707A8C] hover:bg-[#161C27]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
              {t('admin.expiryDate', 'Expiry Date')}
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                className="flex-1 px-3 py-2 rounded-xl bg-[#0D1118] border border-[#222936] text-[#F8FAFC] text-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
              />
            </div>

            {/* Quick Extension Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#707A8C] flex items-center gap-1 mr-1">
                <Clock className="w-3 h-3 text-violet-400" /> Presets:
              </span>
              <button
                type="button"
                onClick={() => handlePresetDays(30)}
                className="px-2.5 py-1 rounded-lg bg-[#0F1219] hover:bg-[#161C27] text-[#A7B0C0] text-[10px] font-medium border border-[#222936] transition-colors"
              >
                +30 Days
              </button>
              <button
                type="button"
                onClick={() => handlePresetDays(90)}
                className="px-2.5 py-1 rounded-lg bg-[#0F1219] hover:bg-[#161C27] text-[#A7B0C0] text-[10px] font-medium border border-[#222936] transition-colors"
              >
                +90 Days
              </button>
              <button
                type="button"
                onClick={() => handlePresetDays(365)}
                className="px-2.5 py-1 rounded-lg bg-[#0F1219] hover:bg-[#161C27] text-[#A7B0C0] text-[10px] font-medium border border-[#222936] transition-colors"
              >
                +1 Year
              </button>
            </div>
          </div>

          {/* Billing Cycle */}
          <div>
            <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
              Billing Cycle
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-[#A7B0C0] cursor-pointer">
                <input
                  type="radio"
                  name="billingCycle"
                  checked={billingCycle === 'monthly'}
                  onChange={() => setBillingCycle('monthly')}
                  className="accent-violet-600 focus:ring-violet-500"
                />
                <span>Monthly</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#A7B0C0] cursor-pointer">
                <input
                  type="radio"
                  name="billingCycle"
                  checked={billingCycle === 'yearly'}
                  onChange={() => setBillingCycle('yearly')}
                  className="accent-violet-600 focus:ring-violet-500"
                />
                <span>Yearly</span>
              </label>
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#A7B0C0] mb-1.5">
              {t('admin.adminNotes', 'Admin Notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('admin.adminNotesPlaceholder', 'Internal notes regarding plan extensions or billing...')}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-[#0D1118] border border-[#222936] text-[#F8FAFC] placeholder-[#707A8C] text-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222936]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#707A8C] hover:text-[#F8FAFC] hover:bg-[#161C27] transition-colors"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? t('common.saving', 'Saving...') : t('admin.saveChanges', 'Save Changes')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
