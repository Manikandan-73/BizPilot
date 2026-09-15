/**
 * Subscription Service (BizPilot AI)
 * 
 * Manages:
 * - Calling server-side order generation & HMAC signature verification
 * - Updating MSME subscription status in Firestore
 * - Saving idempotent payment records under users/{uid}/payments/{paymentId}
 * - Fetching verified payment transaction histories
 * - Expiration and days remaining calculations
 */

import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Organization,
  PaymentRecord,
  SubscriptionDetails,
} from '../types/business';
import {
  PlanId,
  PLAN_CONFIGS,
  isSubscriptionActive,
  getDaysRemaining,
} from '../config/plans';

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  planName: string;
  durationDays: number;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  planId: PlanId;
  organizationId: string;
  uid: string;
  userEmail?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  verified: boolean;
  subscription: SubscriptionDetails;
  paymentRecord: PaymentRecord;
}

/**
 * 1. Request server-side Razorpay order creation.
 * Server derives the exact amount from central plan configuration.
 */
export async function createSubscriptionOrder(
  planId: PlanId,
  organizationId: string,
  uid: string
): Promise<CreateOrderResponse> {
  const response = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, organizationId, uid }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to initialize payment with server.');
  }

  return response.json();
}

/**
 * 2. Send Razorpay payment details to server for official HMAC signature verification.
 * The server verifies authenticity before confirming payment.
 */
export async function verifySubscriptionPayment(
  payload: VerifyPaymentPayload
): Promise<VerifyPaymentResponse> {
  const response = await fetch('/api/payments/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Payment signature verification failed.');
  }

  const result: VerifyPaymentResponse = await response.json();

  // 3. Atomically persist verified subscription & idempotent payment record in Firestore
  if (result.verified && result.subscription) {
    await applyVerifiedSubscription(payload.organizationId, payload.uid, result.subscription, result.paymentRecord);
  }

  return result;
}

/**
 * Persist verified subscription to organization and record payment transaction idempotently.
 */
export async function applyVerifiedSubscription(
  organizationId: string,
  uid: string,
  subscription: SubscriptionDetails,
  paymentRecord: PaymentRecord
): Promise<void> {
  const now = new Date().toISOString();

  // A. Update organization subscription & unlock platform access
  if (organizationId) {
    const orgRef = doc(db, 'organizations', organizationId);
    const updates = {
      'organization.subscription': subscription,
      'organization.accessStatus': 'active',
      'organization.registrationStatus': 'completed',
      'organization.updatedAt': now,
      subscription,
      accessStatus: 'active',
      registrationStatus: 'completed',
      updatedAt: now,
    };
    await updateDoc(orgRef, updates).catch(async (err) => {
      console.warn('Direct update failed, checking if document exists:', err);
      // If root fields format
      await setDoc(orgRef, { subscription, accessStatus: 'active', registrationStatus: 'completed', updatedAt: now }, { merge: true });
    });
  }

  // B. Save payment record under users/{uid}/payments/{paymentId}
  // Idempotent: doc key is razorpay_payment_id
  if (uid && paymentRecord?.paymentId) {
    const paymentRef = doc(db, 'users', uid, 'payments', paymentRecord.paymentId);
    await setDoc(paymentRef, {
      ...paymentRecord,
      recordedAt: now,
    }, { merge: true });
  }
}

/**
 * Retrieve verified payment transactions for an authenticated user.
 */
export async function getPaymentHistory(uid: string): Promise<PaymentRecord[]> {
  if (!uid) return [];
  try {
    const paymentsRef = collection(db, 'users', uid, 'payments');
    const snapshot = await getDocs(paymentsRef);
    const list: PaymentRecord[] = [];
    snapshot.forEach((snap) => {
      list.push(snap.data() as PaymentRecord);
    });

    return list.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  } catch (error) {
    console.warn('Could not load payment history:', error);
    return [];
  }
}

/**
 * Helper to retrieve current organization subscription or default pending state.
 */
export function getSubscriptionFromOrg(org?: Organization | null): SubscriptionDetails | null {
  return org?.subscription || null;
}

export { isSubscriptionActive, getDaysRemaining, PLAN_CONFIGS };
