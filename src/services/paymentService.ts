/**
 * Payment Service (Razorpay Standard Checkout SDK wrapper)
 * 
 * Handles client-side Razorpay modal invocation safely:
 * - Dynamically loads https://checkout.razorpay.com/v1/checkout.js
 * - Handles callbacks for successful payment, dismissal, and failure
 * - Never includes or handles secret keys
 */

import { PlanId, PLAN_CONFIGS } from '../config/plans';
import { createSubscriptionOrder, verifySubscriptionPayment, VerifyPaymentResponse } from './subscriptionService';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface CheckoutOptions {
  planId: PlanId;
  organizationId: string;
  uid: string;
  userEmail?: string;
  userName?: string;
  businessName?: string;
  onSuccess: (response: VerifyPaymentResponse) => void;
  onError: (errorMsg: string) => void;
  onDismiss?: () => void;
}

/**
 * Dynamically load Razorpay checkout script if not already present.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay checkout SDK.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Open Razorpay Standard Checkout in TEST MODE.
 */
export async function launchRazorpayCheckout(options: CheckoutOptions): Promise<void> {
  const { planId, organizationId, uid, userEmail, userName, businessName, onSuccess, onError, onDismiss } = options;

  try {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      onError('Unable to load payment gateway. Please check your internet connection.');
      return;
    }

    // 1. Create server-side Razorpay Order
    const orderData = await createSubscriptionOrder(planId, organizationId, uid);
    const plan = PLAN_CONFIGS[planId];

    // 2. Configure Razorpay Standard Checkout options
    const rzpOptions = {
      key: orderData.keyId,
      amount: orderData.amount, // in paise
      currency: orderData.currency || 'INR',
      name: 'BizPilot AI',
      description: `${plan.name} Plan (30 Days Access)`,
      image: 'https://cdn-icons-png.flaticon.com/512/9908/9908354.png',
      order_id: orderData.orderId,
      prefill: {
        name: userName || businessName || 'MSME Owner',
        email: userEmail || '',
        contact: '',
      },
      notes: {
        planId,
        organizationId,
        uid,
      },
      theme: {
        color: '#9333ea', // Brand purple
      },
      modal: {
        ondismiss: () => {
          if (onDismiss) onDismiss();
        },
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          // 3. Server-side verification of HMAC SHA256 signature
          const verificationResult = await verifySubscriptionPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            planId,
            organizationId,
            uid,
            userEmail,
          });

          if (verificationResult.verified) {
            onSuccess(verificationResult);
          } else {
            onError('Payment signature verification failed. Subscription was not activated.');
          }
        } catch (err: any) {
          onError(err.message || 'Error occurred during payment verification.');
        }
      },
    };

    const rzpInstance = new window.Razorpay(rzpOptions);
    rzpInstance.on('payment.failed', (failResponse: any) => {
      console.warn('Payment failed:', failResponse);
      const desc = failResponse?.error?.description || 'Payment was not completed. You may try again.';
      onError(desc);
    });

    rzpInstance.open();
  } catch (error: any) {
    onError(error.message || 'Failed to initiate checkout.');
  }
}
