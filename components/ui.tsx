import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';

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
          borderRadius: colors.radius,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  testID,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
}) {
  const c = useColors();
  const isDisabled = !!disabled || !!loading;
  return (
    <Pressable
      testID={testID}
      disabled={isDisabled}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: c.primary,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={c.primaryForeground} />
      ) : (
        <Text style={[styles.buttonText, { color: c.primaryForeground }]}>
          {title}
        </Text>
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
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? c.primary : c.secondary,
          borderColor: selected ? c.primary : c.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text
        style={{
          color: selected ? c.primaryForeground : c.secondaryForeground,
          fontFamily: 'Inter_500Medium',
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function SectionLabel({ children }: { children: string }) {
  const c = useColors();
  return (
    <Text
      style={{
        color: c.mutedForeground,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 8,
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
        backgroundColor: c.destructive + '22',
        borderColor: c.destructive,
        borderWidth: 1,
        borderRadius: colors.radius,
        padding: 12,
      }}
    >
      <Text style={{ color: c.destructive, fontFamily: 'Inter_500Medium', fontSize: 14 }}>
        {message}
      </Text>
    </View>
  );
}

export function MysticLoading({ label }: { label: string }) {
  const c = useColors();
  return (
    <View style={{ alignItems: 'center', gap: 12, paddingVertical: 40 }}>
      <ActivityIndicator size="large" color={c.primary} />
      <Text
        style={{
          color: c.mutedForeground,
          fontFamily: 'Inter_500Medium',
          fontSize: 15,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: colors.radius,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});
