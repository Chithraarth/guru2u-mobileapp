import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import * as Updates from 'expo-updates';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useIsRtl } from '@/hooks/useIsRtl';
import { LANGUAGES, setAppLanguage } from '@/lib/i18n';
import colors from '@/constants/colors';

export default function SettingsScreen() {
  const c = useColors();
  const { t, i18n } = useTranslation();
  const rtl = useIsRtl();
  const current = i18n.language?.split('-')[0] ?? 'en';

  const onSelectLanguage = async (code: string) => {
    const { directionChanged } = await setAppLanguage(code);
    if (!directionChanged) return;
    Alert.alert(t('mobile.settings.restartTitle'), t('mobile.settings.restartMessage'), [
      { text: t('mobile.settings.restartLater'), style: 'cancel' },
      {
        text: t('mobile.settings.restartNow'),
        onPress: () => {
          // Reloads the JS bundle so the new layout direction takes effect.
          // Not available in some dev environments; the user can restart manually.
          Updates.reloadAsync().catch(() => {});
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      <Text
        style={{
          color: c.mutedForeground,
          fontFamily: 'Inter_600SemiBold',
          fontSize: 13,
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 12,
          textAlign: rtl ? 'right' : 'left',
        }}
      >
        {t('common.changeLanguage')}
      </Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: colors.radius,
          overflow: 'hidden',
        }}
      >
        {LANGUAGES.map((lang, idx) => {
          const selected = lang.code === current;
          return (
            <Pressable
              key={lang.code}
              onPress={() => onSelectLanguage(lang.code)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => ({
                flexDirection: rtl ? 'row-reverse' : 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
                paddingHorizontal: 16,
                backgroundColor: pressed
                  ? c.muted
                  : selected
                    ? c.card
                    : 'transparent',
                borderTopWidth: idx === 0 ? 0 : 1,
                borderTopColor: c.border,
              })}
            >
              <Text
                style={{
                  color: selected ? c.primary : c.foreground,
                  fontFamily: selected ? 'Inter_600SemiBold' : 'Inter_400Regular',
                  fontSize: 16,
                }}
              >
                {lang.nativeName}
              </Text>
              {selected ? <Feather name="check" size={20} color={c.primary} /> : null}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
