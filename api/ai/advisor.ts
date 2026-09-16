import type { IncomingMessage, ServerResponse } from 'http';
import { verifyAuthToken } from '../payments/verifyToken';
import { generateContent } from './geminiClient';
import {
  parseJsonBody,
  loadAndValidateOrganization,
  buildSanitizedContextPrompt,
} from './organizationContext';

const ADVISOR_SYSTEM_INSTRUCTION = `
You are BizPilot AI Business Advisor.
You provide advanced business and financial decision support using the supplied BizPilot financial analysis.
Never fabricate financial values.
Use the supplied deterministic metrics as the numerical source of truth.
Clearly distinguish actual values, assumptions and projections.
Provide practical recommendations with risks and next steps.

Format your response as a JSON object with these exact keys:
{
  "diagnosis": "Concise operational diagnostic based on provided financial metrics",
  "why": "Financial metric drivers explaining the diagnosis",
  "recommendation": "Strategic actionable recommendation",
  "expectedImpact": "Quantifiable projected impact on cash flow, runway or margins",
  "risk": "Risk considerations or downsides to guard against",
  "nextStep": "Immediate practical next action or simulation"
}
Respond with only the JSON object.
`.trim();

function parseAdvisorResponse(rawText: string): {
  diagnosis: string;
  why: string;
  recommendation: string;
  expectedImpact: string;
  risk: string;
  nextStep: string;
  rawText?: string;
} {
  try {
    // Strip markdown backticks if returned
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    const parsed = JSON.parse(cleaned);
    if (parsed.diagnosis || parsed.recommendation) {
      return {
        diagnosis: parsed.diagnosis || '',
        why: parsed.why || '',
        recommendation: parsed.recommendation || '',
        expectedImpact: parsed.expectedImpact || '',
        risk: parsed.risk || '',
        nextStep: parsed.nextStep || '',
      };
    }
  } catch {
    // If not strict JSON, parse structured markdown/text sections
  }

  // Fallback heuristic parser
  const getSection = (name: string, fallback: string) => {
    const regex = new RegExp(`${name}[:\\s]+([\\s\\S]*?)(?=(?:Why|Recommendation|Expected Impact|Risk|Next Step|$))`, 'i');
    const match = rawText.match(regex);
    return match ? match[1].trim() : fallback;
  };

  return {
    diagnosis: getSection('Diagnosis', rawText.slice(0, 200)),
    why: getSection('Why', ''),
    recommendation: getSection('Recommendation', ''),
    expectedImpact: getSection('Expected Impact', ''),
    risk: getSection('Risk', ''),
    nextStep: getSection('Next Step', ''),
    rawText,
  };
}

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
    const { prompt, query, organizationId, language = 'en', context } = body;
    const userPrompt = prompt || query;

    if (!userPrompt || typeof userPrompt !== 'string' || !userPrompt.trim()) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Question or prompt is required.' }));
      return;
    }

    if (!organizationId) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Organization ID is required for AI Business Advisor.' }));
      return;
    }

    // 2. Load Organization & Enforce Strict Professional Gating
    const orgContext = await loadAndValidateOrganization(
      authenticatedUid,
      authenticatedEmail,
      organizationId,
      authHeaderToken,
      context
    );

    // CRITICAL REQUIREMENT (Section 9): Server MUST enforce Professional plan restriction
    if (!orgContext.isAdminUser) {
      if (orgContext.plan !== 'professional') {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: 'AI Business Advisor is available on the Professional plan.',
            code: 'TIER_UPGRADE_REQUIRED',
          })
        );
        return;
      }

      if (!orgContext.isSubscriptionValid) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: 'Active Professional subscription required. Please renew your subscription to access AI Business Advisor.',
            code: 'SUBSCRIPTION_EXPIRED_OR_PENDING',
          })
        );
        return;
      }
    }

    // 3. Construct Prompt with Grounded Financial Telemetry
    const contextString = buildSanitizedContextPrompt(orgContext);
    const fullPrompt = `${contextString}\n\n[EXECUTIVE STRATEGIC QUERY]\n${userPrompt.trim()}`;

    // 4. Generate Response with Advisor Model (gemini-2.5-flash)
    const rawAdvisorReply = await generateContent({
      service: 'advisor',
      uid: authenticatedUid,
      systemInstruction: ADVISOR_SYSTEM_INSTRUCTION,
      userPrompt: fullPrompt,
      language: language === 'ta' ? 'ta' : 'en',
    });

    const structuredAdvice = parseAdvisorResponse(rawAdvisorReply);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: true,
        advice: structuredAdvice,
      })
    );
  } catch (err: any) {
    const status = err.status || 500;
    const isMissingKey = err.isMissingKey;
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');

    // Safe error message without exposing server secrets
    const errorMessage = isMissingKey
      ? 'AI service is temporarily unavailable. Please try again.'
      : err.message || 'AI service is temporarily unavailable. Please try again.';

    res.end(JSON.stringify({ error: errorMessage }));
  }
}
