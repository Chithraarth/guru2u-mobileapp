import React, { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import IntroScreen from '@/components/IntroScreen';
import { AuthProvider, useAuth } from '@/lib/authContext';
import { getIdToken } from '@/lib/firebase';
import { setBaseUrl, setAuthTokenGetter } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useTranslation } from 'react-i18next';
import { i18nReady } from '@/lib/i18n';

setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const c = useColors();
  const { t } = useTranslation();
  const { isSignedIn, isLoaded, user } = useAuth();
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

  if (!isLoaded) return null;

  return (
    <Stack
      screenOptions={{
        headerBackTitle: t('mobile.common.back'),
        headerStyle: { backgroundColor: c.background },
        headerTintColor: c.foreground,
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: c.background },
      }}
    >
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!isSignedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="face" options={{ title: '' }} />
        <Stack.Screen name="palm" options={{ title: '' }} />
        <Stack.Screen name="voice" options={{ title: '' }} />
        <Stack.Screen name="astro" options={{ title: '' }} />
        <Stack.Screen name="insight" options={{ title: '' }} />
        <Stack.Screen name="reading/[id]" options={{ title: '' }} />
        <Stack.Screen name="paywall" options={{ title: t('mobile.paywall.screenTitle') }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [langLoaded, setLangLoaded] = React.useState(false);
  const [showIntro, setShowIntro] = React.useState(true);

  useEffect(() => {
    i18nReady.finally(() => setLangLoaded(true));
  }, []);

  const ready = (fontsLoaded || fontError) && langLoaded;

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync();
    const timer = setTimeout(() => setShowIntro(false), 1800);
    return () => clearTimeout(timer);
  }, [ready]);

  if (!ready) return null;
  if (showIntro) return <IntroScreen />;

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
