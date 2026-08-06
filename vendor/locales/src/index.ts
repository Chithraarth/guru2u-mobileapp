import en from './locales/en';
import hi from './locales/hi';
import es from './locales/es';
import fr from './locales/fr';
import de from './locales/de';
import pt from './locales/pt';
import ar from './locales/ar';
import zh from './locales/zh';
import ja from './locales/ja';
import ru from './locales/ru';

export type { TranslationSchema } from './locales/en';

export const translations = { en, hi, es, fr, de, pt, ar, zh, ja, ru } as const;

export interface LanguageOption {
  code: string;
  /** Language name in its own language */
  nativeName: string;
  rtl?: boolean;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', nativeName: 'English' },
  { code: 'hi', nativeName: 'हिन्दी' },
  { code: 'es', nativeName: 'Español' },
  { code: 'fr', nativeName: 'Français' },
  { code: 'de', nativeName: 'Deutsch' },
  { code: 'pt', nativeName: 'Português' },
  { code: 'ar', nativeName: 'العربية', rtl: true },
  { code: 'zh', nativeName: '中文' },
  { code: 'ja', nativeName: '日本語' },
  { code: 'ru', nativeName: 'Русский' },
];

export const SUPPORTED_LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

export function isRtl(lang: string): boolean {
  return LANGUAGES.find((l) => l.code === lang)?.rtl === true;
}
