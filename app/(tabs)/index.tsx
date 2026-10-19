import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import Svg, { Circle } from 'react-native-svg';
import { ArrowRight, ChevronRight, Eye, Plus, UserRound, Wallet } from 'lucide-react-native';
import { useAuth } from '@/lib/authContext';
import { getBillingStatus } from '@/lib/billing';
import { displayNameOf } from '@/lib/user';
import { KindTile } from '@/components/nebula';
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

// A 60-credit pack is the reference for how full the balance ring is.
const PACK_SIZE = 60;

function greetingKey(hour: number): string {
  if (hour < 12) return 'mobile.home.goodMorning';
  if (hour < 18) return 'mobile.home.goodAfternoon';
  return 'mobile.home.goodEvening';
}

/** Small progress ring showing how much of a pack is left. */
function BalanceRing({ value }: { value: number | null }) {
  const r = 20;
  const circumference = 2 * Math.PI * r;
  const share = value == null ? 0 : Math.max(0, Math.min(1, value / PACK_SIZE));
  return (
    <Svg width={52} height={52} viewBox="0 0 52 52" style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={26} cy={26} r={r} stroke="rgba(255,255,255,0.18)" strokeWidth={6} fill="none" />
      <Circle
        cx={26}
        cy={26}
        r={r}
        stroke="#F0567A"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${circumference * share} ${circumference}`}
      />
    </Svg>
  );
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
  const initial = name ? name.charAt(0).toUpperCase() : null;
  const topPad = Platform.OS === 'web' ? 67 : insets.top + 12;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ paddingTop: topPad, paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE + insets.bottom, gap: 16 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: 2, flex: 1 }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: c.mutedForeground }}>
            {t(greetingKey(now.getHours()))}
          </Text>
          <Text style={{ fontFamily: fonts.display, fontSize: 28, letterSpacing: -0.6, color: c.foreground }} numberOfLines={1}>
            {name || t('mobile.home.appName')}
          </Text>
        </View>
        <Pressable
          testID="open-profile"
          onPress={() => go('/profile')}
          accessibilityRole="button"
          accessibilityLabel={t('mobile.tabs.profile')}
          style={({ pressed }) => [styles.avatar, { backgroundColor: c.accent, opacity: pressed ? 0.8 : 1 }]}
        >
          {initial ? (
            <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: c.accentForeground }}>{initial}</Text>
          ) : (
            <UserRound size={22} color={c.accentForeground} />
          )}
        </Pressable>
      </View>

      <View style={[styles.balance, { backgroundColor: c.primaryFill }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.balanceEyebrow}>{t('mobile.profile.currentBalance')}</Text>
          <Wallet size={18} color="rgba(255,255,255,0.7)" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
          <Text testID="home-balance" style={styles.balanceNumber}>
            {remaining ?? '—'}
          </Text>
          <Text style={styles.balanceUnit}>{t('mobile.profile.readingsUnit')}</Text>
          <View style={{ marginLeft: 'auto' }}>
            <BalanceRing value={remaining} />
          </View>
        </View>
        {remaining === 0 ? (
          <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
            {t('mobile.paywall.creditsRemaining', { count: 0 })}
          </Text>
        ) : null}
        <Pressable
          testID="open-paywall"
          onPress={() => go('/paywall')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.topUp, { backgroundColor: c.accent, opacity: pressed ? 0.85 : 1 }]}
        >
          <Plus size={16} color={c.accentForeground} strokeWidth={2.6} />
          <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: c.accentForeground }}>{t('mobile.profile.topUpNow')}</Text>
        </Pressable>
      </View>

      <Pressable
        testID="mode-insight"
        onPress={() => go('/insight')}
        style={({ pressed }) => [styles.insight, { backgroundColor: c.accentSoft, opacity: pressed ? 0.92 : 1 }]}
      >
        <View style={[styles.insightIcon, { backgroundColor: c.accent }]}>
          <Eye size={22} color={c.accentForeground} />
        </View>
        <Text style={{ fontFamily: fonts.display, fontSize: 20, letterSpacing: -0.3, color: c.foreground }}>
          {t('mobile.home.insightTitle')}
        </Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: c.mutedForeground }}>
          {t('mobile.home.insightDesc')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: c.accentInk }}>{t('mobile.home.startReading')}</Text>
          <ArrowRight size={16} color={c.accentInk} />
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <KindTile kind={m.kind} size={42} />
              <ChevronRight size={18} color={c.subtle} />
            </View>
            <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: c.foreground }}>{t(m.titleKey)}</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 17, color: c.mutedForeground }} numberOfLines={3}>
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
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  balance: {
    borderRadius: colors.radiusLg,
    padding: 18,
    gap: 10,
    shadowColor: '#4A1D6B',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  balanceEyebrow: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.72)',
  },
  balanceNumber: {
    fontFamily: fonts.display,
    fontSize: 52,
    lineHeight: 56,
    letterSpacing: -1.5,
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  balanceUnit: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    paddingBottom: 9,
  },
  topUp: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  insight: {
    borderRadius: colors.radiusLg,
    padding: 18,
    gap: 8,
  },
  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
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
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    shadowColor: '#4A1D6B',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
});
