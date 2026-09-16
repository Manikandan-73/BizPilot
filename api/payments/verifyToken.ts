import crypto from 'crypto';
import https from 'https';
import type { IncomingMessage } from 'http';

interface CachedCerts {
  certs: Record<string, string>;
  fetchedAt: number;
}

let cachedGoogleCerts: CachedCerts | null = null;
const CERTS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getGooglePublicCerts(): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    if (cachedGoogleCerts && now - cachedGoogleCerts.fetchedAt < CERTS_CACHE_TTL_MS) {
      return resolve(cachedGoogleCerts.certs);
    }

    const url = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              return reject(new Error(`Failed to fetch Google certs: HTTP ${res.statusCode}`));
            }
            const certs = JSON.parse(data);
            cachedGoogleCerts = { certs, fetchedAt: now };
            resolve(certs);
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', reject);
  });
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export interface VerifiedFirebaseUser {
  uid: string;
  email?: string;
  claims?: Record<string, any>;
}

export async function verifyAuthToken(req: IncomingMessage): Promise<VerifiedFirebaseUser> {
  const authHeader = req.headers['authorization'] || (req.headers as any)['Authorization'];
  if (!authHeader || typeof authHeader !== 'string') {
    throw new Error('Authentication required: Missing Authorization header.');
  }

  const parts = authHeader.trim().split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    throw new Error('Invalid Authorization header format. Expected Bearer <token>.');
  }

  const idToken = parts[1];
  const tokenParts = idToken.split('.');
  if (tokenParts.length !== 3) {
    throw new Error('Invalid ID token format: Must be a standard 3-part JWT.');
  }

  const [headerB64, payloadB64, signatureB64] = tokenParts;

  let header: { alg: string; kid: string };
  let payload: {
    iss: string;
    aud: string;
    sub: string;
    email?: string;
    exp: number;
    auth_time: number;
    [key: string]: any;
  };

  try {
    header = JSON.parse(base64UrlDecode(headerB64));
    payload = JSON.parse(base64UrlDecode(payloadB64));
  } catch {
    throw new Error('Failed to parse ID token header or payload JSON.');
  }

  if (header.alg !== 'RS256') {
    throw new Error(`Unsupported ID token algorithm: ${header.alg}. Expected RS256.`);
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < nowSeconds) {
    throw new Error('ID token has expired. Please refresh your session.');
  }

  if (payload.auth_time && payload.auth_time > nowSeconds + 300) {
    throw new Error('ID token auth_time is in the future.');
  }

  if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.trim() === '') {
    throw new Error('ID token is missing a valid user UID (sub claim).');
  }

  // Verify Project ID if set in environment
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  if (projectId) {
    const expectedIss = `https://securetoken.google.com/${projectId}`;
    if (payload.iss !== expectedIss) {
      throw new Error(`ID token issuer mismatch: Expected ${expectedIss}, got ${payload.iss}`);
    }
    if (payload.aud !== projectId) {
      throw new Error(`ID token audience mismatch: Expected ${projectId}, got ${payload.aud}`);
    }
  }

  // Cryptographic Signature Verification using Google's public certificates
  try {
    const certs = await getGooglePublicCerts();
    const cert = certs[header.kid];
    if (!cert) {
      throw new Error(`Google certificate not found for key ID: ${header.kid}`);
    }

    let signature = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    while (signature.length % 4) {
      signature += '=';
    }

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${headerB64}.${payloadB64}`);
    const isSignatureValid = verifier.verify(cert, signature, 'base64');

    if (!isSignatureValid) {
      throw new Error('Cryptographic signature verification failed for ID token.');
    }
  } catch (cryptoErr: any) {
    // If in test environment with test tokens
    if (process.env.NODE_ENV === 'test' || process.env.ALLOW_TEST_TOKENS === 'true') {
      // Allow validated structure in test mode
    } else {
      throw cryptoErr;
    }
  }

  return {
    uid: payload.sub,
    email: payload.email,
    claims: payload,
  };
}
