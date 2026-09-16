import type { IncomingMessage } from 'http';
import { isSubscriptionActive } from '../../src/config/plans';

const DEFAULT_ADMIN_EMAILS = [
  'admin@bizpilot.in',
  'manikandan@bizpilot.in',
  'admin@test.in',
];

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (DEFAULT_ADMIN_EMAILS.some((admin) => admin.toLowerCase() === normalized)) {
    return true;
  }
  const envAdminEmails = process.env.VITE_ADMIN_EMAILS || process.env.ADMIN_EMAILS;
  if (envAdminEmails && typeof envAdminEmails === 'string') {
    const customList = envAdminEmails.split(',').map((e) => e.trim().toLowerCase());
    if (customList.includes(normalized)) {
      return true;
    }
  }
  return false;
}

export interface ValidatedOrgContext {
  organizationId: string;
  organizationName: string;
  ownerId: string;
  plan: 'starter' | 'professional';
  subscriptionStatus: string;
  isSubscriptionValid: boolean;
  isAdminUser: boolean;
  financialMetrics: {
    monthlyRevenue: number;
    monthlyExpenses: number;
    monthlyNetCashFlow: number;
    operatingMarginPercent: number;
    currentCashBalance: number;
    runwayMonths: number;
    dscr: number | null;
    workingCapital: number;
    healthScore: number;
    fundingScore: number;
    creditLimit: string;
  };
  businessProfile: {
    industry: string;
    businessType: string;
    location: string;
    employees: number;
  };
}

// In-memory test store for mock testing
export const testOrgStore = new Map<string, any>();

export function parseJsonBody(req: IncomingMessage): Promise<any> {
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

function unwrapFirestoreValue(val: any): any {
  if (!val || typeof val !== 'object') return val;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return parseFloat(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('nullValue' in val) return null;
  if ('timestampValue' in val) return val.timestampValue;
  if ('mapValue' in val) {
    const fields = val.mapValue.fields || {};
    const res: Record<string, any> = {};
    for (const k of Object.keys(fields)) {
      res[k] = unwrapFirestoreValue(fields[k]);
    }
    return res;
  }
  if ('arrayValue' in val) {
    const values = val.arrayValue.values || [];
    return values.map(unwrapFirestoreValue);
  }
  return val;
}

export function unwrapFirestoreDocument(doc: any): any {
  if (!doc || !doc.fields) return doc;
  const result: Record<string, any> = {};
  for (const key of Object.keys(doc.fields)) {
    result[key] = unwrapFirestoreValue(doc.fields[key]);
  }
  return result;
}

/**
 * Fetch organization from Firestore using the user's verified token
 */
async function fetchOrganizationFromFirestore(
  organizationId: string,
  idToken: string
): Promise<any | null> {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    return null;
  }

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/organizations/${organizationId}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 404) return null;
    if (!res.ok) {
      console.warn(`[Firestore REST Warning]: HTTP ${res.status} fetching organization ${organizationId}`);
      return null;
    }

    const rawDoc = await res.json();
    return unwrapFirestoreDocument(rawDoc);
  } catch (err) {
    console.warn('[Firestore REST Error]:', err);
    return null;
  }
}

/**
 * Validates user authentication, enforces tenant isolation, loads the organization,
 * and extracts validated subscription and financial metrics.
 */
