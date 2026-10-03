import React, { useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/authContext';
import { signOutUser } from '@/lib/firebase';
import { getBillingStatus } from '@/lib/billing';
import { LANGUAGES, setAppLanguage } from '@/lib/i18n';
import { contactOf, displayNameOf } from '@/lib/user';
import { TAB_BAR_SPACE } from '@/components/NebulaTabBar';
import { PrimaryButton } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';
import fonts from '@/constants/fonts';

const SUPPORT_EMAIL = 'support@thechiguru.com';
const PRIVACY_URL = 'https://guru2u.com/privacy';

export default function ProfileScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [showLanguages, setShowLanguages] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['billing', 'status'], queryFn: getBillingStatus });

  const name = displayNameOf(user);
  const contact = contactOf(user);
  const initial = (name || contact || '?').charAt(0).toUpperCase();
  const currentLang = i18n.language?.split('-')[0] ?? 'en';
  const languageName = LANGUAGES.find((l) => l.code === currentLang)?.nativeName ?? 'English';

  const onSelectLanguage = async (code: string) => {
    const { directionChanged } = await setAppLanguage(code);
    setShowLanguages(false);
    if (!directionChanged) return;
    Alert.alert(t('mobile.settings.restartTitle'), t('mobile.settings.restartMessage'), [
      { text: t('mobile.settings.restartLater'), style: 'cancel' },
      { text: t('mobile.settings.restartNow'), onPress: () => Updates.reloadAsync().catch(() => {}) },
    ]);
  };

  const confirmSignOut = () => {
    Alert.alert(t('mobile.profile.signOutTitle'), undefined, [
      { text: t('mobile.common.cancel'), style: 'cancel' },
      { text: t('mobile.profile.logOut'), style: 'destructive', onPress: () => signOutUser() },
    ]);
  };

  const requestDeletion = () => {
    Alert.alert(t('mobile.profile.deleteTitle'), t('mobile.profile.deleteMessage', { email: SUPPORT_EMAIL }), [
      { text: t('mobile.common.cancel'), style: 'cancel' },
      {
        text: t('mobile.profile.deleteConfirm'),
        style: 'destructive',
        onPress: () =>
          Linking.openURL(
            `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Account deletion request')}&body=${encodeURIComponent(
              `Please delete my Guru 2 u account (${contact}).`,
            )}`,
          ),
      },
    ]);
  };

  const rowStyle = (i: number) => ({ pressed }: { pressed: boolean }) => [
    styles.row,
    { borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.secondary, backgroundColor: pressed ? c.muted : 'transparent' },
  ];

  const topPad = Platform.OS === 'web' ? 67 : insets.top + 16;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ paddingTop: topPad, paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE + insets.bottom, gap: 14 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={[styles.avatar, { backgroundColor: c.primaryFill }]}>
          <Text style={{ fontFamily: fonts.semibold, fontSize: 24, color: c.primaryForeground }}>{initial}</Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 24, color: c.foreground }} numberOfLines={1}>
            {name || t('mobile.paywall.signedIn')}
          </Text>
          {contact ? (
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: c.mutedForeground }} numberOfLines={1}>
              {contact}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border, gap: 14 }]}>
        <Text style={{ fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: c.accent }}>
          {t('mobile.profile.currentBalance')}
        </Text>
        <Text testID="profile-balance" style={{ fontFamily: fonts.display, fontSize: 44, color: c.foreground }}>
          {isLoading ? '—' : (data?.scansRemaining ?? 0)}
          <Text style={{ fontFamily: fonts.medium, fontSize: 16, color: c.mutedForeground }}> {t('mobile.profile.readingsUnit')}</Text>
        </Text>
        <PrimaryButton
          testID="profile-top-up"
          variant="gold"
          icon="plus"
          title={t('mobile.profile.topUpNow')}
          onPress={() => router.push('/paywall')}
        />
      </View>

      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border, padding: 0, overflow: 'hidden' }]}>
        <Pressable testID="profile-language" onPress={() => setShowLanguages((s) => !s)} accessibilityRole="button" style={rowStyle(0)}>
          <Feather name="globe" size={20} color={c.mutedForeground} />
          <Text style={[styles.rowLabel, { color: c.foreground }]}>{t('mobile.profile.language')}</Text>
          <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: c.mutedForeground }}>{languageName}</Text>
          <Feather name={showLanguages ? 'chevron-up' : 'chevron-down'} size={16} color={c.subtle} />
        </Pressable>
        {showLanguages ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingBottom: 14 }}>
            {LANGUAGES.map((lang) => {
              const selected = lang.code === currentLang;
              return (
                <Pressable
                  key={lang.code}
                  onPress={() => onSelectLanguage(lang.code)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[
                    styles.langChip,
                    { backgroundColor: selected ? c.accent : 'transparent', borderColor: selected ? c.accent : c.borderStrong },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: selected ? fonts.semibold : fonts.medium,
                      fontSize: 13,
                      color: selected ? c.accentForeground : c.secondaryForeground,
                    }}
                  >
                    {lang.nativeName}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
        <Pressable testID="profile-privacy" onPress={() => Linking.openURL(PRIVACY_URL)} accessibilityRole="button" style={rowStyle(1)}>
          <Feather name="shield" size={20} color={c.mutedForeground} />
          <Text style={[styles.rowLabel, { color: c.foreground }]}>{t('mobile.profile.privacy')}</Text>
          <Feather name="chevron-right" size={16} color={c.subtle} />
        </Pressable>
        <Pressable
          testID="profile-help"
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Guru 2 u feedback')}`)}
          accessibilityRole="button"
          style={rowStyle(2)}
        >
          <Feather name="help-circle" size={20} color={c.mutedForeground} />
          <Text style={[styles.rowLabel, { color: c.foreground }]}>{t('mobile.profile.help')}</Text>
          <Feather name="chevron-right" size={16} color={c.subtle} />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable
          testID="profile-sign-out"
          onPress={confirmSignOut}
          accessibilityRole="button"
          style={({ pressed }) => [styles.pill, { borderColor: c.border, opacity: pressed ? 0.8 : 1 }]}
        >
          <Feather name="log-out" size={16} color={c.foreground} />
          <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: c.foreground }}>{t('mobile.profile.logOut')}</Text>
        </Pressable>
        <Pressable
          testID="profile-delete"
          onPress={requestDeletion}
          accessibilityRole="button"
          style={({ pressed }) => [styles.pill, { borderColor: c.destructiveBorder, opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: c.destructive }}>{t('mobile.profile.deleteAccount')}</Text>
        </Pressable>
      </View>

      <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: c.subtle, textAlign: 'center', marginTop: 4 }}>
        {t('mobile.profile.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: colors.radiusLg - 2,
    borderWidth: 1,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  langChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
