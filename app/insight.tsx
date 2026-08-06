import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateComboReading,
  getListReadingsQueryKey,
  getGetReadingStatsQueryKey,
  type Reading,
  type ComboReadingInputContext,
} from '@workspace/api-client-react';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { PhotoPicker, type PickedImage } from '@/components/PhotoPicker';
import { Recorder } from '@/components/Recorder';
import { ReadingResult } from '@/components/ReadingResult';
import { Card, Chip, ErrorBox, MysticLoading, PrimaryButton, SectionLabel } from '@/components/ui';
import { ReadingCreateError } from '@/components/ReadingCreateError';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';

const CONTEXTS: { value: ComboReadingInputContext; labelKey: string }[] = [
  { value: 'interview', labelKey: 'mobile.insight.ctxInterview' },
  { value: 'business', labelKey: 'mobile.insight.ctxBusiness' },
  { value: 'relationship', labelKey: 'mobile.insight.ctxRelationship' },
  { value: 'general', labelKey: 'mobile.insight.ctxGeneral' },
];

export default function InsightReadingScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [reading, setReading] = useState<Reading | null>(null);
  const [context, setContext] = useState<ComboReadingInputContext>('interview');
  const [image, setImage] = useState<PickedImage | null>(null);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [place, setPlace] = useState('');
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const create = useCreateComboReading();

  const inputStyle = [
    styles.input,
    { backgroundColor: c.background, borderColor: c.border, color: c.foreground },
  ];

  const reset = () => {
    setReading(null);
    setImage(null);
    setAudioBase64(null);
    setYear('');
    setMonth('');
    setDay('');
    setPlace('');
  };

  const submit = () => {
    setFormError(null);
    let birthDate: string | undefined;
    if (year || month || day) {
      const y = Number(year);
      const mo = Number(month);
      const d = Number(day);
      if (!y || !mo || !d || year.length !== 4 || mo < 1 || mo > 12 || d < 1 || d > 31) {
        setFormError(t('mobile.insight.incompleteDate'));
        return;
      }
      birthDate = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    if (!image && !birthDate && !audioBase64) {
      setFormError(t('mobile.insight.missingSource'));
      return;
    }
    create.mutate(
      {
        data: {
          context,
          ...(image ? { imageBase64: image.base64, mimeType: image.mimeType } : {}),
          ...(birthDate ? { birthDate } : {}),
          ...(place.trim() ? { birthPlace: place.trim() } : {}),
          ...(audioBase64 ? { audioBase64 } : {}),
        },
      },
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
          <PrimaryButton title={t('mobile.insight.newReading')} onPress={reset} />
        </>
      ) : create.isPending ? (
        <MysticLoading label={t('mobile.insight.loading')} />
      ) : (
        <>
          <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 }}>
            {t('mobile.insight.intro')}
          </Text>

          <View>
            <SectionLabel>{t('mobile.insight.situation')}</SectionLabel>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {CONTEXTS.map((ctx) => (
                <Chip
                  key={ctx.value}
                  testID={`insight-ctx-${ctx.value}`}
                  label={t(ctx.labelKey)}
                  selected={context === ctx.value}
                  onPress={() => setContext(ctx.value)}
                />
              ))}
            </View>
          </View>

          <Card>
            <SectionLabel>{t('mobile.insight.face')}</SectionLabel>
            <PhotoPicker
              label={t('mobile.insight.facePickerLabel')}
              image={image}
              onPicked={setImage}
              onClear={() => setImage(null)}
            />
          </Card>

          <Card>
            <SectionLabel>{t('mobile.insight.birthDate')}</SectionLabel>
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  testID="insight-month"
                  style={[...inputStyle, { flex: 1 }]}
                  placeholder="MM"
                  placeholderTextColor={c.mutedForeground}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={month}
                  onChangeText={setMonth}
                />
                <TextInput
                  testID="insight-day"
                  style={[...inputStyle, { flex: 1 }]}
                  placeholder="DD"
                  placeholderTextColor={c.mutedForeground}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={day}
                  onChangeText={setDay}
                />
                <TextInput
                  testID="insight-year"
                  style={[...inputStyle, { flex: 1.4 }]}
                  placeholder="YYYY"
                  placeholderTextColor={c.mutedForeground}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={year}
                  onChangeText={setYear}
                />
              </View>
              <TextInput
                testID="insight-place"
                style={inputStyle}
                placeholder={t('mobile.insight.placePlaceholder')}
                placeholderTextColor={c.mutedForeground}
                value={place}
                onChangeText={setPlace}
              />
            </View>
          </Card>

          <Card>
            <SectionLabel>{t('mobile.insight.conversation')}</SectionLabel>
            {audioBase64 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="check-circle" size={18} color={c.primary} />
                <Text style={{ color: c.foreground, fontFamily: 'Inter_500Medium', flex: 1 }}>
                  {t('mobile.insight.recordingCaptured')}
                </Text>
                <Chip label={t('mobile.insight.redo')} onPress={() => setAudioBase64(null)} />
              </View>
            ) : (
              <Recorder
                hint={t('mobile.insight.recordHint')}
                onRecorded={setAudioBase64}
              />
            )}
          </Card>

          {formError ? <ErrorBox message={formError} /> : null}
          {create.isError ? (
            <ReadingCreateError error={create.error} fallbackMessage={t('mobile.insight.error')} />
          ) : null}
          <PrimaryButton testID="insight-submit" title={t('mobile.insight.submit')} onPress={submit} />
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
