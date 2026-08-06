import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { I18nManager, Platform } from 'react-native';
import {
  translations,
  LANGUAGES,
  SUPPORTED_LANGUAGE_CODES,
  isRtl,
  type LanguageOption,
} from '@workspace/locales';

export { LANGUAGES, SUPPORTED_LANGUAGE_CODES, isRtl };
export type { LanguageOption };

export const LANGUAGE_STORAGE_KEY = 'app-language';

/** Best-effort language guess from the device locale, restricted to supported codes. */
export function detectDeviceLanguage(): string {
  for (const locale of getLocales()) {
    const base = locale.languageCode?.toLowerCase();
    if (base && SUPPORTED_LANGUAGE_CODES.includes(base)) return base;
  }
  return 'en';
}

/**
 * Apply the layout direction for a language. Returns true when the native
 * layout direction changed and an app restart is required for the flip
 * (mirrored navigation, icons, gestures) to fully take effect.
 */
function applyRtl(lang: string): boolean {
  const rtl = isRtl(lang);
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    return false;
  }
  I18nManager.allowRTL(rtl);
  if (I18nManager.isRTL !== rtl) {
    // Takes full effect on the next app launch; text alignment via
    // useIsRtl() applies immediately.
    I18nManager.forceRTL(rtl);
    return true;
  }
  return false;
}

const resources = Object.fromEntries(
  Object.entries(translations).map(([code, resource]) => [code, { translation: resource }]),
);

i18n.use(initReactI18next).init({
  resources,
  lng: detectDeviceLanguage(),
  supportedLngs: SUPPORTED_LANGUAGE_CODES,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnObjects: true,
});

// Restore the user's saved choice (overrides device detection).
export const i18nReady: Promise<void> = AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
  .then((saved) => {
    if (saved && SUPPORTED_LANGUAGE_CODES.includes(saved) && saved !== i18n.language) {
      return i18n.changeLanguage(saved).then(() => undefined);
    }
    return undefined;
  })
  .catch(() => undefined)
  .finally(() => {
    applyRtl(i18n.language ?? 'en');
  });

/**
 * Change the app language and remember it.
 * Returns whether the native layout direction changed (a restart is needed
 * for the flip to fully take effect).
 */
export async function setAppLanguage(code: string): Promise<{ directionChanged: boolean }> {
  if (!SUPPORTED_LANGUAGE_CODES.includes(code)) return { directionChanged: false };
  await i18n.changeLanguage(code);
  const directionChanged = applyRtl(code);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  return { directionChanged };
}

export default i18n;
