import React, { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AuthHeader,
  AuthInput,
  FieldError,
  GoogleButton,
  OrDivider,
} from '@/components/auth/AuthUI';
import { RecaptchaModal, type RecaptchaModalHandle } from '@/components/RecaptchaModal';
import { PrimaryButton } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { confirmPhoneOtp, firebaseConfig, signUpWithEmail } from '@/lib/firebase';

function friendlyError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  const match = /\(auth\/([a-z-]+)\)/.exec(message);
  const code = match?.[1];
  const known: Record<string, string> = {
    'email-already-in-use': 'An account with this email already exists.',
    'weak-password': 'Password should be at least 6 characters.',
    'invalid-email': 'Please enter a valid email address.',
    'invalid-phone-number': 'Please enter a valid phone number, including country code.',
    'invalid-verification-code': 'That code is incorrect. Please try again.',
    'too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  };
  return (code && known[code]) || message.replace(/^Firebase:\s*/, '').replace(/\s*\(auth\/[a-z-]+\)\.?$/, '');
}

export default function SignUpScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const recaptchaRef = useRef<RecaptchaModalHandle>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usePhone, setUsePhone] = useState(false);

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [phone, setPhone] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [code, setCode] = useState('');

  const handleSubmit = async () => {
    setError(null);
    setBusy(true);
    try {
      await signUpWithEmail(emailAddress.trim(), password);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSendOtp = async () => {
    setError(null);
    setBusy(true);
    try {
      const id = await recaptchaRef.current!.sendOtp(phone.trim());
      setVerificationId(id);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!verificationId) return;
    setError(null);
    setBusy(true);
    try {
      await confirmPhoneOtp(verificationId, code.trim());
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        padding: 24,
        paddingTop: insets.top + 60,
        paddingBottom: 60,
        gap: 14,
      }}
    >
      <AuthHeader
        title={t('mobile.auth.signUpTitle')}
        subtitle={t('mobile.auth.signUpSubtitle')}
      />
      <GoogleButton onError={setError} />
      <OrDivider />

      {!usePhone ? (
        <>
          <AuthInput
            label={t('mobile.auth.emailLabel')}
            autoCapitalize="none"
            value={emailAddress}
            placeholder={t('mobile.auth.emailPlaceholder')}
            onChangeText={setEmailAddress}
            keyboardType="email-address"
          />
          <AuthInput
            label={t('mobile.auth.passwordLabel')}
            value={password}
            placeholder={t('mobile.auth.passwordPlaceholder')}
            secureTextEntry
            onChangeText={setPassword}
          />
          <FieldError message={error ?? undefined} />
          <PrimaryButton
            testID="sign-up-submit"
            title={t('mobile.auth.signUp')}
            onPress={handleSubmit}
            disabled={!emailAddress || !password}
            loading={busy}
          />
          <Text
            onPress={() => {
              setError(null);
              setUsePhone(true);
            }}
            style={{ color: c.primary, fontFamily: 'Inter_500Medium', textAlign: 'center', padding: 8 }}
          >
            Use phone number instead
          </Text>
        </>
      ) : (
        <>
          {!verificationId ? (
            <>
              <AuthInput
                label="Phone number"
                value={phone}
                placeholder="+1 555 555 5555"
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <FieldError message={error ?? undefined} />
              <PrimaryButton title="Send code" onPress={handleSendOtp} disabled={!phone} loading={busy} />
            </>
          ) : (
            <>
              <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 }}>
                {t('mobile.auth.codeSentTo', { phone: phone.trim() })}
              </Text>
              <AuthInput
                label={t('mobile.auth.verificationCode')}
                value={code}
                placeholder={t('mobile.auth.verificationCodePlaceholder')}
                onChangeText={setCode}
                keyboardType="numeric"
              />
              <FieldError message={error ?? undefined} />
              <PrimaryButton title={t('mobile.auth.verify')} onPress={handleVerifyOtp} disabled={!code} loading={busy} />
              <Text
                onPress={() => {
                  setError(null);
                  setVerificationId(null);
                  setCode('');
                }}
                style={{ color: c.primary, fontFamily: 'Inter_500Medium', textAlign: 'center', padding: 8 }}
              >
                {t('mobile.auth.needNewCode')}
              </Text>
            </>
          )}
          {!verificationId ? (
            <Text
              onPress={() => {
                setError(null);
                setUsePhone(false);
                setVerificationId(null);
              }}
              style={{ color: c.primary, fontFamily: 'Inter_500Medium', textAlign: 'center', padding: 8 }}
            >
              Use email instead
            </Text>
          ) : null}
        </>
      )}

      <RecaptchaModal
        ref={recaptchaRef}
        apiKey={firebaseConfig.apiKey ?? ''}
        authDomain={firebaseConfig.authDomain ?? ''}
        projectId={firebaseConfig.projectId ?? ''}
        appId={firebaseConfig.appId ?? ''}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
        <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular' }}>
          {t('mobile.auth.haveAccount')}
        </Text>
        <Link href="/(auth)/sign-in">
          <Text style={{ color: c.primary, fontFamily: 'Inter_600SemiBold' }}>{t('mobile.auth.signIn')}</Text>
        </Link>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}
