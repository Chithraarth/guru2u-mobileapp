import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ApiError } from '@workspace/api-client-react';
import { ErrorBox } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';

/**
 * Renders the error state for a create-reading mutation.
 *
 * - 402 (out of readings / no plan): shows an upgrade prompt linking to the
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
    const data = error.data as { error?: string } | null;
    const message =
      data?.error ?? t('mobile.readingCreateError.limitReachedDefault');
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

  return <ErrorBox message={fallbackMessage} />;
}
