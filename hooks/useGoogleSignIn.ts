import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { signInWithGoogleIdToken } from '@/lib/firebase';

WebBrowser.maybeCompleteAuthSession();

const realWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const realIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const realAndroidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
export const isGoogleSignInConfigured = !!(realWebClientId || realIosClientId || realAndroidClientId);
const PLACEHOLDER = 'not-configured.apps.googleusercontent.com';

export function useGoogleSignIn(onError: (message: string) => void) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: realWebClientId ?? PLACEHOLDER,
    iosClientId: realIosClientId ?? PLACEHOLDER,
    androidClientId: realAndroidClientId ?? PLACEHOLDER,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      if (idToken) {
        signInWithGoogleIdToken(idToken).catch((err) =>
          onError(err instanceof Error ? err.message : 'Google sign-in failed')
        );
      }
    } else if (response?.type === 'error') {
      onError(response.error?.message ?? 'Google sign-in was cancelled');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return { canSignIn: isGoogleSignInConfigured && !!request, promptAsync };
}
