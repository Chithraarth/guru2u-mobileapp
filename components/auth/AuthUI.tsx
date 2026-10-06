import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';
import { StarMark } from '@/components/nebula';
import { useColors } from '@/hooks/useColors';
import fonts from '@/constants/fonts';

const KNOWN_AUTH_ERRORS: Record<string, string> = {
  'invalid-credential': 'Incorrect email or password.',
  'invalid-email': 'Please enter a valid email address.',
  'user-not-found': 'No account found with that email.',
  'email-already-in-use': 'An account with this email already exists.',
  'weak-password': 'Password should be at least 6 characters.',
  'invalid-phone-number': 'Please enter a valid phone number, including country code.',
  'invalid-verification-code': 'That code is incorrect. Please try again.',
  'too-many-requests': 'Too many attempts. Please wait a moment and try again.',
};

/** Turns a Firebase auth error into a short, human message. */
export function friendlyAuthError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  const code = /\(auth\/([a-z-]+)\)/.exec(message)?.[1];
  return (
    (code && KNOWN_AUTH_ERRORS[code]) ||
    message.replace(/^Firebase:\s*/, '').replace(/\s*\(auth\/[a-z-]+\)\.?$/, '')
  );
}

export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const c = useColors();
  return (
    <View style={{ gap: 18, marginBottom: 6 }}>
      <StarMark size={44} />
      <View style={{ gap: 6 }}>
        <Text style={{ color: c.foreground, fontFamily: fonts.display, fontSize: 32, lineHeight: 38 }}>{title}</Text>
        <Text style={{ color: c.mutedForeground, fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 }}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

export function AuthInput(props: React.ComponentProps<typeof TextInput> & { label: string; hideLabel?: boolean }) {
  const c = useColors();
  const { label, hideLabel, onFocus, onBlur, ...rest } = props;
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {hideLabel ? null : (
        <Text style={{ color: c.mutedForeground, fontFamily: fonts.medium, fontSize: 13 }}>{label}</Text>
      )}
      <TextInput
        placeholderTextColor={c.subtle}
        accessibilityLabel={label}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={{
          minHeight: 52,
          borderWidth: 1,
          borderColor: focused ? c.primary : c.border,
          borderRadius: 14,
          paddingHorizontal: 16,
          color: c.foreground,
          fontFamily: fonts.regular,
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
    <Text style={{ color: c.destructive, fontFamily: fonts.regular, fontSize: 13 }}>{message}</Text>
  );
}

/** Secondary pill button used for alternative sign-in methods. */
export function AltAuthButton({
  label,
  onPress,
  leading,
  testID,
  busy,
}: {
  label: string;
  onPress: () => void;
  leading: React.ReactNode;
  testID?: string;
  busy?: boolean;
}) {
  const c = useColors();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityState={{ busy: !!busy }}
      style={({ pressed }) => [
        styles.altButton,
        { borderColor: c.border, backgroundColor: c.card, opacity: busy ? 0.7 : pressed ? 0.85 : 1 },
      ]}
    >
      {busy ? <ActivityIndicator size="small" color={c.foreground} /> : leading}
      <Text style={{ color: c.foreground, fontFamily: fonts.medium, fontSize: 15 }}>{label}</Text>
    </Pressable>
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
      <AltAuthButton
        label={busy ? t('mobile.auth.signingIn') : t('mobile.auth.continueWithGoogle')}
        onPress={onPress}
        busy={busy}
        leading={
          <View style={[styles.gMark, { backgroundColor: c.foreground }]}>
            <Text style={{ color: c.background, fontFamily: fonts.bold, fontSize: 13 }}>G</Text>
          </View>
        }
      />
      {!onError && localError ? <FieldError message={localError} /> : null}
    </>
  );
}

export function OrDivider() {
  const c = useColors();
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 2 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
      <Text style={{ color: c.subtle, fontFamily: fonts.regular, fontSize: 13 }}>{t('mobile.auth.or')}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
    </View>
  );
}

/** Round back button for auth sub-screens. */
export function AuthBackButton({ onPress }: { onPress: () => void }) {
  const c = useColors();
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('mobile.common.back')}
      style={({ pressed }) => [
        styles.back,
        { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <Feather name="chevron-left" size={22} color={c.foreground} />
    </Pressable>
  );
}

/** Six-box one-time-code entry backed by a single hidden input. */
export function OtpInput({
  value,
  onChange,
  length = 6,
}: {
  value: string;
  onChange: (v: string) => void;
  length?: number;
}) {
  const c = useColors();
  const { t } = useTranslation();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(true);

  return (
    <Pressable onPress={() => inputRef.current?.focus()} accessibilityLabel={t('mobile.auth.verificationCode')}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {Array.from({ length }).map((_, i) => {
          const char = value[i] ?? '';
          const isCursor = focused && i === Math.min(value.length, length - 1) && value.length < length;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: 60,
                borderRadius: 14,
                backgroundColor: c.card,
                borderWidth: isCursor ? 2 : 1,
                borderColor: isCursor ? c.accent : char ? c.borderStrong : c.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: fonts.semibold, fontSize: 24, color: c.foreground }}>{char}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(v) => onChange(v.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        autoFocus
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        caretHidden
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  altButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 27,
    minHeight: 54,
  },
  gMark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
