import React, { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { Marcellus_400Regular } from '@expo-google-fonts/marcellus';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/lib/authContext';
import { OnboardingProvider, useOnboarding } from '@/lib/onboarding';
import { getIdToken } from '@/lib/firebase';
import { setBaseUrl, setAuthTokenGetter } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useTranslation } from 'react-i18next';
import { i18nReady } from '@/lib/i18n';
import { NebulaSplash } from '@/components/nebula';
import fonts from '@/constants/fonts';

setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const c = useColors();
  const { t } = useTranslation();
  const { isSignedIn, isLoaded, user } = useAuth();
  const onboarding = useOnboarding();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    setAuthTokenGetter(() => getIdToken());
  }, []);

  // Clear cached data when the signed-in user changes.
  useEffect(() => {
    const id = user?.uid ?? null;
    if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== id) {
      queryClient.clear();
    }
    prevUserIdRef.current = id;
  }, [user?.uid]);

  if (!isLoaded || !onboarding.isLoaded) return <NebulaSplash />;

  return (
    <Stack
      screenOptions={{
        headerBackTitle: t('mobile.common.back'),
        headerStyle: { backgroundColor: c.background },
        headerTintColor: c.foreground,
        headerTitleStyle: { fontFamily: fonts.display, fontSize: 19 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: c.background },
      }}
    >
      <Stack.Protected guard={!isSignedIn && !onboarding.hasSeen}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn && onboarding.hasSeen}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!isSignedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="face" options={{ title: t('mobile.face.title') }} />
        <Stack.Screen name="palm" options={{ title: t('mobile.palm.title') }} />
        <Stack.Screen name="voice" options={{ title: t('mobile.voice.title') }} />
        <Stack.Screen name="astro" options={{ title: t('mobile.astro.title') }} />
        <Stack.Screen name="insight" options={{ title: t('mobile.insight.title') }} />
        <Stack.Screen name="reading/[id]" options={{ title: '' }} />
        <Stack.Screen
          name="paywall"
          options={{ title: t('mobile.paywall.screenTitle'), presentation: 'modal' }}
        />
        <Stack.Screen name="settings" options={{ title: t('mobile.settings.title') }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    Marcellus_400Regular,
  });
  const [langLoaded, setLangLoaded] = React.useState(false);

  useEffect(() => {
    i18nReady.finally(() => setLangLoaded(true));
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && langLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, langLoaded]);

  if ((!fontsLoaded && !fontError) || !langLoaded) return null;

  return (
    <AuthProvider>
      <OnboardingProvider>
        <SafeAreaProvider>
          <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
              <GestureHandlerRootView>
                <KeyboardProvider>
                  <StatusBar style="light" />
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </QueryClientProvider>
          </ErrorBoundary>
        </SafeAreaProvider>
      </OnboardingProvider>
    </AuthProvider>
  );
}
