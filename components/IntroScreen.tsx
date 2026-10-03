import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import fonts from '@/constants/fonts';

const PARTICLE_COUNT = 24;
const PARTICLE_COLORS = [colors.dark.accent, colors.dark.primary];

interface ParticleSpec {
  left: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

function Particle({ spec, screenHeight }: { spec: ParticleSpec; screenHeight: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      spec.delay,
      withRepeat(withTiming(1, { duration: spec.duration, easing: Easing.linear }), -1, false)
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const y = screenHeight * 1.1 - progress.value * screenHeight * 1.2;
    const drift = Math.sin(progress.value * Math.PI * 2) * 15;
    const opacity =
      progress.value < 0.2
        ? progress.value / 0.2
        : progress.value > 0.85
          ? (1 - progress.value) / 0.15
          : 0.6;
    return {
      transform: [{ translateY: y }, { translateX: drift }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: `${spec.left}%`,
          width: spec.size,
          height: spec.size,
          borderRadius: spec.size / 2,
          backgroundColor: spec.color,
        },
        style,
      ]}
    />
  );
}

function SparkleMotif() {
  const scale = useSharedValue(0.95);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    rotation.value = withRepeat(withTiming(360, { duration: 12000, easing: Easing.linear }), -1, false);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[{ width: 128, height: 128 }, style]}>
      <Svg viewBox="0 0 100 100" width="100%" height="100%">
        <Path
          d="M50 0 C50 30 70 50 100 50 C70 50 50 70 50 100 C50 70 30 50 0 50 C30 50 50 30 50 0 Z"
          fill={colors.dark.accent}
        />
      </Svg>
    </Animated.View>
  );
}

export default function IntroScreen() {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(20);

  useEffect(() => {
    taglineOpacity.value = withDelay(1000, withTiming(0.7, { duration: 1500 }));
    taglineY.value = withDelay(1000, withTiming(0, { duration: 1500 }));
  }, []);

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));

  const particles = useMemo<ParticleSpec[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }, () => ({
        left: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: (Math.random() * 15 + 15) * 1000,
        delay: Math.random() * 3000,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      })),
    []
  );

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <LinearGradient
        colors={[colors.dark.primary + '26', colors.dark.background]}
        style={StyleSheet.absoluteFill}
      />
      {particles.map((spec, i) => (
        <Particle key={i} spec={spec} screenHeight={height} />
      ))}
      <View style={styles.center}>
        <View style={styles.motifWrap}>
          <SparkleMotif />
        </View>
        <Text style={styles.logotype}>Guru 2 u</Text>
      </View>
      <Animated.Text style={[styles.tagline, taglineStyle]}>
        {t('mobile.intro.tagline')}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    gap: 8,
  },
  motifWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logotype: {
    color: colors.dark.foreground,
    fontFamily: fonts.display,
    fontSize: 32,
    letterSpacing: -0.5,
  },
  tagline: {
    position: 'absolute',
    bottom: 40,
    color: colors.dark.mutedForeground,
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
