import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RecaptchaModal, type RecaptchaModalHandle } from '@/components/RecaptchaModal';
import { PrimaryButton } from '@/components/ui';
import { AuthBackButton, AuthInput, FieldError, OtpInput, friendlyAuthError } from '@/components/auth/AuthUI';
import { confirmPhoneOtp, firebaseConfig } from '@/lib/firebase';
import { useColors } from '@/hooks/useColors';
import fonts from '@/constants/fonts';

const RESEND_SECONDS = 30;
const CODE_LENGTH = 6;

/** Masks all but the last four digits of a phone number. */
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return phone;
  return `${phone.trim().startsWith('+') ? '+' : ''}•••• ${digits.slice(-4)}`;
}

/**
 * Phone sign-in: number entry, then a full "Enter the code" step.
 * Signing in through Firebase flips the auth state, which routes the user on.
 */
export function PhoneAuth({ onUseEmail }: { onUseEmail: () => void }) {
  const c = useColors();
  const { t } = useTranslation();
  const recaptchaRef = useRef<RecaptchaModalHandle>(null);
  const [phone, setPhone] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const sendCode = async () => {
    setError(null);
    setBusy(true);
    try {
      const id = await recaptchaRef.current!.sendOtp(phone.trim());
      setVerificationId(id);
      setCode('');
      setSecondsLeft(RESEND_SECONDS);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!verificationId) return;
    setError(null);
    setBusy(true);
    try {
      await confirmPhoneOtp(verificationId, code.trim());
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: 22 }}>
      <AuthBackButton
        onPress={() => {
          setError(null);
          if (verificationId) setVerificationId(null);
          else onUseEmail();
        }}
      />

      {!verificationId ? (
        <>
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 30, lineHeight: 36, color: c.foreground }}>
              {t('mobile.auth.phoneTitle')}
            </Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: c.mutedForeground }}>
              {t('mobile.auth.phoneSubtitle')}
            </Text>
          </View>
          <AuthInput
            label={t('mobile.auth.phoneLabel')}
            value={phone}
            placeholder="+1 555 555 5555"
            onChangeText={setPhone}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
          />
          <FieldError message={error ?? undefined} />
          <PrimaryButton title={t('mobile.auth.sendCode')} onPress={sendCode} disabled={!phone.trim()} loading={busy} />
        </>
      ) : (
        <>
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 32, color: c.foreground }}>
              {t('mobile.auth.otpTitle')}
            </Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: c.mutedForeground }}>
              {t('mobile.auth.otpSubtitle')}{' '}
              <Text style={{ color: c.foreground }}>{maskPhone(phone)}</Text>
            </Text>
          </View>
          <OtpInput value={code} onChange={setCode} length={CODE_LENGTH} />
          {secondsLeft > 0 ? (
            <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: c.mutedForeground }}>
              {t('mobile.auth.resendIn')}{' '}
              <Text style={{ fontFamily: fonts.semibold, color: c.foreground }}>
                0:{String(secondsLeft).padStart(2, '0')}
              </Text>
            </Text>
          ) : (
            <Pressable onPress={sendCode} disabled={busy} accessibilityRole="button" style={{ alignSelf: 'flex-start', paddingVertical: 4 }}>
              <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: c.accent }}>{t('mobile.auth.resendCode')}</Text>
            </Pressable>
          )}
          <FieldError message={error ?? undefined} />
          <PrimaryButton
            title={t('mobile.auth.verifyContinue')}
            onPress={verify}
            disabled={code.length < CODE_LENGTH}
            loading={busy}
          />
        </>
      )}

      {verificationId ? (
        <Pressable
          onPress={() => {
            setError(null);
            setVerificationId(null);
            setCode('');
          }}
          accessibilityRole="button"
          style={{ alignItems: 'center', padding: 8 }}
        >
          <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: c.accent }}>{t('mobile.auth.needNewCode')}</Text>
        </Pressable>
      ) : (
        <Pressable onPress={onUseEmail} accessibilityRole="button" style={{ alignItems: 'center', padding: 8 }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: c.accent }}>{t('mobile.auth.useEmail')}</Text>
        </Pressable>
      )}

      <RecaptchaModal
        ref={recaptchaRef}
        apiKey={firebaseConfig.apiKey ?? ''}
        authDomain={firebaseConfig.authDomain ?? ''}
        projectId={firebaseConfig.projectId ?? ''}
        appId={firebaseConfig.appId ?? ''}
      />
    </View>
  );
}
