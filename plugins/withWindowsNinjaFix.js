const { withAppBuildGradle } = require('@expo/config-plugins');

// AGP bundles ninja 1.10, which ignores Windows long-path support even with
// LongPathsEnabled=1, causing "Filename longer than 260 characters" during
// buildCMakeDebug for libraries with deep codegen paths (e.g.
// react-native-keyboard-controller, react-native-reanimated).
// Fix verified against: github.com/ninja-build/ninja#1900 (fixed in 1.12.0),
// github.com/kirillzyusko/react-native-keyboard-controller#1247,
// docs.swmansion.com/react-native-reanimated/docs/guides/building-on-windows
const NINJA_PATH = process.env.EXPO_WINDOWS_NINJA_PATH ?? 'C:/tools/ninja/ninja.exe';

function withWindowsNinjaFix(config) {
  if (process.platform !== 'win32') {
    return config;
  }

  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents.includes('CMAKE_MAKE_PROGRAM')) {
      return config;
    }

    // `arguments` for CMake command-line args lives under
    // android.defaultConfig.externalNativeBuild.cmake, not the top-level
    // android.externalNativeBuild.cmake block (that one only links Gradle to
    // the CMakeLists.txt / sets buildStagingDirectory).
    // https://developer.android.com/studio/projects/gradle-external-native-builds
    const defaultConfigMatch = config.modResults.contents.match(/defaultConfig\s*\{/);
    if (!defaultConfigMatch) {
      throw new Error('withWindowsNinjaFix: could not find `defaultConfig {` block in app/build.gradle');
    }

    const insertion = `defaultConfig {
        externalNativeBuild {
            cmake {
                arguments "-DCMAKE_MAKE_PROGRAM=${NINJA_PATH}", "-DCMAKE_OBJECT_PATH_MAX=1024"
            }
        }
`;

    config.modResults.contents = config.modResults.contents.replace(
      defaultConfigMatch[0],
      insertion
    );

    return config;
  });
}

module.exports = withWindowsNinjaFix;
