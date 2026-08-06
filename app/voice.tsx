import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateVoiceReading,
  getListReadingsQueryKey,
  getGetReadingStatsQueryKey,
  type Reading,
  type VoiceReadingInputMode,
} from '@workspace/api-client-react';
import { Recorder } from '@/components/Recorder';
import { ReadingResult } from '@/components/ReadingResult';
import { Card, Chip, MysticLoading, PrimaryButton, SectionLabel } from '@/components/ui';
import { ReadingCreateError } from '@/components/ReadingCreateError';
import { useColors } from '@/hooks/useColors';

const MODES: { value: VoiceReadingInputMode; labelKey: string; hintKey: string }[] = [
  {
    value: 'note',
    labelKey: 'mobile.voice.modeNote',
    hintKey: 'mobile.voice.modeNoteHint',
  },
  {
    value: 'conversation',
    labelKey: 'mobile.voice.modeConversation',
    hintKey: 'mobile.voice.modeConversationHint',
  },
  {
    value: 'date',
    labelKey: 'mobile.voice.modeDate',
    hintKey: 'mobile.voice.modeDateHint',
  },
];

export default function VoiceReadingScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<VoiceReadingInputMode>('note');
  const [reading, setReading] = useState<Reading | null>(null);
  const create = useCreateVoiceReading();

  const submit = (audioBase64: string) => {
    create.mutate(
      { data: { audioBase64, mode } },
      {
        onSuccess: (r) => {
          setReading(r);
          queryClient.invalidateQueries({ queryKey: getListReadingsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetReadingStatsQueryKey() });
        },
      },
    );
  };

  const current = MODES.find((m) => m.value === mode)!;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 16 }}
    >
      {reading ? (
        <>
          <ReadingResult reading={reading} />
          <PrimaryButton title={t('mobile.voice.newReading')} onPress={() => setReading(null)} />
        </>
      ) : create.isPending ? (
        <MysticLoading label={t('mobile.voice.loading')} />
      ) : (
        <>
          <View>
            <SectionLabel>{t('mobile.voice.modeQuestion')}</SectionLabel>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {MODES.map((m) => (
                <Chip
                  key={m.value}
                  testID={`voice-mode-${m.value}`}
                  label={t(m.labelKey)}
                  selected={mode === m.value}
                  onPress={() => setMode(m.value)}
                />
              ))}
            </View>
          </View>
          <Card>
            <Recorder hint={t(current.hintKey)} onRecorded={submit} />
          </Card>
          {mode !== 'note' ? (
            <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, textAlign: 'center' }}>
              {t('mobile.voice.consentHint')}
            </Text>
          ) : null}
          {create.isError ? (
            <ReadingCreateError error={create.error} fallbackMessage={t('mobile.voice.error')} />
          ) : null}
        </>
      )}
    </ScrollView>
  );
}
