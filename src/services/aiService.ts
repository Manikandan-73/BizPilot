/**
 * AI Service (Client-Side)
 * 
 * Provides client-side helpers to communicate with BizPilot AI server endpoints:
 * - /api/ai/assistant (Powered by GEMINI_ASSISTANT_API_KEY & gemini-2.5-flash-lite)
 * - /api/ai/advisor (Powered by GEMINI_ADVISOR_API_KEY & gemini-2.5-flash)
 * 
 * Cryptographically attaches the authenticated Firebase user's ID token.
 * Never handles or exposes API keys in client-side code.
 */

import { auth } from '../lib/firebase';

export interface AssistantOptions {
  organizationId?: string;
  language?: 'en' | 'ta';
  context?: any;
}

export interface AdvisorOptions {
  organizationId: string;
  language?: 'en' | 'ta';
  context?: any;
}

export interface AdvisorAdvice {
  diagnosis: string;
  why: string;
  recommendation: string;
  expectedImpact?: string;
  risk?: string;
  nextStep?: string;
  rawText?: string;
}

/**
 * Helper to obtain the current user's Firebase ID token
 */
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in to use BizPilot AI.');
  }
  return await user.getIdToken();
}

/**
 * Send request to AI Business Assistant (/api/ai/assistant)
 * Available to all active Starter and Professional users.
 */
export async function askAIAssistant(
  prompt: string,
  options?: AssistantOptions
): Promise<string> {
  const token = await getAuthToken();

  const response = await fetch('/api/ai/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      prompt,
      organizationId: options?.organizationId,
      language: options?.language || 'en',
      context: options?.context,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'AI Business Assistant is temporarily unavailable.');
  }

  return data.text || '';
}

/**
 * Send request to AI Business Advisor (/api/ai/advisor)
 * Strictly gated on server for Professional users.
 */
export async function askAIAdvisor(
  query: string,
  options: AdvisorOptions
): Promise<AdvisorAdvice> {
  const token = await getAuthToken();

  const response = await fetch('/api/ai/advisor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query,
      organizationId: options.organizationId,
      language: options.language || 'en',
      context: options.context,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error: any = new Error(data.error || 'AI Business Advisor is temporarily unavailable.');
    error.status = response.status;
    error.code = data.code;
    throw error;
  }

  return data.advice;
}
