import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, MoonStar } from 'lucide-react-native';
import {
  useCreateAstroReading,
  getListReadingsQueryKey,
  getGetReadingStatsQueryKey,
  type Reading,
} from '@workspace/api-client-react';
import { ReadingResult, ResultActions } from '@/components/ReadingResult';
import { Card, MysticLoading, PrimaryButton } from '@/components/ui';
import { ReadingCreateError } from '@/components/ReadingCreateError';
import { formatBirthDate, formatBirthTime, isProfileComplete, localToday, useMyProfile } from '@/lib/profile';
import { useColors } from '@/hooks/useColors';
import fonts from '@/constants/fonts';
import { getReadingLanguage } from '@/lib/readingLanguage';

/**
 * The user's own daily reading, made from their saved details: lucky colour,
 * gemstone, outfit, number and day, how the day will go, health and temper.
 * One per day; reopening it the same day doesn't use another credit.
 */
export default function AstroReadingScreen() {
  const c = useColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [reading, setReading] = useState<Reading | null>(null);
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const create = useCreateAstroReading();

  const submit = () => {
    create.mutate(
      { data: { today: localToday(), language: getReadingLanguage() } },
      {
        onSuccess: (r) => {
          setReading(r);
          queryClient.invalidateQueries({ queryKey: getListReadingsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetReadingStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: ['billing', 'status'] });
        },
      },
    );
  };

  const hero = (
    <View style={{ alignItems: 'center', gap: 10, paddingVertical: 8 }}>
      <View style={[styles.moon, { backgroundColor: c.tintAstro }]}>
        <MoonStar size={38} color={c.tintAstroInk} />
      </View>
      <Text style={{ fontFamily: fonts.display, fontSize: 26, letterSpacing: -0.5, color: c.foreground, textAlign: 'center' }}>
        {t('mobile.astro.dailyTitle')}
      </Text>
      <Text style={{ fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 21, color: c.mutedForeground, textAlign: 'center' }}>
        {t('mobile.astro.dailySubtitle')}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 16 }}
    >
      {reading ? (
        <>
          <ReadingResult reading={reading} />
          <ResultActions reading={reading} newLabel={t('mobile.common.back')} onNew={() => router.back()} />
        </>
      ) : create.isPending ? (
        <MysticLoading label={t('mobile.astro.loading')} />
      ) : profileLoading ? (
        <View style={{ paddingVertical: 80, alignItems: 'center' }}>
          <ActivityIndicator color={c.accent} />
        </View>
      ) : !isProfileComplete(profile) ? (
        <>
          {hero}
          <Card style={{ gap: 12 }}>
            <Text style={{ fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: c.secondaryForeground }}>
              {t('mobile.astro.needDetailsDesc')}
            </Text>
            <PrimaryButton
              testID="astro-add-details"
              title={t('mobile.astro.addDetails')}
              onPress={() => router.push('/my-details' as never)}
            />
          </Card>
        </>
      ) : (
        <>
          {hero}
          <Card style={{ gap: 10 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: c.accentInk }}>
              {t('mobile.astro.basedOn')}
            </Text>
            <View style={styles.basedRow}>
              <Calendar size={17} color={c.mutedForeground} />
              <Text style={[styles.basedText, { color: c.foreground }]}>
                {formatBirthDate(profile?.birthDate ?? null, i18n.language)}
                {profile?.birthTime ? ` · ${formatBirthTime(profile.birthTime)}` : ''}
              </Text>
            </View>
            <View style={styles.basedRow}>
              <MapPin size={17} color={c.mutedForeground} />
              <Text style={[styles.basedText, { color: c.foreground }]} numberOfLines={1}>
                {profile?.birthPlace}
              </Text>
            </View>
            <Text
              onPress={() => router.push('/my-details' as never)}
              style={{ fontFamily: fonts.bold, fontSize: 13.5, color: c.accentInk }}
            >
              {t('mobile.profile.edit')}
            </Text>
          </Card>
          {create.isError ? (
            <ReadingCreateError error={create.error} fallbackMessage={t('mobile.astro.error')} />
          ) : null}
          <PrimaryButton testID="astro-submit" title={t('mobile.astro.getToday')} icon="star" onPress={submit} />
          <Text style={{ fontFamily: fonts.regular, fontSize: 12.5, color: c.subtle, textAlign: 'center' }}>
            {t('mobile.astro.usesOne')}
          </Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  moon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  basedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  basedText: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
});
