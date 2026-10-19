import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { Eye, Hand, Mic, MoonStar, ScanFace, Sparkles } from 'lucide-react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/hooks/useColors';
import fonts from '@/constants/fonts';

const STAR_PATH = 'M50 6C52 40 60 48 94 50 60 52 52 60 50 94 48 60 40 52 6 50 40 48 48 40 50 6Z';

/** The Guru 2 u four-point star mark. `tone="light"` is for plum surfaces. */
export function StarMark({
  size = 44,
  halo = false,
  tone = 'dark',
}: {
  size?: number;
  halo?: boolean;
  tone?: 'dark' | 'light';
}) {
  const fill = tone === 'light' ? '#FFE3EA' : '#4A1D6B';
  const center = tone === 'light' ? '#F0567A' : '#FFE3EA';
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {halo ? <Circle cx={50} cy={50} r={26} fill="#F0567A" fillOpacity={0.16} /> : null}
      <Path d={STAR_PATH} fill={fill} stroke="#F0567A" strokeWidth={size < 60 ? 2.4 : 1.4} />
      <Circle cx={50} cy={50} r={5} fill={center} />
    </Svg>
  );
}

/** Soft blush blobs, positioned absolutely behind content. */
export function OrbitRings({ size, style }: { size: number; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size }, style]}>
      <View
        style={{
          position: 'absolute',
          top: size * 0.08,
          left: size * 0.08,
          width: size * 0.84,
          height: size * 0.84,
          borderRadius: size * 0.42,
          backgroundColor: c.accentSoft,
          opacity: 0.55,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.24,
          left: size * 0.24,
          width: size * 0.52,
          height: size * 0.52,
          borderRadius: size * 0.26,
          backgroundColor: c.violetSoft,
          opacity: 0.8,
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
      <OrbitRings size={420} />
      <StarMark size={112} />
      <Text style={{ marginTop: 26, fontFamily: fonts.display, fontSize: 38, letterSpacing: -0.5, color: c.foreground }}>
        {t('mobile.home.appName')}
      </Text>
      <Text style={{ marginTop: 6, fontFamily: fonts.medium, fontSize: 15, color: c.mutedForeground }}>
        {t('mobile.home.tagline')}
      </Text>
      <View style={{ position: 'absolute', bottom: 64, flexDirection: 'row', gap: 8 }}>
        <View style={[styles.dot, { width: 22, backgroundColor: c.accent }]} />
        <View style={[styles.dot, { backgroundColor: c.borderStrong }]} />
        <View style={[styles.dot, { backgroundColor: c.borderStrong }]} />
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

/** Large screen title. */
export function ScreenTitle({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <View style={style}>
      <Text style={{ fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.6, color: c.foreground }}>{children}</Text>
    </View>
  );
}

/** Small rose uppercase eyebrow label. */
export function GoldLabel({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return (
    <Text
      style={{
        fontFamily: fonts.bold,
        fontSize: 12,
        letterSpacing: 1.4,
        textTransform: 'uppercase',
        color: c.accentInk,
      }}
    >
      {children}
    </Text>
  );
}

export type ReadingKind = 'face' | 'palm' | 'voice' | 'astro' | 'combo';

/** Icon for a reading kind, drawn in the given color. */
export function KindIcon({ kind, size = 20, color }: { kind: string; size?: number; color: string }) {
  const props = { size, color, strokeWidth: 2 };
  switch (kind) {
    case 'face':
      return <ScanFace {...props} />;
    case 'palm':
      return <Hand {...props} />;
    case 'voice':
      return <Mic {...props} />;
    case 'astro':
      return <MoonStar {...props} />;
    case 'combo':
      return <Eye {...props} />;
    default:
      return <Sparkles {...props} />;
  }
}

/** [tile background, icon color] for each reading kind. */
export function kindTint(kind: string, c: ReturnType<typeof useColors>): [string, string] {
  switch (kind) {
    case 'face':
      return [c.tintFace, c.tintFaceInk];
    case 'voice':
      return [c.tintVoice, c.tintVoiceInk];
    case 'palm':
      return [c.tintPalm, c.tintPalmInk];
    case 'astro':
      return [c.tintAstro, c.tintAstroInk];
    default:
      return [c.accentSoft, c.accentInk];
  }
}

/** Rounded tile that holds a KindIcon in its reading-type tint. */
export function KindTile({ kind, size = 44 }: { kind: string; size?: number }) {
  const c = useColors();
  const [bg, ink] = kindTint(kind, c);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <KindIcon kind={kind} size={size * 0.46} color={ink} />
    </View>
  );
}

// ---- Face mesh: landmark wireframe used by the face scan guide ----
type Pt = [number, number];
const JAW: Pt[] = [[40,95],[42,120],[47,145],[55,168],[67,189],[83,206],[100,214],[117,206],[133,189],[145,168],[153,145],[158,120],[160,95]];
const TOP: Pt[] = [[40,95],[44,70],[58,50],[78,38],[100,34],[122,38],[142,50],[156,70],[160,95]];
const BROW_L: Pt[] = [[52,82],[62,75],[74,73],[86,77]];
const BROW_R: Pt[] = [[114,77],[126,73],[138,75],[148,82]];
const EYE_L: Pt[] = [[58,98],[66,93],[76,93],[84,99],[76,103],[66,103],[58,98]];
const EYE_R: Pt[] = [[116,99],[124,93],[134,93],[142,98],[134,103],[124,103],[116,99]];
const NOSE: Pt[] = [[100,94],[100,110],[100,126],[90,136],[95,140],[100,142],[105,140],[110,136],[100,126]];
const MOUTH: Pt[] = [[80,165],[88,159],[96,157],[100,158],[104,157],[112,159],[120,165],[112,172],[104,175],[100,175],[96,175],[88,172],[80,165]];
const CROSS: [Pt, Pt][] = [
  [[84,99],[100,94]],[[116,99],[100,94]],[[58,98],[42,120]],[[142,98],[158,120]],[[90,136],[80,165]],[[110,136],[120,165]],
  [[66,103],[62,130]],[[62,130],[90,136]],[[62,130],[55,168]],[[62,130],[80,165]],[[134,103],[138,130]],[[138,130],[110,136]],
  [[138,130],[145,168]],[[138,130],[120,165]],[[80,165],[67,189]],[[120,165],[133,189]],[[100,175],[100,214]],
  [[86,77],[100,60]],[[114,77],[100,60]],[[100,60],[100,94]],[[52,82],[58,50]],[[148,82],[142,50]],[[74,73],[78,38]],[[126,73],[122,38]],
];
const GROUPS = [JAW, TOP, BROW_L, BROW_R, EYE_L, EYE_R, NOSE, MOUTH];
const DOTS: Pt[] = Array.from(
  new Map([...GROUPS.flat(), [62, 130] as Pt, [138, 130] as Pt, [100, 60] as Pt].map((p) => [p.join(','), p])).values(),
);

/** Wireframe face made of facial landmarks (eyes, brows, nose, lips, jaw). */
export function FaceMesh({ width, line = '#FFB3C6', dot = '#FFFFFF' }: { width: number; line?: string; dot?: string }) {
  return (
    <Svg width={width} height={width * 1.25} viewBox="0 0 200 250">
      {GROUPS.map((g, i) => (
        <Polyline
          key={i}
          points={g.map((p) => p.join(',')).join(' ')}
          fill="none"
          stroke={line}
          strokeWidth={1.2}
          strokeLinejoin="round"
          strokeOpacity={0.95}
        />
      ))}
      {CROSS.map(([a, b], i) => (
        <Line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={line} strokeWidth={0.7} strokeOpacity={0.45} />
      ))}
      {DOTS.map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={2.3} fill={dot} />
      ))}
    </Svg>
  );
}

/** A soft rose scan beam sweeping up and down inside its parent. */
export function ScanBeam({ height }: { height: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [t]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: t.value * height * 0.62 }] }));
  return (
    <Animated.View pointerEvents="none" style={[styles.beam, { top: height * 0.06 }, style]}>
      <View style={{ flex: 1, backgroundColor: 'rgba(240,86,122,0.18)' }} />
      <View style={{ height: 2, backgroundColor: '#F0567A' }} />
    </Animated.View>
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
  beam: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 46,
  },
});
