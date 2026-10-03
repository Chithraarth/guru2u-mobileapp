import colors from '@/constants/colors';

/**
 * Returns the Nebula design tokens plus scheme-independent values like `radius`.
 * The app is dark-only, so the palette does not follow the device appearance.
 */
export function useColors() {
  return { ...colors.dark, radius: colors.radius, radiusLg: colors.radiusLg };
}
