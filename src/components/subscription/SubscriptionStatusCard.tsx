import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { SubscriptionDetails } from '../../types/business';
import { PlanId, isSubscriptionActive, getDaysRemaining } from '../../config/plans';
import { useLanguage } from '../../i18n/LanguageContext';

interface SubscriptionStatusCardProps {
  subscription: SubscriptionDetails | null;
  onRenewOrUpgrade: (planId: PlanId) => void;
  loading?: boolean;
}

export const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({
  subscription,
  onRenewOrUpgrade,
  loading = false,
}) => {
  const { t } = useLanguage();
  const active = isSubscriptionActive(subscription);
  const daysLeft = getDaysRemaining(subscription);
  const planName = subscription?.plan ? subscription.plan.replace('_', ' ').toUpperCase() : 'NO PLAN';

  const isExpired = !active && Boolean(subscription?.expiryDate);

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {subscription?.plan ? planName + ' PLAN' : t('subscription.noActivePlan', 'No Active Subscription')}
              </h3>
              {active ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {t('subscription.active', 'Active')}
                </span>
              ) : isExpired ? (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {t('subscription.expired', 'Expired')}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  {t('subscription.pending', 'Pending Payment')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {active
                ? t('subscription.activeDesc', 'Full access to your MSME financial tools & intelligence.')
                : isExpired
                ? t('subscription.expiredDesc', 'Your subscription has expired. Renew your plan to continue using BizPilot AI.')
                : t('subscription.pendingDesc', 'Select a plan below to activate your 30-day access.')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {active && subscription?.plan === 'starter' && (
            <button
              onClick={() => onRenewOrUpgrade('professional')}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center gap-1.5"
            >
              <span>{t('subscription.upgradeToPro', 'Upgrade to Professional')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}

          {isExpired && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRenewOrUpgrade('starter')}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              >
                {t('subscription.renewStarter', 'Renew Starter')}
              </button>
              <button
                onClick={() => onRenewOrUpgrade('professional')}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all"
              >
                {t('subscription.renewPro', 'Renew Professional')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Snapshot metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-slate-400 font-medium">{t('subscription.planDuration', 'Billing Period')}</div>
          <div className="text-sm font-bold text-white mt-1">30 {t('common.days', 'Days')}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-slate-400 font-medium">{t('subscription.startDate', 'Start Date')}</div>
          <div className="text-sm font-bold text-white mt-1">
            {subscription?.startDate ? new Date(subscription.startDate).toLocaleDateString() : '—'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-slate-400 font-medium">{t('subscription.expiryDate', 'Expiry Date')}</div>
          <div className="text-sm font-bold text-white mt-1">
            {subscription?.expiryDate ? new Date(subscription.expiryDate).toLocaleDateString() : '—'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-slate-400 font-medium">{t('subscription.daysRemaining', 'Days Remaining')}</div>
          <div className="text-sm font-bold text-purple-400 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{daysLeft} {t('common.days', 'days')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
