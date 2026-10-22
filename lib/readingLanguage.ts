import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/lib/i18n';

/**
 * The language readings are written in and read aloud in. Separate from the
 * app's own language so users can pick Indian regional languages the app's
 * screens aren't translated into.
 */
export interface ReadingLanguage {
  code: string;
  nativeName: string;
  /** BCP-47 tag for text-to-speech. */
  speech: string;
}

export const READING_LANGUAGES: ReadingLanguage[] = [
  { code: 'en', nativeName: 'English', speech: 'en-IN' },
  { code: 'hi', nativeName: 'हिन्दी', speech: 'hi-IN' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', speech: 'kn-IN' },
  { code: 'ta', nativeName: 'தமிழ்', speech: 'ta-IN' },
  { code: 'te', nativeName: 'తెలుగు', speech: 'te-IN' },
  { code: 'ml', nativeName: 'മലയാളം', speech: 'ml-IN' },
  { code: 'mr', nativeName: 'मराठी', speech: 'mr-IN' },
  { code: 'gu', nativeName: 'ગુજરાતી', speech: 'gu-IN' },
  { code: 'bn', nativeName: 'বাংলা', speech: 'bn-IN' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', speech: 'pa-IN' },
  { code: 'or', nativeName: 'ଓଡ଼ିଆ', speech: 'or-IN' },
  { code: 'ur', nativeName: 'اردو', speech: 'ur-IN' },
  { code: 'as', nativeName: 'অসমীয়া', speech: 'as-IN' },
  { code: 'es', nativeName: 'Español', speech: 'es-ES' },
  { code: 'fr', nativeName: 'Français', speech: 'fr-FR' },
  { code: 'de', nativeName: 'Deutsch', speech: 'de-DE' },
  { code: 'pt', nativeName: 'Português', speech: 'pt-BR' },
  { code: 'ar', nativeName: 'العربية', speech: 'ar-SA' },
  { code: 'zh', nativeName: '中文', speech: 'zh-CN' },
  { code: 'ja', nativeName: '日本語', speech: 'ja-JP' },
  { code: 'ru', nativeName: 'Русский', speech: 'ru-RU' },
];

const STORAGE_KEY = 'reading-language';

// null = not chosen yet: follow the app's language.
let chosen: string | null = null;
const listeners = new Set<() => void>();

AsyncStorage.getItem(STORAGE_KEY)
  .then((v) => {
    if (v && READING_LANGUAGES.some((l) => l.code === v)) {
      chosen = v;
      listeners.forEach((l) => l());
    }
  })
  .catch(() => {});

function appLanguage(): string {
  const code = (i18n.language || 'en').split('-')[0];
  return READING_LANGUAGES.some((l) => l.code === code) ? code : 'en';
}

/** The current reading language code, e.g. "kn". */
export function getReadingLanguage(): string {
  return chosen ?? appLanguage();
}

export function readingLanguageInfo(code = getReadingLanguage()): ReadingLanguage {
  return READING_LANGUAGES.find((l) => l.code === code) ?? READING_LANGUAGES[0];
}

export function setReadingLanguage(code: string): void {
  chosen = code;
  listeners.forEach((l) => l());
  AsyncStorage.setItem(STORAGE_KEY, code).catch(() => {});
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  i18n.on('languageChanged', cb);
  return () => {
    listeners.delete(cb);
    i18n.off('languageChanged', cb);
  };
}

export function useReadingLanguage(): string {
  return useSyncExternalStore(subscribe, getReadingLanguage, getReadingLanguage);
}
