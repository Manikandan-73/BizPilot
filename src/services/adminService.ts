/**
 * Admin Service (Firebase Firestore)
 *
 * Handles administrative management of all registered MSMEs:
 * - Admin role verification
 * - Listing all MSMEs and their subscription status
 * - Updating MSME subscriptions (plan, expiry date, status)
 * - Toggling MSME account status (active / suspended)
 */

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OnboardingRecord, Organization, SubscriptionDetails } from '../types/business';

// Default system admin emails (can be extended via .env.local VITE_ADMIN_EMAILS)
const DEFAULT_ADMIN_EMAILS = [
  'admin@bizpilot.in',
  'manikandan@bizpilot.in',
  'admin@test.in',
];

/**
 * Check if a given user email has administrator privileges.
 */
export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();

  // Check default admin emails
  if (DEFAULT_ADMIN_EMAILS.some((admin) => admin.toLowerCase() === normalized)) {
    return true;
  }

  // Check custom admin emails from environment variables
  const envAdminEmails = import.meta.env.VITE_ADMIN_EMAILS;
  if (envAdminEmails && typeof envAdminEmails === 'string') {
    const customList = envAdminEmails.split(',').map((e) => e.trim().toLowerCase());
    if (customList.includes(normalized)) {
      return true;
    }
  }

  return false;
}

/**
 * Retrieve all registered MSME organizations for the Admin Dashboard.
 */
export async function getAllMSMEOrganizations(): Promise<OnboardingRecord[]> {
  const snapshot = await getDocs(collection(db, 'organizations'));
  const records: OnboardingRecord[] = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as any;
    if (data?.organization) {
      records.push({
        ownerId: data.ownerId || data.organization.ownerId,
        ownerEmail: data.ownerEmail || data.organization.ownerEmail,
        user: data.user || {
          id: data.ownerId || 'unknown',
          name: data.organization.businessProfile?.businessName || data.organization.name || 'MSME Owner',
          email: data.ownerEmail || '',
        },
        organization: {
          ...data.organization,
          id: docSnap.id,
          ownerId: data.ownerId || data.organization.ownerId,
          ownerEmail: data.ownerEmail || data.organization.ownerEmail,
        },
      });
    } else if (data?.businessProfile) {
      records.push({
        ownerId: data.ownerId,
        ownerEmail: data.ownerEmail,
        user: {
          id: data.ownerId || docSnap.id,
          name: data.businessProfile?.businessName || data.name || 'MSME Owner',
          email: data.ownerEmail || '',
        },
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
 * Update an MSME's subscription plan, status, and expiry date.
 */
export async function updateMSMESubscription(
  organizationId: string,
  subscription: SubscriptionDetails,
): Promise<void> {
  const orgRef = doc(db, 'organizations', organizationId);
  const now = new Date().toISOString();

  await updateDoc(orgRef, {
    'organization.subscription': subscription,
    'organization.updatedAt': now,
    subscription,
    updatedAt: now,
  });
}

/**
 * Update an MSME's operational account status (active or suspended).
 */
export async function updateMSMEAccountStatus(
  organizationId: string,
  status: 'active' | 'suspended',
): Promise<void> {
  const orgRef = doc(db, 'organizations', organizationId);
  const now = new Date().toISOString();

  await updateDoc(orgRef, {
    'organization.accountStatus': status,
    'organization.updatedAt': now,
    accountStatus: status,
    updatedAt: now,
  });
}

/**
 * Delete an MSME organization from the platform (Admin only).
 */
export async function deleteMSMEOrganization(organizationId: string): Promise<void> {
  await deleteDoc(doc(db, 'organizations', organizationId));
}
