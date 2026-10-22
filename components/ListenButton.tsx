import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Speech from 'expo-speech';
import { Square, Volume2 } from 'lucide-react-native';
import { readingLanguageInfo, useReadingLanguage } from '@/lib/readingLanguage';
import { useColors } from '@/hooks/useColors';
import fonts from '@/constants/fonts';

// Android's TTS engine rejects long inputs, so speak in sentence chunks.
function chunk(text: string, max = 3000): string[] {
  const parts: string[] = [];
  let current = '';
  const sentences = text.match(/[^.!?।۔。！？\n]+[.!?।۔。！？\n]*/g) ?? [text];
  for (const raw of sentences) {
    const sentence = raw.trim();
    if (!sentence) continue;
    if ((current + ' ' + sentence).length > max && current) {
      parts.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current) parts.push(current);
  return parts;
}

/** Reads the given text aloud through the speaker in the reading language. */
export function ListenButton({ text }: { text: string }) {
  const c = useColors();
  const { t } = useTranslation();
  const readingLang = useReadingLanguage();
  const [speaking, setSpeaking] = useState(false);
  const [missingVoice, setMissingVoice] = useState(false);

  // Stop talking when the screen closes.
  useEffect(() => () => void Speech.stop(), []);

  const toggle = async () => {
    if (speaking) {
      await Speech.stop();
      setSpeaking(false);
      return;
    }
    const lang = readingLanguageInfo(readingLang);
    let voiceAvailable = true;
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      voiceAvailable =
        voices.length === 0 || voices.some((v) => v.language?.toLowerCase().startsWith(lang.code));
    } catch {
      // Unknown: try anyway.
    }
    setMissingVoice(!voiceAvailable);
    const parts = chunk(text);
    setSpeaking(true);
    parts.forEach((part, i) => {
      const last = i === parts.length - 1;
      Speech.speak(part, {
        language: lang.speech,
        rate: 0.95,
        onDone: last ? () => setSpeaking(false) : undefined,
        onStopped: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    });
  };

  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <Pressable
        testID="result-listen"
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={speaking ? t('mobile.result.stopListening') : t('mobile.result.listen')}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: speaking ? c.accent : c.primaryFill, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        {speaking ? <Square size={15} color="#FFFFFF" fill="#FFFFFF" /> : <Volume2 size={18} color="#FFFFFF" />}
        <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: '#FFFFFF' }}>
          {speaking ? t('mobile.result.stopListening') : t('mobile.result.listen')}
        </Text>
      </Pressable>
      {missingVoice ? (
        <Text style={{ fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: c.mutedForeground, textAlign: 'center' }}>
          {t('mobile.result.voiceMissing')}
        </Text>
      ) : null}
    </View>
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
});
