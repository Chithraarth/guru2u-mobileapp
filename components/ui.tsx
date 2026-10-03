import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';
import fonts from '@/constants/fonts';
import { StarMark } from '@/components/nebula';

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  return (
    <View
      style={[
        {
          backgroundColor: c.card,
          borderColor: c.border,
          borderWidth: 1,
          borderRadius: colors.radiusLg,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

type ButtonVariant = 'primary' | 'gold' | 'outline';

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  testID,
  variant = 'primary',
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
  variant?: ButtonVariant;
  icon?: React.ComponentProps<typeof Feather>['name'];
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const isDisabled = !!disabled || !!loading;
  const bg = variant === 'gold' ? c.accent : variant === 'outline' ? 'transparent' : c.primaryFill;
  const fg = variant === 'gold' ? c.accentForeground : variant === 'outline' ? c.foreground : c.primaryForeground;
  return (
    <Pressable
      testID={testID}
      disabled={isDisabled}
      accessibilityRole="button"
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: c.borderStrong,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon ? <Feather name={icon} size={18} color={fg} /> : null}
          <Text style={[styles.buttonText, { color: fg, fontFamily: variant === 'gold' ? fonts.bold : fonts.semibold }]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  testID,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
}) {
  const c = useColors();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected: !!selected } : undefined}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? c.accent : 'transparent',
          borderColor: selected ? c.accent : c.borderStrong,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text
        style={{
          color: selected ? c.accentForeground : c.secondaryForeground,
          fontFamily: selected ? fonts.semibold : fonts.medium,
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Segmented pill control (e.g. AM/PM, mode pickers). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const c = useColors();
  return (
    <View style={[styles.segmented, { backgroundColor: c.card, borderColor: c.border }]}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={{
              flexGrow: 1,
              paddingVertical: 9,
              paddingHorizontal: 14,
              borderRadius: 999,
              alignItems: 'center',
              backgroundColor: selected ? c.primaryFill : 'transparent',
            }}
          >
            <Text
              style={{
                fontFamily: selected ? fonts.semibold : fonts.medium,
                fontSize: 13,
                color: selected ? c.primaryForeground : c.mutedForeground,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  const c = useColors();
  return (
    <Text
      style={{
        color: c.accent,
        fontFamily: fonts.semibold,
        fontSize: 12,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 10,
      }}
    >
      {children}
    </Text>
  );
}

export function ErrorBox({ message }: { message: string }) {
  const c = useColors();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-start',
        backgroundColor: c.destructive + '1A',
        borderColor: c.destructiveBorder,
        borderWidth: 1,
        borderRadius: colors.radius,
        padding: 12,
      }}
    >
      <Feather name="alert-circle" size={18} color={c.destructive} style={{ marginTop: 1 }} />
      <Text style={{ flex: 1, color: c.destructive, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 }}>
        {message}
      </Text>
    </View>
  );
}

function useSpin(durationMs: number) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(value, {
        toValue: 1,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [value, durationMs]);
  return value.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
}

const STEP_KEYS = ['mobile.analyzing.step1', 'mobile.analyzing.step2', 'mobile.analyzing.step3'];
const STEP_INTERVAL_MS = 7000;

/**
 * Full "reading the signs" state shown while a reading is generated:
 * orbiting rings, a title, the screen-specific label and a step list
 * that advances on a timer (the final step keeps spinning until done).
 */
export function MysticLoading({ label }: { label: string }) {
  const c = useColors();
  const { t } = useTranslation();
  const slow = useSpin(18000);
  const fast = useSpin(2400);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEP_KEYS.length - 1));
    }, STEP_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={{ alignItems: 'center', paddingVertical: 24 }} accessibilityLiveRegion="polite">
      <View style={{ width: 220, height: 220, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: 110, borderWidth: 1, borderStyle: 'dashed', borderColor: c.borderStrong, transform: [{ rotate: slow }] },
          ]}
        />
        <Animated.View
          style={{
            position: 'absolute',
            width: 164,
            height: 164,
            borderRadius: 82,
            borderWidth: 2,
            borderColor: 'transparent',
            borderTopColor: c.accent,
            borderRightColor: c.accent,
            transform: [{ rotate: fast }],
          }}
        />
        <View
          style={{
            width: 104,
            height: 104,
            borderRadius: 52,
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <StarMark size={64} />
        </View>
      </View>
      <Text style={{ marginTop: 32, fontFamily: fonts.display, fontSize: 28, color: c.foreground }}>
        {t('mobile.analyzing.title')}
      </Text>
      <Text
        style={{
          marginTop: 8,
          color: c.mutedForeground,
          fontFamily: fonts.regular,
          fontSize: 15,
          lineHeight: 22,
          textAlign: 'center',
          paddingHorizontal: 12,
        }}
      >
        {label}
      </Text>
      <Card style={{ marginTop: 28, alignSelf: 'stretch', gap: 14 }}>
        {STEP_KEYS.map((key, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {done ? (
                <View style={[styles.stepDot, { backgroundColor: c.primaryFill }]}>
                  <Feather name="check" size={14} color={c.primaryForeground} />
                </View>
              ) : active ? (
                <View style={styles.stepDot}>
                  <ActivityIndicator size="small" color={c.accent} />
                </View>
              ) : (
                <View style={[styles.stepDot, { borderWidth: 1.5, borderColor: c.borderStrong }]} />
              )}
              <Text
                style={{
                  fontFamily: fonts.medium,
                  fontSize: 15,
                  color: active ? c.accent : done ? c.foreground : c.subtle,
                }}
              >
                {t(key)}
              </Text>
            </View>
          );
        })}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 28,
    minHeight: 56,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  segmented: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
    gap: 2,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
