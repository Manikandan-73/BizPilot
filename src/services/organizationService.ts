/**
 * Organization Persistence & Selection Service (Firebase Firestore)
 *
 * Handles:
 * - Multi-business persistence under `organizations/{id}` with strict `ownerId`
 * - Loading organizations by authenticated Firebase `ownerId`
 * - Document retrieval, updates, and listings
 * - Active business selection persistence (localStorage + Firestore `appSettings/preferences`)
 * - User-scoped onboarding draft saving and retrieval
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OnboardingRecord, Organization } from '../types/business';
import { OnboardingDraft } from '../types/onboarding';

const LOCAL_STORAGE_SELECTED_ORG_KEY = 'bizpilot_selected_organization_id';

function getOrganizationCollection() {
  return collection(db, 'organizations');
}

function getDraftDocument(userId?: string) {
  if (userId) {
    return doc(db, 'onboardingDrafts', userId);
  }
  return doc(db, 'appSettings', 'onboardingDraft');
}

function getPreferencesDocument() {
  return doc(db, 'appSettings', 'preferences');
}

/**
 * Save a newly onboarded organization to Firestore.
 * Ensures ownerId is indexed at both root document and organization object.
 */
export async function saveOrganizationRecord(record: OnboardingRecord): Promise<OnboardingRecord> {
  const now = new Date().toISOString();
  const ownerId = record.organization.ownerId || record.ownerId || record.user.id;
  const ownerEmail = record.organization.ownerEmail || record.ownerEmail || record.user.email;

  // Phase 8 Hardening: Reject missing or fake fallback UIDs
  if (!ownerId || ownerId.startsWith('user-') || ownerId.trim() === '') {
    throw new Error('Security Error: An authenticated Firebase user UID is strictly required to create an organization. Fake user IDs are not permitted.');
  }

  const organization: Organization = {
    ...record.organization,
    ownerId,
    ownerEmail,
    createdAt: record.organization.createdAt || now,
    updatedAt: now,
  };

  const savedRecord: OnboardingRecord = {
    ownerId,
    ownerEmail,
    user: record.user,
    organization,
  };

  // Storing ownerId at root level is required for Firestore Security Rules
  await setDoc(doc(getOrganizationCollection(), organization.id), {
    ...savedRecord,
    ownerId,
    ownerEmail,
  });

  await saveSelectedOrganizationId(organization.id);
  return savedRecord;
}

/**
 * Update an existing organization in Firestore.
 */
export async function updateOrganizationRecord(organization: Organization): Promise<void> {
  const orgDocRef = doc(getOrganizationCollection(), organization.id);
  const existingSnap = await getDoc(orgDocRef);
  const existingData = existingSnap.exists() ? (existingSnap.data() as any) : null;
  const existingOrg: Organization | undefined = existingData?.organization || existingData;

  // Phase 8 Hardening: Protect sensitive billing and ownership fields from client-side tampering
  const sanitizedOrganization: Organization = {
    ...organization,
    ownerId: existingOrg?.ownerId || organization.ownerId,
    ownerEmail: existingOrg?.ownerEmail || organization.ownerEmail,
    subscription: existingOrg?.subscription || organization.subscription,
    accessStatus: existingOrg?.accessStatus || organization.accessStatus,
    accountStatus: existingOrg?.accountStatus || organization.accountStatus,
    registrationStatus: existingOrg?.registrationStatus || organization.registrationStatus,
    updatedAt: new Date().toISOString(),
  };

  await updateDoc(orgDocRef, {
    organization: sanitizedOrganization,
    updatedAt: sanitizedOrganization.updatedAt,
    ...(sanitizedOrganization.ownerId ? { ownerId: sanitizedOrganization.ownerId } : {}),
    ...(sanitizedOrganization.ownerEmail ? { ownerEmail: sanitizedOrganization.ownerEmail } : {}),
  });
}

/**
/**
 * Load ALL organizations owned by a specific Firebase UID.
 * Supports users with multiple registered MSME businesses.
 */
export async function loadOrganizationsByOwnerId(ownerId: string): Promise<OnboardingRecord[]> {
  if (!ownerId) return [];

  const recordsMap = new Map<string, OnboardingRecord>();

  try {
    // 1. Query by root ownerId
    const qRoot = query(getOrganizationCollection(), where('ownerId', '==', ownerId));
    const snapshotRoot = await getDocs(qRoot);
    snapshotRoot.forEach((docSnap) => {
      const data = docSnap.data() as any;
      if (data?.organization) {
        recordsMap.set(docSnap.id, {
          ...data,
          organization: {
            ...data.organization,
            id: docSnap.id,
            ownerId: data.ownerId || data.organization.ownerId || ownerId,
          },
        } as OnboardingRecord);
      } else if (data?.businessProfile) {
        recordsMap.set(docSnap.id, {
          ownerId,
          ownerEmail: data.ownerEmail,
          user: { id: ownerId, name: data.businessProfile?.businessName || 'MSME Owner', email: data.ownerEmail || '' },
          organization: {
            id: docSnap.id,
            ownerId,
            ...data,
          },
        });
      }
    });

    // 2. Query by nested organization.ownerId (for backwards compatibility)
    const qNested = query(getOrganizationCollection(), where('organization.ownerId', '==', ownerId));
    const snapshotNested = await getDocs(qNested);
    snapshotNested.forEach((docSnap) => {
      if (!recordsMap.has(docSnap.id)) {
        const data = docSnap.data() as any;
        if (data?.organization) {
          recordsMap.set(docSnap.id, {
            ...data,
            organization: {
              ...data.organization,
              id: docSnap.id,
              ownerId: data.ownerId || data.organization.ownerId || ownerId,
            },
          } as OnboardingRecord);
        }
      }
    });
  } catch (error) {
    console.warn('Error loading organizations by ownerId:', error);
  }

  const list = Array.from(recordsMap.values());
  return list.sort((a, b) => {
    const dateA = a.organization.updatedAt || a.organization.createdAt || '';
    const dateB = b.organization.updatedAt || b.organization.createdAt || '';
    return dateB.localeCompare(dateA);
  });
}

