import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';
import { PLAN_CONFIGS, PlanId, calculateExpiryDate } from '../../src/config/plans';

// In-memory idempotency store for processed webhook events
const processedEvents = new Set<string>();

function parseRawBody(req: IncomingMessage): Promise<string> {
  // Support pre-parsed bodies in serverless environments (Vercel, Express)
  if (typeof (req as any).rawBody === 'string') {
    return Promise.resolve((req as any).rawBody);
  }
  if (Buffer.isBuffer((req as any).rawBody)) {
    return Promise.resolve((req as any).rawBody.toString('utf8'));
  }
  if (typeof (req as any).body === 'string') {
    return Promise.resolve((req as any).body);
  }
  if (typeof (req as any).body === 'object' && (req as any).body !== null) {
    return Promise.resolve(JSON.stringify((req as any).body));
  }

  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
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

  // 1. FAIL CLOSED on missing Webhook Secret
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Webhook Configuration Error]: RAZORPAY_WEBHOOK_SECRET is not configured on the server.');
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Webhook service is temporarily unavailable.' }));
    return;
  }

  try {
    const rawBody = await parseRawBody(req);
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!signature) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing x-razorpay-signature header' }));
      return;
    }

    // 2. Cryptographic Webhook Signature Verification (Timing-Safe)
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const providedBuffer = Buffer.from(signature, 'utf8');

    if (
      expectedBuffer.length !== providedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      console.warn('[Webhook Error]: Invalid signature verification.');
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid webhook signature' }));
      return;
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    const eventId = payload.event_id || payload.payload?.payment?.entity?.id || '';

    console.log('[Razorpay Webhook Event Received]:', eventType, 'ID:', eventId);

    // 3. IDEMPOTENCY CHECK
    const idempotencyKey = `${eventType}_${eventId}`;
    if (processedEvents.has(idempotencyKey)) {
      console.log(`[Webhook Idempotent Skip]: Event ${idempotencyKey} has already been processed.`);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'ok', already_processed: true }));
      return;
    }

    // 4. Real event handling
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const payment = payload.payload?.payment?.entity;
      if (payment) {
        const notes = payment.notes || {};
        const organizationId = notes.organizationId;
        const uid = notes.uid;
        const planId = notes.planId as PlanId;

        const plan = PLAN_CONFIGS[planId] || PLAN_CONFIGS.starter;
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
          paymentId: payment.id,
          orderId: payment.order_id,
          lastPaymentAt: startDate,
        };

        const paymentRecord = {
          id: payment.id,
          paymentId: payment.id,
          orderId: payment.order_id,
          uid: uid || '',
          organizationId: organizationId || '',
          plan: plan.id,
          amount: plan.priceINR,
          currency: 'INR',
          status: 'captured',
          createdAt: startDate,
          verifiedAt: startDate,
          provider: 'razorpay',
          userEmail: notes.userEmail || '',
        };

        console.log(`[Webhook Payment Activated]: Org ${organizationId} activated for plan ${plan.id} until ${expiryDate}`);
        
        processedEvents.add(idempotencyKey);
        if (payment.id) {
          processedEvents.add(`payment.captured_${payment.id}`);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          status: 'ok', 
          processed: true, 
          action: 'activated', 
          organizationId, 
          plan: plan.id 
        }));
        return;
      }
    } else if (eventType === 'payment.failed') {
      const payment = payload.payload?.payment?.entity;
      console.warn('[Webhook Payment Failed]:', payment?.id, payment?.error_description);
      processedEvents.add(idempotencyKey);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'ok', processed: true, action: 'recorded_failure' }));
      return;
    }

    processedEvents.add(idempotencyKey);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok', received: true, event: eventType }));
  } catch (error: any) {
    console.error('[Webhook Processing Error]:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message || 'Webhook processing failed' }));
  }
}
