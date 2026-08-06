import { useTranslation } from 'react-i18next';
import { isRtl } from '@/lib/i18n';

/**
 * Whether the current language is right-to-left. Use for text alignment and
 * row direction so RTL applies immediately, without waiting for the native
 * I18nManager restart.
 */
export function useIsRtl(): boolean {
  const { i18n } = useTranslation();
  return isRtl(i18n.language?.split('-')[0] ?? 'en');
}
