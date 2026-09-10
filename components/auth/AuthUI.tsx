import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';

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
  const c = useColors();
  const { t } = useTranslation();
  const [localError, setLocalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { canSignIn, promptAsync } = useGoogleSignIn(onError ?? setLocalError);

  const onPress = useCallback(async () => {
    if (!canSignIn) {
      (onError ?? setLocalError)("Google sign-in isn't configured yet.");
      return;
    }
    setBusy(true);
    try {
      await promptAsync();
    } finally {
      setBusy(false);
    }
  }, [canSignIn, promptAsync, onError]);

  return (
    <>
      <Pressable
        onPress={onPress}
        disabled={busy}
        style={({ pressed }) => [
          styles.googleButton,
          {
            borderColor: c.border,
            backgroundColor: c.card,
            opacity: busy ? 0.7 : pressed ? 0.85 : 1,
          },
        ]}
      >
        {busy ? (
          <ActivityIndicator size="small" color={c.foreground} />
        ) : (
          <Feather name="chrome" size={18} color={c.foreground} />
        )}
        <Text style={{ color: c.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>
          {busy ? t('mobile.auth.signingIn') : t('mobile.auth.continueWithGoogle')}
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
