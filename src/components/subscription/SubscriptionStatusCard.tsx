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
    <div className="rounded-2xl bg-[#121722] border border-[#222936] p-4 sm:p-6 lg:p-8 shadow-sm space-y-5 sm:space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-[#222936] min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-violet-950/40 border border-violet-800/40 flex items-center justify-center text-violet-400 shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC] tracking-tight truncate">
                {subscription?.plan ? planName + ' PLAN' : t('subscription.noActivePlan', 'No Active Subscription')}
              </h3>
              {active ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  {t('subscription.active', 'Active')}
                </span>
              ) : isExpired ? (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-950/50 border border-rose-800/50 text-rose-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <AlertTriangle className="w-3 h-3" />
                  {t('subscription.expired', 'Expired')}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950/50 border border-amber-800/50 text-amber-400 text-[10px] font-bold uppercase tracking-wider shrink-0">
                  {t('subscription.pending', 'Pending Payment')}
                </span>
              )}
            </div>
            <p className="text-xs text-[#707A8C] mt-0.5">
              {active
                ? t('subscription.activeDesc', 'Full access to your MSME financial tools & intelligence.')
                : isExpired
                ? t('subscription.expiredDesc', 'Your subscription has expired. Renew your plan to continue using BizPilot AI.')
                : t('subscription.pendingDesc', 'Select a plan below to activate your 30-day access.')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {active && subscription?.plan === 'starter' && (
            <button
              onClick={() => onRenewOrUpgrade('professional')}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>{t('subscription.upgradeToPro', 'Upgrade to Professional')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}

          {isExpired && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => onRenewOrUpgrade('starter')}
                disabled={loading}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold bg-[#161C27] hover:bg-[#1F2636] text-[#F8FAFC] border border-[#222936] shadow-sm transition-all text-center"
              >
                {t('subscription.renewStarter', 'Renew Starter')}
              </button>
              <button
                onClick={() => onRenewOrUpgrade('professional')}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-sm transition-all text-center"
              >
                {t('subscription.renewPro', 'Renew Professional')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Snapshot metrics */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-xs min-w-0">
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#0F1219] border border-[#222936] min-w-0">
          <div className="text-[#707A8C] font-medium truncate">{t('subscription.planDuration', 'Billing Period')}</div>
          <div className="text-sm font-bold text-[#F8FAFC] mt-1">30 {t('common.days', 'Days')}</div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-[#0F1219] border border-[#222936] min-w-0">
          <div className="text-[#707A8C] font-medium truncate">{t('subscription.startDate', 'Start Date')}</div>
          <div className="text-sm font-bold text-[#F8FAFC] mt-1">
            {subscription?.startDate ? new Date(subscription.startDate).toLocaleDateString() : '—'}
          </div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-[#0F1219] border border-[#222936] min-w-0">
          <div className="text-[#707A8C] font-medium truncate">{t('subscription.expiryDate', 'Expiry Date')}</div>
          <div className="text-sm font-bold text-[#F8FAFC] mt-1">
            {subscription?.expiryDate ? new Date(subscription.expiryDate).toLocaleDateString() : '—'}
          </div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-[#0F1219] border border-[#222936] min-w-0">
          <div className="text-[#707A8C] font-medium truncate">{t('subscription.daysRemaining', 'Days Remaining')}</div>
          <div className="text-sm font-bold text-violet-400 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{daysLeft} {t('common.days', 'days')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
