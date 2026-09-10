import { useCallback } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { signInWithGoogleTokens } from '@/lib/firebase';

const realWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
export const isGoogleSignInConfigured = !!realWebClientId;

if (realWebClientId) {
  GoogleSignin.configure({ webClientId: realWebClientId });
}

// Normalizes @react-native-google-signin's native status codes (which don't
// share Firebase's "auth/..." namespace) into codes the app's error message
// mapping can recognize, so failures don't all collapse into a generic error.
function normalizeGoogleSignInError(err: unknown): Error {
  const code = (err as { code?: string })?.code;
  if (code === statusCodes.SIGN_IN_CANCELLED) {
    return Object.assign(new Error('Sign-in was cancelled.'), { code: 'auth/popup-closed-by-user' });
  }
  if (code === statusCodes.IN_PROGRESS) {
    return Object.assign(new Error('Sign-in already in progress.'), { code: 'auth/cancelled-popup-request' });
  }
  return err instanceof Error ? err : new Error('Google sign-in failed');
}

export function useGoogleSignIn(onError: (message: string) => void) {
  const promptAsync = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();
      const idToken = result.data?.idToken;
      if (!idToken) throw new Error('Google sign-in did not return an ID token');
      // Firebase's GoogleAuthProvider.credential requires a non-empty
      // accessToken alongside the idToken.
      const { accessToken } = await GoogleSignin.getTokens();
      await signInWithGoogleTokens(idToken, accessToken);
    } catch (err) {
      const normalized = normalizeGoogleSignInError(err);
      onError(normalized.message);
    }
  }, [onError]);

  return { canSignIn: isGoogleSignInConfigured, promptAsync };
}
