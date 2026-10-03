import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import {
  useCreateVoiceReading,
  getListReadingsQueryKey,
  getGetReadingStatsQueryKey,
  type Reading,
  type VoiceReadingInputMode,
} from '@workspace/api-client-react';
import { Recorder } from '@/components/Recorder';
import { ReadingResult, ResultActions } from '@/components/ReadingResult';
import { Card, Chip, MysticLoading, SectionLabel } from '@/components/ui';
import { ReadingCreateError } from '@/components/ReadingCreateError';
import { useColors } from '@/hooks/useColors';
import fonts from '@/constants/fonts';

const MODES: { value: VoiceReadingInputMode; labelKey: string; hintKey: string }[] = [
  { value: 'note', labelKey: 'mobile.voice.modeNote', hintKey: 'mobile.voice.modeNoteHint' },
  { value: 'conversation', labelKey: 'mobile.voice.modeConversation', hintKey: 'mobile.voice.modeConversationHint' },
  { value: 'date', labelKey: 'mobile.voice.modeDate', hintKey: 'mobile.voice.modeDateHint' },
];

/** Decorative waveform bars above the recorder. */
function Waveform() {
  const c = useColors();
  const heights = [10, 18, 30, 20, 42, 52, 34, 22, 40, 56, 46, 28, 16, 36, 50, 60, 42, 26, 32, 48, 54, 38, 22, 14];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 64 }}>
      {heights.map((h, i) => (
        <View
          key={i}
          style={{ width: 4, height: h, borderRadius: 2, backgroundColor: i % 5 === 0 ? c.accent : c.borderStrong }}
        />
      ))}
    </View>
  );
}

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
      contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 18 }}
    >
      {reading ? (
        <>
          <ReadingResult reading={reading} />
          <ResultActions reading={reading} newLabel={t('mobile.voice.newReading')} onNew={() => setReading(null)} />
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
          <Card style={{ gap: 18, paddingVertical: 24 }}>
            <Waveform />
            <Recorder hint={t(current.hintKey)} onRecorded={submit} />
          </Card>
          {mode !== 'note' ? (
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="info" size={14} color={c.subtle} />
              <Text style={{ color: c.subtle, fontFamily: fonts.regular, fontSize: 12, textAlign: 'center' }}>
                {t('mobile.voice.consentHint')}
              </Text>
            </View>
          ) : null}
          {create.isError ? (
            <ReadingCreateError error={create.error} fallbackMessage={t('mobile.voice.error')} />
          ) : null}
        </>
      )}
    </ScrollView>
  );
}
