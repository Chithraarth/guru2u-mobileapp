import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ApiError } from '@workspace/api-client-react';
import { ErrorBox } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';

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
          borderColor: c.primary,
          borderRadius: colors.radius,
          backgroundColor: c.primary + '14',
          padding: 16,
          gap: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Feather name="zap" size={16} color={c.primary} />
          <Text
            style={{
              color: c.foreground,
              fontFamily: 'Inter_600SemiBold',
              fontSize: 15,
            }}
          >
            {t('mobile.readingCreateError.limitReachedTitle')}
          </Text>
        </View>
        <Text
          style={{
            color: c.mutedForeground,
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            lineHeight: 19,
          }}
        >
          {message}
        </Text>
        <Pressable
          testID="upgrade-button"
          onPress={() => router.push('/paywall')}
          style={({ pressed }) => ({
            backgroundColor: c.primary,
            borderRadius: colors.radius,
            paddingVertical: 12,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text
            style={{
              color: c.primaryForeground,
              fontFamily: 'Inter_600SemiBold',
              fontSize: 14,
            }}
          >
            {t('mobile.readingCreateError.seePlans')}
          </Text>
        </Pressable>
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
