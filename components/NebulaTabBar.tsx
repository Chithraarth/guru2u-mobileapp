import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import fonts from '@/constants/fonts';

/** Total vertical space the floating bar takes, for content padding. */
export const TAB_BAR_SPACE = 110;

type Item =
  | { kind: 'route'; name: string; labelKey: string; icon: (color: string) => React.ReactNode }
  | { kind: 'action'; key: string; labelKey: string; href: string; icon: (color: string) => React.ReactNode };

const ITEMS: Item[] = [
  {
    kind: 'route',
    name: 'index',
    labelKey: 'nav.oracle',
    icon: (color) => <MaterialCommunityIcons name="star-four-points-outline" size={22} color={color} />,
  },
  {
    kind: 'action',
    key: 'insight',
    labelKey: 'mobile.tabs.insight',
    href: '/insight',
    icon: (color) => <Feather name="eye" size={21} color={color} />,
  },
  {
    kind: 'route',
    name: 'history',
    labelKey: 'nav.history',
    icon: (color) => <Feather name="book" size={21} color={color} />,
  },
  {
    kind: 'route',
    name: 'profile',
    labelKey: 'mobile.tabs.profile',
    icon: (color) => <Feather name="user" size={21} color={color} />,
  },
];

/**
 * Floating pill tab bar. Oracle, History and Profile are real tabs;
 * Insight opens the Insight reading flow on top of the tabs.
 */
export function NebulaTabBar({ state, navigation }: BottomTabBarProps) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const activeName = state.routes[state.index]?.name;
  const bottom = Platform.OS === 'web' ? 20 : Math.max(insets.bottom - 6, 14);

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
      <View
        accessibilityRole="tablist"
        style={[styles.bar, { backgroundColor: c.tabBar, borderColor: c.tabBarBorder }]}
      >
        {ITEMS.map((item) => {
          const focused = item.kind === 'route' && item.name === activeName;
          const color = focused ? c.accent : c.mutedForeground;
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
              style={({ pressed }) => [styles.item, { opacity: pressed ? 0.7 : 1 }]}
            >
              {item.icon(color)}
              <Text style={{ fontFamily: focused ? fonts.semibold : fonts.medium, fontSize: 11, color }}>
                {t(item.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  bar: {
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  item: {
    minWidth: 64,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
});
