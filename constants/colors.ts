/**
 * Nebula theme — immersive dark amethyst with gold accents.
 *
 * The app is dark-only, so `light` mirrors `dark`; useColors() always
 * returns this palette regardless of the device appearance.
 */

const nebula = {
  text: '#F2F0F5',
  tint: '#E8B130',

  background: '#0E0812',
  foreground: '#F2F0F5',

  card: '#1A1124',
  cardForeground: '#F2F0F5',

  // Violet for text, icons and outlines on the dark ground.
  primary: '#9C67E4',
  // Deeper violet for filled surfaces that carry white text.
  primaryFill: '#7440CC',
  primaryForeground: '#FFFFFF',
  violetSoft: '#C7A6F5',

  secondary: '#241B32',
  secondaryForeground: '#E6E2EC',

  muted: '#1D1528',
  mutedForeground: '#B0A3C2',
  subtle: '#8E80A6',

  accent: '#E8B130',
  accentForeground: '#0E0812',
  accentSoft: '#FFE7A8',

  destructive: '#F27A8A',
  destructiveForeground: '#0E0812',
  destructiveBorder: '#5A2330',

  border: '#30244A',
  borderStrong: '#4A3B66',
  input: '#30244A',

  tabBar: '#1E1530',
  tabBarBorder: '#3A2C55',
};

const colors = {
  light: nebula,
  dark: nebula,
  radius: 16,
  radiusLg: 22,
};

export default colors;