/**
 * Load organization owned by a specific Firebase UID (defaults to most recently updated).
 * Strict MSME single-tenant loader.
 */
export async function loadOrganizationByOwnerId(ownerId: string): Promise<OnboardingRecord | null> {
  const all = await loadOrganizationsByOwnerId(ownerId);
  return all[0] ?? null;
}

export function saveSelectedUserOrgId(userId: string, orgId: string): void {
  try {
    localStorage.setItem(`bizpilot_active_org_${userId}`, orgId);
  } catch {
    // Ignore storage issues
  }
}

export function loadSelectedUserOrgId(userId: string): string | null {
  try {
    return localStorage.getItem(`bizpilot_active_org_${userId}`);
  } catch {
    return null;
  }
}

/**
 * Load all organizations from Firestore, sorted by most recently updated first.
 */
export async function loadOrganizationRecords(): Promise<OnboardingRecord[]> {
  const snapshot = await getDocs(getOrganizationCollection());
  const records: OnboardingRecord[] = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as any;
    // Handle both { user, organization } wrapper and direct Organization document
    if (data?.organization) {
      records.push(data as OnboardingRecord);
    } else if (data?.businessProfile) {
      records.push({
        user: { id: 'default', name: 'MSME Owner', email: 'owner@bizpilot.in' },
        organization: {
          id: docSnap.id,
          ...data,
        },
      });
    }
  });

  return records.sort((a, b) => {
    const dateA = a.organization.updatedAt || a.organization.createdAt || '';
    const dateB = b.organization.updatedAt || b.organization.createdAt || '';
    return dateB.localeCompare(dateA);
  });
}

/**
 * Load a single organization record by ID.
 */
export async function loadOrganizationRecord(organizationId?: string): Promise<OnboardingRecord | null> {
  if (!organizationId) {
    const all = await loadOrganizationRecords();
    return all[0] ?? null;
  }

  const docSnap = await getDoc(doc(getOrganizationCollection(), organizationId));
  if (!docSnap.exists()) return null;

  const data = docSnap.data() as any;
  if (data?.organization) {
    return data as OnboardingRecord;
  }

  return {
    user: { id: 'default', name: 'MSME Owner', email: 'owner@bizpilot.in' },
    organization: {
      id: docSnap.id,
      ...data,
    },
  };
}

/**
 * Persist the ID of the currently selected organization.
 * Synchronizes to both localStorage (instant client recovery) and Firestore preferences.
 */
export async function saveSelectedOrganizationId(organizationId: string): Promise<void> {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_SELECTED_ORG_KEY, organizationId);
    } catch {
      // Ignore localStorage errors
    }
  }

  try {
    await setDoc(getPreferencesDocument(), { selectedOrganizationId: organizationId }, { merge: true });
  } catch (error) {
    console.warn('Could not sync selected organization to Firestore preferences:', error);
  }
}

/**
 * Load the currently selected organization ID from localStorage or Firestore.
 */
export async function loadSelectedOrganizationId(): Promise<string | null> {
  // 1. Fast check: localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    const localId = window.localStorage.getItem(LOCAL_STORAGE_SELECTED_ORG_KEY);
    if (localId) return localId;
  }

  // 2. Fallback: Firestore preferences
  try {
    const snapshot = await getDoc(getPreferencesDocument());
    if (snapshot.exists()) {
      return (snapshot.data()?.selectedOrganizationId as string) || null;
    }
  } catch (error) {
    console.warn('Could not fetch selected organization from Firestore preferences:', error);
  }

  return null;
}

/**
 * Save in-progress onboarding draft, scoped per user if userId is provided.
 */
export async function saveOnboardingDraft(draft: OnboardingDraft, userId?: string): Promise<void> {
  if (typeof window !== 'undefined' && window.localStorage && userId) {
    try {
      window.localStorage.setItem(`bizpilot_draft_${userId}`, JSON.stringify(draft));
    } catch {}
  }
  try {
    await setDoc(getDraftDocument(userId), { ...draft, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('Could not sync draft to Firestore:', err);
  }
}

/**
 * Load in-progress onboarding draft, scoped per user if userId is provided.
 */
export async function loadOnboardingDraft(userId?: string): Promise<OnboardingDraft | null> {
  if (typeof window !== 'undefined' && window.localStorage && userId) {
    try {
      const cached = window.localStorage.getItem(`bizpilot_draft_${userId}`);
      if (cached) return JSON.parse(cached);
    } catch {}
  }
  try {
    const snapshot = await getDoc(getDraftDocument(userId));
    return snapshot.exists() ? (snapshot.data() as OnboardingDraft) : null;
  } catch {
    return null;
  }
}

/**
 * Clear onboarding draft upon successful completion.
 */
export async function clearOnboardingDraft(userId?: string): Promise<void> {
  if (typeof window !== 'undefined' && window.localStorage && userId) {
    try {
      window.localStorage.removeItem(`bizpilot_draft_${userId}`);
    } catch {}
  }
  try {
    await deleteDoc(getDraftDocument(userId));
  } catch (err) {
    console.warn('Could not delete draft from Firestore:', err);
  }
}
