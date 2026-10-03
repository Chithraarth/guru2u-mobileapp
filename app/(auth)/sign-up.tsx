import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import {
  AltAuthButton,
  AuthHeader,
  AuthInput,
  FieldError,
  GoogleButton,
  OrDivider,
  friendlyAuthError,
} from '@/components/auth/AuthUI';
import { PhoneAuth } from '@/components/auth/PhoneAuth';
import { PrimaryButton } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { signUpWithEmail } from '@/lib/firebase';
import fonts from '@/constants/fonts';

export default function SignUpScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usePhone, setUsePhone] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    setError(null);
    setBusy(true);
    try {
      await signUpWithEmail(emailAddress.trim(), password);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: insets.top + (usePhone ? 12 : 40),
        paddingBottom: insets.bottom + 32,
        gap: 18,
      }}
    >
      {usePhone ? (
        <PhoneAuth onUseEmail={() => setUsePhone(false)} />
      ) : (
        <>
          <AuthHeader title={t('mobile.auth.signUpTitle')} subtitle={t('mobile.auth.signUpSubtitle')} />
          <AuthInput
            label={t('mobile.auth.emailLabel')}
            autoCapitalize="none"
            value={emailAddress}
            placeholder={t('mobile.auth.emailPlaceholder')}
            onChangeText={setEmailAddress}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
          />
          <AuthInput
            label={t('mobile.auth.passwordLabel')}
            value={password}
            placeholder={t('mobile.auth.passwordPlaceholder')}
            secureTextEntry
            textContentType="newPassword"
            autoComplete="new-password"
            onChangeText={setPassword}
          />
          <FieldError message={error ?? undefined} />
          <PrimaryButton
            testID="sign-up-submit"
            title={t('mobile.auth.createAccount')}
            onPress={handleSubmit}
            disabled={!emailAddress || !password}
            loading={busy}
          />
          <OrDivider />
          <View style={{ gap: 10 }}>
            <GoogleButton onError={setError} />
            <AltAuthButton
              label={t('mobile.auth.continueWithPhone')}
              onPress={() => {
                setError(null);
                setUsePhone(true);
              }}
              leading={<Feather name="smartphone" size={20} color={c.foreground} />}
            />
          </View>
          <View style={{ flexGrow: 1 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={{ color: c.mutedForeground, fontFamily: fonts.regular, fontSize: 14 }}>
              {t('mobile.auth.haveAccount')}
            </Text>
            <Link href="/(auth)/sign-in">
              <Text style={{ color: c.accent, fontFamily: fonts.semibold, fontSize: 14 }}>{t('mobile.auth.signIn')}</Text>
            </Link>
          </View>
        </>
      )}
    </KeyboardAwareScrollViewCompat>
  );
}
