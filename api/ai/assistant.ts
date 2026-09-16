import type { IncomingMessage, ServerResponse } from 'http';
import { verifyAuthToken } from '../payments/verifyToken';
import { generateContent } from './geminiClient';
import {
  parseJsonBody,
  loadAndValidateOrganization,
  buildSanitizedContextPrompt,
} from './organizationContext';

const ASSISTANT_SYSTEM_INSTRUCTION = `
You are BizPilot AI Business Assistant.
Help MSME users understand business operations, finance, planning and growth.
Use provided BizPilot data when available.
Never fabricate financial information.
Do not invent GSTIN, Udyam registration, DSCR, runway, revenue, or expenses.
If data is unavailable, explicitly state that it is unavailable.
Clearly distinguish known values from assumptions or projections.
The provided deterministic metrics are the numerical source of truth.
`.trim();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // CORS & Method Check
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // 1. Server-Side Authentication & ID-Token Verification
  let authenticatedUid = '';
  let authenticatedEmail = '';
  let authHeaderToken = '';

  try {
    const authHeader = req.headers['authorization'] || (req.headers as any)['Authorization'];
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      authHeaderToken = authHeader.split(' ')[1];
    }
    const verifiedUser = await verifyAuthToken(req);
    authenticatedUid = verifiedUser.uid;
    authenticatedEmail = verifiedUser.email || '';
  } catch (authErr: any) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: authErr.message || 'Authentication required: Invalid or missing token.' }));
    return;
  }

  try {
    const body = await parseJsonBody(req);
    const { prompt, organizationId, language = 'en', context } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Prompt is required.' }));
      return;
    }

    // 2. Load Organization & Enforce Tenant Isolation
    let orgContextString = '';
    if (organizationId) {
      try {
        const orgContext = await loadAndValidateOrganization(
          authenticatedUid,
          authenticatedEmail,
          organizationId,
          authHeaderToken,
          context
        );

        // Verify Platform Access: Starter or Professional allowed if active
        if (!orgContext.isAdminUser && !orgContext.isSubscriptionValid) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: 'Access denied: Active subscription required to access BizPilot AI Assistant.',
            })
          );
          return;
        }

        orgContextString = buildSanitizedContextPrompt(orgContext);
      } catch (orgErr: any) {
        if (orgErr.status === 403) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: orgErr.message || 'Forbidden: Cross-tenant access denied.' }));
          return;
        }
        // If organization not found, proceed with general business assistance without injecting context
      }
    }

    // 3. Construct Prompt with Sanitized Context
    const finalPrompt = orgContextString
      ? `${orgContextString}\n\n[USER QUERY]\n${prompt.trim()}`
      : prompt.trim();

    // 4. Generate Response with Assistant Model (gemini-2.5-flash-lite)
    const replyText = await generateContent({
      service: 'assistant',
      uid: authenticatedUid,
      systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION,
      userPrompt: finalPrompt,
      language: language === 'ta' ? 'ta' : 'en',
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, text: replyText }));
  } catch (err: any) {
    const status = err.status || 500;
    const isMissingKey = err.isMissingKey;
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');

    // Safe error message, never leak secrets or stack traces
    const errorMessage = isMissingKey
      ? 'AI service is temporarily unavailable. Please try again.'
      : err.message || 'AI service is temporarily unavailable. Please try again.';

    res.end(JSON.stringify({ error: errorMessage }));
  }
}
