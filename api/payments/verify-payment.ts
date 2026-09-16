import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { PLAN_CONFIGS, PlanId, calculateExpiryDate } from '../../src/config/plans';
import { verifyAuthToken } from './verifyToken';

// Server-side idempotency cache to prevent duplicate activation or period extension on replayed verifications
const verifiedPaymentsMap = new Map<string, {
  subscription: any;
  paymentRecord: any;
  verificationReceipt: string;
}>();

function parseJsonBody(req: IncomingMessage): Promise<any> {
  // Support pre-parsed request body in serverless environments (Vercel, Express, etc.)
  if ((req as any).body) {
    if (typeof (req as any).body === 'object') {
      return Promise.resolve((req as any).body);
    }
    if (typeof (req as any).body === 'string') {
      try {
        return Promise.resolve(JSON.parse((req as any).body));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  }

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

  // 1. FAIL CLOSED on missing Razorpay credentials (supports both TEST and LIVE modes)
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('[Payment Verification Error]: Missing Razorpay server credentials in environment.');
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Payment verification service is temporarily unavailable. Please contact support.' 
    }));
    return;
  }

  try {
    // 2. Server-side Authentication & ID-Token Verification
    let authenticatedUid = '';
    let authenticatedEmail = '';

    try {
      const verifiedUser = await verifyAuthToken(req);
      authenticatedUid = verifiedUser.uid;
      authenticatedEmail = verifiedUser.email || '';
    } catch (authErr: any) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: authErr.message || 'Unauthorized payment verification request.' }));
      return;
    }

    const body = await parseJsonBody(req);
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      organizationId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing Razorpay payment verification credentials.' }));
      return;
    }

    if (!planId || !PLAN_CONFIGS[planId as PlanId]) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid subscription plan.' }));
      return;
    }

    // 2.1 Idempotency Check: Replaying the same payment verification returns the original result without extending duration
    if (verifiedPaymentsMap.has(razorpay_payment_id)) {
      const existing = verifiedPaymentsMap.get(razorpay_payment_id)!;
      console.log(`[Payment Verification Idempotent Replay]: Payment ${razorpay_payment_id} already verified.`);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: true,
          verified: true,
          already_verified: true,
          subscription: existing.subscription,
          paymentRecord: existing.paymentRecord,
          verificationReceipt: existing.verificationReceipt,
        })
      );
      return;
    }

    // 3. Official Razorpay HMAC SHA256 Signature Verification (Cryptographically timing-safe)
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const providedBuffer = Buffer.from(razorpay_signature, 'utf8');

    if (
      expectedBuffer.length !== providedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      console.error('[Payment Verification Failed]: Signature mismatch.');
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Payment signature verification failed. Subscription not activated.' }));
      return;
    }

    // 4. Server-Side Razorpay API Verification
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.fetch(razorpay_order_id);
    if (!order) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Specified Razorpay order does not exist.' }));
      return;
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (!payment) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Specified Razorpay payment does not exist.' }));
      return;
    }

    // Confirm payment belongs to order
    if (payment.order_id !== razorpay_order_id) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Payment does not match the provided Razorpay order ID.' }));
      return;
    }

    // Confirm currency is INR
    if (payment.currency !== 'INR' || order.currency !== 'INR') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Payment currency must be INR.' }));
      return;
    }

    // Confirm payment is captured or authorized
    if (payment.status !== 'captured' && payment.status !== 'authorized') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: `Payment status is ${payment.status}. Subscription requires a successful payment.` }));
      return;
    }

    const plan = PLAN_CONFIGS[planId as PlanId];

    // Confirm amount matches the selected plan in paise
    if (Number(payment.amount) !== plan.amountPaise || Number(order.amount) !== plan.amountPaise) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Paid amount does not match the required plan amount.' }));
      return;
    }

    // Confirm organization & user match notes in order to prevent cross-tenant activation
    const orderNotes = (order.notes || {}) as Record<string, any>;
    if (orderNotes.uid && orderNotes.uid !== authenticatedUid) {
      console.error('[Cross-Tenant Breach Attempt]: Order uid notes do not match authenticated UID.');
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Forbidden: Payment does not belong to the authenticated user.' }));
      return;
    }

    if (orderNotes.organizationId && organizationId && orderNotes.organizationId !== organizationId) {
      console.error('[Cross-Tenant Breach Attempt]: Order organizationId notes do not match requested organization.');
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Forbidden: Payment was created for a different organization.' }));
      return;
    }

    // 5. Server-Authoritative Subscription Generation (30 Days Access)
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
      uid: authenticatedUid,
      organizationId: organizationId || orderNotes.organizationId || '',
      plan: plan.id,
      amount: plan.priceINR,
      currency: 'INR',
      status: 'captured',
      createdAt: startDate,
      verifiedAt: startDate,
      provider: 'razorpay',
      userEmail: authenticatedEmail || orderNotes.userEmail || '',
    };

    const verificationReceipt = crypto
      .createHmac('sha256', keySecret)
      .update(`${authenticatedUid}|${organizationId}|${plan.id}|${razorpay_payment_id}|${expiryDate}`)
      .digest('hex');

    // 6. Cache verified payment for deterministic idempotency
    verifiedPaymentsMap.set(razorpay_payment_id, {
      subscription,
      paymentRecord,
      verificationReceipt,
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: true,
        verified: true,
        subscription,
        paymentRecord,
        verificationReceipt,
      })
    );
  } catch (error: any) {
    console.error('[Payment Verification Error]:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message || 'Server error during payment verification.' }));
  }
}
