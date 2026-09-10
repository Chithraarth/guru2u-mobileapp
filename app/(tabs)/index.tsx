import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';

interface Mode {
  route: string;
  title: string;
  icon: React.ReactNode;
}

export default function HomeScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();

  const modes: Mode[] = [
    {
      route: '/face',
      title: t('mobile.home.modeFace'),
      icon: <Feather name="camera" size={22} color={c.primary} />,
    },
    {
      route: '/voice',
      title: t('mobile.home.modeVoice'),
      icon: <Feather name="mic" size={22} color={c.primary} />,
    },
    {
      route: '/palm',
      title: t('mobile.home.modePalm'),
      icon: <MaterialCommunityIcons name="hand-back-left-outline" size={22} color={c.primary} />,
    },
    {
      route: '/astro',
      title: t('mobile.home.modeAstro'),
      icon: <Feather name="moon" size={22} color={c.primary} />,
    },
  ];

  const go = (route: string) => {
    Haptics.selectionAsync();
    router.push(route as never);
  };

  const topPad = Platform.OS === 'web' ? 67 + 16 : insets.top + 16;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        paddingTop: topPad,
        paddingHorizontal: 20,
        paddingBottom: 120,
        gap: 14,
      }}
    >
      <View style={{ alignItems: 'center', gap: 4, marginBottom: 6 }}>
        <MaterialCommunityIcons name="star-four-points" size={24} color={c.accent} />
        <Text style={{ color: c.foreground, fontFamily: 'Inter_700Bold', fontSize: 22 }}>
          {t('mobile.home.appName')}
        </Text>
        <Text
          style={{
            color: c.mutedForeground,
            fontFamily: 'Inter_400Regular',
            fontSize: 12,
            textAlign: 'center',
          }}
        >
          {t('mobile.home.tagline')}
        </Text>
      </View>

      <Pressable
        testID="mode-insight"
        onPress={() => go('/insight')}
        style={({ pressed }) => [
          styles.insightCard,
          {
            backgroundColor: c.primary,
            borderColor: c.primary,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: c.primaryForeground + '22' }]}>
          <Feather name="eye" size={24} color={c.primaryForeground} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ color: c.primaryForeground, fontFamily: 'Inter_600SemiBold', fontSize: 17 }}>
            {t('mobile.home.insightTitle')}
          </Text>
          <Text
            style={{
              color: c.primaryForeground,
              opacity: 0.85,
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            {t('mobile.home.insightDesc')}
          </Text>
        </View>
        <Feather name="chevron-right" size={20} color={c.primaryForeground} />
      </Pressable>

      <View style={{ gap: 10 }}>
        {modes.map((m) => (
          <Pressable
            key={m.route}
            testID={`mode-${m.route.slice(1)}`}
            onPress={() => go(m.route)}
            style={({ pressed }) => [
              styles.tile,
              {
                backgroundColor: c.card,
                borderColor: c.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <View style={[styles.tileIconWrap, { backgroundColor: c.secondary }]}>
              {m.icon}
            </View>
            <Text
              style={{
                flex: 1,
                color: c.foreground,
                fontFamily: 'Inter_600SemiBold',
                fontSize: 15,
              }}
            >
              {m.title}
            </Text>
            <Feather name="chevron-right" size={20} color={c.mutedForeground} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: colors.radius,
    padding: 16,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: colors.radius,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  tileIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
