import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import {
  useCreateAstroReading,
  getListReadingsQueryKey,
  getGetReadingStatsQueryKey,
  type Reading,
} from '@workspace/api-client-react';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ReadingResult, ResultActions } from '@/components/ReadingResult';
import { Card, ErrorBox, MysticLoading, PrimaryButton, Segmented, SectionLabel } from '@/components/ui';
import { ReadingCreateError } from '@/components/ReadingCreateError';
import { useColors } from '@/hooks/useColors';
import fonts from '@/constants/fonts';

export default function AstroReadingScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [reading, setReading] = useState<Reading | null>(null);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
  const [place, setPlace] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const create = useCreateAstroReading();

  const inputStyle = [styles.input, { backgroundColor: c.background, borderColor: c.border, color: c.foreground }];

  const submit = () => {
    setFormError(null);
    const y = Number(year);
    const mo = Number(month);
    const d = Number(day);
    if (!y || !mo || !d || year.length !== 4 || mo < 1 || mo > 12 || d < 1 || d > 31) {
      setFormError(t('mobile.astro.invalidDate'));
      return;
    }
    if (!place.trim()) {
      setFormError(t('mobile.astro.missingPlace'));
      return;
    }
    const birthDate = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    let birthTime: string | undefined;
    if (hour !== '') {
      const h12 = Number(hour);
      const min = minute === '' ? 0 : Number(minute);
      if (h12 < 1 || h12 > 12 || min < 0 || min > 59) {
        setFormError(t('mobile.astro.invalidTime'));
        return;
      }
      let h24 = h12 % 12;
      if (ampm === 'PM') h24 += 12;
      birthTime = `${String(h24).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }
    create.mutate(
      { data: { birthDate, birthPlace: place.trim(), ...(birthTime ? { birthTime } : {}) } },
      {
        onSuccess: (r) => {
          setReading(r);
          queryClient.invalidateQueries({ queryKey: getListReadingsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetReadingStatsQueryKey() });
        },
      },
    );
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 16 }}
      bottomOffset={40}
      keyboardShouldPersistTaps="handled"
    >
      {reading ? (
        <>
          <ReadingResult reading={reading} />
          <ResultActions reading={reading} newLabel={t('mobile.astro.newReading')} onNew={() => setReading(null)} />
        </>
      ) : create.isPending ? (
        <MysticLoading label={t('mobile.astro.loading')} />
      ) : (
        <>
          <View style={{ alignItems: 'center', gap: 10, paddingVertical: 8 }}>
            <View style={[styles.moon, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={[styles.moonRing, { borderColor: c.borderStrong }]} />
              <Feather name="moon" size={34} color={c.accent} />
            </View>
            <Text style={{ fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: c.mutedForeground, textAlign: 'center' }}>
              {t('home.modeAstroDesc')}
            </Text>
          </View>

          <Card>
            <SectionLabel>{t('mobile.astro.birthDate')}</SectionLabel>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput
                testID="astro-month"
                style={[...inputStyle, { flex: 1 }]}
                placeholder="MM"
                placeholderTextColor={c.subtle}
                keyboardType="number-pad"
                maxLength={2}
                value={month}
                onChangeText={setMonth}
                accessibilityLabel="Month"
              />
              <TextInput
                testID="astro-day"
                style={[...inputStyle, { flex: 1 }]}
                placeholder="DD"
                placeholderTextColor={c.subtle}
                keyboardType="number-pad"
                maxLength={2}
                value={day}
                onChangeText={setDay}
                accessibilityLabel="Day"
              />
              <TextInput
                testID="astro-year"
                style={[...inputStyle, { flex: 1.4 }]}
                placeholder="YYYY"
                placeholderTextColor={c.subtle}
                keyboardType="number-pad"
                maxLength={4}
                value={year}
                onChangeText={setYear}
                accessibilityLabel="Year"
              />
            </View>
          </Card>

          <Card>
            <SectionLabel>{t('mobile.astro.birthTime')}</SectionLabel>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <TextInput
                testID="astro-hour"
                style={[...inputStyle, { flex: 1 }]}
                placeholder="HH"
                placeholderTextColor={c.subtle}
                keyboardType="number-pad"
                maxLength={2}
                value={hour}
                onChangeText={setHour}
                accessibilityLabel="Hour"
              />
              <Text style={{ color: c.mutedForeground, fontSize: 18, fontFamily: fonts.semibold }}>:</Text>
              <TextInput
                testID="astro-minute"
                style={[...inputStyle, { flex: 1 }]}
                placeholder="MM"
                placeholderTextColor={c.subtle}
                keyboardType="number-pad"
                maxLength={2}
                value={minute}
                onChangeText={setMinute}
                accessibilityLabel="Minute"
              />
              <Segmented
                value={ampm}
                onChange={setAmpm}
                options={[
                  { value: 'AM', label: 'AM' },
                  { value: 'PM', label: 'PM' },
                ]}
              />
            </View>
          </Card>

          <Card>
            <SectionLabel>{t('mobile.astro.birthPlace')}</SectionLabel>
            <View style={[styles.placeRow, { backgroundColor: c.background, borderColor: c.border }]}>
              <Feather name="map-pin" size={18} color={c.mutedForeground} />
              <TextInput
                testID="astro-place"
                style={{ flex: 1, minWidth: 0, color: c.foreground, fontFamily: fonts.regular, fontSize: 16 }}
                placeholder={t('mobile.astro.placePlaceholder')}
                placeholderTextColor={c.subtle}
                value={place}
                onChangeText={setPlace}
                accessibilityLabel={t('mobile.astro.birthPlace')}
              />
            </View>
          </Card>

          {formError ? <ErrorBox message={formError} /> : null}
          {create.isError ? (
            <ReadingCreateError error={create.error} fallbackMessage={t('mobile.astro.error')} />
          ) : null}
          <PrimaryButton testID="astro-submit" title={t('mobile.astro.submit')} icon="star" onPress={submit} />
        </>
      )}
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  input: {
    minWidth: 0,
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  moon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moonRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});
