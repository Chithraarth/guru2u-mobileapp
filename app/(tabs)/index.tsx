import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/authContext';
import { getBillingStatus } from '@/lib/billing';
import { displayNameOf } from '@/lib/user';
import { KindIcon } from '@/components/nebula';
import { TAB_BAR_SPACE } from '@/components/NebulaTabBar';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';
import fonts from '@/constants/fonts';

interface Mode {
  route: string;
  kind: string;
  titleKey: string;
  descKey: string;
}

const MODES: Mode[] = [
  { route: '/face', kind: 'face', titleKey: 'mobile.home.modeFace', descKey: 'home.modeFaceDesc' },
  { route: '/voice', kind: 'voice', titleKey: 'mobile.home.modeVoice', descKey: 'home.modeVoiceDesc' },
  { route: '/palm', kind: 'palm', titleKey: 'mobile.home.modePalm', descKey: 'home.modePalmDesc' },
  { route: '/astro', kind: 'astro', titleKey: 'mobile.home.modeAstro', descKey: 'home.modeAstroDesc' },
];

function greetingKey(hour: number): string {
  if (hour < 12) return 'mobile.home.goodMorning';
  if (hour < 18) return 'mobile.home.goodAfternoon';
  return 'mobile.home.goodEvening';
}

export default function HomeScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: billingStatus } = useQuery({ queryKey: ['billing', 'status'], queryFn: getBillingStatus });
  const remaining = billingStatus?.scansRemaining ?? null;

  const go = (route: string) => {
    Haptics.selectionAsync();
    router.push(route as never);
  };

  const now = new Date();
  const name = displayNameOf(user);
  const initial = (name || '?').charAt(0).toUpperCase();
  const topPad = Platform.OS === 'web' ? 67 : insets.top + 12;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ paddingTop: topPad, paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE + insets.bottom, gap: 16 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: 2, flex: 1 }}>
          <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: c.mutedForeground }}>
            {t(greetingKey(now.getHours()))}
          </Text>
          <Text style={{ fontFamily: fonts.display, fontSize: 26, color: c.foreground }} numberOfLines={1}>
            {name || t('mobile.home.appName')}
          </Text>
        </View>
        <Pressable
          testID="open-profile"
          onPress={() => go('/profile')}
          accessibilityRole="button"
          accessibilityLabel={t('mobile.tabs.profile')}
          style={({ pressed }) => [styles.avatar, { backgroundColor: c.primaryFill, opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={{ fontFamily: fonts.semibold, fontSize: 16, color: c.primaryForeground }}>{initial}</Text>
        </Pressable>
      </View>

      <Pressable
        testID="open-paywall"
        onPress={() => go('/paywall')}
        style={({ pressed }) => [styles.todayCard, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.9 : 1 }]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.eyebrow, { color: c.accent }]}>
            {t('mobile.profile.currentBalance')}
          </Text>
          <Text style={{ fontFamily: fonts.semibold, fontSize: 12, color: c.accent }}>{t('mobile.profile.topUpNow')}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 34, color: c.foreground }}>{remaining ?? '—'}</Text>
          <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: c.mutedForeground }}>{t('mobile.profile.readingsUnit')}</Text>
        </View>
        {remaining === 0 ? (
          <Text style={{ fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: c.mutedForeground }}>
            {t('mobile.paywall.creditsRemaining', { count: 0 })}
          </Text>
        ) : null}
      </Pressable>

      <Pressable
        testID="mode-insight"
        onPress={() => go('/insight')}
        style={({ pressed }) => [styles.hero, { backgroundColor: c.primaryFill, opacity: pressed ? 0.92 : 1 }]}
      >
        <View style={styles.heroRing} />
        <View style={styles.heroIcon}>
          <Feather name="eye" size={22} color={c.primaryForeground} />
        </View>
        <Text style={{ fontFamily: fonts.display, fontSize: 22, color: c.primaryForeground }}>
          {t('mobile.home.insightTitle')}
        </Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: c.primaryForeground, opacity: 0.9 }}>
          {t('mobile.home.insightDesc')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: c.accentSoft }}>{t('mobile.home.startReading')}</Text>
          <Feather name="chevron-right" size={16} color={c.accentSoft} />
        </View>
      </Pressable>

      <Text style={[styles.eyebrow, { color: c.mutedForeground }]}>{t('mobile.home.quickReadings')}</Text>
      <View style={styles.grid}>
        {MODES.map((m) => (
          <Pressable
            key={m.route}
            testID={`mode-${m.kind}`}
            onPress={() => go(m.route)}
            style={({ pressed }) => [styles.tile, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}
          >
            <View style={[styles.tileIcon, { backgroundColor: c.secondary }]}>
              <KindIcon kind={m.kind} size={20} color={c.accent} />
            </View>
            <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: c.foreground }}>{t(m.titleKey)}</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: c.mutedForeground }} numberOfLines={3}>
              {t(m.descKey)}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  todayCard: {
    borderRadius: colors.radiusLg,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 10,
  },
  hero: {
    borderRadius: 24,
    padding: 20,
    gap: 10,
    overflow: 'hidden',
  },
  heroRing: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    width: '47.8%',
    flexGrow: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  tileIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
