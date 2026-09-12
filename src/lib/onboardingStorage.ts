import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { OnboardingDraft, OnboardingRecord, Organization } from '../types/onboarding';

function organizationCollection() {
  return collection(db, 'organizations');
}

function draftDocument() {
  return doc(db, 'appSettings', 'onboardingDraft');
}

function selectedOrganizationDocument() {
  return doc(db, 'appSettings', 'preferences');
}

export async function saveOnboardingDraft(draft: OnboardingDraft): Promise<void> {
  await setDoc(draftDocument(), { ...draft, updatedAt: new Date().toISOString() });
}

export async function loadOnboardingDraft(): Promise<OnboardingDraft | null> {
  const snapshot = await getDoc(draftDocument());
  return snapshot.exists() ? (snapshot.data() as OnboardingDraft) : null;
}

export async function clearOnboardingDraft(): Promise<void> {
  await deleteDoc(draftDocument());
}

export async function saveOrganizationRecord(record: OnboardingRecord): Promise<OnboardingRecord> {
  const organization = { ...record.organization, updatedAt: new Date().toISOString() };
  const savedRecord: OnboardingRecord = {
    user: record.user,
    organization,
  };
  await setDoc(doc(organizationCollection(), organization.id), savedRecord);
  await saveSelectedOrganizationId(organization.id);
  return savedRecord;
}

export async function loadOrganizationRecords(): Promise<OnboardingRecord[]> {
  const snapshot = await getDocs(organizationCollection());
  return snapshot.docs
    .map((item) => item.data() as OnboardingRecord)
    .sort((a, b) => b.organization.updatedAt.localeCompare(a.organization.updatedAt));
}

export async function loadOrganizationRecord(organizationId?: string): Promise<OnboardingRecord | null> {
  if (organizationId) {
    const snapshot = await getDoc(doc(organizationCollection(), organizationId));
    return snapshot.exists() ? (snapshot.data() as OnboardingRecord) : null;
  }
  const records = await loadOrganizationRecords();
  return records[0] ?? null;
}

export async function updateOrganizationRecord(organization: Organization): Promise<void> {
  await updateDoc(doc(organizationCollection(), organization.id), {
    ...organization,
    updatedAt: new Date().toISOString(),
  });
}

export async function saveSelectedOrganizationId(organizationId: string): Promise<void> {
  await setDoc(selectedOrganizationDocument(), { selectedOrganizationId: organizationId }, { merge: true });
}

export async function loadSelectedOrganizationId(): Promise<string | null> {
  const snapshot = await getDoc(selectedOrganizationDocument());
  return snapshot.exists() ? (snapshot.data().selectedOrganizationId as string) : null;
}
