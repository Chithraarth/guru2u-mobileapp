import React, { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Eye, History, House, Plus, UserRound } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { KindTile } from '@/components/nebula';
import { useColors } from '@/hooks/useColors';
import fonts from '@/constants/fonts';

/** Vertical space the tab bar takes above the safe area, for content padding. */
export const TAB_BAR_SPACE = 96;

type Item =
  | { kind: 'route'; name: string; labelKey: string; Icon: typeof House }
  | { kind: 'action'; key: string; labelKey: string; href: string; Icon: typeof House };

const LEFT: Item[] = [
  { kind: 'route', name: 'index', labelKey: 'nav.oracle', Icon: House },
  { kind: 'action', key: 'insight', labelKey: 'mobile.tabs.insight', href: '/insight', Icon: Eye },
];
const RIGHT: Item[] = [
  { kind: 'route', name: 'history', labelKey: 'nav.history', Icon: History },
  { kind: 'route', name: 'profile', labelKey: 'mobile.tabs.profile', Icon: UserRound },
];

const READINGS = [
  { kind: 'combo', route: '/insight', titleKey: 'mobile.home.insightTitle' },
  { kind: 'face', route: '/face', titleKey: 'mobile.home.modeFace' },
  { kind: 'voice', route: '/voice', titleKey: 'mobile.home.modeVoice' },
  { kind: 'palm', route: '/palm', titleKey: 'mobile.home.modePalm' },
  { kind: 'astro', route: '/astro', titleKey: 'mobile.home.modeAstro' },
];

/**
 * Bottom tab bar with a centre "new reading" button. Oracle, History and
 * Profile are real tabs; Insight opens the Insight flow on top of the tabs.
 */
export function NebulaTabBar({ state, navigation }: BottomTabBarProps) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const activeName = state.routes[state.index]?.name;
  const bottomPad = Platform.OS === 'web' ? 12 : Math.max(insets.bottom, 12);

  const renderItem = (item: Item) => {
    const focused = item.kind === 'route' && item.name === activeName;
    const color = focused ? c.primary : c.subtle;
    const onPress = () => {
      Haptics.selectionAsync();
      if (item.kind === 'action') {
        router.push(item.href as never);
        return;
      }
      const route = state.routes.find((r) => r.name === item.name);
      if (!route) return;
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
    };
    return (
      <Pressable
        key={item.kind === 'route' ? item.name : item.key}
        testID={`tab-${item.kind === 'route' ? item.name : item.key}`}
        onPress={onPress}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={t(item.labelKey)}
        style={({ pressed }) => [styles.item, { opacity: pressed ? 0.6 : 1 }]}
      >
        <item.Icon size={22} color={color} strokeWidth={focused ? 2.4 : 2} />
        <Text style={{ fontFamily: focused ? fonts.bold : fonts.medium, fontSize: 11, color }}>{t(item.labelKey)}</Text>
      </Pressable>
    );
  };

  return (
    <>
      <View style={[styles.bar, { paddingBottom: bottomPad, backgroundColor: c.tabBar, borderColor: c.tabBarBorder }]}>
        {LEFT.map(renderItem)}
        <View style={styles.centerSlot}>
          <Pressable
            testID="tab-new-reading"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setSheetOpen(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={t('mobile.home.startReading')}
            style={({ pressed }) => [styles.center, { backgroundColor: c.primaryFill, opacity: pressed ? 0.9 : 1 }]}
          >
            <Plus size={26} color={c.primaryForeground} strokeWidth={2.6} />
          </Pressable>
        </View>
        {RIGHT.map(renderItem)}
      </View>

      <Modal visible={sheetOpen} transparent animationType="fade" onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={styles.scrim} onPress={() => setSheetOpen(false)} accessibilityLabel={t('mobile.common.cancel')} />
        <View style={[styles.sheet, { backgroundColor: c.background, paddingBottom: bottomPad + 8 }]}>
          <View style={[styles.grabber, { backgroundColor: c.borderStrong }]} />
          <Text style={{ fontFamily: fonts.display, fontSize: 22, color: c.foreground, marginBottom: 4 }}>
            {t('mobile.home.startReading')}
          </Text>
          {READINGS.map((r) => (
            <Pressable
              key={r.kind}
              testID={`new-reading-${r.kind}`}
              onPress={() => {
                setSheetOpen(false);
                router.push(r.route as never);
              }}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.sheetRow,
                { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <KindTile kind={r.kind} size={40} />
              <Text style={{ flex: 1, fontFamily: fonts.bold, fontSize: 16, color: c.foreground }}>{t(r.titleKey)}</Text>
              <ChevronRight size={18} color={c.subtle} />
            </Pressable>
          ))}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    shadowColor: '#4A1D6B',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  item: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
  },
  center: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginTop: -34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFF6F8',
    shadowColor: '#4A1D6B',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(42,18,53,0.4)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 10,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    marginBottom: 8,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    minHeight: 60,
  },
});
