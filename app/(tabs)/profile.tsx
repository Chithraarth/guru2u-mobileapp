import React from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/authContext';
import { signOutUser } from '@/lib/firebase';
import { billing } from '@/lib/billing';
import { LANGUAGES } from '@/lib/i18n';
import { contactOf, displayNameOf } from '@/lib/user';
import { TAB_BAR_SPACE } from '@/components/NebulaTabBar';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';
import fonts from '@/constants/fonts';

const SUPPORT_EMAIL = 'support@thechiguru.com';
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL?.replace(/\/$/, '');

interface Row {
  key: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value?: string;
  onPress: () => void;
}

export default function ProfileScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const statusQuery = useQuery({ queryKey: ['billing', 'status'], queryFn: billing.status });
  const status = statusQuery.data;

  const name = displayNameOf(user);
  const contact = contactOf(user);
  const initial = (name || contact || '?').charAt(0).toUpperCase();
  const languageName =
    LANGUAGES.find((l) => l.code === (i18n.language?.split('-')[0] ?? 'en'))?.nativeName ?? 'English';
  const usedPct =
    status?.dailyLimit ? Math.min(100, Math.round((status.usedToday / status.dailyLimit) * 100)) : 0;

  const rows: Row[] = [
    { key: 'plan', icon: 'credit-card', label: t('mobile.profile.planBilling'), onPress: () => router.push('/paywall') },
    { key: 'language', icon: 'globe', label: t('common.changeLanguage'), value: languageName, onPress: () => router.push('/settings') },
    ...(WEB_URL
      ? [
          {
            key: 'privacy',
            icon: 'shield' as const,
            label: t('mobile.profile.privacy'),
            onPress: () => WebBrowser.openBrowserAsync(`${WEB_URL}/privacy`),
          },
        ]
      : []),
    {
      key: 'help',
      icon: 'help-circle',
      label: t('mobile.profile.help'),
      onPress: () => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Guru 2 u feedback')}`),
    },
  ];

  const confirmSignOut = () => {
    Alert.alert(t('mobile.profile.signOutTitle'), undefined, [
      { text: t('mobile.common.cancel'), style: 'cancel' },
      { text: t('mobile.paywall.signOut'), style: 'destructive', onPress: () => signOutUser() },
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

      <Pressable
        testID="profile-plan"
        onPress={() => router.push('/paywall')}
        style={({ pressed }) => [styles.card, { backgroundColor: c.card, borderColor: c.border, gap: 10, opacity: pressed ? 0.9 : 1 }]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: c.foreground }}>
            {status?.planName ?? t('mobile.profile.freePlan')}
          </Text>
          <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: c.accent }}>
            {status?.planKey ? t('mobile.profile.manage') : t('mobile.profile.upgrade')}
          </Text>
        </View>
        {status?.dailyLimit ? (
          <View style={[styles.track, { backgroundColor: c.secondary }]}>
            <View style={{ width: `${usedPct}%`, height: '100%', backgroundColor: c.accent }} />
          </View>
        ) : null}
        {status ? (
          <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: c.mutedForeground }}>
            {status.dailyLimit != null
              ? t('mobile.paywall.usageWithLimit', { used: status.usedToday, limit: status.dailyLimit })
              : t('mobile.paywall.usageNoLimit')}
            {status.extraCredits > 0 ? t('mobile.paywall.extraLeft', { count: status.extraCredits }) : ''}
          </Text>
        ) : null}
      </Pressable>

      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border, padding: 0, overflow: 'hidden' }]}>
        {rows.map((row, i) => (
          <Pressable
            key={row.key}
            testID={`profile-${row.key}`}
            onPress={row.onPress}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.row,
              { borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.secondary, backgroundColor: pressed ? c.muted : 'transparent' },
            ]}
          >
            <Feather name={row.icon} size={20} color={c.mutedForeground} />
            <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 15, color: c.foreground }}>{row.label}</Text>
            {row.value ? (
              <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: c.mutedForeground }}>{row.value}</Text>
            ) : null}
            <Feather name="chevron-right" size={16} color={c.subtle} />
          </Pressable>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable
          testID="profile-sign-out"
          onPress={confirmSignOut}
          accessibilityRole="button"
          style={({ pressed }) => [styles.pill, { borderColor: c.border, opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: c.foreground }}>{t('mobile.paywall.signOut')}</Text>
        </Pressable>
        <Pressable
          testID="profile-delete"
          onPress={requestDeletion}
          accessibilityRole="button"
          style={({ pressed }) => [styles.pill, { borderColor: c.destructiveBorder, opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: c.destructive }}>
            {t('mobile.profile.deleteAccount')}
          </Text>
        </Pressable>
      </View>
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
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  pill: {
    flex: 1,
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
