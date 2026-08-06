import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateAstroReading,
  getListReadingsQueryKey,
  getGetReadingStatsQueryKey,
  type Reading,
} from '@workspace/api-client-react';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ReadingResult } from '@/components/ReadingResult';
import { Chip, ErrorBox, MysticLoading, PrimaryButton, SectionLabel } from '@/components/ui';
import { ReadingCreateError } from '@/components/ReadingCreateError';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';

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

  const inputStyle = [
    styles.input,
    { backgroundColor: c.card, borderColor: c.border, color: c.foreground },
  ];

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
      contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 18 }}
      bottomOffset={40}
      keyboardShouldPersistTaps="handled"
    >
      {reading ? (
        <>
          <ReadingResult reading={reading} />
          <PrimaryButton title={t('mobile.astro.newReading')} onPress={() => setReading(null)} />
        </>
      ) : create.isPending ? (
        <MysticLoading label={t('mobile.astro.loading')} />
      ) : (
        <>
          <View>
            <SectionLabel>{t('mobile.astro.birthDate')}</SectionLabel>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput
                testID="astro-month"
                style={[...inputStyle, { flex: 1 }]}
                placeholder="MM"
                placeholderTextColor={c.mutedForeground}
                keyboardType="number-pad"
                maxLength={2}
                value={month}
                onChangeText={setMonth}
              />
              <TextInput
                testID="astro-day"
                style={[...inputStyle, { flex: 1 }]}
                placeholder="DD"
                placeholderTextColor={c.mutedForeground}
                keyboardType="number-pad"
                maxLength={2}
                value={day}
                onChangeText={setDay}
              />
              <TextInput
                testID="astro-year"
                style={[...inputStyle, { flex: 1.4 }]}
                placeholder="YYYY"
                placeholderTextColor={c.mutedForeground}
                keyboardType="number-pad"
                maxLength={4}
                value={year}
                onChangeText={setYear}
              />
            </View>
          </View>

          <View>
            <SectionLabel>{t('mobile.astro.birthTime')}</SectionLabel>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <TextInput
                testID="astro-hour"
                style={[...inputStyle, { flex: 1 }]}
                placeholder="HH"
                placeholderTextColor={c.mutedForeground}
                keyboardType="number-pad"
                maxLength={2}
                value={hour}
                onChangeText={setHour}
              />
              <Text style={{ color: c.mutedForeground, fontSize: 18 }}>:</Text>
              <TextInput
                testID="astro-minute"
                style={[...inputStyle, { flex: 1 }]}
                placeholder="MM"
                placeholderTextColor={c.mutedForeground}
                keyboardType="number-pad"
                maxLength={2}
                value={minute}
                onChangeText={setMinute}
              />
              <Chip label="AM" selected={ampm === 'AM'} onPress={() => setAmpm('AM')} />
              <Chip label="PM" selected={ampm === 'PM'} onPress={() => setAmpm('PM')} />
            </View>
          </View>

          <View>
            <SectionLabel>{t('mobile.astro.birthPlace')}</SectionLabel>
            <TextInput
              testID="astro-place"
              style={inputStyle}
              placeholder={t('mobile.astro.placePlaceholder')}
              placeholderTextColor={c.mutedForeground}
              value={place}
              onChangeText={setPlace}
            />
          </View>

          {formError ? <ErrorBox message={formError} /> : null}
          {create.isError ? (
            <ReadingCreateError error={create.error} fallbackMessage={t('mobile.astro.error')} />
          ) : null}
          <PrimaryButton testID="astro-submit" title={t('mobile.astro.submit')} onPress={submit} />
        </>
      )}
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: colors.radius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
});
