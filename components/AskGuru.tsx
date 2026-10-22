import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircleQuestion, Send, Sparkles } from 'lucide-react-native';
import { customFetch } from '@workspace/api-client-react';
import { ErrorBox } from '@/components/ui';
import { ListenButton } from '@/components/ListenButton';
import { getReadingLanguage } from '@/lib/readingLanguage';
import { localToday } from '@/lib/profile';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';
import fonts from '@/constants/fonts';

interface QA {
  id: number;
  question: string;
  answer: string;
  createdAt: string;
}

const questionsKey = (readingId: number) => ['readings', readingId, 'questions'] as const;

/**
 * Ask Guru any follow-up question about a reading. Each question uses one
 * reading credit; earlier questions and answers are listed above the box.
 */
export function AskGuru({ readingId }: { readingId: number }) {
  const c = useColors();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: history } = useQuery({
    queryKey: questionsKey(readingId),
    queryFn: () => customFetch<QA[]>(`/api/readings/${readingId}/questions`),
  });

  const ask = async () => {
    const q = question.trim();
    if (q.length < 3 || asking) return;
    setError(null);
    setAsking(true);
    try {
      const res = await customFetch<QA & { scansRemaining: number }>(`/api/readings/${readingId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, language: getReadingLanguage(), today: localToday() }),
      });
      queryClient.setQueryData<QA[]>(questionsKey(readingId), (old) => [...(old ?? []), res]);
      queryClient.setQueryData(['billing', 'status'], { scansRemaining: res.scansRemaining });
      setQuestion('');
    } catch (e) {
      const data = (e as { data?: { error?: string; message?: string } })?.data;
      setError(data?.message ?? data?.error ?? t('mobile.result.askError'));
    } finally {
      setAsking(false);
    }
  };

  return (
    <View testID="ask-guru" style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={[styles.icon, { backgroundColor: c.violetSoft }]}>
          <MessageCircleQuestion size={18} color={c.primary} />
        </View>
        <Text style={{ flex: 1, fontFamily: fonts.bold, fontSize: 17, color: c.foreground }}>{t('mobile.result.askTitle')}</Text>
      </View>
      <Text style={{ fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: c.mutedForeground }}>
        {t('mobile.result.askHint')}
      </Text>

      {(history ?? []).map((qa) => (
        <View key={qa.id} style={{ gap: 8 }}>
          <View style={[styles.bubbleQ, { backgroundColor: c.secondary }]}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 0.6, textTransform: 'uppercase', color: c.mutedForeground }}>
              {t('mobile.result.youAsked')}
            </Text>
            <Text style={{ fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21, color: c.foreground }}>{qa.question}</Text>
          </View>
          <View style={[styles.bubbleA, { backgroundColor: c.accentSoft }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} color={c.accentInk} />
              <Text style={{ fontFamily: fonts.bold, fontSize: 12.5, color: c.accentInk }}>Guru</Text>
            </View>
            <Text style={{ fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: c.foreground }}>{qa.answer}</Text>
            <View style={{ alignItems: 'flex-start' }}>
              <ListenButton text={qa.answer} compact />
            </View>
          </View>
        </View>
      ))}

      {asking ? (
        <View style={[styles.thinking, { backgroundColor: c.accentSoft }]}>
          <ActivityIndicator color={c.accent} />
          <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: c.accentInk }}>{t('mobile.result.asking')}</Text>
        </View>
      ) : null}

      {error ? <ErrorBox message={error} /> : null}

      <View style={[styles.inputRow, { borderColor: c.borderStrong, backgroundColor: c.background }]}>
        <TextInput
          testID="ask-input"
          value={question}
          onChangeText={setQuestion}
          placeholder={t('mobile.result.askPlaceholder')}
          placeholderTextColor={c.subtle}
          multiline
          maxLength={500}
          editable={!asking}
          style={{ flex: 1, minHeight: 44, maxHeight: 120, paddingVertical: 10, fontFamily: fonts.regular, fontSize: 15, color: c.foreground }}
        />
        <Pressable
          testID="ask-send"
          onPress={ask}
          disabled={asking || question.trim().length < 3}
          accessibilityRole="button"
          accessibilityLabel={t('mobile.result.askButton')}
          style={({ pressed }) => [
            styles.send,
            {
              backgroundColor: c.primaryFill,
              opacity: asking || question.trim().length < 3 ? 0.4 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <Send size={18} color={c.primaryForeground} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: colors.radiusLg,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleQ: {
    alignSelf: 'flex-end',
    maxWidth: '90%',
    borderRadius: 16,
    borderTopRightRadius: 4,
    padding: 12,
    gap: 4,
  },
  bubbleA: {
    alignSelf: 'flex-start',
    maxWidth: '95%',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 12,
    gap: 8,
  },
  thinking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderWidth: 1,
    borderRadius: 18,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
  },
  send: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
