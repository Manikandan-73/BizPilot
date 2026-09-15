/**
 * useSubscription Hook
 * 
 * Provides reactive subscription state, feature entitlement evaluation,
 * checkout launch trigger, and payment history refresh.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Organization, PaymentRecord, SubscriptionDetails } from '../types/business';
import {
  PlanId,
  FeatureKey,
  hasFeature,
  isSubscriptionActive,
  getDaysRemaining,
  normalizePlanId,
} from '../config/plans';
import {
  getPaymentHistory,
  getSubscriptionFromOrg,
  applyVerifiedSubscription,
} from '../services/subscriptionService';
import { launchRazorpayCheckout } from '../services/paymentService';

export interface UseSubscriptionOptions {
  organization?: Organization | null;
  uid?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  onSubscriptionUpdated?: (newSub: SubscriptionDetails) => void;
}

export function useSubscription({
  organization,
  uid,
  userEmail,
  userName,
  onSubscriptionUpdated,
}: UseSubscriptionOptions) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState<boolean>(false);
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

  const subscription: SubscriptionDetails | null = useMemo(() => {
    return getSubscriptionFromOrg(organization);
  }, [organization]);

  const isActive = useMemo(() => {
    return isSubscriptionActive(subscription);
  }, [subscription]);

  const daysRemaining = useMemo(() => {
    return getDaysRemaining(subscription);
  }, [subscription]);

  const currentPlanId: PlanId | null = useMemo(() => {
    return normalizePlanId(subscription?.plan);
  }, [subscription]);

  const isExpired = useMemo(() => {
    if (!subscription) return false;
    if (subscription.status === 'expired') return true;
    return !isActive && Boolean(subscription.expiryDate);
  }, [subscription, isActive]);

  const isPending = useMemo(() => {
    if (!subscription) return true;
    return subscription.status === 'pending' || (!isActive && !isExpired);
  }, [subscription, isActive, isExpired]);

  // Load payment records
  const refreshPayments = useCallback(async () => {
    if (!uid) return;
    setPaymentsLoading(true);
    try {
      const records = await getPaymentHistory(uid);
      setPayments(records);
    } catch (err) {
      console.warn('Error fetching payment history:', err);
    } finally {
      setPaymentsLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    void refreshPayments();
  }, [refreshPayments]);

  // Check if current subscription satisfies feature
  const canAccess = useCallback(
    (feature: FeatureKey): boolean => {
      return hasFeature(subscription, feature);
    },
    [subscription]
  );

  // Trigger Razorpay Standard Checkout
  const purchasePlan = useCallback(
    async (planId: PlanId) => {
      if (!organization || !uid) {
        setCheckoutError('User session or organization not loaded.');
        return;
      }

      setCheckoutLoading(true);
      setCheckoutError(null);
      setPaymentSuccessMessage(null);

      await launchRazorpayCheckout({
        planId,
        organizationId: organization.id,
        uid,
        userEmail: userEmail || undefined,
        userName: userName || undefined,
        businessName: organization.businessProfile?.businessName || organization.name,
        onSuccess: (res) => {
          setCheckoutLoading(false);
          setPaymentSuccessMessage(
            `Payment successful! Your ${res.subscription.plan.toUpperCase()} plan is now active for 30 days.`
          );
          if (onSubscriptionUpdated) {
            onSubscriptionUpdated(res.subscription);
          }
          void refreshPayments();
        },
        onError: (err) => {
          setCheckoutLoading(false);
          setCheckoutError(err);
        },
        onDismiss: () => {
          setCheckoutLoading(false);
        },
      });
    },
    [organization, uid, userEmail, userName, onSubscriptionUpdated, refreshPayments]
  );

  return {
    subscription,
    isActive,
    isExpired,
    isPending,
    daysRemaining,
    currentPlanId,
    payments,
    paymentsLoading,
    checkoutLoading,
    checkoutError,
    paymentSuccessMessage,
    canAccess,
    purchasePlan,
    refreshPayments,
    clearMessages: () => {
      setCheckoutError(null);
      setPaymentSuccessMessage(null);
    },
  };
}
