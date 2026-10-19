/**
 * Rosewood theme — soft blush ground, rich plum for primary surfaces and
 * actions, rose for highlights.
 *
 * The app is light-only, so `dark` mirrors `light`; useColors() always
 * returns this palette regardless of the device appearance.
 */

const rosewood = {
  text: '#2A1235',
  tint: '#F0567A',

  background: '#FFF6F8',
  foreground: '#2A1235',

  card: '#FFFFFF',
  cardForeground: '#2A1235',

  // Plum for text, icons and outlines that need emphasis.
  primary: '#4A1D6B',
  // Plum for filled surfaces that carry white text (buttons, hero cards).
  primaryFill: '#4A1D6B',
  primaryForeground: '#FFFFFF',
  violetSoft: '#F1E6FA',

  secondary: '#F7EAF0',
  secondaryForeground: '#4A1D6B',

  muted: '#FBEEF2',
  mutedForeground: '#86708B',
  subtle: '#A893AB',

  // Rose highlight.
  accent: '#F0567A',
  accentForeground: '#FFFFFF',
  accentSoft: '#FFE3EA',
  accentInk: '#D63D63',

  destructive: '#D6374F',
  destructiveForeground: '#FFFFFF',
  destructiveBorder: '#F5C2CB',

  border: '#F3E0E7',
  borderStrong: '#E6C6D2',
  input: '#F3E0E7',

  tabBar: '#FFFFFF',
  tabBarBorder: '#F3E0E7',

  // Dark plum stage behind the camera guides and scan overlays.
  stage: '#2A1235',
  stageLine: 'rgba(255,179,198,0.55)',
  stageChip: 'rgba(74,29,107,0.72)',

  // Per-reading-type icon tiles: [background, icon].
  tintFace: '#FFE3EA',
  tintFaceInk: '#D63D63',
  tintVoice: '#F1E6FA',
  tintVoiceInk: '#6B2E96',
  tintPalm: '#FFF0DC',
  tintPalmInk: '#C2610C',
  tintAstro: '#E2F3F7',
  tintAstroInk: '#1B7A8F',

  success: '#1E9E6A',
  successSoft: '#DDF4EA',
};

const colors = {
  light: rosewood,
  dark: rosewood,
  radius: 16,
  radiusLg: 24,
};

export default colors;
