import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Reading } from '@workspace/api-client-react';
import { Card, Chip, SectionLabel } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';

const KIND_LABEL_KEY: Record<string, string> = {
  face: 'mobile.result.kindFace',
  palm: 'mobile.result.kindPalm',
  voice: 'mobile.result.kindVoice',
  astro: 'mobile.result.kindAstro',
  combo: 'mobile.result.kindCombo',
};

export function ReadingResult({ reading }: { reading: Reading }) {
  const c = useColors();
  const { t } = useTranslation();

  return (
    <View style={{ gap: 16 }}>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <View
          style={{
            backgroundColor: c.secondary,
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 5,
          }}
        >
          <Text style={{ color: c.secondaryForeground, fontFamily: 'Inter_500Medium', fontSize: 12 }}>
            {KIND_LABEL_KEY[reading.kind] ? t(KIND_LABEL_KEY[reading.kind]) : t('mobile.result.kindDefault')}
          </Text>
        </View>
        <Text
          style={{
            color: c.primary,
            fontFamily: 'Inter_700Bold',
            fontSize: 26,
            textAlign: 'center',
          }}
        >
          {reading.archetype}
        </Text>
        <Text
          style={{
            color: c.foreground,
            fontFamily: 'Inter_500Medium',
            fontSize: 16,
            textAlign: 'center',
          }}
        >
          {reading.title}
        </Text>
      </View>

      {reading.interactionTips && reading.interactionTips.length > 0 ? (
        <Card style={{ backgroundColor: c.primary }}>
          <Text
            style={{
              color: c.primaryForeground,
              fontFamily: 'Inter_700Bold',
              fontSize: 15,
              marginBottom: 10,
            }}
          >
            {t('mobile.result.nextMoves')}
          </Text>
          <View style={{ gap: 10 }}>
            {reading.interactionTips.map((tip, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 1,
                  }}
                >
                  <Text
                    style={{
                      color: c.primaryForeground,
                      fontFamily: 'Inter_700Bold',
                      fontSize: 12,
                    }}
                  >
                    {i + 1}
                  </Text>
                </View>
                <Text
                  style={{
                    flex: 1,
                    color: c.primaryForeground,
                    fontFamily: 'Inter_500Medium',
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      {reading.portraitImage ? (
        <Image
          source={{ uri: reading.portraitImage }}
          style={{ width: '100%', height: 320, borderRadius: colors.radius }}
          resizeMode="cover"
        />
      ) : null}

      {reading.kind === 'astro' &&
      (reading.zodiacSign || reading.luckyColor || reading.luckyNumber) ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {reading.zodiacSign ? (
            <Card style={styles.astroCard}>
              <Text style={[styles.astroLabel, { color: c.mutedForeground }]}>{t('mobile.result.sign')}</Text>
              <Text style={[styles.astroValue, { color: c.foreground }]}>{reading.zodiacSign}</Text>
            </Card>
          ) : null}
          {reading.luckyColor ? (
            <Card style={styles.astroCard}>
              <Text style={[styles.astroLabel, { color: c.mutedForeground }]}>{t('mobile.result.luckyColor')}</Text>
              <Text style={[styles.astroValue, { color: c.foreground }]}>{reading.luckyColor}</Text>
            </Card>
          ) : null}
          {reading.luckyNumber ? (
            <Card style={styles.astroCard}>
              <Text style={[styles.astroLabel, { color: c.mutedForeground }]}>{t('mobile.result.luckyNumber')}</Text>
              <Text style={[styles.astroValue, { color: c.foreground }]}>{reading.luckyNumber}</Text>
            </Card>
          ) : null}
        </View>
      ) : null}

      {reading.dailyHoroscope ? (
        <Card>
          <SectionLabel>{t('mobile.result.todaysHoroscope')}</SectionLabel>
          <Text style={[styles.body, { color: c.foreground }]}>{reading.dailyHoroscope}</Text>
        </Card>
      ) : null}

      <Card>
        <SectionLabel>{t('mobile.result.summary')}</SectionLabel>
        <Text style={[styles.body, { color: c.foreground }]}>{reading.summary}</Text>
      </Card>

      {reading.traits.length > 0 ? (
        <Card>
          <SectionLabel>{t('mobile.result.traits')}</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {reading.traits.map((t) => (
              <Chip key={t} label={t} />
            ))}
          </View>
        </Card>
      ) : null}

      {reading.strengths.length > 0 ? (
        <Card>
          <SectionLabel>{t('mobile.result.strengths')}</SectionLabel>
          <View style={{ gap: 6 }}>
            {reading.strengths.map((s) => (
              <View key={s} style={{ flexDirection: 'row', gap: 8 }}>
                <Text style={{ color: c.accent, fontSize: 14 }}>◆</Text>
                <Text style={[styles.body, { color: c.foreground, flex: 1 }]}>{s}</Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      {reading.details ? (
        <Card>
          <SectionLabel>{t('mobile.result.deeperAnalysis')}</SectionLabel>
          <Text style={[styles.body, { color: c.foreground }]}>{reading.details}</Text>
        </Card>
      ) : null}

      <Card style={{ borderColor: c.primary }}>
        <SectionLabel>{t('mobile.result.guidance')}</SectionLabel>
        <Text style={[styles.body, { color: c.foreground }]}>{reading.guidance}</Text>
      </Card>

      {reading.transcript ? (
        <Card>
          <SectionLabel>{t('mobile.result.transcript')}</SectionLabel>
          <Text style={[styles.body, { color: c.mutedForeground }]}>{reading.transcript}</Text>
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  astroCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  astroLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  astroValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    textAlign: 'center',
  },
});