export async function loadAndValidateOrganization(
  authenticatedUid: string,
  userEmail: string,
  requestedOrgId: string,
  idToken: string,
  clientContext?: any
): Promise<ValidatedOrgContext> {
  const isAdminUser = isUserAdmin(userEmail);

  // 1. Check in-memory test store first (for automated unit & mock tests)
  let orgData: any = testOrgStore.get(requestedOrgId) || null;

  // 2. Query Firestore REST API if not found in test store
  if (!orgData && idToken) {
    orgData = await fetchOrganizationFromFirestore(requestedOrgId, idToken);
  }

  // 3. Fall back to validated client payload ONLY if ownerId matches authenticatedUid
  if (!orgData && clientContext) {
    const contextOwner = clientContext.ownerId || clientContext.organization?.ownerId;
    if (contextOwner && contextOwner === authenticatedUid) {
      orgData = clientContext.organization || clientContext;
    }
  }

  if (!orgData) {
    const err: any = new Error('Organization not found.');
    err.status = 404;
    throw err;
  }

  // Phase 8 / Section 8 Tenant Isolation: Verify ownership
  const rawOrg = orgData.organization || orgData;
  const ownerId = rawOrg.ownerId || orgData.ownerId;

  if (!isAdminUser && ownerId && ownerId !== authenticatedUid) {
    console.error(`[Cross-Tenant Breach Attempt]: User ${authenticatedUid} tried to access organization owned by ${ownerId}`);
    const err: any = new Error('Forbidden: You do not have permission to access this organization.');
    err.status = 403;
    throw err;
  }

  // Phase 9 / Section 9 Subscription Verification
  const sub = rawOrg.subscription || orgData.subscription || {};
  const plan: 'starter' | 'professional' =
    sub.plan === 'professional' ? 'professional' : 'starter';

  const isSubActive = isSubscriptionActive(sub);

  // Extract financial telemetry
  const fin = rawOrg.financialProfile || {};
  const norm = rawOrg.normalized || {};
  const monthlyRevenue = Number(fin.monthlyRevenue) || 0;
  const monthlyExpenses =
    Number(fin.totalMonthlyExpenses) ||
    Number(fin.monthlyOperatingExpenses || 0) +
      Number(fin.monthlyMaterialCost || 0) +
      Number(fin.monthlySalaryCost || 0);

  const monthlyNetCashFlow =
    Number(fin.monthlyNetCashFlow) || monthlyRevenue - monthlyExpenses;
  const operatingMarginPercent =
    monthlyRevenue > 0 ? Math.round(((monthlyRevenue - monthlyExpenses) / monthlyRevenue) * 100) : 0;
  const currentCashBalance = Number(fin.currentCashBalance || norm.currentCashBalance || 0);
  const runwayMonths =
    monthlyExpenses > 0
      ? Math.max(0, parseFloat((currentCashBalance / monthlyExpenses).toFixed(1)))
      : 0;

  const dscr = fin.dscr !== undefined ? Number(fin.dscr) : null;
  const workingCapital = Number(fin.workingCapital || currentCashBalance);
  const healthScore = Number(rawOrg.health?.overallScore || rawOrg.healthScore || 70);
  const fundingScore = Number(rawOrg.funding?.overallScore || rawOrg.fundingScore || 65);
  const creditLimit = rawOrg.funding?.estimatedCreditLimit || '₹10 - ₹25 Lakhs';

  const busProf = rawOrg.businessProfile || {};

  return {
    organizationId: requestedOrgId,
    organizationName: rawOrg.name || rawOrg.businessName || busProf.businessName || 'MSME Enterprise',
    ownerId: ownerId || authenticatedUid,
    plan,
    subscriptionStatus: sub.status || 'pending',
    isSubscriptionValid: isSubActive,
    isAdminUser,
    financialMetrics: {
      monthlyRevenue,
      monthlyExpenses,
      monthlyNetCashFlow,
      operatingMarginPercent,
      currentCashBalance,
      runwayMonths,
      dscr,
      workingCapital,
      healthScore,
      fundingScore,
      creditLimit,
    },
    businessProfile: {
      industry: busProf.industry || 'Manufacturing & Services',
      businessType: busProf.businessType || 'Private Limited',
      location: busProf.location || 'India',
      employees: Number(busProf.numberOfEmployees || 10),
    },
  };
}

/**
 * Formats validated organization metrics into a concise context payload for Gemini
 * Strictly omits tokens, passwords, payment credentials, or personal secrets.
 */
export function buildSanitizedContextPrompt(ctx: ValidatedOrgContext): string {
  const fin = ctx.financialMetrics;
  const bus = ctx.businessProfile;

  return `
[BIZPILOT VERIFIED ORGANIZATION DATA]
- Business Name: ${ctx.organizationName}
- Industry: ${bus.industry}
- Business Type: ${bus.businessType}
- Location: ${bus.location}
- Employees: ${bus.employees}
- Subscription Tier: ${ctx.plan.toUpperCase()}

[DETERMINISTIC FINANCIAL METRICS (SOURCE OF TRUTH)]
- Monthly Revenue: ₹${(fin.monthlyRevenue / 100000).toFixed(2)} Lakhs
- Total Monthly Outflow/Expenses: ₹${(fin.monthlyExpenses / 100000).toFixed(2)} Lakhs
- Net Monthly Cash Flow: ₹${(fin.monthlyNetCashFlow / 100000).toFixed(2)} Lakhs
- Operating Margin: ${fin.operatingMarginPercent}%
- Liquid Cash Reserves: ₹${(fin.currentCashBalance / 100000).toFixed(2)} Lakhs
- Cash Runway: ${fin.runwayMonths} months
- Debt Service Coverage Ratio (DSCR): ${fin.dscr !== null ? `${fin.dscr}x` : 'Debt-Free'}
- Working Capital: ₹${(fin.workingCapital / 100000).toFixed(2)} Lakhs
- Financial Health Score: ${fin.healthScore}/100
- Funding Readiness Score: ${fin.fundingScore}/100
- Estimated Credit Capacity: ${fin.creditLimit}
`.trim();
}
