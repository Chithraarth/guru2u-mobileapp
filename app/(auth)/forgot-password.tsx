import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { AuthBackButton, AuthInput, FieldError, friendlyAuthError } from '@/components/auth/AuthUI';
import { Card, PrimaryButton } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { sendPasswordReset } from '@/lib/firebase';
import fonts from '@/constants/fonts';

export default function ForgotPasswordScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32, gap: 22 }}
    >
      <AuthBackButton onPress={() => router.back()} />
      <View style={{ gap: 6 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 30, lineHeight: 36, color: c.foreground }}>
          {t('mobile.auth.resetTitle')}
        </Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: c.mutedForeground }}>
          {t('mobile.auth.resetSubtitle')}
        </Text>
      </View>
      {sent ? (
        <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <Feather name="mail" size={20} color={c.accent} style={{ marginTop: 2 }} />
          <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: c.foreground }}>
            {t('mobile.auth.resetSent', { email: email.trim() })}
          </Text>
        </Card>
      ) : (
        <>
          <AuthInput
            label={t('mobile.auth.emailLabel')}
            autoCapitalize="none"
            value={email}
            placeholder={t('mobile.auth.emailPlaceholder')}
            onChangeText={setEmail}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
          />
          <FieldError message={error ?? undefined} />
          <PrimaryButton title={t('mobile.auth.sendResetLink')} onPress={submit} disabled={!email.trim()} loading={busy} />
        </>
      )}
      {sent ? <PrimaryButton title={t('mobile.auth.backToSignIn')} variant="outline" onPress={() => router.back()} /> : null}
    </KeyboardAwareScrollViewCompat>
  );
}
