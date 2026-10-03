import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/hooks/useColors';
import { OrbitRings, StarMark } from '@/components/nebula';
import { PrimaryButton } from '@/components/ui';
import fonts from '@/constants/fonts';

export default function NotFoundScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: t('mobile.notFound.screenTitle') }} />
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <View style={{ width: 220, height: 220, alignItems: 'center', justifyContent: 'center' }}>
          <OrbitRings size={220} />
          <StarMark size={88} halo />
        </View>
        <Text style={[styles.title, { color: c.foreground }]}>{t('mobile.notFound.title')}</Text>
        <PrimaryButton title={t('mobile.notFound.goHome')} onPress={() => router.replace('/')} style={{ alignSelf: 'stretch' }} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    textAlign: 'center',
  },
});
