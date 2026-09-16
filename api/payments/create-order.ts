import type { IncomingMessage, ServerResponse } from 'http';
import Razorpay from 'razorpay';
import { PLAN_CONFIGS, PlanId } from '../../src/config/plans';
import { verifyAuthToken } from './verifyToken';

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
    console.error('[Create Order Error]: Missing Razorpay server credentials in environment.');
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Razorpay payment gateway is not properly configured on the server. Please contact support.' 
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
      res.end(JSON.stringify({ error: authErr.message || 'Unauthorized payment request.' }));
      return;
    }

    const body = await parseJsonBody(req);
    const { planId, organizationId, ownerId, uid } = body;

    // Reject cross-tenant spoofing attempts if client tries to pass an explicit ownerId/uid
    if ((ownerId && ownerId !== authenticatedUid) || (uid && uid !== authenticatedUid)) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Forbidden: Requesting user does not match organization owner.' }));
      return;
    }

    if (!organizationId || typeof organizationId !== 'string') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing organizationId for subscription.' }));
      return;
    }

    if (!planId || !PLAN_CONFIGS[planId as PlanId]) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid or unsupported plan specified.' }));
      return;
    }

    // Amount is STRICTLY derived from server-side PLAN_CONFIGS (never trusted from client)
    const plan = PLAN_CONFIGS[planId as PlanId];

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const receipt = `rcpt_${Date.now()}_${authenticatedUid.slice(0, 6)}`;
    const options = {
      amount: plan.amountPaise, // Derived STRICTLY server-side (₹1 = 100, ₹2 = 200 in test mode)
      currency: 'INR',
      receipt,
      notes: {
        planId: plan.id,
        planName: plan.name,
        organizationId: organizationId.trim(),
        uid: authenticatedUid,
        userEmail: authenticatedEmail,
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
