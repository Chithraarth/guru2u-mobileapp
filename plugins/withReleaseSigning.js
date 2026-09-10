const path = require('path');
const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

// `expo prebuild --clean` wipes and regenerates android/ (including
// gradle.properties and the release signingConfig) on every run, so the
// real signing setup can't live as a one-time hand-edit — it has to be
// re-applied by a config plugin every time, same as withWindowsNinjaFix.
//
// The keystore itself lives outside android/ (at the project root) so it
// survives the wipe; only its path + passwords are injected here.
// Java .properties files treat backslash as an escape character, so a raw
// Windows path (C:\dev\...) written into gradle.properties gets silently
// mangled (\d, \g etc. consumed as invalid escapes). Forward slashes sidestep
// that entirely and Gradle's file()/JVM file APIs accept them fine on Windows.
const KEYSTORE_PATH = path.resolve(__dirname, '..', 'android-release.jks').replace(/\\/g, '/');
const KEY_ALIAS = 'upload';

function withReleaseSigning(config) {
  const storePassword = process.env.RELEASE_STORE_PASSWORD;
  const keyPassword = process.env.RELEASE_KEY_PASSWORD;
  if (!storePassword || !keyPassword) {
    throw new Error(
      'withReleaseSigning: RELEASE_STORE_PASSWORD and RELEASE_KEY_PASSWORD must be set in the environment before running expo prebuild.'
    );
  }

  config = withGradleProperties(config, (config) => {
    config.modResults = config.modResults.filter(
      (item) => !(item.type === 'property' && item.key.startsWith('RELEASE_'))
    );
    config.modResults.push(
      { type: 'property', key: 'RELEASE_STORE_FILE', value: KEYSTORE_PATH },
      { type: 'property', key: 'RELEASE_KEY_ALIAS', value: KEY_ALIAS },
      { type: 'property', key: 'RELEASE_STORE_PASSWORD', value: storePassword },
      { type: 'property', key: 'RELEASE_KEY_PASSWORD', value: keyPassword }
    );
    return config;
  });

  return withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('signingConfigs {')) {
      throw new Error('withReleaseSigning: could not find `signingConfigs {` block in app/build.gradle');
    }

    config.modResults.contents = config.modResults.contents.replace(
      /signingConfigs\s*\{/,
      `signingConfigs {
        release {
            storeFile file(RELEASE_STORE_FILE)
            storePassword RELEASE_STORE_PASSWORD
            keyAlias RELEASE_KEY_ALIAS
            keyPassword RELEASE_KEY_PASSWORD
        }`
    );

    config.modResults.contents = config.modResults.contents.replace(
      /(release\s*\{[^}]*?)signingConfig\s+signingConfigs\.debug/,
      '$1signingConfig signingConfigs.release'
    );

    return config;
  });
}

module.exports = withReleaseSigning;
