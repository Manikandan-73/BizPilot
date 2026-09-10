import { OnboardingDraft, OnboardingRecord } from '../types/onboarding';

/**
 * Persistence layer for the MSME onboarding flow.
 *
 * Everything is `async` on purpose, even though the current implementation
 * is synchronous localStorage. That keeps the call sites (OnboardingWizard)
 * identical to how they'd look calling a real backend, so swapping this
 * module's internals for e.g.
 *
 *   POST /api/business/profile
 *   GET  /api/business/profile/draft
 *
 * later requires no changes to the onboarding UI.
 */

const DRAFT_KEY = 'bizpilot.onboarding.draft.v1';
const RECORD_KEY = 'bizpilot.onboarding.record.v1';

function readJSON<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    // Corrupt or inaccessible storage should never crash the app.
    return null;
  }
}

function writeJSON(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Save in-progress wizard state so a refresh mid-flow doesn't lose answers. */
export async function saveOnboardingDraft(draft: OnboardingDraft): Promise<void> {
  writeJSON(DRAFT_KEY, draft);
}

/** Load any previously saved in-progress wizard state. */
export async function loadOnboardingDraft(): Promise<OnboardingDraft | null> {
  return readJSON<OnboardingDraft>(DRAFT_KEY);
}

export async function clearOnboardingDraft(): Promise<void> {
  window.localStorage.removeItem(DRAFT_KEY);
}

/** Persist the completed organization/business profile. */
export async function saveOrganizationRecord(record: OnboardingRecord): Promise<OnboardingRecord> {
  writeJSON(RECORD_KEY, record);
  return record;
}

/** Load a previously completed organization/business profile, if any. */
export async function loadOrganizationRecord(): Promise<OnboardingRecord | null> {
  return readJSON<OnboardingRecord>(RECORD_KEY);
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  return (await loadOrganizationRecord()) !== null;
}