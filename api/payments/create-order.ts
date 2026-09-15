import type { IncomingMessage, ServerResponse } from 'http';
import Razorpay from 'razorpay';
import { PLAN_CONFIGS, PlanId } from '../../src/config/plans';

// Helper to parse JSON body
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
    const { planId, organizationId, uid } = body;

    if (!planId || !PLAN_CONFIGS[planId as PlanId]) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid or unsupported plan specified.' }));
      return;
    }

    const plan = PLAN_CONFIGS[planId as PlanId];
    // Razorpay credentials from server-side environment variables
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_placeholder';

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const receipt = 'rcpt_' + Date.now() + '_' + (uid ? uid.slice(0, 6) : 'msme');
    const options = {
      amount: plan.amountPaise, // Server-derived amount (₹499 = 49900, ₹999 = 99900)
      currency: 'INR',
      receipt,
      notes: {
        planId: plan.id,
        planName: plan.name,
        organizationId: organizationId || '',
        uid: uid || '',
      },
    };

    const order = await razorpay.orders.create(options);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId,
        planName: plan.name,
        durationDays: plan.durationDays,
      })
    );
  } catch (error: any) {
    console.error('[Create Order Error]:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message || 'Failed to initialize payment order.' }));
  }
}
