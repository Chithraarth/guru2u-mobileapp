import React, { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as Updates from 'expo-updates';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useAuth } from '@/lib/authContext';
import { signOutUser } from '@/lib/firebase';
import { getBillingStatus } from '@/lib/billing';
import { Card, PrimaryButton } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { useIsRtl } from '@/hooks/useIsRtl';
import { LANGUAGES, setAppLanguage } from '@/lib/i18n';
import colors from '@/constants/colors';

const PRIVACY_URL = 'https://guru2u.com/privacy';

function Row({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
}) {
  const c = useColors();
  const rtl = useIsRtl();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: rtl ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 4,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Feather name={icon} size={18} color={c.mutedForeground} />
      <Text
        style={{
          flex: 1,
          color: c.foreground,
          fontFamily: 'Inter_500Medium',
          fontSize: 15,
          textAlign: rtl ? 'right' : 'left',
        }}
      >
        {label}
      </Text>
      <Feather
        name={rtl ? 'chevron-left' : 'chevron-right'}
        size={18}
        color={c.mutedForeground}
      />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const c = useColors();
  const { t, i18n } = useTranslation();
  const rtl = useIsRtl();
  const router = useRouter();
  const { user } = useAuth();
  const [showLanguages, setShowLanguages] = useState(false);
  const currentLang = i18n.language?.split('-')[0] ?? 'en';

  const { data, isLoading } = useQuery({
    queryKey: ['billing', 'status'],
    queryFn: getBillingStatus,
  });

  const onSelectLanguage = async (code: string) => {
    const { directionChanged } = await setAppLanguage(code);
    if (!directionChanged) return;
    Alert.alert(t('mobile.settings.restartTitle'), t('mobile.settings.restartMessage'), [
      { text: t('mobile.settings.restartLater'), style: 'cancel' },
      {
        text: t('mobile.settings.restartNow'),
        onPress: () => {
          Updates.reloadAsync().catch(() => {});
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}
    >
      <Card style={{ alignItems: 'center', gap: 6, paddingVertical: 24 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: c.primary + '22',
          }}
        >
          <Feather name="user" size={28} color={c.primary} />
        </View>
        <Text style={{ color: c.foreground, fontFamily: 'Inter_700Bold', fontSize: 18 }}>
          {user?.email ?? user?.phoneNumber ?? ''}
        </Text>
      </Card>

      <Card style={{ gap: 8 }}>
        <Text
          style={{
            color: c.mutedForeground,
            fontFamily: 'Inter_600SemiBold',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {t('mobile.profile.currentBalance')}
        </Text>
        <Text style={{ color: c.foreground, fontFamily: 'Inter_700Bold', fontSize: 34 }}>
          {isLoading ? '—' : (data?.scansRemaining ?? 0)}{' '}
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 16, color: c.mutedForeground }}>
            {t('mobile.profile.readingsUnit')}
          </Text>
        </Text>
      </Card>

      <PrimaryButton
        title={t('mobile.profile.topUpNow')}
        onPress={() => router.push('/paywall')}
      />

      <Card style={{ gap: 0 }}>
        <Row icon="globe" label={LANGUAGES.find((l) => l.code === currentLang)?.nativeName ?? t('mobile.profile.language')} onPress={() => setShowLanguages((s) => !s)} />
        {showLanguages ? (
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: c.border,
              marginTop: 4,
              paddingTop: 4,
            }}
          >
            {LANGUAGES.map((lang) => {
              const selected = lang.code === currentLang;
              return (
                <Pressable
                  key={lang.code}
                  onPress={() => onSelectLanguage(lang.code)}
                  style={({ pressed }) => ({
                    flexDirection: rtl ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    paddingHorizontal: 4,
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <Text
                    style={{
                      color: selected ? c.primary : c.foreground,
                      fontFamily: selected ? 'Inter_600SemiBold' : 'Inter_400Regular',
                      fontSize: 14,
                    }}
                  >
                    {lang.nativeName}
                  </Text>
                  {selected ? <Feather name="check" size={16} color={c.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}
        <View style={{ borderTopWidth: 1, borderTopColor: c.border, marginTop: 4 }} />
        <Row
          icon="shield"
          label={t('mobile.profile.privacy')}
          onPress={() => Linking.openURL(PRIVACY_URL)}
        />
      </Card>

      <Pressable
        onPress={() => signOutUser()}
        style={({ pressed }) => ({
          flexDirection: rtl ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: 14,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Feather name="log-out" size={16} color={c.destructive} />
        <Text style={{ color: c.destructive, fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>
          {t('mobile.profile.logOut')}
        </Text>
      </Pressable>

      <Text
        style={{
          color: c.mutedForeground,
          fontFamily: 'Inter_400Regular',
          fontSize: 12,
          textAlign: 'center',
        }}
      >
        {t('mobile.profile.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
      </Text>
    </ScrollView>
  );
}
