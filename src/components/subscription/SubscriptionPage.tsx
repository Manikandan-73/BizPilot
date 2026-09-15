import React from 'react';
import { PlanComparison } from './PlanComparison';
import { SubscriptionStatusCard } from './SubscriptionStatusCard';
import { PaymentHistoryTable } from './PaymentHistoryTable';
import { Organization, SubscriptionDetails } from '../../types/business';
import { useSubscription } from '../../hooks/useSubscription';
import { useLanguage } from '../../i18n/LanguageContext';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface SubscriptionPageProps {
  organization: Organization | null;
  uid?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  onSubscriptionUpdated?: (newSub: SubscriptionDetails) => void;
  onContinueToDashboard?: () => void;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({
  organization,
  uid,
  userEmail,
  userName,
  onSubscriptionUpdated,
  onContinueToDashboard,
}) => {
  const { t } = useLanguage();
  const {
    subscription,
    currentPlanId,
    payments,
    paymentsLoading,
    checkoutLoading,
    checkoutError,
    paymentSuccessMessage,
    purchasePlan,
    clearMessages,
  } = useSubscription({
    organization,
    uid,
    userEmail,
    userName,
    onSubscriptionUpdated,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Notifications / Alerts */}
      {checkoutError && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{checkoutError}</span>
          </div>
          <button onClick={clearMessages} className="text-slate-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {paymentSuccessMessage && (
        <div className="p-5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-sm">{t('subscription.paymentSuccessful', 'Payment Successful!')}</div>
              <div>{paymentSuccessMessage}</div>
            </div>
          </div>
          {onContinueToDashboard && (
            <button
              onClick={onContinueToDashboard}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shrink-0"
            >
              {t('subscription.continueToDashboard', 'Continue to Dashboard')}
            </button>
          )}
        </div>
      )}

      {/* Subscription Status Card */}
      <SubscriptionStatusCard
        subscription={subscription}
        onRenewOrUpgrade={(planId) => purchasePlan(planId)}
        loading={checkoutLoading}
      />

      {/* Plan Selection Matrix */}
      <PlanComparison
        currentPlanId={currentPlanId}
        onSelectPlan={(planId) => purchasePlan(planId)}
        loading={checkoutLoading}
      />

      {/* Payment Receipts History */}
      <PaymentHistoryTable payments={payments} loading={paymentsLoading} />

    </div>
  );
};
