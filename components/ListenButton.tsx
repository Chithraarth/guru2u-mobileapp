import React, { useEffect, useId } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Square, Volume2 } from 'lucide-react-native';
import { stopIfSpeaking, toggleSpeak, useIsSpeaking, useMissingVoice } from '@/lib/speech';
import { useColors } from '@/hooks/useColors';
import fonts from '@/constants/fonts';

/** Reads the given text aloud through the speaker in the reading language. */
export function ListenButton({ text, compact = false }: { text: string; compact?: boolean }) {
  const c = useColors();
  const { t } = useTranslation();
  const id = useId();
  const speaking = useIsSpeaking(id);
  const missingVoice = useMissingVoice(id);

  // Stop talking when this control goes away (e.g. the screen closes).
  useEffect(() => () => stopIfSpeaking(id), [id]);

  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <Pressable
        testID="result-listen"
        onPress={() => toggleSpeak(id, text)}
        accessibilityRole="button"
        accessibilityLabel={speaking ? t('mobile.result.stopListening') : t('mobile.result.listen')}
        style={({ pressed }) => [
          styles.button,
          compact && styles.compact,
          { backgroundColor: speaking ? c.accent : c.primaryFill, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        {speaking ? (
          <Square size={compact ? 12 : 15} color="#FFFFFF" fill="#FFFFFF" />
        ) : (
          <Volume2 size={compact ? 15 : 18} color="#FFFFFF" />
        )}
        <Text style={{ fontFamily: fonts.bold, fontSize: compact ? 12.5 : 14, color: '#FFFFFF' }}>
          {speaking ? t('mobile.result.stopListening') : t('mobile.result.listen')}
        </Text>
      </Pressable>
      {missingVoice ? <MissingVoiceNote /> : null}
    </View>
  );
}

/**
 * Small round speaker icon for one section of a reading. Sits in the
 * section's bottom-right corner and reads only that section.
 */
export function SpeakIcon({ text, onDark = false }: { text: string; onDark?: boolean }) {
  const c = useColors();
  const { t } = useTranslation();
  const id = useId();
  const speaking = useIsSpeaking(id);
  const missingVoice = useMissingVoice(id);

  useEffect(() => () => stopIfSpeaking(id), [id]);

  const bg = speaking ? c.accent : onDark ? 'rgba(255,255,255,0.18)' : c.secondary;
  const fg = speaking || onDark ? '#FFFFFF' : c.primary;

  return (
    <View style={{ alignItems: 'flex-end', gap: 6 }}>
      <Pressable
        testID="section-listen"
        onPress={() => toggleSpeak(id, text)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={speaking ? t('mobile.result.stopListening') : t('mobile.result.listen')}
        style={({ pressed }) => [styles.icon, { backgroundColor: bg, opacity: pressed ? 0.8 : 1 }]}
      >
        {speaking ? <Square size={13} color={fg} fill={fg} /> : <Volume2 size={17} color={fg} />}
      </Pressable>
      {missingVoice ? <MissingVoiceNote /> : null}
    </View>
  );
}

function MissingVoiceNote() {
  const c = useColors();
  const { t } = useTranslation();
  return (
    <Text style={{ fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: c.mutedForeground, textAlign: 'center' }}>
      {t('mobile.result.voiceMissing')}
    </Text>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 42,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  compact: {
    height: 32,
    paddingHorizontal: 12,
    gap: 6,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
