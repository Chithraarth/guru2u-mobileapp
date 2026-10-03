import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ApiError } from '@workspace/api-client-react';
import { ErrorBox, PrimaryButton } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';
import fonts from '@/constants/fonts';

// Filters out raw HTML/markup and stack-trace-shaped text (e.g. an unhandled
// server crash that bypassed the API's JSON error handler) so it's never
// shown to the user — only short, plain-text messages pass through.
function looksLikeCleanMessage(text: string): boolean {
  return text.length < 200 && !/[<>]/.test(text) && !/\bat\s+\S+\s*\(/.test(text);
}

/**
 * Renders the error state for a create-reading mutation.
 *
 * - 402 (out of reading credits): shows an upgrade prompt linking to the
 *   paywall screen with the server-provided reason.
 * - anything else: shows the generic fallback message.
 */
export function ReadingCreateError({
  error,
  fallbackMessage,
}: {
  error: unknown;
  fallbackMessage: string;
}) {
  const c = useColors();
  const { t } = useTranslation();
  const router = useRouter();

  if (error instanceof ApiError && error.status === 402) {
    const data = error.data as { error?: string; message?: string } | null;
    const message =
      data?.message ?? t('mobile.readingCreateError.limitReachedDefault');
    return (
      <View
        style={{
          borderWidth: 1,
          borderColor: c.accent,
          borderRadius: colors.radiusLg,
          backgroundColor: c.card,
          padding: 18,
          gap: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: c.secondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="crown-outline" size={20} color={c.accent} />
          </View>
          <Text style={{ flex: 1, color: c.foreground, fontFamily: fonts.semibold, fontSize: 16 }}>
            {t('mobile.readingCreateError.limitReachedTitle')}
          </Text>
        </View>
        <Text style={{ color: c.mutedForeground, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>
          {message}
        </Text>
        <PrimaryButton
          testID="upgrade-button"
          variant="gold"
          title={t('mobile.readingCreateError.seePlans')}
          onPress={() => router.push('/paywall')}
        />
      </View>
    );
  }

  // Prefer a clean server-provided message over the raw ApiError text, which
  // embeds the full HTTP status line and can include raw HTML/stack-trace
  // content when the server fails before it can return JSON (e.g. a crash
  // that bypasses the API's error handler).
  const data = error instanceof ApiError ? (error.data as { error?: string; message?: string } | null) : null;
  const serverMessage = data?.message ?? data?.error;
  const rawMessage = !serverMessage && error instanceof Error ? error.message : undefined;
  const detail = serverMessage ?? (rawMessage && looksLikeCleanMessage(rawMessage) ? rawMessage : undefined);
  return <ErrorBox message={detail ? `${fallbackMessage} (${detail})` : fallbackMessage} />;
}
