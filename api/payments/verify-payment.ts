import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';
import { PLAN_CONFIGS, PlanId, calculateExpiryDate } from '../../src/config/plans';

function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const body = await parseJsonBody(req);
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      organizationId,
      uid,
      userEmail,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing Razorpay verification credentials.' }));
      return;
    }

    if (!planId || !PLAN_CONFIGS[planId as PlanId]) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid subscription plan.' }));
      return;
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_placeholder';

    // Official Razorpay HMAC SHA256 Signature Verification:
    // text = razorpay_order_id + "|" + razorpay_payment_id
    // signature = hmac_sha256(text, secret)
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.error('[Payment Verification Failed] Signature mismatch');
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Payment signature verification failed. Subscription not activated.' }));
      return;
    }

    const plan = PLAN_CONFIGS[planId as PlanId];
    const now = new Date();
    const startDate = now.toISOString();
    const expiryDate = calculateExpiryDate(now, plan.durationDays);

    const subscription = {
      plan: plan.id,
      status: 'active',
      startDate,
      expiryDate,
      amount: plan.priceINR,
      currency: 'INR',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      lastPaymentAt: startDate,
    };

    const paymentRecord = {
      id: razorpay_payment_id,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      uid: uid || '',
      organizationId: organizationId || '',
      plan: plan.id,
      amount: plan.priceINR,
      currency: 'INR',
      status: 'captured',
      createdAt: startDate,
      verifiedAt: startDate,
      provider: 'razorpay',
      userEmail: userEmail || '',
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: true,
        verified: true,
        subscription,
        paymentRecord,
      })
    );
  } catch (error: any) {
    console.error('[Payment Verification Error]:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message || 'Server error during payment verification.' }));
  }
}
