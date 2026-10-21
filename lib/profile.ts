import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { customFetch } from '@workspace/api-client-react';

/** The signed-in user's own details, saved on the server. */
export interface MyProfile {
  birthDate: string | null;
  birthTime: string | null;
  birthPlace: string | null;
  hasFace: boolean;
  hasPalm: boolean;
}

export const PROFILE_QUERY_KEY = ['me', 'profile'] as const;

export function getMyProfile(): Promise<MyProfile> {
  return customFetch<MyProfile>('/api/me/profile');
}

export function useMyProfile() {
  return useQuery({ queryKey: PROFILE_QUERY_KEY, queryFn: getMyProfile });
}

export function saveMyProfile(body: { birthDate: string; birthTime: string | null; birthPlace: string }): Promise<MyProfile> {
  return customFetch<MyProfile>('/api/me/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** Reads the user's own face or palm once; only a text summary is kept. */
export function saveMyPhoto(kind: 'face' | 'palm', imageBase64: string, mimeType: string): Promise<MyProfile> {
  return customFetch<MyProfile>(`/api/me/profile/${kind}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
  });
}

/** True once the user has saved the details their daily reading needs. */
export function isProfileComplete(p: MyProfile | undefined): boolean {
  return !!p?.birthDate && !!p?.birthPlace;
}

// "Skip for now" on the setup screen, remembered per account on this device.
const skipKey = (uid: string) => `profile-setup-skipped:${uid}`;

export async function hasSkippedSetup(uid: string): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(skipKey(uid))) === '1';
  } catch {
    return false;
  }
}

export async function markSetupSkipped(uid: string): Promise<void> {
  try {
    await AsyncStorage.setItem(skipKey(uid), '1');
  } catch {
    // Best effort: worst case the setup screen is offered again.
  }
}

/** "YYYY-MM-DD" → a readable local date, e.g. "14 Mar 1995". */
export function formatBirthDate(iso: string | null, locale?: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "HH:MM" (24h) → "2:30 PM". */
export function formatBirthTime(hhmm: string | null): string {
  if (!hhmm) return '';
  const [h, min] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 === 0 ? 12 : h % 12}:${String(min).padStart(2, '0')} ${suffix}`;
}

/** The user's local date as YYYY-MM-DD. */
export function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
