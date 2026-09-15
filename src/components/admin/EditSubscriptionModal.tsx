import React, { useState } from 'react';
import { X, Calendar, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Clock } from 'lucide-react';
import { OnboardingRecord, SubscriptionDetails, SubscriptionPlan, SubscriptionStatus } from '../../types/business';
import { updateMSMESubscription } from '../../services/adminService';
import { useLanguage } from '../../i18n/LanguageContext';

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

  const [plan, setPlan] = useState<SubscriptionPlan>(existingSub?.plan || 'pro_growth');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {t('admin.editSubscription', 'Edit Subscription')}
            </h3>
            <p className="text-xs text-slate-400">
              {record.organization.businessProfile.businessName || record.organization.name}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Plan Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('admin.plan', 'Subscription Plan')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'starter' as const, label: 'Starter (₹499)', color: 'border-slate-700' },
                { key: 'professional' as const, label: 'Professional (₹999)', color: 'border-purple-500/50' },
                { key: 'starter_free' as const, label: t('admin.starterFree', 'Starter Free'), color: 'border-slate-700' },
                { key: 'pro_growth' as const, label: t('admin.proGrowth', 'Pro Growth'), color: 'border-purple-500/50' },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPlan(p.key)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                    plan === p.key
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 ' + p.color
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('admin.status', 'Subscription Status')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'active' as const, label: t('admin.active', 'Active'), color: 'text-emerald-400 bg-emerald-950/30 border-emerald-500/30' },
                { key: 'trial' as const, label: t('admin.trial', 'Trial'), color: 'text-sky-400 bg-sky-950/30 border-sky-500/30' },
                { key: 'expired' as const, label: t('admin.expired', 'Expired'), color: 'text-amber-400 bg-amber-950/30 border-amber-500/30' },
                { key: 'suspended' as const, label: t('admin.suspended', 'Suspended'), color: 'text-rose-400 bg-rose-950/30 border-rose-500/30' },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStatus(s.key)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                    status === s.key
                      ? 'ring-2 ring-purple-400 ring-offset-1 ring-offset-slate-900 ' + s.color
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('admin.expiryDate', 'Expiry Date')}
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Quick Extension Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mr-1">
                <Clock className="w-3 h-3 text-purple-400" /> Presets:
              </span>
              <button
                type="button"
                onClick={() => handlePresetDays(30)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium border border-slate-700 transition-colors"
              >
                +30 Days
              </button>
              <button
                type="button"
                onClick={() => handlePresetDays(90)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium border border-slate-700 transition-colors"
              >
                +90 Days
              </button>
              <button
                type="button"
                onClick={() => handlePresetDays(365)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium border border-slate-700 transition-colors"
              >
                +1 Year
              </button>
            </div>
          </div>

          {/* Billing Cycle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Billing Cycle
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="billingCycle"
                  checked={billingCycle === 'monthly'}
                  onChange={() => setBillingCycle('monthly')}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span>Monthly</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="billingCycle"
                  checked={billingCycle === 'yearly'}
                  onChange={() => setBillingCycle('yearly')}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span>Yearly</span>
              </label>
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('admin.adminNotes', 'Admin Notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('admin.adminNotesPlaceholder', 'Internal notes regarding plan extensions or billing...')}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              {loading ? t('common.saving', 'Saving...') : t('admin.saveChanges', 'Save Changes')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
