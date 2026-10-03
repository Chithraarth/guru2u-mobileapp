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

  return <ErrorBox message={fallbackMessage} />;
}
