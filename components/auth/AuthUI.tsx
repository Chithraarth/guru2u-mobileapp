import React, { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';

// Preloads the browser for Android devices to reduce authentication load time
export function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession();

export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const c = useColors();
  return (
    <View style={{ alignItems: 'center', gap: 10, marginBottom: 28 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: c.primary + '22',
        }}
      >
        <MaterialCommunityIcons name="crystal-ball" size={34} color={c.primary} />
      </View>
      <Text
        style={{
          color: c.foreground,
          fontFamily: 'Inter_700Bold',
          fontSize: 26,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: c.mutedForeground,
          fontFamily: 'Inter_400Regular',
          fontSize: 14,
          textAlign: 'center',
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}

export function AuthInput(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const c = useColors();
  const { label, ...rest } = props;
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: c.foreground, fontFamily: 'Inter_500Medium', fontSize: 13 }}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={c.mutedForeground}
        style={{
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: colors.radius,
          paddingHorizontal: 14,
          paddingVertical: 12,
          color: c.foreground,
          fontFamily: 'Inter_400Regular',
          fontSize: 15,
          backgroundColor: c.card,
        }}
        {...rest}
      />
    </View>
  );
}

export function FieldError({ message }: { message?: string }) {
  const c = useColors();
  if (!message) return null;
  return (
    <Text style={{ color: c.destructive, fontFamily: 'Inter_400Regular', fontSize: 13 }}>
      {message}
    </Text>
  );
}

export function GoogleButton({ onError }: { onError?: (message: string) => void }) {
  useWarmUpBrowser();
  const c = useColors();
  const { t } = useTranslation();
  const [localError, setLocalError] = useState<string | null>(null);
  const { canSignIn, promptAsync } = useGoogleSignIn(onError ?? setLocalError);

  const onPress = useCallback(async () => {
    if (!canSignIn) {
      (onError ?? setLocalError)("Google sign-in isn't configured yet.");
      return;
    }
    await promptAsync();
  }, [canSignIn, promptAsync, onError]);

  return (
    <>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.googleButton,
          {
            borderColor: c.border,
            backgroundColor: c.card,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Feather name="chrome" size={18} color={c.foreground} />
        <Text style={{ color: c.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>
          {t('mobile.auth.continueWithGoogle')}
        </Text>
      </Pressable>
      {!onError && localError ? <FieldError message={localError} /> : null}
    </>
  );
}

export function OrDivider() {
  const c = useColors();
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
      <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12 }}>
        {t('mobile.auth.or')}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
    </View>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: colors.radius,
    paddingVertical: 13,
  },
});
