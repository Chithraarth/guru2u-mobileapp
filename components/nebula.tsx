import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/hooks/useColors';
import fonts from '@/constants/fonts';

const STAR_PATH = 'M50 6C52 40 60 48 94 50 60 52 52 60 50 94 48 60 40 52 6 50 40 48 48 40 50 6Z';

/** The Guru 2 u four-point star mark. */
export function StarMark({ size = 44, halo = false }: { size?: number; halo?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {halo ? <Circle cx={50} cy={50} r={24} fill="#9C67E4" fillOpacity={0.22} /> : null}
      <Path d={STAR_PATH} fill="#CDB4F7" stroke="#F6D98A" strokeWidth={size < 60 ? 2 : 1.2} />
      <Circle cx={50} cy={50} r={5} fill="#FFF3C4" />
    </Svg>
  );
}

/** Decorative concentric rings, positioned absolutely behind content. */
export function OrbitRings({ size, style }: { size: number; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size }, style]}>
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          borderRadius: size / 2,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: c.border,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.15,
          left: size * 0.15,
          width: size * 0.7,
          height: size * 0.7,
          borderRadius: size * 0.35,
          borderWidth: 1,
          borderColor: c.secondary,
        }}
      />
    </View>
  );
}

/** Full-screen branded splash, shown while the session loads. */
export function NebulaSplash() {
  const c = useColors();
  const { t } = useTranslation();
  return (
    <View style={[styles.fill, { backgroundColor: c.background }]}>
      <OrbitRings size={520} />
      <StarMark size={132} halo />
      <Text style={{ marginTop: 28, fontFamily: fonts.display, fontSize: 44, letterSpacing: 1, color: c.foreground }}>
        {t('mobile.home.appName')}
      </Text>
      <Text style={{ marginTop: 8, fontFamily: fonts.regular, fontSize: 15, color: c.mutedForeground }}>
        {t('mobile.home.tagline')}
      </Text>
      <View style={{ position: 'absolute', bottom: 64, flexDirection: 'row', gap: 8 }}>
        <View style={[styles.dot, { backgroundColor: c.accent }]} />
        <View style={[styles.dot, { backgroundColor: '#6A4FA0' }]} />
        <View style={[styles.dot, { backgroundColor: '#3D2E58' }]} />
      </View>
    </View>
  );
}

/** 44pt round icon button used in headers. */
export function IconButton({
  icon,
  onPress,
  label,
  color,
  testID,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
  label: string;
  color?: string;
  testID?: string;
}) {
  const c = useColors();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <Feather name={icon} size={20} color={color ?? c.foreground} />
    </Pressable>
  );
}

/** Large Marcellus screen title. */
export function ScreenTitle({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <View style={style}>
      <Text style={{ fontFamily: fonts.display, fontSize: 32, color: c.foreground }}>{children}</Text>
    </View>
  );
}

/** Small gold uppercase eyebrow label. */
export function GoldLabel({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return (
    <Text
      style={{
        fontFamily: fonts.semibold,
        fontSize: 12,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: c.accent,
      }}
    >
      {children}
    </Text>
  );
}

export type ReadingKind = 'face' | 'palm' | 'voice' | 'astro' | 'combo';

/** Icon for a reading kind, drawn in the given color. */
export function KindIcon({ kind, size = 20, color }: { kind: string; size?: number; color: string }) {
  switch (kind) {
    case 'face':
      return <Feather name="camera" size={size} color={color} />;
    case 'palm':
      return <MaterialCommunityIcons name="hand-back-left-outline" size={size} color={color} />;
    case 'voice':
      return <Feather name="mic" size={size} color={color} />;
    case 'astro':
      return <Feather name="moon" size={size} color={color} />;
    case 'combo':
      return <Feather name="eye" size={size} color={color} />;
    default:
      return <MaterialCommunityIcons name="star-four-points-outline" size={size} color={color} />;
  }
}

/** Rounded tile that holds a KindIcon. */
export function KindTile({ kind, size = 44 }: { kind: string; size?: number }) {
  const c = useColors();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: c.secondary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <KindIcon kind={kind} size={size * 0.45} color={c.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
