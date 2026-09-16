import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

export type AIServiceType = 'assistant' | 'advisor';

export interface GenerateAIMessageOptions {
  service: AIServiceType;
  uid: string;
  systemInstruction: string;
  userPrompt: string;
  language?: 'en' | 'ta';
}

// In-memory sliding-window rate limiter per UID (max 20 requests per 60 seconds)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

export function checkRateLimit(uid: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const timestamps = rateLimitMap.get(uid) || [];
  const validTimestamps = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = validTimestamps[0];
    const retryAfter = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfter) };
  }

  validTimestamps.push(now);
  rateLimitMap.set(uid, validTimestamps);
  return { allowed: true };
}

/**
 * Ensures .env.local values are loaded into process.env if not already present
 */
function ensureEnvLoaded(): void {
  if (process.env.GEMINI_ASSISTANT_API_KEY && process.env.GEMINI_ADVISOR_API_KEY) {
    return;
  }
  try {
    const candidatePaths = [
      path.resolve(process.cwd(), '.env.local'),
      path.resolve(process.cwd(), '.env'),
      path.resolve(__dirname, '..', '..', '.env.local'),
      path.resolve(__dirname, '..', '..', '.env'),
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
          const eqIdx = trimmed.indexOf('=');
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
          if (key && val && !process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch {}
}

export function getGeminiApiKey(service: AIServiceType): string | undefined {
  ensureEnvLoaded();
  if (service === 'assistant') {
    return process.env.GEMINI_ASSISTANT_API_KEY;
  }
  return process.env.GEMINI_ADVISOR_API_KEY;
}

export function getGeminiModel(service: AIServiceType): string {
  // Assistant uses gemini-2.5-flash-lite; Advisor uses gemini-2.5-flash
  return service === 'assistant' ? 'gemini-2.5-flash-lite' : 'gemini-2.5-flash';
}

/**
 * Returns the candidate model identifiers in order of preference.
 * Accommodates Google's deprecation of 2.5 identifiers for newly created API keys.
 */
function getCandidateModels(service: AIServiceType): string[] {
  if (service === 'assistant') {
    return [
      'gemini-2.5-flash-lite',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-flash-lite-latest',
    ];
  }
  return [
    'gemini-2.5-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
  ];
}

/**
 * Call Google Gemini API securely on the server.
 * Uses official @google/genai SDK with fetch REST fallback.
 * Automatically tries candidate models if Google returns 404 (model deprecated for key).
 * Strictly prevents leaking API keys or secrets in logs or responses.
 */
export async function generateContent(options: GenerateAIMessageOptions): Promise<string> {
  const { service, uid, systemInstruction, userPrompt, language } = options;

  // 1. Rate Limiting Protection
  const rateCheck = checkRateLimit(uid);
  if (!rateCheck.allowed) {
    const err: any = new Error('Rate limit exceeded. Please wait a moment before sending another request.');
    err.status = 429;
    err.retryAfter = rateCheck.retryAfterSeconds;
    throw err;
  }

  // 2. Fetch Server API Key
  const apiKey = getGeminiApiKey(service);
  if (!apiKey || !apiKey.trim()) {
    console.error(`[AI Error]: ${service.toUpperCase()} API key is not configured in server environment.`);
    const err: any = new Error('AI service is temporarily unavailable. Please try again.');
    err.status = 503;
    err.isMissingKey = true;
    throw err;
  }

  const candidateModels = getCandidateModels(service);

  // Append explicit language direction to system prompt
  const languageInstruction =
    language === 'ta'
      ? '\nRespond fluently in Tamil (தமிழ்) using clear business terminology.'
      : '\nRespond fluently in English using clear business terminology.';

  const fullSystemInstruction = `${systemInstruction}${languageInstruction}`;

  const ai = new GoogleGenAI({ apiKey });

  // 3. Iterate through candidate models to handle Google model availability gracefully
  for (const model of candidateModels) {
    // Try primary @google/genai SDK
    try {
      const response = await ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction: fullSystemInstruction,
          temperature: 0.2, // Deterministic and factual
        },
      });

      const text = response.text;
      if (text && text.trim()) {
        return text.trim();
      }
    } catch (sdkError: any) {
      const msg = sdkError?.message || '';
      // If model not found (404 / deprecated for new keys), try next candidate
      if (msg.includes('404') || msg.includes('not found') || msg.includes('no longer available')) {
        continue;
      }
      // If other SDK failure, attempt REST fallback for this model
      try {
        const restResult = await callGeminiRestFallback(model, apiKey, fullSystemInstruction, userPrompt);
        if (restResult && restResult.trim()) {
          return restResult.trim();
        }
      } catch (restErr: any) {
        if (restErr.status === 404) {
          continue;
        }
      }
    }
  }

  throw new Error('AI service is temporarily unavailable. Please try again.');
}

/**
 * REST Fallback to Google Generative Language API
 */
async function callGeminiRestFallback(
  model: string,
  apiKey: string,
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        generationConfig: {
          temperature: 0.2,
        },
      }),
    });

    if (res.status === 404) {
      const err: any = new Error('Model not found');
      err.status = 404;
      throw err;
    }

    if (!res.ok) {
      console.error(`[Gemini REST Error]: HTTP ${res.status}`);
      const err: any = new Error('AI service is temporarily unavailable. Please try again.');
      err.status = res.status >= 500 ? 503 : 400;
      throw err;
    }

    const data: any = await res.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (text && text.trim()) {
      return text.trim();
    }

    throw new Error('AI service returned an empty response.');
  } catch (err: any) {
    if (err.status) throw err;
    console.error('[Gemini REST Network Error]:', err?.message || 'Unknown network error');
    const safeErr: any = new Error('AI service is temporarily unavailable. Please try again.');
    safeErr.status = 503;
    throw safeErr;
  }
}
