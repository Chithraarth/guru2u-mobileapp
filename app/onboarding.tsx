import React, { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { PrimaryButton } from '@/components/ui';
import { KindIcon, StarMark } from '@/components/nebula';
import { useOnboarding } from '@/lib/onboarding';
import { useColors } from '@/hooks/useColors';
import fonts from '@/constants/fonts';

const SLIDES = [
  { key: 'read', titleKey: 'mobile.onboarding.slide1Title', bodyKey: 'mobile.onboarding.slide1Body' },
  { key: 'moves', titleKey: 'mobile.onboarding.slide2Title', bodyKey: 'mobile.onboarding.slide2Body' },
  { key: 'private', titleKey: 'mobile.onboarding.slide3Title', bodyKey: 'mobile.onboarding.slide3Body' },
] as const;

function OrbitIllustration() {
  const c = useColors();
  const satellites: { kind: string; top: number; left: number }[] = [
    { kind: 'face', top: -22, left: 128 },
    { kind: 'voice', top: 128, left: 278 },
    { kind: 'palm', top: 278, left: 128 },
    { kind: 'astro', top: 128, left: -22 },
  ];
  return (
    <View style={{ width: 300, height: 300 }}>
      <View
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: 150,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: c.borderStrong,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 60,
          left: 60,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: c.card,
          borderWidth: 1,
          borderColor: c.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <StarMark size={84} />
      </View>
      {satellites.map((s) => (
        <View
          key={s.kind}
          style={{
            position: 'absolute',
            top: s.top,
            left: s.left,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: c.secondary,
            borderWidth: 1,
            borderColor: c.borderStrong,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <KindIcon kind={s.kind} size={20} color={c.accent} />
        </View>
      ))}
    </View>
  );
}

function MovesIllustration() {
  const c = useColors();
  const { t } = useTranslation();
  return (
    <View
      style={{
        width: 290,
        borderRadius: 24,
        backgroundColor: c.primaryFill,
        padding: 20,
        gap: 14,
        transform: [{ rotate: '-3deg' }],
      }}
    >
      <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: c.primaryForeground }}>
        {t('mobile.result.nextMoves')}
      </Text>
      {[0.9, 0.75, 0.82].map((w, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: c.primaryForeground }}>{i + 1}</Text>
          </View>
          <View style={{ height: 10, borderRadius: 5, width: w * 200, backgroundColor: 'rgba(255,255,255,0.35)' }} />
        </View>
      ))}
    </View>
  );
}

function PrivacyIllustration() {
  const c = useColors();
  return (
    <View style={{ width: 240, height: 240, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: 240,
          height: 240,
          borderRadius: 120,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: c.borderStrong,
        }}
      />
      <View
        style={{
          width: 150,
          height: 150,
          borderRadius: 75,
          backgroundColor: c.card,
          borderWidth: 1,
          borderColor: c.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Feather name="shield" size={64} color={c.accent} />
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const { markSeen } = useOnboarding();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const next = () => {
    if (isLast) {
      markSeen();
      return;
    }
    const target = index + 1;
    listRef.current?.scrollToIndex({ index: target, animated: true });
    setIndex(target);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 24 }}>
        {!isLast ? (
          <Pressable onPress={markSeen} hitSlop={12} accessibilityRole="button" style={{ paddingVertical: 12, paddingHorizontal: 4 }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: c.mutedForeground }}>
              {t('mobile.onboarding.skip')}
            </Text>
          </Pressable>
        ) : (
          <View style={{ height: 44 }} />
        )}
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={{ width, paddingHorizontal: 24, alignItems: 'center' }}>
            <View style={{ height: 340, alignItems: 'center', justifyContent: 'center' }}>
              {item.key === 'read' ? (
                <OrbitIllustration />
              ) : item.key === 'moves' ? (
                <MovesIllustration />
              ) : (
                <PrivacyIllustration />
              )}
            </View>
            <Text
              style={{
                marginTop: 24,
                fontFamily: fonts.display,
                fontSize: 32,
                lineHeight: 38,
                color: c.foreground,
                textAlign: 'center',
              }}
            >
              {t(item.titleKey)}
            </Text>
            <Text
              style={{
                marginTop: 12,
                fontFamily: fonts.regular,
                fontSize: 15,
                lineHeight: 22,
                color: c.mutedForeground,
                textAlign: 'center',
              }}
            >
              {t(item.bodyKey)}
            </Text>
          </View>
        )}
      />

      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
        {SLIDES.map((s, i) => (
          <View
            key={s.key}
            style={{
              width: i === index ? 24 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === index ? c.accent : c.borderStrong,
            }}
          />
        ))}
      </View>

      <View style={{ paddingHorizontal: 24, gap: 6 }}>
        <PrimaryButton
          testID="onboarding-next"
          title={isLast ? t('mobile.onboarding.getStarted') : t('mobile.onboarding.next')}
          onPress={next}
        />
        <Pressable onPress={markSeen} accessibilityRole="button" style={{ padding: 12, alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: c.mutedForeground }}>
            {t('mobile.onboarding.haveAccount')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
