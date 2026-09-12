/**
 * Organization Persistence & Selection Service (Firebase Firestore)
 *
 * Handles:
 * - Multi-business persistence under `organizations/{id}`
 * - Document retrieval, updates, and listings
 * - Active business selection persistence (localStorage + Firestore `appSettings/preferences`)
 * - Onboarding draft saving and retrieval
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OnboardingRecord, Organization } from '../types/business';
import { OnboardingDraft } from '../types/onboarding';

const LOCAL_STORAGE_SELECTED_ORG_KEY = 'bizpilot_selected_organization_id';

function getOrganizationCollection() {
  return collection(db, 'organizations');
}

function getDraftDocument() {
  return doc(db, 'appSettings', 'onboardingDraft');
}

function getPreferencesDocument() {
  return doc(db, 'appSettings', 'preferences');
}

/**
 * Save a newly onboarded organization to Firestore.
 * Does NOT overwrite other businesses. Creates a unique document under `organizations/{id}`.
 */
export async function saveOrganizationRecord(record: OnboardingRecord): Promise<OnboardingRecord> {
  const now = new Date().toISOString();
  const organization: Organization = {
    ...record.organization,
    createdAt: record.organization.createdAt || now,
    updatedAt: now,
  };

  const savedRecord: OnboardingRecord = {
    user: record.user,
    organization,
  };

  await setDoc(doc(getOrganizationCollection(), organization.id), savedRecord);
  await saveSelectedOrganizationId(organization.id);
  return savedRecord;
}

/**
 * Update an existing organization in Firestore.
 */
export async function updateOrganizationRecord(organization: Organization): Promise<void> {
  const updatedOrganization: Organization = {
    ...organization,
    updatedAt: new Date().toISOString(),
  };

  await updateDoc(doc(getOrganizationCollection(), organization.id), {
    organization: updatedOrganization,
  });
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
      // Ignore localStorage errors (e.g. private browsing quota)
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
 * Save in-progress onboarding draft.
 */
export async function saveOnboardingDraft(draft: OnboardingDraft): Promise<void> {
  await setDoc(getDraftDocument(), { ...draft, updatedAt: new Date().toISOString() });
}

/**
 * Load in-progress onboarding draft.
 */
export async function loadOnboardingDraft(): Promise<OnboardingDraft | null> {
  const snapshot = await getDoc(getDraftDocument());
  return snapshot.exists() ? (snapshot.data() as OnboardingDraft) : null;
}

/**
 * Clear onboarding draft upon successful completion.
 */
export async function clearOnboardingDraft(): Promise<void> {
  await deleteDoc(getDraftDocument());
}
